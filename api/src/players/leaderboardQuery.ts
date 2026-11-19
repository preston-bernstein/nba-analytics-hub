import type { Request } from 'express';
import {
  FIRST_SEASON,
  LEADERBOARD_PAGE_SIZE,
  SEASON_TYPES,
  SORT_COLUMNS,
} from '@nba-analytics-hub/players';
import type { LeaderboardQuery } from '@nba-analytics-hub/players';
import { type Parsed, parseEnum, parseInteger } from '../platform/queryParams.js';
import { queryString } from '../platform/routeHandling.js';

const LAST_SEASON = 2100;

type Param = (name: string) => string | undefined;
type Season = Pick<LeaderboardQuery, 'season' | 'seasonType'>;
type Order = Pick<LeaderboardQuery, 'sort' | 'dir'>;
type Page = Pick<LeaderboardQuery, 'limit' | 'offset'>;

function parseSeason(param: Param): Parsed<Season> {
  const season = parseInteger(param('season'), 'season', { min: FIRST_SEASON, max: LAST_SEASON });
  if (!season.ok) return season;
  const seasonType = parseEnum(param('seasonType'), 'seasonType', SEASON_TYPES, 'regular');
  if (!seasonType.ok) return seasonType;
  return { ok: true, value: { season: season.value, seasonType: seasonType.value } };
}

function parseOrder(param: Param): Parsed<Order> {
  const sort = parseEnum(param('sort'), 'sort', SORT_COLUMNS, 'pts');
  if (!sort.ok) return sort;
  const dir = parseEnum(param('dir'), 'dir', ['asc', 'desc'], 'desc');
  if (!dir.ok) return dir;
  return { ok: true, value: { sort: sort.value, dir: dir.value } };
}

function parsePage(param: Param): Parsed<Page> {
  const limit = parseInteger(param('limit'), 'limit', {
    min: 1,
    max: LEADERBOARD_PAGE_SIZE.max,
    fallback: LEADERBOARD_PAGE_SIZE.default,
  });
  if (!limit.ok) return limit;
  const offset = parseInteger(param('offset'), 'offset', {
    min: 0,
    max: Number.MAX_SAFE_INTEGER,
    fallback: 0,
  });
  if (!offset.ok) return offset;
  return { ok: true, value: { limit: limit.value, offset: offset.value } };
}

/** Reads and checks the leaderboard query string. Stops at the first bad param. */
export function parseLeaderboardQuery(req: Request): Parsed<LeaderboardQuery> {
  const param: Param = (name) => queryString(req, name);
  const season = parseSeason(param);
  if (!season.ok) return season;
  const order = parseOrder(param);
  if (!order.ok) return order;
  const page = parsePage(param);
  if (!page.ok) return page;
  return {
    ok: true,
    value: { ...season.value, ...order.value, ...page.value, search: param('search') },
  };
}
