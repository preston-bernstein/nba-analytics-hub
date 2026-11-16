export interface ApiConfig {
  baseUrl: string;
  basePath: string;
}

export function resolveApiConfig(env: ImportMetaEnv, locationOrigin?: string): ApiConfig {
  const explicitBaseUrl = env.VITE_API_BASE_URL;
  const hasExplicit = Boolean(explicitBaseUrl && explicitBaseUrl.trim());
  const fallbackBaseUrl = env.DEV
    ? 'http://localhost:3000'
    : locationOrigin ?? 'http://localhost:3000';

  return {
    baseUrl: hasExplicit ? explicitBaseUrl : fallbackBaseUrl,
    basePath: hasExplicit ? '' : env.DEV ? '' : '/api',
  };
}

export const apiClientConfig: ApiConfig = resolveApiConfig(
  import.meta.env,
  typeof window !== 'undefined' ? window.location.origin : undefined
);
