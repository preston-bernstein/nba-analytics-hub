import type { HealthCheckResponse } from '../health';
import type { GamesServiceGame } from './game';

export interface GamesServiceTodayResponse {
  date: string;
  games: GamesServiceGame[];
}

export type GamesServiceGameDetailResponse = GamesServiceGame;
export type GamesServiceHealthResponse = HealthCheckResponse;
