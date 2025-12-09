import { mockGames } from '@nba-analytics-hub/testing';
import { getFavorite } from './get-favorite.js';

describe('getFavorite', () => {
  const baseGame = mockGames[0] ?? (() => {
    throw new Error('mockGames fixture is missing');
  })();

  it('returns the home team as the favorite for now', () => {
    const favorite = getFavorite(baseGame);
    expect(favorite).toBe(baseGame.homeTeam.id);
  });

  it('is deterministic for the same game input', () => {
    const a = getFavorite(baseGame);
    const b = getFavorite({ ...baseGame });
    expect(a).toBe(b);
  });
});
