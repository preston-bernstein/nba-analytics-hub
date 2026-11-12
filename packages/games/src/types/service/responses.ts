import type { HealthCheckResponse } from '@nba-analytics-hub/platform';
import type { GamesServiceGame } from './game.js';

export interface GamesServiceTodayResponse {
  date: string;
  games: GamesServiceGame[];
}

export type GamesServiceGameDetailResponse = GamesServiceGame;
export type GamesServiceHealthResponse = HealthCheckResponse;
