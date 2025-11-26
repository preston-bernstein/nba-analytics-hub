import { useEffect, useMemo, useState } from 'react';
import type { Game, PredictionResponse } from '@nba-analytics-hub/types';
import {
  createGamesClient,
  createPredictorClient,
} from '@nba-analytics-hub/data-access';
import { GameCard, PredictionBadge } from '@nba-analytics-hub/ui';

import { dataAccess } from '@nba-analytics-hub/data-access';

console.log('DATA_ACCESS_NAMESPACE', Object.keys(dataAccess));

type PredictionsByGameId = Record<string, PredictionResponse>;

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

export function DashboardPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [predictions, setPredictions] = useState<PredictionsByGameId>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const gamesClient = useMemo(
    () => createGamesClient({ baseUrl: API_BASE_URL }),
    [],
  );

  const predictorClient = useMemo(
    () => createPredictorClient({ baseUrl: API_BASE_URL }),
    [],
  );

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      setLoading(true);
      setError(null);

      try {
        const upcomingGames = await gamesClient.getUpcomingGames();

        const predictionEntries: Array<[string, PredictionResponse]> = [];
        for (const game of upcomingGames) {
          // Use the game start date (YYYY-MM-DD) for predict endpoint
          const gameDate = game.startTimeUtc.slice(0, 10);

          const prediction = await predictorClient.predict({
            homeTeamId: game.homeTeamId,
            awayTeamId: game.awayTeamId,
            gameDate,
          });

          predictionEntries.push([game.id, prediction]);
        }

        if (cancelled) return;

        setGames(upcomingGames);
        setPredictions(Object.fromEntries(predictionEntries));
        setLoading(false);
      } catch (err) {
        if (cancelled) return;

        const message =
          err instanceof Error ? err.message : 'Failed to load dashboard';
        setError(message);
        setLoading(false);
      }
    }

    void loadDashboard();

    return () => {
      cancelled = true;
    };
  }, [gamesClient, predictorClient]);

  if (loading) {
    return <div>Loading dashboard...</div>;
  }

  if (error) {
    return (
      <div role="alert">
        Failed to load dashboard:
        {' '}
        {error}
      </div>
    );
  }

  if (games.length === 0) {
    return <div>No upcoming games.</div>;
  }

  return (
    <section aria-label="upcoming-games">
      <ul>
        {games.map((game) => (
          <li key={game.id}>
            <GameCard game={game} />
            {predictions[game.id] ? (
              <PredictionBadge prediction={predictions[game.id]} />
            ) : (
              <span>Loading prediction...</span>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

export default DashboardPage;
