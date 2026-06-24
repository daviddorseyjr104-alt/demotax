import { NextResponse } from 'next/server';
import { envValue } from '@/lib/env';

/* ------------------------------------------------------------------ *
 *  CLIENTS  (live deals + contacts from HubSpot)
 *
 *  Powers the Client Hub list. Returns a normalized client per HubSpot
 *  deal, with its primary contact. If HUBSPOT_API_KEY is missing we
 *  return 503 and the Client Hub falls back to sample data.
 * ------------------------------------------------------------------ */

const HS = 'https://api.hubapi.com';

async function hsReq(method: string, path: string, body: object | null, token: string) {
  const res = await fetch(`${HS}${path}`, {
    method,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.text().catch(() => res.statusText);
    throw new Error(`HubSpot ${path}: ${res.status} — ${err}`);
  }
  return res.json();
}

export async function GET() {
  const token = envValue('HUBSPOT_API_KEY');
  if (!token) {
    return NextResponse.json({ error: 'not_configured' }, { status: 503 });
  }

  try {
    // 1) Recent deals with their associated contacts.
    // `onedrive_folder_id` is an optional custom deal property — set it to pin
    // the exact client folder (otherwise we match by name). See SETUP-LIVE.md.
    const deals = await hsReq(
      'GET',
      '/crm/v3/objects/deals?limit=25&properties=dealname,amount,dealstage,onedrive_folder_id&associations=contacts&sort=-hs_lastmodifieddate',
      null,
      token,
    );

    // 2) Batch-read the associated contacts.
    const contactIds = new Set<string>();
    for (const deal of deals.results ?? []) {
      const c = deal.associations?.contacts?.results?.[0]?.id;
      if (c) contactIds.add(c);
    }

    const contactsById: Record<string, { name: string; email: string; phone: string }> = {};
    if (contactIds.size > 0) {
      const batch = await hsReq(
        'POST',
        '/crm/v3/objects/contacts/batch/read',
        {
          properties: ['firstname', 'lastname', 'email', 'phone'],
          inputs: [...contactIds].map((id) => ({ id })),
        },
        token,
      ).catch(() => ({ results: [] }));

      for (const c of batch.results ?? []) {
        const p = c.properties || {};
        contactsById[c.id] = {
          name: `${p.firstname || ''} ${p.lastname || ''}`.trim() || 'Unknown',
          email: p.email || '',
          phone: p.phone || '',
        };
      }
    }

    const clients = (deals.results ?? []).map((deal: Record<string, unknown>) => {
      const props = (deal.properties || {}) as Record<string, string>;
      const assoc = deal as { associations?: { contacts?: { results?: { id: string }[] } } };
      const contactId = assoc.associations?.contacts?.results?.[0]?.id;
      const contact = contactId ? contactsById[contactId] : undefined;
      return {
        id: deal.id as string,
        name: contact?.name || props.dealname || 'Unnamed',
        company: props.dealname || '',
        stage: props.dealstage || '',
        dealAmount: Number(props.amount) || 0,
        contactName: contact?.name || '',
        contactEmail: contact?.email || '',
        contactPhone: contact?.phone || '',
        folderId: props.onedrive_folder_id || null,
      };
    });

    return NextResponse.json({ clients });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 502 });
  }
}
