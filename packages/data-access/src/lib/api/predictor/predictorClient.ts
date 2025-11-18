import type { PredictionRequest, PredictionResponse } from '@nba-analytics-hub/types';

export interface PredictorClientOptions {
  baseUrl: string;
}

export interface PredictorClient {
  predict(req: PredictionRequest): Promise<PredictionResponse>;
}

export function createPredictorClient(options: PredictorClientOptions): PredictorClient {
  const { baseUrl } = options;

  return {
    async predict(req: PredictionRequest): Promise<PredictionResponse> {
      const url = new URL('/predict', baseUrl);
      url.searchParams.set('home_team', req.homeTeamId);
      url.searchParams.set('away_team', req.awayTeamId);
      url.searchParams.set('game_date', req.gameDate);

      const res = await fetch(url.toString());
      if (!res.ok) {
        throw new Error(`Predictor request failed with status ${res.status}`);
      }

      const data = (await res.json()) as PredictionResponse;
      return data;
    },
  };
}
