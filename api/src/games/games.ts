import type { Express, Request, Response } from 'express';
import { type GamesServiceClient, createGamesServiceClient } from '@nba-analytics-hub/games';
import type { Game } from '@nba-analytics-hub/games';
import {
  type RouteLogger,
  createRouteHandler,
  queryString,
  serviceUrl,
} from '../platform/routeUtils.js';

interface GamesRouteDeps {
  gamesService?: GamesServiceClient;
  logger?: RouteLogger;
}

export function registerGamesRoutes(app: Express, deps?: GamesRouteDeps): void {
  const gamesService =
    deps?.gamesService ??
    createGamesServiceClient({
      baseUrl: serviceUrl('GAMES_SERVICE_URL', 'http://localhost:4000'),
    });
  const logger = deps?.logger ?? console;

  const handleListGames = createRouteHandler<Game[]>(
    logger,
    'Failed to fetch games',
    'Unable to fetch games'
  );
  const handleGetGameById = createRouteHandler<Game>(
    logger,
    'Failed to fetch game by id',
    'Unable to fetch game'
  );

  app.get('/games', (req: Request, res: Response) =>
    handleListGames(
      async (requestId) => {
        const { games } = await gamesService.getGames({
          date: queryString(req, 'date'),
          tz: queryString(req, 'tz'),
          requestId,
        });
        return games;
      },
      req,
      res
    )
  );

  app.get('/games/:id', (req: Request, res: Response) =>
    handleGetGameById(
      (requestId) => gamesService.getGameById(req.params.id, { requestId }),
      req,
      res
    )
  );
}
