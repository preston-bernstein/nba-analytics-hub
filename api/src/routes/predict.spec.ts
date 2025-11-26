import request from 'supertest';
import { app } from '../app';

describe('GET /predict', () => {
  it('returns a prediction for valid query params', async () => {
    const res = await request(app)
      .get('/predict')
      .query({
        home_team: 'ATL',
        away_team: 'BOS',
        game_date: '2025-01-01',
      });

    expect(res.status).toBe(200);

    const body = res.body;
    expect(body).toHaveProperty('homeTeamId', 'ATL');
    expect(body).toHaveProperty('awayTeamId', 'BOS');
    expect(typeof body.homeWinProbability).toBe('number');
    expect(typeof body.awayWinProbability).toBe('number');
  });

  it('returns 400 when required query params are missing', async () => {
    const res = await request(app)
      .get('/predict')
      .query({ home_team: 'ATL' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });
});
