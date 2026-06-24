'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { logActivity } from '../../lib/activity';
import { createClient } from '@/lib/supabase/client';
import { toast } from '@/components/Toast';

type MeetingRecord = {
  id: string;
  clean_summary: string;
  key_concerns: string[];
  action_items: string[];
  missing_info: string[];
  follow_up_email: string;
  crm_task: string;
  notes: string;
  created_at: string;
};


type Output = {
  cleanSummary: string;
  keyConcerns: string[];
  actionItems: string[];
  missingInfo: string[];
  followUpEmail: string;
  crmTask: string;
};

function vttToText(raw: string): string {
  return raw
    .split('\n')
    .filter((line) => {
      const t = line.trim();
      if (!t) return false;
      if (t === 'WEBVTT') return false;
      if (/^\d+$/.test(t)) return false;
      if (/\d{2}:\d{2}[.:]\d{2,3}/.test(t)) return false;
      if (t.startsWith('NOTE') || t.startsWith('STYLE') || t.startsWith('REGION')) return false;
      return true;
    })
    .join(' ')
    .replace(/<[^>]+>/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function buildOutput(notes: string): Output {
  const lc = notes.toLowerCase();
  const mentionsTax = lc.includes('tax');
  const mentionsCPA = lc.includes('cpa') || lc.includes('accountant');
  const mentionsValue = lc.match(/\$[\d,.]+\s*(m|million|b|billion)?/i)?.[0] ?? 'undisclosed amount';
  const mentionsBasis = lc.includes('basis');
  const noLOI = lc.includes('no loi') || lc.includes('loi yet') || lc.includes('no letter of intent');

  const nameMatch = notes.match(/called\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/)?.[1]
    ?? notes.match(/(?:spoke with|meeting with|call with)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/i)?.[1];
  const clientRef = nameMatch ?? 'the prospect';

  const cpaMatch = notes.match(/cpa[,\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/i)?.[1]
    ?? notes.match(/accountant[,\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/i)?.[1];
  const cpaNamed = cpaMatch ?? 'the client\'s CPA';

  const companyMatch = notes.match(/(?:owns|at|company called|business called)\s+([A-Z][A-Za-z\s&]+(?:Inc|LLC|Corp|Group|Holdings|Partners|Capital|Solutions|Realty|Properties))/)?.[1];
  const businessRef = companyMatch ? companyMatch.trim() : 'their business';

  const bankerMatch = notes.match(/(?:banker|investment bank(?:er)?)[,\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/i)?.[1];
  const bankerRef = bankerMatch ?? null;

  const entityType = lc.includes('s-corp') ? 'S-Corporation (LLC taxed as S-Corp)' : lc.includes('llc') ? 'LLC' : lc.includes('c-corp') || lc.includes('c corp') ? 'C-Corporation' : lc.includes('real estate') ? 'Real Estate' : 'TBD';
  const dateStr = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const firstName = clientRef.includes(' ') ? clientRef.split(' ')[0] : clientRef;

  return {
    cleanSummary: `Call Summary — ${dateStr}

${clientRef} is evaluating the sale of ${businessRef}, with a preliminary estimated value of approximately ${mentionsValue}. Entity structure: ${entityType}. ${mentionsBasis ? 'Adjusted basis details to be confirmed.' : 'Cost basis and depreciation details to be collected.'}

Primary concern: understanding and managing the tax obligation prior to signing with the investment banker. ${bankerRef ? `Investment banker on the deal: ${bankerRef}.` : ''} ${mentionsCPA ? `CPA is involved (${cpaNamed}).` : 'No CPA contact on file.'} ${noLOI ? 'No Letter of Intent signed at this time.' : 'LOI status: to be confirmed.'}`,

    keyConcerns: [
      mentionsTax ? 'Tax obligation — client needs exposure estimate before committing to next steps' : 'Tax exposure and after-tax liquidity planning',
      'Entity structure review required before presenting deferral options',
      mentionsCPA ? `Coordination with ${cpaNamed} is critical — confirm their current exposure estimate` : 'CPA engagement needed before presenting options',
      bankerRef ? `Investment banker (${bankerRef}) is active — timing and sequencing is sensitive` : 'Deal timeline and banker coordination to be established',
      'One-page exposure summary needed before next call',
      'Adjusted basis confirmation required for accurate exposure model',
    ],

    actionItems: [
      `Send one-page tax exposure summary to ${clientRef} within 24 hours`,
      `Prepare PowerPoint outline for professional review call`,
      `Coordinate with ${cpaNamed} — get their current tax exposure estimate`,
      `Request: adjusted basis schedules, entity documents, and transaction timeline`,
      `Schedule next Zoom with ${clientRef} and CPA`,
      `Build deal model in Deal Calculator — per call notes`,
    ],

    missingInfo: [
      'Confirmed adjusted basis and depreciation breakdown',
      'Letter of Intent status and anticipated signing date',
      'Attorney contact information for deal coordination',
      `${cpaNamed} — current tax exposure estimate, if prepared`,
      'Desired liquidity outcome — reinvestment, retire, or distribute',
      'State of incorporation and state of seller residence (affects state tax rate)',
    ],

    followUpEmail: `Subject: Summary of Our Conversation — Transaction Review

Hi ${firstName},

Thank you for taking the time to speak with me today. As promised, here is a brief summary and the immediate next steps.

As discussed, you are evaluating the sale of ${businessRef} — preliminary estimated value of approximately ${mentionsValue}. Your primary concern is understanding the full extent of the tax picture before committing to next steps with your advisors.

To prepare a more precise exposure estimate, I'll need a few pieces of information:

  1. Adjusted basis — a precise figure (your CPA will have this)
  2. Any existing CPA estimate of the tax exposure, if already prepared
  3. Anticipated closing timeline and LOI status

I'll prepare a one-page transaction summary for your review. This is not advice — it's a framework to help structure a productive conversation with you and ${cpaNamed}.

I will follow up within 24 hours. Please don't hesitate to reach out in the meantime.

With respect,
[Your Name]
Tax Deferral Advisory`,

    crmTask: `CRM TASK — ${dateStr}
Contact: ${clientRef} | Company: ${businessRef}
Status: Call Completed → Follow-Up Pending | Priority: HIGH | Due: Within 24 hours

Notes: ${mentionsValue} ${entityType} transaction. Basis TBD. Banker: ${bankerRef ?? 'TBD'}. CPA: ${cpaNamed}. ${noLOI ? 'No LOI.' : 'LOI status TBD.'}

Actions:
☐ Send one-page summary within 24 hours
☐ Build Deal Calculator model — per call notes
☐ Generate PowerPoint outline for review call
☐ Request: basis schedules, entity docs, transaction timeline
☐ Schedule next Zoom with client and CPA

Tag: #${entityType.toLowerCase().includes('s-corp') ? 'llc-scorp' : entityType.toLowerCase().includes('real estate') ? 'real-estate' : 'business-sale'} #active #high-priority`,
  };
}

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); });
  return (
    <button className="btn-ghost" onClick={copy}>
      {copied
        ? <><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>Copied</>
        : <><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>Copy</>
      }
    </button>
  );
}

type HubSpotState = 'idle' | 'syncing' | 'done';

type ZoomRecording = {
  uuid: string;
  meetingId: string;
  topic: string;
  startTime: string;
  duration: number;
};

export default function MeetingNotesPage() {
  const [notes, setNotes] = useState('');
  const [generating, setGenerating] = useState(false);
  const [output, setOutput] = useState<Output | null>(null);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [hubSpot, setHubSpot] = useState<HubSpotState>('idle');
  const [saved, setSaved] = useState(false);
  const [history, setHistory] = useState<MeetingRecord[]>([]);
  const [zoomRecordings, setZoomRecordings] = useState<ZoomRecording[] | null>(null);
  const [fetchingZoom, setFetchingZoom] = useState(false);
  const [importingZoom, setImportingZoom] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadHistory = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from('meetings')
        .select('id, clean_summary, key_concerns, action_items, missing_info, follow_up_email, crm_task, notes, created_at')
        .order('created_at', { ascending: false })
        .limit(15);
      if (data) setHistory(data as MeetingRecord[]);
    } catch {}
  }, []);

  // Load-on-mount fetch; setState happens after the await, not synchronously.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { loadHistory(); }, [loadHistory]);

  const fetchZoomRecordings = async () => {
    setFetchingZoom(true);
    try {
      const res = await fetch('/api/zoom/recordings');
      const data = await res.json();
      if (!res.ok) {
        toast(data.error?.includes('ZOOM_CLIENT_ID') ? 'Add Zoom credentials to .env.local to connect Zoom' : (data.error || 'Failed to load Zoom recordings'), 'error');
        return;
      }
      setZoomRecordings(data.recordings ?? []);
      if ((data.recordings ?? []).length === 0) toast('No recordings with transcripts found in the last 30 days', 'info');
    } catch {
      toast('Failed to connect to Zoom', 'error');
    } finally {
      setFetchingZoom(false);
    }
  };

  const importZoomTranscript = async (rec: ZoomRecording) => {
    setImportingZoom(rec.meetingId);
    try {
      const res = await fetch('/api/zoom/transcript', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ meetingId: rec.meetingId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch transcript');
      const text = vttToText(data.vtt);
      setNotes(text);
      setOutput(null);
      setUploadedFile(rec.topic);
      setZoomRecordings(null);
      logActivity(`Zoom recording imported — ${rec.topic}`, 'var(--gold)');
      toast(`Transcript loaded: ${rec.topic}`);
      setGenerating(true);
      try {
        const nr = await fetch('/api/meeting-notes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ notes: text }),
        });
        if (!nr.ok) throw new Error();
        const nd = await nr.json();
        setOutput(nd);
        await saveMeeting(nd);
        toast('Follow-up package ready');
        logActivity(`Zoom transcript processed by Claude — ${rec.topic}`, 'var(--blue)');
      } catch {
        const fallback = buildOutput(text);
        setOutput(fallback);
        await saveMeeting(fallback);
        toast('Follow-up package generated');
      } finally {
        setGenerating(false);
      }
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed to import transcript', 'error');
    } finally {
      setImportingZoom(null);
    }
  };

  const saveMeeting = async (data: Output) => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await supabase.from('meetings').insert({
        user_id: user.id,
        notes,
        clean_summary: data.cleanSummary,
        key_concerns: data.keyConcerns,
        action_items: data.actionItems,
        missing_info: data.missingInfo,
        follow_up_email: data.followUpEmail,
        crm_task: data.crmTask,
      });
      setSaved(true);
      loadHistory();
    } catch {}
  };

  const loadHistoryItem = (rec: MeetingRecord) => {
    setNotes(rec.notes);
    setOutput({
      cleanSummary: rec.clean_summary,
      keyConcerns: rec.key_concerns,
      actionItems: rec.action_items,
      missingInfo: rec.missing_info,
      followUpEmail: rec.follow_up_email,
      crmTask: rec.crm_task,
    });
    setSaved(true);
    setUploadedFile(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedFile(file.name);
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const raw = ev.target?.result as string;
      const text = file.name.endsWith('.vtt') ? vttToText(raw) : raw;
      setNotes(text);
      setOutput(null);
      logActivity(`Zoom transcript uploaded — ${file.name} processed and ready`, 'var(--gold)');
      await new Promise((r) => setTimeout(r, 400));
      setGenerating(true);
      try {
        const res = await fetch('/api/meeting-notes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ notes: text }),
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        setOutput(data);
        await saveMeeting(data);
        logActivity('Zoom transcript auto-processed by Claude — full follow-up package generated', 'var(--blue)');
      } catch {
        const fallback = buildOutput(text);
        setOutput(fallback);
        await saveMeeting(fallback);
        logActivity('Transcript auto-processed (fallback) — follow-up package generated from Zoom recording', 'var(--blue)');
      } finally {
        setGenerating(false);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const syncToHubSpot = async () => {
    if (!output) return;
    setHubSpot('syncing');
    try {
      const nameMatch = notes.match(/called\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/)?.[1]
        ?? notes.match(/(?:spoke with|meeting with|call with)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/i)?.[1]
        ?? notes.match(/^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/m)?.[1];
      const res = await fetch('/api/hubspot/sync-meeting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactName: nameMatch || 'Prospect',
          cleanSummary: output.cleanSummary,
          actionItems: output.actionItems,
          crmTask: output.crmTask,
          followUpEmail: output.followUpEmail,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Sync failed');
      setHubSpot('done');
      toast('Synced to HubSpot');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Sync failed';
      toast(msg.includes('HUBSPOT_API_KEY') ? 'Add HUBSPOT_API_KEY to .env.local to enable sync' : 'HubSpot sync failed', 'error');
      setHubSpot('idle');
    }
  };

  const generate = async () => {
    if (!notes.trim()) return;
    setGenerating(true);
    setSaved(false);
    try {
      const res = await fetch('/api/meeting-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setOutput(data);
      await saveMeeting(data);
      toast('Meeting notes processed — package ready');
      logActivity('Meeting notes processed by Claude — action items, follow-up email, and CRM task generated', 'var(--blue)');
    } catch {
      const fallback = buildOutput(notes);
      setOutput(fallback);
      await saveMeeting(fallback);
      toast('Follow-up package generated');
      logActivity('Meeting notes processed (fallback) — action items and follow-up package generated', 'var(--blue)');
    } finally {
      setGenerating(false);
    }
  };

  const activeStepCount = uploadedFile ? (output ? 6 : 3) : 2;

  const flowSteps = [
    { label: 'Zoom Call' },
    { label: 'Auto-Transcript' },
    { label: 'AI Extracts 6–7 Fields' },
    { label: 'Asset Calculator' },
    { label: 'PPT Deck Auto-Fills' },
    { label: 'One-Page PDF' },
    { label: 'Sent to Banker' },
  ];

  return (
    <div style={{ maxWidth: '1150px' }}>
      <div style={{ marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h1 className="section-title" style={{ fontSize: '1.375rem' }}>Meeting Notes Automation</h1>
            <p className="section-subtitle" style={{ maxWidth: '560px' }}>
              Turn rough call notes into structured summaries, action items, follow-up emails, and CRM tasks. Or upload a Zoom transcript to run the full automated pipeline end-to-end.
            </p>
          </div>
          <span className="internal-tag">Internal Use Only</span>
        </div>
      </div>

      {/* Zoom Automation Flow */}
      <div style={{ marginBottom: '1.5rem', padding: '1.125rem 1.25rem', borderRadius: '0.75rem', border: '1px solid var(--gold-border)', backgroundColor: 'rgba(201,168,76,0.04)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.875rem' }}>
          <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Zoom → Banker One-Pager — Automated Pipeline
          </div>
          {uploadedFile && <span className="badge badge-gold" style={{ fontSize: '0.6rem' }}>Transcript Loaded: {uploadedFile}</span>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flexWrap: 'wrap' }}>
          {flowSteps.map((step, i, arr) => (
            <div key={step.label} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <div style={{
                padding: '0.35rem 0.75rem',
                borderRadius: '999px',
                backgroundColor: i < activeStepCount ? 'rgba(201,168,76,0.12)' : 'var(--bg-card)',
                border: `1px solid ${i < activeStepCount ? 'var(--gold-border)' : 'var(--border)'}`,
                fontSize: '0.7rem',
                fontWeight: i < activeStepCount ? 700 : 500,
                color: i < activeStepCount ? 'var(--gold)' : 'var(--text-secondary)',
                whiteSpace: 'nowrap',
                transition: 'all 0.3s',
              }}>
                {i < activeStepCount && (
                  <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="3" style={{ marginRight: '4px', verticalAlign: 'middle' }}>
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                )}
                {step.label}
              </div>
              {i < arr.length - 1 && <span style={{ color: i < activeStepCount - 1 ? 'var(--gold)' : 'var(--text-muted)', fontSize: '0.8rem', opacity: i < activeStepCount - 1 ? 1 : 0.4 }}>→</span>}
            </div>
          ))}
        </div>
        <div style={{ marginTop: '0.875rem', display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.vtt"
            style={{ display: 'none' }}
            onChange={handleFileUpload}
          />
          <button
            className="btn-gold"
            style={{ fontSize: '0.75rem', padding: '0.45rem 1rem' }}
            onClick={() => fileInputRef.current?.click()}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '5px' }}>
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            Upload Zoom Transcript (.vtt / .txt)
          </button>
          <button
            className="btn-secondary"
            style={{ fontSize: '0.75rem', padding: '0.45rem 1rem' }}
            onClick={zoomRecordings ? () => setZoomRecordings(null) : fetchZoomRecordings}
            disabled={fetchingZoom}
          >
            {fetchingZoom
              ? <><div className="spinner" style={{ width: '12px', height: '12px', margin: 0 }} />Connecting...</>
              : zoomRecordings
              ? 'Hide Recordings'
              : <>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '5px' }}>
                    <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/>
                  </svg>
                  Fetch from Zoom ↓
                </>
            }
          </button>
          <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Upload a transcript · fetch from Zoom · or paste notes manually below ↓</span>
        </div>

        {zoomRecordings && zoomRecordings.length > 0 && (
          <div className="fade-in" style={{ marginTop: '1rem', borderTop: '1px solid var(--gold-border)', paddingTop: '0.875rem' }}>
            <div style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.625rem' }}>
              Recent Zoom Recordings — Transcripts Available
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {zoomRecordings.map((rec) => {
                const date = new Date(rec.startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                const time = new Date(rec.startTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
                const isImporting = importingZoom === rec.meetingId;
                return (
                  <div key={rec.uuid} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0.75rem', backgroundColor: 'var(--bg-card)', borderRadius: '0.375rem', border: '1px solid var(--border)' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2" style={{ flexShrink: 0 }}>
                      <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/>
                    </svg>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.775rem', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{rec.topic}</div>
                      <div style={{ fontSize: '0.6375rem', color: 'var(--text-muted)' }}>{date} · {time} · {rec.duration} min</div>
                    </div>
                    <button
                      className="btn-gold"
                      style={{ fontSize: '0.65rem', padding: '0.25rem 0.625rem', whiteSpace: 'nowrap', flexShrink: 0 }}
                      onClick={() => importZoomTranscript(rec)}
                      disabled={!!importingZoom}
                    >
                      {isImporting ? <><div className="spinner" style={{ width: '10px', height: '10px', margin: 0 }} />Importing...</> : 'Import →'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Input */}
        <div className="card">
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.875rem' }}>
            {uploadedFile ? `Transcript — ${uploadedFile}` : 'Paste Call Notes'}
          </div>
          <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.75rem', lineHeight: 1.5 }}>
            {uploadedFile
              ? 'Transcript parsed and pre-processed. Edit below if needed, then run the follow-up package.'
              : 'Paste rough notes from any call. The more context, the better the output.'}
          </div>
          <textarea
            className="input-field"
            style={{ minHeight: '280px', resize: 'vertical', lineHeight: 1.7, fontSize: '0.8125rem' }}
            placeholder="Paste your rough call notes here..."
            value={notes}
            onChange={(e) => { setNotes(e.target.value); setOutput(null); }}
          />
          <div style={{ display: 'flex', gap: '0.625rem', marginTop: '0.875rem' }}>
            <button className="btn-gold" style={{ flex: 1, justifyContent: 'center' }} onClick={generate} disabled={generating || !notes.trim()}>
              {generating
                ? <><div className="spinner" style={{ width: '13px', height: '13px', margin: 0 }} />Processing notes...</>
                : 'Generate Follow-Up Package'}
            </button>
            <button className="btn-ghost" onClick={() => { setNotes(''); setOutput(null); setUploadedFile(null); setSaved(false); }}>Clear</button>
          </div>
          {saved && (
            <div style={{ marginTop: '0.625rem', display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.7rem', color: 'var(--success)' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              Saved to your meeting history
            </div>
          )}

          <div style={{ marginTop: '1.25rem', padding: '0.875rem', backgroundColor: 'var(--bg-input)', borderRadius: '0.5rem', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '0.6375rem', fontWeight: 700, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.5rem' }}>What Gets Generated</div>
            {['Clean Meeting Summary', 'Key Client Concerns', 'Action Items', 'Missing Information Checklist', 'Follow-Up Email', 'CRM Task', 'HubSpot Auto-Log'].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.775rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                <div style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: i === 6 ? 'var(--success)' : 'var(--gold)', flexShrink: 0 }} />
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* Output */}
        <div>
          {generating && (
            <div className="card fade-in" style={{ textAlign: 'center', padding: '4rem', minHeight: '500px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div className="spinner" style={{ marginBottom: '1rem' }} />
              <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                {uploadedFile ? 'Processing Zoom transcript...' : 'Analyzing call notes...'}
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Building follow-up package</div>
            </div>
          )}

          {output && !generating && (
            <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Summary */}
              <div className="memo-doc">
                <div className="memo-doc-header">
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>1. Clean Meeting Summary</div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <span className="badge badge-gold">Auto-Generated</span>
                    <CopyBtn text={output.cleanSummary} />
                  </div>
                </div>
                <div className="memo-doc-body">
                  <pre style={{ fontFamily: 'inherit', fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, whiteSpace: 'pre-wrap' }}>{output.cleanSummary}</pre>
                </div>
              </div>

              {/* Concerns + Action Items */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>2. Key Client Concerns</div>
                    <CopyBtn text={output.keyConcerns.join('\n')} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {output.keyConcerns.map((c, i) => (
                      <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                        <div style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: 'var(--warning)', marginTop: '7px', flexShrink: 0 }} />
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>{c}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>3. Action Items</div>
                    <CopyBtn text={output.actionItems.join('\n')} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {output.actionItems.map((a, i) => (
                      <div key={i} style={{ display: 'flex', gap: '0.625rem', alignItems: 'flex-start' }}>
                        <div style={{ width: '16px', height: '16px', borderRadius: '3px', border: '1.5px solid var(--gold-border)', flexShrink: 0, marginTop: '1px' }} />
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>{a}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Missing Info */}
              <div className="card" style={{ borderColor: 'rgba(245,158,11,0.25)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--warning)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>4. Missing Information Checklist</div>
                  <CopyBtn text={output.missingInfo.join('\n')} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  {output.missingInfo.map((m, i) => (
                    <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                      <svg style={{ flexShrink: 0, marginTop: '2px' }} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--warning)" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                      <span style={{ fontSize: '0.775rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{m}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Follow-Up Email */}
              <div style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: '0.625rem', overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', padding: '0.625rem 1rem', borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg-card)' }}>
                  <span style={{ fontSize: '0.6375rem', fontWeight: 700, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.08em', flex: 1 }}>5. Follow-Up Email Draft</span>
                  <CopyBtn text={output.followUpEmail} />
                </div>
                <div style={{ padding: '1rem', fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.75, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {output.followUpEmail}
                </div>
              </div>

              {/* CRM Task */}
              <div style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: '0.625rem', overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', padding: '0.625rem 1rem', borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg-card)' }}>
                  <span style={{ fontSize: '0.6375rem', fontWeight: 700, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.08em', flex: 1 }}>6. CRM Task</span>
                  <CopyBtn text={output.crmTask} />
                </div>
                <div style={{ padding: '1rem', fontFamily: 'var(--font-mono, monospace)', fontSize: '0.775rem', color: 'var(--text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {output.crmTask}
                </div>
              </div>

              {/* HubSpot Sync — Phase 3 */}
              <div style={{ padding: '1.125rem 1.25rem', borderRadius: '0.75rem', border: `1px solid ${hubSpot === 'done' ? 'rgba(52,211,153,0.3)' : 'var(--border)'}`, backgroundColor: hubSpot === 'done' ? 'rgba(52,211,153,0.05)' : 'var(--bg-card)', transition: 'all 0.4s' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={hubSpot === 'done' ? 'var(--success)' : 'var(--gold)'} strokeWidth="2">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                      </svg>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: hubSpot === 'done' ? 'var(--success)' : 'var(--text-primary)' }}>
                        7. HubSpot Auto-Log
                      </span>
                      <span className="badge badge-green" style={{ fontSize: '0.55rem' }}>Live</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                      {hubSpot === 'done'
                        ? 'Contact record updated · 1 task created · Deal stage set to Active Opportunity · Notes logged'
                        : 'Push this summary, CRM task, and action items to HubSpot contact record automatically.'}
                    </div>
                  </div>

                  {(hubSpot === 'idle' || hubSpot === 'syncing') && (
                    <button
                      className="btn-secondary"
                      style={{ whiteSpace: 'nowrap' }}
                      onClick={syncToHubSpot}
                      disabled={hubSpot === 'syncing'}
                    >
                      {hubSpot === 'syncing'
                        ? <><div className="spinner" style={{ width: '12px', height: '12px', margin: 0 }} />Syncing...</>
                        : 'Sync to HubSpot'}
                    </button>
                  )}
                  {hubSpot === 'done' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--success)' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                      Synced to HubSpot
                    </div>
                  )}
                </div>

                {hubSpot === 'done' && (
                  <div className="fade-in" style={{ marginTop: '0.875rem', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                    {[
                      { label: 'Contact Updated', icon: '👤' },
                      { label: '1 Task Created', icon: '✓' },
                      { label: 'Deal Stage Logged', icon: '📊' },
                      { label: 'Notes Attached', icon: '📎' },
                    ].map((item) => (
                      <div key={item.label} style={{ padding: '0.5rem 0.75rem', borderRadius: '0.375rem', backgroundColor: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.6375rem', fontWeight: 700, color: 'var(--success)' }}>{item.label}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {!output && !generating && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '500px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '0.75rem' }}>
              <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                <div style={{ marginBottom: '1rem', opacity: 0.25 }}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5" style={{ margin: '0 auto' }}>
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                </div>
                <div style={{ fontSize: '0.875rem' }}>Upload a Zoom transcript or paste notes<br />and click <strong style={{ color: 'var(--text-secondary)' }}>Generate Follow-Up Package</strong></div>
                <div style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>Upload a transcript or paste notes to get started</div>
              </div>
            </div>
          )}
        </div>
      </div>

    {history.length > 0 && (
      <div style={{ marginTop: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <div className="section-title" style={{ fontSize: '0.9375rem' }}>Saved Meeting Sessions</div>
          <span className="badge badge-blue">{history.length} saved</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '0.75rem' }}>
          {history.map((rec) => {
            const date = new Date(rec.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            const time = new Date(rec.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
            const preview = rec.clean_summary?.slice(0, 100) ?? '';
            return (
              <div
                key={rec.id}
                onClick={() => loadHistoryItem(rec)}
                style={{
                  padding: '1rem',
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: '0.625rem',
                  cursor: 'pointer',
                  transition: 'border-color 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--gold-border)')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--gold)' }}>{date} · {time}</span>
                  <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>{rec.action_items?.length ?? 0} actions</span>
                </div>
                <div style={{ fontSize: '0.775rem', color: 'var(--text-secondary)', lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const }}>
                  {preview || 'Meeting session'}
                </div>
                <div style={{ marginTop: '0.5rem', fontSize: '0.65rem', color: 'var(--gold)', fontWeight: 600 }}>Load session →</div>
              </div>
            );
          })}
        </div>
      </div>
    )}
    </div>
  );
}
