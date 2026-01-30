import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import type { Game, PredictionResponse } from '@nba-analytics-hub/types';
import { DashboardContent } from './DashboardContent';

const game: Game = {
  id: 'game-1',
  provider: 'mock-provider',
  homeTeam: { id: 'ATL', name: 'Atlanta Hawks', externalId: 14 },
  awayTeam: { id: 'BOS', name: 'Boston Celtics', externalId: 2 },
  startTime: '2025-01-15T18:30:00.000Z',
  status: 'SCHEDULED',
  score: { home: 0, away: 0 },
  meta: { season: '2024-2025', upstreamGameId: 1234 },
};

const prediction: PredictionResponse = {
  homeTeamId: 'ATL',
  awayTeamId: 'BOS',
  homeWinProbability: 0.62,
  awayWinProbability: 0.38,
  modelVersion: 'mock-v1',
};

describe('DashboardContent', () => {
  const defaultProps = {
    games: [game],
    predictions: {},
    loadingPredictions: false,
    predictionError: null,
  };

  it('renders game cards', () => {
    render(<DashboardContent {...defaultProps} />);
    expect(screen.getByLabelText('game-card')).toBeInTheDocument();
  });

  it('renders prediction winner inside game card when available', () => {
    render(
      <DashboardContent
        {...defaultProps}
        predictions={{ [game.id]: prediction }}
      />,
    );

    expect(screen.getByText('Prediction')).toBeInTheDocument();
    expect(screen.getByText('ATL')).toBeInTheDocument();
  });

  it('shows loading prediction message when predictions are loading', () => {
    render(<DashboardContent {...defaultProps} loadingPredictions={true} />);
    expect(screen.getByText('Loading prediction...')).toBeInTheDocument();
  });

  it('shows no prediction message when not loading and no prediction', () => {
    render(<DashboardContent {...defaultProps} />);
    expect(screen.getByText(/No prediction available/i)).toBeInTheDocument();
  });

  it('shows prediction unavailable when there is a prediction error', () => {
    render(
      <DashboardContent
        {...defaultProps}
        predictionError="Service unavailable"
      />,
    );

    expect(screen.getByText(/Predictions unavailable:/i)).toBeInTheDocument();
    expect(screen.getByText('Prediction unavailable')).toBeInTheDocument();
  });
});
