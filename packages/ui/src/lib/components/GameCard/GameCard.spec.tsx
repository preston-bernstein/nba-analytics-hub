import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { Game } from '@nba-analytics-hub/types';
import { GameCard } from './GameCard';

describe('GameCard', () => {
  const game: Game = {
    id: '1',
    homeTeamId: 'ATL',
    awayTeamId: 'LAL',
    startTimeUtc: '2025-01-15T18:30:00.000Z',
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
