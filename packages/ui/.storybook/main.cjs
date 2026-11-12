// CommonJS on purpose: Storybook 9 loads this file with a CommonJS loader, and
// this package has "type": "module".
const path = require('path');

/** @type {import('@storybook/react-vite').StorybookConfig} */
const config = {
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
    const { default: tsconfigPaths } = await import('vite-tsconfig-paths');
    baseConfig.plugins = baseConfig.plugins ?? [];

    // Resolve @nba-analytics-hub/* to source files.
    baseConfig.plugins.push(
      tsconfigPaths({
        projects: [path.resolve(__dirname, '../../..', 'tsconfig.base.json')],
      })
    );

    return baseConfig;
  },
};

module.exports = config;
