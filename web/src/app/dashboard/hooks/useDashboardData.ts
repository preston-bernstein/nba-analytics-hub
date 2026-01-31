import { useCallback, useEffect, useMemo, useState } from 'react';
import { Game } from '@nba-analytics-hub/types';
import { getLocalTimeZone } from '@nba-analytics-hub/config';
import { getTodayDate, addDays } from '@nba-analytics-hub/domain';
import { DashboardDataState, PredictionsByGameId } from '../types';
import {
  createGamesClient,
  createPredictorClient,
} from '@nba-analytics-hub/data-access';

export interface ApiConfig {
  baseUrl: string;
  basePath: string;
}

export function resolveApiConfig(
  env: ImportMetaEnv,
  locationOrigin?: string,
): ApiConfig {
  const explicitBaseUrl = env.VITE_API_BASE_URL;
  const hasExplicit = Boolean(explicitBaseUrl && explicitBaseUrl.trim());
  const fallbackBaseUrl = env.DEV
    ? 'http://localhost:3000'
    : locationOrigin ?? 'http://localhost:3000';

  return {
    baseUrl: hasExplicit ? explicitBaseUrl : fallbackBaseUrl,
    basePath: hasExplicit ? '' : env.DEV ? '' : '/api',
  };
}

const { baseUrl: API_BASE_URL, basePath: API_BASE_PATH } = resolveApiConfig(
  import.meta.env,
  typeof window !== 'undefined' ? window.location.origin : undefined,
);

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
        basePath: API_BASE_PATH,
      }),
    [],
  );

  const localTimeZone = useMemo(getLocalTimeZone, []);

  const predictorClient = useMemo(
    () =>
      createPredictorClient({
        baseUrl: API_BASE_URL,
        basePath: API_BASE_PATH,
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

      const finishLoadingGames = () => {
        /* c8 ignore next 3 - unmount guard */
        if (!cancelled) {
          setLoadingGames(false);
        }
      };

      try {
        const tz = localTimeZone;
        const upcoming = await gamesClient.getGames({ date: selectedDate, tz });
        /* c8 ignore next 3 - unmount guard */
        if (!cancelled) {
          setGames(upcoming);
        }
        finishLoadingGames();
      } catch (err) {
        /* c8 ignore next 5 - unmount guard */
        if (!cancelled) {
          const message =
            err instanceof Error ? err.message : 'Unknown error loading games.';
          setGamesError(`Failed to load dashboard: ${message}`);
        }
        finishLoadingGames();
      }
    }

    loadGames();

    return () => {
      cancelled = true;
    };
  }, [gamesClient, localTimeZone, selectedDate]);

  // Load predictions after games available
  useEffect(() => {
    if (!games.length) return;

    let cancelled = false;

    async function loadPredictions() {
      setLoadingPredictions(true);
      setPredictionError(null);

      const finishLoadingPredictions = () => {
        /* c8 ignore next 3 - unmount guard */
        if (!cancelled) {
          setLoadingPredictions(false);
        }
      };

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

        /* c8 ignore next 7 - unmount guard */
        if (!cancelled) {
          const byId: PredictionsByGameId = {};
          for (const [gameId, prediction] of results) {
            byId[gameId] = prediction;
          }
          setPredictions(byId);
        }
        finishLoadingPredictions();
      } catch (err) {
        /* c8 ignore next 6 - unmount guard */
        if (!cancelled) {
          const message =
            err instanceof Error
              ? err.message
              : 'Unknown error loading predictions.';
          setPredictionError(`Failed to load predictions: ${message}`);
        }
        finishLoadingPredictions();
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
