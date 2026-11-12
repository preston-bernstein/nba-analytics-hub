export const FIRST_SEASON = 1996;

/** A season is named for the year it starts. The NBA season starts in October. */
export function currentSeason(now: Date = new Date()): number {
  return now.getUTCMonth() >= 9 ? now.getUTCFullYear() : now.getUTCFullYear() - 1;
}

/** The last season that has finished, which has full stats. */
export function defaultSeason(now: Date = new Date()): number {
  return currentSeason(now) - 1;
}

/** Seasons for a picker, newest first. */
export function seasonOptions(now: Date = new Date()): number[] {
  const latest = currentSeason(now);
  return Array.from({ length: latest - FIRST_SEASON + 1 }, (_, i) => latest - i);
}
