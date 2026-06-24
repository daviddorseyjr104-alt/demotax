import { NextRequest, NextResponse } from 'next/server';
import { MS_SCOPE } from '@/lib/msGraph';
import { encryptToken } from '@/lib/cryptoSession';
import { envValue } from '@/lib/env';

/* Step 2 of Microsoft sign-in: Microsoft sends us a `code`. We trade it for
 * an access token (+ refresh token) and store them in secure cookies, then
 * send Reg back to the Client Hub. */

export async function GET(req: NextRequest) {
  const clientId = envValue('MS_CLIENT_ID');
  const clientSecret = envValue('MS_CLIENT_SECRET');
  const tenant = process.env.MS_TENANT_ID || 'common';
  const redirectUri =
    process.env.MS_REDIRECT_URI || `${req.nextUrl.origin}/api/auth/microsoft/callback`;

  const code = req.nextUrl.searchParams.get('code');
  const error = req.nextUrl.searchParams.get('error_description') || req.nextUrl.searchParams.get('error');

  // CSRF check: the state Microsoft echoed must match the cookie we set.
  const returnedState = req.nextUrl.searchParams.get('state');
  const expectedState = req.cookies.get('ms_oauth_state')?.value;
  // PKCE: the verifier we stored when starting sign-in.
  const verifier = req.cookies.get('ms_pkce_verifier')?.value;

  if (error) {
    return NextResponse.redirect(`${req.nextUrl.origin}/clients?ms_error=${encodeURIComponent(error)}`);
  }
  if (!clientId) {
    return NextResponse.redirect(`${req.nextUrl.origin}/clients?ms_error=not_configured`);
  }
  if (!code) {
    return NextResponse.redirect(`${req.nextUrl.origin}/clients?ms_error=missing_code`);
  }
  if (!returnedState || !expectedState || returnedState !== expectedState) {
    return NextResponse.redirect(`${req.nextUrl.origin}/clients?ms_error=state_mismatch`);
  }
  if (!verifier) {
    return NextResponse.redirect(`${req.nextUrl.origin}/clients?ms_error=missing_verifier`);
  }

  const body = new URLSearchParams({
    client_id: clientId,
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri,
    scope: MS_SCOPE,
    code_verifier: verifier,
  });
  // Secret is OPTIONAL: included only if Reg created one (confidential client).
  // Without it, PKCE secures the exchange (public client) — nothing to share.
  if (clientSecret) body.set('client_secret', clientSecret);

  const res = await fetch(`https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => res.statusText);
    return NextResponse.redirect(`${req.nextUrl.origin}/clients?ms_error=${encodeURIComponent(detail.slice(0, 120))}`);
  }

  const token = await res.json();
  const response = NextResponse.redirect(`${req.nextUrl.origin}/clients?ms_connected=1`);
  response.cookies.delete('ms_oauth_state');
  response.cookies.delete('ms_pkce_verifier');

  const secure = req.nextUrl.protocol === 'https:';
  const expiresInSec = Number(token.expires_in) || 3600;

  // Tokens are encrypted at rest (AES-GCM) so the cookie value is useless if stolen.
  response.cookies.set('ms_access_token', encryptToken(token.access_token), {
    httpOnly: true, secure, sameSite: 'lax', path: '/',
    maxAge: expiresInSec,
  });
  // When the access token expires, getMsToken() uses this to get a fresh one.
  if (token.refresh_token) {
    response.cookies.set('ms_refresh_token', encryptToken(token.refresh_token), {
      httpOnly: true, secure, sameSite: 'lax', path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
  }

  return response;
}
