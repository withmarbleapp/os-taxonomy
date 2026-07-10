import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';
import { approximateDobFromAge } from '../../../shared/ukSchoolYear.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const APP_ROOT = path.resolve(__dirname, '../../..');
export const STORAGE_DIR = path.join(APP_ROOT, 'storage');
export const DB_PATH = path.join(STORAGE_DIR, 'worksheets.db');

export type AppDatabase = DatabaseSync;

export function ensureStorageDirs(): void {
  for (const dir of [
    STORAGE_DIR,
    path.join(STORAGE_DIR, 'pdfs'),
    path.join(STORAGE_DIR, 'scans'),
  ]) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

let dbInstance: AppDatabase | null = null;

export function getDb(dbPath = DB_PATH): AppDatabase {
  if (dbInstance) return dbInstance;

  ensureStorageDirs();
  const db = new DatabaseSync(dbPath);
  db.exec('PRAGMA journal_mode = WAL');
  db.exec('PRAGMA foreign_keys = ON');
  migrate(db);
  dbInstance = db;
  return db;
}

export function closeDb(): void {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}

export function resetDbForTests(dbPath: string): AppDatabase {
  closeDb();
  if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);
  const db = new DatabaseSync(dbPath);
  db.exec('PRAGMA foreign_keys = ON');
  migrate(db);
  dbInstance = db;
  return db;
}

function migrate(db: AppDatabase): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS children (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      age INTEGER NOT NULL,
      year_group TEXT,
      date_of_birth TEXT,
      interests TEXT NOT NULL DEFAULT '[]',
      avatar_color TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS topic_mastery (
      child_id TEXT NOT NULL,
      topic_id TEXT NOT NULL,
      status TEXT NOT NULL,
      confidence REAL NOT NULL DEFAULT 0,
      last_assessed_at TEXT,
      notes TEXT,
      PRIMARY KEY (child_id, topic_id),
      FOREIGN KEY (child_id) REFERENCES children(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS worksheets (
      id TEXT PRIMARY KEY,
      child_id TEXT NOT NULL,
      theme TEXT NOT NULL,
      duration_minutes INTEGER NOT NULL,
      subject_focus TEXT,
      domain_focus TEXT,
      topic_ids TEXT NOT NULL,
      title TEXT NOT NULL,
      pdf_path TEXT,
      content_json TEXT NOT NULL,
      status TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (child_id) REFERENCES children(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS assessments (
      id TEXT PRIMARY KEY,
      worksheet_id TEXT NOT NULL,
      child_id TEXT NOT NULL,
      scan_path TEXT NOT NULL,
      results_json TEXT NOT NULL,
      summary TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (worksheet_id) REFERENCES worksheets(id) ON DELETE CASCADE,
      FOREIGN KEY (child_id) REFERENCES children(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  ensureColumn(db, 'worksheets', 'domain_focus', 'TEXT');
  ensureColumn(db, 'children', 'date_of_birth', 'TEXT');
  backfillDateOfBirth(db);
}

function ensureColumn(
  db: AppDatabase,
  table: string,
  column: string,
  type: string,
): void {
  const cols = db.prepare(`PRAGMA table_info(${table})`).all() as Array<{ name: string }>;
  if (!cols.some((c) => c.name === column)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${type}`);
  }
}

function backfillDateOfBirth(db: AppDatabase): void {
  const rows = db
    .prepare(
      `SELECT id, age FROM children WHERE date_of_birth IS NULL OR date_of_birth = ''`,
    )
    .all() as Array<{ id: string; age: number }>;

  const update = db.prepare('UPDATE children SET date_of_birth = ? WHERE id = ?');
  for (const row of rows) {
    update.run(approximateDobFromAge(row.age), row.id);
  }
}
