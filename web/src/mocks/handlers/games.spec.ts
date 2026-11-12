import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { mockGames } from '@nba-analytics-hub/games';
import type { PredictionResponse } from '@nba-analytics-hub/prediction';
import { server } from '../server';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('mock games and prediction handlers', () => {
  it('returns the mock games', async () => {
    const res = await fetch('http://localhost/games?date=2025-01-01&tz=UTC');
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(mockGames);
  });

  it('returns a prediction whose two probabilities add up to 1', async () => {
    const res = await fetch(
      'http://localhost/predict?homeTeamId=ATL&awayTeamId=BOS&gameDate=2025-01-01'
    );
    const body = (await res.json()) as PredictionResponse;
    expect(res.status).toBe(200);
    expect(body).toMatchObject({ homeTeamId: 'ATL', awayTeamId: 'BOS' });
    expect(body.homeWinProbability + body.awayWinProbability).toBeCloseTo(1);
  });

  it('gives the same prediction for the same teams', async () => {
    const url = 'http://localhost/predict?homeTeamId=LAL&awayTeamId=GSW&gameDate=2025-01-02';
    const a = await (await fetch(url)).json();
    const b = await (await fetch(url)).json();
    expect(a).toEqual(b);
  });

  it('still answers a prediction request that has no team ids', async () => {
    const res = await fetch('http://localhost/predict');
    const body = (await res.json()) as PredictionResponse;
    expect(res.status).toBe(200);
    expect(body.homeWinProbability + body.awayWinProbability).toBeCloseTo(1);
  });
});
