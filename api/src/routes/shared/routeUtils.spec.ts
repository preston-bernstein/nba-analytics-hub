import { vi } from 'vitest';
import express from 'express';
import request from 'supertest';
import {
  resolveRequestId,
  sendError,
  sendSuccess,
  createRouteHandler,
} from './routeUtils.js';
import { describeIfSockets } from '../../test-utils/describeIfSockets.js';

describeIfSockets('routeUtils', () => {
  describe('resolveRequestId', () => {
    it('returns the x-request-id header when present', () => {
      const req = { header: vi.fn().mockReturnValue('abc-123') } as never;
      expect(resolveRequestId(req)).toBe('abc-123');
    });

    it('generates a UUID when header is absent', () => {
      const req = { header: vi.fn().mockReturnValue(undefined) } as never;
      const id = resolveRequestId(req);
      expect(id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
      );
    });
  });

  describe('createRouteHandler', () => {
    it('sends a success response when the fetcher resolves', async () => {
      const logger = { error: vi.fn() };
      const handler = createRouteHandler(logger, 'test error', 'fallback');
      const app = express();

      app.get('/test', async (req, res) => {
        await handler(async () => ({ ok: true }), req, res);
      });

      const res = await request(app)
        .get('/test')
        .set('X-Request-ID', 'rh-1');

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ ok: true });
      expect(res.headers['x-request-id']).toBe('rh-1');
      expect(logger.error).not.toHaveBeenCalled();
    });

    it('sends an error response when the fetcher rejects', async () => {
      const logger = { error: vi.fn() };
      const handler = createRouteHandler(logger, 'upstream failed', 'Service error');
      const app = express();

      app.get('/fail', async (req, res) => {
        await handler(async () => { throw new Error('boom'); }, req, res);
      });

      const res = await request(app)
        .get('/fail')
        .set('X-Request-ID', 'rh-2');

      expect(res.status).toBe(502);
      expect(res.body).toMatchObject({
        error: 'Service error',
        requestId: 'rh-2',
      });
      expect(logger.error).toHaveBeenCalledWith('upstream failed', expect.any(Error));
    });
  });

  describe('sendError', () => {
    it('defaults to 502 and sets the request id header', async () => {
      const app = express();
      app.get('/err', (_req, res) => {
        sendError(res, { error: 'bad', requestId: 'e-1' });
      });

      const res = await request(app).get('/err');
      expect(res.status).toBe(502);
      expect(res.headers['x-request-id']).toBe('e-1');
    });

    it('uses a custom status code', async () => {
      const app = express();
      app.get('/err2', (_req, res) => {
        sendError(res, { error: 'not found' }, 404);
      });

      const res = await request(app).get('/err2');
      expect(res.status).toBe(404);
    });
  });

  describe('sendSuccess', () => {
    it('defaults to 200 and sets the request id header', async () => {
      const app = express();
      app.get('/ok', (_req, res) => {
        sendSuccess(res, 's-1', { data: true });
      });

      const res = await request(app).get('/ok');
      expect(res.status).toBe(200);
      expect(res.headers['x-request-id']).toBe('s-1');
      expect(res.body).toEqual({ data: true });
    });

    it('uses a custom status code', async () => {
      const app = express();
      app.get('/created', (_req, res) => {
        sendSuccess(res, 's-2', { id: 1 }, 201);
      });

      const res = await request(app).get('/created');
      expect(res.status).toBe(201);
    });
  });
});
