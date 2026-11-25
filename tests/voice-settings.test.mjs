import test from 'node:test';
import assert from 'node:assert/strict';
import {renderVoiceSettings,voiceOptions,bindVoiceSettings} from '../app/voice-settings.js';
import {freshProfile,parseProfile,STORAGE_KEY} from '../app/state.js';
import {createMission} from '../app/missions.js';
const french={name:'Français naturel',lang:'fr-FR',voiceURI:'fr-natural'};
const child={name:'Voix enfant naturelle',lang:'fr-FR',voiceURI:'fr-child'};
const english={name:'English Child',lang:'en-US',voiceURI:'en'};

test('les choix restent français, échappent les noms et indiquent une voix absente',()=>{
 const settings=freshProfile().settings;
 const html=renderVoiceSettings(settings,[french,english],true);
 assert.ok(!html.includes('English Child'));assert.match(html,/id="speech-rate"/);assert.match(html,/value="0.8" selected/);
 assert.ok(!voiceOptions(settings,[{...french,name:'<script>',voiceURI:'"bad'}]).includes('<script>'));
 const unavailable=voiceOptions({...settings,speechVoice:'missing'},[french]);
 assert.match(unavailable,/selected disabled>Voix choisie indisponible/);
 assert.match(renderVoiceSettings(settings,[],false),/id="speech-preview" disabled/);
});

test('les voix chargées tardivement actualisent le choix sans perdre le rythme, puis le dialogue détache son écouteur',()=>{
 const controls=new Map(),listeners=new Map();let voices=[],closed;
 const dialog={querySelector(key){if(!controls.has(key))controls.set(key,{});return controls.get(key);},addEventListener(name,fn){if(name==='close')closed=fn;}};
 const settings=freshProfile().settings;let saves=0,previews=0;
 const engine={getVoices:()=>voices,addEventListener:(name,fn)=>listeners.set(name,fn),removeEventListener:(name,fn)=>{if(listeners.get(name)===fn)listeners.delete(name);}};
 bindVoiceSettings(dialog,settings,engine,{save:()=>saves++,preview:()=>previews++});
 voices=[french,child,english];listeners.get('voiceschanged')();
 const select=controls.get('#speech-voice');assert.match(select.innerHTML,/fr-child/);assert.ok(!select.innerHTML.includes('English'));
 select.value='fr-child';select.onchange();assert.equal(settings.speechVoice,'fr-child');assert.equal(previews,1);
 const rate=controls.get('#speech-rate');rate.value='0.7';rate.onchange();assert.equal(settings.speechRate,0.7);
 rate.value='5';rate.onchange();assert.equal(settings.speechRate,0.7);
 voices=[french];listeners.get('voiceschanged')();assert.match(select.innerHTML,/Voix choisie indisponible/);assert.equal(settings.speechVoice,'fr-child');
 assert.match(controls.get('#speech-status').textContent,/Français naturel/);
 assert.equal(settings.speechRate,0.7);assert.equal(saves,2);closed();assert.equal(listeners.size,0);
});

function controller(initialVoices,history=[]){
 const profile=freshProfile();profile.onboarded=true;profile.exerciseHistory=history;createMission(profile,()=>0);
 const memory=new Map([[STORAGE_KEY,JSON.stringify(profile)]]),listeners={},utterances=[],voiceListeners=new Set();
 let voices=initialVoices,opened=null;
 const dialogs=new Map();
 function dialog(id){
  if(!dialogs.has(id)){
   const controls=new Map(),closeListeners=[];
   const value={innerHTML:'',querySelector(key){if(!controls.has(key))controls.set(key,{style:{}});return controls.get(key);},querySelectorAll:()=>[],addEventListener(name,fn){if(name==='close')closeListeners.push(fn);},showModal(){opened=value;},close(){opened=null;closeListeners.splice(0).forEach(fn=>fn());}};
   dialogs.set(id,value);
  }
  return dialogs.get(id);
 }
 const app={innerHTML:'',addEventListener(name,fn){listeners[name]=fn;}};
 globalThis.SpeechSynthesisUtterance=class{constructor(text){this.text=text;}};
 globalThis.speechSynthesis={getVoices:()=>voices,speak:utterance=>utterances.push(utterance),cancel(){},addEventListener:(name,fn)=>voiceListeners.add(fn),removeEventListener:(name,fn)=>voiceListeners.delete(fn)};
 globalThis.window={speechSynthesis,SpeechSynthesisUtterance};
 globalThis.localStorage={getItem:key=>memory.get(key),setItem:(key,value)=>memory.set(key,value)};
 globalThis.document={body:{dataset:{}},documentElement:{style:{setProperty(){}}},addEventListener(){},querySelector(selector){if(selector==='#app')return app;if(selector==='dialog[open]')return opened;if(['#settings','#confirm'].includes(selector))return dialog(selector);return {focus(){}};}};
 return {app,utterances,dialog,voiceListeners,click(action){listeners.click({target:{closest:()=>({dataset:{action}})},preventDefault(){}});},updateVoices(value){voices=value;[...voiceListeners].forEach(fn=>fn());},saved:()=>parseProfile(memory.get(STORAGE_KEY))};
}

test('la préécoute et les réglages adultes ralentissent les exercices sans modifier la mission',async()=>{
 const f=controller([french,child,english]);await import('../app/app.js?adult-voice-settings');
 const original=f.saved();assert.ok(!f.app.innerHTML.includes('speech-preview'));
 f.click('settings');const dialog=f.dialog('#settings');
 assert.ok(dialog.innerHTML.indexOf('id="speech-voice"')>dialog.innerHTML.indexOf('<details class="adult-settings">'));
 const select=dialog.querySelector('#speech-voice');select.value='fr-natural';select.onchange();
 const rate=dialog.querySelector('#speech-rate');rate.value='0.7';rate.onchange();
 assert.equal(f.utterances.at(-1).rate,0.7);assert.equal(f.utterances.at(-1).voice.voiceURI,'fr-natural');
 dialog.querySelector('#speech-preview').onclick();assert.match(f.utterances.at(-1).text,/On prend notre temps/);
 assert.equal(f.saved().settings.speechRate,0.7);assert.deepEqual(f.saved().session,original.session);
 dialog.close();assert.equal(f.voiceListeners.size,0);f.click('resume');
 assert.equal(f.utterances.at(-1).rate,0.7);assert.equal(f.utterances.at(-1).pitch,1);
 assert.equal(f.utterances.at(-1).voice.voiceURI,'fr-natural');
 assert.deepEqual(f.saved().exerciseHistory,original.exerciseHistory);
});

test('une liste anglaise provisoire attend la voix française et une navigation annule toute attente',async()=>{
 const f=controller([english]);await import('../app/app.js?delayed-french-voice');
 f.click('discover');assert.equal(f.utterances.length,0);
 f.updateVoices([english]);assert.equal(f.utterances.length,0);
 f.updateVoices([english,french]);assert.equal(f.utterances.length,1);assert.equal(f.utterances.at(-1).voice,french);
 f.updateVoices([english]);f.click('guide');assert.ok(f.voiceListeners.size>0);
 f.click('audio');const count=f.utterances.length;f.updateVoices([english,french]);
 assert.equal(f.utterances.length,count);assert.equal(f.voiceListeners.size,0);
});


test('le bilan local reste dans les outils adultes et conserve les résultats et la mission',async()=>{
 const history=[{exerciseId:'f2-1',missionId:'m-1',position:0,level:0,beginnerStage:2,result:'assisted',attempts:1,helpUsed:false,completedAt:'2026-11-19T09:00:00Z'}];
 const f=controller([french],history);await import('../app/app.js?adult-progress-report');
 const original=f.saved();f.click('settings');
 f.dialog('#settings').querySelector('#history-button').onclick();
 const html=f.dialog('#confirm').innerHTML;
 assert.match(html,/Bilan des entraînements conservés/);assert.match(html,/Sans aide supplémentaire/);
 assert.match(html,/Retrouver une syllabe simple entendue/);assert.match(html,/À revoir ensemble/);
 assert.ok(!f.app.innerHTML.includes('Bilan des entraînements'));assert.equal(f.voiceListeners.size,0);
 assert.deepEqual(f.saved(),original);
});

test('premier tap avec voix vides : demande immédiate puis voix française tardive sans navigation',async t=>{
 t.mock.timers.enable({apis:['setTimeout','setInterval']});
 const f=controller([]);await import('../app/app.js?mobile-empty-voices');
 assert.equal(f.utterances.length,0);
 f.click('resume');assert.equal(f.utterances.length,1);
 assert.equal(f.utterances[0].lang,'fr-FR');
 t.mock.timers.tick(1200);assert.ok(f.voiceListeners.size>0);
 f.updateVoices([french]);assert.equal(f.utterances.length,2);
 assert.equal(f.utterances.at(-1).voice,french);
 f.utterances.at(-1).onstart();t.mock.timers.tick(10000);
 assert.doesNotMatch(f.app.innerHTML,/speech-notice/);
 f.click('audio');
});

test('une voix silencieuse affiche un réessai et le prochain tap peut démarrer le son',async t=>{
 t.mock.timers.enable({apis:['setTimeout','setInterval']});
 const f=controller([french]);await import('../app/app.js?mobile-silent-engine');
 f.click('resume');const old=f.utterances.at(-1);
 t.mock.timers.tick(8000);
 assert.match(f.app.innerHTML,/Réessayer le son/);
 assert.equal(old.onstart,null);
 f.click('retry-page-audio');assert.equal(f.utterances.length,2);
 f.utterances.at(-1).onstart();
 assert.doesNotMatch(f.app.innerHTML,/speech-notice/);
 f.click('audio');
});

test('une navigation annule une demande sans voix et son futur réessai',async t=>{
 t.mock.timers.enable({apis:['setTimeout','setInterval']});
 const f=controller([]);await import('../app/app.js?mobile-cancel-pending');
 f.click('resume');f.click('audio');const count=f.utterances.length;
 f.updateVoices([french]);t.mock.timers.tick(10000);
 assert.equal(f.utterances.length,count);assert.equal(f.voiceListeners.size,0);
 assert.doesNotMatch(f.app.innerHTML,/speech-notice/);
});

test('les voix tardives sont détectées même sans événement et une lecture commencée ne redémarre pas',async t=>{
 t.mock.timers.enable({apis:['setTimeout','setInterval']});
 const f=controller([]);await import('../app/app.js?mobile-poll-voices');
 f.click('resume');f.voiceListeners.clear();
 t.mock.timers.tick(1200);f.updateVoices([french]);
 assert.equal(f.utterances.length,1);
 t.mock.timers.tick(200);assert.equal(f.utterances.length,2);
 f.utterances.at(-1).onstart();t.mock.timers.tick(10000);
 assert.equal(f.utterances.length,2);
 assert.doesNotMatch(f.app.innerHTML,/speech-notice/);
 f.click('audio');
});
