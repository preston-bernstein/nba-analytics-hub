import { useCallback, useState } from 'react';
import { keepPreviousData, useQueries, useQuery } from '@tanstack/react-query';
import type { Game } from '@nba-analytics-hub/games';
import type { PredictionResponse } from '@nba-analytics-hub/prediction';
import { getLocalTimeZone } from '@nba-analytics-hub/config';
import { getTodayDate, addDays } from '@nba-analytics-hub/platform';
import { DashboardDataState, PredictionsByGameId } from '../types';
import { createGamesClient } from '@nba-analytics-hub/games';
import { apiClientConfig } from '../../apiConfig';
import { createPredictorClient } from '@nba-analytics-hub/prediction';

function toGameDate(dateIso: string): string {
  return new Date(dateIso).toISOString().slice(0, 10);
}

const gamesClient = createGamesClient(apiClientConfig);
const predictorClient = createPredictorClient(apiClientConfig);
const localTimeZone = getLocalTimeZone();
const NO_GAMES: Game[] = [];

export function useDashboardData(): DashboardDataState {
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDate());

  const gamesQuery = useQuery({
    queryKey: ['games', selectedDate, localTimeZone],
    queryFn: () => gamesClient.getGames({ date: selectedDate, tz: localTimeZone }),
    // Keep showing the last day's games while the next day loads.
    placeholderData: keepPreviousData,
  });

  const games = gamesQuery.data ?? NO_GAMES;
  const gamesReady = gamesQuery.isSuccess && !gamesQuery.isPlaceholderData;

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
  const predictionFailure = predictionQueries.find((query) => query.error)?.error as
    | Error
    | undefined;

  const goToPreviousDay = useCallback(() => {
    setSelectedDate((prev) => addDays(prev, -1));
  }, []);

  const goToNextDay = useCallback(() => {
    setSelectedDate((prev) => addDays(prev, 1));
  }, []);

  const goToToday = useCallback(() => {
    setSelectedDate(getTodayDate());
  }, []);

  return {
    games,
    predictions,
    loadingGames: gamesQuery.isFetching && !gamesReady,
    loadingPredictions: predictionQueries.some((query) => query.isPending),
    gamesError: gamesQuery.error ? `Failed to load dashboard: ${gamesQuery.error.message}` : null,
    predictionError: predictionFailure
      ? `Failed to load predictions: ${predictionFailure.message}`
      : null,
    selectedDate,
    goToPreviousDay,
    goToNextDay,
    goToToday,
  };
}
