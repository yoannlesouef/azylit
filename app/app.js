import { frenchUtterance } from './speech.js';
import { beginnerStages } from './foundations.js';
import { companionArt, navigationPicture as picture } from './companions.js';
import { heroes, levels, banks, calibration, questionsFor, questionById } from './data.js';
import { STORAGE_KEY, freshProfile, parseProfile, recommendedLevel, recommendedBeginnerStage, recordBeginnerMission, difficultyPosition, setDifficultyPosition } from './state.js';
const app = document.querySelector('#app');
const hasVoice = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
let profile;
let storageOK = true;
try { profile = parseProfile(localStorage.getItem(STORAGE_KEY)); } catch { profile = freshProfile(); storageOK = false; }
let screen = 'home', step = 0, feedback = null, calibrationState = null, calibrationTimer, voiceWaitCleanup, lastResults = [], suggestedStage = null;
const hero = () => heroes.find(h => h.id === profile.hero);
const escape = (value) => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const icon = (name) => ({ audio: '<svg viewBox="0 0 24 24"><path d="M11 5 6 9H3v6h3l5 4zM15 8c3 2 3 6 0 8m3-11c5 4 5 10 0 14"/></svg>', mute: '<svg viewBox="0 0 24 24"><path d="M11 5 6 9H3v6h3l5 4zM16 9l5 6m0-6-5 6"/></svg>', settings: '<svg viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16"/><circle cx="9" cy="6" r="2"/><circle cx="16" cy="12" r="2"/><circle cx="8" cy="18" r="2"/></svg>', arrow: '<svg viewBox="0 0 24 24"><path d="M4 12h15m-6-6 6 6-6 6"/></svg>', book: '<svg viewBox="0 0 24 24"><path d="M12 6v15M3 4c4-1 6 0 9 2 3-2 5-3 9-2v15c-4-1-6 0-9 2-3-2-5-3-9-2z"/></svg>' })[name] || '';
function avatar(h = hero(), big = false) { return companionArt(h, big); }
function save() { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(profile)); storageOK = true; } catch { storageOK = false; } }
function speak(text) {
  if (!profile.audio || !hasVoice) return;
  stopAudio();
  const play = () => speechSynthesis.speak(frenchUtterance(text, SpeechSynthesisUtterance, speechSynthesis.getVoices()));
  if (speechSynthesis.getVoices().length || !speechSynthesis.addEventListener) { play(); return; }
  // Browsers often expose their higher-quality voices just after the first interaction.
  let timeout;
  const ready = () => { voiceWaitCleanup?.(); play(); };
  voiceWaitCleanup = () => { clearTimeout(timeout); speechSynthesis.removeEventListener('voiceschanged', ready); voiceWaitCleanup = null; };
  speechSynthesis.addEventListener('voiceschanged', ready, { once: true });
  timeout = setTimeout(ready, 700);
}
function stopAudio() { voiceWaitCleanup?.(); if ('speechSynthesis' in window) speechSynthesis.cancel(); }
function announce(text) { document.querySelector('#announcer').textContent = text; }
function controls(focus = false) { return `<div class="controls">${focus ? '' : `<button class="tool help-voice" data-action="guide" aria-label="Écouter comment jouer">${icon('audio')}</button>`}<button class="tool" data-action="audio" aria-label="${profile.audio ? 'Couper le son' : 'Activer le son'}" aria-pressed="${!profile.audio}">${icon('mute')}</button><button class="tool" data-action="settings" aria-label="Réglages">${icon('settings')}</button></div>`; }
function header(focus = false) { return `<header class="header child-header ${focus ? 'exercise-header' : ''}">${focus ? `<button class="tool exit-picture" data-action="quit" aria-label="Arrêter l’exercice et revenir à l’accueil">${picture('home')}</button>` : '<div class="brand-with-purpose"><a class="brand" href="#" data-action="home" aria-label="Accueil Azyl.it"><span class="brand-mark">ϟ</span>azyl<span class="brand-dot">.it</span></a><p class="parent-purpose">Apprendre à lire, chacun à son rythme.</p></div>'}${controls(focus || screen === 'difficulty' || (screen === 'onboarding' && step === 1))}</header>`; }
function navigationGuidance() {
  if (screen === 'mission' || screen === 'calibrate') return actions.repeat();
  if (screen === 'difficulty' || (screen === 'onboarding' && step === 1)) return speak(difficultyDescription() + ' Pour plus facile, touche le moins. Pour plus difficile, touche le plus. Pour jouer, touche le grand triangle.');
  if (screen === 'onboarding') return speak(step === 0 ? 'Choisis ton compagnon en touchant son image. Puis touche la grande flèche.' : 'On commence avec une seule lettre. Touche le grand bouton pour jouer. Pour choisir un autre chemin, touche son image.');
  if (screen === 'celebration') return actions['celebration-audio']();
  if (screen === 'calibrationResult') return actions['calibration-audio']();
  speak(profile.onboarded ? 'Pour jouer, touche le grand triangle. Pour un jeu plus facile ou plus difficile, touche les signes moins et plus.' : 'Bienvenue ! Touche le grand triangle pour jouer. Ensuite, choisis ton compagnon.');
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
  const pages = { home, onboarding, mission, celebration, calibrate, calibrationResult, difficulty };
  app.innerHTML = header(screen === 'mission' || screen === 'calibrate') + pages[screen]() + (!storageOK ? '<div class="storage-notice" role="status">La sauvegarde sur cet appareil est indisponible. Ta progression reste accessible pendant cette visite.</div>' : '');
  if (focus && !document.querySelector('dialog[open]')) document.querySelector('#main')?.focus();
}
function home() {
  return `<main id="main" tabindex="-1" class="child-home"><h1>À toi de jouer !</h1><div class="companion-stage"><span class="stage-spark spark-left" aria-hidden="true">✦</span>${avatar(hero(), true)}<span class="stage-spark spark-right" aria-hidden="true">✧</span></div>${playButton(profile.onboarded ? profile.session ? 'resume' : 'start' : 'onboard', profile.session ? 'Continuer' : 'Jouer')}<nav class="picture-nav" aria-label="Personnaliser mon aventure"><button class="picture-option" data-action="change-hero" aria-label="Choisir mon compagnon"><span class="small-portrait">${avatar()}</span><span>Mon compagnon</span></button><button class="picture-option" data-action="difficulty" aria-label="Choisir plus facile ou plus difficile">${picture('difficulty')}</button></nav></main>`;
}
function onboarding() {
  if (step === 1) return difficulty();
  return `<main id="main" tabindex="-1" class="child-setup"><div class="setup-back"><button class="tool" data-action="home" aria-label="Retour à l’accueil">←</button></div><h1>Ton compagnon ?</h1><div class="companion-grid">${heroes.map(h => `<button class="companion-choice ${h.id === profile.hero ? 'selected' : ''}" style="--local:${h.color};--local-pale:${h.pale}" data-action="hero" data-hero="${h.id}" aria-label="Choisir ${h.name}, ${h.title.toLowerCase()}" aria-pressed="${h.id === profile.hero}">${avatar(h)}<strong>${h.title}</strong><span class="selection-check" aria-hidden="true">${h.id === profile.hero ? '✓' : ''}</span></button>`).join('')}</div><button class="next-picture" data-action="setup-next" aria-label="Choisir la difficulté du jeu">${picture('arrow')}</button></main>`;
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
  return `<main id="main" tabindex="-1" class="difficulty-screen"><h1 class="sr-only">Choisis ton jeu, plus facile ou plus difficile</h1><div class="difficulty-picker"><button class="difficulty-step" data-action="easier" aria-label="Choisir un jeu plus facile" ${position === 0 ? 'disabled' : ''}><svg class="nav-picture" viewBox="0 0 100 100" aria-hidden="true"><path d="M25 50h50"/></svg></button><button class="difficulty-preview" data-action="difficulty-voice" aria-label="Écouter ce jeu" aria-describedby="difficulty-state"><span class="preview-art" aria-hidden="true">${difficultyPreview()}</span><span class="preview-speaker" aria-hidden="true">${icon('audio')}</span></button><button class="difficulty-step" data-action="harder" aria-label="Choisir un jeu plus difficile" ${position === 6 ? 'disabled' : ''}><svg class="nav-picture" viewBox="0 0 100 100" aria-hidden="true"><path d="M25 50h50M50 25v50"/></svg></button></div><div class="difficulty-dots" aria-hidden="true">${Array.from({length:7},(_,i) => `<span class="${position === i ? 'selected' : ''}"></span>`).join('')}</div><span class="sr-only" id="difficulty-state" role="status">${difficultyDescription()}</span>${playButton('start-selected', '')}</main>`;
}
function adjustDifficulty(direction) {
  const previous = difficultyPosition(profile);
  setDifficultyPosition(profile, previous + direction);
  if (difficultyPosition(profile) === previous) return;
  save(); render();
  const position = difficultyPosition(profile);
  const focusAction = direction > 0 ? position === 6 ? 'easier' : 'harder' : position === 0 ? 'harder' : 'easier';
  document.querySelector(`[data-action="${focusAction}"]`)?.focus();
  speak(difficultyDescription() + ' Touche le triangle si tu veux essayer.');
}
function currentQuestion() {
  if (screen === 'calibrate') return calibration[calibrationState.index];
  const session = profile.session;
  return questionById(session.overrides[session.index]) || questionsFor(session.level, session.beginnerStage)[session.index];
}
function exerciseContent(question, index, isCalibration = false) {
  const rejected = isCalibration ? [] : profile.session.rejected;
  const solved = feedback?.correct === true;
  const audioRequired = question.listen || question.optionAudio;
  const blocked = !!audioRequired && (!profile.audio || !hasVoice);
  const guided = !isCalibration && profile.session.attempts >= 2;
  const progress = `<div class="stars exercise-progress" aria-label="${index + (solved ? 1 : 0)} étapes terminées sur ${isCalibration ? 5 : 8}">${Array.from({ length: isCalibration ? 5 : 8 }, (_, i) => `<span class="${i < index || (solved && i === index) ? 'done' : i === index ? 'active' : ''}" aria-hidden="true">★</span>`).join('')}</div>`;
  if (solved) {
    return `${progress}<section class="answer-complete" aria-label="Bonne réponse"><div class="completed-answer"><span>${escape(question.options[question.answer])}</span><span class="completed-check" aria-hidden="true">✓</span></div>${question.modelParts ? reading(question.modelParts.join(' + '), question) : ''}<div class="visual-feedback visual-feedback--success" role="status"><span class="sr-only">Bonne réponse. La flèche permet de continuer.</span><div class="feedback-companion" aria-hidden="true">${avatar()}<span class="companion-spark">★</span></div></div><button class="next-picture exercise-next" data-action="next" aria-label="Passer au jeu suivant">${picture('arrow')}</button></section>`;
  }
  return `${progress}<section class="question-workspace" aria-labelledby="exercise-instruction"><h1 id="exercise-instruction" class="sr-only">${question.instruction}</h1><div class="exercise-stimulus ${question.text ? 'has-model' : 'audio-stimulus'}">${question.text ? reading(question.text, question) : ''}<button class="stimulus-audio ${feedback && !feedback.correct ? 'hint-focus' : ''}" data-action="repeat" aria-label="${feedback ? 'Réécouter l’aide' : question.listen ? 'Écouter le son ou le mot et la consigne' : 'Réécouter la consigne'}">${picture('sound')}</button></div>${blocked ? `<div class="audio-required">${hasVoice ? `<button class="sound-enable" data-action="audio" aria-label="Activer le son">${picture('sound')}</button>` : '<p role="status">La voix n’est pas disponible dans ce navigateur.</p>'}<button class="picture-option" data-action="alternative" aria-label="Choisir un autre exercice sans écoute">${picture('arrow')}</button></div>` : `<div class="answers ${question.foundation ? 'foundation-answers' : ''}">${question.options.map((option, i) => `<div class="answer-wrap">${rejected.includes(i) ? `<div class="answer rejected" aria-label="${escape(option)}, réponse déjà essayée"><span>${escape(option)}</span></div>` : `<button class="answer ${guided && i === question.answer ? 'guided' : ''}" data-action="answer" data-answer="${i}"><span>${escape(option)}</span></button>`}${question.optionAudio && !rejected.includes(i) ? `<button class="tool option-listen" data-action="option-audio" data-option="${i}" aria-label="Écouter ${escape(option)}">${icon('audio')}</button>` : ''}</div>`).join('')}</div>`}${feedback ? `<div class="visual-feedback visual-feedback--retry" role="status"><span class="sr-only">Tu peux réessayer. Le compagnon est là pour t’aider.</span><div class="feedback-companion" aria-hidden="true">${avatar()}<span class="companion-spark">♡</span></div><div class="feedback-badge" aria-hidden="true">${picture('retry')}</div></div>` : ''}<div class="exercise-secondary"><button class="help-picture" data-action="${isCalibration ? 'skip-calibration' : 'help'}" aria-label="${isCalibration ? 'Je ne sais pas encore, passer cette question' : 'Demander de l’aide à mon compagnon'}">${picture('help')}</button><button class="exercise-difficulty" data-action="difficulty" aria-label="Choisir plus facile ou plus difficile">${picture('difficulty')}</button></div>${guided ? '<p class="sr-only">La réponse entourée t’aide à terminer cette découverte.</p>' : ''}</section>`;
}
function mission() { return `<main id="main" tabindex="-1" class="exercise">${exerciseContent(currentQuestion(), profile.session.index)}</main>`; }
function calibrate() { return `<main id="main" tabindex="-1" class="exercise">${exerciseContent(currentQuestion(), calibrationState.index, true)}</main>`; }
function calibrationResult() {
  const level = recommendedLevel(calibrationState.results);
  return `<main id="main" tabindex="-1" class="result child-result"><div class="result-avatar">${avatar()}</div><h1>Prêt à jouer !</h1>${picture(['sounds','words','clues','stories'][level ?? 0])}${playButton('accept-calibration')}<button class="picture-calibrate" data-action="manual-level" aria-label="Choisir un autre parcours">${picture('stories')}<span>Autre chemin</span></button></main>`;
}
function celebration() { return `<main id="main" tabindex="-1" class="result child-result celebration"><span class="confetti c1" aria-hidden="true">✦</span><span class="confetti c2" aria-hidden="true">✧</span><div class="result-avatar">${avatar()}</div><h1 class="sr-only">Mission accomplie !</h1><div class="mission-medal" aria-hidden="true">${picture('success')}</div><div class="result-stars" aria-label="Mission accomplie, 8 étapes terminées">★★★★★★★★</div><p class="sr-only">Tu as su essayer et demander de l’aide. Bravo pour tes efforts.</p><div class="celebration-actions">${playButton('start', 'Encore')}<button class="pause-picture" data-action="home" aria-label="Faire une pause et retourner à l’accueil">${picture('home')}<span>Pause</span></button></div>${suggestedStage !== null ? `<button class="picture-calibrate" data-action="next-foundation" aria-label="Essayer la prochaine petite étape">${picture('arrow')}<span>Une autre découverte</span></button>` : ''}</main>`; }
function startMission() {
  if (profile.session) {
    const dialog = document.querySelector('#confirm');
    dialog.innerHTML = `<h2 id="confirm-title">On continue ?</h2><div class="visual-confirm"><button class="next-picture" id="resume-mission" aria-label="Reprendre la mission en cours">${picture('arrow')}<span>Continuer</span></button><button class="pause-picture" id="restart-mission" aria-label="Commencer une nouvelle mission">${picture('play')}<span>Nouveau jeu</span></button></div>`;
    dialog.querySelector('#resume-mission').onclick = () => { dialog.close(); actions.resume(); };
    dialog.querySelector('#restart-mission').onclick = () => { dialog.close(); profile.session = null; startMission(); };
    dialog.showModal(); speak('Pour continuer ton jeu, touche la flèche. Pour un nouveau jeu, touche le triangle.'); return;
  }
  profile.session = { beginnerStage: profile.beginnerStage, level: profile.level, index: 0, results: [], attempts: 0, rejected: [], overrides: {} };
  screen = 'mission'; feedback = null; save(); render(true); readQuestion();
}
function readQuestion() { stopAudio(); const question = currentQuestion(); speak(question.instruction + (question.listen ? ' ' + question.listen : '')); }
function endMission() {
  recordBeginnerMission(profile, profile.session);
  suggestedStage = profile.session.level === 0 && profile.session.beginnerStage < 3 && profile.beginnerWins[profile.session.beginnerStage] >= 2 ? profile.session.beginnerStage + 1 : null;
  lastResults = [...profile.session.results]; profile.completed++; profile.assisted += lastResults.filter(r => r === 'assisted').length;
  profile.session = null; save(); screen = 'celebration'; feedback = null; render(true); speak('Bravo ! Tu as terminé ta mission. Pour rejouer, touche le triangle. Pour faire une pause, touche la maison.');
}
function finishCalibration() { clearTimeout(calibrationTimer); stopAudio(); screen = 'calibrationResult'; render(true); speak('Ton aventure t’attend ! Touche le grand triangle pour jouer.'); }
function calibrationAnswer(correct) {
  calibrationState.results.push(correct);
  calibrationState.index++;
  if (correct !== true || calibrationState.index >= calibration.length) finishCalibration();
  else { render(true); readQuestion(); }
}
function answer(index) {
  const question = currentQuestion();
  if (screen === 'calibrate') return calibrationAnswer(index === question.answer);
  const s = profile.session;
  if (feedback?.correct || s.rejected.includes(index) || ((question.listen || question.optionAudio) && (!profile.audio || !hasVoice))) return;
  if (index === question.answer) {
    const assisted = s.attempts > 0 || Boolean(s.overrides[s.index]);
    s.results.push(assisted ? 'assisted' : 'independent');
    feedback = { correct: true, assisted }; save();
    if (s.index === 7) return endMission();
    speak(['Bien joué !', 'Oui, c’est ça !', 'Tu as trouvé !'][s.index % 3] + (question.type === 'letter_match' ? ' C’est la lettre ' + question.text + '.' : '') + ' On continue ? Touche la flèche.');
  } else {
    s.attempts++; s.rejected.push(index); feedback = { correct: false };
    speak('Ce n’est pas grave, on essaie ensemble. ' + question.hint); save();
  }
  render();
  if (feedback.correct) document.querySelector('[data-action="next"]')?.focus();
  else document.querySelector('.answer:not(:disabled)')?.focus();
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
  dialog.innerHTML = `<div class="dialog-heading"><h2 id="settings-title">À ta façon</h2><button class="tool" id="settings-voice" aria-label="Réécouter comment choisir les réglages">${icon('audio')}</button><button class="tool" data-close-settings aria-label="Fermer les réglages">✕</button></div><div class="visual-setting-row"><span aria-hidden="true">A ↔ A</span><div>${options('size', [22,28,34], ['normal','grand','très grand'])}</div></div><div class="visual-setting-row"><span aria-hidden="true">a ↔ b</span><div>${options('spacing', [.05,.08,.12], ['confort','aéré','très aéré'])}</div></div><div class="visual-setting-row"><span aria-hidden="true">↕</span><div>${options('line', [1.6,1.8,2], ['confort','aéré','très aéré'])}</div></div><div class="visual-setting-row"><span aria-hidden="true">Aa</span><div>${options('font', ['sans-serif','Verdana','Arial'], ['sans empattement','Verdana','Arial'])}</div></div><div class="visual-toggles">${['syllables','ruler'].map(key => `<button class="visual-setting toggle-setting ${profile.settings[key] ? 'selected' : ''}" data-setting-key="${key}" data-setting-value="${!profile.settings[key]}" aria-label="${settingsLabels[key]}" aria-pressed="${profile.settings[key]}">${key === 'syllables' ? '<span class="syllable-0">ba</span><span class="syllable-1">teau</span>' : '<span class="ruler-sample">abc</span>'}<span aria-hidden="true">${profile.settings[key] ? '✓' : '○'}</span></button>`).join('')}</div><div class="settings-preview reading" id="settings-preview">À mon rythme.</div><button class="next-picture settings-done" data-close-settings aria-label="Valider et reprendre le jeu">✓</button><details class="adult-settings"><summary>Pour les adultes</summary><p>Les réglages sont sauvegardés uniquement sur cet appareil. La voix dépend du navigateur. Une navigation autonome sans lecture nécessite une voix française disponible et le son activé.</p><button class="secondary" id="privacy-button">Gérer les données locales</button></details>`;
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
  dialog.querySelector('#settings-voice').onclick = settingsGuidance;
  preview(); dialog.showModal(); settingsGuidance();
}
function privacy() { confirmAction('Tes données restent ici', 'Ce prototype enregistre uniquement ton compagnon, ton parcours, tes réglages et ta progression dans ce navigateur. Il n’envoie pas ces données à un serveur et ne propose pas encore de code de récupération. Effacer les données du navigateur efface aussi ta progression. Tu peux tout supprimer ici.', 'Effacer ma progression', () => { stopAudio(); profile = freshProfile(); save(); screen = 'home'; render(true); announce('Ta progression a été effacée sur cet appareil.'); }); }
const actions = {
  home() { stopAudio(); clearTimeout(calibrationTimer); screen = 'home'; feedback = null; render(true); navigationGuidance(); },
  onboard() { step = 0; screen = 'onboarding'; render(true); navigationGuidance(); },
  'change-hero'() { actions.onboard(); },
  hero(button) { profile.hero = button.dataset.hero; save(); render(); document.querySelector(`[data-hero="${profile.hero}"]`)?.focus(); speak('Voici ' + hero().name + ', ' + hero().title.toLowerCase() + '. Pour continuer, touche la grande flèche.'); },
  'setup-next'() { if (profile.onboarded) return actions.home(); step = 1; render(true); navigationGuidance(); },


  'finish-setup'() { profile.onboarded = true; save(); startMission(); },
  difficulty() { clearTimeout(calibrationTimer); calibrationState = null; screen = 'difficulty'; feedback = null; render(true); navigationGuidance(); },
  easier() { adjustDifficulty(-1); },
  harder() { adjustDifficulty(1); },
  'difficulty-voice'() { profile.audio = true; save(); navigationGuidance(); },
  'start-selected'() { stopAudio(); clearTimeout(calibrationTimer); calibrationState = null; profile.session = null; profile.onboarded = true; save(); startMission(); },
  'next-foundation'() { if (suggestedStage === null) return; profile.level = 0; profile.beginnerStage = suggestedStage; save(); startMission(); },
  start: startMission,
  resume() { screen = 'mission'; feedback = null; render(true); readQuestion(); },
  audio() { profile.audio = !profile.audio; stopAudio(); save(); render(); announce(profile.audio ? 'Audio activé' : 'Audio coupé'); if (profile.audio) navigationGuidance(); },
  guide() { profile.audio = true; save(); render(); navigationGuidance(); },
  settings,
  privacy,
  repeat() { const q = currentQuestion(); speak(feedback?.correct ? 'Tu as trouvé ! Touche la grande flèche pour continuer.' : q.instruction + (q.listen ? ' ' + q.listen : '') + (feedback ? ' ' + q.hint : '')); },
  'listen-word'() { speak(currentQuestion().listen); },
  'option-audio'(button) { speak(currentQuestion().options[Number(button.dataset.option)]); },
  answer(button) { answer(Number(button.dataset.answer)); },
  help() { profile.session.attempts = Math.max(2, profile.session.attempts); feedback = { correct: false }; save(); render(); speak(currentQuestion().hint); },
  'feedback-audio'() { speak(feedback.correct ? 'Bravo ! Touche la grande flèche pour continuer.' : 'Tu as essayé, cherchons ensemble. ' + currentQuestion().hint); },
  next() { if (!feedback?.correct) return; stopAudio(); profile.session.index++; profile.session.attempts = 0; profile.session.rejected = []; feedback = null; save(); render(true); readQuestion(); },
  quit() {
    stopAudio();
    clearTimeout(calibrationTimer);
    calibrationState = null;
    profile.session = null;
    save();
    actions.home();
  },
  alternative() { if (screen === 'calibrate') return calibrationAnswer(null); const s = profile.session; const alternative = questionsFor(s.level, s.beginnerStage).find(q => !q.listen && !q.optionAudio && q.id !== currentQuestion().id) || questionsFor(0, 0)[s.index]; s.overrides[s.index] = alternative.id; s.attempts = 0; s.rejected = []; feedback = null; save(); render(true); readQuestion(); },
  calibrate() { calibrationState = { index: 0, results: [] }; feedback = null; screen = 'calibrate'; render(true); readQuestion(); calibrationTimer = setTimeout(finishCalibration, 120000); },
  'skip-calibration'() { calibrationAnswer(null); },
  'manual-level'() { actions.difficulty(); },
  'accept-calibration'() { const level = recommendedLevel(calibrationState.results); if (level === null) return actions['manual-level'](); profile.level = level; if (level === 0) profile.beginnerStage = recommendedBeginnerStage(calibrationState.results); profile.onboarded = true; save(); startMission(); },
  'calibration-audio'() { const level = recommendedLevel(calibrationState.results); speak(level === null ? 'Choisis le parcours qui te donne envie.' : level === 0 ? beginnerStages[recommendedBeginnerStage(calibrationState.results)].spoken + ' Touche le triangle pour jouer.' : 'On essaie de petits mots ensemble. Touche le triangle pour jouer.'); },
  'celebration-audio'() { speak('Bravo ! Tu as terminé ta mission. Pour rejouer, touche le triangle. Pour faire une pause, touche la maison.'); }
};
app.addEventListener('click', event => { const button = event.target.closest('[data-action]'); if (!button || button.disabled) return; event.preventDefault(); actions[button.dataset.action]?.(button); });
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
  if (/^[1-4]$/.test(event.key) && !['INPUT', 'SELECT', 'TEXTAREA'].includes(event.target.tagName)) { const button = app.querySelector(`[data-answer="${Number(event.key) - 1}"]`); if (button && !button.disabled) { event.preventDefault(); button.click(); } }
  if (event.code === 'Space' && !event.target.closest('button, a, input, select, textarea')) { event.preventDefault(); actions.repeat(); }
});
// The horizontal guide follows the pointed line without requiring a fine drag gesture.
app.addEventListener('pointermove', event => { const text = event.target.closest('.reading.ruler'); if (text) { const box = text.getBoundingClientRect(); const line = parseFloat(getComputedStyle(text).lineHeight); const y = Math.floor((event.clientY - box.top - 24) / line) * line + 24; text.style.setProperty('--guide-height', line + 'px'); text.style.setProperty('--guide-y', Math.max(24, y) + 'px'); } });
save();
render();
