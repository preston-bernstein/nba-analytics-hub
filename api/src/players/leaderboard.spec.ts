import request from 'supertest';
import express from 'express';
import { vi } from 'vitest';
import { registerPlayersRoutes } from './leaderboard.js';
import { toLeaderboardRow, createPgLeaderboardRepo, leaderboardJobKey } from './leaderboardRepo.js';
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
  it('queries by job key and maps each row', async () => {
    const query = vi.fn().mockResolvedValue({ rows: [{ data: apiItem }] });
    const repo = createPgLeaderboardRepo({ query });
    const rows = await repo.list(2024, 'playoffs');
    expect(query).toHaveBeenCalledTimes(1);
    expect(query.mock.calls[0][1]).toEqual(['season-2024_general_base_playoffs']);
    expect(rows).toHaveLength(1);
    expect(rows[0].name).toBe('AJ Lawson');
  });
});

function createTestContext(list = vi.fn().mockResolvedValue([toLeaderboardRow(apiItem)])) {
  const repo: LeaderboardRepo = { list };
  const app = express();
  registerPlayersRoutes(app, { repo, logger: { error: vi.fn() } });
  return { app, list };
}

describeIfSockets('players leaderboard route', () => {
  it('returns rows for a season and season type', async () => {
    const { app, list } = createTestContext();
    const res = await request(app).get('/players/leaderboard?season=2024&seasonType=playoffs');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(list).toHaveBeenCalledWith(2024, 'playoffs');
  });

  it('defaults the season type to regular', async () => {
    const { app, list } = createTestContext();
    await request(app).get('/players/leaderboard?season=2023');
    expect(list).toHaveBeenCalledWith(2023, 'regular');
  });

  it('rejects a missing or bad season with 400', async () => {
    const { app, list } = createTestContext();
    expect((await request(app).get('/players/leaderboard')).status).toBe(400);
    expect((await request(app).get('/players/leaderboard?season=abc')).status).toBe(400);
    expect((await request(app).get('/players/leaderboard?season=1800')).status).toBe(400);
    expect(list).not.toHaveBeenCalled();
  });

  it('rejects an unknown season type with 400', async () => {
    const { app } = createTestContext();
    const res = await request(app).get('/players/leaderboard?season=2024&seasonType=nope');
    expect(res.status).toBe(400);
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
