import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createLimiter } from './rateLimiter.mjs';
import { buildUrl, createClient } from './client.mjs';
import { fetchAllPages } from './paginate.mjs';
import { writeJob, readRecords, jobFile, jobDone } from './archive.mjs';
import { buildJobs } from './jobs.mjs';

const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'ingest-'));
const noSleep = async () => undefined;

async function* pages() {
  yield { url: 'u1', status: 200, fetchedAt: 't', body: { data: [1] } };
  yield { url: 'u2', status: 200, fetchedAt: 't', body: { data: [2] } };
}

async function* boom() {
  yield { url: 'u1', status: 200, fetchedAt: 't', body: {} };
  throw new Error('network');
}

test('limiter spaces calls by 60000/perMinute ms', async () => {
  let now = 0;
  const sleeps = [];
  const limiter = createLimiter({
    perMinute: 600,
    now: () => now,
    sleep: async (ms) => {
      sleeps.push(ms);
      now += ms;
    },
  });
  await limiter.take();
  await limiter.take();
  await limiter.take();
  assert.deepEqual(sleeps, [100, 100]);
});

test('buildUrl repeats array params with [] and skips undefined', () => {
  const url = buildUrl('https://x.test', '/nba/v1/games', {
    seasons: [2023, 2024],
    per_page: 100,
    cursor: undefined,
  });
  assert.equal(
    decodeURIComponent(url),
    'https://x.test/nba/v1/games?seasons[]=2023&seasons[]=2024&per_page=100'
  );
});

function fakeFetch(responses) {
  const calls = [];
  const fn = async (url) => {
    calls.push(url);
    const r = responses.shift();
    return {
      status: r.status,
      headers: { get: (k) => r.headers?.[k.toLowerCase()] ?? null },
      json: async () => r.body,
    };
  };
  fn.calls = calls;
  return fn;
}

test('client retries 429 then returns the good response', async () => {
  const fetch = fakeFetch([
    { status: 429, body: {} },
    { status: 200, body: { data: [1] } },
  ]);
  const client = createClient({
    apiKey: 'k',
    baseUrl: 'https://x.test',
    fetch,
    limiter: { take: async () => undefined },
    sleep: noSleep,
  });
  const res = await client.get('/a', {});
  assert.equal(res.status, 200);
  assert.equal(fetch.calls.length, 2);
});

test('client throws on 401 so a bad key stops the run', async () => {
  const fetch = fakeFetch([{ status: 401, body: {} }]);
  const client = createClient({
    apiKey: 'k',
    baseUrl: 'https://x.test',
    fetch,
    limiter: { take: async () => undefined },
    sleep: noSleep,
  });
  await assert.rejects(() => client.get('/a', {}), /401/);
});

test('client returns 400 and 404 without throwing', async () => {
  const fetch = fakeFetch([{ status: 404, body: { error: 'nope' } }]);
  const client = createClient({
    apiKey: 'k',
    baseUrl: 'https://x.test',
    fetch,
    limiter: { take: async () => undefined },
    sleep: noSleep,
  });
  assert.equal((await client.get('/a', {})).status, 404);
});

test('fetchAllPages follows next_cursor until it is absent', async () => {
  const responses = [
    { status: 200, url: 'u1', body: { data: [1], meta: { next_cursor: 5 } } },
    { status: 200, url: 'u2', body: { data: [2], meta: { next_cursor: 9 } } },
    { status: 200, url: 'u3', body: { data: [3], meta: {} } },
  ];
  const seen = [];
  const client = {
    get: async (_p, params) => {
      seen.push(params.cursor);
      return responses.shift();
    },
  };
  const out = [];
  for await (const page of fetchAllPages(client, '/x', { per_page: 100 })) out.push(page);
  assert.equal(out.length, 3);
  assert.deepEqual(seen, [undefined, 5, 9]);
});

test('fetchAllPages stops after a non-200 page', async () => {
  const client = { get: async () => ({ status: 400, url: 'u', body: {} }) };
  const out = [];
  for await (const page of fetchAllPages(client, '/x', {})) out.push(page);
  assert.equal(out.length, 1);
});

test('writeJob stores records gzipped and readRecords gives them back', async () => {
  const dir = tmp();
  const file = jobFile(dir, 'games', 'season-2024');
  assert.equal(jobDone(file), false);
  const n = await writeJob(file, pages());
  assert.equal(n, 2);
  assert.equal(jobDone(file), true);
  const records = readRecords(file);
  assert.deepEqual(
    records.map((r) => r.body.data[0]),
    [1, 2]
  );
});

test('writeJob leaves no final file when the source throws', async () => {
  const dir = tmp();
  const file = jobFile(dir, 'games', 'season-2024');
  await assert.rejects(() => writeJob(file, boom()), /network/);
  assert.equal(jobDone(file), false);
});

test('buildJobs makes one games job per season with a stable key', () => {
  const jobs = buildJobs({ phase: 1, seasons: [2023, 2024] });
  const games = jobs.filter((j) => j.endpoint === 'games');
  assert.deepEqual(
    games.map((j) => j.key),
    ['season-2023', 'season-2024']
  );
  assert.deepEqual(games[0].params.seasons, [2023]);
});

test('buildJobs phase 2 makes per-game jobs from game ids', () => {
  const games = [
    { id: 11, season: 2024, date: '2025-01-01' },
    { id: 12, season: 2024, date: '2025-01-02' },
  ];
  const jobs = buildJobs({ phase: 2, games });
  const wp = jobs.filter((j) => j.endpoint === 'win_probabilities');
  assert.deepEqual(
    wp.map((j) => j.params.game_id),
    [11, 12]
  );
  assert.ok(jobs.some((j) => j.endpoint === 'box_scores' && j.params.date === '2025-01-01'));
});

test('runPool runs every item and never exceeds the concurrency limit', async () => {
  const { runPool } = await import('./pool.mjs');
  let active = 0;
  let peak = 0;
  const seen = [];
  await runPool([1, 2, 3, 4, 5, 6, 7], 3, async (item) => {
    active += 1;
    peak = Math.max(peak, active);
    await new Promise((resolve) => setTimeout(resolve, 5));
    seen.push(item);
    active -= 1;
  });
  assert.deepEqual(seen.toSorted(), [1, 2, 3, 4, 5, 6, 7]);
  assert.ok(peak <= 3 && peak > 1);
});

test('runPool rejects when a task throws', async () => {
  const { runPool } = await import('./pool.mjs');
  await assert.rejects(
    () =>
      runPool([1, 2], 2, async (item) => {
        if (item === 2) throw new Error('boom');
      }),
    /boom/
  );
});

test('buildJobs phase 1 adds per-period stats jobs and DFS slates', () => {
  const jobs = buildJobs({ phase: 1, seasons: [2024] });
  const periods = jobs.filter((j) => j.endpoint === 'stats_period');
  assert.deepEqual(
    periods.map((j) => j.params.period),
    [1, 2, 3, 4, 5, 6, 7]
  );
  assert.equal(periods[0].key, 'season-2024_period-1');
  assert.ok(jobs.some((j) => j.endpoint === 'dfs_slates'));
});

test('buildJobs phase 2 adds DFS detail and draftables per slate', () => {
  const jobs = buildJobs({ phase: 2, slates: [{ id: 'abc' }] });
  assert.ok(jobs.some((j) => j.endpoint === 'dfs_slate_detail' && j.path.endsWith('/abc')));
  const draftables = jobs.find((j) => j.endpoint === 'dfs_draftables');
  assert.deepEqual(draftables.params.slate_ids, ['abc']);
});
