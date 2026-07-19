/** Number of days before today that the API supports */
export const DAYS_BEHIND = 7;

/** Number of days after today that the API supports */
export const DAYS_AHEAD = 7;

/**
 * Returns today's date in YYYY-MM-DD format
 */
export function getTodayDate(): string {
  return formatLocalDate(new Date());
}

/**
 * Adds days to a date string and returns YYYY-MM-DD format
 */
export function addDays(dateStr: string, days: number): string {
  const date = new Date(`${dateStr}T12:00:00`);
  date.setDate(date.getDate() + days);
  return formatLocalDate(date);
}

/**
 * Checks if a date string is today
 */
export function isToday(dateStr: string): boolean {
  return dateStr === getTodayDate();
}

/**
 * Returns the minimum allowed date (today - DAYS_BEHIND)
 */
export function getMinDate(): string {
  return addDays(getTodayDate(), -DAYS_BEHIND);
}

/**
 * Returns the maximum allowed date (today + DAYS_AHEAD)
 */
export function getMaxDate(): string {
  return addDays(getTodayDate(), DAYS_AHEAD);
}

/**
 * Checks if the date is at or before the minimum allowed date
 */
export function isAtMinDate(dateStr: string): boolean {
  return dateStr <= getMinDate();
}

/**
 * Checks if the date is at or after the maximum allowed date
 */
export function isAtMaxDate(dateStr: string): boolean {
  return dateStr >= getMaxDate();
}

function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
