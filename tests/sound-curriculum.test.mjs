import test from 'node:test';
import assert from 'node:assert/strict';
import {soundBlocks,soundCurriculum,letterSoundCoverage,pilotSoundExercises,audioReadiness} from '../content/sound-curriculum.mjs';
import {questionsFor} from '../app/data.js';
test('les 26 lettres sont documentées sans inventer un son unique pour les cas contextuels',()=>{
 assert.equal(letterSoundCoverage.map(item=>item.letter).join(''),'abcdefghijklmnopqrstuvwxyz');
 const ids=new Set(soundCurriculum.map(item=>item.id));assert.equal(ids.size,soundCurriculum.length);
 for(const letter of letterSoundCoverage){assert.ok(letter.note);for(const id of letter.soundIds)assert.ok(ids.has(id));}
 for(const letter of ['c','g','h','q','w','x','y'])assert.equal(letterSoundCoverage.find(item=>item.letter===letter).mode,'context');
 assert.deepEqual(letterSoundCoverage.find(item=>item.letter==='h').soundIds,[]);
 const blocks=new Map(soundBlocks.map(item=>[item.id,item]));
 function visit(id,path=[]){assert.ok(blocks.has(id));assert.ok(!path.includes(id));for(const previous of blocks.get(id).prerequisites)visit(previous,[...path,id]);}
 for(const id of blocks.keys())visit(id);
 for(const entry of soundCurriculum){assert.ok(blocks.has(entry.block));assert.equal(entry.ttsFallback,null);assert.equal(entry.audio.file,null);assert.equal(audioReadiness(entry).metadataReady,false);}
 assert.equal(soundCurriculum.find(item=>item.id==='oi').kind,'phoneme-sequence');
});
test('le pilote propose deux choix distincts, sans cartes homophones et sans mise en ligne implicite',()=>{
 const map=new Map(soundCurriculum.map(item=>[item.id,item]));
 assert.equal(pilotSoundExercises.length,8);
 assert.equal(new Set(pilotSoundExercises.map(item=>item.id)).size,8);
 for(const exercise of pilotSoundExercises){
  assert.equal(exercise.choices.length,2);assert.equal(exercise.choices[exercise.answer].soundId,exercise.targetSoundId);
  assert.equal(new Set(exercise.choices.map(item=>map.get(item.soundId).phoneticValue)).size,2);
  assert.equal(exercise.live,false);assert.equal(exercise.ttsFallback,null);
 }
 // This preparation does not change a child's saved plan or pretend to ship missing audio.
 const live=questionsFor(0,1);assert.equal(live.length,16);assert.deepEqual([...new Set(live.map(item=>item.listen))].sort(),['a','i','o','u']);
});
test('les champs de relecture, droits et contrôle appareils sont nécessaires mais ne vérifient pas le fichier',()=>{
 const entry=structuredClone(soundCurriculum.find(item=>item.id==='f'));
 entry.contentReview='approved';Object.assign(entry.audio,{file:'/audio/sounds/fr-fr/f-v1.mp3',source:'Enregistrement de test',rights:'Autorisation documentée',reviewer:'Relecture de test',reviewedAt:'2026-11-17',pronunciationReview:'approved',deviceCheck:'passed'});
 assert.equal(audioReadiness(entry).metadataReady,true);
 entry.audio.file='https://example.org/f.mp3';assert.equal(audioReadiness(entry).metadataReady,false);
 entry.audio.file='/audio/sounds/fr-fr/f-v1.mp3';entry.audio.pronunciationReview='pending';assert.equal(audioReadiness(entry).metadataReady,false);
});
