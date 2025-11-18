# Testing (`packages/testing`)

The `testing` package provides shared test utilities for the NBA Analytics Hub monorepo.

It exists to reduce duplication and provide consistent testing behavior across all apps and libraries.

---

## Purpose

- Provide reusable test helpers (e.g., mock factories, MSW handlers, test wrappers).
- Centralize configuration or utilities needed by multiple test suites.
- Ensure consistent patterns across:
  - `apps/api` (Supertest)
  - `apps/web` (React Testing Library + MSW)
  - `packages/ui`
  - `packages/domain`
  - `packages/data-access`

This keeps each project’s test code lean and avoids scattering mock logic.

---

## Tech Stack

- Vitest
- TypeScript
- Optional MSW utilities
- Future: API mock generators, shared fixtures, reusable Supertest setup

---

## Development

From the repository root:

### Run tests

```sh
npx nx test testing
```

(Only needed when this library adds its own tests.)

### Build

```sh
npx nx build testing
```

Artifacts output to `dist/packages/testing`.

---

## Usage

Example import in a test:

```ts
import { createMockGame } from '@nba-analytics-hub/testing';

const game = createMockGame();
```

This library should not depend on any framework code (React, Express).  
It supports test scenarios without dictating app-specific behavior.

---

## Status

- Library scaffolded.
- Intended to host:
  - Shared fixtures
  - MSW server setup helpers
  - Mock predictor responses
  - Test wrapper components for web
  - Common Supertest setup for API
- Currently minimal but ready to expand as the vertical slice grows.
