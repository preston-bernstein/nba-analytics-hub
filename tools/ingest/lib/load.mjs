// Pure helpers that turn archived API responses into Postgres rows.
const NAME = /^[a-z][a-z0-9_]*$/;

export function tableName(endpoint) {
  if (!NAME.test(endpoint)) throw new Error(`bad endpoint name: ${endpoint}`);
  return `bdl.${endpoint}`;
}

export function extractRows(record, jobKey, page) {
  if (record.status !== 200) return [];
  const data = record.body?.data;
  if (data === undefined || data === null) return [];
  const items = Array.isArray(data) ? data : [data];
  return items.map((item, row) => ({
    jobKey,
    page,
    row,
    fetchedAt: record.fetchedAt,
    url: record.url,
    data: item,
  }));
}

const quote = (value) => `"${String(value).replaceAll('"', '""')}"`;

export function csvLine(r) {
  // Postgres jsonb rejects the \u0000 escape, so drop it.
  const json = JSON.stringify(r.data).replaceAll('\\u0000', '');
  return [r.jobKey, r.page, r.row, r.fetchedAt, r.url, json].map(quote).join(',') + '\n';
}

export const COLUMNS = '(job_key, page_no, row_no, fetched_at, source_url, data)';

export function createTableSql(endpoint) {
  const table = tableName(endpoint);
  return [
    `create table if not exists ${table} (`,
    '  job_key text not null,',
    '  page_no int not null,',
    '  row_no int not null,',
    '  fetched_at timestamptz not null,',
    '  source_url text not null,',
    '  data jsonb not null,',
    '  primary key (job_key, page_no, row_no)',
    ');',
    `create index if not exists ${endpoint}_id_idx on ${table} ((data->>'id'));`,
  ].join('\n');
}
