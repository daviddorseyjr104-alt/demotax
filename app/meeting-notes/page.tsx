'use client';

import { useState } from 'react';
import { logActivity } from '../../lib/activity';

const DEMO_NOTES = `Client is considering a Q4 sale of a family-owned manufacturing company. Estimated value around $85M–$92M. CPA is involved — David Park at Park & Associates. Main concern is large tax bill and preserving liquidity after closing. Wants a simple explanation for spouse and attorney. Business has been in the family for 30 years. Basis is low — around $12M to $14M. Some equipment depreciation recapture. Entity is an S-corp. No LOI yet but conversations are active. Timeline is flexible but they're hoping to close before year end. Follow up next week with summary and deck.`;

type Output = {
  cleanSummary: string;
  keyConcerns: string[];
  actionItems: string[];
  missingInfo: string[];
  followUpEmail: string;
  crmTask: string;
};

function buildOutput(notes: string): Output {
  const lc = notes.toLowerCase();
  const mentionsName = lc.includes('chen') || lc.includes('robert') || lc.includes('client');
  const mentionsTax = lc.includes('tax');
  const mentionsCPA = lc.includes('cpa') || lc.includes('accountant');
  const mentionsValue = lc.match(/\$[\d,]+(m|million)?/i)?.[0] ?? '$85M';
  const mentionsTimeline = lc.includes('q4') || lc.includes('year end') || lc.includes('closing');
  const mentionsBasis = lc.includes('basis');

  const clientRef = notes.includes('Robert') ? 'Robert Chen' : 'the prospect';
  const dateStr = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  return {
    cleanSummary: `Call Summary — ${dateStr}

${clientRef.charAt(0).toUpperCase() + clientRef.slice(1)} is considering the sale of a family-owned manufacturing business, estimated at approximately ${mentionsValue}. The business has been family-owned for approximately 30 years with a low adjusted basis, indicating a substantial potential capital gain. Entity structure is an S-corporation. The anticipated closing target is Q4, subject to final agreement.

The client's primary concern is the size of the anticipated tax obligation and its effect on post-close liquidity. The client's spouse and attorney should be included in future communications. A CPA is involved and should be coordinated with as the process progresses. No Letter of Intent has been signed at this time.`,

    keyConcerns: [
      mentionsTax ? 'Large estimated tax obligation concentrated in year of sale' : 'Tax exposure and after-tax liquidity',
      'Preservation of after-close liquidity for family',
      'Simple, clear explanation needed for spouse and legal counsel',
      'Low adjusted basis — significant embedded gain in the asset',
      mentionsCPA ? 'Coordination with CPA (David Park) required' : 'Coordination with existing advisors',
      'Timing flexibility — preference to close before year-end',
    ],

    actionItems: [
      'Send executive brief summarizing call and transaction assumptions',
      'Prepare 8-slide PowerPoint outline for internal review',
      'Request adjusted basis schedules and depreciation records from CPA',
      'Ask for CPA and attorney contact information for team coordination',
      'Schedule professional review call — include client\'s spouse if possible',
      'Build deal model in AI Deal Review with {basis} and estimated closing assumptions',
    ],

    missingInfo: [
      !mentionsBasis || !notes.includes('12') ? 'Confirmed adjusted basis amount' : 'Depreciation recapture breakdown by asset class',
      'Letter of Intent status and anticipated signing date',
      'Full legal name and entity structure documentation',
      'Attorney contact information for coordination',
      'CPA\'s current estimate of tax exposure (if prepared)',
      'Desired liquidity outcome — reinvestment, estate, or distribution',
    ],

    followUpEmail: `Subject: Summary of Our Conversation — ${clientRef} Transaction Review

Hi [Client Name],

Thank you for taking the time to speak with me today. I wanted to send a brief summary of our conversation and outline the immediate next steps.

As discussed, you are evaluating the sale of your manufacturing business, with a preliminary estimated value of approximately ${mentionsValue}. Your primary concern is understanding the full extent of the tax obligation and ensuring that post-close liquidity is preserved in a way that makes sense for your family.

I want to confirm a few things from our discussion and gather some additional detail:

  1. Adjusted basis — a precise figure will help us develop a more accurate exposure estimate
  2. Your CPA's current assessment of the tax picture, if they've prepared one
  3. Your attorney's contact information, so we can ensure they're included in the review process

In the meantime, I'll prepare an executive brief summarizing the key planning considerations we discussed. This is for internal review only and will not constitute advice — it's a framework document to help us structure a productive professional review call.

I'll follow up early next week. Please don't hesitate to reach out if anything comes to mind in the interim.

With respect,
[Your Name]
[Firm Name] | Tax Deferral Advisory Practice`,

    crmTask: `CRM TASK — ${dateStr}
Contact: ${clientRef} | Status: Meeting Completed → Follow-Up Pending
Priority: HIGH | Due: This week

Notes: Call completed. Client exploring $85M–$92M manufacturing business sale. S-corp structure. Low basis (~$12M–$14M). Q4 target. Primary concern: tax bill / liquidity. CPA: David Park. No LOI yet. Spouse + attorney to be included.

Actions:
☐ Send executive brief by EOW
☐ Build AI Deal Review model with $92M / $14M basis
☐ Request basis schedules and depreciation records
☐ Confirm CPA and attorney contacts
☐ Schedule follow-up call — include spouse

Tag: #business-sale #active #s-corp #high-priority`,
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

export default function MeetingNotesPage() {
  const [notes, setNotes] = useState(DEMO_NOTES);
  const [generating, setGenerating] = useState(false);
  const [output, setOutput] = useState<Output | null>(null);

  const generate = () => {
    if (!notes.trim()) return;
    setGenerating(true);
    setTimeout(() => {
      setOutput(buildOutput(notes));
      setGenerating(false);
      logActivity('Meeting notes processed — action items, follow-up email, and CRM task generated', 'var(--blue)');
    }, 2000);
  };

  return (
    <div style={{ maxWidth: '1150px' }}>
      <div style={{ marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h1 className="section-title" style={{ fontSize: '1.375rem' }}>Meeting Notes Automation</h1>
            <p className="section-subtitle" style={{ maxWidth: '560px' }}>
              Turn rough call notes into structured summaries, action items, follow-up emails, and CRM tasks. Replace manual post-call documentation with a repeatable workflow.
            </p>
          </div>
          <span className="internal-tag">Internal Use Only</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Input */}
        <div className="card">
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.875rem' }}>
            Paste Call Notes
          </div>
          <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.75rem', lineHeight: 1.5 }}>
            Paste rough notes from any call. The more context, the better the output. Demo notes pre-loaded below.
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
            <button className="btn-ghost" onClick={() => { setNotes(DEMO_NOTES); setOutput(null); }}>Reset</button>
          </div>

          <div style={{ marginTop: '1.25rem', padding: '0.875rem', backgroundColor: 'var(--bg-input)', borderRadius: '0.5rem', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '0.6375rem', fontWeight: 700, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.5rem' }}>What Gets Generated</div>
            {['Clean Meeting Summary', 'Key Client Concerns', 'Action Items', 'Missing Information Checklist', 'Follow-Up Email', 'CRM Task'].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.775rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                <div style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: 'var(--gold)', flexShrink: 0 }} />
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
              <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Analyzing call notes...</div>
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

              {/* Concerns + Action Items in two columns */}
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
                <div style={{ fontSize: '0.875rem' }}>Paste call notes and click<br /><strong style={{ color: 'var(--text-secondary)' }}>Generate Follow-Up Package</strong></div>
                <div style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>Demo notes are pre-loaded — try it now</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
