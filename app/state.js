export const STORAGE_KEY = 'azylit.profile.v1';
export const defaults = { hero: 'unicorn', level: 0, beginnerStage: 0, beginnerWins: [0,0,0,0], onboarded: false, audio: true, settings: { font: 'sans-serif', size: 28, spacing: 0.05, line: 1.6, syllables: false, ruler: false }, completed: 0, assisted: 0, session: null };
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
    const settings = data.settings || {};
    if (['sans-serif', 'Verdana', 'Arial'].includes(settings.font)) p.settings.font = settings.font;
    for (const [key, values] of Object.entries({ size: [22, 28, 34], spacing: [0.05, 0.08, 0.12], line: [1.6, 1.8, 2] })) if (values.includes(settings[key])) p.settings[key] = settings[key];
    p.settings.syllables = settings.syllables === true;
    p.settings.ruler = settings.ruler === true;
    const session = data.session;
    if (session && Number.isInteger(session.level) && session.level >= 0 && session.level < 4 && Number.isInteger(session.index) && session.index >= 0 && session.index < 8 && Array.isArray(session.results) && session.results.length <= 8 && session.results.every(r => r === 'independent' || r === 'assisted')) {
      p.session = { beginnerStage: Number.isInteger(session.beginnerStage) && session.beginnerStage >= 0 && session.beginnerStage < 4 ? session.beginnerStage : 0, level: session.level, index: Math.min(session.results.length, 7), results: session.results, attempts: 0, rejected: [], overrides: {} };
      if (session.overrides && typeof session.overrides === 'object') p.session.overrides = Object.fromEntries(Object.entries(session.overrides).filter(([k, v]) => /^[0-7]$/.test(k) && typeof v === 'string' && /^(n[1-4]|f[0-3])-[1-8]$/.test(v)));
      if (session.results.length === 8 || (session.level === 0 && session.beginnerStage === undefined)) p.session = null;
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
