import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import zlib from 'node:zlib';

/** Final file for one job: <root>/raw/<endpoint>/<key>.ndjson.gz */
export function jobFile(root, endpoint, key) {
  return path.join(root, 'raw', endpoint, `${key}.ndjson.gz`);
}

/** A job is done when its final file exists. Files are renamed into place only when complete. */
export function jobDone(file) {
  return fs.existsSync(file);
}

/**
 * Writes pages as gzipped JSON lines, one line per API response, then renames
 * the temp file into place. A crash leaves only a .tmp file, so the job runs
 * again. Returns the number of records written.
 */
export async function writeJob(file, pages) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const tmp = `${file}.tmp`;
  fs.rmSync(tmp, { force: true });
  let count = 0;
  for await (const page of pages) {
    fs.appendFileSync(tmp, zlib.gzipSync(`${JSON.stringify(page)}\n`));
    count += 1;
  }
  fs.renameSync(tmp, file);
  return count;
}

/** Reads every record from a job file. */
export function readRecords(file) {
  const text = zlib.gunzipSync(fs.readFileSync(file)).toString('utf8');
  return text
    .split('\n')
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}

/** Streams records one at a time, so a large file never has to fit in memory. */
export async function* streamRecords(file) {
  const lines = readline.createInterface({
    input: fs.createReadStream(file).pipe(zlib.createGunzip()),
    crlfDelay: Infinity,
  });
  for await (const line of lines) {
    if (line) yield JSON.parse(line);
  }
}
