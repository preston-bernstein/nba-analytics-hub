# Data Access (`packages/data-access`)

The `data-access` package provides typed HTTP clients and API wrappers for NBA Analytics Hub.

It acts as the communication layer between apps (`web`, `api`) and external services  
while keeping all request/response shapes strongly typed and centralized.

---

## Purpose

- Provide reusable clients for calling backend services.
- Keep network logic out of UI and domain layers.
- Enforce consistent request/response types using `@nba-analytics-hub/types`.
- Abstract details such as URL construction, query parameters, and error handling.

Examples:

- `predictorClient` for calling the prediction endpoint.
- Future: `gamesClient`, player stats fetchers, external NBA API integrations.

---

## Tech Stack

- TypeScript
- Nx (library project)
- Vitest for unit and integration-style tests
- Shared types from `@nba-analytics-hub/types`

---

## Development

From the repository root:

### Run tests

```sh
npx nx test data-access
```

Tests mock the global `fetch` API and enforce 80%+ coverage.

### Build

```sh
npx nx build data-access
```

Outputs to `dist/packages/data-access`.

---

## Usage

```ts
import { createPredictorClient } from '@nba-analytics-hub/data-access';

const predictor = createPredictorClient({ baseUrl: 'http://localhost:3000' });

const result = await predictor.predict({
  homeTeamId: 'ATL',
  awayTeamId: 'BOS',
  gameDate: '2025-01-01',
});
```

The data-access layer should:

- only depend on `@nba-analytics-hub/types` and `@nba-analytics-hub/domain`  
- never import from UI or framework-specific packages  
- expose predictable, typed clients for all apps to consume

---

## Status

- `predictorClient` implemented and fully tested.
- Coverage thresholds enforced.
- Future additions:
  - `gamesClient` to fetch upcoming games
  - Retry wrappers
  - API key auth support
  - MSW-backed integration tests
