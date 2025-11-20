import type { Game } from '@nba-analytics-hub/types';

export interface GameRepository {
  getGameById(id: string): Promise<Game | null>;
}