import {mkdir,writeFile} from 'node:fs/promises';
import {inspectSoundPilot} from './sound-pilot-release.mjs';
const report=await inspectSoundPilot();
console.log(report.ready?'Pilote techniquement prêt pour une revue de livraison.':'Pilote non activable : éléments manquants.');
for(const issue of report.issues)console.log('- '+issue);
if(process.argv.includes('--export')){
 if(!report.ready){console.error('Aucun export produit : le pilote n’est pas prêt.');process.exitCode=1;}
 else{await mkdir('artifacts',{recursive:true});await writeFile('artifacts/sound-pilot.json',JSON.stringify(report,null,2)+'\n');console.log('Export de revue : artifacts/sound-pilot.json. La banque du jeu n’est pas modifiée.');}
}
if(process.argv.includes('--require-ready')&&!report.ready)process.exitCode=1;
