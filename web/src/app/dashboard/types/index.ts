import type { Game, PredictionResponse } from '@nba-analytics-hub/types';

export type PredictionsByGameId = Record<string, PredictionResponse>;

export interface DashboardDataState {
  games: Game[];
  predictions: PredictionsByGameId;
  loadingGames: boolean;
  loadingPredictions: boolean;
  gamesError: string | null;
  predictionError: string | null;
  selectedDate: string;
  goToPreviousDay: () => void;
  goToNextDay: () => void;
  goToToday: () => void;
}

export interface DashboardContentProps {
  games: Game[];
  predictions: Record<string, PredictionResponse>;
  loadingPredictions: boolean;
  predictionError: string | null;
}

export interface DashboardErrorStateProps {
  message: string;
}
