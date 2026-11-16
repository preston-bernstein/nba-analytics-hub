#!/usr/bin/env bash
# Installs the pinned Trivy for scripts/docker-validate.sh. Pack: docker, rule docker-trivy.
#
#   install-trivy.sh DEST_DIR
#
# The sha256 below comes from the official trivy_0.76.2_checksums.txt of the release. To upgrade, change
# both values together and check the new checksum against that file.
set -euo pipefail

TRIVY_VERSION="0.76.2"
TRIVY_SHA256="bc0fc726e017b8927a62b2d3531d7a84ee01769daf5c99ed866dced54089fdbf"
TRIVY_URL="https://github.com/aquasecurity/trivy/releases/download/v${TRIVY_VERSION}/trivy_${TRIVY_VERSION}_Linux-64bit.tar.gz"

TMP_DIR=""

log() { echo "install-trivy: $*" >&2; }
die() {
  log "$*"
  exit "${2:-1}"
}

main() {
  local dest
  [ "$#" -eq 1 ] || die "usage: install-trivy.sh DEST_DIR" 2
  dest="$1"
  command -v curl >/dev/null 2>&1 || die "missing tool: curl" 127
  command -v sha256sum >/dev/null 2>&1 || die "missing tool: sha256sum" 127

  TMP_DIR="$(mktemp -d)"
  trap 'rm -rf "$TMP_DIR"' EXIT

  curl --fail --silent --show-error --location --output "$TMP_DIR/trivy.tar.gz" "$TRIVY_URL"
  echo "${TRIVY_SHA256}  $TMP_DIR/trivy.tar.gz" | sha256sum --check --status || die "checksum mismatch for $TRIVY_URL"
  mkdir -p "$dest"
  tar -xzf "$TMP_DIR/trivy.tar.gz" -C "$dest" trivy
  log "installed trivy ${TRIVY_VERSION} in $dest"
}

main "$@"
