import {questionsFor} from './data.js';
// Draft primary objectives, for adult/editorial review only. No learner scoring or diagnosis.
const skill=(id,label,prerequisites,limit)=>({id,label,prerequisites,limit,professionalReview:'pending',userValidation:'pending'});
export const competencies=[
 skill('letter-shape','Reconnaître et associer des formes de lettres',[],'La réussite ne prouve ni la connaissance du nom ni celle du son de la lettre.'),
 skill('vowel-sound','Associer une voyelle entendue à sa lettre',['letter-shape'],'Seulement des voyelles simples ; prononciations synthétiques à vérifier.'),
 skill('syllable-listen','Retrouver une syllabe simple entendue',['vowel-sound'],'Reconnaissance parmi des propositions ; ne suffit pas à démontrer le décodage.'),
 skill('guided-letter-build','Reconstituer une syllabe avec un modèle',['letter-shape'],'Le modèle est visible ; la fusion autonome reste à évaluer séparément.'),
 skill('guided-word-build','Assembler deux syllabes avec un modèle',['guided-letter-build'],'Deux cartes et un modèle ; pas une preuve de lecture autonome d’un mot nouveau.'),
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
 skill('chronology-choice','Repérer une étape d’un récit',['literal-comprehension'],'Choix de réponse ; remise en ordre interactive absente.'),
 skill('context-completion','Compléter un récit selon le contexte',['literal-comprehension'],'QCM court ; vocabulaire et compréhension ne sont pas isolés.'),
 skill('emotion-inference','Inférer une émotion à partir d’un récit',['literal-comprehension'],'Ne doit pas être interprété comme une évaluation clinique ou émotionnelle.'),
 skill('phonological-awareness','Repérer et manipuler les sons à l’oral',[],'À développer ; les images et leurs dénominations devront être vérifiées.'),
 skill('sound-odd-one-out','Trouver un intrus sonore',['phonological-awareness'],'À développer.'),
 skill('close-sounds','Discriminer des sons proches',['phonological-awareness'],'À développer ; distinct de la discrimination visuelle des lettres.'),
 skill('consonant-sound','Associer des consonnes et graphèmes à leurs phonèmes',['letter-shape'],'À développer avec audios de phonèmes vérifiés ; ne pas utiliser le nom de la lettre.'),
 skill('independent-blending','Fusionner puis lire sans modèle',['vowel-sound','consonant-sound'],'À développer ; le jeu d’assemblage avec modèle ne couvre pas cet objectif.'),
 skill('phoneme-segmentation','Segmenter oralement un mot en phonèmes',['phonological-awareness'],'À développer.'),
 skill('complex-graphemes','Décoder des graphèmes complexes en contexte',['independent-blending'],'Couverture explicite à construire ; leur présence dans Découvrir ne suffit pas.'),
 skill('word-flash','Reconnaître rapidement des mots déjà travaillés',['independent-blending'],'À développer avec durée ajustable ; éviter la pression temporelle.'),
 skill('oral-fluency','Lire avec exactitude et fluidité',['independent-blending'],'À développer ; le temps de clic ne mesure pas la lecture orale.'),
 skill('interactive-segmentation','Segmenter activement une phrase',['sentence-segmentation-choice'],'À développer par clics, sans geste fin obligatoire.'),
 skill('interactive-chronology','Remettre en ordre les étapes d’un récit',['chronology-choice'],'À développer par choix successifs, sans glisser-déposer obligatoire.')
];
export function primaryCompetency(question){
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
