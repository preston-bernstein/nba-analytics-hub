import { useMemo } from 'react';
import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query';
import type { Page } from '@nba-analytics-hub/platform';

interface UseInfinitePageOptions<TRow> {
  /** Include every input that changes the rows. A new key starts again at offset 0. */
  queryKey: readonly unknown[];
  fetchPage: (offset: number) => Promise<Page<TRow>>;
}

/** Loads a server-paged list one page at a time, and joins the pages into one list of rows. */
export function useInfinitePage<TRow>({ queryKey, fetchPage }: UseInfinitePageOptions<TRow>) {
  const query = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam }) => fetchPage(pageParam),
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
