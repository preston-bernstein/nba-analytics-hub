export interface PredictorServicePredictQuery {
  home: string;
  away: string;
  date?: string | null; // ISO-8601 date string like "2024-11-01"
}

export interface PredictorServiceFeatureDeltas {
  delta_off: number;
  delta_def: number;
  delta_rest?: number;
  delta_elo?: number;
}

export interface PredictorServicePredictResponse {
  home_team: string;
  away_team: string;
  as_of: string | null;
  features: PredictorServiceFeatureDeltas;
  prob_home_win: number; // 0–1
}

export interface PredictorServiceErrorResponse {
  detail: string;
}
