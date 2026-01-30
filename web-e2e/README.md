# Web E2E Tests (`apps/web-e2e`)

The `web-e2e` project contains end-to-end tests for the `web` app using Playwright.  
It exercises the application through the browser the way a user would.

---

## Purpose

- Validate that the `web` app boots correctly and renders key UI.
- Catch integration issues between the frontend, API, and shared libraries.
- Cover critical flows in a realistic browser environment (not just unit tests).

---

## Tech Stack

- **Playwright** (via `@nx/playwright`)
- **Nx** for running and caching tests
- Runs against the `web` app served by Vite

---

## How It Fits in the Monorepo

- Targets the `apps/web` frontend only.
- Complements unit/integration tests in:
  - `apps/web` (React + Vitest)
  - `apps/api` (Express + Supertest)
- Uses the same shared types and components indirectly through the running app.

---

## Development

From the repository root:

### 1. Start the `web` app

In one terminal:

```sh
npx nx serve web
```

### 2. Run E2E tests
In another terminal:

```sh
npx nx e2e web-e2e
```

Nx will use the Playwright project configuration defined in apps/web-e2e.

## Status
Basic Playwright scaffolding is in place.

#### Intended coverage:

App boot and health checks.

Dashboard rendering for games by date.

Prediction display once the vertical slice is complete.

As the dashboard and API mature, additional scenarios (error states, loading states, navigation) should be added here.
