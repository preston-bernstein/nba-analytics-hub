export type SeasonType = 'regular' | 'playoffs' | 'playin' | 'ist';

export const SEASON_TYPES: readonly SeasonType[] = ['regular', 'playoffs', 'playin', 'ist'];

export interface LeaderboardRow {
  playerId: number;
  name: string;
  position: string | null;
  gp: number | null;
  min: number | null;
  pts: number | null;
  reb: number | null;
  ast: number | null;
  stl: number | null;
  blk: number | null;
  tov: number | null;
  fgPct: number | null;
  fg3Pct: number | null;
  ftPct: number | null;
  plusMinus: number | null;
  fantasyPts: number | null;
}

export interface LeaderboardRepo {
  list(season: number, seasonType: SeasonType): Promise<LeaderboardRow[]>;
}

interface ApiItem {
  player: { id: number; first_name: string; last_name: string; position?: string | null };
  stats: Record<string, number | null | undefined>;
}

const stat = (stats: ApiItem['stats'], key: string): number | null => stats[key] ?? null;

/** Flattens one BALLDONTLIE season average item into a table row. */
export function toLeaderboardRow(item: ApiItem): LeaderboardRow {
  const { player, stats } = item;
  return {
    playerId: player.id,
    name: `${player.first_name} ${player.last_name}`,
    position: player.position ?? null,
    gp: stat(stats, 'gp'),
    min: stat(stats, 'min'),
    pts: stat(stats, 'pts'),
    reb: stat(stats, 'reb'),
    ast: stat(stats, 'ast'),
    stl: stat(stats, 'stl'),
    blk: stat(stats, 'blk'),
    tov: stat(stats, 'tov'),
    fgPct: stat(stats, 'fg_pct'),
    fg3Pct: stat(stats, 'fg3_pct'),
    ftPct: stat(stats, 'ft_pct'),
    plusMinus: stat(stats, 'plus_minus'),
    fantasyPts: stat(stats, 'nba_fantasy_pts'),
  };
}

/** The archive job key that holds general base averages for a season. */
export function leaderboardJobKey(season: number, seasonType: SeasonType): string {
  return `season-${season}_general_base_${seasonType}`;
}

interface Queryable {
  query(sql: string, params: unknown[]): Promise<{ rows: { data: ApiItem }[] }>;
}

const SQL =
  "select data from bdl.season_averages where job_key = $1 order by (data->'stats'->>'pts')::numeric desc nulls last";

export function createPgLeaderboardRepo(db: Queryable): LeaderboardRepo {
  return {
    async list(season, seasonType) {
      const { rows } = await db.query(SQL, [leaderboardJobKey(season, seasonType)]);
      return rows.map((r) => toLeaderboardRow(r.data));
    },
  };
}
