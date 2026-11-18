# Couverture préparée des Premiers sons

Mise à jour : 18 novembre 2026.

**Non finalisée pour les enfants : le jeu conserve 16 exercices sur a/i/o/u.** Les 104 essais ci-dessous sont une préparation éditoriale, sans fichiers audio ni relecture réalisée. Les 37 unités ne constituent pas un inventaire exhaustif de toutes les graphies et exceptions du français. Les 26 lettres sont documentées ; cela ne signifie pas que chaque lettre possède un son isolé.

## Cibles à enregistrer

| Unité | Écriture | Valeur à discuter avec le relecteur | Contenu du fichier | État |
| --- | --- | --- | --- | --- |
| a | a | /a/ | Son isolé | À produire et relire |
| i | i | /i/ | Son isolé | À produire et relire |
| o | o | /o/ | Son isolé | À produire et relire |
| u | u | /y/ | Son isolé | À produire et relire |
| e-closed | é | /e/ | Son isolé | À produire et relire |
| e-open | è | /ɛ/ | Son isolé | À produire et relire |
| schwa | e | /ə/ | Mot : le | À produire et relire |
| l | l | /l/ | Son isolé | À produire et relire |
| r | r | /ʁ/ | Son isolé | À produire et relire |
| f | f | /f/ | Son isolé | À produire et relire |
| j | j | /ʒ/ | Son isolé | À produire et relire |
| m | m | /m/ | Son isolé | À produire et relire |
| n | n | /n/ | Son isolé | À produire et relire |
| v | v | /v/ | Son isolé | À produire et relire |
| s | s | /s/ | Son isolé | À produire et relire |
| p | p | /p/ | Son isolé | À produire et relire |
| t | t | /t/ | Son isolé | À produire et relire |
| b | b | /b/ | Son isolé | À produire et relire |
| d | d | /d/ | Son isolé | À produire et relire |
| k | k | /k/ | Son isolé | À produire et relire |
| g-hard | g | /ɡ/ | Son isolé | À produire et relire |
| z | z | /z/ | Son isolé | À produire et relire |
| ch | ch | /ʃ/ | Son isolé | À produire et relire |
| gn | gn | /ɲ/ | Son isolé | À produire et relire |
| ou | ou | /u/ | Son isolé | À produire et relire |
| on | on | /ɔ̃/ | Son isolé | À produire et relire |
| an | an | /ɑ̃/ | Son isolé | À produire et relire |
| in | in | /ɛ̃/ | Son isolé | À produire et relire |
| un | un | /œ̃/ | Son isolé | À produire et relire |
| eu | eu | /ø/ | Son isolé | À produire et relire |
| o-open | o | /ɔ/ | Mot : porte | À produire et relire |
| eu-open | eu | /œ/ | Mot : peur | À produire et relire |
| w-glide | w | /w/ | Mot : wapiti | À produire et relire |
| y-glide | y | /j/ | Mot : yaourt | À produire et relire |
| x-ks | x | /ks/ | Mot : taxi | À produire et relire |
| x-gz | x | /ɡz/ | Mot : examen | À produire et relire |
| oi | oi | /wa/ | Son isolé | À produire et relire |

Pour les mots en contexte, le fichier contient le mot entier. Il n'est jamais remplacé par l'audio du phonème isolé. Le fichier contient seulement la cible, sans introduction ni Bravo. Les deux positions de réponse représentent des variantes, pas deux apprentissages distincts.

## Lettres à traiter en contexte

Ces essais font reconnaître un **mot entendu parmi deux mots écrits**. Ils ne démontrent ni une lecture autonome ni l'acquisition de la valeur de la lettre à eux seuls. Ils sont préparés pour une introduction ultérieure, après les correspondances simples, et ne doivent pas être mélangés à la première séance du niveau.

| Lettre | Mot enregistré | Correspondance préparée | État |
| --- | --- | --- | --- |
| c | carotte | k | À produire et relire |
| c | citron | s | À produire et relire |
| g | gare | g-hard | À produire et relire |
| g | girafe | j | À produire et relire |
| q | quatre | k | À produire et relire |
| s | sac | s | À produire et relire |
| s | rose | z | À produire et relire |
| w | wagon | v | À produire et relire |
| w | wapiti | w-glide | À produire et relire |
| y | stylo | i | À produire et relire |
| y | yaourt | y-glide | À produire et relire |
| x | taxi | x-ks | À produire et relire |
| x | examen | x-gz | À produire et relire |
| h | hibou | Aucun son h isolé | À produire et relire |
| h | haricot | Aucun son h isolé | À produire et relire |

H ne reçoit aucun faux phonème. Les propositions pour h sont des mots à écouter ; elles ne permettent pas de déduire sa présence à l'écrit depuis un son. C/k/qu ou s/c ne sont pas opposés comme réponses à un même son isolé.

## Livraison encore nécessaire

1. Produire les fichiers de sons isolés et les fichiers distincts des mots en contexte dans app/audio/sounds/fr-fr/. Conserver les originaux et renseigner les droits de diffusion.
2. Faire écouter les cibles, les correspondances et les distracteurs. Renseigner les approbations réelles, le relecteur, la date et l'empreinte SHA-256 dans content/sound-curriculum.mjs et content/sound-exercises.mjs. Ne pas transformer des statuts en « approved » pour contourner les manques.
3. Vérifier les fichiers sur les appareils cibles. Le contrôle informatique des signatures et empreintes ne juge pas la prononciation ni la jouabilité réelle du MP3.
4. Exécuter npm run audit:sound-coverage. Avec --require-ready, la commande échoue si un élément manque ; avec --export, elle refuse un dossier incomplet. Un dossier prêt produit artifacts/sound-coverage.json pour revue, sans modifier le jeu.
5. Après revue, intégrer les questions par étapes pédagogiques, vérifier la sélection des missions, la reprise des anciens identifiants, la réécoute et la répétition avant Bravo. Tester le parcours avec de vrais fichiers, puis mettre à jour les effectifs et les explications publiques. Les questions de mots contextuels restent distinctes des premières correspondances son/écriture.

Aucun menu supplémentaire n'est prévu pour les enfants. Les sources pédagogiques et la distinction nom/son/contexte sont dans [le parcours proposé](parcours-premiers-sons.md). Le [kit pilote](kit-enregistrement-pilote.md) demeure disponible pour commencer par quatre consonnes.
