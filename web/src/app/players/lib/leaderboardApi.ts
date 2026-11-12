import { fetchJson } from '@nba-analytics-hub/platform';
import type { LeaderboardPage, LeaderboardQuery } from '@nba-analytics-hub/players';
import { apiClientConfig } from '../../apiConfig';

export function fetchLeaderboardPage(query: LeaderboardQuery): Promise<LeaderboardPage> {
  const params = new URLSearchParams({
    season: String(query.season),
    seasonType: query.seasonType,
    sort: query.sort,
    dir: query.dir,
    limit: String(query.limit),
    offset: String(query.offset),
  });
  if (query.search) params.set('search', query.search);
  return fetchJson<LeaderboardPage>(
    apiClientConfig.baseUrl,
    `${apiClientConfig.basePath}/players/leaderboard?${params}`,
    'Leaderboard'
  );
}
