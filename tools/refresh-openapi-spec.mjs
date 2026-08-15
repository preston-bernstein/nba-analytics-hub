#!/usr/bin/env node
// Copies nba-data-service's api/openapi.yaml into codegen/openapi/ so
// packages/types can generate TS types from it locally. See
// codegen/openapi/README.md for why this is a copy rather than a symlink
// or submodule (two separate repos, not a monorepo).
import { copyFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '..');

const source = resolve(repoRoot, '../nba-data-service/api/openapi.yaml');
const dest = resolve(repoRoot, 'codegen/openapi/nba-data-service.yaml');

if (!existsSync(source)) {
  console.error(
    `[refresh-openapi-spec] Could not find nba-data-service's spec at:\n  ${source}\n` +
      'Expected nba-data-service to be checked out as a sibling directory ' +
      '(../nba-data-service relative to this repo). If your checkout lives ' +
      'elsewhere, copy api/openapi.yaml to codegen/openapi/nba-data-service.yaml manually.',
  );
  process.exit(1);
}

copyFileSync(source, dest);
console.log(`[refresh-openapi-spec] Copied ${source} -> ${dest}`);
