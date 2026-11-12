// @vitest-environment node
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { compile } from '@tailwindcss/node';

const here = dirname(fileURLToPath(import.meta.url));
const entry = resolve(here, '../../../../web/src/styles.css');

async function buildCss(candidates: string[]): Promise<string> {
  const compiler = await compile(readFileSync(entry, 'utf8'), {
    base: dirname(entry),
    onDependency: () => undefined,
  });
  return compiler.build(candidates);
}

// These utilities are used across the app and the shadcn components.
// Each must resolve to a real rule, or the UI renders unstyled.
const themeUtilities = [
  'bg-background',
  'text-foreground',
  'bg-card',
  'text-card-foreground',
  'text-muted-foreground',
  'bg-muted',
  'border-border',
  'bg-primary',
  'text-primary-foreground',
  'bg-secondary',
  'bg-accent',
  'text-destructive',
  'ring-ring',
  'bg-popover',
  'border-input',
  'bg-brand-500',
  'bg-live',
  'text-live-foreground',
  'border-live-border',
  'bg-warning',
  'text-warning-foreground',
  'border-warning-border',
];

describe('Tailwind theme tokens', () => {
  it.each(themeUtilities)('%s resolves to a CSS rule', async (utility) => {
    const css = await buildCss([utility]);
    expect(css).toMatch(new RegExp(`\\.${utility}\\s*\\{`));
  });

  it('scans the ui package for class names', async () => {
    const compiler = await compile(readFileSync(entry, 'utf8'), {
      base: dirname(entry),
      onDependency: () => undefined,
    });
    const uiSrc = resolve(here, '..');
    expect(
      compiler.sources.some(({ base, pattern }) =>
        resolve(base, pattern).startsWith(uiSrc),
      ),
    ).toBe(true);
  });
});
