# Web App (`apps/web`)

The `web` app is the React frontend for NBA Analytics Hub.  
It renders the analytics dashboard and consumes the backend API via shared libraries.

---

## Purpose

- Provide a single-page dashboard for upcoming NBA games.
- Visualize predictions and basic analytics.
- Demonstrate how the monorepo’s shared libraries (`ui`, `domain`, `data-access`, `types`) are used from a React app.

---

## Tech Stack

- **React** (Vite, TypeScript)
- **Nx** for project orchestration
- **Vitest** + **@testing-library/react** for unit/integration tests
- **MSW** (planned) for API mocking in tests
- Shared libraries:
  - `@nba-analytics-hub/ui` for layout and components
  - `@nba-analytics-hub/data-access` for API clients
  - `@nba-analytics-hub/domain` for pure helpers
  - `@nba-analytics-hub/types` for shared types

---

## Responsibilities

The web app is responsible for:

- Rendering the main dashboard layout using `AppShell` from `@nba-analytics-hub/ui`.
- Displaying a list of upcoming games using shared types and components.
- Requesting predictions for games via `@nba-analytics-hub/data-access`.
- Showing prediction output (win probabilities, favored team) visually.

Back-end logic, data fetching implementation, and model integration live outside this app and are accessed only via shared libraries and the API.

---

## Development

From the repository root:

### Start the dev server

```sh
npx nx serve web
```

The app will start on the configured Vite dev port.

### Run tests

```sh
npx nx test web
```

Tests are written with Vitest and React Testing Library.

### Build

```sh
npx nx build web
```

Build artifacts are emitted by Vite into the app’s dist directory.

## Status

React + Vite scaffolded and integrated with Nx.

Shared UI library (@nba-analytics-hub/ui) available for use.

#### Planned:

Dashboard page that calls /games/upcoming and /predict.

MSW-backed tests for data-loading states and error handling.