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

  it('calls /health and forwards request id', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => healthOk,
    });

    const client = createGamesServiceClient({ baseUrl: BASE_URL });
    const result = await client.checkHealth({ requestId: 'req-123' });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [urlArg, init] = fetchMock.mock.calls[0] as [string, Record<string, unknown>];
    const calledUrl = new URL(urlArg);
    expect(calledUrl.origin + calledUrl.pathname).toBe(`${BASE_URL}/health`);
    expect(init?.headers).toMatchObject({ 'X-Request-ID': 'req-123' });
    expect(result).toEqual(healthOk);
  });

  it('calls /games with date and tz params', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => todayResponse,
    });

    const client = createGamesServiceClient({ baseUrl: BASE_URL });
    await client.getGames({ date: '2025-01-02', tz: 'America/New_York' });

    const [urlArg] = fetchMock.mock.calls[0] as [string];
    const calledUrl = new URL(urlArg);
    expect(calledUrl.origin + calledUrl.pathname).toBe(`${BASE_URL}/games`);
    expect(calledUrl.searchParams.get('date')).toBe('2025-01-02');
    expect(calledUrl.searchParams.get('tz')).toBe('America/New_York');
  });

  it('calls /games (today) when no params are provided', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => todayResponse,
    });

    const client = createGamesServiceClient({ baseUrl: BASE_URL });
    const result = await client.getTodayGames();

    const [urlArg] = fetchMock.mock.calls[0] as [string];
    const calledUrl = new URL(urlArg);
    expect(calledUrl.origin + calledUrl.pathname).toBe(`${BASE_URL}/games`);
    expect(calledUrl.search).toBe('');
    expect(result).toEqual(todayResponse);
  });

  it('calls /games/:id with request id and returns parsed game', async () => {
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
    const result = await client.getGameById(mockGame.id, {
      requestId: 'req-456',
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [urlArg, init] = fetchMock.mock.calls[0] as [string, Record<string, unknown>];
    const calledUrl = new URL(urlArg);
    expect(calledUrl.origin + calledUrl.pathname).toBe(
      `${BASE_URL}/games/${mockGame.id}`,
    );
    expect(init?.headers).toMatchObject({ 'X-Request-ID': 'req-456' });
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

    const [urlArg] = fetchMock.mock.calls[0] as [string];
    const calledUrl = new URL(urlArg);
    expect(calledUrl.pathname).toBe(
      `/games/${encodeURIComponent(mockGame.id)}`,
    );
  });
});
