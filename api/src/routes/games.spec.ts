import request from 'supertest';
import { app } from '../app';

describe('GET /games/upcoming', () => {
  it('returns a list of upcoming games', async () => {
    const res = await request(app).get('/games/upcoming');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);

    const game = res.body[0];
    expect(game).toHaveProperty('id');
    expect(game).toHaveProperty('homeTeamId');
    expect(game).toHaveProperty('awayTeamId');
    expect(game).toHaveProperty('startTimeUtc');
  });
});
