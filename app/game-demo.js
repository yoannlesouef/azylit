import {applyInteraction,interactionFor} from './interactions.js';
import {renderSegmentation} from './learning-games.js';
const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
export function createGameDemo(source){
 const base={id:'demo',options:['poule','vache'],answer:0,instruction:'Un exemple. Pirate et poule commencent pareil. Touche poule.',hint:'Touche la carte montrée par la main.'};
 const mechanic=source.mechanic;
 if(mechanic==='build'){
  const target=source.unit==='sentences'?['Zia ouvre sa boîte.','Elle prend un crayon.','Elle dessine.']:source.unit==='letters'?['z','o']:['do','mi','no'];
  Object.assign(base,{mechanic:'build',parts:target,tiles:[...target].reverse(),instruction:'Un exemple. Touche les cartes dans l’ordre montré par la main.'});
 }else if(mechanic==='segment')Object.assign(base,{mechanic:'segment',segments:['Une','fée','rit'],boundaries:[0,1],instruction:'Un exemple. Touche les espaces montrés, puis la coche.'});
 else if(mechanic==='pairs')Object.assign(base,{mechanic:'pairs',pairs:['x','y'],pairOrder:[1,0],instruction:'Un exemple. Choisis une lettre, puis retrouve la même.'});
 else if(mechanic==='reading')Object.assign(base,{mechanic:'reading',text:'Le chat dort.',instruction:'Un exemple. Le triangle commence la lecture. Le carré la termine.'});
 else if(mechanic==='flash')Object.assign(base,{mechanic:'flash',text:'ici',options:['ici','là'],instruction:'Un exemple. Regarde ici. Touche l’œil, puis retrouve ici.'});
 else if(source.type==='syllable_count')Object.assign(base,{options:['2 syllabes','3 syllabes'],answer:1,instruction:'Un exemple. Dans caméra, on entend ca, mé, ra. Il y a trois syllabes. Touche 3 syllabes.'});
 else if(source.type==='phoneme_count')Object.assign(base,{options:['● ●','● ● ●'],answer:0,instruction:'Un exemple. Dans rue, il y a deux petits sons. Touche les deux ronds.'});
 else if(source.type==='sound_odd')Object.assign(base,{options:['bateau','bébé','tortue'],answer:2,instruction:'Un exemple. Bateau et bébé commencent pareil. Tortue commence autrement.'});
 return {question:base,interaction:interactionFor(base),correct:false,rejected:[],started:false,hidden:false};
}
export function updateGameDemo(current,action,index){
 const state=structuredClone(current);if(state.correct)return state;
 const q=state.question;
 if(action==='listen')return state;
 if(q.mechanic==='reading'){if(action==='start')state.started=true;else if(action==='stop'&&state.started)state.correct=true;return state;}
 if(q.mechanic==='flash'&&action==='hide'){state.hidden=true;return state;}
 if(['build','pairs','segment'].includes(q.mechanic)){
  const result=applyInteraction(q,state.interaction,action,index);state.interaction=result.state;state.correct=result.event==='complete';return state;
 }
 if(action==='answer'&&q.options[index]!==undefined){if(index===q.answer)state.correct=true;else if(!state.rejected.includes(index))state.rejected.push(index);}
 return state;
}
const button=(action,body,index='',extra='')=>`<button class="demo-card" data-demo-action="${action}" data-card="${index}" ${extra}>${body}</button>`;
export function renderGameDemo(state){
 const q=state.question,i=state.interaction;
 let content='';
 if(state.correct)content='<div class="demo-success" role="status" aria-label="Exemple terminé">✓</div><button class="next-picture" id="demo-done" aria-label="Revenir à mon exercice">→</button>';
 else if(q.mechanic==='segment')content=renderSegmentation(q,i,true).replaceAll('data-action="cut-gap"','data-demo-action="cut"').replaceAll('data-action="cut-check"','data-demo-action="check"');
 else if(q.mechanic==='build')content=`<div class="demo-model">${q.parts.map(escape).join(' → ')}</div><div class="demo-cards">${q.tiles.map((part,index)=>i.picked.includes(index)?'<span class="demo-card matched">✓</span>':button('tile',escape(part)+(part===q.parts[i.picked.length]?'<span aria-hidden="true">☝</span>':''),index,`aria-label="Placer ${escape(part)}"`)).join('')}</div>`;
 else if(q.mechanic==='pairs')content=`<div class="demo-cards">${q.pairs.map((letter,index)=>i.matched.includes(index)?'<span>✓</span>':button('source',letter,index,`aria-label="Choisir ${letter} à gauche"`)).join('')}</div>${i.selectedSource!==null?`<div class="demo-cards">${q.pairOrder.map((source,index)=>i.matched.includes(source)?'<span>✓</span>':button('target',q.pairs[source]+(source===i.selectedSource?' ☝':''),index,`aria-label="Associer ${q.pairs[source]} à droite"`)).join('')}</div>`:''}`;
 else if(q.mechanic==='reading')content=`<p class="reading">${q.text}</p>${button(state.started?'stop':'start',state.started?'■':'▶','',`aria-label="${state.started?'Terminer l’exemple':'Commencer l’exemple'}"`)}`;
 else if(q.mechanic==='flash'&&!state.hidden)content=`<p class="reading">${q.text}</p>${button('hide','👁','','aria-label="Cacher le mot et choisir"')}`;
 else content=`<div class="demo-cards">${q.options.map((option,index)=>state.rejected.includes(index)?'<span class="demo-card rejected">↶</span>':button('answer',escape(option)+(index===q.answer?' ☝':''),index,`aria-label="Essayer ${escape(option)}"`)).join('')}</div>`;
 return `<div class="dialog-heading"><h2 id="confirm-title">Un exemple</h2><button class="tool" id="demo-close" aria-label="Revenir à mon exercice">←</button><button class="tool" id="demo-listen" aria-label="Réécouter l’exemple">🔊</button></div><div class="game-demo">${content}</div>`;
}
