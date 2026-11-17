import { exerciseSpeech } from './exercise-speech.js';
import { createNavigationHistory } from './navigation.js';
import { createDiscoveryState, renderDiscovery, discoveryGuidance, updateDiscovery } from './discovery.js';
import { createMission, rememberGroup, missionQuestion, recordExercise, HISTORY_LIMIT } from './missions.js';
import { interactionFor, applyInteraction, completedText } from './interactions.js';
import { frenchUtterance } from './speech.js';
import { beginnerStages } from './foundations.js';
import { companionArt, navigationPicture as picture } from './companions.js';
import { heroes, levels, banks, calibration, questionsFor, questionById } from './data.js';
import { STORAGE_KEY, freshProfile, parseProfile, recommendedLevel, recommendedBeginnerStage, recordBeginnerMission, difficultyPosition, setDifficultyPosition } from './state.js';
const app = document.querySelector('#app');
let discoveryState = createDiscoveryState();
let discoveryAudioError = false, speechRequest = 0, praiseTimer;
const hasVoice = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
let profile;
let storageOK = true;
try { profile = parseProfile(localStorage.getItem(STORAGE_KEY)); } catch { profile = freshProfile(); storageOK = false; }
let screen = 'home', step = 0, feedback = null, calibrationState = null, calibrationTimer, voiceWaitCleanup, lastResults = [], suggestedStage = null, difficultyReturn = null;
const navigation = createNavigationHistory(window, snapshot => {
  stopAudio(); clearTimeout(calibrationTimer);
  document.querySelector('dialog[open]')?.close();
  ({screen,step,discoveryState,difficultyReturn} = snapshot);
  feedback = null;
  if (screen === 'mission') {
    if (!profile.session) screen = 'home';
    else if (profile.session.results.length > profile.session.index) feedback = {correct:true};
    else if (profile.session.attempts > 0) feedback = {correct:false};
  }
  if (['calibrate','calibrationResult'].includes(screen)) screen = 'home';
  render(true); navigationGuidance();
});
const hero = () => heroes.find(h => h.id === profile.hero);
const escape = (value) => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const icon = (name) => ({ audio: '<svg viewBox="0 0 24 24"><path d="M11 5 6 9H3v6h3l5 4zM15 8c3 2 3 6 0 8m3-11c5 4 5 10 0 14"/></svg>', mute: '<svg viewBox="0 0 24 24"><path d="M11 5 6 9H3v6h3l5 4zM16 9l5 6m0-6-5 6"/></svg>', settings: '<svg viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16"/><circle cx="9" cy="6" r="2"/><circle cx="16" cy="12" r="2"/><circle cx="8" cy="18" r="2"/></svg>', arrow: '<svg viewBox="0 0 24 24"><path d="M4 12h15m-6-6 6 6-6 6"/></svg>', book: '<svg viewBox="0 0 24 24"><path d="M12 6v15M3 4c4-1 6 0 9 2 3-2 5-3 9-2v15c-4-1-6 0-9 2-3-2-5-3-9-2z"/></svg>' })[name] || '';
function avatar(h = hero(), big = false, mood = 'neutral') { return companionArt(h, big, mood); }
function save() { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(profile)); storageOK = true; } catch { storageOK = false; } }
function speak(text, after = null) {
  if (!profile.audio || !hasVoice) return;
  stopAudio();
  const request = speechRequest;
  const play = () => {
    const utterance = frenchUtterance(text, SpeechSynthesisUtterance, speechSynthesis.getVoices());
    if (after) utterance.onend = () => {
      if (request !== speechRequest) return;
      praiseTimer = setTimeout(() => {
        if (request === speechRequest) speak(after);
      }, 450);
    };
    utterance.onerror = event => {
      if (request !== speechRequest || ['canceled','interrupted'].includes(event.error) || screen !== 'discover') return;
      discoveryAudioError = true;
      if (discoveryState.quiz) discoveryState.quiz.heard = false;
      render(); announce('La voix n’est pas disponible pour le moment.');
    };
    speechSynthesis.speak(utterance);
  };
  if (speechSynthesis.getVoices().length || !speechSynthesis.addEventListener) { play(); return; }
  // Browsers often expose their higher-quality voices just after the first interaction.
  let timeout;
  const ready = () => { voiceWaitCleanup?.(); play(); };
  voiceWaitCleanup = () => { clearTimeout(timeout); speechSynthesis.removeEventListener('voiceschanged', ready); voiceWaitCleanup = null; };
  speechSynthesis.addEventListener('voiceschanged', ready, { once: true });
  timeout = setTimeout(ready, 700);
}
function stopAudio() { speechRequest++; clearTimeout(praiseTimer); voiceWaitCleanup?.(); if ('speechSynthesis' in window) speechSynthesis.cancel(); }
function announce(text) { document.querySelector('#announcer').textContent = text; }
function controls(focus = false, showParents = true) { return `<div class="controls">${focus ? '' : `<button class="tool help-voice" data-action="guide" aria-label="Écouter comment jouer">${icon('audio')}</button>`}<button class="tool" data-action="audio" aria-label="${profile.audio ? 'Couper le son' : 'Activer le son'}" aria-pressed="${!profile.audio}">${icon(profile.audio ? 'audio' : 'mute')}</button><button class="tool" data-action="settings" aria-label="Réglages">${icon('settings')}</button>${showParents ? '<a class="parents-top-link" href="/parents/">Pour les parents <span aria-hidden="true">↗</span></a>' : ''}</div>`; }
function header(focus = false) { return `<header class="header child-header ${focus ? 'exercise-header' : ''}">${focus ? `<button class="tool exit-picture" data-action="${screen === 'discover' ? 'discovery-home' : 'quit'}" aria-label="${screen === 'discover' ? 'Revenir à l’accueil sans modifier ma mission' : 'Arrêter l’exercice et revenir à l’accueil'}">${picture('home')}</button>` : '<div class="brand-with-purpose"><a class="brand" href="#" data-action="home" aria-label="Accueil Azyl.it"><span class="brand-mark">ϟ</span>azyl<span class="brand-dot">.it</span></a><a class="parent-purpose" href="/parents/" aria-label="Pour les parents : notre démarche pour apprendre à lire">Apprendre à lire, chacun à son rythme.</a></div>'}${controls(focus || screen === 'difficulty' || (screen === 'onboarding' && step === 1), !focus)}</header>`; }
function navigationGuidance() {
  if (screen === 'discover') return speak(discoveryGuidance(discoveryState));
  if (screen === 'mission' || screen === 'calibrate') return actions.repeat();
  if (screen === 'difficulty' || (screen === 'onboarding' && step === 1)) return speak('Choisis ton niveau. ' + complexityLabel() + '. ' + difficultyDescription() + ' Pour revenir, touche la flèche vers la gauche. Touche le moins pour plus facile. Le plus pour plus difficile. ' + (difficultyReturn?.screen === 'mission' ? 'Pour jouer, touche le triangle en bas.' : 'Pour revenir à l’accueil, touche la maison en bas.') + '');
  if (screen === 'onboarding') return speak(step === 0 ? 'Choisis ton compagnon en touchant son image. Puis touche la maison pour revenir à l’accueil.' : 'On commence avec une seule lettre. Touche le grand bouton pour jouer. Pour choisir un autre chemin, touche son image.');
  if (screen === 'celebration') return actions['celebration-audio']();
  if (screen === 'calibrationResult') return actions['calibration-audio']();
  speak('Touche le grand triangle pour jouer.');
}
function playButton(action, label = 'Jouer') { return `<button class="play-button" data-action="${action}" aria-label="${label || 'Jouer avec ce niveau'}">${picture('play')}<span>${label}</span></button>`; }
function reading(text, question) {
  const settings = profile.settings;
  let content = escape(text);
  if (settings.syllables && question.syllables && question.visualAids !== false) content = question.syllables.map((s, i) => `<span class="syllable-${i % 2}">${escape(s)}</span>`).join('');
  return `<div ${question.ruler && settings.ruler ? 'tabindex="0" role="region" aria-label="Texte à lire. Flèches haut et bas pour déplacer le guide."' : ''} class="reading ${feedback && !feedback.correct ? 'feedback-model' : ''} ${question.foundation ? 'foundation-reading' : ''} ${question.ruler && settings.ruler ? 'ruler' : ''}" style="font-family:${settings.font};font-size:${settings.size}px;letter-spacing:${settings.spacing}em;line-height:${settings.line}">${content}</div>`;
}
function render(focus = false) {
  document.documentElement.style.setProperty('--accent', hero().color);
  document.documentElement.style.setProperty('--pale', hero().pale);
  for (const [key, value] of Object.entries({ 'reading-font': profile.settings.font, 'reading-size': profile.settings.size + 'px', 'reading-spacing': profile.settings.spacing + 'em', 'reading-line': profile.settings.line })) document.documentElement.style.setProperty('--' + key, value);
  document.body.dataset.screen = screen;
  const pages = { home, onboarding, mission, celebration, calibrate, calibrationResult, difficulty, discover:discoveryView };
  app.innerHTML = header(screen === 'mission' || screen === 'calibrate' || screen === 'discover') + pages[screen]() + (!storageOK ? '<div class="storage-notice" role="status">La sauvegarde sur cet appareil est indisponible. Ta progression reste accessible pendant cette visite.</div>' : '');
  navigation.sync(screen + (screen === 'discover' ? ':' + discoveryState.page : ''), {screen,step,discoveryState,difficultyReturn});
  if (focus && !document.querySelector('dialog[open]')) document.querySelector('#main')?.focus();
}
function home() {
  return `<main id="main" tabindex="-1" class="child-home hero-home"><h1>À toi de jouer !</h1><section class="hero-launch" aria-label="Jouer avec mon compagnon"><div class="launch-companion" aria-hidden="true">${avatar(hero(), true)}<span class="launch-spark">✦</span></div>${playButton(profile.onboarded ? profile.session ? 'resume' : 'start' : 'onboard', profile.session ? 'Continuer' : 'Jouer')}<button class="discover-entry" data-action="discover" aria-label="Découvrir les lettres, les syllabes et les mots">${picture('stories')}<span>Découvrir</span></button></section><nav class="home-adjustments" aria-label="Changer mon compagnon ou mon jeu"><button class="home-adjustment companion-adjustment" data-action="change-hero" aria-label="Changer de compagnon. ${hero().name}, ${hero().title.toLowerCase()}, est choisi."><span class="adjustment-portrait" aria-hidden="true">${avatar()}<span class="adjustment-swap">↔</span></span><span>Mon compagnon</span></button><button class="home-adjustment game-adjustment" data-action="difficulty" aria-label="Mon niveau. ${complexityLabel()}"><span class="game-choice-symbol" aria-hidden="true">${picture('game-choice')}</span><span class="adjustment-label">Mon niveau</span><span class="current-complexity">${complexityLabel()}</span></button></nav></main>`;
}
function discoveryView() { return renderDiscovery(discoveryState,hasVoice && !discoveryAudioError,hero()); }
function dispatchDiscovery(button) {
  const result = updateDiscovery(discoveryState,button.dataset.command,button.dataset.value,Math.random,{canSpeak:hasVoice,canHear:hasVoice && profile.audio});
  discoveryState = result.state;
  if (result.exit) return actions.home();
  if (result.listen && hasVoice && !profile.audio) { profile.audio = true; save(); }
  if (result.speech) discoveryAudioError = false;
  render(result.pageChanged);
  if (result.speech) speak(result.speech);
  if (result.focusCommand === 'selected-syllable') { document.querySelector(`[data-command="syllable"][data-value="${discoveryState.syllableId}"]`)?.focus(); return; }
  const command = result.focusCommand || (!result.pageChanged ? button.dataset.command : null);
  if (command) document.querySelector(`[data-action="discover-action"][data-command="${command}"]${result.focusCommand ? '' : `[data-value="${button.dataset.value || ''}"]`}`)?.focus({preventScroll:command !== 'syllable'});
}
function onboarding() {
  if (step === 1) return difficulty();
  return `<main id="main" tabindex="-1" class="child-setup"><div class="setup-back"><button class="tool" data-action="home" aria-label="Retour à l’accueil">←</button></div><h1>Ton compagnon ?</h1><div class="companion-grid">${heroes.map(h => `<button class="companion-choice ${h.id === profile.hero ? 'selected' : ''}" style="--local:${h.color};--local-pale:${h.pale}" data-action="hero" data-hero="${h.id}" aria-label="Choisir ${h.name}, ${h.title.toLowerCase()}" aria-pressed="${h.id === profile.hero}">${avatar(h)}<strong>${h.title}</strong><span class="selection-check" aria-hidden="true">${h.id === profile.hero ? '✓' : ''}</span></button>`).join('')}</div><button class="next-picture" data-action="confirm-settings" aria-label="Valider mon compagnon et revenir à l’accueil">${picture('home')}</button></main>`;
}
function complexityLabel() {
  const position = difficultyPosition(profile);
  const names = ['Lettres', 'Sons', 'Syllabes', 'Assemblage', 'Mots et phrases', 'Secrets des mots', 'Histoires'];
  return `${position + 1} · ${names[position]}`;
}
function difficultyDescription() {
  return profile.level === 0 ? beginnerStages[profile.beginnerStage].spoken : [
    '', 'On essaie de petits mots et de petites phrases.',
    'On cherche les secrets des mots et leurs accords.', 'On découvre des histoires et leurs indices.'
  ][profile.level];
}
function difficultyPreview() {
  const position = difficultyPosition(profile);
  const samples = [
    '<span class="preview-letter">a</span><span class="preview-pair"><i>a</i><i>o</i></span>',
    `${picture('sounds')}<span class="preview-letter">a</span>`,
    '<span class="preview-syllable"><i>m</i><i>a</i></span><span class="preview-result">ma</span>',
    '<span class="preview-syllable"><i>pa</i><span>+</span><i>pa</i></span><span class="preview-result">papa</span>',
    `${picture('words')}<span class="preview-result">chat</span>`,
    picture('clues'), picture('stories')
  ];
  return samples[position];
}
function difficulty() {
  const position = difficultyPosition(profile);
  const returnToGame = difficultyReturn?.screen === 'mission';
  return `<main id="main" tabindex="-1" class="difficulty-screen"><div class="complexity-heading"><button class="complexity-back" data-action="back-complexity" aria-label="Revenir à l’écran précédent"><svg class="nav-picture" viewBox="0 0 100 100" aria-hidden="true"><path d="M85 50H19m24-24L17 50l26 26"/></svg></button><h1>Choisis ton niveau</h1><span aria-hidden="true"></span></div><p class="complexity-current" id="difficulty-state" role="status">${complexityLabel()}</p><div class="difficulty-picker"><button class="difficulty-step" data-action="easier" aria-label="Plus facile" ${position === 0 ? 'disabled' : ''}><svg class="nav-picture" viewBox="0 0 100 100" aria-hidden="true"><path d="M25 50h50"/></svg><span>Plus facile</span></button><button class="difficulty-preview" data-action="difficulty-voice" aria-label="Écouter ce jeu" aria-describedby="difficulty-state"><span class="preview-art" aria-hidden="true">${difficultyPreview()}</span><span class="preview-speaker" aria-hidden="true">${icon('audio')}</span></button><button class="difficulty-step" data-action="harder" aria-label="Plus difficile" ${position === 6 ? 'disabled' : ''}><svg class="nav-picture" viewBox="0 0 100 100" aria-hidden="true"><path d="M25 50h50M50 25v50"/></svg><span>Plus difficile</span></button></div><div class="difficulty-dots" aria-hidden="true">${Array.from({length:7},(_,i) => `<span class="${position === i ? 'selected' : ''}"></span>`).join('')}</div><span class="sr-only">${difficultyDescription()}</span><button class="next-picture" data-action="confirm-settings" aria-label="${returnToGame ? 'Valider mon niveau et jouer' : 'Valider mon niveau et revenir à l’accueil'}">${picture(returnToGame ? 'play' : 'home')}</button></main>`;
}
function adjustDifficulty(direction) {
  const previous = difficultyPosition(profile);
  setDifficultyPosition(profile, previous + direction);
  if (difficultyPosition(profile) === previous) return;
  save(); render();
  const position = difficultyPosition(profile);
  const focusAction = direction > 0 ? position === 6 ? 'easier' : 'harder' : position === 0 ? 'harder' : 'easier';
  document.querySelector(`[data-action="${focusAction}"]`)?.focus();
  speak(complexityLabel() + '. ' + difficultyDescription() + (profile.session && (profile.session.level !== profile.level || (profile.level === 0 && profile.session.beginnerStage !== profile.beginnerStage)) ? ' Avec ce niveau, tu commenceras un nouveau jeu.' : ''));
}
function currentQuestion() {
  if (screen === 'calibrate') return calibration[calibrationState.index];
  const session = profile.session;
  return missionQuestion(session);
}
function choiceControls(question, rejected, guided, isCalibration) {
  const state = interactionFor(question, profile.session?.interaction);
  if (!isCalibration && question.mechanic === 'pairs') {
    return `<div class="pair-board" aria-label="Associer les lettres"><div class="pair-column" role="group" aria-label="Choisir une lettre à gauche">${question.pairs.map((letter, index) => state.matched.includes(index) ? `<div class="pair-card matched"><span>${escape(letter)}</span><span class="pair-check" aria-hidden="true">✓</span></div>` : `<button class="pair-card ${state.selectedSource === index ? 'selected' : ''} ${guided && state.selectedSource === null && index === question.pairs.findIndex((_,i) => !state.matched.includes(i)) ? 'guided' : ''}" data-action="pair-source" data-card="${index}" data-shortcut="${index + 1}" aria-label="Lettre ${escape(letter)} à gauche" aria-pressed="${state.selectedSource === index}">${escape(letter)}</button>`).join('')}</div><span class="pair-direction" aria-hidden="true">→</span><div class="pair-column" role="group" aria-label="Retrouver la même lettre à droite">${question.pairOrder.map((source, index) => state.matched.includes(source) ? `<div class="pair-card matched"><span>${escape(question.pairs[source])}</span><span class="pair-check" aria-hidden="true">✓</span></div>` : state.selectedSource === null ? `<div class="pair-card waiting" aria-label="${escape(question.pairs[source])}, choisis d’abord une lettre à gauche">${escape(question.pairs[source])}</div>` : `<button class="pair-card ${guided && source === state.selectedSource ? 'guided' : ''}" data-action="pair-target" data-card="${index}" data-shortcut="${index + 3}" aria-label="Associer avec ${escape(question.pairs[source])} à droite">${escape(question.pairs[source])}</button>`).join('')}</div></div>`;
  }
  if (!isCalibration && question.mechanic === 'build') {
    return `<div class="assembly-board" aria-label="${question.unit === 'letters' ? 'Fusionner les lettres' : 'Assembler les syllabes'}"><div class="assembly-row"><div class="assembly-slots" role="group" aria-label="${state.picked.length} carte sur ${question.parts.length} posée">${question.parts.map((_,index) => `<div class="assembly-slot ${index < state.picked.length ? 'filled' : index === state.picked.length ? 'current' : ''}" aria-label="${index < state.picked.length ? escape(question.tiles[state.picked[index]]) : 'Emplacement ' + (index + 1)}">${index < state.picked.length ? escape(question.tiles[state.picked[index]]) : '<span class="slot-marker" aria-hidden="true"></span>'}</div>`).join('')}</div>${state.picked.length ? `<button class="assembly-undo" data-action="build-undo" aria-label="Retirer la dernière carte">↶</button>` : ''}</div><div class="assembly-tiles" role="group" aria-label="Cartes à placer">${question.tiles.map((tile,index) => state.picked.includes(index) ? '<span class="assembly-tile-used" aria-hidden="true"></span>' : `<button class="assembly-tile ${guided && tile === question.parts[state.picked.length] ? 'guided' : ''}" data-action="build-tile" data-card="${index}" data-shortcut="${index + 1}" aria-label="Placer ${escape(tile)}">${escape(tile)}</button>`).join('')}</div></div>`;
  }
  return `<div class="answers ${question.foundation ? 'foundation-answers' : ''}">${question.options.map((option, i) => `<div class="answer-wrap">${rejected.includes(i) ? `<div class="answer rejected" aria-label="${escape(option)}, réponse déjà essayée"><span>${escape(option)}</span></div>` : `<button class="answer ${guided && i === question.answer ? 'guided' : ''}" data-action="answer" data-answer="${i}"><span>${escape(option)}</span></button>`}${question.optionAudio && !rejected.includes(i) ? `<button class="tool option-listen" data-action="option-audio" data-option="${i}" aria-label="Écouter ${escape(option)}">${icon('audio')}</button>` : ''}</div>`).join('')}</div>`;
}
function exerciseContent(question, index, isCalibration = false) {
  const rejected = isCalibration ? [] : profile.session.rejected;
  const solved = feedback?.correct === true;
  const audioRequired = question.requiresAudio !== false && (question.listen || question.optionAudio);
  const blocked = !!audioRequired && (!profile.audio || !hasVoice);
  const guided = !isCalibration && (profile.session.attempts >= 2 || profile.session.helpUsed);
  const total = isCalibration ? 5 : 8;
  const syllableChoice = question.type === 'simple_syllable' && !question.mechanic;
  const progress = `<div class="stars exercise-progress" aria-label="${index + (solved ? 1 : 0)} étapes terminées sur ${total}">${Array.from({ length:total }, (_, i) => `<span class="${i < index || (solved && i === index) ? 'done' : i === index ? 'active' : ''}" aria-hidden="true">★</span>`).join('')}</div>`;

  if (solved) {
    return `${progress}<section class="answer-complete" aria-label="Bonne réponse"><div class="completed-answer"><span>${escape(completedText(question))}</span><span class="completed-check" aria-hidden="true">✓</span></div>${question.modelParts ? reading(question.modelParts.join(' + '), question) : ''}<div class="visual-feedback visual-feedback--success" role="status"><span class="sr-only">Bonne réponse. La flèche permet de continuer.</span><div class="feedback-companion cheering-companion" aria-hidden="true">${avatar(hero(), true, 'cheer')}</div></div><button class="next-picture exercise-next" data-action="next" aria-label="Passer au jeu suivant">${picture('arrow')}</button></section>`;
  }
  return `${progress}<section class="question-workspace" aria-labelledby="exercise-instruction"><h1 id="exercise-instruction" class="sr-only">${question.instruction}</h1><div class="exercise-stimulus ${question.text ? 'has-model' : 'audio-stimulus'}">${question.text ? reading(question.text, question) : ''}<button class="exercise-companion-guide ${syllableChoice ? 'exercise-syllable-repeat' : ''} ${feedback && !feedback.correct ? 'companion-supporting' : ''}" data-action="repeat" aria-label="${syllableChoice ? 'Réécouter la syllabe avec ' : feedback ? 'Réécouter l’aide avec ' : 'Écouter la consigne avec '}${hero().name}"><span ${syllableChoice ? 'aria-hidden="true"' : ''}>${avatar(hero(), false, feedback ? 'support' : 'neutral')}</span>${syllableChoice ? `<span class="syllable-repeat-speaker" aria-hidden="true">${picture('sound')}</span>` : `<span class="companion-voice-badge" aria-hidden="true">${icon('audio')}</span>`}</button></div>${blocked ? `<div class="audio-required">${hasVoice ? `<button class="sound-enable" data-action="audio" aria-label="Activer le son">${picture('sound')}</button>` : '<p role="status">La voix n’est pas disponible dans ce navigateur.</p>'}<button class="picture-option" data-action="alternative" aria-label="Choisir un autre exercice sans écoute">${picture('arrow')}</button></div>` : choiceControls(question, rejected, guided, isCalibration)}${feedback ? `<div class="visual-feedback visual-feedback--retry" role="status"><span class="sr-only">Tu peux réessayer. Le compagnon est là pour t’aider.</span></div>` : ''}<div class="exercise-secondary"><button class="help-picture" data-action="${isCalibration ? 'skip-calibration' : 'help'}" aria-label="${isCalibration ? 'Je ne sais pas encore, passer cette question' : 'Demander de l’aide à mon compagnon'}">${picture('help')}</button><button class="exercise-difficulty" data-action="difficulty" aria-label="Mon niveau. ${complexityLabel()}">${picture('game-choice')}</button></div>${guided ? '<p class="sr-only">La réponse entourée t’aide à terminer cette découverte.</p>' : ''}</section>`;
}
function mission() { return `<main id="main" tabindex="-1" class="exercise">${exerciseContent(currentQuestion(), profile.session.index)}</main>`; }
function calibrate() { return `<main id="main" tabindex="-1" class="exercise">${exerciseContent(currentQuestion(), calibrationState.index, true)}</main>`; }
function calibrationResult() {
  const level = recommendedLevel(calibrationState.results);
  return `<main id="main" tabindex="-1" class="result child-result"><div class="result-avatar">${avatar()}</div><h1>Prêt à jouer !</h1>${picture(['sounds','words','clues','stories'][level ?? 0])}${playButton('accept-calibration')}<button class="picture-calibrate" data-action="manual-level" aria-label="Choisir un autre parcours">${picture('stories')}<span>Autre chemin</span></button></main>`;
}
function celebration() { return `<main id="main" tabindex="-1" class="result child-result celebration"><span class="confetti c1" aria-hidden="true">✦</span><span class="confetti c2" aria-hidden="true">✧</span><div class="result-avatar">${avatar(hero(), true, 'cheer')}</div><h1 class="sr-only">Mission accomplie !</h1><div class="mission-medal" aria-hidden="true">${picture('success')}</div><div class="result-stars" aria-label="Mission accomplie, 8 étapes terminées">★★★★★★★★</div><p class="sr-only">Tu as su essayer et demander de l’aide. Bravo pour tes efforts.</p><div class="celebration-actions">${playButton('start', 'Encore')}<button class="pause-picture" data-action="home" aria-label="Faire une pause et retourner à l’accueil">${picture('home')}<span>Pause</span></button></div>${suggestedStage !== null ? `<button class="picture-calibrate" data-action="next-foundation" aria-label="Essayer la prochaine petite étape">${picture('arrow')}<span>Une autre découverte</span></button>` : ''}</main>`; }
function startMission() {
  if (profile.session) {
    const dialog = document.querySelector('#confirm');
    dialog.innerHTML = `<h2 id="confirm-title">On continue ?</h2><div class="visual-confirm"><button class="next-picture" id="resume-mission" aria-label="Reprendre la mission en cours">${picture('arrow')}<span>Continuer</span></button><button class="pause-picture" id="restart-mission" aria-label="Commencer une nouvelle mission">${picture('play')}<span>Nouveau jeu</span></button></div>`;
    dialog.querySelector('#resume-mission').onclick = () => { dialog.close(); actions.resume(); };
    dialog.querySelector('#restart-mission').onclick = () => { dialog.close(); profile.session = null; startMission(); };
    dialog.showModal(); speak('Pour continuer ton jeu, touche la flèche. Pour un nouveau jeu, touche le triangle.'); return;
  }
  profile.session = createMission(profile);
  screen = 'mission'; feedback = null; save(); render(true); readQuestion();
}
function readQuestion() { stopAudio(); speak(exerciseSpeech(currentQuestion(),profile.session?.interaction)); }
function endMission(successTarget = null) {
  rememberGroup(profile,profile.session,true);
  if (profile.session.mode !== 'replay') recordBeginnerMission(profile, profile.session);
  suggestedStage = profile.session.mode !== 'replay' && profile.session.level === 0 && profile.session.beginnerStage < 3 && profile.beginnerWins[profile.session.beginnerStage] >= 2 ? profile.session.beginnerStage + 1 : null;
  lastResults = [...profile.session.results]; profile.completed++; profile.assisted += lastResults.filter(r => r === 'assisted').length;
  profile.session = null; save(); screen = 'celebration'; feedback = null; render(true); speak(successTarget || 'Bravo ! Tu as terminé ta mission. Pour rejouer, touche le triangle. Pour faire une pause, touche la maison.', successTarget ? 'Bravo !' : null);
}
function finishCalibration() { clearTimeout(calibrationTimer); stopAudio(); screen = 'calibrationResult'; render(true); speak('Ton aventure t’attend ! Touche le grand triangle pour jouer.'); }
function calibrationAnswer(correct) {
  calibrationState.results.push(correct);
  calibrationState.index++;
  if (correct !== true || calibrationState.index >= calibration.length) finishCalibration();
  else { render(true); readQuestion(); }
}
function completeExercise(question) {
  const session = profile.session;
  if (session.results.length > session.index) return;
  const assisted = session.attempts > 0 || session.helpUsed === true || Boolean(session.overrides[session.index]);
  recordExercise(profile, question, assisted ? 'assisted' : 'independent');
  session.results.push(assisted ? 'assisted' : 'independent');
  feedback = { correct: true, assisted }; save();
  const successTarget = question.foundation ? exerciseSpeech(question,question.mechanic === 'pairs' ? {...session.interaction,selectedSource:session.interaction.matched.at(-1)} : session.interaction) : null;
  if (session.index === 7) return endMission(successTarget);
  speak(question.foundation ? successTarget : ['Bien joué !', 'Oui, c’est ça !', 'Tu as trouvé !'][session.index % 3] + (question.mechanic === 'build' ? ' ' + completedText(question) + '.' : question.type === 'letter_match' && !question.mechanic ? ' C’est la lettre ' + question.text + '.' : '') + ' On continue ? Touche la flèche.', question.foundation ? 'Bravo !' : null);
  render(); document.querySelector('[data-action="next"]')?.focus();
}
function incorrectExercise(question) {
  profile.session.attempts++; feedback = { correct: false };
  speak(question.foundation ? exerciseSpeech(question,profile.session.interaction) : 'Ce n’est pas grave, on essaie ensemble. ' + question.hint);
  save(); render();
  document.querySelector('[data-action="pair-target"], [data-action="build-tile"], .answer:not(:disabled)')?.focus();
}
function answer(index) {
  const question = currentQuestion();
  if (!Number.isInteger(index) || index < 0 || index >= question.options.length) return;
  if (screen === 'calibrate') return calibrationAnswer(index === question.answer);
  const session = profile.session;
  if (question.mechanic || feedback?.correct || session.rejected.includes(index) || (question.requiresAudio !== false && (question.listen || question.optionAudio) && (!profile.audio || !hasVoice))) return;
  if (index === question.answer) completeExercise(question);
  else { session.rejected.push(index); incorrectExercise(question); }
}
function interact(action, index) {
  if (screen !== 'mission' || feedback?.correct) return;
  const question = currentQuestion();
  if (!question.mechanic || (question.requiresAudio !== false && question.listen && (!profile.audio || !hasVoice))) return;
  const result = applyInteraction(question, profile.session.interaction, action, index);
  if (result.event === 'idle') return;
  profile.session.interaction = result.state;
  if (result.event === 'complete') return completeExercise(question);
  if (result.event === 'incorrect') return incorrectExercise(question);
  feedback = null; save(); render();
  if (result.event === 'selected') {
    speak(exerciseSpeech(question,profile.session.interaction));
    document.querySelector('[data-action="pair-target"]')?.focus();
  } else if (question.mechanic === 'pairs') {
    speak(exerciseSpeech(question,profile.session.interaction));
    document.querySelector('[data-action="pair-source"]')?.focus();
  } else {
    speak(question.foundation ? exerciseSpeech(question,profile.session.interaction) : result.event === 'undo' ? 'Tu peux replacer ta carte.' : 'Encore une carte.');
    document.querySelector('[data-action="build-tile"]')?.focus();
  }
}
function confirmAction(title, description, label, action) {
  const dialog = document.querySelector('#confirm');
  dialog.innerHTML = `<div class="dialog-heading"><h2 id="confirm-title">${title}</h2></div><p>${description}</p><div class="dialog-actions"><button class="secondary" data-dialog-close>Annuler</button><button class="primary" id="confirm-action">${label}</button></div>`;
  dialog.querySelector('[data-dialog-close]').onclick = () => dialog.close();
  dialog.querySelector('#confirm-action').onclick = () => { dialog.close(); action(); };
  dialog.showModal();
}
function settings() {
  const dialog = document.querySelector('#settings');
  const settingsGuidance = () => speak('Choisis les lettres qui te plaisent. Pour revenir au jeu, touche la coche.');
  const settingsLabels = { size: 'Taille du texte', spacing: 'Espace entre les lettres', line: 'Espace entre les lignes', font: 'Police de lecture', syllables: 'Syllabes en couleurs', ruler: 'Guide de lecture' };
  const options = (key, values, labels) => values.map((value, i) => `<button class="visual-setting ${profile.settings[key] === value ? 'selected' : ''}" data-setting-key="${key}" data-setting-value="${value}" aria-label="${settingsLabels[key]} : ${labels[i]}" aria-pressed="${profile.settings[key] === value}">${key === 'size' ? `<span style="font-size:${value}px">A</span>` : key === 'spacing' ? `<span style="letter-spacing:${value}em">abc</span>` : key === 'line' ? `<span style="line-height:${value}">abc<br>abc</span>` : `<span style="font-family:${value}">Aa</span>`}</button>`).join('');
  dialog.innerHTML = `<div class="dialog-heading"><h2 id="settings-title">À ta façon</h2><button class="tool" id="settings-voice" aria-label="Réécouter comment choisir les réglages">${icon('audio')}</button><button class="tool" data-close-settings aria-label="Fermer les réglages">✕</button></div><div class="visual-setting-row"><span aria-hidden="true">A ↔ A</span><div>${options('size', [22,28,34], ['normal','grand','très grand'])}</div></div><div class="visual-setting-row"><span aria-hidden="true">a ↔ b</span><div>${options('spacing', [.05,.08,.12], ['confort','aéré','très aéré'])}</div></div><div class="settings-preview reading" id="settings-preview">À mon rythme.</div><button class="next-picture settings-done" data-close-settings aria-label="Valider et reprendre le jeu">✓</button><details class="adult-settings"><summary>Pour les adultes · Réglages avancés</summary><div class="visual-setting-row"><span aria-hidden="true">↕</span><div>${options('line', [1.6,1.8,2], ['confort','aéré','très aéré'])}</div></div><div class="visual-setting-row"><span aria-hidden="true">Aa</span><div>${options('font', ['sans-serif','Verdana','Arial'], ['sans empattement','Verdana','Arial'])}</div></div><div class="visual-toggles">${['syllables','ruler'].map(key => `<button class="visual-setting toggle-setting ${profile.settings[key] ? 'selected' : ''}" data-setting-key="${key}" data-setting-value="${!profile.settings[key]}" aria-label="${settingsLabels[key]}" aria-pressed="${profile.settings[key]}">${key === 'syllables' ? '<span class="syllable-0">ba</span><span class="syllable-1">teau</span>' : '<span class="ruler-sample">abc</span>'}<span aria-hidden="true">${profile.settings[key] ? '✓' : '○'}</span></button>`).join('')}</div><p>Les réglages sont sauvegardés uniquement sur cet appareil. La voix dépend du navigateur. Une navigation autonome sans lecture nécessite une voix française disponible et le son activé.</p><button class="secondary" id="history-button">Historique des exercices</button><button class="secondary" id="privacy-button">Gérer les données locales</button></details>`;
  const preview = () => { const el = dialog.querySelector('#settings-preview'); el.style.fontFamily = profile.settings.font; el.style.fontSize = profile.settings.size + 'px'; el.style.letterSpacing = profile.settings.spacing + 'em'; el.style.lineHeight = profile.settings.line; };
  dialog.querySelectorAll('[data-setting-key]').forEach(button => button.onclick = () => {
    const key = button.dataset.settingKey, raw = button.dataset.settingValue;
    profile.settings[key] = ['syllables','ruler'].includes(key) ? raw === 'true' : key === 'font' ? raw : Number(raw);
    save(); render();
    // Update selection in place to keep keyboard focus on the chosen control.
    dialog.querySelectorAll(`[data-setting-key="${key}"]`).forEach(control => {
      const isToggle = ['syllables','ruler'].includes(key);
      const selected = isToggle ? profile.settings[key] : String(profile.settings[key]) === control.dataset.settingValue;
      control.classList.toggle('selected', selected); control.setAttribute('aria-pressed', String(selected));
      if (isToggle) { control.dataset.settingValue = String(!profile.settings[key]); control.lastElementChild.textContent = selected ? '✓' : '○'; }
    });
    preview(); speak(settingsLabels[key] + (typeof profile.settings[key] === 'boolean' ? profile.settings[key] ? ' activé.' : ' désactivé.' : '. À toi de choisir ce qui te plaît.'));
  });
  dialog.querySelectorAll('[data-close-settings]').forEach(button => button.onclick = () => { dialog.close(); navigationGuidance(); });
  dialog.querySelector('#privacy-button').onclick = () => { dialog.close(); privacy(); };
  dialog.querySelector('#history-button').onclick = () => { dialog.close(); historyDialog(); };
  dialog.querySelector('#settings-voice').onclick = settingsGuidance;
  preview(); dialog.showModal(); settingsGuidance();
}
function historyDialog() {
  const dialog = document.querySelector('#confirm');
  const entries = profile.exerciseHistory.slice(-40).reverse();
  const typeName = question => question?.mechanic === 'pairs' ? 'Association de lettres' : question?.mechanic === 'build' ? question.unit === 'letters' ? 'Fusion de lettres' : 'Assemblage de syllabes' : question?.foundation ? 'Lettres et sons' : question?.type || 'Exercice';
  dialog.innerHTML = `<div class="dialog-heading"><h2 id="confirm-title">Historique des exercices</h2><button class="tool" id="history-close" aria-label="Fermer l’historique">✕</button></div><p>${profile.exerciseHistory.length} exercice(s) conservé(s) sur cet appareil. Les 40 derniers sont affichés. Jusqu’à ${HISTORY_LIMIT} résultats sont gardés ; les plus anciens sont ensuite remplacés.</p>${entries.length ? `<div class="history-scroll"><table class="history-table"><thead><tr><th>Date</th><th>Exercice</th><th>Résultat</th></tr></thead><tbody>${entries.map(entry => { const question = questionById(entry.exerciseId); return `<tr><td>${escape(new Date(entry.completedAt).toLocaleString('fr-FR',{dateStyle:'short',timeStyle:'short'}))}</td><td>${escape(typeName(question))}<small>${escape(question ? completedText(question) : entry.exerciseId)}</small></td><td>${entry.result === 'assisted' ? 'Avec aide ou nouvelle tentative' : 'Autonome'}</td></tr>`; }).join('')}</tbody></table></div><button class="secondary" id="history-export">Télécharger l’historique</button>` : '<p>Les prochains exercices terminés apparaîtront ici. Les anciennes missions ne permettent pas de reconstituer un historique détaillé.</p>'}`;
  dialog.querySelector('#history-close').onclick = () => dialog.close();
  if (entries.length) dialog.querySelector('#history-export').onclick = () => {
    const url = URL.createObjectURL(new Blob([JSON.stringify({ version:1, exportedAt:new Date().toISOString(), exercises:profile.exerciseHistory, groups:profile.missionGroups },null,2)],{type:'application/json'}));
    const link = document.createElement('a'); link.href = url; link.download = 'azylit-historique.json'; document.body.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url),1000);
  };
  dialog.showModal();
}
function privacy() { confirmAction('Tes données restent ici', 'Ce prototype enregistre uniquement ton compagnon, ton parcours, tes réglages et ta progression dans ce navigateur. Il n’envoie pas ces données à un serveur et ne propose pas encore de code de récupération. Effacer les données du navigateur efface aussi ta progression. Tu peux tout supprimer ici.', 'Effacer ma progression', () => { stopAudio(); profile = freshProfile(); save(); screen = 'home'; render(true); announce('Ta progression a été effacée sur cet appareil.'); }); }
const actions = {
  home() { stopAudio(); clearTimeout(calibrationTimer); screen = 'home'; feedback = null; render(true); navigationGuidance(); },
  discover() { stopAudio(); discoveryState.page = 'hub'; screen = 'discover'; render(true); navigationGuidance(); },
  'discovery-home'() { actions.home(); },
  'discover-action'(button) { dispatchDiscovery(button); },
  onboard() { step = 0; screen = 'onboarding'; render(true); navigationGuidance(); },
  'change-hero'() { actions.onboard(); },
  hero(button) { profile.hero = button.dataset.hero; save(); render(); document.querySelector(`[data-hero="${profile.hero}"]`)?.focus(); speak('Voici ' + hero().name + ', ' + hero().title.toLowerCase() + '. Touche la maison pour revenir à l’accueil.'); },
  'confirm-settings'() {
    const returnToGame = screen === 'difficulty' && difficultyReturn?.screen === 'mission';
    if (screen === 'difficulty' && profile.session && (profile.session.level !== profile.level || (profile.level === 0 && profile.session.beginnerStage !== profile.beginnerStage))) profile.session = null;
    const firstChoice = !profile.onboarded; profile.onboarded = true; save();
    if (returnToGame) {
      if (!profile.session) { difficultyReturn = null; startMission(); }
      else actions['back-complexity']();
      return;
    }
    actions.home();
    if (firstChoice) speak('Ton compagnon est prêt. Touche le grand triangle pour jouer.');
  },


  'finish-setup'() { profile.onboarded = true; save(); startMission(); },
  difficulty() {
    if (screen !== 'difficulty') difficultyReturn = { screen: screen === 'calibrate' ? 'home' : screen, step, feedback };
    clearTimeout(calibrationTimer); calibrationState = null; screen = 'difficulty'; feedback = null; render(true); navigationGuidance();
  },
  'back-complexity'() {
    stopAudio();
    if (screen === 'onboarding' && step === 1) { step = 0; render(true); navigationGuidance(); return; }
    const previous = difficultyReturn; difficultyReturn = null;
    screen = previous?.screen || 'home'; step = previous?.step || 0; feedback = previous?.feedback || null;
    if (screen === 'mission' && !profile.session) { screen = 'home'; feedback = null; }
    render(true); navigationGuidance();
  },
  easier() { adjustDifficulty(-1); },
  harder() { adjustDifficulty(1); },
  'difficulty-voice'() { profile.audio = true; save(); navigationGuidance(); },
  'start-selected'() { stopAudio(); clearTimeout(calibrationTimer); calibrationState = null; profile.session = null; profile.onboarded = true; save(); startMission(); },
  'next-foundation'() { if (suggestedStage === null) return; profile.level = 0; profile.beginnerStage = suggestedStage; save(); startMission(); },
  start: startMission,
  resume() { if (!profile.session) return actions.home(); rememberGroup(profile,profile.session); save(); screen = 'mission'; feedback = null; render(true); readQuestion(); },
  audio() { profile.audio = !profile.audio; stopAudio(); save(); render(); announce(profile.audio ? 'Audio activé' : 'Audio coupé'); if (profile.audio) navigationGuidance(); },
  guide() { profile.audio = true; save(); render(); navigationGuidance(); },
  settings,
  privacy,
  repeat() { speak(exerciseSpeech(currentQuestion(),profile.session?.interaction)); },
  'listen-word'() { speak(currentQuestion().listen); },
  'option-audio'(button) { speak(currentQuestion().options[Number(button.dataset.option)]); },
  answer(button) { answer(Number(button.dataset.answer)); },
  'pair-source'(button) { interact('source', Number(button.dataset.card)); },
  'pair-target'(button) { interact('target', Number(button.dataset.card)); },
  'build-tile'(button) { interact('tile', Number(button.dataset.card)); },
  'build-undo'() { interact('undo'); },
  help() { profile.session.helpUsed = true; feedback = { correct: false }; save(); render(); speak(currentQuestion().foundation ? exerciseSpeech(currentQuestion(),profile.session.interaction) : currentQuestion().hint); },
  'feedback-audio'() { speak(currentQuestion().foundation ? exerciseSpeech(currentQuestion(),profile.session?.interaction) : feedback.correct ? 'Bravo ! Touche la grande flèche pour continuer.' : 'Tu as essayé, cherchons ensemble. ' + currentQuestion().hint); },
  next() { if (!feedback?.correct) return; stopAudio(); profile.session.index++; profile.session.attempts = 0; profile.session.helpUsed = false; profile.session.rejected = []; profile.session.interaction = null; feedback = null; save(); render(true); readQuestion(); },
  quit() {
    stopAudio();
    clearTimeout(calibrationTimer);
    calibrationState = null;
    profile.session = null;
    save();
    actions.home();
  },
  alternative() { if (screen === 'calibrate') return calibrationAnswer(null); const s = profile.session; const alternative = questionsFor(s.level, s.beginnerStage).find(q => !q.listen && !q.optionAudio && q.id !== currentQuestion().id) || questionsFor(0, 0)[s.index]; s.overrides[s.index] = alternative.id; if (s.variants) s.variants[s.index] = {}; s.attempts = 0; s.helpUsed = false; s.rejected = []; s.interaction = null; feedback = null; save(); render(true); readQuestion(); },
  calibrate() { calibrationState = { index: 0, results: [] }; feedback = null; screen = 'calibrate'; render(true); readQuestion(); calibrationTimer = setTimeout(finishCalibration, 120000); },
  'skip-calibration'() { calibrationAnswer(null); },
  'manual-level'() { actions.difficulty(); },
  'accept-calibration'() { const level = recommendedLevel(calibrationState.results); if (level === null) return actions['manual-level'](); profile.level = level; if (level === 0) profile.beginnerStage = recommendedBeginnerStage(calibrationState.results); profile.onboarded = true; save(); startMission(); },
  'calibration-audio'() { const level = recommendedLevel(calibrationState.results); speak(level === null ? 'Choisis le parcours qui te donne envie.' : level === 0 ? beginnerStages[recommendedBeginnerStage(calibrationState.results)].spoken + ' Touche le triangle pour jouer.' : 'On essaie de petits mots ensemble. Touche le triangle pour jouer.'); },
  'celebration-audio'() { speak('Bravo ! Tu as terminé ta mission. Pour rejouer, touche le triangle. Pour faire une pause, touche la maison.'); }
};
app.addEventListener('click', event => { const button = event.target.closest('[data-action]'); if (!button || button.disabled) return; event.preventDefault(); const action = button.dataset.action;
  const isBack = ['back-complexity'].includes(action) || (action === 'discover-action' && button.dataset.command === 'back');
  if (isBack && navigation.back()) return;
  actions[action]?.(button); });
document.addEventListener('keydown', event => {
  if (document.querySelector('dialog[open]') || !['mission', 'calibrate'].includes(screen) || event.altKey || event.ctrlKey || event.metaKey) return;
  if (event.target.matches('.reading.ruler') && ['ArrowUp', 'ArrowDown'].includes(event.key)) {
    event.preventDefault();
    const text = event.target, line = parseFloat(getComputedStyle(text).lineHeight);
    const current = parseFloat(text.style.getPropertyValue('--guide-y')) || 24;
    text.style.setProperty('--guide-height', line + 'px');
    text.style.setProperty('--guide-y', Math.max(24, Math.min(text.clientHeight - 24 - line, current + (event.key === 'ArrowDown' ? line : -line))) + 'px');
    return;
  }
  if (/^[1-4]$/.test(event.key) && !['INPUT', 'SELECT', 'TEXTAREA'].includes(event.target.tagName)) { const button = app.querySelector(`[data-shortcut="${event.key}"], [data-answer="${Number(event.key) - 1}"]`); if (button && !button.disabled) { event.preventDefault(); button.click(); } }
  if (event.code === 'Space' && !event.target.closest('button, a, input, select, textarea')) { event.preventDefault(); actions.repeat(); }
});
// The horizontal guide follows the pointed line without requiring a fine drag gesture.
app.addEventListener('pointermove', event => { const text = event.target.closest('.reading.ruler'); if (text) { const box = text.getBoundingClientRect(); const line = parseFloat(getComputedStyle(text).lineHeight); const y = Math.floor((event.clientY - box.top - 24) / line) * line + 24; text.style.setProperty('--guide-height', line + 'px'); text.style.setProperty('--guide-y', Math.max(24, y) + 'px'); } });
save();
render();
