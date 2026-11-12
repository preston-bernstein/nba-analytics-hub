import { describe, it, expect } from 'vitest';
import { SEASON_TYPES } from './season-type.js';

describe('SEASON_TYPES', () => {
  it('lists the four season types the archive holds', () => {
    expect([...SEASON_TYPES]).toEqual(['regular', 'playoffs', 'playin', 'ist']);
  });
});
