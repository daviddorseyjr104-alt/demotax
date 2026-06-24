'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { toast } from '@/components/Toast';

type Lead = {
  id: string;
  name: string;
  company: string;
  category: string;
  location: string;
  tx_range: string;
  deal_type: string;
  source: string;
  referred_by: string;
  status: string;
  priority: number;
  last_contact: string;
  next_action: string;
};

const BLANK_LEAD: Omit<Lead, 'id'> = {
  name: '', company: '', category: 'Business Owner', location: '',
  tx_range: '', deal_type: 'LLC (S-Corp)', source: 'Referral', referred_by: '',
  status: 'New Lead', priority: 70, last_contact: 'Today', next_action: '',
};


const CATS = ['All', 'PE Partner', 'Investment Banker', 'Real Estate Broker', 'CPA', 'Business Owner', 'Real Estate Owner', 'Family Office'];
const STATUSES = ['All', 'New Lead', 'Researching', 'Contacted', 'Meeting Scheduled', 'Executive Brief Sent', 'Proposal Sent', 'Active Opportunity', 'Nurture', 'Closed Won', 'Closed Lost'];
const DEAL_TYPES = ['All', 'LLC (Partnership)', 'LLC (S-Corp)', 'Real Estate', 'C-Corporation', 'Securities / IP', 'Multiple'];
const CATEGORIES = ['PE Partner', 'Investment Banker', 'Real Estate Broker', 'CPA', 'Business Owner', 'Real Estate Owner', 'Family Office'];

const statusBadge: Record<string, string> = {
  'New Lead': 'badge-blue', Researching: 'badge-gray', Contacted: 'badge-warning',
  'Meeting Scheduled': 'badge-gold', 'Executive Brief Sent': 'badge-purple',
  'Proposal Sent': 'badge-gold', 'Active Opportunity': 'badge-green',
  Nurture: 'badge-gray', 'Closed Won': 'badge-green', 'Closed Lost': 'badge-gray',
};

const dealTypeBadge: Record<string, string> = {
  'LLC (Partnership)': 'badge-blue', 'LLC (S-Corp)': 'badge-purple',
  'Real Estate': 'badge-green', 'C-Corporation': 'badge-warning',
  'Securities / IP': 'badge-gold', 'Multiple': 'badge-gray',
};

function priorityColor(p: number) {
  if (p >= 93) return 'var(--red)';
  if (p >= 83) return 'var(--warning)';
  return 'var(--success)';
}

type FormLead = Omit<Lead, 'id'>;

function LeadModal({
  initial,
  onSave,
  onClose,
  saving,
}: {
  initial: FormLead;
  onSave: (l: FormLead) => void;
  onClose: () => void;
  saving: boolean;
}) {
  const [form, setForm] = useState<FormLead>(initial);
  const set = (k: keyof FormLead, v: string | number) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div
      style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '0.875rem', padding: '2rem', width: '100%', maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {initial.name ? `Edit — ${initial.name}` : 'Add New Contact'}
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.25rem', lineHeight: 1 }}>×</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          {[
            { label: 'Full Name *', key: 'name', type: 'text', placeholder: 'John Smith' },
            { label: 'Company', key: 'company', type: 'text', placeholder: 'Acme Holdings' },
            { label: 'Location', key: 'location', type: 'text', placeholder: 'Dallas, TX' },
            { label: 'Transaction Range', key: 'tx_range', type: 'text', placeholder: '$50M–$100M' },
            { label: 'Source', key: 'source', type: 'text', placeholder: 'Referral / LinkedIn / Conference' },
            { label: 'Referred By', key: 'referred_by', type: 'text', placeholder: 'Name, Firm' },
            { label: 'Last Contact', key: 'last_contact', type: 'text', placeholder: 'Today / Never' },
            { label: 'Priority (1–100)', key: 'priority', type: 'number', placeholder: '70' },
          ].map(({ label, key, type, placeholder }) => (
            <div key={key}>
              <label className="field-label">{label}</label>
              <input
                className="input-field"
                type={type}
                placeholder={placeholder}
                value={String(form[key as keyof FormLead] ?? '')}
                onChange={(e) => set(key as keyof FormLead, type === 'number' ? parseInt(e.target.value) || 0 : e.target.value)}
              />
            </div>
          ))}

          <div>
            <label className="field-label">Category</label>
            <select className="input-field" value={form.category} onChange={(e) => set('category', e.target.value)}>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="field-label">Deal Type</label>
            <select className="input-field" value={form.deal_type} onChange={(e) => set('deal_type', e.target.value)}>
              {['LLC (Partnership)', 'LLC (S-Corp)', 'Real Estate', 'C-Corporation', 'Securities / IP', 'Multiple'].map((d) => <option key={d}>{d}</option>)}
            </select>
          </div>

          <div>
            <label className="field-label">Status</label>
            <select className="input-field" value={form.status} onChange={(e) => set('status', e.target.value)}>
              {STATUSES.filter((s) => s !== 'All').map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <label className="field-label">Next Action</label>
            <input
              className="input-field"
              type="text"
              placeholder="e.g. Send executive brief this week"
              value={form.next_action}
              onChange={(e) => set('next_action', e.target.value)}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
          <button className="btn-ghost" onClick={onClose} disabled={saving}>Cancel</button>
          <button className="btn-gold" onClick={() => onSave(form)} disabled={saving || !form.name.trim()}>
            {saving ? <><div className="spinner" style={{ width: '13px', height: '13px', margin: 0 }} />Saving...</> : 'Save Contact'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ReferralPipelinePage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('All');
  const [status, setStatus] = useState('All');
  const [dealType, setDealType] = useState('All');
  const [minPriority, setMinPriority] = useState('');
  const [showAttribution, setShowAttribution] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [modalSaving, setModalSaving] = useState(false);

  const loadLeads = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('pipeline_leads')
        .select('*')
        .order('priority', { ascending: false });

      if (error) throw error;
      setLeads((data ?? []) as Lead[]);
    } catch {
      setLeads([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load-on-mount fetch; setState happens after the await, not synchronously.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { loadLeads(); }, [loadLeads]);

  const saveLead = async (form: FormLead) => {
    setModalSaving(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (editingLead) {
        const { data } = await supabase
          .from('pipeline_leads')
          .update({ ...form, updated_at: new Date().toISOString() })
          .eq('id', editingLead.id)
          .select()
          .single();
        if (data) {
          setLeads((prev) => prev.map((l) => l.id === editingLead.id ? data as Lead : l));
        }
      } else {
        const { data } = await supabase
          .from('pipeline_leads')
          .insert({ ...form, user_id: user.id })
          .select()
          .single();
        if (data) {
          setLeads((prev) => [data as Lead, ...prev]);
        }
      }
    } catch {
      if (editingLead) {
        setLeads((prev) => prev.map((l) => l.id === editingLead.id ? { ...l, ...form } : l));
      } else {
        setLeads((prev) => [{ ...form, id: Date.now().toString() }, ...prev]);
      }
    } finally {
      toast(editingLead ? `${form.name} updated` : `${form.name} added to pipeline`);
      setModalSaving(false);
      setShowModal(false);
      setEditingLead(null);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    setLeads((prev) => prev.map((l) => l.id === id ? { ...l, status: newStatus } : l));
    toast(`Status → ${newStatus}`, 'info');
    try {
      const supabase = createClient();
      await supabase.from('pipeline_leads').update({ status: newStatus, updated_at: new Date().toISOString() }).eq('id', id);
    } catch {}
  };

  const deleteLead = async (lead: Lead) => {
    if (!confirm(`Remove ${lead.name} from your pipeline?`)) return;
    setLeads((prev) => prev.filter((l) => l.id !== lead.id));
    toast(`${lead.name} removed`, 'info');
    try {
      const supabase = createClient();
      await supabase.from('pipeline_leads').delete().eq('id', lead.id);
    } catch {}
  };

  const openAdd = () => { setEditingLead(null); setShowModal(true); };
  const openEdit = (lead: Lead) => { setEditingLead(lead); setShowModal(true); };

  const router = useRouter();

  function launchCalc(l: Lead) {
    const match = l.tx_range.match(/[\d.]+/);
    const dollars = match ? String(Math.round(parseFloat(match[0]) * 1_000_000)) : '';
    localStorage.setItem('tsos-calc-prefill', JSON.stringify({ prospectName: l.name, salePrice: dollars, entityStructure: l.deal_type }));
    toast(`Opening Calculator for ${l.name}`, 'info');
    router.push('/deal-calculator');
  }

  function launchBrief(l: Lead) {
    toast(`Opening Executive Brief for ${l.name}`, 'info');
    router.push(`/executive-briefs?name=${encodeURIComponent(l.name)}&txValue=${encodeURIComponent(l.tx_range)}`);
  }

  function launchEmail(l: Lead) {
    toast(`Opening Outreach for ${l.name}`, 'info');
    router.push(`/marketing-studio?name=${encodeURIComponent(l.name)}&category=${encodeURIComponent(l.category)}`);
  }

  function launchPPT(l: Lead) {
    localStorage.setItem('tsos-deck-prefill', JSON.stringify({ prospectName: l.name, structure: l.deal_type, txSize: l.tx_range }));
    toast(`Opening PowerPoint for ${l.name}`, 'info');
    router.push('/powerpoint-builder');
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    const mp = minPriority ? parseInt(minPriority) : 0;
    return leads.filter((l) => {
      const matchSearch = !q || l.name.toLowerCase().includes(q) || l.company.toLowerCase().includes(q) || l.location.toLowerCase().includes(q) || l.referred_by.toLowerCase().includes(q);
      const matchCat = cat === 'All' || l.category === cat;
      const matchStatus = status === 'All' || l.status === status;
      const matchType = dealType === 'All' || l.deal_type === dealType;
      const matchPriority = l.priority >= mp;
      return matchSearch && matchCat && matchStatus && matchType && matchPriority;
    });
  }, [leads, search, cat, status, dealType, minPriority]);

  const summaryStats = [
    { label: 'Active Opportunities', value: leads.filter((l) => l.status === 'Active Opportunity').length, color: 'var(--success)' },
    { label: 'Meetings Scheduled', value: leads.filter((l) => l.status === 'Meeting Scheduled').length, color: 'var(--gold)' },
    { label: 'Follow-Ups Due', value: leads.filter((l) => ['Contacted', 'Executive Brief Sent', 'Proposal Sent'].includes(l.status)).length, color: 'var(--warning)' },
    { label: 'New Leads', value: leads.filter((l) => l.status === 'New Lead').length, color: 'var(--blue)' },
  ];

  const referralSources = useMemo(() => {
    const counts: Record<string, number> = {};
    leads.forEach((l) => {
      const src = l.referred_by || 'Direct / Self-Sourced';
      const key = src.split(',')[0].trim();
      counts[key] = (counts[key] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 8);
  }, [leads]);

  const dealTypeBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    leads.forEach((l) => { counts[l.deal_type] = (counts[l.deal_type] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [leads]);

  return (
    <div style={{ maxWidth: '1360px' }}>
      {showModal && (
        <LeadModal
          initial={editingLead ? { ...editingLead } : { ...BLANK_LEAD }}
          onSave={saveLead}
          onClose={() => { setShowModal(false); setEditingLead(null); }}
          saving={modalSaving}
        />
      )}

      <div style={{ marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h1 className="section-title" style={{ fontSize: '1.375rem' }}>Referral Pipeline</h1>
            <p className="section-subtitle" style={{ maxWidth: '580px' }}>
              Track all open cases across private equity, investment bankers, brokers, CPAs, and direct prospects. Add, update, and manage your real pipeline.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <span className="badge badge-gold">{leads.length} Contacts</span>
            <button
              className={showAttribution ? 'btn-gold' : 'btn-secondary'}
              style={{ fontSize: '0.72rem', padding: '0.35rem 0.75rem' }}
              onClick={() => setShowAttribution((v) => !v)}
            >
              {showAttribution ? 'Hide' : 'Show'} Attribution
            </button>
            <button className="btn-gold" style={{ fontSize: '0.72rem', padding: '0.35rem 0.875rem' }} onClick={openAdd}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: '4px' }}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Add Contact
            </button>
          </div>
        </div>
      </div>

      {/* Summary stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.875rem', marginBottom: '1.25rem' }}>
        {summaryStats.map((s) => (
          <div key={s.label} className="card-sm" style={{ borderLeft: `3px solid ${s.color}` }}>
            <div className="stat-label" style={{ marginBottom: '0.375rem' }}>{s.label}</div>
            <div className="stat-value" style={{ fontSize: '1.625rem', color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '0.6625rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>of {leads.length} total</div>
          </div>
        ))}
      </div>

      {/* Referral Attribution */}
      {showAttribution && (
        <div className="card fade-in" style={{ marginBottom: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '1rem' }}>Referral Attribution</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div>
              <div style={{ fontSize: '0.6375rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.75rem' }}>Top Referral Sources</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {referralSources.map(([source, count]) => {
                  const pct = Math.round((count / leads.length) * 100);
                  return (
                    <div key={source}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.775rem', marginBottom: '0.2rem' }}>
                        <span style={{ color: 'var(--text-secondary)', fontWeight: source === 'Direct / Self-Sourced' ? 400 : 600 }}>{source}</span>
                        <span style={{ color: 'var(--text-muted)' }}>{count} contact{count !== 1 ? 's' : ''}</span>
                      </div>
                      <div style={{ height: '4px', backgroundColor: 'var(--bg-input)', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, backgroundColor: source === 'Direct / Self-Sourced' ? 'var(--border)' : 'var(--gold)', borderRadius: '2px' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.6375rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.75rem' }}>Pipeline by Deal Structure</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {dealTypeBreakdown.map(([type, count]) => {
                  const pct = Math.round((count / leads.length) * 100);
                  const cls = dealTypeBadge[type] ?? 'badge-gray';
                  return (
                    <div key={type}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.775rem', marginBottom: '0.2rem' }}>
                        <span className={`badge ${cls}`} style={{ fontSize: '0.6rem' }}>{type}</span>
                        <span style={{ color: 'var(--text-muted)' }}>{count} ({pct}%)</span>
                      </div>
                      <div style={{ height: '4px', backgroundColor: 'var(--bg-input)', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, backgroundColor: 'var(--blue)', borderRadius: '2px' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card" style={{ padding: '0.875rem 1.125rem', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '180px', position: 'relative' }}>
            <svg style={{ position: 'absolute', left: '0.625rem', top: '50%', transform: 'translateY(-50%)' }} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input className="input-field" style={{ paddingLeft: '2rem' }} placeholder="Search name, company, location, referral..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          {[
            { label: 'Category', val: cat, setter: setCat, opts: CATS },
            { label: 'Status', val: status, setter: setStatus, opts: STATUSES },
            { label: 'Deal Type', val: dealType, setter: setDealType, opts: DEAL_TYPES },
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
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{filtered.length} of {leads.length}</div>
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <div className="spinner" style={{ margin: '0 auto 0.75rem' }} />
            Loading pipeline...
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Contact</th>
                  <th>Company</th>
                  <th>Category</th>
                  <th>Location</th>
                  <th>Tx Range</th>
                  <th>Deal Type</th>
                  <th>Referred By</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'center' }}>Priority</th>
                  <th>Last Contact</th>
                  <th>Next Action</th>
                  <th style={{ width: '150px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0
                  ? <tr><td colSpan={12} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                      {leads.length === 0
                        ? <div>
                            <div style={{ marginBottom: '0.75rem', opacity: 0.3 }}>
                              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5" style={{ margin: '0 auto' }}>
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                                <line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/>
                              </svg>
                            </div>
                            <div style={{ fontWeight: 600, marginBottom: '0.375rem' }}>Your pipeline is empty</div>
                            <div style={{ fontSize: '0.8rem', marginBottom: '1rem' }}>Add your first contact to get started</div>
                            <button className="btn-gold" style={{ fontSize: '0.75rem' }} onClick={openAdd}>Add First Contact →</button>
                          </div>
                        : 'No contacts match current filters.'}
                    </td></tr>
                  : filtered.map((l) => (
                    <tr key={l.id}>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{l.name}</div>
                      </td>
                      <td style={{ maxWidth: '150px', fontSize: '0.775rem' }}>{l.company}</td>
                      <td><span className="badge badge-blue" style={{ fontSize: '0.6rem', whiteSpace: 'nowrap' }}>{l.category}</span></td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>{l.location}</td>
                      <td style={{ fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.775rem', whiteSpace: 'nowrap' }}>{l.tx_range}</td>
                      <td><span className={`badge ${dealTypeBadge[l.deal_type] ?? 'badge-gray'}`} style={{ fontSize: '0.6rem', whiteSpace: 'nowrap' }}>{l.deal_type}</span></td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.7rem', maxWidth: '130px', lineHeight: 1.4 }}>
                        {l.referred_by || <span style={{ opacity: 0.45 }}>Direct</span>}
                      </td>
                      <td>
                        <select
                          value={l.status}
                          onChange={(e) => updateStatus(l.id, e.target.value)}
                          className={`badge ${statusBadge[l.status] ?? 'badge-gray'}`}
                          style={{ fontSize: '0.6rem', cursor: 'pointer', background: 'none', border: 'none', appearance: 'none', whiteSpace: 'nowrap' }}
                        >
                          {STATUSES.filter((s) => s !== 'All').map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span style={{ fontSize: '0.875rem', fontWeight: 700, color: priorityColor(l.priority) }}>{l.priority}</span>
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>{l.last_contact}</td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', maxWidth: '160px' }}>{l.next_action}</td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                          <div style={{ display: 'flex', gap: '0.15rem' }}>
                            <button onClick={() => launchCalc(l)} title="Run Calculator" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.2rem 0.25rem', color: 'var(--gold)', borderRadius: '0.25rem' }}>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="12" y2="14"/><line x1="8" y1="18" x2="12" y2="18"/></svg>
                            </button>
                            <button onClick={() => launchBrief(l)} title="Executive Brief" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.2rem 0.25rem', color: 'var(--blue)', borderRadius: '0.25rem' }}>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                            </button>
                            <button onClick={() => launchEmail(l)} title="Outreach Email" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.2rem 0.25rem', color: 'var(--success)', borderRadius: '0.25rem' }}>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                            </button>
                            <button onClick={() => launchPPT(l)} title="PowerPoint Deck" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.2rem 0.25rem', color: 'var(--purple)', borderRadius: '0.25rem' }}>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                            </button>
                          </div>
                          <div style={{ display: 'flex', gap: '0.15rem' }}>
                            <button onClick={() => openEdit(l)} title="Edit" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem', color: 'var(--text-muted)', borderRadius: '0.25rem' }}>
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                            </button>
                            <button onClick={() => deleteLead(l)} title="Delete" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem', color: 'var(--text-muted)', borderRadius: '0.25rem' }}>
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
