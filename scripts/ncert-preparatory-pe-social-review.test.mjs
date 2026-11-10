import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=n=>JSON.parse(readFileSync(new URL(`../${n}`,import.meta.url),'utf8'));
const report=read('reports/ncert-preparatory-pe-social-alignment-2026-11-10.json');
const protocols=read('reports/ncert-preparatory-pe-social-protocols-2026-11-10.json');
const alignments=read('data/curriculum-alignments.json');
const topics=new Map(read('data/topics.json').topics.map(x=>[x.id,x]));
const ledger=read('reports/ncert-alignment-readiness-2026-11-10.json');
const bindings={
  "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-PE-LS1-COMP-C-4.1": [
    "cooperative-play"
  ],
  "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-PE-LS1-COMP-C-4.2": [
    "make-and-review-rules"
  ],
  "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-PE-LS1-COMP-C-4.3": [
    "care-for-another-player"
  ],
  "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-PE-LS1-COMP-C-4.4": [
    "care-for-shared-equipment"
  ],
  "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-PE-LS1-COMP-C-4.5": [
    "protective-response"
  ],
  "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-PE-LS1-COMP-C-5.1": [
    "explain-a-familiar-game"
  ],
  "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-PE-LS1-COMP-C-5.2": [
    "thinking-and-feeling-during-play"
  ],
  "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-PE-LS1-COMP-C-6.1": [
    "plan-record-and-reflect"
  ],
  "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-PE-LS1-GOAL-CG-4": [
    "integrated-social-game"
  ],
  "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-PE-LS1-GOAL-CG-5": [
    "integrated-game-understanding"
  ],
  "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-PE-LS1-GOAL-CG-6": [
    "plan-record-and-reflect"
  ],
  "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-PE-LS2-COMP-C-2.1": [
    "cooperative-play"
  ],
  "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-PE-LS2-COMP-C-2.2": [
    "make-and-review-rules"
  ],
  "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-PE-LS2-COMP-C-2.3": [
    "care-for-another-player"
  ],
  "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-PE-LS2-COMP-C-2.4": [
    "care-for-shared-equipment"
  ],
  "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-PE-LS2-COMP-C-2.5": [
    "protective-response"
  ],
  "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-PE-LS2-COMP-C-3.1": [
    "explain-a-familiar-game"
  ],
  "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-PE-LS2-COMP-C-3.2": [
    "thinking-and-feeling-during-play"
  ],
  "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-PE-LS2-GOAL-CG-2": [
    "integrated-social-game"
  ],
  "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-PE-LS2-GOAL-CG-3": [
    "integrated-game-understanding"
  ]
};
const requiredConditions={
  "care-for-another-player": {
    "situations": [
      "physical-injury",
      "emotional-stress",
      "feeling-unwell"
    ],
    "noManufacturedInjuryOrDistress": true
  },
  "care-for-shared-equipment": {
    "objects": [
      "physical-activity-material",
      "playground",
      "facilities"
    ],
    "actualCareRequired": true,
    "craftContribution": "tool-and-storage-component-only"
  },
  "plan-record-and-reflect": {
    "actions": [
      "set-personal-target",
      "plan",
      "record-progress",
      "review-adjust"
    ],
    "universalDistanceOrHeightNorm": false
  },
  "thinking-and-feeling-during-play": {
    "timing": "during-game-with-separate-postgame-reflection",
    "channels": [
      "genuine-feeling",
      "thinking-process"
    ],
    "forcedPositiveFeeling": false
  }
};
const requiredComposition={
 'integrated-social-game':['cooperative-play','make-and-review-rules','care-for-another-player','care-for-shared-equipment','protective-response'],
 'integrated-game-understanding':['explain-a-familiar-game','thinking-and-feeling-during-play'],
};
function check(r,p,a){
 assert.equal(r.records.length,20);assert.deepEqual(new Set(r.records.map(x=>x.key)),new Set(Object.keys(bindings)));
 const expected=new Set();const selected=new Set(Object.keys(bindings));
 for(const row of r.records){
  assert.equal(row.disposition,'Full');assert.deepEqual(row.ageBand,[8,11]);assert.deepEqual(row.assessmentProtocols,bindings[row.key],'source protocol mismatch');
  assert.deepEqual(row.sourceGradeBand,['Grade 3','Grade 4','Grade 5']);assert.equal(row.applicability.resourceCondition,row.standardSet==='LS1'?'full-set-on-provision-of-required-resources':'baseline-from-start-of-implementation');
  assert.equal(ledger.records.find(x=>x.key===row.key)?.reviewReport,'ncert-preparatory-pe-social-alignment-2026-11-10.json');
  for(const c of row.contributions){assert.equal(c.role,'component');assert.equal(topics.get(c.topicId)?.name,c.topicName);expected.add(JSON.stringify([c.topicId,...row.ageBand,row.key]));}
 }
 assert.equal(expected.size,50);
 const actual=new Set();
 for(const c of a.alignments)for(const key of c.standards)if(selected.has(key)){assert.equal(c.country,'IN');assert.equal(c.scope,'jurisdiction');assert.ok(!c.region&&!c.framework&&!c.ageOnly);actual.add(JSON.stringify([c.topicId,c.ageRangeStart,c.ageRangeEnd,key]));}
 assert.deepEqual(actual,expected,'scoped contribution mismatch');
 const pm=new Map(p.protocols.map(x=>[x.id,x]));
 for(const [id,children] of Object.entries(requiredComposition))assert.deepEqual(pm.get(id)?.includesProtocols,children,'aggregate protocol closure mismatch');
 for(const [id,c]of Object.entries(requiredConditions))assert.deepEqual(pm.get(id)?.performanceConditions,c,'source performance condition mismatch');
 for(const row of r.records)for(const id of row.assessmentProtocols){assert.ok(pm.has(id));for(const child of pm.get(id).includesProtocols??[])assert.ok(pm.has(child));}
}
test('NCERT PE social review binds20 source positions,50 components and aggregate source tasks',()=>check(report,protocols,alignments));
test('PE social review rejects missing aggregate duty and wrong valid protocol while allowing future growth',()=>{
 const wrong=structuredClone(report);wrong.records[0].assessmentProtocols=['protective-response'];assert.throws(()=>check(wrong,protocols,alignments),/source protocol mismatch/);
 const lost=structuredClone(protocols);lost.protocols.find(x=>x.id==='integrated-social-game').includesProtocols=requiredComposition['integrated-social-game'].filter(x=>x!=='care-for-shared-equipment');assert.throws(()=>check(report,lost,alignments),/aggregate protocol closure mismatch/);
 const afterOnly=structuredClone(protocols);afterOnly.protocols.find(x=>x.id==='thinking-and-feeling-during-play').performanceConditions.timing='after-game-only';assert.throws(()=>check(report,afterOnly,alignments),/source performance condition mismatch/);
 const future=structuredClone(alignments);future.alignments.push({topicId:'mt_future',scope:'jurisdiction',country:'IN',ageRangeStart:8,ageRangeEnd:11,standards:['synthetic:future']});check(report,protocols,future);
});
