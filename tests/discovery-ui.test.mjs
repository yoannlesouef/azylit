import test from 'node:test';
import assert from 'node:assert/strict';
import { freshProfile, STORAGE_KEY } from '../app/state.js';
function fixture(voice=true) {
 const profile=freshProfile();profile.onboarded=true;profile.hero='pirate';
 profile.session={level:0,beginnerStage:0,index:0,results:[],attempts:0,rejected:[],overrides:{}};
 const memory=new Map([[STORAGE_KEY,JSON.stringify(profile)]]),listeners={},spoken=[];
 const app={innerHTML:'',addEventListener(n,h){listeners[n]=h;}};
 globalThis.SpeechSynthesisUtterance=class{constructor(text){this.text=text;}};
 globalThis.speechSynthesis={cancel(){},getVoices:()=>[{lang:'fr-FR'}],speak(u){spoken.push(u);}};
 globalThis.window=voice?{speechSynthesis,SpeechSynthesisUtterance}:{};
 globalThis.localStorage={getItem:k=>memory.get(k),setItem:(k,v)=>memory.set(k,v)};
 globalThis.document={documentElement:{style:{setProperty(){}}},body:{dataset:{}},addEventListener(){},querySelector(s){return s==='#app'?app:s==='dialog[open]'?null:{focus(){}};}};
 return {app,spoken,saved:()=>JSON.parse(memory.get(STORAGE_KEY)),click(action,command,value){listeners.click({target:{closest:()=>({dataset:{action,command,value}})},preventDefault(){}});}};
}
test('Découvrir écoute les cartes et conserve la mission ; une panne audio désactive les réponses',async()=>{
 const f=fixture();await import('../app/app.js?discovery-controller');const original=f.saved();
 assert.match(f.app.innerHTML,/data-action="discover"/);
 f.click('discover');f.click('discover-action','letters');f.click('discover-action','letter','b');
 assert.equal(f.spoken.at(-1).text,'bé');
 f.click('discover-action','families');f.click('discover-action','syllable','ma');f.click('discover-action','word','w-maman');
 assert.equal(f.spoken.at(-1).text,'maman');
 f.click('discover-action','quiz');f.spoken.at(-1).onerror({error:'language-unavailable'});
 assert.match(f.app.innerHTML,/voix n’est pas disponible/);assert.match(f.app.innerHTML,/disabled/);
 f.click('discover-action','quiz-listen');assert.ok(!f.app.innerHTML.includes('voix n’est pas disponible'));
 f.click('discovery-home');assert.match(f.app.innerHTML,/Continuer/);
 assert.deepEqual(f.saved().session,original.session);assert.deepEqual(f.saved().exerciseHistory,original.exerciseHistory);assert.equal(f.saved().completed,original.completed);
});
test('sans synthèse vocale le quiz indique l’indisponibilité et attend une écoute',async()=>{
 const f=fixture(false);await import('../app/app.js?discovery-no-voice');f.click('discover');f.click('discover-action','quiz');
 assert.match(f.app.innerHTML,/voix n’est pas disponible/);assert.match(f.app.innerHTML,/disabled/);
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
