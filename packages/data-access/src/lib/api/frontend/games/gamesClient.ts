import type { Game } from '@nba-analytics-hub/types';
import { applyGamesQueryParams, type GamesQueryParams } from '../../shared/gamesQuery.js';
import { fetchJson } from '../http.js';

export interface GamesClientOptions {
  baseUrl: string;
}

export type GetGamesOptions = GamesQueryParams;

export interface GamesClient {
  getGames(options?: GetGamesOptions): Promise<Game[]>;
}

export function createGamesClient(options: GamesClientOptions): GamesClient {
  const { baseUrl } = options;

  const fetchGames = async (params?: GetGamesOptions): Promise<Game[]> => {
    const url = new URL('/games', baseUrl);
    applyGamesQueryParams(url, params);

    return fetchJson<Game[]>(baseUrl, url, 'Games');
  };

  return {
    getGames: fetchGames,
  };
}
