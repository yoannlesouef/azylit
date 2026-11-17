import { alphabet } from './discovery-data.js';
// Only the learning target is spoken for foundation exercises, without framing sentences.
export function exerciseSpeech(question, interaction = null) {
  if(question.recordedAudio)return null; // Never synthesize a phoneme recording's label.
  if (!question.foundation) return question.instruction + (question.listen ? ' ' + question.listen : '');
  if (question.mechanic === 'pairs') {
    const index = interaction?.selectedSource ?? question.pairs.findIndex((_,i) => !interaction?.matched?.includes(i));
    const letter = question.pairs[index];
    return alphabet.find(item => item.lower === letter?.toLowerCase())?.speech || letter || '';
  }
  if (question.type === 'letter_match') return alphabet.find(item => item.lower === question.text.toLowerCase())?.speech || question.text;
  return question.listen || question.text || '';
}
