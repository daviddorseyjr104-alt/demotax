import { NextRequest, NextResponse } from 'next/server';
import { getMsToken, listMessagesSince, dayKey, last7Days } from '@/lib/msGraph';

/* ------------------------------------------------------------------ *
 *  EMAIL ACTIVITY  (Outlook / Microsoft 365 via Microsoft Graph)
 *
 *  Returns, for the Client Hub:
 *    - sentToday / receivedToday : today's outbound / inbound
 *    - sentToContact             : today's outbound to ?contact=<email>
 *    - series                    : real 7-day [{date,out,in}] history
 *
 *  We LIST the last 7 days of mail once per folder and bucket by day —
 *  reliable across tenants, and the chart is live (no sample fallback).
 * ------------------------------------------------------------------ */

export async function GET(req: NextRequest) {
  const token = await getMsToken();
  if (!token) {
    return NextResponse.json(
      { error: 'not_connected', message: 'Connect Reg’s Microsoft 365 account to enable live email counts.' },
      { status: 503 },
    );
  }

  const contact = req.nextUrl.searchParams.get('contact')?.trim().toLowerCase();
  // Reg's timezone, sent by the browser, so "today" means his today (not UTC).
  const tz = req.nextUrl.searchParams.get('tz') || 'UTC';

  // The 7 calendar days (oldest -> today) in Reg's tz.
  const days = last7Days(tz);
  const today = days[days.length - 1];

  // Over-fetch a day on the UTC side so tz-boundary messages aren't dropped.
  const sinceIso = new Date(new Date(`${days[0]}T12:00:00Z`).getTime() - 86_400_000).toISOString();

  try {
    const [sent, received] = await Promise.all([
      listMessagesSince('SentItems', sinceIso, token, 'sentDateTime,toRecipients'),
      listMessagesSince('Inbox', sinceIso, token, 'receivedDateTime'),
    ]);

    const series = days.map((date) => ({
      date,
      out: sent.filter((m) => dayKey(m.sentDateTime, tz) === date).length,
      in: received.filter((m) => dayKey(m.receivedDateTime, tz) === date).length,
    }));

    const sentToday = series[series.length - 1].out;
    const receivedToday = series[series.length - 1].in;

    let sentToContact = 0;
    if (contact) {
      sentToContact = sent.filter(
        (m) =>
          dayKey(m.sentDateTime, tz) === today &&
          (m.toRecipients ?? []).some(
            (r) => r.emailAddress?.address?.toLowerCase() === contact,
          ),
      ).length;
    }

    return NextResponse.json({ sentToday, receivedToday, sentToContact, series, contact: contact ?? null });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 502 });
  }
}
