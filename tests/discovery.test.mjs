import test from 'node:test';
import assert from 'node:assert/strict';
import { alphabet, extraLetters, discoveryWords, discoverySyllables, syllableFamilies, syllablesInFamily, wordsForSyllable, makeListeningRound } from '../app/discovery-data.js';
import { createDiscoveryState, updateDiscovery, renderDiscovery, discoveryGuidance, syllableInitials } from '../app/discovery.js';
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
  assert.equal(s.page,'syllable-index');
  const seen = new Set();
  for (const initial of syllableInitials) {
    go('syllable-initial',initial);
    const html=renderDiscovery(s);
    assert.ok(!html.includes('syllable-page'));
    const ids=[...html.matchAll(/data-command="syllable" data-value="([^"]+)"/g)].map(m=>m[1]);
    assert.ok(ids.length>0 && ids.length<=12);ids.forEach(id=>seen.add(id));
  }
  assert.equal(seen.size,discoverySyllables.length);
  go('syllable-initial','m');
  assert.equal(go('syllable','ma').speech,'ma');
  assert.match(renderDiscovery(s),/<mark>ma<\/mark>/);
  assert.equal(go('word','w-maman').speech,'maman');
  assert.equal(go('word','w-robot').speech,undefined);
  assert.equal(go('back').focusCommand,'selected-syllable');assert.equal(s.page,'syllables');assert.equal(s.syllableId,'ma');assert.equal(s.syllableInitial,'m');
  go('back');assert.equal(s.page,'syllable-index');go('back');assert.equal(s.page,'hub');assert.equal(go('back').exit,true);
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

test('l’alphabet est directement accessible sans flèches ; les mots restent par six',()=>{
 let s=updateDiscovery(createDiscoveryState(),'letters').state;
 const html=renderDiscovery(s);
 assert.equal((html.match(/data-command="letter"/g)||[]).length,26);
 assert.ok(!html.includes('letter-page'));
 s=updateDiscovery(s,'alphabet-set','extra').state;
 assert.equal((renderDiscovery(s).match(/data-command="letter"/g)||[]).length,18);
 s=updateDiscovery(s,'syllable','ma').state;
 assert.equal((renderDiscovery(s).match(/data-command="word"/g)||[]).length,6);
 s=updateDiscovery(s,'quiz').state;s=updateDiscovery(s,'back').state;
 assert.equal(s.page,'words');
});

test('chaque syllabe proposée possède au moins six vrais mots distincts et un segment explicite',()=>{
  assert.ok(discoverySyllables.length >= 100);
  for (const syllable of discoverySyllables) {
    const words=wordsForSyllable(syllable.id);
    assert.ok(words.length >= 6,syllable.id);
    assert.equal(new Set(words.map(word=>word.text)).size,words.length,syllable.id);
    assert.deepEqual(syllable.words,words.map(word=>word.id));
    for (const word of words) {
      assert.equal(word.parts.map(part=>part.text).join(''),word.text);
      assert.equal(word.parts.filter(part=>part.syllable===syllable.id).length,1);
      assert.ok(!/[\[\]~]/.test(word.text));
    }
    const state={...createDiscoveryState(),page:'words',syllableId:syllable.id};
    assert.equal((renderDiscovery(state).match(/data-command="word"/g)||[]).length,6);
  }
  assert.ok(wordsForSyllable('ma').some(word=>word.text==='maçon'));
  assert.ok(!wordsForSyllable('cho').some(word=>word.text==='chorale'));
  assert.ok(!wordsForSyllable('pou').some(word=>word.text==='poule'));
  assert.ok(wordsForSyllable('noi').find(word=>word.text==='noyau').parts.some(part=>part.text==='noy' && part.syllable==='noi'));
});


test('les cartes d’une seule lettre restent dans l’alphabet, pas dans les syllabes',()=>{
  for (const syllable of discoverySyllables) assert.ok(Array.from(syllable.text).length>=2,syllable.text);
  for (const letter of ['a','i','é','o','u']) {
    assert.ok(!discoverySyllables.some(syllable=>syllable.id===letter));
    assert.deepEqual(wordsForSyllable(letter),[]);
    assert.ok([...alphabet,...extraLetters].some(item=>item.id===letter));
  }
  assert.ok(discoverySyllables.some(syllable=>syllable.id==='ma'));
  assert.ok(discoverySyllables.some(syllable=>syllable.id==='ou'));
});

test('les sons courants ajoutés ont six mots et on se trouve directement par l’index des sons',()=>{
 const expected=['on','in','au','oi','chi','gui','gé','ju','le','me','pe','re','se','te','ve','ge','son'];
 for(const id of expected) assert.ok(wordsForSyllable(id).length>=6,id);
 let s=updateDiscovery(createDiscoveryState(),'families').state;
 s=updateDiscovery(s,'syllable-initial','*').state;
 assert.match(renderDiscovery(s),/data-command="syllable" data-value="on"/);
 const result=updateDiscovery(s,'syllable','on');assert.equal(result.speech,'on');
 assert.equal((renderDiscovery(result.state).match(/data-command="word"/g)||[]).length,6);
});
