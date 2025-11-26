import type { Express, Request, Response } from 'express';
import type { Game } from '@nba-analytics-hub/types';

export function registerGamesRoutes(app: Express): void {
  app.get('/games/upcoming', async (_req: Request, res: Response) => {
    const games: Game[] = [
      {
        id: 'game-1',
        homeTeamId: 'ATL',
        awayTeamId: 'BOS',
        startTimeUtc: '2025-01-01T00:00:00Z',
      },
      {
        id: 'game-2',
        homeTeamId: 'LAL',
        awayTeamId: 'GSW',
        startTimeUtc: '2025-01-02T02:00:00Z',
      },
    ];

    res.status(200).json(games);
  });
}
