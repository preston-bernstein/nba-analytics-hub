import { afterEach, describe, expect, it } from 'vitest';
import { loadEnv, type AppEnv } from './loadEnv';

describe('loadEnv', () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('defaults values when missing', () => {
    delete process.env.VITE_API_BASE_URL;
    delete process.env.API_BASE_URL;
    delete process.env.PREDICTOR_BASE_URL;

    const env = loadEnv({});
    expect(env.NODE_ENV).toBe(
      ((process.env.NODE_ENV as AppEnv['NODE_ENV']) ?? 'development'),
    );
    expect(env.API_BASE_URL).toBe('http://localhost:3333');
    expect(env.PREDICTOR_BASE_URL).toBe('http://localhost:8000');
  });

  it('falls back to development when NODE_ENV is not set anywhere', () => {
    delete process.env.NODE_ENV;

    const env = loadEnv({});

    expect(env.NODE_ENV).toBe('development');
  });

  it('prefers provided values and validates NODE_ENV', () => {
    const env = loadEnv({
      NODE_ENV: 'production',
      API_BASE_URL: 'https://api.example.com',
      PREDICTOR_BASE_URL: 'https://predictor.example.com',
    } satisfies Partial<AppEnv>);

    expect(env.NODE_ENV).toBe('production');
    expect(env.API_BASE_URL).toBe('https://api.example.com');
    expect(env.PREDICTOR_BASE_URL).toBe('https://predictor.example.com');
  });

  it('supports VITE_API_BASE_URL precedence', () => {
    const env = loadEnv({ VITE_API_BASE_URL: 'https://vite-api.example.com' });
    expect(env.API_BASE_URL).toBe('https://vite-api.example.com');
  });

  it('reads process env values when provided', () => {
    process.env.VITE_API_BASE_URL = 'https://proc-api.example.com';
    process.env.PREDICTOR_BASE_URL = 'https://proc-predictor.example.com';

    const env = loadEnv({});

    expect(env.API_BASE_URL).toBe('https://proc-api.example.com');
    expect(env.PREDICTOR_BASE_URL).toBe('https://proc-predictor.example.com');
  });

  it('throws on invalid NODE_ENV', () => {
    expect(() =>
      loadEnv({ NODE_ENV: 'staging' as AppEnv['NODE_ENV'] }),
    ).toThrow(/NODE_ENV/);
  });

  it('ignores blank API_BASE_URL and uses fallback', () => {
    delete process.env.VITE_API_BASE_URL;
    delete process.env.API_BASE_URL;

    const env = loadEnv({ API_BASE_URL: '' });
    expect(env.API_BASE_URL).toBe('http://localhost:3333');
  });

  it('ignores blank PREDICTOR_BASE_URL and uses fallback', () => {
    const env = loadEnv({ PREDICTOR_BASE_URL: '' });
    expect(env.PREDICTOR_BASE_URL).toBe('http://localhost:8000');
  });

  it('ignores whitespace-only process env and uses fallback values', () => {
    delete process.env.VITE_API_BASE_URL;
    process.env.API_BASE_URL = '   ';
    process.env.PREDICTOR_BASE_URL = '   ';

    const env = loadEnv({});

    expect(env.API_BASE_URL).toBe('http://localhost:3333');
    expect(env.PREDICTOR_BASE_URL).toBe('http://localhost:8000');
  });
});
