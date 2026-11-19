import test from 'node:test';
import assert from 'node:assert/strict';
import {questionsFor,questionById} from '../app/data.js';
import {freshProfile,parseProfile,STORAGE_KEY,setDifficultyPosition} from '../app/state.js';
import {createMission,missionQuestion} from '../app/missions.js';
import {applyInteraction,interactionFor,completedText} from '../app/interactions.js';
import {createGameDemo,updateGameDemo} from '../app/game-demo.js';
import {readingMarkup} from '../app/learning-games.js';
import {teachingCatalogue,teachingCard} from '../app/teacher-guide.js';
import {summarizeProgress} from '../app/progress.js';

const all=[...[0,1,2,3].map(stage=>questionsFor(0,stage)),...[1,2,3].map(level=>questionsFor(level))].flat();
test('le catalogue étendu garde corrections, images et identifiants cohérents',()=>{
 assert.equal(all.length,364);assert.equal(new Set(all.map(question=>question.id)).size,364);
 for(const q of all){
  assert.match(q.id,/^(f[0-3]|n[1-4])-[1-9][0-9]{0,2}$/);assert.ok(q.options.length>=2&&q.options.length<=4);
  assert.ok(q.options[q.answer]);if(q.mechanic!=='build')assert.equal(new Set(q.options).size,q.options.length,q.id);
  if(q.optionPictures){assert.equal(q.optionPictures.length,q.options.length);assert.ok(q.optionPictures.every(Boolean),q.id);}
  if(q.mechanic==='build'){assert.ok(q.parts.every(part=>q.tiles.includes(part)));assert.ok(q.tiles.length<=4);}
  if(q.mechanic==='segment'){assert.ok(q.boundaries.every(index=>index<q.segments.length-1));assert.equal(completedText(q),q.options[q.answer]);}
 }
 assert.ok(!all.some(q=>q.type==='phoneme_sound')); // Missing recordings never silently become letter-name TTS.
});

test('segmentation et chronologie gardent les placements lors de la reprise',()=>{
 const q=questionById('n2-121');let state;
 state=applyInteraction(q,state,'cut',0).state;state=applyInteraction(q,state,'cut',1).state;
 assert.equal(applyInteraction(q,state,'check').event,'incorrect');
 state=applyInteraction(q,state,'cut',1).state;state=applyInteraction(q,state,'cut',2).state;
 const p=freshProfile();p.level=1;p.session=createMission(p);p.session.interaction=state;
 const restored=parseProfile(JSON.stringify(p));assert.deepEqual(interactionFor(q,restored.session.interaction).cuts,[0,2]);
 assert.equal(applyInteraction(q,restored.session.interaction,'check').event,'complete');
 const story=questionById('n4-101');state=null;
 for(const part of story.parts){const index=story.tiles.findIndex((tile,index)=>tile===part&&!state?.picked.includes(index));const result=applyInteraction(story,state,'tile',index);state=result.state;}
 assert.equal(state.picked.length,3);assert.equal(completedText(story),story.parts.join(' '));
});

test('les aides de lecture restent absentes des discriminations et la préparation ne verrouille pas le niveau',()=>{
 const settings={silentLetters:true,complexSounds:true};
 assert.match(readingMarkup('Le chat voit un bateau.',settings,{visualAids:true}),/silent-letter/);
 assert.match(readingMarkup('bateau',settings,{visualAids:true}),/complex-sound/);
 assert.equal(readingMarkup('bateau',settings,{visualAids:false}),'bateau');
 assert.equal(readingMarkup('<script>',settings,{visualAids:true}),'&lt;script&gt;');
 const catalogue=teachingCatalogue();assert.equal(catalogue.length,30);
 assert.ok(catalogue.find(skill=>skill.id==='interactive-segmentation').preparable);
 assert.ok(!catalogue.find(skill=>skill.id==='consonant-sound').preparable);
 assert.match(teachingCard(catalogue[0]),/Relecture professionnelle : en attente/);
 const p=freshProfile();p.nextObjective='interactive-segmentation';p.session=createMission(p,()=>0);
 assert.equal(p.level,1);assert.ok(p.session.questionIds.every(id=>questionById(id).mechanic==='segment'));assert.equal(p.nextObjective,null);
 p.nextObjective='word-flash';setDifficultyPosition(p,0);assert.equal(p.nextObjective,null);
});

test('réduire les choix conserve la réponse et les images, sans réduire un intrus à deux cartes',()=>{
 for(const limit of [2,3,4]){
  const p=freshProfile();p.settings.choiceLimit=limit;p.nextObjective='sound-odd-one-out';const session=createMission(p,()=>0);
  for(let index=0;index<8;index++){
   const q=missionQuestion(session,index);assert.equal(q.options.length,3);assert.equal(q.optionPictures.length,3);
   assert.equal(q.options[q.answer],questionById(q.id).options[questionById(q.id).answer]);
  }
 }
 const p=freshProfile();p.settings.choiceLimit=2;p.level=2;const session=createMission(p,()=>0);
 assert.ok(session.questionIds.every((_,index)=>missionQuestion(session,index).options.length===2));
 assert.equal(parseProfile(JSON.stringify({...p,session})).session.choiceLimit,2);
});

test('chaque nouvelle mécanique possède un exemple indépendant qui ne produit aucun résultat',()=>{
 for(const id of ['f0-3','f1-101','f1-121','f1-161','f2-101','f3-101','n2-101','n2-121','n2-141','n4-101']){
  let demo=createGameDemo(questionById(id));assert.equal(demo.question.id,'demo');assert.equal(demo.correct,false);
  const q=demo.question;
  if(q.mechanic==='build')for(const part of q.parts){const index=q.tiles.findIndex((tile,index)=>tile===part&&!demo.interaction.picked.includes(index));demo=updateGameDemo(demo,'tile',index);}
  else if(q.mechanic==='pairs')for(let index=0;index<q.pairs.length;index++){demo=updateGameDemo(demo,'source',index);demo=updateGameDemo(demo,'target',q.pairOrder.indexOf(index));}
  else if(q.mechanic==='segment'){for(const index of q.boundaries)demo=updateGameDemo(demo,'cut',index);demo=updateGameDemo(demo,'check');}
  else if(q.mechanic==='reading'){demo=updateGameDemo(demo,'start');demo=updateGameDemo(demo,'stop');}
  else{if(q.mechanic==='flash')demo=updateGameDemo(demo,'hide');demo=updateGameDemo(demo,'answer',q.answer);}
  assert.equal(demo.correct,true,id);assert.equal(demo.exerciseHistory,undefined);
 }
});

function fixture(id,settings={}){
 const profile=freshProfile(),question=questionById(id);profile.onboarded=true;Object.assign(profile.settings,settings);
 profile.level=id.startsWith('n')?Number(id[1])-1:0;profile.beginnerStage=id.startsWith('f')?Number(id[1]):0;
 const other=questionsFor(profile.level,profile.beginnerStage).filter(q=>q.id!==id).slice(0,7).map(q=>q.id);
 profile.session={id:'m-1',level:profile.level,beginnerStage:profile.beginnerStage,index:0,questionIds:[id,...other],results:[],attempts:0,rejected:[],overrides:{},variants:{}};
 const memory=new Map([[STORAGE_KEY,JSON.stringify(profile)]]),listeners={},spoken=[],utterances=[],dialogs=new Map(),focused=[];
 let opened=null;
 const dialogFor=selector=>{
  if(!dialogs.has(selector)){
   const controls=new Map();const d={innerHTML:'',showModal(){opened=d;},close(){opened=null;},addEventListener(){},querySelector(key){if(!controls.has(key))controls.set(key,{style:{},focus(){},addEventListener(name,fn){this.onclick=fn;}});return controls.get(key);},querySelectorAll:()=>[]};dialogs.set(selector,d);
  }return dialogs.get(selector);
 };
 const app={innerHTML:'',addEventListener(name,fn){listeners[name]=fn;}};
 globalThis.SpeechSynthesisUtterance=class{constructor(text){this.text=text;}};
 globalThis.speechSynthesis={cancel(){},getVoices:()=>[{lang:'fr-FR',name:'Natural'}],speak(u){spoken.push(u.text);utterances.push(u);}};
 globalThis.window={speechSynthesis,SpeechSynthesisUtterance};
 globalThis.localStorage={getItem:key=>memory.get(key),setItem:(key,value)=>memory.set(key,value)};
 globalThis.document={documentElement:{style:{setProperty(){}}},body:{dataset:{}},addEventListener(){},querySelector(selector){if(selector==='#app')return app;if(selector==='dialog[open]')return opened;if(selector==='#settings'||selector==='#confirm')return dialogFor(selector);return {focus(){focused.push(selector);}};}};
 return {app,spoken,utterances,question,focused,dialog:dialogFor,saved:()=>parseProfile(memory.get(STORAGE_KEY)),click(action,extra={}){listeners.click({target:{closest:()=>({dataset:{action,...extra}})},preventDefault(){}});}};
}

test('la segmentation se corrige après erreur et enregistre une seule réussite accompagnée',async()=>{
 const f=fixture('n2-121');await import('../app/app.js?cut-controller');f.click('resume');
 f.click('cut-gap',{card:'0'});f.click('cut-check');assert.equal(f.saved().session.attempts,1);
 f.click('cut-gap',{card:'2'});f.click('cut-check');
 assert.equal(f.saved().exerciseHistory.length,1);assert.equal(f.saved().exerciseHistory[0].result,'assisted');
 f.click('cut-check');assert.equal(f.saved().exerciseHistory.length,1);assert.match(f.app.innerHTML,/Le chat dort/);
});

test('le flash cache le mot, refuse une réponse prématurée et annule la minuterie à la pause',async()=>{
 const originalSet=globalThis.setTimeout,originalClear=globalThis.clearTimeout;const timers=new Map();let sequence=0;
 globalThis.setTimeout=(fn,delay)=>{const id=++sequence;timers.set(id,{fn,delay});return id;};globalThis.clearTimeout=id=>timers.delete(id);
 try{
  const f=fixture('n2-101',{flashDuration:1000});await import('../app/app.js?flash-controller');f.click('resume');
  assert.ok(!/>avec<\//.test(f.app.innerHTML));assert.ok(!f.app.innerHTML.includes('data-action="answer"'));
  f.click('answer',{answer:'0'});assert.equal(f.saved().exerciseHistory.length,0);
  f.utterances.at(-1).onend();assert.match(f.app.innerHTML,/>avec<\//);
  const callback=[...timers.values()].find(timer=>timer.delay===1000).fn;callback();
  assert.ok(f.app.innerHTML.includes('flash-hidden'));assert.match(f.app.innerHTML,/data-action="answer"/);
  f.click('flash-replay');assert.equal(f.saved().session.helpUsed,true);f.click('pause');callback();
  assert.ok(!f.app.innerHTML.includes('flash-hidden'));assert.equal(f.saved().exerciseHistory.length,0);
 }finally{globalThis.setTimeout=originalSet;globalThis.clearTimeout=originalClear;}
});

test('une lecture déclarée terminée est distinguée des réponses évaluées et la mesure est facultative',async()=>{
 for(const measureReading of [false,true]){
  const f=fixture('n2-141',{measureReading});await import('../app/app.js?reading-controller-'+measureReading);f.click('resume');
  f.click('reading-stop');assert.equal(f.saved().exerciseHistory.length,0);
  f.click('reading-start');assert.match(f.app.innerHTML,/data-action="reading-stop"/);f.click('reading-stop');
  const event=f.saved().exerciseHistory[0];assert.equal(event.result,'observed');assert.equal(event.observation.kind,'reading-declared');
  assert.equal(event.observation.durationMs===null,!measureReading);assert.ok(!f.app.innerHTML.includes('Bonne réponse'));
  const row=summarizeProgress([event]).rows[0];assert.equal(row.observed,1);assert.equal(row.independent,0);assert.equal(row.assisted,0);
 }
});

test('la préparation enseignante conserve la mission, puis cible seulement une nouvelle mission',async()=>{
 const f=fixture('f0-1');await import('../app/app.js?teacher-session-controller');const original=f.saved().session;
 f.click('settings');f.dialog('#settings').querySelector('#teacher-button').onclick();
 const dialog=f.dialog('#confirm');dialog.querySelector('#teacher-objective').value='word-flash';dialog.querySelector('#teacher-objective').onchange();dialog.querySelector('#teacher-prepare').onclick();
 assert.deepEqual(f.saved().session,original);assert.equal(f.saved().nextObjective,'word-flash');
 const next=f.saved();next.session=null;const mission=createMission(next,()=>0);
 assert.ok(mission.questionIds.every(id=>questionById(id).mechanic==='flash'));assert.equal(next.nextObjective,null);
});

test('le flash sans minuterie reste contrôlé par l’enfant et fonctionne après coupure du son',async()=>{
 const f=fixture('n2-101',{flashDuration:0});await import('../app/app.js?untimed-flash-controller');f.click('resume');
 f.click('audio');assert.match(f.app.innerHTML,/data-action="flash-hide"/);assert.match(f.app.innerHTML,/>avec<\//);
 f.click('flash-hide');assert.match(f.app.innerHTML,/data-action="answer"/);assert.ok(!/>avec<\/div>/.test(f.app.innerHTML));
 f.click('answer',{answer:'0'});assert.equal(f.saved().exerciseHistory.length,1);
 assert.equal(f.saved().exerciseHistory[0].result,'independent');
});


test('un résultat ancien ou incohérent ne transforme pas une lecture libre en lecture évaluée',()=>{
 const report=summarizeProgress([{exerciseId:'n2-141',result:'independent',completedAt:'2026-11-19T10:00:00Z'}]);
 assert.equal(report.rows[0].observed,1);assert.equal(report.rows[0].independent,0);
});


test('les 26 lettres ont chacune un modèle visuel dans le premier palier',()=>{
 const seen=new Set(questionsFor(0,0).flatMap(question=>question.pairs||[question.text]));
 for(const letter of 'abcdefghijklmnopqrstuvwxyz')assert.ok(seen.has(letter),letter);
});
