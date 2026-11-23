export const SPEECH_LANGUAGE = 'fr-FR';
export const DEFAULT_SPEECH_RATE = 0.8;
export const SPEECH_RATES = [0.7,0.8,0.9];
export const speechRate = value => SPEECH_RATES.includes(value) ? value : DEFAULT_SPEECH_RATE;
export const voiceKey = voice => voice.voiceURI || `${voice.lang}:${voice.name || ''}`;
const locale = voice => (voice.lang || '').toLowerCase().replaceAll('_','-');
const voiceScore = voice => {
  const name = `${voice.name || ''} ${voice.voiceURI || ''}`;
  let value = locale(voice) === 'fr-fr' ? 100 : 0;
  // Voice names are hints, not an acoustic quality or age certification.
  if (/natural|neural|premium|enhanced|amélior|multilingual|siri/i.test(name)) value += 400;
  if (/google|microsoft.*online/i.test(name)) value += 200;
  if (/child|enfant|junior|jeune/i.test(name)) value += 40;
  if (/audrey|aurélie|amelie|amélie|denise|henri/i.test(name)) value += 20;
  if (/compact|espeak|mbrola/i.test(name)) value -= 500;
  return value;
};
export function frenchVoices(voices) {
  return voices.filter(voice => locale(voice) === 'fr' || locale(voice).startsWith('fr-'))
    .sort((a,b)=>voiceScore(b)-voiceScore(a));
}
export function preferredFrenchVoice(voices, preferred = '') {
  const french = frenchVoices(voices);
  return french.find(voice=>preferred && voiceKey(voice)===preferred) || french[0];
}
// Slow the delivery without imitating a child by artificially raising the pitch.
export function frenchUtterance(text, Utterance, voices, settings = {}) {
  // Familiar French homophones anchor isolated syllables for speech engines.
  const syllablePronunciations = { fu:'fut', to:'tôt', lo:'lot', pa:'pas' };
  const key = typeof text === 'string' ? text.trim().toLowerCase() : '';
  const spokenText = Object.hasOwn(syllablePronunciations, key) ? syllablePronunciations[key] : text;
  const utterance = new Utterance(spokenText);
  utterance.lang = SPEECH_LANGUAGE;
  utterance.rate = speechRate(settings.speechRate);
  utterance.pitch = 1;
  const voice = preferredFrenchVoice(voices,settings.speechVoice);
  if (voice) utterance.voice = voice;
  return utterance;
}

// Keep praise warm and varied, while respecting the chosen slower pace.
export function createPraiseVariation(random = Math.random) {
  const variations = [
    {pitch:1.06,factor:1.02},
    {pitch:1.10,factor:1.04},
    {pitch:1.08,factor:0.99},
    {pitch:1.04,factor:1.06}
  ];
  let previous = -1;
  return (rate = DEFAULT_SPEECH_RATE) => {
    const choices = variations.map((_,index)=>index).filter(index=>index!==previous);
    previous = choices[Math.min(choices.length-1,Math.max(0,Math.floor(random()*choices.length)))];
    const variation=variations[previous];
    return {pitch:variation.pitch,rate:Math.min(0.95,Number((speechRate(rate)*variation.factor).toFixed(3)))};
  };
}
