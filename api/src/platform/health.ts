import type { Express, Request, Response } from 'express';

export function registerHealthRoutes(app: Express): void {
  app.get('/health', (_req: Request, res: Response) => {
    res.status(200).send('ok');
  });
}
