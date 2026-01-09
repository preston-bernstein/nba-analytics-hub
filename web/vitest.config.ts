import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

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
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      reportsDirectory: './coverage',
      exclude: [
        'dist/**',
        'test-output/**',
        'eslint.config.mjs',
        'vite.config.ts',
        'vitest.config.ts',
        'src/main.tsx',
        'src/index.ts',
        'src/app/index.ts',
        'src/app/nx-welcome.tsx',
        'src/app/dashboard/types/index.ts',
        'src/layouts/RootLayout.tsx',
      ],
    },
  },
});
