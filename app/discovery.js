import { alphabet, extraLetters, syllablesInFamily, wordsForSyllable, wordById, syllableById, makeListeningRound } from './discovery-data.js';
import { companionArt, navigationPicture as picture } from './companions.js';
const escape = value => String(value).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[c]);
const syllableLevels = [
  { title:'1 · Pour commencer', families:['vowels','simple'] },
  { title:'2 · Un peu plus loin', families:['complex','nasal'] },
  { title:'3 · Pour aller plus loin', families:['clusters','closed'] }
];
const SYLLABLE_PAGE_SIZE = 6;
const levelSyllables = index => syllableLevels[index].families.flatMap(syllablesInFamily);
export function createDiscoveryState() { return { page:'hub', syllableLevel:0, syllablePage:0, alphabetSet:'base', syllableId:null, lastLetter:null, lastWord:null, quiz:null, quizReturn:'hub' }; }
export function discoveryGuidance(state) {
  return ({
    hub:'Touche les lettres pour les écouter. Les cartes ma ouvrent les syllabes. Le haut-parleur lance le jeu du mot mystère.',
    letters:'Touche une lettre pour entendre son nom. Les cartes é et ç ouvrent les autres lettres.',
    syllables:'Touche une syllabe pour l’écouter et voir des mots. La flèche à droite montre les cartes suivantes. Le petit escalier permet de changer de niveau.',
    'syllable-levels':'Choisis un chemin. Un point pour commencer. Deux points pour aller un peu plus loin. Trois points pour aller plus loin.',
    words:'Touche la grande syllabe pour la réécouter. Touche un mot pour l’entendre.',
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
    else state.page = ({ words:'syllables', 'syllable-levels':'syllables', quiz:state.quizReturn })[state.page] || 'hub';
    if (previousPage === 'words') focusCommand = 'selected-syllable';
    speech = discoveryGuidance(state);
  } else if (command === 'letters') { state.page = 'letters'; speech = discoveryGuidance(state); }
  else if (command === 'alphabet-set' && ['base','extra'].includes(value)) { state.alphabetSet = value; speech = value === 'base' ? 'Voici les lettres de l’alphabet.' : 'Voici les lettres accentuées et les autres signes.'; }
  else if (command === 'letter') {
    const letter = [...alphabet,...extraLetters].find(item => item.id === value);
    if (letter) { state.lastLetter = value; speech = letter.speech; listen = true; }
  } else if (command === 'families') { state.page = 'syllables'; speech = discoveryGuidance(state);
  } else if (command === 'syllable-levels') { state.page = 'syllable-levels'; speech = discoveryGuidance(state);
  } else if (command === 'syllable-level' && ['0','1','2'].includes(value)) {
    state.syllableLevel = Number(value); state.syllablePage = 0; state.page = 'syllables';
    speech = syllableLevels[state.syllableLevel].title + '. Touche une syllabe pour écouter.';
  } else if (command === 'syllable-page' && ['previous','next'].includes(value)) {
    const last = Math.ceil(levelSyllables(state.syllableLevel).length/SYLLABLE_PAGE_SIZE)-1;
    state.syllablePage = Math.max(0,Math.min(last,state.syllablePage + (value === 'next' ? 1 : -1)));
    focusCommand = 'syllable';
  } else if (command === 'syllable') {
    const syllable = syllableById(value);
    if (syllable) { state.syllableId = value; state.lastWord = null; state.page = 'words'; speech = syllable.speech; listen = true; }
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
function back() { return button('back','','Revenir en arrière','<svg class="nav-picture" viewBox="0 0 100 100" aria-hidden="true"><path d="M85 50H19m24-24L17 50l26 26"/></svg>','complexity-back'); }
function title(text) { return `<div class="complexity-heading">${back()}<h1>${text}</h1>${button('guide','','Réécouter comment faire',picture('sound'),'discovery-guide')}</div>`; }
export function renderDiscovery(state, voiceAvailable = true, companion = null) {
  let content = '';
  if (state.page === 'hub') content = `${title('Découvrir')}<div class="discovery-modes">${button('letters','','Écouter toutes les lettres','<span class="mode-letters" aria-hidden="true">A a</span><span>Lettres</span>','discovery-mode')}${button('families','','Écouter les syllabes et les mots','<span class="mode-letters" aria-hidden="true">ma</span><span>Syllabes</span>','discovery-mode')}${button('quiz','','Écouter un mot et le retrouver',`${picture('sound')}<span>Écoute et trouve</span>`,'discovery-mode')}</div>`;
  if (state.page === 'letters') {
    const letters = state.alphabetSet === 'extra' ? extraLetters : alphabet;
    content = `${title('Les lettres')}<div class="discovery-tabs">${button('alphabet-set','base','Les vingt-six lettres de l’alphabet','A → Z','discovery-tab',`aria-pressed="${state.alphabetSet === 'base'}"`)}${button('alphabet-set','extra','Les lettres accentuées et les autres signes','é · ç · œ','discovery-tab',`aria-pressed="${state.alphabetSet === 'extra'}"`)}</div><div class="discovery-letter-grid">${letters.map(letter => button('letter',letter.id,`Écouter le nom de la lettre ${letter.lower}`,`<span>${letter.upper}</span><span>${letter.lower}</span>`,`discovery-letter ${state.lastLetter === letter.id ? 'listened' : ''}`,`aria-pressed="${state.lastLetter === letter.id}"`)).join('')}</div>`;
  }
  if (state.page === 'syllable-levels') content = `${title('Choisir le chemin')}<div class="discovery-level-choices">${syllableLevels.map((level,index) => button('syllable-level',String(index),level.title,`<span aria-hidden="true">${'● '.repeat(index+1)}</span><span>${level.title}</span>`,'discovery-level-choice',`aria-pressed="${state.syllableLevel === index}"`)).join('')}</div>`;
  if (state.page === 'syllables') {
    const all = levelSyllables(state.syllableLevel), pages = Math.ceil(all.length/SYLLABLE_PAGE_SIZE);
    const visible = all.slice(state.syllablePage*SYLLABLE_PAGE_SIZE,(state.syllablePage+1)*SYLLABLE_PAGE_SIZE);
    content = `${title('Les syllabes')}<div class="syllable-focus-grid">${visible.map(syllable => button('syllable',syllable.id,`Écouter ${syllable.text} et découvrir des mots`,`<span>${escape(syllable.text)}</span>`,`discovery-syllable ${state.syllableId === syllable.id ? 'listened' : ''}`)).join('')}</div><nav class="syllable-focus-pager" aria-label="Parcourir les syllabes">${button('syllable-page','previous','Voir les syllabes précédentes','←','syllable-page-arrow',state.syllablePage === 0 ? 'disabled' : '')}<span class="syllable-page-count" aria-label="Page ${state.syllablePage+1} sur ${pages}">${state.syllablePage+1} / ${pages}</span>${button('syllable-page','next','Voir les syllabes suivantes','→','syllable-page-arrow',state.syllablePage === pages-1 ? 'disabled' : '')}</nav>${button('syllable-levels','','Choisir le chemin. ' + syllableLevels[state.syllableLevel].title,`${picture('challenge')}<span>${'● '.repeat(state.syllableLevel+1)}</span>`,'syllable-path-button')}`;
  }
  if (state.page === 'words') {
    const syllable = syllableById(state.syllableId), words = wordsForSyllable(state.syllableId);
    content = `${title('Les mots')}${button('syllable-listen','',`Réécouter ${syllable.text}`,`<span>${escape(syllable.text)}</span>${picture('sound')}`,'syllable-repeat')}<div class="discovery-word-grid">${words.map(word => button('word',word.id,`Écouter le mot ${word.text}`,`<span class="word-picture" aria-hidden="true">${word.emoji}</span><span>${word.parts.map(part => part.syllable === state.syllableId ? `<mark>${escape(part.text)}</mark>` : escape(part.text)).join('')}</span>`,`discovery-word ${state.lastWord === word.id ? 'listened' : ''}`,`aria-pressed="${state.lastWord === word.id}"`)).join('')}</div>${button('quiz','','Jouer à écouter et retrouver un mot',`${picture('sound')}<span>Écoute et trouve</span>`,'discovery-listening-link')}`;
  }
  if (state.page === 'quiz') {
    const quiz = state.quiz;
    const mood = quiz.correct ? 'cheer' : quiz.rejected.length ? 'support' : null;
    const companionFeedback = companion && mood ? `<div class="discovery-companion-feedback" role="status" aria-label="${escape(companion.name)} ${quiz.correct ? 'te félicite' : 't’encourage à réessayer'}"><span aria-hidden="true">${companionArt(companion,false,mood)}</span></div>` : '';
    content = `${title('Écoute et trouve')}${quiz.correct ? `${companionFeedback}<div class="discovery-quiz-success" role="status"><span class="sr-only">Mot retrouvé</span><span class="quiz-found-word">${escape(wordById(quiz.target).text)}</span><span class="quiz-found-check" aria-hidden="true">✓</span></div>${button('quiz-next','','Écouter un autre mot',picture('arrow'),'next-picture discovery-next')}` : `${button('quiz-listen','','Écouter le mot mystère',picture('sound'),'word-mystery')}<div class="discovery-quiz-choices">${quiz.options.map(id => quiz.rejected.includes(id) ? `<div class="discovery-word-choice rejected">${escape(wordById(id).text)}</div>` : button('quiz-answer',id,`Choisir ${wordById(id).text}`,escape(wordById(id).text),`discovery-word-choice ${quiz.rejected.length >= 2 && id === quiz.target ? 'guided' : ''}`,quiz.heard ? '' : 'disabled')).join('')}</div>${companionFeedback}${quiz.rejected.length ? '<div class="quiet-retry" role="status" aria-label="Tu peux réessayer"><span aria-hidden="true">↶</span></div>' : ''}`}`;
  }
  const unavailable = voiceAvailable ? '' : '<div class="discovery-voice-notice" role="status">La voix n’est pas disponible sur cet appareil. Essayez un navigateur proposant une voix française.</div>';
  return `<main id="main" tabindex="-1" class="discovery-screen discovery-${state.page}">${content}${unavailable}</main>`;
}
