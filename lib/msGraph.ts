import { cookies } from 'next/headers';
import { decryptToken } from './cryptoSession';
import { envValue } from './env';

/* Shared Microsoft Graph helpers for the Client Hub.
 * One sign-in (see /api/auth/microsoft) covers mail AND OneDrive files. */

export const MS_SCOPE = 'openid offline_access User.Read Mail.Read Files.Read.All';

const GRAPH = 'https://graph.microsoft.com/v1.0';

async function refreshAccessToken(refreshToken: string): Promise<string | null> {
  const clientId = envValue('MS_CLIENT_ID');
  const clientSecret = envValue('MS_CLIENT_SECRET');
  const tenant = process.env.MS_TENANT_ID || 'common';
  if (!clientId) return null;

  const params = new URLSearchParams({
    client_id: clientId,
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    scope: MS_SCOPE,
  });
  // Secret optional — public (PKCE) clients refresh without one.
  if (clientSecret) params.set('client_secret', clientSecret);

  const res = await fetch(`https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params,
  });
  if (!res.ok) return null;
  const data = await res.json();
  return (data.access_token as string) || null;
}

/** Resolve a usable Graph access token from the (encrypted) signed-in cookie,
 *  refreshing if needed. Falls back to a static MS_GRAPH_TOKEN env for testing. */
export async function getMsToken(): Promise<string | null> {
  const jar = await cookies();
  const access = jar.get('ms_access_token')?.value;
  if (access) {
    const dec = decryptToken(access);
    if (dec) return dec;
  }
  const refresh = jar.get('ms_refresh_token')?.value;
  if (refresh) {
    const decRefresh = decryptToken(refresh);
    if (decRefresh) {
      const fresh = await refreshAccessToken(decRefresh);
      if (fresh) return fresh;
    }
  }
  return process.env.MS_GRAPH_TOKEN || null;
}

/** GET a Graph path, returning parsed JSON. Throws with detail on failure. */
export async function graphGet<T = unknown>(path: string, token: string): Promise<T> {
  const res = await fetch(`${GRAPH}${path}`, {
    headers: { Authorization: `Bearer ${token}`, ConsistencyLevel: 'eventual' },
  });
  if (!res.ok) {
    const err = await res.text().catch(() => res.statusText);
    throw new Error(`Graph ${path}: ${res.status} — ${err}`);
  }
  return res.json() as Promise<T>;
}

export type GraphMessage = {
  sentDateTime?: string;
  receivedDateTime?: string;
  toRecipients?: { emailAddress?: { address?: string } }[];
};

/** List messages in a folder since a date — reliable across tenants (avoids
 *  the brittle $count+$filter combo). Pages up to `max` messages. */
export async function listMessagesSince(
  folder: 'SentItems' | 'Inbox',
  sinceIso: string,
  token: string,
  select: string,
  max = 900,
): Promise<GraphMessage[]> {
  const dateField = folder === 'SentItems' ? 'sentDateTime' : 'receivedDateTime';
  let path: string | null =
    `/me/mailFolders/${folder}/messages?$filter=${dateField} ge ${sinceIso}` +
    `&$select=${select}&$top=200&$orderby=${dateField} desc`;
  const out: GraphMessage[] = [];

  while (path && out.length < max) {
    const page: { value?: GraphMessage[]; '@odata.nextLink'?: string } = await graphGet(path, token);
    out.push(...(page.value ?? []));
    const next = page['@odata.nextLink'];
    path = next ? next.replace(GRAPH, '') : null;
  }
  return out;
}

export { dayKey, last7Days } from './dates';
