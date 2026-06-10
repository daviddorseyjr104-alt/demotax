'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getActivity, getStat, type ActivityEntry } from '../lib/activity';

const BASE_STATS = [
  { label: 'Active Transactions', value: 14, statKey: '', sub: '4 closing this quarter', color: 'var(--gold)', fmt: (n: number) => String(n) },
  { label: 'Tax Exposure Reviewed', value: 318.4, statKey: '', sub: 'Estimated aggregate', color: 'var(--purple)', fmt: (n: number) => `$${n.toFixed(1)}M` },
  { label: 'Est. Transaction Value', value: 1.74, statKey: '', sub: 'Across active pipeline', color: 'var(--gold)', fmt: (n: number) => `$${n.toFixed(2)}B` },
  { label: 'Referral Partners', value: 63, statKey: '', sub: '18 active introducers', color: 'var(--blue)', fmt: (n: number) => String(n) },
  { label: 'Executive Briefs Generated', value: 37, statKey: 'briefs', sub: 'Last 90 days', color: 'var(--success)', fmt: (n: number) => String(n) },
  { label: 'Follow-Ups Due', value: 21, statKey: '', sub: '6 overdue', color: 'var(--warning)', fmt: (n: number) => String(n) },
  { label: 'Est. Hours Saved', value: 142, statKey: 'memos', sub: 'Via workflow automation', color: 'var(--success)', fmt: (n: number, memos: number) => String(n + memos * 7) },
  { label: 'Proposals Drafted', value: 19, statKey: 'decks', sub: '8 pending response', color: 'var(--blue)', fmt: (n: number) => String(n) },
];

const priorities = [
  { title: 'Follow up with Westbridge Realty Advisors', status: 'Due Today', statusColor: 'var(--red)', action: 'Send Executive Brief', href: '/executive-briefs', note: 'Sarah Kaplan — $40M–$120M portfolio' },
  { title: 'Prepare proposal outline for Oak Capital', status: 'High Priority', statusColor: 'var(--warning)', action: 'Generate PowerPoint', href: '/powerpoint-builder', note: 'PE Partner — $185M business sale' },
  { title: 'Review $92M business sale intake', status: 'New Intake', statusColor: 'var(--blue)', action: 'Run AI Deal Review', href: '/ai-deal-review', note: 'Robert Chen — Chen Manufacturing Group' },
  { title: 'Send educational email to IB list', status: 'Marketing', statusColor: 'var(--purple)', action: 'Draft Campaign', href: '/marketing-studio', note: 'Investment banker audience — 14 contacts' },
];

const SEED_ACTIVITY: ActivityEntry[] = [
  { dot: 'var(--gold)', text: 'Executive brief generated for Robert Chen transaction ($92M manufacturing)', ts: Date.now() - 120000 },
  { dot: 'var(--purple)', text: 'Referral email drafted for PE partner audience — 8 recipients', ts: Date.now() - 3600000 },
  { dot: 'var(--success)', text: 'Excel model standardized for Nguyen Properties business sale workflow', ts: Date.now() - 7200000 },
  { dot: 'var(--blue)', text: 'Follow-up task created for Beverly Hills broker — Westbridge Realty', ts: Date.now() - 14400000 },
  { dot: 'var(--gold)', text: 'Client intake summarized for $120M real estate portfolio — L. Bennett', ts: Date.now() - 28800000 },
];

const manualFlow = ['Excel', 'Claude Prompt', 'Manual Edits', 'PowerPoint', 'Email', 'Follow-Up Notes'];
const autoFlow = ['Intake Form', 'AI Deal Review', 'Executive Brief', 'PowerPoint Outline', 'Referral Email', 'CRM Follow-Up'];

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}

export default function CEODashboard() {
  const [activity, setActivity] = useState<ActivityEntry[]>(SEED_ACTIVITY);
  const [memoCount, setMemoCount] = useState(0);
  const [deckCount, setDeckCount] = useState(0);

  useEffect(() => {
    const real = getActivity();
    setActivity(real.length > 0 ? [...real, ...SEED_ACTIVITY].slice(0, 8) : SEED_ACTIVITY);
    setMemoCount(parseInt(localStorage.getItem('tsos-stat-memos') ?? '0'));
    setDeckCount(parseInt(localStorage.getItem('tsos-stat-decks') ?? '0'));
  }, []);

  return (
    <div style={{ maxWidth: '1200px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: '0.5rem' }}>CEO Dashboard</h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', maxWidth: '600px', lineHeight: 1.6 }}>Real-time overview of transaction activity, referral relationships, and automation impact.</p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
            <span className="internal-tag">Internal Review Only</span>
            <span className="internal-tag">Last updated today</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.875rem', marginBottom: '1.75rem' }}>
        {BASE_STATS.map((s) => {
          const extra = s.statKey === 'memos' ? memoCount : s.statKey === 'decks' ? deckCount : s.statKey === 'briefs' ? memoCount : 0;
          const displayed = s.fmt(s.value + extra, memoCount);
          return (
            <div key={s.label} className="card-sm" style={{ borderLeft: `3px solid ${s.color}` }}>
              <div className="stat-label" style={{ marginBottom: '0.5rem' }}>{s.label}</div>
              <div className="stat-value" style={{ fontSize: '1.625rem', color: s.color }}>{displayed}</div>
              <div style={{ fontSize: '0.6625rem', color: 'var(--text-muted)', marginTop: '0.375rem' }}>{s.sub}</div>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
        {/* Priority Actions */}
        <div className="card">
          <div style={{ marginBottom: '1.125rem' }}>
            <div className="section-title" style={{ fontSize: '1rem' }}>Today&apos;s Priority Actions</div>
            <div className="section-subtitle">Highest-impact tasks for today</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {priorities.map((p, i) => (
              <div key={i} style={{ padding: '0.875rem 1rem', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>{p.title}</span>
                    <span style={{ fontSize: '0.6rem', fontWeight: 700, color: p.statusColor, background: `${p.statusColor}15`, border: `1px solid ${p.statusColor}30`, borderRadius: '999px', padding: '0.15rem 0.5rem', whiteSpace: 'nowrap' }}>{p.status}</span>
                  </div>
                  <div style={{ fontSize: '0.7125rem', color: 'var(--text-muted)' }}>{p.note}</div>
                </div>
                <Link href={p.href} style={{ textDecoration: 'none', flexShrink: 0 }}>
                  <button className="btn-gold" style={{ padding: '0.4rem 0.875rem', fontSize: '0.6875rem', whiteSpace: 'nowrap' }}>{p.action}</button>
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Feed */}
        <div className="card">
          <div style={{ marginBottom: '1.125rem' }}>
            <div className="section-title" style={{ fontSize: '1rem' }}>Recent Automation Activity</div>
            <div className="section-subtitle">Platform-generated actions and outputs — updates as you use the platform</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {activity.slice(0, 7).map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: '0.875rem', alignItems: 'flex-start', padding: '0.75rem 0', borderBottom: i < Math.min(activity.length, 7) - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                <div style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: item.dot, marginTop: '5px', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>{item.text}</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.125rem' }}>{timeAgo(item.ts)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Before / After */}
      <div className="card" style={{ marginBottom: '1.25rem' }}>
        <div style={{ marginBottom: '1.25rem' }}>
          <div className="section-title" style={{ fontSize: '1rem' }}>Manual Work Converted Into Automation</div>
          <div className="section-subtitle">From ad hoc Claude usage to a repeatable operations platform</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
          <div style={{ padding: '1.125rem', backgroundColor: 'var(--bg-input)', borderRadius: '0.625rem', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '0.6375rem', fontWeight: 700, color: 'var(--red)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--red)', display: 'inline-block' }} />Current: Manual Process
            </div>
            <div className="flow-wrap">
              {manualFlow.map((step, i) => (
                <div key={step} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <div className="flow-step manual">{step}</div>
                  {i < manualFlow.length - 1 && <span className="flow-arrow">›</span>}
                </div>
              ))}
            </div>
            <div style={{ marginTop: '0.875rem', fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.55 }}>Each step requires manual effort, copy-pasting, and context-switching between Claude and your documents.</div>
          </div>
          <div style={{ padding: '1.125rem', backgroundColor: 'var(--bg-input)', borderRadius: '0.625rem', border: '1px solid var(--gold-border)' }}>
            <div style={{ fontSize: '0.6375rem', fontWeight: 700, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--success)', display: 'inline-block' }} />Automated: Operations Platform
            </div>
            <div className="flow-wrap">
              {autoFlow.map((step, i) => (
                <div key={step} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <div className="flow-step auto">{step}</div>
                  {i < autoFlow.length - 1 && <span className="flow-arrow" style={{ color: 'var(--gold)' }}>›</span>}
                </div>
              ))}
            </div>
            <div style={{ marginTop: '0.875rem', fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.55 }}>Structured inputs flow into consistent, professional outputs. Every step is repeatable and takes minutes, not hours.</div>
          </div>
        </div>
        <div style={{ marginTop: '1.25rem', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
          {[
            { label: 'Proposal Creation', before: '4–6 hours', after: '< 30 minutes' },
            { label: 'Referral Outreach', before: 'Hours per campaign', after: 'Minutes per audience' },
            { label: 'Transaction Intake', before: 'Email back-and-forth', after: 'One structured form' },
          ].map((item) => (
            <div key={item.label} style={{ padding: '0.875rem', backgroundColor: 'var(--bg-card)', borderRadius: '0.5rem', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.6625rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.5rem' }}>{item.label}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--red)', textDecoration: 'line-through', opacity: 0.7 }}>{item.before}</span>
                <span style={{ fontSize: '0.625rem', color: 'var(--success)' }}>→</span>
                <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--success)' }}>{item.after}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick links */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'AI Deal Review', desc: 'Run transaction analysis', href: '/ai-deal-review' },
          { label: 'Executive Brief', desc: 'Generate client-ready memo', href: '/executive-briefs' },
          { label: 'PowerPoint Outline', desc: 'Build deck from deal data', href: '/powerpoint-builder' },
          { label: 'Marketing Studio', desc: 'Draft referral outreach', href: '/marketing-studio' },
        ].map((ql) => (
          <Link key={ql.href} href={ql.href} style={{ textDecoration: 'none' }}>
            <div className="card-sm card-hover" style={{ cursor: 'pointer', borderColor: 'var(--border)' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--gold)', marginBottom: '0.25rem' }}>{ql.label} →</div>
              <div style={{ fontSize: '0.7125rem', color: 'var(--text-muted)' }}>{ql.desc}</div>
            </div>
          </Link>
        ))}
      </div>

      <div className="disclaimer">
        <strong style={{ color: 'var(--gold)' }}>Tax Strategy Operations Hub — Demo Environment.</strong>{' '}
        This platform supports workflow automation and document preparation for advisory firms. It does not provide tax, legal, accounting, investment, or financial advice.
        All strategies and calculations must be reviewed by qualified professionals.
      </div>
    </div>
  );
}
