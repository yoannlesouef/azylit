import test from 'node:test';
import assert from 'node:assert/strict';
import { beginnerBanks } from '../app/foundations.js';
import { freshProfile, STORAGE_KEY } from '../app/state.js';

function fixture(profile) {
  const memory = new Map([[STORAGE_KEY, JSON.stringify(profile)]]), listeners = {}, spoken = [];
  const app = { innerHTML:'', addEventListener(name, handler) { listeners[name] = handler; } };
  globalThis.SpeechSynthesisUtterance = class { constructor(text) { this.text = text; } };
  globalThis.speechSynthesis = { cancel() {}, getVoices:() => [{ lang:'fr-FR' }], speak(utterance) { spoken.push(utterance.text); } };
  globalThis.window = { speechSynthesis, SpeechSynthesisUtterance };
  globalThis.localStorage = { getItem:key => memory.get(key), setItem:(key,value) => memory.set(key,value) };
  globalThis.document = {
    documentElement:{ style:{ setProperty() {} } }, body:{ dataset:{} }, addEventListener() {},
    querySelector(selector) { if (selector === '#app') return app; if (selector === 'dialog[open]') return null; return { focus() {} }; }
  };
  return {
    app, spoken, saved:() => JSON.parse(memory.get(STORAGE_KEY)),
    click(action, card) { listeners.click({ target:{ closest:() => ({ dataset:{ action, card:String(card), answer:String(card), exerciseId:String(card), groupId:String(card) } }) }, preventDefault() {} }); }
  };
}
function profileAt(stage, index = 0) {
  const profile = freshProfile(); profile.onboarded = true; profile.beginnerStage = stage;
  profile.session = { level:0, beginnerStage:stage, index, results:Array(index).fill('independent'), attempts:0, rejected:[], overrides:{} };
  return profile;
}
test('la fusion se joue par cartes, se corrige et reprend après fermeture sans perdre l’aide reçue', async () => {
  const f = fixture(profileAt(2,2));
  await import('../app/app.js?fusion-game');
  f.click('resume');
  assert.match(f.app.innerHTML, /assembly-board/);
  assert.ok(!f.app.innerHTML.includes('data-action="answer"'));
  f.click('answer', 0); assert.equal(f.saved().session.results.length, 2);
  f.click('build-tile', 0); assert.equal(f.saved().session.attempts, 1);
  f.click('help');
  f.click('build-tile', 1);
  assert.deepEqual(f.saved().session.interaction.picked, [1]);
  assert.match(f.app.innerHTML, /data-action="build-undo"/);
  f.click('build-undo'); assert.deepEqual(f.saved().session.interaction.picked, []);
  f.click('build-tile', 1);
  await import('../app/app.js?fusion-game-reloaded');
  f.click('resume');
  assert.match(f.app.innerHTML, /1 carte sur 2 posée/);
  assert.equal(f.saved().session.attempts, 1);
  assert.equal(f.saved().session.helpUsed, true);
  f.click('build-tile', 0);
  assert.equal(f.saved().session.results.at(-1), 'assisted');
  const main = f.app.innerHTML.split('<main')[1];
  assert.equal((main.match(/<button/g) || []).length, 1);
  assert.match(main, /data-action="next"/);
  f.click('next');
  assert.equal(f.saved().session.index, 3);
  assert.equal(f.saved().session.interaction, null);
});

test('une mission d’assemblage de mots se termine avec huit constructions réelles', async () => {
  const f = fixture(profileAt(3));
  await import('../app/app.js?word-build-game');
  f.click('resume');
  for (let index = 0; index < 8; index++) {
    const question = beginnerBanks[3][index];
    assert.match(f.app.innerHTML, /assembly-board/);
    assert.ok(!f.app.innerHTML.includes('data-action="answer"'));
    const used = [];
    for (const part of question.parts) {
      const tile = question.tiles.findIndex((value,index) => value === part && !used.includes(index));
      used.push(tile); f.click('build-tile', tile);
    }
    if (index < 7) {
      assert.equal(f.saved().session.results.length, index + 1);
      f.click('build-tile', used.at(-1));
      assert.equal(f.saved().session.results.length, index + 1);
      f.click('next');
    }
  }
  assert.equal(f.saved().completed, 1);
  assert.equal(f.saved().assisted, 0);
  assert.equal(f.saved().session, null);
  assert.match(f.app.innerHTML, /Mission accomplie/);
  assert.equal(f.saved().exerciseHistory.length,8);
  const completedIds = f.saved().exerciseHistory.map(event => event.exerciseId);
  f.click('start');
  const planned = f.saved().session;
  assert.equal(planned.beginnerStage,3);
  assert.ok(planned.questionIds.every(id => !completedIds.includes(id)));
  await import('../app/app.js?word-plan-reloaded');
  f.click('resume');
  assert.deepEqual(f.saved().session.questionIds,planned.questionIds);
  assert.deepEqual(f.saved().session.variants,planned.variants);
  assert.equal(f.saved().exerciseHistory.length,8);
});


test('un groupe complet peut être rejoué avec son numéro et sans annonce d’activité', async () => {
  const profile = profileAt(0); profile.completed = 2;
  const f = fixture(profile);
  await import('../app/app.js?group-picker-game');
  f.click('resume');
  assert.match(f.app.innerHTML,/Groupe 1/);
  const originalGroup = f.saved().missionGroups[0];
  f.click('groups');
  assert.match(f.app.innerHTML,/Groupes de jeux/);
  assert.ok(!f.app.innerHTML.includes('data-action="select-activity"'));
  f.click('back-groups');
  assert.match(f.app.innerHTML,/Regarde la lettre/);
  assert.equal(f.saved().session.index,0);
  f.click('groups'); f.click('select-group','g-1'); f.click('play-group');
  assert.equal(f.saved().session.mode,'replay');
  assert.deepEqual(f.saved().session.questionIds,originalGroup.questionIds);
  assert.equal(f.saved().session.questionIds.length,8);
  const { missionQuestion } = await import('../app/missions.js');
  for (let index = 0; index < 8; index++) {
    const question = missionQuestion(f.saved().session);
    assert.match(f.app.innerHTML,/Groupe 1/);
    if (question.mechanic === 'pairs') {
      for (let source = 0; source < question.pairs.length; source++) {
        f.click('pair-source',source); f.click('pair-target',question.pairOrder.indexOf(source));
      }
    } else f.click('answer',question.answer);
    if (index < 7) f.click('next');
  }
  assert.equal(f.saved().completed,3);
  assert.equal(f.saved().exerciseHistory.length,8);
  assert.ok(f.saved().beginnerWins.every(value => value === 0));
  assert.equal(f.saved().missionGroups[0].playCount,1);
  assert.ok(f.saved().missionGroups[0].completedAt);
  assert.equal(f.saved().session,null);
  f.click('groups');
  assert.match(f.app.innerHTML,/Groupe 1, huit jeux, déjà terminé/);
  assert.ok(f.spoken.every(text => !/activit/i.test(text)));
});
