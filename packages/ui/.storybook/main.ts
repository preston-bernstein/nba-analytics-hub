import type { StorybookConfig } from '@storybook/react-vite';
import path from 'path';
import { fileURLToPath } from 'url';
import tsconfigPaths from 'vite-tsconfig-paths';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const config: StorybookConfig = {
  stories: ['../src/lib/**/*.@(mdx|stories.@(js|jsx|ts|tsx))'],
  addons: [],
  framework: {
    name: '@storybook/react-vite',
    options: {
      builder: {
        viteConfigPath: 'vite.config.ts',
      },
    },
  },
  async viteFinal(baseConfig) {
    // Make sure plugins exists
    baseConfig.plugins = baseConfig.plugins ?? [];

    // Add tsconfig paths so @nba-analytics-hub/* resolves to source files
    baseConfig.plugins.push(
      tsconfigPaths({
        projects: [
          // point to the workspace tsconfig that has the @nba-analytics-hub/* paths
          path.resolve(__dirname, '../../..', 'tsconfig.base.json'),
        ],
      })
    );

    return baseConfig;
  },
};

export default config;
