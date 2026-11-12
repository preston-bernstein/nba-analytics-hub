import { describe, it, expect } from 'vitest';
import { toPredictionResponse } from './to-prediction-response.js';
import type { PredictorServicePredictResponse } from '../types/predictor-service.js';

const serviceResponse: PredictorServicePredictResponse = {
  home_team: 'ATL',
  away_team: 'BOS',
  as_of: '2025-01-01',
  features: { delta_off: 1, delta_def: 2 },
  prob_home_win: 0.75,
};

describe('toPredictionResponse', () => {
  it('maps team ids and the home win probability', () => {
    const result = toPredictionResponse(serviceResponse);
    expect(result.homeTeamId).toBe('ATL');
    expect(result.awayTeamId).toBe('BOS');
    expect(result.homeWinProbability).toBe(0.75);
  });

  it('sets the away probability to the remainder', () => {
    expect(toPredictionResponse(serviceResponse).awayWinProbability).toBeCloseTo(0.25);
  });

  it('labels the model version', () => {
    expect(toPredictionResponse(serviceResponse).modelVersion).toBe('predictor-service');
  });
});
