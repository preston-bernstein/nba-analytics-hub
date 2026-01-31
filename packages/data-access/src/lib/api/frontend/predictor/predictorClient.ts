import type { PredictionRequest, PredictionResponse } from '@nba-analytics-hub/types';
import { fetchJson } from '../http.js';

export interface PredictorClientOptions {
  baseUrl: string;
  basePath?: string;
}

export interface PredictorClient {
  predict(req: PredictionRequest): Promise<PredictionResponse>;
}

export function createPredictorClient(options: PredictorClientOptions): PredictorClient {
  const { baseUrl, basePath } = options;
  const normalizedBasePath = normalizeBasePath(basePath);
  const predictPath = `${normalizedBasePath}/predict`;

  return {
    async predict(req: PredictionRequest): Promise<PredictionResponse> {
      const url = new URL(predictPath, baseUrl);
      url.searchParams.set('home_team', req.homeTeamId);
      url.searchParams.set('away_team', req.awayTeamId);
      url.searchParams.set('game_date', req.gameDate);

      return fetchJson<PredictionResponse>(baseUrl, url, 'Predictor');
    },
  };
}

function normalizeBasePath(basePath?: string): string {
  if (!basePath) return '';

  const trimmed = basePath.trim();
  if (!trimmed) return '';

  const withLeadingSlash = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return withLeadingSlash.endsWith('/')
    ? withLeadingSlash.slice(0, -1)
    : withLeadingSlash;
}
