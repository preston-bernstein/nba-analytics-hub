import { describe, it, expect } from 'vitest';
import { createGamesClient } from './gamesClient';
import { mockFetch } from '../../test-files/helpers';
import { mockGames } from '../../test-files/fixtures';

const BASE_URL = 'https://example.com';

describe('createGamesClient', () => {
  const fetchMock = mockFetch();

  it('fetches upcoming games and returns them as typed data', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockGames,
    });

    const client = createGamesClient({ baseUrl: BASE_URL });

    const result = await client.getUpcomingGames();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const urlArg = fetchMock.mock.calls[0][0] as string;
    const calledUrl = new URL(urlArg);

    expect(calledUrl.origin + calledUrl.pathname).toBe(
      `${BASE_URL}/games/upcoming`,
    );

    expect(result).toEqual(mockGames);
  });

  it('throws a descriptive error when the API returns a non-OK status', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 502,
      json: async () => ({}),
    });

    const client = createGamesClient({ baseUrl: BASE_URL });

    await expect(client.getUpcomingGames()).rejects.toThrow(
      'Games request failed with status 502',
    );
  });

  it('propagates fetch rejections (network errors)', async () => {
    fetchMock.mockRejectedValue(new Error('network down'));

    const client = createGamesClient({ baseUrl: BASE_URL });

    await expect(client.getUpcomingGames()).rejects.toThrow('network down');
  });
});
