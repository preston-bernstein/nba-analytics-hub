import { vi } from 'vitest';
import { SORT_COLUMNS } from '@nba-analytics-hub/players';
import type { LeaderboardQuery } from '@nba-analytics-hub/players';
import { createPgLeaderboardRepo, SORT_SQL } from './pgLeaderboardRepo.js';

const apiItem = {
  player: { id: 7, first_name: 'AJ', last_name: 'Lawson', position: 'G' },
  stats: { gp: 26, pts: 9.1 },
};

const base: LeaderboardQuery = {
  season: 2024,
  seasonType: 'playoffs',
  sort: 'pts',
  dir: 'desc',
  limit: 50,
  offset: 100,
  search: undefined,
};

describe('createPgLeaderboardRepo', () => {
  it('queries by job key with limit and offset, and returns a page', async () => {
    const query = vi.fn().mockResolvedValue({ rows: [{ data: apiItem, total: '312' }] });
    const page = await createPgLeaderboardRepo({ query }).list(base);
    const [sql, params] = query.mock.calls[0];
    expect(params).toEqual(['season-2024_general_base_playoffs', 50, 100, null]);
    expect(sql).toMatch(/limit \$2 offset \$3/);
    expect(page).toMatchObject({ total: 312, limit: 50, offset: 100 });
    expect(page.rows[0].name).toBe('AJ Lawson');
  });

  it('returns total 0 for an empty page', async () => {
    const repo = createPgLeaderboardRepo({ query: vi.fn().mockResolvedValue({ rows: [] }) });
    expect(await repo.list(base)).toEqual({ rows: [], total: 0, limit: 50, offset: 100 });
  });

  it('orders by the chosen column and direction, with a stable tie-break', async () => {
    const query = vi.fn().mockResolvedValue({ rows: [] });
    await createPgLeaderboardRepo({ query }).list({ ...base, sort: 'fg3Pct', dir: 'asc' });
    expect(query.mock.calls[0][0]).toMatch(/fg3_pct[^,]*\) asc nulls last, .*id/s);
  });

  it('passes a search term as a bound parameter, never inside the SQL', async () => {
    const query = vi.fn().mockResolvedValue({ rows: [] });
    await createPgLeaderboardRepo({ query }).list({ ...base, search: "o'brien; drop table x" });
    expect(query.mock.calls[0][1][3]).toBe("o'brien; drop table x");
    expect(query.mock.calls[0][0]).not.toContain('drop table');
  });

  it('wraps each name field in parentheses, because || binds tighter than ->>', async () => {
    const query = vi.fn().mockResolvedValue({ rows: [] });
    await createPgLeaderboardRepo({ query }).list({ ...base, sort: 'name', search: 'jam' });
    const sql: string = query.mock.calls[0][0];
    expect(sql).not.toMatch(/->>'first_name' \|\|/);
    expect(sql).toContain(
      "(data->'player'->>'first_name') || ' ' || (data->'player'->>'last_name')"
    );
  });

  it('has SQL for every sortable column', () => {
    for (const key of SORT_COLUMNS) expect(SORT_SQL[key]).toMatch(/^\(/);
  });
});
