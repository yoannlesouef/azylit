import {competenceCoverage} from '../content/competencies.mjs';
const report=competenceCoverage();
console.log('Couverture du prototype — correspondances éditoriales à relire, sans validation pédagogique');
console.table(report.skills.map(skill=>({compétence:skill.label,exercices:skill.exerciseIds.length,relecture:skill.professionalReview})));
console.log(`${report.total} exercices ; ${report.unmapped.length} sans objectif principal renseigné.`);
if(report.unmapped.length)process.exitCode=1;
