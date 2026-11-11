import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const read = path => JSON.parse(readFileSync(new URL(`../${path}`, import.meta.url), 'utf8'));
const expectedKeys = new Set([
  "ncert-fs-2025:IN-NCERT-FS-2025-PM-G1-C14-LO01",
  "ncert-fs-2025:IN-NCERT-FS-2025-PM-G1-C14-LO02",
  "ncert-fs-2025:IN-NCERT-FS-2025-PM-G1-C14-LO03",
  "ncert-fs-2025:IN-NCERT-FS-2025-PM-G1-G2-C13-LO01",
  "ncert-fs-2025:IN-NCERT-FS-2025-PM-G1-G2-C13-LO02",
  "ncert-fs-2025:IN-NCERT-FS-2025-PM-G1-G2-C13-LO03",
  "ncert-fs-2025:IN-NCERT-FS-2025-PM-G1-G2-C13-LO04",
  "ncert-fs-2025:IN-NCERT-FS-2025-PM-G1-G2-C13-LO05",
  "ncert-fs-2025:IN-NCERT-FS-2025-PM-G1-G2-C13-LO06",
  "ncert-fs-2025:IN-NCERT-FS-2025-PM-G2-C14-LO01",
  "ncert-fs-2025:IN-NCERT-FS-2025-PM-G2-C14-LO02",
  "ncert-fs-2025:IN-NCERT-FS-2025-PM-G2-C14-LO03",
  "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-FOUNDATION-PHYSICAL-COMP-C-3.1",
  "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-FOUNDATION-PHYSICAL-COMP-C-3.2",
  "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-FOUNDATION-PHYSICAL-COMP-C-3.4",
  "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-FOUNDATION-PHYSICAL-GOAL-CG-3",
  "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-PE-LS1-COMP-C-3.1",
  "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-PE-LS1-COMP-C-3.2",
  "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-PE-LS1-COMP-C-3.3",
  "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-PE-LS1-COMP-C-3.4",
  "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-PE-LS1-GOAL-CG-3",
  "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-PE-LS2-COMP-C-1.1",
  "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-PE-LS2-COMP-C-1.2",
  "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-PE-LS2-COMP-C-1.3",
  "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-PE-LS2-GOAL-CG-1",
  "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-PE-LS1-COMP-C-4.1",
  "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-PE-LS1-COMP-C-4.2",
  "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-PE-LS1-COMP-C-4.3",
  "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-PE-LS1-COMP-C-4.4",
  "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-PE-LS1-COMP-C-4.5",
  "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-PE-LS1-COMP-C-5.1",
  "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-PE-LS1-COMP-C-5.2",
  "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-PE-LS1-COMP-C-6.1",
  "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-PE-LS1-GOAL-CG-4",
  "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-PE-LS1-GOAL-CG-5",
  "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-PE-LS1-GOAL-CG-6",
  "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-PE-LS2-COMP-C-2.1",
  "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-PE-LS2-COMP-C-2.2",
  "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-PE-LS2-COMP-C-2.3",
  "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-PE-LS2-COMP-C-2.4",
  "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-PE-LS2-COMP-C-2.5",
  "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-PE-LS2-COMP-C-3.1",
  "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-PE-LS2-COMP-C-3.2",
  "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-PE-LS2-GOAL-CG-2",
  "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-PE-LS2-GOAL-CG-3",
  "ncert-fs-2025:IN-NCERT-FS-2025-ART-SYL-FS-CG12-LO02",
  "ncert-fs-2025:IN-NCERT-FS-2025-ART-SYL-FS-CG13-LO02",
  "ncert-fs-2025:IN-NCERT-FS-2025-ART-SYL-FS-CG9-CG10-LO07",
  "ncert-fs-2025:IN-NCERT-FS-2025-SE-G1-C4.4-LO01"
]);
const removed = new Set([
  "mt_19-_RVOCbo",
  "mt_CsbN4H6-Rq",
  "mt_K8pUme6BWW",
  "mt_Lzpzxs7z4C",
  "mt_Zm-lQmiter",
  "mt_iT9O2QbkQL",
  "mt_k-UuT5CUZ4"
]);
const state = () => ({ scope: read('reports/ncert-physical-education-exclusion-2026-11-11.json'), ledger: read('reports/ncert-alignment-readiness-2026-11-10.json'), summary: read('reports/ncert-primary-alignment-review-summary-2026-11-10.json'), topics: read('data/topics.json'), guides: read('data/teaching-research.json'), alignments: read('data/curriculum-alignments.json'), edges: read('data/dependencies.json'), catalogue: read('data/curriculum-standards.json'), arts: read('reports/ncert-arts-syllabus-alignment-2026-11-10.json') });
function qualify(s) {
 assert.equal(expectedKeys.size, 49);
 assert.deepEqual(new Set(s.scope.excludedRecords.map(r => r.key)), expectedKeys);
 assert.deepEqual(new Set(s.scope.withdrawnProposedClaims.map(r => r.id)), removed);
 assert.equal(s.ledger.records.length, 570);
 assert.equal(new Set(s.ledger.records.map(r => r.key)).size, 570);
 assert.equal(s.scope.counts.eligible, 521);
 assert.equal(s.ledger.counts.eligibleSourceRecords, 521);
 assert.equal(s.ledger.counts.excludedPhysicalEducation, 49);
 const catalogued = new Set(s.catalogue.curricula.filter(c => ['ncert-fs-2025','ncert-ncfse-2023-ed2024'].includes(c.slug)).flatMap(c => c.topics.map(t => t.key)));
 assert.equal(catalogued.size, 570);
 for(const r of s.ledger.records) {
  assert.ok(catalogued.has(r.key));
  if(expectedKeys.has(r.key)) { assert.equal(r.disposition, 'OutOfScope'); assert.deepEqual(r.proposedTopicIds, []); assert.deepEqual(r.assessmentProtocols, []); }
  else assert.notEqual(r.disposition, 'OutOfScope');
 }
 assert.equal(s.summary.dispositions.OutOfScope, 49);
 assert.equal(s.summary.dispositions.Full, 444);
 assert.equal(s.summary.dispositions.SkillWithContextualEngagement, 36);
 assert.equal(Object.values(s.summary.dispositions).reduce((a,b) => a+b,0), 570);
 for(const r of s.alignments.alignments) {
  assert.equal(removed.has(r.topicId), false);
  assert.ok(r.standards.every(k => !expectedKeys.has(k)));
 }
 assert.ok(s.topics.topics.every(t => !removed.has(t.id)));
 assert.ok(s.guides.records.every(g => !removed.has(g.topicId)));
 assert.ok(s.edges.dependencies.every(e => !removed.has(e.topicId) && !removed.has(e.prerequisiteId)));
 const precision = 'ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-FOUNDATION-PHYSICAL-COMP-C-3.3';
 assert.equal(s.ledger.records.find(r => r.key === precision).disposition, 'Full');
 for(const id of ['mt_FtCLISvSGw','mt_oAK9GXSfqV']) assert.ok(s.alignments.alignments.some(r => r.topicId===id && r.country==='IN' && r.ageRangeStart===3 && r.ageRangeEnd===8 && r.standards.includes(precision)));
 for(const id of ['mt_6msyXavNJf','mt_AzNSWFgtxC','mt_utJE_Bt7MD']) assert.ok(s.topics.topics.some(t => t.id===id));
 const recall = s.arts.records.find(r => r.key.endsWith('ART-SYL-FS-CG1-LO01'));
 assert.equal(recall.disposition, 'Full'); assert.deepEqual(recall.contributions.map(c=>c.topicId), ['mt_OTFABm2xdf']);
 assert.deepEqual(recall.assessmentProtocols, ['movement-and-sound-cues']);
 assert.match(recall.sourceRequirementSummary, /recall and reproduce/);
 assert.match(recall.sourceRequirementSummary, /neither required nor inferred/);
 const scale = s.ledger.records.find(r => r.key==='ncert-fs-2025:IN-NCERT-FS-2025-PM-G2-C9-LO01');
 assert.equal(scale.disposition, 'Unverified');
}
test('India scope retains570 source identities,521 eligible and49 exact PE exclusions', () => qualify(state()));
test('a wrong valid source key cannot replace a reviewed PE exclusion', () => { const s=state(); s.scope.excludedRecords[0].key=s.ledger.records.find(r=>!expectedKeys.has(r.key)).key; assert.throws(()=>qualify(s)); });
test('excluded PE cannot return through a component association or Full ledger status', () => {
 for(const change of [s=>s.alignments.alignments[0].standards.push([...expectedKeys][0]), s=>s.ledger.records.find(r=>expectedKeys.has(r.key)).disposition='Full']) { const s=state();change(s);assert.throws(()=>qualify(s)); }
});
test('withdrawn proposals cannot survive in active claims, guidance or dependencies', () => {
 for(const change of [s=>s.topics.topics[0].id=[...removed][0],s=>s.guides.records[0].topicId=[...removed][0],s=>s.edges.dependencies[0].prerequisiteId=[...removed][0]]) {const s=state();change(s);assert.throws(()=>qualify(s));}
});
test('a physical-area heading cannot silently discard retained hand precision or mark making', () => {const s=state();s.topics.topics=s.topics.topics.filter(t=>t.id!=='mt_6msyXavNJf');assert.throws(()=>qualify(s));});
test('retained artistic recall and unresolved scale meaning cannot become broad motor mastery or false Full', () => {
 for(const change of [s=>s.arts.records.find(r=>r.key.endsWith('ART-SYL-FS-CG1-LO01')).contributions.push({topicId:[...removed][0]}),s=>s.ledger.records.find(r=>r.key.endsWith('PM-G2-C9-LO01')).disposition='Full']) {const s=state();change(s);assert.throws(()=>qualify(s));}
});
