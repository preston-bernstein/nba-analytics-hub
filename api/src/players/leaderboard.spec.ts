import request from 'supertest';
import express from 'express';
import { vi } from 'vitest';
import { registerPlayersRoutes } from './leaderboard.js';
import {
  toLeaderboardRow,
  createPgLeaderboardRepo,
  leaderboardJobKey,
  SORT_COLUMNS,
} from './leaderboardRepo.js';
import type { LeaderboardRepo } from './leaderboardRepo.js';
import { describeIfSockets } from '../platform/testing/describeIfSockets.js';

const apiItem = {
  player: { id: 7, first_name: 'AJ', last_name: 'Lawson', position: 'G' },
  season: 2024,
  season_type: 'regular',
  stats: {
    gp: 26,
    min: 18.7,
    pts: 9.1,
    reb: 3.3,
    ast: 1.2,
    stl: 0.5,
    blk: 0.2,
    tov: 0.6,
    fg_pct: 0.421,
    fg3_pct: 0.327,
    ft_pct: 0.683,
    plus_minus: -0.7,
    nba_fantasy_pts: 16.5,
  },
};

describe('toLeaderboardRow', () => {
  it('flattens one API item into a table row', () => {
    expect(toLeaderboardRow(apiItem)).toEqual({
      playerId: 7,
      name: 'AJ Lawson',
      position: 'G',
      gp: 26,
      min: 18.7,
      pts: 9.1,
      reb: 3.3,
      ast: 1.2,
      stl: 0.5,
      blk: 0.2,
      tov: 0.6,
      fgPct: 0.421,
      fg3Pct: 0.327,
      ftPct: 0.683,
      plusMinus: -0.7,
      fantasyPts: 16.5,
    });
  });

  it('uses null for a stat the API left out', () => {
    const row = toLeaderboardRow({ ...apiItem, stats: { gp: 3 } });
    expect(row.gp).toBe(3);
    expect(row.pts).toBeNull();
  });
});

describe('leaderboardJobKey', () => {
  it('matches the archive job key', () => {
    expect(leaderboardJobKey(2024, 'regular')).toBe('season-2024_general_base_regular');
  });
});

describe('createPgLeaderboardRepo', () => {
  const base = {
    season: 2024,
    seasonType: 'playoffs' as const,
    sort: 'pts' as const,
    dir: 'desc' as const,
    limit: 50,
    offset: 100,
    search: undefined,
  };

  it('queries by job key with limit and offset, and maps each row', async () => {
    const query = vi.fn().mockResolvedValue({ rows: [{ data: apiItem, total: '312' }] });
    const repo = createPgLeaderboardRepo({ query });
    const page = await repo.list(base);
    expect(query).toHaveBeenCalledTimes(1);
    const [sql, params] = query.mock.calls[0];
    expect(params).toEqual(['season-2024_general_base_playoffs', 50, 100, null]);
    expect(sql).toMatch(/limit \$2 offset \$3/);
    expect(page.total).toBe(312);
    expect(page.rows[0].name).toBe('AJ Lawson');
  });

  it('returns total 0 for an empty page', async () => {
    const repo = createPgLeaderboardRepo({ query: vi.fn().mockResolvedValue({ rows: [] }) });
    expect(await repo.list(base)).toEqual({ rows: [], total: 0 });
  });

  it('orders by the chosen column and direction, with a stable tie-break', async () => {
    const query = vi.fn().mockResolvedValue({ rows: [] });
    const repo = createPgLeaderboardRepo({ query });
    await repo.list({ ...base, sort: 'fg3Pct', dir: 'asc' });
    expect(query.mock.calls[0][0]).toMatch(/fg3_pct[^,]*\) asc nulls last, .*id/s);
  });

  it('passes a search term as a bound parameter, never inside the SQL', async () => {
    const query = vi.fn().mockResolvedValue({ rows: [] });
    const repo = createPgLeaderboardRepo({ query });
    await repo.list({ ...base, search: "o'brien; drop table x" });
    expect(query.mock.calls[0][1][3]).toBe("o'brien; drop table x");
    expect(query.mock.calls[0][0]).not.toContain('drop table');
  });

  it('wraps each name field in parentheses, because || binds tighter than ->>', async () => {
    const query = vi.fn().mockResolvedValue({ rows: [] });
    const repo = createPgLeaderboardRepo({ query });
    await repo.list({ ...base, sort: 'name', search: 'jam' });
    const sql: string = query.mock.calls[0][0];
    expect(sql).not.toMatch(/->>'first_name' \|\|/);
    expect(sql).toContain(
      "(data->'player'->>'first_name') || ' ' || (data->'player'->>'last_name')"
    );
  });

  it('can sort by every table column', () => {
    expect([...SORT_COLUMNS].toSorted()).toEqual(
      [
        'ast',
        'blk',
        'fantasyPts',
        'fg3Pct',
        'fgPct',
        'ftPct',
        'gp',
        'min',
        'name',
        'plusMinus',
        'position',
        'pts',
        'reb',
        'stl',
        'tov',
      ].toSorted()
    );
  });
});

function createTestContext(
  list = vi.fn().mockResolvedValue({ rows: [toLeaderboardRow(apiItem)], total: 1 })
) {
  const repo: LeaderboardRepo = { list };
  const app = express();
  registerPlayersRoutes(app, { repo, logger: { error: vi.fn() } });
  return { app, list };
}

describeIfSockets('players leaderboard route', () => {
  it('returns a page of rows with the total', async () => {
    const { app, list } = createTestContext();
    const res = await request(app).get('/players/leaderboard?season=2024&seasonType=playoffs');
    expect(res.status).toBe(200);
    expect(res.body.rows).toHaveLength(1);
    expect(res.body).toMatchObject({ total: 1, limit: 50, offset: 0 });
    expect(list).toHaveBeenCalledWith({
      season: 2024,
      seasonType: 'playoffs',
      sort: 'pts',
      dir: 'desc',
      limit: 50,
      offset: 0,
      search: undefined,
    });
  });

  it('passes sort, dir, limit, offset and search through', async () => {
    const { app, list } = createTestContext();
    await request(app).get(
      '/players/leaderboard?season=2023&sort=name&dir=asc&limit=25&offset=75&search=lebron'
    );
    expect(list).toHaveBeenCalledWith({
      season: 2023,
      seasonType: 'regular',
      sort: 'name',
      dir: 'asc',
      limit: 25,
      offset: 75,
      search: 'lebron',
    });
  });

  it('rejects a missing or bad season with 400', async () => {
    const { app, list } = createTestContext();
    expect((await request(app).get('/players/leaderboard')).status).toBe(400);
    expect((await request(app).get('/players/leaderboard?season=abc')).status).toBe(400);
    expect((await request(app).get('/players/leaderboard?season=1800')).status).toBe(400);
    expect(list).not.toHaveBeenCalled();
  });

  it.each([
    ['seasonType=nope'],
    ['sort=drop_table'],
    ['dir=sideways'],
    ['limit=0'],
    ['limit=500'],
    ['limit=abc'],
    ['offset=-1'],
    ['offset=1.5'],
  ])('rejects %s with 400', async (param) => {
    const { app, list } = createTestContext();
    const res = await request(app).get(`/players/leaderboard?season=2024&${param}`);
    expect(res.status).toBe(400);
    expect(list).not.toHaveBeenCalled();
  });

  it('returns 502 with a request id when the repo fails', async () => {
    const { app } = createTestContext(vi.fn().mockRejectedValue(new Error('db down')));
    const res = await request(app).get('/players/leaderboard?season=2024');
    expect(res.status).toBe(502);
    expect(res.body.error).toBeTruthy();
  });

  it('returns 503 when no database is configured', async () => {
    const app = express();
    registerPlayersRoutes(app, { repo: undefined, logger: { error: vi.fn() } });
    const res = await request(app).get('/players/leaderboard?season=2024');
    expect(res.status).toBe(503);
  });
});
