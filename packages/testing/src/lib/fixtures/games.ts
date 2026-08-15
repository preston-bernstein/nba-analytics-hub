import type { Game } from '@nba-analytics-hub/types';

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
