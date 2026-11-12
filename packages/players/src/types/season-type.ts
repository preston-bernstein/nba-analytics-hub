export const SEASON_TYPES = ['regular', 'playoffs', 'playin', 'ist'] as const;

export type SeasonType = (typeof SEASON_TYPES)[number];
