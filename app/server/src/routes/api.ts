import { Hono } from 'hono';
import { nanoid } from 'nanoid';
import {
  deleteChild,
  getChild,
  getSetting,
  getWorksheet,
  listAssessments,
  listChildren,
  listMastery,
  listWorksheets,
  setSetting,
  upsertChild,
} from '../db/repository.js';
import { buildProgressSummary } from '../services/progress.js';
import { createWorksheet, markWorksheetPrinted } from '../services/worksheets.js';
import { assessWorksheetScan } from '../services/assess.js';
import { getAgentStatus } from '../agents/index.js';
import { getClusterSummary, loadTaxonomy } from '../services/taxonomy.js';
import { buildLearningPathForChild } from '../services/learningPath.js';
import type { Child } from '../../../shared/types.js';
import { deriveChildAgeFields, isValidDob } from '../../../shared/ukSchoolYear.js';
import fs from 'node:fs';

export const api = new Hono();

api.get('/health', (c) => c.json({ ok: true }));

api.get('/settings', (c) => {
  const status = getAgentStatus();
  return c.json({
    demoMode: status.demoMode,
    anthropicConfigured: status.anthropicConfigured,
    openaiConfigured: status.openaiConfigured,
  });
});

api.put('/settings/demo-mode', async (c) => {
  const body = await c.req.json<{ demoMode: boolean }>();
  setSetting('demo_mode', body.demoMode ? 'true' : 'false');
  return c.json({ demoMode: getSetting('demo_mode') === 'true' });
});

api.get('/children', (c) => c.json(listChildren()));

api.get('/children/:id', (c) => {
  const child = getChild(c.req.param('id'));
  if (!child) return c.json({ error: 'Not found' }, 404);
  return c.json(child);
});

api.post('/children', async (c) => {
  const body = await c.req.json<{
    name: string;
    dateOfBirth: string;
    interests?: string[];
    avatarColor?: string;
  }>();

  if (!body.name?.trim() || !body.dateOfBirth) {
    return c.json({ error: 'name and dateOfBirth are required' }, 400);
  }

  if (!isValidDob(body.dateOfBirth)) {
    return c.json({ error: 'dateOfBirth must be a valid YYYY-MM-DD date' }, 400);
  }

  const derived = deriveChildAgeFields(body.dateOfBirth);
  if (derived.age < 3 || derived.age > 12) {
    return c.json({ error: 'Child age must be between 3 and 12' }, 400);
  }

  const now = new Date().toISOString();
  const child: Child = {
    id: nanoid(),
    name: body.name.trim(),
    dateOfBirth: body.dateOfBirth,
    age: derived.age,
    yearGroup: derived.yearGroup,
    interests: body.interests ?? [],
    avatarColor: body.avatarColor ?? '#2a6f7a',
    createdAt: now,
    updatedAt: now,
  };
  return c.json(upsertChild(child), 201);
});

api.put('/children/:id', async (c) => {
  const existing = getChild(c.req.param('id'));
  if (!existing) return c.json({ error: 'Not found' }, 404);

  const body = await c.req.json<{
    name?: string;
    dateOfBirth?: string;
    interests?: string[];
    avatarColor?: string;
  }>();

  const dateOfBirth = body.dateOfBirth ?? existing.dateOfBirth;
  if (!isValidDob(dateOfBirth)) {
    return c.json({ error: 'dateOfBirth must be a valid YYYY-MM-DD date' }, 400);
  }

  const derived = deriveChildAgeFields(dateOfBirth);
  if (derived.age < 3 || derived.age > 12) {
    return c.json({ error: 'Child age must be between 3 and 12' }, 400);
  }

  const updated: Child = {
    ...existing,
    name: body.name?.trim() || existing.name,
    dateOfBirth,
    age: derived.age,
    yearGroup: derived.yearGroup,
    interests: body.interests ?? existing.interests,
    avatarColor: body.avatarColor ?? existing.avatarColor,
    updatedAt: new Date().toISOString(),
  };
  return c.json(upsertChild(updated));
});

api.delete('/children/:id', (c) => {
  deleteChild(c.req.param('id'));
  return c.json({ ok: true });
});

api.get('/children/:id/progress', (c) => {
  const child = getChild(c.req.param('id'));
  if (!child) return c.json({ error: 'Not found' }, 404);
  return c.json(buildProgressSummary(child));
});

api.get('/children/:id/learning-path', (c) => {
  const child = getChild(c.req.param('id'));
  if (!child) return c.json({ error: 'Not found' }, 404);
  return c.json(buildLearningPathForChild(child));
});

api.get('/children/:id/mastery', (c) => {
  const child = getChild(c.req.param('id'));
  if (!child) return c.json({ error: 'Not found' }, 404);
  const mastery = listMastery(child.id);
  const taxonomy = loadTaxonomy();
  const enriched = mastery.map((m) => {
    const topic = taxonomy.topicsById.get(m.topicId);
    return {
      ...m,
      topic: topic
        ? {
            id: topic.id,
            name: topic.name,
            subject: topic.subject,
            domain: topic.domain,
            description: topic.description,
          }
        : null,
    };
  });
  return c.json(enriched);
});

api.get('/children/:id/worksheets', (c) => {
  const child = getChild(c.req.param('id'));
  if (!child) return c.json({ error: 'Not found' }, 404);
  return c.json(listWorksheets(child.id));
});

api.get('/children/:id/assessments', (c) => {
  const child = getChild(c.req.param('id'));
  if (!child) return c.json({ error: 'Not found' }, 404);
  return c.json(listAssessments(child.id));
});

api.get('/children/:id/domains', (c) => {
  const child = getChild(c.req.param('id'));
  if (!child) return c.json({ error: 'Not found' }, 404);
  const mastery = listMastery(child.id);
  const taxonomy = loadTaxonomy();
  const domains = new Map<
    string,
    {
      subject: string;
      domain: string;
      summary: string | null;
      topics: Array<{ topicId: string; name: string | null; status: string; confidence: number }>;
    }
  >();

  for (const m of mastery) {
    const topic = taxonomy.topicsById.get(m.topicId);
    if (!topic) continue;
    const key = `${topic.subject}::${topic.domain ?? 'General'}`;
    if (!domains.has(key)) {
      domains.set(key, {
        subject: topic.subject,
        domain: topic.domain ?? 'General',
        summary: getClusterSummary(topic.subject, topic.domain ?? '', child.age),
        topics: [],
      });
    }
    domains.get(key)!.topics.push({
      topicId: m.topicId,
      name: topic.name,
      status: m.status,
      confidence: m.confidence,
    });
  }

  return c.json([...domains.values()]);
});

api.post('/worksheets', async (c) => {
  try {
    const body = await c.req.json<{
      childId: string;
      theme: string;
      durationMinutes: number;
      subjectFocus?: string | null;
      domainFocus?: string | null;
      preferTopicId?: string | null;
    }>();

    if (!body.childId || !body.theme?.trim() || !body.durationMinutes) {
      return c.json({ error: 'childId, theme, and durationMinutes are required' }, 400);
    }

    const worksheet = await createWorksheet({
      childId: body.childId,
      theme: body.theme.trim(),
      durationMinutes: body.durationMinutes,
      subjectFocus: body.subjectFocus,
      domainFocus: body.domainFocus,
      preferTopicId: body.preferTopicId,
    });
    return c.json(worksheet, 201);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to create worksheet';
    return c.json({ error: message }, 400);
  }
});

api.get('/worksheets/:id', (c) => {
  const worksheet = getWorksheet(c.req.param('id'));
  if (!worksheet) return c.json({ error: 'Not found' }, 404);
  return c.json(worksheet);
});

api.get('/worksheets/:id/file', (c) => {
  const worksheet = getWorksheet(c.req.param('id'));
  if (!worksheet?.pdfPath || !fs.existsSync(worksheet.pdfPath)) {
    return c.json({ error: 'File not found' }, 404);
  }
  const data = fs.readFileSync(worksheet.pdfPath);
  const isHtml = worksheet.pdfPath.endsWith('.html');
  return c.body(data, 200, {
    'Content-Type': isHtml ? 'text/html' : 'application/pdf',
    'Content-Disposition': `inline; filename="${worksheet.id}.${isHtml ? 'html' : 'pdf'}"`,
  });
});

api.post('/worksheets/:id/printed', (c) => {
  const worksheet = getWorksheet(c.req.param('id'));
  if (!worksheet) return c.json({ error: 'Not found' }, 404);
  markWorksheetPrinted(worksheet.id);
  return c.json({ ok: true });
});

api.post('/worksheets/:id/assess', async (c) => {
  try {
    const worksheet = getWorksheet(c.req.param('id'));
    if (!worksheet) return c.json({ error: 'Not found' }, 404);

    const form = await c.req.parseBody();
    const file = form.file;
    if (!file || typeof file === 'string') {
      return c.json({ error: 'file is required' }, 400);
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const assessment = await assessWorksheetScan({
      worksheetId: worksheet.id,
      imageBuffer: buffer,
      mimeType: file.type || 'image/jpeg',
      originalName: file.name,
    });
    return c.json(assessment, 201);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Assessment failed';
    return c.json({ error: message }, 400);
  }
});

api.get('/taxonomy/subjects', (c) => {
  const taxonomy = loadTaxonomy();
  const subjects = [...new Set(taxonomy.topics.map((t) => t.subject))].sort();
  return c.json(subjects);
});
