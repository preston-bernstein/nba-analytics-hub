import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import type { LeaderboardPage } from '@nba-analytics-hub/players';
import { server } from '../server';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

async function get(query: string): Promise<{ status: number; body: LeaderboardPage }> {
  const res = await fetch(`http://localhost/players/leaderboard?${query}`);
  return { status: res.status, body: (await res.json()) as LeaderboardPage };
}

describe('mock leaderboard handler', () => {
  it('sorts by points, high to low, by default', async () => {
    const { body } = await get('season=2024');
    const pts = body.rows.map((r) => r.pts as number);
    expect(pts).toEqual(pts.toSorted((a, b) => b - a));
    expect(body).toMatchObject({ limit: 50, offset: 0 });
    expect(body.rows).toHaveLength(50);
    expect(body.total).toBeGreaterThan(150);
  });

  it('sorts any column in either direction', async () => {
    const asc = await get('season=2024&sort=name&dir=asc&limit=200');
    const names = asc.body.rows.map((r) => r.name.toLowerCase());
    expect(names).toEqual(names.toSorted());
    const desc = await get('season=2024&sort=reb&dir=desc&limit=200');
    const reb = desc.body.rows.map((r) => r.reb as number);
    expect(reb).toEqual(reb.toSorted((a, b) => b - a));
  });

  it('puts missing values last, in both directions', async () => {
    for (const dir of ['asc', 'desc']) {
      // The missing values are at the very end, so ask for the last rows.
      const { body } = await get(`season=2024&sort=fg3Pct&dir=${dir}&limit=200&offset=100`);
      const values = body.rows.map((r) => r.fg3Pct);
      const firstNull = values.indexOf(null);
      expect(firstNull).toBeGreaterThan(-1);
      expect(values.slice(firstNull).every((v) => v === null)).toBe(true);
    }
  });

  it('pages with limit and offset, and keeps the total', async () => {
    const first = await get('season=2024&limit=20&offset=0');
    const second = await get('season=2024&limit=20&offset=20');
    expect(second.body.offset).toBe(20);
    expect(second.body.total).toBe(first.body.total);
    expect(second.body.rows[0].playerId).not.toBe(first.body.rows[0].playerId);
  });

  it('filters by name, case-insensitive, and counts only the matches', async () => {
    const all = await get('season=2024&limit=200');
    const term = all.body.rows[0].name.slice(1, 4).toUpperCase();
    const { body } = await get(`season=2024&limit=200&search=${term}`);
    expect(body.total).toBeGreaterThan(0);
    expect(body.total).toBeLessThan(all.body.total);
    for (const row of body.rows) expect(row.name.toUpperCase()).toContain(term);
  });

  it('shows a different list for the playoffs', async () => {
    const regular = await get('season=2024&seasonType=regular');
    const playoffs = await get('season=2024&seasonType=playoffs');
    expect(playoffs.body.total).toBeLessThan(regular.body.total);
  });

  it.each(['', 'season=abc', 'season=2024&sort=nope', 'season=2024&dir=up', 'season=2024&limit=0'])(
    'answers 400 for bad params: %s',
    async (query) => {
      expect((await get(query)).status).toBe(400);
    }
  );
});
