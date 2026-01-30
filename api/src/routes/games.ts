import type { Express, Request, Response } from 'express';
import {
  type GamesServiceClient,
  createGamesServiceClient,
} from '@nba-analytics-hub/data-access';
import type { Game } from '@nba-analytics-hub/types';
import {
  resolveRequestId,
  sendError,
  sendSuccess,
} from './shared/routeUtils.js';

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

  async function sendGames(
    fetcher: (requestId: string) => Promise<Game[]>,
    req: Request,
    res: Response,
    errorMessage: string,
  ) {
    const requestId = resolveRequestId(req);
    try {
      const games = await fetcher(requestId);
      return sendSuccess(res, requestId, games);
    } catch (err) {
      logger.error(errorMessage, err);
      return sendError(res, { error: 'Unable to fetch games', requestId });
    }
  }

  app.get('/games', async (req: Request, res: Response) =>
    sendGames(
      async (requestId) => {
        const date = typeof req.query.date === 'string' ? req.query.date : undefined;
        const tz = typeof req.query.tz === 'string' ? req.query.tz : undefined;
        const { games } = await gamesService.getGames({ date, tz, requestId });
        return games;
      },
      req,
      res,
      'Failed to fetch games',
    ),
  );

  app.get('/games/:id', async (req: Request, res: Response) => {
    const requestId = resolveRequestId(req);
    try {
      const game = await gamesService.getGameById(req.params.id, { requestId });
      return sendSuccess(res, requestId, game);
    } catch (err) {
      logger.error('Failed to fetch game by id', err);
      return sendError(res, { error: 'Unable to fetch game', requestId });
    }
  });
}
