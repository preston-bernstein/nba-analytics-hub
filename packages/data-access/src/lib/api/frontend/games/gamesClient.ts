import type { Game } from '@nba-analytics-hub/types';
import { applyGamesQueryParams, type GamesQueryParams } from '../../shared/gamesQuery.js';
import { fetchJson } from '../http.js';

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

function normalizeBasePath(basePath?: string): string {
  if (!basePath) return '';

  const trimmed = basePath.trim();
  if (!trimmed) return '';

  const withLeadingSlash = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return withLeadingSlash.endsWith('/')
    ? withLeadingSlash.slice(0, -1)
    : withLeadingSlash;
}
