const workflows = [
  { process: 'Zoom Call → Calculator', pain: 'After a 15-min call, manually transcribe notes, open the right Excel file (5 different models), re-enter all data', opportunity: 'Zoom transcript auto-extracts the 6–7 key fields and pre-fills the correct asset structure calculator — no re-entry', timeSaved: '45–60 min/call', priority: 'High', tool: 'Meeting Notes + Deal Calculator (Phase 2)', status: 'Ready to Automate' },
  { process: 'Presentation Prep (5 structures)', pain: '5 different Excel calculators and PowerPoint templates — each manually updated and formatted per deal', opportunity: 'Structure-specific calculator auto-generates the right executive summary and feeds directly into the matching PowerPoint template', timeSaved: '5+ hrs → under 1 hr/deck', priority: 'High', tool: 'Deal Calculator + PowerPoint Builder', status: 'Automated' },
  { process: 'Banker One-Page Summary', pain: 'After each call, manually write and email a one-page summary to the referring banker — often delayed or skipped', opportunity: 'Print Banker One-Pager button generates a formatted, print-ready summary from calculator inputs in seconds', timeSaved: '30–60 min/deal', priority: 'High', tool: 'Deal Calculator → Print One-Pager', status: 'Automated' },
  { process: 'Client Intake & Triage', pain: 'Unstructured phone call → manual notes → email back-and-forth to fill in gaps before analysis can begin', opportunity: 'Structured intake form captures all 7 critical fields, scores deal readiness, and flows directly into the Deal Calculator', timeSaved: '1–2 hrs/prospect', priority: 'High', tool: 'Client Intake Automation', status: 'Automated' },
  { process: 'Post-Call Documentation', pain: 'Manual post-call notes, missed action items, follow-up emails written from scratch, CRM entry done later or never', opportunity: 'Rough call notes → clean summary, action items, follow-up email draft, and CRM task in under 2 minutes', timeSaved: '45–90 min/call', priority: 'High', tool: 'Meeting Notes Automation', status: 'Automated' },
  { process: 'Executive Memos & Briefs', pain: 'Each brief drafted manually from scratch — 2–4 hours per client for a polished situation overview and next steps', opportunity: 'Structured input → 5-section executive brief with situation overview, key planning issues, discovery questions, and next steps', timeSaved: '2–4 hrs/brief', priority: 'High', tool: 'Executive Briefs Module', status: 'Automated' },
  { process: 'Intermediary Education Materials', pain: '1/3 of weekly time spent developing training materials, educational notes, and webinar content for bankers and brokers', opportunity: 'Audience-specific educational email, LinkedIn post, call script, and follow-up generated in seconds — reusable across 2,000 contacts', timeSaved: '3–5 hrs/campaign', priority: 'High', tool: 'Referral Outreach Studio', status: 'Partially Automated' },
  { process: '40-Case Pipeline Tracking', pain: 'Manually tracking 40 open cases across calls, emails, and HubSpot — unclear which cases need attention today', opportunity: 'Searchable pipeline with priority scoring, next-action labels, deal stage tracking, and one-click launch of Calculator, Briefs, Emails, and PPT for any contact', timeSaved: '2–4 hrs/week', priority: 'High', tool: 'Referral Pipeline module', status: 'Automated' },
  { process: 'HubSpot CRM Sync', pain: 'Marketing and drip outreach run in HubSpot — but platform-generated outputs (memos, summaries) are not connected to HubSpot contacts', opportunity: 'Deal Calculator and Meeting Notes push notes, tasks, and deal stage updates to HubSpot contact records automatically via Private App API', timeSaved: '1–2 hrs/week', priority: 'Medium', tool: 'HubSpot Private App API — sync-deal + sync-meeting routes', status: 'Automated' },
  { process: 'Zoom Recording → Client File', pain: 'Zoom call recordings exist but are not linked to the client file or used to populate the calculator automatically', opportunity: 'Connect Zoom via Server-to-Server OAuth — Meeting Notes auto-lists recent recordings, one click imports the transcript and runs the full follow-up package', timeSaved: '30–45 min/call', priority: 'Medium', tool: 'Zoom Server-to-Server API + Meeting Notes', status: 'Automated' },
  { process: 'Document Filing & Naming', pain: 'Client documents scattered across email, Google Drive, and local folders — no consistent naming convention or deal structure', opportunity: 'Standardized deal folders per client with auto-labeling: intake form, calculator output, deck, one-pager, meeting notes', timeSaved: '30–60 min/week', priority: 'Medium', tool: 'Document structure template', status: 'Manual' },
  { process: 'Post-Webinar Follow-Up', pain: 'After educational webinars, follow-up outreach is written one by one or handled inconsistently', opportunity: 'Automated post-webinar email sequence with personalized next-step offers based on audience type', timeSaved: '2–3 hrs/event', priority: 'Low', tool: 'HubSpot drip sequence', status: 'Partially Automated' },
];

const priorityBadge: Record<string, string> = { High: 'badge-red', Medium: 'badge-warning', Low: 'badge-gray' };
const statusBadge: Record<string, { cls: string; color: string }> = {
  Automated: { cls: 'badge-green', color: 'var(--success)' },
  'Ready to Automate': { cls: 'badge-gold', color: 'var(--gold)' },
  'Partially Automated': { cls: 'badge-blue', color: 'var(--blue)' },
  Manual: { cls: 'badge-gray', color: 'var(--text-muted)' },
};

const top3 = [
  { title: 'Presentation Prep (5 Deal Structures)', detail: 'The right calculator auto-feeds the right PowerPoint template. Presentation prep went from 6 hours to under 1 hour per deal — already partially realized.', time: '5 hrs → under 1 hr/deck', status: 'Automated' },
  { title: 'Zoom Call → One-Pager to Banker', detail: 'Zoom transcript pre-fills the 6–7 fields, calculator runs, and the banker one-pager prints in seconds. The entire post-call workflow becomes one button.', time: '45–60 min/call', status: 'Ready to Automate' },
  { title: 'Post-Call Documentation', detail: 'Rough call notes become a clean summary, action list, follow-up email, and CRM task — replacing 45–90 minutes of manual post-call admin per conversation.', time: '45–90 min/call', status: 'Automated' },
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
          <div className="stat-label" style={{ marginBottom: '0.25rem' }}>Biggest Single Gain</div>
          <div style={{ fontSize: '1.625rem', fontWeight: 800, color: 'var(--text-primary)' }}>5 hrs → &lt;1</div>
          <div style={{ fontSize: '0.6625rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Presentation prep, per deck</div>
        </div>
        <div style={{ width: '1px', height: '40px', backgroundColor: 'var(--border)' }} />
        <div>
          <div className="stat-label" style={{ marginBottom: '0.25rem' }}>High Priority</div>
          <div style={{ fontSize: '1.625rem', fontWeight: 800, color: 'var(--red)' }}>{workflows.filter((w) => w.priority === 'High').length}</div>
          <div style={{ fontSize: '0.6625rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>of {workflows.length} processes</div>
        </div>
        <span className="badge badge-gold" style={{ marginLeft: 'auto' }}>Internal Estimates</span>
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
