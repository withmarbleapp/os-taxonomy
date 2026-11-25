/* On-demand vocabulary support. Definitions explain words, never a task's answer. */
(()=>{
'use strict';
if(window.learningVocabulary)return;
// Set before loading this script; omitted fields retain the English defaults.
const options=window.learningVocabularyOptions||{};
const strings={regionLabel:'Word meaning',explain:word=>'Explain '+word,closeLabel:'Close definition',...options.strings};
const entries=options.entries??[
 ['photon',['photon','photons'],'A tiny packet of light energy. The moving lights in this model stand for these packets.'],
 ['molecule',['molecule','molecules'],'A tiny group of atoms joined together. Atoms are the tiny building pieces that make up things.'],
 ['atom',['atom','atoms'],'One of the tiny building pieces that make up materials such as water, air and rocks.'],
 ['nitrogen',['nitrogen'],'A gas that makes up most of Earth’s air. We cannot see it.'],
 ['oxygen',['oxygen'],'A gas in air that people and many other living things need to breathe.'],
 ['methane',['methane'],'A gas found in the air around some planets and moons, including Titan.'],
 ['carbon dioxide',['carbon dioxide'],'One of the gases we breathe out. Most of Mars’s air is this gas.'],
 ['atmosphere',['atmosphere','atmospheres'],'The layer of gases around a planet or moon.'],
 ['particle',['particle','particles'],'A very small piece of something. Here, these stand for the tiny parts of air.'],
 ['scattering',['scattering','scatters','scatter','scattered'],'Light changing direction when it meets something, such as the tiny parts of air.'],
 ['reflection',['reflection','reflections','reflects','reflect','reflected'],'Light bouncing off a surface and travelling in a new direction.'],
 ['horizon',['horizon','horizons'],'The edge of your view where the ground seems to meet the sky.'],
 ['orbit',['orbit','orbits'],'The path an object follows as it travels around another object in space.'],
 ['volume',['volume','volumes'],'The amount of space a solid object takes up, or a container can hold.'],
 ['cubic unit',['cubic unit','cubic units'],'A way to measure space: one cube that is one unit long, wide and high.'],
 ['unit cube',['unit cube','unit cubes'],'A measuring cube with edges that are each one unit long.'],
 ['cube',['cube','cubes'],'A solid shape with six square faces of the same size.'],
 ['solid',['solid','solids'],'Here, a three-dimensional shape: it has length, width and height.'],
 ['circle',['circle','circles'],'A flat round shape. Every point on its edge is the same distance from its centre.'],
 ['layer',['layer','layers'],'One part spread over a surface, or one level in a stack.'],
 ['unit',['unit','units'],'An agreed amount used for measuring, such as one centimetre.'],
 ['haze',['haze'],'Tiny floating bits or drops that make air look less clear.'],
 ['hexagon',['hexagon','hexagons'],'A flat shape with six straight sides.'],
 ['triangle',['triangle','triangles'],'A flat shape with three straight sides.'],
 ['square',['square','squares'],'A flat shape with four equal straight sides and four corners like the corner of a sheet of paper.'],
 ['rectangle',['rectangle','rectangles'],'A flat shape with four straight sides and corners like a sheet of paper. Opposite sides have equal lengths.'],
 ['area',['area','areas'],'How much flat space a shape covers.'],
 ['perimeter',['perimeter','perimeters'],'The distance all the way around the outside edge of a flat shape.'],
 ['tessellation',['tessellation','tessellations','tiling'],'A pattern of flat shapes that fit together without gaps or overlaps.']
];
const arMarks='[\\u0640\\u064B-\\u065F\\u0670]*';
const normalize=s=>s.normalize('NFC').replace(/[\u0640\u064B-\u065F\u0670]/g,'').replace(/’/g,"'").toLowerCase();
const aliases=new Map(),definitions=new Map();for(const [key,words,text]of entries){definitions.set(key,text);for(const word of words){const alias=normalize(word);if(alias){aliases.set(alias,key);if(/^[\u0621-\u064A]{3,}$/.test(alias)&&!alias.startsWith('ال')){for(const p of['ال','وال','فال','بال','كال','و','ف','ب','ك'])if(!aliases.has(p+alias))aliases.set(p+alias,key);const ll='لل'+(alias.startsWith('ل')?alias.slice(1):alias);if(!aliases.has(ll))aliases.set(ll,key);}}}}
const escape=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
// Choose composed/decomposed spelling per character, not per whole alias:
// a pasted word can mix both forms while its original visible text stays intact.
const spelling=word=>[...word].map(char=>{
 const decomposed=char.normalize('NFD');
 const base=char==="'"?"['’]":char===decomposed?escape(char):'(?:'+escape(char)+'|'+escape(decomposed)+')';
 return /[\u0621-\u064A]/.test(char)?base+arMarks:base;
}).join('');
const alternatives=[...aliases.keys()].sort((a,b)=>b.length-a.length).map(spelling).join('|');
const pattern=new RegExp('(?<![\\p{L}\\p{M}])('+(alternatives||'(?!)')+')(?![\\p{L}\\p{M}])','giu');
const style=document.createElement('style');style.textContent=`
 body .vocab-term{display:inline!important;font:inherit!important;color:inherit!important;line-height:inherit!important;letter-spacing:inherit!important;border:0!important;border-radius:2px!important;padding:0!important;margin:0!important;background:none!important;box-shadow:none!important;text-decoration-line:underline;text-decoration-style:dashed;text-decoration-thickness:1.5px;text-underline-offset:.16em;cursor:help;pointer-events:auto!important;white-space:normal;transform:none!important;translate:none!important;min-height:0!important}
 body .vocab-term:hover,body .vocab-term:active{background:none!important;box-shadow:none!important;color:inherit!important;transform:none!important;translate:none!important}
 body .vocab-term:focus-visible{outline:3px solid #774dc7!important;outline-offset:4px}
 #vocab-popover{position:fixed;z-index:1000;width:max-content;max-width:min(330px,calc(100vw - 32px));margin:0;padding-block:18px 20px;padding-inline:20px 52px;border:2px solid #242722;border-radius:20px;background:#fffdf6;color:#253e38;box-shadow:0 5px 0 #242722;font-family:'Baloo 2','Readex Pro','Geeza Pro','SF Arabic','Arial',sans-serif;text-align:start;pointer-events:auto;box-sizing:border-box}
 #vocab-popover[hidden]{display:none!important}#vocab-word{display:block;margin:0 0 6px;font-size:16px;font-weight:500;line-height:1.2;opacity:.75}#vocab-definition{margin:0;font:500 21px/1.23 'Baloo 2','Readex Pro','Geeza Pro','SF Arabic','Arial',sans-serif;letter-spacing:0}
 #vocab-close{position:absolute;inset-inline-end:4px;top:4px;display:grid;place-items:center;width:44px;height:44px;min-height:44px;margin:0;padding:0;border:0;border-radius:50%;background:transparent;color:#253e38;box-shadow:none;cursor:pointer;transform:none;translate:none}
 #vocab-close:hover{background:#efe7ce}#vocab-close svg{width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round}#vocab-close:focus-visible{outline:3px solid #774dc7;outline-offset:-3px}
 @media(max-width:600px){#vocab-definition{font-size:19px}#vocab-popover{max-width:calc(100vw - 32px)}}
 `;document.head.append(style);
const popup=document.createElement('aside');popup.id='vocab-popover';popup.hidden=true;popup.dir=document.documentElement.dir||document.body.dir||'auto';popup.setAttribute('role','region');popup.setAttribute('aria-label',strings.regionLabel);popup.dataset.vocabSkip='';
popup.innerHTML='<strong id="vocab-word"></strong><p id="vocab-definition"></p><button id="vocab-close" type="button" ><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M6 18 18 6"/></svg></button>';popup.querySelector('button').setAttribute('aria-label',strings.closeLabel);document.body.append(popup);
let descriptionTarget=null,savedDescription=null;
let anchor=null,pinned=false,leaveTimer=0,scheduled=false,restoringFocus=false;
function visible(el){return el?.isConnected&&el.getClientRects().length>0&&getComputedStyle(el).visibility!=='hidden'&&!el.closest('[inert]');}
function position(){if(!anchor)return;const r=(anchor.closest('#instruction')||anchor).getBoundingClientRect(),w=popup.offsetWidth,h=popup.offsetHeight;popup.style.left=Math.max(16,Math.min(innerWidth-w-16,r.left+r.width/2-w/2))+'px';const below=r.bottom+12,top=below+h<=innerHeight-16?below:r.top-h-12;popup.style.top=Math.max(16,Math.min(innerHeight-h-16,top))+'px';}
function close(restore=false){clearTimeout(leaveTimer);const old=anchor;if(old&&old.getAttribute('role')==='button')old.setAttribute('aria-expanded','false');if(descriptionTarget){if(savedDescription===null)descriptionTarget.removeAttribute('aria-describedby');else descriptionTarget.setAttribute('aria-describedby',savedDescription);descriptionTarget=null;savedDescription=null;}anchor=null;pinned=false;popup.hidden=true;if(restore&&visible(old)){restoringFocus=true;(old.closest('button')||old).focus({preventScroll:true});restoringFocus=false;}}
function open(term,pin=false){if(!visible(term))return;clearTimeout(leaveTimer);if(anchor!==term)close();anchor=term;pinned=pinned||pin;popup.querySelector('#vocab-word').textContent=term.textContent;popup.querySelector('#vocab-definition').textContent=definitions.get(term.dataset.vocabKey);if(term.getAttribute('role')==='button')term.setAttribute('aria-expanded','true');if(!descriptionTarget){descriptionTarget=term.closest('button,a')||term;savedDescription=descriptionTarget.getAttribute('aria-describedby');}descriptionTarget.setAttribute('aria-describedby',((savedDescription||'')+' vocab-definition').trim());popup.hidden=false;position();}
function activate(term){if(anchor===term&&pinned)close();else open(term,true);}
function laterClose(){clearTimeout(leaveTimer);if(!pinned)leaveTimer=setTimeout(()=>{if(!popup.matches(':hover')&&!anchor?.matches(':hover')&&document.activeElement!==anchor&&!popup.contains(document.activeElement))close();},180);}
// Keep interactive term wrapping outside live regions. Mirror only changed plain
// text into dedicated announcers, so one instruction update produces one update.
const liveSources=new Map();
function prepareAnnouncements(){
 for(const source of document.querySelectorAll('[aria-live],[role="status"],[role="alert"]')){
  if(source.closest('[data-vocab-skip]')||liveSources.has(source))continue;
  const mode=source.getAttribute('aria-live')||(source.getAttribute('role')==='alert'?'assertive':'polite');
  if(mode==='off')continue;
  const announcer=document.createElement('div');announcer.dataset.vocabSkip='';
  announcer.className='vocab-announcer';announcer.setAttribute('aria-live',mode);announcer.setAttribute('aria-atomic','true');
  announcer.style.cssText='position:fixed;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap;pointer-events:none';
  source.setAttribute('aria-live','off');
  if(['status','alert'].includes(source.getAttribute('role')))source.removeAttribute('role');
  document.body.append(announcer);liveSources.set(source,{announcer,text:''});
 }
}
function syncAnnouncements(){
 for(const [source,entry]of liveSources){
  if(!source.isConnected){entry.announcer.remove();liveSources.delete(source);continue;}
  const text=visible(source)?source.textContent.trim():'';
  if(text!==entry.text){entry.text=text;entry.announcer.textContent=text;}
 }
}
function annotate(){
 prepareAnnouncements();
 if(anchor&&!visible(anchor))close();
 const nodes=[],walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT,{acceptNode:n=>{
  const p=n.parentElement;if(!p||!n.data.trim()||p.closest('script,style,svg,canvas,textarea,input,option,button,[role=button],a,label,summary,.vocab-term,#vocab-popover,[data-vocab-skip]'))return NodeFilter.FILTER_REJECT;
  pattern.lastIndex=0;return pattern.test(n.data)?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT;
 }});while(walker.nextNode())nodes.push(walker.currentNode);
 for(const n of nodes){if(!n.isConnected)continue;const label=n.parentElement.closest('label');if(label?.control&&!label.control.hasAttribute('aria-label'))label.control.setAttribute('aria-label',label.textContent.trim());pattern.lastIndex=0;const matches=[...n.data.matchAll(pattern)],frag=document.createDocumentFragment();let end=0;
  for(const m of matches){frag.append(document.createTextNode(n.data.slice(end,m.index)));const term=document.createElement('span');term.className='vocab-term';term.dataset.vocabKey=aliases.get(normalize(m[0]));term.textContent=m[0];const control=n.parentElement.closest('button,a');if(!control){term.tabIndex=0;term.setAttribute('role','button');term.setAttribute('aria-label',strings.explain(m[0]));}if(!control){term.setAttribute('aria-controls','vocab-popover');term.setAttribute('aria-expanded','false');}frag.append(term);end=m.index+m[0].length;}
  frag.append(document.createTextNode(n.data.slice(end)));n.replaceWith(frag);
 }
 syncAnnouncements();
}
const observer=new MutationObserver(()=>{if(scheduled)return;scheduled=true;queueMicrotask(()=>{scheduled=false;annotate();});});observer.observe(document.body,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['hidden','inert','class','data-screen']});
document.addEventListener('pointerover',e=>{if(e.pointerType!=='mouse')return;const term=e.target.closest('.vocab-term');if(term)open(term);else if(popup.contains(e.target))clearTimeout(leaveTimer);});
document.addEventListener('pointerout',e=>{if(e.pointerType==='mouse'&&(e.target.closest('.vocab-term')||popup.contains(e.target)))laterClose();});
document.addEventListener('pointerdown',e=>{if(anchor&&!popup.contains(e.target)&&!e.target.closest('.vocab-term'))close();},true);
document.addEventListener('click',e=>{const term=e.target.closest('.vocab-term');if(!term)return;e.preventDefault();e.stopImmediatePropagation();activate(term);},true);
document.addEventListener('focusin',e=>{if(restoringFocus)return;const term=e.target.closest('.vocab-term')||e.target.closest('button,a')?.querySelector('.vocab-term');if(term&&e.target.matches(':focus-visible'))open(term);else if(!popup.contains(e.target)&&!e.target.closest('.vocab-term'))close();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&anchor){e.preventDefault();e.stopImmediatePropagation();close(true);return;}const term=e.target.closest('.vocab-term');if(term&&!term.closest('button,a')&&(e.key==='Enter'||e.key===' ')){e.preventDefault();e.stopPropagation();activate(term);}},true);
popup.querySelector('button').onclick=()=>close(true);
addEventListener('resize',()=>{if(anchor){if(visible(anchor))position();else close();}});document.addEventListener('scroll',()=>{if(anchor)position();},true);
window.learningVocabulary={refresh:annotate,close,definitions:()=>Object.fromEntries(definitions)};annotate();
})();
