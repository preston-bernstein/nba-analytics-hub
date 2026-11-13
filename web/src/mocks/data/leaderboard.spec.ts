import { describe, expect, it } from 'vitest';
import { STAT_COLUMNS } from '@nba-analytics-hub/players';
import { makeLeaderboard } from './leaderboard';

describe('makeLeaderboard', () => {
  it('gives the same rows for the same season and type', () => {
    expect(makeLeaderboard(2024, 'regular')).toEqual(makeLeaderboard(2024, 'regular'));
  });

  it('gives different rows for a different season or type', () => {
    expect(makeLeaderboard(2023, 'regular')).not.toEqual(makeLeaderboard(2024, 'regular'));
    expect(makeLeaderboard(2024, 'playoffs')).not.toEqual(makeLeaderboard(2024, 'regular'));
  });

  it('has enough regular season rows to need several pages, and fewer for the playoffs', () => {
    expect(makeLeaderboard(2024, 'regular').length).toBeGreaterThan(150);
    expect(makeLeaderboard(2024, 'playoffs').length).toBeLessThan(
      makeLeaderboard(2024, 'regular').length
    );
  });

  it('gives each player a unique id and a name', () => {
    const rows = makeLeaderboard(2024, 'regular');
    expect(new Set(rows.map((r) => r.playerId)).size).toBe(rows.length);
    expect(new Set(rows.map((r) => r.name)).size).toBe(rows.length);
  });

  it('fills every stat column with a number, except some missing shooting values', () => {
    const rows = makeLeaderboard(2024, 'regular');
    for (const [key] of STAT_COLUMNS) {
      expect(rows.some((r) => typeof r[key] === 'number')).toBe(true);
    }
    expect(rows.some((r) => r.fg3Pct === null)).toBe(true);
  });
});
