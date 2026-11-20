import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {soundCurriculum,audioReadiness} from '../content/sound-curriculum.mjs';
import {completeSoundExercises} from '../content/sound-exercises.mjs';

export async function inspectSoundCoverage({curriculum=soundCurriculum,exercises=completeSoundExercises,root=resolve('app')}={}){
 const units=new Map(curriculum.map(unit=>[unit.id,unit]));
 const issues=[],files=new Map(),ids=new Set();
 const expectedIds=new Set(completeSoundExercises.map(ex=>ex.id));
 if(exercises.length!==expectedIds.size || exercises.some(ex=>!expectedIds.has(ex.id)))issues.push('Couverture incomplète : tous les essais du catalogue sont requis.');
 for(const ex of exercises){
  const fail=message=>issues.push(`${ex.id} : ${message}`);
  if(ids.has(ex.id))fail('identifiant dupliqué');ids.add(ex.id);
  if(ex.review!=='approved')fail('exercice non relu');
  if(ex.ttsFallback!==null)fail('substitution TTS interdite');
  if(!['recorded-word','recorded-sound'].includes(ex.audioMode))fail('mode audio invalide');
  if(!Array.isArray(ex.choices)||ex.choices.length!==2||ex.choices.some(choice=>typeof choice!=='string'||!choice.trim())||new Set(ex.choices).size!==2||![0,1].includes(ex.answer)){
   fail('propositions ou correction invalides');continue;
  }
  const unit=units.get(ex.targetSoundId);
  if(ex.targetSoundId!==null&&!unit){fail('son absent du catalogue');continue;}
  if(ex.audioMode==='recorded-sound' && (!unit || !unit.graphemes.includes(ex.choices[ex.answer]) || ex.audioCue!==unit.phoneticValue))fail('correspondance du son incorrecte');
  if(ex.audioMode==='recorded-word' && ex.audioCue!==ex.choices[ex.answer])fail('mot enregistré différent de la réponse');
  const entry=ex.audioMode==='recorded-word'?{contentReview:ex.review,audio:ex.contextAudio}:unit;
  if(!entry?.audio){fail('métadonnées audio absentes');continue;}
  const readiness=audioReadiness(entry);
  readiness.issues.forEach(fail);
  if(!readiness.metadataReady)continue;
  const clip=entry.audio;
  if(!/^[a-f0-9]{64}$/.test(clip.sha256||'')){fail('empreinte du fichier relu absente');continue;}
  try{
   const bytes=await readFile(resolve(root,'.'+clip.file));
   if(!(bytes.subarray(0,3).toString()==='ID3'||(bytes[0]===0xff&&(bytes[1]&0xe0)===0xe0))){fail('signature MP3 invalide');continue;}
   const hash=createHash('sha256').update(bytes).digest('hex');
   if(hash!==clip.sha256){fail('fichier différent de celui relu');continue;}
   const cue=`${ex.audioMode}:${ex.audioCue}`;
   if(files.has(clip.file)&&files.get(clip.file).cue!==cue)fail('même fichier attribué à deux cibles différentes');
   files.set(clip.file,{file:clip.file,sha256:hash,cue});
  }catch{fail('fichier introuvable');}
 }
 const ready=issues.length===0;
 return {ready,issues,files:[...files.values()],questions:ready?exercises.map((ex,index)=>({
  id:`f1-${201+index}`,competency:ex.audioMode==='recorded-word'?'word-listen':['a','i','o','u','e-closed','e-open','schwa'].includes(ex.targetSoundId)?'vowel-sound':'consonant-sound',type:ex.audioMode==='recorded-word'?'sound_context_word':'phoneme_sound',
  foundation:true,visualAids:false,requiresAudio:true,text:'',instruction:ex.instruction,
  options:[...ex.choices],answer:ex.answer,hint:'Réécoute.',
  recordedAudio:ex.audioMode==='recorded-word'?ex.contextAudio.file:units.get(ex.targetSoundId).audio.file,
  recordedSoundId:ex.targetSoundId,audioMode:ex.audioMode
 })):[]};
}
