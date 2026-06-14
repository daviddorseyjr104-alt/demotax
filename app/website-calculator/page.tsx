'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

const STATES = [
  { name: 'California', rate: 13.3 },
  { name: 'New York', rate: 10.9 },
  { name: 'New Jersey', rate: 10.75 },
  { name: 'Oregon', rate: 9.9 },
  { name: 'Minnesota', rate: 9.85 },
  { name: 'Hawaii', rate: 7.25 },
  { name: 'Wisconsin', rate: 7.65 },
  { name: 'South Carolina', rate: 7.0 },
  { name: 'Maine', rate: 7.15 },
  { name: 'Georgia', rate: 5.75 },
  { name: 'North Carolina', rate: 4.75 },
  { name: 'Illinois', rate: 4.95 },
  { name: 'Massachusetts', rate: 5.0 },
  { name: 'Ohio', rate: 3.99 },
  { name: 'Michigan', rate: 4.25 },
  { name: 'Indiana', rate: 3.15 },
  { name: 'Pennsylvania', rate: 3.07 },
  { name: 'Colorado', rate: 4.4 },
  { name: 'Arizona', rate: 2.5 },
  { name: 'Texas', rate: 0 },
  { name: 'Florida', rate: 0 },
  { name: 'Nevada', rate: 0 },
  { name: 'Washington', rate: 7.0 },
  { name: 'Tennessee', rate: 0 },
  { name: 'Wyoming', rate: 0 },
];

const DEAL_TYPES = [
  { label: 'LLC (Partnership)', fedExtra: 0, note: '§751 hot asset analysis may increase ordinary income exposure.' },
  { label: 'LLC (S-Corp)', fedExtra: 0, note: 'S-Corp gain taxed at shareholder level. Built-in gains rules may apply.' },
  { label: 'Real Estate', fedExtra: 0.25, note: '§1250 unrecaptured depreciation taxed at max 25%. 1031 may defer gain + recapture.' },
  { label: 'C-Corporation', fedExtra: 0, note: 'C-Corp asset sale may trigger double taxation at the corporate and shareholder levels.' },
  { label: 'Securities / IP', fedExtra: 0, note: 'Long-term capital gain rates apply. Installment sale or structured deferral may apply.' },
];

type Form = {
  salePrice: string;
  basis: string;
  state: string;
  dealType: string;
  name: string;
};

const init: Form = { salePrice: '', basis: '', state: 'California', dealType: 'LLC (S-Corp)', name: '' };

export default function WebsiteCalculatorPage() {
  const [form, setForm] = useState<Form>(init);
  const [shown, setShown] = useState(false);
  const [requested, setRequested] = useState(false);

  const set = (k: keyof Form, v: string) => { setForm((f) => ({ ...f, [k]: v })); setShown(false); };

  const n = (v: string) => parseFloat(v.replace(/[^0-9.]/g, '')) || 0;
  const salePrice = n(form.salePrice) * 1_000_000;
  const basis = n(form.basis) * 1_000_000;
  const stateObj = STATES.find((s) => s.name === form.state) ?? STATES[0];
  const dealTypeObj = DEAL_TYPES.find((d) => d.label === form.dealType) ?? DEAL_TYPES[0];

  const fedRate = 0.238;
  const stateRate = stateObj.rate / 100;
  const grossGain = Math.max(0, salePrice - basis);
  const fedExposure = grossGain * fedRate;
  const stateExposure = grossGain * stateRate;
  const recaptureExtra = dealTypeObj.fedExtra > 0 ? grossGain * 0.15 * 0.25 : 0;
  const totalExposure = fedExposure + stateExposure + recaptureExtra;
  const deferrable = totalExposure * 0.75;
  const hasData = salePrice > 0 && grossGain > 0;

  const calculate = () => { if (hasData) setShown(true); };
  const requestAnalysis = async () => {
    setRequested(true);
    if (hasData && form.name) {
      localStorage.setItem('tsos-calc-prefill', JSON.stringify({
        prospectName: form.name,
        salePrice: String(salePrice),
        costBasis: String(basis),
        entityStructure: form.dealType === 'LLC (S-Corp)' ? 'S-Corporation'
          : form.dealType === 'C-Corporation' ? 'C-Corporation'
          : form.dealType === 'LLC (Partnership)' ? 'LLC (Multi-Member)'
          : 'LLC (Single Member)',
      }));
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('pipeline_leads').insert({
            user_id: user.id,
            name: form.name,
            category: 'Website Lead',
            tx_range: `$${form.salePrice}M`,
            deal_type: form.dealType,
            location: form.state,
            source: 'Website Calculator',
            status: 'New Lead',
            priority: 70,
            next_action: 'Follow up — requested full analysis',
            last_contact: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          });
        }
      } catch {}
      setTimeout(() => { window.location.href = '/deal-calculator'; }, 800);
    }
  };

  return (
    <div style={{ maxWidth: '860px' }}>
      <div style={{ marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.375rem' }}>
              <h1 className="section-title" style={{ fontSize: '1.375rem', margin: 0 }}>Banker Self-Service Calculator</h1>
              <span className="badge badge-green" style={{ fontSize: '0.55rem' }}>Live</span>
            </div>
            <p className="section-subtitle" style={{ maxWidth: '540px' }}>
              A simplified tax exposure estimator designed to be embedded on your website or shared directly with referring bankers and brokers. Clients enter 4 fields — you get a warm lead with pre-filled deal data.
            </p>
          </div>
          <span className="internal-tag">Embeddable Preview</span>
        </div>
      </div>

      {/* Embed info */}
      <div style={{ padding: '0.625rem 1rem', marginBottom: '1.25rem', borderRadius: '0.5rem', backgroundColor: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)', fontSize: '0.775rem', color: 'var(--blue)' }}>
        <strong>Embed-ready:</strong> Send this link to bankers or embed on your public website. When a prospect submits, they are routed to your full Deal Calculator with their figures pre-filled — and added to your pipeline automatically.
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Calculator input — designed to look like a public widget */}
        <div style={{ backgroundColor: '#0d1117', border: '1px solid rgba(201,168,76,0.25)', borderRadius: '0.875rem', padding: '1.5rem', boxShadow: '0 4px 24px rgba(0,0,0,0.4)' }}>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.375rem' }}>Tax Deferral Advisory</div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#f0e8d5' }}>Estimate Your Tax Exposure</div>
            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)', marginTop: '0.25rem' }}>Free · Confidential · Takes 30 seconds</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            <div>
              <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: '0.35rem' }}>
                Your Name
              </label>
              <input
                style={{ width: '100%', padding: '0.625rem 0.875rem', backgroundColor: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '0.5rem', color: '#f0e8d5', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }}
                placeholder="First and last name"
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: '0.35rem' }}>
                Estimated Sale Price ($M)
              </label>
              <input
                style={{ width: '100%', padding: '0.625rem 0.875rem', backgroundColor: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '0.5rem', color: '#f0e8d5', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }}
                placeholder="e.g. 75 (for $75M)"
                value={form.salePrice}
                onChange={(e) => set('salePrice', e.target.value)}
                type="number"
                min="0"
              />
            </div>

            <div>
              <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: '0.35rem' }}>
                Cost / Adjusted Basis ($M)
              </label>
              <input
                style={{ width: '100%', padding: '0.625rem 0.875rem', backgroundColor: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '0.5rem', color: '#f0e8d5', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }}
                placeholder="e.g. 8 (what you paid, adjusted)"
                value={form.basis}
                onChange={(e) => set('basis', e.target.value)}
                type="number"
                min="0"
              />
            </div>

            <div>
              <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: '0.35rem' }}>
                Transaction Type
              </label>
              <select
                style={{ width: '100%', padding: '0.625rem 0.875rem', backgroundColor: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '0.5rem', color: '#f0e8d5', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }}
                value={form.dealType}
                onChange={(e) => set('dealType', e.target.value)}
              >
                {DEAL_TYPES.map((d) => <option key={d.label} value={d.label} style={{ backgroundColor: '#0d1117' }}>{d.label}</option>)}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: '0.35rem' }}>
                State of Sale
              </label>
              <select
                style={{ width: '100%', padding: '0.625rem 0.875rem', backgroundColor: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '0.5rem', color: '#f0e8d5', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }}
                value={form.state}
                onChange={(e) => set('state', e.target.value)}
              >
                {STATES.map((s) => <option key={s.name} value={s.name} style={{ backgroundColor: '#0d1117' }}>{s.name}</option>)}
              </select>
            </div>

            <button
              style={{
                marginTop: '0.25rem',
                width: '100%',
                padding: '0.75rem',
                backgroundColor: hasData ? 'var(--gold)' : 'rgba(201,168,76,0.25)',
                color: hasData ? '#0a0f1c' : 'rgba(201,168,76,0.5)',
                border: 'none',
                borderRadius: '0.5rem',
                fontWeight: 700,
                fontSize: '0.875rem',
                cursor: hasData ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s',
              }}
              onClick={calculate}
              disabled={!hasData}
            >
              Estimate My Tax Exposure →
            </button>
          </div>

          <div style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.6375rem', color: 'rgba(255,255,255,0.3)', lineHeight: 1.6 }}>
            Estimates only. Not tax or legal advice. All figures require professional review.
          </div>
        </div>

        {/* Results */}
        <div>
          {!shown && !hasData && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '360px', color: 'var(--text-muted)', gap: '1rem', textAlign: 'center' }}>
              <div style={{ opacity: 0.2 }}>
                <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5" style={{ margin: '0 auto' }}>
                  <rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="12" y2="14"/>
                </svg>
              </div>
              <div style={{ fontSize: '0.875rem' }}>Enter sale price and basis to see<br />your estimated tax exposure</div>
              <div style={{ padding: '1rem 1.5rem', borderRadius: '0.625rem', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', maxWidth: '320px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gold)', marginBottom: '0.5rem' }}>What bankers do with this tool:</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                  {[
                    'Quick estimate during an initial call with a client',
                    'Share link with clients before engaging an advisor',
                    'Identify which deals warrant a tax advisory conversation',
                  ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                      <div style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: 'var(--gold)', marginTop: '7px', flexShrink: 0 }} />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {!shown && hasData && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '360px', color: 'var(--text-muted)', textAlign: 'center', gap: '0.75rem' }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5" style={{ opacity: 0.5 }}>
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              <div style={{ fontSize: '0.875rem' }}>Click <strong style={{ color: 'var(--text-secondary)' }}>Estimate My Tax Exposure</strong><br />to see your results</div>
            </div>
          )}

          {shown && hasData && (
            <div className="fade-in">
              <div className="card" style={{ marginBottom: '0.875rem' }}>
                <div style={{ fontSize: '0.6375rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '1rem' }}>
                  Estimated Tax Exposure — {form.dealType}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.875rem' }}>
                  {[
                    { label: 'Gross Gain', value: grossGain },
                    { label: 'Federal Cap Gains Tax', value: fedExposure },
                    { label: `${form.state} State Tax`, value: stateExposure },
                    { label: 'Net After-Tax Proceeds (est.)', value: Math.max(0, salePrice - totalExposure) },
                  ].map((item) => (
                    <div key={item.label} className="result-card">
                      <div style={{ fontSize: '0.6625rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.375rem' }}>{item.label}</div>
                      <div style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--text-primary)' }}>{fmt(item.value)}</div>
                    </div>
                  ))}
                </div>

                <div className="result-card highlight" style={{ marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.25rem' }}>Total Estimated Tax Exposure</div>
                      <div style={{ fontSize: '1.625rem', fontWeight: 800, color: 'var(--gold)' }}>{fmt(totalExposure)}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.25rem' }}>Est. Deferrable</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--success)' }}>{fmt(deferrable)}</div>
                      <div style={{ fontSize: '0.6625rem', color: 'var(--text-muted)', marginTop: '0.125rem' }}>≈ 75% of exposure</div>
                    </div>
                  </div>
                </div>

                {dealTypeObj.note && (
                  <div style={{ padding: '0.625rem 0.875rem', borderRadius: '0.375rem', backgroundColor: 'rgba(201,168,76,0.06)', border: '1px solid var(--gold-border)', fontSize: '0.775rem', color: 'var(--text-muted)', lineHeight: 1.55 }}>
                    <strong style={{ color: 'var(--gold)' }}>{form.dealType}:</strong> {dealTypeObj.note}
                  </div>
                )}
              </div>

              {/* CTA */}
              <div style={{ padding: '1.25rem', borderRadius: '0.75rem', backgroundColor: 'rgba(201,168,76,0.06)', border: '1px solid var(--gold-border)' }}>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.375rem' }}>
                  Ready for a full analysis?
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem', lineHeight: 1.55 }}>
                  This estimate is based on combined rates. A full review accounts for entity structure, depreciation, installment options, and current deferral mechanisms — and can dramatically change your planning options.
                </div>
                {!requested ? (
                  <div style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap' }}>
                    <button className="btn-gold" onClick={requestAnalysis} disabled={!form.name}>
                      Open Full Deal Calculator →
                    </button>
                    <button className="btn-secondary" onClick={() => window.location.href = '/client-intake'}>
                      Submit Intake Form
                    </button>
                  </div>
                ) : (
                  <div className="fade-in" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success)', fontSize: '0.875rem', fontWeight: 600 }}>
                    <div className="spinner" style={{ width: '14px', height: '14px', margin: 0 }} />
                    Loading your deal in the full calculator...
                  </div>
                )}
                {!form.name && (
                  <div style={{ fontSize: '0.7rem', color: 'var(--warning)', marginTop: '0.5rem' }}>Enter your name above to open the full calculator with your figures pre-filled.</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
