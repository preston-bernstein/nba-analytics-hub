import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { Game, PredictionResponse } from '@nba-analytics-hub/types';
import { GameCard } from './GameCard';

describe('GameCard', () => {
  const baseGame: Game = {
    id: '1',
    provider: 'mock-provider',
    homeTeam: { id: 'ATL', name: 'Atlanta Hawks', externalId: 14 },
    awayTeam: { id: 'LAL', name: 'Los Angeles Lakers', externalId: 13 },
    startTime: '2025-01-15T18:30:00.000Z',
    status: 'Scheduled',
    statusKind: 'SCHEDULED',
    score: { home: 0, away: 0 },
    meta: { season: '2024-2025', upstreamGameId: 1234 },
  };

  it('should render team names', () => {
    render(<GameCard game={baseGame} />);
    expect(screen.getByText('Atlanta Hawks')).toBeInTheDocument();
    expect(screen.getByText('Los Angeles Lakers')).toBeInTheDocument();
  });

  it('should render EST tip time badge for SCHEDULED games', () => {
    render(<GameCard game={baseGame} />);
    expect(screen.getByText('1:30 PM ET')).toBeInTheDocument();
  });

  it('treats empty status text as scheduled', () => {
    const scheduledGame: Game = {
      ...baseGame,
      status: '   ',
      statusKind: 'SCHEDULED',
      score: { home: 0, away: 0 },
    };
    render(<GameCard game={scheduledGame} />);
    expect(screen.getByText('1:30 PM ET')).toBeInTheDocument();
  });

  it('should not show scores for SCHEDULED games', () => {
    render(<GameCard game={baseGame} />);
    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });

  it('should render Live badge and scores for IN_PROGRESS games', () => {
    const liveGame: Game = {
      ...baseGame,
      status: 'In Progress',
      statusKind: 'IN_PROGRESS',
      score: { home: 45, away: 52 },
    };
    render(<GameCard game={liveGame} />);
    expect(screen.getByText('Live')).toBeInTheDocument();
    expect(screen.getByText('45')).toBeInTheDocument();
    expect(screen.getByText('52')).toBeInTheDocument();
  });

  it('should render Final badge and scores for FINAL games (away wins)', () => {
    const finalGame: Game = {
      ...baseGame,
      status: 'Final',
      statusKind: 'FINAL',
      score: { home: 98, away: 105 },
    };
    render(<GameCard game={finalGame} />);
    expect(screen.getByText('FINAL')).toBeInTheDocument();
    expect(screen.getByText('98')).toBeInTheDocument();
    expect(screen.getByText('105')).toBeInTheDocument();
    // Away team wins, so left arrow should be present
    expect(screen.getByText('◀')).toBeInTheDocument();
  });

  it('infers Final when status text indicates final while scheduled', () => {
    const finalGame: Game = {
      ...baseGame,
      status: 'Final',
      statusKind: 'SCHEDULED',
      score: { home: 98, away: 90 },
    };
    render(<GameCard game={finalGame} />);
    expect(screen.getByText('FINAL')).toBeInTheDocument();
    expect(screen.getByText('98')).toBeInTheDocument();
    expect(screen.getByText('90')).toBeInTheDocument();
  });

  it('should render Final badge with right arrow when home wins', () => {
    const finalGame: Game = {
      ...baseGame,
      status: 'Final',
      statusKind: 'FINAL',
      score: { home: 110, away: 98 },
    };
    render(<GameCard game={finalGame} />);
    expect(screen.getByText('FINAL')).toBeInTheDocument();
    // Home team wins, so right arrow should be present
    expect(screen.getByText('▶')).toBeInTheDocument();
  });

  it('should handle single-word team names', () => {
    const singleWordGame: Game = {
      ...baseGame,
      homeTeam: { id: 'HEAT', name: 'Heat', externalId: 15 },
      awayTeam: { id: 'JAZZ', name: 'Jazz', externalId: 16 },
    };
    render(<GameCard game={singleWordGame} />);
    expect(screen.getByText('Heat')).toBeInTheDocument();
    expect(screen.getByText('Jazz')).toBeInTheDocument();
    // Single word should still produce initials (first letter only)
    expect(screen.getByText('H')).toBeInTheDocument();
    expect(screen.getByText('J')).toBeInTheDocument();
  });

  it('should handle empty team names gracefully', () => {
    const emptyNameGame: Game = {
      ...baseGame,
      homeTeam: { id: 'TBD', name: '', externalId: 99 },
      awayTeam: { id: 'TBD2', name: '   ', externalId: 98 },
    };
    render(<GameCard game={emptyNameGame} />);
    // Empty/whitespace names should render without crashing
    expect(screen.getByLabelText('game-card')).toBeInTheDocument();
  });

  it('should render Postponed badge for POSTPONED games', () => {
    const postponedGame: Game = {
      ...baseGame,
      status: 'Postponed',
      statusKind: 'POSTPONED',
    };
    render(<GameCard game={postponedGame} />);
    expect(screen.getByText('Postponed')).toBeInTheDocument();
  });

  it('infers Postponed when status text indicates a delay while scheduled', () => {
    const postponedGame: Game = {
      ...baseGame,
      status: 'Postponed',
      statusKind: 'SCHEDULED',
    };
    render(<GameCard game={postponedGame} />);
    expect(screen.getByText('Postponed')).toBeInTheDocument();
  });

  it('keeps scheduled time when status is an ISO string and scores are zero', () => {
    const scheduledGame: Game = {
      ...baseGame,
      status: '2025-01-15T18:30:00Z',
      statusKind: 'SCHEDULED',
      score: { home: 0, away: 0 },
    };
    render(<GameCard game={scheduledGame} />);
    expect(screen.getByText('1:30 PM ET')).toBeInTheDocument();
  });

  it('infers live when status is an ISO string but scores are present', () => {
    const liveGame: Game = {
      ...baseGame,
      status: '2025-01-15T18:30:00Z',
      statusKind: 'SCHEDULED',
      score: { home: 61, away: 58 },
    };
    render(<GameCard game={liveGame} />);
    expect(screen.getByText('Live')).toBeInTheDocument();
    expect(screen.getByText('61')).toBeInTheDocument();
    expect(screen.getByText('58')).toBeInTheDocument();
  });

  it('infers live when score is present and status text is generic', () => {
    const liveGame: Game = {
      ...baseGame,
      status: 'Warmup',
      statusKind: 'SCHEDULED',
      score: { home: 49, away: 47 },
    };
    render(<GameCard game={liveGame} />);
    expect(screen.getByText('Warmup')).toBeInTheDocument();
    expect(screen.getByText('49')).toBeInTheDocument();
    expect(screen.getByText('47')).toBeInTheDocument();
  });

  it('shows live scores when statusKind is scheduled but status indicates live play', () => {
    const liveGame: Game = {
      ...baseGame,
      status: 'Q2 05:12',
      statusKind: 'SCHEDULED',
      score: { home: 55, away: 52 },
    };
    render(<GameCard game={liveGame} />);
    expect(screen.getByText('Q2 05:12')).toBeInTheDocument();
    expect(screen.getByText('55')).toBeInTheDocument();
    expect(screen.getByText('52')).toBeInTheDocument();
  });

  it('should render Canceled badge for CANCELED games', () => {
    const canceledGame: Game = {
      ...baseGame,
      status: 'Canceled',
      statusKind: 'CANCELED',
    };
    render(<GameCard game={canceledGame} />);
    expect(screen.getByText('Canceled')).toBeInTheDocument();
  });

  it('infers Canceled when status text indicates cancellation while scheduled', () => {
    const canceledGame: Game = {
      ...baseGame,
      status: 'Canceled',
      statusKind: 'SCHEDULED',
    };
    render(<GameCard game={canceledGame} />);
    expect(screen.getByText('Canceled')).toBeInTheDocument();
  });

  it('shows the raw status label when in-progress is more specific', () => {
    const halftimeGame: Game = {
      ...baseGame,
      status: 'Halftime',
      statusKind: 'IN_PROGRESS',
      score: { home: 55, away: 55 },
    };
    render(<GameCard game={halftimeGame} />);
    expect(screen.getByText('Halftime')).toBeInTheDocument();
  });

  it('should render prediction row and percentages when provided', () => {
    const prediction: PredictionResponse = {
      homeTeamId: 'ATL',
      awayTeamId: 'LAL',
      homeWinProbability: 0.62,
      awayWinProbability: 0.38,
      modelVersion: 'mock-v1',
    };

    render(<GameCard game={baseGame} prediction={prediction} />);

    expect(screen.getByText('Prediction')).toBeInTheDocument();
    expect(screen.getByText('ATL')).toBeInTheDocument();
    expect(screen.getByText('62%')).toBeInTheDocument();
    expect(screen.getByText('38%')).toBeInTheDocument();
  });

  it('should have game-card aria label', () => {
    render(<GameCard game={baseGame} />);
    expect(screen.getByLabelText('game-card')).toBeInTheDocument();
  });
});
