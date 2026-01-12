import { describe, it, expect } from 'vitest';
import { getPredictionDisplay } from './get-prediction-display.js';
import type { PredictionResponse } from '@nba-analytics-hub/types';

const basePrediction: PredictionResponse = {
  homeTeamId: 'HOME',
  awayTeamId: 'AWAY',
  homeWinProbability: 0.5,
  awayWinProbability: 0.5,
  homeScore: 100,
  awayScore: 98,
};

describe('getPredictionDisplay', () => {
  it('returns even when probabilities are equal after rounding', () => {
    const result = getPredictionDisplay(basePrediction);
    expect(result).toEqual({
      homePct: 50,
      awayPct: 50,
      favoriteLabel: 'EVEN',
      isHomeFavored: false,
    });
  });

  it('labels the home team as favorite when home probability is higher', () => {
    const result = getPredictionDisplay({
      ...basePrediction,
      homeWinProbability: 0.73,
      awayWinProbability: 0.27,
    });

    expect(result).toEqual({
      homePct: 73,
      awayPct: 27,
      favoriteLabel: 'HOME',
      isHomeFavored: true,
    });
  });

  it('labels the away team as favorite when away probability is higher', () => {
    const result = getPredictionDisplay({
      ...basePrediction,
      homeWinProbability: 0.31,
      awayWinProbability: 0.69,
    });

    expect(result).toEqual({
      homePct: 31,
      awayPct: 69,
      favoriteLabel: 'AWAY',
      isHomeFavored: false,
    });
  });
});
