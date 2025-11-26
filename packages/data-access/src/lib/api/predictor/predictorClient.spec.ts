import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { PredictionRequest, PredictionResponse } from '@nba-analytics-hub/types';
import { createPredictorClient } from './predictorClient';

const BASE_URL = 'https://example.com';

describe('createPredictorClient', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    // ensure no stale mocks
    (globalThis as any).fetch = vi.fn();
  });

  afterEach(() => {
    (globalThis as any).fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('calls /predict with correct query params and returns parsed response on success', async () => {
    const mockResponse: PredictionResponse = {
      homeTeamId: 'ATL',
      awayTeamId: 'BOS',
      homeWinProbability: 0.72,
      awayWinProbability: 0.28,
      modelVersion: 'v1-test',
    };

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockResponse,
    });

    (globalThis as any).fetch = mockFetch;

    const client = createPredictorClient({ baseUrl: BASE_URL });

    const req: PredictionRequest = {
      homeTeamId: 'ATL',
      awayTeamId: 'BOS',
      gameDate: '2025-01-01',
    };

    const result = await client.predict(req);

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const calledUrl = new URL((mockFetch.mock.calls[0] as [string])[0]);

    expect(calledUrl.origin + calledUrl.pathname).toBe(`${BASE_URL}/predict`);
    expect(calledUrl.searchParams.get('home_team')).toBe(req.homeTeamId);
    expect(calledUrl.searchParams.get('away_team')).toBe(req.awayTeamId);
    expect(calledUrl.searchParams.get('game_date')).toBe(req.gameDate);

    expect(result).toEqual(mockResponse);
  });

  it('throws a descriptive error when the predictor returns a non-OK status', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 503,
      json: async () => ({}),
    });

    (globalThis as any).fetch = mockFetch;

    const client = createPredictorClient({ baseUrl: BASE_URL });

    const req: PredictionRequest = {
      homeTeamId: 'ATL',
      awayTeamId: 'BOS',
      gameDate: '2025-01-01',
    };

    await expect(client.predict(req)).rejects.toThrow(
      'Predictor request failed with status 503',
    );
  });
});
