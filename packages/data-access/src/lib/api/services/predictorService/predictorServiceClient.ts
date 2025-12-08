import type {
  PredictorServiceErrorResponse,
  PredictorServicePredictQuery,
  PredictorServicePredictResponse,
} from '@nba-analytics-hub/types';

export interface PredictorServiceClientOptions {
  baseUrl: string; // Note: wire from the API env (e.g., PREDICTOR_SERVICE_URL) when integrating the BFF.
}

export interface PredictorServiceClient {
  predict(query: PredictorServicePredictQuery): Promise<PredictorServicePredictResponse>;
}

export function createPredictorServiceClient(
  options: PredictorServiceClientOptions,
): PredictorServiceClient {
  const { baseUrl } = options;

  return {
    async predict(
      query: PredictorServicePredictQuery,
    ): Promise<PredictorServicePredictResponse> {
      const url = new URL('/v1/predict', baseUrl);
      url.searchParams.set('home', query.home);
      url.searchParams.set('away', query.away);

      if (query.date) {
        url.searchParams.set('date', query.date);
      }

      const res = await fetch(url.toString());

      if (res.ok) {
        return (await res.json()) as PredictorServicePredictResponse;
      }

      if (res.status === 422) {
        let detail = 'Unprocessable predictor request';
        try {
          const body = (await res.json()) as Partial<PredictorServiceErrorResponse>;
          if (typeof body.detail === 'string' && body.detail.trim()) {
            detail = body.detail;
          }
        } catch {
          // ignore parse failures; fall back to generic detail
        }

        // TODO: revisit 422 handling once the BFF maps predictor errors for callers.
        throw new Error(`Predictor service returned 422: ${detail}`);
      }

      throw new Error(
        `Predictor service request failed with status ${res.status}`,
      );
    },
  };
}
