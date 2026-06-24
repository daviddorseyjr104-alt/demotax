import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { getAnthropic, MODEL, messageText, extractJson } from '@/lib/anthropic';

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

  // Fallback (filename-derived fields) if the key is missing OR the AI call fails,
  // so the import flow always returns something usable.
  const fallback = {
    prospectName: file.name.replace(/\.xlsx?$/, '').replace(/-/g, ' '),
    salePrice: '',
    costBasis: '',
    debtPayoff: '',
    entityStructure: 'LLC (Single Member)',
    label: file.name.replace(/\.xlsx?$/, ''),
  };

  let client;
  try {
    client = getAnthropic();
  } catch {
    return NextResponse.json(fallback);
  }

  let message;
  try {
    message = await client.messages.create({
    model: MODEL,
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
  } catch {
    return NextResponse.json(fallback);
  }

  const data = extractJson(messageText(message));
  return NextResponse.json(data ?? fallback);
}
