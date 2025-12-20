# API (`apps/api`)

The `api` app is the backend for NBA Analytics Hub.  
It exposes a lightweight Express-based REST API that serves upcoming games and prediction data to the frontend.

---

## Purpose

- Act as a **Backend-for-Frontend (BFF)** for the React dashboard.
- Provide typed API endpoints shared across the monorepo.
- Integrate with the future Python predictor service.
- Keep backend logic modular, testable, and isolated from frontend concerns.

This API is intentionally simple and focused on the vertical slice.

---

## Tech Stack

- **Express** (TypeScript)
- **Nx** for build/test orchestration
- **Supertest** + **Vitest** for API route testing
- **Docker** for containerization
- **Shared libraries**:
  - `@nba-analytics-hub/types` → Request/response types
  - `@nba-analytics-hub/domain` → Domain helpers
  - `@nba-analytics-hub/data-access` → (future) internal HTTP wrappers
  - `@nba-analytics-hub/testing` → Shared test helpers (planned)

---

## Responsibilities

- `/health`  
  Basic heartbeat endpoint for monitoring.

- `/games` (and `/games/today`)  
  Returns a list of NBA games for a given date (defaults to today) using shared `Game` types.  
  Forwards `X-Request-ID` to the Go games service for tracing.

- `/games/upcoming`  
  Compatibility alias to `/games` that falls back to mocks if the upstream list is empty.

- `/games/:id`  
  Returns a single game detail by id.

- `/predict`  
  Returns deterministic mock predictions for now.  
  (Later will call the Python predictor microservice.)

The API performs *no* rendering, formatting, or business logic outside of routing and delegation.

---

## Development

From the repository root:

### Start the API server

```sh
npx nx serve api
```

Run backend tests

```sh
npx nx test api
```

#### Tests use:

Vitest test runner

Supertest for HTTP assertions

Coverage thresholds enforced per-project

### Build

```sh
npx nx build api
```

Build artifacts go into dist/apps/api.

#### Docker
The API can be built into a container:

```sh
npx nx docker:build api
```

And run:

```sh
npx nx docker:run api
```

A docker-compose.yml will later be added for multi-service integration with the predictor.

### Status
Express app scaffolded

/health route implemented + tested

#### Planned:

/games/upcoming route + Supertest coverage (compatibility)

/predict route + validation + deterministic mock logic

Integration with Python predictor service

CI pipeline with build/test steps

This project follows the monorepo’s testing discipline and type boundaries to keep the BFF small, predictable, and easy to extend.
