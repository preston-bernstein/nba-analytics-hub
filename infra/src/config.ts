export interface ServiceUrls {
  gamesServiceUrl: string;
  predictorServiceUrl: string;
}

const KEYS = ['gamesServiceUrl', 'predictorServiceUrl'] as const;

/**
 * Reads the private service URLs the API calls, and fails at synth time
 * when one is missing or is not an http(s) URL.
 */
export function readServiceUrls(get: (key: string) => unknown): ServiceUrls {
  const out = {} as ServiceUrls;
  for (const key of KEYS) {
    const value = get(key);
    if (typeof value !== 'string' || !/^https?:\/\/\S+$/.test(value)) {
      throw new Error(`Context value "${key}" must be an http(s) URL. Got: ${String(value)}`);
    }
    out[key] = value;
  }
  return out;
}
