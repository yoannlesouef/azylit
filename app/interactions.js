// Small deterministic engines shared by the UI, persistence recovery and tests.
export function interactionFor(question, saved) {
  const initial = { questionId: question.id, selectedSource: null, matched: [], picked: [], cuts: [] };
  if (!saved || saved.questionId !== question.id) return initial;
  if (question.mechanic === 'pairs') {
    initial.matched = [...new Set((Array.isArray(saved.matched) ? saved.matched : []).filter(i => Number.isInteger(i) && i >= 0 && i < question.pairs.length))];
    if (Number.isInteger(saved.selectedSource) && saved.selectedSource >= 0 && saved.selectedSource < question.pairs.length && !initial.matched.includes(saved.selectedSource)) initial.selectedSource = saved.selectedSource;
  }
  if (question.mechanic === 'build') {
    for (const index of Array.isArray(saved.picked) ? saved.picked : []) {
      if (!Number.isInteger(index) || index < 0 || index >= question.tiles.length || initial.picked.includes(index) || question.tiles[index] !== question.parts[initial.picked.length]) break;
      initial.picked.push(index);
    }
  }
  if(question.mechanic==='segment')initial.cuts=[...new Set((Array.isArray(saved.cuts)?saved.cuts:[]).filter(index=>Number.isInteger(index)&&index>=0&&index<question.segments.length-1))].sort((a,b)=>a-b);
  return initial;
}
export function applyInteraction(question, saved, action, index) {
  const state = interactionFor(question, saved);
  const outcome = event => ({ state, event });
  if (question.mechanic === 'pairs') {
    if (state.matched.length === question.pairs.length) return outcome('idle');
    if (action === 'source' && Number.isInteger(index) && question.pairs[index] !== undefined && !state.matched.includes(index)) { state.selectedSource = index; return outcome('selected'); }
    if (action !== 'target' || state.selectedSource === null || !Number.isInteger(index) || question.pairOrder[index] === undefined || state.matched.includes(question.pairOrder[index])) return outcome('idle');
    if (question.pairOrder[index] !== state.selectedSource) return outcome('incorrect');
    state.matched.push(state.selectedSource); state.selectedSource = null;
    return outcome(state.matched.length === question.pairs.length ? 'complete' : 'progress');
  }
  if (question.mechanic === 'build') {
    if (state.picked.length === question.parts.length) return outcome('idle');
    if (action === 'undo' && state.picked.length) { state.picked.pop(); return outcome('undo'); }
    if (action !== 'tile' || !Number.isInteger(index) || index < 0 || index >= question.tiles.length || state.picked.includes(index)) return outcome('idle');
    if (question.tiles[index] !== question.parts[state.picked.length]) return outcome('incorrect');
    state.picked.push(index);
    return outcome(state.picked.length === question.parts.length ? 'complete' : 'progress');
  }
  if(question.mechanic==='segment'){
    if(action==='cut'&&Number.isInteger(index)&&index>=0&&index<question.segments.length-1){state.cuts=state.cuts.includes(index)?state.cuts.filter(value=>value!==index):[...state.cuts,index].sort((a,b)=>a-b);return outcome('progress');}
    if(action==='check')return outcome(JSON.stringify(state.cuts)===JSON.stringify(question.boundaries)?'complete':'incorrect');
  }
  return outcome('idle');
}
export function completedText(question) {
  if(question.mechanic==='segment')return question.segments.map((part,index)=>part+(question.boundaries.includes(index)?' ':'')).join('');
  if(question.mechanic==='reading')return question.text;
  if (question.mechanic === 'pairs') return question.pairs.join(' · ');
  if (question.mechanic === 'build') return question.parts.join(question.unit==='sentences'?' ':'');
  return question.options[question.answer];
}
