import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { Game } from '@nba-analytics-hub/types';
import { createGamesClient } from './gamesClient';

const BASE_URL = 'https://example.com';

describe('createGamesClient', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    (globalThis as any).fetch = vi.fn();
  });

  afterEach(() => {
    (globalThis as any).fetch = originalFetch;
  });

  it('fetches upcoming games and returns them as typed data', async () => {
    const mockGames: Game[] = [
      {
        id: 'game-1',
        homeTeamId: 'ATL',
        awayTeamId: 'BOS',
        startTimeUtc: '2025-01-01T00:00:00Z',
      },
      {
        id: 'game-2',
        homeTeamId: 'LAL',
        awayTeamId: 'GSW',
        startTimeUtc: '2025-01-02T02:00:00Z',
      },
    ];

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockGames,
    });

    (globalThis as any).fetch = mockFetch;

    const client = createGamesClient({ baseUrl: BASE_URL });

    const result = await client.getUpcomingGames();

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const urlArg = mockFetch.mock.calls[0][0] as string;
    const calledUrl = new URL(urlArg);

    expect(calledUrl.origin + calledUrl.pathname).toBe(
      `${BASE_URL}/games/upcoming`,
    );

    expect(result).toEqual(mockGames);
  });

  it('throws a descriptive error when the API returns a non-OK status', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 502,
      json: async () => ({}),
    });

    (globalThis as any).fetch = mockFetch;

    const client = createGamesClient({ baseUrl: BASE_URL });

    await expect(client.getUpcomingGames()).rejects.toThrow(
      'Games request failed with status 502',
    );
  });
});
