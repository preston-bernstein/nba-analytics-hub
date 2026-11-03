import http from 'node:http';
import type { AddressInfo } from 'node:net';
import express from 'express';
import { vi } from 'vitest';
import { mockGames } from '@nba-analytics-hub/testing';
import type { GamesServiceClient } from '@nba-analytics-hub/data-access';
import type { GameUpdatedEvent } from '@nba-analytics-hub/types';
import { describeIfSockets } from '../test-utils/describeIfSockets.js';
import { LiveGamesReadModel } from '../kafka/liveGamesReadModel.js';
import { registerGamesRoutes } from './games.js';
import { registerGamesStreamRoutes } from './gamesStream.js';

function evt(id: string, at: string, game = mockGames[0]!): GameUpdatedEvent {
  return {
    eventId: id,
    eventType: 'game.updated',
    schemaVersion: 1,
    occurredAt: at,
    changeKind: 'score',
    game,
  };
}

async function open(app: express.Express) {
  const server = http.createServer(app);
  await new Promise<void>((r) => server.listen(0, '127.0.0.1', r));
  const port = (server.address() as AddressInfo).port;
  return { server, port };
}

function connect(port: number) {
  return new Promise<{
    res: http.IncomingMessage;
    req: http.ClientRequest;
    text: () => string;
    waitFor: (needle: string) => Promise<void>;
  }>((resolve, reject) => {
    const req = http.get({ host: '127.0.0.1', port, path: '/games/stream' }, (res) => {
      let buf = '';
      const waiters: Array<{ needle: string; done: () => void }> = [];
      res.setEncoding('utf8');
      res.on('data', (c: string) => {
        buf += c;
        const ready = waiters.filter((w) => buf.includes(w.needle));
        for (const w of ready) {
          waiters.splice(waiters.indexOf(w), 1);
          w.done();
        }
      });
      resolve({
        res,
        req,
        text: () => buf,
        waitFor: (needle) =>
          buf.includes(needle)
            ? Promise.resolve()
            : new Promise<void>((done) => waiters.push({ needle, done })),
      });
    });
    req.on('error', reject);
  });
}

describeIfSockets('GET /games/stream', () => {
  it('sends a snapshot, then a game event per update', async () => {
    const model = new LiveGamesReadModel();
    model.apply(evt('e1', '2025-01-01T01:00:00Z'));
    const app = express();
    registerGamesStreamRoutes(app, { model, heartbeatMs: 10_000 });
    const { server, port } = await open(app);
    const c = await connect(port);
    try {
      expect(c.res.statusCode).toBe(200);
      expect(c.res.headers['content-type']).toContain('text/event-stream');
      await c.waitFor('event: snapshot');
      expect(c.text()).toContain(`"id":"${mockGames[0]!.id}"`);

      model.apply(
        evt('e2', '2025-01-01T02:00:00Z', {
          ...mockGames[0]!,
          score: { home: 7, away: 3 },
        }),
      );
      await c.waitFor('event: game');
      expect(c.text()).toContain('"home":7');
    } finally {
      c.req.destroy();
      server.closeAllConnections();
      await new Promise((r) => server.close(r));
    }
  });

  it('sends an empty snapshot when nothing has arrived', async () => {
    const app = express();
    registerGamesStreamRoutes(app, { model: new LiveGamesReadModel(), heartbeatMs: 10_000 });
    const { server, port } = await open(app);
    const c = await connect(port);
    try {
      await c.waitFor('event: snapshot');
      expect(c.text()).toContain('data: []');
    } finally {
      c.req.destroy();
      server.closeAllConnections();
      await new Promise((r) => server.close(r));
    }
  });

  it('sends heartbeat comments', async () => {
    const app = express();
    registerGamesStreamRoutes(app, { model: new LiveGamesReadModel(), heartbeatMs: 20 });
    const { server, port } = await open(app);
    const c = await connect(port);
    try {
      await c.waitFor(': heartbeat');
      expect(c.text()).toContain(': heartbeat\n\n');
    } finally {
      c.req.destroy();
      server.closeAllConnections();
      await new Promise((r) => server.close(r));
    }
  });

  it('unsubscribes and stops heartbeats when the client disconnects', async () => {
    const model = new LiveGamesReadModel();
    const unsubscribe = vi.fn();
    vi.spyOn(model, 'subscribe').mockImplementation((fn) => {
      const real = LiveGamesReadModel.prototype.subscribe.call(model, fn);
      return () => {
        unsubscribe();
        real();
      };
    });
    const app = express();
    registerGamesStreamRoutes(app, { model, heartbeatMs: 20 });
    const { server, port } = await open(app);
    const c = await connect(port);
    await c.waitFor('event: snapshot');
    c.req.destroy();
    await vi.waitFor(() => expect(unsubscribe).toHaveBeenCalledTimes(1));
    server.closeAllConnections();
    await new Promise((r) => server.close(r));
  });

  it('is matched before /games/:id and leaves /games/:id alone', async () => {
    const gamesService: GamesServiceClient = {
      checkHealth: vi.fn(),
      getGames: vi.fn().mockResolvedValue({ date: '2025-01-01', games: mockGames }),
      getGameById: vi.fn().mockResolvedValue(mockGames[0]),
    };
    const app = express();
    registerGamesStreamRoutes(app, { model: new LiveGamesReadModel(), heartbeatMs: 10_000 });
    registerGamesRoutes(app, { gamesService });
    const { server, port } = await open(app);
    const c = await connect(port);
    try {
      await c.waitFor('event: snapshot');
      expect(gamesService.getGameById).not.toHaveBeenCalled();
      const body = await new Promise<string>((resolve) => {
        http.get({ host: '127.0.0.1', port, path: '/games/abc' }, (r) => {
          let s = '';
          r.on('data', (d) => (s += d));
          r.on('end', () => resolve(s));
        });
      });
      expect(JSON.parse(body).id).toBe(mockGames[0]!.id);
      expect(gamesService.getGameById).toHaveBeenCalledWith('abc', expect.anything());
    } finally {
      c.req.destroy();
      server.closeAllConnections();
      await new Promise((r) => server.close(r));
    }
  });
});
