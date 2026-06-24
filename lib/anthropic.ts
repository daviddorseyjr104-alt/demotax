import Anthropic from '@anthropic-ai/sdk';

/* ------------------------------------------------------------------ *
 *  Shared Claude (Anthropic) client + helpers.
 *
 *  Every AI route used to repeat: `new Anthropic()`, the same key check,
 *  the same model string, and the same fragile JSON-from-markdown parse.
 *  This centralizes all of it so the model and error handling are
 *  consistent in one place.
 * ------------------------------------------------------------------ */

/** Current default model for the app. `claude-sonnet-4-6` balances quality,
 *  speed, and cost for advisory drafting + extraction. Change here once. */
export const MODEL = 'claude-sonnet-4-6';

/** Thrown when the API key is missing or still a placeholder. Routes catch
 *  this to return a clean, actionable 500 instead of a raw SDK exception. */
export class MissingApiKeyError extends Error {
  constructor() {
    super('ANTHROPIC_API_KEY not set in .env.local');
    this.name = 'MissingApiKeyError';
  }
}

function keyConfigured(): boolean {
  const k = process.env.ANTHROPIC_API_KEY?.trim();
  if (!k) return false;
  const lower = k.toLowerCase();
  // Reject the shipped placeholders ("sk-ant-your-key-here", "...-here", etc.)
  if (lower.includes('your-key') || lower.endsWith('-here') || lower.startsWith('your-')) {
    return false;
  }
  return true;
}

/** Returns a ready Anthropic client, or throws MissingApiKeyError. */
export function getAnthropic(): Anthropic {
  if (!keyConfigured()) throw new MissingApiKeyError();
  return new Anthropic();
}

/** Pull the concatenated text out of a Claude message response. */
export function messageText(message: Anthropic.Message): string {
  return message.content
    .filter((b): b is Anthropic.TextBlock => b.type === 'text')
    .map((b) => b.text)
    .join('')
    .trim();
}

/** Strip markdown code fences and parse JSON from a Claude reply.
 *  Returns null instead of throwing so callers can return a 500 with the raw. */
export function extractJson<T = unknown>(text: string): T | null {
  let clean = text.trim();
  // Remove a leading ```json / ``` fence and a trailing ``` fence if present.
  clean = clean.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  // If there's still surrounding prose, grab the outermost {...} or [...].
  if (clean[0] !== '{' && clean[0] !== '[') {
    const match = clean.match(/[{[][\s\S]*[}\]]/);
    if (match) clean = match[0];
  }
  try {
    return JSON.parse(clean) as T;
  } catch {
    return null;
  }
}
