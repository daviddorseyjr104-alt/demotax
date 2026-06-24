'use client';

import { useState, useMemo, useEffect, useRef } from 'react';

/* ------------------------------------------------------------------ *
 *  CLIENT HUB
 *  One place per client: pick a client (grouped by deal stage) ->
 *  their cloud folder, their documents (Zoom / PDF / Excel / PPT),
 *  their HubSpot deal, their email activity, and an in-app Claude
 *  assistant scoped to that client.
 *
 *  Data below is SAMPLE data so the flow is demo-able today.
 *  Live wiring points are marked with  // LIVE:
 * ------------------------------------------------------------------ */

type DocType = 'zoom' | 'pdf' | 'excel' | 'ppt' | 'doc';

type ClientDoc = {
  name: string;
  type: DocType;
  url: string;       // LIVE: OneDrive/SharePoint file URL
  updated: string;
};

// A single email touch, used to compute the daily counts.
type EmailEvent = { date: string; dir: 'out' | 'in'; to: string };

type Client = {
  id: string;
  name: string;
  company: string;
  stage: string;          // LIVE: HubSpot deal stage
  dealAmount: number;     // LIVE: HubSpot amount
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  folderUrl: string;      // LIVE: OneDrive/SharePoint shared-folder link
  folderId?: string | null; // LIVE: pinned OneDrive folder id (HubSpot property)
  lastContact: string;
  docs: ClientDoc[];
  emails: EmailEvent[];   // LIVE: Microsoft Graph (Outlook) message list
};

type ChatMessage = { role: 'user' | 'assistant'; content: string };

// today / recent days as YYYY-MM-DD (kept relative so the demo always looks "live")
const d = (offset: number) => {
  const t = new Date();
  t.setDate(t.getDate() - offset);
  return t.toISOString().slice(0, 10);
};

const stageBadge: Record<string, string> = {
  'Meeting Scheduled': 'badge-gold',
  'Brief Sent': 'badge-purple',
  'Proposal Sent': 'badge-gold',
  'Active Opportunity': 'badge-green',
  'Closed Won': 'badge-green',
  Nurture: 'badge-gray',
};

// Canonical pipeline order so stage groups read left-to-right like the funnel.
const STAGE_ORDER = [
  'Meeting Scheduled', 'Brief Sent', 'Proposal Sent',
  'Active Opportunity', 'Closed Won', 'Nurture',
];
const stageRank = (stage: string) => {
  const i = STAGE_ORDER.indexOf(stage);
  return i === -1 ? STAGE_ORDER.length : i;
};

const docMeta: Record<DocType, { label: string; color: string }> = {
  zoom: { label: 'Zoom', color: '#2d8cff' },
  pdf: { label: 'PDF', color: '#e2574c' },
  excel: { label: 'XLSX', color: '#1f7244' },
  ppt: { label: 'PPTX', color: '#c43e1c' },
  doc: { label: 'DOC', color: '#2b579a' },
};

const SAMPLE_CLIENTS: Client[] = [
  {
    id: 'c1',
    name: 'Marcus Whitfield',
    company: 'Whitfield Logistics LLC',
    stage: 'Proposal Sent',
    dealAmount: 4200000,
    contactName: 'Marcus Whitfield',
    contactEmail: 'marcus@whitfieldlogistics.com',
    contactPhone: '(312) 555-0184',
    folderUrl: 'https://onedrive.live.com/',
    lastContact: 'Today',
    docs: [
      { name: 'Intro Call — Whitfield.mp4', type: 'zoom', url: '#', updated: 'Today' },
      { name: 'Whitfield — Deal Model.xlsx', type: 'excel', url: '#', updated: 'Today' },
      { name: 'Executive Brief — Whitfield.pdf', type: 'pdf', url: '#', updated: 'Yesterday' },
      { name: 'Strategy Deck — Whitfield.pptx', type: 'ppt', url: '#', updated: '2 days ago' },
    ],
    emails: [
      { date: d(0), dir: 'out', to: 'marcus@whitfieldlogistics.com' },
      { date: d(0), dir: 'out', to: 'marcus@whitfieldlogistics.com' },
      { date: d(0), dir: 'in', to: 'me' },
      { date: d(1), dir: 'out', to: 'marcus@whitfieldlogistics.com' },
      { date: d(1), dir: 'in', to: 'me' },
      { date: d(2), dir: 'out', to: 'marcus@whitfieldlogistics.com' },
      { date: d(3), dir: 'in', to: 'me' },
    ],
  },
  {
    id: 'c2',
    name: 'Elena Vasquez',
    company: 'Vasquez Property Group',
    stage: 'Active Opportunity',
    dealAmount: 7800000,
    contactName: 'Elena Vasquez',
    contactEmail: 'elena@vasquezpg.com',
    contactPhone: '(415) 555-0199',
    folderUrl: 'https://onedrive.live.com/',
    lastContact: 'Yesterday',
    docs: [
      { name: 'Discovery — Vasquez.mp4', type: 'zoom', url: '#', updated: 'Yesterday' },
      { name: 'Vasquez — RE Exit Model.xlsx', type: 'excel', url: '#', updated: 'Yesterday' },
      { name: 'Executive Brief — Vasquez.pdf', type: 'pdf', url: '#', updated: '3 days ago' },
    ],
    emails: [
      { date: d(0), dir: 'out', to: 'elena@vasquezpg.com' },
      { date: d(0), dir: 'in', to: 'me' },
      { date: d(1), dir: 'out', to: 'elena@vasquezpg.com' },
      { date: d(1), dir: 'out', to: 'elena@vasquezpg.com' },
      { date: d(1), dir: 'out', to: 'elena@vasquezpg.com' },
      { date: d(2), dir: 'in', to: 'me' },
      { date: d(4), dir: 'out', to: 'elena@vasquezpg.com' },
    ],
  },
  {
    id: 'c3',
    name: 'David Chen',
    company: 'Chen Capital Partners',
    stage: 'Meeting Scheduled',
    dealAmount: 0,
    contactName: 'David Chen',
    contactEmail: 'dchen@chencapital.com',
    contactPhone: '(212) 555-0143',
    folderUrl: 'https://onedrive.live.com/',
    lastContact: '2 days ago',
    docs: [
      { name: 'Chen — Intake Notes.docx', type: 'doc', url: '#', updated: '2 days ago' },
    ],
    emails: [
      { date: d(0), dir: 'out', to: 'dchen@chencapital.com' },
      { date: d(2), dir: 'in', to: 'me' },
      { date: d(2), dir: 'out', to: 'dchen@chencapital.com' },
    ],
  },
];

const fmt = (n: number) =>
  n > 0 ? `$${(n / 1_000_000).toFixed(1)}M` : '—';

function countOn(emails: EmailEvent[], date: string, dir: 'out' | 'in') {
  return emails.filter((e) => e.date === date && e.dir === dir).length;
}

function SampleTag({ small }: { small?: boolean }) {
  return (
    <span style={{
      fontSize: small ? '0.52rem' : '0.6rem', fontWeight: 800, letterSpacing: '0.08em',
      textTransform: 'uppercase', color: '#9a3412', background: '#ffedd5',
      border: '1px solid #fdba74', borderRadius: '4px', padding: small ? '0.05rem 0.3rem' : '0.15rem 0.4rem',
      whiteSpace: 'nowrap',
    }}>Sample</span>
  );
}

function LiveTag({ small }: { small?: boolean }) {
  return (
    <span style={{
      fontSize: small ? '0.52rem' : '0.55rem', fontWeight: 800, letterSpacing: '0.06em',
      textTransform: 'uppercase', color: '#166534', background: '#dcfce7',
      border: '1px solid #86efac', borderRadius: '4px', padding: small ? '0.05rem 0.3rem' : '0.1rem 0.35rem',
      whiteSpace: 'nowrap',
    }}>Live</span>
  );
}

function StatCard({ value, label, accent }: { value: number; label: string; accent?: string }) {
  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: '8px', padding: '0.85rem 1rem', flex: 1, minWidth: 0,
    }}>
      <div style={{ fontSize: '1.6rem', fontWeight: 800, color: accent || 'var(--text-primary)', lineHeight: 1.1 }}>{value}</div>
      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: '0.2rem' }}>{label}</div>
    </div>
  );
}

type DaySeries = { date: string; out: number; in: number };
type LiveEmail = { sentToday: number; receivedToday: number; sentToContact: number; series: DaySeries[] };

const QUICK_PROMPTS = [
  'Draft a follow-up email to this client.',
  'Summarize where this client stands.',
  'What should my next step be?',
];

export default function ClientHubPage() {
  const [allClients, setAllClients] = useState<Client[]>(SAMPLE_CLIENTS);
  const [selectedId, setSelectedId] = useState<string>(SAMPLE_CLIENTS[0].id);
  const [query, setQuery] = useState('');
  const [source, setSource] = useState<'sample' | 'live'>('sample');
  const [liveEmail, setLiveEmail] = useState<(LiveEmail & { contactEmail: string }) | null>(null);
  const [emailConnected, setEmailConnected] = useState<boolean | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [liveFiles, setLiveFiles] = useState<{ clientId: string; folderUrl: string | null; docs: ClientDoc[] } | null>(null);

  // Pull live deals from HubSpot; keep sample data if not configured.
  useEffect(() => {
    fetch('/api/clients')
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => {
        if (data.clients?.length) {
          const mapped: Client[] = data.clients.map((c: Partial<Client>) => ({
            id: c.id!, name: c.name || 'Unnamed', company: c.company || '',
            stage: c.stage || '', dealAmount: c.dealAmount || 0,
            contactName: c.contactName || c.name || '', contactEmail: c.contactEmail || '',
            contactPhone: c.contactPhone || '', folderUrl: c.folderUrl || 'https://onedrive.live.com/',
            folderId: c.folderId ?? null, lastContact: '', docs: [], emails: [],
          }));
          setAllClients(mapped);
          setSelectedId(mapped[0].id);
          setSource('live');
        }
      })
      .catch(() => {/* keep sample */});
  }, []);

  const clients = useMemo(
    () => allClients.filter((c) =>
      `${c.name} ${c.company}`.toLowerCase().includes(query.toLowerCase())),
    [allClients, query],
  );

  // Group the (filtered) clients by deal stage, ordered like the funnel.
  const stageGroups = useMemo(() => {
    const map = new Map<string, Client[]>();
    for (const c of clients) {
      const key = c.stage || 'Unstaged';
      (map.get(key) ?? map.set(key, []).get(key)!).push(c);
    }
    return [...map.entries()].sort((a, b) => {
      const ua = a[0] === 'Unstaged', ub = b[0] === 'Unstaged';
      if (ua !== ub) return ua ? 1 : -1;       // Unstaged always last
      const ra = stageRank(a[0]), rb = stageRank(b[0]);
      return ra !== rb ? ra - rb : a[0].localeCompare(b[0]);
    });
  }, [clients]);

  const baseClient = allClients.find((c) => c.id === selectedId) ?? allClients[0];

  const lookupName = baseClient?.company || baseClient?.name;
  const contactEmail = baseClient?.contactEmail;
  const folderId = baseClient?.folderId;

  // Pull live folder + documents for the selected client from OneDrive (Graph).
  useEffect(() => {
    if (!baseClient?.id || (!lookupName && !folderId)) return;
    let active = true;
    const params = folderId
      ? `folderId=${encodeURIComponent(folderId)}`
      : `client=${encodeURIComponent(lookupName!)}`;
    fetch(`/api/client-files?${params}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (active && data && data.matched) {
          setLiveFiles({ clientId: baseClient.id, folderUrl: data.folderUrl, docs: data.docs });
        }
      })
      .catch(() => {});
    return () => { active = false; };
  }, [baseClient?.id, lookupName, folderId]);

  // Overlay live files onto the selected client (only if they belong to it).
  const filesForClient = liveFiles?.clientId === baseClient?.id ? liveFiles : null;
  const client: Client = filesForClient
    ? { ...baseClient, docs: filesForClient.docs, folderUrl: filesForClient.folderUrl || baseClient.folderUrl }
    : baseClient;
  const folderIsLive = !!filesForClient;

  // Pull live email counts for the selected client from Outlook (Graph).
  useEffect(() => {
    if (!contactEmail) return;
    let active = true;
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    fetch(`/api/email-activity?contact=${encodeURIComponent(contactEmail)}&tz=${encodeURIComponent(tz)}`)
      .then(async (r) => {
        if (!active) return;
        if (r.status === 503) { setEmailConnected(false); setEmailError(null); return; }
        const data = await r.json().catch(() => null);
        if (!r.ok || !data || data.error) {
          // Connected but the request failed — surface it, don't pass off sample as real.
          setEmailConnected(true);
          setEmailError(data?.message || data?.error || `Couldn’t load live email (${r.status}).`);
          return;
        }
        setEmailConnected(true);
        setEmailError(null);
        setLiveEmail({ ...data, contactEmail });
      })
      .catch(() => { if (active) { setEmailConnected(true); setEmailError('Network error loading email activity.'); } });
    return () => { active = false; };
  }, [contactEmail]);

  const today = d(0);
  const sampleSent = countOn(client.emails, today, 'out');
  const sampleRecv = countOn(client.emails, today, 'in');
  const sampleToContact = client.emails.filter(
    (e) => e.date === today && e.dir === 'out' && e.to === client.contactEmail,
  ).length;

  // Prefer live counts when Outlook is connected and they match this contact.
  const emailForClient = liveEmail?.contactEmail === client.contactEmail ? liveEmail : null;
  const sentToday = emailForClient?.sentToday ?? sampleSent;
  const recvToday = emailForClient?.receivedToday ?? sampleRecv;
  const sentToContactToday = emailForClient?.sentToContact ?? sampleToContact;

  // 7-day history — real series from Outlook when connected, else sample.
  const week = emailForClient?.series?.length
    ? emailForClient.series
    : Array.from({ length: 7 }, (_, i) => {
        const date = d(6 - i);
        return { date, out: countOn(client.emails, date, 'out'), in: countOn(client.emails, date, 'in') };
      });
  const weekMax = Math.max(1, ...week.map((w) => Math.max(w.out, w.in)));

  /* -------------------- Client assistant (Claude) -------------------- */
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Reset the conversation whenever the selected client changes. Adjusting state
  // during render (not in an effect) is React's recommended pattern for this and
  // avoids an extra render pass. https://react.dev/learn/you-might-not-need-an-effect
  const [chatClientId, setChatClientId] = useState(baseClient?.id);
  if (baseClient?.id !== chatClientId) {
    setChatClientId(baseClient?.id);
    setChat([]);
    setChatInput('');
    setChatError(null);
  }

  useEffect(() => {
    chatScrollRef.current?.scrollTo({ top: chatScrollRef.current.scrollHeight });
  }, [chat, chatLoading]);

  async function sendChat(text: string) {
    const content = text.trim();
    if (!content || chatLoading) return;
    const nextChat: ChatMessage[] = [...chat, { role: 'user', content }];
    setChat(nextChat);
    setChatInput('');
    setChatError(null);
    setChatLoading(true);
    try {
      const res = await fetch('/api/client-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client: {
            name: client.name, company: client.company, stage: client.stage,
            dealAmount: client.dealAmount, contactName: client.contactName,
            contactEmail: client.contactEmail, contactPhone: client.contactPhone,
            lastContact: client.lastContact,
            docs: client.docs.map((doc) => ({ name: doc.name, type: doc.type, updated: doc.updated })),
            email: emailForClient
              ? { sentToday, receivedToday: recvToday, sentToContact: sentToContactToday }
              : null,
          },
          messages: nextChat,
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.reply) {
        setChatError(data?.error || `Assistant unavailable (${res.status}).`);
        return;
      }
      setChat([...nextChat, { role: 'assistant', content: data.reply }]);
    } catch {
      setChatError('Network error reaching the assistant.');
    } finally {
      setChatLoading(false);
    }
  }

  return (
    <div style={{ padding: '1.75rem 2rem', maxWidth: '1280px' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Client Hub</h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
          Clients grouped by deal stage. Click one to open their folder, documents, deal, email activity, and AI assistant — all in one place.
        </p>
      </div>

      {/* Setup banner */}
      <div style={{
        background: 'var(--gold-bg)', border: '1px solid var(--gold-border)',
        borderRadius: '8px', padding: '0.7rem 0.95rem', marginBottom: '1.5rem',
        fontSize: '0.75rem', color: 'var(--text-secondary)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap',
      }}>
        <span>
          {source === 'live'
            ? <><strong style={{ color: 'var(--gold)' }}>Live deals from HubSpot.</strong> </>
            : <><strong style={{ color: 'var(--gold)' }}>Demo data.</strong> </>}
          {emailConnected
            ? 'Outlook connected — email counts are live.'
            : 'Connect Outlook for live email counts and OneDrive so “Open Folder” opens the real shared folder.'}
        </span>
        {emailConnected === false && (
          <a href="/api/auth/microsoft" className="btn-gold"
            style={{ padding: '0.4rem 0.8rem', fontSize: '0.72rem', fontWeight: 700, borderRadius: '6px', textDecoration: 'none', whiteSpace: 'nowrap' }}>
            Connect Microsoft 365
          </a>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* ---- Client list (grouped by stage) ---- */}
        <div>
          <input
            className="input-field"
            placeholder="Search clients…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ width: '100%', marginBottom: '0.85rem', padding: '0.55rem 0.75rem', fontSize: '0.8rem' }}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            {stageGroups.map(([stage, group]) => (
              <div key={stage}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.45rem',
                  paddingLeft: '0.1rem',
                }}>
                  <span className={`badge ${stageBadge[stage] || 'badge-gray'}`} style={{ fontSize: '0.58rem' }}>{stage}</span>
                  <span style={{ fontSize: '0.62rem', fontWeight: 700, color: 'var(--text-muted)' }}>{group.length}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {group.map((c) => {
                    const active = c.id === selectedId;
                    return (
                      <button
                        key={c.id}
                        onClick={() => setSelectedId(c.id)}
                        style={{
                          textAlign: 'left', cursor: 'pointer',
                          background: active ? 'var(--bg-card)' : 'transparent',
                          border: `1px solid ${active ? 'var(--gold-border)' : 'var(--border)'}`,
                          borderLeft: `3px solid ${active ? 'var(--gold)' : 'transparent'}`,
                          borderRadius: '8px', padding: '0.6rem 0.8rem',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>{c.name}</span>
                          {source === 'sample' && <SampleTag small />}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.15rem' }}>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.company}</span>
                          {c.dealAmount > 0 && (
                            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--gold)', flexShrink: 0, marginLeft: '0.4rem' }}>{fmt(c.dealAmount)}</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
            {clients.length === 0 && (
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', padding: '1rem 0' }}>No clients match.</div>
            )}
          </div>
        </div>

        {/* ---- Client detail ---- */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Top bar: name + open folder */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: '10px', padding: '1.1rem 1.25rem',
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>{client.name}</h2>
                {source === 'sample' && <SampleTag />}
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{client.company}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.35rem' }}>
              <a
                href={client.folderUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-gold"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', padding: '0.55rem 0.95rem', fontSize: '0.78rem', fontWeight: 700, borderRadius: '7px', textDecoration: 'none', whiteSpace: 'nowrap' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                Open Folder
              </a>
              {folderIsLive
                ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.62rem', color: 'var(--text-muted)' }}><LiveTag small /> OneDrive folder</span>
                : <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>{emailConnected ? 'No matching OneDrive folder' : 'Connect Microsoft 365'}</span>}
            </div>
          </div>

          {/* ---- Claude assistant ---- */}
          <section style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '1.1rem 1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a7 7 0 0 0-7 7c0 2.4 1.2 4.5 3 5.7V17a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-2.3c1.8-1.2 3-3.3 3-5.7a7 7 0 0 0-7-7z"/><line x1="9" y1="21" x2="15" y2="21"/></svg>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Ask Claude about {client.contactName.split(' ')[0] || 'this client'}
              </span>
            </div>

            {/* Conversation */}
            {chat.length > 0 && (
              <div ref={chatScrollRef} style={{
                maxHeight: '320px', overflowY: 'auto', display: 'flex', flexDirection: 'column',
                gap: '0.6rem', marginBottom: '0.85rem', paddingRight: '0.25rem',
              }}>
                {chat.map((m, i) => (
                  <div key={i} style={{
                    alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '88%',
                    background: m.role === 'user' ? 'var(--gold-bg)' : 'var(--border-subtle)',
                    border: `1px solid ${m.role === 'user' ? 'var(--gold-border)' : 'var(--border)'}`,
                    borderRadius: '10px', padding: '0.55rem 0.75rem',
                    fontSize: '0.8rem', color: 'var(--text-primary)', lineHeight: 1.5,
                    whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                  }}>{m.content}</div>
                ))}
                {chatLoading && (
                  <div style={{ alignSelf: 'flex-start', fontSize: '0.78rem', color: 'var(--text-muted)', padding: '0.3rem 0.2rem' }}>
                    Claude is thinking…
                  </div>
                )}
              </div>
            )}

            {/* Quick prompts (shown before a conversation starts) */}
            {chat.length === 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.85rem' }}>
                {QUICK_PROMPTS.map((p) => (
                  <button key={p} onClick={() => sendChat(p)} disabled={chatLoading}
                    className="btn-outline"
                    style={{ fontSize: '0.72rem', padding: '0.35rem 0.7rem', borderRadius: '999px', cursor: 'pointer' }}>
                    {p}
                  </button>
                ))}
              </div>
            )}

            {chatError && (
              <div style={{
                fontSize: '0.72rem', color: '#9a3412', background: '#fff7ed',
                border: '1px solid #fdba74', borderRadius: '6px',
                padding: '0.5rem 0.7rem', marginBottom: '0.7rem',
              }}>{chatError}</div>
            )}

            {/* Input */}
            <form
              onSubmit={(e) => { e.preventDefault(); sendChat(chatInput); }}
              style={{ display: 'flex', gap: '0.5rem' }}
            >
              <input
                className="input-field"
                placeholder={`Draft an email, summarize, ask what's next…`}
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                disabled={chatLoading}
                style={{ flex: 1, padding: '0.55rem 0.75rem', fontSize: '0.8rem' }}
              />
              <button type="submit" className="btn-gold" disabled={chatLoading || !chatInput.trim()}
                style={{ padding: '0.55rem 1rem', fontSize: '0.78rem', fontWeight: 700, borderRadius: '7px', cursor: 'pointer' }}>
                Send
              </button>
            </form>
            <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              Claude sees this client’s deal, documents, and email activity. Not tax, legal, or financial advice.
            </div>
          </section>

          {/* Email activity */}
          <section style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '1.1rem 1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Email Activity — {client.contactName}
              </span>
              {emailForClient ? <LiveTag /> : <SampleTag small />}
            </div>
            {emailError && (
              <div style={{
                fontSize: '0.72rem', color: '#9a3412', background: '#fff7ed',
                border: '1px solid #fdba74', borderRadius: '6px',
                padding: '0.5rem 0.7rem', marginBottom: '0.85rem',
              }}>
                {emailError} Showing sample figures below — not live.
              </div>
            )}
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.1rem' }}>
              <StatCard value={sentToday} label="Sent today" accent="var(--gold)" />
              <StatCard value={recvToday} label="Received today" />
              <StatCard value={sentToContactToday} label={`Sent to ${client.contactName.split(' ')[0]} today`} accent="var(--gold)" />
            </div>

            {/* 7-day out/in bars */}
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end', height: '70px' }}>
              {week.map((w) => (
                <div key={w.date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem' }}>
                  <div style={{ display: 'flex', gap: '2px', alignItems: 'flex-end', height: '48px' }}>
                    <div title={`${w.out} sent`} style={{ width: '8px', height: `${(w.out / weekMax) * 48}px`, background: 'var(--gold)', borderRadius: '2px 2px 0 0' }} />
                    <div title={`${w.in} received`} style={{ width: '8px', height: `${(w.in / weekMax) * 48}px`, background: 'var(--text-muted)', borderRadius: '2px 2px 0 0', opacity: 0.5 }} />
                  </div>
                  <div style={{ fontSize: '0.58rem', color: 'var(--text-muted)' }}>{w.date.slice(5)}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.7rem', fontSize: '0.65rem', color: 'var(--text-muted)' }}>
              <span><span style={{ display: 'inline-block', width: 8, height: 8, background: 'var(--gold)', borderRadius: 2, marginRight: 4 }} />Sent (outbound)</span>
              <span><span style={{ display: 'inline-block', width: 8, height: 8, background: 'var(--text-muted)', opacity: 0.5, borderRadius: 2, marginRight: 4 }} />Received (inbound)</span>
            </div>
          </section>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            {/* Documents */}
            <section style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '1.1rem 1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.85rem' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Documents ({client.docs.length})
                </span>
                {folderIsLive && <LiveTag small />}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {client.docs.map((doc) => (
                  <a key={doc.name} href={doc.url} target="_blank" rel="noopener noreferrer"
                    className="card-hover"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', padding: '0.55rem 0.65rem', border: '1px solid var(--border-subtle)', borderRadius: '7px', textDecoration: 'none' }}>
                    <span style={{ fontSize: '0.55rem', fontWeight: 800, color: '#fff', background: docMeta[doc.type].color, borderRadius: '4px', padding: '0.2rem 0.35rem', minWidth: '34px', textAlign: 'center' }}>
                      {docMeta[doc.type].label}
                    </span>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ display: 'block', fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.name}</span>
                      <span style={{ fontSize: '0.63rem', color: 'var(--text-muted)' }}>{doc.updated}</span>
                    </span>
                  </a>
                ))}
                {client.docs.length === 0 && (
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', padding: '0.5rem 0' }}>
                    No documents yet. Connect this client’s OneDrive/SharePoint folder to list files here.
                  </div>
                )}
              </div>
            </section>

            {/* HubSpot deal */}
            <section style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '1.1rem 1.25rem' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.85rem' }}>
                HubSpot
              </div>
              <dl style={{ margin: 0, display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
                <div>
                  <dt style={{ fontSize: '0.63rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Deal Stage</dt>
                  <dd style={{ margin: '0.2rem 0 0' }}><span className={`badge ${stageBadge[client.stage] || 'badge-gray'}`}>{client.stage || 'Unstaged'}</span></dd>
                </div>
                <div>
                  <dt style={{ fontSize: '0.63rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Deal Amount</dt>
                  <dd style={{ margin: '0.2rem 0 0', fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>{fmt(client.dealAmount)}</dd>
                </div>
                <div>
                  <dt style={{ fontSize: '0.63rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Contact</dt>
                  <dd style={{ margin: '0.2rem 0 0', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    {client.contactEmail}<br />{client.contactPhone}
                  </dd>
                </div>
              </dl>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
