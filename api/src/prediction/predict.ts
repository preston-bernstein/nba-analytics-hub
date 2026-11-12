import type { Express, Request, Response } from 'express';
import {
  type PredictionResponse,
  type PredictorServiceClient,
  createPredictorServiceClient,
  toPredictionResponse,
} from '@nba-analytics-hub/prediction';
import {
  type RouteLogger,
  createRouteHandler,
  queryString,
  serviceUrl,
} from '../platform/routeUtils.js';

interface PredictRouteDeps {
  predictorService?: PredictorServiceClient;
  logger?: RouteLogger;
}

export function registerPredictRoutes(app: Express, deps?: PredictRouteDeps): void {
  const predictorService =
    deps?.predictorService ??
    createPredictorServiceClient({
      baseUrl: serviceUrl('PREDICTOR_SERVICE_URL', 'http://localhost:5000'),
    });

  const handlePredict = createRouteHandler<PredictionResponse>(
    deps?.logger ?? console,
    'Failed to fetch prediction',
    'Unable to fetch prediction'
  );

  app.get('/predict', (req: Request, res: Response) => {
    const home = queryString(req, 'home_team');
    const away = queryString(req, 'away_team');
    const date = queryString(req, 'game_date');

    if (!home || !away || !date) {
      return res.status(400).json({
        error: 'Missing required query params: home_team, away_team, game_date',
      });
    }

    return handlePredict(
      async () => toPredictionResponse(await predictorService.predict({ home, away, date })),
      req,
      res
    );
  });
}
