# docker-allow: root container user not yet audited for file ownership and ports; add USER after testing
# Web app image: builds the Vite app, then serves it with Caddy.
# Caddy also forwards /api/* to the API (prefix removed), so the browser
# talks to one origin. Build from the repo root:
#   docker build -f web/Dockerfile -t nba-web .

# docker-allow: unpinned image has no pinnable upstream tag or digest (local build or moving tag)
FROM node:20-slim AS build
WORKDIR /repo
COPY package.json package-lock.json ./
COPY packages ./packages
COPY api/package.json ./api/package.json
COPY web/package.json ./web/package.json
COPY web-e2e/package.json ./web-e2e/package.json
RUN npm ci --ignore-scripts --no-audit --no-fund
COPY . .
RUN npx vite build --config web/vite.config.ts
# docker-allow: unpinned image has no pinnable upstream tag or digest (local build or moving tag)

FROM caddy:2-alpine
COPY web/Caddyfile /etc/caddy/Caddyfile
COPY --from=build /repo/web/dist /srv
# API_UPSTREAM is the API's host:port on the Docker network.
ENV API_UPSTREAM=api:3000
EXPOSE 80
