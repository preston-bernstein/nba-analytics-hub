import { SEASON_TYPES } from '@nba-analytics-hub/players';
import type { LeaderboardRow, SeasonType } from '@nba-analytics-hub/players';

const FIRST_NAMES = [
  'Aaron',
  'Brandon',
  'Caleb',
  'Darius',
  'Elijah',
  'Felix',
  'Gabriel',
  'Hector',
  'Isaiah',
  'Jalen',
  'Kendrick',
  'Lamar',
  'Marcus',
  'Nolan',
  'Omar',
  'Parker',
  'Quincy',
  'Reggie',
  'Simeon',
  'Terrence',
];
const LAST_NAMES = [
  'Abbott',
  'Brooks',
  'Calloway',
  'Dawson',
  'Ellis',
  'Fontaine',
  'Graves',
  'Holloway',
  'Ingram',
  'Jennings',
  'Kemp',
  'Lawrence',
  'Monroe',
  'Nash',
  'Okafor',
  'Pruitt',
  'Quarles',
  'Rivers',
  'Sutton',
  'Thornton',
];
const POSITIONS = ['G', 'F', 'C', 'G-F', 'F-C'];

// Players per season type. The regular season needs several pages to show lazy loading.
const SIZE: Record<SeasonType, number> = { regular: 300, playoffs: 80, playin: 24, ist: 40 };

/** A small seeded random number generator, so the same season always gives the same rows. */
function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const round = (value: number, places = 1) => Number(value.toFixed(places));

/** Made-up leaderboard rows for a season and season type. They look like real season averages. */
export function makeLeaderboard(season: number, seasonType: SeasonType): LeaderboardRow[] {
  const random = mulberry32(season * 10 + SEASON_TYPES.indexOf(seasonType));
  const between = (min: number, max: number) => min + random() * (max - min);

  // Every first and last name pair is used once, in an order that changes with the seed.
  const pairs = Array.from({ length: FIRST_NAMES.length * LAST_NAMES.length }, (_, i) => i);
  for (let i = pairs.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
  }

  return pairs.slice(0, SIZE[seasonType]).map((pair, index) => {
    const min = round(between(8, 38));
    const usage = between(0.25, 0.8);
    return {
      playerId: 1000 + index,
      name: `${FIRST_NAMES[pair % FIRST_NAMES.length]} ${
        LAST_NAMES[Math.floor(pair / FIRST_NAMES.length)]
      }`,
      position: POSITIONS[Math.floor(random() * POSITIONS.length)],
      gp: Math.round(between(10, 82)),
      min,
      pts: round(min * usage),
      reb: round(between(1, 12)),
      ast: round(between(0.5, 10)),
      stl: round(between(0.2, 2)),
      blk: round(between(0, 2.5)),
      tov: round(between(0.4, 4)),
      fgPct: round(between(0.38, 0.62), 3),
      // Some players never take threes, so the API has no value for them.
      fg3Pct: random() < 0.1 ? null : round(between(0.2, 0.45), 3),
      ftPct: round(between(0.5, 0.95), 3),
      plusMinus: round(between(-6, 8)),
      fantasyPts: round(between(8, 55)),
    };
  });
}
