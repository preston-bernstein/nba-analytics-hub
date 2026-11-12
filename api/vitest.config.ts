import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';
import { socketsAvailable } from './src/platform/testing/socketSupport.js';

const workspaceRoot = fileURLToPath(new URL('..', import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      '@nba-analytics-hub/platform': resolve(workspaceRoot, 'packages/platform/src/index.ts'),
      '@nba-analytics-hub/games': resolve(workspaceRoot, 'packages/games/src/index.ts'),
      '@nba-analytics-hub/prediction': resolve(workspaceRoot, 'packages/prediction/src/index.ts'),
      '@nba-analytics-hub/players': resolve(workspaceRoot, 'packages/players/src/index.ts'),
      '@nba-analytics-hub/events': resolve(workspaceRoot, 'packages/events/src/index.ts'),
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
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      reportsDirectory: './coverage',
      exclude: [
        'dist/**',
        'coverage/**',
        'eslint.config.mjs',
        'vitest.config.ts',
        'src/main.ts',
        'src/platform/testing/**',
      ],
    },
  },
});
