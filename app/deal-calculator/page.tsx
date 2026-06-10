'use client';

import { useState, useMemo } from 'react';

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

const pct = (n: number) => `${(n * 100).toFixed(2)}%`;

type Form = {
  prospectName: string;
  assetType: string;
  salePrice: string;
  costBasis: string;
  debtPayoff: string;
  transactionCosts: string;
  fedCapGainsRate: string;
  stateRate: string;
  recapture: string;
  timeline: string;
  status: string;
};

const initialForm: Form = {
  prospectName: '',
  assetType: 'Business Sale',
  salePrice: '',
  costBasis: '',
  debtPayoff: '',
  transactionCosts: '',
  fedCapGainsRate: '23.8',
  stateRate: '13.3',
  recapture: '',
  timeline: '',
  status: 'Early conversation',
};

export default function DealCalculatorPage() {
  const [form, setForm] = useState<Form>(initialForm);
  const [generated, setGenerated] = useState(false);

  const set = (k: keyof Form, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    setGenerated(false);
  };

  const n = (v: string) => parseFloat(v.replace(/,/g, '')) || 0;

  const calc = useMemo(() => {
    const salePrice = n(form.salePrice);
    const costBasis = n(form.costBasis);
    const debtPayoff = n(form.debtPayoff);
    const txCosts = n(form.transactionCosts);
    const fedRate = n(form.fedCapGainsRate) / 100;
    const stateRate = n(form.stateRate) / 100;
    const recapture = n(form.recapture);

    const grossGain = Math.max(0, salePrice - costBasis);
    const netProceeds = Math.max(0, salePrice - debtPayoff - txCosts);
    const fedExposure = grossGain * fedRate;
    const stateExposure = grossGain * stateRate;
    const totalExposure = fedExposure + stateExposure + recapture;
    const deferrable = totalExposure * 0.75;
    const netAfterTax = Math.max(0, netProceeds - totalExposure);
    const effectiveRate = salePrice > 0 ? totalExposure / salePrice : 0;

    return { salePrice, costBasis, grossGain, netProceeds, fedExposure, stateExposure, recapture, totalExposure, deferrable, netAfterTax, effectiveRate };
  }, [form]);

  const hasData = calc.salePrice > 0 && calc.grossGain > 0;

  const executiveSummary = useMemo(() => {
    if (!hasData || !form.prospectName) return null;
    const name = form.prospectName;
    const asset = form.assetType;
    const deferPct = form.fedCapGainsRate && form.stateRate
      ? `${(n(form.fedCapGainsRate) + n(form.stateRate)).toFixed(1)}%`
      : 'a significant portion';
    return `Based on the provided transaction assumptions for ${name}'s ${asset.toLowerCase()} transaction (${fmt(calc.salePrice)} sale price), the estimated total tax exposure is ${fmt(calc.totalExposure)} — representing approximately ${pct(calc.effectiveRate)} of gross proceeds. The estimated federal capital gains exposure of ${fmt(calc.fedExposure)}, combined with ${fmt(calc.stateExposure)} in state-level exposure and ${fmt(calc.recapture)} in potential recapture, presents a meaningful opportunity to explore structured deferral strategies. An estimated ${fmt(calc.deferrable)} may be eligible for deferral, subject to professional review and transaction structure. A structured tax deferral review may help evaluate whether a portion of this exposure could potentially be deferred through recognized legal mechanisms.`;
  }, [calc, form.prospectName, form.assetType, hasData]);

  return (
    <div style={{ maxWidth: '1100px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="section-title" style={{ fontSize: '1.5rem' }}>Deal Calculator Automation</h1>
        <p className="section-subtitle">
          Standardize and automate your Excel tax calculation workflow. Enter transaction details to generate an executive calculation summary.
        </p>
      </div>

      <div className="disclaimer" style={{ marginBottom: '1.75rem' }}>
        <strong style={{ color: 'var(--gold)' }}>For demonstration only.</strong>{' '}
        This tool estimates workflow outputs and is not tax, legal, accounting, or financial advice.
        Final calculations must be reviewed by qualified professionals.
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '420px 1fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Input form */}
        <div className="card">
          <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ color: 'var(--gold)' }}>01</span> Transaction Details
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label className="field-label">Prospect Name</label>
              <input className="input-field" placeholder="e.g. Robert Chen" value={form.prospectName} onChange={(e) => set('prospectName', e.target.value)} />
            </div>

            <div>
              <label className="field-label">Asset Type</label>
              <select className="input-field" value={form.assetType} onChange={(e) => set('assetType', e.target.value)}>
                {['Business Sale', 'Commercial Real Estate', 'Multifamily Portfolio', 'Industrial Property', 'Private Company Equity', 'Other'].map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label className="field-label">Sale Price ($)</label>
                <input className="input-field" placeholder="85,000,000" value={form.salePrice} onChange={(e) => set('salePrice', e.target.value)} />
              </div>
              <div>
                <label className="field-label">Cost Basis ($)</label>
                <input className="input-field" placeholder="12,000,000" value={form.costBasis} onChange={(e) => set('costBasis', e.target.value)} />
              </div>
              <div>
                <label className="field-label">Estimated Debt Payoff ($)</label>
                <input className="input-field" placeholder="25,000,000" value={form.debtPayoff} onChange={(e) => set('debtPayoff', e.target.value)} />
              </div>
              <div>
                <label className="field-label">Transaction Costs ($)</label>
                <input className="input-field" placeholder="3,000,000" value={form.transactionCosts} onChange={(e) => set('transactionCosts', e.target.value)} />
              </div>
              <div>
                <label className="field-label">Federal Cap Gains Rate (%)</label>
                <input className="input-field" placeholder="23.8" value={form.fedCapGainsRate} onChange={(e) => set('fedCapGainsRate', e.target.value)} />
              </div>
              <div>
                <label className="field-label">State Tax Rate (%)</label>
                <input className="input-field" placeholder="13.3" value={form.stateRate} onChange={(e) => set('stateRate', e.target.value)} />
              </div>
            </div>

            <div>
              <label className="field-label">Ordinary Income / Recapture Estimate ($)</label>
              <input className="input-field" placeholder="4,500,000" value={form.recapture} onChange={(e) => set('recapture', e.target.value)} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label className="field-label">Sale Timeline</label>
                <input className="input-field" placeholder="Q3 2025" value={form.timeline} onChange={(e) => set('timeline', e.target.value)} />
              </div>
              <div>
                <label className="field-label">Current Status</label>
                <select className="input-field" value={form.status} onChange={(e) => set('status', e.target.value)}>
                  {['Early conversation', 'LOI signed', 'Under contract', 'Closing soon'].map((v) => (
                    <option key={v}>{v}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              className="btn-gold"
              style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}
              onClick={() => setGenerated(true)}
              disabled={!hasData}
            >
              Generate Executive Summary
            </button>
          </div>
        </div>

        {/* Results */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Calculation cards */}
          <div className="card">
            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: 'var(--gold)' }}>02</span> Calculation Results
              {!hasData && <span className="badge badge-gray" style={{ marginLeft: 'auto' }}>Enter values to calculate</span>}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              {[
                { label: 'Gross Gain', value: calc.grossGain, muted: false },
                { label: 'Net Proceeds (Est.)', value: calc.netProceeds, muted: false },
                { label: 'Federal Cap Gains Exposure', value: calc.fedExposure, muted: false },
                { label: 'State Tax Exposure', value: calc.stateExposure, muted: false },
                { label: 'Recapture Exposure', value: calc.recapture, muted: false },
                { label: 'Net After-Tax Proceeds (Est.)', value: calc.netAfterTax, muted: true },
              ].map((item) => (
                <div key={item.label} className="result-card">
                  <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.375rem' }}>
                    {item.label}
                  </div>
                  <div style={{ fontSize: '1.125rem', fontWeight: 700, color: hasData ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                    {hasData ? fmt(item.value) : '—'}
                  </div>
                </div>
              ))}
            </div>

            {/* Total exposure highlight */}
            <div className="result-card highlight" style={{ marginTop: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.375rem' }}>
                    Total Estimated Tax Exposure
                  </div>
                  <div style={{ fontSize: '1.625rem', fontWeight: 800, color: 'var(--gold)' }}>
                    {hasData ? fmt(calc.totalExposure) : '—'}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.375rem' }}>
                    Simple Est. Deferrable Amount
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--success)' }}>
                    {hasData ? fmt(calc.deferrable) : '—'}
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>≈ 75% of total exposure</div>
                </div>
              </div>
            </div>

            {hasData && (
              <div style={{ marginTop: '0.75rem', padding: '0.75rem 1rem', borderRadius: '0.5rem', backgroundColor: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--blue)' }}>
                  <strong>Effective tax rate on gross proceeds:</strong>{' '}
                  {pct(calc.effectiveRate)} — Status: <strong>{form.status}</strong>
                  {form.timeline && ` · Expected close: ${form.timeline}`}
                </div>
              </div>
            )}
          </div>

          {/* Executive Summary */}
          <div className="output-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>Executive Calculation Summary</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Auto-generated from transaction inputs</div>
              </div>
              {generated && executiveSummary && (
                <span className="badge badge-gold">Generated</span>
              )}
            </div>

            {generated && executiveSummary ? (
              <div>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0 }}>
                  {executiveSummary}
                </p>
                <div style={{ marginTop: '1.25rem', padding: '0.75rem', backgroundColor: 'var(--bg-card)', borderRadius: '0.5rem', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.5rem' }}>
                    Suggested Next Steps
                  </div>
                  <ul style={{ margin: 0, padding: '0 0 0 1rem', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                    {[
                      'Schedule discovery call to gather entity structure and advisor context',
                      'Confirm cost basis and depreciation schedules with CPA',
                      'Explore deferral strategies — QOZ, installment sale, charitable structures',
                      'Generate full proposal deck outline in Proposal Generator',
                    ].map((step, i) => (
                      <li key={i} style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{step}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                {!hasData
                  ? 'Enter transaction details to generate the executive summary.'
                  : 'Click "Generate Executive Summary" to produce the output.'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
