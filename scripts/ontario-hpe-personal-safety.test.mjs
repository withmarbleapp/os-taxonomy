import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>JSON.parse(readFileSync(new URL(`../${p}`,import.meta.url),'utf8'));
const report=read('reports/ontario-hpe-primary-review-2026-11-11.json');
const programme=read('reports/ontario-hpe-primary-task-programme-2026-11-11.json');
const prefix=report.source+':';
const expected={
  "ON-HPE-2019-G1-D1.2": {
    "protocolIds": [
      "contacts-and-help"
    ],
    "panel": "Actual essential contact/help and pickup routines, no public personal details.",
    "topicIds": [
      "mt_q3vRl4dddK",
      "mt_PdYlsA33jB"
    ]
  },
  "ON-HPE-2019-G1-D2.3": {
    "protocolIds": [
      "care-boundaries-and-consent",
      "positive-relationships-and-harm"
    ],
    "panel": "Caring/harmful behaviour, possible feelings, response and consent all required; no feeling-display test.",
    "topicIds": [
      "mt_I9cDkW4Qz-",
      "mt_hkIbGmuH7D",
      "mt_HBcvu0UxYe"
    ]
  },
  "ON-HPE-2019-G1-D2.4": {
    "protocolIds": [
      "school-and-everyday-safety"
    ],
    "panel": "Actually apply relevant school routines, including supplied care needs, not only identify a hazard.",
    "topicIds": [
      "mt_q3vRl4dddK"
    ]
  },
  "ON-HPE-2019-G1-D3.1": {
    "protocolIds": [
      "school-and-everyday-safety"
    ],
    "panel": "Varied home, community, online and outdoor risks and precautions.",
    "topicIds": [
      "mt_q3vRl4dddK",
      "mt_zIzJGkaj0Q"
    ]
  },
  "ON-HPE-2019-G2-D1.1": {
    "protocolIds": [
      "school-and-everyday-safety"
    ],
    "panel": "Home/outdoor/online practices with adult support; examples not an exhaustive checklist.",
    "topicIds": [
      "mt_q3vRl4dddK",
      "mt_zIzJGkaj0Q"
    ]
  },
  "ON-HPE-2019-G2-D1.2": {
    "protocolIds": [
      "food-allergy-known-and-unknown-cases"
    ],
    "panel": "Actual varied trigger/reaction knowledge, known allergy/intolerance contrast and uncertain-case adult-help boundary; no exposure, diagnosis or exhaustive list.",
    "topicIds": [
      "mt_rVjbdwUJHG"
    ]
  },
  "ON-HPE-2019-G2-D2.3": {
    "protocolIds": [
      "care-boundaries-and-consent",
      "respond-to-threat-and-support"
    ],
    "panel": "Explain consent and actually rehearse respectful boundary/upstander/reporting, without blaming inability to refuse.",
    "topicIds": [
      "mt_rqLMfiw61L",
      "mt_hkIbGmuH7D",
      "mt_R2_rZ4F6r4"
    ]
  },
  "ON-HPE-2019-G2-D3.1": {
    "protocolIds": [
      "positive-relationships-and-harm"
    ],
    "panel": "Describe positive relationships and harmful conduct, including appropriate communication/anger distinction.",
    "topicIds": [
      "mt_HBcvu0UxYe",
      "mt_YbX3LD0Eca"
    ]
  },
  "ON-HPE-2019-G3-D1.2": {
    "protocolIds": [
      "concussion-knowledge-and-school-plan"
    ],
    "panel": "Actual concussion/causal jolt knowledge and school-protocol awareness, not just generic reporting.",
    "topicIds": [
      "mt_q3vRl4dddK"
    ]
  },
  "ON-HPE-2019-G3-D2.2": {
    "protocolIds": [
      "create-safety-guidelines"
    ],
    "panel": "Actually develop guidelines for varied out-of-class settings including online.",
    "topicIds": [
      "mt_q3vRl4dddK",
      "mt_zIzJGkaj0Q"
    ]
  },
  "ON-HPE-2019-G3-D3.2": {
    "protocolIds": [
      "fictional-violence-and-real-consequences"
    ],
    "panel": "Explain fictional portrayal versus possible actual consequences across media, not just moral opinion.",
    "topicIds": [
      "mt_UHQfb-n-w3"
    ]
  },
  "ON-HPE-2019-G4-D1.2": {
    "protocolIds": [
      "communication-tech-risks-and-protection"
    ],
    "panel": "Varied technology relationship/time/mental-health risks and concrete precautions; risk not diagnosis.",
    "topicIds": [
      "mt_zIzJGkaj0Q",
      "mt_Udv6pH1nRh"
    ]
  },
  "ON-HPE-2019-G4-D1.3": {
    "protocolIds": [
      "bullying-abuse-and-help",
      "care-boundaries-and-consent"
    ],
    "panel": "Forms, possible impacts and responses including online and other non-consensual conduct; no wait-for-repetition threshold.",
    "topicIds": [
      "mt_hkIbGmuH7D",
      "mt_R2_rZ4F6r4"
    ]
  },
  "ON-HPE-2019-G4-D2.2": {
    "protocolIds": [
      "apply-risk-decision-cycle"
    ],
    "panel": "Full actual risk/options/consequence/choice/action/reflection cycle across varied benign scenarios.",
    "topicIds": [
      "mt_RhntJz7p_6"
    ]
  },
  "ON-HPE-2019-G5-D1.1": {
    "protocolIds": [
      "contacts-and-help"
    ],
    "panel": "Trusted people AND appropriate support services across the required kinds of need.",
    "topicIds": [
      "mt_PdYlsA33jB",
      "mt_q3vRl4dddK"
    ]
  },
  "ON-HPE-2019-G5-D2.2": {
    "protocolIds": [
      "respond-to-threat-and-support"
    ],
    "panel": "Actually apply appropriate SEL and safety strategies, not appearance-based confidence or threat enactment.",
    "topicIds": [
      "mt_rqLMfiw61L",
      "mt_RhntJz7p_6",
      "mt_R2_rZ4F6r4"
    ]
  },
  "ON-HPE-2019-G5-D3.2": {
    "protocolIds": [
      "impact-inclusion-and-conflict"
    ],
    "panel": "Own/others positive and negative conduct, varied identity-based harms, in-person/online effects on feelings/self-concept/well-being/reputation.",
    "topicIds": [
      "mt_rpug2tkYhb",
      "mt_HFN1pGASpZ",
      "mt_zIzJGkaj0Q"
    ]
  },
  "ON-HPE-2019-G6-D1.1": {
    "protocolIds": [
      "impact-inclusion-and-conflict"
    ],
    "panel": "Actual inclusive/respectful action and benefits to self and others, not compulsory liking or disclosure.",
    "topicIds": [
      "mt_lAvS72LOUO",
      "mt_HFN1pGASpZ"
    ]
  },
  "ON-HPE-2019-G6-D2.3": {
    "protocolIds": [
      "impact-inclusion-and-conflict",
      "positive-relationships-and-harm"
    ],
    "panel": "Actually apply communication/self-management to positive interaction and conflict in-person/online.",
    "topicIds": [
      "mt_iWGnyUyN2j",
      "mt_rqLMfiw61L",
      "mt_YbX3LD0Eca"
    ]
  },
  "ON-HPE-2019-G6-D3.2": {
    "protocolIds": [
      "care-responsibility-and-emergency-plan"
    ],
    "panel": "Responsibilities AND risks of self/other care with appropriate prevention and dangerous-situation procedures; no independent care licence.",
    "topicIds": [
      "mt_q3vRl4dddK",
      "mt_RhntJz7p_6",
      "mt_PdYlsA33jB"
    ]
  }
};
function qualify(r=report,p=programme){
 const selected=r.records.filter(x=>Object.hasOwn(expected,x.sourceKey.slice(prefix.length)));
 assert.equal(selected.length,20);assert.equal(new Set(selected.map(x=>x.sourceKey)).size,20);
 const protocols=new Map(p.protocols.map(x=>[x.id,x]));
 const aa=read('data/curriculum-alignments.json').alignments;
 for(const row of selected){
  const e=expected[row.sourceKey.slice(prefix.length)];
  assert.equal(row.disposition,'Full');assert.deepEqual(row.protocolIds,e.protocolIds);
  assert.deepEqual(row.topicContributions.map(x=>x.topicId),e.topicIds);
  assert.equal(row.sourceRequirements.panel,e.panel);assert.deepEqual(row.requiredConditions,[e.panel]);
  for(const k of ['wholeSourceTaskRequired','noExposureOrPrivateHistory','noVictimBlame'])assert.equal(row.sourceRequirements[k],true);
  assert.ok(row.protocolIds.every(id=>protocols.has(id)));
  for(const id of e.topicIds)assert.ok(aa.some(a=>a.topicId===id&&a.country==='CA'&&a.region==='Ontario'&&a.ageRangeStart===row.grade+5&&a.ageRangeEnd===row.grade+6&&a.standards.includes(row.sourceKey)));
 }
 for(const k of ['noVictimBlame','fictionalUnsafeCasesOnly','noPrivateHarmOrMedicalHistoryRequired','noRealEmergencyCallOrReport','noUnsafeTouchOrGraphicImages','permissionNotInferredFromSilence','harmHelpDoesNotWaitForRepetition','localSafeguardingAndEmergencyProceduresBoundAtUse'])assert.equal(p.conditions.personalSafety[k],true);
 assert.match(protocols.get('concussion-knowledge-and-school-plan').task,/brain injury/);
 assert.match(protocols.get('concussion-knowledge-and-school-plan').task,/jolt/);
 assert.match(protocols.get('create-safety-guidelines').task,/create and explain/);
 assert.match(protocols.get('apply-risk-decision-cycle').task,/choose and act/);
 assert.match(protocols.get('impact-inclusion-and-conflict').task,/actually carry out/);
 assert.match(protocols.get('bullying-abuse-and-help').task,/without requiring.*wait for repetition/);
}
test('all20 personal-safety rows bind exact tasks, requirements and scoped components',()=>qualify());
test('another valid safety protocol cannot silently replace the source-specific one',()=>{const r=structuredClone(report);r.records.find(x=>x.sourceKey.endsWith('G3-D1.2')).protocolIds=['school-and-everyday-safety'];assert.throws(()=>qualify(r));});
test('source conditions cannot be swapped between otherwise valid rows',()=>{const r=structuredClone(report);const a=r.records.find(x=>x.sourceKey.endsWith('G3-D1.2')),b=r.records.find(x=>x.sourceKey.endsWith('G3-D2.2'));a.sourceRequirements=structuredClone(b.sourceRequirements);a.requiredConditions=[...b.requiredConditions];assert.throws(()=>qualify(r));});
test('actual guideline production, decision action and inclusive action are retained',()=>{for(const id of ['create-safety-guidelines','apply-risk-decision-cycle','impact-inclusion-and-conflict']){const p=structuredClone(programme);p.protocols.find(x=>x.id===id).task='Read a generic safe-choice poster.';assert.throws(()=>qualify(report,p));}});
test('concussion knowledge cannot collapse to generic adult reporting',()=>{const p=structuredClone(programme);p.protocols.find(x=>x.id==='concussion-knowledge-and-school-plan').task='Tell an adult if you feel unwell.';assert.throws(()=>qualify(report,p));});
test('victim blame, repetition thresholds and private disclosures cannot replace safeguards',()=>{for(const k of ['noVictimBlame','harmHelpDoesNotWaitForRepetition','noPrivateHarmOrMedicalHistoryRequired','noUnsafeTouchOrGraphicImages']){const p=structuredClone(programme);p.conditions.personalSafety[k]=false;assert.throws(()=>qualify(report,p));}});
