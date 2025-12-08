import type { Express, Request, Response } from 'express';
import {
  type GamesServiceClient,
  createGamesServiceClient,
} from '@nba-analytics-hub/data-access';
import { Game } from '@nba-analytics-hub/types';
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

  async function sendGames(
    fetcher: () => Promise<Game[]>,
    res: Response,
    errorMessage: string,
  ) {
    try {
      const games = await fetcher();
      return res.status(200).json(games);
    } catch (err) {
      logger.error(errorMessage, err);
      return res.status(502).json({ error: 'Unable to fetch games' });
    }
  }

  app.get('/games/today', async (_req: Request, res: Response) =>
    sendGames(
      async () => {
        const { games } = await gamesService.getTodayGames();
        return games;
      },
      res,
      'Failed to fetch games for today',
    ),
  );

  app.get('/games/upcoming', async (_req: Request, res: Response) => {
    // Until we have a dedicated upstream endpoint, reuse today's games as a mock.
    return sendGames(
      async () => {
        const { games } = await gamesService.getTodayGames();
        return games.length ? games : mockGames;
      },
      res,
      'Failed to fetch upcoming games',
    );
  });
}
