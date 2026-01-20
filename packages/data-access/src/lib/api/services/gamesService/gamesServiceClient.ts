import type {
  GamesServiceGame,
  GamesServiceGameDetailResponse,
  GamesServiceHealthResponse,
  GamesServiceTodayResponse,
} from '@nba-analytics-hub/types';
import { applyGamesQueryParams, type GamesQueryParams } from '../../shared/gamesQuery.js';
import { fetchJson } from '../http.js';

export interface GamesServiceClientOptions {
  baseUrl: string;
}

export interface GamesServiceRequestOptions {
  requestId?: string;
}

export interface GetGamesParams
  extends GamesServiceRequestOptions,
    GamesQueryParams {}

export interface GamesServiceClient {
  checkHealth(options?: GamesServiceRequestOptions): Promise<GamesServiceHealthResponse>;
  getGames(params?: GetGamesParams): Promise<GamesServiceTodayResponse>;
  getGameById(
    gameId: string,
    options?: GamesServiceRequestOptions,
  ): Promise<GamesServiceGameDetailResponse>;
}

export function createGamesServiceClient(
  options: GamesServiceClientOptions,
): GamesServiceClient {
  const { baseUrl } = options;

  const buildHeaders = (requestId?: string): Record<string, string> | undefined =>
    requestId ? { 'X-Request-ID': requestId } : undefined;

  const fetchGames = async (
    params?: GetGamesParams,
  ): Promise<GamesServiceTodayResponse> => {
    const url = new URL('/games', baseUrl);
    applyGamesQueryParams(url, params);

    return fetchJson<GamesServiceTodayResponse>(baseUrl, url, 'Games service', {
      headers: buildHeaders(params?.requestId),
    });
  };

  return {
    async checkHealth(
      options?: GamesServiceRequestOptions,
    ): Promise<GamesServiceHealthResponse> {
      const url = new URL('/health', baseUrl);
      return fetchJson<GamesServiceHealthResponse>(baseUrl, url, 'Games service', {
        headers: buildHeaders(options?.requestId),
      });
    },

    async getGames(params?: GetGamesParams): Promise<GamesServiceTodayResponse> {
      return fetchGames(params);
    },

    async getGameById(
      gameId: string,
      options?: GamesServiceRequestOptions,
    ): Promise<GamesServiceGame> {
      const url = new URL(`/games/${encodeURIComponent(gameId)}`, baseUrl);
      return fetchJson<GamesServiceGame>(baseUrl, url, 'Games service', {
        headers: buildHeaders(options?.requestId),
      });
    },
  };
}
