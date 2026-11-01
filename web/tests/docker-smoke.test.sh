#!/usr/bin/env bash
# Smoke test for the web container (web/Dockerfile).
# Builds the image, runs it next to a stub API, and checks that:
#   1. / serves the app's index.html
#   2. a deep link (/some/route) falls back to index.html
#   3. /api/* is forwarded to the API with the /api prefix removed
set -euo pipefail

root="$(cd "$(dirname "$0")/../.." && pwd)"
tag="nba-web-smoke:test"
net="nba-web-smoke-net"
port="${SMOKE_PORT:-18080}"
# Set DOCKER_HOST=ssh://host and SMOKE_HOST=host to run on another machine.
host="${SMOKE_HOST:-localhost}"

cleanup() {
  docker rm -f nba-web-smoke-web nba-web-smoke-api >/dev/null 2>&1 || true
  docker network rm "$net" >/dev/null 2>&1 || true
}
trap cleanup EXIT
cleanup

docker build -q -f "$root/web/Dockerfile" -t "$tag" "$root" >/dev/null

docker network create "$net" >/dev/null
# Stub API: answers /health with a marker body. It must NOT see the /api prefix.
docker run -d --name nba-web-smoke-api --network "$net" --network-alias api \
  caddy:2-alpine caddy respond --listen :3000 --body 'stub-api-ok' >/dev/null
docker run -d --name nba-web-smoke-web --network "$net" -p "$port:80" "$tag" >/dev/null

for _ in $(seq 1 30); do
  curl -fsS "http://$host:$port/" >/dev/null 2>&1 && break
  sleep 1
done

fail() { echo "FAIL: $*" >&2; exit 1; }

curl -fsS "http://$host:$port/" | grep -q '<div id="root">' \
  || fail "/ did not serve index.html"
curl -fsS "http://$host:$port/some/route" | grep -q '<div id="root">' \
  || fail "deep link did not fall back to index.html"
body="$(curl -fsS "http://$host:$port/api/health")"
[ "$body" = "stub-api-ok" ] || fail "/api/health was not proxied (got: $body)"

# The built app must call /api on its own origin in production.
js="$(curl -fsS "http://$host:$port/" | grep -oE '/assets/index-[^"]+\.js' | head -1)"
[ -n "$js" ] || fail "no JS bundle linked from index.html"
curl -fsS "http://$host:$port$js" | grep -q '"/api"' \
  || fail "built app does not use the /api base path"

echo "PASS: web container smoke test"
