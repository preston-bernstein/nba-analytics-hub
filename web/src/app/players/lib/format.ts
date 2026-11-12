import type { LeaderboardColumnKey } from '@nba-analytics-hub/players';
import { LEADERBOARD_COLUMNS } from '@nba-analytics-hub/players';

type Format = (typeof LEADERBOARD_COLUMNS)[LeaderboardColumnKey]['format'];

const MISSING = '—';

/** Formats one stat for the table. A missing value shows a dash. */
export function formatStat(value: number | null, format: Exclude<Format, 'text'>): string {
  if (value === null) return MISSING;
  switch (format) {
    case 'integer':
      return String(value);
    case 'decimal':
      return value.toFixed(1);
    case 'percent':
      return `${(value * 100).toFixed(1)}%`;
    case 'signed':
      return `${value > 0 ? '+' : ''}${value.toFixed(1)}`;
  }
}
