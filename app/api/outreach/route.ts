import { NextRequest, NextResponse } from 'next/server';
import { getAnthropic, MODEL, messageText, extractJson, MissingApiKeyError } from '@/lib/anthropic';

export async function POST(req: NextRequest) {
  let client;
  try {
    client = getAnthropic();
  } catch (e) {
    if (e instanceof MissingApiKeyError) {
      return NextResponse.json({ error: e.message }, { status: 500 });
    }
    throw e;
  }

  const { audience, goal, tone, personalization } = await req.json();

  const toneGuide: Record<string, string> = {
    Sophisticated: 'Institutional-grade language. No clichés. Reads like it came from a top-tier advisory firm.',
    Warm: 'Genuine and human. Not salesy. Feels like a colleague reaching out.',
    'Short and Direct': 'Very short. Get to the point in 3 sentences. Respect their time.',
    'Highly Professional': 'Formal, precise. No casual language. Appropriate for C-suite.',
    Educational: 'Shares information and insight. Positions the sender as a knowledgeable resource.',
  };

  const audienceContext: Record<string, string> = {
    'Private Equity Partner': 'managing portfolio company exits where the founders and management teams face large tax events',
    'Investment Banker': 'advising clients on business and asset sales in the $20M–$500M range who may not have addressed the tax dimension',
    'High-End Real Estate Broker': 'representing property owners in significant real estate dispositions where depreciation recapture and capital gains are material',
    'CPA': 'serving business owners and real estate clients with significant embedded gains who are approaching major liquidity events',
    'Business Owner': 'evaluating the sale of their own company and concerned about the after-tax outcome',
    'Real Estate Owner': 'approaching the sale of a significant property or portfolio and concerned about the tax impact',
    'Family Office': 'managing complex multi-generational wealth where liquidity events trigger significant tax exposure',
  };

  let message;
  try {
    message = await client.messages.create({
    model: MODEL,
    max_tokens: 4096,
    messages: [{
      role: 'user',
      content: `You are writing outreach content for a sophisticated tax deferral advisory firm that works with high-net-worth individuals and institutions on transactions in the $20M–$500M range. The firm is NOT a law firm, NOT a CPA firm — it is a specialist advisory practice that evaluates whether legal, compliant tax deferral mechanisms might apply to a client's situation.

Audience: ${audience} — ${audienceContext[audience] ?? `working in the ${audience.toLowerCase()} space`}
Goal: ${goal}
Tone: ${tone} — ${toneGuide[tone] ?? 'Professional.'}
${personalization ? `Personalization context: ${personalization}` : ''}

Write 5 pieces of outreach content. Each should feel genuinely written for this specific audience and goal — not like a template. The content should never:
- Guarantee tax savings
- Sound like a pitch or sales email
- Use phrases like "I'd love to connect" or "reaching out to see if..."
- Use excessive exclamation points or enthusiasm

Use "[Name]" as a placeholder for the recipient's name.

Return ONLY valid JSON (no markdown, no explanation):
{
  "subject": "Email subject line. Short. Intriguing, not salesy.",
  "shortEmail": "Complete short email (4–5 paragraphs). Professional opener. State who you are and why you're reaching out in 2 sentences. One paragraph on what you do. One on why it might be relevant to them specifically. One ask (low-friction). Sign-off.",
  "linkedin": "LinkedIn message under 180 words. More informal than email but still professional. Reference something specific about their work if personalization context was given.",
  "followUp": "Follow-up email for non-responders (sent 5–7 days after initial). Shorter than the first. Acknowledge they may not have seen it. Different angle or hook than first email.",
  "callScript": "Phone opening (first 45–60 seconds). Natural speech — write it as someone would actually say it, not read it. Includes a clear ask for time."
}`
    }]
    });
  } catch (e) {
    return NextResponse.json({ error: `AI request failed: ${(e as Error).message}` }, { status: 502 });
  }

  const text = messageText(message);
  const data = extractJson(text);
  if (!data) {
    return NextResponse.json({ error: 'Claude response could not be parsed', raw: text.slice(0, 500) }, { status: 500 });
  }
  return NextResponse.json(data);
}
