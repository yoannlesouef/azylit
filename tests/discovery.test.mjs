import test from 'node:test';
import assert from 'node:assert/strict';
import { alphabet, extraLetters, discoveryWords, discoverySyllables, syllableFamilies, syllablesInFamily, wordsForSyllable, makeListeningRound } from '../app/discovery-data.js';
import { createDiscoveryState, updateDiscovery, renderDiscovery, discoveryGuidance } from '../app/discovery.js';
const audio = {canSpeak:true,canHear:true};
test('alphabet complet et associations de syllabes explicites dans les mots', () => {
  assert.equal(alphabet.map(x=>x.id).join(''),'abcdefghijklmnopqrstuvwxyz');
  assert.equal(extraLetters.length,18);
  assert.equal(alphabet.find(x=>x.id==='b').speech,'bé');
  assert.equal(new Set(discoveryWords.map(x=>x.id)).size,discoveryWords.length);
  for (const word of discoveryWords) assert.equal(word.parts.map(x=>x.text).join(''),word.text);
  for (const syllable of discoverySyllables) assert.ok(wordsForSyllable(syllable.id).length);
  for (const family of syllableFamilies) assert.ok(syllablesInFamily(family.id).length);
  assert.ok(wordsForSyllable('ma').some(x=>x.text==='maman'));
  assert.ok(!wordsForSyllable('an').some(x=>x.text==='banane'));
});
test('exploration sonore, mots associés et retour conservant la page', () => {
  let s=createDiscoveryState();
  const go=(command,value)=>{const r=updateDiscovery(s,command,value,Math.random,audio);s=r.state;return r;};
  go('letters'); assert.equal(go('letter','b').speech,'bé');
  go('families');
  assert.equal(s.page,'syllables');
  const list=renderDiscovery(s);
  assert.equal((list.match(/data-command="syllable"/g)||[]).length,6);
  assert.ok(!list.includes('Pour aller plus loin'));
  const seen = new Set();
  for (let level=0;level<3;level++) {
    go('syllable-levels');go('syllable-level',String(level));
    go('syllable-page','previous');assert.equal(s.syllablePage,0);
    for(let page=0;page<60;page++) {
      const html=renderDiscovery(s);
      const ids=[...html.matchAll(/data-command="syllable" data-value="([^"]+)"/g)].map(m=>m[1]);
      assert.ok(ids.length>0 && ids.length<=6);ids.forEach(id=>seen.add(id));
      const before=s.syllablePage;go('syllable-page','next');if(s.syllablePage===before)break;
    }
  }
  assert.equal(seen.size,discoverySyllables.length);
  go('syllable-level','0');go('syllable-page','next');const savedPage=s.syllablePage;
  assert.equal(go('syllable','ma').speech,'ma');
  assert.match(renderDiscovery(s),/<mark>ma<\/mark>/);
  assert.equal(go('word','w-maman').speech,'maman');
  assert.equal(go('word','w-robot').speech,undefined);
  assert.equal(go('back').focusCommand,'selected-syllable');assert.equal(s.page,'syllables');assert.equal(s.syllableId,'ma');assert.equal(s.syllablePage,savedPage);
  go('back');assert.equal(s.page,'hub');assert.equal(go('back').exit,true);
});
test('jeu audio : écoute requise, réessai, réussite et nouveau mot', () => {
  let s=updateDiscovery(createDiscoveryState(),'quiz',null,()=>0,{}).state;
  assert.equal(s.quiz.heard,false);assert.match(renderDiscovery(s),/disabled/);
  assert.equal(updateDiscovery(s,'quiz-answer',s.quiz.target).state.quiz.correct,false);
  assert.equal(updateDiscovery(s,'quiz-listen',null,Math.random,{canSpeak:false}).state.quiz.heard,false);
  s=updateDiscovery(s,'quiz-listen',null,Math.random,audio).state;
  const wrong=s.quiz.options.find(id=>id!==s.quiz.target);
  s=updateDiscovery(s,'quiz-answer',wrong,Math.random,audio).state;
  assert.deepEqual(s.quiz.rejected,[wrong]);assert.equal(s.quiz.correct,false);
  assert.ok(!renderDiscovery(s).includes('quiz-found-word'));
  s=updateDiscovery(s,'quiz-answer',s.quiz.target,Math.random,audio).state;
  assert.equal(s.quiz.correct,true);assert.match(renderDiscovery(s),/quiz-next/);
  const previous=s.quiz.target;s=updateDiscovery(s,'quiz-next',null,()=>0,audio).state;
  assert.notEqual(s.quiz.target,previous);assert.equal(s.quiz.correct,false);
  for(let i=0;i<50;i++){const q=makeListeningRound(previous);assert.equal(new Set(q.options).size,3);assert.ok(q.options.includes(q.target));assert.notEqual(q.target,previous);}
  assert.ok(!/activit/i.test(discoveryGuidance(s)));
  assert.match(renderDiscovery(s,false),/voix n’est pas disponible/);
});
