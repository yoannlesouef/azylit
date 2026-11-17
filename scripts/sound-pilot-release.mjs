import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {soundCurriculum,pilotSoundExercises,audioReadiness} from '../content/sound-curriculum.mjs';
// This checker never appends to the live bank or changes a child's saved mission.
export async function inspectSoundPilot({curriculum=soundCurriculum,exercises=pilotSoundExercises,root=resolve('app')}={}){
 const map=new Map(curriculum.map(entry=>[entry.id,entry]));const issues=[],files=[];
 for(const id of new Set(exercises.map(exercise=>exercise.targetSoundId))){
  const entry=map.get(id);if(!entry){issues.push(`${id} : unité absente`);continue;}
  const readiness=audioReadiness(entry);
  for(const issue of readiness.issues)issues.push(`${id} : ${issue}`);
  if(!readiness.metadataReady)continue;
  if(!/^[a-f0-9]{64}$/.test(entry.audio.sha256 || '')){issues.push(`${id} : empreinte du fichier relu absente`);continue;}
  try{
   const data=await readFile(resolve(root,'.'+entry.audio.file));
   const signature=data.subarray(0,3).toString()==='ID3' || (data[0]===0xff && (data[1]&0xe0)===0xe0);
   if(!signature){issues.push(`${id} : signature MP3 invalide`);continue;}
   const hash=createHash('sha256').update(data).digest('hex');
   if(hash!==entry.audio.sha256){issues.push(`${id} : le fichier diffère de celui relu`);continue;}
   files.push({soundId:id,file:entry.audio.file,sha256:hash});
  }catch{issues.push(`${id} : fichier introuvable`);}
 }
 for(const exercise of exercises){
  if(exercise.review!=='approved')issues.push(`${exercise.id} : exercice non relu`);
  const target=map.get(exercise.targetSoundId);
  const choices=exercise.choices.map(choice=>map.get(choice.soundId));
  if(!target || exercise.choices.length!==2 || choices.some(choice=>!choice) || exercise.choices[exercise.answer]?.soundId!==exercise.targetSoundId)issues.push(`${exercise.id} : correction invalide`);
  else if(new Set(choices.map(choice=>choice.phoneticValue)).size!==2)issues.push(`${exercise.id} : propositions homophones`);
 }
 const ready=issues.length===0 && exercises.length===8 && files.length===new Set(exercises.map(exercise=>exercise.targetSoundId)).size;
 const questions=ready?exercises.map((exercise,index)=>({
  id:`f1-${index+17}`,type:'phoneme_sound',foundation:true,visualAids:false,requiresAudio:true,
  instruction:exercise.instruction,text:'',options:exercise.choices.map(choice=>choice.grapheme),answer:exercise.answer,
  hint:'Réécoute le son.',recordedAudio:map.get(exercise.targetSoundId).audio.file,recordedSoundId:exercise.targetSoundId
 })):[];
 return {ready,issues,files,questions};
}
