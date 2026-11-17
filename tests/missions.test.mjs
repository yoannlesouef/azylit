import test from 'node:test';
import assert from 'node:assert/strict';
import { freshProfile, parseProfile } from '../app/state.js';
import { questionsFor, questionById } from '../app/data.js';
import { createMission, missionQuestion, recordExercise, HISTORY_LIMIT } from '../app/missions.js';
const randomSource = () => { let seed = 41; return () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646; };
function finish(profile) {
  const session = profile.session;
  for (let index = 0; index < 8; index++) {
    session.index = index; session.attempts = index === 1 ? 1 : 0;
    const result = index === 1 ? 'assisted' : 'independent';
    recordExercise(profile, missionQuestion(session), result, new Date('2026-11-17T10:00:00Z'));
    session.results.push(result);
  }
  profile.completed++;
}

test('deux missions au même niveau utilisent des exercices différents avant de réviser', () => {
  for (const [level,stage] of [[0,0],[0,1],[0,2],[0,3],[1,0],[2,0],[3,0]]) {
    const profile = freshProfile(); profile.level = level; profile.beginnerStage = stage;
    const random = randomSource();
    profile.session = createMission(profile,random);
    const first = [...profile.session.questionIds];
    finish(profile);
    profile.session = createMission(profile,random);
    const second = profile.session.questionIds;
    assert.equal(new Set(second).size, 8);
    assert.ok(second.every(id => !first.includes(id)), `${level}:${stage}`);
    assert.equal(profile.level,level); assert.equal(profile.beginnerStage,stage);
    assert.equal(profile.exerciseHistory.length,8);
    assert.equal(profile.exerciseHistory[1].result,'assisted');
    assert.deepEqual(profile.session.questionIds.map(id => questionById(id).mechanic || questionById(id).type), questionsFor(level,stage).slice(0,8).map(q => q.mechanic || q.type));
  }
});

test('abandonner une mission ne relance pas sa séquence exacte et ne fabrique pas de résultats', () => {
  const profile = freshProfile(), random = randomSource();
  const first = createMission(profile,random);
  const second = createMission(profile,random);
  assert.ok(second.questionIds.every(id => !first.questionIds.includes(id)));
  assert.equal(profile.exerciseHistory.length,0);
});

test('la reprise conserve les exercices et les positions des réponses et des cartes', () => {
  const profile = freshProfile(); profile.beginnerStage = 2;
  profile.session = createMission(profile,randomSource());
  profile.session.index = 2; profile.session.results = ['independent','assisted'];
  const before = missionQuestion(profile.session);
  const restored = parseProfile(JSON.stringify(profile));
  assert.deepEqual(restored.session.questionIds,profile.session.questionIds);
  assert.deepEqual(restored.session.variants,profile.session.variants);
  assert.deepEqual(missionQuestion(restored.session),before);
  assert.equal(before.options[before.answer], questionById(before.id).options[questionById(before.id).answer]);
});

test('les mélanges ne modifient pas le catalogue ni la correction attendue', () => {
  const profile = freshProfile(); profile.beginnerStage = 3;
  const original = structuredClone(questionsFor(0,3));
  const session = createMission(profile,randomSource());
  for (let index = 0; index < 8; index++) {
    const question = missionQuestion(session,index);
    assert.equal(question.options[question.answer],questionById(question.id).options[questionById(question.id).answer]);
    assert.deepEqual([...question.tiles].sort(), [...question.parts].sort());
  }
  assert.deepEqual(questionsFor(0,3),original);
});

test('un exercice terminé est enregistré une seule fois, même dans une mission abandonnée ensuite', () => {
  const profile = freshProfile(); profile.session = createMission(profile,randomSource());
  const question = missionQuestion(profile.session);
  recordExercise(profile,question,'independent'); recordExercise(profile,question,'independent');
  assert.equal(profile.exerciseHistory.length,1);
  profile.session = null;
  assert.equal(parseProfile(JSON.stringify(profile)).exerciseHistory.length,1);
  assert.equal(profile.completed,0);
});

test('les anciens profils et les historiques corrompus restent utilisables', () => {
  const old = parseProfile(JSON.stringify({hero:'knight',completed:4,level:1}));
  assert.equal(old.completed,4); assert.deepEqual(old.exerciseHistory,[]);
  assert.ok(createMission(old,randomSource()).questionIds.length === 8);
  const invalid = parseProfile(JSON.stringify({exerciseHistory:[null,{exerciseId:'<script>'}],lastPlans:{'0:0':['wrong']}}));
  assert.deepEqual(invalid.exerciseHistory,[]); assert.deepEqual(invalid.lastPlans,{});
});

test('l’historique local garde au maximum les derniers résultats annoncés', () => {
  const profile = freshProfile(); profile.session = createMission(profile,randomSource());
  const question = missionQuestion(profile.session);
  for (let i = 0; i <= HISTORY_LIMIT; i++) { profile.session.id = `m-${i + 1}`; recordExercise(profile,question,'independent'); }
  assert.equal(profile.exerciseHistory.length,HISTORY_LIMIT);
  assert.equal(profile.exerciseHistory[0].missionId,'m-2');
});

test('le numéro du groupe reste le même lors d’une reprise et d’un rejeu complet', async () => {
  const { rememberGroup, createReplayMission } = await import('../app/missions.js');
  const profile = freshProfile(); profile.session = createMission(profile,randomSource());
  assert.equal(profile.session.groupId,'g-1');
  const ids = [...profile.session.questionIds];
  const variants = structuredClone(profile.session.variants);
  finish(profile); rememberGroup(profile,profile.session,true);
  const restored = parseProfile(JSON.stringify(profile));
  assert.equal(restored.missionGroups.length,1);
  restored.session = createReplayMission(restored,'g-1');
  assert.equal(restored.session.mode,'replay');
  assert.deepEqual(restored.session.questionIds,ids);
  assert.deepEqual(restored.session.variants,variants);
  assert.equal(restored.session.groupId,'g-1');
  assert.equal(parseProfile(JSON.stringify(restored)).session.groupId,'g-1');
  const next = createMission(restored,randomSource());
  assert.equal(next.groupId,'g-2');
  assert.equal(createReplayMission(restored,'g-999'),null);
});

test('les anciennes révisions individuelles ne sont plus proposées et leur historique reste conservé', () => {
  const profile = freshProfile(); profile.session = createMission(profile,randomSource());
  recordExercise(profile,missionQuestion(profile.session),'independent');
  profile.session.mode = 'practice'; profile.session.questionIds = [profile.session.questionIds[0]];
  const restored = parseProfile(JSON.stringify(profile));
  assert.equal(restored.session,null);
  assert.equal(restored.exerciseHistory.length,1);
});

test('les groupes complets peuvent être récupérés depuis l’ancien historique sans doublons', () => {
  const profile = freshProfile(); profile.session = createMission(profile,randomSource()); finish(profile);
  delete profile.missionGroups; delete profile.groupSequence;
  const restored = parseProfile(JSON.stringify(profile));
  assert.equal(restored.missionGroups.length,1);
  assert.equal(restored.missionGroups[0].questionIds.length,8);
  assert.equal(restored.missionGroups[0].playCount,1);
  assert.equal(parseProfile(JSON.stringify(restored)).missionGroups.length,1);
});


test('Assemblage contient 60 mots uniques de deux syllabes et les parcourt avant de réviser',()=>{
 const pool=questionsFor(0,3);
 assert.equal(pool.length,60);assert.equal(new Set(pool.map(q=>q.listen)).size,60);
 for(const question of pool){
  assert.equal(question.parts.length,2);assert.equal(question.tiles.length,2);
  assert.equal(question.parts.join(''),question.listen);
  assert.deepEqual(question.modelParts,question.parts);assert.equal(question.mechanic,'build');
 }
 const profile=freshProfile();profile.beginnerStage=3;const seen=new Set();const random=randomSource();
 for(let round=0;round<8;round++){
  profile.session=createMission(profile,random);
  const ids=profile.session.questionIds;
  assert.equal(new Set(ids).size,8);
  const fresh=ids.filter(id=>!seen.has(id));
  assert.equal(fresh.length,round<7?8:4);
  ids.forEach(id=>seen.add(id));finish(profile);
 }
 assert.equal(seen.size,60);assert.equal(profile.beginnerStage,3);
});
