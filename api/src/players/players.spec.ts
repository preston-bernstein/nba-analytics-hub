import request from 'supertest';
import express from 'express';
import { vi } from 'vitest';
import type { LeaderboardPage } from '@nba-analytics-hub/players';
import { registerPlayersRoutes } from './players.js';
import type { LeaderboardRepo } from './pgLeaderboardRepo.js';
import { describeIfSockets } from '../platform/testing/describeIfSockets.js';

const page: LeaderboardPage = { rows: [], total: 0, limit: 50, offset: 0 };

function createTestContext(list = vi.fn().mockResolvedValue(page)) {
  const repo: LeaderboardRepo = { list };
  const app = express();
  registerPlayersRoutes(app, { repo, logger: { error: vi.fn() } });
  return { app, list };
}

describeIfSockets('players leaderboard route', () => {
  it('returns the page from the repo', async () => {
    const { app, list } = createTestContext();
    const res = await request(app).get('/players/leaderboard?season=2024&seasonType=playoffs');
    expect(res.status).toBe(200);
    expect(res.body).toEqual(page);
    expect(list).toHaveBeenCalledWith(
      expect.objectContaining({ season: 2024, seasonType: 'playoffs', sort: 'pts', dir: 'desc' })
    );
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

  it('answers 400 with the reason for a bad param, and does not query', async () => {
    const { app, list } = createTestContext();
    const res = await request(app).get('/players/leaderboard?season=2024&sort=drop_table');
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/sort/);
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
