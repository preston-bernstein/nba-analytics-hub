import { test } from 'node:test';
import assert from 'node:assert/strict';
import { extractRows, csvLine, tableName, createTableSql } from './load.mjs';

const record = (body) => ({ url: 'https://x.test/a', status: 200, fetchedAt: 't', body });

test('extractRows returns one row per item in body.data', () => {
  const rows = extractRows(record({ data: [{ id: 1 }, { id: 2 }] }), 'season-2024', 3);
  assert.equal(rows.length, 2);
  assert.deepEqual(rows[1], {
    jobKey: 'season-2024',
    page: 3,
    row: 1,
    fetchedAt: 't',
    url: 'https://x.test/a',
    data: { id: 2 },
  });
});

test('extractRows wraps a single object body.data as one row', () => {
  const rows = extractRows(record({ data: { id: 9 } }), 'slate-9', 0);
  assert.equal(rows.length, 1);
  assert.deepEqual(rows[0].data, { id: 9 });
});

test('extractRows skips empty data and non-200 records', () => {
  assert.deepEqual(extractRows(record({ data: [] }), 'k', 0), []);
  assert.deepEqual(extractRows({ ...record({ data: [{ id: 1 }] }), status: 400 }, 'k', 0), []);
});

test('csvLine quotes every field and doubles quotes, keeps commas and newlines inside', () => {
  const line = csvLine({
    jobKey: 'a,b',
    page: 0,
    row: 0,
    fetchedAt: 't',
    url: 'u',
    data: { text: 'say "hi"\nbye\\now' },
  });
  assert.equal(line, '"a,b","0","0","t","u","{""text"":""say \\""hi\\""\\nbye\\\\now""}"\n');
});

test('tableName allows only safe endpoint names', () => {
  assert.equal(tableName('box_scores'), 'bdl.box_scores');
  assert.throws(() => tableName('x; drop table y'), /endpoint/);
});

test('createTableSql makes a jsonb table with provenance columns and an id index', () => {
  const sql = createTableSql('games');
  assert.match(sql, /create table if not exists bdl\.games/i);
  assert.match(sql, /data jsonb not null/i);
  assert.match(sql, /job_key text not null/i);
  assert.match(sql, /create index if not exists games_id_idx on bdl\.games \(\(data->>'id'\)\)/i);
});
