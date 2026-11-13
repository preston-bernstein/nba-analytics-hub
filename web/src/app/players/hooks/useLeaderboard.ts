import { useShallow } from 'zustand/react/shallow';
import { useDebouncedValue } from '@nba-analytics-hub/ui';
import { LEADERBOARD_PAGE_SIZE } from '@nba-analytics-hub/players';
import { useInfinitePage } from '../../shared/useInfinitePage';
import { fetchLeaderboardPage } from '../lib/leaderboardApi';
import { usePlayersStore } from './usePlayersStore';

const SEARCH_DELAY_MS = 300;

/** The leaderboard rows for what the user picked. The server sorts, filters and pages them. */
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

  return useInfinitePage({
    queryKey: ['leaderboard', season, seasonType, sort, dir, term],
    fetchPage: (offset) =>
      fetchLeaderboardPage({
        season,
        seasonType,
        sort,
        dir,
        limit: LEADERBOARD_PAGE_SIZE.default,
        offset,
        search: term || undefined,
      }),
  });
}
