'use client';

import { useState, useMemo, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from '@/components/Toast';

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

const pct = (n: number) => `${(n * 100).toFixed(2)}%`;

const STRUCTURES = [
  {
    id: 'llc-partnership',
    label: 'LLC (Partnership)',
    basisLabel: 'Cost / Adjusted Basis ($)',
    recaptureLabel: 'Hot Assets / Ordinary Income ($)',
    recaptureNote:
      '§751 ordinary income on "hot assets" — inventory and unrealized receivables — is taxed as ordinary income, not capital gain. Must be analyzed separately from the capital gain portion of the sale.',
    summaryDesc: 'partnership interest (LLC taxed as partnership)',
    nextSteps: [
      'Confirm §751 hot asset analysis with CPA — ordinary income portion may differ significantly from capital gain',
      'Review partnership agreement for any transfer restrictions or consent requirements that affect timing',
      'Explore installment sale or structured deferral to manage gain recognition across tax years',
      'Generate the full proposal deck in PowerPoint Builder using these figures',
    ],
  },
  {
    id: 'llc-scorp',
    label: 'LLC (S-Corp)',
    basisLabel: 'Shareholder / Adjusted Basis ($)',
    recaptureLabel: 'Built-in Gains / Ordinary Income ($)',
    recaptureNote:
      'S-Corp gain is taxed at the shareholder level. If the entity converted from a C-Corp within the BIG recognition period, a corporate-level Built-in Gains tax may also apply. Confirm with CPA.',
    summaryDesc: 'LLC membership interest (taxed as S-Corporation)',
    nextSteps: [
      'Confirm S-Corp election status and any built-in gains recognition period with CPA',
      'Analyze shareholder basis and at-risk rules — affects after-tax proceeds per shareholder',
      'Review whether an asset vs. stock sale structure produces a better after-tax outcome',
      'Generate the full proposal deck in PowerPoint Builder using these figures',
    ],
  },
  {
    id: 'real-estate',
    label: 'Real Estate',
    basisLabel: 'Adjusted Basis (after depreciation) ($)',
    recaptureLabel: '§1250 Depreciation Recapture ($)',
    recaptureNote:
      'Unrecaptured §1250 depreciation is taxed at a maximum 25% federal rate — higher than the long-term capital gain rate. A 1031 exchange can defer both the gain and the recapture if properly structured.',
    summaryDesc: 'real property transaction',
    nextSteps: [
      'Request full depreciation schedules by asset class — §1250 recapture must be calculated precisely',
      'Evaluate 1031 exchange feasibility — the exchange period begins at closing with strict identification deadlines',
      'Identify replacement properties before closing to assess full gain deferral potential',
      'Generate the full proposal deck in PowerPoint Builder using these figures',
    ],
  },
  {
    id: 'c-corp',
    label: 'C-Corporation',
    basisLabel: 'Stock / Asset Book Basis ($)',
    recaptureLabel: 'Asset Sale Recapture / Ordinary Income ($)',
    recaptureNote:
      'C-Corp asset sales create double taxation: corporate-level gain followed by shareholder-level dividend or capital gain. Stock sales only tax the selling shareholders. Structure choice has a major impact on total exposure.',
    summaryDesc: 'C-Corporation transaction (stock or asset sale)',
    nextSteps: [
      'Model both asset sale and stock sale structures before presenting — buyer and seller interests often diverge',
      'Confirm corporate-level depreciation recapture and any accumulated earnings exposure with CPA',
      'If asset sale, identify allocation of purchase price across asset classes under §1060',
      'Generate the full proposal deck in PowerPoint Builder using these figures',
    ],
  },
  {
    id: 'securities',
    label: 'Securities / IP',
    basisLabel: 'Cost / Tax Basis ($)',
    recaptureLabel: 'Ordinary Income / Royalty Recapture ($)',
    recaptureNote:
      'QSBS (§1202) may exclude up to 100% of gain on qualified small business stock held more than 5 years, subject to issuer eligibility and per-taxpayer limits. Confirm holding period and issuer qualification with counsel.',
    summaryDesc: 'securities or intellectual property transaction',
    nextSteps: [
      'Confirm holding period — LTCG rates require >12 months; QSBS exclusion requires >5 years at original issuance',
      'Review §1202 QSBS eligibility — potentially the most significant exclusion available for startup founders',
      'Assess state tax treatment of securities gains — several states do not conform to QSBS exclusion',
      'Generate the full proposal deck in PowerPoint Builder using these figures',
    ],
  },
] as const;

type StructureId = (typeof STRUCTURES)[number]['id'];

type Form = {
  prospectName: string;
  structure: StructureId;
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
  structure: 'llc-partnership',
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

function printOnePager(form: Form, calc: ReturnType<typeof buildCalc>, structure: typeof STRUCTURES[number]) {
  if (!calc.salePrice) return;
  const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
  const pctStr = (n: number) => `${(n * 100).toFixed(1)}%`;
  const date = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const totalCombined = (parseFloat(form.fedCapGainsRate) + parseFloat(form.stateRate)).toFixed(1);
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${form.prospectName || 'Transaction'} — One-Page Summary</title>
<style>
  body{font-family:Georgia,serif;margin:0;padding:48px 60px;color:#111;max-width:720px;margin:0 auto}
  h1{font-size:11px;text-transform:uppercase;letter-spacing:3px;color:#999;margin:0 0 6px}
  h2{font-size:22px;font-weight:700;margin:0 0 4px;color:#0d1117}
  .sub{font-size:13px;color:#555;margin-bottom:28px}
  .grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:24px}
  .box{border:1px solid #e0e0e0;border-radius:6px;padding:14px 16px}
  .box-label{font-size:9px;text-transform:uppercase;letter-spacing:1.5px;color:#888;margin-bottom:4px}
  .box-value{font-size:18px;font-weight:700;color:#111}
  .highlight{border:2px solid #c9a84c;background:#fffbf0}
  .highlight .box-label{color:#b8860b}
  .highlight .box-value{color:#c9a84c;font-size:22px}
  .green .box-value{color:#1a7c3e}
  hr{border:none;border-top:1px solid #e0e0e0;margin:24px 0}
  .footer{font-size:10px;color:#999;line-height:1.6;margin-top:24px}
  .badge{display:inline-block;background:#0d1117;color:#c9a84c;font-size:9px;text-transform:uppercase;letter-spacing:1.5px;padding:3px 8px;border-radius:4px;margin-bottom:20px}
  @media print{body{padding:24px 36px}@page{margin:1cm}}
</style></head><body>
<div class="badge">Confidential — For Professional Review Only</div>
<h1>Tax Deferral Advisory — Transaction Summary</h1>
<h2>${form.prospectName || '[Client Name]'}</h2>
<div class="sub">${structure.label} · ${form.timeline || 'Timeline TBD'} · ${form.status} · Prepared ${date}</div>
<div class="grid">
  <div class="box"><div class="box-label">Gross Sale Price</div><div class="box-value">${fmt(calc.salePrice)}</div></div>
  <div class="box"><div class="box-label">Estimated Gross Gain</div><div class="box-value">${fmt(calc.grossGain)}</div></div>
  <div class="box"><div class="box-label">Est. Net Proceeds (after debt & costs)</div><div class="box-value">${fmt(calc.netProceeds)}</div></div>
  <div class="box"><div class="box-label">Combined Fed + State Cap Gains Rate</div><div class="box-value">${totalCombined}%</div></div>
  <div class="box highlight"><div class="box-label">Total Estimated Tax Exposure</div><div class="box-value">${fmt(calc.totalExposure)}</div></div>
  <div class="box green"><div class="box-label">Est. Deferrable Amount</div><div class="box-value">${fmt(calc.deferrable)}</div></div>
</div>
<div style="font-size:13px;line-height:1.75;color:#333">
  <strong>Effective tax rate on gross proceeds:</strong> ${pctStr(calc.effectiveRate)}<br>
  Without structured planning, the full tax exposure of ${fmt(calc.totalExposure)} would be due in the year of closing —
  reducing net liquidity significantly. A professional tax deferral review may identify whether a portion of this
  exposure can be restructured through recognized legal mechanisms.
</div>
<hr>
<div style="font-size:12px;color:#444;line-height:1.7">
  <strong>Suggested next step:</strong> 15-minute discovery call to review transaction documents, confirm cost basis,
  and assess available deferral options. No cost, no obligation.
</div>
<div class="footer">
  Prepared for internal use and professional review only. This document does not constitute tax, legal, accounting, investment, or financial advice.
  All figures are estimates based on inputs provided and must be reviewed by qualified professionals before any decisions are made.
  Transaction structure, entity type, and state of sale may materially affect actual tax obligations.
</div>
</body></html>`;
  const win = window.open('', '_blank', 'width=840,height=1060');
  if (win) { win.document.write(html); win.document.close(); win.focus(); setTimeout(() => win.print(), 400); }
}

function buildCalc(form: Form) {
  const n = (v: string) => parseFloat(v.replace(/,/g, '')) || 0;
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
}


export default function DealCalculatorPage() {
  const [form, setForm] = useState<Form>(initialForm);
  const [generated, setGenerated] = useState(false);
  const hubSpot = 'idle';
  const [dealSaved, setDealSaved] = useState(false);

  const set = (k: keyof Form, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    setGenerated(false);
    setDealSaved(false);
  };

  const handleGenerate = async () => {
    if (!hasData) return;
    setGenerated(true);
    setDealSaved(false);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('deals').insert({
          user_id: user.id,
          prospect_name: form.prospectName || 'Unknown Prospect',
          deal_type: form.structure,
          sale_price: calc.salePrice,
          cost_basis: n(form.costBasis),
          deferrable_amt: calc.deferrable,
          total_exposure: calc.totalExposure,
          structure: structure.label,
          status: form.status,
          notes: form.timeline ? `Expected close: ${form.timeline}` : undefined,
        });
        setDealSaved(true);
        toast('Deal saved to records');
        fetch('/api/hubspot/sync-deal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prospectName: form.prospectName,
            salePrice: calc.salePrice,
            totalExposure: calc.totalExposure,
            deferrable: calc.deferrable,
            structure: structure.label,
            status: form.status,
            timeline: form.timeline,
          }),
        }).catch(() => null);
      }
    } catch {
      toast('Summary generated — sign in to save to records', 'info');
    }
  };

  useEffect(() => {
    try {
      const raw = localStorage.getItem('tsos-calc-prefill');
      if (raw) {
        const data = JSON.parse(raw) as { prospectName?: string; salePrice?: string; costBasis?: string; debtPayoff?: string; entityStructure?: string };
        localStorage.removeItem('tsos-calc-prefill');
        const structureMap: Record<string, StructureId> = {
          'S-Corporation': 'llc-scorp',
          'LLC (Single Member)': 'llc-partnership',
          'LLC (Multi-Member)': 'llc-partnership',
          'Partnership': 'llc-partnership',
          'C-Corporation': 'c-corp',
        };
        const mappedStructure = data.entityStructure ? (structureMap[data.entityStructure] ?? 'llc-partnership') : undefined;
        setForm((f) => ({
          ...f,
          ...(data.prospectName ? { prospectName: data.prospectName } : {}),
          ...(data.salePrice ? { salePrice: data.salePrice } : {}),
          ...(data.costBasis ? { costBasis: data.costBasis } : {}),
          ...(data.debtPayoff ? { debtPayoff: data.debtPayoff } : {}),
          ...(mappedStructure ? { structure: mappedStructure } : {}),
        }));
      }
    } catch { /* ignore parse errors */ }
  }, []);

  const n = (v: string) => parseFloat(v.replace(/,/g, '')) || 0;

  const structure = STRUCTURES.find((s) => s.id === form.structure) ?? STRUCTURES[0];

  const calc = useMemo(() => buildCalc(form), [form]);

  const hasData = calc.salePrice > 0 && calc.grossGain > 0;

  const executiveSummary = useMemo(() => {
    if (!hasData || !form.prospectName) return null;
    const name = form.prospectName;
    const totalPct = `${(n(form.fedCapGainsRate) + n(form.stateRate)).toFixed(1)}%`;
    const recaptureLabel = structure.recaptureLabel.split(' ($')[0].toLowerCase();
    return `Based on the transaction parameters provided for ${name}'s ${structure.summaryDesc} (${fmt(calc.salePrice)} in gross proceeds), the estimated total tax exposure is ${fmt(calc.totalExposure)} — representing approximately ${pct(calc.effectiveRate)} of gross proceeds. The federal capital gains exposure of ${fmt(calc.fedExposure)}, combined with ${fmt(calc.stateExposure)} in state-level exposure and ${fmt(calc.recapture)} in estimated ${recaptureLabel}, presents a meaningful opportunity to evaluate structured tax deferral strategies. At a combined marginal rate of approximately ${totalPct}, an estimated ${fmt(calc.deferrable)} may be eligible for deferral through recognized mechanisms — subject to professional review and final transaction structure.`;
  }, [calc, form.prospectName, form.fedCapGainsRate, form.stateRate, structure, hasData]);

  return (
    <div style={{ maxWidth: '1100px' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 className="section-title" style={{ fontSize: '1.5rem' }}>Deal Calculator</h1>
        <p className="section-subtitle">
          Select the transaction structure, enter deal parameters, and generate an executive summary. Each structure reflects different calculation logic, recapture treatment, and planning considerations.
        </p>
      </div>

      <div className="disclaimer" style={{ marginBottom: '1.5rem' }}>
        <strong style={{ color: 'var(--gold)' }}>Important:</strong>{' '}
        Not tax, legal, accounting, or financial advice. All calculations are estimates and must be reviewed by qualified professionals.
      </div>

      {/* 5 Structure Tabs */}
      <div style={{ display: 'flex', marginBottom: '1rem', border: '1px solid var(--border)', borderRadius: '0.625rem', overflow: 'hidden', backgroundColor: 'var(--bg-input)' }}>
        {STRUCTURES.map((s, i) => (
          <button
            key={s.id}
            onClick={() => { setForm((f) => ({ ...f, structure: s.id })); setGenerated(false); }}
            style={{
              flex: 1,
              padding: '0.7rem 0.375rem',
              border: 'none',
              borderRight: i < STRUCTURES.length - 1 ? '1px solid var(--border)' : 'none',
              borderBottom: form.structure === s.id ? '2px solid var(--gold)' : '2px solid transparent',
              backgroundColor: form.structure === s.id ? 'rgba(201,168,76,0.08)' : 'transparent',
              color: form.structure === s.id ? 'var(--gold)' : 'var(--text-muted)',
              fontWeight: form.structure === s.id ? 700 : 500,
              fontSize: '0.7rem',
              cursor: 'pointer',
              lineHeight: 1.3,
              textAlign: 'center',
              transition: 'all 0.15s',
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Structure-specific callout */}
      <div style={{ marginBottom: '1.5rem', padding: '0.75rem 1rem', borderRadius: '0.5rem', backgroundColor: 'rgba(201,168,76,0.05)', border: '1px solid var(--gold-border)' }}>
        <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--gold)', marginRight: '0.5rem' }}>
          {structure.label}:
        </span>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          {structure.recaptureNote}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '420px 1fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Input form */}
        <div className="card">
          <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ color: 'var(--gold)' }}>01</span> Transaction Details
            <span className="badge badge-gold" style={{ marginLeft: 'auto', fontSize: '0.6rem', padding: '0.15rem 0.5rem' }}>{structure.label}</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label className="field-label">Prospect / Client Name</label>
              <input className="input-field" placeholder="e.g. Robert Chen" value={form.prospectName} onChange={(e) => set('prospectName', e.target.value)} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label className="field-label">Sale Price / Gross Proceeds ($)</label>
                <input className="input-field" placeholder="85,000,000" value={form.salePrice} onChange={(e) => set('salePrice', e.target.value)} />
              </div>
              <div>
                <label className="field-label">{structure.basisLabel}</label>
                <input className="input-field" placeholder="12,000,000" value={form.costBasis} onChange={(e) => set('costBasis', e.target.value)} />
              </div>
              <div>
                <label className="field-label">Debt Payoff / Encumbrances ($)</label>
                <input className="input-field" placeholder="25,000,000" value={form.debtPayoff} onChange={(e) => set('debtPayoff', e.target.value)} />
              </div>
              <div>
                <label className="field-label">Transaction Costs / Commissions ($)</label>
                <input className="input-field" placeholder="3,000,000" value={form.transactionCosts} onChange={(e) => set('transactionCosts', e.target.value)} />
              </div>
              <div>
                <label className="field-label">Federal Cap Gains Rate (%)</label>
                <input className="input-field" placeholder="23.8" value={form.fedCapGainsRate} onChange={(e) => set('fedCapGainsRate', e.target.value)} />
              </div>
              <div>
                <label className="field-label">State Income Tax Rate (%)</label>
                <input className="input-field" placeholder="13.3" value={form.stateRate} onChange={(e) => set('stateRate', e.target.value)} />
              </div>
            </div>

            <div>
              <label className="field-label">{structure.recaptureLabel}</label>
              <input
                className="input-field"
                placeholder={form.structure === 'real-estate' ? 'e.g. $3M depreciation × 25% = 750,000' : '4,500,000'}
                value={form.recapture}
                onChange={(e) => set('recapture', e.target.value)}
              />
              {form.structure === 'real-estate' && (
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  Enter the <em>tax</em> on recapture (accumulated depreciation × 25%), not the depreciation amount.
                </div>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label className="field-label">Expected Closing</label>
                <input className="input-field" placeholder="Q3 2025" value={form.timeline} onChange={(e) => set('timeline', e.target.value)} />
              </div>
              <div>
                <label className="field-label">Deal Status</label>
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
              onClick={handleGenerate}
              disabled={!hasData}
            >
              Generate Executive Summary
            </button>
          </div>
        </div>

        {/* Results */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="card">
            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: 'var(--gold)' }}>02</span> Calculation Results
              {!hasData && <span className="badge badge-gray" style={{ marginLeft: 'auto' }}>Enter values to calculate</span>}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              {[
                { label: 'Gross Gain', value: calc.grossGain },
                { label: 'Est. Net Proceeds', value: calc.netProceeds },
                { label: 'Federal Cap Gains Exposure', value: calc.fedExposure },
                { label: 'State Tax Exposure', value: calc.stateExposure },
                { label: structure.recaptureLabel.split(' ($')[0], value: calc.recapture },
                { label: 'Net After-Tax Proceeds (Est.)', value: calc.netAfterTax },
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
                    Est. Deferrable Amount
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
                  <strong>Effective rate on gross proceeds:</strong>{' '}
                  {pct(calc.effectiveRate)} · Status: <strong>{form.status}</strong>
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
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Auto-generated · {structure.label}</div>
              </div>
              {generated && executiveSummary && <span className="badge badge-gold">Generated</span>}
            </div>

            {generated && executiveSummary ? (
              <div>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0 }}>
                  {executiveSummary}
                </p>
                <div style={{ marginTop: '1.25rem', padding: '0.75rem', backgroundColor: 'var(--bg-card)', borderRadius: '0.5rem', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.5rem' }}>
                    Next Steps — {structure.label}
                  </div>
                  <ul style={{ margin: 0, padding: '0 0 0 1rem', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                    {structure.nextSteps.map((step, i) => (
                      <li key={i} style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{step}</li>
                    ))}
                  </ul>
                </div>
                <div style={{ marginTop: '1rem', display: 'flex', gap: '0.625rem', flexWrap: 'wrap' }}>
                  <button
                    className="btn-gold"
                    onClick={() => {
                      const sp = n(form.salePrice);
                      const txSize = sp >= 1_000_000 ? `$${(sp / 1_000_000).toFixed(0)}M` : form.salePrice;
                      localStorage.setItem('tsos-deck-prefill', JSON.stringify({
                        prospectName: form.prospectName,
                        structure: structure.label,
                        txSize,
                      }));
                      window.location.href = '/powerpoint-builder';
                    }}
                  >
                    Build PowerPoint from These Numbers →
                  </button>
                  <button
                    className="btn-secondary"
                    onClick={() => printOnePager(form, calc, structure)}
                    disabled={!form.prospectName}
                  >
                    Print Banker One-Pager
                  </button>
                  {dealSaved && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--success)' }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                      Saved to records
                    </div>
                  )}
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
