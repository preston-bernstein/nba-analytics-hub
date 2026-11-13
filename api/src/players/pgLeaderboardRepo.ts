import { SORT_COLUMNS, STAT_COLUMNS } from '@nba-analytics-hub/players';
import type {
  LeaderboardColumnKey,
  LeaderboardPage,
  LeaderboardQuery,
} from '@nba-analytics-hub/players';
import { type SeasonAverageItem, leaderboardJobKey, toLeaderboardRow } from './seasonAverages.js';

export interface LeaderboardRepo {
  list(query: LeaderboardQuery): Promise<LeaderboardPage>;
}

interface Queryable {
  query(
    sql: string,
    params: unknown[]
  ): Promise<{ rows: { data: SeasonAverageItem; total?: string }[] }>;
}

// Each ->> needs its own parentheses, because || binds tighter than ->>.
const NAME_SQL = "((data->'player'->>'first_name') || ' ' || (data->'player'->>'last_name'))";

const numeric = (stat: string) => `((data->'stats'->>'${stat}')::numeric)`;

// Fixed SQL for each sortable column. The client never supplies SQL text.
export const SORT_SQL = {
  ...Object.fromEntries(SORT_COLUMNS.map((key) => [key, ''])),
  ...Object.fromEntries(STAT_COLUMNS.map(([key, stat]) => [key, numeric(stat)])),
  name: `(lower(${NAME_SQL}))`,
  position: "(data->'player'->>'position')",
} as Record<LeaderboardColumnKey, string>;

function pageSql({ sort, dir }: Pick<LeaderboardQuery, 'sort' | 'dir'>): string {
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
      const { rows } = await db.query(pageSql(q), params);
      return {
        rows: rows.map((r) => toLeaderboardRow(r.data)),
        total: rows.length > 0 ? Number(rows[0].total) : 0,
        limit: q.limit,
        offset: q.offset,
      };
    },
  };
}
