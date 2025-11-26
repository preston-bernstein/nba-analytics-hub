import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, beforeAll, afterEach, afterAll } from 'vitest';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import type { Game, PredictionResponse } from '@nba-analytics-hub/types';
import { DashboardPage } from './DashboardPage';

const API_BASE_URL = 'http://localhost:3000';

const mockGames: Game[] = [
  {
    id: 'game-1',
    homeTeamId: 'ATL',
    awayTeamId: 'BOS',
    startTimeUtc: '2025-01-01T00:00:00Z',
  },
  {
    id: 'game-2',
    homeTeamId: 'LAL',
    awayTeamId: 'GSW',
    startTimeUtc: '2025-01-02T02:00:00Z',
  },
];

const server = setupServer(
  http.get(`${API_BASE_URL}/games/upcoming`, () => {
    return HttpResponse.json(mockGames);
  }),
  http.get(`${API_BASE_URL}/predict`, ({ request }) => {
    const url = new URL(request.url);
    const homeTeam = url.searchParams.get('home_team')!;
    const awayTeam = url.searchParams.get('away_team')!;

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
    (import.meta as any).env = {
      ...(import.meta as any).env,
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

    // predictions rendered via PredictionBadge
    expect(screen.getAllByLabelText('prediction-badge').length).toBe(2);
    expect(screen.getAllByText(/70%/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/30%/).length).toBeGreaterThan(0);
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
