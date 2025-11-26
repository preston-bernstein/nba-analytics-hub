# UI (`packages/ui`)

The `ui` package is the shared React component library for NBA Analytics Hub.

It provides reusable layout primitives and components used by the `web` app and any future frontends.

---

## Purpose

- Centralize reusable UI components and layout.
- Keep visual concerns separated from business logic and data fetching.
- Provide a single place to document components via Storybook.
- Enforce consistent styling and UX across the app.

Examples of components:

- `AppShell` – top-level layout wrapper for the dashboard.
- `GameCard` – displays a single NBA game with teams and start time.
- `PredictionBadge` – shows win probabilities and favored team.

---

## Tech Stack

- React (TypeScript)
- Vite (library mode)
- CSS Modules
- Storybook 9 (Vite builder)
- Vitest + @testing-library/react for unit tests
- @testing-library/jest-dom matchers

Build output is an ES module library consumed via workspace alias.

---

## Development

From the repository root:

### Run Storybook

```sh
npx nx storybook ui
```

### Run UI tests

```sh
npx nx test ui
```

Tests run in a JSDOM environment with coverage thresholds enforced per-project.

### Build the library

```sh
npx nx build ui
```

Build artifacts are emitted into `dist/packages/ui`.

---

## Usage

Import components into apps:

```tsx
import { AppShell, GameCard } from '@nba-analytics-hub/ui';

function Dashboard() {
  return (
    <AppShell title="NBA Analytics Hub">
      <GameCard /* props */ />
    </AppShell>
  );
}
```

UI components should:

- Be presentational (no direct data fetching).
- Receive typed props.
- Delegate domain logic to `@nba-analytics-hub/domain` when needed.

---

## Status

- Core layout (`AppShell`) implemented and tested.
- Game-level components and utilities in place.
- Storybook stories defined for visual documentation.
- Coverage thresholds enforced for this package.

Future work includes expanding the component set (charts, filters, tables) and enhancing Storybook docs with richer playgrounds and controls.
