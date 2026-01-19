import { useCallback, useEffect, useMemo, useState } from 'react';
import { Game } from '@nba-analytics-hub/types';
import { getTodayDate, addDays } from '@nba-analytics-hub/domain';
import { DashboardDataState, PredictionsByGameId } from '../types';
import {
  createGamesClient,
  createPredictorClient,
} from '@nba-analytics-hub/data-access';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

function toGameDate(dateIso: string): string {
  return new Date(dateIso).toISOString().slice(0, 10);
}

export function useDashboardData(): DashboardDataState {
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDate());
  const [games, setGames] = useState<Game[]>([]);
  const [predictions, setPredictions] = useState<PredictionsByGameId>({});
  const [loadingGames, setLoadingGames] = useState<boolean>(true);
  const [loadingPredictions, setLoadingPredictions] = useState<boolean>(false);
  const [gamesError, setGamesError] = useState<string | null>(null);
  const [predictionError, setPredictionError] = useState<string | null>(null);

  const gamesClient = useMemo(
    () =>
      createGamesClient({
        baseUrl: API_BASE_URL,
      }),
    [],
  );

  const predictorClient = useMemo(
    () =>
      createPredictorClient({
        baseUrl: API_BASE_URL,
      }),
    [],
  );

  const goToPreviousDay = useCallback(() => {
    setSelectedDate((prev) => addDays(prev, -1));
  }, []);

  const goToNextDay = useCallback(() => {
    setSelectedDate((prev) => addDays(prev, 1));
  }, []);

  const goToToday = useCallback(() => {
    setSelectedDate(getTodayDate());
  }, []);

  // Load games for selected date
  useEffect(() => {
    let cancelled = false;

    async function loadGames() {
      setLoadingGames(true);
      setGamesError(null);
      setPredictions({});
      setPredictionError(null);

      try {
        const upcoming = await gamesClient.getGames({ date: selectedDate });
        if (!cancelled) {
          setGames(upcoming);
        }
      } catch (err) {
        if (!cancelled) {
          const message =
            err instanceof Error ? err.message : 'Unknown error loading games.';
          setGamesError(`Failed to load dashboard: ${message}`);
        }
      } finally {
        if (!cancelled) {
          setLoadingGames(false);
        }
      }
    }

    loadGames();

    return () => {
      cancelled = true;
    };
  }, [gamesClient, selectedDate]);

  // Load predictions after games available
  useEffect(() => {
    if (!games.length) return;

    let cancelled = false;

    async function loadPredictions() {
      setLoadingPredictions(true);
      setPredictionError(null);

      try {
        const requests = games.map(async (game) => {
          const req = {
            homeTeamId: game.homeTeam.id,
            awayTeamId: game.awayTeam.id,
            gameDate: toGameDate(game.startTime),
          };

          const prediction = await predictorClient.predict(req);
          return [game.id, prediction] as const;
        });

        const results = await Promise.all(requests);

        if (!cancelled) {
          const byId: PredictionsByGameId = {};
          for (const [gameId, prediction] of results) {
            byId[gameId] = prediction;
          }
          setPredictions(byId);
        }
      } catch (err) {
        if (!cancelled) {
          const message =
            err instanceof Error
              ? err.message
              : 'Unknown error loading predictions.';
          setPredictionError(`Failed to load predictions: ${message}`);
        }
      } finally {
        if (!cancelled) {
          setLoadingPredictions(false);
        }
      }
    }

    loadPredictions();

    return () => {
      cancelled = true;
    };
  }, [games, predictorClient]);

  return {
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
  };
}
