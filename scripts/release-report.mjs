import {access,readFile,readdir} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {pathToFileURL} from 'node:url';
import {audioRelease} from '../content/audio-release.mjs';
const root=resolve('dist');
const {competenceCoverage}=await import(pathToFileURL(resolve(root,'competencies.js')).href);
const {teachingCatalogue}=await import(pathToFileURL(resolve(root,'teacher-guide.js')).href);
const {questionsFor}=await import(pathToFileURL(resolve(root,'data.js')).href);
const {recordedSoundQuestions,recordedVoiceEntries}=await import(pathToFileURL(resolve(root,'recorded-content.js')).href);
import {inspectSoundCoverage} from './sound-coverage-release.mjs';
const report=competenceCoverage();
if(report.unmapped.length)throw new Error('Objectifs non renseignés : '+report.unmapped.join(', '));
const pools=[...[0,1,2,3].map(stage=>questionsFor(0,stage)),...[1,2,3].map(level=>questionsFor(level))];
const ids=pools.flat().map(q=>q.id);if(new Set(ids).size!==ids.length)throw new Error('Identifiants d’exercice dupliqués.');
let imports=0;
for(const name of await readdir(root)){
 if(!name.endsWith('.js'))continue;
 const path=resolve(root,name),source=await readFile(path,'utf8');
 for(const [,relative] of source.matchAll(/from\s+['"]([.][^'"]+)['"]/g)){
  const target=resolve(dirname(path),relative);if(!target.startsWith(root+'/'))throw new Error('Import hors distribution : '+target);
  await access(target);imports++;
 }
}
const audio=await inspectSoundCoverage();
console.log(`${report.total} exercices, ${report.skills.length} objectifs éditoriaux, ${imports} imports de production résolus.`);
console.log('Effectifs des sept paliers : '+pools.map(pool=>pool.length).join(', '));
console.log(`${teachingCatalogue().filter(skill=>skill.preparable).length} objectifs permettent de préparer une mission de huit exercices.`);
console.log(`${recordedSoundQuestions.length} exercice(s) enregistré(s) et ${recordedVoiceEntries.length} prise(s) de voix dans la distribution.`);
console.log(audio.ready&&audioRelease.coverage?'Couverture audio enregistrée activée.':'Couverture audio enregistrée complète non finalisée.');
console.log('Recette enfants, relecture professionnelle et contrôles sur le domaine public : non établis par cette commande.');
if(process.argv.includes('--require-audio')&&(!audio.ready||!audioRelease.coverage))process.exitCode=1;
