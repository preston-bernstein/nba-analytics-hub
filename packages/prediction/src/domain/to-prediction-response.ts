import type { PredictionResponse } from '../types/prediction.js';
import type { PredictorServicePredictResponse } from '../types/predictor-service.js';

export const PREDICTOR_SERVICE_MODEL_VERSION = 'predictor-service';

/** Maps the predictor service's wire format to the app's PredictionResponse. */
export function toPredictionResponse(
  response: PredictorServicePredictResponse,
): PredictionResponse {
  return {
    homeTeamId: response.home_team,
    awayTeamId: response.away_team,
    homeWinProbability: response.prob_home_win,
    awayWinProbability: 1 - response.prob_home_win,
    modelVersion: PREDICTOR_SERVICE_MODEL_VERSION,
  };
}
