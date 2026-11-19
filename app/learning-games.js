const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
export function renderSegmentation(question,state,guided=false){
 return `<div class="cut-board" aria-label="Séparer les mots"><div class="cut-line">${question.segments.map((part,index)=>`<span class="cut-piece">${escape(part)}</span>${index<question.segments.length-1?`<button class="cut-gap ${state.cuts.includes(index)?'has-space':''} ${guided&&question.boundaries.includes(index)?'guided':''}" data-action="cut-gap" data-card="${index}" aria-label="${state.cuts.includes(index)?'Retirer':'Ajouter'} un espace après ${escape(part)}" aria-pressed="${state.cuts.includes(index)}"><span aria-hidden="true">${state.cuts.includes(index)?'␣':'⋮'}</span></button>`:''}`).join('')}</div><button class="next-picture cut-check" data-action="cut-check" aria-label="Vérifier les espaces">✓</button></div>`;
}
export function renderReadingControl(active){
 return `<div class="reading-controls"><button class="next-picture" data-action="${active?'reading-stop':'reading-start'}" aria-label="${active?'J’ai terminé ma lecture':'Commencer ma lecture'}"><span aria-hidden="true">${active?'■':'▶'}</span></button></div>`;
}
// Draft, explicitly segmented texts: no spelling heuristic guesses silent letters.
const tokens={chat:[{text:'cha'},{text:'t',kind:'silent'}],bateau:[{text:'bat'},{text:'eau',kind:'complex'}],mouton:[{text:'m'},{text:'ou',kind:'complex'},{text:'t'},{text:'on',kind:'complex'}],oiseau:[{text:'oi',kind:'complex'},{text:'s'},{text:'eau',kind:'complex'}],pluie:[{text:'plui'},{text:'e',kind:'silent'}],petit:[{text:'peti'},{text:'t',kind:'silent'}],blanc:[{text:'blan'},{text:'c',kind:'silent'}]};
export function readingMarkup(text,settings,question={}){
 if(question.visualAids===false || question.discrimination)return escape(text);
 return String(text).split(/(\s+|[.,!?;:])/).map(word=>{
  const parts=tokens[word.toLowerCase()];
  if(!parts)return escape(word);
  let offset=0;
  return parts.map(part=>{
   const actual=word.slice(offset,offset+part.text.length);offset+=part.text.length;
   const cls=part.kind==='silent'&&settings.silentLetters?'silent-letter':part.kind==='complex'&&settings.complexSounds?'complex-sound':'';
   return cls?`<span class="${cls}">${escape(actual)}</span>`:escape(actual);
  }).join('');
 }).join('');
}
export function renderStoryOrder(question,state,guided=false){
 return `<div class="story-board"><div class="story-progress" aria-label="${state.picked.length} phrases placées sur ${question.parts.length}">${question.parts.map((_,index)=>`<span aria-hidden="true">${index<state.picked.length?'●':'○'}</span>`).join(' ')}</div>${state.picked.length?`<ol class="story-placed">${state.picked.map(index=>`<li>${escape(question.tiles[index])}</li>`).join('')}</ol><button class="assembly-undo" data-action="build-undo" aria-label="Retirer la dernière phrase">↶</button>`:''}<div class="story-tiles">${question.tiles.map((tile,index)=>state.picked.includes(index)?'':`<div class="story-card"><button class="assembly-tile ${guided&&tile===question.parts[state.picked.length]?'guided':''}" data-action="build-tile" data-card="${index}" data-shortcut="${index+1}">${escape(tile)}</button><button class="tool story-listen" data-action="story-audio" data-card="${index}" aria-label="Écouter : ${escape(tile)}">🔊</button></div>`).join('')}</div></div>`;
}
