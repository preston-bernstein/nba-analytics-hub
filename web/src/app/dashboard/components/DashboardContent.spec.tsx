import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import type { Game, PredictionResponse } from '@nba-analytics-hub/types';
import { DashboardContent } from './DashboardContent';

const games: Game[] = [
  {
    id: 'game-1',
    provider: 'mock',
    homeTeam: { id: 'HOME', name: 'Home Team', externalId: 1 },
    awayTeam: { id: 'AWAY', name: 'Away Team', externalId: 2 },
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

const defaultProps = {
  games,
  predictions: {},
  loadingPredictions: false,
  selectedDate: '2025-01-15',
  onPreviousDay: vi.fn(),
  onNextDay: vi.fn(),
  onToday: vi.fn(),
};

describe('DashboardContent', () => {
  it('shows loading state when predictions are loading', () => {
    render(
      <DashboardContent
        {...defaultProps}
        loadingPredictions={true}
      />,
    );

    expect(screen.getByText('Loading predictions...')).toBeInTheDocument();
    expect(screen.getByText('Loading prediction...')).toBeInTheDocument();
  });

  it('renders prediction badges when predictions are available', () => {
    render(
      <DashboardContent
        {...defaultProps}
        predictions={{ 'game-1': prediction }}
      />,
    );

    expect(screen.getByLabelText('prediction-badge')).toBeInTheDocument();
  });

  it('shows no prediction message when not loading and no prediction', () => {
    render(<DashboardContent {...defaultProps} />);

    expect(screen.queryByText(/Loading predictions/i)).toBeNull();
    expect(screen.getByText(/No prediction available/i)).toBeInTheDocument();
  });

  it('renders game count in header', () => {
    render(<DashboardContent {...defaultProps} />);

    expect(screen.getByText(/1 game scheduled/i)).toBeInTheDocument();
  });

  it('renders games-dashboard section', () => {
    render(<DashboardContent {...defaultProps} />);

    expect(screen.getByLabelText('games-dashboard')).toBeInTheDocument();
  });

  it('renders date navigation buttons', () => {
    render(<DashboardContent {...defaultProps} />);

    expect(screen.getByLabelText('Previous day')).toBeInTheDocument();
    expect(screen.getByLabelText('Next day')).toBeInTheDocument();
  });

  it('calls navigation handlers when buttons clicked', () => {
    const onPreviousDay = vi.fn();
    const onNextDay = vi.fn();

    render(
      <DashboardContent
        {...defaultProps}
        onPreviousDay={onPreviousDay}
        onNextDay={onNextDay}
      />,
    );

    fireEvent.click(screen.getByLabelText('Previous day'));
    expect(onPreviousDay).toHaveBeenCalled();

    fireEvent.click(screen.getByLabelText('Next day'));
    expect(onNextDay).toHaveBeenCalled();
  });
});
