'use client';

import { useState } from 'react';
import { logActivity } from '../../lib/activity';

type Form = {
  name: string; email: string; phone: string; referralSource: string;
  prospectType: string; assetType: string; salePrice: string; basis: string;
  debtPayoff: string; saleDate: string; entityStructure: string; advisors: string;
  concern: string; loiSigned: string; liquidityGoal: string; notes: string;
};

const init: Form = {
  name: '', email: '', phone: '', referralSource: '',
  prospectType: '', assetType: '', salePrice: '', basis: '',
  debtPayoff: '', saleDate: '', entityStructure: '', advisors: '',
  concern: '', loiSigned: 'No', liquidityGoal: '', notes: '',
};

type IntakeOutput = {
  summary: string;
  missingInfo: string[];
  readinessScore: { label: string; value: number; color: string };
  nextStep: string;
  internalNote: string;
};

function buildOutput(f: Form): IntakeOutput {
  const name = f.name || '[Name not provided]';
  const asset = f.assetType || 'unspecified asset';
  const price = f.salePrice ? `$${f.salePrice}` : 'undisclosed';
  const date = f.saleDate || 'undisclosed';
  const entity = f.entityStructure || 'undisclosed';
  const concern = f.concern || 'general tax planning';
  const advisors = f.advisors || 'none listed';
  const dateStr = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  const summary = `${name} has submitted an intake for a ${asset} transaction with an estimated sale price of ${price}. Expected closing: ${date}. Entity structure: ${entity}. Primary concern: ${concern.toLowerCase()}. LOI signed: ${f.loiSigned}. Current advisors: ${advisors}. Referral source: ${f.referralSource || 'not specified'}. ${f.notes ? `Additional notes: ${f.notes}` : ''}`;

  const missingInfo: string[] = [];
  if (!f.name) missingInfo.push('Full legal name');
  if (!f.email) missingInfo.push('Email address');
  if (!f.phone) missingInfo.push('Phone number');
  if (!f.assetType) missingInfo.push('Asset type');
  if (!f.salePrice) missingInfo.push('Estimated sale price');
  if (!f.basis) missingInfo.push('Estimated cost / adjusted basis');
  if (!f.saleDate) missingInfo.push('Expected sale / closing date');
  if (!f.entityStructure) missingInfo.push('Entity structure');
  if (!f.advisors) missingInfo.push('Current advisor names and roles');
  if (!f.concern) missingInfo.push('Primary concern / goal');
  if (!f.liquidityGoal) missingInfo.push('Desired liquidity outcome');

  const keyFields = [f.salePrice, f.basis, f.saleDate, f.entityStructure, f.advisors, f.concern];
  const filled = keyFields.filter(Boolean).length;
  let readinessScore: IntakeOutput['readinessScore'];
  if (filled >= 5) {
    readinessScore = { label: 'High', value: 85 + Math.floor(Math.random() * 10), color: 'var(--success)' };
  } else if (filled >= 3) {
    readinessScore = { label: 'Medium', value: 55 + filled * 5, color: 'var(--warning)' };
  } else {
    readinessScore = { label: 'Low', value: 20 + filled * 8, color: 'var(--red)' };
  }

  const nextStep = filled >= 5
    ? `Schedule a 30-minute discovery call with ${name} to review deferral strategy options and coordinate with their existing advisory team. Deal is ready for AI Deal Review.`
    : filled >= 3
    ? `Send ${name} a structured follow-up questionnaire to capture missing details, then schedule a discovery call within the next 5 business days.`
    : `Request a 15-minute pre-intake call to gather basic transaction parameters before scheduling a full discovery session. Do not schedule until key fields are completed.`;

  const internalNote = `INTAKE — ${dateStr} — ${name} | Asset: ${asset} | Est. Price: ${price} | Basis: ${f.basis ? `$${f.basis}` : 'Unknown'} | Timeline: ${date} | Entity: ${entity} | LOI: ${f.loiSigned} | Concern: ${concern} | Advisors: ${advisors} | Source: ${f.referralSource || 'N/A'} | Readiness: ${readinessScore.label} (${readinessScore.value}) | Action: ${missingInfo.length > 3 ? 'Gather missing info first' : 'Schedule discovery call'}`;

  return { summary, missingInfo, readinessScore, nextStep, internalNote };
}

export default function ClientIntakePage() {
  const [form, setForm] = useState<Form>(init);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<IntakeOutput | null>(null);
  const [copied, setCopied] = useState(false);

  const set = (k: keyof Form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = () => {
    const built = buildOutput(form);
    setResult(built);
    setSubmitted(true);
    logActivity(`Client intake processed — ${form.name || 'New prospect'}, ${form.assetType}${form.salePrice ? ' ($' + form.salePrice + ')' : ''}`, 'var(--success)');
  };

  const reset = () => { setForm(init); setSubmitted(false); setResult(null); };

  const copyNote = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.internalNote).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); });
  };

  const readinessWidth = result ? `${result.readinessScore.value}%` : '0%';

  return (
    <div style={{ maxWidth: '1150px' }}>
      <div style={{ marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h1 className="section-title" style={{ fontSize: '1.375rem' }}>Client Intake Automation</h1>
            <p className="section-subtitle" style={{ maxWidth: '560px' }}>
              Capture structured transaction information before the first advisory call. Auto-generates a summary, gap checklist, deal readiness score, and internal CRM note.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {submitted && <span className="badge badge-green">Intake Submitted</span>}
            <span className="internal-tag">Internal Review Only</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '460px 1fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Form */}
        <div className="card">
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '1.125rem' }}>Prospect Intake Form</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div><label className="field-label">Full Name *</label><input className="input-field" placeholder="Robert Chen" value={form.name} onChange={(e) => set('name', e.target.value)} disabled={submitted} /></div>
              <div><label className="field-label">Email *</label><input className="input-field" type="email" placeholder="rchen@example.com" value={form.email} onChange={(e) => set('email', e.target.value)} disabled={submitted} /></div>
              <div><label className="field-label">Phone</label><input className="input-field" placeholder="(310) 555-0100" value={form.phone} onChange={(e) => set('phone', e.target.value)} disabled={submitted} /></div>
              <div><label className="field-label">Referral Source</label><input className="input-field" placeholder="CPA referral, LinkedIn..." value={form.referralSource} onChange={(e) => set('referralSource', e.target.value)} disabled={submitted} /></div>
            </div>

            <hr className="divider" style={{ margin: '0' }} />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label className="field-label">Prospect Type</label>
                <select className="input-field" value={form.prospectType} onChange={(e) => set('prospectType', e.target.value)} disabled={submitted}>
                  <option value="">Select...</option>
                  {['Business Owner', 'Real Estate Owner', 'PE Partner', 'IB Referral', 'Broker Referral', 'Family Office'].map((v) => <option key={v}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="field-label">Asset Type *</label>
                <select className="input-field" value={form.assetType} onChange={(e) => set('assetType', e.target.value)} disabled={submitted}>
                  <option value="">Select...</option>
                  {['Business Sale', 'Commercial Real Estate', 'Multifamily Portfolio', 'Industrial Property', 'Private Company Equity', 'Land Sale', 'Other'].map((v) => <option key={v}>{v}</option>)}
                </select>
              </div>
              <div><label className="field-label">Est. Sale Price ($) *</label><input className="input-field" placeholder="92,000,000" value={form.salePrice} onChange={(e) => set('salePrice', e.target.value)} disabled={submitted} /></div>
              <div><label className="field-label">Est. Cost Basis ($)</label><input className="input-field" placeholder="14,000,000" value={form.basis} onChange={(e) => set('basis', e.target.value)} disabled={submitted} /></div>
              <div><label className="field-label">Debt Payoff ($)</label><input className="input-field" placeholder="18,000,000" value={form.debtPayoff} onChange={(e) => set('debtPayoff', e.target.value)} disabled={submitted} /></div>
              <div><label className="field-label">Expected Sale Date *</label><input className="input-field" placeholder="Q4 2025" value={form.saleDate} onChange={(e) => set('saleDate', e.target.value)} disabled={submitted} /></div>
              <div>
                <label className="field-label">Entity Structure *</label>
                <select className="input-field" value={form.entityStructure} onChange={(e) => set('entityStructure', e.target.value)} disabled={submitted}>
                  <option value="">Select...</option>
                  {['Individual', 'LLC (Single Member)', 'LLC (Multi-Member)', 'S-Corporation', 'C-Corporation', 'Partnership', 'Trust', 'Other'].map((v) => <option key={v}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="field-label">LOI Signed?</label>
                <select className="input-field" value={form.loiSigned} onChange={(e) => set('loiSigned', e.target.value)} disabled={submitted}>
                  {['No', 'Yes', 'In negotiation', 'Under contract', 'Closing soon'].map((v) => <option key={v}>{v}</option>)}
                </select>
              </div>
            </div>

            <div><label className="field-label">Current Advisors Involved *</label><input className="input-field" placeholder="e.g. David Park CPA, Smith & Reed Law, Merrill Lynch" value={form.advisors} onChange={(e) => set('advisors', e.target.value)} disabled={submitted} /></div>
            <div>
              <label className="field-label">Primary Concern / Goal</label>
              <select className="input-field" value={form.concern} onChange={(e) => set('concern', e.target.value)} disabled={submitted}>
                <option value="">Select...</option>
                {['Minimize tax bill', 'Preserve liquidity', 'Estate planning', 'Business exit planning', 'Real estate portfolio sale', 'Understand options', 'Referral partner education'].map((v) => <option key={v}>{v}</option>)}
              </select>
            </div>
            <div><label className="field-label">Desired Liquidity Outcome</label><input className="input-field" placeholder="e.g. reinvest, retire, distribute to family..." value={form.liquidityGoal} onChange={(e) => set('liquidityGoal', e.target.value)} disabled={submitted} /></div>
            <div><label className="field-label">Additional Notes</label><textarea className="input-field" style={{ minHeight: '64px', resize: 'vertical' }} placeholder="Any additional context..." value={form.notes} onChange={(e) => set('notes', e.target.value)} disabled={submitted} /></div>

            {/* Upload placeholder */}
            <div>
              <label className="field-label">Supporting Documents</label>
              <div style={{ border: '2px dashed var(--border)', borderRadius: '0.5rem', padding: '1rem', textAlign: 'center', opacity: submitted ? 0.4 : 0.7 }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <span style={{ color: 'var(--gold)', fontWeight: 600 }}>Upload documents</span> — Purchase agreements, tax returns, basis schedules
                  <br /><span style={{ fontSize: '0.6875rem' }}>PDF, XLSX, DOCX · Demo only — no files processed</span>
                </div>
              </div>
            </div>

            {!submitted
              ? <button className="btn-gold" style={{ width: '100%', justifyContent: 'center' }} onClick={handleSubmit}>Submit Intake &amp; Generate Summary</button>
              : <button className="btn-outline" style={{ width: '100%', justifyContent: 'center' }} onClick={reset}>Reset Form</button>
            }
          </div>
        </div>

        {/* Output */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {result ? (
            <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Summary */}
              <div className="output-panel">
                <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>Intake Summary</div>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0 }}>{result.summary}</p>
              </div>

              {/* Readiness score */}
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Deal Readiness Score</div>
                  <div style={{ fontSize: '1.375rem', fontWeight: 800, color: result.readinessScore.color }}>
                    {result.readinessScore.value} <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>/ 100 · {result.readinessScore.label}</span>
                  </div>
                </div>
                <div style={{ height: '8px', backgroundColor: 'var(--bg-input)', borderRadius: '999px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: '999px', backgroundColor: result.readinessScore.color, width: readinessWidth, transition: 'width 0.8s ease' }} />
                </div>
                <div style={{ marginTop: '0.5rem', fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                  {result.readinessScore.label === 'High' ? 'Ready to schedule discovery call — key fields are complete.' : result.readinessScore.label === 'Medium' ? 'Gather missing fields before scheduling discovery call.' : 'Significant information gaps — conduct pre-intake call first.'}
                </div>
              </div>

              {/* Missing info */}
              <div className="card" style={{ borderColor: result.missingInfo.length === 0 ? 'rgba(34,197,94,0.25)' : 'var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.875rem' }}>
                  <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: result.missingInfo.length === 0 ? 'var(--success)' : 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Missing Information</div>
                  <span className={`badge ${result.missingInfo.length === 0 ? 'badge-green' : 'badge-warning'}`}>
                    {result.missingInfo.length === 0 ? 'Complete' : `${result.missingInfo.length} fields missing`}
                  </span>
                </div>
                {result.missingInfo.length === 0
                  ? <div style={{ fontSize: '0.875rem', color: 'var(--success)' }}>All key fields captured. Ready to schedule discovery call.</div>
                  : <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
                      {result.missingInfo.map((item, i) => (
                        <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          <div style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: 'var(--warning)', flexShrink: 0 }} />
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{item}</span>
                        </div>
                      ))}
                    </div>
                }
              </div>

              {/* Next step */}
              <div style={{ padding: '1.125rem', backgroundColor: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '0.625rem' }}>
                <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--blue)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>Recommended Next Step</div>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>{result.nextStep}</p>
              </div>

              {/* Internal note */}
              <div className="output-panel">
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.08em', flex: 1 }}>Internal CRM Note</div>
                  <button className="btn-ghost" onClick={copyNote}>
                    {copied
                      ? <><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>Copied</>
                      : <><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>Copy</>
                    }
                  </button>
                </div>
                <div style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '0.7375rem', color: 'var(--text-muted)', lineHeight: 1.7, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {result.internalNote}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap' }}>
                <a href="/ai-deal-review" style={{ textDecoration: 'none' }}><button className="btn-gold">Run AI Deal Review →</button></a>
                <a href="/executive-briefs" style={{ textDecoration: 'none' }}><button className="btn-secondary">Generate Executive Brief</button></a>
                <a href="/meeting-notes" style={{ textDecoration: 'none' }}><button className="btn-secondary">Add Meeting Notes</button></a>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '0.75rem' }}>
              <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                <div style={{ marginBottom: '1rem', opacity: 0.25 }}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5" style={{ margin: '0 auto' }}>
                    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/>
                  </svg>
                </div>
                <div style={{ fontSize: '0.875rem' }}>Complete the intake form and click<br /><strong style={{ color: 'var(--text-secondary)' }}>Submit Intake & Generate Summary</strong></div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="disclaimer" style={{ marginTop: '1.5rem' }}>
        <strong style={{ color: 'var(--gold)' }}>For demonstration only.</strong>{' '}
        This intake system is a workflow automation tool. It does not provide tax, legal, accounting, investment, or financial advice. All information collected must be reviewed by qualified professionals.
      </div>
    </div>
  );
}
