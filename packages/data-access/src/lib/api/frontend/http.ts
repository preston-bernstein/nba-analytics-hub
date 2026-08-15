export { fetchJson } from '../shared/http.js';

/**
 * Normalizes a client base path to either an empty string or a
 * leading-slash, no-trailing-slash path segment (e.g. '/api').
 */
export function normalizeBasePath(basePath?: string): string {
  if (!basePath) return '';

  const trimmed = basePath.trim();
  if (!trimmed) return '';

  const withLeadingSlash = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return withLeadingSlash.endsWith('/')
    ? withLeadingSlash.slice(0, -1)
    : withLeadingSlash;
}
