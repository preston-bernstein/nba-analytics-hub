import type { PredictionDisplay, PredictionResponse } from '@nba-analytics-hub/types';


export function getPredictionDisplay(
    prediction: PredictionResponse
): PredictionDisplay {
    const homePct = Math.round(prediction.homeWinProbability * 100);
    const awayPct = Math.round(prediction.awayWinProbability * 100);

    const diff = homePct - awayPct;

    let favoriteLabel: PredictionDisplay['favoriteLabel'] = 'EVEN';
    let isHomeFavored = false;

    if (diff > 0) {
        favoriteLabel = prediction.homeTeamId;
        isHomeFavored = true;
    } else if (diff < 0) {
        favoriteLabel = prediction.awayTeamId;
        isHomeFavored = false;
    }

    return { homePct, awayPct, favoriteLabel, isHomeFavored };
}