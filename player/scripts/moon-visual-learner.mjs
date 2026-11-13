// Screenshot-only learner. Setup and reply transport use the host UI; lesson DOM,
// snapshots, scores, tools and geometry are NEVER supplied to the learner.
// Silent test audio + delivered speech_chunk text isolate visual interaction from ASR/TTS.
import {readFile, writeFile, mkdir, readdir, mkdtemp, copyFile, rm} from 'node:fs/promises';
import {homedir, tmpdir} from 'node:os';
import {join} from 'node:path';
import {createService} from '../apps/local-service/server.mjs';
import {fixtureSpeech} from './fixture-speech.mjs';
import {chrome, wait} from './cdp.mjs';
const model = process.env.VISUAL_LEARNER_MODEL ?? 'qwen3-vl:4b-instruct';
const steps = Number(process.env.VISUAL_LEARNER_STEPS ?? 12);
const probe = process.argv.includes('--probe');
const checkModel = await fetch('http://127.0.0.1:11434/api/show', {
 method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({model}),signal:AbortSignal.timeout(10000),
});
if(!checkModel.ok)throw Error(`Local model ${model} is not ready; finish ollama pull before starting this test.`);
const modelInfo=await checkModel.json();
if(!modelInfo.capabilities?.includes('vision'))throw Error('Learner model does not advertise vision support');
const run = new Date().toISOString().replaceAll(':','-');
const out = join('artifacts/moon/visual-learner',run);
await mkdir(out,{recursive:true});
const dataDir = await mkdtemp(join(tmpdir(),'marble-visual-learner-'));
const settings = JSON.parse(await readFile(join(homedir(),'.config/Marble/settings.json'),'utf8'));
await writeFile(join(dataDir,'settings.json'),JSON.stringify({...settings,speech:true}));
const service = await createService({dataDir,speech:fixtureSpeech});
const width=960,height=720;
let browser;
const transcript=[],actions=[];
let spokenCursor=0;
let outcome=probe?'calibration_completed':'action_limit';
const actionSchema={type:'object',properties:{
  observation:{type:'string',maxLength:600},action:{type:'string',enum:['reply','click','drag','wait','stop']},
  text:{type:'string',maxLength:400},x:{type:'number'},y:{type:'number'},toX:{type:'number'},toY:{type:'number'},
},required:['observation','action','text','x','y','toX','toY'],additionalProperties:false};
const system=`You are testing an interactive lesson as a curious beginner. Follow the tutor using ONLY the screenshots and words you receive. You can recognize Sun, Moon and Earth, but do not volunteer astronomy facts from outside this lesson. Admit uncertainty naturally; do not pretend inability or invent mistakes. Your goal is to understand and participate, not to finish quickly or please the tutor. Read the visible instructions, find controls yourself, and attempt requested manipulations. Actively converse: when the tutor pauses after showing or explaining something, tell them what you noticed or ask a question. If you do not know what to do, ask. Wait only to watch an ongoing change; after an unchanged screen, tell the tutor you are ready or ask what to do instead of repeatedly waiting. Do not assume a click or drag worked: inspect the next images. A pair of images shows two moments 2.8 seconds apart. You may reply to the tutor, click, drag, wait to watch, or stop when you choose. Make ONE physical action per turn; you may also speak while acting. Coordinates x,y,toX,toY are normalized 0..1000 across the WHOLE screenshot, with top left 0,0. The text field is what you say to the tutor, including when clicking or dragging; leave text empty for a silent action. click/drag use actual mouse input. For unused coordinates use 0. observation should briefly report what is visibly happening, not a hidden plan. Output JSON matching the schema.`;
async function journal(){
 const names=await readdir(join(dataDir,'logs'));
 if(!names.length)return [];
 return (await readFile(join(dataDir,'logs',names[0]),'utf8')).trim().split('\n').filter(Boolean).flatMap(l=>{try{return [JSON.parse(l)];}catch{return [];}});
}
async function delivered(){
 const logs=await journal();
 const chunks=logs.filter(e=>e.type==='speech_chunk');
 const fresh=chunks.slice(spokenCursor).map(e=>e.text);spokenCursor=chunks.length;
 if(fresh.length)transcript.push({speaker:'tutor',text:fresh.join(' ')});
 return fresh.join(' ');
}
async function settle(){
 await wait(1200);
 const started=Date.now();
 while(Date.now()-started<180000){
  const status=await browser.evaluate("document.querySelector('#status').textContent");
  if(!['Thinking…','Speaking…'].includes(status)){
   if(status && status!=='Ready')throw Error('Player reported: '+status);
   await wait(300);return;
  }
  await wait(500);
 }
 throw Error('Tutor response timeout');
}
async function capture(name){
 const {data}=await browser.send('Page.captureScreenshot',{format:'png'});
 await writeFile(join(out,name+'.png'),Buffer.from(data,'base64'));
 return data;
}
const px=(v,max)=>Math.max(0,Math.min(max-1,v/1000*max));
async function mouse(a){
 for(const k of ['x','y',...(a.action==='drag'?['toX','toY']:[])])if(!Number.isFinite(a[k])||a[k]<0||a[k]>1000)throw Error('Invalid coordinate '+k);
 const x=px(a.x,width),y=px(a.y,height);
 await browser.send('Input.dispatchMouseEvent',{type:'mouseMoved',x,y});
 await browser.send('Input.dispatchMouseEvent',{type:'mousePressed',x,y,button:'left',clickCount:1});
 if(a.action==='drag')for(let i=1;i<=16;i++){
  await browser.send('Input.dispatchMouseEvent',{type:'mouseMoved',x:x+(px(a.toX,width)-x)*i/16,y:y+(px(a.toY,height)-y)*i/16,button:'left',buttons:1});
  await wait(35);
 }
 await browser.send('Input.dispatchMouseEvent',{type:'mouseReleased',x:a.action==='drag'?px(a.toX,width):x,y:a.action==='drag'?px(a.toY,height):y,button:'left',clickCount:1});
}
async function reply(text){
 if(typeof text!=='string'||!text.trim()||text.length>650)throw Error('Invalid learner reply');
 await browser.evaluate(`document.querySelector('#type-reply').click();document.querySelector('#reply-text').value=${JSON.stringify(text)};document.querySelector('#reply-form').requestSubmit()`);
 transcript.push({speaker:'learner',text});
}
try{
 browser=await chrome();
 const originalSend=browser.send;
 browser.send=async(...args)=>{try{return await originalSend(...args);}catch(e){throw Error(args[0]+': '+e.message);}};
 await browser.send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:false});
 await browser.send('Page.navigate',{url:service.origin});
 await browser.until('document.querySelectorAll(".lesson-card").length>=3');
 await browser.evaluate("Array.from(document.querySelectorAll('.lesson-card')).find(c=>c.textContent.includes('Moon’s daytime')).querySelector('.lesson-open').click()");
 await browser.until("document.querySelector('#status').textContent==='Ready'",20000);
 await browser.evaluate("document.querySelector('#start').click()");
 await browser.until("document.querySelector('#start-cover').hidden",30000);
 await settle();
 if(process.env.VISUAL_LEARNER_OPENING_REPLY){await delivered();await reply(process.env.VISUAL_LEARNER_OPENING_REPLY);await settle();}
 for(let step=0;step<(probe?1:steps);step++){
  const newSpeech=await delivered();
  const images=[await capture(`${step}-a`)];
  if(!probe){await wait(2800);images.push(await capture(`${step}-b`));}
  const requestText=probe
   ? 'Calibration only: describe the visible scene and locate a visible control you could click to look for the Moon. Return a click at its center. Do not answer the lesson question.'
   : `Conversation so far: ${JSON.stringify(transcript)}\nYour recent actions: ${JSON.stringify(actions.slice(-4).map(a=>a.decision))}\nNew tutor words: ${newSpeech || '(none; inspect what changed after your action)'}\nChoose your next action from these current screenshots.`;
  const started=Date.now();
  console.log(JSON.stringify({step,event:'learner_inference_started',newSpeech}));
  const response=await fetch('http://127.0.0.1:11434/api/chat',{
   method:'POST',headers:{'content-type':'application/json'},signal:AbortSignal.timeout(240000),
   body:JSON.stringify({model,stream:false,think:false,format:actionSchema,keep_alive:'10m',options:{temperature:0.2,num_ctx:6144,num_predict:600},messages:[{role:'system',content:system},{role:'user',content:requestText,images}]}),
  });
  if(!response.ok)throw Error('Visual learner HTTP '+response.status+': '+await response.text());
  const result=await response.json();
  await writeFile(join(out,`${step}-model-output.json`),JSON.stringify(result,null,2));
  if(result.done_reason==='length')throw Error('Visual learner hit its output limit before completing an action');
  const decision=JSON.parse(result.message.content);
  const item={step,tutorWords:newSpeech,decision,durationMs:Date.now()-started,promptTokens:result.prompt_eval_count,outputTokens:result.eval_count};actions.push(item);
  console.log(JSON.stringify(item));
  await writeFile(join(out,'learner.json'),JSON.stringify({model,probe,outcome,seededOpeningReply:process.env.VISUAL_LEARNER_OPENING_REPLY??null,learnerPolicy:'active-conversation-with-speech-and-action',transcript,actions},null,2));
  if(!['reply','click','drag','wait','stop'].includes(decision.action))throw Error('Invalid action');
  if(['click','drag'].includes(decision.action))await mouse(decision);
  if(decision.action!=='stop' && (decision.action==='reply' || decision.text?.trim()))await reply(decision.text);
  if(decision.action==='stop'){outcome='learner_stop';await reply(decision.text||'I want to stop now.');await settle();await delivered();break;}
  if(decision.action==='wait')await wait(3000);
  await settle();
  await capture(`${step}-after`);
  if(actions.length>=4 && actions.slice(-4).every(a=>a.decision.action==='wait' && !a.decision.text && !a.tutorWords)) {
    outcome='stalled';
    console.log('Stopped as stalled: four silent waits without new tutor speech.');
    break;
  }
  if((await journal()).some(e=>e.type==='completed')){outcome='tutor_completed';break;}
 }
 await delivered();
 console.log('Artifacts: '+out);
}catch(error){
 outcome='error';
 console.error(error);
 await writeFile(join(out,'error.txt'),String(error.stack));
 process.exitCode=1;
}finally{
 await writeFile(join(out,'learner.json'),JSON.stringify({model,probe,outcome,seededOpeningReply:process.env.VISUAL_LEARNER_OPENING_REPLY??null,learnerPolicy:'active-conversation-with-speech-and-action',transcript,actions},null,2));
 // Diagnostics are retained separately and NEVER supplied to the learner model.
 for(const file of await readdir(join(dataDir,'logs')))await copyFile(join(dataDir,'logs',file),join(out,'diagnostics-'+file));
 await browser?.close();await service.close();
 await rm(dataDir,{recursive:true,force:true});
 console.log('Run saved: '+out);
}
