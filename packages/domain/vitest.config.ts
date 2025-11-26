// packages/domain/vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      reportsDirectory: './test-output/vitest/coverage',
      lines: 80,
      functions: 80,
      statements: 80,
      branches: 70,
      exclude: [
        'vite.config.ts',
        'vitest.config.ts',
        'dist/**',
        'src/**/index.ts',
        // tooling / config
        'eslint.config.mjs',
      ],
    },
  },
});
