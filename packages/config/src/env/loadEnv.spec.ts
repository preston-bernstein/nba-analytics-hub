import { describe, expect, it } from 'vitest';
import { loadEnv, type AppEnv } from './loadEnv';

describe('loadEnv', () => {
  it('defaults values when missing', () => {
    const env = loadEnv({});
    expect(env.NODE_ENV).toBe(
      ((process.env.NODE_ENV as AppEnv['NODE_ENV']) ?? 'development'),
    );
    expect(env.API_BASE_URL).toBe('http://localhost:3333');
    expect(env.PREDICTOR_BASE_URL).toBe('http://localhost:8000');
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

  it('throws on invalid NODE_ENV', () => {
    expect(() =>
      loadEnv({ NODE_ENV: 'staging' as AppEnv['NODE_ENV'] }),
    ).toThrow(/NODE_ENV/);
  });
});
