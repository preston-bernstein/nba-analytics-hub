import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../../../mocks/server';
import { fetchLeaderboardPage } from './leaderboardApi';

let seen: URL | undefined;
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
beforeEach(() =>
  server.use(
    http.get('*/players/leaderboard', ({ request }) => {
      seen = new URL(request.url);
      return HttpResponse.json({ rows: [], total: 0, limit: 25, offset: 50 });
    })
  )
);
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('fetchLeaderboardPage', () => {
  it('sends every query field, and leaves out an empty search', async () => {
    const page = await fetchLeaderboardPage({
      season: 2024,
      seasonType: 'playoffs',
      sort: 'fg3Pct',
      dir: 'asc',
      limit: 25,
      offset: 50,
      search: undefined,
    });
    expect(page.offset).toBe(50);
    expect(Object.fromEntries(seen!.searchParams)).toEqual({
      season: '2024',
      seasonType: 'playoffs',
      sort: 'fg3Pct',
      dir: 'asc',
      limit: '25',
      offset: '50',
    });
  });

  it('sends the search text when there is one', async () => {
    await fetchLeaderboardPage({
      season: 2024,
      seasonType: 'regular',
      sort: 'pts',
      dir: 'desc',
      limit: 50,
      offset: 0,
      search: 'lebron',
    });
    expect(seen!.searchParams.get('search')).toBe('lebron');
  });
});
