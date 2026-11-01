import baseConfig from '../../eslint.config.mjs';

export default [
  ...baseConfig,
  {
    ignores: ['**/debug-storybook.log', '**/node_modules'],
  },
];
