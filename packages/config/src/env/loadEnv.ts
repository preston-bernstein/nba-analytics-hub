export interface AppEnv {
  NODE_ENV: 'development' | 'test' | 'production';
  API_BASE_URL: string;
  PREDICTOR_BASE_URL: string;
}

const allowedNodeEnv: AppEnv['NODE_ENV'][] = [
  'development',
  'test',
  'production',
];

function pickFirst(values: Array<string | undefined>, fallback?: string) {
  for (const value of values) {
    if (typeof value === 'string' && value.trim().length > 0) {
      return value;
    }
  }
  return fallback;
}

export function loadEnv(env: Record<string, string | undefined>): AppEnv {
  const NODE_ENV =
    (env.NODE_ENV as AppEnv['NODE_ENV']) ??
    (process.env.NODE_ENV as AppEnv['NODE_ENV']) ??
    'development';

  if (!allowedNodeEnv.includes(NODE_ENV)) {
    throw new Error(
      `NODE_ENV must be one of ${allowedNodeEnv.join(', ')}, received "${NODE_ENV}"`,
    );
  }

  const API_BASE_URL = pickFirst(
    [env.VITE_API_BASE_URL, env.API_BASE_URL, process.env.VITE_API_BASE_URL, process.env.API_BASE_URL],
    'http://localhost:3333',
  );

  /* c8 ignore start - defensive: pickFirst always returns fallback */
  if (!API_BASE_URL) {
    throw new Error('API_BASE_URL is required');
  }
  /* c8 ignore stop */

  const PREDICTOR_BASE_URL = pickFirst(
    [env.PREDICTOR_BASE_URL, process.env.PREDICTOR_BASE_URL],
    'http://localhost:8000',
  );

  /* c8 ignore start - defensive: pickFirst always returns fallback */
  if (!PREDICTOR_BASE_URL) {
    throw new Error('PREDICTOR_BASE_URL is required');
  }
  /* c8 ignore stop */

  return { NODE_ENV, API_BASE_URL, PREDICTOR_BASE_URL };
}
