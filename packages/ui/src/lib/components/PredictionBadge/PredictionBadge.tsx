import type { PredictionResponse } from '@nba-analytics-hub/types';
import { getPredictionDisplay } from '@nba-analytics-hub/domain'
export interface PredictionBadgeProps {
  prediction: PredictionResponse;
}

export function PredictionBadge({ prediction }: PredictionBadgeProps) {
  const { homePct, awayPct, favoriteLabel, isHomeFavored } =
    getPredictionDisplay(prediction);

  return (
    <div
      aria-label="prediction-badge"
      className="rounded-md border border-gray-700 bg-gray-900 p-3 text-sm text-gray-100 shadow-sm"
    >
      <div className="flex justify-between mb-2">
        <span className="text-gray-400">Prediction</span>
        {prediction.modelVersion && (
          <span className="text-xs text-gray-500">Model {prediction.modelVersion}</span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div
          className={`rounded-md p-2 text-center font-semibold ${
            isHomeFavored
              ? 'bg-green-800/40 text-green-300 border border-green-700'
              : 'bg-gray-800/40 text-gray-300 border border-gray-700'
          }`}
        >
          <div className="text-xs font-medium">{prediction.homeTeamId}</div>
          <div className="text-lg">{homePct}%</div>
        </div>

        <div
          className={`rounded-md p-2 text-center font-semibold ${
            !isHomeFavored
              ? 'bg-blue-800/40 text-blue-300 border border-blue-700'
              : 'bg-gray-800/40 text-gray-300 border border-gray-700'
          }`}
        >
          <div className="text-xs font-medium">{prediction.awayTeamId}</div>
          <div className="text-lg">{awayPct}%</div>
        </div>
      </div>

      <div className="mt-3 text-center text-xs text-gray-400">
        Favorite:{' '}
        <span
          className={`font-bold ${
            favoriteLabel === 'EVEN' ? 'text-yellow-300' : 'text-indigo-300'
          }`}
        >
          {favoriteLabel}
        </span>
      </div>
    </div>
  );
}

export default PredictionBadge;
