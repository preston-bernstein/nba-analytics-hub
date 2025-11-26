import type { Express, Request, Response } from 'express';
import type { PredictionResponse } from '@nba-analytics-hub/types';

export function registerPredictRoutes(app: Express): void {
  app.get('/predict', async (req: Request, res: Response) => {
    const homeTeam = req.query.home_team as string | undefined;
    const awayTeam = req.query.away_team as string | undefined;
    const gameDate = req.query.game_date as string | undefined;

    if (!homeTeam || !awayTeam || !gameDate) {
      return res.status(400).json({
        error: 'Missing required query params: home_team, away_team, game_date',
      });
    }

    const homeHash = homeTeam.charCodeAt(0) + awayTeam.charCodeAt(0);
    const base = (homeHash % 30) / 100;
    const homeWinProbability = 0.5 + base / 2;
    const awayWinProbability = 1 - homeWinProbability;

    const prediction: PredictionResponse = {
      homeTeamId: homeTeam,
      awayTeamId: awayTeam,
      homeWinProbability,
      awayWinProbability,
      modelVersion: 'mock-v1',
    };

    return res.status(200).json(prediction);
  });
}
