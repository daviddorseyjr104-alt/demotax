import { NextRequest, NextResponse } from 'next/server';

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

async function findOrCreateContact(firstName: string, lastName: string, token: string): Promise<string> {
  const search = await hsReq('POST', '/crm/v3/objects/contacts/search', {
    filterGroups: [{ filters: [{ propertyName: 'firstname', operator: 'EQ', value: firstName }] }],
    properties: ['firstname', 'lastname'],
    limit: 1,
  }, token).catch(() => ({ results: [] }));

  if (search.results?.length > 0) return search.results[0].id as string;

  const contact = await hsReq('POST', '/crm/v3/objects/contacts', {
    properties: { firstname: firstName, lastname: lastName, hs_lead_status: 'NEW' },
  }, token);
  return contact.id as string;
}

const fmt = (n: number) => `$${Math.round(n).toLocaleString('en-US')}`;

export async function POST(req: NextRequest) {
  const token = process.env.HUBSPOT_API_KEY;
  if (!token) {
    return NextResponse.json({ error: 'HUBSPOT_API_KEY not configured in .env.local' }, { status: 503 });
  }

  const { prospectName, salePrice, totalExposure, deferrable, structure, status, timeline } = await req.json();

  const parts = ((prospectName as string) || 'Unknown').trim().split(' ');
  const firstName = parts[0];
  const lastName = parts.slice(1).join(' ') || '';

  const contactId = await findOrCreateContact(firstName, lastName, token);

  const deal = await hsReq('POST', '/crm/v3/objects/deals', {
    properties: {
      dealname: `${prospectName} — Tax Deferral Advisory`,
      amount: String(Math.round(deferrable as number)),
      dealstage: 'appointmentscheduled',
      pipeline: 'default',
      closedate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      description: [
        `Structure: ${structure}`,
        `Sale Price: ${fmt(salePrice as number)}`,
        `Total Tax Exposure: ${fmt(totalExposure as number)}`,
        `Est. Deferrable Amount: ${fmt(deferrable as number)}`,
        `Deal Status: ${status}`,
        timeline ? `Expected Close: ${timeline}` : '',
      ].filter(Boolean).join(' | '),
    },
    associations: [{
      to: { id: contactId },
      types: [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: 3 }],
    }],
  }, token);

  await hsReq('POST', '/crm/v3/objects/notes', {
    properties: {
      hs_note_body: [
        'TAX DEFERRAL ADVISORY — DEAL REVIEW',
        `Prospect: ${prospectName}`,
        `Transaction Structure: ${structure}`,
        `Gross Sale Price: ${fmt(salePrice as number)}`,
        `Total Tax Exposure: ${fmt(totalExposure as number)}`,
        `Est. Deferrable Amount: ${fmt(deferrable as number)} (≈75% of exposure)`,
        `Deal Status: ${status}`,
        timeline ? `Expected Close: ${timeline}` : '',
        '',
        'Synced from Tax Strategy Operations Hub',
      ].filter(Boolean).join('\n'),
      hs_timestamp: new Date().toISOString(),
    },
    associations: [{
      to: { id: contactId },
      types: [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: 202 }],
    }],
  }, token);

  return NextResponse.json({ success: true, contactId, dealId: deal.id });
}
