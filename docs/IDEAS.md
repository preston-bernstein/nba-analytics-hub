# Feature ideas

Ideas to build toward in the app. None are started. Each one uses data that is already in the Postgres archive (schema `bdl`, loaded from BALLDONTLIE).

Order is a suggestion, not a plan. The first idea is the smallest build.

## 1. Beat the Line

Show an opening player prop, such as "25.5 points". The user picks over or under. The game scores the pick against the real box score.

- Data: `bdl.player_props_opening` (about 2M lines) joined to `bdl.stats`.
- Output: a calibration score, a streak, and a list of players whose lines are often wrong.
- Rule: a skill game only. No money and no betting links.
- Open question: confirm the props table joins cleanly to box scores by player and date.

## 2. Win-Probability Time Machine

Pick any game. Step through it play by play with the win-probability curve above. A "swing" button jumps to the plays that moved the game most. A daily "miracle index" ranks the biggest comebacks.

- Data: `bdl.plays` (about 4.9M) and `bdl.win_probabilities` (about 4.9M).

## 3. Player Twins

Make a fingerprint for each player-season from shot locations and play style. Find the closest match in history. Sliders let the user build a made-up player and see who it matches. A spacing score shows whether five players overlap.

- Data: `bdl.shot_charts` (about 1.8M) and `bdl.stats_tracking` (about 2.2M).

## 4. Era Translator

Move a player-season into another year's pace and scoring level. Example: 1996-97 Jordan in the 2025-26 league. A "same-season draft" lets the user pick an all-time team with every stat adjusted for era.

- Data: `bdl.season_averages` (about 572K) for league context.

## 5. Chemistry Lab

Build a custom team from real lineup results. Small samples are pulled toward each player's own rating, so a five-man unit with 20 minutes does not give silly answers. Show which pairs do better together than apart. Season simulation and an expansion draft are modes inside this tool.

- Data: `bdl.lineup_stats` (about 321K), plus `bdl.season_averages`.
- Method: shrink lineup ratings toward a prior. See the L-RAPM paper and CraftedNBA "stabilized net ratings".
- This is the largest build.

## Background

An advisor sweep on 2026-11-12 found that "draft a team, run a season" simulators already exist (The Great Rebalance, Draft 82-0, Basketball GM). None use play-by-play, win probability, shot charts or prop lines. The new part here is the data, not the engine.

Full notes are in the Obsidian vault: `Development/Research/turning-a-large-nba-stats-archive-into-novel-interactive-cal.md`.
