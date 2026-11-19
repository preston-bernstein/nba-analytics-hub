const defaultSleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** Builds a URL. Array params repeat as key[]=a&key[]=b. Undefined values are skipped. */
export function buildUrl(baseUrl, path, params = {}) {
  const url = new URL(path, baseUrl);
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;
    if (Array.isArray(value)) {
      for (const item of value) url.searchParams.append(`${key}[]`, String(item));
    } else {
      url.searchParams.append(key, String(value));
    }
  }
  return url.toString();
}

async function fetchOnce(doFetch, url, apiKey) {
  try {
    return { res: await doFetch(url, { headers: { Authorization: apiKey } }) };
  } catch (error) {
    return { error };
  }
}

async function readBody(res) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

function assertAuthorized(res, path) {
  if (res.status === 401 || res.status === 403) {
    throw new Error(`HTTP ${res.status} for ${path}: check the API key and plan`);
  }
}

const isRetryable = (res) => res.status === 429 || res.status >= 500;

/**
 * A small API client. It waits for the limiter before each call and retries
 * 429 and 5xx responses with backoff. A 401 or 403 throws, because the key or
 * plan is wrong and every later call would fail the same way. Other 4xx
 * responses are returned, so the archive records what the API said.
 */
export function createClient({
  apiKey,
  baseUrl,
  limiter,
  fetch: doFetch = fetch,
  sleep = defaultSleep,
  maxRetries = 6,
}) {
  return {
    async get(path, params = {}) {
      const url = buildUrl(baseUrl, path, params);
      for (let attempt = 0; ; attempt += 1) {
        await limiter.take();
        const { res, error } = await fetchOnce(doFetch, url, apiKey);
        if (error) {
          if (attempt >= maxRetries) throw error;
          await sleep(Math.min(30_000, 1000 * 2 ** attempt));
          continue;
        }
        assertAuthorized(res, path);
        if (isRetryable(res)) {
          if (attempt >= maxRetries) throw new Error(`HTTP ${res.status} for ${url} after retries`);
          await sleep(Math.min(60_000, 2000 * 2 ** attempt));
          continue;
        }
        return {
          url,
          status: res.status,
          fetchedAt: new Date().toISOString(),
          body: await readBody(res),
        };
      }
    },
  };
}
