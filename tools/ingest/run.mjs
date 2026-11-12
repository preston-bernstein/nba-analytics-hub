#!/usr/bin/env node
// Pulls BALLDONTLIE NBA data into a raw archive, one API response per line.
//
//   BALLDONTLIE_API_KEY=... node run.mjs --out /data --phase 1
//   node run.mjs --out /data --phase 2
//   node run.mjs --out /tmp/smoke --smoke        # one job per endpoint
//
// Safe to stop and start again: finished jobs are skipped.
import fs from 'node:fs';
import path from 'node:path';
import { createLimiter } from './lib/rateLimiter.mjs';
import { createClient } from './lib/client.mjs';
import { fetchAllPages } from './lib/paginate.mjs';
import { writeJob, readRecords, jobFile, jobDone } from './lib/archive.mjs';
import { buildJobs } from './lib/jobs.mjs';
import { runPool } from './lib/pool.mjs';

const BASE_URL = 'https://api.balldontlie.io';

function parseArgs(argv) {
  const args = {
    phase: 'all',
    rate: 540,
    concurrency: 4,
    only: undefined,
    smoke: false,
    out: undefined,
  };
  for (let i = 0; i < argv.length; i += 1) {
    const flag = argv[i];
    if (flag === '--smoke') args.smoke = true;
    else if (flag === '--out') args.out = argv[++i];
    else if (flag === '--phase') args.phase = argv[++i];
    else if (flag === '--rate') args.rate = Number(argv[++i]);
    else if (flag === '--concurrency') args.concurrency = Number(argv[++i]);
    else if (flag === '--only') args.only = argv[++i].split(',');
    else throw new Error(`Unknown flag ${flag}`);
  }
  if (!args.out) throw new Error('--out <dir> is required');
  return args;
}

function loadGames(root) {
  const dir = path.join(root, 'raw', 'games');
  if (!fs.existsSync(dir)) return [];
  const games = [];
  for (const name of fs.readdirSync(dir).filter((n) => n.endsWith('.ndjson.gz'))) {
    for (const record of readRecords(path.join(dir, name))) {
      for (const game of record.body?.data ?? []) {
        games.push({ id: game.id, season: game.season, date: game.date?.slice(0, 10) });
      }
    }
  }
  return games;
}

function loadActivePlayers(root) {
  const file = jobFile(root, 'players_active', 'all');
  if (!jobDone(file)) return [];
  return readRecords(file).flatMap((record) => record.body?.data ?? []);
}

async function runJobs(jobs, client, root, log, concurrency) {
  const stats = new Map();
  let finished = 0;
  await runPool(jobs, concurrency, async (job) => {
    const file = jobFile(root, job.endpoint, job.key);
    if (!jobDone(file)) {
      const bucket = stats.get(job.endpoint) ?? { jobs: 0, pages: 0, nonOk: 0 };
      stats.set(job.endpoint, bucket);
      const pages = (async function* () {
        for await (const page of fetchAllPages(client, job.path, job.params)) {
          if (page.status !== 200) bucket.nonOk += 1;
          yield page;
        }
      })();
      bucket.pages += await writeJob(file, pages);
      bucket.jobs += 1;
    }
    finished += 1;
    if (finished % 100 === 0) log(`[${finished}/${jobs.length}] ${job.endpoint} ${job.key}`);
  });
  return stats;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const apiKey = process.env.BALLDONTLIE_API_KEY;
  if (!apiKey) throw new Error('Set BALLDONTLIE_API_KEY');
  fs.mkdirSync(args.out, { recursive: true });
  const logFile = path.join(args.out, 'run.log');
  const log = (line) => {
    const text = `${new Date().toISOString()} ${line}`;
    console.log(text);
    fs.appendFileSync(logFile, `${text}\n`);
  };
  const limiter = createLimiter({ perMinute: args.rate });
  const client = createClient({ apiKey, baseUrl: BASE_URL, limiter });

  const phases = args.phase === 'all' ? [1, 2] : [Number(args.phase)];
  for (const phase of phases) {
    let jobs =
      phase === 1
        ? buildJobs({ phase: 1 })
        : buildJobs({ phase: 2, games: loadGames(args.out), players: loadActivePlayers(args.out) });
    if (args.only) jobs = jobs.filter((job) => args.only.includes(job.endpoint));
    if (args.smoke) {
      const seen = new Set();
      jobs = jobs.filter((job) => !seen.has(job.endpoint) && seen.add(job.endpoint));
    }
    log(`phase ${phase}: ${jobs.length} jobs`);
    const stats = await runJobs(jobs, client, args.out, log, args.concurrency);
    for (const [endpoint, s] of stats) {
      log(`  ${endpoint}: ${s.jobs} jobs, ${s.pages} pages, ${s.nonOk} non-200`);
    }
  }
  log('done');
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
