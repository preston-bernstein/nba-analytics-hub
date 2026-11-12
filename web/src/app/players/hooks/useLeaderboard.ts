import { useMemo } from 'react';
import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query';
import { useShallow } from 'zustand/react/shallow';
import { fetchLeaderboardPage, PAGE_SIZE } from '../api';
import { usePlayersStore } from '../store';
import { useDebouncedValue } from './useDebouncedValue';

const SEARCH_DELAY_MS = 300;

/** Loads the leaderboard one page at a time. The server sorts, filters and slices. */
export function useLeaderboard() {
  const { season, seasonType, search, sort, dir } = usePlayersStore(
    useShallow((s) => ({
      season: s.season,
      seasonType: s.seasonType,
      search: s.search,
      sort: s.sort,
      dir: s.dir,
    }))
  );
  const term = useDebouncedValue(search.trim(), SEARCH_DELAY_MS);

  const query = useInfiniteQuery({
    queryKey: ['leaderboard', season, seasonType, sort, dir, term],
    queryFn: ({ pageParam }) =>
      fetchLeaderboardPage({
        season,
        seasonType,
        sort,
        dir,
        limit: PAGE_SIZE,
        offset: pageParam,
        search: term || undefined,
      }),
    initialPageParam: 0,
    getNextPageParam: (last) => {
      const next = last.offset + last.rows.length;
      return last.rows.length > 0 && next < last.total ? next : undefined;
    },
    // Keep showing the old rows while a new sort or filter loads.
    placeholderData: keepPreviousData,
  });

  const rows = useMemo(() => query.data?.pages.flatMap((page) => page.rows) ?? [], [query.data]);

  return {
    rows,
    total: query.data?.pages[0]?.total ?? 0,
    error: query.error,
    isPending: query.isPending,
    isFetching: query.isFetching,
    isPlaceholderData: query.isPlaceholderData,
    hasNextPage: query.hasNextPage,
    fetchNextPage: query.fetchNextPage,
  };
}
