# Domain (`packages/domain`)

The `domain` package contains pure business logic for NBA Analytics Hub.

It is intentionally free of framework concerns (no React, no Express, no HTTP).  
Code here should be deterministic, side‑effect free, and easy to test.

---

## Purpose

- Centralize core business rules and calculations.
- Keep domain logic independent of UI and transport.
- Provide small, composable helpers that can be reused by:
  - `apps/api` (Express backend)
  - `apps/web` (React frontend)
  - Other services in the monorepo.

Examples of responsibilities:

- Selecting a favored team for a game.
- Mapping or transforming game data.
- Future: bucketing confidence levels, formatting analytics, basic model‑adjacent helpers.

---

## Tech Stack

- TypeScript
- Nx (library project)
- Vitest for unit tests
- Shared types from `@nba-analytics-hub/types`

No external runtime dependencies beyond the TypeScript/Node standard stack.

---

## Development

From the repository root:

### Run domain tests

```sh
npx nx test domain
```

Tests are pure unit tests with `environment: "node"` and coverage thresholds enforced per project.

### Build

```sh
npx nx build domain
```

This compiles the library into `dist/packages/domain`.

---

## Usage

Import domain helpers from other apps or libraries using the workspace alias:

```ts
import { getFavorite } from '@nba-analytics-hub/domain';

const favoriteTeamId = getFavorite(game);
```

Domain code should only depend on:

- `@nba-analytics-hub/types`
- Other small, pure utility modules

It should **never** import from UI, API, or framework‑specific packages.

---

## Status

- Basic `getFavorite` helper implemented and tested.
- Safe place to grow model‑adjacent logic and reusable analytics utilities.
- Intended to remain small, focused, and framework‑agnostic.
