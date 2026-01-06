import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';
import { socketsAvailable } from './src/test-utils/socketSupport.js';

export default defineConfig({
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
