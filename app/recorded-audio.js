// Local recordings only. No pronunciation text or TTS fallback is accepted here.
export const isRecordedAudioPath = value => typeof value==='string' && /^\/audio\/sounds\/fr-fr\/[a-z0-9-]+\.mp3$/.test(value);
export function createRecordedAudioPlayer(createAudio,timeoutMs=8000){
 let active=null,sequence=0,timer;
 function stop(){
  sequence++;clearTimeout(timer);
  if(active){active.onplaying=null;active.onended=null;active.onerror=null;active.pause();active.removeAttribute?.('src');active=null;}
 }
 return {stop,play(file,callbacks={}){
  stop();const request=sequence;
  const fail=error=>{if(request!==sequence)return;stop();callbacks.onError?.(error);};
  if(!isRecordedAudioPath(file)){fail(new Error('Invalid recording path'));return;}
  try{
   const audio=createAudio();active=audio;let started=false;
   audio.preload='auto';audio.src=file;
   audio.onplaying=()=>{if(request!==sequence || started)return;started=true;clearTimeout(timer);callbacks.onStart?.();};
   audio.onended=()=>{if(request!==sequence)return;if(!started){fail(new Error('Recording ended before playback'));return;}stop();callbacks.onEnd?.();};
   audio.onerror=()=>fail(new Error('Recording unavailable'));
   timer=setTimeout(()=>fail(new Error('Recording did not start')),timeoutMs);
   Promise.resolve(audio.play()).catch(fail);
  }catch(error){fail(error);}
 }};
}
