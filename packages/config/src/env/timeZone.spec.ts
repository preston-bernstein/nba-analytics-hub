import { afterEach, describe, expect, it } from 'vitest';
import { getLocalTimeZone } from './timeZone.js';

const originalIntl = global.Intl;

describe('getLocalTimeZone', () => {
  afterEach(() => {
    global.Intl = originalIntl;
  });

  it('returns the resolved time zone when available', () => {
    global.Intl = {
      DateTimeFormat: () => ({
        resolvedOptions: () => ({ timeZone: 'America/New_York' }),
      }),
    } as unknown as typeof Intl;

    expect(getLocalTimeZone()).toBe('America/New_York');
  });

  it('returns undefined when Intl throws', () => {
    global.Intl = {
      DateTimeFormat: () => {
        throw new Error('boom');
      },
    } as unknown as typeof Intl;

    expect(getLocalTimeZone()).toBeUndefined();
  });
});
