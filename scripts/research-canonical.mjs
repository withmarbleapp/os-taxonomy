#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { parseArgs } from 'node:util';
import { fileURLToPath } from 'node:url';
import { canonicalResearchDigest, canonicalResearchSchemaSha256, previewCanonicalResearch, summarizeCanonicalResearchPreview } from './canonical-teaching-research.mjs';

const usage = 'Usage: node scripts/research-canonical.mjs preview|summary|check [--research FILE --topics FILE --manifest FILE --migration-map FILE | --record FILE]\nRead-only: preview emits unapproved candidates and an exact-source-bound ID map; summary emits aggregate counts; check validates one authored v2 record.';
try {
  const { values, positionals } = parseArgs({ allowPositionals: true, strict: true, options: Object.fromEntries(
    ['research', 'topics', 'manifest', 'migration-map', 'record'].map(name => [name, { type: 'string' }])) });
  if (positionals.length !== 1 || !['preview', 'summary', 'check'].includes(positionals[0])) throw Error(usage);
  const load = path => JSON.parse(readFileSync(path));
  const topicPath = values.topics ?? fileURLToPath(new URL('../data/topics.json', import.meta.url));
  const topicsBytes = readFileSync(topicPath), topics = JSON.parse(topicsBytes);
  if (positionals[0] === 'check') {
    if (!values.record || values.research || values.manifest || values['migration-map']) throw Error(usage);
    console.log(JSON.stringify({ valid: true, canonicalSchemaSha256: canonicalResearchSchemaSha256,
      authoredSha256: canonicalResearchDigest(load(values.record), { topics }) }, null, 2));
  } else {
    if (values.record) throw Error(usage);
    const researchBytes = readFileSync(values.research ?? fileURLToPath(new URL('../data/teaching-research.json', import.meta.url)));
    if (JSON.parse(researchBytes).schemaVersion !== 1) throw Error('preview and summary require a legacy v1 snapshot; current v2 records must be validated, not normalized again');
    const manifest = load(values.manifest ?? fileURLToPath(new URL('../data/manifest.json', import.meta.url)));
    const preview = previewCanonicalResearch({ research: JSON.parse(researchBytes), researchBytes, topics, topicsBytes, manifest,
      migrationMap: values['migration-map'] ? load(values['migration-map']) : undefined });
    console.log(JSON.stringify(positionals[0] === 'summary' ? summarizeCanonicalResearchPreview(preview) : preview, null, 2));
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
