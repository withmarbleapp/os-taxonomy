import fs from 'node:fs';
import path from 'node:path';
import { nanoid } from 'nanoid';
import type {
  Assessment,
  AssessmentResult,
  GeneratedWorksheetContent,
} from '../../../shared/types.js';
import { applyAssessmentRecommendation } from '../../../shared/mastery.js';
import { getScanAssessor } from '../agents/index.js';
import { STORAGE_DIR } from '../db/database.js';
import {
  getChild,
  getWorksheet,
  insertAssessment,
  listMastery,
  updateWorksheetStatus,
  upsertMastery,
} from '../db/repository.js';
import { loadTaxonomy } from './taxonomy.js';

export interface AssessWorksheetRequest {
  worksheetId: string;
  imageBuffer: Buffer;
  mimeType: string;
  originalName?: string;
}

export async function assessWorksheetScan(
  req: AssessWorksheetRequest,
): Promise<Assessment> {
  const worksheet = getWorksheet(req.worksheetId);
  if (!worksheet) throw new Error('Worksheet not found');

  const child = getChild(worksheet.childId);
  if (!child) throw new Error('Child not found');

  const taxonomy = loadTaxonomy();
  const topics = worksheet.topicIds
    .map((id) => taxonomy.topicsById.get(id))
    .filter((t): t is NonNullable<typeof t> => Boolean(t));

  const content = JSON.parse(worksheet.contentJson) as GeneratedWorksheetContent;

  const scansDir = path.join(STORAGE_DIR, 'scans');
  fs.mkdirSync(scansDir, { recursive: true });
  const ext = req.mimeType.includes('png')
    ? 'png'
    : req.mimeType.includes('webp')
      ? 'webp'
      : 'jpg';
  const scanPath = path.join(scansDir, `${worksheet.id}-${nanoid(6)}.${ext}`);
  fs.writeFileSync(scanPath, req.imageBuffer);

  const assessor = getScanAssessor();
  const output = await assessor.assess({
    child,
    theme: worksheet.theme,
    topics,
    activities: content.activities,
    imageBase64: req.imageBuffer.toString('base64'),
    mimeType: req.mimeType,
  });

  const existing = listMastery(child.id);
  const existingMap = new Map(existing.map((m) => [m.topicId, m]));
  const now = new Date().toISOString();

  const results: AssessmentResult[] = output.results.map((r) => ({
    topicId: r.topicId,
    score: r.score,
    evidence: r.evidence,
    recommendation: r.recommendation,
  }));

  for (const result of results) {
    const prev = existingMap.get(result.topicId);
    const nextStatus = applyAssessmentRecommendation(
      prev?.status,
      result.recommendation,
      result.score,
    );
    upsertMastery({
      childId: child.id,
      topicId: result.topicId,
      status: nextStatus,
      confidence: result.score,
      lastAssessedAt: now,
      notes: result.evidence.join('; '),
    });
  }

  const assessment: Assessment = {
    id: nanoid(),
    worksheetId: worksheet.id,
    childId: child.id,
    scanPath,
    results,
    summary: output.summary,
    createdAt: now,
  };

  insertAssessment(assessment);
  updateWorksheetStatus(worksheet.id, 'assessed');
  return assessment;
}
