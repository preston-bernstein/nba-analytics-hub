export type Parsed<T> = { ok: true; value: T } | { ok: false; error: string };

/** Picks one of the allowed values, or the fallback when the param is absent. */
export function parseEnum<T extends string>(
  raw: string | undefined,
  name: string,
  allowed: readonly T[],
  fallback: T
): Parsed<T> {
  if (raw === undefined) return { ok: true, value: fallback };
  const match = allowed.find((value) => value === raw);
  return match === undefined
    ? { ok: false, error: `${name} must be one of: ${allowed.join(', ')}` }
    : { ok: true, value: match };
}

interface IntegerOptions {
  min: number;
  max: number;
  /** Used when the param is absent. Without it, the param is required. */
  fallback?: number;
}

/** Reads a whole number inside a range, or the fallback when the param is absent. */
export function parseInteger(
  raw: string | undefined,
  name: string,
  { min, max, fallback }: IntegerOptions
): Parsed<number> {
  if (raw === undefined) {
    return fallback === undefined
      ? { ok: false, error: `${name} is required` }
      : { ok: true, value: fallback };
  }
  const value = Number(raw);
  return /^-?\d+$/.test(raw) && value >= min && value <= max
    ? { ok: true, value }
    : { ok: false, error: `${name} must be a whole number from ${min} to ${max}` };
}
