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

export async function POST(req: NextRequest) {
  const token = process.env.HUBSPOT_API_KEY;
  if (!token) {
    return NextResponse.json({ error: 'HUBSPOT_API_KEY not configured in .env.local' }, { status: 503 });
  }

  const { contactName, cleanSummary, actionItems, crmTask } = await req.json();

  const parts = ((contactName as string) || 'Prospect').trim().split(' ');
  const firstName = parts[0];
  const lastName = parts.slice(1).join(' ') || '';

  const contactId = await findOrCreateContact(firstName, lastName, token);

  await hsReq('POST', '/crm/v3/objects/notes', {
    properties: {
      hs_note_body: [
        'MEETING NOTES — AUTO-GENERATED',
        `Contact: ${contactName}`,
        `Date: ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`,
        '',
        'SUMMARY',
        cleanSummary,
        '',
        'ACTION ITEMS',
        ...((actionItems as string[]) || []).map((a: string, i: number) => `${i + 1}. ${a}`),
        '',
        'CRM TASK',
        crmTask,
        '',
        'Synced from Tax Strategy Operations Hub',
      ].join('\n'),
      hs_timestamp: new Date().toISOString(),
    },
    associations: [{
      to: { id: contactId },
      types: [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: 202 }],
    }],
  }, token);

  if (Array.isArray(actionItems) && actionItems[0]) {
    await hsReq('POST', '/crm/v3/objects/tasks', {
      properties: {
        hs_task_body: actionItems[0],
        hs_task_subject: `Follow-up: ${contactName}`,
        hs_task_status: 'NOT_STARTED',
        hs_task_type: 'TODO',
        hs_timestamp: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
      associations: [{
        to: { id: contactId },
        types: [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: 204 }],
      }],
    }, token).catch(() => null);
  }

  return NextResponse.json({ success: true, contactId });
}
