import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { Game } from '@nba-analytics-hub/games';
import { AppShell } from './AppShell';
import { DateNavigation } from './DateNavigation';
import { GameCard } from './GameCard';
import { PredictionBadge } from './PredictionBadge';

// The shared components are built on shadcn/ui primitives.
// shadcn components mark their root with a data-slot attribute.
const game: Game = {
  id: '1',
  provider: 'mock-provider',
  homeTeam: { id: 'ATL', name: 'Atlanta Hawks' },
  awayTeam: { id: 'LAL', name: 'Los Angeles Lakers' },
  startTime: '2025-01-15T18:30:00.000Z',
  status: 'Q3 5:12',
  statusKind: 'IN_PROGRESS',
  score: { home: 70, away: 65 },
  meta: { season: '2024-2025', upstreamGameId: 1234 },
};

describe('shadcn/ui adoption', () => {
  it('DateNavigation uses the shadcn Button', () => {
    render(
      <DateNavigation
        displayDate="Today"
        showTodayButton
        onPreviousDay={vi.fn()}
        onNextDay={vi.fn()}
        onToday={vi.fn()}
      />
    );
    for (const button of screen.getAllByRole('button')) {
      expect(button).toHaveAttribute('data-slot', 'button');
    }
  });

  it('GameCard uses the shadcn Card and Badge', () => {
    render(<GameCard game={game} />);
    const card = screen.getByLabelText('game-card');
    expect(card).toHaveAttribute('data-slot', 'card');
    expect(screen.getByText('Q3 5:12')).toHaveAttribute('data-slot', 'badge');
  });

  it('PredictionBadge uses the shadcn Card and Progress', () => {
    render(
      <PredictionBadge
        prediction={{
          homeTeamId: 'ATL',
          awayTeamId: 'LAL',
          homeWinProbability: 0.6,
          awayWinProbability: 0.4,
        }}
      />
    );
    expect(screen.getByLabelText('prediction-badge')).toHaveAttribute('data-slot', 'card');
    expect(screen.getByRole('progressbar')).toHaveAttribute('data-slot', 'progress');
  });

  it('AppShell is styled with Tailwind, not a CSS module', () => {
    render(<AppShell title="Hub">body</AppShell>);
    const title = screen.getByTestId('app-title');
    expect(title.className).toMatch(/\buppercase\b/);
  });
});
