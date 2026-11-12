import { describe, it, expect } from 'vitest';
import type { Request } from 'express';
import { queryString } from './routeUtils.js';

const reqWith = (query: Record<string, unknown>) => ({ query } as unknown as Request);

describe('queryString', () => {
  it('returns a string value', () => {
    expect(queryString(reqWith({ date: '2025-01-01' }), 'date')).toBe('2025-01-01');
  });

  it('returns undefined when the param is missing', () => {
    expect(queryString(reqWith({}), 'date')).toBeUndefined();
  });

  it('returns undefined for repeated or object params', () => {
    expect(queryString(reqWith({ date: ['a', 'b'] }), 'date')).toBeUndefined();
    expect(queryString(reqWith({ date: { a: 'b' } }), 'date')).toBeUndefined();
  });

  it('returns undefined for an empty string', () => {
    expect(queryString(reqWith({ date: '' }), 'date')).toBeUndefined();
  });
});
