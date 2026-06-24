import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getAnthropic, MODEL, messageText, MissingApiKeyError } from '@/lib/anthropic';

/* ------------------------------------------------------------------ *
 *  CLIENT ASSISTANT  (in-app Claude chat, scoped to one client)
 *
 *  The Client Hub sends the selected client's context (deal, documents,
 *  email activity) plus the running conversation. Claude answers ONLY
 *  about that client — draft an email, summarize the file, suggest the
 *  next move — grounded in the context it was given.
 * ------------------------------------------------------------------ */

type ClientContext = {
  name?: string;
  company?: string;
  stage?: string;
  dealAmount?: number;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  lastContact?: string;
  docs?: { name: string; type: string; updated: string }[];
  email?: { sentToday: number; receivedToday: number; sentToContact: number } | null;
};

type ChatMessage = { role: 'user' | 'assistant'; content: string };

const fmtMoney = (n?: number) =>
  n && n > 0
    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
    : 'not set';

function buildSystemPrompt(c: ClientContext): string {
  const docs = c.docs?.length
    ? c.docs.map((d) => `  - ${d.name} (${d.type}, updated ${d.updated})`).join('\n')
    : '  (no documents on file)';
  const email = c.email
    ? `Sent today: ${c.email.sentToday}, Received today: ${c.email.receivedToday}, Sent to ${c.contactName || 'contact'} today: ${c.email.sentToContact}`
    : 'no live email data';

  return `You are the in-app assistant for a tax deferral advisory firm that works on high-net-worth transactions ($20M–$500M). You are embedded in the firm's Client Hub and are helping the advisor with ONE specific client. Be concise, specific, and practical — the advisor is busy and wants usable output, not lectures.

When asked to draft an email or message, write the full thing, ready to send, addressed to the contact by first name. When asked for analysis or next steps, be direct and reference the actual figures and documents below. If you don't have a piece of information, say so plainly rather than inventing it. Never guarantee tax outcomes; this firm evaluates whether compliant deferral mechanisms may apply.

CLIENT CONTEXT
- Client / Company: ${c.name || 'Unknown'}${c.company ? ` — ${c.company}` : ''}
- Deal stage: ${c.stage || 'unknown'}
- Deal amount: ${fmtMoney(c.dealAmount)}
- Primary contact: ${c.contactName || 'unknown'}${c.contactEmail ? ` <${c.contactEmail}>` : ''}${c.contactPhone ? `, ${c.contactPhone}` : ''}
- Last contact: ${c.lastContact || 'unknown'}
- Email activity: ${email}
- Documents on file:
${docs}`;
}

export async function POST(req: NextRequest) {
  let anthropic;
  try {
    anthropic = getAnthropic();
  } catch (e) {
    if (e instanceof MissingApiKeyError) {
      return NextResponse.json({ error: e.message }, { status: 500 });
    }
    throw e;
  }

  const body = (await req.json().catch(() => null)) as
    | { client?: ClientContext; messages?: ChatMessage[] }
    | null;

  const messages = body?.messages;
  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: 'No messages provided' }, { status: 400 });
  }

  // Keep the payload bounded — last 12 turns is plenty for this scope.
  const turns: Anthropic.MessageParam[] = messages
    .slice(-12)
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .map((m) => ({ role: m.role, content: m.content }));

  if (turns.length === 0 || turns[turns.length - 1].role !== 'user') {
    return NextResponse.json({ error: 'Last message must be from the user' }, { status: 400 });
  }

  let message;
  try {
    message = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1500,
      system: buildSystemPrompt(body?.client ?? {}),
      messages: turns,
    });
  } catch (e) {
    return NextResponse.json({ error: `AI request failed: ${(e as Error).message}` }, { status: 502 });
  }

  return NextResponse.json({ reply: messageText(message) });
}
