import type { Game } from '@nba-analytics-hub/types';

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
      const url = new URL('/games/upcoming', baseUrl);

      const res = await fetch(url.toString());
      if (!res.ok) {
        throw new Error(`Games request failed with status ${res.status}`);
      }

      const data = (await res.json()) as Game[];
      return data;
    },
  };
}
