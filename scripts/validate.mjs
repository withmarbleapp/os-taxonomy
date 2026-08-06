#!/usr/bin/env node
/**
 * validate.mjs — dependency-free integrity check for the dataset.
 *
 * Verifies structure, referential integrity (every edge endpoint and every
 * topic→standard reference resolves), the codes-only invariant, declared
 * counts, and the manifest SHA-256 checksums. Exits non-zero on any failure.
 *
 *   node scripts/validate.mjs
 */

import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const DATA = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'data');
const load = (name) => JSON.parse(readFileSync(resolve(DATA, name), 'utf8'));
const bytesOf = (name) => readFileSync(resolve(DATA, name));

const errors = [];
const check = (cond, msg) => {
  if (!cond) errors.push(msg);
};

const topics = load('topics.json');
const deps = load('dependencies.json');
const standards = load('curriculum-standards.json');
const clusters = load('clusters.json');
const manifest = load('manifest.json');
let crosswalks = null;
try { crosswalks = load('crosswalks.json'); } catch { /* optional file */ }

// --- declared counts match reality -----------------------------------------
check(topics.topicCount === topics.topics.length, `topics: topicCount ${topics.topicCount} != ${topics.topics.length}`);
check(deps.edgeCount === deps.dependencies.length, `dependencies: edgeCount ${deps.edgeCount} != ${deps.dependencies.length}`);
check(standards.curriculumCount === standards.curricula.length, `curricula: curriculumCount != length`);
check(clusters.clusterCount === clusters.clusters.length, `clusters: clusterCount != length`);

// --- topic ids + basic field validity --------------------------------------
const TYPES = new Set(['CONCEPTUAL', 'PROCEDURAL', 'REPRESENTATIONAL', 'LANGUAGE', 'META']);
const topicIds = new Set();
for (const t of topics.topics) {
  check(typeof t.id === 'string' && t.id.startsWith('mt_'), `topic id malformed: ${t.id}`);
  check(TYPES.has(t.type), `topic ${t.id}: bad type ${t.type}`);
  check(typeof t.description === 'string' && t.description.length > 0, `topic ${t.id}: empty description`);
  check(Array.isArray(t.evidence), `topic ${t.id}: evidence not array`);
  if (topicIds.has(t.id)) errors.push(`duplicate topic id: ${t.id}`);
  topicIds.add(t.id);
}

// --- standard keys ----------------------------------------------------------
const standardKeys = new Set();
const codesOnly = new Set(standards.codesOnlySources ?? []);
for (const c of standards.curricula) {
  const expectFullText = !codesOnly.has(c.slug);
  check(c.textIncluded === expectFullText, `curriculum ${c.slug}: textIncluded ${c.textIncluded} disagrees with codesOnlySources`);
  check(c.topicCount === c.topics.length, `curriculum ${c.slug}: topicCount != length`);
  for (const s of c.topics) {
    check(s.key === `${c.slug}:${s.code}`, `standard key mismatch: ${s.key}`);
    if (standardKeys.has(s.key)) errors.push(`duplicate standard key: ${s.key}`);
    standardKeys.add(s.key);
    // codes-only invariant: no verbatim text for encumbered sources
    if (!expectFullText) check(!('data' in s), `codes-only source ${c.slug} leaks verbatim text at ${s.key}`);
  }
}

// --- referential integrity: dependencies ------------------------------------
for (const d of deps.dependencies) {
  check(topicIds.has(d.topicId), `dependency references unknown topicId ${d.topicId}`);
  check(topicIds.has(d.prerequisiteId), `dependency references unknown prerequisiteId ${d.prerequisiteId}`);
  check(d.topicId !== d.prerequisiteId, `self-dependency on ${d.topicId}`);
  check(d.strength === 'hard' || d.strength === 'soft', `bad strength ${d.strength}`);
}

// --- referential integrity: topic → standard -------------------------------
let danglingRefs = 0;
for (const t of topics.topics) {
  for (const key of t.standards) {
    if (!standardKeys.has(key)) {
      danglingRefs++;
      if (danglingRefs <= 5) errors.push(`topic ${t.id} references unknown standard ${key}`);
    }
  }
}
if (danglingRefs > 5) errors.push(`…and ${danglingRefs - 5} more unknown standard references`);

// --- referential integrity: crosswalks --------------------------------------
if (crosswalks) {
  check(crosswalks.crosswalkCount === crosswalks.crosswalks.length, `crosswalks: crosswalkCount != length`);
  const seenXw = new Set();
  for (const x of crosswalks.crosswalks) {
    check(topicIds.has(x.topicId), `crosswalk references unknown topicId ${x.topicId}`);
    check(topicIds.has(x.counterpartId), `crosswalk references unknown counterpartId ${x.counterpartId}`);
    check(x.topicId !== x.counterpartId, `self-crosswalk on ${x.topicId}`);
    check(x.relation === 'same-skill-different-language', `bad crosswalk relation ${x.relation}`);
    check(x.transfer === 'high' || x.transfer === 'partial', `bad crosswalk transfer ${x.transfer}`);
    const k = `${x.topicId}|${x.counterpartId}`;
    if (seenXw.has(k)) errors.push(`duplicate crosswalk ${k}`);
    seenXw.add(k);
  }
}

// --- manifest checksums -----------------------------------------------------
for (const [name, meta] of Object.entries(manifest.files ?? {})) {
  const actual = createHash('sha256').update(bytesOf(name)).digest('hex');
  check(actual === meta.sha256, `checksum mismatch for ${name}`);
}

// --- report -----------------------------------------------------------------
if (errors.length) {
  console.error(`✗ ${errors.length} problem(s):`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log(
  `✓ valid — ${topics.topics.length} topics, ${deps.dependencies.length} dependencies, ` +
    `${standardKeys.size} standards, ${clusters.clusters.length} clusters` +
    (crosswalks ? `, ${crosswalks.crosswalks.length} crosswalks` : '') +
    `. Referential integrity + checksums OK.`,
);
