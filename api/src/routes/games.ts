import { randomUUID } from 'crypto';
import type { Express, Request, Response } from 'express';
import {
  type GamesServiceClient,
  createGamesServiceClient,
} from '@nba-analytics-hub/data-access';
import { type ErrorResponse, Game } from '@nba-analytics-hub/types';
import { mockGames } from '@nba-analytics-hub/testing';

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

  const resolveRequestId = (req: Request): string =>
    req.header('x-request-id') ?? randomUUID();

  const sendError = (res: Response, payload: ErrorResponse, status = 502) => {
    res.setHeader('X-Request-ID', payload.requestId ?? '');
    return res.status(status).json(payload);
  };

  async function sendGames(
    fetcher: (requestId: string) => Promise<Game[]>,
    req: Request,
    res: Response,
    errorMessage: string,
  ) {
    const requestId = resolveRequestId(req);
    try {
      const games = await fetcher(requestId);
      res.setHeader('X-Request-ID', requestId);
      return res.status(200).json(games);
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

  app.get('/games/today', async (req: Request, res: Response) =>
    sendGames(
      async (requestId) => {
        const { games } = await gamesService.getTodayGames({ requestId });
        return games;
      },
      req,
      res,
      'Failed to fetch games for today',
    ),
  );

  app.get('/games/upcoming', async (req: Request, res: Response) => {
    // Until we have a dedicated upstream endpoint, reuse today's games as a mock.
    return sendGames(
      async (requestId) => {
        const { games } = await gamesService.getGames({ requestId });
        return games.length ? games : mockGames;
      },
      req,
      res,
      'Failed to fetch upcoming games',
    );
  });

  app.get('/games/:id', async (req: Request, res: Response) => {
    const requestId = resolveRequestId(req);
    try {
      const game = await gamesService.getGameById(req.params.id, { requestId });
      res.setHeader('X-Request-ID', requestId);
      return res.status(200).json(game);
    } catch (err) {
      logger.error('Failed to fetch game by id', err);
      return sendError(res, { error: 'Unable to fetch game', requestId });
    }
  });
}
