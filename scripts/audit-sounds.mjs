import {access} from 'node:fs/promises';
import {resolve} from 'node:path';
import {soundCurriculum,letterSoundCoverage,audioReadiness,pilotSoundExercises} from '../content/sound-curriculum.mjs';
const rows=[];
for(const entry of soundCurriculum){
 const readiness=audioReadiness(entry);
 let exists=false;
 if(readiness.metadataReady)exists=await access(resolve('app','.'+entry.audio.file)).then(()=>true,()=>false);
 rows.push({id:entry.id,valeur:entry.phoneticValue,bloc:entry.block,prêt:readiness.metadataReady&&exists,manques:[...readiness.issues,...(readiness.metadataReady&&!exists?['fichier introuvable']:[])].join(' ; ')});
}
console.log(`${letterSoundCoverage.length} lettres documentées, ${soundCurriculum.length} unités proposées, ${pilotSoundExercises.length} essais de conception non activés.`);
console.table(rows.map(({manques,...row})=>row));
console.log(`${rows.filter(row=>row.prêt).length} audio(s) prêt(s). Les métadonnées seules ne prouvent pas la qualité de la prononciation.`);
if(process.argv.includes('--require-ready') && rows.some(row=>!row.prêt))process.exitCode=1;
