import { useCallback, useId } from 'react';
import { AlertCircle } from 'lucide-react';
import type { SortingState } from '@tanstack/react-table';
import { SEASON_TYPES, isSortColumn } from '@nba-analytics-hub/players';
import type { SeasonType } from '@nba-analytics-hub/players';
import {
  Alert,
  AlertTitle,
  Card,
  CardContent,
  DataTable,
  Input,
  NativeSelect,
  Skeleton,
  cn,
} from '@nba-analytics-hub/ui';
import { leaderboardColumns } from './columns';
import { useLeaderboard } from './hooks/useLeaderboard';
import { seasonOptions } from './seasons';
import { usePlayersStore } from './store';

const SEASON_TYPE_LABELS: Record<SeasonType, string> = {
  regular: 'Regular season',
  playoffs: 'Playoffs',
  playin: 'Play-in',
  ist: 'In-season tournament',
};

const SEASONS = seasonOptions();
const labelClass = 'flex flex-col gap-1.5 text-sm font-medium';

export function LeaderboardPage() {
  const { season, seasonType, search, sort, dir, setSeason, setSeasonType, setSearch, setSort } =
    usePlayersStore();
  const ids = { season: useId(), seasonType: useId(), search: useId() };
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

  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h1 className="font-display text-2xl font-semibold tracking-tight">Player leaderboard</h1>
        <p className="text-sm text-muted-foreground">
          Season averages from BALLDONTLIE. Click a column to sort it. The server sorts and pages
          the rows.
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-wrap items-end gap-4">
          <div className={labelClass}>
            <label htmlFor={ids.season}>Season</label>
            <NativeSelect
              id={ids.season}
              value={season}
              onChange={(e) => setSeason(Number(e.target.value))}
            >
              {SEASONS.map((year) => (
                <option key={year} value={year}>
                  {year}-{String(year + 1).slice(2)}
                </option>
              ))}
            </NativeSelect>
          </div>
          <div className={labelClass}>
            <label htmlFor={ids.seasonType}>Season type</label>
            <NativeSelect
              id={ids.seasonType}
              value={seasonType}
              onChange={(e) => setSeasonType(e.target.value as SeasonType)}
            >
              {SEASON_TYPES.map((type) => (
                <option key={type} value={type}>
                  {SEASON_TYPE_LABELS[type]}
                </option>
              ))}
            </NativeSelect>
          </div>
          <div className={cn(labelClass, 'min-w-48 flex-1')}>
            <label htmlFor={ids.search}>Search players</label>
            <Input
              id={ids.search}
              type="search"
              value={search}
              placeholder="Search by name"
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {leaderboard.error ? (
        <Alert variant="destructive">
          <AlertCircle aria-label="warning" />
          <AlertTitle>Failed to load players: {leaderboard.error.message}</AlertTitle>
        </Alert>
      ) : leaderboard.isPending ? (
        <Skeleton className="h-96 w-full" />
      ) : (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground" aria-live="polite">
            {leaderboard.total.toLocaleString()} players
          </p>
          <DataTable
            className={cn(leaderboard.isPlaceholderData && 'opacity-60 transition-opacity')}
            columns={leaderboardColumns}
            data={leaderboard.rows}
            getRowId={(row) => String(row.playerId)}
            sorting={sorting}
            onSortingChange={handleSortingChange}
            hasMore={leaderboard.hasNextPage}
            isFetching={leaderboard.isFetching}
            onEndReached={loadMore}
            emptyMessage="No players found"
          />
        </div>
      )}
    </section>
  );
}
