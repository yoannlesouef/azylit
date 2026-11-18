# Préparation du niveau 2 — Premiers sons

**Statut : phase 2, brouillon éditorial et structure technique préparés.** Aucun nouveau son n’est activé dans le jeu. La relecture pédagogique, les enregistrements et les écoutes sur appareils restent à réaliser. Le niveau jouable conserve ses 16 exercices sur a, i, o et u.

## Ce qui est préparé

- Un inventaire de 37 unités orales proposées, dont oi explicitement traité comme une séquence et non un phonème unique.
- Une fiche pour chacune des 26 lettres, y compris les cas où une carte de son isolé serait trompeuse.
- Six étapes éditoriales, sans ajouter de niveaux, menus ou groupes au parcours enfant.
- Huit essais de conception sur l, r, f et j, chacun avec deux propositions distinctes et des positions de réponse équilibrées.
- Un contrat de données audio : fichier, langue, provenance/droits, relecture et contrôle sur appareils.

Les données se trouvent dans [content/sound-curriculum.mjs](../content/sound-curriculum.mjs). Le rapport `npm run audit:sounds` indique les manques ; `node scripts/audit-sounds.mjs --require-ready` échoue tant que toutes les unités ne possèdent pas les éléments requis et un fichier présent. Ce contrôle logiciel ne vérifie pas à lui seul la qualité du son ni la réalité de la validation saisie.

## Ordre proposé, à faire relire

1. Consolider a, i, o, u, en vérifiant les sons déjà produits par le navigateur.
2. Préparer é, è et e avec une attention aux variations de réalisation ; le e n’a pas une valeur uniforme dans tous les mots.
3. Préparer un pilote sur l, r, f et j avec les voyelles déjà travaillées.
4. Étendre à m, n, v et s, puis aux consonnes brèves p, t, b, d, k et g.
5. Introduire progressivement d’autres graphèmes et leurs contextes, sans affirmer qu’une lettre correspond toujours à un seul son.

L’ordre, le rythme et les prérequis sont des hypothèses de travail. Ce document ne déclare pas une progression validée par les sources citées. Les premières consonnes peuvent être travaillées avec les voyelles connues sans attendre toutes les difficultés du e ; les variantes écrites et les contextes sont introduits séparément.

## Inventaire proposé

La notation entre barres sert aux adultes qui relisent le contenu. Elle ne doit jamais être envoyée comme texte à une synthèse vocale. Les mots sont des supports de vérification du son, pas des enregistrements de remplacement du phonème isolé.

| Graphème de départ | Valeur proposée | Exemples pour la relecture | Étape éditoriale | Attention |
| --- | --- | --- | --- | --- |
| a | /a/ | ami, papa | Consolider a, i, o et u | Exemples à relire. |
| i | /i/ | ici, midi | Consolider a, i, o et u | Exemples à relire. |
| o | /o/ | vélo, moto | Consolider a, i, o et u | Prévoir séparément la variation ouverte /ɔ/ et ses contextes ; o n’a pas une prononciation unique. |
| u | /y/ | lune, tutu | Consolider a, i, o et u | Le symbole phonétique /y/ ne désigne pas le nom de la lettre y. |
| é | /e/ | été, bébé | Préparer é, è et e | Exemples à relire. |
| è | /ɛ/ | père, mère | Préparer é, è et e | Exemples à relire. |
| e | /ə/ | le, cheval | Préparer é, è et e | Le schwa peut ne pas être prononcé selon le contexte et la variété de français ; choix des exemples à vérifier. |
| l | /l/ | lune, lama | Premier pilote de consonnes : l, r, f et j | Exemples à relire. |
| r | /ʁ/ | rue, radis | Premier pilote de consonnes : l, r, f et j | Prévoir les variations de réalisation ; ne pas pénaliser une variété de français. |
| f | /f/ | fée, farine | Premier pilote de consonnes : l, r, f et j | Exemples à relire. |
| j | /ʒ/ | jupe, joli | Premier pilote de consonnes : l, r, f et j | Le nom ji ne remplace pas le phonème. |
| m | /m/ | moto, maman | Étendre à m, n, v et s | Exemples à relire. |
| n | /n/ | niche, navire | Étendre à m, n, v et s | Exemples à relire. |
| v | /v/ | vélo, valise | Étendre à m, n, v et s | Exemples à relire. |
| s | /s/ | sac, sapin | Étendre à m, n, v et s | Le s entre voyelles et les autres graphies du son sont des contextes distincts, à introduire ensuite. |
| p | /p/ | papa, papi | Introduire p, t, b, d, k et g | Consonne brève : ne pas ajouter de voyelle et ne pas prolonger artificiellement. |
| t | /t/ | tapis, toupie | Introduire p, t, b, d, k et g | Consonne brève : ne pas ajouter de voyelle. |
| b | /b/ | bébé, bateau | Introduire p, t, b, d, k et g | Le nom bé ne remplace pas le phonème. |
| d | /d/ | dodo, dé | Introduire p, t, b, d, k et g | Le nom dé ne remplace pas le phonème. |
| k | /k/ | kiwi, képi | Introduire p, t, b, d, k et g | Les graphies c et qu sont à enseigner ensuite, avec leur contexte. |
| g | /ɡ/ | gare, gomme | Introduire p, t, b, d, k et g | D’abord g devant a, o, u ; distinguer ensuite g devant e, i et le groupe gu. |
| z | /z/ | zéro, zébu | Préparer les autres sons et graphèmes | Exemples à relire. |
| ch | /ʃ/ | chat, cheval | Préparer les autres sons et graphèmes | Groupe de lettres fréquent ; les exceptions sont hors du premier pilote. |
| gn | /ɲ/ | agneau, montagne | Préparer les autres sons et graphèmes | Exemples à relire. |
| ou | /u/ | roue, mouton | Préparer les autres sons et graphèmes | Exemples à relire. |
| on | /ɔ̃/ | ballon, mouton | Préparer les autres sons et graphèmes | Exemples à relire. |
| an | /ɑ̃/ | maman, pantalon | Préparer les autres sons et graphèmes | Exemples à relire. |
| in | /ɛ̃/ | lapin, sapin | Préparer les autres sons et graphèmes | Exemples à relire. |
| un | /œ̃/ | un, brun | Préparer les autres sons et graphèmes | La distinction avec /ɛ̃/ varie selon les locuteurs ; ne pas en faire un critère de difficulté sans relecture. |
| eu | /ø/ | feu, jeu | Préparer les autres sons et graphèmes | La valeur /œ/ dans d’autres mots doit être distinguée. |
| oi | /wa/ | oiseau, voiture | Préparer les autres sons et graphèmes | Séquence de sons : ne pas la présenter comme un phonème unique. |

## Pourquoi « toutes les lettres » ne signifie pas 26 sons

Le nom de la lettre appartient à Découvrir/Lettres. Le niveau Premiers sons travaille une correspondance écrite et orale. Les exemples bé pour b, effe pour f ou ji pour j ne doivent pas remplacer le phonème à entendre. Certaines lettres changent de valeur selon le contexte ; certains sons s’écrivent avec plusieurs lettres.

| Lettre | Traitement proposé | Point à expliciter avant activation |
| --- | --- | --- |
| a | Correspondance initiale proposée | Autres graphèmes contenant a à aborder séparément. |
| b | Correspondance initiale proposée | Son bref, différent du nom bé. |
| c | Contexte nécessaire | c devant a/o/u ; c devant e/i ; ç et ch à distinguer. |
| d | Correspondance initiale proposée | Son bref, différent du nom dé. |
| e | Contexte nécessaire | Selon accent, entourage et position ; e muet à distinguer. |
| f | Correspondance initiale proposée | ph sera une autre graphie, introduite ensuite. |
| g | Contexte nécessaire | g devant a/o/u ; g devant e/i ; gu à distinguer. |
| h | Contexte nécessaire | Pas de carte de phonème h isolé dans le premier parcours ; h muet/aspiré et groupes ch/ph à expliquer en contexte. |
| i | Correspondance initiale proposée | Les groupes de lettres et semi-voyelles nécessitent un autre contexte. |
| j | Correspondance initiale proposée | Son différent du nom ji. |
| k | Correspondance initiale proposée | Comparer plus tard les graphies k/c/qu. |
| l | Correspondance initiale proposée | Les groupes comme ill nécessitent un autre contexte. |
| m | Correspondance initiale proposée | Les voyelles nasales avec m se traitent séparément. |
| n | Correspondance initiale proposée | Les voyelles nasales avec n se traitent séparément. |
| o | Contexte nécessaire | Valeurs /o/ et /ɔ/ ; groupes on/ou/oi à distinguer. |
| p | Correspondance initiale proposée | Son bref ; lettres muettes et ph en contexte. |
| q | Contexte nécessaire | Enseigner notamment qu ; ne pas prononcer systématiquement q puis u. |
| r | Correspondance initiale proposée | Réalisation variable selon les locuteurs. |
| s | Contexte nécessaire | s initial et s entre voyelles ; ss et finales à distinguer. |
| t | Correspondance initiale proposée | Son bref ; tion et finales ne relèvent pas de la première étape. |
| u | Contexte nécessaire | Son /y/ puis groupes ou/gu/qu et semi-voyelles en contexte. |
| v | Correspondance initiale proposée | Distinguer le son du nom vé. |
| w | Contexte nécessaire | Son /v/ ou /w/ selon les mots ; Les deux valeurs doivent être présentées avec un mot contexte. |
| x | Contexte nécessaire | Souvent /ks/ ou /ɡz/, parfois muet ; pas un phonème unique à inventer. |
| y | Contexte nécessaire | Valeurs /i/ et /j/ selon les mots ; Les deux valeurs doivent être présentées avec un mot contexte. |
| z | Correspondance initiale proposée | Distinguer le son du nom zède et les finales muettes. |

Les valeurs /ɔ/ pour o, /œ/ pour eu et /w/ ou /j/ dans certains emplois de w et y ne sont pas des cartes déjà prêtes dans ce premier inventaire. Elles doivent être préparées avant les exercices correspondants. Les h muet ou aspiré, les lettres muettes et les groupes x/qu/ch ne sont pas traités comme des phonèmes isolés uniformes. La liste des 26 lettres est un suivi éditorial, pas une déclaration de couverture pédagogique achevée.

## Contrat audio

Chaque unité destinée au pilote nécessite un enregistrement français vérifié. Pour une consonne brève, ne pas fabriquer une syllabe comme beu/peu et ne pas prolonger artificiellement l’occlusion. Les variantes de français pertinentes sont à prendre en compte sans les noter comme des erreurs d’élève.

Le dossier cible prévu est /audio/sounds/fr-fr/. Aucun fichier fictif n’y est publié dans cet incrément. Les métadonnées restent en attente tant que les enregistrements n’existent pas. Aucun repli TTS vers un nom de consonne n’est autorisé dans le nouveau schéma. Les sources et les droits doivent être renseignés avant publication.

Écoutes à documenter : cible isolée, absence de voyelle ajoutée, qualité sans bruit gênant, niveau sonore cohérent, séparation avec Bravo, fonctionnement sur téléphone et tablette et possibilité de réécoute. L’audio doit être écouté par un relecteur compétent ; la présence d’un fichier et de métadonnées ne suffit pas.

## Expérience enfant à conserver lors de l’intégration

Le prochain pilote utilisera le même bouton Jouer, huit étapes, un grand haut-parleur et deux cartes. L’enfant n’aura pas à choisir une catégorie de phonèmes. Un exemple facultatif expliquera le geste ; la cible sera prononcée seule, puis la réussite sera suivie de la pause et de Bravo habituels.

La réécoute ne compte pas comme erreur ni aide ; une aide au contenu reste distinguée. Aucune proposition de réponse ne doit devenir ambiguë parce que deux graphèmes ont le même son. Les comparaisons f/v ou p/b seront introduites dans une étape spécifique après l’enseignement des deux correspondances, pas comme première rencontre avec un son. La pause, la maison et le choix manuel du niveau restent disponibles.

## Feuille de relecture du premier pilote

| Élément | Statut | Preuve attendue |
| --- | --- | --- |
| Choix l, r, f, j et prérequis | À relire | Avis pédagogique et modifications documentés |
| Deux propositions par essai | Contrôlé techniquement | Valeurs différentes ; réponse renseignée et positions équilibrées |
| Exemple et aide | Conception préparée | Relecture des consignes et essai sur un exemple distinct |
| Enregistrements et provenance | À produire | Fichiers et droits documentés |
| Prononciation | Non validée | Écoute et compte rendu du relecteur |
| Appareils | Non vérifié | Écoutes sur les appareils cibles |
| Activation du pilote | Non réalisée | Prérequis ci-dessus satisfaits, puis intégration en phase 3 |

## Prochaine livraison

Obtenir la relecture du pilote et ses enregistrements, corriger le contenu, puis intégrer seulement ce sous-ensemble en phase 3. Conserver les identifiants des anciens exercices et les missions sauvegardées. L’ajout de données préparatoires dans le dépôt ne modifie pas la partie en cours d’un enfant.

## Références

Le [CSEN sur l’apprentissage de la lecture](https://www.csen.education.gouv.fr/publications/faciliter-apprentissage-lecture-ecriture/) distingue lettres et phonèmes et souligne la prise en compte de la fréquence et de la régularité des correspondances. La [ressource Éduscol sur la relation graphème-phonème](https://eduscol.education.gouv.fr/sites/default/files/document/ev22-cp-frc-relation-grapheme-phonemepdf-95490.pdf) propose des repères pour analyser les difficultés et renvoie à une progression explicite. Ces références éclairent le travail ; elles ne valident pas nos listes, audios ou choix d’exercices.

## Avancement du 18 novembre 2026

Le lecteur de fichiers locaux est désormais intégré au jeu, sans activer de nouvelle question. Les tests vérifient notamment l’absence de substitution par un nom de lettre, l’attente du démarrage audio, la lecture sans TTS, les pannes, la reprise et l’annulation de Bravo. Le [kit de production](kit-enregistrement-pilote.md) décrit les quatre fichiers et les huit essais à relire. `npm run audit:sound-pilot` contrôle les métadonnées, les fichiers réels et leur empreinte ; `--export` est refusé si un élément manque. L’export prêt est un document de revue, pas une activation automatique. Les validations professionnelles et les écoutes réelles restent ouvertes.
