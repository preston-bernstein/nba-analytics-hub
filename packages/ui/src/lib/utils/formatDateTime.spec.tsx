import { describe, expect, it } from 'vitest';
import { formatDateTime } from './formatDateTime';

describe('formatDateTime', () => {
  it('should format ISO string into readable date', () => {
    const iso = '2025-01-15T18:30:00.000Z';
    const result = formatDateTime(iso, 'en-US');

    expect(result).toMatch(/Jan|Jan\./i);
    expect(result).toMatch(/15/);
  });
});
