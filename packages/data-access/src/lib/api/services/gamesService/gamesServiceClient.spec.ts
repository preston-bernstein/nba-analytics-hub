import { describe, expect, it } from 'vitest';
import type { GamesServiceGame } from '@nba-analytics-hub/types';
import { createGamesServiceClient } from './gamesServiceClient';
import {
  gameDetail,
  healthOk,
  todayResponse,
} from '../../test-files/fixtures';
import { mockFetch } from '../../test-files/helpers';

const BASE_URL = 'https://games-service.example.com';

describe('createGamesServiceClient', () => {
  const fetchMock = mockFetch();

  it('calls /health and returns parsed health response on success', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => healthOk,
    });

    const client = createGamesServiceClient({ baseUrl: BASE_URL });
    const result = await client.checkHealth();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const calledUrl = new URL((fetchMock.mock.calls[0] as [string])[0]);
    expect(calledUrl.origin + calledUrl.pathname).toBe(`${BASE_URL}/health`);
    expect(result).toEqual(healthOk);
  });

  it('calls /games/today and returns parsed games on success', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => todayResponse,
    });

    const client = createGamesServiceClient({ baseUrl: BASE_URL });
    const result = await client.getTodayGames();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const calledUrl = new URL((fetchMock.mock.calls[0] as [string])[0]);
    expect(calledUrl.origin + calledUrl.pathname).toBe(
      `${BASE_URL}/games/today`,
    );
    expect(result).toEqual(todayResponse);
  });

  it('calls /games/:id and returns parsed game on success', async () => {
    const mockGame: GamesServiceGame = {
      ...gameDetail,
      id: 'game-2',
    };

    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockGame,
    });

    const client = createGamesServiceClient({ baseUrl: BASE_URL });
    const result = await client.getGameById(mockGame.id);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const calledUrl = new URL((fetchMock.mock.calls[0] as [string])[0]);
    expect(calledUrl.origin + calledUrl.pathname).toBe(
      `${BASE_URL}/games/${mockGame.id}`,
    );
    expect(result).toEqual(mockGame);
  });

  it('throws a descriptive error when the games service returns non-OK', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 502,
      json: async () => ({}),
    });

    const client = createGamesServiceClient({ baseUrl: BASE_URL });

    await expect(client.getTodayGames()).rejects.toThrow(
      'Games service request failed with status 502',
    );
  });

  it('throws on non-OK for game by id', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({}),
    });

    const client = createGamesServiceClient({ baseUrl: BASE_URL });

    await expect(client.getGameById('missing')).rejects.toThrow(
      'Games service request failed with status 404',
    );
  });

  it('encodes game ids in the URL path', async () => {
    const mockGame: GamesServiceGame = {
      id: 'game id with spaces',
      provider: 'ball_dont_lie',
      homeTeam: { id: 'NYK', name: 'New York Knicks', externalId: 9 },
      awayTeam: { id: 'MIA', name: 'Miami Heat', externalId: 6 },
      startTime: '2025-01-02T01:00:00Z',
      status: 'IN_PROGRESS',
      score: { home: 75, away: 72 },
      meta: { season: '2024-2025', upstreamGameId: 54321 },
    };

    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockGame,
    });

    const client = createGamesServiceClient({ baseUrl: BASE_URL });
    await client.getGameById(mockGame.id);

    const calledUrl = new URL((fetchMock.mock.calls[0] as [string])[0]);
    expect(calledUrl.pathname).toBe(
      `/games/${encodeURIComponent(mockGame.id)}`,
    );
  });
});
