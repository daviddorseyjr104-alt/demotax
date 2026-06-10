'use client';

import { useState, useMemo } from 'react';

type Lead = {
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

const LEADS: Lead[] = [
  { name: 'Michael Stein', company: 'Crestline Capital Partners', category: 'PE Partner', location: 'Los Angeles, CA', txRange: '$75M–$250M', referralSource: 'LinkedIn', status: 'Researching', priority: 91, nextAction: 'Build intro email' },
  { name: 'Sarah Kaplan', company: 'Westbridge Realty Advisors', category: 'Real Estate Broker', location: 'Beverly Hills, CA', txRange: '$40M–$120M', referralSource: 'Referral', status: 'Contacted', priority: 86, nextAction: 'Follow up this week' },
  { name: 'David Rosenthal', company: 'Meridian Investment Bank', category: 'Investment Banker', location: 'Century City, CA', txRange: '$100M–$500M', referralSource: 'Conference List', status: 'New Lead', priority: 94, nextAction: 'Research recent deals' },
  { name: 'Karen Whitfield', company: 'Pacific Summit Family Office', category: 'Family Office', location: 'Newport Beach, CA', txRange: '$50M–$200M', referralSource: 'Direct Outreach', status: 'Meeting Scheduled', priority: 88, nextAction: 'Prepare agenda' },
  { name: 'Thomas Nguyen', company: 'Nguyen Properties Group', category: 'Real Estate Owner', location: 'Irvine, CA', txRange: '$30M–$80M', referralSource: 'LinkedIn', status: 'Proposal Sent', priority: 79, nextAction: 'Follow up on proposal' },
  { name: 'Amanda Torres', company: 'Blackstone Ridge CPA Group', category: 'CPA', location: 'San Diego, CA', txRange: 'N/A', referralSource: 'Referral', status: 'Active Opportunity', priority: 83, nextAction: 'Schedule partner call' },
  { name: 'James Harrington', company: 'Harrington Industrial Holdings', category: 'Business Owner', location: 'Phoenix, AZ', txRange: '$60M–$180M', referralSource: 'Conference List', status: 'Contacted', priority: 76, nextAction: 'Send case study' },
  { name: 'Rachel Goldberg', company: 'Summit Peak Real Estate', category: 'Real Estate Broker', location: 'Scottsdale, AZ', txRange: '$20M–$75M', referralSource: 'Referral', status: 'Nurture', priority: 61, nextAction: 'Add to newsletter' },
  { name: 'William Chen', company: 'Pacific Bridge Equity', category: 'PE Partner', location: 'San Francisco, CA', txRange: '$150M–$400M', referralSource: 'LinkedIn', status: 'New Lead', priority: 97, nextAction: 'Prioritize cold outreach' },
  { name: 'Patricia Lawson', company: 'Lawson & Partners CPA', category: 'CPA', location: 'Denver, CO', txRange: 'N/A', referralSource: 'Direct Outreach', status: 'Meeting Scheduled', priority: 80, nextAction: 'Send intro deck' },
  { name: 'Robert Kim', company: 'Westport Capital Advisors', category: 'Investment Banker', location: 'Seattle, WA', txRange: '$80M–$300M', referralSource: 'Conference List', status: 'Researching', priority: 85, nextAction: 'Research recent transactions' },
  { name: 'Elena Vargas', company: 'Vargas Multifamily Group', category: 'Real Estate Owner', location: 'Austin, TX', txRange: '$40M–$130M', referralSource: 'LinkedIn', status: 'Contacted', priority: 72, nextAction: 'Schedule discovery call' },
  { name: 'Mark Fitzpatrick', company: 'Bridgecrest Technology Solutions', category: 'Business Owner', location: 'Dallas, TX', txRange: '$25M–$90M', referralSource: 'Referral', status: 'Active Opportunity', priority: 89, nextAction: 'Send preliminary estimate' },
  { name: 'Susan Park', company: 'Horizon Wealth Partners', category: 'Family Office', location: 'Los Angeles, CA', txRange: '$100M–$350M', referralSource: 'Direct Outreach', status: 'Nurture', priority: 68, nextAction: 'Quarterly check-in' },
  { name: 'Carlos Mendez', company: 'Mendez Commercial Real Estate', category: 'Real Estate Broker', location: 'Miami, FL', txRange: '$35M–$100M', referralSource: 'LinkedIn', status: 'New Lead', priority: 74, nextAction: 'Initial outreach email' },
];

const CATEGORIES = ['All', 'PE Partner', 'Investment Banker', 'Real Estate Broker', 'CPA', 'Business Owner', 'Real Estate Owner', 'Family Office'];
const STATUSES = ['All', 'New Lead', 'Researching', 'Contacted', 'Meeting Scheduled', 'Proposal Sent', 'Active Opportunity', 'Nurture'];

function priorityColor(p: number) {
  if (p >= 90) return 'var(--red)';
  if (p >= 80) return 'var(--warning)';
  return 'var(--success)';
}

function statusBadge(s: string) {
  const map: Record<string, string> = {
    'New Lead': 'badge-blue',
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
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const filtered = useMemo(() => {
    return LEADS.filter((l) => {
      const q = search.toLowerCase();
      const matchSearch = !q || l.name.toLowerCase().includes(q) || l.company.toLowerCase().includes(q) || l.location.toLowerCase().includes(q);
      const matchCat = catFilter === 'All' || l.category === catFilter;
      const matchStatus = statusFilter === 'All' || l.status === statusFilter;
      return matchSearch && matchCat && matchStatus;
    });
  }, [search, catFilter, statusFilter]);

  return (
    <div style={{ maxWidth: '1200px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="section-title" style={{ fontSize: '1.5rem' }}>Lead Research &amp; Referral Pipeline</h1>
        <p className="section-subtitle">Research, manage, and prioritize referral partners and prospect opportunities.</p>
      </div>

      {/* Summary stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Total Leads', value: LEADS.length, color: 'var(--blue)' },
          { label: 'Active Opportunities', value: LEADS.filter((l) => l.status === 'Active Opportunity').length, color: 'var(--success)' },
          { label: 'High Priority (90+)', value: LEADS.filter((l) => l.priority >= 90).length, color: 'var(--red)' },
          { label: 'Meetings Scheduled', value: LEADS.filter((l) => l.status === 'Meeting Scheduled').length, color: 'var(--gold)' },
        ].map((s) => (
          <div key={s.label} className="card-sm" style={{ borderLeft: `3px solid ${s.color}` }}>
            <div className="stat-label" style={{ marginBottom: '0.375rem' }}>{s.label}</div>
            <div className="stat-value" style={{ fontSize: '1.5rem', color: s.color }}>{s.value}</div>
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
            {filtered.length} of {LEADS.length} records
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
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
                  <tr key={lead.name}>
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
      </div>

      <div style={{ marginTop: '1.25rem', padding: '0.75rem 1rem', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Priority scores are illustrative. All contact data is mock data for demonstration purposes only.
        </span>
      </div>
    </div>
  );
}
