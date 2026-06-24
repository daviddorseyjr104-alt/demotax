import { describe, it, expect, beforeEach } from 'vitest';
import { encryptToken, decryptToken } from './cryptoSession';

describe('cryptoSession with SESSION_SECRET set', () => {
  beforeEach(() => { process.env.SESSION_SECRET = 'a-proper-long-random-secret-value-123'; });

  it('round-trips a token', () => {
    const secret = 'ya29.super-secret-access-token';
    const enc = encryptToken(secret);
    expect(enc).not.toBe(secret);          // actually encrypted
    expect(enc.startsWith('v1.')).toBe(true);
    expect(decryptToken(enc)).toBe(secret);
  });

  it('produces a different ciphertext each time (random IV)', () => {
    expect(encryptToken('same')).not.toBe(encryptToken('same'));
  });

  it('rejects a tampered ciphertext', () => {
    const enc = encryptToken('important');
    const tampered = enc.slice(0, -2) + (enc.endsWith('aa') ? 'bb' : 'aa');
    expect(decryptToken(tampered)).toBeNull();
  });
});

describe('cryptoSession without SESSION_SECRET (dev fallback)', () => {
  beforeEach(() => { delete process.env.SESSION_SECRET; });

  it('stores plaintext and reads it back', () => {
    expect(encryptToken('plain')).toBe('plain');
    expect(decryptToken('plain')).toBe('plain');
  });

  it('treats the unchanged placeholder secret as not set', () => {
    process.env.SESSION_SECRET = 'change-me-to-a-long-random-string';
    expect(encryptToken('plain')).toBe('plain'); // no real encryption
  });
});
