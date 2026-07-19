import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { formatDisplayDate } from './dateNavigation';

describe('formatDisplayDate', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-06-15T12:00:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns "Today" for today date', () => {
    expect(formatDisplayDate('2025-06-15')).toBe('Today');
  });

  it('returns "Tomorrow" for tomorrow date', () => {
    expect(formatDisplayDate('2025-06-16')).toBe('Tomorrow');
  });

  it('returns "Yesterday" for yesterday date', () => {
    expect(formatDisplayDate('2025-06-14')).toBe('Yesterday');
  });

  it('returns formatted date for other dates', () => {
    const result = formatDisplayDate('2025-06-20');
    expect(result).toContain('Fri');
    expect(result).toContain('Jun');
    expect(result).toContain('20');
  });
});
