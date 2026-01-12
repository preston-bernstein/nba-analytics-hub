import { describe, it, expect } from 'vitest';
import { fetchJson } from './http.js';
import { mockFetch } from '../test-files/helpers';

const BASE = 'https://api.example.com';

describe('frontend fetchJson', () => {
  const fetchMock = mockFetch();

  it('returns parsed JSON on success', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ ok: true }),
    });

    const result = await fetchJson(BASE, '/foo', 'frontend');
    expect(result).toEqual({ ok: true });
  });

  it('throws on non-ok responses', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 404, json: async () => ({}) });
    await expect(fetchJson(BASE, '/foo', 'frontend')).rejects.toThrow(
      'frontend request failed with status 404',
    );
  });
});
