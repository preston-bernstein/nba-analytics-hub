# BALLDONTLIE archive puller

Saves BALLDONTLIE NBA API responses to disk exactly as the API sent them. Nothing is renamed or reshaped.

## Layout

One file per job: `<out>/raw/<endpoint>/<key>.ndjson.gz`. Each line is one API response:

```json
{ "url": "...", "status": 200, "fetchedAt": "...", "body": { "data": [], "meta": {} } }
```

Non-200 answers are saved too, so the archive shows what the API said.

## Run

```sh
BALLDONTLIE_API_KEY=... node tools/ingest/run.mjs --out /data --phase all
```

- `--phase 1` pulls reference data, games, stats and season data. `--phase 2` pulls per-game and per-date data, and needs the games from phase 1.
- `--only games,stats` limits the run to some endpoints. `--smoke` runs one job per endpoint.
- `--rate 540` sets calls per minute. The GOAT plan allows 600. `--concurrency 4` sets parallel jobs.
- Safe to stop and start again. A job is done when its final file exists. A crash leaves only a `.tmp` file, and the job runs again.
- A 401 or 403 stops the run. A 429 or 5xx is retried with backoff.

## Test

```sh
node --test tools/ingest/lib/ingest.test.mjs
```

## Why raw first

The paid plan is for one month. The raw archive is the only copy of what the API returned, so it is kept as-is. Tables for the app are built from it later and can be rebuilt at any time.
