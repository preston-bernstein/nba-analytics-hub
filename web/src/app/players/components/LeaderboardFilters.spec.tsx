import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SEASON_TYPES, SEASON_TYPE_LABELS } from '@nba-analytics-hub/players';
import { LeaderboardFilters } from './LeaderboardFilters';

function setup() {
  const handlers = {
    onSeasonChange: vi.fn(),
    onSeasonTypeChange: vi.fn(),
    onSearchChange: vi.fn(),
  };
  render(
    <LeaderboardFilters
      season={2024}
      seasonType="regular"
      search=""
      seasons={[2025, 2024]}
      {...handlers}
    />
  );
  return handlers;
}

describe('LeaderboardFilters', () => {
  it('shows the current values', () => {
    setup();
    expect(screen.getByLabelText('Season')).toHaveValue('2024');
    expect(screen.getByLabelText('Season type')).toHaveValue('regular');
    expect(screen.getByLabelText('Search players')).toHaveValue('');
  });

  it('labels each season like 2024-25 and each type from the shared labels', () => {
    setup();
    expect(screen.getByRole('option', { name: '2025-26' })).toBeInTheDocument();
    for (const type of SEASON_TYPES) {
      expect(screen.getByRole('option', { name: SEASON_TYPE_LABELS[type] })).toBeInTheDocument();
    }
  });

  it('reports each change as a typed value', () => {
    const h = setup();
    fireEvent.change(screen.getByLabelText('Season'), { target: { value: '2025' } });
    fireEvent.change(screen.getByLabelText('Season type'), { target: { value: 'playoffs' } });
    fireEvent.change(screen.getByLabelText('Search players'), { target: { value: 'ann' } });
    expect(h.onSeasonChange).toHaveBeenCalledWith(2025);
    expect(h.onSeasonTypeChange).toHaveBeenCalledWith('playoffs');
    expect(h.onSearchChange).toHaveBeenCalledWith('ann');
  });
});
