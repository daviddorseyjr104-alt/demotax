const workflows = [
  { process: 'Excel Tax Models', pain: 'Repetitive calculations, version conflicts, manual formatting, hard to share', opportunity: 'Standardized calculator with automated summaries and PDF export', timeSaved: '5–10 hrs/week', priority: 'High', tool: 'AI Deal Review + Excel Import', status: 'Ready to Automate' },
  { process: 'Client Intake Forms', pain: 'Email-based collection, missing data, inconsistent format per prospect', opportunity: 'Structured intake form with auto-generated summary, gap checklist, and deal readiness score', timeSaved: '3–5 hrs/week', priority: 'High', tool: 'Client Intake Automation', status: 'Automated' },
  { process: 'PowerPoint Decks', pain: 'Manual deck creation per prospect, reformatting same content repeatedly', opportunity: 'Template-driven 8-slide outline generator from deal inputs with speaker notes', timeSaved: '4–8 hrs/week', priority: 'High', tool: 'PowerPoint Builder', status: 'Automated' },
  { process: 'Referral Partner Marketing', pain: 'One-off emails per partner, no consistent messaging, no follow-up tracking', opportunity: 'Audience-specific email, LinkedIn, and call script generated in seconds', timeSaved: '3–6 hrs/week', priority: 'High', tool: 'Marketing Studio', status: 'Automated' },
  { process: 'Executive Brief Generation', pain: 'Manual drafting per client, inconsistent quality, hours per brief', opportunity: 'Input-driven brief generator with situation overview, planning issues, next steps', timeSaved: '3–5 hrs/brief', priority: 'High', tool: 'Executive Briefs Module', status: 'Automated' },
  { process: 'Meeting Notes → Follow-Up', pain: 'Manual post-call documentation, missed action items, delayed follow-ups', opportunity: 'Rough notes → summary, concerns, action items, follow-up email, CRM task', timeSaved: '1–2 hrs/call', priority: 'High', tool: 'Meeting Notes Automation', status: 'Automated' },
  { process: 'Lead Research', pain: 'Manual LinkedIn browsing, notes in spreadsheets, no centralized view', opportunity: 'Centralized pipeline with search, filter, priority scoring, and next actions', timeSaved: '4–6 hrs/week', priority: 'High', tool: 'Referral Pipeline module', status: 'Automated' },
  { process: 'Investment Banker Outreach', pain: 'Generic emails, no tailored messaging for IB context, low response rates', opportunity: 'IB-specific email suite with referral partnership framing and sophisticated tone', timeSaved: '2–4 hrs/week', priority: 'High', tool: 'Marketing Studio — IB template', status: 'Ready to Automate' },
  { process: 'Broker Relationship Management', pain: 'Inconsistent touchpoints, no educational content library for brokers', opportunity: 'Broker-specific educational email and webinar invite templates on demand', timeSaved: '2–3 hrs/week', priority: 'Medium', tool: 'Marketing Studio — Broker template', status: 'Ready to Automate' },
  { process: 'CRM Follow-Ups', pain: 'Manual reminders, missed touchpoints, no pipeline stage visibility', opportunity: 'Automated follow-up scheduling tied to pipeline stages and CRM notes', timeSaved: '2–4 hrs/week', priority: 'Medium', tool: 'CRM workflow automation', status: 'Partially Automated' },
  { process: 'Document Organization', pain: 'Files scattered across email, drives, local folders, no naming convention', opportunity: 'Standardized deal folders, auto-labeling, file-linked deal records', timeSaved: '1–3 hrs/week', priority: 'Medium', tool: 'Document management + structure', status: 'Manual' },
  { process: 'Educational Content', pain: 'Ad hoc writing, no reusable library for referral education', opportunity: 'Audience-specific educational templates for nurture and webinar sequences', timeSaved: '2–4 hrs/week', priority: 'Medium', tool: 'Marketing Studio + content library', status: 'Partially Automated' },
  { process: 'Webinar Follow-Ups', pain: 'Manual post-webinar outreach, inconsistent follow-up cadence', opportunity: 'Automated post-event email sequence with personalized next-step offers', timeSaved: '2–3 hrs/event', priority: 'Medium', tool: 'Marketing automation + CRM', status: 'Manual' },
  { process: 'Referral Tracking', pain: 'No formal system for tracking who referred whom and deal outcomes', opportunity: 'Referral attribution module with partner dashboard and deal linkage', timeSaved: '1–2 hrs/week', priority: 'Medium', tool: 'Referral Pipeline module', status: 'Partially Automated' },
  { process: 'Compliance Disclaimers', pain: 'Manually added to each document, prone to omission or outdated language', opportunity: 'Standardized disclaimer library auto-appended to all output documents', timeSaved: '30 min/week', priority: 'Low', tool: 'Template disclaimer injection', status: 'Automated' },
];

const priorityBadge: Record<string, string> = { High: 'badge-red', Medium: 'badge-warning', Low: 'badge-gray' };
const statusBadge: Record<string, { cls: string; color: string }> = {
  Automated: { cls: 'badge-green', color: 'var(--success)' },
  'Ready to Automate': { cls: 'badge-gold', color: 'var(--gold)' },
  'Partially Automated': { cls: 'badge-blue', color: 'var(--blue)' },
  Manual: { cls: 'badge-gray', color: 'var(--text-muted)' },
};

const top3 = [
  { title: 'Excel Model Standardization', detail: 'Converts repetitive calculation workflows into a structured deal review tool. Highest time save per use.', time: '5–10 hrs/week', status: 'Ready to Automate' },
  { title: 'Executive Brief Generation', detail: 'Replaces hours of manual drafting with a structured input → polished output workflow per client.', time: '3–5 hrs/brief', status: 'Automated' },
  { title: 'Referral Partner Outreach', detail: 'Produces high-quality, audience-specific emails, LinkedIn messages, and call scripts in seconds.', time: '3–6 hrs/week', status: 'Automated' },
];

export default function WorkflowAuditPage() {
  const automatedCount = workflows.filter((w) => w.status === 'Automated').length;
  const readyCount = workflows.filter((w) => w.status === 'Ready to Automate').length;
  const partialCount = workflows.filter((w) => w.status === 'Partially Automated').length;
  const manualCount = workflows.filter((w) => w.status === 'Manual').length;

  return (
    <div style={{ maxWidth: '1280px' }}>
      <div style={{ marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h1 className="section-title" style={{ fontSize: '1.375rem' }}>AI Workflow Audit</h1>
            <p className="section-subtitle" style={{ maxWidth: '560px' }}>
              Identify where manual work can be converted into repeatable automation. Review current pain points, automation opportunities, and estimated time savings across your operation.
            </p>
          </div>
          <span className="internal-tag">Internal Review Only</span>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.875rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Automated', value: automatedCount, color: 'var(--success)' },
          { label: 'Ready to Automate', value: readyCount, color: 'var(--gold)' },
          { label: 'Partially Automated', value: partialCount, color: 'var(--blue)' },
          { label: 'Still Manual', value: manualCount, color: 'var(--red)' },
        ].map((s) => (
          <div key={s.label} className="card-sm" style={{ borderLeft: `3px solid ${s.color}` }}>
            <div className="stat-label" style={{ marginBottom: '0.375rem' }}>{s.label}</div>
            <div className="stat-value" style={{ fontSize: '1.625rem', color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '0.6625rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>of {workflows.length} processes</div>
          </div>
        ))}
      </div>

      {/* Time savings banner */}
      <div className="card" style={{ padding: '1.125rem 1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
        <div>
          <div className="stat-label" style={{ marginBottom: '0.25rem' }}>Est. Weekly Time Recovery</div>
          <div style={{ fontSize: '1.625rem', fontWeight: 800, color: 'var(--gold)' }}>30–60+ hours/week</div>
        </div>
        <div style={{ width: '1px', height: '40px', backgroundColor: 'var(--border)' }} />
        <div>
          <div className="stat-label" style={{ marginBottom: '0.25rem' }}>Processes Audited</div>
          <div style={{ fontSize: '1.625rem', fontWeight: 800, color: 'var(--text-primary)' }}>{workflows.length}</div>
        </div>
        <div style={{ width: '1px', height: '40px', backgroundColor: 'var(--border)' }} />
        <div>
          <div className="stat-label" style={{ marginBottom: '0.25rem' }}>High Priority Processes</div>
          <div style={{ fontSize: '1.625rem', fontWeight: 800, color: 'var(--red)' }}>{workflows.filter((w) => w.priority === 'High').length}</div>
        </div>
        <span className="badge badge-gold" style={{ marginLeft: 'auto' }}>Illustrative Estimates</span>
      </div>

      {/* Top 3 */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '1rem' }}>
          Top 3 Automation Opportunities
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
          {top3.map((item, i) => (
            <div key={i} style={{ padding: '1rem', backgroundColor: 'var(--bg-input)', borderRadius: '0.625rem', border: '1px solid var(--border)', borderLeft: '3px solid var(--gold)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <div style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>#{i + 1}</div>
                <span className={`badge ${statusBadge[item.status]?.cls ?? 'badge-gray'}`} style={{ fontSize: '0.55rem' }}>{item.status}</span>
              </div>
              <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.375rem' }}>{item.title}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.55, marginBottom: '0.5rem' }}>{item.detail}</div>
              <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--success)' }}>{item.time} saved</div>
            </div>
          ))}
        </div>
      </div>

      {/* Full audit table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ minWidth: '160px' }}>Process</th>
                <th style={{ minWidth: '220px' }}>Current Manual Pain</th>
                <th style={{ minWidth: '220px' }}>Automation Opportunity</th>
                <th style={{ minWidth: '120px' }}>Est. Time Saved</th>
                <th>Priority</th>
                <th style={{ minWidth: '180px' }}>Suggested Tool</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {workflows.map((w) => (
                <tr key={w.process}>
                  <td><div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.8rem' }}>{w.process}</div></td>
                  <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.55 }}>{w.pain}</td>
                  <td style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>{w.opportunity}</td>
                  <td><span style={{ fontWeight: 700, color: 'var(--success)', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{w.timeSaved}</span></td>
                  <td><span className={`badge ${priorityBadge[w.priority] ?? 'badge-gray'}`} style={{ fontSize: '0.6rem' }}>{w.priority}</span></td>
                  <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{w.tool}</td>
                  <td>
                    <span className={`badge ${statusBadge[w.status]?.cls ?? 'badge-gray'}`} style={{ fontSize: '0.6rem', whiteSpace: 'nowrap' }}>
                      {w.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Insight */}
      <div className="card" style={{ marginTop: '1.5rem' }}>
        <div className="section-title" style={{ fontSize: '0.9375rem', marginBottom: '1rem' }}>Strategic Assessment</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          {[
            { title: 'Why Automation Matters Here', items: ['Every hour in repetitive tasks is an hour not spent sourcing deals or deepening referral relationships', 'Inconsistent outputs (decks, emails, models) erode trust with sophisticated referral partners', 'Manual pipelines create invisible follow-up gaps — especially in long sales cycles', 'Automation creates leverage: the same expert, dramatically more throughput'] },
            { title: 'What This Platform Already Automates', items: ['Excel tax model → structured deal review → executive memo', 'Rough call notes → summary, action items, follow-up email, CRM task', 'Prospect data → 8-slide PowerPoint outline with speaker notes', 'Audience profile → email, LinkedIn message, and call script in seconds'] },
          ].map((section) => (
            <div key={section.title} style={{ padding: '1rem', backgroundColor: 'var(--bg-input)', borderRadius: '0.5rem', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.75rem' }}>{section.title}</div>
              <ul style={{ margin: 0, padding: '0 0 0 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {section.items.map((item, i) => <li key={i} style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{item}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
