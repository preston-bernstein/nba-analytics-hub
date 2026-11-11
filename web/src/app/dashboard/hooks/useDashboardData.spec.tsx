import { fireEvent, screen, waitFor } from '@testing-library/react';
import { renderWithQueryClient } from '../../../test-utils/renderWithQueryClient';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import type { Game } from '@nba-analytics-hub/games';
import type { PredictionResponse } from '@nba-analytics-hub/prediction';
import { addDays, getTodayDate } from '@nba-analytics-hub/platform';
import { resolveApiConfig, useDashboardData } from './useDashboardData';

const mockGames: Game[] = [
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
];

const mockPrediction: PredictionResponse = {
  homeTeamId: 'ATL',
  awayTeamId: 'BOS',
  homeWinProbability: 0.7,
  awayWinProbability: 0.3,
  modelVersion: 'test-model',
};

const server = setupServer(
  http.get('*/games', () => HttpResponse.json(mockGames)),
  http.get('*/predict', () => HttpResponse.json(mockPrediction)),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function HookHarness() {
  const {
    selectedDate,
    games,
    predictions,
    loadingGames,
    goToPreviousDay,
    goToNextDay,
    goToToday,
  } = useDashboardData();

  return (
    <div>
      <span data-testid="selected-date">{selectedDate}</span>
      <span data-testid="games-count">{games.length}</span>
      <span data-testid="predictions-count">{Object.keys(predictions).length}</span>
      <span data-testid="loading-games">{String(loadingGames)}</span>
      <button onClick={goToPreviousDay} type="button">
        Prev
      </button>
      <button onClick={goToNextDay} type="button">
        Next
      </button>
      <button onClick={goToToday} type="button">
        Today
      </button>
    </div>
  );
}

describe('resolveApiConfig', () => {
  it('prefers explicit base URL and clears the base path', () => {
    const config = resolveApiConfig(
      {
        DEV: false,
        VITE_API_BASE_URL: 'https://api.example.com',
      } as ImportMetaEnv,
      'https://app.example.com',
    );

    expect(config.baseUrl).toBe('https://api.example.com');
    expect(config.basePath).toBe('');
  });

  it('uses localhost defaults in dev when no explicit base URL is set', () => {
    const config = resolveApiConfig(
      {
        DEV: true,
        VITE_API_BASE_URL: '',
      } as ImportMetaEnv,
      'https://app.example.com',
    );

    expect(config.baseUrl).toBe('http://localhost:3000');
    expect(config.basePath).toBe('');
  });

  it('uses the window origin and /api base path in production', () => {
    const config = resolveApiConfig(
      {
        DEV: false,
        VITE_API_BASE_URL: '',
      } as ImportMetaEnv,
      'https://app.example.com',
    );

    expect(config.baseUrl).toBe('https://app.example.com');
    expect(config.basePath).toBe('/api');
  });

  it('treats whitespace-only explicit base URLs as empty', () => {
    const config = resolveApiConfig(
      {
        DEV: false,
        VITE_API_BASE_URL: '   ',
      } as ImportMetaEnv,
      'https://app.example.com',
    );

    expect(config.baseUrl).toBe('https://app.example.com');
    expect(config.basePath).toBe('/api');
  });

  it('falls back to localhost when no window origin is available', () => {
    const config = resolveApiConfig(
      {
        DEV: false,
        VITE_API_BASE_URL: '',
      } as ImportMetaEnv,
    );

    expect(config.baseUrl).toBe('http://localhost:3000');
    expect(config.basePath).toBe('/api');
  });
});

describe('useDashboardData', () => {
  it('updates selectedDate via navigation helpers', async () => {
    const today = getTodayDate();
    const yesterday = addDays(today, -1);
    const tomorrow = addDays(today, 1);

    renderWithQueryClient(<HookHarness />);

    await waitFor(() => {
      expect(screen.getByTestId('selected-date')).toHaveTextContent(today);
    });

    fireEvent.click(screen.getByRole('button', { name: 'Prev' }));
    await waitFor(() => {
      expect(screen.getByTestId('selected-date')).toHaveTextContent(yesterday);
    });

    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    await waitFor(() => {
      expect(screen.getByTestId('selected-date')).toHaveTextContent(today);
    });

    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    await waitFor(() => {
      expect(screen.getByTestId('selected-date')).toHaveTextContent(tomorrow);
    });

    fireEvent.click(screen.getByRole('button', { name: 'Today' }));
    await waitFor(() => {
      expect(screen.getByTestId('selected-date')).toHaveTextContent(today);
    });
  });

  it('serves a date it has already loaded from the cache', async () => {
    let gamesRequests = 0;
    let predictRequests = 0;
    server.use(
      http.get('*/games', () => {
        gamesRequests += 1;
        return HttpResponse.json(mockGames);
      }),
      http.get('*/predict', () => {
        predictRequests += 1;
        return HttpResponse.json(mockPrediction);
      }),
    );

    renderWithQueryClient(<HookHarness />);
    await waitFor(() => expect(screen.getByTestId('games-count')).toHaveTextContent('1'));
    await waitFor(() => expect(screen.getByTestId('predictions-count')).toHaveTextContent('1'));

    fireEvent.click(screen.getByRole('button', { name: 'Prev' }));
    await waitFor(() => expect(gamesRequests).toBe(2));
    await waitFor(() => expect(screen.getByTestId('loading-games')).toHaveTextContent('false'));

    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    await waitFor(() => expect(screen.getByTestId('games-count')).toHaveTextContent('1'));

    // Today was cached: no new games request, and the same matchup's
    // prediction is not fetched again.
    expect(gamesRequests).toBe(2);
    expect(predictRequests).toBe(1);
  });
});

