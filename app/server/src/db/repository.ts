import type {
  Child,
  TopicMastery,
  Worksheet,
  Assessment,
  AssessmentResult,
  MasteryStatus,
  WorksheetStatus,
} from '../../../shared/types.js';
import { deriveChildAgeFields } from '../../../shared/ukSchoolYear.js';
import { getDb, type AppDatabase } from './database.js';

type ChildRow = {
  id: string;
  name: string;
  age: number;
  year_group: string | null;
  date_of_birth: string | null;
  interests: string;
  avatar_color: string;
  created_at: string;
  updated_at: string;
};

type MasteryRow = {
  child_id: string;
  topic_id: string;
  status: MasteryStatus;
  confidence: number;
  last_assessed_at: string | null;
  notes: string | null;
};

type WorksheetRow = {
  id: string;
  child_id: string;
  theme: string;
  duration_minutes: number;
  subject_focus: string | null;
  domain_focus: string | null;
  topic_ids: string;
  title: string;
  pdf_path: string | null;
  content_json: string;
  status: WorksheetStatus;
  created_at: string;
};

type AssessmentRow = {
  id: string;
  worksheet_id: string;
  child_id: string;
  scan_path: string;
  results_json: string;
  summary: string;
  created_at: string;
};

function mapChild(row: ChildRow): Child {
  const dob = row.date_of_birth || approximateFallbackDob(row.age);
  const derived = deriveChildAgeFields(dob);
  return {
    id: row.id,
    name: row.name,
    dateOfBirth: dob,
    age: derived.age,
    yearGroup: derived.yearGroup,
    interests: JSON.parse(row.interests) as string[],
    avatarColor: row.avatar_color,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function approximateFallbackDob(age: number): string {
  const year = new Date().getFullYear() - age;
  return `${year}-01-01`;
}

function mapMastery(row: MasteryRow): TopicMastery {
  return {
    childId: row.child_id,
    topicId: row.topic_id,
    status: row.status,
    confidence: row.confidence,
    lastAssessedAt: row.last_assessed_at,
    notes: row.notes,
  };
}

function mapWorksheet(row: WorksheetRow): Worksheet {
  return {
    id: row.id,
    childId: row.child_id,
    theme: row.theme,
    durationMinutes: row.duration_minutes,
    subjectFocus: row.subject_focus,
    domainFocus: row.domain_focus ?? null,
    topicIds: JSON.parse(row.topic_ids) as string[],
    title: row.title,
    pdfPath: row.pdf_path,
    contentJson: row.content_json,
    status: row.status,
    createdAt: row.created_at,
  };
}

function mapAssessment(row: AssessmentRow): Assessment {
  return {
    id: row.id,
    worksheetId: row.worksheet_id,
    childId: row.child_id,
    scanPath: row.scan_path,
    results: JSON.parse(row.results_json) as AssessmentResult[],
    summary: row.summary,
    createdAt: row.created_at,
  };
}

export function listChildren(db: AppDatabase = getDb()): Child[] {
  const rows = db.prepare('SELECT * FROM children ORDER BY name').all() as ChildRow[];
  return rows.map(mapChild);
}

export function getChild(id: string, db: AppDatabase = getDb()): Child | null {
  const row = db.prepare('SELECT * FROM children WHERE id = ?').get(id) as ChildRow | undefined;
  return row ? mapChild(row) : null;
}

export function upsertChild(child: Child, db: AppDatabase = getDb()): Child {
  const derived = deriveChildAgeFields(child.dateOfBirth);
  db.prepare(
    `INSERT INTO children (id, name, age, year_group, date_of_birth, interests, avatar_color, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       name = excluded.name,
       age = excluded.age,
       year_group = excluded.year_group,
       date_of_birth = excluded.date_of_birth,
       interests = excluded.interests,
       avatar_color = excluded.avatar_color,
       updated_at = excluded.updated_at`,
  ).run(
    child.id,
    child.name,
    derived.age,
    derived.yearGroup,
    child.dateOfBirth,
    JSON.stringify(child.interests),
    child.avatarColor,
    child.createdAt,
    child.updatedAt,
  );
  return {
    ...child,
    age: derived.age,
    yearGroup: derived.yearGroup,
  };
}

export function deleteChild(id: string, db: AppDatabase = getDb()): void {
  db.prepare('DELETE FROM children WHERE id = ?').run(id);
}

export function listMastery(childId: string, db: AppDatabase = getDb()): TopicMastery[] {
  const rows = db
    .prepare('SELECT * FROM topic_mastery WHERE child_id = ?')
    .all(childId) as MasteryRow[];
  return rows.map(mapMastery);
}

export function upsertMastery(mastery: TopicMastery, db: AppDatabase = getDb()): void {
  db.prepare(
    `INSERT INTO topic_mastery (child_id, topic_id, status, confidence, last_assessed_at, notes)
     VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT(child_id, topic_id) DO UPDATE SET
       status = excluded.status,
       confidence = excluded.confidence,
       last_assessed_at = excluded.last_assessed_at,
       notes = excluded.notes`,
  ).run(
    mastery.childId,
    mastery.topicId,
    mastery.status,
    mastery.confidence,
    mastery.lastAssessedAt,
    mastery.notes,
  );
}

export function listWorksheets(childId: string, db: AppDatabase = getDb()): Worksheet[] {
  const rows = db
    .prepare('SELECT * FROM worksheets WHERE child_id = ? ORDER BY created_at DESC')
    .all(childId) as WorksheetRow[];
  return rows.map(mapWorksheet);
}

export function getWorksheet(id: string, db: AppDatabase = getDb()): Worksheet | null {
  const row = db.prepare('SELECT * FROM worksheets WHERE id = ?').get(id) as WorksheetRow | undefined;
  return row ? mapWorksheet(row) : null;
}

export function insertWorksheet(worksheet: Worksheet, db: AppDatabase = getDb()): Worksheet {
  db.prepare(
    `INSERT INTO worksheets
     (id, child_id, theme, duration_minutes, subject_focus, domain_focus, topic_ids, title, pdf_path, content_json, status, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    worksheet.id,
    worksheet.childId,
    worksheet.theme,
    worksheet.durationMinutes,
    worksheet.subjectFocus,
    worksheet.domainFocus,
    JSON.stringify(worksheet.topicIds),
    worksheet.title,
    worksheet.pdfPath,
    worksheet.contentJson,
    worksheet.status,
    worksheet.createdAt,
  );
  return worksheet;
}

export function updateWorksheetStatus(
  id: string,
  status: WorksheetStatus,
  pdfPath?: string | null,
  db: AppDatabase = getDb(),
): void {
  if (pdfPath !== undefined) {
    db.prepare('UPDATE worksheets SET status = ?, pdf_path = ? WHERE id = ?').run(
      status,
      pdfPath,
      id,
    );
  } else {
    db.prepare('UPDATE worksheets SET status = ? WHERE id = ?').run(status, id);
  }
}

export function insertAssessment(assessment: Assessment, db: AppDatabase = getDb()): Assessment {
  db.prepare(
    `INSERT INTO assessments (id, worksheet_id, child_id, scan_path, results_json, summary, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    assessment.id,
    assessment.worksheetId,
    assessment.childId,
    assessment.scanPath,
    JSON.stringify(assessment.results),
    assessment.summary,
    assessment.createdAt,
  );
  return assessment;
}

export function listAssessments(childId: string, db: AppDatabase = getDb()): Assessment[] {
  const rows = db
    .prepare('SELECT * FROM assessments WHERE child_id = ? ORDER BY created_at DESC')
    .all(childId) as AssessmentRow[];
  return rows.map(mapAssessment);
}

export function getSetting(key: string, db: AppDatabase = getDb()): string | null {
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key) as
    | { value: string }
    | undefined;
  return row?.value ?? null;
}

export function setSetting(key: string, value: string, db: AppDatabase = getDb()): void {
  db.prepare(
    `INSERT INTO settings (key, value) VALUES (?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
  ).run(key, value);
}
