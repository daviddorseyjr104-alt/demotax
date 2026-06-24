'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getActivity, clearActivity, type ActivityEntry } from '../lib/activity';
import { createClient } from '@/lib/supabase/client';

type DbLead = {
  id: string; name: string; company: string; category: string;
  tx_range: string; deal_type: string; status: string; priority: number; next_action: string;
};

function leadToAction(lead: DbLead) {
  const isUrgent = lead.priority >= 90;
  const isHigh = lead.priority >= 80;
  let action = 'Run Calculator'; let href = '/deal-calculator';
  if (['Investment Banker', 'PE Partner'].includes(lead.category)) { action = 'Build PowerPoint'; href = '/powerpoint-builder'; }
  else if (lead.category === 'CPA') { action = 'Generate Brief'; href = '/executive-briefs'; }
  else if (lead.category === 'Real Estate Broker') { action = 'Build PowerPoint'; href = '/powerpoint-builder'; }
  return {
    title: lead.next_action || `Follow up with ${lead.name}`,
    status: isUrgent ? 'High Priority' : isHigh ? 'Due This Week' : 'Active',
    statusColor: isUrgent ? 'var(--red)' : isHigh ? 'var(--warning)' : 'var(--blue)',
    action, href,
    note: `${lead.category}${lead.company ? ' · ' + lead.company : ''}${lead.tx_range ? ' · ' + lead.tx_range : ''}`,
  };
}

const manualFlow = ['15-min Zoom Call', 'Manual Notes', 'Open Excel (per type)', 'Build PPT Manually', 'Email One-Pager', 'CRM Entry'];
const autoFlow = ['Zoom Transcript', 'AI Extracts 6–7 Fields', 'Asset Calculator Auto-Fills', 'PPT Deck Generated', 'One-Page PDF', 'Auto CRM Log'];

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}

export default function CEODashboard() {
  const [activity, setActivity] = useState<ActivityEntry[]>(() => getActivity());
  const [leadCount, setLeadCount] = useState<number>(0);
  const [meetingCount, setMeetingCount] = useState<number>(0);
  const [dealCount, setDealCount] = useState<number>(0);
  const [followUpCount, setFollowUpCount] = useState<number>(0);
  const [dbPriorities, setDbPriorities] = useState<DbLead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLiveData() {
      try {
        const supabase = createClient();

        const [
          { count: lc },
          { count: mc },
          { count: dc },
          { count: fc },
          { data: top },
        ] = await Promise.all([
          supabase.from('pipeline_leads').select('*', { count: 'exact', head: true }),
          supabase.from('meetings').select('*', { count: 'exact', head: true }),
          supabase.from('deals').select('*', { count: 'exact', head: true }),
          supabase.from('pipeline_leads').select('*', { count: 'exact', head: true })
            .in('status', ['Contacted', 'Meeting Scheduled', 'Executive Brief Sent', 'Proposal Sent', 'Active Opportunity']),
          supabase.from('pipeline_leads')
            .select('id, name, company, category, tx_range, deal_type, status, priority, next_action')
            .order('priority', { ascending: false })
            .limit(4),
        ]);

        if (lc !== null) setLeadCount(lc);
        if (mc !== null) setMeetingCount(mc);
        if (dc !== null) setDealCount(dc);
        if (fc !== null) setFollowUpCount(fc);
        if (top && top.length > 0) setDbPriorities(top as DbLead[]);
      } catch {}
      setLoading(false);
    }
    loadLiveData();
  }, []);

  const stats = [
    { label: 'Contacts in Pipeline', value: leadCount, sub: 'Referral partners & prospects', color: 'var(--gold)' },
    { label: 'Active Follow-Ups', value: followUpCount, sub: 'Contacted through active opportunity', color: 'var(--warning)' },
    { label: 'Deals Modeled', value: dealCount, sub: 'Saved in Deal Calculator', color: 'var(--purple)' },
    { label: 'Meeting Sessions', value: meetingCount, sub: 'Processed & saved to history', color: 'var(--success)' },
  ];

  return (
    <div className="dashboard-page">
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: '0.5rem' }}>Operations Dashboard</h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', maxWidth: '600px', lineHeight: 1.6 }}>Real-time overview of your pipeline, meetings, and deal activity.</p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
            <span className="internal-tag">Internal Use Only</span>
          </div>
        </div>
      </div>

      {/* Live Stats */}
      <div className="dashboard-stats-grid">
        {stats.map((s) => (
          <div key={s.label} className="card-sm" style={{ borderLeft: `3px solid ${s.color}` }}>
            <div className="stat-label" style={{ marginBottom: '0.5rem' }}>{s.label}</div>
            <div className="stat-value" style={{ fontSize: '1.625rem', color: s.color }}>
              {loading ? <span className="skeleton" style={{ width: '2.5rem', height: '1.625rem', verticalAlign: 'middle' }} /> : s.value}
            </div>
            <div style={{ fontSize: '0.6625rem', color: 'var(--text-muted)', marginTop: '0.375rem' }}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="dashboard-two-column">
        {/* Priority Actions */}
        <div className="card">
          <div style={{ marginBottom: '1.125rem' }}>
            <div className="section-title" style={{ fontSize: '1rem' }}>Today&apos;s Priority Actions</div>
            <div className="section-subtitle">Top contacts by priority score</div>
          </div>
          {dbPriorities.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {dbPriorities.map(leadToAction).map((p, i) => (
                <div key={i} className="priority-action-row">
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
          ) : (
            <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)' }}>
              <div style={{ marginBottom: '0.75rem', opacity: 0.25 }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5" style={{ margin: '0 auto' }}>
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <div style={{ fontSize: '0.8125rem', marginBottom: '0.5rem' }}>No contacts in your pipeline yet</div>
              <Link href="/referral-pipeline" style={{ textDecoration: 'none' }}>
                <button className="btn-gold" style={{ fontSize: '0.75rem', padding: '0.4rem 1rem' }}>Add First Contact →</button>
              </Link>
            </div>
          )}
        </div>

        {/* Activity Feed */}
        <div className="card">
          <div className="card-header-row">
            <div>
              <div className="section-title" style={{ fontSize: '1rem' }}>Recent Activity</div>
              <div className="section-subtitle">Platform actions — updates as you use each tool</div>
            </div>
            {activity.length > 0 && (
              <button
                className="btn-ghost"
                style={{ fontSize: '0.65rem', padding: '0.2rem 0.5rem', opacity: 0.6 }}
                onClick={() => { clearActivity(); setActivity([]); }}
              >
                Clear
              </button>
            )}
          </div>
          {activity.length > 0 ? (
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
          ) : (
            <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)' }}>
              <div style={{ marginBottom: '0.75rem', opacity: 0.25 }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5" style={{ margin: '0 auto' }}>
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
              </div>
              <div style={{ fontSize: '0.8125rem' }}>No activity yet</div>
              <div style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>Use any tool to see your workflow log here</div>
            </div>
          )}
        </div>
      </div>

      {/* Before / After */}
      <div className="card" style={{ marginBottom: '1.25rem' }}>
        <div style={{ marginBottom: '1.25rem' }}>
          <div className="section-title" style={{ fontSize: '1rem' }}>Manual Work Converted Into Automation</div>
          <div className="section-subtitle">From ad hoc Claude usage to a repeatable operations platform</div>
        </div>
        <div className="dashboard-two-column">
          <div style={{ padding: '1.125rem', backgroundColor: 'var(--bg-input)', borderRadius: '0.625rem', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '0.6375rem', fontWeight: 700, color: 'var(--red)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--red)', display: 'inline-block' }} />Before: Manual Process
            </div>
            <div className="flow-wrap">
              {manualFlow.map((step, i) => (
                <div key={step} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <div className="flow-step manual">{step}</div>
                  {i < manualFlow.length - 1 && <span className="flow-arrow">›</span>}
                </div>
              ))}
            </div>
            <div style={{ marginTop: '0.875rem', fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.55 }}>After a 15-minute Zoom call, each step requires manual effort: transcribing, opening the right Excel file (5 different calculators), building the PPT, and emailing a one-pager — totaling 4–6 hours per deal.</div>
          </div>
          <div style={{ padding: '1.125rem', backgroundColor: 'var(--bg-input)', borderRadius: '0.625rem', border: '1px solid var(--gold-border)' }}>
            <div style={{ fontSize: '0.6375rem', fontWeight: 700, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--success)', display: 'inline-block' }} />After: Operations Platform
            </div>
            <div className="flow-wrap">
              {autoFlow.map((step, i) => (
                <div key={step} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <div className="flow-step auto">{step}</div>
                  {i < autoFlow.length - 1 && <span className="flow-arrow" style={{ color: 'var(--gold)' }}>›</span>}
                </div>
              ))}
            </div>
            <div style={{ marginTop: '0.875rem', fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.55 }}>The Zoom transcript feeds the correct asset calculator automatically. The PowerPoint deck and banker one-pager are ready before the next meeting — under 1 hour total.</div>
          </div>
        </div>
        <div className="dashboard-impact-grid">
          {[
            { label: 'Presentation Prep', before: '6 hours per deck', after: 'Under 1 hour' },
            { label: 'Post-Call Admin', before: '45 min manual entry', after: 'Auto-generated in minutes' },
            { label: 'Banker One-Pager', before: 'Manual email + PDF', after: 'Auto-generated on submit' },
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
      <div className="quick-link-grid">
        {[
          { label: 'Deal Calculator', desc: '5 structure types — instant exposure', href: '/deal-calculator' },
          { label: 'Meeting Notes', desc: 'Call notes → follow-up package', href: '/meeting-notes' },
          { label: 'PowerPoint Builder', desc: 'Build deck from deal data', href: '/powerpoint-builder' },
          { label: 'Referral Pipeline', desc: 'Track your referral contacts', href: '/referral-pipeline' },
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
        <strong style={{ color: 'var(--gold)' }}>Important:</strong>{' '}
        This platform supports workflow automation and document preparation for advisory firms. It does not provide tax, legal, accounting, investment, or financial advice.
        All strategies and calculations must be reviewed by qualified professionals.
      </div>
    </div>
  );
}
