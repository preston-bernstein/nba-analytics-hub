export const SEASON_TYPES = ['regular', 'playoffs', 'playin', 'ist'] as const;

export type SeasonType = (typeof SEASON_TYPES)[number];

export const SEASON_TYPE_LABELS: Record<SeasonType, string> = {
  regular: 'Regular season',
  playoffs: 'Playoffs',
  playin: 'Play-in',
  ist: 'In-season tournament',
};

/** The first season that has season averages. A season is named for the year it starts. */
export const FIRST_SEASON = 1996;
