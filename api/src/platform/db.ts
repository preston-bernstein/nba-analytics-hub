import { Pool } from 'pg';

/** Returns a Postgres pool from DATABASE_URL, or undefined when it is not set. */
export function createPoolFromEnv(): Pool | undefined {
  const url = process.env.DATABASE_URL;
  return url ? new Pool({ connectionString: url, max: 5 }) : undefined;
}
