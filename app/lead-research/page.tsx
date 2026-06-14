'use client';

import { useState, useMemo, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

type Lead = {
  id: string;
  name: string;
  company: string;
  category: string;
  location: string;
  txRange: string;
  referralSource: string;
  status: string;
  priority: number;
  nextAction: string;
};

const CATEGORIES = ['All', 'PE Partner', 'Investment Banker', 'Real Estate Broker', 'CPA', 'Business Owner', 'Real Estate Owner', 'Family Office', 'Website Lead'];
const STATUSES = ['All', 'New Lead', 'New Intake', 'Researching', 'Contacted', 'Meeting Scheduled', 'Proposal Sent', 'Active Opportunity', 'Nurture'];

function priorityColor(p: number) {
  if (p >= 90) return 'var(--red)';
  if (p >= 80) return 'var(--warning)';
  return 'var(--success)';
}

function statusBadge(s: string) {
  const map: Record<string, string> = {
    'New Lead': 'badge-blue',
    'New Intake': 'badge-blue',
    Researching: 'badge-gray',
    Contacted: 'badge-warning',
    'Meeting Scheduled': 'badge-gold',
    'Proposal Sent': 'badge-gold',
    'Active Opportunity': 'badge-green',
    Nurture: 'badge-gray',
  };
  return map[s] ?? 'badge-gray';
}

export default function LeadResearchPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from('pipeline_leads')
          .select('id, name, company, category, location, tx_range, source, status, priority, next_action')
          .order('priority', { ascending: false });
        if (data) {
          setLeads(data.map((r) => ({
            id: r.id,
            name: r.name,
            company: r.company ?? '',
            category: r.category ?? '',
            location: r.location ?? '',
            txRange: r.tx_range ?? '',
            referralSource: r.source ?? '',
            status: r.status ?? 'New Lead',
            priority: r.priority ?? 70,
            nextAction: r.next_action ?? '',
          })));
        }
      } catch {}
      setLoading(false);
    }
    load();
  }, []);

  const filtered = useMemo(() => {
    return leads.filter((l) => {
      const q = search.toLowerCase();
      const matchSearch = !q || l.name.toLowerCase().includes(q) || l.company.toLowerCase().includes(q) || l.location.toLowerCase().includes(q) || l.category.toLowerCase().includes(q);
      const matchCat = catFilter === 'All' || l.category === catFilter;
      const matchStatus = statusFilter === 'All' || l.status === statusFilter;
      return matchSearch && matchCat && matchStatus;
    });
  }, [leads, search, catFilter, statusFilter]);

  return (
    <div style={{ maxWidth: '1200px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h1 className="section-title" style={{ fontSize: '1.5rem' }}>Lead Research &amp; Referral Pipeline</h1>
            <p className="section-subtitle">Research, manage, and prioritize referral partners and prospect opportunities.</p>
          </div>
          <span className="internal-tag">Live from Pipeline DB</span>
        </div>
      </div>

      {/* Summary stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Total Leads', value: leads.length, color: 'var(--blue)' },
          { label: 'Active Opportunities', value: leads.filter((l) => l.status === 'Active Opportunity').length, color: 'var(--success)' },
          { label: 'High Priority (90+)', value: leads.filter((l) => l.priority >= 90).length, color: 'var(--red)' },
          { label: 'Meetings Scheduled', value: leads.filter((l) => l.status === 'Meeting Scheduled').length, color: 'var(--gold)' },
        ].map((s) => (
          <div key={s.label} className="card-sm" style={{ borderLeft: `3px solid ${s.color}` }}>
            <div className="stat-label" style={{ marginBottom: '0.375rem' }}>{s.label}</div>
            <div className="stat-value" style={{ fontSize: '1.5rem', color: s.color }}>
              {loading ? <span style={{ opacity: 0.3 }}>—</span> : s.value}
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card" style={{ padding: '1rem 1.25rem', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.875rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <div style={{ position: 'relative' }}>
              <svg style={{ position: 'absolute', left: '0.625rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input className="input-field" style={{ paddingLeft: '2rem' }} placeholder="Search name, company, location..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <label className="field-label" style={{ margin: 0, whiteSpace: 'nowrap' }}>Category:</label>
            <select className="input-field" style={{ width: 'auto' }} value={catFilter} onChange={(e) => setCatFilter(e.target.value)}>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <label className="field-label" style={{ margin: 0, whiteSpace: 'nowrap' }}>Status:</label>
            <select className="input-field" style={{ width: 'auto' }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              {STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
            {loading ? 'Loading...' : `${filtered.length} of ${leads.length} records`}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem', gap: '0.75rem' }}>
            <div className="spinner" style={{ width: '16px', height: '16px', margin: 0 }} />
            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Loading pipeline data...</span>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Contact Name</th>
                  <th>Company</th>
                  <th>Category</th>
                  <th>Location</th>
                  <th>Est. Tx Range</th>
                  <th>Source</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'center' }}>Priority</th>
                  <th>Next Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={9} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                      No leads match the current filters.
                    </td>
                  </tr>
                ) : (
                  filtered.map((lead) => (
                    <tr key={lead.id}>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.8125rem' }}>{lead.name}</div>
                      </td>
                      <td style={{ color: 'var(--text-secondary)', maxWidth: '160px' }}>{lead.company}</td>
                      <td>
                        <span className="badge badge-blue" style={{ fontSize: '0.625rem' }}>{lead.category}</span>
                      </td>
                      <td style={{ color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{lead.location}</td>
                      <td style={{ fontWeight: 500, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{lead.txRange}</td>
                      <td style={{ color: 'var(--text-muted)' }}>{lead.referralSource}</td>
                      <td>
                        <span className={`badge ${statusBadge(lead.status)}`} style={{ fontSize: '0.625rem', whiteSpace: 'nowrap' }}>
                          {lead.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: priorityColor(lead.priority) }}>
                          {lead.priority}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', maxWidth: '180px' }}>{lead.nextAction}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div style={{ marginTop: '1.25rem', padding: '0.75rem 1rem', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Live data from your pipeline. Add or edit contacts in the <a href="/referral-pipeline" style={{ color: 'var(--gold)', textDecoration: 'none' }}>Referral Pipeline</a>. Priority scores are estimates — verify contact details before outreach.
        </span>
      </div>
    </div>
  );
}
