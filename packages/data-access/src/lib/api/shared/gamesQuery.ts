export interface GamesQueryParams {
  date?: string;
  tz?: string;
}

export function applyGamesQueryParams(
  url: URL,
  params?: GamesQueryParams,
): URL {
  if (params?.date) {
    url.searchParams.set('date', params.date);
  }
  if (params?.tz) {
    url.searchParams.set('tz', params.tz);
  }
  return url;
}
