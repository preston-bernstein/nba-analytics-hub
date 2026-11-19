// What to pull. A job is one request plus all its pages, saved as one file:
// raw/<endpoint>/<key>.ndjson.gz. Paths follow https://nba.balldontlie.io/.
// Where the API does not say how far back data goes, we ask anyway: an empty
// answer costs one call and is saved, so the archive shows it was empty.

const FIRST_SEASON = 1946;
const SEASON_TYPES = ['regular', 'playoffs'];

export const SEASON_AVERAGE_TYPES = {
  general: ['base', 'advanced', 'usage', 'scoring', 'defense', 'misc'],
  clutch: ['advanced', 'base', 'misc', 'scoring', 'usage'],
  defense: [
    '2_pointers',
    '3_pointers',
    'greater_than_15ft',
    'less_than_10ft',
    'less_than_6ft',
    'overall',
  ],
  shooting: ['5ft_range', 'by_zone'],
  playtype: [
    'cut',
    'handoff',
    'isolation',
    'offrebound',
    'offscreen',
    'postup',
    'prballhandler',
    'prrollman',
    'spotup',
    'transition',
  ],
  tracking: [
    'painttouch',
    'efficiency',
    'speeddistance',
    'defense',
    'elbowtouch',
    'posttouch',
    'passing',
    'drives',
    'rebounding',
    'catchshoot',
    'pullupshot',
    'possessions',
  ],
  hustle: [undefined],
  shotdashboard: ['overall', 'pullups', 'catch_and_shoot', 'less_than_10_ft'],
};

export const TEAM_SEASON_AVERAGE_TYPES = {
  general: ['base', 'advanced', 'scoring', 'misc', 'opponent', 'defense', 'violations'],
  clutch: ['base', 'advanced', 'misc', 'scoring'],
  shooting: ['by_zone_base', 'by_zone_opponent', '5ft_range_base', '5ft_range_opponent'],
  playtype: [
    'cut',
    'handoff',
    'isolation',
    'offrebound',
    'offscreen',
    'postup',
    'prballhandler',
    'prrollman',
    'spotup',
    'transition',
    'misc',
  ],
  tracking: [
    'painttouch',
    'efficiency',
    'speeddistance',
    'defense',
    'elbowtouch',
    'posttouch',
    'passing',
    'drives',
    'rebounding',
    'catchshoot',
    'pullupshot',
    'possessions',
  ],
  hustle: [undefined],
  shotdashboard: ['overall', 'pullups', 'catch_and_shoot', 'less_than_10_ft'],
};

const GAME_TRACKING_TYPES = [
  'passing',
  'drives',
  'possessions',
  'rebounding',
  'speeddistance',
  'elbowtouch',
  'posttouch',
  'painttouch',
  'catchshoot',
  'pullupshot',
];
const GAME_DEFENSE_TYPES = [
  'overall',
  '2_pointers',
  '3_pointers',
  'less_than_6ft',
  'less_than_10ft',
  'greater_than_15ft',
];
const GAME_SHOOTING_RANGES = {
  defender_distance: ['0_2_ft', '2_4_ft', '4_6_ft', '6_plus_ft'],
  dribbles: ['0', '1', '2', '3_6', '7_plus'],
  touch_time: ['less_than_2_sec', '2_6_sec', '6_plus_sec'],
};
const LEADER_STATS = [
  'pts',
  'reb',
  'ast',
  'stl',
  'blk',
  'tov',
  'min',
  'fgm',
  'fga',
  'fg_pct',
  'fg3m',
  'fg3a',
  'fg3_pct',
  'ftm',
  'fta',
  'ft_pct',
  'oreb',
  'dreb',
  'eff',
  'gp',
];

const range = (from, to) => Array.from({ length: to - from + 1 }, (_, i) => from + i);
const slug = (...parts) => parts.filter((p) => p !== undefined).join('_');
const paged = (job) => ({ paginated: true, ...job, params: { per_page: 100, ...job.params } });

function seasonTypesFor(season) {
  const types = [...SEASON_TYPES];
  if (season >= 2020) types.push('playin');
  if (season >= 2023) types.push('ist');
  return types;
}

const seasonKey = (season) => `season-${season}`;

function basicJobs() {
  return [
    paged({ endpoint: 'teams', key: 'all', path: '/nba/v1/teams', params: {} }),
    paged({ endpoint: 'players', key: 'all', path: '/nba/v1/players', params: {} }),
    paged({ endpoint: 'players_active', key: 'all', path: '/nba/v1/players/active', params: {} }),
    paged({
      endpoint: 'player_injuries',
      key: 'current',
      path: '/nba/v1/player_injuries',
      params: {},
    }),
  ];
}

function leaderJobs(season) {
  const key = seasonKey(season);
  const jobs = [];
  for (const statType of season >= 1980 ? LEADER_STATS : []) {
    for (const seasonType of SEASON_TYPES) {
      jobs.push({
        endpoint: 'leaders',
        key: `${key}_${statType}_${seasonType}`,
        path: '/nba/v1/leaders',
        params: { season, stat_type: statType, season_type: seasonType },
      });
    }
  }
  return jobs;
}

function seasonJobs(season) {
  const key = seasonKey(season);
  return [
    paged({ endpoint: 'games', key, path: '/nba/v1/games', params: { seasons: [season] } }),
    paged({ endpoint: 'stats', key, path: '/nba/v1/stats', params: { seasons: [season] } }),
    { endpoint: 'standings', key, path: '/nba/v1/standings', params: { season } },
    ...leaderJobs(season),
  ];
}

/** One job per category, type and season type, for the two season-average endpoints. */
function averageJobs({ season, endpoint, types, seasonTypes }) {
  const jobs = [];
  for (const [category, categoryTypes] of Object.entries(types)) {
    for (const type of categoryTypes) {
      for (const seasonType of seasonTypes) {
        jobs.push(
          paged({
            endpoint,
            key: `${seasonKey(season)}_${slug(category, type)}_${seasonType}`,
            path: `/nba/v1/${endpoint}/${category}`,
            params: { season, season_type: seasonType, type },
          })
        );
      }
    }
  }
  return jobs;
}

function modernSeasonJobs(season) {
  return [
    paged({
      endpoint: 'stats_advanced_v1',
      key: seasonKey(season),
      path: '/nba/v1/stats/advanced',
      params: { seasons: [season] },
    }),
    ...averageJobs({
      season,
      endpoint: 'season_averages',
      types: SEASON_AVERAGE_TYPES,
      seasonTypes: seasonTypesFor(season),
    }),
    ...averageJobs({
      season,
      endpoint: 'team_season_averages',
      types: TEAM_SEASON_AVERAGE_TYPES,
      seasonTypes: SEASON_TYPES,
    }),
  ];
}

function periodJobs(season) {
  const jobs = range(1, 7).map((period) =>
    paged({
      endpoint: 'stats_period',
      key: `${seasonKey(season)}_period-${period}`,
      path: '/nba/v1/stats',
      params: { seasons: [season], period },
    })
  );
  jobs.push(
    paged({
      endpoint: 'stats_advanced_v2',
      key: seasonKey(season),
      path: '/nba/v2/stats/advanced',
      params: { seasons: [season] },
    })
  );
  return jobs;
}

/** One job per type (and range) of a game-level stats endpoint, for one season type. */
function statsTypeJobs({ season, seasonType, endpoint, types }) {
  return types.map((type) =>
    paged({
      endpoint: `stats_${endpoint}`,
      key: `${seasonKey(season)}_${type}_${seasonType}`,
      path: `/nba/v1/stats/${endpoint}`,
      params: { seasons: [season], type, season_type: seasonType },
    })
  );
}

function shootingJobs(season, seasonType) {
  const jobs = [];
  for (const [type, ranges] of Object.entries(GAME_SHOOTING_RANGES)) {
    for (const rangeValue of ranges) {
      jobs.push(
        paged({
          endpoint: 'stats_shooting',
          key: `${seasonKey(season)}_${type}_${rangeValue}_${seasonType}`,
          path: '/nba/v1/stats/shooting',
          params: { seasons: [season], type, range: rangeValue, season_type: seasonType },
        })
      );
    }
  }
  return jobs;
}

function trackingSeasonJobs(season) {
  const key = seasonKey(season);
  const jobs = [
    paged({
      endpoint: 'lineup_stats',
      key,
      path: '/nba/v1/lineup_stats',
      params: { seasons: [season] },
    }),
    paged({ endpoint: 'matchups', key, path: '/nba/v1/matchups', params: { seasons: [season] } }),
  ];
  for (const seasonType of SEASON_TYPES) {
    jobs.push(
      ...statsTypeJobs({ season, seasonType, endpoint: 'tracking', types: GAME_TRACKING_TYPES }),
      ...statsTypeJobs({ season, seasonType, endpoint: 'defense', types: GAME_DEFENSE_TYPES }),
      ...shootingJobs(season, seasonType)
    );
  }
  return jobs;
}

function slateAndContractJobs() {
  const jobs = [
    paged({ endpoint: 'dfs_slates', key: 'all', path: '/nba/v1/dfs/slates', params: {} }),
  ];
  for (const teamId of range(1, 30)) {
    jobs.push({
      endpoint: 'contracts_teams',
      key: `team-${teamId}`,
      path: '/nba/v1/contracts/teams',
      params: { team_id: teamId },
    });
  }
  return jobs;
}

function phaseOne(seasons) {
  const from = (min) => seasons.filter((s) => s >= min);
  return [
    ...basicJobs(),
    ...seasons.flatMap(seasonJobs),
    ...from(1996).flatMap(modernSeasonJobs),
    ...from(2015).flatMap(periodJobs),
    ...from(2018).flatMap(trackingSeasonJobs),
    ...slateAndContractJobs(),
  ];
}

/** The per-game jobs, which depend on how far back the API has data for that season. */
function gameJobs(game) {
  const key = `game-${game.id}`;
  const jobs = [];
  if (game.season >= 2018) {
    jobs.push(
      {
        endpoint: 'win_probabilities',
        key,
        path: '/nba/v1/win_probabilities',
        params: { game_id: game.id },
      },
      { endpoint: 'plays', key, path: '/nba/v1/plays', params: { game_id: game.id } },
      paged({
        endpoint: 'shot_charts',
        key,
        path: '/nba/v1/shot_charts',
        params: { game_ids: [game.id] },
      })
    );
  }
  if (game.season >= 2024) {
    jobs.push({
      endpoint: 'player_props_opening',
      key,
      path: '/nba/v2/odds/player_props/opening',
      params: { game_id: game.id },
    });
  }
  if (game.season >= 2025) {
    jobs.push(
      paged({ endpoint: 'lineups', key, path: '/nba/v1/lineups', params: { game_ids: game.id } })
    );
  }
  return jobs;
}

/** The per-date jobs. `dates` maps each date to the season of its first game. */
function dateJobs(dates) {
  const jobs = [];
  for (const [date, season] of dates) {
    const key = `date-${date}`;
    if (season >= 2000) {
      jobs.push({ endpoint: 'box_scores', key, path: '/nba/v1/box_scores', params: { date } });
    }
    if (season >= 2024) {
      jobs.push(
        paged({ endpoint: 'odds_v2', key, path: '/nba/v2/odds', params: { dates: [date] } }),
        paged({
          endpoint: 'odds_opening',
          key,
          path: '/nba/v2/odds/opening',
          params: { dates: [date] },
        })
      );
    }
  }
  return jobs;
}

function slateJobs(slate) {
  const key = `slate-${slate.id}`;
  return [
    {
      endpoint: 'dfs_slate_detail',
      key,
      path: `/nba/v1/dfs/slates/${slate.id}`,
      params: {},
    },
    paged({
      endpoint: 'dfs_draftables',
      key,
      path: '/nba/v1/dfs/draftables',
      params: { slate_ids: [slate.id] },
    }),
  ];
}

function playerContractJob(player) {
  return paged({
    endpoint: 'contracts_players',
    key: `player-${player.id}`,
    path: '/nba/v1/contracts/players',
    params: { player_id: player.id },
  });
}

function phaseTwo(games, players, slates) {
  const dates = new Map();
  for (const game of games) {
    if (game.date && !dates.has(game.date)) dates.set(game.date, game.season);
  }
  return [
    ...games.flatMap(gameJobs),
    ...dateJobs(dates),
    ...slates.flatMap(slateJobs),
    ...players.map(playerContractJob),
  ];
}

/**
 * Builds the job list.
 * Phase 1 needs nothing. Phase 2 needs the game list and active players from phase 1.
 */
export function buildJobs({ phase, seasons, games = [], players = [], slates = [] }) {
  const allSeasons = seasons ?? range(FIRST_SEASON, new Date().getUTCFullYear());
  return phase === 1 ? phaseOne(allSeasons) : phaseTwo(games, players, slates);
}
