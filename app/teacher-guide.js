import {competencies,primaryCompetency} from './competencies.js';
import {questionsFor} from './data.js';
import {completedText} from './interactions.js';
const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
export function teachingCatalogue(){
 const pools=[...[0,1,2,3].map(stage=>({level:0,stage,questions:questionsFor(0,stage)})),...[1,2,3].map(level=>({level,stage:0,questions:questionsFor(level)}))];
 return competencies.map(skill=>{
  const groups=pools.map(pool=>({...pool,questions:pool.questions.filter(question=>primaryCompetency(question)===skill.id)}));
  const questions=groups.flatMap(pool=>pool.questions);
  return {...skill,count:questions.length,preparable:groups.some(pool=>pool.questions.length>=8),examples:questions.slice(0,3).map(question=>question.listen||question.text||completedText(question))};
 });
}
function teachingAdvice(id){
 if(id==='letter-shape')return ['Confusion de formes proches ou difficulté à comparer les cartes ; ne pas la confondre avec une erreur de son.','Montrer deux formes à comparer, puis changer les lettres.','Retrouver une même lettre sur deux cartes papier, sans exiger son nom.'];
 if(['phonological-awareness','sound-odd-one-out','close-sounds'].includes(id))return ['Mot illustré mal identifié, confusion sur le début sonore ou consigne non comprise.','Faire écouter chaque mot séparément, vérifier son nom, puis comparer le début de deux mots.','Chercher un autre mot commençant pareil avec un adulte ; ne pas inventer un phonème à partir du nom de la lettre.'];
 if(id==='phoneme-segmentation')return ['Confusion entre lettres, syllabes et phonèmes ; certains groupes de lettres correspondent à un seul son.','Choisir un mot court, décomposer oralement avec un professionnel ou un adulte préparé et matérialiser les sons par des jetons.','Essayer un autre mot transparent, en distinguant le nombre de sons de son nombre de lettres.'];
 if(id==='syllable-segmentation')return ['Comptage de lettres plutôt que de morceaux oraux, ou variation de prononciation du mot.','Prononcer le mot naturellement, puis rythmer ses syllabes sans étirer artificiellement les consonnes.','Rythmer un autre mot connu avec des gestes ou des jetons.'];
 if(id==='interactive-segmentation')return ['Coupure au milieu d’un mot ou absence d’espace entre deux mots.','Faire dire la phrase et retrouver chaque mot avant de placer les espaces.','Reconstituer une autre courte phrase avec des étiquettes-mots.'];
 if(id==='interactive-chronology'||id==='chronology-choice')return ['Choix d’une scène familière sans tenir compte de ce qui doit arriver avant.','Faire raconter les actions et chercher un lien de cause ou une étape nécessaire.','Remettre trois images ou trois phrases différentes dans l’ordre, puis expliquer ce choix.'];
 if(id==='word-flash')return ['Confusion visuelle, difficulté de mémorisation ou durée trop courte ; le résultat n’isole pas la lecture.','Augmenter la durée ou choisir le mode sans minuterie ; autoriser la réexposition.','Reconnaître le même mot dans une phrase, puis un autre mot déjà travaillé.'];
 if(id==='oral-fluency')return ['La fin de lecture est déclarée par l’utilisateur ; le site ne connaît ni les erreurs ni la qualité de la lecture orale.','Laisser lire sans compte à rebours. Aider sur un mot si nécessaire et distinguer cette aide de la lecture sans aide.','Écouter un court passage différent hors écran. Ne pas convertir le temps affiché en score de fluence.'];
 if(['agreement','word-family','prefix','suffix'].includes(id))return ['Réponse guidée par la ressemblance des lettres plutôt que par la construction du mot ou le sens de la phrase.','Faire reformuler la phrase et expliquer le changement de sens ou d’accord.','Construire un nouvel exemple oral ou écrit, hors des choix proposés.'];
 return ['Consigne mal comprise, exemple peu familier ou réponse obtenue après un modèle ; distinguer ces situations.','Vérifier l’écoute et le geste, montrer un exemple différent, puis laisser réessayer.','Proposer un nouvel exemple à l’oral, sur des cartes ou sur papier, sans reprendre exactement les choix de l’écran.'];
}
export function teachingCard(skill){
 const [errors,aid,transfer]=teachingAdvice(skill.id);
 const prerequisite=skill.prerequisites.map(id=>competencies.find(item=>item.id===id)?.label || id);
 return `<article class="teaching-card"><h3>${escape(skill.label)}</h3><p>${skill.count} exercice(s) proposé(s). Relecture professionnelle : en attente.</p><h4>Prérequis à vérifier</h4><p>${escape(prerequisite.join(' ; ')||'Observer la compréhension de la consigne et le confort de manipulation.')}</p><h4>Exemples</h4><p>${escape(skill.examples.join(' · ')||'Pas encore de contenu jouable pour cet objectif.')}</p><h4>Ce que l’on peut observer</h4><p>${escape(skill.limit)}</p><h4>Erreurs et obstacles possibles</h4><p>${escape(errors)}</p><h4>Aide graduée</h4><p>${escape(aid)}</p><h4>Vérifier hors écran</h4><p>${escape(transfer)}</p><p>Cette fiche est une proposition de séance à relire, pas une évaluation étalonnée. Elle ne bloque jamais l’accès de l’enfant au jeu.</p></article>`;
}
