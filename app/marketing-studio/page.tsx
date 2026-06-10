'use client';

import { useState } from 'react';
import { logActivity } from '../../lib/activity';

type Form = {
  audience: string;
  goal: string;
  tone: string;
  personalization: string;
};

const init: Form = {
  audience: 'Investment Banker',
  goal: 'Referral Partnership',
  tone: 'Sophisticated',
  personalization: '',
};

type Output = {
  subject: string;
  shortEmail: string;
  linkedin: string;
  followUp: string;
  callScript: string;
};

const templates = [
  { label: 'PE Partner Intro', audience: 'Private Equity Partner', goal: 'Intro Meeting', tone: 'Sophisticated' },
  { label: 'IB Referral', audience: 'Investment Banker', goal: 'Referral Partnership', tone: 'Highly Professional' },
  { label: 'Broker Education', audience: 'High-End Real Estate Broker', goal: 'Educational Webinar', tone: 'Warm' },
  { label: 'CPA Partnership', audience: 'CPA', goal: 'Referral Partnership', tone: 'Highly Professional' },
  { label: 'Post-Meeting', audience: 'Investment Banker', goal: 'Follow-Up After Call', tone: 'Short and Direct' },
  { label: 'Webinar Invite', audience: 'Real Estate Owner', goal: 'Educational Webinar', tone: 'Educational' },
];

function buildOutput(f: Form): Output {
  const aud = f.audience;
  const goal = f.goal;
  const tone = f.tone;
  const p = f.personalization;
  const name = '[Name]';
  const audLower = aud.toLowerCase();

  const goalCtx: Record<string, { hook: string; cta: string }> = {
    'Intro Meeting': { hook: 'explore whether our advisory work might complement your client conversations', cta: 'a brief introductory call' },
    'Referral Partnership': { hook: 'discuss a structured referral relationship for clients navigating major exits', cta: 'a referral partnership conversation' },
    'Educational Webinar': { hook: 'share frameworks we use to evaluate tax exposure on large transactions', cta: 'an upcoming educational session' },
    'Deal Review': { hook: 'walk through the tax dimension of a specific transaction in process', cta: 'a deal-specific review conversation' },
    'Follow-Up After Call': { hook: 'continue our recent conversation with a focused follow-up', cta: 'next steps from our discussion' },
    'Reconnect': { hook: 'reconnect and see if there are relevant situations we could explore together', cta: 'a brief reconnect call' },
  };

  const { hook, cta } = goalCtx[goal] ?? { hook: 'discuss a relevant opportunity', cta: 'a brief conversation' };
  const personLine = p ? ` — ${p}` : '';

  const audNote: Record<string, string> = {
    'Private Equity Partner': 'managing major portfolio company exits',
    'Investment Banker': 'advising on business and asset sales in the $20M–$500M range',
    'High-End Real Estate Broker': 'representing clients in significant real estate dispositions',
    'CPA': 'serving business owners and real estate clients with material tax exposure on exits',
    'Business Owner': 'preparing for a major business exit',
    'Real Estate Owner': 'approaching a significant real estate disposition',
    'Family Office': 'managing complex multi-generational exit and liquidity planning',
  };

  const audContext = audNote[aud] ?? `working in the ${audLower} space`;

  const subject = tone === 'Short and Direct'
    ? `Tax deferral advisory — relevant for your clients?`
    : tone === 'Warm'
    ? `A planning conversation worth having — tax exposure on major exits`
    : `Structured tax deferral review — introductory note for ${aud}s`;

  const shortEmail = `Hi ${name}${personLine},

I wanted to reach out regarding a tax deferral advisory practice that works specifically with ${audContext}. The core of what we do is evaluate whether established deferral mechanisms might allow a client to defer a meaningful portion of what they would otherwise pay in the year of the transaction.

We typically engage on situations where estimated tax exposure is significant — business sales, commercial real estate dispositions, multifamily portfolio exits, and private company equity events in the $20M–$500M range.

Our model is additive, not disruptive. We work alongside the client's existing CPA, legal counsel, and wealth advisors — not instead of them.

I thought it was worth reaching out to ${hook}. No obligation and no pitch deck required — just a direct conversation.

Would ${cta} work for you in the coming weeks?

With respect,
[Your Name]
[Firm Name] | Tax Deferral Advisory Practice
[Phone] | [Email]`;

  const linkedin = `Hi ${name}${p ? ` — came across your work (${p})` : ''}, wanted to introduce a tax deferral advisory practice that works with ${audContext}. We focus on the gap between what clients owe and what structured planning might allow them to preserve — typically on exits in the $20M–$500M range. If there's ever a situation where a second opinion on the tax exposure dimension would be useful, I'd be glad to connect. Happy to share more context if relevant.`;

  const followUp = `Hi ${name},

Following up on my earlier note about tax deferral advisory for ${audLower}s navigating significant exits.

I recognize this may not be immediately relevant to your current priorities. That said, if you have a client or relationship who is 6–18 months out from a major business or real estate transaction — and hasn't had a dedicated conversation about the tax exposure dimension — I'd welcome a brief introduction.

We're not a replacement for existing advisors. Our role is to add a structured, compliant review process at the right moment in the transaction timeline. The earlier it happens, the more options we can evaluate together.

I'll keep this one brief. If the timing is right in the future, I hope you'll think of us.

[Your Name]`;

  const callScript = `"${name}, thanks for taking the time — I'll keep this brief.

We work with ${audLower}s and their clients on the tax deferral dimension of major exits. The core of what we do is evaluate whether established, compliant mechanisms — deferral structures subject to professional review — might allow a client to defer a meaningful portion of what they would otherwise pay in the year of the transaction.

${p ? `Given ${p}, ` : ''}I thought it was worth a conversation to see if this type of advisory adds value to any situations you have on the horizon.

Can I ask — are you working with any clients currently approaching a significant business or real estate transaction where the tax dimension is a meaningful part of the exit conversation?"`;

  return { subject, shortEmail, linkedin, followUp, callScript };
}

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); });
  return (
    <button className="btn-ghost" onClick={copy}>
      {copied
        ? <><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>Copied</>
        : <><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>Copy</>
      }
    </button>
  );
}

function ContentBlock({ title, content }: { title: string; content: string }) {
  return (
    <div style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: '0.625rem', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', padding: '0.625rem 1rem', borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg-card)' }}>
        <span style={{ fontSize: '0.6375rem', fontWeight: 700, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.08em', flex: 1 }}>{title}</span>
        <CopyBtn text={content} />
      </div>
      <div style={{ padding: '1rem', fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.75, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
        {content}
      </div>
    </div>
  );
}

export default function MarketingStudioPage() {
  const [form, setForm] = useState<Form>(init);
  const [generating, setGenerating] = useState(false);
  const [output, setOutput] = useState<Output | null>(null);

  const set = (k: keyof Form, v: string) => { setForm((f) => ({ ...f, [k]: v })); setOutput(null); };

  const applyTemplate = (t: typeof templates[0]) => {
    setForm((f) => ({ ...f, audience: t.audience, goal: t.goal, tone: t.tone }));
    setOutput(null);
  };

  const generate = () => {
    setGenerating(true);
    setTimeout(() => {
      setOutput(buildOutput(form));
      setGenerating(false);
      logActivity(`Outreach suite generated — ${form.audience}, ${form.goal} (${form.tone} tone)`, 'var(--purple)');
    }, 1600);
  };

  return (
    <div style={{ maxWidth: '1200px' }}>
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 className="section-title" style={{ fontSize: '1.375rem' }}>Marketing Studio</h1>
        <p className="section-subtitle" style={{ maxWidth: '580px' }}>
          Generate sophisticated, low-pressure outreach for private equity partners, investment bankers, brokers, CPAs, and owners. Premium language, no spam.
        </p>
      </div>

      {/* Quick templates */}
      <div className="card" style={{ marginBottom: '1.25rem', padding: '1rem 1.25rem' }}>
        <div style={{ fontSize: '0.6375rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>Quick Campaign Templates</div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {templates.map((t) => (
            <button key={t.label} className="btn-secondary" onClick={() => applyTemplate(t)}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Controls */}
        <div className="card">
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '1.125rem' }}>Campaign Settings</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            <div>
              <label className="field-label">Audience</label>
              <select className="input-field" value={form.audience} onChange={(e) => set('audience', e.target.value)}>
                {['Private Equity Partner', 'Investment Banker', 'High-End Real Estate Broker', 'CPA', 'Business Owner', 'Real Estate Owner', 'Family Office'].map((v) => <option key={v}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="field-label">Campaign Goal</label>
              <select className="input-field" value={form.goal} onChange={(e) => set('goal', e.target.value)}>
                {['Intro Meeting', 'Referral Partnership', 'Educational Webinar', 'Deal Review', 'Follow-Up After Call', 'Reconnect'].map((v) => <option key={v}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="field-label">Tone</label>
              <select className="input-field" value={form.tone} onChange={(e) => set('tone', e.target.value)}>
                {['Sophisticated', 'Warm', 'Short and Direct', 'Highly Professional', 'Educational'].map((v) => <option key={v}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="field-label">Personalization Note</label>
              <textarea className="input-field" style={{ minHeight: '72px', resize: 'vertical' }}
                placeholder="e.g. met at GreenStreet conference, mutual connection via John Davis..."
                value={form.personalization} onChange={(e) => set('personalization', e.target.value)} />
            </div>
            <button className="btn-gold" style={{ width: '100%', justifyContent: 'center' }} onClick={generate} disabled={generating}>
              {generating
                ? <><div className="spinner" style={{ width: '13px', height: '13px', margin: 0 }} />Generating content...</>
                : 'Generate Content Suite'}
            </button>
          </div>

          {output && (
            <div style={{ marginTop: '1.25rem', padding: '1rem', backgroundColor: 'var(--bg-input)', borderRadius: '0.5rem', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.6375rem', fontWeight: 700, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.625rem' }}>Email Subject Line</div>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.45, marginBottom: '0.5rem' }}>{output.subject}</div>
              <CopyBtn text={output.subject} />
            </div>
          )}
        </div>

        {/* Outputs */}
        <div>
          {generating && (
            <div className="card fade-in" style={{ textAlign: 'center', padding: '4rem', minHeight: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div className="spinner" style={{ marginBottom: '1rem' }} />
              <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Generating content suite...</div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Crafting premium, professional outreach</div>
            </div>
          )}
          {output && !generating && (
            <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Generated — {form.audience} · {form.goal} · {form.tone}
                </div>
                <span className="badge badge-gold">5 Assets Ready</span>
              </div>
              <ContentBlock title="Short Introductory Email" content={output.shortEmail} />
              <ContentBlock title="LinkedIn Message" content={output.linkedin} />
              <ContentBlock title="Follow-Up Email" content={output.followUp} />
              <ContentBlock title="Call Opening Script" content={output.callScript} />
            </div>
          )}
          {!output && !generating && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '0.75rem' }}>
              <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                <div style={{ marginBottom: '1rem', opacity: 0.25 }}>
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5" style={{ margin: '0 auto' }}>
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
                  </svg>
                </div>
                <div style={{ fontSize: '0.875rem' }}>Select a template or configure settings<br />and click <strong style={{ color: 'var(--text-secondary)' }}>Generate Content Suite</strong></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
