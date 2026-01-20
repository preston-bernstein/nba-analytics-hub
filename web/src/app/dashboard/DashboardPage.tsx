import { DateNavigation, formatDisplayDate } from '@nba-analytics-hub/ui';
import { isToday, isAtMinDate, isAtMaxDate } from '@nba-analytics-hub/domain';
import { useDashboardData } from './hooks/useDashboardData';
import { DashboardContent } from './components/DashboardContent';
import { DashboardErrorState } from './components/DashboardErrorState';
import { DashboardLoadingState } from './components/DashboardLoadingState';
import { DashboardEmptyState } from './components/DashboardEmptyState';

export function DashboardPage() {
  const {
    games,
    predictions,
    loadingGames,
    loadingPredictions,
    gamesError,
    predictionError,
    selectedDate,
    goToPreviousDay,
    goToNextDay,
    goToToday,
  } = useDashboardData();

  const hasGames = games.length > 0;
  const isInitialLoading = loadingGames && !hasGames;

  const renderContent = () => {
    if (gamesError) {
      return <DashboardErrorState message={gamesError} />;
    }

    if (isInitialLoading) {
      return <DashboardLoadingState />;
    }

    if (!hasGames) {
      return <DashboardEmptyState />;
    }

    return (
      <DashboardContent
        games={games}
        predictions={predictions}
        loadingPredictions={loadingPredictions}
        predictionError={predictionError}
      />
    );
  };

  return (
    <section aria-label="games-dashboard" className="p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold text-foreground">Games</h1>

        <div className="mt-4">
          <DateNavigation
            displayDate={formatDisplayDate(selectedDate)}
            showTodayButton={!isToday(selectedDate)}
            disablePrevious={isAtMinDate(selectedDate)}
            disableNext={isAtMaxDate(selectedDate)}
            onPreviousDay={goToPreviousDay}
            onNextDay={goToNextDay}
            onToday={goToToday}
          />
        </div>

        {!isInitialLoading && !gamesError && (
          <p className="mt-4 text-sm font-medium text-muted-foreground">
            {games.length} {games.length === 1 ? 'game' : 'games'} scheduled
          </p>
        )}

        {loadingPredictions && hasGames && (
          <span className="mt-2 inline-flex items-center rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-sm font-semibold text-brand-700 animate-pulse">
            Loading predictions...
          </span>
        )}
      </header>

      {renderContent()}
    </section>
  );
}
