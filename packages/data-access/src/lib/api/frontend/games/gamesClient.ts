import type { Game } from '@nba-analytics-hub/types';
import { fetchJson } from '../http.js';

export interface GamesClientOptions {
  baseUrl: string;
}

export interface GetGamesOptions {
  date?: string;
  tz?: string;
}

export interface GamesClient {
  getGames(options?: GetGamesOptions): Promise<Game[]>;
  getUpcomingGames(): Promise<Game[]>;
}

export function createGamesClient(options: GamesClientOptions): GamesClient {
  const { baseUrl } = options;

  const fetchGames = async (params?: GetGamesOptions): Promise<Game[]> => {
    const url = new URL('/games', baseUrl);

    if (params?.date) {
      url.searchParams.set('date', params.date);
    }
    if (params?.tz) {
      url.searchParams.set('tz', params.tz);
    }

    return fetchJson<Game[]>(baseUrl, url, 'Games');
  };

  return {
    getGames: fetchGames,
    async getUpcomingGames(): Promise<Game[]> {
      return fetchGames();
    },
  };
}
