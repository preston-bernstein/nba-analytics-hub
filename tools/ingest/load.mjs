#!/usr/bin/env node
// Streams one endpoint of the raw archive as CSV on stdout, or prints its schema SQL.
// Pipe into psql, see load.sh.
import fs from 'node:fs';
import path from 'node:path';
import { readRecords } from './lib/archive.mjs';
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
  for (const name of fs
    .readdirSync(folder)
    .filter((n) => n.endsWith('.ndjson.gz'))
    .toSorted()) {
    const jobKey = name.replace('.ndjson.gz', '');
    readRecords(path.join(folder, name)).forEach((record, page) => {
      for (const row of extractRows(record, jobKey, page)) process.stdout.write(csvLine(row));
    });
  }
}
