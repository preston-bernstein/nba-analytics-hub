import type { Express, Request, Response } from 'express';
import type { LeaderboardPage } from '@nba-analytics-hub/players';
import {
  type RouteLogger,
  createRouteHandler,
  resolveRequestId,
  sendError,
} from '../platform/routeUtils.js';
import { parseLeaderboardQuery } from './leaderboardQuery.js';
import type { LeaderboardRepo } from './pgLeaderboardRepo.js';

interface PlayersRouteDeps {
  /** Undefined when no database is configured. */
  repo: LeaderboardRepo | undefined;
  logger?: RouteLogger;
}

export function registerPlayersRoutes(app: Express, deps: PlayersRouteDeps): void {
  const { repo } = deps;
  const handleLeaderboard = createRouteHandler<LeaderboardPage>(
    deps.logger ?? console,
    'Failed to fetch leaderboard',
    'Unable to fetch the player leaderboard'
  );

  app.get('/players/leaderboard', (req: Request, res: Response) => {
    if (!repo) {
      const requestId = resolveRequestId(req);
      return sendError(res, { error: 'Player data is not configured', requestId }, 503);
    }
    const query = parseLeaderboardQuery(req);
    if (!query.ok) {
      return sendError(res, { error: query.error, requestId: resolveRequestId(req) }, 400);
    }
    return handleLeaderboard(() => repo.list(query.value), req, res);
  });
}
