import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

const client = new Anthropic();

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'sk-ant-your-key-here') {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY not set in .env.local' }, { status: 500 });
  }

  const { notes } = await req.json();

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4096,
    messages: [{
      role: 'user',
      content: `You are an AI assistant for a professional tax deferral advisory firm specializing in high-net-worth transactions ($20M–$500M). Your role is to analyze call notes from prospect conversations and produce structured, professional follow-up packages.

Process these call notes and return a complete follow-up package. Be specific — use the actual names, dollar figures, entity types, and details mentioned. Write in a sophisticated, advisory tone appropriate for high-net-worth client relationships.

CALL NOTES:
${notes}

Return ONLY a valid JSON object with exactly these fields (no markdown, no explanation, just the JSON):
{
  "cleanSummary": "A 2–3 paragraph professional call summary. Include: who was called and their company/role, the transaction being evaluated (type, size range, entity structure), key financial details mentioned (basis, debt, timeline), the client's primary concerns, any advisors involved (CPA, banker, attorney), and current deal status. Write in third person, past tense. Be specific and professional.",
  "keyConcerns": ["6 specific concerns identified from this exact call, ordered by urgency. Be specific to what was actually discussed."],
  "actionItems": ["6 specific, actionable next steps. Use exact names, amounts, and details from the call. Each should be a complete sentence starting with an action verb."],
  "missingInfo": ["6 specific pieces of information still needed based on what was NOT mentioned in this call. Reference the specific gaps."],
  "followUpEmail": "Complete follow-up email including Subject line. Address the client by first name. Reference specific details from the call (company name, transaction range, advisors mentioned). Include a numbered information request. Professional but warm tone. End with a clear next step.",
  "crmTask": "Formatted CRM task entry. Include: Contact name, Company, Date, Status (Call Completed → Follow-Up Pending), Priority (HIGH/MEDIUM/LOW), Deal notes with specific figures from the call (transaction range, basis, entity type, advisor names), and a checkbox action list with 4–5 items."
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
