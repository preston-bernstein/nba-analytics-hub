import type {
  Game,
  GamesServiceGame,
  GamesServiceHealthResponse,
  GamesServiceTodayResponse,
  PredictionResponse,
  PredictorServicePredictResponse,
} from '@nba-analytics-hub/types';

export const healthOk: GamesServiceHealthResponse = { status: 'ok' };

export const todayResponse: GamesServiceTodayResponse = {
  date: '2025-01-01',
  games: [
    {
      id: 'game-1',
      provider: 'ball_dont_lie',
      homeTeam: { id: 'ATL', name: 'Atlanta Hawks', externalId: 14 },
      awayTeam: { id: 'BOS', name: 'Boston Celtics', externalId: 2 },
      startTime: '2025-01-01T00:00:00Z',
      status: 'SCHEDULED',
      score: { home: 0, away: 0 },
      meta: { season: '2024-2025', upstreamGameId: 12345 },
    },
  ],
};

export const gameDetail: GamesServiceGame = {
  id: 'game-2',
  provider: 'ball_dont_lie',
  homeTeam: { id: 'NYK', name: 'New York Knicks', externalId: 9 },
  awayTeam: { id: 'MIA', name: 'Miami Heat', externalId: 6 },
  startTime: '2025-01-02T01:00:00Z',
  status: 'IN_PROGRESS',
  score: { home: 75, away: 72 },
  meta: { season: '2024-2025', upstreamGameId: 54321 },
};

export const predictorResponse: PredictorServicePredictResponse = {
  home_team: 'NYK',
  away_team: 'BOS',
  as_of: '2025-02-01',
  features: {
    delta_off: 1.2,
    delta_def: -0.3,
    delta_rest: 0.5,
    delta_elo: 15.7,
  },
  prob_home_win: 0.63,
};

export const mockGames: Game[] = [
  {
    id: 'game-1',
    provider: 'mock-provider',
    homeTeam: { id: 'ATL', name: 'Atlanta Hawks', externalId: 14 },
    awayTeam: { id: 'BOS', name: 'Boston Celtics', externalId: 2 },
    startTime: '2025-01-01T00:00:00Z',
    status: 'SCHEDULED',
    score: { home: 0, away: 0 },
    meta: { season: '2024-2025', upstreamGameId: 1111 },
  },
  {
    id: 'game-2',
    provider: 'mock-provider',
    homeTeam: { id: 'LAL', name: 'Los Angeles Lakers', externalId: 13 },
    awayTeam: { id: 'GSW', name: 'Golden State Warriors', externalId: 10 },
    startTime: '2025-01-02T02:00:00Z',
    status: 'SCHEDULED',
    score: { home: 0, away: 0 },
    meta: { season: '2024-2025', upstreamGameId: 2222 },
  },
];

export const mockPredictionResponse: PredictionResponse = {
  homeTeamId: 'ATL',
  awayTeamId: 'BOS',
  homeWinProbability: 0.72,
  awayWinProbability: 0.28,
  modelVersion: 'v1-test',
};
