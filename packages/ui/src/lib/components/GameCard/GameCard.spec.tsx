import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { Game } from '@nba-analytics-hub/types';
import { GameCard } from './GameCard';

describe('GameCard', () => {
  const game: Game = {
    id: '1',
    provider: 'mock-provider',
    homeTeam: { id: 'ATL', name: 'Atlanta Hawks', externalId: 14 },
    awayTeam: { id: 'LAL', name: 'Los Angeles Lakers', externalId: 13 },
    startTime: '2025-01-15T18:30:00.000Z',
    status: 'SCHEDULED',
    score: { home: 0, away: 0 },
    meta: { season: '2024-2025', upstreamGameId: 1234 },
  };

  it('should render matchup text', () => {
    render(<GameCard game={game} />);
    expect(screen.getByText(/LAL @ ATL/)).toBeInTheDocument();
  });

  it('should render a formatted date', () => {
    render(<GameCard game={game} />);

    // Just assert something that looks like a date shows up
    const text = screen.getByText((content) =>
      /\d{1,2}:\d{2}/.test(content),
    );
    expect(text).toBeInTheDocument();
  });
});
