import { render, screen } from '@testing-library/react';
import { describe, it } from 'vitest';
import type { Game, PredictionResponse } from '@nba-analytics-hub/types';
import { DashboardContent } from './DashboardContent';

const games: Game[] = [
  {
    id: 'game-1',
    provider: 'mock',
    homeTeam: { id: 'HOME', name: 'Home', externalId: 1 },
    awayTeam: { id: 'AWAY', name: 'Away', externalId: 2 },
    startTime: '2025-01-01T00:00:00Z',
    status: 'SCHEDULED',
    score: { home: 0, away: 0 },
    meta: { season: '2024', upstreamGameId: 1 },
  },
];

const prediction: PredictionResponse = {
  homeTeamId: 'HOME',
  awayTeamId: 'AWAY',
  homeWinProbability: 0.6,
  awayWinProbability: 0.4,
};

describe('DashboardContent', () => {
  it('shows loading state when predictions are loading', () => {
    render(
      <DashboardContent
        games={games}
        predictions={{}}
        loadingPredictions={true}
      />,
    );

    expect(screen.getByText(/Loading predictions/i)).toBeInTheDocument();
    expect(screen.getByText(/Prediction pending/i)).toBeInTheDocument();
  });

  it('renders prediction badges when predictions are available', () => {
    render(
      <DashboardContent
        games={games}
        predictions={{ 'game-1': prediction }}
        loadingPredictions={false}
      />,
    );

    expect(screen.getByLabelText('prediction-badge')).toBeInTheDocument();
  });

  it('hides loading text when predictions are not loading', () => {
    render(
      <DashboardContent
        games={games}
        predictions={{}}
        loadingPredictions={false}
      />,
    );

    expect(screen.queryByText(/Loading predictions/i)).toBeNull();
    expect(screen.getByText(/Prediction pending/i)).toBeInTheDocument();
  });
});
