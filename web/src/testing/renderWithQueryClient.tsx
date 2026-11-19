import type { ReactElement } from 'react';
import { render } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { createQueryClient } from '../app/queryClient';

/** Render with a fresh QueryClient. Retries are off so errors show at once. */
export function renderWithQueryClient(ui: ReactElement) {
  const client = createQueryClient({ retry: false });
  return { client, ...render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>) };
}
