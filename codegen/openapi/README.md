# codegen/openapi

`nba-data-service.yaml` in this folder is a **local copy** of the canonical OpenAPI 3.1
spec owned by the `nba-data-service` repo (`api/openapi.yaml`). It exists here so that
`@nba-analytics-hub/types` can generate TypeScript types from it without turning two
independent repos into a monorepo or adding cross-repo build tooling.

This is intentionally a copy, not a symlink or submodule — `nba-data-service` and
`nba-analytics-hub` are separate repos on separate remotes.

## Why this exists

`packages/types/src/lib/games/types.ts` previously hand-mirrored the Go `Game`/`GameMeta`
structs from `nba-data-service/internal/domain/games/models.go` field-for-field. That
hand-mirror drifted (the Go `GameMeta` gained `period`, `postseason`, and `time`; the TS
`GameMeta` never got them). Generating from the spec instead of copying-by-hand removes
that failure mode going forward — a drift now shows up as a codegen diff, not a silent gap.

## Refreshing the copy

When `nba-data-service`'s `api/openapi.yaml` changes, refresh this copy and regenerate:

```bash
# from the nba-analytics-hub repo root
npm run refresh:openapi   # copies ../nba-data-service/api/openapi.yaml here
npm run generate:games-types  # regenerates packages/types/src/lib/games/generated.ts
```

`refresh:openapi` assumes `nba-data-service` is checked out as a sibling directory
(`../nba-data-service` relative to this repo root), matching how both repos are laid out
under `~/dev/Development`. If your checkout lives elsewhere, copy the file manually and
run `generate:games-types` directly.

After regenerating, run the type check (`npx tsc -p tsconfig.base.json --noEmit` or
`npx nx build @nba-analytics-hub/types`) to catch any breaking shape changes, and update
`docs-internal/DATA_MODEL.md` / `docs-internal/SERVICE_CONTRACTS.md` if the public shape
changed.
