import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {audioRelease} from '../content/audio-release.mjs';
import {voiceLibrary} from '../content/voice-library.mjs';
import {soundCurriculum,pilotSoundExercises,audioReadiness} from '../content/sound-curriculum.mjs';
import {completeSoundExercises} from '../content/sound-exercises.mjs';
import {inspectSoundPilot} from './sound-pilot-release.mjs';
import {inspectSoundCoverage} from './sound-coverage-release.mjs';
import {normalizeSpeech} from '../app/voice-recordings.js';

export async function inspectVoiceLibrary({entries=voiceLibrary,root=resolve('app')}={}){
 const issues=[],ids=new Set(),paths=new Map(),clips=[];
 if(!entries.length)issues.push('bibliothèque vocale vide');
 for(const entry of entries){
  const fail=message=>issues.push(`${entry.id || 'sans identifiant'} : ${message}`);
  if(typeof entry.id!=='string'||!/^[a-z0-9-]{1,80}$/.test(entry.id)||ids.has(entry.id))fail('identifiant invalide ou dupliqué');ids.add(entry.id);
  const speech=normalizeSpeech(entry.speech);if(!speech||speech.length>1000)fail('texte absent ou trop long');
  if(!entry.audio){fail('métadonnées audio absentes');continue;}
  const readiness=audioReadiness(entry,{directory:'voice'});readiness.issues.forEach(fail);
  if(!readiness.metadataReady)continue;
  if(!/^[a-f0-9]{64}$/.test(entry.audio.sha256 || '')){fail('empreinte absente');continue;}
  if(paths.has(entry.audio.file))fail(paths.get(entry.audio.file)!==speech?'même fichier attribué à deux textes différents':'fichier dupliqué dans la bibliothèque');
  paths.set(entry.audio.file,speech);
  try{
   const bytes=await readFile(resolve(root,'.'+entry.audio.file));
   if(!(bytes.subarray(0,3).toString()==='ID3'||(bytes[0]===0xff&&(bytes[1]&0xe0)===0xe0))){fail('signature MP3 invalide');continue;}
   if(createHash('sha256').update(bytes).digest('hex')!==entry.audio.sha256){fail('fichier différent de celui relu');continue;}
   clips.push({id:entry.id,speech,file:entry.audio.file});
  }catch{fail('fichier introuvable');}
 }
 return {ready:issues.length===0,issues,entries:issues.length?[]:clips};
}
export async function generateRecordedContent({release=audioRelease,curriculum=soundCurriculum,pilot=pilotSoundExercises,coverage=completeSoundExercises,voices=voiceLibrary,root=resolve('app')}={}){
 const questions=[],voiceEntries=[];
 if(release.pilot){
  const report=await inspectSoundPilot({curriculum,exercises:pilot,root});
  if(!report.ready)throw new Error('Activation du pilote refusée : '+report.issues.join(' ; '));
  questions.push(...report.questions);
 }
 if(release.coverage){
  const report=await inspectSoundCoverage({curriculum,exercises:coverage,root});
  if(!report.ready)throw new Error('Activation de la couverture refusée : '+report.issues.join(' ; '));
  questions.push(...report.questions);
 }
 if(release.voice){
  const report=await inspectVoiceLibrary({entries:voices,root});
  if(!report.ready)throw new Error('Activation de la voix refusée : '+report.issues.join(' ; '));
  voiceEntries.push(...report.entries);
 }
 const ids=questions.map(question=>question.id);if(new Set(ids).size!==ids.length)throw new Error('Identifiants audio dupliqués.');
 const serialize=value=>JSON.stringify(value).replace(/</g,'\\u003c');
 return `// Generated from explicitly enabled, checked recordings.\nexport const recordedSoundQuestions = ${serialize(questions)};\nexport const recordedVoiceEntries = ${serialize(voiceEntries)};\n`;
}
