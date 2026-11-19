import { formatDateTime } from './formatDateTime';

describe('formatDateTime', () => {
  it('formats an ISO string using short month, day, and time', () => {
    const result = formatDateTime('2025-01-15T18:30:00.000Z', 'en-US');

    // Locale/timezone will affect exact output, so keep assertions fuzzy.
    expect(result).toMatch(/Jan/i);
    expect(result).toMatch(/\d{2}/); // day of month
    expect(result).toMatch(/\d{1,2}:\d{2}/); // time
  });

  it('uses the provided locale', () => {
    const resultEn = formatDateTime('2025-01-15T18:30:00.000Z', 'en-US');
    const resultFr = formatDateTime('2025-01-15T18:30:00.000Z', 'fr-FR');

    // Don’t assert full string; just that they differ, proving locale was respected.
    expect(resultEn).not.toEqual(resultFr);
  });
});
