import { useEffect, useMemo, useState } from "react";
import { Game } from "@nba-analytics-hub/types";
import { DashboardDataState, PredictionsByGameId } from "../types";
import { createGamesClient, createPredictorClient } from "@nba-analytics-hub/data-access";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

function toGameDate(dateIso: string): string {
  return new Date(dateIso).toISOString().slice(0, 10);
}

export function useDashboardData(): DashboardDataState {
    const [games, setGames] = useState<Game[]>([]);
    const [predictions, setPredictions] = useState<PredictionsByGameId>({});
    const [loadingGames, setLoadingGames] = useState<boolean>(true);
    const [loadingPredictions, setLoadingPredictions] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const gamesClient = useMemo(() => 
        createGamesClient({
            baseUrl: API_BASE_URL,
        }), [])

    const predictorClient = useMemo(() => 
        createPredictorClient({
            baseUrl: API_BASE_URL
        }), [])

    //loadUpcomingGames
    useEffect(() => {
        let cancelled = false;

        async function loadGames() {
            setLoadingGames(true);
            setError(null);

            try {
                const upcoming = await gamesClient.getGames();
                if (!cancelled) {
                    setGames(upcoming);
                }
            } catch (err) {
                if (!cancelled) {
                    const message = err instanceof Error ? err.message : 'Unknown error loading games.';
                    setError(`Failed to load dashboard: ${message}`);
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
    }, [gamesClient]);

    //loadPredictions after games available
    useEffect(() => {
        if (!games.length) return;

        let cancelled = false;

        async function loadPredictions() {
            setLoadingPredictions(true);
            setError(null);

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
                    const message = err instanceof Error ? err.message : 'Unknown error loading predictions.';
                    setError(`Failed to load dashboard: ${message}`);
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
        }
    }, [games, predictorClient]);

    return {
        games,
        predictions,
        loadingGames,
        loadingPredictions,
        error
    }
}
