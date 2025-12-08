export async function fetchJson<T>(
  baseUrl: string,
  path: string | URL,
  errPrefix: string,
): Promise<T> {
  const url = typeof path === 'string' ? new URL(path, baseUrl) : path;

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`${errPrefix} request failed with status ${res.status}`);
  }

  return (await res.json()) as T;
}
