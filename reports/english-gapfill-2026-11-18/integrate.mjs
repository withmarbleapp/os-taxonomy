// Append the English gap-fill records to the canonical collection and rebuild it.
// Usage:
//   node reports/english-gapfill-2026-11-18/integrate.mjs                 # records from staging/{A,B,C}-records.json
//   node reports/english-gapfill-2026-11-18/integrate.mjs --from <ref>    # records from <ref>:data/teaching-research.json
// The base collection is the current data/teaching-research.json with any
// in-scope English records removed, so the script is re-runnable after a rebase
// onto a newer main (take main's file, then run with --from <old branch head>).
// Records are appended after all existing records, in frozen-scope order, and
// coverage is derived by buildCanonicalResearchCollection.
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { buildCanonicalResearchCollection } from '../../scripts/canonical-research-collection.mjs';

const root = new URL('../../', import.meta.url);
const report = new URL('reports/english-gapfill-2026-11-18/', root);
const read = url => JSON.parse(fs.readFileSync(url));
const scope = read(new URL('scope.json', report));
const inScope = new Set(scope.scope.map(row => row.topic.id));
const fromIndex = process.argv.indexOf('--from');
let added;
if (fromIndex > 0) {
  const ref = process.argv[fromIndex + 1];
  const old = JSON.parse(execFileSync('git', ['show', `${ref}:data/teaching-research.json`], { cwd: root, maxBuffer: 1 << 30 }));
  added = old.records.filter(row => inScope.has(row.topicId));
} else {
  added = ['A', 'B', 'C'].flatMap(part => read(new URL(`staging/${part}-records.json`, report)));
}
const byTopic = new Map(added.map(row => [row.topicId, row]));
if (byTopic.size !== added.length) throw Error('Duplicate English record');
const missing = [...inScope].filter(id => !byTopic.has(id));
if (missing.length || byTopic.size !== inScope.size) throw Error(`Expected ${inScope.size} records; missing ${missing.length}`);

const topicsBytes = fs.readFileSync(new URL('data/topics.json', root));
const topics = JSON.parse(topicsBytes);
const collectionUrl = new URL('data/teaching-research.json', root);
const current = read(collectionUrl);
const base = current.records.filter(row => !inScope.has(row.topicId));
const records = [...base, ...scope.scope.map(row => byTopic.get(row.topic.id))];
const collection = buildCanonicalResearchCollection({ records, topics, topicsBytes, notes: current.notes });
fs.writeFileSync(collectionUrl, JSON.stringify(collection, null, 2) + '\n');

// Merge source checks. Staging parts use either keyed objects (A) or arrays of
// { key, citation, checked } (B, C); keys are prefixed by part to stay unique.
if (fromIndex < 0) {
  const checks = {};
  for (const part of ['A', 'B', 'C']) {
    const raw = read(new URL(`staging/${part}-sources.json`, report));
    const entries = Array.isArray(raw) ? raw.map(({ key, ...rest }) => [key, rest]) : Object.entries(raw);
    for (const [key, value] of entries) {
      const id = key.startsWith(part + '-') ? key : `${part}-${key}`;
      if (checks[id]) throw Error('Duplicate source-check key ' + id);
      checks[id] = { citation: value.citation, checked: value.checked };
    }
  }
  fs.writeFileSync(new URL('source-checks.json', report), JSON.stringify(checks, null, 2) + '\n');
  console.log(`source-checks.json: ${Object.keys(checks).length} entries, ${new Set(Object.values(checks).map(c => c.citation.url)).size} URLs`);
}
console.log(JSON.stringify({ base: base.length, added: added.length, total: collection.recordCount, withoutResearch: collection.coverage.withoutResearch, english: collection.coverage.bySubject.English }));
