import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';
import { socketsAvailable } from './src/test-utils/socketSupport.js';

const workspaceRoot = fileURLToPath(new URL('..', import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      '@nba-analytics-hub/types': resolve(workspaceRoot, 'packages/types/src/index.ts'),
      '@nba-analytics-hub/domain': resolve(workspaceRoot, 'packages/domain/src/index.ts'),
      '@nba-analytics-hub/data-access': resolve(
        workspaceRoot,
        'packages/data-access/src/index.ts',
      ),
      '@nba-analytics-hub/config': resolve(workspaceRoot, 'packages/config/src/index.ts'),
      '@nba-analytics-hub/testing': resolve(workspaceRoot, 'packages/testing/src/index.ts'),
      '@nba-analytics-hub/ui': resolve(workspaceRoot, 'packages/ui/src/index.ts'),
    },
  },
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    environment: 'node',
    include: socketsAvailable ? ['src/**/*.spec.ts'] : [],
    passWithNoTests: true,
    coverage: {
      reporter: ['text', 'html'],
    },
  },
});
