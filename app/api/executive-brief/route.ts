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

  const { clientName, txValue, assetClass, concern, audience, tone } = await req.json();

  const toneInstructions: Record<string, string> = {
    Conservative: 'Use measured, evidence-based language. Avoid any language that implies certainty about outcomes.',
    Sophisticated: 'Use institutional-grade language. This brief reads like it was prepared by a top-tier advisory firm.',
    Educational: 'Clear and explanatory. Define concepts without being condescending. Accessible to a smart but non-specialist reader.',
    Direct: 'Short sentences. Get to the point. No filler.',
    'Relationship-first': 'Warm, collaborative tone. Emphasize partnership and trust-building.',
  };

  let message;
  try {
    message = await client.messages.create({
    model: MODEL,
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
