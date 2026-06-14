import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

const client = new Anthropic();

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const workbook = XLSX.read(buffer, { type: 'buffer' });

  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  const rows = XLSX.utils.sheet_to_csv(sheet);
  const preview = rows.split('\n').slice(0, 60).join('\n');

  if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'sk-ant-your-key-here') {
    return NextResponse.json({
      prospectName: file.name.replace(/\.xlsx?$/, '').replace(/-/g, ' '),
      salePrice: '',
      costBasis: '',
      debtPayoff: '',
      entityStructure: 'LLC (Single Member)',
      label: file.name.replace(/\.xlsx?$/, ''),
    });
  }

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 512,
    messages: [{
      role: 'user',
      content: `This is CSV data extracted from an Excel spreadsheet related to a business or real estate transaction. Extract the key deal fields.

CSV data:
${preview}

Return ONLY valid JSON with these fields (use empty string "" if a field is not found):
{
  "prospectName": "Client or company name",
  "salePrice": "Sale price as a number string in dollars (e.g. '75000000' for $75M)",
  "costBasis": "Cost/adjusted basis as a number string in dollars",
  "debtPayoff": "Debt payoff/mortgage payoff amount as a number string",
  "entityStructure": "One of: 'LLC (Single Member)', 'LLC (Multi-Member)', 'S-Corporation', 'C-Corporation', 'Partnership', 'Individual'",
  "label": "Short descriptive label for this file/deal (e.g. 'Fitzpatrick — LLC S-Corp Sale')"
}`
    }]
  });

  const text = message.content[0].type === 'text' ? message.content[0].text : '{}';
  const clean = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();
  try {
    const data = JSON.parse(clean);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ prospectName: file.name.replace(/\.xlsx?$/, ''), salePrice: '', costBasis: '', debtPayoff: '', entityStructure: 'LLC (Single Member)', label: file.name });
  }
}
