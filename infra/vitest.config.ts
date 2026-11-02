import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.spec.ts'],
    // Synthesizing a full stack takes a few seconds.
    testTimeout: 30_000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      reportsDirectory: './coverage',
      exclude: ['bin/**', 'cdk.out/**', 'coverage/**', 'eslint.config.mjs', 'vitest.config.ts'],
    },
  },
});
