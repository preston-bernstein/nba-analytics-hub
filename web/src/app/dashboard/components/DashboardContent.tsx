import { DashboardContentProps } from '../types';
import { GameCard, PredictionBadge, DateNavigation } from '@nba-analytics-hub/ui';
import { formatDisplayDate, isToday } from '../../../utils/date';

export function DashboardContent({
  games,
  predictions,
  loadingPredictions,
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
      </header>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {games.map((game) => {
          const prediction = predictions[game.id];
          return (
            <article key={game.id} className="flex flex-col gap-3">
              <GameCard game={game} />
              {prediction ? (
                <PredictionBadge prediction={prediction} />
              ) : (
                <div className="rounded-md border border-gray-700 bg-gray-900 p-3 text-center text-sm text-gray-500">
                  {loadingPredictions ? 'Loading prediction...' : 'No prediction available'}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
