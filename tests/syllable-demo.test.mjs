import test from 'node:test';
import assert from 'node:assert/strict';
import {createSyllableDemo,answerSyllableDemo,renderSyllableDemo} from '../app/syllable-demo.js';
import {beginnerBanks} from '../app/foundations.js';
test('la démonstration utilise un autre exemple pour chaque exercice de choix',()=>{
 for(const question of beginnerBanks[2].filter(q=>!q.mechanic)){
  const before=structuredClone(question);const demo=createSyllableDemo(question);
  assert.equal(demo.options.length,2);
  assert.ok(demo.options.every(value=>!question.options.includes(value) && value!==question.listen));
  const wrong=demo.options.find(value=>value!==demo.target);
  const retry=answerSyllableDemo(demo,wrong);assert.equal(retry.correct,false);assert.deepEqual(retry.rejected,[wrong]);
  const done=answerSyllableDemo(retry,demo.target);assert.equal(done.correct,true);
  assert.match(renderSyllableDemo(done),/demo-done/);assert.ok(!renderSyllableDemo(done).includes('data-demo-answer'));
  assert.deepEqual(question,before);assert.equal(demo.correct,false);
 }
});
