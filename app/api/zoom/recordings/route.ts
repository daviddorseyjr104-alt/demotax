import { NextResponse } from 'next/server';

async function getZoomToken(): Promise<string> {
  const accountId = process.env.ZOOM_ACCOUNT_ID;
  const clientId = process.env.ZOOM_CLIENT_ID;
  const clientSecret = process.env.ZOOM_CLIENT_SECRET;
  if (!accountId || !clientId || !clientSecret) {
    throw new Error('ZOOM_ACCOUNT_ID, ZOOM_CLIENT_ID, and ZOOM_CLIENT_SECRET are required in .env.local');
  }
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const res = await fetch(`https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${accountId}`, {
    method: 'POST',
    headers: { Authorization: `Basic ${credentials}`, 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  if (!res.ok) {
    const err = await res.text().catch(() => res.statusText);
    throw new Error(`Zoom auth failed: ${err}`);
  }
  const data = await res.json();
  return data.access_token as string;
}

export async function GET() {
  if (!process.env.ZOOM_CLIENT_ID) {
    return NextResponse.json({ error: 'ZOOM_CLIENT_ID not configured in .env.local' }, { status: 503 });
  }

  try {
    const token = await getZoomToken();

    const from = new Date();
    from.setDate(from.getDate() - 30);
    const fromStr = from.toISOString().split('T')[0];

    const res = await fetch(`https://api.zoom.us/v2/users/me/recordings?from=${fromStr}&page_size=25&type=cloud`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      const err = await res.text().catch(() => res.statusText);
      throw new Error(`Zoom recordings API: ${res.status} — ${err}`);
    }

    const data = await res.json();

    type ZoomMeeting = {
      uuid: string;
      id: string | number;
      topic: string;
      start_time: string;
      duration: number;
      recording_files?: { file_type: string }[];
    };

    const recordings = ((data.meetings ?? []) as ZoomMeeting[])
      .filter((m) => m.recording_files?.some((f) => f.file_type === 'TRANSCRIPT'))
      .map((m) => ({
        uuid: m.uuid,
        meetingId: String(m.id),
        topic: m.topic || 'Untitled Meeting',
        startTime: m.start_time,
        duration: m.duration,
      }));

    return NextResponse.json({ recordings });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch recordings';
    return NextResponse.json({ error: msg }, { status: 503 });
  }
}
