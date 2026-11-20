import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,rm} from 'node:fs/promises';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {createHash} from 'node:crypto';
import {generateRecordedContent,inspectVoiceLibrary} from '../scripts/recorded-content.mjs';
import {soundCurriculum,pilotSoundExercises} from '../content/sound-curriculum.mjs';
import {completeSoundExercises} from '../content/sound-exercises.mjs';
import {createVoiceRecordings} from '../app/voice-recordings.js';
import {questionById} from '../app/data.js';
import {freshProfile,parseProfile,STORAGE_KEY} from '../app/state.js';
import {recordedVoiceEntries} from '../app/recorded-content.js';
const loadModule=source=>import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
async function approve(root,audio,id,directory='sounds'){
 // Synthetic bytes test the pipeline only, not a real sound or an acoustic approval.
 const bytes=Buffer.from('ID3 synthetic fixture '+id);
 Object.assign(audio,{file:`/audio/${directory}/fr-fr/${id}.mp3`,sha256:createHash('sha256').update(bytes).digest('hex'),source:'Test fixture',rights:'Test only',reviewer:'Test only',reviewedAt:'2026-11-20',pronunciationReview:'approved',deviceCheck:'passed'});
 await mkdir(join(root,'audio',directory,'fr-fr'),{recursive:true});await writeFile(join(root,'.'+audio.file),bytes);
}
test('aucun lot vide ne s’active et une activation incomplète échoue',async()=>{
 const module=await loadModule(await generateRecordedContent());assert.deepEqual(module.recordedSoundQuestions,[]);assert.deepEqual(module.recordedVoiceEntries,[]);
 for(const key of ['pilot','coverage','voice'])await assert.rejects(generateRecordedContent({release:{[key]:true}}),/refusée/);
});
test('les quatre sons relus deviennent huit questions jouables et un fichier remplacé bloque le build',async()=>{
 const root=await mkdtemp(join(tmpdir(),'azylit-recorded-'));try{
  const curriculum=structuredClone(soundCurriculum),pilot=structuredClone(pilotSoundExercises);
  for(const id of ['l','r','f','j']){const unit=curriculum.find(unit=>unit.id===id);unit.contentReview='approved';await approve(root,unit.audio,id);}
  pilot.forEach(ex=>ex.review='approved');
  const module=await loadModule(await generateRecordedContent({release:{pilot:true},curriculum,pilot,root}));
  assert.equal(module.recordedSoundQuestions.length,8);
  for(const q of module.recordedSoundQuestions){assert.match(q.id,/^f1-[1-9][0-9]{0,2}$/);assert.equal(questionById(q.id),undefined);assert.ok(q.recordedAudio);assert.ok(!q.listen);}
  await writeFile(join(root,'audio/sounds/fr-fr/f.mp3'),'ID3 changed');
  await assert.rejects(generateRecordedContent({release:{pilot:true},curriculum,pilot,root}),/diffère/);
 }finally{await rm(root,{recursive:true,force:true});}
});
test('la couverture complète conserve des identifiants numériques sans collision avec le pilote et les jeux existants',async()=>{
 const root=await mkdtemp(join(tmpdir(),'azylit-all-sounds-'));try{
  const curriculum=structuredClone(soundCurriculum),pilot=structuredClone(pilotSoundExercises),coverage=structuredClone(completeSoundExercises);
  for(const unit of curriculum){unit.contentReview='approved';await approve(root,unit.audio,unit.id);}
  pilot.forEach(ex=>ex.review='approved');
  for(const ex of coverage){ex.review='approved';if(ex.contextAudio)await approve(root,ex.contextAudio,'word-'+ex.audioCue);}
  const module=await loadModule(await generateRecordedContent({release:{pilot:true,coverage:true},curriculum,pilot,coverage,root}));
  const ids=module.recordedSoundQuestions.map(q=>q.id);assert.equal(new Set(ids).size,112);
  for(const q of module.recordedSoundQuestions){assert.match(q.id,/^f1-[1-9][0-9]{0,2}$/);assert.equal(questionById(q.id),undefined);}
  const first=module.recordedSoundQuestions[8];const p=freshProfile();p.beginnerStage=1;
  p.session={id:'m-1',level:0,beginnerStage:1,index:0,results:[],questionIds:ids.slice(8,16),variants:{},overrides:{}};
  assert.equal(parseProfile(JSON.stringify(p)).session.questionIds[0],first.id);
  assert.ok(module.recordedSoundQuestions.some(q=>q.type==='sound_context_word'&&q.competency==='word-listen'));
 }finally{await rm(root,{recursive:true,force:true});}
});
test('la bibliothèque vocale exige provenance, droits, relecture et empreinte du fichier exact',async()=>{
 const root=await mkdtemp(join(tmpdir(),'azylit-voice-'));try{
  const voices=[{id:'bravo-1',speech:'Bravo !',contentReview:'approved',audio:{locale:'fr-FR'}}];
  await approve(root,voices[0].audio,'bravo-1','voice');
  let report=await inspectVoiceLibrary({entries:voices,root});assert.equal(report.ready,true);
  const module=await loadModule(await generateRecordedContent({release:{voice:true},voices,root}));assert.equal(module.recordedVoiceEntries.length,1);
  voices[0].audio.rights=null;report=await inspectVoiceLibrary({entries:voices,root});assert.equal(report.ready,false);
  assert.deepEqual(report.entries,[]);
 }finally{await rm(root,{recursive:true,force:true});}
});
test('les prises vocales alternent, normalisent les espaces et refusent les chemins distants',()=>{
 const entries=[{speech:' Bravo  ! ',file:'/audio/voice/fr-fr/bravo-1.mp3'},{speech:'Bravo !',file:'/audio/voice/fr-fr/bravo-2.mp3'},{speech:'bad',file:'https://example.org/a.mp3'}];
 const clips=createVoiceRecordings(entries,()=>0);
 assert.notEqual(clips.next('Bravo !'),clips.next('Bravo !'));assert.equal(clips.has('bad'),false);assert.equal(clips.next(undefined),null);
});
test('le moteur préfère la voix enregistrée, garde la pause avant Bravo et permet le repli TTS pour un mot',async()=>{
 const original=[...recordedVoiceEntries];
 recordedVoiceEntries.push({id:'ma',speech:'ma',file:'/audio/voice/fr-fr/ma.mp3'},{id:'bravo',speech:'Bravo !',file:'/audio/voice/fr-fr/bravo.mp3'});
 try{
  const profile=freshProfile();profile.onboarded=true;profile.beginnerStage=2;
  profile.session={id:'m-1',level:0,beginnerStage:2,index:0,results:[],questionIds:['f2-1','f2-2','f2-3','f2-4','f2-5','f2-6','f2-7','f2-8'],overrides:{},variants:{}};
  const memory=new Map([[STORAGE_KEY,JSON.stringify(profile)]]),listeners={},audios=[],spoken=[];
  const app={innerHTML:'',addEventListener:(name,fn)=>listeners[name]=fn};
  globalThis.SpeechSynthesisUtterance=class{constructor(text){this.text=text;}};
  globalThis.speechSynthesis={cancel(){},getVoices:()=>[{lang:'fr-FR'}],speak:u=>spoken.push(u)};
  globalThis.window={SpeechSynthesisUtterance,speechSynthesis,Audio:class{constructor(){audios.push(this);}play(){return Promise.resolve();}pause(){}removeAttribute(){}}};
  globalThis.localStorage={getItem:key=>memory.get(key),setItem:(key,value)=>memory.set(key,value)};
  globalThis.document={body:{dataset:{}},documentElement:{style:{setProperty(){}}},addEventListener(){},querySelector(selector){return selector==='#app'?app:selector==='dialog[open]'?null:{focus(){}};}};
  await import('../app/app.js?recorded-voice-integration');
  const click=(action,extra={})=>listeners.click({target:{closest:()=>({dataset:{action,...extra}})},preventDefault(){}});
  click('resume');assert.equal(audios.at(-1).src,'/audio/voice/fr-fr/ma.mp3');assert.equal(spoken.length,0);
  audios.at(-1).onerror();assert.equal(spoken.at(-1).text,'ma');
  assert.equal(parseProfile(memory.get(STORAGE_KEY)).session.attempts,0);
  click('repeat');audios.at(-1).onplaying();click('answer',{answer:'0'});const clip=audios.at(-1);clip.onplaying();const beforePraise=audios.length;clip.onended();
  assert.equal(audios.length,beforePraise);await new Promise(resolve=>setTimeout(resolve,500));
  assert.equal(audios.at(-1).src,'/audio/voice/fr-fr/bravo.mp3');
  click('next');assert.equal(spoken.at(-1).text,'mi');
  click('pause'); // No late recording or praise may resume after navigation.
 }finally{recordedVoiceEntries.splice(0,recordedVoiceEntries.length,...original);}
});
