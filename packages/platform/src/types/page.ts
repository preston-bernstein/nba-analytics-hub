/** One page of a list that the server sorts and slices. */
export interface Page<T> {
  rows: T[];
  /** Row count across all pages, after any search filter. */
  total: number;
  limit: number;
  offset: number;
}

export type SortDir = 'asc' | 'desc';
