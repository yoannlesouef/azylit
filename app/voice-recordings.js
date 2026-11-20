import {isRecordedAudioPath} from './recorded-audio.js';
export const normalizeSpeech = value => typeof value==='string'?value.normalize('NFC').replace(/\s+/g,' ').trim():'';
export function createVoiceRecordings(entries,random=Math.random){
 const clips=new Map(),previous=new Map();
 for(const entry of entries){
  const key=normalizeSpeech(entry.speech);
  if(!key || !isRecordedAudioPath(entry.file) || !entry.file.startsWith('/audio/voice/'))continue;
  if(!clips.has(key))clips.set(key,[]);
  if(!clips.get(key).includes(entry.file))clips.get(key).push(entry.file);
 }
 return {
  has(text){return clips.has(normalizeSpeech(text));},
  next(text){
   const key=normalizeSpeech(text),all=clips.get(key);if(!all?.length)return null;
   const alternatives=all.filter(file=>file!==previous.get(key));
   const choices=alternatives.length?alternatives:all;
   const file=choices[Math.min(choices.length-1,Math.max(0,Math.floor(random()*choices.length)))];
   previous.set(key,file);return file;
  }
 };
}
