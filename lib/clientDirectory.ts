/* ------------------------------------------------------------------ *
 *  CLIENT DIRECTORY (lightweight)
 *
 *  A minimal client list used by the global Quick Switcher (Ctrl+K) so
 *  Reg can jump straight to a client's OneDrive folder from any page.
 *  Pulls live deals from HubSpot (/api/clients); falls back to a small
 *  sample directory so the switcher is demo-able before HubSpot is wired.
 *
 *  The Client Hub page keeps its own richer SAMPLE_CLIENTS (with docs /
 *  emails); this only needs what's required to find + open a folder.
 * ------------------------------------------------------------------ */

export type ClientLite = {
  id: string;
  name: string;
  company: string;
  stage: string;
  folderId?: string | null;
};

// Mirrors the names in app/clients/page.tsx SAMPLE_CLIENTS so the switcher
// shows the same demo clients when HubSpot isn't connected yet.
export const SAMPLE_CLIENT_DIRECTORY: ClientLite[] = [
  { id: 'c1', name: 'Marcus Whitfield', company: 'Whitfield Logistics LLC', stage: 'Proposal Sent', folderId: null },
  { id: 'c2', name: 'Elena Vasquez', company: 'Vasquez Property Group', stage: 'Active Opportunity', folderId: null },
  { id: 'c3', name: 'David Chen', company: 'Chen Capital Partners', stage: 'Meeting Scheduled', folderId: null },
];

/**
 * Load the client directory. Returns live HubSpot clients when configured,
 * otherwise the sample directory. `source` tells the caller which it got.
 */
export async function loadClientDirectory(
  signal?: AbortSignal,
): Promise<{ clients: ClientLite[]; source: 'live' | 'sample' }> {
  try {
    const res = await fetch('/api/clients', { signal });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.clients) && data.clients.length) {
        const clients: ClientLite[] = data.clients.map((c: Partial<ClientLite>) => ({
          id: c.id!,
          name: c.name || c.company || 'Unnamed',
          company: c.company || '',
          stage: c.stage || '',
          folderId: c.folderId ?? null,
        }));
        return { clients, source: 'live' };
      }
    }
  } catch {
    /* fall through to sample */
  }
  return { clients: SAMPLE_CLIENT_DIRECTORY, source: 'sample' };
}

/**
 * Resolve the OneDrive folder URL for a client via Microsoft Graph.
 * Prefers a pinned folder id; otherwise matches by company/client name
 * (folders are named after clients). Returns null if not connected or
 * no folder matched. `status` distinguishes the two for the UI.
 */
export async function resolveClientFolderUrl(
  client: ClientLite,
  signal?: AbortSignal,
): Promise<{ url: string | null; status: 'ok' | 'no_match' | 'not_connected' | 'error' }> {
  const lookup = client.company || client.name;
  const params = client.folderId
    ? `folderId=${encodeURIComponent(client.folderId)}`
    : `client=${encodeURIComponent(lookup)}`;
  try {
    const res = await fetch(`/api/client-files?${params}`, { signal });
    if (res.status === 503) return { url: null, status: 'not_connected' };
    if (!res.ok) return { url: null, status: 'error' };
    const data = await res.json().catch(() => null);
    if (data?.matched && data.folderUrl) return { url: data.folderUrl, status: 'ok' };
    return { url: null, status: 'no_match' };
  } catch {
    return { url: null, status: 'error' };
  }
}
