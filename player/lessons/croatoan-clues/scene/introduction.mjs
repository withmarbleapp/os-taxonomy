import {landPath} from './world-land.mjs';
import {icon} from './art.mjs';
import {archipelagoArt as mapArt,fortIllustration as fortArt,voyageShip as ship} from './illustrations.mjs';
import {introduction,storyEvents} from '../model/introduction.mjs';

// Illustrative travel, not a reconstruction of the fleet's actual sailing route.
export const voyagePoint=t=>{const u=1-t;return [u*u*u*175+3*u*u*t*164+3*u*t*t*126+t*t*t*104.29,u*u*u*39.9+3*u*u*t*58+3*u*t*t*67+t*t*t*54.06];};
const pauseGlyph='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14M16 5v14"/></svg>';
const ease=t=>t*t*(3-2*t),clamp=t=>Math.max(0,Math.min(1,t));
const mix=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*ease(clamp(t)));
const camera=(cx,cy,width,aspect,anchor=.5)=>[cx-width/2,cy-width/aspect*anchor,width,width/aspect];
const zoom=(a,b,t)=>{t=ease(clamp(t));const width=a[2]*Math.pow(b[2]/a[2],t),height=a[3]*Math.pow(b[3]/a[3],t),cx=a[0]+a[2]/2+(b[0]+b[2]/2-a[0]-a[2]/2)*t,cy=a[1]+a[3]/2+(b[1]+b[3]/2-a[1]-a[3]/2)*t;return[cx-width/2,cy-height/2,width,height];};
function worldArt(){return `<defs><path id="story-land" vector-effect="non-scaling-stroke" stroke-linejoin="round" d="${landPath}"/><clipPath id="story-land-clip"><use href="#story-land"/></clipPath><pattern id="story-water" width="28" height="22" patternUnits="userSpaceOnUse"><path d="M5 9q3-1.6 6 0t6 0M19 19q2-1.2 4 0" fill="none" stroke="#e8ead0" stroke-width=".5" stroke-linecap="round" opacity=".42"/></pattern></defs><rect x="-2000" y="-2000" width="4400" height="4400" fill="#86b2b4"/><rect x="-2000" y="-2000" width="4400" height="4400" fill="url(#story-water)"/><g transform="translate(0 1.7)"><use href="#story-land" fill="#5d8277" stroke="#293d39" stroke-width="2" vector-effect="non-scaling-stroke"/></g><use href="#story-land" fill="#94a67a" stroke="#e7d7a6" stroke-width="5" stroke-linejoin="round" vector-effect="non-scaling-stroke"/><g clip-path="url(#story-land-clip)"><use href="#story-land" transform="translate(-.6 -1.6)" fill="#bbc58b"/><path d="M36 33q26 8 50-2l27 16-16 11-39-6zM167 69q23-5 40 4l-11 19-28-2zM245 26l40 4 5 8-33 3zM100 110l19 10 2 14-11-1z" fill="#a4b37b"/></g><use href="#story-land" fill="none" stroke="#293d39" stroke-width="1.6" stroke-linejoin="round" vector-effect="non-scaling-stroke"/><path id="story-route" d="M175 39.9C164 58 126 67 104.29 54.06" fill="none" stroke="#fff6d8" stroke-width="3" stroke-linecap="round" stroke-dasharray=".8 1.5" vector-effect="non-scaling-stroke" opacity="0"/>`;}
const sentence={where:'A small island on North America’s Atlantic coast.',arrival:'Families arrive. White sails home for supplies.',delay:'Three years pass before White can return.',return:'The settlement is empty. A carved word remains.'};
export function createIntroduction({container,onNavigate,onLeave,onReplay}){
 container.innerHTML=`<div class="story-map" aria-label="Illustrated map and voyage"><svg class="story-world" role="img" aria-label="World map showing England and Roanoke on the Atlantic coast of North America">${worldArt()}</svg><svg class="story-coast" role="img" aria-label="Illustrated Roanoke Island, Croatoan and the mainland"></svg><svg class="story-fort" role="img" aria-label="Illustration of the empty settlement in 1590">${fortArt()}</svg><div class="story-place roanoke" data-location="roanoke"><span class="place-dot"></span><button type="button" data-map-focus="coast">Roanoke <span aria-hidden="true">↗</span></button></div><div class="story-place england" data-location="england"><span class="place-dot"></span><span class="place-name">England</span></div><span class="story-ocean" aria-hidden="true">Atlantic Ocean</span><span class="story-continent" aria-hidden="true">North America</span><div class="story-boat" aria-hidden="true"><svg viewBox="-62 -80 124 112"><g class="boat-bob">${ship(0,0,1.15)}</g></svg></div><div class="story-word" hidden>CROATOAN</div></div><div class="story-wash" aria-hidden="true"></div><div class="story-copy"><span class="intro-date"></span><p class="story-instruction"></p><p class="story-location">Present-day North Carolina, USA</p></div><button type="button" class="scene-button story-skip" data-leave-intro aria-label="Skip the introduction">${icon('arrow')} Skip intro</button><nav class="intro-timeline" aria-label="Events in the opening"></nav><div class="intro-controls"><button type="button" class="scene-button story-back" aria-label="Previous part">${icon('back')}</button><button type="button" class="scene-button" data-replay-intro aria-label="Replay this part">${icon('again')}</button><button type="button" class="scene-button story-motion" aria-label="Pause map motion" aria-pressed="false">${pauseGlyph}</button><button type="button" class="scene-button intro-next"></button></div>`;
 const $=s=>container.querySelector(s),world=$('.story-world'),coast=$('.story-coast'),fort=$('.story-fort'),boat=$('.story-boat'),motion=matchMedia('(prefers-reduced-motion: reduce)');
 let current='',raf=0,started=0,elapsed=0,paused=false,manualCoast=false,active=false,worldBox,coastBox,fortBox,phase='world';
 const stop=()=>{cancelAnimationFrame(raf);raf=0;};
 function project(point,box){const r=container.getBoundingClientRect();return[(point[0]-box[0])/box[2]*r.width,(point[1]-box[1])/box[3]*r.height];}
 function place(el,point,box,visible=true){el.hidden=!visible;if(!visible)return;const[x,y]=project(point,box);el.style.left=x+'px';el.style.top=y+'px';}
 function paint(ms){
  const r=container.getBoundingClientRect(),aspect=r.width/Math.max(1,r.height),mobile=r.width<800,t=ms/1000,reduced=motion.matches;
  const initial=(mobile?camera(140,62,220,aspect):camera(180,82,Math.max(410,200*aspect),aspect)),atlantic=camera(140,52,mobile?130:178,aspect),close=camera(104.29,54.06,mobile?9:16,aspect),region=camera(mobile?505:490,mobile?300:320,mobile?760:1100,aspect),regionNear=camera(474,214,mobile?270:370,aspect),fortFar=camera(500,350,mobile?820:1100,aspect),fortNear=camera(mobile?390:490,340,mobile?650:1000,aspect);
  let wo=1,co=0,fo=0,progress=0,boatPoint=voyagePoint(0),boatBox;
  worldBox=initial;coastBox=region;fortBox=fortNear;
  if(current==='where'){
   if(manualCoast){worldBox=zoom(initial,close,clamp(t/2));co=clamp((t-1.2)/.7);wo=1-co;coastBox=zoom(regionNear,region,clamp((t-1.2)/1.5));if(reduced){wo=0;co=1;coastBox=region;}}
  }else if(current==='arrival'||current==='return'){
   const q=current==='return'?t*2:t;
   progress=clamp((q-.6)/5.2);boatPoint=voyagePoint(progress);worldBox=q<5.8?zoom(initial,atlantic,clamp(q/1.5)):zoom(atlantic,close,clamp((q-5.8)/2.1));
   co=clamp((q-7)/1.1);wo=1-co;coastBox=zoom(regionNear,region,clamp((q-7)/2));
   if(co>.55){boatPoint=mix([650,380],[620,365],clamp((q-7.5)/2.4));boatBox=coastBox;}
   if(current==='return'&&q>10){fo=clamp((q-10.6)/1.1);co=1-fo;coastBox=zoom(region,regionNear,clamp((q-10)/1.4));fortBox=zoom(fortFar,fortNear,clamp((q-10.6)/1.8));}
   if(reduced){wo=0;co=current==='arrival'?1:0;fo=current==='return'?1:0;coastBox=region;boatPoint=[620,365];boatBox=coastBox;progress=1;}
  }else if(current==='delay'){
   worldBox=zoom(initial,atlantic,clamp(t/1.4));progress=clamp((t-.5)/5);boatPoint=voyagePoint(1-progress);if(reduced){worldBox=atlantic;progress=1;boatPoint=voyagePoint(0);}
  }
  if(reduced&&current==='where'&&!manualCoast)worldBox=initial;
  world.setAttribute('viewBox',worldBox.join(' '));coast.setAttribute('viewBox',coastBox.join(' '));fort.setAttribute('viewBox',fortBox.join(' '));world.style.opacity=wo;coast.style.opacity=co;fort.style.opacity=fo;
  phase=fo>.5?'fort':co>.5?'coast':'world';container.dataset.mapScale=phase;container.dataset.transitioning=String(!reduced&&!paused&&t<(current==='where'?(manualCoast?3:0):current==='return'?6.4:current==='delay'?5.5:10));
  const route=$('#story-route');route.style.opacity=current!=='where'&&wo>.4?'.9':'0';
  place($('.roanoke'),phase==='coast'?[474,214]:[104.29,54.06],phase==='coast'?coastBox:worldBox,fo<.4&&co<.3&&(current!=='where'||!manualCoast||t<.9));
  place($('.england'),[178.5,38],worldBox,wo>.85);
  place($('.story-ocean'),[140,75],worldBox,wo>.9&&worldBox[2]>80);
  place($('.story-continent'),[73,37],worldBox,false);
  place(boat,boatPoint,boatBox??worldBox,current!=='where'&&fo<.5);if((current==='arrival'||current==='return')&&co>0&&co<1&&!reduced){const q=current==='return'?t*2:t,a=project(voyagePoint(progress),worldBox),b=project(mix([650,380],[620,365],clamp((q-7.5)/2.4)),coastBox),p=mix(a,b,co);boat.style.left=p[0]+'px';boat.style.top=p[1]+'px';}boat.classList.toggle('homeward',current==='delay');
  $('.story-word').hidden=fo<.75;$('.story-location').hidden=current!=='where';
 }
 function frame(now){if(!active||paused||document.hidden)return;elapsed=now-started;paint(elapsed);const limit=current==='where'?(manualCoast?3200:0):current==='return'?6600:current==='delay'?5800:10400;if(elapsed<limit&&!motion.matches)raf=requestAnimationFrame(frame);}
 function restart(){stop();elapsed=paused?(current==='where'?(manualCoast?3200:0):current==='return'?6600:current==='delay'?5800:10400):0;started=performance.now()-elapsed;paint(elapsed);if(!paused&&!motion.matches)raf=requestAnimationFrame(frame);}
 function setPause(value){paused=value;container.dataset.motionPaused=String(value);$('.story-motion').setAttribute('aria-pressed',String(value));$('.story-motion').setAttribute('aria-label',value?'Resume map motion':'Pause map motion');$('.story-motion').innerHTML=value?icon('arrow'):pauseGlyph;if(value)stop();else{started=performance.now()-elapsed;raf=requestAnimationFrame(frame);}}
 container.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.intro){onNavigate(b.dataset.intro);return;}if(b.hasAttribute('data-leave-intro')){onLeave();return;}if(b.hasAttribute('data-replay-intro')){manualCoast=false;restart();onReplay();}if(b.classList.contains('story-back')){const i=introduction.findIndex(x=>x.id===current);if(i>0)onNavigate(introduction[i-1].id);}if(b.classList.contains('story-motion'))setPause(!paused);if(b.hasAttribute('data-map-focus')&&current==='where'){manualCoast=true;restart();}});
 new ResizeObserver(()=>{if(active)paint(elapsed);}).observe(container);
 motion.addEventListener('change',()=>{if(active)restart();});
 document.addEventListener('visibilitychange',()=>{if(!active)return;if(document.hidden)stop();else if(!paused){started=performance.now()-elapsed;raf=requestAnimationFrame(frame);}});
 return {update(state,cover){active=!cover&&state.introduction.active;container.hidden=!active;if(!active){stop();current='';if(cover){paused=false;container.dataset.motionPaused='false';$('.story-motion').setAttribute('aria-pressed','false');$('.story-motion').setAttribute('aria-label','Pause map motion');$('.story-motion').innerHTML=pauseGlyph;}return;}const beat=state.introduction.beat;if(current===beat)return;current=beat;container.dataset.beat=beat;manualCoast=false;const i=introduction.findIndex(x=>x.id===beat),item=introduction[i];
  $('.intro-date').textContent=beat==='where'?'Where on Earth?':item.date;$('.story-instruction').textContent=sentence[beat];
  $('.intro-timeline').hidden=beat==='where';$('.intro-timeline').innerHTML=storyEvents.map(event=>`<button type="button" data-intro="${event.beat}" aria-current="${event.beat===beat?'step':'false'}"><span class="event-dot"></span><b>${event.date}</b><span>${event.label}</span></button>`).join('');
  $('.story-back').hidden=i===0;const next=$('.intro-next');next.innerHTML=icon('arrow')+'<span>'+item.next+'</span>';next.removeAttribute('data-intro');next.removeAttribute('data-leave-intro');next.setAttribute(i===introduction.length-1?'data-leave-intro':'data-intro',i===introduction.length-1?'':introduction[i+1].id);
  coast.innerHTML=mapArt({settled:beat==='arrival'});$('.story-motion').hidden=motion.matches;restart();
 },presentation:()=>({scale:phase,transitioning:container.dataset.transitioning==='true',motionPaused:paused,reducedMotion:motion.matches,illustrativeRoute:true})};
}
