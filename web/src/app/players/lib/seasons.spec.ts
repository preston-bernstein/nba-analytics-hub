import { currentSeason, defaultSeason, seasonOptions } from './seasons';

describe('seasons', () => {
  it('a season is named for the year it starts, from October', () => {
    expect(currentSeason(new Date('2026-11-12'))).toBe(2026);
    expect(currentSeason(new Date('2026-09-30'))).toBe(2025);
    expect(currentSeason(new Date('2026-10-01'))).toBe(2026);
  });

  it('defaults to the last finished season', () => {
    expect(defaultSeason(new Date('2026-11-12'))).toBe(2025);
  });

  it('lists seasons from the current one back to 1996', () => {
    const options = seasonOptions(new Date('2026-11-12'));
    expect(options[0]).toBe(2026);
    expect(options.at(-1)).toBe(1996);
    expect(options).toHaveLength(2026 - 1996 + 1);
  });
});
