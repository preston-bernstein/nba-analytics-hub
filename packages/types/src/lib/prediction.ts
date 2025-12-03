export interface PredictionRequest {
  homeTeamId: string;
  awayTeamId: string;
  gameDate: string; // ISO string or yyyy-mm-dd
}

export interface PredictionResponse {
  homeTeamId: string;
  awayTeamId: string;
  homeWinProbability: number; // 0–1
  awayWinProbability: number; // 0–1
  modelVersion?: string;
}

export interface PredictionDisplay {
  homePct: number;
  awayPct: number;
  favoriteLabel: string;
  isHomeFavored: boolean;
}