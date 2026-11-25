import { alphabet, extraLetters, discoverySyllables, wordsForSyllable, wordById, syllableById, makeListeningRound } from './discovery-data.js';
import { companionArt, navigationPicture as picture } from './companions.js';
const escape = value => String(value).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[c]);
const initialFor = syllable => syllable.text.match(/^[^aàâäeéèêëiîïoôöuùûüyœæ]+/i)?.[0] || '*';
export const syllableInitials = ['*', ...new Set(discoverySyllables.map(initialFor).filter(key=>key!=='*'))].sort((a,b)=>a==='*'?-1:b==='*'?1:a.localeCompare(b,'fr'));
const initialSyllables = initial => {
  const endings = initial === '*' ? ['on','ou','an','in','oi','au','en'] : ['a','i','o','u','é','e','è','ou','on','an','in','oi'];
  const rank = syllable => { const index=endings.indexOf(initial === '*' ? syllable.text : syllable.text.slice(initial.length)); return index < 0 ? endings.length : index; };
  return discoverySyllables.filter(syllable=>initialFor(syllable)===initial).sort((a,b)=>rank(a)-rank(b)||a.text.localeCompare(b.text,'fr'));
};
export function createDiscoveryState() { return { page:'hub', syllableInitial:'m', alphabetSet:'base', wordPage:0, syllableId:null, lastLetter:null, lastWord:null, quiz:null, quizReturn:'hub' }; }
export function discoveryGuidance(state) {
  return ({
    hub:'Choisis une image pour apprendre et écouter.',
    letters:'Touche une lettre pour entendre son nom. Les cartes é et ç ouvrent les autres lettres.',
    syllables:'Touche une syllabe. La petite flèche ouvre les autres syllabes.',

    words:'Touche un mot pour l’écouter. Ou choisis une autre syllabe, en haut.',
    quiz:'Écoute le mot avec le haut-parleur. Puis touche le mot que tu as entendu.'
  })[state.page];
}
export function updateDiscovery(current, command, value, random = Math.random, audio = {}) {
  const state = structuredClone(current);
  const previousPage = state.page;
  let speech, listen = false, exit = false, focusCommand;
  if (command === 'guide') { speech = discoveryGuidance(state); listen = true; }
  else if (command === 'back') {
    if (state.page === 'hub') exit = true;
    else state.page = ({ words:'syllables', quiz:state.quizReturn })[state.page] || 'hub';
    if (previousPage === 'words') focusCommand = 'selected-syllable';
    speech = discoveryGuidance(state);
  } else if (command === 'letters') { state.page = 'letters'; speech = discoveryGuidance(state); }
  else if (command === 'alphabet-set' && ['base','extra'].includes(value)) { state.alphabetSet = value; speech = value === 'base' ? 'Voici les lettres de l’alphabet.' : 'Voici les lettres accentuées et les autres signes.'; }
  else if (command === 'word-page' && ['previous','next'].includes(value)) {
    const all = wordsForSyllable(state.syllableId);
    state.wordPage = Math.max(0,Math.min(Math.ceil(all.length/6)-1,state.wordPage + (value === 'next' ? 1 : -1)));
    focusCommand = 'word';
  }
  else if (command === 'letter') {
    const letter = [...alphabet,...extraLetters].find(item => item.id === value);
    if (letter) { state.lastLetter = value; speech = letter.speech; listen = true; }
  } else if (command === 'families') { state.page = 'syllables'; state.syllableInitial ||= 'm'; speech = discoveryGuidance(state);
  } else if (command === 'syllable-initial' && syllableInitials.includes(value)) {
    state.syllableInitial = state.syllableInitial === value ? null : value; state.page = 'syllables';
    if (state.syllableInitial) speech = 'Voici ' + initialSyllables(value).slice(0,2).map(item=>item.speech).join(', ') + '. Touche une syllabe.';
  } else if (command === 'syllable') {
    const syllable = syllableById(value);
    if (syllable) {
      if (state.page !== 'words' || state.syllableId !== value) { state.wordPage = 0; state.lastWord = null; }
      state.syllableId = value; state.syllableInitial = initialFor(syllable); state.page = 'words'; speech = syllable.speech; listen = true;
    }
  } else if (command === 'syllable-listen') {
    const syllable = syllableById(state.syllableId);
    if (syllable) { speech = syllable.speech; listen = true; }
  } else if (command === 'word') {
    const word = wordsForSyllable(state.syllableId).find(item => item.id === value);
    if (word) { state.lastWord = value; speech = word.text; listen = true; }
  } else if (command === 'quiz') {
    state.quizReturn = state.page === 'words' ? 'words' : 'hub';
    state.page = 'quiz'; state.quiz = makeListeningRound(null,random);
    if (audio.canHear) { state.quiz.heard = true; speech = wordById(state.quiz.target).text; }
  } else if (command === 'quiz-listen' && state.quiz) {
    state.quiz.heard = audio.canSpeak === true;
    if (state.quiz.heard) { speech = wordById(state.quiz.target).text; listen = true; }
  } else if (command === 'quiz-answer' && state.quiz && state.quiz.heard && !state.quiz.correct && state.quiz.options.includes(value) && !state.quiz.rejected.includes(value)) {
    if (value === state.quiz.target) { state.quiz.correct = true; speech = 'Oui, tu as trouvé !'; focusCommand = 'quiz-next'; }
    else { state.quiz.rejected.push(value); speech = 'On essaie encore. ' + wordById(state.quiz.target).text; }
  } else if (command === 'quiz-next' && state.quiz?.correct) {
    state.quiz = makeListeningRound(state.quiz.target,random);
    if (audio.canHear) { state.quiz.heard = true; speech = wordById(state.quiz.target).text; }
  }
  return { state, speech, listen, exit, pageChanged:state.page !== previousPage, focusCommand };
}
const button = (command, value, label, body, className = '', extra = '') => `<button class="${className}" data-action="discover-action" data-command="${command}" data-value="${escape(value || '')}" aria-label="${escape(label)}" ${extra}>${body}</button>`;
function pager(command,page,total) {
  if (total <= 6) return '';
  const pages = Math.ceil(total/6);
  return `<nav class="syllable-focus-pager" aria-label="Parcourir les cartes">${button(command,'previous','Cartes précédentes','←','syllable-page-arrow',page === 0 ? 'disabled' : '')}<span class="syllable-page-count" aria-label="Page ${page+1} sur ${pages}">${page+1} / ${pages}</span>${button(command,'next','Cartes suivantes','→','syllable-page-arrow',page === pages-1 ? 'disabled' : '')}</nav>`;
}
function back() { return button('back','','Revenir en arrière','<svg class="nav-picture" viewBox="0 0 100 100" aria-hidden="true"><path d="M85 50H19m24-24L17 50l26 26"/></svg>','complexity-back'); }
function title(text) { return `<div class="complexity-heading">${back()}<h1>${text}</h1>${button('guide','','Réécouter comment faire',picture('sound'),'discovery-guide')}</div>`; }
function renderSyllableSwitcher(selected) {
  return `<nav class="syllable-switcher" aria-label="Choisir ou réécouter une syllabe">${initialSyllables(initialFor(selected)).map(syllable=>{
    const active=syllable.id===selected.id;
    return button('syllable',syllable.id,active?`Réécouter ${syllable.text}`:`Écouter ${syllable.text} et voir ses mots`,`<span>${escape(syllable.text)}</span><span class="syllable-switcher-audio" aria-hidden="true">${active?picture('sound'):''}</span>`,`discovery-syllable ${active?'listened':''}`,`aria-pressed="${active}"`);
  }).join('')}</nav>`;
}
export function renderDiscovery(state, voiceAvailable = true, companion = null, audioFailed = false) {
  let content = '';
  if (state.page === 'hub') content = `${title('Apprendre')}<div class="discovery-modes">${button('letters','','Écouter toutes les lettres','<span class="mode-letters" aria-hidden="true">A a</span><span>Lettres</span>','discovery-mode')}${button('families','','Écouter les syllabes et les mots','<span class="mode-letters" aria-hidden="true">ma</span><span>Syllabes</span>','discovery-mode')}${button('quiz','','Écouter un mot et le retrouver',`${picture('sound')}<span>Écoute et trouve</span>`,'discovery-mode')}</div>`;
  if (state.page === 'letters') {
    const letters = state.alphabetSet === 'extra' ? extraLetters : alphabet;
    content = `${title('Les lettres')}<div class="discovery-tabs">${button('alphabet-set','base','Les vingt-six lettres de l’alphabet','A → Z','discovery-tab',`aria-pressed="${state.alphabetSet === 'base'}"`)}${button('alphabet-set','extra','Les lettres accentuées et les autres signes','é · ç · œ','discovery-tab',`aria-pressed="${state.alphabetSet === 'extra'}"`)}</div><div class="discovery-letter-grid">${letters.map(letter => button('letter',letter.id,`Écouter le nom de la lettre ${letter.lower}`,`<span>${letter.upper}</span><span>${letter.lower}</span>`,`discovery-letter ${state.lastLetter === letter.id ? 'listened' : ''}`,`aria-pressed="${state.lastLetter === letter.id}"`)).join('')}</div>`;
  }
  if (state.page === 'syllables') {
    const order = ['m','l','*',...syllableInitials.filter(initial=>!['m','l','*'].includes(initial))];
    content = `${title('Les syllabes')}<div class="syllable-shelves">${order.map(initial=>{
      const syllables=initialSyllables(initial), open=state.syllableInitial===initial;
      const shelfId='syllable-shelf-'+(initial==='*'?'sounds':initial);
      const preview=syllables.slice(0,2).map(item=>escape(item.text)).join(' · ');
      const label=syllables.slice(0,2).map(item=>item.text).join(', ');
      return `<section class="syllable-shelf ${open?'is-open':''}"><h2>${button('syllable-initial',initial,`${open?'Replier':'Afficher'} les syllabes comme ${label}`,`<span>${preview}</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>`,'syllable-shelf-toggle',`aria-expanded="${open}" aria-controls="${shelfId}"`)}</h2><div id="${shelfId}" class="syllable-focus-grid" ${open?'':'hidden'}>${open?syllables.map(syllable=>button('syllable',syllable.id,`Écouter ${syllable.text} et découvrir des mots`,`<span>${escape(syllable.text)}</span>`,`discovery-syllable ${state.syllableId===syllable.id?'listened':''}`)).join(''):''}</div></section>`;
    }).join('')}</div>`;
  }
  if (state.page === 'words') {
    const syllable = syllableById(state.syllableId), words = wordsForSyllable(state.syllableId);
    content = `${title('Les mots')}${renderSyllableSwitcher(syllable)}<div class="discovery-word-grid">${words.slice(state.wordPage*6,(state.wordPage+1)*6).map(word => button('word',word.id,`Écouter le mot ${word.text}`,`<span class="word-picture" aria-hidden="true">${word.emoji}</span><span>${word.parts.map(part => part.syllable === state.syllableId ? `<mark>${escape(part.text)}</mark>` : escape(part.text)).join('')}</span>`,`discovery-word ${state.lastWord === word.id ? 'listened' : ''}`,`aria-pressed="${state.lastWord === word.id}"`)).join('')}</div>${pager('word-page',state.wordPage,words.length)}${button('quiz','','Jouer à écouter et retrouver un mot',`${picture('sound')}<span>Écoute et trouve</span>`,'discovery-listening-link')}`;
  }
  if (state.page === 'quiz') {
    const quiz = state.quiz;
    const mood = quiz.correct ? 'cheer' : quiz.rejected.length ? 'support' : null;
    const companionFeedback = companion && mood ? `<div class="discovery-companion-feedback" role="status" aria-label="${escape(companion.name)} ${quiz.correct ? 'te félicite' : 't’encourage à réessayer'}"><span aria-hidden="true">${companionArt(companion,false,mood)}</span></div>` : '';
    content = `${title('Écoute et trouve')}${quiz.correct ? `${companionFeedback}<div class="discovery-quiz-success" role="status"><span class="sr-only">Mot retrouvé</span><span class="quiz-found-word">${escape(wordById(quiz.target).text)}</span><span class="quiz-found-check" aria-hidden="true">✓</span></div>${button('quiz-next','','Écouter un autre mot',picture('arrow'),'next-picture discovery-next')}` : `${button('quiz-listen','','Écouter le mot mystère',picture('sound'),'word-mystery')}<div class="discovery-quiz-choices">${quiz.options.map(id => quiz.rejected.includes(id) ? `<div class="discovery-word-choice rejected">${escape(wordById(id).text)}</div>` : button('quiz-answer',id,`Choisir ${wordById(id).text}`,escape(wordById(id).text),`discovery-word-choice ${quiz.rejected.length >= 2 && id === quiz.target ? 'guided' : ''}`,quiz.heard ? '' : 'disabled')).join('')}</div>${companionFeedback}${quiz.rejected.length ? '<div class="quiet-retry" role="status" aria-label="Tu peux réessayer"><span aria-hidden="true">↶</span></div>' : ''}`}`;
  }
  const unavailable = !voiceAvailable ? '<div class="discovery-voice-notice" role="status">La voix n’est pas disponible dans ce navigateur. Si vous avez ouvert le lien depuis Messenger ou une autre application, copiez l’adresse du site et ouvrez-la directement dans Chrome sur Android ou Safari sur iPhone.</div>' : audioFailed ? '<div class="discovery-voice-notice" role="status">La lecture audio a échoué. Réessayez le son avec le bouton ci-dessous.</div>' : '';
  return `<main id="main" tabindex="-1" class="discovery-screen discovery-${state.page}">${content}${unavailable}</main>`;
}
