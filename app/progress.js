import {competencies,primaryCompetency} from './competencies.js';
import {questionById} from './data.js';
import {completedText} from './interactions.js';
const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);

// Descriptive counts of retained results, never a mastery threshold or diagnosis.
export function summarizeProgress(entries){
 const rows=new Map();let unmapped=0;
 for(const entry of entries){
  const question=questionById(entry.exerciseId),id=question && primaryCompetency(question);
  const skill=competencies.find(skill=>skill.id===id);
  const time=Date.parse(entry.completedAt);
  if(!skill || !['independent','assisted','observed'].includes(entry.result) || !Number.isFinite(time)){unmapped++;continue;}
  if(!rows.has(id))rows.set(id,{id,label:skill.label,limit:skill.limit,independent:0,assisted:0,observed:0,latest:new Map(),lastCompletedAt:entry.completedAt});
  const outcome=question.mechanic==='reading'?'observed':entry.result;
  const row=rows.get(id);row[outcome]++;
  if(time>=Date.parse(row.lastCompletedAt))row.lastCompletedAt=entry.completedAt;
  const previous=row.latest.get(entry.exerciseId);
  if(!previous || time>=Date.parse(previous.completedAt))row.latest.set(entry.exerciseId,{exerciseId:entry.exerciseId,result:outcome,completedAt:entry.completedAt,target:completedText(question)});
 }
 return {unmapped,rows:competencies.filter(skill=>rows.has(skill.id)).map(skill=>{
  const {latest,...row}=rows.get(skill.id);
  const targets=[...latest.values()].filter(entry=>entry.result==='assisted').sort((a,b)=>Date.parse(b.completedAt)-Date.parse(a.completedAt)).map(entry=>entry.target);
  return {...row,completed:row.independent+row.assisted+row.observed,distinctExercises:latest.size,recentSupport:[...new Set(targets)].slice(0,3)};
 })};
}
export function renderProgressSummary(report){
 if(!report.rows.length)return '';
 return `<section class="progress-summary" aria-labelledby="progress-summary-title"><h3 id="progress-summary-title">Bilan des entraînements conservés</h3><p>Ces observations décrivent les exercices terminés sur ce navigateur. Une lecture déclarée terminée n’est pas une lecture évaluée ; le temps facultatif reste dans le détail de l’historique, sans record ni classement. Ces observations ne démontrent pas qu’une compétence est acquise : certains exercices gardent un modèle visible. Sur un appareil partagé, les résultats de plusieurs enfants peuvent être mélangés.</p><div class="history-scroll"><table class="history-table"><caption class="sr-only">Résultats par objectif travaillé, sur l’historique encore conservé</caption><thead><tr><th scope="col">Objectif travaillé</th><th scope="col">Sans aide supplémentaire</th><th scope="col">Avec aide ou nouvel essai</th><th scope="col">Lecture déclarée terminée</th><th scope="col">À revoir ensemble, si utile</th></tr></thead><tbody>${report.rows.map(row=>`<tr><th scope="row">${escape(row.label)}<small>${row.distinctExercises} exercice(s) distinct(s). ${escape(row.limit)}</small></th><td>${row.independent}</td><td>${row.assisted}</td><td>${row.observed || 0}</td><td>${row.recentSupport.length?escape(row.recentSupport.join(' · ')):'—'}</td></tr>`).join('')}</tbody></table></div><p>Les pistes proposées correspondent aux exercices dont le dernier résultat conservé était accompagné. Elles ne changent ni le niveau ni les exercices de l’enfant. Le choix de reprendre un contenu reste à adapter à son apprentissage.</p>${report.unmapped?`<p>${report.unmapped} résultat(s) non classé(s), absents de ce bilan.</p>`:''}</section>`;
}
