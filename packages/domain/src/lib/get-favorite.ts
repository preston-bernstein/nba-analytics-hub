import type { Game } from '@nba-analytics-hub/types';

export function getFavorite(game: Game): string {
  // placeholder for actual odds/predictor logic
  return game.homeTeam.id;
}
