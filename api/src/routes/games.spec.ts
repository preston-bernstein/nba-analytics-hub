import request from 'supertest';
import express from 'express';
import { vi } from 'vitest';
import { registerGamesRoutes } from './games.js';
import type { GamesServiceClient } from '@nba-analytics-hub/data-access';
import { mockGames } from '@nba-analytics-hub/testing';

// Create an isolated app per test run to avoid port binding issues in CI/sandbox
const app = express();

const gamesServiceMock: GamesServiceClient = {
  checkHealth: vi.fn(),
  getTodayGames: vi.fn().mockResolvedValue({ date: '2025-01-01', games: mockGames }),
  getGameById: vi.fn(),
};

registerGamesRoutes(app, { gamesService: gamesServiceMock, logger: console });

describe('GET /games/today', () => {
  it('returns today games from service client', async () => {
    const res = await request(app).get('/games/today');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe('GET /games/upcoming', () => {
  it('returns a list of upcoming games', async () => {
    const res = await request(app).get('/games/upcoming');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);

    const game = res.body[0];
    expect(game).toHaveProperty('id');
    expect(game).toHaveProperty('provider');
    expect(game).toHaveProperty('homeTeam.id');
    expect(game).toHaveProperty('awayTeam.id');
    expect(game).toHaveProperty('startTime');
    expect(game).toHaveProperty('status');
    expect(game).toHaveProperty('score.home');
    expect(game).toHaveProperty('meta.upstreamGameId');
  });
});
