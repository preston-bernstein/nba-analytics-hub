import type { PredictionResponse } from '../types/prediction.js';
import type { PredictorServicePredictResponse } from '../types/predictor-service.js';

export const mockPredictorServiceResponse: PredictorServicePredictResponse = {
  home_team: 'ATL',
  away_team: 'BOS',
  as_of: '2025-01-01T00:00:00Z',
  features: {
    delta_off: 1.2,
    delta_def: -0.5,
    delta_rest: 0,
  },
  prob_home_win: 0.68,
};

export const mockPredictionResponse: PredictionResponse = {
  homeTeamId: 'ATL',
  awayTeamId: 'BOS',
  homeWinProbability: 0.68,
  awayWinProbability: 0.32,
  modelVersion: 'predictor-service',
};
