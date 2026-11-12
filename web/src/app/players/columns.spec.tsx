import { LEADERBOARD_COLUMNS, SORT_COLUMNS } from '@nba-analytics-hub/players';
import { leaderboardColumns } from './columns';

describe('leaderboardColumns', () => {
  it('has one column per entry in the shared column table, in the same order', () => {
    expect(leaderboardColumns.map((c) => c.id)).toEqual(SORT_COLUMNS);
  });

  it('takes each header from the shared label', () => {
    for (const column of leaderboardColumns) {
      expect(column.header).toBe(
        LEADERBOARD_COLUMNS[column.id as keyof typeof LEADERBOARD_COLUMNS].label
      );
    }
  });

  it('sorts stat columns high to low first, and text columns A to Z first', () => {
    const byId = Object.fromEntries(leaderboardColumns.map((c) => [c.id, c]));
    expect(byId.name.sortDescFirst).toBe(false);
    expect(byId.pts.sortDescFirst).toBe(true);
  });

  it('right-aligns the stat columns', () => {
    const byId = Object.fromEntries(leaderboardColumns.map((c) => [c.id, c]));
    expect(byId.pts.meta).toEqual({ align: 'right' });
    expect(byId.name.meta).toBeUndefined();
  });
});
