import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, beforeAll, afterEach, afterAll } from 'vitest';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import type { Game, PredictionResponse } from '@nba-analytics-hub/types';
import { DashboardPage } from './DashboardPage.tsx';

const API_BASE_URL = 'http://localhost:3000';

const mockGames: Game[] = [
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

const server = setupServer(
  http.get(`${API_BASE_URL}/games/upcoming`, () => {
    return HttpResponse.json(mockGames);
  }),
  http.get(`${API_BASE_URL}/predict`, ({ request }) => {
    const url = new URL(request.url);
    const homeTeam = url.searchParams.get('home_team');
    const awayTeam = url.searchParams.get('away_team');

    if (!homeTeam || !awayTeam) {
      return HttpResponse.json(
        { error: 'missing teams' },
        { status: 400 },
      );
    }

    const prediction: PredictionResponse = {
      homeTeamId: homeTeam,
      awayTeamId: awayTeam,
      homeWinProbability: 0.7,
      awayWinProbability: 0.3,
      modelVersion: 'test-model',
    };

    return HttpResponse.json(prediction);
  }),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('DashboardPage', () => {
  it('renders upcoming games and their predictions', async () => {
    // Force the same base URL as the component fallback to keep things aligned
    const meta = import.meta as unknown as { env: Record<string, unknown> };
    meta.env = {
      ...meta.env,
      VITE_API_BASE_URL: API_BASE_URL,
    };

    render(<DashboardPage />);

    expect(screen.getByText(/Loading dashboard.../i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByLabelText('upcoming-games')).toBeInTheDocument();
    });

    // games rendered via GameCard
    expect(screen.getByText(/BOS @ ATL/)).toBeInTheDocument();
    expect(screen.getByText(/GSW @ LAL/)).toBeInTheDocument();

    // predictions rendered via PredictionBadge (async after games)
    await waitFor(() => {
      expect(screen.getAllByLabelText('prediction-badge').length).toBe(2);
      expect(screen.getAllByText(/70%/).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/30%/).length).toBeGreaterThan(0);
    });
  });

  it('shows an error message when the API fails', async () => {
    server.use(
      http.get(`${API_BASE_URL}/games/upcoming`, () =>
        HttpResponse.json({ error: 'Server down' }, { status: 500 }),
      ),
    );

    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    expect(
      screen.getByText(/Failed to load dashboard:/i),
    ).toBeInTheDocument();
  });
});
