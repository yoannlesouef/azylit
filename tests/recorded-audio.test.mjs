import test from 'node:test';
import assert from 'node:assert/strict';
import {createRecordedAudioPlayer} from '../app/recorded-audio.js';
import {exerciseSpeech} from '../app/exercise-speech.js';
function fixture(){const audios=[];const player=createRecordedAudioPlayer(()=>{const audio={play:()=>Promise.resolve(),pause(){this.paused=true;},removeAttribute(){this.src='';}};audios.push(audio);return audio;});return {player,audios};}
test('la réécoute et l’arrêt neutralisent les événements et promesses de l’ancien fichier',async()=>{
 const {player,audios}=fixture();let ends=0,errors=0;
 player.play('/audio/sounds/fr-fr/f-v1.mp3',{onEnd:()=>ends++,onError:()=>errors++});
 const lateEnd=audios[0].onended,lateError=audios[0].onerror;
 player.play('/audio/sounds/fr-fr/l-v1.mp3');lateEnd();lateError();
 assert.equal(ends,0);assert.equal(errors,0);assert.equal(audios[0].paused,true);
 player.stop();assert.equal(audios[1].paused,true);
 let reject;const pending=createRecordedAudioPlayer(()=>({play:()=>new Promise((_,fail)=>reject=fail),pause(){},removeAttribute(){}}));
 pending.play('/audio/sounds/fr-fr/f-v1.mp3',{onError:()=>errors++});pending.stop();reject(new Error('cancelled'));await Promise.resolve();
 assert.equal(errors,0);
});
test('les erreurs de chargement, d’autoplay et les chemins non locaux sont explicites',async()=>{
 const {player,audios}=fixture();let errors=0;
 player.play('https://example.org/f.mp3',{onError:()=>errors++});assert.equal(errors,1);assert.equal(audios.length,0);
 player.play('/audio/sounds/fr-fr/../../f.mp3',{onError:()=>errors++});assert.equal(errors,2);
 player.play('/audio/sounds/fr-fr/f-v1.mp3',{onError:()=>errors++});audios[0].onerror();assert.equal(errors,3);
 const blocked=createRecordedAudioPlayer(()=>({play:()=>Promise.reject(new Error('NotAllowedError')),pause(){},removeAttribute(){}}));
 blocked.play('/audio/sounds/fr-fr/f-v1.mp3',{onError:()=>errors++});await Promise.resolve();assert.equal(errors,4);
 assert.equal(exerciseSpeech({recordedAudio:'/audio/sounds/fr-fr/f-v1.mp3',foundation:true,listen:'effe'}),null);
});
test('un chargement qui ne démarre pas ne bloque pas indéfiniment le parcours',async()=>{
 let errors=0;const player=createRecordedAudioPlayer(()=>({play:()=>new Promise(()=>{}),pause(){},removeAttribute(){}}),10);
 player.play('/audio/sounds/fr-fr/f-v1.mp3',{onError:()=>errors++});await new Promise(resolve=>setTimeout(resolve,25));assert.equal(errors,1);
});
