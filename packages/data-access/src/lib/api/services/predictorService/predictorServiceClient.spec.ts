import { describe, expect, it } from 'vitest';
import type {
  PredictorServicePredictQuery,
  PredictorServicePredictResponse,
} from '@nba-analytics-hub/types';
import { createPredictorServiceClient } from './predictorServiceClient';
import { predictorResponse } from '../../test-files/fixtures';
import { mockFetch } from '../../test-files/helpers';

const BASE_URL = 'https://predictor-service.example.com';

describe('createPredictorServiceClient', () => {
  const fetchMock = mockFetch();

  it('calls /v1/predict with correct query params and returns parsed response on success', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => predictorResponse,
    });

    const client = createPredictorServiceClient({ baseUrl: BASE_URL });

    const query: PredictorServicePredictQuery = {
      home: 'NYK',
      away: 'BOS',
      date: '2025-02-01',
    };

    const result = await client.predict(query);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const calledUrl = new URL((fetchMock.mock.calls[0] as [string])[0]);
    expect(calledUrl.origin + calledUrl.pathname).toBe(
      `${BASE_URL}/v1/predict`,
    );
    expect(calledUrl.searchParams.get('home')).toBe(query.home);
    expect(calledUrl.searchParams.get('away')).toBe(query.away);
    expect(calledUrl.searchParams.get('date')).toBe(query.date);

    expect(result).toEqual(predictorResponse);
  });

  it('omits date when not provided and URL-encodes params', async () => {
    const mockResponse: PredictorServicePredictResponse = {
      home_team: 'NY Knicks',
      away_team: 'BOS',
      as_of: null,
      features: {
        delta_off: 0.5,
        delta_def: 0.1,
      },
      prob_home_win: 0.55,
    };

    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockResponse,
    });

    const client = createPredictorServiceClient({ baseUrl: BASE_URL });

    const query: PredictorServicePredictQuery = {
      home: 'NY Knicks',
      away: 'BOS',
    };

    const result = await client.predict(query);

    const calledUrl = new URL((fetchMock.mock.calls[0] as [string])[0]);
    expect(calledUrl.searchParams.get('date')).toBeNull();
    expect(calledUrl.searchParams.get('home')).toBe('NY Knicks');
    expect(result).toEqual(mockResponse);
  });

  it('throws a descriptive error when the predictor service returns 422 with detail', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 422,
      json: async () => ({ detail: 'Unknown team code' }),
    });

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

  it('throws a generic 422 error when detail is missing or unparsable', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 422,
      json: async () => ({}),
    });

    const client = createPredictorServiceClient({ baseUrl: BASE_URL });

    await expect(
      client.predict({ home: 'NYK', away: 'BOS' }),
    ).rejects.toThrow('Predictor service returned 422: Unprocessable predictor request');
  });

  it('throws a generic 422 error when parsing the body fails', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 422,
      json: async () => {
        throw new Error('boom');
      },
    });

    const client = createPredictorServiceClient({ baseUrl: BASE_URL });

    await expect(
      client.predict({ home: 'NYK', away: 'BOS' }),
    ).rejects.toThrow('Predictor service returned 422: Unprocessable predictor request');
  });

  it('throws a descriptive error when the predictor service returns non-OK', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 503,
      json: async () => ({}),
    });

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
