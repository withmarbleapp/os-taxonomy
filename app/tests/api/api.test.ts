import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { Hono } from 'hono';

describe('API routes', () => {
  let dbPath: string;
  let api: Hono;

  beforeEach(async () => {
    dbPath = path.join(os.tmpdir(), `ww-test-${Date.now()}.db`);
    process.env.DEMO_MODE = 'true';

    const { resetDbForTests } = await import('../../server/src/db/database.js');
    resetDbForTests(dbPath);

    const { seedDatabase } = await import('../../server/src/db/seed.js');
    await seedDatabase({ reset: true });

    const mod = await import('../../server/src/routes/api.js');
    api = mod.api;
  });

  afterEach(async () => {
    const { closeDb } = await import('../../server/src/db/database.js');
    closeDb();
    if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);
  });

  it('lists seeded children', async () => {
    const res = await api.request('/children');
    expect(res.status).toBe(200);
    const children = await res.json();
    expect(children.length).toBeGreaterThanOrEqual(2);
    expect(children.map((c: { name: string }) => c.name)).toEqual(
      expect.arrayContaining(['Maya', 'Leo']),
    );
    const maya = children.find((c: { name: string }) => c.name === 'Maya');
    expect(maya.dateOfBirth).toBe('2021-03-15');
    expect(maya.yearGroup).toBe('Reception');
    expect(maya.age).toBe(5);

    const leo = children.find((c: { name: string }) => c.name === 'Leo');
    expect(leo.dateOfBirth).toBe('2019-01-10');
    expect(leo.yearGroup).toBe('Year 2');
    expect(leo.age).toBe(7);
  });

  it('derives the correct UK school year for each primary age band from DOB', async () => {
    const { deriveChildAgeFields } = await import('../../shared/ukSchoolYear.js');
    const asOf = new Date();

    const cases = [
      { name: 'NurseryKid', dateOfBirth: '2022-03-15' },
      { name: 'ReceptionKid', dateOfBirth: '2021-03-15' },
      { name: 'Year1Kid', dateOfBirth: '2020-03-15' },
      { name: 'Year2Kid', dateOfBirth: '2019-03-15' },
      { name: 'Year3Kid', dateOfBirth: '2018-03-15' },
      { name: 'Year4Kid', dateOfBirth: '2017-03-15' },
      { name: 'Year5Kid', dateOfBirth: '2016-03-15' },
      { name: 'Year6Kid', dateOfBirth: '2015-03-15' },
    ] as const;

    for (const c of cases) {
      const expected = deriveChildAgeFields(c.dateOfBirth, asOf);
      // Skip ages outside the API's 3–12 create window
      if (expected.age < 3 || expected.age > 12) continue;

      const res = await api.request('/children', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: c.name,
          dateOfBirth: c.dateOfBirth,
        }),
      });
      expect(res.status).toBe(201);
      const child = await res.json();
      expect(child.dateOfBirth).toBe(c.dateOfBirth);
      expect(child.age).toBe(expected.age);
      expect(child.yearGroup).toBe(expected.yearGroup);
    }
  });

  it('creates, updates, and deletes a child with DOB-derived year group', async () => {
    const create = await api.request('/children', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Sam',
        dateOfBirth: '2020-03-15',
        interests: ['trains'],
      }),
    });
    expect(create.status).toBe(201);
    const sam = await create.json();
    expect(sam.dateOfBirth).toBe('2020-03-15');
    expect(sam.age).toBe(6);
    expect(sam.yearGroup).toBe('Year 1');

    const update = await api.request(`/children/${sam.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dateOfBirth: '2019-01-10' }),
    });
    expect(update.status).toBe(200);
    const updated = await update.json();
    expect(updated.age).toBe(7);
    expect(updated.yearGroup).toBe('Year 2');

    const del = await api.request(`/children/${sam.id}`, { method: 'DELETE' });
    expect(del.status).toBe(200);
    const gone = await api.request(`/children/${sam.id}`);
    expect(gone.status).toBe(404);
  });

  it('returns progress for a child', async () => {
    const list = await api.request('/children');
    const children = await list.json();
    const maya = children.find((c: { name: string }) => c.name === 'Maya');
    const res = await api.request(`/children/${maya.id}/progress`);
    expect(res.status).toBe(200);
    const progress = await res.json();
    expect(progress.story).toContain('Maya');
    expect(progress.totalTracked).toBeGreaterThan(0);
    expect(progress.ragCounts).toBeDefined();
    expect(progress.ragCounts.green + progress.ragCounts.amber + progress.ragCounts.red).toBeGreaterThan(0);
    expect(progress.frontier).toBeTruthy();
  });

  it('returns a curated learning path with RAG colours', async () => {
    const list = await api.request('/children');
    const children = await list.json();
    const maya = children.find((c: { name: string }) => c.name === 'Maya');
    const res = await api.request(`/children/${maya.id}/learning-path`);
    expect(res.status).toBe(200);
    const path = await res.json();
    expect(path.subjects.length).toBeGreaterThan(0);
    expect(path.ragCounts).toBeDefined();
    expect(path.frontier).toBeTruthy();
    expect(path.constellation.length).toBeGreaterThan(0);
    const hasDomain = path.subjects.some(
      (s: { domains: unknown[] }) => s.domains.length > 0,
    );
    expect(hasDomain).toBe(true);
  });

  it('creates a worksheet in demo mode', async () => {
    const list = await api.request('/children');
    const children = await list.json();
    const maya = children.find((c: { name: string }) => c.name === 'Maya');

    const res = await api.request('/worksheets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        childId: maya.id,
        theme: 'sea life',
        durationMinutes: 20,
      }),
    });
    expect(res.status).toBe(201);
    const worksheet = await res.json();
    expect(worksheet.theme).toBe('sea life');
    expect(worksheet.status).toBe('ready');
    expect(worksheet.topicIds.length).toBeGreaterThan(0);
    expect(worksheet.pdfPath).toBeTruthy();
    expect(worksheet.domainFocus).toBeNull();
  });

  it('creates a worksheet with domain focus', async () => {
    const list = await api.request('/children');
    const children = await list.json();
    const maya = children.find((c: { name: string }) => c.name === 'Maya');

    const pathRes = await api.request(`/children/${maya.id}/learning-path`);
    const path = await pathRes.json();
    const english = path.subjects.find((s: { subject: string }) => s.subject === 'English');
    expect(english).toBeTruthy();
    const domain = english.domains[0];
    expect(domain?.domain).toBeTruthy();

    const res = await api.request('/worksheets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        childId: maya.id,
        theme: 'dragons',
        durationMinutes: 15,
        subjectFocus: 'English',
        domainFocus: domain.domain,
      }),
    });
    expect(res.status).toBe(201);
    const worksheet = await res.json();
    expect(worksheet.subjectFocus).toBe('English');
    expect(worksheet.domainFocus).toBe(domain.domain);

    const { loadTaxonomy } = await import('../../server/src/services/taxonomy.js');
    const taxonomy = loadTaxonomy();
    for (const topicId of worksheet.topicIds as string[]) {
      const topic = taxonomy.topicsById.get(topicId);
      expect(topic?.subject).toBe('English');
      expect(topic?.domain ?? 'General').toBe(domain.domain);
    }
  });

  it('assesses a scan in demo mode and updates mastery', async () => {
    const list = await api.request('/children');
    const children = await list.json();
    const maya = children.find((c: { name: string }) => c.name === 'Maya');

    const create = await api.request('/worksheets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        childId: maya.id,
        theme: 'unicorns',
        durationMinutes: 15,
      }),
    });
    const worksheet = await create.json();

    const form = new FormData();
    const blob = new Blob(['fake-image-bytes'], { type: 'image/jpeg' });
    form.append('file', blob, 'scan.jpg');

    const assess = await api.request(`/worksheets/${worksheet.id}/assess`, {
      method: 'POST',
      body: form,
    });
    expect(assess.status).toBe(201);
    const assessment = await assess.json();
    expect(assessment.summary).toContain('Maya');
    expect(assessment.results.length).toBeGreaterThan(0);

    const mastery = await api.request(`/children/${maya.id}/mastery`);
    const masteryJson = await mastery.json();
    expect(masteryJson.length).toBeGreaterThan(0);
  });

  it('toggles demo mode setting', async () => {
    const res = await api.request('/settings/demo-mode', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ demoMode: true }),
    });
    expect(res.status).toBe(200);
    const settings = await api.request('/settings');
    const json = await settings.json();
    expect(json.demoMode).toBe(true);
  });
});
