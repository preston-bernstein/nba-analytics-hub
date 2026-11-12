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
  type LeaderboardRepo,
  type LeaderboardRow,
  type SeasonType,
} from './leaderboardRepo.js';

interface PlayersRouteDeps {
  /** Undefined when no database is configured. */
  repo: LeaderboardRepo | undefined;
  logger?: RouteLogger;
}

const FIRST_SEASON = 1996;
const LAST_SEASON = 2100;

export function registerPlayersRoutes(app: Express, deps: PlayersRouteDeps): void {
  const { repo } = deps;
  const logger = deps.logger ?? console;
  const handle = createRouteHandler<LeaderboardRow[]>(
    logger,
    'Failed to fetch leaderboard',
    'Unable to fetch the player leaderboard'
  );

  app.get('/players/leaderboard', (req: Request, res: Response) => {
    const requestId = resolveRequestId(req);
    if (!repo) {
      return sendError(res, { error: 'Player data is not configured', requestId }, 503);
    }
    const season = Number(queryString(req, 'season'));
    const seasonType = (queryString(req, 'seasonType') ?? 'regular') as SeasonType;
    if (!Number.isInteger(season) || season < FIRST_SEASON || season > LAST_SEASON) {
      return sendError(res, { error: 'season must be a year from 1996', requestId }, 400);
    }
    if (!SEASON_TYPES.includes(seasonType)) {
      return sendError(res, { error: 'seasonType is not valid', requestId }, 400);
    }
    return handle(() => repo.list(season, seasonType), req, res);
  });
}
