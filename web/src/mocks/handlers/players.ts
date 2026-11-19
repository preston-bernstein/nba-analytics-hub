import { http, HttpResponse } from 'msw';
import { LEADERBOARD_PAGE_SIZE, SEASON_TYPES, isSortColumn } from '@nba-analytics-hub/players';
import type { LeaderboardPage, LeaderboardRow, SeasonType } from '@nba-analytics-hub/players';
import { makeLeaderboard } from '../data/leaderboard';

type Parsed<T> = { ok: true; value: T } | { ok: false; error: string };

const badRequest = (error: string) => HttpResponse.json({ error }, { status: 400 });

const bad = (error: string): Parsed<never> => ({ ok: false, error });

interface IntRange {
  min: number;
  max: number;
  fallback?: number;
}

function intParam(raw: string | null, name: string, range: IntRange): Parsed<number> {
  const { min, max, fallback } = range;
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

interface Query {
  season: number;
  seasonType: SeasonType;
  sort: keyof LeaderboardRow;
  dir: 'asc' | 'desc';
  limit: number;
  offset: number;
  search: string | undefined;
}

type Paging = Pick<Query, 'limit' | 'offset'>;

function parsePaging(params: URLSearchParams): Parsed<Paging> {
  const limit = intParam(params.get('limit'), 'limit', {
    min: 1,
    max: LEADERBOARD_PAGE_SIZE.max,
    fallback: LEADERBOARD_PAGE_SIZE.default,
  });
  const offset = intParam(params.get('offset'), 'offset', {
    min: 0,
    max: Number.MAX_SAFE_INTEGER,
    fallback: 0,
  });
  if (!limit.ok) return limit;
  if (!offset.ok) return offset;
  return { ok: true, value: { limit: limit.value, offset: offset.value } };
}

/** Reads the query string with the same checks, in the same order, as the API. */
function parseQuery(params: URLSearchParams): Parsed<Query> {
  const season = intParam(params.get('season'), 'season', { min: 1996, max: 2100 });
  const paging = parsePaging(params);
  const seasonType = (params.get('seasonType') ?? 'regular') as SeasonType;
  const sort = params.get('sort') ?? 'pts';
  const dir = params.get('dir') ?? 'desc';

  if (!season.ok) return season;
  if (!paging.ok) return paging;
  if (!SEASON_TYPES.includes(seasonType)) return bad('seasonType is not valid');
  if (!isSortColumn(sort)) return bad('sort is not a column');
  if (dir !== 'asc' && dir !== 'desc') return bad('dir must be asc or desc');

  return {
    ok: true,
    value: {
      season: season.value,
      seasonType,
      sort,
      dir,
      ...paging.value,
      search: params.get('search')?.toLowerCase(),
    },
  };
}

function matchingRows(query: Query): LeaderboardRow[] {
  const { season, seasonType, sort, dir, search } = query;
  const sign = dir === 'asc' ? 1 : -1;
  return makeLeaderboard(season, seasonType)
    .filter((row) => !search || row.name.toLowerCase().includes(search))
    .toSorted((a, b) => {
      // Missing values go last, whatever the direction. Ties keep the id order.
      const missingA = a[sort] === null;
      const missingB = b[sort] === null;
      if (missingA !== missingB) return missingA ? 1 : -1;
      return (missingA ? 0 : sign * compare(a, b, sort)) || a.playerId - b.playerId;
    });
}

/** The same sort, filter and page rules as the API, over made-up rows. */
export const playersHandlers = [
  http.get('*/players/leaderboard', ({ request }) => {
    const query = parseQuery(new URL(request.url).searchParams);
    if (!query.ok) return badRequest(query.error);

    const { limit, offset } = query.value;
    const matches = matchingRows(query.value);
    const page: LeaderboardPage = {
      rows: matches.slice(offset, offset + limit),
      total: matches.length,
      limit,
      offset,
    };
    return HttpResponse.json(page);
  }),
];
