import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import type { Child, GeneratedWorksheetContent, Topic } from '../../../shared/types.js';
import { STORAGE_DIR } from '../db/database.js';

function escapeHtml(s: string): string {
  return s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function themePalette(theme: string): { ink: string; wash: string; accent: string; paper: string } {
  const t = theme.toLowerCase();
  if (t.includes('unicorn')) {
    return { ink: '#2a2438', wash: '#f3eef8', accent: '#7a6b9a', paper: '#fbf8f4' };
  }
  if (t.includes('pon')) {
    return { ink: '#2c2416', wash: '#f5efe4', accent: '#8b6914', paper: '#fbf7f0' };
  }
  // sea life default
  return { ink: '#1a2f38', wash: '#e8f1f4', accent: '#2a6f7a', paper: '#f7f4ef' };
}

export function renderWorksheetHtml(
  child: Child,
  content: GeneratedWorksheetContent,
  topicsById: Map<string, Topic>,
): string {
  const palette = themePalette(content.theme);
  const activitiesHtml = content.activities
    .map((activity, index) => {
      const topic = topicsById.get(activity.topicId);
      return `
      <section class="activity">
        <div class="activity-header">
          <span class="num">${index + 1}</span>
          <div>
            <h2>${escapeHtml(activity.title)}</h2>
            <p class="meta">${escapeHtml(topic?.subject ?? '')}${topic?.domain ? ` · ${escapeHtml(topic.domain)}` : ''}</p>
          </div>
        </div>
        <p class="instructions">${escapeHtml(activity.instructions)}</p>
        <p class="prompt">${escapeHtml(activity.prompt)}</p>
        <div class="answer-box">
          <span class="hint">${escapeHtml(activity.answerSpaceHint)}</span>
        </div>
        <p class="illus">${escapeHtml(activity.illustrationHint)}</p>
      </section>`;
    })
    .join('\n');

  return `<!DOCTYPE html>
<html lang="en-GB">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(content.title)}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,700&family=Source+Sans+3:wght@400;600&display=swap');
    @page { size: A4; margin: 14mm; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: 'Source Sans 3', Georgia, serif;
      color: ${palette.ink};
      background: ${palette.paper};
      font-size: 12.5pt;
      line-height: 1.45;
    }
    .sheet {
      background:
        radial-gradient(ellipse at 10% 0%, ${palette.wash} 0%, transparent 55%),
        ${palette.paper};
      min-height: 100vh;
      padding: 8mm 6mm;
    }
    header {
      border-bottom: 2px solid ${palette.accent};
      padding-bottom: 10px;
      margin-bottom: 18px;
    }
    .brand {
      font-family: 'Fraunces', Georgia, serif;
      font-size: 11pt;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: ${palette.accent};
      margin: 0 0 6px;
    }
    h1 {
      font-family: 'Fraunces', Georgia, serif;
      font-size: 26pt;
      font-weight: 700;
      margin: 0 0 8px;
      line-height: 1.15;
    }
    .intro { margin: 0; max-width: 42em; }
    .child-line {
      margin-top: 10px;
      font-size: 11pt;
      opacity: 0.85;
    }
    .activity {
      margin: 20px 0;
      padding: 14px 16px;
      border: 1px solid color-mix(in srgb, ${palette.accent} 35%, transparent);
      border-radius: 2px;
      background: color-mix(in srgb, white 70%, ${palette.wash});
      break-inside: avoid;
    }
    .activity-header { display: flex; gap: 12px; align-items: flex-start; }
    .num {
      flex: 0 0 32px;
      height: 32px;
      border-radius: 50%;
      background: ${palette.accent};
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'Fraunces', Georgia, serif;
      font-weight: 700;
    }
    h2 { font-family: 'Fraunces', Georgia, serif; font-size: 15pt; margin: 0; }
    .meta { margin: 2px 0 0; font-size: 9.5pt; opacity: 0.7; }
    .instructions { margin: 10px 0 6px; }
    .prompt { font-weight: 600; margin: 0 0 10px; }
    .answer-box {
      min-height: 90px;
      border: 1.5px dashed color-mix(in srgb, ${palette.accent} 55%, transparent);
      border-radius: 2px;
      padding: 8px 10px;
      background: white;
      position: relative;
    }
    .hint { font-size: 9.5pt; opacity: 0.55; font-style: italic; }
    .illus {
      margin: 8px 0 0;
      font-size: 9pt;
      opacity: 0.5;
      font-style: italic;
    }
    footer {
      margin-top: 24px;
      padding-top: 12px;
      border-top: 1px solid color-mix(in srgb, ${palette.accent} 30%, transparent);
      font-size: 10.5pt;
    }
  </style>
</head>
<body>
  <div class="sheet">
    <header>
      <p class="brand">Weekend Worksheets</p>
      <h1>${escapeHtml(content.title)}</h1>
      <p class="intro">${escapeHtml(content.intro)}</p>
      <p class="child-line">For ${escapeHtml(child.name)} · Theme: ${escapeHtml(content.theme)}</p>
    </header>
    ${activitiesHtml}
    <footer>
      <p>${escapeHtml(content.closingNote)}</p>
    </footer>
  </div>
</body>
</html>`;
}

export async function writeWorksheetPdf(
  worksheetId: string,
  html: string,
): Promise<string> {
  const pdfDir = path.join(STORAGE_DIR, 'pdfs');
  fs.mkdirSync(pdfDir, { recursive: true });
  const pdfPath = path.join(pdfDir, `${worksheetId}.pdf`);

  // In demo/test environments without browsers, write an HTML fallback the UI can still open
  try {
    const browser = await chromium.launch({ headless: true });
    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle' });
      await page.pdf({
        path: pdfPath,
        format: 'A4',
        printBackground: true,
        margin: { top: '12mm', right: '12mm', bottom: '12mm', left: '12mm' },
      });
    } finally {
      await browser.close();
    }
  } catch {
    const htmlPath = path.join(pdfDir, `${worksheetId}.html`);
    fs.writeFileSync(htmlPath, html, 'utf8');
    // Also write a minimal PDF-like placeholder marker file path for DB
    fs.writeFileSync(pdfPath.replace(/\.pdf$/, '.html'), html, 'utf8');
    return htmlPath;
  }

  return pdfPath;
}
