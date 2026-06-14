import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

const client = new Anthropic();

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'sk-ant-your-key-here') {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY not set in .env.local' }, { status: 500 });
  }

  const { clientName, txValue, assetClass, concern, audience, tone } = await req.json();

  const toneInstructions: Record<string, string> = {
    Conservative: 'Use measured, evidence-based language. Avoid any language that implies certainty about outcomes.',
    Sophisticated: 'Use institutional-grade language. This brief reads like it was prepared by a top-tier advisory firm.',
    Educational: 'Clear and explanatory. Define concepts without being condescending. Accessible to a smart but non-specialist reader.',
    Direct: 'Short sentences. Get to the point. No filler.',
    'Relationship-first': 'Warm, collaborative tone. Emphasize partnership and trust-building.',
  };

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4096,
    messages: [{
      role: 'user',
      content: `You are a senior advisor at a tax deferral advisory firm writing an executive brief for a high-net-worth client situation. This brief will be used internally and potentially shared with the client's advisory team.

Client: ${clientName}
Transaction Value: ${txValue}
Asset Class / Transaction Type: ${assetClass}
Primary Concern: ${concern}
Audience: ${audience}
Tone: ${tone} — ${toneInstructions[tone] ?? 'Professional and polished.'}

Write a professional executive brief. Make it specific to this client's situation — not generic boilerplate. Reference the asset class, transaction value, and concern specifically throughout.

Return ONLY valid JSON (no markdown, no explanation):
{
  "situation": "2–3 sentence situation overview. Specific to ${clientName}'s ${assetClass} transaction at ${txValue}. Make it sound like you know the situation.",
  "txContext": "Paragraph describing the transaction context — what type of transaction this is, what the financial exposure looks like at this size, and why it warrants a structured review.",
  "planningIssue": "Paragraph identifying the central planning challenge. Be specific about the ${concern} concern and what happens without structured planning at this transaction size.",
  "reviewConsiderations": ["6 specific professional review considerations tailored to ${assetClass} transactions and ${concern}. Not generic — specific to this situation."],
  "nextSteps": ["6 concrete next steps. Action-oriented. Reference the client name and situation specifics."],
  "questions": ["6 sharp discovery call questions that an experienced tax deferral advisor would ask in this specific situation — not generic questions."]
}`
    }]
  });

  const text = message.content[0].type === 'text' ? message.content[0].text : '{}';
  const clean = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();
  try {
    const data = JSON.parse(clean);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Claude response could not be parsed', raw: clean.slice(0, 500) }, { status: 500 });
  }
}
