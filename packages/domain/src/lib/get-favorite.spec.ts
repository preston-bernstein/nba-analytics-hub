import type { Game } from '@nba-analytics-hub/types';
import { getFavorite } from './get-favorite';

describe('getFavorite', () => {
  const baseGame: Game = {
    id: 'game-1',
    provider: 'mock-provider',
    homeTeam: { id: 'ATL', name: 'Atlanta Hawks', externalId: 14 },
    awayTeam: { id: 'BOS', name: 'Boston Celtics', externalId: 2 },
    startTime: '2025-01-01T00:00:00Z',
    status: 'SCHEDULED',
    score: { home: 0, away: 0 },
    meta: { season: '2024-2025', upstreamGameId: 1111 },
  };

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
