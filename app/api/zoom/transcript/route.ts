import { NextRequest, NextResponse } from 'next/server';

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
  if (!res.ok) throw new Error('Zoom auth failed');
  const data = await res.json();
  return data.access_token as string;
}

export async function POST(req: NextRequest) {
  const { meetingId } = await req.json() as { meetingId: string };

  try {
    const token = await getZoomToken();

    const res = await fetch(`https://api.zoom.us/v2/meetings/${meetingId}/recordings`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      const err = await res.text().catch(() => res.statusText);
      throw new Error(`Zoom recording details: ${res.status} — ${err}`);
    }

    const data = await res.json();

    type RecordingFile = { file_type: string; download_url: string };
    const transcriptFile = (data.recording_files as RecordingFile[] | undefined)
      ?.find((f) => f.file_type === 'TRANSCRIPT');

    if (!transcriptFile) {
      return NextResponse.json({ error: 'No transcript found for this recording. Cloud transcription must be enabled in Zoom settings.' }, { status: 404 });
    }

    // Download VTT — Zoom requires the access_token as a query param for file downloads
    const vttRes = await fetch(`${transcriptFile.download_url}?access_token=${token}`);
    if (!vttRes.ok) throw new Error('Failed to download transcript file');
    const vtt = await vttRes.text();

    return NextResponse.json({ vtt, topic: data.topic as string });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch transcript';
    return NextResponse.json({ error: msg }, { status: 503 });
  }
}
