import { toLeaderboardRow, leaderboardJobKey } from './seasonAverages.js';

const apiItem = {
  player: { id: 7, first_name: 'AJ', last_name: 'Lawson', position: 'G' },
  stats: {
    gp: 26,
    min: 18.7,
    pts: 9.1,
    reb: 3.3,
    ast: 1.2,
    stl: 0.5,
    blk: 0.2,
    tov: 0.6,
    fg_pct: 0.421,
    fg3_pct: 0.327,
    ft_pct: 0.683,
    plus_minus: -0.7,
    nba_fantasy_pts: 16.5,
  },
};

describe('toLeaderboardRow', () => {
  it('flattens one API item into a table row', () => {
    expect(toLeaderboardRow(apiItem)).toEqual({
      playerId: 7,
      name: 'AJ Lawson',
      position: 'G',
      gp: 26,
      min: 18.7,
      pts: 9.1,
      reb: 3.3,
      ast: 1.2,
      stl: 0.5,
      blk: 0.2,
      tov: 0.6,
      fgPct: 0.421,
      fg3Pct: 0.327,
      ftPct: 0.683,
      plusMinus: -0.7,
      fantasyPts: 16.5,
    });
  });

  it('uses null for a stat the API left out', () => {
    const row = toLeaderboardRow({ ...apiItem, stats: { gp: 3 } });
    expect(row.gp).toBe(3);
    expect(row.pts).toBeNull();
  });

  it('uses null for a missing position', () => {
    const row = toLeaderboardRow({
      ...apiItem,
      player: { ...apiItem.player, position: undefined },
    });
    expect(row.position).toBeNull();
  });
});

describe('leaderboardJobKey', () => {
  it('matches the archive job key', () => {
    expect(leaderboardJobKey(2024, 'regular')).toBe('season-2024_general_base_regular');
  });
});
