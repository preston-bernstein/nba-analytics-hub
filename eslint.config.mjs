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
      'packages/games/src/types/generated.ts',
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
            { sourceTag: 'scope:shared', onlyDependOnLibsWithTags: ['scope:shared'] },
            {
              sourceTag: 'domain:games',
              onlyDependOnLibsWithTags: ['scope:shared', 'domain:games'],
            },
            {
              sourceTag: 'domain:prediction',
              onlyDependOnLibsWithTags: ['scope:shared', 'domain:prediction'],
            },
            {
              sourceTag: 'domain:events',
              onlyDependOnLibsWithTags: ['scope:shared', 'domain:games', 'domain:events'],
            },
            {
              sourceTag: 'scope:ui',
              onlyDependOnLibsWithTags: ['scope:shared', 'scope:ui', 'domain:*'],
            },
            {
              sourceTag: 'scope:app',
              onlyDependOnLibsWithTags: ['scope:shared', 'scope:ui', 'domain:*'],
            },
          ],
        },
      ],
    },
  },
];
