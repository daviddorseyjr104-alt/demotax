'use client';

import { useState, useEffect } from 'react';
import { logActivity, incrementStat } from '../../lib/activity';

type Form = {
  prospectName: string; audience: string; txSize: string; goal: string; tone: string; structure: string;
};

const init: Form = {
  prospectName: '', audience: 'Investment Banker', txSize: '',
  goal: 'Referral partner presentation', tone: 'Premium', structure: 'LLC (S-Corp)',
};

type Slide = { title: string; bullets: string[]; speakerNote: string };

const STRUCTURE_NOTES: Record<string, string> = {
  'LLC (Partnership)': 'pass-through taxation — §751 hot asset analysis required for ordinary income separation',
  'LLC (S-Corp)': 'shareholder-level taxation — built-in gains period and basis analysis required',
  'Real Estate': '§1250 recapture at 25% rate — 1031 exchange deferral may be available if structured pre-close',
  'C-Corporation': 'double taxation risk on asset sales — model both asset and stock sale structures before presenting',
  'Securities / IP': 'QSBS §1202 exclusion may apply — confirm holding period and issuer eligibility with counsel',
};

function buildSlides(f: Form): Slide[] {
  const name = f.prospectName || '[Prospect]';
  const aud = f.audience;
  const size = f.txSize || '[Transaction Size]';
  const structNote = STRUCTURE_NOTES[f.structure] ?? 'review applicable tax treatment with qualified advisor';
  const isReferral = aud === 'Real Estate Broker' || aud === 'Investment Banker' || aud === 'CPA';
  const recip = isReferral ? `your clients` : name;
  const toneNote = f.tone === 'Technical' ? 'Quantitative and process-focused'
    : f.tone === 'Simple' ? 'Keep language accessible and jargon-free'
    : f.tone === 'High-level' ? 'Strategic overview only — avoid technical detail'
    : 'Professional, polished, and relationship-oriented';

  return [
    {
      title: isReferral ? `${aud} Overview` : 'Client / Situation Overview',
      bullets: [
        isReferral ? `Introducing our practice to the ${aud} community` : `${name}'s current position and exit context`,
        `${size} transaction — ${f.goal.toLowerCase()} context`,
        `Timeline and key decision-making milestones`,
        `Advisory team structure and coordination needs`,
      ],
      speakerNote: `${toneNote}. Open by establishing credibility and framing the transaction scope. For a ${aud}, lead with how this conversation is additive to their existing client relationships, not competitive with them.`,
    },
    {
      title: 'Transaction Summary',
      bullets: [
        `Asset class and deal structure overview`,
        `Estimated transaction value: ${size}`,
        `Key transaction parameters and structure`,
        `Anticipated closing timeline and critical milestones`,
      ],
      speakerNote: `Establish the factual baseline. Keep numbers conservative — use estimated ranges rather than precise figures at this stage. Confirm these details with ${recip} before finalizing.`,
    },
    {
      title: 'Estimated Tax Exposure Challenge',
      bullets: [
        `Federal and state capital gains exposure on gross gain`,
        `${f.structure} specific: ${structNote}`,
        `Effective tax rate as a % of gross proceeds`,
        `What after-tax proceeds look like without structured planning`,
      ],
      speakerNote: `This slide quantifies the "why." Make the numbers concrete. Use the Deal Calculator output to populate actual figures for this ${f.structure} transaction. Emphasize that this is an estimate requiring professional review — not a final calculation.`,
    },
    {
      title: 'Why Timing Matters',
      bullets: [
        `The window for structured planning closes as the deal progresses`,
        `Post-close options are significantly more limited`,
        `Professional review timeline vs. closing timeline`,
        `Why early engagement produces better outcomes for ${recip}`,
      ],
      speakerNote: `Create appropriate urgency without pressure tactics. The message is: "The earlier we start, the more options we can evaluate." Avoid any language that implies guaranteed savings.`,
    },
    {
      title: 'Structured Deferral Review Process',
      bullets: [
        `Overview of available planning mechanisms — subject to professional review`,
        `How each mechanism interacts with ${aud.toLowerCase()} transactions`,
        `Compliance-focused, advisor-coordinated approach`,
        `What the review process looks like from start to finish`,
      ],
      speakerNote: `Present mechanisms at a high level. Avoid naming specific strategies as "recommendations." Frame everything as an evaluation process that requires CPA, legal, and advisor review before any decisions are made.`,
    },
    {
      title: 'Coordination With Existing Advisors',
      bullets: [
        `We work alongside — not instead of — existing CPA, legal, and wealth advisors`,
        `Structured coordination model for advisor teams`,
        `Role clarity: what we do, what existing advisors continue to do`,
        `How the process protects ${recip}'s existing advisor relationships`,
      ],
      speakerNote: `This slide is critical for reducing friction. Emphasize additive value. Many advisors and clients fear disruption — reassure them that this process enhances, not disrupts, the existing advisory structure.`,
    },
    {
      title: 'Implementation Timeline',
      bullets: [
        `Discovery call and document collection: Week 1–2`,
        `Advisor coordination and professional review: Week 2–4`,
        `Structure evaluation and recommendation process: Week 3–6`,
        `Closing coordination and post-close planning: As needed`,
      ],
      speakerNote: `Make the process feel structured and manageable. ${name} should leave this slide feeling like there is a clear, orderly path forward — not a complicated or risky endeavor. Adjust timeline based on actual closing date.`,
    },
    {
      title: 'Questions & Next Steps',
      bullets: [
        `Key questions we want to explore with ${recip}`,
        `Proposed first step: 30-minute discovery conversation`,
        `Information we will request — no obligation`,
        `How to engage: introduction, referral, or direct conversation`,
      ],
      speakerNote: `Close with a clear, low-friction ask. Avoid presenting multiple options — give one clear next step. For ${isReferral ? 'referral partners' : name}, the ask is a 30-minute call to share context. Make it easy to say yes.`,
    },
  ];
}

function downloadTxt(slides: Slide[], f: Form) {
  const header = [
    `TAX STRATEGY ADVISORY — PRESENTATION OUTLINE`,
    `${'═'.repeat(60)}`,
    `Client / Audience: ${f.prospectName} · ${f.audience}`,
    `Transaction: ${f.txSize} · ${f.goal}`,
    `Deal Structure: ${f.structure}`,
    `Tone: ${f.tone}`,
    `Generated: ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`,
    `Status: Internal Review Only`,
    `${'═'.repeat(60)}`,
    '',
  ].join('\n');

  const body = slides.map((s, i) =>
    [`SLIDE ${i + 1}: ${s.title}`, `${'─'.repeat(50)}`,
      ...s.bullets.map((b) => `  • ${b}`),
      '', `SPEAKER NOTE:`, `  ${s.speakerNote}`,
    ].join('\n')
  ).join('\n\n');

  const footer = [
    '', `${'═'.repeat(60)}`,
    `For professional review only. This outline does not constitute tax, legal, accounting,`,
    `investment, or financial advice. All content must be reviewed by qualified professionals`,
    `before presentation to clients or referral partners.`,
  ].join('\n');

  const blob = new Blob([header + body + footer], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${(f.prospectName || 'deck').replace(/\s+/g, '-').toLowerCase()}-slide-outline.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

async function downloadPptx(slides: Slide[], f: Form, setDownloading: (v: boolean) => void) {
  setDownloading(true);
  try {
    const res = await fetch('/api/generate-pptx', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slides, form: f }),
    });
    if (!res.ok) throw new Error('PPTX generation failed');
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(f.prospectName || 'deck').replace(/\s+/g, '-').toLowerCase()}-tax-advisory.pptx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } finally {
    setDownloading(false);
  }
}

export default function PowerPointBuilderPage() {
  const [form, setForm] = useState<Form>(init);
  const [generating, setGenerating] = useState(false);
  const [slides, setSlides] = useState<Slide[] | null>(null);
  const [showNotes, setShowNotes] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const set = (k: keyof Form, v: string) => { setForm((f) => ({ ...f, [k]: v })); setSlides(null); };

  // One-time prefill from localStorage on mount (SSR-safe only inside an effect).
  useEffect(() => {
    try {
      const raw = localStorage.getItem('tsos-deck-prefill');
      if (raw) {
        const data = JSON.parse(raw) as { prospectName?: string; structure?: string; txSize?: string };
        localStorage.removeItem('tsos-deck-prefill');
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setForm((f) => ({
          ...f,
          ...(data.prospectName ? { prospectName: data.prospectName } : {}),
          ...(data.structure ? { structure: data.structure } : {}),
          ...(data.txSize ? { txSize: data.txSize } : {}),
        }));
      }
    } catch { /* ignore parse errors */ }
  }, []);

  const generate = () => {
    setGenerating(true);
    setSlides(null);
    setTimeout(() => {
      const built = buildSlides(form);
      setSlides(built);
      setGenerating(false);
      logActivity(`PowerPoint outline generated — ${form.prospectName}, ${form.txSize} ${form.structure} deck for ${form.audience} (${form.goal})`, 'var(--purple)');
      incrementStat('decks');
    }, 2000);
  };

  return (
    <div style={{ maxWidth: '1200px' }}>
      <div style={{ marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h1 className="section-title" style={{ fontSize: '1.375rem' }}>PowerPoint &amp; Proposal Builder</h1>
            <p className="section-subtitle" style={{ maxWidth: '560px' }}>Convert transaction details into boardroom-ready presentation outlines. Each slide includes title, content bullets, and speaker notes.</p>
          </div>
          <span className="internal-tag">Internal Review Only</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '1.5rem', alignItems: 'start' }}>
        <div className="card">
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '1.125rem' }}>Deck Parameters</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            <div>
              <label className="field-label">Prospect / Client Name</label>
              <input className="input-field" placeholder="Robert Chen" value={form.prospectName} onChange={(e) => set('prospectName', e.target.value)} />
            </div>
            <div>
              <label className="field-label">Deal Structure</label>
              <select className="input-field" value={form.structure} onChange={(e) => set('structure', e.target.value)}>
                {['LLC (Partnership)', 'LLC (S-Corp)', 'Real Estate', 'C-Corporation', 'Securities / IP'].map((v) => <option key={v}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="field-label">Audience Type</label>
              <select className="input-field" value={form.audience} onChange={(e) => set('audience', e.target.value)}>
                {['Business Owner', 'Real Estate Owner', 'Private Equity Partner', 'Investment Banker', 'Real Estate Broker', 'CPA'].map((v) => <option key={v}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="field-label">Transaction Size</label>
              <input className="input-field" placeholder="$92M" value={form.txSize} onChange={(e) => set('txSize', e.target.value)} />
            </div>
            <div>
              <label className="field-label">Deck Goal</label>
              <select className="input-field" value={form.goal} onChange={(e) => set('goal', e.target.value)}>
                {['Introductory education', 'Deal review', 'Referral partner presentation', 'Client proposal', 'Webinar deck'].map((v) => <option key={v}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="field-label">Tone</label>
              <select className="input-field" value={form.tone} onChange={(e) => set('tone', e.target.value)}>
                {['Conservative', 'Premium', 'Technical', 'Simple', 'High-level'].map((v) => <option key={v}>{v}</option>)}
              </select>
            </div>
            <button className="btn-gold" style={{ width: '100%', justifyContent: 'center' }} onClick={generate} disabled={generating}>
              {generating
                ? <><div className="spinner" style={{ width: '13px', height: '13px', margin: 0 }} />Building deck outline...</>
                : slides ? 'Regenerate Outline' : 'Generate 8-Slide Outline'}
            </button>
            {slides && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <button
                  className="btn-gold"
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={() => downloadPptx(slides, form, setDownloading)}
                  disabled={downloading}
                >
                  {downloading
                    ? <><div className="spinner" style={{ width: '13px', height: '13px', margin: 0 }} />Generating .pptx...</>
                    : <>⬇ Download Real .pptx</>}
                </button>
                <button className="btn-secondary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setShowNotes((v) => !v)}>
                  {showNotes ? 'Hide Speaker Notes' : 'Show Speaker Notes'}
                </button>
                <button className="btn-ghost" style={{ width: '100%', justifyContent: 'center', fontSize: '0.72rem' }} onClick={() => downloadTxt(slides, form)}>
                  Download Outline (.txt)
                </button>
              </div>
            )}
          </div>
        </div>

        <div>
          {generating && (
            <div className="card fade-in" style={{ textAlign: 'center', padding: '4rem 2rem', minHeight: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div className="spinner" style={{ marginBottom: '1rem' }} />
              <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.375rem' }}>Preparing PowerPoint Outline</div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Generating slides, bullets, and speaker notes...</div>
            </div>
          )}

          {slides && !generating && (
            <div className="fade-in">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {form.prospectName || 'Deck'} — {form.goal} · {form.audience}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <span className="badge badge-gold">8 Slides Ready</span>
                  <span className="badge badge-gray">{form.structure}</span>
                  <span className="badge badge-gray">{form.tone} tone</span>
                  <button className="btn-ghost" style={{ fontSize: '0.7rem' }} onClick={() => downloadPptx(slides, form, setDownloading)} disabled={downloading}>⬇ .pptx</button>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
                {slides.map((slide, i) => (
                  <div key={i} className="slide-card">
                    <div className="slide-num">Slide {i + 1} of 8</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', paddingRight: '3.5rem' }}>
                      <div style={{ width: '22px', height: '22px', borderRadius: '4px', backgroundColor: 'var(--gold-bg)', border: '1px solid var(--gold-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.5625rem', fontWeight: 800, color: 'var(--gold)', flexShrink: 0 }}>
                        {i + 1}
                      </div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3 }}>{slide.title}</div>
                    </div>
                    <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.375rem', marginBottom: showNotes ? '0.875rem' : 0 }}>
                      {slide.bullets.map((b, j) => (
                        <li key={j} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                          <div style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: 'var(--gold)', marginTop: '6px', flexShrink: 0 }} />
                          <span style={{ fontSize: '0.7625rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{b}</span>
                        </li>
                      ))}
                    </ul>
                    {showNotes && (
                      <div style={{ padding: '0.625rem 0.75rem', backgroundColor: 'var(--bg-card)', borderRadius: '0.375rem', border: '1px solid var(--border)' }}>
                        <div style={{ fontSize: '0.5625rem', fontWeight: 700, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.3rem' }}>Speaker Note</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>{slide.speakerNote}</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="disclaimer" style={{ marginTop: '1.25rem' }}>
                <strong style={{ color: 'var(--gold)' }}>For professional review.</strong>{' '}
                This outline is for internal workflow use. It does not constitute tax, legal, accounting, investment, or financial advice.
                All content must be reviewed by qualified professionals before presentation to clients.
              </div>
            </div>
          )}

          {!slides && !generating && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '0.75rem' }}>
              <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                <div style={{ marginBottom: '1rem', opacity: 0.25 }}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5" style={{ margin: '0 auto' }}>
                    <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
                  </svg>
                </div>
                <div style={{ fontSize: '0.875rem' }}>Configure deck parameters and click<br /><strong style={{ color: 'var(--text-secondary)' }}>Generate 8-Slide Outline</strong></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
