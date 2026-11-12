import { useCallback } from 'react';
import { AlertCircle } from 'lucide-react';
import type { SortingState } from '@tanstack/react-table';
import { isSortColumn } from '@nba-analytics-hub/players';
import { Alert, AlertTitle, DataTable, Skeleton, cn } from '@nba-analytics-hub/ui';
import { useLeaderboard } from '../hooks/useLeaderboard';
import { usePlayersStore } from '../hooks/usePlayersStore';
import { leaderboardColumns } from './leaderboardColumns';

/** The leaderboard rows in a table. The server sorts them, and pages load as you scroll. */
export function LeaderboardTable() {
  const { sort, dir, setSort } = usePlayersStore();
  const leaderboard = useLeaderboard();
  const { hasNextPage, fetchNextPage, isFetching } = leaderboard;

  const sorting: SortingState = [{ id: sort, desc: dir === 'desc' }];

  const handleSortingChange = useCallback(
    ([next]: SortingState) => {
      if (next && isSortColumn(next.id)) setSort(next.id, next.desc ? 'desc' : 'asc');
    },
    [setSort]
  );

  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetching) void fetchNextPage();
  }, [hasNextPage, isFetching, fetchNextPage]);

  if (leaderboard.error) {
    return (
      <Alert variant="destructive">
        <AlertCircle aria-label="warning" />
        <AlertTitle>Failed to load players: {leaderboard.error.message}</AlertTitle>
      </Alert>
    );
  }
  if (leaderboard.isPending) return <Skeleton className="h-96 w-full" />;

  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground" aria-live="polite">
        {leaderboard.total.toLocaleString()} players
      </p>
      <DataTable
        density="compact"
        className={cn(leaderboard.isPlaceholderData && 'opacity-60 transition-opacity')}
        columns={leaderboardColumns}
        data={leaderboard.rows}
        getRowId={(row) => String(row.playerId)}
        sorting={sorting}
        onSortingChange={handleSortingChange}
        hasMore={hasNextPage}
        isFetching={isFetching}
        onEndReached={loadMore}
        emptyMessage="No players found"
      />
    </div>
  );
}
