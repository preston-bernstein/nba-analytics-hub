import type { GamesServiceGame } from '../types/service/game.js';
import type {
  GamesServiceGameDetailResponse,
  GamesServiceHealthResponse,
  GamesServiceTodayResponse,
} from '../types/service/responses.js';
import { applyGamesQueryParams, type GamesQueryParams } from './gamesQuery.js';
import { fetchJson } from '@nba-analytics-hub/platform';

export interface GamesServiceClientOptions {
  baseUrl: string;
}

export interface GamesServiceRequestOptions {
  requestId?: string;
}

export interface GetGamesParams extends GamesServiceRequestOptions, GamesQueryParams {}

export interface GamesServiceClient {
  checkHealth(options?: GamesServiceRequestOptions): Promise<GamesServiceHealthResponse>;
  getGames(params?: GetGamesParams): Promise<GamesServiceTodayResponse>;
  getGameById(
    gameId: string,
    options?: GamesServiceRequestOptions
  ): Promise<GamesServiceGameDetailResponse>;
}

function buildHeaders(requestId?: string): Record<string, string> | undefined {
  return requestId ? { 'X-Request-ID': requestId } : undefined;
}

export function createGamesServiceClient(options: GamesServiceClientOptions): GamesServiceClient {
  const { baseUrl } = options;

  const fetchGames = async (params?: GetGamesParams): Promise<GamesServiceTodayResponse> => {
    const url = new URL('/games', baseUrl);
    applyGamesQueryParams(url, params);

    return fetchJson<GamesServiceTodayResponse>(baseUrl, url, 'Games service', {
      headers: buildHeaders(params?.requestId),
    });
  };

  return {
    async checkHealth(
      requestOptions?: GamesServiceRequestOptions
    ): Promise<GamesServiceHealthResponse> {
      const url = new URL('/health', baseUrl);
      return fetchJson<GamesServiceHealthResponse>(baseUrl, url, 'Games service', {
        headers: buildHeaders(requestOptions?.requestId),
      });
    },

    async getGames(params?: GetGamesParams): Promise<GamesServiceTodayResponse> {
      return fetchGames(params);
    },

    async getGameById(
      gameId: string,
      requestOptions?: GamesServiceRequestOptions
    ): Promise<GamesServiceGame> {
      const url = new URL(`/games/${encodeURIComponent(gameId)}`, baseUrl);
      return fetchJson<GamesServiceGame>(baseUrl, url, 'Games service', {
        headers: buildHeaders(requestOptions?.requestId),
      });
    },
  };
}
