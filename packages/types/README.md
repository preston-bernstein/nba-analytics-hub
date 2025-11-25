# Types (`packages/types`)

The `types` package contains all shared TypeScript interfaces and type definitions for NBA Analytics Hub.

It is the foundation of the monorepo’s type system and allows every app and library to speak the same language.

---

## Purpose

- Define reusable types shared across:
  - `apps/web`
  - `apps/api`
  - `packages/domain`
  - `packages/data-access`
  - `packages/ui`
- Ensure consistent request/response shapes for API routes.
- Provide strong typing across the entire system with no duplication.

This prevents drift between layers and enforces correctness at compile time.

---

## Contents

Common examples include:

- `Game`
- `PredictionRequest`
- `PredictionResponse`
- Shared enums and utility types

These definitions are consumed across the monorepo via:

```ts
import type { Game } from '@nba-analytics-hub/types';
```

---

## Tech Stack

- TypeScript
- Nx (library project)

This package contains **no runtime code** and has **no dependencies** other than the TypeScript compiler.

---

## Development

From the repository root:

### Run type-checking

```sh
npx nx typecheck types
```

### Build

```sh
npx nx build types
```

Outputs to `dist/packages/types`.

---

## Usage

Types are imported through the workspace alias:

```ts
import type { PredictionResponse } from '@nba-analytics-hub/types';
```

They can be safely used anywhere in the monorepo, including frontend, backend, and shared libraries.

---

## Status

- Core shared types defined.
- Acts as the central schema contract for all services.
- Future additions:
  - Expanded domain types
  - API schemas for new routes
  - Player/team metadata types
