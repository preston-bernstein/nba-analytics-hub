import request from 'supertest';
import { app } from '../app.js';
import { describeIfSockets } from '../test-utils/describeIfSockets.js';

describeIfSockets('GET /health', () => {
  it('returns ok', async () => {
    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
    expect(res.text).toBe('ok');
  });
});
