import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { MS_SCOPE } from '@/lib/msGraph';
import { envValue } from '@/lib/env';
import { createVerifier, challengeFor } from '@/lib/pkce';

/* Step 1 of Microsoft sign-in: send Reg to the Microsoft login page.
 * After he approves, Microsoft redirects to /api/auth/microsoft/callback.
 * One consent covers mail (counts) and OneDrive files (client folders).
 * Uses PKCE so NO client secret is required — only the Client ID. */

export async function GET(req: NextRequest) {
  const clientId = envValue('MS_CLIENT_ID');
  if (!clientId) {
    return NextResponse.json(
      { error: 'MS_CLIENT_ID not configured. See SETUP-LIVE.md to connect Microsoft 365.' },
      { status: 503 },
    );
  }

  const tenant = process.env.MS_TENANT_ID || 'common';
  const redirectUri =
    process.env.MS_REDIRECT_URI || `${req.nextUrl.origin}/api/auth/microsoft/callback`;

  // CSRF protection: a random state echoed back by Microsoft and checked
  // against this cookie in the callback.
  const state = randomUUID();
  // PKCE: send the challenge now, prove the verifier at the callback.
  const verifier = createVerifier();

  const url = new URL(`https://login.microsoftonline.com/${tenant}/oauth2/v2.0/authorize`);
  url.searchParams.set('client_id', clientId);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('response_mode', 'query');
  url.searchParams.set('scope', MS_SCOPE);
  url.searchParams.set('prompt', 'select_account');
  url.searchParams.set('state', state);
  url.searchParams.set('code_challenge', challengeFor(verifier));
  url.searchParams.set('code_challenge_method', 'S256');

  const res = NextResponse.redirect(url.toString());
  const cookieOpts = {
    httpOnly: true, secure: req.nextUrl.protocol === 'https:', sameSite: 'lax' as const,
    path: '/', maxAge: 600, // 10 min to complete sign-in
  };
  res.cookies.set('ms_oauth_state', state, cookieOpts);
  res.cookies.set('ms_pkce_verifier', verifier, cookieOpts);
  return res;
}
