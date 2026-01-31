import { describe, it, expect } from 'vitest';
import type { PredictionRequest } from '@nba-analytics-hub/types';
import { createPredictorClient } from './predictorClient';
import { mockFetch } from '../../test-files/helpers';
import { mockPredictionResponse } from '../../test-files/fixtures';

const BASE_URL = 'https://example.com';

describe('createPredictorClient', () => {
  const fetchMock = mockFetch();

  it('calls /predict with correct query params and returns parsed response on success', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockPredictionResponse,
    });

    const client = createPredictorClient({ baseUrl: BASE_URL });

    const req: PredictionRequest = {
      homeTeamId: 'ATL',
      awayTeamId: 'BOS',
      gameDate: '2025-01-01',
    };

    const result = await client.predict(req);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const calledUrl = new URL((fetchMock.mock.calls[0] as [string])[0]);

    expect(calledUrl.origin + calledUrl.pathname).toBe(`${BASE_URL}/predict`);
    expect(calledUrl.searchParams.get('home_team')).toBe(req.homeTeamId);
    expect(calledUrl.searchParams.get('away_team')).toBe(req.awayTeamId);
    expect(calledUrl.searchParams.get('game_date')).toBe(req.gameDate);

    expect(result).toEqual(mockPredictionResponse);
  });

  it('prefixes requests with a normalized basePath', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockPredictionResponse,
    });

    const client = createPredictorClient({ baseUrl: BASE_URL, basePath: '/api/' });

    const req: PredictionRequest = {
      homeTeamId: 'ATL',
      awayTeamId: 'BOS',
      gameDate: '2025-01-01',
    };

    const result = await client.predict(req);

    const calledUrl = new URL((fetchMock.mock.calls[0] as [string])[0]);
    expect(calledUrl.origin + calledUrl.pathname).toBe(`${BASE_URL}/api/predict`);
    expect(result).toEqual(mockPredictionResponse);
  });

  it('keeps the base path when no trailing slash is present', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockPredictionResponse,
    });

    const client = createPredictorClient({ baseUrl: BASE_URL, basePath: '/api' });

    const req: PredictionRequest = {
      homeTeamId: 'ATL',
      awayTeamId: 'BOS',
      gameDate: '2025-01-01',
    };

    const result = await client.predict(req);

    const calledUrl = new URL((fetchMock.mock.calls[0] as [string])[0]);
    expect(calledUrl.origin + calledUrl.pathname).toBe(`${BASE_URL}/api/predict`);
    expect(result).toEqual(mockPredictionResponse);
  });

  it('ignores basePath values that are only whitespace', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockPredictionResponse,
    });

    const client = createPredictorClient({ baseUrl: BASE_URL, basePath: '   ' });

    const req: PredictionRequest = {
      homeTeamId: 'ATL',
      awayTeamId: 'BOS',
      gameDate: '2025-01-01',
    };

    const result = await client.predict(req);

    const calledUrl = new URL((fetchMock.mock.calls[0] as [string])[0]);
    expect(calledUrl.origin + calledUrl.pathname).toBe(`${BASE_URL}/predict`);
    expect(result).toEqual(mockPredictionResponse);
  });

  it('throws a descriptive error when the predictor returns a non-OK status', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 503,
      json: async () => ({}),
    });

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

  it('propagates fetch rejections (network errors)', async () => {
    fetchMock.mockRejectedValue(new Error('network down'));

    const client = createPredictorClient({ baseUrl: BASE_URL });

    const req: PredictionRequest = {
      homeTeamId: 'ATL',
      awayTeamId: 'BOS',
      gameDate: '2025-01-01',
    };

    await expect(client.predict(req)).rejects.toThrow('network down');
  });
});
