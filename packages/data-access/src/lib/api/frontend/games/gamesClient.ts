import type { Game } from '@nba-analytics-hub/types';
import { fetchJson } from '../http.js';

export interface GamesClientOptions {
  baseUrl: string;
}

export interface GamesClient {
  getUpcomingGames(): Promise<Game[]>;
}

export function createGamesClient(options: GamesClientOptions): GamesClient {
  const { baseUrl } = options;

  return {
    async getUpcomingGames(): Promise<Game[]> {
      return fetchJson<Game[]>(baseUrl, '/games/upcoming', 'Games');
    },
  };
}
