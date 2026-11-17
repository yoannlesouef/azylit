# Première matrice de compétences

État : brouillon éditorial du 17 novembre 2026, non relu par un professionnel et non validé auprès des enfants. Cette matrice prépare la phase 2 ; elle ne constitue ni un diagnostic ni un bilan élève.

Les 180 exercices sont reliés à un objectif principal dans [content/competencies.mjs](../content/competencies.mjs). Certains sollicitent plusieurs capacités : le classement principal n’isole pas toutes leurs contributions. Les prérequis sont des hypothèses de conception, pas des conditions bloquantes imposées à l’enfant.

| Objectif principal | Exercices du prototype | Identifiants des prérequis proposés | Limite ou travail restant |
| --- | --- | --- | --- |
| Reconnaître et associer des formes de lettres | 16 | Aucun prérequis technique défini | La réussite ne prouve ni la connaissance du nom ni celle du son de la lettre. |
| Associer une voyelle entendue à sa lettre | 16 | letter-shape | Seulement des voyelles simples ; prononciations synthétiques à vérifier. |
| Retrouver une syllabe simple entendue | 20 | vowel-sound | Reconnaissance parmi des propositions ; ne suffit pas à démontrer le décodage. |
| Reconstituer une syllabe avec un modèle | 20 | letter-shape | Le modèle est visible ; la fusion autonome reste à évaluer séparément. |
| Assembler deux syllabes avec un modèle | 60 | guided-letter-build | Deux cartes et un modèle ; pas une preuve de lecture autonome d’un mot nouveau. |
| Compléter une phrase par un mot familier | 4 | Aucun prérequis technique défini | QCM restreint ; compréhension orale et lecture peuvent contribuer à la réponse. |
| Reconnaître un mot écrit à partir de sa forme orale | 4 | syllable-listen | Reconnaissance parmi trois choix, pas une lecture orale mesurée. |
| Reconnaître une phrase correctement segmentée | 4 | word-listen | Choix de phrase ; segmentation interactive non réalisée. |
| Retrouver une information explicite dans un texte | 4 | word-context | Petits textes et QCM ; généralisation à vérifier. |
| Choisir un accord en contexte | 6 | word-context | Petit corpus de QCM, sans mesure exhaustive de la maîtrise des accords. |
| Identifier une famille de mots | 4 | word-context | Exemples limités et lexique à relire. |
| Interpréter un préfixe | 4 | word-family | Petit corpus de QCM ; transfert non évalué. |
| Interpréter un suffixe | 2 | word-family | Petit corpus de QCM ; transfert non évalué. |
| Inférer une information à partir d’indices | 4 | literal-comprehension | Inférences simples, sans couverture des types de textes. |
| Identifier le référent d’un pronom | 4 | literal-comprehension | Exemples courts ; difficulté linguistique à étalonner. |
| Repérer une étape d’un récit | 4 | literal-comprehension | Choix de réponse ; remise en ordre interactive absente. |
| Compléter un récit selon le contexte | 2 | literal-comprehension | QCM court ; vocabulaire et compréhension ne sont pas isolés. |
| Inférer une émotion à partir d’un récit | 2 | literal-comprehension | Ne doit pas être interprété comme une évaluation clinique ou émotionnelle. |
| Repérer et manipuler les sons à l’oral | 0 | Aucun prérequis technique défini | À développer ; les images et leurs dénominations devront être vérifiées. |
| Trouver un intrus sonore | 0 | phonological-awareness | À développer. |
| Discriminer des sons proches | 0 | phonological-awareness | À développer ; distinct de la discrimination visuelle des lettres. |
| Associer des consonnes et graphèmes à leurs phonèmes | 0 | letter-shape | À développer avec audios de phonèmes vérifiés ; ne pas utiliser le nom de la lettre. |
| Fusionner puis lire sans modèle | 0 | vowel-sound, consonant-sound | À développer ; le jeu d’assemblage avec modèle ne couvre pas cet objectif. |
| Segmenter oralement un mot en phonèmes | 0 | phonological-awareness | À développer. |
| Décoder des graphèmes complexes en contexte | 0 | independent-blending | Couverture explicite à construire ; leur présence dans Découvrir ne suffit pas. |
| Reconnaître rapidement des mots déjà travaillés | 0 | independent-blending | À développer avec durée ajustable ; éviter la pression temporelle. |
| Lire avec exactitude et fluidité | 0 | independent-blending | À développer ; le temps de clic ne mesure pas la lecture orale. |
| Segmenter activement une phrase | 0 | sentence-segmentation-choice | À développer par clics, sans geste fin obligatoire. |
| Remettre en ordre les étapes d’un récit | 0 | chronology-choice | À développer par choix successifs, sans glisser-déposer obligatoire. |

## Contrôles

La commande `npm run audit:coverage` recalcule les effectifs. Les tests vérifient le rattachement des exercices, l’absence de prérequis inconnus ou cycliques et le maintien explicite des objectifs sans exercice. Une valeur supérieure à zéro décrit une présence dans le code, pas une maîtrise pédagogique ni une couverture suffisante. Découvrir reste un espace d’exploration ; ses mots ne sont pas comptés comme exercices évalués.

## Fiche pilote : retrouver une syllabe entendue

- Objectif : associer une syllabe orale à sa forme écrite parmi deux propositions.
- Prérequis proposés : entendre la cible et comprendre le geste de sélection ; les prérequis de lecture sont à relire professionnellement.
- Déroulement : écoute isolée, choix, réécoute éventuelle, aide, puis retour visuel et poursuite volontaire.
- Ce que le logiciel observe : choix, erreurs et aide demandée. Une panne audio ne constitue pas une erreur de lecture.
- Démonstration : un autre exemple, hors de la mission, montrant le haut-parleur et la carte à toucher. La demande d’aide reste enregistrée ; la démonstration ne crée aucun résultat.
- Limite : retrouver une proposition ne démontre pas la fusion autonome ou la capacité à lire un mot nouveau.
- Proposition de transfert à relire : proposer un autre exemple hors écran, en observant les aides nécessaires ; ne pas interpréter cet essai comme un test étalonné.

## Prochaine étape

Faire relire cette classification, les correspondances travaillées et le premier sous-ensemble de mots/sons. Préparer ensuite les enregistrements et renseigner leur provenance, leur validation et les appareils sur lesquels ils ont été écoutés. Aucun enregistrement validé n’est livré dans cet incrément.
