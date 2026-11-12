import type { Express, Request, Response } from 'express';
import {
  type RouteLogger,
  createRouteHandler,
  queryString,
  resolveRequestId,
  sendError,
} from '../platform/routeUtils.js';
import {
  SEASON_TYPES,
  SORT_COLUMNS,
  type LeaderboardPage,
  type LeaderboardRepo,
  type SeasonType,
  type SortColumn,
  type SortDir,
} from './leaderboardRepo.js';

interface PlayersRouteDeps {
  /** Undefined when no database is configured. */
  repo: LeaderboardRepo | undefined;
  logger?: RouteLogger;
}

const FIRST_SEASON = 1996;
const LAST_SEASON = 2100;
const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 200;

/** Reads an integer query param. Returns the fallback when absent, NaN when not an integer. */
function intParam(req: Request, name: string, fallback: number): number {
  const raw = queryString(req, name);
  if (raw === undefined) return fallback;
  return /^-?\d+$/.test(raw) ? Number(raw) : Number.NaN;
}

export function registerPlayersRoutes(app: Express, deps: PlayersRouteDeps): void {
  const { repo } = deps;
  const logger = deps.logger ?? console;
  const handle = createRouteHandler<LeaderboardPage & { limit: number; offset: number }>(
    logger,
    'Failed to fetch leaderboard',
    'Unable to fetch the player leaderboard'
  );

  app.get('/players/leaderboard', (req: Request, res: Response) => {
    const requestId = resolveRequestId(req);
    const bad = (error: string) => sendError(res, { error, requestId }, 400);
    if (!repo) {
      return sendError(res, { error: 'Player data is not configured', requestId }, 503);
    }
    const season = Number(queryString(req, 'season'));
    const seasonType = (queryString(req, 'seasonType') ?? 'regular') as SeasonType;
    const sort = (queryString(req, 'sort') ?? 'pts') as SortColumn;
    const dir = (queryString(req, 'dir') ?? 'desc') as SortDir;
    const limit = intParam(req, 'limit', DEFAULT_LIMIT);
    const offset = intParam(req, 'offset', 0);

    if (!Number.isInteger(season) || season < FIRST_SEASON || season > LAST_SEASON) {
      return bad('season must be a year from 1996');
    }
    if (!SEASON_TYPES.includes(seasonType)) return bad('seasonType is not valid');
    if (!SORT_COLUMNS.includes(sort)) return bad('sort is not a column');
    if (dir !== 'asc' && dir !== 'desc') return bad('dir must be asc or desc');
    if (!Number.isInteger(limit) || limit < 1 || limit > MAX_LIMIT) {
      return bad(`limit must be from 1 to ${MAX_LIMIT}`);
    }
    if (!Number.isInteger(offset) || offset < 0) return bad('offset must be 0 or more');

    const query = {
      season,
      seasonType,
      sort,
      dir,
      limit,
      offset,
      search: queryString(req, 'search'),
    };
    return handle(async () => ({ ...(await repo.list(query)), limit, offset }), req, res);
  });
}
