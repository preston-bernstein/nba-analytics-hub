import { parseEnum, parseInteger } from './queryParams.js';

describe('parseEnum', () => {
  const allowed = ['a', 'b'] as const;

  it('returns the fallback when the param is absent', () => {
    expect(parseEnum(undefined, 'x', allowed, 'a')).toEqual({ ok: true, value: 'a' });
  });

  it('returns an allowed value', () => {
    expect(parseEnum('b', 'x', allowed, 'a')).toEqual({ ok: true, value: 'b' });
  });

  it('rejects any other value and names the param', () => {
    expect(parseEnum('c', 'x', allowed, 'a')).toEqual({
      ok: false,
      error: 'x must be one of: a, b',
    });
  });
});

describe('parseInteger', () => {
  const opts = { min: 1, max: 10, fallback: 5 };

  it('returns the fallback when the param is absent', () => {
    expect(parseInteger(undefined, 'n', opts)).toEqual({ ok: true, value: 5 });
  });

  it('parses an integer inside the range', () => {
    expect(parseInteger('7', 'n', opts)).toEqual({ ok: true, value: 7 });
  });

  it.each(['0', '11', 'abc', '1.5', '-3', '1e3'])('rejects %s', (raw) => {
    expect(parseInteger(raw, 'n', opts).ok).toBe(false);
  });

  it('is required when there is no fallback', () => {
    expect(parseInteger(undefined, 'n', { min: 1, max: 10 })).toEqual({
      ok: false,
      error: 'n is required',
    });
  });
});
