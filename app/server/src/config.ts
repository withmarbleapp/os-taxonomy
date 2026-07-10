import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import { getSetting } from './db/repository.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const APP_ROOT = path.resolve(__dirname, '../..');

function loadEnvFile(): void {
  const envPath = path.join(APP_ROOT, '.env');
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!(key in process.env)) process.env[key] = value;
  }
}

loadEnvFile();

export function isDemoMode(): boolean {
  try {
    const fromDb = getSetting('demo_mode');
    if (fromDb === 'true') return true;
    if (fromDb === 'false') return false;
  } catch {
    // DB may not be ready during early boot
  }
  return (process.env.DEMO_MODE ?? 'true').toLowerCase() === 'true';
}

export function getConfig() {
  return {
    port: Number(process.env.PORT ?? 5173),
    host: process.env.HOST ?? '0.0.0.0',
    demoMode: isDemoMode(),
    anthropicApiKey: process.env.ANTHROPIC_API_KEY ?? '',
    openaiApiKey: process.env.OPENAI_API_KEY ?? '',
  };
}
