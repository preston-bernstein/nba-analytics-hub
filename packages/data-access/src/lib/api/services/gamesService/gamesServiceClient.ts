import type {
  GamesServiceGame,
  GamesServiceGameDetailResponse,
  GamesServiceHealthResponse,
  GamesServiceTodayResponse,
} from '@nba-analytics-hub/types';

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

  async function fetchJson<T>(url: URL): Promise<T> {
    const res = await fetch(url.toString());
    if (!res.ok) {
      throw new Error(`Games service request failed with status ${res.status}`);
    }
    return (await res.json()) as T;
  }

  return {
    async checkHealth(): Promise<GamesServiceHealthResponse> {
      const url = new URL('/health', baseUrl);
      return fetchJson<GamesServiceHealthResponse>(url);
    },

    async getTodayGames(): Promise<GamesServiceTodayResponse> {
      const url = new URL('/games/today', baseUrl);
      return fetchJson<GamesServiceTodayResponse>(url);
    },

    async getGameById(gameId: string): Promise<GamesServiceGame> {
      const url = new URL(`/games/${encodeURIComponent(gameId)}`, baseUrl);
      return fetchJson<GamesServiceGame>(url);
    },
  };
}
