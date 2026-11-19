import {access,readFile,readdir} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {competenceCoverage} from '../app/competencies.js';
import {teachingCatalogue} from '../app/teacher-guide.js';
import {questionsFor} from '../app/data.js';
import {inspectSoundCoverage} from './sound-coverage-release.mjs';
const report=competenceCoverage();
if(report.unmapped.length)throw new Error('Objectifs non renseignés : '+report.unmapped.join(', '));
const pools=[...[0,1,2,3].map(stage=>questionsFor(0,stage)),...[1,2,3].map(level=>questionsFor(level))];
const ids=pools.flat().map(q=>q.id);if(new Set(ids).size!==ids.length)throw new Error('Identifiants d’exercice dupliqués.');
const root=resolve('dist');let imports=0;
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
console.log(audio.ready?'Dossier audio complet techniquement prêt pour revue.':'Dossier audio incomplet : phonèmes enregistrés non activés.');
console.log('Recette enfants, relecture professionnelle et contrôles sur le domaine public : non établis par cette commande.');
if(process.argv.includes('--require-audio')&&!audio.ready)process.exitCode=1;
