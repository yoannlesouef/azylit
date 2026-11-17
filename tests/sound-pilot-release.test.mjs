import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import {inspectSoundPilot} from '../scripts/sound-pilot-release.mjs';
import {soundCurriculum,pilotSoundExercises} from '../content/sound-curriculum.mjs';
test('le pilote actuel ne peut pas être exporté comme prêt sans fichiers ni relecture',async()=>{
 const report=await inspectSoundPilot();assert.equal(report.ready,false);assert.deepEqual(report.questions,[]);
 assert.ok(report.issues.some(issue=>issue.includes('exercice non relu')));
 assert.ok(report.issues.some(issue=>issue.includes('fichier audio absent')));
});
test('une revue de livraison exige le fichier relu exact et conserve les identifiants existants',async()=>{
 const root=await mkdtemp(join(tmpdir(),'azylit-pilot-'));
 const curriculum=structuredClone(soundCurriculum),exercises=structuredClone(pilotSoundExercises);
 try{
  await mkdir(join(root,'audio/sounds/fr-fr'),{recursive:true});
  // Synthetic byte fixture checks the pipeline only; it is neither playable audio nor a professional review.
  const bytes=Buffer.from('ID3 synthetic test fixture');
  for(const id of ['l','r','f','j']){
   const entry=curriculum.find(entry=>entry.id===id);entry.contentReview='approved';
   Object.assign(entry.audio,{file:`/audio/sounds/fr-fr/${id}-v1.mp3`,sha256:createHash('sha256').update(bytes).digest('hex'),source:'Test fixture',rights:'Test only',reviewer:'Test only',reviewedAt:'2026-11-18',pronunciationReview:'approved',deviceCheck:'passed'});
   await writeFile(join(root,'.'+entry.audio.file),bytes);
  }
  exercises.forEach(exercise=>exercise.review='approved');
  let report=await inspectSoundPilot({curriculum,exercises,root});assert.equal(report.ready,true);
  assert.deepEqual(report.questions.map(question=>question.id),Array.from({length:8},(_,index)=>`f1-${index+17}`));
  assert.ok(report.questions.every(question=>question.recordedAudio && !question.listen));
  await writeFile(join(root,'audio/sounds/fr-fr/f-v1.mp3'),Buffer.from('ID3 changed after review'));
  report=await inspectSoundPilot({curriculum,exercises,root});assert.equal(report.ready,false);assert.deepEqual(report.questions,[]);
  assert.ok(report.issues.some(issue=>issue.includes('diffère')));
 }finally{await rm(root,{recursive:true,force:true});}
});
