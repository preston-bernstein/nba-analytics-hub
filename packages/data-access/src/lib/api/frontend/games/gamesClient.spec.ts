import { describe, it, expect } from 'vitest';
import { createGamesClient } from './gamesClient';
import { mockFetch } from '../../test-files/helpers';
import { mockGames } from '../../test-files/fixtures';

const BASE_URL = 'https://example.com';

describe('createGamesClient', () => {
  const fetchMock = mockFetch();

  it('fetches games with optional date/tz filters', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockGames,
    });

    const client = createGamesClient({ baseUrl: BASE_URL });

    const result = await client.getGames({
      date: '2025-02-03',
      tz: 'America/Chicago',
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const urlArg = fetchMock.mock.calls[0][0] as string;
    const calledUrl = new URL(urlArg);

    expect(calledUrl.origin + calledUrl.pathname).toBe(`${BASE_URL}/games`);
    expect(calledUrl.searchParams.get('date')).toBe('2025-02-03');
    expect(calledUrl.searchParams.get('tz')).toBe('America/Chicago');
    expect(result).toEqual(mockGames);
  });

  it('fetches games via /games without params', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockGames,
    });

    const client = createGamesClient({ baseUrl: BASE_URL });

    const result = await client.getGames();

    const urlArg = fetchMock.mock.calls[0][0] as string;
    const calledUrl = new URL(urlArg);
    expect(calledUrl.origin + calledUrl.pathname).toBe(`${BASE_URL}/games`);
    expect(calledUrl.search).toBe('');
    expect(result).toEqual(mockGames);
  });

  it('prefixes requests with a normalized basePath', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockGames,
    });

    const client = createGamesClient({ baseUrl: BASE_URL, basePath: 'api/' });

    const result = await client.getGames();

    const urlArg = fetchMock.mock.calls[0][0] as string;
    const calledUrl = new URL(urlArg);
    expect(calledUrl.origin + calledUrl.pathname).toBe(`${BASE_URL}/api/games`);
    expect(result).toEqual(mockGames);
  });

  it('keeps the base path when no trailing slash is present', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockGames,
    });

    const client = createGamesClient({ baseUrl: BASE_URL, basePath: '/api' });

    const result = await client.getGames();

    const urlArg = fetchMock.mock.calls[0][0] as string;
    const calledUrl = new URL(urlArg);
    expect(calledUrl.origin + calledUrl.pathname).toBe(`${BASE_URL}/api/games`);
    expect(result).toEqual(mockGames);
  });

  it('ignores basePath values that are only whitespace', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockGames,
    });

    const client = createGamesClient({ baseUrl: BASE_URL, basePath: '   ' });

    const result = await client.getGames();

    const urlArg = fetchMock.mock.calls[0][0] as string;
    const calledUrl = new URL(urlArg);
    expect(calledUrl.origin + calledUrl.pathname).toBe(`${BASE_URL}/games`);
    expect(result).toEqual(mockGames);
  });

  it('throws a descriptive error when the API returns a non-OK status', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 502,
      json: async () => ({}),
    });

    const client = createGamesClient({ baseUrl: BASE_URL });

    await expect(client.getGames()).rejects.toThrow(
      'Games request failed with status 502',
    );
  });

  it('propagates fetch rejections (network errors)', async () => {
    fetchMock.mockRejectedValue(new Error('network down'));

    const client = createGamesClient({ baseUrl: BASE_URL });

    await expect(client.getGames()).rejects.toThrow('network down');
  });
});
