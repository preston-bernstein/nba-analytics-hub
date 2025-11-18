// packages/ui/vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
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
