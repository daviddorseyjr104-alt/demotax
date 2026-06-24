'use client';

import { useState, useEffect } from 'react';
import { logActivity, incrementStat } from '../../lib/activity';

type Form = {
  clientName: string;
  txValue: string;
  assetClass: string;
  concern: string;
  audience: string;
  tone: string;
};

const init: Form = {
  clientName: '',
  txValue: '',
  assetClass: '',
  concern: 'Large tax bill',
  audience: 'Real estate owner',
  tone: 'Sophisticated',
};

type Brief = {
  situation: string;
  txContext: string;
  planningIssue: string;
  reviewConsiderations: string[];
  nextSteps: string[];
  questions: string[];
};

function buildBrief(f: Form): Brief {
  const name = f.clientName || '[Client Name]';
  const val = f.txValue || 'undisclosed amount';
  const asset = f.assetClass || 'the asset';
  const concern = f.concern;
  const aud = f.audience;
  const tone = f.tone;

  const toneAdj: Record<string, string> = {
    Conservative: 'a methodical, evidence-based',
    Sophisticated: 'an institutional-grade',
    Educational: 'a clear, educational',
    Direct: 'a direct, efficient',
    'Relationship-first': 'a relationship-focused',
  };
  const ta = toneAdj[tone] ?? 'a professional';

  return {
    situation: `${name} is considering the sale of ${asset.toLowerCase()}, with an estimated transaction value of ${val}. This represents a significant liquidity event with material tax implications that warrant a structured professional review prior to closing. The timing and structure of this transaction will likely have a meaningful impact on after-tax proceeds and long-term capital planning.`,

    txContext: `The transaction involves ${asset.toLowerCase()} at an estimated value of ${val}. Based on the information provided, the primary financial concern identified is: ${concern.toLowerCase()}. The anticipated outcome is a substantial capital event that would typically generate both federal and state tax obligations, potentially including ordinary income recapture, depending on the asset classification and entity structure.`,

    planningIssue: `The central planning issue for ${name} is ${concern.toLowerCase()} — specifically, the concentration of a large tax liability in a single tax year at the point of sale. Without structured planning, the full tax exposure would likely be due in the year the transaction closes, potentially reducing after-tax liquidity by a significant percentage of gross proceeds. A coordinated professional review may identify whether available planning approaches could alter this outcome, subject to advisor review and applicable legal constraints.`,

    reviewConsiderations: [
      `Timing of the transaction close and its effect on the applicable tax year`,
      `Entity structure and how it interacts with available planning mechanisms`,
      `Coordination among CPA, legal counsel, and wealth management advisors`,
      `Post-closing capital deployment and long-term liquidity planning`,
      `Estate planning implications of the liquidity event for ${name}'s family`,
      `Referral partner education — ensuring all advisors understand the full picture`,
    ],

    nextSteps: [
      `Schedule ${ta} discovery call with ${name} to review transaction documents`,
      `Request cost basis schedules, prior tax returns, and current entity structure`,
      `Obtain CPA and legal counsel contact information for advisor coordination`,
      `Prepare initial deal review summary using the AI Deal Review module`,
      `Generate PowerPoint outline for ${aud === 'Internal team' ? 'internal briefing' : `presentation to ${name}`}`,
      `Send follow-up summary to all relevant advisors after initial review`,
    ],

    questions: [
      `Has the purchase agreement been executed or is the LOI stage still in progress?`,
      `What is the current CPA's assessment of the estimated tax exposure?`,
      `Is there an existing estate plan or trust structure that should be coordinated with?`,
      `What is the intended use of the after-tax proceeds — reinvestment, retirement, or distribution?`,
      `Have any deferral or planning strategies been discussed with current advisors?`,
      `Is the timeline firm, or is there flexibility in the closing date?`,
    ],
  };
}

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    const full = Object.values(text).join('\n\n');
    navigator.clipboard.writeText(typeof text === 'string' ? text : full).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };
  return (
    <button className="btn-ghost" onClick={copy}>
      {copied
        ? <><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>Copied</>
        : <><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>Copy</>
      }
    </button>
  );
}

export default function ExecutiveBriefsPage() {
  const [form, setForm] = useState<Form>(init);
  const [generating, setGenerating] = useState(false);
  const [brief, setBrief] = useState<Brief | null>(null);
  // One-time prefill from URL params on mount (needs `window`, so an effect).
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const name = params.get('name');
    const txValue = params.get('txValue');
    if (name || txValue) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm((f) => ({ ...f, ...(name ? { clientName: name } : {}), ...(txValue ? { txValue } : {}) }));
    }
  }, []);

  const set = (k: keyof Form, v: string) => { setForm((f) => ({ ...f, [k]: v })); setBrief(null); };

  const printBrief = () => {
    if (!brief) return;
    const escaped = briefText.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
<title>${form.clientName} — Executive Brief</title>
<style>
body{font-family:Georgia,serif;padding:60px;max-width:760px;margin:0 auto;color:#1a1a1a;line-height:1.75}
pre{font-family:'Courier New',monospace;font-size:11.5px;white-space:pre-wrap;word-break:break-word;line-height:1.8}
@media print{body{padding:0}@page{margin:1.5cm}}
</style></head><body>
<pre>${escaped}</pre></body></html>`;
    const win = window.open('', '_blank', 'width=820,height=960');
    if (win) { win.document.write(html); win.document.close(); win.focus(); setTimeout(() => win.print(), 400); }
  };

  const generate = async () => {
    setGenerating(true);
    try {
      const res = await fetch('/api/executive-brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setBrief(data);
      logActivity(`Executive brief generated by Claude — ${form.clientName}, ${form.assetClass} (${form.txValue})`, 'var(--gold)');
    } catch {
      setBrief(buildBrief(form));
      logActivity(`Executive brief generated — ${form.clientName}, ${form.assetClass} (${form.txValue})`, 'var(--gold)');
    } finally {
      setGenerating(false);
      incrementStat('briefs');
    }
  };

  const briefText = brief ? [
    `EXECUTIVE BRIEF — ${form.clientName || '[Client]'} | ${form.txValue} ${form.assetClass}`,
    `\nSITUATION OVERVIEW\n${brief.situation}`,
    `\nTRANSACTION CONTEXT\n${brief.txContext}`,
    `\nKEY PLANNING ISSUE\n${brief.planningIssue}`,
    `\nPROFESSIONAL REVIEW CONSIDERATIONS\n${brief.reviewConsiderations.map((c, i) => `${i + 1}. ${c}`).join('\n')}`,
    `\nSUGGESTED NEXT STEPS\n${brief.nextSteps.map((s, i) => `${i + 1}. ${s}`).join('\n')}`,
    `\nQUESTIONS TO ASK\n${brief.questions.map((q, i) => `${i + 1}. ${q}`).join('\n')}`,
    `\n\nPrepared for internal workflow review. Not tax, legal, or financial advice.`,
  ].join('') : '';

  return (
    <div style={{ maxWidth: '1150px' }}>
      <div style={{ marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h1 className="section-title" style={{ fontSize: '1.375rem' }}>Executive Briefs</h1>
            <p className="section-subtitle" style={{ maxWidth: '580px' }}>
              Generate polished internal memos and client-facing situational summaries from structured deal inputs. Replace manual drafting with a repeatable brief-generation workflow.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <span className="internal-tag">Prepared for Professional Review</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Form */}
        <div className="card">
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '1.125rem' }}>Brief Parameters</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            <div>
              <label className="field-label">Client / Prospect Name</label>
              <input className="input-field" placeholder="Robert Chen" value={form.clientName} onChange={(e) => set('clientName', e.target.value)} />
            </div>
            <div>
              <label className="field-label">Transaction Value</label>
              <input className="input-field" placeholder="$92M" value={form.txValue} onChange={(e) => set('txValue', e.target.value)} />
            </div>
            <div>
              <label className="field-label">Asset Class</label>
              <input className="input-field" placeholder="e.g. Multifamily Portfolio" value={form.assetClass} onChange={(e) => set('assetClass', e.target.value)} />
            </div>
            <div>
              <label className="field-label">Main Concern</label>
              <select className="input-field" value={form.concern} onChange={(e) => set('concern', e.target.value)}>
                {['Large tax bill', 'Liquidity planning', 'Business exit', 'Real estate portfolio sale', 'Estate planning', 'Referral education'].map((v) => <option key={v}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="field-label">Audience</label>
              <select className="input-field" value={form.audience} onChange={(e) => set('audience', e.target.value)}>
                {['Internal team', 'Business owner', 'Real estate owner', 'CPA', 'Investment banker', 'Broker'].map((v) => <option key={v}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="field-label">Tone</label>
              <select className="input-field" value={form.tone} onChange={(e) => set('tone', e.target.value)}>
                {['Conservative', 'Sophisticated', 'Educational', 'Direct', 'Relationship-first'].map((v) => <option key={v}>{v}</option>)}
              </select>
            </div>
            <button className="btn-gold" style={{ width: '100%', justifyContent: 'center' }} onClick={generate} disabled={generating}>
              {generating
                ? <><div className="spinner" style={{ width: '13px', height: '13px', margin: 0 }} />Generating brief...</>
                : 'Generate Executive Brief'}
            </button>
          </div>

          {brief && (
            <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <CopyBtn text={briefText} />
              <a href="/powerpoint-builder" style={{ textDecoration: 'none' }}>
                <button className="btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>Create PowerPoint Outline</button>
              </a>
              <button className="btn-secondary" style={{ width: '100%', justifyContent: 'center' }} onClick={printBrief}>Export PDF</button>
            </div>
          )}
        </div>

        {/* Brief output */}
        <div>
          {generating && (
            <div className="memo-doc fade-in" style={{ minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ textAlign: 'center' }}>
                <div className="spinner" style={{ marginBottom: '1rem' }} />
                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Generating executive brief...</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.375rem' }}>Preparing for professional review</div>
              </div>
            </div>
          )}

          {brief && !generating && (
            <div className="memo-doc fade-in">
              <div className="memo-doc-header">
                <div>
                  <div style={{ fontSize: '0.5625rem', fontWeight: 700, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.25rem' }}>
                    Executive Brief · {form.tone} · {form.audience}
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {form.clientName || 'Transaction Review'} — {form.txValue} {form.assetClass}
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    Prepared {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <span className="badge badge-gold">Ready for Review</span>
                  <CopyBtn text={briefText} />
                </div>
              </div>
              <div className="memo-doc-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {[
                  { title: 'Situation Overview', body: brief.situation },
                  { title: 'Transaction Context', body: brief.txContext },
                  { title: 'Key Planning Issue', body: brief.planningIssue },
                ].map((sec) => (
                  <div key={sec.title} className="memo-section">
                    <div className="memo-section-title">{sec.title}</div>
                    <p className="memo-body" style={{ margin: 0 }}>{sec.body}</p>
                  </div>
                ))}

                <div className="memo-section">
                  <div className="memo-section-title">Professional Review Considerations</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {brief.reviewConsiderations.map((c, i) => (
                      <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                        <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--gold)', flexShrink: 0, paddingTop: '2px' }}>{i + 1}.</span>
                        <span className="memo-body" style={{ margin: 0 }}>{c}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="memo-section" style={{ margin: 0 }}>
                    <div className="memo-section-title">Suggested Next Steps</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {brief.nextSteps.map((s, i) => (
                        <div key={i} style={{ display: 'flex', gap: '0.625rem', alignItems: 'flex-start' }}>
                          <svg style={{ flexShrink: 0, marginTop: '2px' }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>{s}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="memo-section" style={{ margin: 0 }}>
                    <div className="memo-section-title">Questions to Ask on Discovery Call</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {brief.questions.map((q, i) => (
                        <div key={i} style={{ padding: '0.5rem 0.75rem', backgroundColor: 'var(--bg-card)', borderRadius: '0.375rem', border: '1px solid var(--border)', borderLeft: '2px solid var(--gold)' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{q}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={{ padding: '0.75rem 1rem', backgroundColor: 'var(--bg-card)', borderRadius: '0.5rem', border: '1px solid var(--gold-border)', fontSize: '0.6875rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                  <strong style={{ color: 'var(--gold)' }}>Prepared for internal workflow review. </strong>
                  Not tax, legal, accounting, investment, or financial advice. All considerations must be reviewed by qualified professionals before any action is taken.
                </div>
              </div>
            </div>
          )}

          {!brief && !generating && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '0.75rem' }}>
              <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                <div style={{ marginBottom: '1rem', opacity: 0.3 }}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5" style={{ margin: '0 auto' }}>
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                  </svg>
                </div>
                <div style={{ fontSize: '0.875rem' }}>Configure brief parameters and click<br /><strong style={{ color: 'var(--text-secondary)' }}>Generate Executive Brief</strong></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
