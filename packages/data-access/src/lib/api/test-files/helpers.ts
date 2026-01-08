import { afterEach, beforeEach, vi } from 'vitest';

export function mockFetch() {
  const originalFetch = globalThis.fetch as typeof fetch | undefined;
  const mock = vi.fn();
  const globalWithFetch = globalThis as typeof globalThis & {
    fetch: typeof fetch;
  };

  beforeEach(() => {
    globalWithFetch.fetch = mock as unknown as typeof fetch;
  });

  afterEach(() => {
    if (originalFetch) {
      globalWithFetch.fetch = originalFetch;
    }
    vi.restoreAllMocks();
    mock.mockReset();
  });

  return mock;
}
