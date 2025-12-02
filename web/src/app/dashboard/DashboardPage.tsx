import { useDashboardData } from "./hooks/useDashboardData";
import { DashboardContent } from "./components/DashboardContent";
import { DashboardErrorState } from "./components/DashboardErrorState";
import { DashboardLoadingState } from "./components/DashboardLoadingState";
import { DashboardEmptyState } from "./components/DashboardEmptyState";

export function DashboardPage() {
  const {
    games,
    predictions,
    loadingGames,
    loadingPredictions,
    error
  } = useDashboardData();

  const hasGames = games.length > 0;
  const isInitialLoading = loadingGames && !hasGames;

  if (error) {
    return <DashboardErrorState message={error} />
  }

  if (isInitialLoading) {
    return <DashboardLoadingState />
  }

  if (!hasGames) {
    return <DashboardEmptyState />
  }

  return (
    <DashboardContent
      games={[]}
      predictions={{}}
      loadingPredictions={false}
    />
  )
}