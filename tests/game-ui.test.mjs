import test from 'node:test';
import assert from 'node:assert/strict';
import { beginnerBanks } from '../app/foundations.js';
import { freshProfile, STORAGE_KEY } from '../app/state.js';

function fixture(profile,withRecordings=false,withVoice=true) {
  const memory = new Map([[STORAGE_KEY, JSON.stringify(profile)]]), listeners = {}, spoken = [], utterances = [], recordings = [];
  const app = { innerHTML:'', addEventListener(name, handler) { listeners[name] = handler; } };
  let dialogOpen=false;const dialogButtons=new Map();
  const dialog={innerHTML:'',showModal(){dialogOpen=true;},close(){dialogOpen=false;},querySelector(selector){if(!dialogButtons.has(selector))dialogButtons.set(selector,{focus(){}});return dialogButtons.get(selector);},querySelectorAll(selector){if(selector==='[data-demo-answer]')return [...dialog.innerHTML.matchAll(/data-demo-answer="([0-9]+)"/g)].map(match=>{const button={dataset:{demoAnswer:match[1]},focus(){}};dialogButtons.set('answer-'+match[1],button);return button;});return [];}};
  globalThis.SpeechSynthesisUtterance = class { constructor(text) { this.text = text; } };
  globalThis.speechSynthesis = { cancel() {}, getVoices:() => [{ lang:'fr-FR' }], speak(utterance) { spoken.push(utterance.text); utterances.push(utterance); } };
  globalThis.window = withVoice ? { speechSynthesis, SpeechSynthesisUtterance } : {};
  if(withRecordings)window.Audio=class {constructor(){recordings.push(this);}play(){return Promise.resolve();}pause(){this.paused=true;}removeAttribute(){this.src='';}};
  globalThis.localStorage = { getItem:key => memory.get(key), setItem:(key,value) => memory.set(key,value) };
  globalThis.document = {
    documentElement:{ style:{ setProperty() {} } }, body:{ dataset:{} }, addEventListener() {},
    querySelector(selector) { if (selector === '#app') return app; if (selector === '#confirm') return dialog; if (selector === 'dialog[open]') return dialogOpen?dialog:null; return { focus() {} }; }
  };
  return {
    app, spoken, utterances, recordings, dialog, demoClick(selector){dialogButtons.get(selector)?.onclick();}, saved:() => JSON.parse(memory.get(STORAGE_KEY)),
    click(action, card) { listeners.click({ target:{ closest:() => ({ dataset:{ action, hero:String(card), card:String(card), answer:String(card), exerciseId:String(card), groupId:String(card) } }) }, preventDefault() {} }); }
  };
}
function profileAt(stage, index = 0) {
  const profile = freshProfile(); profile.onboarded = true; profile.beginnerStage = stage;
  profile.session = { level:0, beginnerStage:stage, index, results:Array(index).fill('independent'), attempts:0, rejected:[], overrides:{} };
  return profile;
}
test('la fusion se joue par cartes, se corrige et reprend après fermeture sans perdre l’aide reçue', async () => {
  const f = fixture(profileAt(2,2));
  await import('../app/app.js?fusion-game');
  f.click('resume');
  assert.match(f.app.innerHTML, /assembly-board/);
  assert.ok(!f.app.innerHTML.includes('data-action="answer"'));
  f.click('answer', 0); assert.equal(f.saved().session.results.length, 2);
  f.click('build-tile', 0); assert.equal(f.saved().session.attempts, 1);
  f.click('help');
  f.click('build-tile', 1);
  assert.deepEqual(f.saved().session.interaction.picked, [1]);
  assert.match(f.app.innerHTML, /data-action="build-undo"/);
  f.click('build-undo'); assert.deepEqual(f.saved().session.interaction.picked, []);
  f.click('build-tile', 1);
  await import('../app/app.js?fusion-game-reloaded');
  f.click('resume');
  assert.match(f.app.innerHTML, /1 carte sur 2 posée/);
  assert.equal(f.saved().session.attempts, 1);
  assert.equal(f.saved().session.helpUsed, true);
  f.click('build-tile', 0);
  assert.equal(f.saved().session.results.at(-1), 'assisted');
  const main = f.app.innerHTML.split('<main')[1];
  assert.equal((main.match(/<button/g) || []).length, 1);
  assert.match(main, /data-action="next"/);
  f.click('next');
  assert.equal(f.saved().session.index, 3);
  assert.equal(f.saved().session.interaction, null);
});

test('une mission d’assemblage de mots se termine avec huit constructions réelles', async () => {
  const f = fixture(profileAt(3));
  await import('../app/app.js?word-build-game');
  f.click('resume');
  for (let index = 0; index < 8; index++) {
    const question = beginnerBanks[3][index];
    assert.match(f.app.innerHTML, /assembly-board/);
    assert.ok(!f.app.innerHTML.includes('data-action="answer"'));
    const used = [];
    for (const part of question.parts) {
      const tile = question.tiles.findIndex((value,index) => value === part && !used.includes(index));
      used.push(tile); f.click('build-tile', tile);
    }
    if (index < 7) {
      assert.equal(f.saved().session.results.length, index + 1);
      f.click('build-tile', used.at(-1));
      assert.equal(f.saved().session.results.length, index + 1);
      f.click('next');
    }
  }
  assert.equal(f.saved().completed, 1);
  assert.equal(f.saved().assisted, 0);
  assert.equal(f.saved().session, null);
  assert.match(f.app.innerHTML, /Mission accomplie/);
  assert.equal(f.saved().exerciseHistory.length,8);
  const completedIds = f.saved().exerciseHistory.map(event => event.exerciseId);
  f.click('start');
  const planned = f.saved().session;
  assert.equal(planned.beginnerStage,3);
  assert.ok(planned.questionIds.every(id => !completedIds.includes(id)));
  await import('../app/app.js?word-plan-reloaded');
  f.click('resume');
  assert.deepEqual(f.saved().session.questionIds,planned.questionIds);
  assert.deepEqual(f.saved().session.variants,planned.variants);
  assert.equal(f.saved().exerciseHistory.length,8);
});


test('les jeux n’exposent plus de groupes et gardent un audio limité à la cible',async()=>{
 const f=fixture(profileAt(0));await import('../app/app.js?simple-games');
 f.click('difficulty');assert.ok(!/Choisir un groupe|data-action="groups"/.test(f.app.innerHTML));
 f.click('confirm-settings');f.click('resume');
 assert.ok(!/Groupe|data-action="groups"/.test(f.app.innerHTML));
 assert.equal(f.spoken.at(-1),'a');
 f.click('repeat');assert.equal(f.spoken.at(-1),'a');
 f.click('answer',1);assert.equal(f.spoken.at(-1),'a');
 f.click('help');assert.equal(f.spoken.at(-1),'a');
});

test('la syllabe est prononcée seule au lancement, après erreur et en réécoute',async()=>{
 const f=fixture(profileAt(2));await import('../app/app.js?simple-syllable-audio');f.click('resume');
 assert.match(f.app.innerHTML,/exercise-syllable-repeat/);
 assert.match(f.app.innerHTML,/Réécouter la syllabe/);
 assert.match(f.app.innerHTML,/syllable-repeat-speaker/);
 assert.equal((f.app.innerHTML.match(/data-action="repeat"/g)||[]).length,1);
 assert.equal(f.spoken.at(-1),'ma');f.click('answer',1);assert.equal(f.spoken.at(-1),'ma');
 f.click('repeat');assert.equal(f.spoken.at(-1),'ma');
 f.click('answer',0);assert.equal(f.spoken.at(-1),'ma');
});

test('la syllabe précède Bravo, avec une pause après sa fin et annulation au jeu suivant',async()=>{
 const f=fixture(profileAt(2));await import('../app/app.js?syllable-praise');f.click('resume');f.click('answer',0);
 const target=f.utterances.at(-1);assert.equal(target.text,'ma');assert.equal(typeof target.onend,'function');
 target.onend();assert.equal(f.spoken.at(-1),'ma');
 await new Promise(resolve=>setTimeout(resolve,500));assert.equal(f.spoken.at(-1),'Bravo !');
 assert.ok(f.utterances.at(-1).pitch>1);assert.equal(target.pitch,1);assert.equal(target.rate,0.97);
 f.click('next');f.click('answer',1); // second item is mi, correct option is 1 in this legacy plan
 const success=f.utterances.at(-1);assert.equal(success.text,'mi');success.onend();f.click('next');
 const before=f.spoken.length;await new Promise(resolve=>setTimeout(resolve,500));assert.equal(f.spoken.length,before);
});

test('une panne audio ne laisse pas répondre sans cible et la réécoute ne compte pas comme une erreur',async()=>{
 const f=fixture(profileAt(2));await import('../app/app.js?voice-failure-recovery');f.click('resume');
 const before=f.saved();f.utterances.at(-1).onerror({error:'language-unavailable'});
 assert.match(f.app.innerHTML,/retry-exercise-audio/);
 assert.ok(!f.app.innerHTML.includes('data-action="answer"'));
 f.click('answer',0);assert.equal(f.saved().session.results.length,0);
 f.click('retry-exercise-audio');assert.equal(f.spoken.at(-1),'ma');
 assert.match(f.app.innerHTML,/data-action="answer"/);
 assert.equal(f.saved().session.attempts,before.session.attempts);
 assert.equal(f.saved().session.helpUsed,before.session.helpUsed);
 f.click('answer',0);assert.equal(f.saved().session.results[0],'independent');
});

test('le grand haut-parleur est commun aux sons, syllabes et mots à assembler',async()=>{
 for (const stage of [1,2,3]) {
  const f=fixture(profileAt(stage));await import('../app/app.js?clear-listening-'+stage);f.click('resume');
  assert.match(f.app.innerHTML,/syllable-repeat-speaker/);
  assert.equal((f.app.innerHTML.match(/data-action="repeat"/g)||[]).length,1);
  f.click('audio');assert.equal(f.saved().audio,false);
  f.click('repeat');assert.equal(f.saved().audio,true);
 }
});

test('pause et reprise conservent la place et l’aide sans attribuer de résultat',async()=>{
 const f=fixture(profileAt(2));await import('../app/app.js?pause-and-demo');f.click('resume');
 assert.match(f.app.innerHTML,/data-action="pause"/);
 f.click('help');assert.match(f.dialog.innerHTML,/Un exemple/);
 const target=f.dialog.innerHTML.match(/demo-target[^>]*[^]*?<span>([^<]+)<\/span>/)[1];
 assert.notEqual(target,'ma');assert.notEqual(target,'mi');
 f.demoClick('answer-0');assert.match(f.dialog.innerHTML,/demo-done/);
 f.demoClick('#demo-done');
 const session=f.saved().session;assert.equal(session.results.length,0);assert.equal(session.attempts,0);assert.equal(session.helpUsed,true);
 f.click('pause');assert.match(f.app.innerHTML,/Continuer/);assert.deepEqual(f.saved().session,session);
 await import('../app/app.js?pause-and-demo-reloaded');f.click('resume');
 assert.equal(f.saved().session.index,0);assert.equal(f.saved().session.helpUsed,true);
 f.click('answer',0);assert.equal(f.saved().session.results[0],'assisted');
 f.click('pause');f.click('resume');assert.match(f.app.innerHTML,/data-action="next"/);
 assert.ok(!f.app.innerHTML.includes('data-action="answer"'));
});

test('un phonème enregistré n’est jamais remplacé par son nom et attend un démarrage audio',async()=>{
 const original=beginnerBanks[1][0];
 beginnerBanks[1][0]={...original,type:'phoneme_sound',listen:'',recordedAudio:'/audio/sounds/fr-fr/l-v1.mp3',options:['l','a'],answer:0};
 try{
  const f=fixture(profileAt(1),true);await import('../app/app.js?recorded-phoneme');f.click('resume');
  assert.equal(f.recordings.at(-1).src,'/audio/sounds/fr-fr/l-v1.mp3');
  assert.ok(!f.app.innerHTML.includes('data-action="answer"'));f.click('answer',0);assert.equal(f.saved().session.results.length,0);
  f.recordings.at(-1).onplaying();assert.match(f.app.innerHTML,/data-action="answer"/);
  f.click('answer',0);assert.equal(f.saved().session.results[0],'independent');
  const repeated=f.recordings.at(-1);repeated.onplaying();repeated.onended();
  await new Promise(resolve=>setTimeout(resolve,500));assert.equal(f.spoken.at(-1),'Bravo !');
  assert.ok(!f.spoken.includes('l'));assert.ok(!f.spoken.includes('elle'));
 }finally{beginnerBanks[1][0]=original;}
});
test('le fichier fonctionne sans TTS, et une panne offre une nouvelle écoute sans pénalité',async()=>{
 const original=beginnerBanks[1][0];
 beginnerBanks[1][0]={...original,type:'phoneme_sound',listen:'',recordedAudio:'/audio/sounds/fr-fr/f-v1.mp3',options:['f','a'],answer:0};
 try{
  const f=fixture(profileAt(1),true,false);await import('../app/app.js?recording-without-tts');f.click('resume');
  f.recordings.at(-1).onerror();assert.match(f.app.innerHTML,/Réessayer l’écoute/);
  assert.equal(f.saved().session.attempts,0);assert.equal(f.saved().session.helpUsed,false);
  f.click('retry-exercise-audio');f.recordings.at(-1).onplaying();assert.match(f.app.innerHTML,/data-action="answer"/);
  f.click('pause');assert.equal(f.recordings.at(-1).paused,true);
  f.click('resume');f.recordings.at(-1).onplaying();f.click('answer',0);
  assert.equal(f.saved().session.results[0],'independent');assert.deepEqual(f.spoken,[]);
  f.click('pause');
 }finally{beginnerBanks[1][0]=original;}
});

test('dans les exercices les réglages restent tout à droite, la pause reste avec la maison',async()=>{
 const f=fixture(profileAt(2));await import('../app/app.js?stable-exercise-header');
 const actions=()=>[...f.app.innerHTML.split('</header>')[0].matchAll(/data-action="([^"]+)"/g)].map(match=>match[1]);
 assert.equal(actions().at(-1),'settings');f.click('resume');
 assert.deepEqual(actions(),['quit','pause','audio','settings']);
 f.click('pause');assert.equal(actions().at(-1),'settings');assert.ok(!actions().includes('pause'));
});

test('Naya et Pico se choisissent, se sauvegardent et accompagnent la mission existante',async()=>{
 for(const [id,name,title] of [['mermaid','Naya','la sirène'],['dragon','Pico','le dragon']]){
  const f=fixture(profileAt(0));await import('../app/app.js?new-companion-'+id);
  const before=f.saved();f.click('change-hero');
  assert.equal((f.app.innerHTML.match(/class="companion-choice/g)||[]).length,6);
  f.click('hero',id);assert.match(f.spoken.at(-1),new RegExp(name));f.click('confirm-settings');
  assert.equal(f.saved().hero,id);assert.deepEqual(f.saved().session,before.session);assert.equal(f.saved().completed,before.completed);
  await import('../app/app.js?new-companion-reload-'+id);assert.equal(f.saved().hero,id);
  f.click('resume');assert.ok(f.app.innerHTML.includes(name+', '+title));
  f.click('answer',1);assert.match(f.app.innerHTML,/companion-support/);
  f.click('answer',0);assert.match(f.app.innerHTML,/companion-cheer/);
 }
});
