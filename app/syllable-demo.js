// A separate example teaches the gesture without exposing the current answer.
export function createSyllableDemo(question) {
  const excluded = new Set([question.listen,...question.options]);
  const options = [['po','pu'],['fa','fi'],['ta','tu'],['la','li']].find(pair=>pair.every(value=>!excluded.has(value)));
  return {target:options[0],options,rejected:[],correct:false};
}
export function answerSyllableDemo(current,value) {
  const state=structuredClone(current);
  if(state.correct || !state.options.includes(value) || state.rejected.includes(value))return state;
  if(value===state.target)state.correct=true;
  else state.rejected.push(value);
  return state;
}
export function renderSyllableDemo(state) {
  return `<div class="dialog-heading"><h2 id="confirm-title">Un exemple</h2><button class="tool" id="demo-close" aria-label="Revenir à mon exercice">←</button></div><div class="syllable-demo"><button class="word-mystery" id="demo-listen" aria-label="Écouter la syllabe de l’exemple"><svg class="nav-picture" viewBox="0 0 100 100" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="6"><path d="m48 23-20 16H14v23h14l20 16zm14 12q19 15 0 30m14-43q30 28 0 56"/></svg></button>${state.correct ? `<div class="demo-success" role="status"><span>${state.target}</span><span aria-hidden="true">✓</span></div><button class="next-picture" id="demo-done" aria-label="Revenir à mon exercice">→</button>` : `<div class="demo-choices">${state.options.map((value,index)=>state.rejected.includes(value)?`<div class="demo-card rejected">${value}</div>`:`<button class="demo-card ${value===state.target?'demo-target':''}" data-demo-answer="${index}" aria-label="Essayer ${value}"><span>${value}</span>${value===state.target?'<span class="demo-finger" aria-hidden="true">☝</span>':''}</button>`).join('')}</div>`}</div>`;
}
