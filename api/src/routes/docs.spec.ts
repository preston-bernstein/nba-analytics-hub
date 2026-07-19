import fs from 'fs';
import { vi } from 'vitest';
import express from 'express';
import request from 'supertest';
import { registerDocsRoutes } from './docs.js';
import { describeIfSockets } from '../test-utils/describeIfSockets.js';

describeIfSockets('docs routes', () => {
  it('serves the openapi.yaml file', async () => {
    const app = express();
    registerDocsRoutes(app);

    const res = await request(app).get('/api/docs/openapi.yaml');
    expect(res.status).toBe(200);
  });

  it('throws when the OpenAPI spec is not found', () => {
    const existsSpy = vi.spyOn(fs, 'existsSync').mockReturnValue(false);

    const app = express();
    expect(() => registerDocsRoutes(app)).toThrow('OpenAPI spec not found');

    existsSpy.mockRestore();
  });
});
