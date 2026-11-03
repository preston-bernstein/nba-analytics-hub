# API (`apps/api`)

The `api` app is the backend for NBA Analytics Hub.  
It exposes a lightweight Express-based REST API that serves games by date and prediction data to the frontend.

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

- `/games`  
  Returns a list of NBA games for a given date (defaults to today) using shared `Game` types.  
  Forwards `X-Request-ID` to the Go games service for tracing.

- `/games/:id`
  Returns a single game detail by id.

- `/games/stream`
  Server-Sent Events. Sends a `snapshot` event with the live-games read model, then a `game` event for each update, and a `: heartbeat` comment every 15 seconds. Register it before `/games/:id`.

- `/predict`  
  Returns deterministic mock predictions for now.  
  (Later will call the Python predictor microservice.)

The API performs *no* rendering, formatting, or business logic outside of routing and delegation.

---

## Kafka consumer

Off by default. It starts only when `KAFKA_BROKERS` is set (comma list, for example `localhost:29092`).
If it fails to start, the API keeps running and logs the error.

- Topic `game.updated`, consumer group `bff`, reads from the beginning when the group has no offset.
- Each message is parsed and checked against schema v1 (`parseGameUpdatedEvent` in `packages/domain`).
- Duplicates are skipped by `eventId`. The memory of seen ids is in-process and bounded to the last 10,000 ids. It is empty after a restart, so a replay after a restart can apply a repeated event again. Applying an event twice is harmless, because the read model keeps one latest game per id and ignores older events.
- An event older than the stored one is ignored. A game that is FINAL is never moved back to another status.
- Transient errors are retried up to 5 tries with delays of 200 ms, 400 ms, 800 ms, 1.6 s (capped at 5 s). After that the handler rejects, the offset is not committed, and the message is delivered again.
- Bad JSON or a schema mismatch goes to `game.updated.dlq` with the original key and value and the headers `dlq-reason`, `dlq-source-topic`, `dlq-source-partition`, `dlq-source-offset`, `dlq-consumer-group`. Original headers are kept. Then the offset is committed. If the DLQ publish fails, the offset is not committed.
- Offsets are committed by kafkajs after the message handler resolves, never before.
- The read model holds every game it has seen since start. It has no expiry.

Integration test (needs a broker with both topics): `KAFKA_TEST_BROKERS=localhost:29092 npx nx test api`.

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

Removed `/games/upcoming` route and coverage (deprecated)

/predict route + validation + deterministic mock logic

Integration with Python predictor service

CI pipeline with build/test steps

This project follows the monorepo’s testing discipline and type boundaries to keep the BFF small, predictable, and easy to extend.
