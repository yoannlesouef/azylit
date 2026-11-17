import { HISTORY_LIMIT, GROUP_LIMIT, recoverGroups } from './missions.js';
const validQuestionId = value => typeof value === 'string' && /^(n[1-4]|f[0-3])-[1-9][0-9]{0,2}$/.test(value);
const validOrder = value => Array.isArray(value) && value.length >= 2 && value.length <= 4 && new Set(value).size === value.length && value.every(index => Number.isInteger(index) && index >= 0 && index < value.length);
export const STORAGE_KEY = 'azylit.profile.v1';
export const defaults = { hero: 'unicorn', level: 0, beginnerStage: 0, beginnerWins: [0,0,0,0], onboarded: false, audio: true, settings: { font: 'sans-serif', size: 28, spacing: 0.05, line: 1.6, syllables: false, ruler: false }, completed: 0, assisted: 0, missionSequence: 0, groupSequence: 0, missionGroups: [], lastPlans: {}, exerciseHistory: [], session: null };
export function freshProfile() { return structuredClone(defaults); }
export function parseProfile(raw) {
  try {
    const data = JSON.parse(raw);
    if (!data || typeof data !== 'object') return freshProfile();
    const p = freshProfile();
    const legacy = { nova: 'unicorn', atlas: 'knight', lyra: 'princess', zephyr: 'pirate' };
    if (['unicorn', 'knight', 'princess', 'pirate'].includes(data.hero)) p.hero = data.hero;
    else if (Object.hasOwn(legacy, data.hero)) p.hero = legacy[data.hero];
    if (Number.isInteger(data.level) && data.level >= 0 && data.level <= 3) p.level = data.level;
    if (Number.isInteger(data.beginnerStage) && data.beginnerStage >= 0 && data.beginnerStage < 4) p.beginnerStage = data.beginnerStage;
    if (Array.isArray(data.beginnerWins) && data.beginnerWins.length === 4) p.beginnerWins = data.beginnerWins.map(value => Number.isInteger(value) && value >= 0 ? value : 0);
    p.onboarded = data.onboarded === true;
    p.audio = data.audio !== false;
    p.completed = Number.isInteger(data.completed) && data.completed >= 0 ? data.completed : 0;
    p.assisted = Number.isInteger(data.assisted) && data.assisted >= 0 ? data.assisted : 0;
    if (Number.isSafeInteger(data.missionSequence) && data.missionSequence >= 0) p.missionSequence = data.missionSequence;
    if (Array.isArray(data.exerciseHistory)) p.exerciseHistory = data.exerciseHistory.filter(event => event && validQuestionId(event.exerciseId) && /^m-[0-9]{1,12}$/.test(event.missionId) && Number.isInteger(event.position) && event.position >= 0 && event.position < 8 && Number.isInteger(event.level) && event.level >= 0 && event.level < 4 && Number.isInteger(event.beginnerStage) && event.beginnerStage >= 0 && event.beginnerStage < 4 && ['independent','assisted'].includes(event.result) && Number.isInteger(event.attempts) && event.attempts >= 0 && typeof event.completedAt === 'string' && event.completedAt.length <= 40 && Number.isFinite(Date.parse(event.completedAt))).slice(-HISTORY_LIMIT).map(event => ({ exerciseId:event.exerciseId, missionId:event.missionId, groupId:/^g-[0-9]{1,12}$/.test(event.groupId) ? event.groupId : null, position:event.position, level:event.level, beginnerStage:event.beginnerStage, result:event.result, attempts:event.attempts, helpUsed:event.helpUsed === true, completedAt:event.completedAt }));
    for (const event of p.exerciseHistory) p.missionSequence = Math.max(p.missionSequence, Number(event.missionId.slice(2)));
    if (data.lastPlans && typeof data.lastPlans === 'object') for (const [key, ids] of Object.entries(data.lastPlans)) {
      if (/^[0-3]:[0-3]$/.test(key) && Array.isArray(ids) && ids.length === 8 && new Set(ids).size === 8 && ids.every(validQuestionId)) p.lastPlans[key] = [...ids];
    }
    if (Number.isSafeInteger(data.groupSequence) && data.groupSequence >= 0) p.groupSequence = data.groupSequence;
    if (Array.isArray(data.missionGroups)) p.missionGroups = data.missionGroups.filter(group => group && /^g-[0-9]{1,12}$/.test(group.id) && Number.isInteger(group.level) && group.level >= 0 && group.level < 4 && Number.isInteger(group.beginnerStage) && group.beginnerStage >= 0 && group.beginnerStage < 4 && Array.isArray(group.questionIds) && group.questionIds.length === 8 && group.questionIds.every(validQuestionId)).slice(-GROUP_LIMIT).map(group => {
      const variants = {};
      if (group.variants && typeof group.variants === 'object') for (const [index,variant] of Object.entries(group.variants)) {
        if (!/^[0-7]$/.test(index) || !variant || typeof variant !== 'object') continue;
        variants[index] = {};
        for (const key of ['optionOrder','tileOrder','pairOrder']) if (validOrder(variant[key])) variants[index][key] = [...variant[key]];
      }
      return { id:group.id, sourceMissionId:/^m-[0-9]{1,12}$/.test(group.sourceMissionId) ? group.sourceMissionId : null, level:group.level, beginnerStage:group.beginnerStage, questionIds:[...group.questionIds], variants, completedAt:typeof group.completedAt === 'string' && Number.isFinite(Date.parse(group.completedAt)) ? group.completedAt : null, playCount:Number.isInteger(group.playCount) && group.playCount >= 0 ? group.playCount : 0, lastCompletedMission:/^m-[0-9]{1,12}$/.test(group.lastCompletedMission) ? group.lastCompletedMission : null };
    });
    for (const group of p.missionGroups) p.groupSequence = Math.max(p.groupSequence,Number(group.id.slice(2)));
    if (!Array.isArray(data.missionGroups)) recoverGroups(p);
    const settings = data.settings || {};
    if (['sans-serif', 'Verdana', 'Arial'].includes(settings.font)) p.settings.font = settings.font;
    for (const [key, values] of Object.entries({ size: [22, 28, 34], spacing: [0.05, 0.08, 0.12], line: [1.6, 1.8, 2] })) if (values.includes(settings[key])) p.settings[key] = settings[key];
    p.settings.syllables = settings.syllables === true;
    p.settings.ruler = settings.ruler === true;
    const session = data.session;
    const sessionLength = 8;
    if (session && Number.isInteger(session.level) && session.level >= 0 && session.level < 4 && Number.isInteger(session.index) && session.index >= 0 && session.index < sessionLength && Array.isArray(session.results) && session.results.length <= sessionLength && session.results.every(r => r === 'independent' || r === 'assisted')) {
      p.session = { mode:session.mode === 'replay' ? 'replay' : 'mission', beginnerStage: Number.isInteger(session.beginnerStage) && session.beginnerStage >= 0 && session.beginnerStage < 4 ? session.beginnerStage : 0, level: session.level, index: Math.min(session.results.length, sessionLength - 1), results: session.results, helpUsed: session.results.length > session.index ? false : session.helpUsed === true, attempts: session.results.length > session.index ? 0 : Number.isInteger(session.attempts) && session.attempts >= 0 ? Math.min(session.attempts, 10000) : 0, rejected: session.results.length > session.index ? [] : Array.isArray(session.rejected) ? [...new Set(session.rejected.filter(i => Number.isInteger(i) && i >= 0 && i < 4))] : [], interaction: session.results.length > session.index ? null : session.interaction && typeof session.interaction === 'object' ? { questionId: String(session.interaction.questionId || ''), selectedSource: session.interaction.selectedSource, matched: Array.isArray(session.interaction.matched) ? session.interaction.matched.slice(0,4) : [], picked: Array.isArray(session.interaction.picked) ? session.interaction.picked.slice(0,4) : [] } : null, overrides: {} };
      if (session.overrides && typeof session.overrides === 'object') p.session.overrides = Object.fromEntries(Object.entries(session.overrides).filter(([k, v]) => /^[0-7]$/.test(k) && typeof v === 'string' && validQuestionId(v)));
      if (/^g-[0-9]{1,12}$/.test(session.groupId)) p.session.groupId = session.groupId;
      if (/^m-[0-9]{1,12}$/.test(session.id)) { p.session.id = session.id; p.missionSequence = Math.max(p.missionSequence, Number(session.id.slice(2))); }
      if (Array.isArray(session.questionIds) && session.questionIds.length === sessionLength && (session.mode === 'replay' || new Set(session.questionIds).size === sessionLength) && session.questionIds.every(validQuestionId)) p.session.questionIds = [...session.questionIds];
      p.session.variants = {};
      if (session.variants && typeof session.variants === 'object') for (const [index, variant] of Object.entries(session.variants)) {
        if (!/^[0-7]$/.test(index) || !variant || typeof variant !== 'object') continue;
        p.session.variants[index] = {};
        for (const key of ['optionOrder','tileOrder','pairOrder']) if (validOrder(variant[key])) p.session.variants[index][key] = [...variant[key]];
      }
      if (session.mode === 'practice' || session.results.length === sessionLength || (session.level === 0 && session.beginnerStage === undefined)) p.session = null;
    }
    return p;
  } catch { return freshProfile(); }
}
export function recommendedLevel(results) {
  if (!results.some(value => typeof value === 'boolean')) return null;
  // This short game only checks foundations and a simple sentence, never advanced levels.
  return results.length === 5 && results.every(value => value === true) ? 1 : 0;
}
export function recommendedBeginnerStage(results) {
  let stage = 0;
  while (stage < 3 && results[stage] === true) stage++;
  return stage;
}
export function recordBeginnerMission(profile, session) {
  if (session.level !== 0) return;
  const independent = session.results.filter(value => value === 'independent').length;
  const stage = session.beginnerStage;
  profile.beginnerWins[stage] = independent >= 7 ? profile.beginnerWins[stage] + 1 : 0;
}

export function difficultyPosition(profile) {
  return profile.level === 0 ? profile.beginnerStage : profile.level + 3;
}
export function setDifficultyPosition(profile, position) {
  const selected = Math.max(0, Math.min(6, position));
  if (selected < 4) { profile.level = 0; profile.beginnerStage = selected; }
  else profile.level = selected - 3;
}
