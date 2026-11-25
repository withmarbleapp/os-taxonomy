import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';
import assert from 'node:assert/strict';

// Exercise the helper's actual lexicon/matcher setup without requiring a DOM.
const source=readFileSync(new URL('./vocabulary.js',import.meta.url),'utf8');
function matcher(entries){
 const context={window:{learningVocabularyOptions:{entries}}};
 vm.runInNewContext(source.slice(0,source.indexOf('const style='))+
  ';window.match=text=>[...text.matchAll(pattern)].map(m=>({text:m[0],index:m.index,key:aliases.get(normalize(m[0]))}));})();',context);
 return text=>JSON.parse(JSON.stringify(context.window.match(text)));
}

test('all mixed composed/decomposed accents preserve text and resolve definitions',()=>{
 const word='électricité';
 const match=matcher([['electricity',[word],'Une forme d’énergie.']]);
 const chars=[...word],positions=chars.flatMap((char,i)=>char!==char.normalize('NFD')?[i]:[]);
 for(let mask=0;mask<2**positions.length;mask++){
  const spelling=chars.map((char,i)=>{
   const bit=positions.indexOf(i);
   return bit>=0&&(mask&(1<<bit))?char.normalize('NFD'):char;
  }).join('');
  for(const visible of [spelling,spelling.toUpperCase()]){
   assert.deepEqual(match('Voici '+visible+' !'),[{text:visible,index:6,key:'electricity'}]);
  }
 }
});

test('mixed accent phrases accept either apostrophe, without matching inside words',()=>{
 const match=matcher([['force',["résistance de l’électricité"],'Une définition.']]);
 for(const apostrophe of ["'",'’']){
  const phrase='re\u0301sistance de l'+apostrophe+'électricite\u0301';
  assert.deepEqual(match(phrase),[{text:phrase,index:0,key:'force'}]);
  assert.deepEqual(match('x'+phrase+' '+phrase+'x'),[]);
 }
});

test('English defaults, literal aliases and empty lexicons',()=>{
 assert.equal(matcher(undefined)('photons and cubic units').length,2);
 assert.deepEqual(matcher([['literal',['a+b'],'Literal']])('a+b aaab'),[{text:'a+b',index:0,key:'literal'}]);
 assert.deepEqual(matcher([])('gravité photons'),[]);
});

test('Arabic terms match across tashkeel, tatweel and definite/clitic prefixes while preserving visible text',()=>{
 const match=matcher([
  ['photon',['فوتون','فوتونات'],'حزمة صغيرة من طاقة الضوء.'],
  ['scattering',['تشتت'],'تغير اتجاه الضوء عند اصطدامه بجسيمات الهواء.']
 ]);
 const text='ينتقل الفُوتُون في الهواء ويحدث تَشَتُّت للفوتونات بِالفوتون.';
 assert.deepEqual(match(text),[
  {text:'الفُوتُون',index:6,key:'photon'},
  {text:'تَشَتُّت',index:32,key:'scattering'},
  {text:'للفوتونات',index:41,key:'photon'},
  {text:'بِالفوتون',index:51,key:'photon'}
 ]);
});
