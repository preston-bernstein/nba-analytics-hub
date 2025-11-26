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

  it('renders win probabilities for both teams as percentages', () => {
    render(<PredictionBadge prediction={basePrediction} />);

    expect(screen.getByText(/BOS: 38%/)).toBeInTheDocument();
    expect(screen.getByText(/ATL: 62%/)).toBeInTheDocument();
  });

  it('indicates the favorite based on higher probability', () => {
    render(<PredictionBadge prediction={basePrediction} />);

    expect(screen.getByText(/Favorite: ATL/)).toBeInTheDocument();
  });

  it('shows EVEN when probabilities are equal', () => {
    const evenPrediction: PredictionResponse = {
      ...basePrediction,
      homeWinProbability: 0.5,
      awayWinProbability: 0.5,
    };

    render(<PredictionBadge prediction={evenPrediction} />);

    expect(screen.getByText(/Favorite: EVEN/)).toBeInTheDocument();
  });

  it('renders the model version when provided', () => {
    render(<PredictionBadge prediction={basePrediction} />);

    expect(screen.getByText(/Model: mock-v1/)).toBeInTheDocument();
  });

  it('does not render the model version line when not provided', () => {
    const noModelPrediction: PredictionResponse = {
      ...basePrediction,
      modelVersion: undefined,
    };

    render(<PredictionBadge prediction={noModelPrediction} />);

    expect(screen.queryByText(/Model:/)).toBeNull();
  });
});
