import { NextRequest } from 'next/server';
import PptxGenJS from 'pptxgenjs';

const GOLD = 'C9A84C';
const DARK = '0A0F1C';
const CARD = '1A2332';
const WHITE = 'F0E8D5';
const MUTED = '5A6A82';

export async function POST(req: NextRequest) {
  const { slides, form } = await req.json() as {
    slides: Array<{ title: string; bullets: string[]; speakerNote: string }>;
    form: { prospectName: string; txSize: string; structure: string; audience: string; goal: string; tone: string };
  };

  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_WIDE';
  pptx.author = 'Tax Strategy Operations Hub';
  pptx.company = 'Tax Deferral Advisory';
  pptx.subject = `Deal Presentation — ${form.prospectName}`;
  pptx.title = `Tax Deferral Advisory — ${form.prospectName}`;

  const date = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // ── Title slide ──────────────────────────────────────────────────────────────
  const s0 = pptx.addSlide();
  s0.background = { color: DARK };

  // Gold bar top
  s0.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 13.33, h: 0.07, fill: { color: GOLD }, line: { color: GOLD } });

  // Branding
  s0.addText('TAX DEFERRAL ADVISORY', {
    x: 0.5, y: 1.4, w: 12.33, h: 0.5,
    fontSize: 10, bold: true, color: GOLD, align: 'center', charSpacing: 6, fontFace: 'Arial',
  });

  // Divider
  s0.addShape(pptx.ShapeType.rect, { x: 4.5, y: 2.0, w: 4.33, h: 0.02, fill: { color: GOLD }, line: { color: GOLD } });

  // Main title
  s0.addText('Tax Exposure Review', {
    x: 0.5, y: 2.2, w: 12.33, h: 1.1,
    fontSize: 38, bold: true, color: WHITE, align: 'center', fontFace: 'Arial',
  });

  // Client name
  s0.addText(form.prospectName, {
    x: 0.5, y: 3.45, w: 12.33, h: 0.75,
    fontSize: 26, color: GOLD, align: 'center', fontFace: 'Arial',
  });

  // Deal info
  s0.addText(`${form.txSize} · ${form.structure} · ${form.goal}`, {
    x: 0.5, y: 4.3, w: 12.33, h: 0.45,
    fontSize: 14, color: MUTED, align: 'center', fontFace: 'Arial',
  });

  // Date
  s0.addText(date, {
    x: 0.5, y: 4.85, w: 12.33, h: 0.35,
    fontSize: 11, color: MUTED, align: 'center', fontFace: 'Arial',
  });

  // Footer bar
  s0.addShape(pptx.ShapeType.rect, { x: 0, y: 7.15, w: 13.33, h: 0.35, fill: { color: GOLD }, line: { color: GOLD } });
  s0.addText('CONFIDENTIAL  ·  FOR PROFESSIONAL REVIEW ONLY  ·  NOT TAX OR LEGAL ADVICE', {
    x: 0.5, y: 7.17, w: 12.33, h: 0.3,
    fontSize: 7.5, bold: true, color: DARK, align: 'center', charSpacing: 1.5, fontFace: 'Arial',
  });

  // ── Content slides ─────────────────────────────────────────────────────────
  for (let i = 0; i < slides.length; i++) {
    const s = pptx.addSlide();
    const slide = slides[i];
    s.background = { color: DARK };

    // Gold accent top
    s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 13.33, h: 0.07, fill: { color: GOLD }, line: { color: GOLD } });

    // Slide number (top right)
    s.addText(`${String(i + 1).padStart(2, '0')}  /  ${String(slides.length).padStart(2, '0')}`, {
      x: 10.5, y: 0.12, w: 2.5, h: 0.38,
      fontSize: 9, color: MUTED, align: 'right', fontFace: 'Arial',
    });

    // Slide title
    s.addText(slide.title.toUpperCase(), {
      x: 0.5, y: 0.1, w: 9.8, h: 0.56,
      fontSize: 17, bold: true, color: GOLD, fontFace: 'Arial', charSpacing: 0.5,
    });

    // Thin gold divider
    s.addShape(pptx.ShapeType.rect, { x: 0.5, y: 0.75, w: 12.33, h: 0.02, fill: { color: CARD }, line: { color: CARD } });

    // Bullet content
    const bulletItems = slide.bullets.map((b) => ({
      text: '  ' + b,
      options: { color: WHITE, fontSize: 14, paraSpaceAfter: 6, lineSpacingMultiple: 1.25 } as object,
    }));
    s.addText(bulletItems, {
      x: 0.5, y: 0.88, w: 12.33, h: 5.8,
      fontFace: 'Arial', bullet: { indent: 20, code: '25CF' },
    });

    // Speaker note box (subtle, at bottom)
    if (slide.speakerNote) {
      s.addNotes(slide.speakerNote);
    }

    // Footer
    s.addText(`Tax Deferral Advisory  ·  ${form.prospectName}  ·  Internal Review Only`, {
      x: 0.5, y: 7.2, w: 12.33, h: 0.25,
      fontSize: 7, color: MUTED, align: 'center', fontFace: 'Arial',
    });
  }

  // ── Final slide — Next steps ───────────────────────────────────────────────
  const sLast = pptx.addSlide();
  sLast.background = { color: DARK };
  sLast.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 13.33, h: 0.07, fill: { color: GOLD }, line: { color: GOLD } });
  sLast.addText('READY TO MOVE FORWARD?', {
    x: 0.5, y: 1.8, w: 12.33, h: 0.8,
    fontSize: 28, bold: true, color: WHITE, align: 'center', fontFace: 'Arial',
  });
  sLast.addText('Schedule a 30-minute discovery call to review transaction documents\nand evaluate whether structured deferral planning may apply.', {
    x: 1.5, y: 2.8, w: 10.33, h: 1.0,
    fontSize: 15, color: MUTED, align: 'center', fontFace: 'Arial', lineSpacingMultiple: 1.4,
  });
  sLast.addShape(pptx.ShapeType.rect, { x: 4.0, y: 4.0, w: 5.33, h: 0.65, fill: { color: GOLD }, line: { color: GOLD } });
  sLast.addText('REQUEST A DISCOVERY CALL', {
    x: 4.0, y: 3.98, w: 5.33, h: 0.65,
    fontSize: 11, bold: true, color: DARK, align: 'center', charSpacing: 1.5, fontFace: 'Arial',
  });
  sLast.addText('Not tax or legal advice. All strategies require professional review before implementation.', {
    x: 1.5, y: 6.8, w: 10.33, h: 0.35,
    fontSize: 8, color: MUTED, align: 'center', fontFace: 'Arial',
  });
  sLast.addShape(pptx.ShapeType.rect, { x: 0, y: 7.15, w: 13.33, h: 0.35, fill: { color: GOLD }, line: { color: GOLD } });
  sLast.addText('CONFIDENTIAL  ·  FOR PROFESSIONAL REVIEW ONLY', {
    x: 0.5, y: 7.17, w: 12.33, h: 0.3,
    fontSize: 7.5, bold: true, color: DARK, align: 'center', charSpacing: 1.5, fontFace: 'Arial',
  });

  const buffer = await pptx.write({ outputType: 'nodebuffer' }) as Buffer;
  const filename = `${(form.prospectName || 'deck').replace(/\s+/g, '-').toLowerCase()}-tax-advisory.pptx`;

  return new Response(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
