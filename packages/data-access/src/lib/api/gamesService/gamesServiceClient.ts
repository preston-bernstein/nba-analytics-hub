import type { Game, HealthCheckResponse } from '@nba-analytics-hub/types';

export interface GamesServiceClientOptions {
  baseUrl: string;
}

export interface GamesServiceClient {
  checkHealth(): Promise<HealthCheckResponse>;
  getTodayGames(): Promise<Game[]>;
  getGameById(gameId: string): Promise<Game>;
}

export function createGamesServiceClient(
  options: GamesServiceClientOptions,
): GamesServiceClient {
  const { baseUrl } = options;

  async function fetchJson<T>(url: URL): Promise<T> {
    const res = await fetch(url.toString());
    if (!res.ok) {
      throw new Error(`Games service request failed with status ${res.status}`);
    }
    return (await res.json()) as T;
  }

  return {
    async checkHealth(): Promise<HealthCheckResponse> {
      const url = new URL('/health', baseUrl);
      return fetchJson<HealthCheckResponse>(url);
    },

    async getTodayGames(): Promise<Game[]> {
      const url = new URL('/games/today', baseUrl);
      return fetchJson<Game[]>(url);
    },

    async getGameById(gameId: string): Promise<Game> {
      const url = new URL(`/games/${encodeURIComponent(gameId)}`, baseUrl);
      return fetchJson<Game>(url);
    },
  };
}
