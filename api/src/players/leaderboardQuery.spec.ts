import type { Request } from 'express';
import { parseLeaderboardQuery } from './leaderboardQuery.js';

const req = (query: Record<string, string>) => ({ query } as unknown as Request);

describe('parseLeaderboardQuery', () => {
  it('applies defaults', () => {
    expect(parseLeaderboardQuery(req({ season: '2024' }))).toEqual({
      ok: true,
      value: {
        season: 2024,
        seasonType: 'regular',
        sort: 'pts',
        dir: 'desc',
        limit: 50,
        offset: 0,
        search: undefined,
      },
    });
  });

  it('reads every param', () => {
    const parsed = parseLeaderboardQuery(
      req({
        season: '2023',
        seasonType: 'playoffs',
        sort: 'name',
        dir: 'asc',
        limit: '25',
        offset: '75',
        search: 'lebron',
      })
    );
    expect(parsed).toEqual({
      ok: true,
      value: {
        season: 2023,
        seasonType: 'playoffs',
        sort: 'name',
        dir: 'asc',
        limit: 25,
        offset: 75,
        search: 'lebron',
      },
    });
  });

  it.each([
    [{}],
    [{ season: 'abc' }],
    [{ season: '1800' }],
    [{ season: '2024', seasonType: 'nope' }],
    [{ season: '2024', sort: 'drop_table' }],
    [{ season: '2024', dir: 'sideways' }],
    [{ season: '2024', limit: '0' }],
    [{ season: '2024', limit: '500' }],
    [{ season: '2024', offset: '-1' }],
    [{ season: '2024', offset: '1.5' }],
  ])('rejects %j', (query) => {
    expect(parseLeaderboardQuery(req(query as Record<string, string>)).ok).toBe(false);
  });
});
