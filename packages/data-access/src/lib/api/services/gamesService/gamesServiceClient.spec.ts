import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type {
  GamesServiceGame,
  GamesServiceHealthResponse,
  GamesServiceTodayResponse,
} from '@nba-analytics-hub/types';
import { createGamesServiceClient } from './gamesServiceClient';

const BASE_URL = 'https://games-service.example.com';

describe('createGamesServiceClient', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    (globalThis as any).fetch = vi.fn();
  });

  afterEach(() => {
    (globalThis as any).fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('calls /health and returns parsed health response on success', async () => {
    const mockHealth: GamesServiceHealthResponse = { status: 'ok' };

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockHealth,
    });

    (globalThis as any).fetch = mockFetch;

    const client = createGamesServiceClient({ baseUrl: BASE_URL });
    const result = await client.checkHealth();

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const calledUrl = new URL((mockFetch.mock.calls[0] as [string])[0]);
    expect(calledUrl.origin + calledUrl.pathname).toBe(`${BASE_URL}/health`);
    expect(result).toEqual(mockHealth);
  });

  it('calls /games/today and returns parsed games on success', async () => {
    const mockResponse: GamesServiceTodayResponse = {
      date: '2025-01-01',
      games: [
        {
          id: 'game-1',
          provider: 'ball_dont_lie',
          homeTeam: { id: 'ATL', name: 'Atlanta Hawks', externalId: 14 },
          awayTeam: { id: 'BOS', name: 'Boston Celtics', externalId: 2 },
          startTime: '2025-01-01T00:00:00Z',
          status: 'SCHEDULED',
          score: { home: 0, away: 0 },
          meta: { season: '2024-2025', upstreamGameId: 12345 },
        },
      ],
    };

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockResponse,
    });

    (globalThis as any).fetch = mockFetch;

    const client = createGamesServiceClient({ baseUrl: BASE_URL });
    const result = await client.getTodayGames();

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const calledUrl = new URL((mockFetch.mock.calls[0] as [string])[0]);
    expect(calledUrl.origin + calledUrl.pathname).toBe(
      `${BASE_URL}/games/today`,
    );
    expect(result).toEqual(mockResponse);
  });

  it('calls /games/:id and returns parsed game on success', async () => {
    const mockGame: GamesServiceGame = {
      id: 'game-2',
      provider: 'ball_dont_lie',
      homeTeam: { id: 'NYK', name: 'New York Knicks', externalId: 9 },
      awayTeam: { id: 'MIA', name: 'Miami Heat', externalId: 6 },
      startTime: '2025-01-02T01:00:00Z',
      status: 'IN_PROGRESS',
      score: { home: 75, away: 72 },
      meta: { season: '2024-2025', upstreamGameId: 54321 },
    };

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockGame,
    });

    (globalThis as any).fetch = mockFetch;

    const client = createGamesServiceClient({ baseUrl: BASE_URL });
    const result = await client.getGameById(mockGame.id);

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const calledUrl = new URL((mockFetch.mock.calls[0] as [string])[0]);
    expect(calledUrl.origin + calledUrl.pathname).toBe(
      `${BASE_URL}/games/${mockGame.id}`,
    );
    expect(result).toEqual(mockGame);
  });

  it('throws a descriptive error when the games service returns non-OK', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 502,
      json: async () => ({}),
    });

    (globalThis as any).fetch = mockFetch;

    const client = createGamesServiceClient({ baseUrl: BASE_URL });

    await expect(client.getTodayGames()).rejects.toThrow(
      'Games service request failed with status 502',
    );
  });
});
