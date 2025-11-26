import type { PredictionResponse } from '@nba-analytics-hub/types';

export interface PredictionBadgeProps {
  prediction: PredictionResponse;
}

export function PredictionBadge({ prediction }: PredictionBadgeProps) {
  const homePct = Math.round(prediction.homeWinProbability * 100);
  const awayPct = Math.round(prediction.awayWinProbability * 100);

  let favoriteLabel = 'EVEN';
  if (homePct > awayPct) {
    favoriteLabel = prediction.homeTeamId;
  } else if (awayPct > homePct) {
    favoriteLabel = prediction.awayTeamId;
  }

  return (
    <div aria-label="prediction-badge">
      <div>
        {prediction.awayTeamId}: {awayPct}%
      </div>
      <div>
        {prediction.homeTeamId}: {homePct}%
      </div>
      <div>Favorite: {favoriteLabel}</div>
      {prediction.modelVersion ? (
        <div>Model: {prediction.modelVersion}</div>
      ) : null}
    </div>
  );
}

export default PredictionBadge;
