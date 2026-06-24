import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';

/* Encrypt Microsoft tokens before they go into cookies, so a stolen cookie
 * (or anyone reading the browser jar) can't use the raw access/refresh token.
 * AES-256-GCM with a key derived from SESSION_SECRET. */

const PLACEHOLDER = 'change-me-to-a-long-random-string';

function key(): Buffer | null {
  const secret = process.env.SESSION_SECRET;
  // Treat the unchanged placeholder as "not set" — it would give false security.
  if (!secret || secret.length < 16 || secret === PLACEHOLDER) return null;
  return scryptSync(secret, 'tax-os-ms-token', 32);
}

export function encryptToken(plain: string): string {
  const k = key();
  if (!k) return plain; // dev fallback when SESSION_SECRET unset
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', k, iv);
  const enc = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `v1.${iv.toString('base64url')}.${tag.toString('base64url')}.${enc.toString('base64url')}`;
}

export function decryptToken(value: string): string | null {
  if (!value.startsWith('v1.')) return value; // plaintext (dev fallback)
  const k = key();
  if (!k) return null;
  try {
    const [, ivB, tagB, dataB] = value.split('.');
    const decipher = createDecipheriv('aes-256-gcm', k, Buffer.from(ivB, 'base64url'));
    decipher.setAuthTag(Buffer.from(tagB, 'base64url'));
    return Buffer.concat([decipher.update(Buffer.from(dataB, 'base64url')), decipher.final()]).toString('utf8');
  } catch {
    return null;
  }
}
