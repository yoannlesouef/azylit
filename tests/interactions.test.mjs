import test from 'node:test';
import assert from 'node:assert/strict';
import { beginnerBanks } from '../app/foundations.js';
import { applyInteraction, interactionFor, completedText } from '../app/interactions.js';
import { parseProfile } from '../app/state.js';
const pairs = beginnerBanks[0].find(q => q.mechanic === 'pairs');
const fusion = beginnerBanks[2].find(q => q.mechanic === 'build');
const word = beginnerBanks[3][0];

test('une association attend un choix à gauche et garde les bonnes paires après une erreur', () => {
  let result = applyInteraction(pairs, null, 'target', 0);
  assert.equal(result.event, 'idle');
  result = applyInteraction(pairs, result.state, 'source', 0);
  assert.equal(result.event, 'selected');
  result = applyInteraction(pairs, result.state, 'target', 0);
  assert.equal(result.event, 'incorrect');
  assert.deepEqual(result.state.matched, []);
  result = applyInteraction(pairs, result.state, 'target', 1);
  assert.equal(result.event, 'progress');
  assert.deepEqual(result.state.matched, [0]);
  result = applyInteraction(pairs, result.state, 'source', 1);
  result = applyInteraction(pairs, result.state, 'target', 0);
  assert.equal(result.event, 'complete');
  assert.equal(applyInteraction(pairs, result.state, 'target', 0).event, 'idle');
});

test('la fusion conserve le début correct et permet de retirer une carte', () => {
  let result = applyInteraction(fusion, null, 'tile', 0);
  assert.equal(result.event, 'incorrect');
  assert.deepEqual(result.state.picked, []);
  result = applyInteraction(fusion, result.state, 'tile', 1);
  assert.equal(result.event, 'progress');
  assert.deepEqual(result.state.picked, [1]);
  result = applyInteraction(fusion, result.state, 'undo');
  assert.equal(result.event, 'undo');
  assert.deepEqual(result.state.picked, []);
  result = applyInteraction(fusion, result.state, 'tile', 1);
  assert.equal(applyInteraction(fusion, result.state, 'tile', 1).event, 'idle');
  result = applyInteraction(fusion, result.state, 'tile', 0);
  assert.equal(result.event, 'complete');
  assert.equal(completedText(fusion), 'la');
});

test('deux syllabes identiques nécessitent deux cartes distinctes', () => {
  let result = applyInteraction(word, null, 'tile', 0);
  assert.equal(result.event, 'progress');
  assert.equal(applyInteraction(word, result.state, 'tile', 0).event, 'idle');
  result = applyInteraction(word, result.state, 'tile', 1);
  assert.equal(result.event, 'complete');
  assert.equal(completedText(word), 'papa');
});

test('les cartes posées et le recours à une aide survivent à une reprise', () => {
  const partial = applyInteraction(fusion, null, 'tile', 1).state;
  const profile = parseProfile(JSON.stringify({ session: { level:0, beginnerStage:2, index:2, results:['independent','independent'], attempts:2, rejected:[], interaction:partial } }));
  assert.equal(profile.session.attempts, 2);
  assert.deepEqual(interactionFor(fusion, profile.session.interaction).picked, [1]);
  assert.deepEqual(interactionFor(word, profile.session.interaction).picked, []);
  const corrupt = { questionId:fusion.id, picked:[0,999,1] };
  assert.deepEqual(interactionFor(fusion, corrupt).picked, []);
});

test('les nouvelles interactions ne nécessitent aucun glisser-déposer', () => {
  assert.equal(beginnerBanks[0].filter(q => q.mechanic === 'pairs').length, 4);
  assert.equal(beginnerBanks[2].filter(q => q.mechanic === 'build').length, 8);
  assert.equal(beginnerBanks[3].filter(q => q.mechanic === 'build').length, 16);
  for (const question of beginnerBanks[2].concat(beginnerBanks[3]).filter(q => q.mechanic === 'build')) {
    let state;
    for (const part of question.parts) {
      const index = question.tiles.findIndex((value,index) => value === part && !state?.picked.includes(index));
      const result = applyInteraction(question, state, 'tile', index);
      state = result.state;
    }
    assert.equal(state.picked.length, question.parts.length);
  }
});
