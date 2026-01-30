import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  getTodayDate,
  addDays,
  isToday,
  getMinDate,
  getMaxDate,
  isAtMinDate,
  isAtMaxDate,
  DAYS_BEHIND,
  DAYS_AHEAD,
} from './date-utils.js';

describe('date utilities', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  describe('getTodayDate', () => {
    it('returns date in YYYY-MM-DD format', () => {
      const result = getTodayDate();
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('uses local date parts for today', () => {
      vi.useFakeTimers();
      const now = new Date('2025-01-01T23:30:00Z');
      vi.setSystemTime(now);
      const expected = [
        now.getFullYear(),
        String(now.getMonth() + 1).padStart(2, '0'),
        String(now.getDate()).padStart(2, '0'),
      ].join('-');
      expect(getTodayDate()).toBe(expected);
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

    it('does not shift date when adding zero days', () => {
      const result = addDays('2025-01-01', 0);
      expect(result).toBe('2025-01-01');
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

  describe('getMinDate', () => {
    it('returns today minus DAYS_BEHIND', () => {
      const today = getTodayDate();
      const expected = addDays(today, -DAYS_BEHIND);
      expect(getMinDate()).toBe(expected);
    });
  });

  describe('getMaxDate', () => {
    it('returns today plus DAYS_AHEAD', () => {
      const today = getTodayDate();
      const expected = addDays(today, DAYS_AHEAD);
      expect(getMaxDate()).toBe(expected);
    });
  });

  describe('isAtMinDate', () => {
    it('returns true when date equals min date', () => {
      const minDate = getMinDate();
      expect(isAtMinDate(minDate)).toBe(true);
    });

    it('returns true when date is before min date', () => {
      const beforeMin = addDays(getMinDate(), -1);
      expect(isAtMinDate(beforeMin)).toBe(true);
    });

    it('returns false when date is after min date', () => {
      const afterMin = addDays(getMinDate(), 1);
      expect(isAtMinDate(afterMin)).toBe(false);
    });

    it('returns false for today', () => {
      expect(isAtMinDate(getTodayDate())).toBe(false);
    });
  });

  describe('isAtMaxDate', () => {
    it('returns true when date equals max date', () => {
      const maxDate = getMaxDate();
      expect(isAtMaxDate(maxDate)).toBe(true);
    });

    it('returns true when date is after max date', () => {
      const afterMax = addDays(getMaxDate(), 1);
      expect(isAtMaxDate(afterMax)).toBe(true);
    });

    it('returns false when date is before max date', () => {
      const beforeMax = addDays(getMaxDate(), -1);
      expect(isAtMaxDate(beforeMax)).toBe(false);
    });

    it('returns false for today', () => {
      expect(isAtMaxDate(getTodayDate())).toBe(false);
    });
  });
});
