import { describe, it, expect, afterEach } from 'vitest';
import { envValue } from './env';

const KEY = 'TEST_ENV_VALUE_KEY';

afterEach(() => { delete process.env[KEY]; });

describe('envValue', () => {
  it('returns undefined when unset', () => {
    expect(envValue(KEY)).toBeUndefined();
  });

  it('treats placeholder "your-…" values as unset', () => {
    process.env[KEY] = 'your-azure-app-client-id';
    expect(envValue(KEY)).toBeUndefined();
  });

  it('treats "…-here" placeholders as unset', () => {
    process.env[KEY] = 'your-private-app-token-here';
    expect(envValue(KEY)).toBeUndefined();
  });

  it('treats the change-me secret placeholder as unset', () => {
    process.env[KEY] = 'change-me-to-a-long-random-string';
    expect(envValue(KEY)).toBeUndefined();
  });

  it('returns a real configured value', () => {
    process.env[KEY] = 'pat-na1-real-token-1234';
    expect(envValue(KEY)).toBe('pat-na1-real-token-1234');
  });

  it('trims surrounding whitespace', () => {
    process.env[KEY] = '  real-value  ';
    expect(envValue(KEY)).toBe('real-value');
  });
});
