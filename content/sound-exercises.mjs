import {soundCurriculum, letterSoundCoverage} from './sound-curriculum.mjs';

// Complete editorial staging, never imported by the child application.
// Contextual sounds need a separate whole-word recording: an isolated phoneme
// cannot tell a child whether /k/ is written c, k or qu.
const contextual = new Set(['schwa','o-open','eu-open','w-glide','y-glide','x-ks','x-gz']);
export const fullSoundExercises = soundCurriculum.flatMap((unit,index)=>{
 const wordContext=contextual.has(unit.id);
 const target=wordContext?unit.examples[0]:unit.graphemes[0];
 const distractor=wordContext?'moto':(unit.id==='a'?'i':'a');
 return [false,true].map(reverse=>({
  id:`draft-full-${unit.id}-${reverse?2:1}`,targetSoundId:unit.id,
  audioMode:wordContext?'recorded-word':'recorded-sound',
  audioCue:wordContext?target:unit.phoneticValue,
  // Whole-word context requires its own file and review, never the unit's isolated sound.
  contextAudio:wordContext?{...unit.audio}:null,
  choices:reverse?[distractor,target]:[target,distractor],answer:reverse?1:0,
  instruction:wordContext?'Écoute le mot. Retrouve-le.':'Écoute le son. Retrouve son écriture.',
  block:unit.block,order:index,review:'pending',ttsFallback:null,live:false
 }));
});
// Alternative spellings are contextual word tasks, not homophone distractors.
export const contextualLetterExercises = [
 ['c','k','carotte','salade'],['c','s','citron','moto'],
 ['g','g-hard','gare','lune'],['g','j','girafe','moto'],
 ['q','k','quatre','lune'],['s','s','sac','moto'],['s','z','rose','lune'],
 ['w','v','wagon','lune'],['w','w-glide','wapiti','moto'],
 ['y','i','stylo','moto'],['y','y-glide','yaourt','lune'],
 ['x','x-ks','taxi','lune'],['x','x-gz','examen','moto'],
 // H has no isolated target sound here; hearing a word is not evidence of decoding h.
 ['h',null,'hibou','moto'],['h',null,'haricot','lune']
].flatMap(([letter,targetSoundId,word,other])=>[false,true].map(reverse=>({
 id:`draft-context-${letter}-${word}-${reverse?2:1}`,letter,targetSoundId,
 audioMode:'recorded-word',audioCue:word,contextAudio:{...soundCurriculum[0].audio},
 choices:reverse?[other,word]:[word,other],answer:reverse?1:0,
 instruction:'Écoute le mot. Retrouve-le.',review:'pending',ttsFallback:null,live:false,
 assessment:letter==='h'?'recognise-spoken-word':'recognise-context-word'
})));
export const completeSoundExercises=[...fullSoundExercises,...contextualLetterExercises];
export function soundCoverageReport(){
 return letterSoundCoverage.map(entry=>({
  letter:entry.letter,mode:entry.mode,soundIds:entry.soundIds,
  contextualExamples:contextualLetterExercises.filter(ex=>ex.letter===entry.letter).map(ex=>ex.audioCue).filter((word,i,all)=>all.indexOf(word)===i),
  status:'prepared-not-live'
 }));
}
