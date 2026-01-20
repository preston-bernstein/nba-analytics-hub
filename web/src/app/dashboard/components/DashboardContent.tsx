import { DashboardContentProps } from '../types';
import { GameCard, cardContainer } from '@nba-analytics-hub/ui';

export function DashboardContent({
  games,
  predictions,
  loadingPredictions,
  predictionError,
}: DashboardContentProps) {
  return (
    <>
      {predictionError && (
        <div
          role="status"
          className="mb-6 rounded-lg border border-brand-accent-200 bg-brand-accent-50 px-4 py-3 text-sm font-semibold text-brand-accent-700"
        >
          <span role="img" aria-label="warning">⚠️</span> Predictions unavailable: {predictionError}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {games.map((game) => {
          const prediction = predictions[game.id];
          const fallbackMessage = predictionError
            ? 'Prediction unavailable'
            : loadingPredictions
              ? 'Loading prediction...'
              : 'No prediction available';
          return (
            <article key={game.id} className="flex flex-col gap-3">
              <GameCard game={game} prediction={prediction} />
              {!prediction && (
                <div className={`${cardContainer} text-center text-muted-foreground`}>
                  {loadingPredictions && (
                    <span className="inline-block animate-pulse">
                      {fallbackMessage}
                    </span>
                  )}
                  {!loadingPredictions && fallbackMessage}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </>
  );
}
