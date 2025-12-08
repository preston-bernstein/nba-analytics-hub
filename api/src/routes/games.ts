import type { Express, Request, Response } from 'express';
import type { Game } from '@nba-analytics-hub/types';

export function registerGamesRoutes(app: Express): void {
  app.get('/games/upcoming', async (_req: Request, res: Response) => {
    const games: Game[] = [
      {
        id: 'game-1',
        provider: 'mock-provider',
        homeTeam: { id: 'ATL', name: 'Atlanta Hawks', externalId: 14 },
        awayTeam: { id: 'BOS', name: 'Boston Celtics', externalId: 2 },
        startTime: '2025-01-01T00:00:00Z',
        status: 'SCHEDULED',
        score: { home: 0, away: 0 },
        meta: { season: '2024-2025', upstreamGameId: 1111 },
      },
      {
        id: 'game-2',
        provider: 'mock-provider',
        homeTeam: { id: 'LAL', name: 'Los Angeles Lakers', externalId: 13 },
        awayTeam: { id: 'GSW', name: 'Golden State Warriors', externalId: 10 },
        startTime: '2025-01-02T02:00:00Z',
        status: 'SCHEDULED',
        score: { home: 0, away: 0 },
        meta: { season: '2024-2025', upstreamGameId: 2222 },
      },
    ];

    res.status(200).json(games);
  });
}
