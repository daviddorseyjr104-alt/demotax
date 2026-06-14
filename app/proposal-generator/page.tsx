'use client';

import { useState } from 'react';
import { toast } from '@/components/Toast';

type Form = {
  prospectType: string;
  prospectName: string;
  transactionSize: string;
  industryAsset: string;
  painPoint: string;
  tone: string;
};

const init: Form = {
  prospectType: 'Business Owner',
  prospectName: '',
  transactionSize: '',
  industryAsset: '',
  painPoint: 'Large tax bill',
  tone: 'Sophisticated',
};

function buildProposal(f: Form) {
  const name = f.prospectName || '[Prospect Name]';
  const size = f.transactionSize || '[Transaction Size]';
  const asset = f.industryAsset || '[Industry/Asset Class]';
  const pain = f.painPoint.toLowerCase();
  const type = f.prospectType;
  const tone = f.tone;

  const toneAdj: Record<string, string> = {
    Conservative: 'methodical and evidence-based',
    Sophisticated: 'institutional-grade',
    Educational: 'clear and educational',
    Direct: 'straightforward',
    'Relationship-first': 'relationship-focused',
  };
  const ta = toneAdj[tone] ?? 'professional';

  return {
    executive: `${name} is a ${type.toLowerCase()} with a ${size} ${asset} transaction, facing a ${pain} challenge as a primary consideration in this exit planning process. This proposal outlines a ${ta} framework for evaluating structured tax deferral strategies as a component of a comprehensive exit plan. Our firm specializes in working alongside existing legal, accounting, and financial advisors to introduce deferral structures that may help reduce or delay a significant portion of the anticipated tax exposure — allowing principals to preserve capital, maximize optionality, and facilitate more deliberate deployment of proceeds.`,

    valueProp: `For ${type}s navigating ${pain} on major transactions, the difference between a reactive exit and a structured exit can translate to millions of dollars in retained capital. Our role is not to replace existing advisors — it is to introduce a coordinated tax deferral review at the right moment in the transaction timeline. We bring institutional frameworks, proven structures, and a process-driven approach to a conversation that is often overlooked until it is too late. Our engagement model is designed to be additive: we work in parallel with your CPA, attorney, and wealth manager to create a cohesive, defensible strategy.`,

    slides: [
      { num: 1, title: 'Situation Overview', desc: `Introduce ${name}'s current position: ${size} transaction in ${asset}, anticipated closing timeline, and the decision-making context that makes this moment critical.` },
      { num: 2, title: 'Transaction Context', desc: `Detail the asset class, deal structure, buyer profile, and key transaction parameters. Establish the factual baseline for all downstream analysis.` },
      { num: 3, title: 'Tax Exposure Challenge', desc: `Quantify the estimated federal, state, and recapture exposure. Frame the ${pain} in the context of after-tax proceeds and long-term capital retention.` },
      { num: 4, title: 'Deferral Strategy Overview', desc: `Present the menu of applicable deferral structures — QOZ funds, charitable vehicles, installment arrangements, and other mechanisms — at a high level appropriate for this audience.` },
      { num: 5, title: `${type} Benefits`, desc: `Translate the deferral strategies into concrete outcomes: preserved liquidity, compounding advantage on deferred capital, estate planning alignment, and strategic flexibility.` },
      { num: 6, title: 'Implementation Process', desc: `Walk through the engagement timeline: discovery, diligence, structure selection, advisor coordination, documentation, and execution — with clear milestones and decision points.` },
      { num: 7, title: 'Professional Review & Compliance', desc: `Emphasize the role of the client's CPA, legal counsel, and qualified advisors in reviewing and implementing any strategy. Reinforce that this is a coordinated professional process.` },
      { num: 8, title: 'Next Steps', desc: `Propose a structured next step — a 30-minute discovery call, a document exchange, or an advisor introduction — that moves the engagement forward without pressure.` },
    ],

    talkingPoints: [
      `Lead with the ${pain} — acknowledge it as the defining challenge of the transaction, not a side issue.`,
      `Emphasize that deferral is not avoidance — these are established, compliant structures reviewed by qualified professionals.`,
      `Reference the transaction size (${size}) to signal fluency with deals of this magnitude.`,
      `Position your firm as a coordinator, not a disruptor — existing advisors stay in place and are enhanced, not replaced.`,
      `Close the conversation by anchoring on timing: the window for implementing deferral structures closes as the transaction progresses.`,
      `If the prospect is a ${type.toLowerCase()}, acknowledge the emotional weight of this exit alongside the financial mechanics.`,
    ],

    discoveryQuestions: [
      `What is the anticipated closing timeline, and has a definitive purchase agreement been executed?`,
      `Who is currently on your advisory team — CPA, legal counsel, wealth manager — and are they coordinated on the tax dimension?`,
      `Have you received a preliminary tax impact estimate from your CPA, and if so, what was the approximate exposure?`,
      `What is your intended use of the after-tax proceeds — reinvestment, retirement, estate distribution, or other?`,
      `Are there any entity structure considerations — C-corp, S-corp, partnership, LLC — that have been factored into the exit plan?`,
      `How familiar are you with structured deferral mechanisms, and have any been previously explored for this transaction?`,
    ],
  };
}

export default function ProposalGeneratorPage() {
  const [form, setForm] = useState<Form>(init);
  const [output, setOutput] = useState<ReturnType<typeof buildProposal> | null>(null);
  const [tab, setTab] = useState(0);

  const set = (k: keyof Form, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    setOutput(null);
  };

  const generate = () => { setOutput(buildProposal(form)); toast('Proposal draft generated'); };

  const tabs = ['Executive Summary', 'Value Proposition', 'Deck Outline', 'Talking Points', 'Discovery Qs'];

  return (
    <div style={{ maxWidth: '1150px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="section-title" style={{ fontSize: '1.5rem' }}>Proposal &amp; PowerPoint Generator</h1>
        <p className="section-subtitle">Convert deal context into client-ready summaries, slide outlines, and discovery frameworks.</p>
      </div>

      <div className="disclaimer" style={{ marginBottom: '1.75rem' }}>
        <strong style={{ color: 'var(--gold)' }}>Important:</strong>{' '}
        This platform supports workflow automation and document preparation. It does not provide tax, legal, accounting,
        investment, or financial advice. All strategies must be reviewed by qualified professionals.
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Inputs */}
        <div className="card">
          <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ color: 'var(--gold)' }}>01</span> Proposal Parameters
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label className="field-label">Prospect Type</label>
              <select className="input-field" value={form.prospectType} onChange={(e) => set('prospectType', e.target.value)}>
                {['Business Owner', 'Real Estate Owner', 'Private Equity Partner', 'Investment Banker', 'Real Estate Broker'].map((v) => <option key={v}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="field-label">Prospect Name</label>
              <input className="input-field" placeholder="e.g. Jonathan Marsh" value={form.prospectName} onChange={(e) => set('prospectName', e.target.value)} />
            </div>
            <div>
              <label className="field-label">Transaction Size</label>
              <input className="input-field" placeholder="e.g. $85M" value={form.transactionSize} onChange={(e) => set('transactionSize', e.target.value)} />
            </div>
            <div>
              <label className="field-label">Industry or Asset Class</label>
              <input className="input-field" placeholder="e.g. Multifamily Real Estate" value={form.industryAsset} onChange={(e) => set('industryAsset', e.target.value)} />
            </div>
            <div>
              <label className="field-label">Main Pain Point</label>
              <select className="input-field" value={form.painPoint} onChange={(e) => set('painPoint', e.target.value)}>
                {['Large tax bill', 'Need liquidity', 'Estate planning', 'Business exit', 'Real estate portfolio sale', 'Referral partner education'].map((v) => <option key={v}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="field-label">Desired Tone</label>
              <select className="input-field" value={form.tone} onChange={(e) => set('tone', e.target.value)}>
                {['Conservative', 'Sophisticated', 'Educational', 'Direct', 'Relationship-first'].map((v) => <option key={v}>{v}</option>)}
              </select>
            </div>
            <button className="btn-gold" style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }} onClick={generate}>
              Generate Proposal Draft
            </button>
          </div>
        </div>

        {/* Output */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {output ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
                  {tabs.map((t, i) => (
                    <button key={t} onClick={() => setTab(i)} style={{
                      padding: '0.4rem 0.875rem', borderRadius: '0.375rem', fontSize: '0.75rem',
                      fontWeight: 600, cursor: 'pointer', border: '1px solid',
                      borderColor: tab === i ? 'var(--gold)' : 'var(--border)',
                      backgroundColor: tab === i ? 'var(--gold-bg)' : 'transparent',
                      color: tab === i ? 'var(--gold)' : 'var(--text-muted)',
                    }}>
                      {t}
                    </button>
                  ))}
                </div>
                <span className="badge badge-gold">Generated</span>
              </div>

              {/* Tab content */}
              <div className="output-panel">
                {tab === 0 && (
                  <div>
                    <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>A. Executive Summary</div>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0 }}>{output.executive}</p>
                  </div>
                )}
                {tab === 1 && (
                  <div>
                    <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>B. Value Proposition</div>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0 }}>{output.valueProp}</p>
                  </div>
                )}
                {tab === 2 && (
                  <div>
                    <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1rem' }}>C. Suggested 8-Slide Deck Outline</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {output.slides.map((slide) => (
                        <div key={slide.num} style={{ display: 'flex', gap: '1rem', padding: '0.875rem', backgroundColor: 'var(--bg-card)', borderRadius: '0.5rem', border: '1px solid var(--border)' }}>
                          <div style={{
                            width: '28px', height: '28px', borderRadius: '50%',
                            backgroundColor: 'var(--gold-bg)', border: '1px solid var(--gold-border)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0, fontSize: '0.6875rem', fontWeight: 700, color: 'var(--gold)',
                          }}>
                            {slide.num}
                          </div>
                          <div>
                            <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Slide {slide.num}: {slide.title}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>{slide.desc}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {tab === 3 && (
                  <div>
                    <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1rem' }}>D. Follow-Up Talking Points</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {output.talkingPoints.map((pt, i) => (
                        <div key={i} style={{ display: 'flex', gap: '0.875rem', alignItems: 'flex-start' }}>
                          <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: 'var(--gold-bg)', border: '1px solid var(--gold-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '0.625rem', fontWeight: 700, color: 'var(--gold)', marginTop: '1px' }}>
                            {i + 1}
                          </div>
                          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>{pt}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {tab === 4 && (
                  <div>
                    <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1rem' }}>E. Discovery Call Questions</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {output.discoveryQuestions.map((q, i) => (
                        <div key={i} style={{ padding: '0.875rem', backgroundColor: 'var(--bg-card)', borderRadius: '0.5rem', border: '1px solid var(--border)', borderLeft: '3px solid var(--gold)' }}>
                          <div style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.3rem' }}>Question {i + 1}</div>
                          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>{q}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="output-panel" style={{ minHeight: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ marginBottom: '1rem', opacity: 0.3 }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
                </svg>
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                Configure the proposal parameters and click<br /><strong style={{ color: 'var(--text-secondary)' }}>Generate Proposal Draft</strong> to create your output.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
