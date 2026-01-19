import { DashboardContentProps } from '../types';
import {
  GameCard,
  PredictionBadge,
  DateNavigation,
  cardContainer,
  formatDisplayDate,
} from '@nba-analytics-hub/ui';
import { isToday } from '@nba-analytics-hub/domain';

export function DashboardContent({
  games,
  predictions,
  loadingPredictions,
  predictionError,
  selectedDate,
  onPreviousDay,
  onNextDay,
  onToday,
}: DashboardContentProps) {
  return (
    <section aria-label="games-dashboard" className="p-6">
      <header className="mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-100">Games</h1>
          {loadingPredictions && (
            <span className="text-sm text-gray-400 animate-pulse">
              Loading predictions...
            </span>
          )}
        </div>

        {/* Date Navigation */}
        <div className="mt-4">
          <DateNavigation
            displayDate={formatDisplayDate(selectedDate)}
            showTodayButton={!isToday(selectedDate)}
            onPreviousDay={onPreviousDay}
            onNextDay={onNextDay}
            onToday={onToday}
          />
        </div>

        <p className="mt-3 text-sm text-gray-500">
          {games.length} {games.length === 1 ? 'game' : 'games'} scheduled
        </p>

        {predictionError && (
          <div
            role="status"
            className="mt-3 rounded-md border border-amber-500/50 bg-amber-500/10 px-3 py-2 text-sm text-amber-200"
          >
            Predictions unavailable: {predictionError}
          </div>
        )}
      </header>

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
              <GameCard game={game} />
              {prediction ? (
                <PredictionBadge prediction={prediction} />
              ) : (
                <div className={`${cardContainer} text-center text-gray-500`}>
                  {fallbackMessage}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
