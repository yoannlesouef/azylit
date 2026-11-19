import {questionsFor} from './data.js';
// Draft primary objectives, for adult/editorial review only. No learner scoring or diagnosis.
const skill=(id,label,prerequisites,limit)=>({id,label,prerequisites,limit,professionalReview:'pending',userValidation:'pending'});
export const competencies=[
 skill('letter-shape','Reconnaître et associer des formes de lettres',[],'La réussite ne prouve ni la connaissance du nom ni celle du son de la lettre.'),
 skill('vowel-sound','Associer une voyelle entendue à sa lettre',['letter-shape'],'Seulement des voyelles simples ; prononciations synthétiques à vérifier.'),
 skill('syllable-listen','Retrouver une syllabe simple entendue',['vowel-sound'],'Reconnaissance parmi des propositions ; ne suffit pas à démontrer le décodage.'),
 skill('guided-letter-build','Reconstituer une syllabe avec un modèle',['letter-shape'],'Le modèle est visible ; cette reconstruction ne démontre pas la lecture sans modèle.'),
 skill('guided-word-build','Assembler deux syllabes avec un modèle',['guided-letter-build'],'Assemblage guidé ; pas une preuve de lecture autonome d’un mot nouveau.'),
 skill('word-context','Compléter une phrase par un mot familier',[],'QCM restreint ; compréhension orale et lecture peuvent contribuer à la réponse.'),
 skill('word-listen','Reconnaître un mot écrit à partir de sa forme orale',['syllable-listen'],'Reconnaissance parmi trois choix, pas une lecture orale mesurée.'),
 skill('sentence-segmentation-choice','Reconnaître une phrase correctement segmentée',['word-listen'],'Choix de phrase ; segmentation interactive non réalisée.'),
 skill('literal-comprehension','Retrouver une information explicite dans un texte',['word-context'],'Petits textes et QCM ; généralisation à vérifier.'),
 skill('agreement','Choisir un accord en contexte',['word-context'],'Petit corpus de QCM, sans mesure exhaustive de la maîtrise des accords.'),
 skill('word-family','Identifier une famille de mots',['word-context'],'Exemples limités et lexique à relire.'),
 skill('prefix','Interpréter un préfixe',['word-family'],'Petit corpus de QCM ; transfert non évalué.'),
 skill('suffix','Interpréter un suffixe',['word-family'],'Petit corpus de QCM ; transfert non évalué.'),
 skill('inference','Inférer une information à partir d’indices',['literal-comprehension'],'Inférences simples, sans couverture des types de textes.'),
 skill('pronoun-reference','Identifier le référent d’un pronom',['literal-comprehension'],'Exemples courts ; difficulté linguistique à étalonner.'),
 skill('chronology-choice','Repérer une étape d’un récit',['literal-comprehension'],'Repérer une étape parmi des choix ne mesure pas à lui seul la reconstruction chronologique.'),
 skill('context-completion','Compléter un récit selon le contexte',['literal-comprehension'],'QCM court ; vocabulaire et compréhension ne sont pas isolés.'),
 skill('emotion-inference','Inférer une émotion à partir d’un récit',['literal-comprehension'],'Ne doit pas être interprété comme une évaluation clinique ou émotionnelle.'),
 skill('syllable-segmentation','Repérer les syllabes orales d’un mot',[],'Comptage à partir d’un mot entendu ; ne mesure pas le décodage.'),
 skill('phonological-awareness','Repérer et manipuler les sons à l’oral',[],'Première série de mots illustrés ; dénominations et prononciations synthétiques à vérifier.'),
 skill('sound-odd-one-out','Trouver un intrus sonore',['phonological-awareness'],'Intrus sur le début de mots entiers ; dépend aussi du vocabulaire et de l’écoute.'),
 skill('close-sounds','Discriminer des sons proches',['phonological-awareness'],'Opposition initiale dans des mots entiers ; distinct de l’écoute de consonnes isolées et des formes de lettres.'),
 skill('consonant-sound','Associer des consonnes et graphèmes à leurs phonèmes',['letter-shape'],'À développer avec audios de phonèmes vérifiés ; ne pas utiliser le nom de la lettre.'),
 skill('independent-blending','Assembler des syllabes sans modèle',['vowel-sound','consonant-sound'],'Assemblage sans modèle écrit ; la lecture orale autonome du résultat reste à vérifier séparément.'),
 skill('phoneme-segmentation','Repérer le nombre de phonèmes dans un mot',['phonological-awareness'],'Comptage sur un petit corpus ; ne couvre pas toutes les manipulations de phonèmes.'),
 skill('complex-graphemes','Reconnaître des mots avec des graphèmes complexes',['independent-blending'],'Reconnaissance d’un mot entendu parmi des mots écrits ; décodage oral indépendant non mesuré.'),
 skill('word-flash','Reconnaître rapidement des mots déjà travaillés',['independent-blending'],'Présentation brève ajustable et réécoutable ; pas de note de vitesse ou d’exactitude orale.'),
 skill('oral-fluency','Lire un court texte, avec accompagnement facultatif',['independent-blending'],'Lecture déclarée terminée ; la durée facultative ne mesure ni l’exactitude ni les mots correctement lus.'),
 skill('interactive-segmentation','Segmenter activement une phrase',['sentence-segmentation-choice'],'Première série de phrases à segmenter par clics ; corrections éditoriales à relire.'),
 skill('interactive-chronology','Remettre en ordre les étapes d’un récit',['chronology-choice'],'Ordre causal sur de courtes histoires ; plusieurs contextes restent à développer et relire.')
];
export function primaryCompetency(question){
 if(question.competency)return competencies.some(skill=>skill.id===question.competency)?question.competency:null;
 if(question.foundation){
  if(question.type==='letter_match')return 'letter-shape';
  if(question.type==='phoneme_sound')return 'consonant-sound';
  if(question.type==='vowel_sound')return 'vowel-sound';
  if(question.type==='simple_syllable')return question.mechanic==='build'?'guided-letter-build':'syllable-listen';
  if(question.type==='syllable_assembly')return 'guided-word-build';
 }
 return ({'Les mots familiers':'word-context','Le mot entendu':'word-listen','Les mots se séparent':'sentence-segmentation-choice','Petite lecture':'literal-comprehension','Les accords':'agreement','La famille des mots':'word-family','Les préfixes':'prefix','Les suffixes':'suffix','Les indices du récit':'inference','Qui est-ce ?':'pronoun-reference','Le fil de l’histoire':'chronology-choice','Le bon mot':'context-completion','Les émotions':'emotion-inference'})[question.type] || null;
}
export function competenceCoverage(){
 const questions=[...Array.from({length:4},(_,stage)=>questionsFor(0,stage)),...Array.from({length:3},(_,index)=>questionsFor(index+1))].flat();
 return {total:questions.length,unmapped:questions.filter(question=>!primaryCompetency(question)).map(question=>question.id),skills:competencies.map(item=>({...item,exerciseIds:questions.filter(question=>primaryCompetency(question)===item.id).map(question=>question.id)}))};
}
