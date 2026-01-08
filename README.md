# NBA Analytics Hub

[![Node](https://img.shields.io/badge/node-20.x-blue)](#)
[![Nx](https://img.shields.io/badge/monorepo-nx-informational)](#)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

Nx monorepo for the user-facing stack of an NBA analytics system.

- `web` – React/Vite dashboard for games and model outputs.
- `api` – Node/Express BFF that fronts the Go games service and Python predictor.
- `packages/*` – shared TS libs (`types`, `domain`, `data-access`, `ui`, `config`, `testing`).

External services (separate repos):
- `nba-data-service` (Go) – realtime games feed.
- `nba-predictor` (Python) – prediction API.
- Frontend calls only the Node API; Node calls Go/Python via `@nba-analytics-hub/data-access`.

---

## Data Flow
```
web (React) → api (Node BFF) → games service (Go) + predictor (Python)
```
- Node API routes are root-mounted: `/games`, `/games/today`, `/games/upcoming`, `/games/:id`, `/predict`, `/health`.
- Types are canonical in `packages/types` and flow through all layers.

---

## Projects
- `web/` – React + Vite frontend.
- `api/` – Express BFF.
- `packages/types` – canonical models (Game, Prediction, etc.).
- `packages/domain` – pure domain helpers.
- `packages/data-access` – HTTP clients (frontend ↔ api; api ↔ Go/Python).
- `packages/ui` – shared React components.
- `packages/config` – env loading.
- `packages/testing` – test utilities.

---

## Local Development
```sh
# setup
nvm use 20 || nvm install 20 && nvm use 20
npm install

# serve
npx nx serve api
npx nx serve web

# lint
npm run lint:all

# test
npm run test:all
# API route specs run by default; set ALLOW_SOCKET_TESTS=false only in sandboxes that block sockets
# API Vitest resolves workspace packages directly (no prebuild step required)
```

---

## Contracts & Types
- Node API: root routes listed above; see `docs-internal/SERVICE_CONTRACTS.md`.
- Types: single source in `packages/types`; see `docs-internal/DATA_MODEL.md`.
- No direct frontend → Go/Python calls; all traffic goes through the BFF.

---

## Repo Conventions
- Package-based Nx layout (apps: `web`, `api`; libs under `packages/*`).
- Keep `tsconfig.base.json` NodeNext settings; no `apps/` migration or `project.json` additions.
- Respect layering: apps depend on libs; libs never depend on apps; UI imports domain/data-access, not api internals.
- Shared types live only in `packages/types`; do not duplicate.

---

## Testing Stack
- Vitest across frontend, backend, and libs.
- API Vitest resolves workspace packages via source aliases; set `ALLOW_SOCKET_TESTS=false` on runners that block `0.0.0.0` binds.
- React Testing Library for UI.
- Supertest for API routes (requires socket-friendly env if enabled).
- Coverage thresholds enforced in core libs.
