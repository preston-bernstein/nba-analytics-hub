import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import App from './app.tsx';

describe('App', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    // simple stub so the dashboard effect does not blow up in this smoke test
    (globalThis as typeof globalThis & { fetch: typeof fetch }).fetch = vi
      .fn()
      .mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => [],
      });
  });

  afterEach(() => {
    (globalThis as typeof globalThis & { fetch: typeof fetch }).fetch =
      originalFetch;
  });

  it('should render successfully', async () => {
    const { baseElement } = render(
      <BrowserRouter>
        <App />
      </BrowserRouter>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('app-title')).toBeInTheDocument();
    });
    expect(baseElement).toBeTruthy();
  });

  it('should render the app shell title', async () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>,
    );

    const title = await screen.findByTestId('app-title');
    expect(title).toHaveTextContent('NBA Analytics Hub');
  });
});
