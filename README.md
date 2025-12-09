# NBA Analytics Hub

NBA Analytics Hub is an Nx monorepo that hosts a small but realistic NBA analytics stack:

- A React dashboard (`web`) for browsing upcoming games and model outputs
- An Express API BFF (`api`) that fronts a future Python predictor service
- Shared libraries for UI, domain logic, data access, config, and types

---

## Goals

- Clear separation of concerns between apps and libraries
- Strong testing discipline (Vitest + Testing Library + Supertest)
- Good type sharing across backend, frontend, and Python-facing clients
- Simple DevOps (Docker + CI later)

Current focus is **v1**:

- List upcoming games
- Display a prediction per game (mocked for now)
- Exercise shared libs across the stack

---

## Architecture

The repository uses a package-based Nx monorepo with isolated apps and shared libraries:

```
nba-analytics-hub/
  apps/
    api/        → Express BFF (REST API)
    web/        → React dashboard (Vite)
  packages/
    ui/         → Shared component library + Storybook
    domain/     → Pure business logic and helpers
    data-access/→ API clients and HTTP wrappers
    types/      → Shared TypeScript types
    testing/    → Shared test utilities (future expansion)
```

Each package is version-able, testable, and buildable in isolation.
All apps consume these libraries through workspace imports (@nba-analytics-hub/...).

**Apps**

- `web` – React + Vite dashboard, consumes the API
- `api` – Express API BFF that will call the Python predictor

**Libraries**

- `@nba-analytics-hub/ui` – shared React components, hooks, theme, Storybook
- `@nba-analytics-hub/domain` – pure domain helpers (e.g. selecting a favorite)
- `@nba-analytics-hub/data-access` – HTTP clients for API + predictor
- `@nba-analytics-hub/config` – environment loading and runtime config
- `@nba-analytics-hub/types` – shared TypeScript types across the monorepo
- `@nba-analytics-hub/testing` – shared test utilities (reserved for future use)

Nx layout:

- Apps live under `apps/`
- Libraries live under `packages/`

---

## Tech stack

- **Workspace**: Nx (package-based layout)
- **Frontend**: React, Vite, React Router
- **Backend**: Express
- **Types / build**: TypeScript, Vite library builds
- **Testing**:
  - Vitest
  - React Testing Library
  - Supertest
  - Coverage thresholds enforced (>= 80% lines/functions/statements, >= 70% branches in core libs)
- **UI docs**: Storybook 9 (Vite)

---

## Getting started

### Local Development
Install dependencies
```sh
npm install
```

Run all tests
```sh
npx nx test --all
```

Run the API (Express)
```sh
npx nx serve api
```

Run the Web App (React)
```sh
npx nx serve web
```

Storybook (UI components)
```sh
npx nx storybook ui
```

### Prereqs & Run
- `nvm use 22` (or `nvm install 22 && nvm use 22`)
- Install deps: `npm install`
- Serve API: `nx run @nba-analytics-hub/api:serve`
- Serve Web: `nx run @nba-analytics-hub/web:serve`
- Lint everything: `nx run-many -t lint --all`
- Test everything: `nx run-many -t test --all`

## Project Philosophy

### Modular design
Each concern lives in its own library, with clear boundaries.

### Type safety everywhere
Shared TypeScript types flow from domain → data-access → API → frontend.

### Testing discipline
Every layer has meaningful tests and coverage thresholds.

### Predictor as a separate service
The TypeScript BFF integrates with the Python predictor repo without coupling.

### Production-style structure
CI-ready test configs, stable build steps, clean separation of responsibilities.
