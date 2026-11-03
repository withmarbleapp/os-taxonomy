// Run against the local player with installed speech models. No inference calls.
import { chrome } from './cdp.mjs';
const browser = await chrome();
try {
  await browser.send('Page.navigate', {
    url:
      process.argv[2] ??
      (() => {
        throw Error('Pass the running Marble URL');
      })(),
  });
  await browser.until('document.readyState === "complete"');
  console.log(
    await browser.evaluate(`(async()=>{
 const {BrowserSpeech}=await import('/voice/browser-speech.mjs');
 const {SpeechOutput}=await import('/voice/speech-output.mjs');
 const realWarm=SpeechOutput.prototype.warm;
 SpeechOutput.prototype.warm=async()=>{};
 window.voiceProbe=new BrowserSpeech();window.voiceMetrics=[];
 voiceProbe.onMetric=m=>voiceMetrics.push(m);
 await voiceProbe.load();SpeechOutput.prototype.warm=realWarm;
 return {ready:voiceProbe.ready};
 })()`),
  );
  console.log(
    await browser.evaluate(`(async()=>{
 await voiceProbe.speak('A layer is one flat group of cubes.');
 await voiceProbe.output.warm();
 await voiceProbe.speak('A layer is one flat group of cubes.');
 const {createSpeechQueue}=await import('/runtime/speech-stream.mjs');
 const c=new AbortController();const speak=(text,signal,{prepared})=>voiceProbe.speak(text,signal,prepared);
 speak.prepare=(text,signal)=>voiceProbe.prepare(text,signal);
 const queue=createSpeechQueue({speak,signal:c.signal});
 await queue.finish('A layer is one flat group of cubes. We can count the layers together.');
 voiceProbe.dispose();return voiceMetrics;
 })()`),
  );
  if (browser.errors.length) throw Error(browser.errors.join('\n'));
} finally {
  await browser.close();
}
