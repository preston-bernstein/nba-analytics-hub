import { http, HttpResponse } from 'msw';
import { LEADERBOARD_PAGE_SIZE, SEASON_TYPES, isSortColumn } from '@nba-analytics-hub/players';
import type { LeaderboardPage, LeaderboardRow, SeasonType } from '@nba-analytics-hub/players';
import { makeLeaderboard } from '../data/leaderboard';

type Parsed<T> = { ok: true; value: T } | { ok: false; error: string };

const bad = (error: string): Parsed<never> => ({ ok: false, error });

function intParam(
  raw: string | null,
  name: string,
  min: number,
  max: number,
  fallback?: number
): Parsed<number> {
  if (raw === null)
    return fallback === undefined ? bad(`${name} is required`) : { ok: true, value: fallback };
  const value = Number(raw);
  return /^-?\d+$/.test(raw) && value >= min && value <= max
    ? { ok: true, value }
    : bad(`${name} must be a whole number from ${min} to ${max}`);
}

function compare(a: LeaderboardRow, b: LeaderboardRow, sort: keyof LeaderboardRow): number {
  const x = a[sort];
  const y = b[sort];
  if (typeof x === 'string' && typeof y === 'string') {
    return x.toLowerCase().localeCompare(y.toLowerCase());
  }
  return Number(x) - Number(y);
}

/** The same sort, filter and page rules as the API, over made-up rows. */
export const playersHandlers = [
  http.get('*/players/leaderboard', ({ request }) => {
    const params = new URL(request.url).searchParams;

    const season = intParam(params.get('season'), 'season', 1996, 2100);
    const limit = intParam(
      params.get('limit'),
      'limit',
      1,
      LEADERBOARD_PAGE_SIZE.max,
      LEADERBOARD_PAGE_SIZE.default
    );
    const offset = intParam(params.get('offset'), 'offset', 0, Number.MAX_SAFE_INTEGER, 0);
    const seasonType = (params.get('seasonType') ?? 'regular') as SeasonType;
    const sort = params.get('sort') ?? 'pts';
    const dir = params.get('dir') ?? 'desc';

    const error =
      (!season.ok && season.error) ||
      (!limit.ok && limit.error) ||
      (!offset.ok && offset.error) ||
      (!SEASON_TYPES.includes(seasonType) && 'seasonType is not valid') ||
      (!isSortColumn(sort) && 'sort is not a column') ||
      (dir !== 'asc' && dir !== 'desc' && 'dir must be asc or desc');
    if (error || !season.ok || !limit.ok || !offset.ok || !isSortColumn(sort)) {
      return HttpResponse.json({ error: error || 'bad request' }, { status: 400 });
    }

    const search = params.get('search')?.toLowerCase();
    const sign = dir === 'asc' ? 1 : -1;
    const matches = makeLeaderboard(season.value, seasonType)
      .filter((row) => !search || row.name.toLowerCase().includes(search))
      .toSorted((a, b) => {
        // Missing values go last, whatever the direction. Ties keep the id order.
        const missingA = a[sort] === null;
        const missingB = b[sort] === null;
        if (missingA !== missingB) return missingA ? 1 : -1;
        return (missingA ? 0 : sign * compare(a, b, sort)) || a.playerId - b.playerId;
      });

    const page: LeaderboardPage = {
      rows: matches.slice(offset.value, offset.value + limit.value),
      total: matches.length,
      limit: limit.value,
      offset: offset.value,
    };
    return HttpResponse.json(page);
  }),
];
