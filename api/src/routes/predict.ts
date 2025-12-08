import type { Express, Request, Response } from 'express';
import type { PredictionResponse } from '@nba-analytics-hub/types';
import {
  type PredictorServiceClient,
  createPredictorServiceClient,
} from '@nba-analytics-hub/data-access';

interface PredictRouteDeps {
  predictorService?: PredictorServiceClient;
  logger?: Pick<Console, 'error'>;
}

function buildPredictorService(deps?: PredictRouteDeps): PredictorServiceClient {
  if (deps?.predictorService) {
    return deps.predictorService;
  }
  const baseUrl = process.env.PREDICTOR_SERVICE_URL ?? 'http://localhost:5000';
  return createPredictorServiceClient({ baseUrl });
}

export function registerPredictRoutes(
  app: Express,
  deps?: PredictRouteDeps,
): void {
  const predictorService = buildPredictorService(deps);
  const logger = deps?.logger ?? console;

  app.get('/predict', async (req: Request, res: Response) => {
    const homeTeam = req.query.home_team as string | undefined;
    const awayTeam = req.query.away_team as string | undefined;
    const gameDate = req.query.game_date as string | undefined;

    if (!homeTeam || !awayTeam || !gameDate) {
      return res.status(400).json({
        error: 'Missing required query params: home_team, away_team, game_date',
      });
    }

    try {
      const serviceResp = await predictorService.predict({
        home: homeTeam,
        away: awayTeam,
        date: gameDate,
      });

      const prediction: PredictionResponse = {
        homeTeamId: serviceResp.home_team,
        awayTeamId: serviceResp.away_team,
        homeWinProbability: serviceResp.prob_home_win,
        awayWinProbability: 1 - serviceResp.prob_home_win,
        modelVersion: 'predictor-service',
      };

      return res.status(200).json(prediction);
    } catch (err) {
      logger.error('Failed to fetch prediction', err);
      return res.status(502).json({ error: 'Unable to fetch prediction' });
    }
  });
}
