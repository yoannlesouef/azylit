import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import {soundCurriculum} from '../content/sound-curriculum.mjs';
import {completeSoundExercises,soundCoverageReport} from '../content/sound-exercises.mjs';
import {inspectSoundCoverage} from '../scripts/sound-coverage-release.mjs';
test('toutes les unités et les lettres contextuelles ont des essais sans faux son h',()=>{
 const coverage=soundCoverageReport();assert.equal(coverage.map(row=>row.letter).join(''),'abcdefghijklmnopqrstuvwxyz');
 for(const unit of soundCurriculum)assert.equal(completeSoundExercises.filter(ex=>ex.targetSoundId===unit.id&&ex.id.startsWith('draft-full-')).length,2);
 for(const letter of ['c','g','q','s','w','x','y','h'])assert.ok(coverage.find(row=>row.letter===letter).contextualExamples.length);
 for(const ex of completeSoundExercises){assert.equal(ex.live,false);assert.equal(ex.ttsFallback,null);assert.equal(new Set(ex.choices).size,2);}
 for(const ex of completeSoundExercises.filter(ex=>ex.letter==='h')){assert.equal(ex.audioMode,'recorded-word');assert.equal(ex.targetSoundId,null);assert.equal(ex.assessment,'recognise-spoken-word');}
});
test('aucune nouvelle question exportée lorsque les enregistrements manquent',async()=>{
 const report=await inspectSoundCoverage();assert.equal(report.ready,false);assert.deepEqual(report.questions,[]);
 assert.ok(report.issues.some(issue=>issue.includes('fichier audio absent')));
 const incomplete=await inspectSoundCoverage({exercises:[]});assert.equal(incomplete.ready,false);
});
test('export complet uniquement avec fichiers relus, corrections valides et couverture entière',async()=>{
 const root=await mkdtemp(join(tmpdir(),'azylit-coverage-'));
 try{
  await mkdir(join(root,'audio/sounds/fr-fr'),{recursive:true});
  const curriculum=structuredClone(soundCurriculum),exercises=structuredClone(completeSoundExercises);
  const approve=async(audio,key)=>{
   // Pipeline fixture only; not playable audio or evidence of acoustic validation.
   const bytes=Buffer.from('ID3 synthetic '+key);
   Object.assign(audio,{file:`/audio/sounds/fr-fr/${key}.mp3`,sha256:createHash('sha256').update(bytes).digest('hex'),source:'Test',rights:'Test',reviewer:'Test',reviewedAt:'2026-11-18',pronunciationReview:'approved',deviceCheck:'passed'});
   await writeFile(join(root,'.'+audio.file),bytes);
  };
  for(const unit of curriculum){unit.contentReview='approved';await approve(unit.audio,unit.id);}
  for(const ex of exercises){ex.review='approved';if(ex.contextAudio)await approve(ex.contextAudio,'word-'+ex.audioCue);}
  let report=await inspectSoundCoverage({curriculum,exercises,root});assert.equal(report.ready,true);assert.equal(report.questions.length,104);
  assert.ok(report.questions.every(q=>q.recordedAudio&&!q.listen));assert.ok(report.questions.some(q=>q.type==='sound_context_word'));
  exercises[0].answer=1-exercises[0].answer;
  report=await inspectSoundCoverage({curriculum,exercises,root});assert.equal(report.ready,false);assert.deepEqual(report.questions,[]);
  exercises[0].answer=1-exercises[0].answer;
  await writeFile(join(root,'.'+curriculum[0].audio.file),Buffer.from('ID3 altered'));
  report=await inspectSoundCoverage({curriculum,exercises,root});assert.equal(report.ready,false);assert.ok(report.issues.some(issue=>issue.includes('différent')));
 }finally{await rm(root,{recursive:true,force:true});}
});
