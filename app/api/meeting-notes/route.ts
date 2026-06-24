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

  const { notes } = await req.json();

  let message;
  try {
    message = await client.messages.create({
    model: MODEL,
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
