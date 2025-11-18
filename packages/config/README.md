# Config (`packages/config`)

The `config` package contains shared configuration utilities and environment helpers for NBA Analytics Hub.

It provides a central place for:

- Constants
- Environment variable parsing
- Shared configuration shapes
- Cross-project defaults

This package keeps configuration logic out of individual apps and libraries, reducing duplication.

---

## Purpose

- Define reusable config utilities consumed by the API, web app, and other packages.
- Standardize environment variable handling across the monorepo.
- Provide a single source of truth for app-wide constants.

---

## Tech Stack

- TypeScript
- Nx (library project)
- Vitest for unit tests (when applicable)

This package is intentionally small and dependency‑free.

---

## Development

From the repository root:

### Run tests

```sh
npx nx test config
```

### Build

```sh
npx nx build config
```

Build artifacts output to `dist/packages/config`.

---

## Usage

Import helpers using workspace aliases:

```ts
import { API_BASE_URL } from '@nba-analytics-hub/config';
```

Configurations defined here should be pure, static, and safe for both frontend and backend usage.

---

## Status

- Initial configuration structure in place.
- Intended to remain minimal and focused.
- Future additions:
  - Environment parsing
  - Strongly typed config schemas
  - Per‑environment overrides
