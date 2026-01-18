import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getTodayDate, addDays, isToday, formatDisplayDate } from './date';

describe('date utilities', () => {
  describe('getTodayDate', () => {
    it('returns date in YYYY-MM-DD format', () => {
      const result = getTodayDate();
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe('addDays', () => {
    it('adds positive days to a date', () => {
      const result = addDays('2025-01-15', 5);
      expect(result).toBe('2025-01-20');
    });

    it('subtracts days when given negative number', () => {
      const result = addDays('2025-01-15', -3);
      expect(result).toBe('2025-01-12');
    });

    it('handles month boundaries', () => {
      const result = addDays('2025-01-31', 1);
      expect(result).toBe('2025-02-01');
    });
  });

  describe('isToday', () => {
    it('returns true for today date', () => {
      const today = getTodayDate();
      expect(isToday(today)).toBe(true);
    });

    it('returns false for past dates', () => {
      expect(isToday('2020-01-01')).toBe(false);
    });

    it('returns false for future dates', () => {
      expect(isToday('2099-12-31')).toBe(false);
    });
  });

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
});
