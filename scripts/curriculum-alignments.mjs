#!/usr/bin/env node
// Explicit-input, read-only CLI; stdout can be redirected to a separate preview file.
import { readFileSync } from 'node:fs';
import { parseArgs } from 'node:util';
import { fileURLToPath } from 'node:url';
import { checkTopicCompatibility, normalizeCurriculumAlignments, projectTopicCompatibility, CurriculumAlignmentError } from './check-curriculum-alignments.mjs';
const usage = `Usage: node scripts/curriculum-alignments.mjs check|normalize|project --alignments FILE [--topics FILE] [--curricula FILE]
check: validate references/contexts and agreement with current flat topic fields
normalize: emit canonical alignment JSON (does not certify flat-field agreement)
project: emit only derived topic IDs/standards/ages for review, not a complete topics.json
All commands are read-only. No DB connection, inferred contexts, or file writes.`;
try {
  const { values, positionals } = parseArgs({
    options: { alignments: { type: 'string' }, topics: { type: 'string' }, curricula: { type: 'string' }, help: { type: 'boolean' } },
    allowPositionals: true, strict: true,
  });
  if (values.help) console.log(usage);
  else {
    const [command] = positionals;
    if (positionals.length !== 1 || !['check', 'normalize', 'project'].includes(command) || !values.alignments) throw new Error(usage);
    const load = file => JSON.parse(readFileSync(file, 'utf8'));
    const context = {
      topics: load(values.topics ?? fileURLToPath(new URL('../data/topics.json', import.meta.url))),
      curriculumStandards: load(values.curricula ?? fileURLToPath(new URL('../data/curriculum-standards.json', import.meta.url))),
    };
    const document = load(values.alignments);
    if (command === 'normalize') console.log(JSON.stringify(normalizeCurriculumAlignments(document, context), null, 2));
    else if (command === 'project') console.log(JSON.stringify(projectTopicCompatibility(document, context), null, 2));
    else {
      const errors = checkTopicCompatibility(document, context);
      if (errors.length) throw new CurriculumAlignmentError(errors);
      console.log(JSON.stringify({ valid: true, schemaVersion: 1, version: document.version, alignmentContexts: document.alignments.length, topicsChecked: context.topics.topics.length }));
    }
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
