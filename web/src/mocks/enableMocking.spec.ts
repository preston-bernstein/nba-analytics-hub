import { beforeEach, describe, expect, it, vi } from 'vitest';

const start = vi.fn().mockResolvedValue(undefined);
vi.mock('./browser', () => ({ worker: { start } }));

import { enableMocking } from './enableMocking';

beforeEach(() => start.mockClear());

describe('enableMocking', () => {
  it('does nothing unless VITE_USE_MOCKS is true', async () => {
    await enableMocking({});
    await enableMocking({ VITE_USE_MOCKS: 'false' });
    expect(start).not.toHaveBeenCalled();
  });

  it('starts the worker, and lets requests without a handler through', async () => {
    await enableMocking({ VITE_USE_MOCKS: 'true' });
    expect(start).toHaveBeenCalledWith(expect.objectContaining({ onUnhandledRequest: 'bypass' }));
  });

  it('never starts in a production build', async () => {
    await enableMocking({ VITE_USE_MOCKS: 'true', PROD: true });
    expect(start).not.toHaveBeenCalled();
  });
});
