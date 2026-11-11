import type { Express, Request, Response } from 'express';
import type { Game } from '@nba-analytics-hub/games';
import type { LiveGamesReadModel } from '../kafka/liveGamesReadModel.js';

const DEFAULT_HEARTBEAT_MS = 15_000;

interface GamesStreamDeps {
  model: LiveGamesReadModel;
  heartbeatMs?: number;
}

function sendEvent(res: Response, event: string, data: unknown): void {
  res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

/**
 * GET /games/stream (Server-Sent Events).
 * Register this before `/games/:id`, or "stream" is read as a game id.
 */
export function registerGamesStreamRoutes(app: Express, deps: GamesStreamDeps): void {
  const { model, heartbeatMs = DEFAULT_HEARTBEAT_MS } = deps;

  app.get('/games/stream', (req: Request, res: Response) => {
    res.status(200).set({
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    });
    res.flushHeaders();

    // Subscribe before the snapshot so no update falls in between. Both run
    // in one synchronous step, so order on the wire is snapshot first.
    const unsubscribe = model.subscribe((game: Game) => sendEvent(res, 'game', game));
    sendEvent(res, 'snapshot', model.list());

    const heartbeat = setInterval(() => res.write(': heartbeat\n\n'), heartbeatMs);

    req.on('close', () => {
      clearInterval(heartbeat);
      unsubscribe();
    });
  });
}
