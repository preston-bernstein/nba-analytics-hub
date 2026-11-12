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

export const SORT_COLUMNS = [
  'name',
  'position',
  'gp',
  'min',
  'pts',
  'reb',
  'ast',
  'stl',
  'blk',
  'tov',
  'fgPct',
  'fg3Pct',
  'ftPct',
  'plusMinus',
  'fantasyPts',
] as const;

export type SortColumn = (typeof SORT_COLUMNS)[number];
export type SortDir = 'asc' | 'desc';

export interface LeaderboardQuery {
  season: number;
  seasonType: SeasonType;
  sort: SortColumn;
  dir: SortDir;
  limit: number;
  offset: number;
  search: string | undefined;
}

export interface LeaderboardPage {
  rows: LeaderboardRow[];
  total: number;
}

export interface LeaderboardRepo {
  list(query: LeaderboardQuery): Promise<LeaderboardPage>;
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
  query(sql: string, params: unknown[]): Promise<{ rows: { data: ApiItem; total?: string }[] }>;
}

const stats = (key: string) => `((data->'stats'->>'${key}')::numeric)`;

// Each ->> needs its own parentheses, because || binds tighter than ->>.
const NAME_SQL = "((data->'player'->>'first_name') || ' ' || (data->'player'->>'last_name'))";

// Fixed SQL for each sortable column. The client never supplies SQL text.
const SORT_SQL: Record<SortColumn, string> = {
  name: `(lower(${NAME_SQL}))`,
  position: "(data->'player'->>'position')",
  gp: stats('gp'),
  min: stats('min'),
  pts: stats('pts'),
  reb: stats('reb'),
  ast: stats('ast'),
  stl: stats('stl'),
  blk: stats('blk'),
  tov: stats('tov'),
  fgPct: stats('fg_pct'),
  fg3Pct: stats('fg3_pct'),
  ftPct: stats('ft_pct'),
  plusMinus: stats('plus_minus'),
  fantasyPts: stats('nba_fantasy_pts'),
};

function pageSql(sort: SortColumn, dir: SortDir): string {
  const direction = dir === 'asc' ? 'asc' : 'desc';
  return [
    'select data, count(*) over () as total from bdl.season_averages',
    'where job_key = $1',
    `and ($4::text is null or position(lower($4) in lower(${NAME_SQL})) > 0)`,
    `order by ${SORT_SQL[sort]} ${direction} nulls last, (data->'player'->>'id')::bigint`,
    'limit $2 offset $3',
  ].join(' ');
}

export function createPgLeaderboardRepo(db: Queryable): LeaderboardRepo {
  return {
    async list(q) {
      const params = [
        leaderboardJobKey(q.season, q.seasonType),
        q.limit,
        q.offset,
        q.search ?? null,
      ];
      const { rows } = await db.query(pageSql(q.sort, q.dir), params);
      return {
        rows: rows.map((r) => toLeaderboardRow(r.data)),
        total: rows.length > 0 ? Number(rows[0].total) : 0,
      };
    },
  };
}
