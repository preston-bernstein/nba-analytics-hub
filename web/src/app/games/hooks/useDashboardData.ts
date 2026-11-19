import { useCallback, useState } from 'react';
import { keepPreviousData, useQueries, useQuery } from '@tanstack/react-query';
import type { Game } from '@nba-analytics-hub/games';
import type { PredictionResponse } from '@nba-analytics-hub/prediction';
import { getLocalTimeZone } from '@nba-analytics-hub/config';
import { getTodayDate, addDays } from '@nba-analytics-hub/platform';
import { DashboardDataState, PredictionsByGameId } from '../types';
import { createGamesClient } from '@nba-analytics-hub/games';
import { apiClientConfig } from '../../shared/apiConfig';
import { createPredictorClient } from '@nba-analytics-hub/prediction';

function toGameDate(dateIso: string): string {
  return new Date(dateIso).toISOString().slice(0, 10);
}

const gamesClient = createGamesClient(apiClientConfig);
const predictorClient = createPredictorClient(apiClientConfig);
const localTimeZone = getLocalTimeZone();
const NO_GAMES: Game[] = [];

/** Loads a prediction for each game, once the games for the day have arrived. */
function usePredictions(games: Game[], gamesReady: boolean) {
  const predictionQueries = useQueries({
    queries: (gamesReady ? games : NO_GAMES).map((game: Game) => {
      const req = {
        homeTeamId: game.homeTeam.id,
        awayTeamId: game.awayTeam.id,
        gameDate: toGameDate(game.startTime),
      };
      return {
        queryKey: ['prediction', req.homeTeamId, req.awayTeamId, req.gameDate],
        queryFn: () => predictorClient.predict(req),
        staleTime: Infinity,
      };
    }),
  });

  const predictions: PredictionsByGameId = {};
  predictionQueries.forEach((query, index) => {
    if (query.data) {
      predictions[games[index].id] = query.data as PredictionResponse;
    }
  });
  const failure = predictionQueries.find((query) => query.error)?.error as Error | undefined;

  return {
    predictions,
    loading: predictionQueries.some((query) => query.isPending),
    error: failure ? `Failed to load predictions: ${failure.message}` : null,
  };
}

function useSelectedDate() {
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDate());

  const goToPreviousDay = useCallback(() => {
    setSelectedDate((prev) => addDays(prev, -1));
  }, []);

  const goToNextDay = useCallback(() => {
    setSelectedDate((prev) => addDays(prev, 1));
  }, []);

  const goToToday = useCallback(() => {
    setSelectedDate(getTodayDate());
  }, []);

  return { selectedDate, goToPreviousDay, goToNextDay, goToToday };
}

export function useDashboardData(): DashboardDataState {
  const { selectedDate, goToPreviousDay, goToNextDay, goToToday } = useSelectedDate();

  const gamesQuery = useQuery({
    queryKey: ['games', selectedDate, localTimeZone],
    queryFn: () => gamesClient.getGames({ date: selectedDate, tz: localTimeZone }),
    // Keep showing the last day's games while the next day loads.
    placeholderData: keepPreviousData,
  });

  const games = gamesQuery.data ?? NO_GAMES;
  const gamesReady = gamesQuery.isSuccess && !gamesQuery.isPlaceholderData;
  const predictions = usePredictions(games, gamesReady);

  return {
    games,
    predictions: predictions.predictions,
    loadingGames: gamesQuery.isFetching && !gamesReady,
    loadingPredictions: predictions.loading,
    gamesError: gamesQuery.error ? `Failed to load dashboard: ${gamesQuery.error.message}` : null,
    predictionError: predictions.error,
    selectedDate,
    goToPreviousDay,
    goToNextDay,
    goToToday,
  };
}
