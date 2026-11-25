import test from 'node:test';
import assert from 'node:assert/strict';
import { freshProfile, STORAGE_KEY } from '../app/state.js';
function fixture(voice=true,hero='pirate',withHistory=false) {
 const profile=freshProfile();profile.onboarded=true;profile.hero=hero;
 profile.session={level:0,beginnerStage:0,index:0,results:[],attempts:0,rejected:[],overrides:{}};
 const memory=new Map([[STORAGE_KEY,JSON.stringify(profile)]]),listeners={},spoken=[];
 const app={innerHTML:'',addEventListener(n,h){listeners[n]=h;}};
 globalThis.SpeechSynthesisUtterance=class{constructor(text){this.text=text;}};
 globalThis.speechSynthesis={cancel(){},getVoices:()=>[{lang:'fr-FR'}],speak(u){spoken.push(u);}};
 globalThis.window=voice?{speechSynthesis,SpeechSynthesisUtterance}:{};
 const entries=[],historyListeners={},focused=[],scrolled=[];let historyIndex=-1;
 if(withHistory)Object.assign(window,{addEventListener:(name,handler)=>historyListeners[name]=handler,history:{
  replaceState(state){entries[historyIndex<0?++historyIndex:historyIndex]=structuredClone(state);},
  pushState(state){entries.splice(historyIndex+1);entries[++historyIndex]=structuredClone(state);},
  back(){if(historyIndex>0)historyListeners.popstate({state:structuredClone(entries[--historyIndex])});}
 }});
 globalThis.localStorage={getItem:k=>memory.get(k),setItem:(k,v)=>memory.set(k,v)};
 globalThis.document={documentElement:{style:{setProperty(){}}},body:{dataset:{}},addEventListener(){},querySelector(s){return s==='#app'?app:s==='dialog[open]'?null:{focus(){focused.push(s);},scrollIntoView(options){scrolled.push({selector:s,...options});}};}};
 return {app,spoken,focused,scrolled,entries,saved:()=>JSON.parse(memory.get(STORAGE_KEY)),click(action,command,value){listeners.click({target:{closest:()=>({dataset:{action,command,value}})},preventDefault(){}});}};
}
test('Apprendre écoute les cartes et conserve la mission ; une panne audio désactive les réponses',async()=>{
 const f=fixture();await import('../app/app.js?discovery-controller');const original=f.saved();
 assert.match(f.app.innerHTML,/data-action="discover"/);
 f.click('discover');assert.match(f.app.innerHTML,/<h1>Apprendre<\/h1>/);f.click('discover-action','letters');f.click('discover-action','letter','b');
 assert.equal(f.spoken.at(-1).text,'bé');
 f.click('discover-action','families');f.click('discover-action','syllable','ma');f.click('discover-action','word','w-maman');
 assert.equal(f.spoken.at(-1).text,'maman');
 f.click('discover-action','quiz');f.spoken.at(-1).onerror({error:'language-unavailable'});
 assert.match(f.app.innerHTML,/La lecture audio a échoué/);assert.match(f.app.innerHTML,/disabled/);
 assert.doesNotMatch(f.app.innerHTML,/Ouvrez le site dans le navigateur principal/);
 f.click('retry-page-audio');f.spoken.at(-1).onstart();
 assert.doesNotMatch(f.app.innerHTML,/La lecture audio a échoué|Le son n’a pas démarré/);
 f.click('discovery-home');assert.match(f.app.innerHTML,/Continuer/);
 assert.deepEqual(f.saved().session,original.session);assert.deepEqual(f.saved().exerciseHistory,original.exerciseHistory);assert.equal(f.saved().completed,original.completed);
});
test('sans synthèse vocale le quiz indique l’indisponibilité et attend une écoute',async()=>{
 const f=fixture(false);await import('../app/app.js?discovery-no-voice');f.click('discover');f.click('discover-action','quiz');
 assert.match(f.app.innerHTML,/voix n’est pas disponible/);assert.match(f.app.innerHTML,/disabled/);
 assert.match(f.app.innerHTML,/Messenger.*Chrome sur Android/);
});

test('le compagnon choisi encourage puis félicite et disparaît au mot suivant',async()=>{
 const f=fixture();await import('../app/app.js?discovery-companion');f.click('discover');f.click('discover-action','quiz');
 assert.ok(!f.app.innerHTML.includes('discovery-companion-feedback'));
 const targetText=f.spoken.at(-1).text;
 const {discoveryWords}=await import('../app/discovery-data.js');
 const target=discoveryWords.find(word=>word.text===targetText).id;
 const choices=[...f.app.innerHTML.matchAll(/data-command="quiz-answer" data-value="([^"]+)"/g)].map(match=>match[1]);
 f.click('discover-action','quiz-answer',choices.find(id=>id!==target));
 assert.match(f.app.innerHTML,/companion-support/);assert.match(f.app.innerHTML,/Malo t’encourage à réessayer/);
 f.click('discover-action','quiz-answer',target);
 assert.match(f.app.innerHTML,/companion-cheer/);assert.match(f.app.innerHTML,/Malo te félicite/);
 assert.match(f.app.innerHTML,/Malo, le pirate/);
 f.click('discover-action','quiz-next');assert.ok(!f.app.innerHTML.includes('discovery-companion-feedback'));
});

test('les six mots de la syllabe ma sont tous écoutables, y compris les nouveaux exemples',async()=>{
 const f=fixture();await import('../app/app.js?discovery-six-words');
 f.click('discover');f.click('discover-action','families');f.click('discover-action','syllable','ma');
 const {wordsForSyllable}=await import('../app/discovery-data.js');
 assert.equal((f.app.innerHTML.match(/data-command="word"/g)||[]).length,6);
 for(const word of wordsForSyllable('ma')) {
   f.click('discover-action','word',word.id);assert.equal(f.spoken.at(-1).text,word.text);
 }
});

test('les nouveaux compagnons encouragent aussi dans Apprendre',async()=>{
 for(const [id,name] of [['mermaid','Naya'],['dragon','Pico']]){
  const f=fixture(true,id);await import('../app/app.js?discovery-new-companion-'+id);
  f.click('discover');f.click('discover-action','quiz');
  const targetText=f.spoken.at(-1).text;
  const {discoveryWords}=await import('../app/discovery-data.js');
  const target=discoveryWords.find(word=>word.text===targetText).id;
  const options=[...f.app.innerHTML.matchAll(/data-command="quiz-answer" data-value="([^"]+)"/g)].map(match=>match[1]);
  f.click('discover-action','quiz-answer',options.find(value=>value!==target));
  assert.ok(f.app.innerHTML.includes(name+' t’encourage'));assert.match(f.app.innerHTML,/companion-support/);
  f.click('discover-action','quiz-answer',target);assert.ok(f.app.innerHTML.includes(name+' te félicite'));assert.match(f.app.innerHTML,/companion-cheer/);
 }
});


test('deux clics depuis Apprendre donnent les mots ; les syllabes changent en un clic sans toucher la mission',async()=>{
 const f=fixture();await import('../app/app.js?discovery-short-path');const original=f.saved();
 f.click('discover');f.click('discover-action','families');
 assert.match(f.app.innerHTML,/data-command="syllable" data-value="ma"/);
 f.click('discover-action','syllable','ma');
 assert.equal(f.spoken.at(-1).text,'ma');assert.equal((f.app.innerHTML.match(/data-command="word"/g)||[]).length,6);
 f.click('discover-action','syllable','mi');
 assert.equal(f.spoken.at(-1).text,'mi');assert.match(f.app.innerHTML,/<mark>mi<\/mark>/);
 assert.equal((f.app.innerHTML.match(/data-command="word"/g)||[]).length,6);
 assert.deepEqual(f.saved(),original);
});

test('le retour avec historique retrouve la dernière syllabe et sa série ouverte',async()=>{
 const f=fixture(true,'pirate',true);await import('../app/app.js?discovery-history-return');
 f.click('discover');f.click('discover-action','families');
 f.click('discover-action','syllable-initial','b');
 assert.deepEqual(f.scrolled.at(-1),{selector:'[data-command="syllable-initial"][data-value="b"]',block:'start'});
 f.click('discover-action','syllable','ba');
 const historyLength=f.entries.length;
 f.click('discover-action','syllable','bi');
 assert.equal(f.entries.length,historyLength);
 f.click('discover-action','back');
 assert.match(f.app.innerHTML,/class="discovery-screen discovery-syllables"/);
 assert.match(f.app.innerHTML,/data-value="b"[^>]*aria-expanded="true"/);
 assert.equal(f.focused.at(-1),'[data-command="syllable"][data-value="bi"]');
 assert.equal((f.app.innerHTML.match(/aria-expanded="true"/g)||[]).length,1);
 f.click('discover-action','back');assert.match(f.app.innerHTML,/class="discovery-screen discovery-hub"/);
});
