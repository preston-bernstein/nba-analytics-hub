import type { Express, Request, Response } from 'express';
import {
  type GamesServiceClient,
  createGamesServiceClient,
} from '@nba-analytics-hub/data-access';
import type { Game } from '@nba-analytics-hub/types';
import { createRouteHandler } from './shared/routeUtils.js';

interface GamesRouteDeps {
  gamesService?: GamesServiceClient;
  logger?: Pick<Console, 'error'>;
}

function buildGamesService(deps?: GamesRouteDeps): GamesServiceClient {
  if (deps?.gamesService) {
    return deps.gamesService;
  }

  const baseUrl = process.env.GAMES_SERVICE_URL ?? 'http://localhost:4000';
  return createGamesServiceClient({ baseUrl });
}

export function registerGamesRoutes(
  app: Express,
  deps?: GamesRouteDeps,
): void {
  const gamesService = buildGamesService(deps);
  const logger = deps?.logger ?? console;

  const handleListGames = createRouteHandler<Game[]>(
    logger,
    'Failed to fetch games',
    'Unable to fetch games',
  );
  const handleGetGameById = createRouteHandler(
    logger,
    'Failed to fetch game by id',
    'Unable to fetch game',
  );

  app.get('/games', (req: Request, res: Response) =>
    handleListGames(async (requestId) => {
      const date = typeof req.query.date === 'string' ? req.query.date : undefined;
      const tz = typeof req.query.tz === 'string' ? req.query.tz : undefined;
      const { games } = await gamesService.getGames({ date, tz, requestId });
      return games;
    }, req, res),
  );

  app.get('/games/:id', (req: Request, res: Response) =>
    handleGetGameById(
      (requestId) => gamesService.getGameById(req.params.id, { requestId }),
      req,
      res,
    ),
  );
}
