import type { PredictionResponse } from '../types/prediction.js';
import type { PredictorServicePredictResponse } from '../types/predictor-service.js';

export const predictorResponse: PredictorServicePredictResponse = {
  home_team: 'NYK',
  away_team: 'BOS',
  as_of: '2025-02-01',
  features: {
    delta_off: 1.2,
    delta_def: -0.3,
    delta_rest: 0.5,
    delta_elo: 15.7,
  },
  prob_home_win: 0.63,
};

export const mockPredictionResponse: PredictionResponse = {
  homeTeamId: 'ATL',
  awayTeamId: 'BOS',
  homeWinProbability: 0.72,
  awayWinProbability: 0.28,
  modelVersion: 'v1-test',
};
