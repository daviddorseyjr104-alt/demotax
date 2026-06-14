'use client';

import { useState } from 'react';

const CURRENT_FLOW = [
  { label: '15-min Zoom Call', sub: 'Capture 6–7 key data points' },
  { label: 'Manual Notes', sub: 'Transcribed by hand after call' },
  { label: 'Open Right Excel', sub: 'One of 5 different model files' },
  { label: 'Build PPT Manually', sub: 'Format deck from scratch each time' },
  { label: 'Write One-Pager', sub: 'Email to banker — often delayed' },
  { label: 'HubSpot Update', sub: 'Manual CRM entry, sometimes skipped' },
  { label: 'Start Over', sub: 'Next client, repeat every step' },
];

const TARGET_FLOW = [
  { label: 'Zoom Transcript', sub: 'Auto-captured from call recording' },
  { label: 'AI Extracts 6–7 Fields', sub: 'No manual re-entry' },
  { label: 'Asset Calculator', sub: 'Right model pre-filled automatically' },
  { label: 'PPT Deck Generated', sub: 'Structure-specific outline, instant' },
  { label: 'Banker One-Pager', sub: 'Print-ready PDF in one click' },
  { label: 'HubSpot Auto-Log', sub: 'Notes + task pushed to CRM' },
  { label: 'Move to Next Deal', sub: '40 open cases, always current' },
];

const phases = [
  {
    phase: 'Phase 1',
    label: 'Foundation',
    timeline: 'Weeks 1–3',
    status: 'complete',
    items: [
      { task: 'Client intake form with readiness scoring', done: true },
      { task: 'AI deal review with tax exposure calculator', done: true },
      { task: 'Executive brief generator (memo-format output)', done: true },
      { task: 'Meeting notes → action item + email automation', done: true },
      { task: 'Referral pipeline with priority scoring', done: true },
    ],
    outcome: 'Core workflows digitized. Every prospect interaction produces a structured output rather than a scattered doc.',
  },
  {
    phase: 'Phase 2',
    label: 'Scale',
    timeline: 'Weeks 4–6',
    status: 'complete',
    items: [
      { task: 'Excel model import + structured data extraction', done: true },
      { task: 'PowerPoint deck outline generator (8-slide)', done: true },
      { task: 'Marketing studio — multi-audience outreach system', done: true },
      { task: 'Workflow audit dashboard with automation status', done: true },
      { task: 'CRM task auto-generation from meeting notes', done: true },
    ],
    outcome: 'Output quality becomes consistent. Referral partners receive the same professional experience regardless of the deal.',
  },
  {
    phase: 'Phase 3',
    label: 'Intelligence',
    timeline: 'Weeks 7–12',
    status: 'complete',
    items: [
      { task: 'Zoom transcript upload — recording → auto-extract → pre-fill calculator', done: true },
      { task: 'HubSpot API sync — deal data and meeting notes push to CRM contacts automatically', done: true },
      { task: '40-case pipeline view with deal stage tracking', done: true },
      { task: 'Referral attribution — track who referred whom, pipeline by deal structure', done: true },
      { task: 'Interactive website calculator for banker self-service', done: true },
    ],
    outcome: 'The Zoom → Calculator → PPT → One-Pager flow is fully automatic. HubSpot stays current without manual entry. Bankers self-serve a tax exposure estimate on your website — and their data pre-fills your Deal Calculator.',
  },
];

const wins = [
  { metric: '< 1 hr', label: 'Presentation prep per deal (was 6 hrs)', color: 'var(--gold)' },
  { metric: '< 2 min', label: 'Post-call follow-up package from rough notes', color: 'var(--success)' },
  { metric: '5 types', label: 'Deal structures, each with its own calculator + deck', color: 'var(--blue)' },
  { metric: '40 cases', label: 'Open pipeline, managed without a spreadsheet', color: 'var(--warning)' },
];

const comparison = [
  { step: 'Post-Call', before: '15-min call → manual notes → open right Excel → build PPT → write one-pager → email banker (4–6 hours total)', after: 'Zoom transcript → AI extracts fields → calculator auto-fills → PPT generated → banker one-pager printed (under 1 hour total)' },
  { step: 'Intake', before: 'Unstructured phone call, missing data gaps discovered later when re-entering into Excel', after: 'Structured form captures all 7 fields, scores deal readiness, flows directly to Deal Calculator with entity type pre-selected' },
  { step: '5 Structures', before: '5 separate Excel files + 5 separate PPT templates, manually matched to each deal type', after: 'Select structure tab → correct calculator logic + recapture treatment + deck outline — all generated from one flow' },
  { step: 'Banker Brief', before: 'Written manually after the call, often delayed or abbreviated under time pressure', after: 'Print Banker One-Pager button — formatted one-page summary with all key figures, ready to send in seconds' },
  { step: 'Follow-Up', before: 'Action items remembered mentally, follow-up emails drafted from scratch, CRM updated manually later', after: 'Rough call notes → clean summary, 6 action items, follow-up email draft, CRM task — all in under 2 minutes' },
  { step: 'Pipeline', before: '40 open cases tracked across HubSpot, memory, and email — unclear which need attention today', after: 'Priority-scored pipeline with next-action labels, deal stage, and last-contact date — searchable and filterable' },
  { step: 'HubSpot Sync', before: 'HubSpot runs the drip/marketing separately; platform outputs (memos, summaries) exist only in email and files', after: 'Deal Calculator and Meeting Notes push to HubSpot via Private App API — contacts found or created, deal records attached, notes and tasks logged automatically' },
];

export default function AutomationRoadmapPage() {
  const [activePhase, setActivePhase] = useState<number | null>(null);

  return (
    <div style={{ maxWidth: '1200px' }}>
      <div style={{ marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h1 className="section-title" style={{ fontSize: '1.375rem' }}>Automation Roadmap</h1>
            <p className="section-subtitle" style={{ maxWidth: '580px' }}>
              Full AI operations platform for a high-volume tax strategy practice. All three phases delivered — from intake through HubSpot CRM sync.
            </p>
          </div>
          <span className="internal-tag">Internal Review Only</span>
        </div>
      </div>

      {/* Win metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.875rem', marginBottom: '1.5rem' }}>
        {wins.map((w) => (
          <div key={w.label} className="card-sm" style={{ borderLeft: `3px solid ${w.color}` }}>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: w.color, marginBottom: '0.25rem' }}>{w.metric}</div>
            <div className="stat-label" style={{ lineHeight: 1.45 }}>{w.label}</div>
          </div>
        ))}
      </div>

      {/* Before → After flow */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '1.25rem' }}>
          Current vs. Target State
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '1.5rem', alignItems: 'start' }}>
          {/* Current */}
          <div>
            <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--red)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--red)' }} />
              Current — Manual
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {CURRENT_FLOW.map((step, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
                  <div className="flow-step manual">
                    <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>{step.label}</div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '0.125rem' }}>{step.sub}</div>
                  </div>
                  {i < CURRENT_FLOW.length - 1 && (
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1, padding: '0.2rem 0' }}>↓</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Center arrow */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '2.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.375rem' }}>
              <div style={{ fontSize: '1.625rem', color: 'var(--gold)', lineHeight: 1 }}>→</div>
              <div style={{ fontSize: '0.55rem', fontWeight: 700, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'center' }}>Platform<br />Upgrade</div>
            </div>
          </div>

          {/* Target */}
          <div>
            <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--success)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--success)' }} />
              Target State — Automated
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {TARGET_FLOW.map((step, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
                  <div className="flow-step auto">
                    <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>{step.label}</div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '0.125rem' }}>{step.sub}</div>
                  </div>
                  {i < TARGET_FLOW.length - 1 && (
                    <div style={{ textAlign: 'center', color: 'var(--success)', fontSize: '0.9rem', lineHeight: 1, padding: '0.2rem 0', opacity: 0.55 }}>↓</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Step comparison table */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Step-by-Step Comparison</div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ minWidth: '90px' }}>Step</th>
                <th style={{ color: 'var(--red)', minWidth: '220px' }}>Current (Manual)</th>
                <th style={{ color: 'var(--success)', minWidth: '280px' }}>Target (Automated)</th>
              </tr>
            </thead>
            <tbody>
              {comparison.map((row) => (
                <tr key={row.step}>
                  <td style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.8rem' }}>{row.step}</td>
                  <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.55 }}>{row.before}</td>
                  <td style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>{row.after}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Phase cards — expandable */}
      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '1rem' }}>
        Implementation Phases
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', marginBottom: '1.5rem' }}>
        {phases.map((p, i) => {
          const isExpanded = activePhase === i;
          const done = p.items.filter((x) => x.done).length;
          const pct = Math.round((done / p.items.length) * 100);
          const accentColor = p.status === 'complete' ? 'var(--success)' : p.status === 'active' ? 'var(--gold)' : 'var(--border)';

          return (
            <div key={i} className="card" style={{ borderLeft: `3px solid ${accentColor}`, cursor: 'pointer' }} onClick={() => setActivePhase(isExpanded ? null : i)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                {/* Status icon */}
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0, border: `2px solid ${accentColor}`, backgroundColor: p.status === 'complete' ? 'rgba(52,211,153,0.12)' : p.status === 'active' ? 'var(--gold-bg)' : 'var(--bg-input)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {p.status === 'complete'
                    ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                    : <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: accentColor }} />}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.125rem' }}>
                    <span style={{ fontSize: '0.6375rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{p.phase}</span>
                    <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' }}>{p.label}</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.timeline}</div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                  <div style={{ minWidth: '120px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                      <span style={{ fontSize: '0.6375rem', color: 'var(--text-muted)' }}>Progress</span>
                      <span style={{ fontSize: '0.6375rem', fontWeight: 700, color: pct === 100 ? 'var(--success)' : 'var(--gold)' }}>{done}/{p.items.length}</span>
                    </div>
                    <div style={{ height: '4px', backgroundColor: 'var(--bg-input)', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, backgroundColor: pct === 100 ? 'var(--success)' : 'var(--gold)', borderRadius: '2px' }} />
                    </div>
                  </div>
                  <span className={`badge ${p.status === 'complete' ? 'badge-green' : p.status === 'active' ? 'badge-gold' : 'badge-gray'}`} style={{ fontSize: '0.6rem', whiteSpace: 'nowrap' }}>
                    {p.status === 'complete' ? 'Complete' : p.status === 'active' ? 'In Progress' : 'Upcoming'}
                  </span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" style={{ transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease', flexShrink: 0 }}>
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
              </div>

              {isExpanded && (
                <div className="fade-in" style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <div style={{ fontSize: '0.6375rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.75rem' }}>Deliverables</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {p.items.map((item, j) => (
                          <div key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                            <div style={{ width: '16px', height: '16px', borderRadius: '50%', flexShrink: 0, marginTop: '0.125rem', border: `1.5px solid ${item.done ? 'var(--success)' : 'var(--border)'}`, backgroundColor: item.done ? 'rgba(52,211,153,0.12)' : 'var(--bg-input)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              {item.done && <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>}
                            </div>
                            <span style={{ fontSize: '0.8rem', color: item.done ? 'var(--text-primary)' : 'var(--text-muted)', lineHeight: 1.55 }}>{item.task}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div style={{ padding: '1rem', backgroundColor: 'var(--bg-input)', borderRadius: '0.5rem', border: '1px solid var(--border)' }}>
                      <div style={{ fontSize: '0.6375rem', fontWeight: 700, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.625rem' }}>Phase Outcome</div>
                      <div style={{ fontSize: '0.8375rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>{p.outcome}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Closing context */}
      <div className="card">
        <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <div style={{ flex: 1, minWidth: '280px' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.625rem' }}>The Core Shift</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem', lineHeight: 1.5 }}>
              From "using Claude manually" to running a professional AI operations platform.
            </div>
            <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)', lineHeight: 1.7 }}>
              The tools were already there. This platform wraps them in structured workflows — consistent inputs, repeatable outputs, zero rework. Every client gets the same quality experience. Every referral partner receives the same professional follow-through.
            </div>
          </div>
          <div style={{ padding: '1rem', backgroundColor: 'var(--gold-bg)', border: '1px solid var(--gold-border)', borderRadius: '0.625rem', minWidth: '220px' }}>
            <div style={{ fontSize: '0.6375rem', fontWeight: 700, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.625rem' }}>Platform Status</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              {[
                { label: 'Phase 1', status: 'Complete', color: 'var(--success)' },
                { label: 'Phase 2', status: 'In Progress', color: 'var(--gold)' },
                { label: 'Phase 3', status: 'Complete', color: 'var(--success)' },
              ].map((row) => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <span>{row.label}</span><span style={{ fontWeight: 700, color: row.color }}>{row.status}</span>
                </div>
              ))}
              <div style={{ height: '1px', backgroundColor: 'var(--gold-border)', margin: '0.375rem 0' }} />
              <div style={{ fontSize: '0.6625rem', color: 'var(--text-muted)' }}>Internal estimates — subject to review</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
