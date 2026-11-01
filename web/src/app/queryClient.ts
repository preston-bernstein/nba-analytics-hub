import { QueryClient } from '@tanstack/react-query';

export interface QueryClientOverrides {
  retry?: boolean | number;
}

/**
 * One QueryClient for the app.
 * Games change during live play, so data goes stale after 30 seconds.
 */
export function createQueryClient(overrides: QueryClientOverrides = {}) {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        retry: overrides.retry ?? 1,
        refetchOnWindowFocus: false,
      },
    },
  });
}
