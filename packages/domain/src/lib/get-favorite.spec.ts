import type { Game } from '@nba-analytics-hub/types';
import { getFavorite } from './get-favorite';

describe('getFavorite', () => {
  const baseGame: Game = {
    id: 'game-1',
    homeTeamId: 'ATL',
    awayTeamId: 'BOS',
    startTimeUtc: '2025-01-01T00:00:00Z',
  };

  it('returns the home team as the favorite for now', () => {
    const favorite = getFavorite(baseGame);
    expect(favorite).toBe(baseGame.homeTeamId);
  });

  it('is deterministic for the same game input', () => {
    const a = getFavorite(baseGame);
    const b = getFavorite({ ...baseGame });
    expect(a).toBe(b);
  });
});
