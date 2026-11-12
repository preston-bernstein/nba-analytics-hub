import { describe, it, expect } from 'vitest';
import { SEASON_TYPES, SEASON_TYPE_LABELS, FIRST_SEASON } from '../types/season-type.js';
import { LEADERBOARD_PAGE_SIZE } from './leaderboard-paging.js';

describe('shared leaderboard limits', () => {
  it('has a label for every season type', () => {
    for (const type of SEASON_TYPES) expect(SEASON_TYPE_LABELS[type]).toBeTruthy();
  });

  it('starts in 1996, the first season with season averages', () => {
    expect(FIRST_SEASON).toBe(1996);
  });

  it('has a default page size that fits inside the maximum', () => {
    expect(LEADERBOARD_PAGE_SIZE).toEqual({ default: 50, max: 200 });
  });
});
