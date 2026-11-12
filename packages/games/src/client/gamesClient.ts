import type { Game } from '../types/game.js';
import { applyGamesQueryParams, type GamesQueryParams } from './gamesQuery.js';
import { fetchJson, normalizeBasePath } from '@nba-analytics-hub/platform';

export interface GamesClientOptions {
  baseUrl: string;
  basePath?: string;
}

export type GetGamesOptions = GamesQueryParams;

export interface GamesClient {
  getGames(options?: GetGamesOptions): Promise<Game[]>;
}

export function createGamesClient(options: GamesClientOptions): GamesClient {
  const { baseUrl, basePath } = options;
  const normalizedBasePath = normalizeBasePath(basePath);

  const fetchGames = async (params?: GetGamesOptions): Promise<Game[]> => {
    const url = new URL(`${normalizedBasePath}/games`, baseUrl);
    applyGamesQueryParams(url, params);

    return fetchJson<Game[]>(baseUrl, url, 'Games');
  };

  return {
    getGames: fetchGames,
  };
}
