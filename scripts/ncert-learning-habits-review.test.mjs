import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=n=>JSON.parse(readFileSync(new URL(`../${n}`,import.meta.url),'utf8'));
const report=read('reports/ncert-learning-habits-alignment-2026-11-10.json');
const protocols=read('reports/ncert-learning-habits-protocols-2026-11-10.json');
const alignments=read('data/curriculum-alignments.json');
const topics=new Map(read('data/topics.json').topics.map(x=>[x.id,x]));
const dependencies=read('data/dependencies.json');
const research=read('data/teaching-research.json');
const ledger=read('reports/ncert-alignment-readiness-2026-11-10.json');
const bindings={
  "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-FOUNDATION-LH-COMP-C-13.1": {
    "protocols": [
      "plan-focus-direct"
    ],
    "disposition": "Full",
    "age": [
      3,
      8
    ],
    "sourceConditions": null
  },
  "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-FOUNDATION-LH-COMP-C-13.2": {
    "protocols": [
      "memory-flexibility-self-control"
    ],
    "disposition": "Full",
    "age": [
      3,
      8
    ],
    "sourceConditions": null
  },
  "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-FOUNDATION-LH-COMP-C-13.3": {
    "protocols": [
      "observation-question-tinkering"
    ],
    "disposition": "Full",
    "age": [
      3,
      8
    ],
    "sourceConditions": null
  },
  "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-FOUNDATION-LH-COMP-C-13.4": {
    "protocols": [
      "agency-in-classroom-norms"
    ],
    "disposition": "Full",
    "age": [
      3,
      8
    ],
    "sourceConditions": null
  },
  "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-FOUNDATION-LH-GOAL-CG-13": {
    "protocols": [
      "integrated-learning-habits"
    ],
    "disposition": "Full",
    "age": [
      3,
      8
    ],
    "sourceConditions": null
  },
  "ncert-fs-2025:IN-NCERT-FS-2025-LH-G1-C13.1-LO01": {
    "protocols": [
      "adult-initiated-engagement"
    ],
    "disposition": "Full",
    "age": [
      6,
      8
    ],
    "sourceConditions": null
  },
  "ncert-fs-2025:IN-NCERT-FS-2025-LH-G1-C13.1-LO02": {
    "protocols": [
      "sustained-declared-task"
    ],
    "disposition": "Full",
    "age": [
      6,
      8
    ],
    "sourceConditions": {
      "engagementMinutes": 20,
      "task": "declared-coherent-task",
      "silentMotionlessBehaviorRequired": false,
      "globalAttentionNorm": false
    }
  },
  "ncert-fs-2025:IN-NCERT-FS-2025-LH-G1-C13.2-LO01": {
    "protocols": [
      "immediate-ordered-recall"
    ],
    "disposition": "Full",
    "age": [
      6,
      8
    ],
    "sourceConditions": {
      "sourceCase": "immediate-same-order-information-recall",
      "selectedDigitExample": 4,
      "hiddenModelRequiredByPrintedSceneExample": false,
      "generalCapacityScore": false
    }
  },
  "ncert-fs-2025:IN-NCERT-FS-2025-LH-G1-C13.2-LO02": {
    "protocols": [
      "adapt-classroom-situation"
    ],
    "disposition": "Full",
    "age": [
      6,
      8
    ],
    "sourceConditions": null
  },
  "ncert-fs-2025:IN-NCERT-FS-2025-LH-G1-C13.2-LO03": {
    "protocols": [
      "participate-and-use-feedback"
    ],
    "disposition": "Full",
    "age": [
      6,
      8
    ],
    "sourceConditions": null
  },
  "ncert-fs-2025:IN-NCERT-FS-2025-LH-G1-C13.2-LO04": {
    "protocols": [
      "participation-turns-and-leadership"
    ],
    "disposition": "Full",
    "age": [
      6,
      8
    ],
    "sourceConditions": {
      "selfRegulationChannel": "movement",
      "actualTurnTaking": true,
      "createsAndFollowsRules": true,
      "manageableRealLeadershipContribution": true,
      "advancedLeadershipStylesRequired": false
    }
  },
  "ncert-fs-2025:IN-NCERT-FS-2025-LH-G1-C13.3-LO01": {
    "protocols": [
      "self-initiated-natural-resource-exploration"
    ],
    "disposition": "SkillWithContextualEngagement",
    "age": [
      6,
      8
    ],
    "sourceConditions": {
      "actualInitiatedExplorationRequired": true,
      "adultGuidance": true,
      "responsibleNaturalResourceUse": false,
      "forcedPositiveFeeling": false
    }
  },
  "ncert-fs-2025:IN-NCERT-FS-2025-LH-G1-C13.4-LO01": {
    "protocols": [
      "agency-in-classroom-norms"
    ],
    "disposition": "Full",
    "age": [
      6,
      8
    ],
    "sourceConditions": null
  },
  "ncert-fs-2025:IN-NCERT-FS-2025-LH-G1-C13.4-LO02": {
    "protocols": [
      "make-and-use-classroom-job-chart"
    ],
    "disposition": "Full",
    "age": [
      6,
      8
    ],
    "sourceConditions": {
      "actualDIYChartOrPoster": true,
      "followItRequired": true,
      "illustrationRequired": false,
      "arbitraryRandomMarksSufficient": false
    }
  },
  "ncert-fs-2025:IN-NCERT-FS-2025-LH-G2-C13.1-LO01": {
    "protocols": [
      "adult-initiated-engagement"
    ],
    "disposition": "Full",
    "age": [
      6,
      8
    ],
    "sourceConditions": null
  },
  "ncert-fs-2025:IN-NCERT-FS-2025-LH-G2-C13.1-LO02": {
    "protocols": [
      "sustained-declared-task"
    ],
    "disposition": "Full",
    "age": [
      6,
      8
    ],
    "sourceConditions": {
      "engagementMinutes": 30,
      "task": "declared-coherent-task",
      "silentMotionlessBehaviorRequired": false,
      "globalAttentionNorm": false
    }
  },
  "ncert-fs-2025:IN-NCERT-FS-2025-LH-G2-C13.2-LO01": {
    "protocols": [
      "immediate-ordered-recall"
    ],
    "disposition": "Full",
    "age": [
      6,
      8
    ],
    "sourceConditions": {
      "sourceCase": "remember-recall-and-find-missing-scene-feature",
      "selectedDigitExample": null,
      "hiddenModelRequiredByPrintedSceneExample": false,
      "generalCapacityScore": false
    }
  },
  "ncert-fs-2025:IN-NCERT-FS-2025-LH-G2-C13.2-LO02": {
    "protocols": [
      "adapt-classroom-situation"
    ],
    "disposition": "Full",
    "age": [
      6,
      8
    ],
    "sourceConditions": null
  },
  "ncert-fs-2025:IN-NCERT-FS-2025-LH-G2-C13.2-LO03": {
    "protocols": [
      "participate-and-use-feedback"
    ],
    "disposition": "Full",
    "age": [
      6,
      8
    ],
    "sourceConditions": null
  },
  "ncert-fs-2025:IN-NCERT-FS-2025-LH-G2-C13.2-LO04": {
    "protocols": [
      "participation-turns-and-leadership"
    ],
    "disposition": "Full",
    "age": [
      6,
      8
    ],
    "sourceConditions": {
      "selfRegulationChannel": "emotion",
      "actualTurnTaking": true,
      "createsAndFollowsRules": true,
      "manageableRealLeadershipContribution": true,
      "advancedLeadershipStylesRequired": false
    }
  },
  "ncert-fs-2025:IN-NCERT-FS-2025-LH-G2-C13.3-LO01": {
    "protocols": [
      "self-initiated-natural-resource-exploration"
    ],
    "disposition": "SkillWithContextualEngagement",
    "age": [
      6,
      8
    ],
    "sourceConditions": {
      "actualInitiatedExplorationRequired": true,
      "adultGuidance": false,
      "responsibleNaturalResourceUse": true,
      "forcedPositiveFeeling": false
    }
  },
  "ncert-fs-2025:IN-NCERT-FS-2025-LH-G2-C13.4-LO01": {
    "protocols": [
      "agency-in-classroom-norms"
    ],
    "disposition": "Full",
    "age": [
      6,
      8
    ],
    "sourceConditions": null
  },
  "ncert-fs-2025:IN-NCERT-FS-2025-LH-G2-C13.4-LO02": {
    "protocols": [
      "make-and-use-classroom-job-chart"
    ],
    "disposition": "Full",
    "age": [
      6,
      8
    ],
    "sourceConditions": {
      "actualDIYChartOrPoster": true,
      "followItRequired": true,
      "illustrationRequired": true,
      "arbitraryRandomMarksSufficient": false
    }
  }
};
const conditions={
  "sustained-declared-task": {
    "sourceDurationsMinutes": {
      "Grade 1": 20,
      "Grade 2": 30
    },
    "coherentTaskRequired": true,
    "unrelatedShortActivitiesSummed": false,
    "motionlessOrHappyRequired": false,
    "globalAttentionNorm": false
  },
  "participation-turns-and-leadership": {
    "grade1Channel": "movement",
    "grade2Channel": "emotion",
    "actualManageableLeadershipRole": true,
    "theoreticalLeadershipStylesRequired": false,
    "manufacturedUpsetRequired": false
  },
  "self-initiated-natural-resource-exploration": {
    "actualInitiatedExplorationRequired": true,
    "grade1AdultGuidanceRetained": true,
    "grade2ResponsibleResourceUseRetained": true,
    "positiveFeelingOrGrowthMindsetProxyRequired": false
  },
  "make-and-use-classroom-job-chart": {
    "functionalCommunicativeChartRequired": true,
    "actualUseRequired": true,
    "grade2IllustrationRequired": true,
    "randomScribbleSufficient": false
  }
};
function check(r,p,a,t=topics){
 assert.equal(r.records.length,23);assert.deepEqual(new Set(r.records.map(x=>x.key)),new Set(Object.keys(bindings)));
 assert.equal(r.records.filter(x=>x.disposition==='Full').length,21);assert.equal(r.records.filter(x=>x.disposition==='SkillWithContextualEngagement').length,2);
 const expected=new Set();const selected=new Set(Object.keys(bindings));const pm=new Map(p.protocols.map(x=>[x.id,x]));
 for(const row of r.records){
  const b=bindings[row.key];assert.deepEqual(row.assessmentProtocols,b.protocols,'source protocol mismatch');assert.equal(row.disposition,b.disposition);assert.deepEqual(row.ageBand,b.age);assert.deepEqual(row.sourcePerformanceConditions??null,b.sourceConditions,'record source condition mismatch');
  const l=ledger.records.find(x=>x.key===row.key);assert.equal(l?.disposition,row.disposition);assert.equal(l?.reviewReport,'ncert-learning-habits-alignment-2026-11-10.json');
  for(const id of row.assessmentProtocols)assert.ok(pm.has(id));
  for(const c of row.contributions){assert.equal(c.role,'component');assert.equal(t.get(c.topicId)?.name,c.topicName);expected.add(JSON.stringify([c.topicId,...row.ageBand,row.key]));}
 }
 assert.equal(expected.size,65);const actual=new Set();
 for(const c of a.alignments)for(const key of c.standards)if(selected.has(key)){assert.equal(c.scope,'jurisdiction');assert.equal(c.country,'IN');assert.ok(!c.region&&!c.framework&&!c.ageOnly);actual.add(JSON.stringify([c.topicId,c.ageRangeStart,c.ageRangeEnd,key]));}
 assert.deepEqual(actual,expected,'scoped contribution mismatch');
 for(const [id,c]of Object.entries(conditions))assert.deepEqual(pm.get(id)?.performanceConditions,c,'protocol source condition mismatch');
 assert.deepEqual(pm.get('integrated-learning-habits').includesProtocols,['plan-focus-direct','memory-flexibility-self-control','observation-question-tinkering','agency-in-classroom-norms'],'aggregate closure mismatch');
 const revision=r.claimRevision;assert.equal(revision.topicId,'mt_33zncDHC3N');assert.equal(revision.guideBefore,null);assert.equal(revision.compatibility.wordingOnly,false);assert.equal(revision.compatibility.automaticLearnerEquivalenceOrTransfer,false);assert.equal(revision.compatibility.learnerResetOrPublicationAuthorised,false);
 for(const field of ['description','evidence','assessmentPrompt'])assert.deepEqual(t.get(revision.topicId)[field],revision.afterAuthoredFields[field],'feedback revision/report mismatch');
 const guide=research.records.find(x=>x.topicId===revision.topicId);assert.ok(guide);assert.equal(guide.confidence,'low');assert.equal(guide.assess.method,'performance_task');
 for(const old of revision.oldContextsPreserved){const current=a.alignments.find(x=>['topicId','scope','country','region','framework','ageRangeStart','ageRangeEnd'].every(k=>x[k]===old[k]));assert.ok(current,'old feedback context missing');for(const key of old.standards)assert.ok(current.standards.includes(key));}
 const change=r.dependencyCorrection;assert.equal(change.before.topicId,'mt_Iwg2diBSyW');assert.equal(change.before.prerequisiteId,'mt_SeNxOZTHCN');assert.equal(change.before.strength,'hard');assert.equal(change.after.strength,'soft');assert.equal(change.after.topicId,change.before.topicId);assert.equal(change.after.prerequisiteId,change.before.prerequisiteId);assert.deepEqual(dependencies.dependencies.find(x=>x.topicId===change.after.topicId&&x.prerequisiteId===change.after.prerequisiteId),change.after);
}
test('NCERT learning-habits review binds23 records,65pairs, source conditions and explicit feedback revision',()=>check(report,protocols,alignments));
test('learning-habits guard rejects duration, illustration, protocol and feedback-revision drift',()=>{
 const duration=structuredClone(report);duration.records.find(x=>x.key.endsWith('G1-C13.1-LO02')).sourcePerformanceConditions.engagementMinutes=10;assert.throws(()=>check(duration,protocols,alignments),/record source condition mismatch/);
 const illustration=structuredClone(protocols);illustration.protocols.find(x=>x.id==='make-and-use-classroom-job-chart').performanceConditions.grade2IllustrationRequired=false;assert.throws(()=>check(report,illustration,alignments),/protocol source condition mismatch/);
 const wrong=structuredClone(report);wrong.records.find(x=>x.key.endsWith('G2-C13.4-LO02')).assessmentProtocols=['agency-in-classroom-norms'];assert.throws(()=>check(wrong,protocols,alignments),/source protocol mismatch/);
 const stale=new Map([...topics].map(([k,v])=>[k,structuredClone(v)]));stale.get('mt_33zncDHC3N').evidence=report.claimRevision.before.evidence;assert.throws(()=>check(report,protocols,alignments,stale),/feedback revision\/report mismatch/);
 const future=structuredClone(alignments);future.alignments.push({topicId:'mt_future',scope:'jurisdiction',country:'IN',ageRangeStart:8,ageRangeEnd:11,standards:['synthetic:future']});check(report,protocols,future);
});
