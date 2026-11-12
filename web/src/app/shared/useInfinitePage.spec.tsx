import type { ReactNode } from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { describe, expect, it, vi } from 'vitest';
import type { Page } from '@nba-analytics-hub/platform';
import { createQueryClient } from '../queryClient';
import { useInfinitePage } from './useInfinitePage';

const all = [1, 2, 3, 4, 5];
const PAGE = 2;

function makeFetch(total = all.length) {
  return vi.fn(
    async (offset: number): Promise<Page<number>> => ({
      rows: all.slice(offset, offset + PAGE),
      total,
      limit: PAGE,
      offset,
    })
  );
}

function setup(fetchPage: ReturnType<typeof makeFetch>) {
  const client = createQueryClient({ retry: false });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return renderHook(
    ({ key }) => useInfinitePage<number>({ queryKey: ['numbers', key], fetchPage }),
    { wrapper, initialProps: { key: 'a' } }
  );
}

describe('useInfinitePage', () => {
  it('loads the first page and reports the total', async () => {
    const fetchPage = makeFetch();
    const { result } = setup(fetchPage);
    await waitFor(() => expect(result.current.rows).toEqual([1, 2]));
    expect(result.current.total).toBe(5);
    expect(result.current.hasNextPage).toBe(true);
    expect(fetchPage).toHaveBeenCalledWith(0);
  });

  it('appends the next pages, using each page offset plus its length', async () => {
    const fetchPage = makeFetch();
    const { result } = setup(fetchPage);
    await waitFor(() => expect(result.current.rows).toHaveLength(2));
    await act(() => result.current.fetchNextPage());
    await waitFor(() => expect(result.current.rows).toEqual([1, 2, 3, 4]));
    await act(() => result.current.fetchNextPage());
    await waitFor(() => expect(result.current.rows).toEqual([1, 2, 3, 4, 5]));
    expect(fetchPage.mock.calls.map(([offset]) => offset)).toEqual([0, 2, 4]);
    expect(result.current.hasNextPage).toBe(false);
  });

  it('stops when a page comes back empty, even if the total says more', async () => {
    const fetchPage = vi.fn(
      async (offset: number): Promise<Page<number>> => ({
        rows: offset === 0 ? [1, 2] : [],
        total: 99,
        limit: PAGE,
        offset,
      })
    );
    const { result } = setup(fetchPage);
    await waitFor(() => expect(result.current.rows).toHaveLength(2));
    await act(() => result.current.fetchNextPage());
    await waitFor(() => expect(result.current.hasNextPage).toBe(false));
  });

  it('keeps the old rows while a new query key loads', async () => {
    const fetchPage = makeFetch();
    const { result, rerender } = setup(fetchPage);
    await waitFor(() => expect(result.current.rows).toEqual([1, 2]));
    rerender({ key: 'b' });
    expect(result.current.isPlaceholderData).toBe(true);
    expect(result.current.rows).toEqual([1, 2]);
    await waitFor(() => expect(result.current.isPlaceholderData).toBe(false));
  });

  it('reports an error when a page fails', async () => {
    const fetchPage = vi.fn().mockRejectedValue(new Error('boom'));
    const { result } = setup(fetchPage);
    await waitFor(() => expect(result.current.error?.message).toBe('boom'));
  });
});
