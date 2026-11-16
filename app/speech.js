export const SPEECH_LANGUAGE = 'fr-FR';
export function preferredFrenchVoice(voices) {
  const locale = voice => voice.lang.toLowerCase().replace('_', '-');
  const score = voice => {
    const name = voice.name || '';
    let value = locale(voice) === 'fr-fr' ? 1000 : 0;
    if (/natural|neural|premium|enhanced|amélior|multilingual/i.test(name)) value += 200;
    if (/google|microsoft.*online/i.test(name)) value += 100;
    if (/audrey|aurélie|amelie|amélie|denise|henri/i.test(name)) value += 30;
    if (/compact|espeak|mbrola/i.test(name)) value -= 100;
    return value;
  };
  return voices.filter(voice => locale(voice) === 'fr' || locale(voice).startsWith('fr-'))
    .sort((a, b) => score(b) - score(a))[0];
}
// Leave the voice's own intonation intact; excessive slowing makes syllables sound mechanical.
export function frenchUtterance(text, Utterance, voices) {
  const utterance = new Utterance(text);
  utterance.lang = SPEECH_LANGUAGE;
  utterance.rate = 0.97;
  utterance.pitch = 1;
  const voice = preferredFrenchVoice(voices);
  if (voice) utterance.voice = voice;
  return utterance;
}
