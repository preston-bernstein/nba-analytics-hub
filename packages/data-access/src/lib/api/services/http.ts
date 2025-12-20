export async function fetchJson<T>(
  baseUrl: string,
  path: string | URL,
  errPrefix: string,
  init?: Parameters<typeof fetch>[1],
): Promise<T> {
  const url = typeof path === 'string' ? new URL(path, baseUrl) : path;

  const res = await fetch(url.toString(), init);
  if (!res.ok) {
    throw new Error(`${errPrefix} request failed with status ${res.status}`);
  }

  return (await res.json()) as T;
}
