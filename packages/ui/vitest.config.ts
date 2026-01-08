import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

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
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      reportsDirectory: './test-output/vitest/coverage',
      lines: 80,
      functions: 80,
      statements: 80,
      branches: 70,
      exclude: [
        // stories / docs
        'src/**/*.stories.@(ts|tsx|js|jsx|mdx)',
        // barrels / setup
        'src/**/index.ts',
        'src/**/index.tsx',
        'src/test-setup.ts',
        // tooling / config
        'eslint.config.mjs',
        'vite.config.ts',
        'vitest.config.ts',
        '.storybook/**/*',
      ],
    },
  },
});
