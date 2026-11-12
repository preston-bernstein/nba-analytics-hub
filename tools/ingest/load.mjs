#!/usr/bin/env node
// Streams one endpoint of the raw archive as CSV on stdout, or prints its schema SQL.
// Pipe into psql, see load.sh.
import fs from 'node:fs';
import path from 'node:path';
import { once } from 'node:events';
import { streamRecords } from './lib/archive.mjs';
import { extractRows, csvLine, createTableSql } from './lib/load.mjs';

const [mode, dir, endpoint] = process.argv.slice(2);
if (!['sql', 'csv'].includes(mode) || !endpoint) {
  console.error('usage: load.mjs sql|csv <archive-dir> <endpoint>');
  process.exit(2);
}

if (mode === 'sql') {
  console.log(createTableSql(endpoint));
} else {
  const folder = path.join(dir, 'raw', endpoint);
  const names = fs
    .readdirSync(folder)
    .filter((n) => n.endsWith('.ndjson.gz'))
    .toSorted();
  for (const name of names) {
    const jobKey = name.replace('.ndjson.gz', '');
    let page = 0;
    for await (const record of streamRecords(path.join(folder, name))) {
      for (const row of extractRows(record, jobKey, page)) {
        // Wait for the pipe to drain, so output never piles up in memory.
        if (!process.stdout.write(csvLine(row))) await once(process.stdout, 'drain');
      }
      page += 1;
    }
  }
}
