import { missionQuestion } from '../app/missions.js';
import { beginnerBanks } from '../app/foundations.js';
import { preferredFrenchVoice, frenchUtterance } from '../app/speech.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import { banks, heroes, calibration } from '../app/data.js';
import { companionArt } from '../app/companions.js';
import { parseProfile, recommendedLevel, recommendedBeginnerStage, recordBeginnerMission, freshProfile, difficultyPosition, setDifficultyPosition, STORAGE_KEY } from '../app/state.js';

test('un profil corrompu ou inattendu revient à des valeurs sûres', () => {
  assert.equal(parseProfile('{broken').hero, 'unicorn');
  const profile = parseProfile(JSON.stringify({ hero: '<script>', level: 90, completed: -5, settings: { size: 1000, font: 'injected' }, session: { index: 0 } }));
  assert.equal(profile.hero, 'unicorn');
  assert.equal(profile.level, 0);
  assert.equal(profile.completed, 0);
  assert.equal(profile.settings.size, 28);
  assert.equal(profile.session, null);
});
test('une réponse déjà validée est reprise à la question suivante', () => {
  const profile = parseProfile(JSON.stringify({ session: { level: 1, index: 0, results: ['assisted'], overrides: { 1: 'n2-3', 99: 'invalid' } } }));
  assert.equal(profile.session.index, 1);
  assert.deepEqual(profile.session.overrides, { 1: 'n2-3' });
});
test('le positionnement ignoré ne produit pas de niveau automatique', () => {
  assert.equal(recommendedLevel([]), null);
  assert.equal(recommendedLevel([null, null, null, null, null]), null);
  assert.equal(recommendedLevel([true, true, false, false, false]), 0);
  assert.equal(recommendedLevel([true, true, true, false, false]), 0);
  assert.equal(recommendedLevel([true, true, true, true, true]), 1);
});
test('chaque mission possède huit questions cohérentes et une alternative sans audio', () => {
  assert.equal(heroes.length, 6);
  assert.equal(calibration.length, 5);
  const ids = new Set();
  for (const bank of banks) {
    assert.ok(bank.length >= 16);
    assert.ok(bank.some(q => !q.listen && !q.optionAudio));
    for (const question of bank) {
      assert.ok(!ids.has(question.id)); ids.add(question.id);
      assert.ok(question.answer >= 0 && question.answer < question.options.length);
      assert.ok(question.instruction && question.hint);
      if (question.syllables) assert.equal(question.syllables.join(''), question.text);
      if (question.listen || question.optionAudio) assert.equal(question.visualAids, false);
    }
  }
});
test('une mission complète sauvegarde les réussites accompagnées et attribue une seule mission', async () => {
  const listeners = {}, memory = new Map();
  const app = { innerHTML: '', addEventListener(name, fn) { listeners[name] = fn; } };
  const focusable = { focus() {} };
  globalThis.window = {};
  globalThis.localStorage = { getItem: key => memory.get(key), setItem: (key, value) => memory.set(key, value) };
  globalThis.document = {
    documentElement: { style: { setProperty() {} } }, body: { dataset: {} },
    querySelector(selector) { if (selector === '#app') return app; if (selector === 'dialog[open]') return null; return focusable; },
    addEventListener() {}
  };
  await import('../app/app.js');
  const click = (action, data = {}) => listeners.click({ target: { closest: () => ({ dataset: { action, ...data } }) }, preventDefault() {} });
  assert.match(app.innerHTML, /À toi de jouer/);
  assert.match(app.innerHTML, /class="play-button" data-action="start"/);
  click('start');
  assert.match(app.innerHTML, /exercise-progress/);
  assert.equal(JSON.parse(memory.get(STORAGE_KEY)).onboarded, true);
  assert.match(app.innerHTML, /exercise-companion-guide/);
  assert.match(app.innerHTML, /companion-neutral/);
  assert.ok(!app.innerHTML.includes('class="stimulus-audio'));
  assert.ok(!app.innerHTML.includes('La voix n’est pas disponible'));
  click('alternative');
  const firstSaved = JSON.parse(memory.get(STORAGE_KEY));
  const firstQuestion = banks.flat().find(q => q.id === firstSaved.session.overrides[0]);
  click('answer', { answer: String(1 - firstQuestion.answer) });
  assert.match(app.innerHTML, /visual-feedback--retry/);
  assert.match(app.innerHTML, /companion-support/);
  assert.ok(!app.innerHTML.includes(firstQuestion.hint));
  click('help');
  assert.match(app.innerHTML, /visual-feedback--retry/);
  assert.match(app.innerHTML, /feedback-model/);
  assert.ok(!app.innerHTML.includes('On essaie ensemble'));
  assert.ok(!app.innerHTML.includes('Regarde la forme de la lettre en grand. Cherche exactement la même forme.'));
  let profile = JSON.parse(memory.get(STORAGE_KEY));
  assert.equal(profile.session.attempts, 1);
  assert.equal(profile.session.helpUsed, true);
  const alternate = banks.flat().find(q => q.id === profile.session.overrides[0]);
  click('answer', { answer: String(alternate.answer) });
  profile = JSON.parse(memory.get(STORAGE_KEY));
  assert.deepEqual(profile.session.results, ['assisted']);
  assert.match(app.innerHTML, /visual-feedback--success/);
  assert.match(app.innerHTML, /companion-cheer/);
  assert.match(app.innerHTML, /data-action="next"/);
  const completed = app.innerHTML.split('<main')[1];
  assert.equal((completed.match(/<button/g) || []).length, 1);
  assert.ok(!completed.includes('data-action="answer"'));
  assert.ok(!completed.includes('data-action="repeat"'));
  assert.ok(!completed.includes('data-action="help"'));
  assert.ok(!app.innerHTML.includes('>Bravo !<'));
  // Une double activation ne doit jamais créditer deux réponses.
  click('answer', { answer: String(alternate.answer) });
  assert.equal(JSON.parse(memory.get(STORAGE_KEY)).session.results.length, 1);
  click('next');
  for (let index = 1; index < 8; index++) {
    let question = missionQuestion(JSON.parse(memory.get(STORAGE_KEY)).session);
    if (question.listen || question.optionAudio) {
      click('alternative');
      profile = JSON.parse(memory.get(STORAGE_KEY));
      question = missionQuestion(profile.session);
    }
    if (question.mechanic === 'pairs') {
      for (let pair = 0; pair < question.pairs.length; pair++) {
        click('pair-source', { card: String(pair) });
        click('pair-target', { card: String(question.pairOrder.indexOf(pair)) });
      }
    } else click('answer', { answer: String(question.answer) });
    if (index < 7) click('next');
  }
  profile = JSON.parse(memory.get(STORAGE_KEY));
  assert.equal(profile.completed, 1);
  assert.equal(profile.assisted, 1);
  assert.equal(profile.session, null);
  assert.match(app.innerHTML, /Mission accomplie/);
  assert.match(app.innerHTML, /demander de l’aide/);
  assert.match(app.innerHTML, /mission-medal/);
  assert.ok(!app.innerHTML.includes('>Bravo !<'));
});


test('les anciens compagnons migrent sans effacer la progression', () => {
  for (const [before, after] of Object.entries({ nova: 'unicorn', atlas: 'knight', lyra: 'princess', zephyr: 'pirate' })) {
    const profile = parseProfile(JSON.stringify({ hero: before, level: 2, completed: 4, onboarded: true }));
    assert.equal(profile.hero, after);
    assert.equal(profile.completed, 4);
    assert.equal(profile.level, 2);
    assert.equal(profile.onboarded, true);
  }
});

test('les six compagnons ont des silhouettes et des libellés distincts', () => {
  assert.deepEqual(heroes.map(h => h.id), ['unicorn', 'knight', 'princess', 'pirate', 'mermaid', 'dragon']);
  const pictures = heroes.map(h => companionArt(h));
  assert.equal(new Set(pictures.map(svg=>svg.match(/<g class="companion-character">([^]*?)<\/g>/)[1])).size, 6);
  for (const [index, svg] of pictures.entries()) {
    assert.ok(svg.includes(heroes[index].title.toLowerCase()));
    assert.ok(!svg.includes('super-héros'));
  }
});

test('la navigation illustrée guide sans lecture et la maison arrête le jeu immédiatement', async () => {
  const spoken = [], utterances = [], listeners = {}, memory = new Map(), dialogControls = new Map();
  let dialogOpen = false;
  const app = { innerHTML: '', addEventListener(name, fn) { listeners[name] = fn; } };
  const focusable = { focus() {} };
  const dialog = {
    innerHTML: '',
    querySelector(selector) { if (!dialogControls.has(selector)) dialogControls.set(selector, {}); return dialogControls.get(selector); },
    showModal() { dialogOpen = true; }, close() { dialogOpen = false; }
  };
  globalThis.SpeechSynthesisUtterance = class { constructor(text) { this.text = text; } };
  globalThis.speechSynthesis = { cancel() {}, getVoices: () => [{ lang: 'en-US', default: true }, { lang: 'fr-CA' }, { lang: 'fr-FR' }], speak: utterance => { spoken.push(utterance.text); utterances.push(utterance); } };
  globalThis.window = { speechSynthesis, SpeechSynthesisUtterance };
  globalThis.localStorage = { getItem: key => memory.get(key), setItem: (key, value) => memory.set(key, value) };
  globalThis.document = {
    documentElement: { style: { setProperty() {} } }, body: { dataset: {} },
    querySelector(selector) {
      if (selector === '#app') return app;
      if (selector === '#confirm') return dialog;
      if (selector === 'dialog[open]') return dialogOpen ? dialog : null;
      return focusable;
    },
    addEventListener() {}
  };
  await import('../app/app.js?voice-navigation');
  const click = (action, data = {}) => listeners.click({ target: { closest: () => ({ dataset: { action, ...data } }) }, preventDefault() {} });
  assert.equal((app.innerHTML.match(/play-button/g) || []).length, 2);
  assert.match(app.innerHTML, /data-action="discover"[^>]*aria-label="Apprendre[^>]*>[^]*<span>Apprendre<\/span>/);
  assert.ok(!app.innerHTML.includes('LE MONDE DES POSSIBLES'));
  assert.doesNotMatch(app.innerHTML, /home-adjustments|data-action="difficulty"/);
  assert.match(app.innerHTML, /class="launch-companion" data-action="change-hero"/);
  assert.match(app.innerHTML, /class="parents-top-link"/);
  assert.match(app.innerHTML, /class="teachers-top-link"/);
  assert.match(app.innerHTML, /adult-header-links/);
  assert.match(app.innerHTML, /Parents<\/a>.*Enseignants<\/a>.*AESH<\/a>.*ULIS<\/a>/);
  click('guide'); assert.match(spoken.at(-1), /Jouer.*Apprendre/);
  assert.equal(utterances.at(-1).lang, 'fr-FR');
  assert.equal(utterances.at(-1).voice.lang, 'fr-FR');
  click('onboard'); assert.match(spoken.at(-1), /Choisis ton compagnon/);
  assert.ok(!app.innerHTML.includes('adult-header-links'));
  assert.ok(!app.innerHTML.includes('href="/enseignants/"'));
  assert.equal((app.innerHTML.match(/class="companion-choice/g) || []).length, 6);
  click('hero', { hero: 'pirate' }); assert.match(spoken.at(-1), /Malo, le pirate/);
  click('confirm-settings'); assert.match(app.innerHTML, /À toi de jouer/);
  assert.equal(JSON.parse(memory.get(STORAGE_KEY)).session,null);
  click('difficulty'); assert.match(spoken.at(-1), /Choisis ton niveau/);
  assert.match(app.innerHTML, /difficulty-picker/);
  assert.match(app.innerHTML, /<h1>Choisis ton niveau<\/h1>/);
  assert.match(app.innerHTML, /data-action="back-complexity"/);
  click('back-complexity');
  assert.match(app.innerHTML, /À toi de jouer/);
  click('difficulty');
  click('harder'); assert.match(spoken.at(-1), /écoute un son/);
  click('easier'); assert.match(spoken.at(-1), /une seule lettre/);
  click('confirm-settings'); assert.match(app.innerHTML,/À toi de jouer/);
  assert.equal(JSON.parse(memory.get(STORAGE_KEY)).session,null);
  click('start'); assert.equal(spoken.at(-1), (await import('../app/exercise-speech.js')).exerciseSpeech((await import('../app/missions.js')).missionQuestion(JSON.parse(memory.get(STORAGE_KEY)).session),JSON.parse(memory.get(STORAGE_KEY)).session.interaction));
  assert.ok(!app.innerHTML.includes('class="parents-top-link"'));
  assert.ok(!app.innerHTML.includes('class="teachers-top-link"'));
  click('quit');
  assert.equal(dialogOpen, false);
  assert.match(app.innerHTML, /À toi de jouer/);
  assert.equal(JSON.parse(memory.get(STORAGE_KEY)).session, null);
  assert.equal(JSON.parse(memory.get(STORAGE_KEY)).completed, 0);
  assert.ok(!app.innerHTML.includes('data-action="resume"'));
  click('start'); assert.equal(spoken.at(-1), (await import('../app/exercise-speech.js')).exerciseSpeech((await import('../app/missions.js')).missionQuestion(JSON.parse(memory.get(STORAGE_KEY)).session),JSON.parse(memory.get(STORAGE_KEY)).session.interaction));
  assert.equal(JSON.parse(memory.get(STORAGE_KEY)).session.index, 0);
  click('audio'); assert.equal(JSON.parse(memory.get(STORAGE_KEY)).audio, false);
  assert.match(app.innerHTML,/Activer le son/);
  assert.match(app.innerHTML,/M16 9l5 6/);
  click('guide'); assert.equal(JSON.parse(memory.get(STORAGE_KEY)).audio, true);
  assert.equal(spoken.at(-1), (await import('../app/exercise-speech.js')).exerciseSpeech((await import('../app/missions.js')).missionQuestion(JSON.parse(memory.get(STORAGE_KEY)).session),JSON.parse(memory.get(STORAGE_KEY)).session.interaction));
  // Changer de compagnon revient au jeu et conserve la mission en cours.
  click('change-hero'); click('hero', { hero: 'knight' }); click('confirm-settings');
  assert.match(app.innerHTML, /À toi de jouer/);
  const saved = JSON.parse(memory.get(STORAGE_KEY));
  assert.equal(saved.hero, 'knight');
  assert.ok(saved.session);
  click('difficulty');
  assert.match(app.innerHTML, /difficulty-picker/);
  const selector = app.innerHTML.split('<main')[1];
  assert.ok(!selector.includes('<select'));
  assert.ok(!selector.includes('data-action="setup-level"'));
  for (let position = 1; position <= 6; position++) click('harder');
  assert.equal(JSON.parse(memory.get(STORAGE_KEY)).level, 3);
  click('confirm-settings');
  assert.match(app.innerHTML,/À toi de jouer/);
  click('start');
  assert.equal(JSON.parse(memory.get(STORAGE_KEY)).session.level, 3);
  assert.equal(JSON.parse(memory.get(STORAGE_KEY)).session.index, 0);
  assert.match(app.innerHTML, /Lina/);
  click('difficulty');
  assert.match(app.innerHTML, /7 · Histoires/);
  click('back-complexity');
  assert.match(app.innerHTML, /Lina/);
  assert.equal(JSON.parse(memory.get(STORAGE_KEY)).session.index, 0);
  click('difficulty');
  assert.match(app.innerHTML,/Valider mon niveau et jouer/);
  click('confirm-settings');
  assert.match(app.innerHTML,/Lina/);
  assert.equal(JSON.parse(memory.get(STORAGE_KEY)).session.index,0);
  click('difficulty');
  for (let position = 5; position >= 0; position--) click('easier');
  click('confirm-settings');
  const easierSession = JSON.parse(memory.get(STORAGE_KEY)).session;
  assert.equal(easierSession.level, 0);
  assert.equal(easierSession.beginnerStage, 0);
  assert.match(app.innerHTML, /exercise-progress/);
});


test('les premiers exercices ne demandent ni mot entier ni connaissance du nom des lettres', () => {
  for (const question of beginnerBanks[0]) {
    assert.equal(question.type, 'letter_match');
    assert.equal(question.options.length, 2);
    if (question.mechanic === 'pairs') assert.ok(question.pairs.every(letter => letter.length === 1));
    else { assert.equal(question.text.length, 1); assert.equal(question.options[question.answer], question.text); }
    assert.ok(!question.listen);
  }
  for (const [stage,bank] of beginnerBanks.entries()) {
    assert.equal(bank.length, [36,48,48,68][stage]);
    for (const question of bank) {
      assert.ok(question.options.length >= 2 && question.options.length <= 3);
      assert.equal(question.visualAids, false);
      assert.ok(question.options[question.answer]);
    }
  }
});

test('les fondations se reprennent au même palier et deux missions solides précèdent une proposition', () => {
  const profile = freshProfile();
  recordBeginnerMission(profile, { level: 0, beginnerStage: 0, results: Array(8).fill('independent') });
  assert.equal(profile.beginnerWins[0], 1);
  assert.equal(profile.beginnerStage, 0);
  recordBeginnerMission(profile, { level: 0, beginnerStage: 0, results: Array(8).fill('independent') });
  assert.equal(profile.beginnerWins[0], 2);
  assert.equal(profile.beginnerStage, 0);
  recordBeginnerMission(profile, { level: 0, beginnerStage: 0, results: Array(8).fill('assisted') });
  assert.equal(profile.beginnerWins[0], 0);
  const resumed = parseProfile(JSON.stringify({ ...profile, beginnerStage: 2, session: { level: 0, beginnerStage: 2, index: 1, results: ['independent'], overrides: {} } }));
  assert.equal(resumed.session.beginnerStage, 2);
  assert.equal(resumed.session.index, 1);
  assert.equal(recommendedBeginnerStage([false]), 0);
  assert.equal(recommendedBeginnerStage([true,false]), 1);
  assert.equal(recommendedBeginnerStage([true,true,false]), 2);
  assert.equal(recommendedBeginnerStage([true,true,true,false]), 3);
});

test('la voix naturelle française est prioritaire et conserve son intonation', () => {
  const compact = { name: 'French Compact', lang: 'fr-FR' };
  const natural = { name: 'Microsoft Denise Online (Natural)', lang: 'fr-FR' };
  const english = { name: 'English Natural', lang: 'en-US', default: true };
  assert.equal(preferredFrenchVoice([english, compact, natural]), natural);
  assert.equal(preferredFrenchVoice([english]), undefined);
  const utterance = frenchUtterance('Bravo, tu as trouvé !', class { constructor(text) { this.text = text; } }, [compact, natural]);
  assert.equal(utterance.voice, natural);
  assert.equal(utterance.lang, 'fr-FR');
  assert.equal(utterance.rate, 0.8);
  assert.equal(utterance.pitch, 1);
});


test('les boutons moins et plus parcourent les fondations et les niveaux sans sauter une étape', () => {
  const profile = freshProfile();
  const expected = [[0,0],[0,1],[0,2],[0,3],[1,3],[2,3],[3,3]];
  for (let position = 0; position < 7; position++) {
    setDifficultyPosition(profile, position);
    assert.equal(difficultyPosition(profile), position);
    assert.deepEqual([profile.level, profile.beginnerStage], expected[position]);
  }
  setDifficultyPosition(profile, 999); assert.equal(difficultyPosition(profile), 6);
  for (let position = 6; position >= 0; position--) {
    setDifficultyPosition(profile, position);
    assert.equal(difficultyPosition(profile), position);
  }
  setDifficultyPosition(profile, -10); assert.equal(difficultyPosition(profile), 0);
});

test('chaque compagnon est conservé sans modifier le profil de lecture',()=>{
 for(const hero of heroes){
  const initial=freshProfile();initial.hero=hero.id;initial.completed=3;initial.settings.size=34;initial.beginnerStage=2;
  const restored=parseProfile(JSON.stringify(initial));
  assert.equal(restored.hero,hero.id);assert.equal(restored.completed,3);assert.equal(restored.settings.size,34);assert.equal(restored.beginnerStage,2);
  for(const mood of ['neutral','guide','support','cheer'])assert.match(companionArt(hero,false,mood),new RegExp('companion-'+mood));
  assert.notEqual(companionArt(hero,false,'neutral'),companionArt(hero,false,'cheer'));
 }
});
