import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type {
  PredictorServicePredictQuery,
  PredictorServicePredictResponse,
} from '@nba-analytics-hub/types';
import { createPredictorServiceClient } from './predictorServiceClient';

const BASE_URL = 'https://predictor-service.example.com';

describe('createPredictorServiceClient', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    (globalThis as any).fetch = vi.fn();
  });

  afterEach(() => {
    (globalThis as any).fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('calls /v1/predict with correct query params and returns parsed response on success', async () => {
    const mockResponse: PredictorServicePredictResponse = {
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

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockResponse,
    });

    (globalThis as any).fetch = mockFetch;

    const client = createPredictorServiceClient({ baseUrl: BASE_URL });

    const query: PredictorServicePredictQuery = {
      home: 'NYK',
      away: 'BOS',
      date: '2025-02-01',
    };

    const result = await client.predict(query);

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const calledUrl = new URL((mockFetch.mock.calls[0] as [string])[0]);
    expect(calledUrl.origin + calledUrl.pathname).toBe(
      `${BASE_URL}/v1/predict`,
    );
    expect(calledUrl.searchParams.get('home')).toBe(query.home);
    expect(calledUrl.searchParams.get('away')).toBe(query.away);
    expect(calledUrl.searchParams.get('date')).toBe(query.date);

    expect(result).toEqual(mockResponse);
  });

  it('throws a descriptive error when the predictor service returns 422 with detail', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 422,
      json: async () => ({ detail: 'Unknown team code' }),
    });

    (globalThis as any).fetch = mockFetch;

    const client = createPredictorServiceClient({ baseUrl: BASE_URL });

    const query: PredictorServicePredictQuery = {
      home: 'XYZ',
      away: 'BOS',
      date: '2025-02-01',
    };

    await expect(client.predict(query)).rejects.toThrow(
      'Predictor service returned 422: Unknown team code',
    );
  });

  it('throws a descriptive error when the predictor service returns non-OK', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 503,
      json: async () => ({}),
    });

    (globalThis as any).fetch = mockFetch;

    const client = createPredictorServiceClient({ baseUrl: BASE_URL });

    const query: PredictorServicePredictQuery = {
      home: 'NYK',
      away: 'BOS',
    };

    await expect(client.predict(query)).rejects.toThrow(
      'Predictor service request failed with status 503',
    );
  });
});
