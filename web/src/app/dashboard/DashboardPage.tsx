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

  if (gamesError) {
    return <DashboardErrorState message={gamesError} />;
  }

  if (isInitialLoading) {
    return <DashboardLoadingState />;
  }

  if (!hasGames) {
    return (
      <DashboardEmptyState
        selectedDate={selectedDate}
        onPreviousDay={goToPreviousDay}
        onNextDay={goToNextDay}
        onToday={goToToday}
      />
    );
  }

  return (
    <DashboardContent
      games={games}
      predictions={predictions}
      loadingPredictions={loadingPredictions}
      predictionError={predictionError}
      selectedDate={selectedDate}
      onPreviousDay={goToPreviousDay}
      onNextDay={goToNextDay}
      onToday={goToToday}
    />
  );
}
