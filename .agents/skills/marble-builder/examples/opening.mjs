// Shared question-led opening UI. Each experience supplies its own illustrated scene.
export function createOpening({question,dark=false,onStart,focusTarget,startLabel='Let’s find out'}){
 const style=document.createElement('style');style.textContent=`
 body.question-cover-open :is(header,aside:not(#vocab-popover),#progress,#dots,#controls,#scene-actions,#restart,#reset,#choices,#actions,#worldChoices,#waveControls,#sunHandle,#earth,#sun,#moon,#observer,#eye,#lookTools,#next,#hint,#extra,#feedbackToast,#moonLocator){visibility:hidden!important;pointer-events:none!important}
 #opening-screen{position:fixed;inset:0;z-index:30;overflow:hidden;font-family:'Baloo 2','Readex Pro','Geeza Pro','SF Arabic','Arial',sans-serif;color:#253e38;background:linear-gradient(90deg,#f8f5eb 0%,#f8f5ebf2 27%,#f8f5eb00 61%)}
 #opening-screen[hidden]{display:none!important}#opening-screen.dark{color:#fff1d4;background:linear-gradient(90deg,#07101f 0%,#07101ff2 27%,#07101f00 61%)}
 @media(min-width:801px){[dir="rtl"] #opening-screen{background:linear-gradient(270deg,#f8f5eb 0%,#f8f5ebf2 27%,#f8f5eb00 61%)}[dir="rtl"] #opening-screen.dark{background:linear-gradient(270deg,#07101f 0%,#07101ff2 27%,#07101f00 61%)}}
 #opening-copy{position:absolute;inset-inline-start:7%;top:27%;width:41%;max-width:620px}
 #opening-question{font:550 clamp(50px,5.6vw,80px)/1.04 'Baloo 2','Readex Pro','Geeza Pro','SF Arabic','Arial',sans-serif;letter-spacing:-1.6px;margin:0;text-wrap:balance;color:inherit}
 [dir="rtl"] #opening-question{letter-spacing:0;line-height:1.18}
 #opening-start{display:inline-flex;align-items:center;justify-content:center;gap:10px;margin-top:32px;min-height:58px;padding:13px 23px;border:2px solid #8b0023;border-radius:22px;background:#f42324;color:white;box-shadow:0 5px 0 #8b0023;font:500 20px 'Baloo 2','Readex Pro','Geeza Pro','SF Arabic','Arial',sans-serif;cursor:pointer;touch-action:manipulation;transform:none}
 #opening-start svg{width:24px;height:24px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;flex:none}
 [dir="rtl"] #opening-start svg{transform:scaleX(-1)}
 #opening-start:hover{background:#d61922;translate:0 -2px}#opening-start:active{translate:0 3px;box-shadow:0 2px 0 #8b0023}#opening-start:focus-visible{outline:4px solid #774dc7;outline-offset:6px}
 @media(max-width:800px){#opening-copy{left:24px;right:24px;top:8%;width:auto;max-width:650px}#opening-question{font-size:clamp(35px,9.8vw,58px);line-height:1.04;letter-spacing:-1px}#opening-start{position:fixed;bottom:44px;left:50%;translate:-50% 0;margin:0;white-space:nowrap;font-size:18px}#opening-start:hover{translate:-50% -2px}#opening-start:active{translate:-50% 3px}#opening-screen{background:linear-gradient(180deg,#f8f5eb 0%,#f8f5ebee 17%,#f8f5eb00 38%,#f8f5eb00 81%,#f8f5eb 98%)}#opening-screen.dark{background:linear-gradient(180deg,#07101f 0%,#07101fee 17%,#07101f00 38%,#07101f00 81%,#07101f 98%)}}
 @media(max-height:600px) and (min-width:801px){#opening-copy{top:16%}#opening-question{font-size:46px}#opening-start{margin-top:22px;min-height:50px}}
 @media(prefers-reduced-motion:reduce){#opening-start{transition:none!important}}
 `;document.head.append(style);
 const root=document.createElement('section');root.id='opening-screen';root.hidden=true;root.className=dark?'dark':'';root.setAttribute('aria-labelledby','opening-question');
 root.innerHTML='<div id="opening-copy"><h1 id="opening-question"></h1><button id="opening-start" type="button"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h15m-6-6 6 6-6 6"/></svg><span></span></button></div>';
 root.querySelector('h1').textContent=question;root.querySelector('#opening-start span').textContent=startLabel;document.body.append(root);
 let muted=[],hasShown=false;
 function show(focus=false){
  if(root.hidden){muted=[...document.querySelectorAll('header,aside:not(#vocab-popover),#world,#progress,#dots,#controls,#scene-actions,#restart,#reset,#choices,#actions,#worldChoices,#waveControls,#sunHandle,#earth,#sun,#moon,#observer,#eye,#lookTools,#next,#hint,#extra,#feedbackToast,#moonLocator')].map(el=>({el,inert:el.inert}));for(const {el}of muted)el.inert=true;}
  document.body.classList.add('question-cover-open');root.hidden=false;if(focus&&hasShown)root.querySelector('button').focus({preventScroll:true});hasShown=true;
 }
 root.querySelector('button').onclick=()=>{if(root.hidden)return;root.hidden=true;document.body.classList.remove('question-cover-open');for(const {el,inert}of muted)el.inert=inert;muted=[];onStart();document.querySelector(focusTarget)?.focus({preventScroll:true});};
 return {show,get isOpen(){return !root.hidden;}};
}
