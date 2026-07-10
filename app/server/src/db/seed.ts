import { nanoid } from 'nanoid';
import type { Child, TopicMastery, Worksheet } from '../../../shared/types.js';
import { ensureStorageDirs, getDb, closeDb, STORAGE_DIR } from './database.js';
import {
  insertWorksheet,
  setSetting,
  upsertChild,
  upsertMastery,
} from './repository.js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderWorksheetHtml, writeWorksheetPdf } from '../pdf/render.js';
import { loadTaxonomy } from '../services/taxonomy.js';
import type { GeneratedWorksheetContent } from '../../../shared/types.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURES = path.resolve(__dirname, '../../../fixtures');

const CHILD_MAYA: Child = {
  id: 'child_maya',
  name: 'Maya',
  dateOfBirth: '2021-03-15',
  age: 5,
  yearGroup: 'Reception',
  interests: ['sea life', 'unicorns', 'dinosaurs'],
  avatarColor: '#2a6f7a',
  createdAt: '2026-06-01T10:00:00.000Z',
  updatedAt: '2026-06-01T10:00:00.000Z',
};

const CHILD_LEO: Child = {
  id: 'child_leo',
  name: 'Leo',
  dateOfBirth: '2019-01-10',
  age: 7,
  yearGroup: 'Year 2',
  interests: ['ponies', 'space', 'football'],
  avatarColor: '#8b6914',
  createdAt: '2026-06-01T10:00:00.000Z',
  updatedAt: '2026-06-01T10:00:00.000Z',
};

const MAYA_MASTERY: Omit<TopicMastery, 'childId'>[] = [
  { topicId: 'mt_WcfaSfVT33', status: 'mastered', confidence: 0.95, lastAssessedAt: '2026-06-15T10:00:00.000Z', notes: 'Confident one-to-one counting' },
  { topicId: 'mt_dmNvjroCPT', status: 'mastered', confidence: 0.9, lastAssessedAt: '2026-06-15T10:00:00.000Z', notes: null },
  { topicId: 'mt_OvyoRo47K-', status: 'practicing', confidence: 0.7, lastAssessedAt: '2026-06-20T10:00:00.000Z', notes: 'Addition combining' },
  { topicId: 'mt_zuKAX6lcYR', status: 'introduced', confidence: 0.4, lastAssessedAt: '2026-06-22T10:00:00.000Z', notes: null },
  { topicId: 'mt_fR0UtsSREU', status: 'practicing', confidence: 0.65, lastAssessedAt: '2026-06-18T10:00:00.000Z', notes: null },
  { topicId: 'mt_N8CpN1EJrP', status: 'practicing', confidence: 0.6, lastAssessedAt: '2026-06-21T10:00:00.000Z', notes: 'Building sentences' },
  { topicId: 'mt_QEr24lqzvH', status: 'needs_refresh', confidence: 0.45, lastAssessedAt: '2026-05-10T10:00:00.000Z', notes: 'Capitals and full stops slipping' },
  { topicId: 'mt_zVLOm6U7bh', status: 'introduced', confidence: 0.5, lastAssessedAt: '2026-06-12T10:00:00.000Z', notes: null },
  { topicId: 'mt_WBfj79OqXz', status: 'mastered', confidence: 0.92, lastAssessedAt: '2026-06-01T10:00:00.000Z', notes: null },
  { topicId: 'mt_1KCwbGvm1F', status: 'practicing', confidence: 0.7, lastAssessedAt: '2026-06-19T10:00:00.000Z', notes: null },
];

const LEO_MASTERY: Omit<TopicMastery, 'childId'>[] = [
  { topicId: 'mt_WcfaSfVT33', status: 'mastered', confidence: 0.98, lastAssessedAt: '2026-05-01T10:00:00.000Z', notes: null },
  { topicId: 'mt_dmNvjroCPT', status: 'mastered', confidence: 0.95, lastAssessedAt: '2026-05-01T10:00:00.000Z', notes: null },
  { topicId: 'mt_OvyoRo47K-', status: 'mastered', confidence: 0.9, lastAssessedAt: '2026-05-20T10:00:00.000Z', notes: null },
  { topicId: 'mt_zuKAX6lcYR', status: 'mastered', confidence: 0.88, lastAssessedAt: '2026-05-20T10:00:00.000Z', notes: null },
  { topicId: 'mt_r0VXbfAmsH', status: 'practicing', confidence: 0.7, lastAssessedAt: '2026-06-18T10:00:00.000Z', notes: 'A ten is ten ones' },
  { topicId: 'mt_THl9GLxwoL', status: 'introduced', confidence: 0.5, lastAssessedAt: '2026-06-20T10:00:00.000Z', notes: null },
  { topicId: 'mt_HhuSDxwDNM', status: 'practicing', confidence: 0.65, lastAssessedAt: '2026-06-22T10:00:00.000Z', notes: 'Times tables starting' },
  { topicId: 'mt_N8CpN1EJrP', status: 'mastered', confidence: 0.9, lastAssessedAt: '2026-06-01T10:00:00.000Z', notes: null },
  { topicId: 'mt_YXVQaufkKO', status: 'needs_refresh', confidence: 0.5, lastAssessedAt: '2026-04-15T10:00:00.000Z', notes: 'Joining with and' },
  { topicId: 'mt_xACS3rWWDp', status: 'introduced', confidence: 0.45, lastAssessedAt: '2026-06-25T10:00:00.000Z', notes: null },
  { topicId: 'mt_go5i87u2b9', status: 'practicing', confidence: 0.7, lastAssessedAt: '2026-06-10T10:00:00.000Z', notes: null },
  { topicId: 'mt_wQ89AEXhz3', status: 'not_started', confidence: 0, lastAssessedAt: null, notes: null },
];

function createSampleScan(): string {
  const scansDir = path.join(STORAGE_DIR, 'scans');
  fs.mkdirSync(scansDir, { recursive: true });
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1100" viewBox="0 0 800 1100">
  <rect width="800" height="1100" fill="#f7f4ef"/>
  <text x="40" y="60" font-family="Georgia" font-size="28" fill="#1a2f38">Sample completed worksheet (demo)</text>
  <text x="40" y="110" font-family="Georgia" font-size="18" fill="#2a6f7a">Child writing shown as placeholder marks</text>
  <rect x="40" y="160" width="720" height="120" fill="none" stroke="#2a6f7a" stroke-dasharray="6 4"/>
  <text x="60" y="220" font-family="Comic Sans MS, cursive" font-size="22" fill="#333">7 + 5 = 12  ★★★</text>
  <rect x="40" y="320" width="720" height="120" fill="none" stroke="#2a6f7a" stroke-dasharray="6 4"/>
  <text x="60" y="380" font-family="Comic Sans MS, cursive" font-size="20" fill="#333">The dolphin jumps over the waves.</text>
  <rect x="40" y="480" width="720" height="120" fill="none" stroke="#2a6f7a" stroke-dasharray="6 4"/>
  <text x="60" y="540" font-family="Comic Sans MS, cursive" font-size="20" fill="#333">fish  crab  turtle</text>
</svg>`;
  const scanPath = path.join(scansDir, 'demo-scan-sea-life.svg');
  fs.writeFileSync(scanPath, svg, 'utf8');

  // Also copy into fixtures for reference
  const fixtureScan = path.join(FIXTURES, 'scans', 'demo-scan-sea-life.svg');
  fs.mkdirSync(path.dirname(fixtureScan), { recursive: true });
  fs.writeFileSync(fixtureScan, svg, 'utf8');
  return scanPath;
}

async function seedWorksheet(
  child: Child,
  theme: string,
  topicIds: string[],
  mockFile: string,
): Promise<Worksheet> {
  const taxonomy = loadTaxonomy();
  const template = JSON.parse(
    fs.readFileSync(path.join(FIXTURES, 'mocks', mockFile), 'utf8'),
  ) as GeneratedWorksheetContent;

  const content: GeneratedWorksheetContent = {
    ...template,
    title: template.title.replaceAll('{{name}}', child.name),
    intro: template.intro
      .replaceAll('{{name}}', child.name)
      .replaceAll('{{theme}}', theme),
    theme,
    closingNote: template.closingNote.replaceAll('{{name}}', child.name),
    activities: topicIds.map((topicId, i) => {
      const base = template.activities[i % template.activities.length];
      const topic = taxonomy.topicsById.get(topicId);
      return {
        topicId,
        title: base.title,
        instructions: base.instructions,
        prompt: base.prompt,
        answerSpaceHint: base.answerSpaceHint,
        illustrationHint: base.illustrationHint ?? `Illustration for ${topic?.name}`,
      };
    }),
  };

  const id = `ws_seed_${nanoid(8)}`;
  const html = renderWorksheetHtml(child, content, taxonomy.topicsById);
  const pdfPath = await writeWorksheetPdf(id, html);

  const worksheet: Worksheet = {
    id,
    childId: child.id,
    theme,
    durationMinutes: topicIds.length <= 1 ? 15 : topicIds.length <= 2 ? 20 : 30,
    subjectFocus: null,
    domainFocus: null,
    topicIds,
    title: content.title,
    pdfPath,
    contentJson: JSON.stringify(content),
    status: 'ready',
    createdAt: new Date().toISOString(),
  };
  insertWorksheet(worksheet);
  return worksheet;
}

export async function seedDatabase(options?: { reset?: boolean }): Promise<void> {
  ensureStorageDirs();
  const db = getDb();

  if (options?.reset) {
    db.exec(`
      DELETE FROM assessments;
      DELETE FROM worksheets;
      DELETE FROM topic_mastery;
      DELETE FROM children;
      DELETE FROM settings;
    `);
  }

  const existing = db.prepare('SELECT COUNT(*) as c FROM children').get() as { c: number };
  if (existing.c > 0 && !options?.reset) {
    console.log('Database already seeded. Use --reset to reseed.');
    return;
  }

  upsertChild(CHILD_MAYA);
  upsertChild(CHILD_LEO);

  for (const m of MAYA_MASTERY) {
    upsertMastery({ ...m, childId: CHILD_MAYA.id });
  }
  for (const m of LEO_MASTERY) {
    if (m.status === 'not_started') continue;
    upsertMastery({ ...m, childId: CHILD_LEO.id });
  }

  setSetting('demo_mode', 'true');

  await seedWorksheet(CHILD_MAYA, 'sea life', ['mt_OvyoRo47K-', 'mt_N8CpN1EJrP', 'mt_zVLOm6U7bh'], 'generate-sea-life.json');
  await seedWorksheet(CHILD_MAYA, 'unicorns', ['mt_zuKAX6lcYR', 'mt_QEr24lqzvH'], 'generate-unicorns.json');
  await seedWorksheet(CHILD_LEO, 'ponies', ['mt_r0VXbfAmsH', 'mt_YXVQaufkKO', 'mt_HhuSDxwDNM'], 'generate-ponies.json');

  createSampleScan();

  console.log('Seeded children: Maya (5) and Leo (7), sample worksheets, and demo scan.');
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const reset = process.argv.includes('--reset');
  seedDatabase({ reset })
    .then(() => {
      closeDb();
      process.exit(0);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
