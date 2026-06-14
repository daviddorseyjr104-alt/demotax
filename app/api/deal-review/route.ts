import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

const client = new Anthropic();

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

const pct = (n: number) => `${(n * 100).toFixed(2)}%`;

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'sk-ant-your-key-here') {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY not set in .env.local' }, { status: 500 });
  }

  const { form, calc } = await req.json();

  const dateStr = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4096,
    messages: [{
      role: 'user',
      content: `You are a senior tax deferral advisor writing an executive memorandum for an internal deal review. This is a professional internal document for a high-net-worth transaction.

Transaction Details:
- Prospect: ${form.prospectName} (${form.prospectType})
- Deal Structure: ${form.assetType}
- Gross Sale Price: ${fmt(calc.salePrice || 0)}
- Cost Basis: ${fmt(calc.costBasis || 0)}
- Gross Gain: ${fmt(calc.grossGain || 0)}
- Federal Cap Gains Exposure: ${fmt(calc.fedExp || 0)} (at ${form.fedRate}%)
- State Tax Exposure: ${fmt(calc.stateExp || 0)} (at ${form.stateRate}%)
- Recapture / Ordinary Income: ${fmt(calc.rc || 0)}
- Total Estimated Tax Exposure: ${fmt(calc.totalExp || 0)}
- Net Proceeds (after debt/costs): ${fmt(calc.netProceeds || 0)}
- Net After-Tax Proceeds: ${fmt(calc.netAfterTax || 0)}
- Effective Rate on Proceeds: ${pct(calc.effRate || 0)}
- Est. Deferrable Amount: ${fmt(calc.deferrable || 0)} (≈75% of exposure)
- Expected Timeline: ${form.timeline || 'TBD'}
- Current Stage: ${form.stage}
- Prepared: ${dateStr}

Write a professional executive memorandum in the style of a senior tax advisory firm. Include:
1. A header block with all the key deal parameters
2. A substantive situation summary (not generic — discuss the specific ${form.assetType} structure, what the ${fmt(calc.grossGain || 0)} gain means, and why the exposure is significant)
3. A numbered exposure summary table (formatted text, not actual HTML tables)
4. A section on key discussion areas specific to ${form.assetType} transactions — what a CPA and advisor team should evaluate for this deal type
5. A clear suggested next step
6. A disclaimer

Format it as professional plain text with separator lines (────────) between sections. Use the exact figures provided. Total length should be roughly 400–600 words. Write the memo in first-person plural ("we estimate", "our review suggests") as if from the advisory firm.`
    }]
  });

  const text = message.content[0].type === 'text' ? message.content[0].text : '';
  return NextResponse.json({ memo: text });
}
