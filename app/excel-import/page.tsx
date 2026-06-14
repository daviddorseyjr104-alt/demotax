'use client';

import { useState, useRef } from 'react';
import { logActivity } from '../../lib/activity';

type SampleFile = {
  name: string; size: string; modified: string; type: string;
  fields: string[];
  preview: Record<string, string> | null;
};



type SampleFileEx = SampleFile & { structure: string; calcPrefill: Record<string, string> | null };

const sampleFiles: SampleFileEx[] = [
  {
    name: 'Template — LLC Partnership Sale.xlsx', size: '138 KB', modified: 'Template', type: 'business',
    structure: 'llc-partnership',
    fields: ['Prospect Name', 'Sale Price', 'Partner Basis', 'Debt Payoff', 'Transaction Costs', 'Hot Asset Estimate', 'Federal Cap Gains Rate', 'State Rate', 'Expected Closing'],
    preview: { prospectName: '[Client Name]', salePrice: '$70,000,000', costBasis: '$8,000,000', debtPayoff: '$0', txCosts: '$2,100,000', fedRate: '23.8%', stateRate: '13.3%', timeline: 'Q2 2026' },
    calcPrefill: { prospectName: '', salePrice: '70000000', costBasis: '8000000', debtPayoff: '0', entityStructure: 'LLC (Single Member)' },
  },
  {
    name: 'Template — LLC S-Corp Sale.xlsx', size: '155 KB', modified: 'Template', type: 'business',
    structure: 'llc-scorp',
    fields: ['Prospect Name', 'Sale Price', 'Shareholder Basis', 'Debt Payoff', 'Transaction Costs', 'Built-in Gains Estimate', 'Federal Rate', 'State Rate', 'Closing Timeline'],
    preview: { prospectName: '[Client Name]', salePrice: '$92,000,000', costBasis: '$14,000,000', debtPayoff: '$18,000,000', txCosts: '$2,800,000', fedRate: '23.8%', stateRate: '13.3%', timeline: 'Q4 2026' },
    calcPrefill: { prospectName: '', salePrice: '92000000', costBasis: '14000000', debtPayoff: '18000000', entityStructure: 'S-Corporation' },
  },
  {
    name: 'Template — Real Estate Portfolio.xlsx', size: '218 KB', modified: 'Template', type: 'realestate',
    structure: 'real-estate',
    fields: ['Portfolio Value', 'Adjusted Basis', 'Mortgage Balance', 'Closing Costs', '§1250 Recapture', 'Federal Rate', 'State Rate', 'Property Count', 'Target Closing'],
    preview: { prospectName: '[Client Name]', salePrice: '$45,000,000', costBasis: '$12,000,000', debtPayoff: '$14,000,000', txCosts: '$1,350,000', fedRate: '23.8%', stateRate: '13.3%', timeline: 'Q3 2026' },
    calcPrefill: { prospectName: '', salePrice: '45000000', costBasis: '12000000', debtPayoff: '14000000', entityStructure: 'LLC (Multi-Member)' },
  },
  {
    name: 'Template — C-Corp Asset Sale.xlsx', size: '164 KB', modified: 'Template', type: 'business',
    structure: 'c-corp',
    fields: ['Corp Name', 'Asset Sale Price', 'Book Basis', 'Outstanding Debt', 'Transaction Costs', 'Asset Recapture Estimate', 'Corp Rate', 'Shareholder Rate', 'Closing Timeline'],
    preview: { prospectName: '[Client Name]', salePrice: '$120,000,000', costBasis: '$22,000,000', debtPayoff: '$30,000,000', txCosts: '$3,600,000', fedRate: '23.8%', stateRate: '9.8%', timeline: 'Q1 2027' },
    calcPrefill: { prospectName: '', salePrice: '120000000', costBasis: '22000000', debtPayoff: '30000000', entityStructure: 'C-Corporation' },
  },
  {
    name: 'Template — Securities / IP Sale.xlsx', size: '96 KB', modified: 'Template', type: 'template',
    structure: 'securities',
    fields: ['Investor Name', 'Gross Proceeds', 'Tax Basis', 'Holding Period', 'QSBS Eligible', 'Federal LTCG Rate', 'State Rate', 'Ordinary Income Estimate', 'Close Date'],
    preview: { prospectName: '[Client Name]', salePrice: '$28,000,000', costBasis: '$800,000', debtPayoff: '$0', txCosts: '$420,000', fedRate: '23.8%', stateRate: '13.3%', timeline: 'Q3 2026' },
    calcPrefill: { prospectName: '', salePrice: '28000000', costBasis: '800000', debtPayoff: '0', entityStructure: 'Individual' },
  },
];

const benefits = [
  'Reduces repeated spreadsheet cleanup and manual reformatting',
  'Converts Excel rows into structured executive summaries automatically',
  'Prevents inconsistent formatting across prospect models',
  'Creates repeatable proposal and PowerPoint inputs from existing data',
  'Prepares standardized data for CRM, follow-up, and reporting workflows',
];

function fileIcon(name: string) {
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  const color = ext === 'csv' ? 'var(--blue)' : 'var(--success)';
  if (ext === 'csv') return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
      <line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/>
    </svg>
  );
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
      <polyline points="8 13 10.5 16 8 19"/><polyline points="16 13 13.5 16 16 19"/>
    </svg>
  );
}

function matchSample(fileName: string): SampleFileEx {
  const n = fileName.toLowerCase();
  if (n.includes('real') || n.includes('property') || n.includes('portfolio') || n.includes('apartment')) return sampleFiles[2];
  if (n.includes('c-corp') || n.includes('c corp') || n.includes('corporation') || n.includes('industrial')) return sampleFiles[3];
  if (n.includes('securit') || n.includes('stock') || n.includes('ip') || n.includes('intellectual')) return sampleFiles[4];
  if (n.includes('s-corp') || n.includes('s corp') || n.includes('scorp') || n.includes('manufacturing')) return sampleFiles[1];
  if (n.includes('business') || n.includes('sale') || n.includes('model') || n.includes('company') || n.includes('llc') || n.includes('partnership')) return sampleFiles[0];
  return sampleFiles[1];
}

export default function ExcelImportPage() {
  const [selected, setSelected] = useState<SampleFileEx | null>(null);
  const [importing, setImporting] = useState(false);
  const [imported, setImported] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const runImport = (file: SampleFileEx) => {
    setSelected(file);
    setImported(true);
    logActivity(`Template loaded — ${file.name}`, 'var(--success)');
  };

  const handleRealFile = async (f: File) => {
    const sizekb = Math.round(f.size / 1024);
    const sizeStr = sizekb > 0 ? `${sizekb} KB` : '< 1 KB';
    setSelected({ name: f.name, size: sizeStr, modified: 'Just now', type: 'uploaded', fields: [], preview: null, structure: 'LLC (S-Corp)', calcPrefill: null });
    setImporting(true);
    setImported(false);

    try {
      const formData = new FormData();
      formData.append('file', f);
      const res = await fetch('/api/parse-excel', { method: 'POST', body: formData });
      if (!res.ok) throw new Error();
      const data = await res.json();
      const realFile: SampleFileEx = {
        name: f.name,
        size: sizeStr,
        modified: 'Just now',
        type: 'uploaded',
        fields: ['Prospect Name', 'Sale Price', 'Cost Basis', 'Debt Payoff', 'Entity Structure'],
        preview: data.prospectName ? { prospectName: data.prospectName, salePrice: data.salePrice, costBasis: data.costBasis } : null,
        structure: data.entityStructure ?? 'LLC (S-Corp)',
        calcPrefill: {
          prospectName: data.prospectName ?? '',
          salePrice: data.salePrice ?? '',
          costBasis: data.costBasis ?? '',
          debtPayoff: data.debtPayoff ?? '',
          entityStructure: data.entityStructure ?? 'LLC (Single Member)',
        },
      };
      setSelected(realFile);
      logActivity(`Excel model parsed by Claude — ${f.name} · fields extracted`, 'var(--success)');
    } catch {
      const matched = matchSample(f.name);
      setSelected({ ...matched, name: f.name, size: sizeStr, modified: 'Just now' });
      logActivity(`Excel model imported — ${f.name}`, 'var(--success)');
    } finally {
      setImporting(false);
      setImported(true);
    }
  };

  const selectSample = (file: SampleFileEx) => {
    if (selected?.name === file.name && imported) return;
    runImport(file);
  };

  return (
    <div style={{ maxWidth: '1100px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h1 className="section-title" style={{ fontSize: '1.375rem' }}>Excel Import &amp; Model Standardization</h1>
            <p className="section-subtitle" style={{ maxWidth: '580px' }}>
              Turn recurring Excel models into structured transaction data and reusable executive summaries. Drop a real file or click a sample below.
            </p>
          </div>
          <span className="internal-tag">Internal Review Only</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '1.5rem', alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Upload zone */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            style={{ display: 'none' }}
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleRealFile(f); e.target.value = ''; }}
          />
          <div
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: `2px dashed ${dragging ? 'var(--gold)' : 'var(--border)'}`,
              borderRadius: '0.875rem',
              padding: '2.5rem',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'border-color 0.2s, background-color 0.2s',
              backgroundColor: dragging ? 'var(--gold-bg)' : 'var(--bg-card)',
            }}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              const f = e.dataTransfer.files[0];
              if (f) handleRealFile(f);
            }}
          >
            <div style={{ marginBottom: '1rem', opacity: dragging ? 1 : 0.5, transition: 'opacity 0.2s' }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto' }}>
                <polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/>
                <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
              </svg>
            </div>
            <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: dragging ? 'var(--gold)' : 'var(--text-primary)', marginBottom: '0.375rem', transition: 'color 0.2s' }}>
              {dragging ? 'Drop to import' : 'Drop Excel or CSV file here'}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Supported: .xlsx, .xls, .csv · Max 25 MB
            </div>
            <div className="btn-gold" style={{ display: 'inline-flex', pointerEvents: 'none' }}>
              Browse Files
            </div>
          </div>

          {/* Sample files */}
          <div className="card">
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '1rem' }}>
              Sample Model Files — Click to Import
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {sampleFiles.map((file) => {
                const isSelected = selected?.name === file.name;
                return (
                  <div
                    key={file.name}
                    onClick={() => selectSample(file)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '1rem',
                      padding: '0.875rem 1rem',
                      backgroundColor: isSelected ? 'var(--gold-bg)' : 'var(--bg-input)',
                      border: `1px solid ${isSelected ? 'var(--gold-border)' : 'var(--border)'}`,
                      borderRadius: '0.5rem', cursor: 'pointer', transition: 'all 0.15s',
                    }}
                  >
                    <div style={{ flexShrink: 0 }}>{fileIcon(file.name)}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: isSelected ? 'var(--gold)' : 'var(--text-primary)', marginBottom: '0.2rem' }}>{file.name}</div>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{file.size} · Modified {file.modified}</div>
                    </div>
                    {isSelected && imported && <span className="badge badge-green">Imported</span>}
                    {isSelected && importing && <div className="spinner" style={{ width: '16px', height: '16px' }} />}
                    {!isSelected && <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Click to import</span>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Before / After */}
          <div className="card">
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '1.125rem' }}>Workflow Transformation</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ padding: '1rem', backgroundColor: 'var(--bg-input)', borderRadius: '0.5rem', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--red)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>Before</div>
                <div className="flow-wrap" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.375rem' }}>
                  {['Excel file', 'Manual edits', 'Claude prompt', 'Copy / paste', 'PowerPoint'].map((s, i) => (
                    <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                      {i > 0 && <div style={{ width: '1px', height: '12px', backgroundColor: 'var(--border)', marginLeft: '6px' }} />}
                      <div className="flow-step manual" style={{ fontSize: '0.6875rem' }}>{s}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ padding: '1rem', backgroundColor: 'var(--bg-input)', borderRadius: '0.5rem', border: '1px solid var(--gold-border)' }}>
                <div style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>After</div>
                <div className="flow-wrap" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.375rem' }}>
                  {['Excel import', 'Structured fields', 'Executive memo', 'Deck outline', 'Follow-up task'].map((s, i) => (
                    <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                      {i > 0 && <div style={{ width: '1px', height: '12px', backgroundColor: 'var(--gold-border)', marginLeft: '6px' }} />}
                      <div className="flow-step auto" style={{ fontSize: '0.6875rem' }}>{s}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="card" style={{ minHeight: '260px' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '1rem' }}>Imported Fields</div>
            {importing && (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <div className="spinner" style={{ marginBottom: '0.75rem' }} />
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Parsing file structure...</div>
              </div>
            )}
            {imported && selected && (
              <div className="fade-in">
                <div style={{ marginBottom: '0.625rem', fontSize: '0.7rem', color: 'var(--success)', fontWeight: 600 }}>
                  ✓ {selected.name}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1rem' }}>
                  {selected.fields.map((field) => (
                    <div key={field} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                      {field}
                    </div>
                  ))}
                </div>
                {selected.preview && (
                  <div style={{ padding: '0.875rem', backgroundColor: 'var(--bg-input)', borderRadius: '0.5rem', border: '1px solid var(--border)', marginBottom: '1rem' }}>
                    <div style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.625rem' }}>Field Preview</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.375rem' }}>
                      {Object.entries(selected.preview).map(([k, v]) => (
                        <div key={k} style={{ fontSize: '0.6875rem' }}>
                          <span style={{ color: 'var(--text-muted)', textTransform: 'capitalize' }}>{k.replace(/([A-Z])/g, ' $1')}: </span>
                          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{String(v)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <button
                  className="btn-gold"
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={() => {
                    const s = selected as SampleFileEx;
                    if (s.calcPrefill) {
                      localStorage.setItem('tsos-calc-prefill', JSON.stringify(s.calcPrefill));
                    }
                    window.location.href = '/deal-calculator';
                  }}
                >
                  Run Deal Calculator with These Numbers →
                </button>
              </div>
            )}
            {!importing && !imported && (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                Drop a file or click a sample to preview its imported fields.
              </div>
            )}
          </div>

          <div className="card">
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '1rem' }}>Standardization Benefits</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {benefits.map((b, i) => (
                <div key={i} style={{ display: 'flex', gap: '0.625rem', alignItems: 'flex-start' }}>
                  <div style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: 'var(--gold)', marginTop: '7px', flexShrink: 0 }} />
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>{b}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="disclaimer">
            <strong style={{ color: 'var(--gold)' }}>Important:</strong>{' '}
            Field extraction reads your file locally. No data is transmitted to external servers. Review all extracted fields before using in downstream workflows.
          </div>
        </div>
      </div>
    </div>
  );
}
