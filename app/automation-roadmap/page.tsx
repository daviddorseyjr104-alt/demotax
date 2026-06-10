'use client';

import { useState } from 'react';

const CURRENT_FLOW = [
  { label: 'Excel Model', sub: 'Manual build, version chaos' },
  { label: 'Claude.ai', sub: 'Manual prompting, ad hoc' },
  { label: 'Copy / Paste', sub: 'Into Word, PowerPoint, email' },
  { label: 'PowerPoint', sub: 'Manual formatting each deck' },
  { label: 'Email', sub: 'One-off, no template system' },
  { label: 'Manual Follow-Up', sub: 'Remembered or forgotten' },
  { label: 'Start Over', sub: 'Next client, repeat from scratch' },
];

const TARGET_FLOW = [
  { label: 'Structured Intake', sub: 'Standardized deal capture form' },
  { label: 'AI Deal Review', sub: 'Instant tax exposure analysis' },
  { label: 'Executive Brief', sub: 'Auto-generated memo document' },
  { label: 'Deck Outline', sub: '8-slide PowerPoint scaffold' },
  { label: 'Outreach Suite', sub: 'Email + LinkedIn + call script' },
  { label: 'CRM Task', sub: 'Follow-up auto-logged from notes' },
  { label: 'Reporting', sub: 'Pipeline view, activity log' },
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
    status: 'active',
    items: [
      { task: 'Excel model import + structured data extraction', done: true },
      { task: 'PowerPoint deck outline generator (8-slide)', done: true },
      { task: 'Marketing studio — multi-audience outreach system', done: true },
      { task: 'Workflow audit dashboard with automation status', done: true },
      { task: 'CRM task auto-generation from meeting notes', done: false },
    ],
    outcome: 'Output quality becomes consistent. Referral partners receive the same professional experience regardless of the deal.',
  },
  {
    phase: 'Phase 3',
    label: 'Intelligence',
    timeline: 'Weeks 7–12',
    status: 'upcoming',
    items: [
      { task: 'CRM integration (HubSpot or Salesforce)', done: false },
      { task: 'Automated referral partner follow-up sequences', done: false },
      { task: 'Deal stage tracking and pipeline analytics', done: false },
      { task: 'Branded client portal (read-only deal view)', done: false },
      { task: 'Webinar registration + follow-up automation', done: false },
    ],
    outcome: 'The platform runs proactively. Follow-ups happen on schedule. Pipeline visibility is real-time. The team focuses entirely on relationships.',
  },
];

const wins = [
  { metric: '30–60 hrs', label: 'Per week recovered from manual tasks', color: 'var(--gold)' },
  { metric: '< 5 min', label: 'To generate a full executive brief', color: 'var(--success)' },
  { metric: '8 slides', label: 'PowerPoint outline from a form fill', color: 'var(--blue)' },
  { metric: '5 assets', label: 'Generated per marketing campaign click', color: 'var(--warning)' },
];

const comparison = [
  { step: 'Intake', before: 'Phone call → notes in email', after: 'Structured form → readiness score → deal review link' },
  { step: 'Tax Analysis', before: 'Manual Excel + Claude prompting separately', after: 'Unified deal review with live calculations and memo output' },
  { step: 'Executive Brief', before: '2–4 hours of manual drafting per brief', after: 'Form inputs → structured 5-section memo in 90 seconds' },
  { step: 'Decks', before: 'Start from scratch each time in PowerPoint', after: '8-slide outline with speaker notes generated instantly' },
  { step: 'Outreach', before: 'One-off email per partner, no system', after: 'Audience-specific email + LinkedIn + call script in one click' },
  { step: 'Follow-Up', before: 'Remembered manually or dropped', after: 'Meeting notes auto-generate CRM task + follow-up email' },
  { step: 'Pipeline', before: 'Spreadsheet + memory', after: 'Searchable, filterable referral pipeline with priority scores' },
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
              From manual Claude-assisted work to a repeatable AI operations platform. Three phases of structured automation for a high-volume tax strategy practice.
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
                { label: 'Phase 3', status: 'Upcoming', color: 'var(--text-muted)' },
              ].map((row) => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <span>{row.label}</span><span style={{ fontWeight: 700, color: row.color }}>{row.status}</span>
                </div>
              ))}
              <div style={{ height: '1px', backgroundColor: 'var(--gold-border)', margin: '0.375rem 0' }} />
              <div style={{ fontSize: '0.6625rem', color: 'var(--text-muted)' }}>Demonstration environment — not production</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
