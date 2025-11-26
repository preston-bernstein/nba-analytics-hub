import { defineConfig } from 'vite';

export default defineConfig(() => ({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/packages/domain',
  plugins: [],
  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [],
  // },
}));
