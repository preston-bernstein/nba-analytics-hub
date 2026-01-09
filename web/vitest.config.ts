import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths()],
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
