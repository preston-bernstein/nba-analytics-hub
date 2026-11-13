import type { Page, SortDir } from '@nba-analytics-hub/platform';
import type { SeasonType } from '../types/season-type.js';

type StatFormat = 'integer' | 'decimal' | 'percent' | 'signed';

interface TextColumn {
  label: string;
  format: 'text';
}

interface StatColumn {
  label: string;
  format: StatFormat;
  /** Key of this stat in the BALLDONTLIE season average. */
  stat: string;
}

/**
 * The one list of leaderboard columns. The row type, the sort whitelist, the
 * API mapping and the table headers all come from here.
 */
export const LEADERBOARD_COLUMNS = {
  name: { label: 'Player', format: 'text' },
  position: { label: 'Pos', format: 'text' },
  gp: { label: 'GP', format: 'integer', stat: 'gp' },
  min: { label: 'MIN', format: 'decimal', stat: 'min' },
  pts: { label: 'PTS', format: 'decimal', stat: 'pts' },
  reb: { label: 'REB', format: 'decimal', stat: 'reb' },
  ast: { label: 'AST', format: 'decimal', stat: 'ast' },
  stl: { label: 'STL', format: 'decimal', stat: 'stl' },
  blk: { label: 'BLK', format: 'decimal', stat: 'blk' },
  tov: { label: 'TOV', format: 'decimal', stat: 'tov' },
  fgPct: { label: 'FG%', format: 'percent', stat: 'fg_pct' },
  fg3Pct: { label: '3P%', format: 'percent', stat: 'fg3_pct' },
  ftPct: { label: 'FT%', format: 'percent', stat: 'ft_pct' },
  plusMinus: { label: '+/-', format: 'signed', stat: 'plus_minus' },
  fantasyPts: { label: 'FPTS', format: 'decimal', stat: 'nba_fantasy_pts' },
} as const satisfies Record<string, TextColumn | StatColumn>;

type Columns = typeof LEADERBOARD_COLUMNS;

export type LeaderboardColumnKey = keyof Columns;

/** Keys of the columns that hold a number from the API. */
export type StatColumnKey = {
  [K in LeaderboardColumnKey]: Columns[K] extends StatColumn ? K : never;
}[LeaderboardColumnKey];

export type LeaderboardRow = {
  playerId: number;
  name: string;
  position: string | null;
} & Record<StatColumnKey, number | null>;

export const SORT_COLUMNS = Object.keys(LEADERBOARD_COLUMNS) as LeaderboardColumnKey[];

/** Each stat column key with its BALLDONTLIE stat key. */
export const STAT_COLUMNS = Object.entries(LEADERBOARD_COLUMNS).flatMap(([key, column]) =>
  'stat' in column ? [[key as StatColumnKey, column.stat] as const] : []
);

export function isSortColumn(value: string | undefined): value is LeaderboardColumnKey {
  return SORT_COLUMNS.some((key) => key === value);
}

export interface LeaderboardQuery {
  season: number;
  seasonType: SeasonType;
  sort: LeaderboardColumnKey;
  dir: SortDir;
  limit: number;
  offset: number;
  search: string | undefined;
}

export type LeaderboardPage = Page<LeaderboardRow>;
