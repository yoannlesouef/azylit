import {frenchVoices,preferredFrenchVoice,voiceKey,speechRate,SPEECH_RATES} from './speech.js';
const escape = value => String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
export function voiceOptions(settings,voices){
 const options=frenchVoices(voices),selected=settings.speechVoice || '';
 const unavailable=selected && !options.some(voice=>voiceKey(voice)===selected);
 return `<option value="" ${selected?'':'selected'}>Automatique · voix française privilégiée</option>${unavailable?`<option value="${escape(selected)}" selected disabled>Voix choisie indisponible · remplacement automatique</option>`:''}${options.map(voice=>`<option value="${escape(voiceKey(voice))}" ${voiceKey(voice)===selected?'selected':''}>${escape(voice.name || 'Voix française')} (${escape(voice.lang)})</option>`).join('')}`;
}
export function renderVoiceSettings(settings,voices,available){
 return `<fieldset class="adult-voice-settings"><legend>Voix et rythme</legend><label for="speech-voice">Voix française</label><select id="speech-voice" ${available?'':'disabled'}>${voiceOptions(settings,voices)}</select><label for="speech-rate">Vitesse de parole</label><select id="speech-rate" ${available?'':'disabled'}>${SPEECH_RATES.map((value,index)=>`<option value="${value}" ${speechRate(settings.speechRate)===value?'selected':''}>${['Très lent','Lent · par défaut','Modéré'][index]}</option>`).join('')}</select><button class="secondary" id="speech-preview" ${available?'':'disabled'}>Écouter cette voix</button><p id="speech-status" role="status"></p><p>Les voix proposées dépendent de cet appareil. Une voix d’enfant n’est proposée que si elle est disponible dans sa liste. Les sons enregistrés gardent leur prononciation d’origine.</p></fieldset>`;
}
export function bindVoiceSettings(dialog,settings,engine,{save,preview}){
 const select=dialog.querySelector('#speech-voice'),rate=dialog.querySelector('#speech-rate'),status=dialog.querySelector('#speech-status');
 const refresh=()=>{
  const voices=engine?.getVoices() || [];
  select.innerHTML=voiceOptions(settings,voices);
  const voice=preferredFrenchVoice(voices,settings.speechVoice);
  status.textContent=voice?`Voix utilisée : ${voice.name || 'voix française'}.`:'Aucune voix française annoncée pour le moment. Réessayez l’écoute une fois les voix chargées.';
 };
 select.onchange=()=>{
  const value=select.value;
  if(value && !frenchVoices(engine?.getVoices() || []).some(voice=>voiceKey(voice)===value))return;
  settings.speechVoice=value;save();refresh();preview();
 };
 rate.onchange=()=>{
  const value=Number(rate.value);if(!SPEECH_RATES.includes(value))return;
  settings.speechRate=value;save();preview();
 };
 dialog.querySelector('#speech-preview').onclick=preview;
 engine?.addEventListener?.('voiceschanged',refresh);
 const cleanup=()=>engine?.removeEventListener?.('voiceschanged',refresh);
 dialog.addEventListener('close',cleanup,{once:true});
 refresh();return cleanup;
}
