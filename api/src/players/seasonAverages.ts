import { STAT_COLUMNS } from '@nba-analytics-hub/players';
import type { LeaderboardRow, SeasonType } from '@nba-analytics-hub/players';

// The shape of one item from BALLDONTLIE season averages, as the ingest archive stores it.
export interface SeasonAverageItem {
  player: { id: number; first_name: string; last_name: string; position?: string | null };
  stats: Record<string, number | null | undefined>;
}

/** Flattens one season average item into a leaderboard row. */
export function toLeaderboardRow({ player, stats }: SeasonAverageItem): LeaderboardRow {
  const row = {
    playerId: player.id,
    name: `${player.first_name} ${player.last_name}`,
    position: player.position ?? null,
  };
  const numbers = Object.fromEntries(STAT_COLUMNS.map(([key, stat]) => [key, stats[stat] ?? null]));
  return { ...row, ...numbers } as LeaderboardRow;
}

/** The archive job key that holds general base averages for a season. */
export function leaderboardJobKey(season: number, seasonType: SeasonType): string {
  return `season-${season}_general_base_${seasonType}`;
}
