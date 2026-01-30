import { describe, it, expect } from 'vitest';
import { fetchJson } from './http';
import { mockFetch } from '../test-files/helpers';

const BASE = 'https://api.example.com';

describe('fetchJson', () => {
  const fetchMock = mockFetch();

  it('returns parsed JSON on success', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ data: 'test' }),
    });

    const result = await fetchJson(BASE, '/endpoint', 'Test');
    expect(result).toEqual({ data: 'test' });
  });

  it('throws on non-ok responses', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 404, json: async () => ({}) });
    await expect(fetchJson(BASE, '/endpoint', 'Test')).rejects.toThrow(
      'Test request failed with status 404',
    );
  });

  it('accepts URL object as path', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ ok: true }),
    });

    const url = new URL('/custom', BASE);
    url.searchParams.set('foo', 'bar');

    await fetchJson(BASE, url, 'Test');

    const [calledUrl] = fetchMock.mock.calls[0] as [string];
    expect(calledUrl).toContain('foo=bar');
  });

  it('passes init options to fetch', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({}),
    });

    await fetchJson(BASE, '/endpoint', 'Test', {
      headers: { 'X-Custom': 'value' },
    });

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(init?.headers).toEqual({ 'X-Custom': 'value' });
  });
});
