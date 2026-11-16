// @vitest-environment node
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ESLint } from 'eslint';
import { describe, expect, it } from 'vitest';

const root = fileURLToPath(new URL('../../..', import.meta.url));
const eslint = new ESLint({ cwd: root, overrideConfigFile: resolve(root, 'eslint.config.mjs') });

async function ruleIds(file: string, code: string): Promise<string[]> {
  const [result] = await eslint.lintText(code, { filePath: resolve(root, file) });
  return (result?.messages ?? []).map((message) => message.ruleId ?? 'parse-error');
}

describe('react-frontend lint rules', () => {
  it('blocks an import into another feature', async () => {
    const ids = await ruleIds(
      'web/src/app/games/components/Bad.tsx',
      "import { useLeaderboard } from '../../players/hooks/useLeaderboard';\nexport const a = useLeaderboard;\n"
    );
    expect(ids).toContain('boundaries/element-types');
  });

  it('blocks an import into a feature internal folder from app code', async () => {
    const ids = await ruleIds(
      'web/src/app/bad.tsx',
      "import { DashboardPage } from './games/DashboardPage';\nexport const a = DashboardPage;\n"
    );
    expect(ids).toContain('boundaries/entry-point');
  });

  it('allows a feature index and shared code', async () => {
    const ids = await ruleIds(
      'web/src/app/ok.tsx',
      "import { DashboardPage } from './games';\nimport { createQueryClient } from './queryClient';\nexport const a = [DashboardPage, createQueryClient];\n"
    );
    expect(ids).toEqual([]);
  });

  it('blocks fetch and axios outside an api folder', async () => {
    const ids = await ruleIds(
      'web/src/app/games/components/Bad.tsx',
      "import axios from 'axios';\nexport const a = [axios, fetch('/x')];\n"
    );
    expect(ids).toContain('no-restricted-imports');
    expect(ids).toContain('no-restricted-globals');
  });

  it('allows fetch in a feature api folder', async () => {
    const ids = await ruleIds('web/src/app/games/api/ok.ts', "export const a = fetch('/x');\n");
    expect(ids).toEqual([]);
  });

  it('blocks other store libraries, including in an api folder', async () => {
    const ids = await ruleIds(
      'web/src/app/games/api/Bad.ts',
      "import { atom } from 'jotai';\nexport const a = atom(0);\n"
    );
    expect(ids).toContain('no-restricted-imports');
  });

  it('flags a raw color and an inline style', async () => {
    const ids = await ruleIds(
      'web/src/app/games/components/Bad.tsx',
      'export const A = () => <div className="text-red-500" style={{ color: \'red\' }} />;\n'
    );
    expect(ids).toContain('shadcn/no-raw-colors');
    expect(ids).toContain('shadcn/no-inline-styles');
  });
});
