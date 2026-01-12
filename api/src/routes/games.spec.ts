import request from 'supertest';
import express from 'express';
import { vi } from 'vitest';
import { registerGamesRoutes } from './games.js';
import type { GamesServiceClient } from '@nba-analytics-hub/data-access';
import { mockGames } from '@nba-analytics-hub/testing';
import { describeIfSockets } from '../test-utils/describeIfSockets.js';

const gamesResponse = { date: '2025-01-01', games: mockGames };

function createTestContext(overrides?: Partial<GamesServiceClient>) {
  const gamesServiceMock: GamesServiceClient = {
    checkHealth: vi.fn(),
    getGames: vi.fn().mockResolvedValue(gamesResponse),
    getTodayGames: vi.fn().mockResolvedValue(gamesResponse),
    getGameById: vi.fn().mockResolvedValue(mockGames[0]),
    ...overrides,
  };

  const app = express();
  registerGamesRoutes(app, { gamesService: gamesServiceMock, logger: console });
  return { app, gamesServiceMock };
}

describeIfSockets('games routes', () => {
  it('returns games with date/tz params and echoes request id', async () => {
    const { app, gamesServiceMock } = createTestContext();

    const res = await request(app)
      .get('/games?date=2025-02-02&tz=America/New_York')
      .set('X-Request-ID', 'client-req-1');

    expect(res.status).toBe(200);
    expect(res.headers['x-request-id']).toBe('client-req-1');
    expect(Array.isArray(res.body)).toBe(true);
    expect(gamesServiceMock.getGames).toHaveBeenCalledWith({
      date: '2025-02-02',
      tz: 'America/New_York',
      requestId: 'client-req-1',
    });
  });

  it('returns today games and generates a request id when missing', async () => {
    const { app, gamesServiceMock } = createTestContext();

    const res = await request(app).get('/games/today');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.headers['x-request-id']).toBeDefined();
    expect(gamesServiceMock.getTodayGames).toHaveBeenCalledWith(
      expect.objectContaining({ requestId: expect.any(String) }),
    );
  });

  it('falls back to mock games for upcoming when upstream is empty', async () => {
    const { app } = createTestContext({
      getGames: vi.fn().mockResolvedValue({ date: '2025-01-01', games: [] }),
    });

    const res = await request(app).get('/games/upcoming');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty('id');
  });

  it('returns a single game by id and forwards request id to the service', async () => {
    const getGameById = vi.fn().mockResolvedValue(mockGames[0]);
    const { app } = createTestContext({ getGameById });

    const res = await request(app)
      .get('/games/game-123')
      .set('X-Request-ID', 'client-req-2');

    expect(res.status).toBe(200);
    expect(res.headers['x-request-id']).toBe('client-req-2');
    expect(res.body).toHaveProperty('id', mockGames[0].id);
    expect(getGameById).toHaveBeenCalledWith('game-123', {
      requestId: 'client-req-2',
    });
  });

  it('returns 502 with request id when upstream fails', async () => {
    const { app } = createTestContext({
      getGames: vi.fn().mockRejectedValue(new Error('service down')),
    });

    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    const res = await request(app).get('/games');

    expect(res.status).toBe(502);
    expect(res.body).toMatchObject({
      error: 'Unable to fetch games',
      requestId: expect.any(String),
    });
    expect(res.headers['x-request-id']).toBeDefined();

    consoleError.mockRestore();
  });
});
