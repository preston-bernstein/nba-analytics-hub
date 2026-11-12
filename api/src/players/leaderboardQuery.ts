import type { Request } from 'express';
import { SEASON_TYPES, SORT_COLUMNS } from '@nba-analytics-hub/players';
import type { LeaderboardQuery } from '@nba-analytics-hub/players';
import { type Parsed, parseEnum, parseInteger } from '../platform/queryParams.js';
import { queryString } from '../platform/routeUtils.js';

const FIRST_SEASON = 1996;
const LAST_SEASON = 2100;
const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 200;

/** Reads and checks the leaderboard query string. Stops at the first bad param. */
export function parseLeaderboardQuery(req: Request): Parsed<LeaderboardQuery> {
  const param = (name: string) => queryString(req, name);

  const season = parseInteger(param('season'), 'season', { min: FIRST_SEASON, max: LAST_SEASON });
  if (!season.ok) return season;
  const seasonType = parseEnum(param('seasonType'), 'seasonType', SEASON_TYPES, 'regular');
  if (!seasonType.ok) return seasonType;
  const sort = parseEnum(param('sort'), 'sort', SORT_COLUMNS, 'pts');
  if (!sort.ok) return sort;
  const dir = parseEnum(param('dir'), 'dir', ['asc', 'desc'], 'desc');
  if (!dir.ok) return dir;
  const limit = parseInteger(param('limit'), 'limit', {
    min: 1,
    max: MAX_LIMIT,
    fallback: DEFAULT_LIMIT,
  });
  if (!limit.ok) return limit;
  const offset = parseInteger(param('offset'), 'offset', {
    min: 0,
    max: Number.MAX_SAFE_INTEGER,
    fallback: 0,
  });
  if (!offset.ok) return offset;

  return {
    ok: true,
    value: {
      season: season.value,
      seasonType: seasonType.value,
      sort: sort.value,
      dir: dir.value,
      limit: limit.value,
      offset: offset.value,
      search: param('search'),
    },
  };
}
