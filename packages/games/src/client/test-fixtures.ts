import type { Game } from '../types/game.js';
import type { GamesServiceGame } from '../types/service/game.js';
import type {
  GamesServiceHealthResponse,
  GamesServiceTodayResponse,
} from '../types/service/responses.js';

export const healthOk: GamesServiceHealthResponse = { status: 'ok' };

export const todayResponse: GamesServiceTodayResponse = {
  date: '2025-01-01',
  games: [
    {
      id: 'game-1',
      provider: 'ball_dont_lie',
      homeTeam: { id: 'ATL', name: 'Atlanta Hawks' },
      awayTeam: { id: 'BOS', name: 'Boston Celtics' },
      startTime: '2025-01-01T00:00:00Z',
      status: 'Scheduled',
      statusKind: 'SCHEDULED',
      score: { home: 0, away: 0 },
      meta: { season: '2024-2025', upstreamGameId: 12345 },
    },
  ],
};

export const gameDetail: GamesServiceGame = {
  id: 'game-2',
  provider: 'ball_dont_lie',
  homeTeam: { id: 'NYK', name: 'New York Knicks' },
  awayTeam: { id: 'MIA', name: 'Miami Heat' },
  startTime: '2025-01-02T01:00:00Z',
  status: 'In Progress',
  statusKind: 'IN_PROGRESS',
  score: { home: 75, away: 72 },
  meta: { season: '2024-2025', upstreamGameId: 54321 },
};

export const mockGames: Game[] = [
  {
    id: 'game-1',
    provider: 'mock-provider',
    homeTeam: { id: 'ATL', name: 'Atlanta Hawks' },
    awayTeam: { id: 'BOS', name: 'Boston Celtics' },
    startTime: '2025-01-01T00:00:00Z',
    status: 'Scheduled',
    statusKind: 'SCHEDULED',
    score: { home: 0, away: 0 },
    meta: { season: '2024-2025', upstreamGameId: 1111 },
  },
  {
    id: 'game-2',
    provider: 'mock-provider',
    homeTeam: { id: 'LAL', name: 'Los Angeles Lakers' },
    awayTeam: { id: 'GSW', name: 'Golden State Warriors' },
    startTime: '2025-01-02T02:00:00Z',
    status: 'Scheduled',
    statusKind: 'SCHEDULED',
    score: { home: 0, away: 0 },
    meta: { season: '2024-2025', upstreamGameId: 2222 },
  },
];
