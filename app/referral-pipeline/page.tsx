'use client';

import { useState, useMemo } from 'react';

type Lead = {
  name: string; company: string; category: string; location: string;
  txRange: string; source: string; status: string; priority: number;
  lastContact: string; nextAction: string;
};

const LEADS: Lead[] = [
  { name: 'Robert Chen', company: 'Chen Manufacturing Group', category: 'Business Owner', location: 'Pasadena, CA', txRange: '$85M', source: 'CPA Referral', status: 'Meeting Scheduled', priority: 97, lastContact: 'Today', nextAction: 'Prepare executive brief' },
  { name: 'David Rosenthal', company: 'Meridian Investment Bank', category: 'Investment Banker', location: 'Century City, CA', txRange: '$100M–$500M', source: 'Conference List', status: 'New Lead', priority: 94, lastContact: 'Never', nextAction: 'Research recent deals' },
  { name: 'Michael Stein', company: 'Crestline Capital Partners', category: 'PE Partner', location: 'Los Angeles, CA', txRange: '$75M–$250M', source: 'LinkedIn', status: 'Researching', priority: 91, lastContact: '3 days ago', nextAction: 'Build intro email' },
  { name: 'Laura Bennett', company: 'Bennett Multifamily Holdings', category: 'Real Estate Owner', location: 'Santa Monica, CA', txRange: '$120M–$300M', source: 'Broker', status: 'Active Opportunity', priority: 93, lastContact: '2 days ago', nextAction: 'Draft proposal outline' },
  { name: 'William Chen', company: 'Pacific Bridge Equity', category: 'PE Partner', location: 'San Francisco, CA', txRange: '$150M–$400M', source: 'LinkedIn', status: 'New Lead', priority: 97, lastContact: 'Never', nextAction: 'Prioritize cold outreach' },
  { name: 'Jennifer Walsh', company: 'Walsh Private Equity', category: 'PE Partner', location: 'Chicago, IL', txRange: '$200M–$500M', source: 'Conference', status: 'Researching', priority: 95, lastContact: '5 days ago', nextAction: 'Send deal review framework' },
  { name: 'Sarah Kaplan', company: 'Westbridge Realty Advisors', category: 'Real Estate Broker', location: 'Beverly Hills, CA', txRange: '$40M–$120M', source: 'Referral', status: 'Contacted', priority: 86, lastContact: 'Yesterday', nextAction: 'Follow up this week' },
  { name: 'Harrison Lee', company: 'Premier Investment Group', category: 'Investment Banker', location: 'Manhattan Beach, CA', txRange: '$75M–$200M', source: 'Referral', status: 'Executive Brief Sent', priority: 87, lastContact: 'Yesterday', nextAction: 'Schedule follow-up call' },
  { name: 'Karen Whitfield', company: 'Pacific Summit Family Office', category: 'Family Office', location: 'Newport Beach, CA', txRange: '$50M–$200M', source: 'Direct Outreach', status: 'Meeting Scheduled', priority: 88, lastContact: 'Today', nextAction: 'Prepare meeting agenda' },
  { name: 'Patricia Lawson', company: 'Lawson & Partners CPA', category: 'CPA', location: 'Denver, CO', txRange: 'Referral only', source: 'Direct Outreach', status: 'Meeting Scheduled', priority: 80, lastContact: '2 days ago', nextAction: 'Send partnership overview' },
  { name: 'Mark Fitzpatrick', company: 'Bridgecrest Technology Solutions', category: 'Business Owner', location: 'Dallas, TX', txRange: '$25M–$90M', source: 'Referral', status: 'Active Opportunity', priority: 89, lastContact: 'Yesterday', nextAction: 'Send preliminary estimate' },
  { name: 'Robert Kim', company: 'Westport Capital Advisors', category: 'Investment Banker', location: 'Seattle, WA', txRange: '$80M–$300M', source: 'Conference', status: 'Researching', priority: 85, lastContact: '4 days ago', nextAction: 'Research recent transactions' },
  { name: 'Amanda Torres', company: 'Blackstone Ridge CPA Group', category: 'CPA', location: 'San Diego, CA', txRange: 'Referral only', source: 'Referral', status: 'Active Opportunity', priority: 83, lastContact: '3 days ago', nextAction: 'Schedule partner call' },
  { name: 'Thomas Nguyen', company: 'Nguyen Properties Group', category: 'Real Estate Owner', location: 'Irvine, CA', txRange: '$30M–$80M', source: 'LinkedIn', status: 'Executive Brief Sent', priority: 79, lastContact: '5 days ago', nextAction: 'Follow up on brief' },
  { name: 'James Harrington', company: 'Harrington Industrial Holdings', category: 'Business Owner', location: 'Phoenix, AZ', txRange: '$60M–$180M', source: 'Conference', status: 'Contacted', priority: 76, lastContact: '1 week ago', nextAction: 'Send case study' },
  { name: 'Anthony Park', company: 'Park Family Office', category: 'Family Office', location: 'Newport Beach, CA', txRange: '$50M–$200M', source: 'Referral', status: 'Nurture', priority: 78, lastContact: '12 days ago', nextAction: 'Send educational note' },
  { name: 'Elena Vargas', company: 'Vargas Multifamily Group', category: 'Real Estate Owner', location: 'Austin, TX', txRange: '$40M–$130M', source: 'LinkedIn', status: 'Contacted', priority: 72, lastContact: '1 week ago', nextAction: 'Schedule discovery call' },
  { name: 'Susan Park', company: 'Horizon Wealth Partners', category: 'Family Office', location: 'Los Angeles, CA', txRange: '$100M–$350M', source: 'Direct Outreach', status: 'Nurture', priority: 68, lastContact: '2 weeks ago', nextAction: 'Quarterly check-in' },
  { name: 'Rachel Goldberg', company: 'Summit Peak Real Estate', category: 'Real Estate Broker', location: 'Scottsdale, AZ', txRange: '$20M–$75M', source: 'Referral', status: 'Nurture', priority: 61, lastContact: '3 weeks ago', nextAction: 'Add to newsletter list' },
  { name: 'Carlos Mendez', company: 'Mendez Commercial Real Estate', category: 'Real Estate Broker', location: 'Miami, FL', txRange: '$35M–$100M', source: 'LinkedIn', status: 'New Lead', priority: 74, lastContact: 'Never', nextAction: 'Initial outreach email' },
];

const CATS = ['All', 'PE Partner', 'Investment Banker', 'Real Estate Broker', 'CPA', 'Business Owner', 'Real Estate Owner', 'Family Office'];
const STATUSES = ['All', 'New Lead', 'Researching', 'Contacted', 'Meeting Scheduled', 'Executive Brief Sent', 'Proposal Sent', 'Active Opportunity', 'Nurture'];

const statusBadge: Record<string, string> = {
  'New Lead': 'badge-blue', Researching: 'badge-gray', Contacted: 'badge-warning',
  'Meeting Scheduled': 'badge-gold', 'Executive Brief Sent': 'badge-purple',
  'Proposal Sent': 'badge-gold', 'Active Opportunity': 'badge-green', Nurture: 'badge-gray',
};

function priorityColor(p: number) {
  if (p >= 93) return 'var(--red)';
  if (p >= 83) return 'var(--warning)';
  return 'var(--success)';
}

export default function ReferralPipelinePage() {
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('All');
  const [status, setStatus] = useState('All');
  const [minPriority, setMinPriority] = useState('');

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    const mp = minPriority ? parseInt(minPriority) : 0;
    return LEADS.filter((l) => {
      const matchSearch = !q || l.name.toLowerCase().includes(q) || l.company.toLowerCase().includes(q) || l.location.toLowerCase().includes(q);
      const matchCat = cat === 'All' || l.category === cat;
      const matchStatus = status === 'All' || l.status === status;
      const matchPriority = l.priority >= mp;
      return matchSearch && matchCat && matchStatus && matchPriority;
    });
  }, [search, cat, status, minPriority]);

  const summaryStats = [
    { label: 'New Leads', value: LEADS.filter((l) => l.status === 'New Lead').length, color: 'var(--blue)' },
    { label: 'Meetings Scheduled', value: LEADS.filter((l) => l.status === 'Meeting Scheduled').length, color: 'var(--gold)' },
    { label: 'Active Opportunities', value: LEADS.filter((l) => l.status === 'Active Opportunity').length, color: 'var(--success)' },
    { label: 'Follow-Ups Due', value: LEADS.filter((l) => ['Contacted', 'Executive Brief Sent', 'Proposal Sent'].includes(l.status)).length, color: 'var(--warning)' },
  ];

  return (
    <div style={{ maxWidth: '1280px' }}>
      <div style={{ marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h1 className="section-title" style={{ fontSize: '1.375rem' }}>Referral Partner &amp; Deal Pipeline</h1>
            <p className="section-subtitle" style={{ maxWidth: '560px' }}>
              Track private equity partners, investment bankers, brokers, CPAs, owners, and active opportunities across your referral network.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <span className="badge badge-gold">{LEADS.length} Contacts</span>
            <span className="internal-tag">Demo Data</span>
          </div>
        </div>
      </div>

      {/* Summary stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.875rem', marginBottom: '1.25rem' }}>
        {summaryStats.map((s) => (
          <div key={s.label} className="card-sm" style={{ borderLeft: `3px solid ${s.color}` }}>
            <div className="stat-label" style={{ marginBottom: '0.375rem' }}>{s.label}</div>
            <div className="stat-value" style={{ fontSize: '1.625rem', color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card" style={{ padding: '0.875rem 1.125rem', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '180px', position: 'relative' }}>
            <svg style={{ position: 'absolute', left: '0.625rem', top: '50%', transform: 'translateY(-50%)' }} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input className="input-field" style={{ paddingLeft: '2rem' }} placeholder="Search name, company, location..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          {[
            { label: 'Category', val: cat, setter: setCat, opts: CATS },
            { label: 'Status', val: status, setter: setStatus, opts: STATUSES },
          ].map((f) => (
            <div key={f.label} style={{ display: 'flex', gap: '0.375rem', alignItems: 'center' }}>
              <label className="field-label" style={{ margin: 0, whiteSpace: 'nowrap' }}>{f.label}:</label>
              <select className="input-field" style={{ width: 'auto' }} value={f.val} onChange={(e) => f.setter(e.target.value)}>
                {f.opts.map((o) => <option key={o}>{o}</option>)}
              </select>
            </div>
          ))}
          <div style={{ display: 'flex', gap: '0.375rem', alignItems: 'center' }}>
            <label className="field-label" style={{ margin: 0, whiteSpace: 'nowrap' }}>Min Priority:</label>
            <input className="input-field" style={{ width: '80px' }} placeholder="70" value={minPriority} onChange={(e) => setMinPriority(e.target.value)} />
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{filtered.length} of {LEADS.length}</div>
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Contact</th>
                <th>Company</th>
                <th>Category</th>
                <th>Location</th>
                <th>Tx Range</th>
                <th>Source</th>
                <th>Status</th>
                <th style={{ textAlign: 'center' }}>Priority</th>
                <th>Last Contact</th>
                <th>Next Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0
                ? <tr><td colSpan={10} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No contacts match current filters.</td></tr>
                : filtered.map((l) => (
                  <tr key={l.name}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{l.name}</div>
                    </td>
                    <td style={{ maxWidth: '160px', fontSize: '0.775rem' }}>{l.company}</td>
                    <td><span className="badge badge-blue" style={{ fontSize: '0.6rem', whiteSpace: 'nowrap' }}>{l.category}</span></td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>{l.location}</td>
                    <td style={{ fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.775rem', whiteSpace: 'nowrap' }}>{l.txRange}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{l.source}</td>
                    <td><span className={`badge ${statusBadge[l.status] ?? 'badge-gray'}`} style={{ fontSize: '0.6rem', whiteSpace: 'nowrap' }}>{l.status}</span></td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: 700, color: priorityColor(l.priority) }}>{l.priority}</span>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>{l.lastContact}</td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', maxWidth: '160px' }}>{l.nextAction}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
      <div style={{ marginTop: '0.875rem', fontSize: '0.6875rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        All contact data is illustrative mock data for demonstration purposes only. Priority scores are not real assessments.
      </div>
    </div>
  );
}
