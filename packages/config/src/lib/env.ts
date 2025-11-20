export interface AppEnv {
  NODE_ENV: 'development' | 'test' | 'production';
  API_BASE_URL: string;
}

export function loadEnv(env: Record<string, string | undefined>): AppEnv {
  const NODE_ENV =
    (env.NODE_ENV as AppEnv['NODE_ENV']) ??
    (process.env.NODE_ENV as AppEnv['NODE_ENV']) ??
    'development';

  const API_BASE_URL =
    env.VITE_API_BASE_URL ??
    env.API_BASE_URL ??
    process.env.VITE_API_BASE_URL ??
    process.env.API_BASE_URL ??
    'http://localhost:3333';

  return { NODE_ENV, API_BASE_URL };
}
