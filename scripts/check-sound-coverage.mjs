import {mkdir,writeFile} from 'node:fs/promises';
import {inspectSoundCoverage} from './sound-coverage-release.mjs';
import {soundCoverageReport,completeSoundExercises} from '../content/sound-exercises.mjs';
import {soundCurriculum} from '../content/sound-curriculum.mjs';
const report=await inspectSoundCoverage();
console.log(`${soundCoverageReport().length} lettres documentées, ${soundCurriculum.length} unités, ${completeSoundExercises.length} essais préparés, aucun nouvel exercice activé.`);
console.table(soundCoverageReport().map(({letter,mode,contextualExamples})=>({lettre:letter,mode,exemples:contextualExamples.join(', ')})));
console.log(report.ready?'Dossier prêt pour revue de livraison.':'Couverture audio non finalisée.');
for(const issue of report.issues)console.log('- '+issue);
if(process.argv.includes('--export')){
 if(!report.ready){console.error('Export refusé : fichiers ou relectures manquants.');process.exitCode=1;}
 else{await mkdir('artifacts',{recursive:true});await writeFile('artifacts/sound-coverage.json',JSON.stringify(report,null,2)+'\n');console.log('Export de revue : artifacts/sound-coverage.json ; le jeu reste inchangé.');}
}
if(process.argv.includes('--require-ready')&&!report.ready)process.exitCode=1;
