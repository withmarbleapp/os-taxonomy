// Offline review artifact. Diagnostic state is not read or included.
import {readFile,writeFile} from 'node:fs/promises';
import {join,resolve} from 'node:path';
const dir=resolve(process.argv[2] ?? '');
const run=JSON.parse(await readFile(join(dir,'learner.json'),'utf8'));
const esc=s=>String(s??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
let error='';try{error=await readFile(join(dir,'error.txt'),'utf8');}catch{}
const steps=run.actions.map(a=>`<section><h2>Action ${a.step+1}: ${esc(a.decision.action)}</h2>
<p><b>Tutor:</b> ${esc(a.tutorWords??'(see transcript below)')}</p>
<p><b>Learner observation:</b> ${esc(a.decision.observation)}</p>
<p><b>Learner words:</b> ${esc(a.decision.text||'(silent)')}</p>
<p>Coordinates (0–1000): ${esc(a.decision.x)}, ${esc(a.decision.y)} → ${esc(a.decision.toX)}, ${esc(a.decision.toY)}. Model time ${(a.durationMs/1000).toFixed(1)}s.</p>
<div><figure><img src="${a.step}-a.png"><figcaption>Before</figcaption></figure><figure><img src="${a.step}-after.png"><figcaption>After action</figcaption></figure></div></section>`).join('\n');
await writeFile(join(dir,'review.html'),`<!doctype html><meta charset="utf-8"><title>Visual learner review</title>
<style>body{font:17px system-ui;margin:32px auto;max-width:1400px;padding:0 20px;color:#162633;background:#f6f7f8}section{background:white;padding:24px;margin:24px 0;border-radius:12px}section div{display:flex;gap:16px}figure{margin:0;flex:1}img{width:100%;border-radius:8px}figcaption{color:#65717c}pre{white-space:pre-wrap}@media(max-width:800px){section div{display:block}}</style>
<h1>Visual learner: ${esc(run.model)}</h1><p>Screenshot-only synthetic learner; tutor text substitutes for audio. No hidden lesson state supplied. This is an interaction experiment, not child validation.</p>
<p>Outcome: ${esc(run.outcome??(error?'error':'bounded experiment; no completion claimed'))}. Supplied opening reply: ${esc(run.seededOpeningReply??'none')}.</p>${error?`<pre>${esc(error)}</pre>`:''}${steps}<section><h2>Delivered conversation</h2>${run.transcript.map(t=>`<p><b>${esc(t.speaker)}:</b> ${esc(t.text)}</p>`).join('')}</section>`);
console.log(join(dir,'review.html'));
