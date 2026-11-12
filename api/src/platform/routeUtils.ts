import { randomUUID } from 'crypto';
import type { Request, Response } from 'express';
import type { ErrorResponse } from '@nba-analytics-hub/platform';

export type RouteLogger = Pick<Console, 'error'>;

/** Reads one query param. Returns undefined unless it is a non-empty string. */
export function queryString(req: Request, name: string): string | undefined {
  const value = req.query[name];
  return typeof value === 'string' && value !== '' ? value : undefined;
}

/** Resolves a service base URL from an env var, with a local default. */
export function serviceUrl(envVar: string, fallback: string): string {
  return process.env[envVar] ?? fallback;
}

/**
 * Resolves request ID from header or generates a new UUID
 */
export function resolveRequestId(req: Request): string {
  return req.header('x-request-id') ?? randomUUID();
}

/**
 * Sends an error response with request ID header
 */
export function sendError(res: Response, payload: ErrorResponse, status = 502): Response {
  res.setHeader('X-Request-ID', payload.requestId ?? '');
  return res.status(status).json(payload);
}

/**
 * Sends a success response with request ID header
 */
export function sendSuccess<T>(res: Response, requestId: string, data: T, status = 200): Response {
  res.setHeader('X-Request-ID', requestId);
  return res.status(status).json(data);
}

/**
 * Wraps an async handler with standard error handling
 */
export function createRouteHandler<T>(
  logger: RouteLogger,
  errorMessage: string,
  fallbackError: string
) {
  return async (
    fetcher: (requestId: string) => Promise<T>,
    req: Request,
    res: Response
  ): Promise<Response> => {
    const requestId = resolveRequestId(req);
    try {
      const result = await fetcher(requestId);
      return sendSuccess(res, requestId, result);
    } catch (err) {
      logger.error(errorMessage, err);
      return sendError(res, { error: fallbackError, requestId });
    }
  };
}
