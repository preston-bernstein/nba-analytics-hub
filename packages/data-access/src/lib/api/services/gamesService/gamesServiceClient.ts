import type {
  GamesServiceGame,
  GamesServiceGameDetailResponse,
  GamesServiceHealthResponse,
  GamesServiceTodayResponse,
} from '@nba-analytics-hub/types';
import { fetchJson } from '../http.js';

export interface GamesServiceClientOptions {
  baseUrl: string;
}

export interface GamesServiceClient {
  checkHealth(): Promise<GamesServiceHealthResponse>;
  getTodayGames(): Promise<GamesServiceTodayResponse>;
  getGameById(gameId: string): Promise<GamesServiceGameDetailResponse>;
}

export function createGamesServiceClient(
  options: GamesServiceClientOptions,
): GamesServiceClient {
  const { baseUrl } = options;

  return {
    async checkHealth(): Promise<GamesServiceHealthResponse> {
      const url = new URL('/health', baseUrl);
      return fetchJson<GamesServiceHealthResponse>(baseUrl, url, 'Games service');
    },

    async getTodayGames(): Promise<GamesServiceTodayResponse> {
      const url = new URL('/games/today', baseUrl);
      return fetchJson<GamesServiceTodayResponse>(baseUrl, url, 'Games service');
    },

    async getGameById(gameId: string): Promise<GamesServiceGame> {
      const url = new URL(`/games/${encodeURIComponent(gameId)}`, baseUrl);
      return fetchJson<GamesServiceGame>(baseUrl, url, 'Games service');
    },
  };
}
