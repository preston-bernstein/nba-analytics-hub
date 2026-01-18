import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { Game } from '@nba-analytics-hub/types';
import { GameCard } from './GameCard';

describe('GameCard', () => {
  const baseGame: Game = {
    id: '1',
    provider: 'mock-provider',
    homeTeam: { id: 'ATL', name: 'Atlanta Hawks', externalId: 14 },
    awayTeam: { id: 'LAL', name: 'Los Angeles Lakers', externalId: 13 },
    startTime: '2025-01-15T18:30:00.000Z',
    status: 'SCHEDULED',
    score: { home: 0, away: 0 },
    meta: { season: '2024-2025', upstreamGameId: 1234 },
  };

  it('should render team names', () => {
    render(<GameCard game={baseGame} />);
    expect(screen.getByText('Atlanta Hawks')).toBeInTheDocument();
    expect(screen.getByText('Los Angeles Lakers')).toBeInTheDocument();
  });

  it('should render a formatted date', () => {
    render(<GameCard game={baseGame} />);
    const text = screen.getByText((content) => /\d{1,2}:\d{2}/.test(content));
    expect(text).toBeInTheDocument();
  });

  it('should render Scheduled status badge for SCHEDULED games', () => {
    render(<GameCard game={baseGame} />);
    expect(screen.getByText('Scheduled')).toBeInTheDocument();
  });

  it('should not show scores for SCHEDULED games', () => {
    render(<GameCard game={baseGame} />);
    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });

  it('should render LIVE badge and scores for IN_PROGRESS games', () => {
    const liveGame: Game = {
      ...baseGame,
      status: 'IN_PROGRESS',
      score: { home: 45, away: 52 },
    };
    render(<GameCard game={liveGame} />);
    expect(screen.getByText('LIVE')).toBeInTheDocument();
    expect(screen.getByText('45')).toBeInTheDocument();
    expect(screen.getByText('52')).toBeInTheDocument();
  });

  it('should render Final badge and scores for FINAL games', () => {
    const finalGame: Game = {
      ...baseGame,
      status: 'FINAL',
      score: { home: 98, away: 105 },
    };
    render(<GameCard game={finalGame} />);
    expect(screen.getByText('Final')).toBeInTheDocument();
    expect(screen.getByText('98')).toBeInTheDocument();
    expect(screen.getByText('105')).toBeInTheDocument();
  });

  it('should render Postponed badge for POSTPONED games', () => {
    const postponedGame: Game = { ...baseGame, status: 'POSTPONED' };
    render(<GameCard game={postponedGame} />);
    expect(screen.getByText('Postponed')).toBeInTheDocument();
  });

  it('should render Canceled badge for CANCELED games', () => {
    const canceledGame: Game = { ...baseGame, status: 'CANCELED' };
    render(<GameCard game={canceledGame} />);
    expect(screen.getByText('Canceled')).toBeInTheDocument();
  });

  it('should have game-card aria label', () => {
    render(<GameCard game={baseGame} />);
    expect(screen.getByLabelText('game-card')).toBeInTheDocument();
  });
});
