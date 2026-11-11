import nx from '@nx/eslint-plugin';
import tseslint from 'typescript-eslint';

// oxlint does the general linting (see .oxlintrc.json).
// ESLint only runs the Nx workspace rules, which oxlint does not have.
export default [
  ...nx.configs['flat/base'],
  {
    ignores: [
      '**/dist',
      '**/out-tsc',
      '**/test-output',
      '**/storybook-static',
      '**/vite.config.*.timestamp*',
      '**/vitest.config.*.timestamp*',
      'packages/types/src/lib/games/generated.ts',
    ],
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.cts', '**/*.mts'],
    languageOptions: { parser: tseslint.parser },
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: ['^.*/eslint(\\.base)?\\.config\\.[cm]?[jt]s$'],
          depConstraints: [
            // Transitional: remove once the legacy layer packages are retired.
            {
              sourceTag: '*',
              onlyDependOnLibsWithTags: ['*'],
            },
            {
              sourceTag: 'scope:shared',
              onlyDependOnLibsWithTags: ['scope:shared', 'scope:legacy'],
            },
            {
              sourceTag: 'domain:events',
              onlyDependOnLibsWithTags: ['scope:shared', 'scope:legacy', 'domain:games'],
            },
            {
              sourceTag: 'scope:ui',
              onlyDependOnLibsWithTags: ['scope:shared', 'scope:ui', 'scope:legacy', 'domain:*'],
            },
            {
              sourceTag: 'scope:app',
              onlyDependOnLibsWithTags: ['scope:shared', 'scope:ui', 'scope:legacy', 'domain:*'],
            },
          ],
        },
      ],
    },
  },
];
