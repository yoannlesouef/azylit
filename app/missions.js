import { questionsFor, questionById } from './data.js';
import { primaryCompetency } from './competencies.js';
export const HISTORY_LIMIT = 2000;
export const GROUP_LIMIT = 200;
const poolKey = (level, stage) => `${level}:${level === 0 ? stage : 0}`;
const kind = question => question.mechanic || (['vowel_sound','phoneme_sound'].includes(question.type)?'sound-choice':question.type);
function shuffledIndices(length, random) {
  const order = Array.from({length}, (_,index) => index);
  for (let index = length - 1; index > 0; index--) {
    const other = Math.min(index, Math.max(0, Math.floor(random() * (index + 1))));
    [order[index],order[other]] = [order[other],order[index]];
  }
  return order;
}
export function createMission(profile, random = Math.random) {
  if(profile.nextObjective){
    const all=[...[0,1,2,3].map(stage=>({level:0,stage,pool:questionsFor(0,stage)})),...[1,2,3].map(level=>({level,stage:0,pool:questionsFor(level)}))];
    const target=all.find(item=>item.pool.filter(question=>primaryCompetency(question)===profile.nextObjective).length>=8);
    if(target){profile.level=target.level;profile.beginnerStage=target.stage;}
  }
  const allQuestions = questionsFor(profile.level, profile.beginnerStage);
  const focused = allQuestions.filter(question=>primaryCompetency(question)===profile.nextObjective);
  const objectiveId=focused.length>=8 ? profile.nextObjective : null;
  const pool = objectiveId ? focused : allQuestions;
  profile.nextObjective=null;
  const key = poolKey(profile.level, profile.beginnerStage);
  const previous = profile.lastPlans[key] || [];
  const stats = new Map();
  profile.exerciseHistory.forEach((event,index) => {
    const current = stats.get(event.exerciseId) || { count:0, last:-1 };
    current.count++; current.last = index; stats.set(event.exerciseId,current);
  });
  let selected;
  if (!previous.length && !pool.some(q => stats.has(q.id)) && profile.completed === 0) selected = pool.slice(0,8);
  else {
    const candidates = pool.map(question => ({ question, count:stats.get(question.id)?.count || 0, last:stats.get(question.id)?.last ?? -1, previous:previous.includes(question.id) ? 1 : 0, tie:random() }));
    candidates.sort((a,b) => a.count - b.count || a.previous - b.previous || a.last - b.last || a.tie - b.tie);
    selected=[];
    while(selected.length<8){
      const minimum=candidates[0];
      let index=candidates.findIndex(item=>item.count===minimum.count&&item.previous===minimum.previous&&selected.filter(question=>kind(question)===kind(item.question)).length<4);
      if(index<0)index=0;
      selected.push(candidates.splice(index,1)[0].question);
    }
    if (selected.every((q,index) => q.id === previous[index])) {
      const first = selected.findIndex(q => selected.filter(other => kind(q) === kind(other)).length > 1);
      const other = selected.findIndex((q,index) => index > first && kind(q) === kind(selected[first]));
      if (first >= 0 && other >= 0) [selected[first],selected[other]] = [selected[other],selected[first]];
    }
  }
  const variants = {};
  selected.forEach((question,index) => {
    variants[index] = { optionOrder:shuffledIndices(question.options.length,random) };
    if (question.tiles) variants[index].tileOrder = shuffledIndices(question.tiles.length,random);
    if (question.pairs) variants[index].pairOrder = shuffledIndices(question.pairs.length,random);
  });
  profile.missionSequence++;
  const ids = selected.map(question => question.id);
  profile.lastPlans[key] = ids;
  const session = { choiceLimit:profile.settings.choiceLimit || 4, objectiveId, id:`m-${profile.missionSequence}`, mode:'mission', level:profile.level, beginnerStage:profile.beginnerStage, questionIds:ids, variants, index:0, results:[], attempts:0, helpUsed:false, rejected:[], overrides:{}, interaction:null };
  rememberGroup(profile,session);
  return session;
}
const permutation = (order,length) => Array.isArray(order) && order.length === length && new Set(order).size === length && order.every(i => Number.isInteger(i) && i >= 0 && i < length);
export function missionQuestion(session, index = session.index) {
  const original = questionById(session.overrides[index] || session.questionIds?.[index]) || questionsFor(session.level,session.beginnerStage)[index];
  const variant = session.variants?.[index] || {};
  const question = { ...original };
  let order=permutation(variant.optionOrder,original.options.length) ? [...variant.optionOrder] : original.options.map((_,index)=>index);
  const limit=Math.max(original.minChoices || 2,session.choiceLimit || 4);
  if(order.length>limit){
    order=order.slice(0,limit);
    if(!order.includes(original.answer)){order[order.length-1]=original.answer;order.sort((a,b)=>(variant.optionOrder || original.options.map((_,i)=>i)).indexOf(a)-(variant.optionOrder || original.options.map((_,i)=>i)).indexOf(b));}
  }
  question.options=order.map(index=>original.options[index]);question.answer=order.indexOf(original.answer);
  if(original.optionPictures)question.optionPictures=order.map(index=>original.optionPictures[index]);
  if (original.tiles && permutation(variant.tileOrder,original.tiles.length)) question.tiles = variant.tileOrder.map(index => original.tiles[index]);
  if (original.pairs && permutation(variant.pairOrder,original.pairs.length)) question.pairOrder = [...variant.pairOrder];
  return question;
}
export function recordExercise(profile, question, outcome, now = new Date()) {
  const session = profile.session;
  if (!session.id) { profile.missionSequence++; session.id = `m-${profile.missionSequence}`; }
  const duplicate = profile.exerciseHistory.some(event => event.missionId === session.id && event.position === session.index);
  if (duplicate) return;
  profile.exerciseHistory.push({ exerciseId:question.id, missionId:session.id, position:session.index, groupId:session.groupId || null, level:session.level, beginnerStage:session.beginnerStage, result:outcome, ...(question.mechanic==='reading'?{observation:{kind:'reading-declared',durationMs:session.readingDurationMs ?? null}}:{}), attempts:session.attempts, helpUsed:session.helpUsed === true, completedAt:now.toISOString() });
  if (profile.exerciseHistory.length > HISTORY_LIMIT) profile.exerciseHistory.splice(0,profile.exerciseHistory.length - HISTORY_LIMIT);
}

export function rememberGroup(profile, session, completed = false, now = new Date()) {
  if (!session.id) { profile.missionSequence++; session.id = `m-${profile.missionSequence}`; }
  let group = profile.missionGroups.find(item => item.id === session.groupId);
  if (!group) {
    profile.groupSequence++;
    session.groupId = `g-${profile.groupSequence}`;
    group = { id:session.groupId, sourceMissionId:session.id || null, level:session.level, beginnerStage:session.beginnerStage, questionIds:[], variants:{}, completedAt:null, playCount:0 };
    profile.missionGroups.push(group);
  }
  if (session.mode !== 'replay' || !group.questionIds.length) {
  group.questionIds = Array.from({length:8},(_,index) => session.overrides?.[index] || session.questionIds?.[index] || questionsFor(session.level,session.beginnerStage)[index].id);
  group.variants = structuredClone(session.variants || {});
  }
  if (completed && group.lastCompletedMission !== session.id) {
    group.completedAt = now.toISOString(); group.playCount++; group.lastCompletedMission = session.id;
  }
  if (profile.missionGroups.length > GROUP_LIMIT) profile.missionGroups.splice(0,profile.missionGroups.length - GROUP_LIMIT);
  return group;
}
export function createReplayMission(profile, groupId) {
  const group = profile.missionGroups.find(item => item.id === groupId && item.level === profile.level && (item.level !== 0 || item.beginnerStage === profile.beginnerStage));
  if (!group) return null;
  profile.missionSequence++;
  return { id:`m-${profile.missionSequence}`, groupId:group.id, mode:'replay', level:group.level, beginnerStage:group.beginnerStage, questionIds:[...group.questionIds], variants:structuredClone(group.variants), index:0, results:[], attempts:0, helpUsed:false, rejected:[], overrides:{}, interaction:null };
}
export function recoverGroups(profile) {
  const byMission = new Map();
  for (const event of profile.exerciseHistory) {
    if (profile.missionGroups.some(group => group.sourceMissionId === event.missionId || group.id === event.groupId)) continue;
    if (!byMission.has(event.missionId)) byMission.set(event.missionId,[]);
    byMission.get(event.missionId).push(event);
  }
  for (const [missionId, events] of byMission) {
    const positions = new Map(events.map(event => [event.position,event]));
    if (positions.size !== 8) continue;
    const ordered = Array.from({length:8},(_,index) => positions.get(index));
    if (ordered.some(event => !event || event.level !== ordered[0].level || event.beginnerStage !== ordered[0].beginnerStage || !questionById(event.exerciseId))) continue;
    const session = { id:missionId, level:ordered[0].level, beginnerStage:ordered[0].beginnerStage, questionIds:ordered.map(event => event.exerciseId), variants:{}, overrides:{} };
    rememberGroup(profile,session,true,new Date(ordered[7].completedAt));
  }
}
