import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import type { PredictionResponse } from '@nba-analytics-hub/types';
import { PredictionBadge } from './PredictionBadge';

describe('PredictionBadge', () => {
  const basePrediction: PredictionResponse = {
    homeTeamId: 'ATL',
    awayTeamId: 'BOS',
    homeWinProbability: 0.62,
    awayWinProbability: 0.38,
    modelVersion: 'mock-v1',
  };

  it('renders the prediction label and favorite', () => {
    render(<PredictionBadge prediction={basePrediction} />);

    expect(screen.getByText('Prediction')).toBeInTheDocument();
    expect(screen.getByText('ATL')).toBeInTheDocument();
  });

  it('renders percentages for both teams', () => {
    render(<PredictionBadge prediction={basePrediction} />);

    expect(screen.getByText('62%')).toBeInTheDocument();
    expect(screen.getByText('38%')).toBeInTheDocument();
  });

  it('shows EVEN when probabilities are equal', () => {
    const evenPrediction: PredictionResponse = {
      ...basePrediction,
      homeWinProbability: 0.5,
      awayWinProbability: 0.5,
    };

    render(<PredictionBadge prediction={evenPrediction} />);

    expect(screen.getByText('EVEN')).toBeInTheDocument();
  });
});
