import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read = n => JSON.parse(readFileSync(new URL(`../${n}`,import.meta.url),'utf8'));
const report=read('reports/ncert-health-safety-alignment-2026-11-10.json');
const protocols=read('reports/ncert-health-safety-protocols-2026-11-10.json');
const alignments=read('data/curriculum-alignments.json');
const dependencies=read('data/dependencies.json');
const ledger=read('reports/ncert-alignment-readiness-2026-11-10.json');
const topics=new Map(read('data/topics.json').topics.map(x=>[x.id,x]));
const catalogue=new Set(read('data/curriculum-standards.json').curricula.flatMap(c=>c.topics.map(t=>`${c.slug}:${t.code}`)));
// Bind reviewed positions to their actual task families and full-stage/selected-view
// distinctions; an existing but unrelated protocol must not satisfy the guard.
const bindings={
  "ncert-fs-2025:IN-NCERT-FS-2025-PM-B3-G1-C5-LO01": {
    "protocols": [
      "movement-safety"
    ],
    "age": [
      6,
      8
    ],
    "printedGradeBand": [
      "Balvatika 3",
      "Grade 1"
    ],
    "sourceStageScope": null,
    "selectedGradeView": "Grade 1"
  },
  "ncert-fs-2025:IN-NCERT-FS-2025-PM-B3-G1-C5-LO02": {
    "protocols": [
      "movement-safety"
    ],
    "age": [
      6,
      8
    ],
    "printedGradeBand": [
      "Balvatika 3",
      "Grade 1"
    ],
    "sourceStageScope": null,
    "selectedGradeView": "Grade 1"
  },
  "ncert-fs-2025:IN-NCERT-FS-2025-PM-G1-C3-LO01": {
    "protocols": [
      "shared-space-care"
    ],
    "age": [
      6,
      8
    ],
    "printedGradeBand": [
      "Grade 1"
    ],
    "sourceStageScope": null,
    "selectedGradeView": "Grade 1"
  },
  "ncert-fs-2025:IN-NCERT-FS-2025-PM-G1-C3-LO02": {
    "protocols": [
      "shared-space-care"
    ],
    "age": [
      6,
      8
    ],
    "printedGradeBand": [
      "Grade 1"
    ],
    "sourceStageScope": null,
    "selectedGradeView": "Grade 1"
  },
  "ncert-fs-2025:IN-NCERT-FS-2025-PM-G1-C3-LO03": {
    "protocols": [
      "shared-space-care"
    ],
    "age": [
      6,
      8
    ],
    "printedGradeBand": [
      "Grade 1"
    ],
    "sourceStageScope": null,
    "selectedGradeView": "Grade 1"
  },
  "ncert-fs-2025:IN-NCERT-FS-2025-PM-G1-C4-LO01": {
    "protocols": [
      "appropriate-tool-use"
    ],
    "age": [
      6,
      8
    ],
    "printedGradeBand": [
      "Grade 1"
    ],
    "sourceStageScope": null,
    "selectedGradeView": "Grade 1"
  },
  "ncert-fs-2025:IN-NCERT-FS-2025-PM-G1-G2-C1-LO01": {
    "protocols": [
      "food-and-meal-care"
    ],
    "age": [
      6,
      8
    ],
    "printedGradeBand": [
      "Grade 1",
      "Grade 2"
    ],
    "sourceStageScope": null,
    "selectedGradeView": "Grade 1; Grade 2"
  },
  "ncert-fs-2025:IN-NCERT-FS-2025-PM-G1-G2-C1-LO02": {
    "protocols": [
      "food-and-meal-care"
    ],
    "age": [
      6,
      8
    ],
    "printedGradeBand": [
      "Grade 1",
      "Grade 2"
    ],
    "sourceStageScope": null,
    "selectedGradeView": "Grade 1; Grade 2"
  },
  "ncert-fs-2025:IN-NCERT-FS-2025-PM-G1-G2-C1-LO03": {
    "protocols": [
      "food-and-meal-care"
    ],
    "age": [
      6,
      8
    ],
    "printedGradeBand": [
      "Grade 1",
      "Grade 2"
    ],
    "sourceStageScope": null,
    "selectedGradeView": "Grade 1; Grade 2"
  },
  "ncert-fs-2025:IN-NCERT-FS-2025-PM-G1-G2-C1-LO04": {
    "protocols": [
      "food-and-meal-care"
    ],
    "age": [
      6,
      8
    ],
    "printedGradeBand": [
      "Grade 1",
      "Grade 2"
    ],
    "sourceStageScope": null,
    "selectedGradeView": "Grade 1; Grade 2"
  },
  "ncert-fs-2025:IN-NCERT-FS-2025-PM-G1-G2-C1-LO05": {
    "protocols": [
      "food-and-meal-care"
    ],
    "age": [
      6,
      8
    ],
    "printedGradeBand": [
      "Grade 1",
      "Grade 2"
    ],
    "sourceStageScope": null,
    "selectedGradeView": "Grade 1; Grade 2"
  },
  "ncert-fs-2025:IN-NCERT-FS-2025-PM-G1-G2-C2-LO01": {
    "protocols": [
      "personal-care"
    ],
    "age": [
      6,
      8
    ],
    "printedGradeBand": [
      "Grade 1",
      "Grade 2"
    ],
    "sourceStageScope": null,
    "selectedGradeView": "Grade 1; Grade 2"
  },
  "ncert-fs-2025:IN-NCERT-FS-2025-PM-G1-G2-C2-LO02": {
    "protocols": [
      "personal-care"
    ],
    "age": [
      6,
      8
    ],
    "printedGradeBand": [
      "Grade 1",
      "Grade 2"
    ],
    "sourceStageScope": null,
    "selectedGradeView": "Grade 1; Grade 2"
  },
  "ncert-fs-2025:IN-NCERT-FS-2025-PM-G1-G2-C2-LO03": {
    "protocols": [
      "personal-care",
      "food-and-meal-care"
    ],
    "age": [
      6,
      8
    ],
    "printedGradeBand": [
      "Grade 1",
      "Grade 2"
    ],
    "sourceStageScope": null,
    "selectedGradeView": "Grade 1; Grade 2"
  },
  "ncert-fs-2025:IN-NCERT-FS-2025-PM-G1-G2-C2-LO04": {
    "protocols": [
      "personal-care"
    ],
    "age": [
      6,
      8
    ],
    "printedGradeBand": [
      "Grade 1",
      "Grade 2"
    ],
    "sourceStageScope": null,
    "selectedGradeView": "Grade 1; Grade 2"
  },
  "ncert-fs-2025:IN-NCERT-FS-2025-PM-G1-G2-C2-LO05": {
    "protocols": [
      "personal-care"
    ],
    "age": [
      6,
      8
    ],
    "printedGradeBand": [
      "Grade 1",
      "Grade 2"
    ],
    "sourceStageScope": null,
    "selectedGradeView": "Grade 1; Grade 2"
  },
  "ncert-fs-2025:IN-NCERT-FS-2025-PM-G1-G2-C6-LO01": {
    "protocols": [
      "protective-help",
      "movement-safety"
    ],
    "age": [
      6,
      8
    ],
    "printedGradeBand": [
      "Grade 1",
      "Grade 2"
    ],
    "sourceStageScope": null,
    "selectedGradeView": "Grade 1; Grade 2"
  },
  "ncert-fs-2025:IN-NCERT-FS-2025-PM-G1-G2-C6-LO02": {
    "protocols": [
      "protective-help"
    ],
    "age": [
      6,
      8
    ],
    "printedGradeBand": [
      "Grade 1",
      "Grade 2"
    ],
    "sourceStageScope": null,
    "selectedGradeView": "Grade 1; Grade 2"
  },
  "ncert-fs-2025:IN-NCERT-FS-2025-PM-G1-G2-C6-LO03": {
    "protocols": [
      "protective-help"
    ],
    "age": [
      6,
      8
    ],
    "printedGradeBand": [
      "Grade 1",
      "Grade 2"
    ],
    "sourceStageScope": null,
    "selectedGradeView": "Grade 1; Grade 2"
  },
  "ncert-fs-2025:IN-NCERT-FS-2025-PM-G1-G2-C6-LO04": {
    "protocols": [
      "protective-help"
    ],
    "age": [
      6,
      8
    ],
    "printedGradeBand": [
      "Grade 1",
      "Grade 2"
    ],
    "sourceStageScope": null,
    "selectedGradeView": "Grade 1; Grade 2"
  },
  "ncert-fs-2025:IN-NCERT-FS-2025-PM-G1-G2-C6-LO05": {
    "protocols": [
      "protective-help"
    ],
    "age": [
      6,
      8
    ],
    "printedGradeBand": [
      "Grade 1",
      "Grade 2"
    ],
    "sourceStageScope": null,
    "selectedGradeView": "Grade 1; Grade 2"
  },
  "ncert-fs-2025:IN-NCERT-FS-2025-PM-G2-C3-LO01": {
    "protocols": [
      "shared-space-care"
    ],
    "age": [
      6,
      8
    ],
    "printedGradeBand": [
      "Grade 2"
    ],
    "sourceStageScope": null,
    "selectedGradeView": "Grade 2"
  },
  "ncert-fs-2025:IN-NCERT-FS-2025-PM-G2-C3-LO02": {
    "protocols": [
      "shared-space-care"
    ],
    "age": [
      6,
      8
    ],
    "printedGradeBand": [
      "Grade 2"
    ],
    "sourceStageScope": null,
    "selectedGradeView": "Grade 2"
  },
  "ncert-fs-2025:IN-NCERT-FS-2025-PM-G2-C3-LO03": {
    "protocols": [
      "shared-space-care"
    ],
    "age": [
      6,
      8
    ],
    "printedGradeBand": [
      "Grade 2"
    ],
    "sourceStageScope": null,
    "selectedGradeView": "Grade 2"
  },
  "ncert-fs-2025:IN-NCERT-FS-2025-PM-G2-C4-LO01": {
    "protocols": [
      "appropriate-tool-use"
    ],
    "age": [
      6,
      8
    ],
    "printedGradeBand": [
      "Grade 2"
    ],
    "sourceStageScope": null,
    "selectedGradeView": "Grade 2"
  },
  "ncert-fs-2025:IN-NCERT-FS-2025-PM-G2-C5-LO01": {
    "protocols": [
      "movement-safety"
    ],
    "age": [
      6,
      8
    ],
    "printedGradeBand": [
      "Grade 2"
    ],
    "sourceStageScope": null,
    "selectedGradeView": "Grade 2"
  },
  "ncert-fs-2025:IN-NCERT-FS-2025-PM-G2-C5-LO02": {
    "protocols": [
      "movement-safety"
    ],
    "age": [
      6,
      8
    ],
    "printedGradeBand": [
      "Grade 2"
    ],
    "sourceStageScope": null,
    "selectedGradeView": "Grade 2"
  },
  "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-FOUNDATION-PHYSICAL-COMP-C-1.1": {
    "protocols": [
      "food-and-meal-care"
    ],
    "age": [
      3,
      8
    ],
    "printedGradeBand": null,
    "sourceStageScope": [
      "Balvatika",
      "Grade 1",
      "Grade 2"
    ],
    "selectedGradeView": [
      1,
      2
    ]
  },
  "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-FOUNDATION-PHYSICAL-COMP-C-1.2": {
    "protocols": [
      "personal-care"
    ],
    "age": [
      3,
      8
    ],
    "printedGradeBand": null,
    "sourceStageScope": [
      "Balvatika",
      "Grade 1",
      "Grade 2"
    ],
    "selectedGradeView": [
      1,
      2
    ]
  },
  "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-FOUNDATION-PHYSICAL-COMP-C-1.3": {
    "protocols": [
      "shared-space-care"
    ],
    "age": [
      3,
      8
    ],
    "printedGradeBand": null,
    "sourceStageScope": [
      "Balvatika",
      "Grade 1",
      "Grade 2"
    ],
    "selectedGradeView": [
      1,
      2
    ]
  },
  "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-FOUNDATION-PHYSICAL-COMP-C-1.4": {
    "protocols": [
      "appropriate-tool-use"
    ],
    "age": [
      3,
      8
    ],
    "printedGradeBand": null,
    "sourceStageScope": [
      "Balvatika",
      "Grade 1",
      "Grade 2"
    ],
    "selectedGradeView": [
      1,
      2
    ]
  },
  "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-FOUNDATION-PHYSICAL-COMP-C-1.5": {
    "protocols": [
      "movement-safety"
    ],
    "age": [
      3,
      8
    ],
    "printedGradeBand": null,
    "sourceStageScope": [
      "Balvatika",
      "Grade 1",
      "Grade 2"
    ],
    "selectedGradeView": [
      1,
      2
    ]
  },
  "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-FOUNDATION-PHYSICAL-COMP-C-1.6": {
    "protocols": [
      "protective-help"
    ],
    "age": [
      3,
      8
    ],
    "printedGradeBand": null,
    "sourceStageScope": [
      "Balvatika",
      "Grade 1",
      "Grade 2"
    ],
    "selectedGradeView": [
      1,
      2
    ]
  },
  "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-FOUNDATION-PHYSICAL-GOAL-CG-1": {
    "protocols": [
      "integrated-health-and-safety"
    ],
    "age": [
      3,
      8
    ],
    "printedGradeBand": null,
    "sourceStageScope": [
      "Balvatika",
      "Grade 1",
      "Grade 2"
    ],
    "selectedGradeView": [
      1,
      2
    ]
  }
};
const requiredConditions={
  "food-and-meal-care": {
    "foodGroupsDistinctFromNutrients": true,
    "adultQuantitiesTransferred": false,
    "forcedTastingOrPositiveFeeling": false
  },
  "personal-care": {
    "practicalTransfer": [
      "water-container",
      "cup",
      "serving-utensil"
    ],
    "performance": "without-spilling",
    "changedCase": true
  },
  "shared-space-care": {
    "property": [
      "books",
      "study-materials",
      "furniture"
    ],
    "actions": [
      "care",
      "clean",
      "organise"
    ],
    "selectedWasteSorting": [
      "wet",
      "dry"
    ],
    "exhaustiveDisposalClaim": false
  },
  "appropriate-tool-use": {
    "actualTools": [
      "craft-scissors",
      "child-safe-soft-food-knife",
      "taught-nail-care-tool-where-applicable"
    ],
    "independence": "without-step-by-step-prompting",
    "adultSupervisionRetained": true
  },
  "protective-help": {
    "safeScenarios": true,
    "knownPeopleCanBeUnsafe": true,
    "noBlameForFreezing": true
  }
};
const expectedCorrectionIdentities = new Set([
 'mt_DRNXFr0ds6:mt_gZIo5oiBMt', 'mt_F62VTeHB4-:mt_QhLAeAlHI0',
 'mt_UHQfb-n-w3:mt_uTKgmWqSoI', 'mt_FwI7q7DSIx:mt_NS5t-Jzlh8',
 'mt_YbX3LD0Eca:mt_NS5t-Jzlh8',
]);
function checkLedger(l) {
 assert.equal(l.counts.alignmentReviewedHere,l.groups.reduce((n,g)=>n+g.reviewedHere,0),'reviewed group total mismatch');
 assert.equal(l.counts.notAlignmentReviewedHere,l.groups.reduce((n,g)=>n+g.pendingHere,0),'pending group total mismatch');
 for(const slice of l.nextSlices) {
  for(const g of slice.groups) {
   const relevant=l.groups.filter(x=>['source','stage','area','recordKind'].every(k=>g[k]==null||g[k]===x[k]));
   assert.equal(g.pendingRecords,relevant.reduce((n,x)=>n+x.pendingHere,0),'pending navigation group mismatch');
  }
  assert.equal(slice.pendingRecords,slice.groups.reduce((n,g)=>n+g.pendingRecords,0),'pending navigation slice mismatch');
 }
 assert.equal(l.nextSlices.reduce((n,s)=>n+s.pendingRecords,0),l.counts.notAlignmentReviewedHere,'pending navigation total mismatch');
}
function check(r,p,a,d) {
 checkLedger(ledger);
 assert.equal(r.records.length,34);
 assert.deepEqual(new Set(r.records.map(x=>x.key)),new Set(Object.keys(bindings)));
 assert.equal(r.records.filter(x=>x.disposition==='Full').length,33);
 assert.equal(r.records.filter(x=>x.disposition==='SkillWithContextualEngagement').length,1);
 const expected=new Set();const selected=new Set(Object.keys(bindings));
 for(const row of r.records) {
  assert.ok(catalogue.has(row.key));const b=bindings[row.key];
  assert.deepEqual(row.assessmentProtocols,b.protocols,'source protocol mismatch');
  for(const f of ['ageBand','printedGradeBand','sourceStageScope','selectedGradeView']) assert.deepEqual(row[f],b[f==='ageBand'?'age':f],`source metadata mismatch: ${f}`);
  for(const id of row.assessmentProtocols) assert.ok(p.protocols.some(x=>x.id===id));
  const l=ledger.records.find(x=>x.key===row.key);assert.equal(l.disposition,row.disposition);assert.equal(l.reviewReport,'ncert-health-safety-alignment-2026-11-10.json');
  for(const c of row.contributions) {
   assert.equal(c.role,'component');assert.equal(topics.get(c.topicId)?.name,c.topicName);
   expected.add(JSON.stringify([c.topicId,...row.ageBand,row.key]));
  }
 }
 assert.equal(expected.size,67);
 const actual=new Set();
 for(const c of a.alignments) for(const key of c.standards) if(selected.has(key)) {
  assert.equal(c.scope,'jurisdiction');assert.equal(c.country,'IN');assert.ok(!c.region&&!c.framework&&!c.ageOnly);
  actual.add(JSON.stringify([c.topicId,c.ageRangeStart,c.ageRangeEnd,key]));
 }
 assert.deepEqual(actual,expected,'health scoped contribution mismatch');
 for(const [id,conditions] of Object.entries(requiredConditions)) assert.deepEqual(p.protocols.find(x=>x.id===id)?.performanceConditions,conditions,'source performance condition mismatch');
 assert.equal(r.dependencyCorrections.length,5);
 const correctionIdentities=r.dependencyCorrections.map(c=>`${c.before.topicId}:${c.before.prerequisiteId}`);
 assert.equal(new Set(correctionIdentities).size,5,'duplicate correction identity');
 assert.deepEqual(new Set(correctionIdentities),expectedCorrectionIdentities,'unexpected correction identities');
 for(const c of r.dependencyCorrections) {
  assert.equal(c.after.topicId,c.before.topicId,'correction edge identity changed');
  assert.equal(c.after.prerequisiteId,c.before.prerequisiteId,'correction edge identity changed');
  assert.equal(c.before.strength,'hard');assert.equal(c.after.strength,'soft');
  assert.deepEqual(d.dependencies.find(x=>x.topicId===c.after.topicId&&x.prerequisiteId===c.after.prerequisiteId),c.after,'registered dependency correction mismatch');
 }
 // Hygiene and the actual cooperative behaviors remain necessary.
 for(const [t,q] of [['mt_F62VTeHB4-','mt_EWiY8-opdd'],['mt_EWiY8-opdd','mt_vbbxnY7ZDT'],['mt_QxsoqVUt6u','mt_FwI7q7DSIx'],['mt_QxsoqVUt6u','mt_YbX3LD0Eca']]) assert.equal(d.dependencies.find(x=>x.topicId===t&&x.prerequisiteId===q)?.strength,'hard','kept safety/behavior path changed');
}
test('NCERT health review binds all34 positions, source tasks,67 pairs and exact dependency corrections',()=>check(report,protocols,alignments,dependencies));
test('health guard rejects wrong-valid protocol, lost practical conditions and association drift',()=>{
 const wrong=structuredClone(report);wrong.records[0].assessmentProtocols=['personal-care'];assert.throws(()=>check(wrong,protocols,alignments,dependencies),/source protocol mismatch/);
 const missing=structuredClone(protocols);delete missing.protocols.find(x=>x.id==='personal-care').performanceConditions.performance;assert.throws(()=>check(report,missing,alignments,dependencies),/source performance condition mismatch/);
 const bad=structuredClone(alignments);const c=bad.alignments.find(x=>x.standards.includes(report.records[0].key));c.standards=c.standards.filter(x=>x!==report.records[0].key);assert.throws(()=>check(report,protocols,bad,dependencies),/health scoped contribution mismatch/);
 const duplicate=structuredClone(report);duplicate.dependencyCorrections[1]=structuredClone(duplicate.dependencyCorrections[0]);assert.throws(()=>check(duplicate,protocols,alignments,dependencies),/duplicate correction identity/);
 const mismatched=structuredClone(report);mismatched.dependencyCorrections[0].after.prerequisiteId='mt_example';assert.throws(()=>check(mismatched,protocols,alignments,dependencies),/correction edge identity changed/);
 const stale=structuredClone(ledger);stale.nextSlices[0].pendingRecords++;assert.throws(()=>checkLedger(stale),/pending navigation slice mismatch/);
 const future=structuredClone(alignments);future.alignments.push({topicId:'mt_future',scope:'jurisdiction',country:'IN',ageRangeStart:8,ageRangeEnd:11,standards:['synthetic:future']});check(report,protocols,future,dependencies);
});
