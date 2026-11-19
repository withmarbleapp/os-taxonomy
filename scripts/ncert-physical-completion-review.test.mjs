import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=n=>JSON.parse(readFileSync(new URL(`../${n}`,import.meta.url),'utf8'));
const kinds=['fine-motor','sensory'];
const reports=Object.fromEntries(kinds.map(k=>[k,read(`reports/ncert-${k}-alignment-2026-11-10.json`)]));
const protocols=Object.fromEntries(kinds.map(k=>[k,read(`reports/ncert-${k}-protocols-2026-11-10.json`)]));
const alignments=read('data/curriculum-alignments.json');
const dependencies=read('data/dependencies.json');
const ledger=read('reports/ncert-alignment-readiness-2026-11-10.json');
const topics=new Map(read('data/topics.json').topics.map(x=>[x.id,x]));
const research=new Map(read('data/teaching-research.json').records.map(x=>[x.topicId,x]));
const bindings={
  "fine-motor": {
    "ncert-fs-2025:IN-NCERT-FS-2025-PM-G1-G2-C15-LO01": {
      "protocols": [
        "functional-utensil-control"
      ],
      "disposition": "Full",
      "age": [
        6,
        8
      ]
    },
    "ncert-fs-2025:IN-NCERT-FS-2025-PM-G1-G2-C15-LO02": {
      "protocols": [
        "drawing-writing-control"
      ],
      "disposition": "Full",
      "age": [
        6,
        8
      ]
    },
    "ncert-fs-2025:IN-NCERT-FS-2025-PM-G1-G2-C15-LO03": {
      "protocols": [
        "drawing-writing-control"
      ],
      "disposition": "Full",
      "age": [
        6,
        8
      ]
    },
    "ncert-fs-2025:IN-NCERT-FS-2025-PM-G1-G2-C15-LO04": {
      "protocols": [
        "shaping-folding"
      ],
      "disposition": "Full",
      "age": [
        6,
        8
      ]
    },
    "ncert-fs-2025:IN-NCERT-FS-2025-PM-G1-G2-C15-LO05": {
      "protocols": [
        "functional-utensil-control"
      ],
      "disposition": "Full",
      "age": [
        6,
        8
      ]
    },
    "ncert-fs-2025:IN-NCERT-FS-2025-PM-G1-G2-C15-LO06": {
      "protocols": [
        "shaping-folding"
      ],
      "disposition": "Full",
      "age": [
        6,
        8
      ]
    },
    "ncert-fs-2025:IN-NCERT-FS-2025-PM-G1-G2-C15-LO07": {
      "protocols": [
        "multi-action-hand-control"
      ],
      "disposition": "Full",
      "age": [
        6,
        8
      ]
    },
    "ncert-fs-2025:IN-NCERT-FS-2025-PM-G1-G2-C15-LO08": {
      "protocols": [
        "building-copying"
      ],
      "disposition": "Full",
      "age": [
        6,
        8
      ]
    },
    "ncert-fs-2025:IN-NCERT-FS-2025-PM-G1-G2-C15-LO09": {
      "protocols": [
        "functional-utensil-control"
      ],
      "disposition": "Full",
      "age": [
        6,
        8
      ]
    },
    "ncert-fs-2025:IN-NCERT-FS-2025-PM-G1-G2-C15-LO10": {
      "protocols": [
        "functional-utensil-control"
      ],
      "disposition": "Full",
      "age": [
        6,
        8
      ]
    },
    "ncert-fs-2025:IN-NCERT-FS-2025-PM-G1-G2-C15-LO11": {
      "protocols": [
        "drawing-writing-control"
      ],
      "disposition": "Full",
      "age": [
        6,
        8
      ]
    },
    "ncert-fs-2025:IN-NCERT-FS-2025-PM-G1-G2-C15-LO12": {
      "protocols": [
        "building-copying"
      ],
      "disposition": "Full",
      "age": [
        6,
        8
      ]
    },
    "ncert-fs-2025:IN-NCERT-FS-2025-PM-G1-G2-C15-LO13": {
      "protocols": [
        "shaping-folding"
      ],
      "disposition": "Full",
      "age": [
        6,
        8
      ]
    },
    "ncert-fs-2025:IN-NCERT-FS-2025-PM-G1-G2-C15-LO14": {
      "protocols": [
        "puzzle-composition"
      ],
      "disposition": "Full",
      "age": [
        6,
        8
      ]
    },
    "ncert-fs-2025:IN-NCERT-FS-2025-PM-G1-G2-C15-LO15": {
      "protocols": [
        "multi-action-hand-control"
      ],
      "disposition": "Full",
      "age": [
        6,
        8
      ]
    },
    "ncert-fs-2025:IN-NCERT-FS-2025-PM-G1-G2-C15-LO16": {
      "protocols": [
        "building-copying"
      ],
      "disposition": "Full",
      "age": [
        6,
        8
      ]
    },
    "ncert-fs-2025:IN-NCERT-FS-2025-PM-G1-G2-C15-LO17": {
      "protocols": [
        "threading-reuse"
      ],
      "disposition": "Full",
      "age": [
        6,
        8
      ]
    },
    "ncert-fs-2025:IN-NCERT-FS-2025-PM-G1-G2-C15-LO18": {
      "protocols": [
        "building-copying"
      ],
      "disposition": "Full",
      "age": [
        6,
        8
      ]
    },
    "ncert-fs-2025:IN-NCERT-FS-2025-PM-G1-G2-C15-LO19": {
      "protocols": [
        "legible-production"
      ],
      "disposition": "Full",
      "age": [
        6,
        8
      ]
    },
    "ncert-fs-2025:IN-NCERT-FS-2025-PM-G1-G2-C15-LO20": {
      "protocols": [
        "preferred-hand-observation"
      ],
      "disposition": "ContextualMotorDevelopmentRequirement",
      "age": [
        6,
        8
      ]
    }
  },
  "sensory": {
    "ncert-fs-2025:IN-NCERT-FS-2025-PM-G1-C12-LO01": {
      "protocols": [
        "comfortable-longer-exhalation"
      ],
      "disposition": "Full",
      "age": [
        6,
        8
      ]
    },
    "ncert-fs-2025:IN-NCERT-FS-2025-PM-G1-C12-LO02": {
      "protocols": [
        "short-stillness-other-perceptions"
      ],
      "disposition": "Full",
      "age": [
        6,
        8
      ]
    },
    "ncert-fs-2025:IN-NCERT-FS-2025-PM-G1-C9-LO01": {
      "protocols": [
        "matched-sounds"
      ],
      "disposition": "Full",
      "age": [
        6,
        8
      ]
    },
    "ncert-fs-2025:IN-NCERT-FS-2025-PM-G1-C9-LO02": {
      "protocols": [
        "tempo-change"
      ],
      "disposition": "Full",
      "age": [
        6,
        8
      ]
    },
    "ncert-fs-2025:IN-NCERT-FS-2025-PM-G2-C12-LO01": {
      "protocols": [
        "taught-alternate-nostril-method"
      ],
      "disposition": "Full",
      "age": [
        6,
        8
      ]
    },
    "ncert-fs-2025:IN-NCERT-FS-2025-PM-G2-C12-LO02": {
      "protocols": [
        "ordinary-thought-awareness"
      ],
      "disposition": "Full",
      "age": [
        6,
        8
      ]
    },
    "ncert-fs-2025:IN-NCERT-FS-2025-PM-G2-C9-LO01": {
      "protocols": [
        "scale-meaning-unverified"
      ],
      "disposition": "Unverified",
      "age": [
        6,
        8
      ]
    },
    "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-FOUNDATION-PHYSICAL-COMP-C-2.1": {
      "protocols": [
        "shape-colour-shade-comparison"
      ],
      "disposition": "Full",
      "age": [
        3,
        8
      ]
    },
    "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-FOUNDATION-PHYSICAL-COMP-C-2.2": {
      "protocols": [
        "hidden-visual-form"
      ],
      "disposition": "Full",
      "age": [
        3,
        8
      ]
    },
    "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-FOUNDATION-PHYSICAL-COMP-C-2.3": {
      "protocols": [
        "pitch-volume-tempo"
      ],
      "disposition": "Full",
      "age": [
        3,
        8
      ]
    },
    "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-FOUNDATION-PHYSICAL-COMP-C-2.4": {
      "protocols": [
        "smell-taste-comparison"
      ],
      "disposition": "Full",
      "age": [
        3,
        8
      ]
    },
    "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-FOUNDATION-PHYSICAL-COMP-C-2.5": {
      "protocols": [
        "touch-comparison"
      ],
      "disposition": "Full",
      "age": [
        3,
        8
      ]
    },
    "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-FOUNDATION-PHYSICAL-COMP-C-2.6": {
      "protocols": [
        "same-experience-integration"
      ],
      "disposition": "Full",
      "age": [
        3,
        8
      ]
    },
    "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-FOUNDATION-PHYSICAL-GOAL-CG-2": {
      "protocols": [
        "integrated-sensory-portfolio"
      ],
      "disposition": "Full",
      "age": [
        3,
        8
      ]
    }
  }
};
const conditions={
  "fine-motor": {
    "drawing-writing-control": {
      "crayonCase": "thumb-and-fingers",
      "spontaneousProduction": "scribbling-or-painting-with-wrist-action",
      "variedMaterials": true,
      "recognisablePictureRequired": false
    },
    "multi-action-hand-control": {
      "actualPanel": [
        "threading",
        "small-object-placement",
        "large-button-fastening",
        "safe-cutting",
        "pasting",
        "pouring",
        "large-zip-use"
      ],
      "allActionsInOneConvenientExampleInferred": false
    },
    "puzzle-composition": {
      "piecesMinimum": 10,
      "piecesMaximum": 25,
      "actualAssemblyRequired": true
    },
    "legible-production": {
      "selectedRoute": "numbers",
      "existingCanonicalInventory": "0–9",
      "universalAlphabetOrScriptMastery": false
    },
    "preferred-hand-observation": {
      "mode": "contextual-observation-over-actual-drawing-writing",
      "forcedHand": false,
      "newMasteryOrLearnerState": false
    },
    "threading-reuse": {
      "sourceAlternatives": [
        "stringing-board",
        "whole-flowers"
      ],
      "beadOnlySufficient": false,
      "patternRequired": false
    }
  },
  "sensory": {
    "same-experience-integration": {
      "sameEventPerceptions": [
        "seeing",
        "hearing",
        "touch"
      ],
      "relatePerceptionsRequired": true,
      "oneFocusAloneSufficient": false
    },
    "comfortable-longer-exhalation": {
      "outBreathLongerThanInBreath": true,
      "fixedRatio": false,
      "breathRetention": false
    },
    "short-stillness-other-perceptions": {
      "shortStillness": true,
      "attentionToOtherPerceptions": true,
      "fixedDurationQuota": false
    },
    "taught-alternate-nostril-method": {
      "procedure": "alternate-nostril-inhale-one-side-exhale-other-then-reverse",
      "breathRetention": false,
      "fixedRatio": false,
      "fixedRounds": false,
      "separateFromGenericAttention": true
    },
    "ordinary-thought-awareness": {
      "ordinaryThoughtFlowAwareness": true,
      "forcedDisclosure": false,
      "manufacturedThoughtOrDistress": false
    },
    "pitch-volume-tempo": {
      "airborneSoundToSeparateMatterRequired": true,
      "directMechanicalContactAloneSufficient": false,
      "forceDoesNotGuaranteeFixedOtherAcousticProperties": true
    }
  }
};
function check(rs,ps,a){
 const expected=new Set();const selected=new Set();
 for(const kind of kinds){
  const r=rs[kind];const p=ps[kind];
  assert.deepEqual(new Set(r.records.map(x=>x.key)),new Set(Object.keys(bindings[kind])));
  assert.equal(r.records.length,Object.keys(bindings[kind]).length);
  const pm=new Map(p.protocols.map(x=>[x.id,x]));
  for(const row of r.records){
   selected.add(row.key);const b=bindings[kind][row.key];assert.deepEqual(row.assessmentProtocols,b.protocols,'source protocol mismatch');assert.equal(row.disposition,b.disposition);assert.deepEqual(row.ageBand,b.age);
   const l=ledger.records.find(x=>x.key===row.key);assert.equal(l?.disposition,row.disposition);assert.equal(l?.reviewReport,`ncert-${kind}-alignment-2026-11-10.json`);
   for(const id of row.assessmentProtocols)assert.ok(pm.has(id));
   for(const c of row.contributions){assert.equal(c.role,'component');assert.equal(topics.get(c.topicId)?.name,c.topicName);expected.add(JSON.stringify([c.topicId,...row.ageBand,row.key]));}
   if(row.disposition==='Unverified'||row.disposition==='ContextualMotorDevelopmentRequirement')assert.deepEqual(row.contributions,[],'unverified/contextual source has mastery links');
  }
  for(const [id,c]of Object.entries(conditions[kind]))assert.deepEqual(pm.get(id)?.sourcePerformanceConditions??pm.get(id)?.performanceConditions,c,'source performance condition mismatch');
 }
 assert.equal(expected.size,50);
 const actual=new Set();
 for(const c of a.alignments)for(const key of c.standards)if(selected.has(key)){assert.equal(c.country,'IN');assert.equal(c.scope,'jurisdiction');assert.ok(!c.region&&!c.framework&&!c.ageOnly);actual.add(JSON.stringify([c.topicId,c.ageRangeStart,c.ageRangeEnd,key]));}
 assert.deepEqual(actual,expected,'scoped contribution mismatch');
 const approvedPairs=new Set(['mt_VBl1T1sFCM:mt_ZL9qVVnpwN','mt_vJO5Bxk4z-:mt_XirhnAB6Ye']);
 const changes=rs.sensory.dependencyCorrections;
 assert.equal(changes.length,2);assert.deepEqual(new Set(changes.map(x=>`${x.before.topicId}:${x.before.prerequisiteId}`)),approvedPairs,'sensory correction identities mismatch');
 for(const c of changes){assert.equal(c.before.strength,'hard');assert.equal(c.after.strength,'soft');assert.equal(c.after.topicId,c.before.topicId);assert.equal(c.after.prerequisiteId,c.before.prerequisiteId);assert.deepEqual(dependencies.dependencies.find(e=>e.topicId===c.after.topicId&&e.prerequisiteId===c.after.prerequisiteId),c.after);}
 const composition=ps.sensory.protocols.find(x=>x.id==='integrated-sensory-portfolio').includesProtocols;
 assert.deepEqual(composition,['shape-colour-shade-comparison','hidden-visual-form','pitch-volume-tempo','smell-taste-comparison','touch-comparison','same-experience-integration'],'sensory goal closure mismatch');
 for(const [id,type]of [['mt_6msyXavNJf','PROCEDURAL'],['mt_AzNSWFgtxC','PROCEDURAL'],['mt_utJE_Bt7MD','META']]){assert.equal(topics.get(id)?.type,type);assert.equal(research.get(id)?.confidence,'low');assert.equal(research.get(id)?.assess.method,type==='META'?'open_epistemic_probe':'performance_task');}
}
test('NCERT remaining physical34 binds source tasks,50 pairs, new guidance and honest residuals',()=>check(reports,protocols,alignments));
test('physical34 guard rejects bead-only substitution, lost sensory integration and unverified links',()=>{
 const beads=structuredClone(protocols);beads['fine-motor'].protocols.find(x=>x.id==='threading-reuse').sourcePerformanceConditions.sourceAlternatives=['beads'];assert.throws(()=>check(reports,beads,alignments),/source performance condition mismatch/);
 const integration=structuredClone(protocols);integration.sensory.protocols.find(x=>x.id==='same-experience-integration').performanceConditions.oneFocusAloneSufficient=true;assert.throws(()=>check(reports,integration,alignments),/source performance condition mismatch/);
 const hold=structuredClone(protocols);hold.sensory.protocols.find(x=>x.id==='taught-alternate-nostril-method').performanceConditions.breathRetention=true;assert.throws(()=>check(reports,hold,alignments),/source performance condition mismatch/);
 const wrong=structuredClone(reports);wrong['fine-motor'].records.find(x=>x.key.endsWith('C15-LO17')).assessmentProtocols=['multi-action-hand-control'];assert.throws(()=>check(wrong,protocols,alignments),/source protocol mismatch/);
 const leak=structuredClone(alignments);leak.alignments.push({topicId:'mt_OTFABm2xdf',scope:'jurisdiction',country:'IN',ageRangeStart:6,ageRangeEnd:8,standards:['ncert-fs-2025:IN-NCERT-FS-2025-PM-G2-C9-LO01']});assert.throws(()=>check(reports,protocols,leak),/scoped contribution mismatch/);
 const contact=structuredClone(protocols);contact.sensory.protocols.find(x=>x.id==='pitch-volume-tempo').performanceConditions.directMechanicalContactAloneSufficient=true;assert.throws(()=>check(reports,contact,alignments),/source performance condition mismatch/);
 const future=structuredClone(alignments);future.alignments.push({topicId:'mt_future',scope:'jurisdiction',country:'IN',ageRangeStart:8,ageRangeEnd:11,standards:['synthetic:future']});check(reports,protocols,future);
});
