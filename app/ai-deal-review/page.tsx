'use client';

import { useState, useMemo } from 'react';
import { logActivity, incrementStat } from '../../lib/activity';

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

const pct = (n: number) => `${(n * 100).toFixed(2)}%`;

type Form = {
  prospectName: string; prospectType: string; assetType: string;
  salePrice: string; costBasis: string; debtPayoff: string;
  txCosts: string; fedRate: string; stateRate: string;
  recapture: string; timeline: string; stage: string;
};

const DEMO: Form = {
  prospectName: 'Robert Chen', prospectType: 'Business Owner', assetType: 'Business Sale',
  salePrice: '92000000', costBasis: '14000000', debtPayoff: '18000000',
  txCosts: '2800000', fedRate: '23.8', stateRate: '13.3',
  recapture: '4200000', timeline: 'Q4 2025', stage: 'Under Contract',
};

const STEPS = ['Import / Enter Data', 'Review Assumptions', 'Generate Executive Memo', 'Build PowerPoint', 'Create Follow-Up'];

function StepBar({ step }: { step: number }) {
  return (
    <div className="step-bar">
      {STEPS.map((s, i) => {
        const cls = i < step ? 'complete' : i === step ? 'active' : '';
        return (
          <div key={s} style={{ display: 'flex', alignItems: 'center' }}>
            <div className={`step-item ${cls}`}>
              <div className={`step-num ${i < step ? 'complete' : ''}`}>{i < step ? '✓' : i + 1}</div>
              {s}
            </div>
            {i < STEPS.length - 1 && <div className="step-connector" />}
          </div>
        );
      })}
    </div>
  );
}

export default function AIDealReviewPage() {
  const [form, setForm] = useState<Form>(DEMO);
  const [generating, setGenerating] = useState(false);
  const [memo, setMemo] = useState<string | null>(null);
  const [step, setStep] = useState<number>(1);

  const set = (k: keyof Form, v: string) => { setForm((f) => ({ ...f, [k]: v })); setMemo(null); setStep(1); };
  const n = (v: string) => parseFloat(v.replace(/,/g, '')) || 0;

  const calc = useMemo(() => {
    const sp = n(form.salePrice), cb = n(form.costBasis),
      dp = n(form.debtPayoff), tc = n(form.txCosts),
      fr = n(form.fedRate) / 100, sr = n(form.stateRate) / 100, rc = n(form.recapture);
    const grossGain = Math.max(0, sp - cb);
    const netProceeds = Math.max(0, sp - dp - tc);
    const fedExp = grossGain * fr;
    const stateExp = grossGain * sr;
    const totalExp = fedExp + stateExp + rc;
    const deferrable = totalExp * 0.75;
    const netAfterTax = Math.max(0, netProceeds - totalExp);
    const effRate = sp > 0 ? totalExp / sp : 0;
    return { grossGain, netProceeds, fedExp, stateExp, rc, totalExp, deferrable, netAfterTax, effRate };
  }, [form]);

  const hasData = n(form.salePrice) > 0;

  const buildMemo = () => {
    const name = form.prospectName || '[Prospect]';
    return `EXECUTIVE MEMORANDUM

Prepared for:      ${name}
Prospect Type:     ${form.prospectType}
Transaction Type:  ${form.assetType}
Estimated Sale:    ${fmt(n(form.salePrice))}
Current Stage:     ${form.stage}
Expected Timeline: ${form.timeline || 'TBD'}
Prepared:          ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
Status:            Internal Review Only

──────────────────────────────────────────────────────────────

SITUATION SUMMARY

Based on the supplied transaction assumptions, this opportunity involves a
${form.assetType.toLowerCase()} with an estimated gross gain of ${fmt(calc.grossGain)}
and total estimated tax exposure of approximately ${fmt(calc.totalExp)}.
Net proceeds after estimated debt payoff and transaction costs are projected
at ${fmt(calc.netProceeds)}.

The effective tax burden on gross sale proceeds is estimated at ${pct(calc.effRate)},
which is material and warrants a structured professional review to evaluate all
available planning considerations prior to closing.

──────────────────────────────────────────────────────────────

ESTIMATED EXPOSURE SUMMARY (For Internal Review)

  Gross Gain:                    ${fmt(calc.grossGain)}
  Federal Cap Gains Exposure:    ${fmt(calc.fedExp)}
  State Tax Exposure:            ${fmt(calc.stateExp)}
  Recapture Exposure:            ${fmt(calc.rc)}
  Total Estimated Tax Exposure:  ${fmt(calc.totalExp)}
  Net After-Tax Proceeds (Est.): ${fmt(calc.netAfterTax)}
  Simple Est. Deferrable Range:  ${fmt(calc.deferrable)}

──────────────────────────────────────────────────────────────

KEY DISCUSSION AREAS FOR PROFESSIONAL REVIEW

  • Liquidity planning and after-tax capital deployment
  • Transaction timing and its effect on tax year exposure
  • Coordination with CPA and legal counsel on entity structure
  • Available deferral mechanisms — subject to professional review
  • Referral partner education and advisor team coordination
  • Post-closing planning and long-term capital management

──────────────────────────────────────────────────────────────

SUGGESTED NEXT STEP

Schedule a professional review call with ${name} and request
supporting transaction documents: purchase agreement, cost basis
schedules, existing tax returns, and current advisor contacts.

──────────────────────────────────────────────────────────────

DISCLAIMER: Prepared automatically for internal workflow review.
Not tax, legal, accounting, investment, or financial advice.
All figures are estimates based on inputs provided and must be
reviewed by qualified professionals before any decisions are made.
Estimated time saved by this automation: 6.5 hours.`;
  };

  const handleGenerate = () => {
    if (!hasData) return;
    setGenerating(true);
    setMemo(null);
    setStep(2);
    setTimeout(() => {
      const built = buildMemo();
      setMemo(built);
      setGenerating(false);
      setStep(3);
      logActivity(`Executive memo generated — ${form.prospectName}, ${form.assetType} (${fmt(n(form.salePrice))})`, 'var(--gold)');
      incrementStat('memos');
    }, 1800);
  };

  const printMemo = () => {
    if (!memo) return;
    const escaped = memo.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
<title>${form.prospectName} — Executive Memorandum</title>
<style>
body{font-family:'Courier New',monospace;padding:60px;max-width:750px;margin:0 auto;color:#1a1a1a;line-height:1.75}
pre{font-family:'Courier New',monospace;font-size:11.5px;white-space:pre-wrap;word-break:break-word;line-height:1.8}
h3{font-family:sans-serif;margin-top:0;color:#333}
@media print{body{padding:0}@page{margin:1.5cm}}
</style></head><body>
<h3 style="font-size:11px;text-transform:uppercase;letter-spacing:2px;color:#999;margin-bottom:4px">TAX STRATEGY OPERATIONS HUB — INTERNAL REVIEW ONLY</h3>
<pre>${escaped}</pre></body></html>`;
    const win = window.open('', '_blank', 'width=820,height=960');
    if (win) { win.document.write(html); win.document.close(); win.focus(); setTimeout(() => win.print(), 400); }
  };

  const copyMemo = () => { if (memo) navigator.clipboard.writeText(memo); };

  const resultItems = [
    { label: 'Gross Gain', value: calc.grossGain },
    { label: 'Net Proceeds Estimate', value: calc.netProceeds },
    { label: 'Federal Cap Gains Exposure', value: calc.fedExp },
    { label: 'State Tax Exposure', value: calc.stateExp },
    { label: 'Recapture Exposure', value: calc.rc },
    { label: 'Net After-Tax Proceeds', value: calc.netAfterTax },
  ];

  return (
    <div style={{ maxWidth: '1150px' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h1 className="section-title" style={{ fontSize: '1.375rem' }}>AI Deal Review</h1>
            <p className="section-subtitle" style={{ maxWidth: '600px' }}>
              Standardize transaction assumptions, estimate exposure ranges, and generate internal executive memos from structured inputs.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <span className="internal-tag">Internal Review Only</span>
            <span className="badge badge-gold">Demo Data Pre-Loaded</span>
          </div>
        </div>
      </div>

      <div style={{ borderRadius: '0.75rem', overflow: 'hidden', border: '1px solid var(--border)', marginBottom: '1.5rem' }}>
        <StepBar step={step} />

        <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 0 }}>
          {/* Form */}
          <div style={{ borderRight: '1px solid var(--border)', padding: '1.5rem', backgroundColor: 'var(--bg-card)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '1.125rem' }}>Transaction Details</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <div>
                <label className="field-label">Prospect Name</label>
                <input className="input-field" placeholder="e.g. Robert Chen" value={form.prospectName} onChange={(e) => set('prospectName', e.target.value)} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label className="field-label">Prospect Type</label>
                  <select className="input-field" value={form.prospectType} onChange={(e) => set('prospectType', e.target.value)}>
                    {['Business Owner', 'Real Estate Owner', 'Private Equity Partner', 'Investment Banker Referral', 'Broker Referral'].map((v) => <option key={v}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label className="field-label">Asset Type</label>
                  <select className="input-field" value={form.assetType} onChange={(e) => set('assetType', e.target.value)}>
                    {['Business Sale', 'Commercial Real Estate', 'Multifamily Portfolio', 'Industrial Property', 'Private Company Equity', 'Other'].map((v) => <option key={v}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label className="field-label">Sale Price ($)</label>
                  <input className="input-field" placeholder="92,000,000" value={form.salePrice} onChange={(e) => set('salePrice', e.target.value)} />
                </div>
                <div>
                  <label className="field-label">Cost Basis ($)</label>
                  <input className="input-field" placeholder="14,000,000" value={form.costBasis} onChange={(e) => set('costBasis', e.target.value)} />
                </div>
                <div>
                  <label className="field-label">Debt Payoff ($)</label>
                  <input className="input-field" placeholder="18,000,000" value={form.debtPayoff} onChange={(e) => set('debtPayoff', e.target.value)} />
                </div>
                <div>
                  <label className="field-label">Transaction Costs ($)</label>
                  <input className="input-field" placeholder="2,800,000" value={form.txCosts} onChange={(e) => set('txCosts', e.target.value)} />
                </div>
                <div>
                  <label className="field-label">Federal Rate (%)</label>
                  <input className="input-field" placeholder="23.8" value={form.fedRate} onChange={(e) => set('fedRate', e.target.value)} />
                </div>
                <div>
                  <label className="field-label">State Rate (%)</label>
                  <input className="input-field" placeholder="13.3" value={form.stateRate} onChange={(e) => set('stateRate', e.target.value)} />
                </div>
              </div>
              <div>
                <label className="field-label">Recapture / Ordinary Income ($)</label>
                <input className="input-field" placeholder="4,200,000" value={form.recapture} onChange={(e) => set('recapture', e.target.value)} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label className="field-label">Expected Timeline</label>
                  <input className="input-field" placeholder="Q4 2025" value={form.timeline} onChange={(e) => set('timeline', e.target.value)} />
                </div>
                <div>
                  <label className="field-label">Current Stage</label>
                  <select className="input-field" value={form.stage} onChange={(e) => set('stage', e.target.value)}>
                    {['Early Conversation', 'LOI Signed', 'Under Contract', 'Closing Soon', 'Professional Review'].map((v) => <option key={v}>{v}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Results */}
          <div style={{ padding: '1.5rem', backgroundColor: 'var(--bg-primary)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.875rem' }}>Estimated Exposure Review</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.625rem' }}>
                {resultItems.map((item) => (
                  <div key={item.label} className="result-card">
                    <div style={{ fontSize: '0.625rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.3rem' }}>{item.label}</div>
                    <div style={{ fontSize: '1.0625rem', fontWeight: 700, color: hasData ? 'var(--text-primary)' : 'var(--text-muted)' }}>{hasData ? fmt(item.value) : '—'}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.625rem', marginTop: '0.625rem' }}>
                <div className="result-card highlight">
                  <div style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.3rem' }}>Total Est. Tax Exposure</div>
                  <div style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--gold)' }}>{hasData ? fmt(calc.totalExp) : '—'}</div>
                </div>
                <div className="result-card" style={{ borderColor: 'rgba(34,197,94,0.25)', backgroundColor: 'rgba(34,197,94,0.05)' }}>
                  <div style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--success)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.3rem' }}>Simple Est. Deferrable Range</div>
                  <div style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--success)' }}>{hasData ? fmt(calc.deferrable) : '—'}</div>
                  <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>≈ 75% of exposure · subject to professional review</div>
                </div>
              </div>
              {hasData && (
                <div style={{ marginTop: '0.625rem', padding: '0.75rem', backgroundColor: 'var(--bg-card)', borderRadius: '0.5rem', border: '1px solid var(--border)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Effective rate on gross proceeds: <strong style={{ color: 'var(--text-primary)' }}>{pct(calc.effRate)}</strong>
                  {' · '}Stage: <strong style={{ color: 'var(--text-primary)' }}>{form.stage}</strong>
                  {form.timeline && <>{' · '}Timeline: <strong style={{ color: 'var(--text-primary)' }}>{form.timeline}</strong></>}
                  <span style={{ float: 'right', color: 'var(--success)' }}>Est. time saved: 6.5 hrs</span>
                </div>
              )}
            </div>

            <button className="btn-gold" style={{ width: '100%', justifyContent: 'center', fontSize: '0.875rem', padding: '0.75rem' }} onClick={handleGenerate} disabled={!hasData || generating}>
              {generating
                ? <><div className="spinner" style={{ width: '14px', height: '14px', margin: 0 }} />Analyzing transaction assumptions...</>
                : memo ? 'Regenerate Executive Memo' : 'Generate Executive Memo'}
            </button>

            {memo && (
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <a href="/powerpoint-builder" style={{ textDecoration: 'none' }}><button className="btn-secondary">Generate PowerPoint Outline</button></a>
                <a href="/marketing-studio" style={{ textDecoration: 'none' }}><button className="btn-secondary">Draft Referral Email</button></a>
                <a href="/referral-pipeline" style={{ textDecoration: 'none' }}><button className="btn-secondary">View Pipeline</button></a>
                <button className="btn-secondary" onClick={copyMemo}>Copy Memo Text</button>
                <button className="btn-secondary" onClick={printMemo}>Export PDF</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {generating && (
        <div className="card fade-in" style={{ textAlign: 'center', padding: '3rem' }}>
          <div className="spinner" style={{ marginBottom: '1rem' }} />
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Analyzing transaction assumptions...</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.375rem' }}>Generating executive memorandum</div>
        </div>
      )}

      {memo && !generating && (
        <div className="memo-doc fade-in" style={{ marginTop: '1.25rem' }}>
          <div className="memo-doc-header">
            <div>
              <div style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.25rem' }}>Executive Memorandum</div>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>{form.prospectName || 'Transaction Review'} — {form.assetType}</div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <button className="btn-ghost" onClick={copyMemo} style={{ fontSize: '0.7rem' }}>Copy</button>
              <button className="btn-ghost" onClick={printMemo} style={{ fontSize: '0.7rem' }}>Export PDF</button>
              <span className="internal-tag">Internal Review Only</span>
            </div>
          </div>
          <div className="memo-doc-body">
            <pre style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {memo}
            </pre>
          </div>
        </div>
      )}

      <div className="disclaimer" style={{ marginTop: '1.5rem' }}>
        <strong style={{ color: 'var(--gold)' }}>For demonstration only.</strong>{' '}
        This platform supports workflow automation and document preparation. It does not provide tax, legal, accounting, investment, or financial advice.
        All strategies and calculations must be reviewed by qualified professionals. Demo data pre-loaded for illustrative purposes.
      </div>
    </div>
  );
}
