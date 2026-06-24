import { NextRequest, NextResponse } from 'next/server';
import { getMsToken, graphGet } from '@/lib/msGraph';

/* ------------------------------------------------------------------ *
 *  CLIENT FILES  (OneDrive / SharePoint via Microsoft Graph)
 *
 *  Given ?client=<name>, finds the matching folder in Reg's OneDrive and
 *  returns its documents + a link to open the folder. Same sign-in as
 *  email activity — no extra setup.
 * ------------------------------------------------------------------ */

type DriveItem = {
  id: string;
  name: string;
  webUrl: string;
  lastModifiedDateTime?: string;
  folder?: { childCount: number };
  file?: { mimeType: string };
};

function docType(name: string): 'zoom' | 'pdf' | 'excel' | 'ppt' | 'doc' {
  const ext = name.toLowerCase().split('.').pop() || '';
  if (['mp4', 'm4a', 'vtt', 'mov'].includes(ext)) return 'zoom';
  if (ext === 'pdf') return 'pdf';
  if (['xlsx', 'xls', 'csv'].includes(ext)) return 'excel';
  if (['pptx', 'ppt'].includes(ext)) return 'ppt';
  return 'doc';
}

function relativeTime(iso?: string): string {
  if (!iso) return '';
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days <= 0) return 'Today';
  if (days === 1) return 'Yesterday';
  return `${days} days ago`;
}

export async function GET(req: NextRequest) {
  const token = await getMsToken();
  if (!token) {
    return NextResponse.json({ error: 'not_connected' }, { status: 503 });
  }

  // Prefer a pinned folder ID (robust); fall back to matching by client name.
  const folderId = req.nextUrl.searchParams.get('folderId')?.trim();
  const client = req.nextUrl.searchParams.get('client')?.trim();
  if (!folderId && !client) {
    return NextResponse.json({ error: 'missing_client' }, { status: 400 });
  }

  try {
    let folder: DriveItem | undefined;

    if (folderId) {
      // Exact folder — no ambiguity.
      folder = await graphGet<DriveItem>(
        `/me/drive/items/${folderId}?$select=id,name,webUrl,folder`,
        token,
      ).catch(() => undefined);
    }

    if (!folder && client) {
      // Name search fallback. Prefer an exact (case-insensitive) name match
      // before falling back to the first folder, to avoid grabbing the wrong one.
      const search = await graphGet<{ value: DriveItem[] }>(
        `/me/drive/root/search(q='${encodeURIComponent(client)}')?$top=25`,
        token,
      );
      const folders = (search.value || []).filter((i) => i.folder);
      folder =
        folders.find((f) => f.name.toLowerCase() === client.toLowerCase()) || folders[0];
    }

    if (!folder) {
      return NextResponse.json({ folderUrl: null, docs: [], matched: false });
    }

    // List the folder's files.
    const children = await graphGet<{ value: DriveItem[] }>(
      `/me/drive/items/${folder.id}/children?$top=50&$select=id,name,webUrl,lastModifiedDateTime,file,folder`,
      token,
    );

    const docs = (children.value || [])
      .filter((i) => i.file)
      .map((i) => ({
        name: i.name,
        type: docType(i.name),
        url: i.webUrl,
        updated: relativeTime(i.lastModifiedDateTime),
      }));

    return NextResponse.json({ folderId: folder.id, folderUrl: folder.webUrl, docs, matched: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 502 });
  }
}
