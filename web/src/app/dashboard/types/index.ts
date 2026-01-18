import type { Game, PredictionResponse } from '@nba-analytics-hub/types';

export type PredictionsByGameId = Record<string, PredictionResponse>;

export interface DashboardDataState {
  games: Game[];
  predictions: PredictionsByGameId;
  loadingGames: boolean;
  loadingPredictions: boolean;
  error: string | null;
  selectedDate: string;
  goToPreviousDay: () => void;
  goToNextDay: () => void;
  goToToday: () => void;
}

export interface DashboardContentProps {
  games: Game[];
  predictions: Record<string, PredictionResponse>;
  loadingPredictions: boolean;
  selectedDate: string;
  onPreviousDay: () => void;
  onNextDay: () => void;
  onToday: () => void;
}

export interface DashboardErrorStateProps {
  message: string;
}
