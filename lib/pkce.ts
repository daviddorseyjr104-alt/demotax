import { createHash, randomBytes } from 'crypto';

/* PKCE (Proof Key for Code Exchange) lets the Microsoft sign-in work WITHOUT a
 * client secret. We send a hash of a random verifier up front, then prove we
 * hold the original verifier when exchanging the code. This means Reg never has
 * to create or share a secret — only the (non-sensitive) Client ID. */

export function createVerifier(): string {
  return randomBytes(48).toString('base64url'); // 64-char high-entropy verifier
}

export function challengeFor(verifier: string): string {
  return createHash('sha256').update(verifier).digest('base64url');
}
