import { afterEach, beforeEach, vi } from 'vitest';

export function mockFetch() {
  const originalFetch = globalThis.fetch;
  const mock = vi.fn();

  beforeEach(() => {
    (globalThis as any).fetch = mock;
  });

  afterEach(() => {
    (globalThis as any).fetch = originalFetch;
    vi.restoreAllMocks();
    mock.mockReset();
  });

  return mock;
}
