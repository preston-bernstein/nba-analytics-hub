import { describe, expect, it } from 'vitest';
import { formatEasternTime } from './formatEasternTime';

describe('formatEasternTime', () => {
  it('formats a valid ISO date to Eastern Time', () => {
    // 6:30 PM UTC = 1:30 PM ET (during EST)
    const result = formatEasternTime('2025-01-15T18:30:00.000Z');
    expect(result).toBe('1:30 PM ET');
  });

  it('returns "Invalid date" for invalid ISO strings', () => {
    expect(formatEasternTime('not-a-date')).toBe('Invalid date');
    expect(formatEasternTime('')).toBe('Invalid date');
  });

  it('supports custom locale', () => {
    const result = formatEasternTime('2025-01-15T18:30:00.000Z', 'en-GB');
    // en-GB uses 24-hour format: 13:30 ET
    expect(result).toBe('13:30 ET');
  });
});
