import type { ColumnDef } from '@tanstack/react-table';
import { LEADERBOARD_COLUMNS, SORT_COLUMNS } from '@nba-analytics-hub/players';
import type { LeaderboardRow } from '@nba-analytics-hub/players';
import { formatStat } from '../lib/format';

/** One table column for each entry in the shared column table. */
export const leaderboardColumns: ColumnDef<LeaderboardRow>[] = SORT_COLUMNS.map((key) => {
  const column = LEADERBOARD_COLUMNS[key];
  if (column.format === 'text') {
    return {
      id: key,
      accessorKey: key,
      header: column.label,
      sortDescFirst: false,
      cell: ({ getValue }) => getValue<string | null>() ?? '—',
    };
  }
  return {
    id: key,
    accessorKey: key,
    header: column.label,
    sortDescFirst: true,
    meta: { align: 'right' },
    cell: ({ getValue }) => formatStat(getValue<number | null>(), column.format),
  };
});
