import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, beforeAll, afterEach, afterAll, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import type { Game, PredictionResponse } from '@nba-analytics-hub/types';
import { DashboardPage } from './DashboardPage.tsx';

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

// Use wildcard to match any host (localhost:3000 or localhost:80)
const server = setupServer(
  http.get('*/games', ({ request }) => {
    const url = new URL(request.url);
    if (!url.searchParams.get('date')) {
      return HttpResponse.json({ error: 'missing date' }, { status: 400 });
    }
    if (!url.searchParams.get('tz')) {
      return HttpResponse.json({ error: 'missing tz' }, { status: 400 });
    }
    return HttpResponse.json(mockGames);
  }),
  http.get('*/predict', ({ request }) => {
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
  it(
    'renders games and their predictions',
    async () => {
      render(<DashboardPage />);

      // Header and date navigation should always be visible
      expect(screen.getByLabelText('games-dashboard')).toBeInTheDocument();
      expect(screen.getByText('Games')).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.getByText('Atlanta Hawks')).toBeInTheDocument();
      });

      expect(screen.getByText('Boston Celtics')).toBeInTheDocument();
      expect(screen.getByText('Los Angeles Lakers')).toBeInTheDocument();
      expect(screen.getByText('Golden State Warriors')).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.getAllByText(/70%/).length).toBeGreaterThan(0);
        expect(screen.getAllByText(/30%/).length).toBeGreaterThan(0);
      });
    },
    15000,
  );

  it('shows an error message when the games API fails but keeps header visible', async () => {
    server.use(
      http.get('*/games', () =>
        HttpResponse.json({ error: 'Server down' }, { status: 500 }),
      ),
    );

    render(<DashboardPage />);

    // Header should always be visible even on error
    expect(screen.getByText('Games')).toBeInTheDocument();
    expect(screen.getByLabelText('Previous day')).toBeInTheDocument();
    expect(screen.getByLabelText('Next day')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    expect(
      screen.getByText(/Failed to load dashboard:/i),
    ).toBeInTheDocument();
  });

  it('shows an error message when predictions fail', async () => {
    server.use(
      http.get('*/predict', () =>
        HttpResponse.json({ error: 'Predictor down' }, { status: 500 }),
      ),
    );

    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Atlanta Hawks')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText(/Predictions unavailable:/i)).toBeInTheDocument();
    });

    // Games error shows alert role, prediction error doesn't
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('shows empty state when no games are scheduled', async () => {
    server.use(http.get('*/games', () => HttpResponse.json([])));

    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText(/No games scheduled/i)).toBeInTheDocument();
    });
  });

  it('shows singular "game" text when exactly one game is scheduled', async () => {
    server.use(
      http.get('*/games', () => HttpResponse.json([mockGames[0]])),
    );

    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('1 game scheduled')).toBeInTheDocument();
    });
  });

  it('shows loading predictions badge while fetching predictions', async () => {
    // Delay predictions response significantly to catch the loading state
    server.use(
      http.get('*/predict', async () => {
        await new Promise((r) => setTimeout(r, 500));
        return HttpResponse.json({
          homeTeamId: 'ATL',
          awayTeamId: 'BOS',
          homeWinProbability: 0.6,
          awayWinProbability: 0.4,
          modelVersion: 'test',
        });
      }),
    );

    render(<DashboardPage />);

    // Wait for games to load first
    await waitFor(() => {
      expect(screen.getByText('Atlanta Hawks')).toBeInTheDocument();
    });

    // Check for loading predictions badge (may appear briefly)
    await waitFor(
      () => {
        expect(screen.getByText('Loading predictions...')).toBeInTheDocument();
      },
      { timeout: 1000 },
    );

    // Wait for predictions to finish loading
    await waitFor(
      () => {
        expect(
          screen.queryByText('Loading predictions...'),
        ).not.toBeInTheDocument();
      },
      { timeout: 2000 },
    );
  });
});
