import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import type { Game, PredictionResponse } from '@nba-analytics-hub/types';
import { addDays, getTodayDate } from '@nba-analytics-hub/domain';
import { resolveApiConfig, useDashboardData } from './useDashboardData';

const mockGames: Game[] = [
  {
    id: 'game-1',
    provider: 'mock-provider',
    homeTeam: { id: 'ATL', name: 'Atlanta Hawks', externalId: 14 },
    awayTeam: { id: 'BOS', name: 'Boston Celtics', externalId: 2 },
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
  const { selectedDate, goToPreviousDay, goToNextDay, goToToday } =
    useDashboardData();

  return (
    <div>
      <span data-testid="selected-date">{selectedDate}</span>
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

    render(<HookHarness />);

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
});
