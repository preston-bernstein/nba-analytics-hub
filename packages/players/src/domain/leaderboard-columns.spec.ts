import { describe, it, expect } from 'vitest';
import {
  LEADERBOARD_COLUMNS,
  SORT_COLUMNS,
  STAT_COLUMNS,
  isSortColumn,
} from './leaderboard-columns.js';

describe('leaderboard columns', () => {
  it('lists every sortable column once', () => {
    expect([...SORT_COLUMNS].toSorted()).toEqual(
      [
        'ast',
        'blk',
        'fantasyPts',
        'fg3Pct',
        'fgPct',
        'ftPct',
        'gp',
        'min',
        'name',
        'plusMinus',
        'position',
        'pts',
        'reb',
        'stl',
        'tov',
      ].toSorted()
    );
  });

  it('gives every column a label and a format', () => {
    for (const key of SORT_COLUMNS) {
      expect(LEADERBOARD_COLUMNS[key].label).toBeTruthy();
      expect(LEADERBOARD_COLUMNS[key].format).toBeTruthy();
    }
  });

  it('maps each stat column to the API stat key', () => {
    const byKey = Object.fromEntries(STAT_COLUMNS);
    expect(byKey.fgPct).toBe('fg_pct');
    expect(byKey.fantasyPts).toBe('nba_fantasy_pts');
    expect(byKey.name).toBeUndefined();
    expect(byKey.position).toBeUndefined();
  });

  it('isSortColumn accepts column keys and rejects anything else', () => {
    expect(isSortColumn('pts')).toBe(true);
    expect(isSortColumn('drop_table')).toBe(false);
    expect(isSortColumn(undefined)).toBe(false);
  });
});
