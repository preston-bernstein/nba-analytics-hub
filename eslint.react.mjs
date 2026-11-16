// react-frontend pack rules, adapted from the pack templates.
// Features live in web/src/app/<domain>. Cross-feature code lives in web/src/app/shared.
import { fileURLToPath } from 'node:url';
import boundaries from 'eslint-plugin-boundaries';
import { plugin as shadcn } from '@shadcn/lint';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const CLIENT_CODE = ['web/src/**/*.{ts,tsx}', 'packages/ui/src/**/*.{ts,tsx}'];
const SPECS = ['**/*.spec.{ts,tsx}', '**/*.test.{ts,tsx}'];
const SERVER_MESSAGE = 'Call the server from <feature>/api and use a TanStack Query hook.';
const STORE_MESSAGE =
  'Use a Zustand store in <feature>/stores. Try props, URL params and context first.';

export const boundaryRules = [
  {
    files: ['web/src/app/**/*.{ts,tsx}'],
    plugins: { boundaries },
    settings: {
      'boundaries/elements': [
        { type: 'shared', pattern: 'web/src/app/shared' },
        {
          type: 'feature',
          pattern: 'web/src/app/{games,players}',
          capture: ['feature'],
        },
        { type: 'app', pattern: 'web/src/app' },
      ],
      // Without a resolver, extensionless .ts imports stay unresolved and no rule sees them.
      'import/resolver': { node: { extensions: ['.ts', '.tsx', '.js', '.jsx'] } },
      // The element patterns are repo-relative, so the lint result must not depend on the cwd.
      'boundaries/root-path': repoRoot,
      'boundaries/ignore': SPECS,
    },
    rules: {
      // app uses features and shared. A feature uses shared only.
      'boundaries/element-types': [
        'error',
        {
          default: 'disallow',
          rules: [
            { from: 'app', allow: ['feature', 'shared'] },
            { from: 'feature', allow: ['shared'] },
            { from: 'shared', allow: ['shared'] },
          ],
        },
      ],
      // Other code reaches a feature only through its index file.
      'boundaries/entry-point': [
        'error',
        {
          default: 'disallow',
          rules: [
            { target: 'feature', allow: 'index.{ts,tsx}' },
            { target: ['app', 'shared'], allow: '**' },
          ],
        },
      ],
    },
  },
];

const STORE_PATHS = [
  'redux',
  '@reduxjs/toolkit',
  'react-redux',
  'jotai',
  'recoil',
  'mobx',
  'mobx-react',
].map((name) => ({ name, message: STORE_MESSAGE }));

// no-restricted-imports is one rule, so the second block repeats the store paths.
export const dataRules = [
  {
    files: CLIENT_CODE,
    rules: { 'no-restricted-imports': ['error', { paths: STORE_PATHS }] },
  },
  {
    files: CLIENT_CODE,
    ignores: ['web/src/app/*/api/**', 'web/src/app/shared/api/**', ...SPECS],
    rules: {
      'no-restricted-imports': [
        'error',
        { paths: [...STORE_PATHS, { name: 'axios', message: SERVER_MESSAGE }] },
      ],
      'no-restricted-globals': ['error', { name: 'fetch', message: SERVER_MESSAGE }],
    },
  },
];

// These stay at warn. Fixing the findings means new Badge variants and theme tokens, which
// changes how the UI looks. That is a design decision. The primitives in components/ui are
// shadcn output, so they are not linted.
export const tailwindRules = [
  {
    files: CLIENT_CODE,
    ignores: [...SPECS, '**/*.stories.tsx', 'packages/ui/src/lib/components/ui/**'],
    plugins: { shadcn },
    rules: {
      'shadcn/no-restyle': ['warn', { allow: ['layout'] }],
      'shadcn/no-raw-colors': 'warn',
      'shadcn/no-arbitrary-values': 'warn',
      'shadcn/no-inline-styles': 'warn',
      'shadcn/no-unknown-classes': 'warn',
    },
  },
];
