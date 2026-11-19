import fs from 'node:fs';
import { canonicalResearchDigest } from '../../scripts/canonical-teaching-research.mjs';

const root = new URL('../../', import.meta.url);
const read = name => JSON.parse(fs.readFileSync(new URL(name, root)));
const scope = read('reports/history-gapfill-2026-11-18/scope.json');
const topics = read('data/topics.json');
const collection = read('data/teaching-research.json');
const byId = new Map(collection.records.map(row => [row.topicId, row]));
const entries = scope.scope.map(context => ({ ...context, research: byId.get(context.topic.id), digest: canonicalResearchDigest(byId.get(context.topic.id), { topics }) }));
const counts = entries.reduce((c, e) => (c[e.research.confidence] = (c[e.research.confidence] || 0) + 1, c), {});
const payload = JSON.stringify({ baseCommit: scope.baseCommit, coverage: collection.coverage.bySubject, entries }).replaceAll('<', '\\u003c');
const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>History · Teaching research review</title>
<style>
:root{color-scheme:light;--ink:#183333;--muted:#4b6464;--line:#d2dfdc;--paper:#fff;--bg:#eef3ef;--accent:#135d53}*{box-sizing:border-box}body{margin:0;font:16px/1.55 system-ui,sans-serif;color:var(--ink);background:var(--bg)}header{padding:28px 32px 20px;background:#143d38;color:white}header p{max-width:960px;margin:8px 0}h1{font-size:28px;line-height:1.2;margin:0}h2{font-size:27px;line-height:1.25}h3{font-size:20px;margin:0 0 12px}h4{font-size:16px;margin:16px 0 6px}p{margin:8px 0 14px}button,input,select,textarea{font:inherit}button{cursor:pointer}a{color:var(--accent);overflow-wrap:anywhere}button,.control{border:1px solid var(--line);border-radius:7px;background:white;padding:8px 12px;color:var(--ink)}header button{margin:6px 8px 0 0}header small{display:block;color:#d6e8e2}.layout{display:grid;grid-template-columns:310px minmax(0,1fr);max-width:1550px;margin:auto}aside{padding:20px 16px;position:sticky;top:0;height:100vh;overflow:auto;border-right:1px solid var(--line)}aside label{display:block;font-size:13px;color:var(--muted);margin:8px 0 4px}.control{width:100%;font-size:14px}#results{font-size:13px;color:var(--muted);margin:16px 0 8px}nav{display:grid;gap:5px}nav button{text-align:left;border:1px solid transparent;background:transparent;border-radius:7px;padding:10px;line-height:1.35;color:var(--ink)}nav button[aria-current=true]{background:white;border-color:var(--accent)}nav small{display:block;color:var(--muted);font-size:12px;margin-top:4px}main{padding:28px 36px 70px;min-width:0}.card{background:var(--paper);border:1px solid var(--line);border-radius:10px;padding:24px;margin:18px 0}.eyebrow{font-size:12px;text-transform:uppercase;letter-spacing:.08em;color:var(--muted)}.badge{display:inline-block;border-radius:20px;background:#e5eeea;padding:3px 10px;font-size:12px;margin:0 5px 5px 0}.low{background:#fff0c8;color:#674411}.notice{border-left:4px solid #b58534;background:#fff8e6;padding:12px 16px;margin:16px 0}.notice p:last-child{margin-bottom:0}.muted{color:var(--muted);font-size:14px}ul,ol{padding-left:24px}li{margin:7px 0}.activity{border-top:1px solid var(--line);padding-top:18px;margin-top:22px}.activity:first-of-type{border-top:0;padding-top:0}details{border-top:1px solid var(--line);padding-top:12px;margin-top:16px}summary{cursor:pointer;font-weight:650}table{border-collapse:collapse;width:100%;font-size:14px}th,td{text-align:left;vertical-align:top;border-bottom:1px solid var(--line);padding:12px 8px}th{color:var(--muted)}textarea{display:block;width:100%;min-height:150px;padding:12px;border:1px solid var(--line);border-radius:7px;resize:vertical}#note-status{min-height:22px}code{font-size:12px;overflow-wrap:anywhere}#content:focus{outline:none}.source{padding:12px 0;border-top:1px solid var(--line)}.source:first-of-type{border-top:0}.empty{padding:30px 0}.actions{display:flex;gap:8px;flex-wrap:wrap;margin:18px 0}.actions button{flex:1}#coverage{color:#d6e8e2;font-size:14px}
@media(max-width:850px){.layout{grid-template-columns:1fr}aside{position:static;height:auto;border-right:0;border-bottom:1px solid var(--line)}nav{max-height:240px;overflow:auto}main{padding:18px 16px}header{padding:22px 18px}.card{padding:18px}table,thead,tbody,tr,th,td{display:block}th{display:none}td{padding:8px 0}}
@media print{body{background:white}header{color:black;background:white;padding:10px}header small,#coverage{color:#333}aside,header button,.actions,#review-notes{display:none}.layout{display:block}main{padding:0}.card{break-inside:auto;border:0;padding:10px 0}details{display:block}.notice{background:white}a{color:black}}
</style></head><body>
<header><div class="eyebrow" style="color:#c5dfd5">Authored additions · 18 November 2026</div><h1>Teaching research, ready to inspect</h1>
<p>${entries.length} new History records. Review the teaching, exercise progression, independent assessment and source limits together.</p>
<div id="coverage"></div><p><strong>${counts.medium || 0} medium confidence · ${counts.low || 0} low confidence.</strong> These are research-informed proposals. Source claims were checked; activities have not been learner-tested or independently reviewed.</p>
<button id="export">Export review notes</button><button id="print">Print this topic</button><small>Offline page. Notes stay in this browser; export them to share. Existing research is outside this review.</small></header>
<div class="layout"><aside><label for="search">Find a topic or phrase</label><input id="search" class="control" type="search" placeholder="e.g. pyramids, sources, castles">
<label for="subject">Subject</label><select id="subject" class="control"><option value="">All History topics</option><option>History</option></select>
<label for="domain">Domain</label><select id="domain" class="control"><option value="">All domains</option></select>
<label for="confidence">Confidence</label><select id="confidence" class="control"><option value="">All confidence levels</option><option value="low">Low — inspect evidence limits</option><option value="medium">Medium</option></select>
<div id="results" role="status"></div><nav id="topics" aria-label="Research topics"></nav></aside>
<main><div id="content" tabindex="-1"></div><section id="review-notes" class="card"><h3>Your review notes</h3><label for="notes">What needs changing, strengthening or discussion?</label><textarea id="notes" placeholder="Notes for this topic…"></textarea><div id="note-status" class="muted" role="status"></div><button id="confirm-version" hidden>Confirm notes apply to this version</button><div id="note-conflicts" hidden></div></section></main></div>
<script id="research-data" type="application/json">${payload}</script>
<script>
const DATA=JSON.parse(document.getElementById('research-data').textContent);
const $=id=>document.getElementById(id), entries=DATA.entries, byId=new Map(entries.map(e=>[e.topic.id,e]));
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const list=items=>'<ul>'+items.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul>';
const para=text=>'<p>'+esc(text)+'</p>';
const labels={two_tier:'Answer + reason',performance_task:'Observed performance',interpret_translate:'Interpret + construct',open_epistemic_probe:'Open discussion',use_in_context:'Use in context'};
const KEY='marble-teaching-research-history-2026-11-18';let notes={},storage=true,current='',filtered=[];
function loadNotes(saved){const loaded={};if(!saved||typeof saved!=='object'||Array.isArray(saved))return loaded;for(const [id,note] of Object.entries(saved)){if(!byId.has(id))continue;if(typeof note==='string')loaded[id]={notes:note,researchDigest:null};else if(note&&typeof note.notes==='string'&&(note.researchDigest===null||typeof note.researchDigest==='string'))loaded[id]={notes:note.notes,researchDigest:note.researchDigest};}return loaded;}
// Each save gets its own key. Concurrent tabs cannot replace each other's writes.
// Parent revisions let us retain divergent edits until the reviewer resolves them.
const NOTE_PREFIX=KEY+':note:', pendingNotes=new Map();let noteHeads=new Map(),supersededNotes=new Set();
function refreshNotes(){
  const revisions=new Map(pendingNotes);let legacy={};
  try{
    try{legacy=loadNotes(JSON.parse(localStorage.getItem(KEY)||'{}'));}catch{}
    for(let i=0;i<localStorage.length;i++){
      const key=localStorage.key(i);if(!key?.startsWith(NOTE_PREFIX))continue;
      let row;try{row=JSON.parse(localStorage.getItem(key));}catch{continue;}
      if(row&&byId.has(row.topicId)&&typeof row.revisionId==='string'&&key===NOTE_PREFIX+row.revisionId&&Array.isArray(row.parents)&&row.parents.every(id=>typeof id==='string')&&typeof row.notes==='string'&&(row.researchDigest===null||typeof row.researchDigest==='string'))revisions.set(row.revisionId,row);
    }
  }catch{storage=false;}
  // The old shared store is a read-only fallback until a topic has a revision.
  // Superseded journal rows may then be removed without reviving an old note.
  const revisedTopics=new Set([...revisions.values()].map(row=>row.topicId));
  for(const [topicId,note] of Object.entries(legacy))if(!revisedTopics.has(topicId)){
    const revisionId='legacy:'+topicId;
    revisions.set(revisionId,{...note,topicId,revisionId,parents:[]});
  }
  const superseded=new Set([...revisions.values()].flatMap(row=>row.parents));
  supersededNotes=superseded;
  noteHeads=new Map();
  for(const row of revisions.values())if(!superseded.has(row.revisionId)){
    if(!noteHeads.has(row.topicId))noteHeads.set(row.topicId,[]);
    noteHeads.get(row.topicId).push(row);
  }
  const previous=notes;notes={};
  for(const [id,heads] of noteHeads){
    heads.sort((a,b)=>a.revisionId.localeCompare(b.revisionId));
    notes[id]=heads.find(row=>row.revisionId===previous[id]?.revisionId)||heads.at(-1);
  }
}
refreshNotes();
$('coverage').textContent=['History'].map(s=>s+': '+DATA.coverage[s].withResearch+' / '+DATA.coverage[s].topics+' topics covered').join(' · ');
function render(){const e=byId.get(current);$('review-notes').hidden=!e;if(!e){$('content').innerHTML='<p class="empty">No topics match these filters.</p>';return;}
const t=e.topic,r=e.research,a=r.assess,citations=new Map(r.sources.map((s,i)=>[s.id,i+1]));
const constraints=r.learn.constraints.filter(x=>!/^Exercise design:/i.test(x)),generation=r.learn.constraints.filter(x=>/^Exercise design:/i.test(x));
$('content').innerHTML='<div class="eyebrow">'+esc(t.subject)+' / '+esc(t.domain)+'</div><h2>'+esc(t.name)+'</h2><div><span class="badge">'+esc(labels[a.method]||a.method)+'</span><span class="badge '+(r.confidence==='low'?'low':'')+'">'+esc(r.confidence)+' confidence</span></div>'+para(t.description)+
'<details><summary>Topic scope and prerequisites</summary>'+list(t.evidence)+list(e.prerequisites.map(p=>p.name+' ('+p.strength+')'))+'<code>'+esc(t.id)+'</code></details>'+
'<section class="card"><h3>Teaching approach</h3>'+para(r.pedagogy.summary)+'<h4>Teacher moves</h4>'+list(r.pedagogy.bestPractices)+'<h4>Representations</h4>'+list(r.pedagogy.keyRepresentations)+'</section>'+
'<section class="card"><h3>Exercises and progression</h3>'+r.learn.activities.map((x,i)=>'<article class="activity"><div class="eyebrow">Activity '+(i+1)+'</div><h4>'+esc(x.title)+'</h4>'+list(x.learnerActions)+'<h4>What the learner should notice</h4>'+para(x.intendedInsight)+'<details><summary>Feedback, rationale and source links</summary>'+list(x.feedback)+para(x.rationale)+'<p class="muted">Sources: '+x.sourceIds.map(id=>'<a href="#'+esc(id)+'">['+citations.get(id)+']</a>').join(' ')+'</p></details></article>').join('')+'<div class="notice"><h4>Creating further exercises</h4>'+list(generation.length?generation:['See the activity variations and constraints below.'])+'</div><details><summary>Boundaries and design constraints</summary>'+list(constraints)+'</details></section>'+
'<section class="card"><h3>Independent assessment</h3>'+para(a.diagnosticPrompt)+'<h4>Why this distinguishes understanding</h4>'+para(a.whatMakesItDiscriminate)+'<details><summary>Expected evidence and follow-up probes</summary>'+para(a.correctAnswer)+list(a.probeDeeper)+'<h4>Response profiles</h4>'+Object.entries(a.responseLevels).map(([level,text])=>'<p><strong>'+esc(level)+':</strong> '+esc(text)+'</p>').join('')+(a.poeTask?'<h4>Predict–observe–explain</h4>'+para(a.poeTask):'')+'</details></section>'+
'<section class="card"><h3>Diagnostic responses</h3><p class="muted">These prompts distinguish documented error families from authored performance checks. A single answer does not establish a stable belief.</p>'+a.errorPatterns.map(x=>'<article class="activity"><strong>'+esc(x.pattern)+'</strong> <span class="badge">'+esc(x.kind)+'</span><h4>What would reveal it</h4>'+para(x.revealedBy)+'<h4>Next teaching move</h4>'+para(x.nextMove)+(x.reteachPrerequisiteId?'<p class="muted">Revisit prerequisite: '+esc(e.prerequisites.find(p=>p.prerequisiteId===x.reteachPrerequisiteId)?.name||x.reteachPrerequisiteId)+'</p>':'')+(x.distractor?'<details><summary>Optional distractor</summary>'+para(x.distractor)+'</details>':'')+'</article>').join('')+'</section>'+
'<section class="card"><h3>Sources and evidence limits</h3><div class="notice">“Claim checked” applies to the specific citation claim. It does not mean the exact exercise is validated or every proposed error is documented in child research.</div>'+r.sources.map((s,i)=>'<article class="source" id="'+esc(s.id)+'"><strong>['+(i+1)+'] '+esc(s.source)+'</strong>'+para(s.claim)+'<span class="badge">'+(s.verified?'Claim checked':'Unverified claim')+'</span>'+(s.url&&/^https?:/.test(s.url)?'<a href="'+esc(s.url)+'" target="_blank" rel="noopener noreferrer">Open source</a>':'')+'</article>').join('')+'<h4>Review notes</h4>'+list(r.learn.reviewNotes)+'<p class="muted">'+esc(r.authorship.attribution)+'</p></section>'+
'<div class="actions"><button id="previous">Previous topic</button><button id="next">Next topic</button></div>';
$('notes').value=notes[current]?.notes||'';status();
$('previous').onclick=()=>step(-1);$('next').onclick=()=>step(1);const i=filtered.findIndex(x=>x.topic.id===current);$('previous').disabled=i===0;$('next').disabled=i===filtered.length-1;
}
function status(){
  const note=notes[current],stale=!!note?.notes&&note.researchDigest!==byId.get(current)?.digest;
  const saved=storage?'Saved in this browser. Export notes before sharing.':'Browser storage is unavailable. Keep this page open and export notes to save them.';
  const warning=stale?(note.researchDigest===null?'These older notes have no saved record version.':'These notes refer to an earlier version of this record.')+' Their original version is preserved on export. Review them before confirming that they apply to this version. ':'';
  const heads=noteHeads.get(current)||[],conflict=heads.length>1;
  $('note-status').textContent=(conflict?'Conflicting edits from another tab are preserved. Review all versions below or export them. ':'')+warning+saved;
  $('confirm-version').hidden=!stale;
  $('note-conflicts').hidden=!conflict;
  $('note-conflicts').innerHTML=conflict?'<h4>Conflicting saved notes</h4><p>Both versions are retained. Choose a version, or combine their text above and save the combined note. Version bindings are preserved.</p>'+heads.map((row,i)=>'<article class="notice"><strong>Version '+(i+1)+(row.revisionId===note?.revisionId?' (shown above)':'')+'</strong><p style="white-space:pre-wrap">'+esc(row.notes||'(cleared note)')+'</p><p class="muted"><code>'+esc(row.researchDigest===null?'Unknown record version':row.researchDigest)+'</code></p><button data-revision="'+esc(row.revisionId)+'">Use this saved version</button></article>').join('')+'<button id="resolve-current">Save current text and resolve conflict</button>':'';
  for(const button of $('note-conflicts').querySelectorAll('[data-revision]'))button.onclick=()=>resolveNote(button.dataset.revision);
  if(conflict)$('resolve-current').onclick=()=>resolveNote(notes[current].revisionId,$('notes').value);
}
function saveNote(topicId,text,digest,parents){
  const row={topicId,notes:text,researchDigest:digest,parents,revisionId:crypto.randomUUID()};
  pendingNotes.set(row.revisionId,row);
  try{localStorage.setItem(NOTE_PREFIX+row.revisionId,JSON.stringify(row));pendingNotes.delete(row.revisionId);storage=pendingNotes.size===0;}catch{storage=false;}
  refreshNotes();notes[topicId]=row;
  // Delete only known superseded revisions, never an unseen concurrent write.
  // Failed writes keep their last persisted parent as a reload fallback.
  if(storage)try{for(const id of supersededNotes)localStorage.removeItem(NOTE_PREFIX+id);}catch{storage=false;}
  status();navigation();
}
function resolveNote(revisionId,text){
  refreshNotes();const heads=noteHeads.get(current)||[],chosen=heads.find(row=>row.revisionId===revisionId);
  if(!chosen)return;
  saveNote(current,text??chosen.notes,chosen.researchDigest,heads.map(row=>row.revisionId));
  $('notes').value=notes[current].notes;
}
window.addEventListener('storage',event=>{
  if(event.key===null||event.key===KEY||event.key.startsWith(NOTE_PREFIX)){
    refreshNotes();$('notes').value=notes[current]?.notes||'';status();navigation();
  }
});
function select(id,focus=false){current=id;location.hash=id;render();navigation();if(focus){$('content').focus();window.scrollTo({top:0,behavior:'auto'});}}
function step(delta){const i=filtered.findIndex(x=>x.topic.id===current);if(filtered[i+delta])select(filtered[i+delta].topic.id,true);}
function navigation(){$('topics').innerHTML=filtered.map(e=>'<button data-id="'+esc(e.topic.id)+'" aria-current="'+(e.topic.id===current)+'">'+esc(e.topic.name)+(notes[e.topic.id]?.notes?' ✎':'')+'<small>'+esc(e.topic.subject)+' · '+esc(e.research.confidence)+'</small></button>').join('');for(const b of $('topics').querySelectorAll('button'))b.onclick=()=>select(b.dataset.id,true);}
function filter(){const previous=current,q=$('search').value.toLowerCase().trim();filtered=entries.filter(e=>(!$('subject').value||e.topic.subject===$('subject').value)&&(!$('domain').value||e.topic.domain===$('domain').value)&&(!$('confidence').value||e.research.confidence===$('confidence').value)&&(!q||JSON.stringify(e).toLowerCase().includes(q)));$('results').textContent=filtered.length+' of '+entries.length+' topics';if(!filtered.some(e=>e.topic.id===current))current=filtered[0]?.topic.id||'';if(current&&current!==previous)history.replaceState(null,'','#'+current);render();navigation();}
function topicForHash(fragment){if(!fragment)return entries[0].topic.id;if(byId.has(fragment))return fragment;return entries.find(e=>e.research.sources.some(s=>s.id===fragment))?.topic.id;}
window.addEventListener('hashchange',()=>{const fragment=location.hash.slice(1),id=topicForHash(fragment);if(!id||id===current)return;if(!filtered.some(e=>e.topic.id===id))for(const control of ['search','subject','domain','confidence'])$(control).value='';current=id;filter();if(fragment!==id)document.getElementById(fragment)?.scrollIntoView();});
for(const domain of [...new Set(entries.map(e=>e.topic.domain))].sort()){const option=document.createElement('option');option.value=domain;option.textContent=domain;$('domain').append(option);}
for(const id of ['search','subject','domain','confidence'])$(id).addEventListener(id==='search'?'input':'change',filter);
$('notes').addEventListener('input',()=>{
  if(!current)return;const previous=notes[current];
  saveNote(current,$('notes').value,previous?previous.researchDigest:byId.get(current).digest,previous?[previous.revisionId]:[]);
});
$('confirm-version').onclick=()=>{
  if(!current||!notes[current]?.notes)return;const previous=notes[current];
  saveNote(current,previous.notes,byId.get(current).digest,[previous.revisionId]);
};
$('export').onclick=()=>{
  refreshNotes();$('notes').value=notes[current]?.notes||'';status();navigation();
  const reviewed=entries.flatMap(e=>(noteHeads.get(e.topic.id)||[]).filter(row=>row.notes||(noteHeads.get(e.topic.id)||[]).length>1).map(row=>({topicId:e.topic.id,name:e.topic.name,revisionId:row.revisionId,conflictingVersions:noteHeads.get(e.topic.id).length>1,researchDigest:row.researchDigest,currentResearchDigest:e.digest,matchesCurrentRecord:row.researchDigest===e.digest,notes:row.notes})));
  const blob=new Blob([JSON.stringify({baseCommit:DATA.baseCommit,exportedAt:new Date().toISOString(),reviews:reviewed},null,2)],{type:'application/json'});const link=document.createElement('a');link.href=URL.createObjectURL(blob);link.download='teaching-research-review-notes.json';link.click();setTimeout(()=>URL.revokeObjectURL(link.href),1000);
};
$('print').onclick=()=>{for(const d of $('content').querySelectorAll('details'))d.open=true;window.print();};
current=topicForHash(location.hash.slice(1))||entries[0].topic.id;filter();
</script></body></html>`;
fs.writeFileSync(new URL('index.html', import.meta.url), html);
console.log(`Built offline review page with ${entries.length} records.`);
