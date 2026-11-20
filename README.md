# Azyl.it

Projet d'application web éducative pour aider les enfants à apprendre à lire de manière ludique, inclusive et bienveillante.

**Domaine cible :** `www.azyl.it`

## État du projet

Une première version fonctionnelle est disponible : choix du compagnon et du parcours, missions de huit questions, aide guidée, encouragements audio, réglages de lecture, sauvegarde locale et reprise de mission. La version de recette contient 364 exercices sur sept paliers, répartis entre les quatre grands parcours. Les contenus restent à relire pédagogiquement.

## Lancer le projet

Prérequis : Node.js 18 ou supérieur. Aucune installation de dépendances n'est nécessaire.

```bash
npm run dev
```

Ouvrir `http://127.0.0.1:5173` dans un navigateur récent.

```bash
npm test          # Vérifications de la progression et des contenus
npm run build    # Génération du site statique dans dist/
npm run preview  # Prévisualisation du site construit
```

Le répertoire `dist/` peut être hébergé sur un service de fichiers statiques. Le serveur de développement reste réservé à l'usage local.

## Déployer sur Cloudflare Pages

Le code actuel peut être déployé directement sur Cloudflare Pages. La construction produit les fichiers statiques des jeux, les huit pages d’information pour les parents, enseignants, équipes ULIS et AESH, le sitemap, `robots.txt` et une page `404.html`. Aucun serveur Node.js en production, Pages Function ou secret d’API n’est nécessaire.

Dans Cloudflare, créer un projet **Pages** connecté à GitHub, puis utiliser les paramètres suivants :

| Paramètre | Valeur |
| --- | --- |
| Dépôt GitHub | `yoannlesouef/azylit` |
| Branche de production | `main` |
| Framework preset | `None` |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory | Laisser vide : racine du dépôt |
| Variable de production `SITE_URL` | `https://www.azyl.it` |
| Variable de production `INDEXABLE` | `true` (valeur par défaut) |

Node.js sert uniquement à construire le site. Utiliser une version LTS maintenue compatible avec le projet, par exemple Node.js 22. Ne pas utiliser `npm run dev` comme commande de construction et ne pas publier directement le dossier `app/` : les pages parents et les métadonnées sont générées dans `dist/`.

Après le premier déploiement, ouvrir l’adresse `<nom-du-projet>.pages.dev` fournie par Cloudflare et vérifier l’accueil, `/parents/`, les jeux et l’écoute des cartes.

### Associer `www.azyl.it`

1. Dans le projet Pages, ouvrir **Custom domains → Set up a domain**.
2. Ajouter `www.azyl.it`, puis suivre les instructions DNS de Cloudflare.
3. Si le DNS est géré ailleurs, créer un enregistrement **CNAME** nommé `www` vers `<nom-du-projet>.pages.dev`, en remplaçant le nom du projet par celui réellement attribué. Enregistrer d’abord le domaine dans Pages ; un CNAME seul ne suffit pas.
4. Attendre que le domaine soit actif et que le certificat HTTPS soit prêt, puis vérifier `https://www.azyl.it` et `https://www.azyl.it/parents/`.

Pour proposer aussi `azyl.it`, configurer une redirection permanente vers `https://www.azyl.it`, en conservant le chemin et les paramètres. L’ajout du domaine racine à Pages nécessite que la zone DNS soit gérée par Cloudflare ; le sous-domaine `www` peut utiliser un DNS externe.

Les URL canoniques et le sitemap utilisent déjà `https://www.azyl.it`. Les branches Cloudflare autres que `main` sont automatiquement désindexées. Si la branche de production porte un autre nom, renseigner `PRODUCTION_BRANCH`. `INDEXABLE=false` permet aussi de désindexer un aperçu hors Cloudflare ; conserver l’origine canonique de production. Les prochains pushs sur `main` déclenchent un nouveau déploiement lorsque l’intégration Git est activée.

La progression reste propre au navigateur et à l’origine du site : les données enregistrées sur localhost, sur `pages.dev` ou sur `azyl.it` ne sont pas automatiquement transférées à `www.azyl.it`. Les voix restent celles disponibles sur l’appareil de l’utilisateur.

Références : [déploiement HTML statique](https://developers.cloudflare.com/pages/framework-guides/deploy-anything/), [domaines personnalisés](https://developers.cloudflare.com/pages/configuration/custom-domains/), [gestion des routes et des erreurs 404](https://developers.cloudflare.com/pages/configuration/serving-pages/).

## Structure

- `app/` : interface, styles, contenus et gestion du profil local.
- `scripts/` : serveur local et construction du site.
- `tests/` : vérifications automatiques du profil, du positionnement et d'une mission complète.
- `.openai/hosting.json` : configuration de l'aperçu Sites.

## Limites de cette première version

- La progression reste dans le navigateur utilisé, sans synchronisation distante ni code avatar.
- La voix privilégie les voix françaises naturelles ou améliorées disponibles dans le navigateur, avec un débit ralenti par défaut (0,8), y compris pour les félicitations. Les réglages adultes proposent trois vitesses, un choix de voix françaises et une préécoute. Leur disponibilité et leur qualité dépendent de l’appareil ; les fichiers audio validés et les phonèmes isolés restent à produire. Une alternative sans écoute est proposée si la voix est indisponible ou coupée.
- Les questions sont des démonstrations à valider pédagogiquement. Les missions choisissent huit exercices au même palier (36, 48, 48, 68, 68, 48 et 48 exercices dans les sept paliers), en privilégiant ceux encore non réalisés puis les moins revus. Un accompagnement pédagogique adaptatif complet reste à développer.
- Le positionnement propose un parcours indicatif selon une règle de démonstration non étalonnée.
- Les exercices combinent choix de réponse, associations, constructions, phonologie sur des mots entiers, lecture flash, segmentation de phrases et remise en ordre chronologique. Une lecture peut être déclarée terminée, avec une mesure de durée facultative côté adulte ; cette durée ne mesure pas l’exactitude ou la fluence orale.
- Les réglages proposent les polices système, la taille, les espacements, l'interligne, la coloration des syllabes renseignées et un guide de lecture. Les options Andika, Lexend et OpenDyslexic utilisent les polices déjà installées, avec repli sans empattement ; leurs fichiers ne sont pas inclus. Les aides sur les lettres muettes et les sons complexes couvrent uniquement les mots explicitement annotés, hors discrimination.
- Le site ne charge aucun service tiers ni police distante.

Les paragraphes ci-dessous décrivent la cible du produit ; `spec.md` conserve la spécification complète.

## Objectifs

Azyl.it vise à couvrir les apprentissages de lecture du CP au CM2, en organisant les activités selon les compétences de l'enfant plutôt que sa classe. La couverture complète devra être démontrée par une matrice de compétences et validée pédagogiquement.

L'expérience est pensée pour les enfants avec ou sans troubles des apprentissages : dyslexie, dysorthographie, dysphasie, TDAH et déficience intellectuelle. La dyspraxie / TDC est prise en compte dans l'ergonomie motrice de l'interface. La dyscalculie est hors périmètre.

## Navigation pour les enfants non lecteurs

L’accueil présente le compagnon et un grand bouton de jeu. Les choix sont illustrés et annoncés oralement. Le triangle lance le jeu, la flèche fait avancer, la maison permet une pause, le haut-parleur répète les consignes et l’ampoule demande un indice. Les réglages proposent des échantillons visuels. La gestion des données reste dans une section adulte repliée.

Les six compagnons sont Lumi la licorne, Arthur le chevalier, Alma la princesse, Malo le pirate, Naya la sirène et Pico le dragon. Les anciens profils sont migrés sans effacer la progression.

Le guidage vocal nécessite une voix française disponible et le son activé. La première action sur Jouer ou le haut-parleur déclenche la narration ; une validation auprès d’enfants non lecteurs reste nécessaire.

## Expérience prévue

- Choix d'un compagnon illustré et d'un niveau valorisant, directement ou grâce à un mini-jeu de positionnement de deux minutes maximum.
- Missions de huit micro-exercices, d'une durée cible de quatre à six minutes, avec une progression visuelle claire.
- Un exercice à la fois en mode focus, avec des encouragements discrets et une célébration en fin de mission.
- Valorisation de l'effort, indices et aide guidée en cas de difficulté, sans perte de points ni de récompenses.
- Consignes et feedbacks vocalisés et rejouables, avec une commande audio accessible sur tous les écrans.

Pendant les exercices, les réponses sont prioritaires ; après une réussite, elles deviennent statiques et une seule grande flèche permet de continuer. Les outils restent dans des zones secondaires.

Les retours sont visuels et oraux : compagnon, étoile et coche en cas de réussite ; symbole de nouvelle tentative et mise en évidence du modèle en cas d’erreur. Les messages de félicitation et les indices ne nécessitent aucune lecture.

## Premiers pas

Le parcours débutant démarre par une lettre isolée à retrouver parmi deux choix. Il propose quatre petites étapes séparées : reconnaissance des lettres, sons des voyelles, syllabes simples, puis assemblage de deux syllabes. Chaque étape possède une mission de huit questions ; la difficulté ne monte pas pendant la mission.

Le choix se fait dans un sélecteur visuel accessible par le pictogramme moins / plus : un aperçu du jeu, deux boutons pour rendre le jeu plus facile ou plus difficile et une maison pour valider et revenir à l’accueil. Le choix du compagnon se termine lui aussi par un retour à l’accueil ; Jouer lance ensuite la mission. Une étape suivante peut être proposée après deux missions consécutives avec au moins sept réponses autonomes sur huit ; l’enfant reste libre de refaire la même étape. Une réponse avec indice ou exercice de remplacement ne compte pas comme autonome. Cette règle de démonstration reste à valider pédagogiquement.

Le positionnement s’arrête dès la première difficulté et ne propose jamais directement les niveaux de syntaxe ou de compréhension avancée. Il reste indicatif.

## Parcours de lecture

| Niveau | Compétences travaillées |
| --- | --- |
| Apprenti Décodeur | Conscience phonologique, correspondances graphème-phonème, fusion syllabique et discrimination de sons ou lettres proches |
| Explorateur de Phrases | Reconnaissance de mots, fluence et segmentation de phrases |
| Détective des Mots | Accords, familles de mots, préfixes et suffixes |
| Maître des Histoires | Compréhension, chronologie, substituts et inférences |

## Accessibilité et protection des données

Les exigences prévoient des polices lisibles, des espacements ajustables, des aides visuelles sur les corpus de lecture et une règle de lecture. Les aides susceptibles de révéler une réponse sont désactivées dans les exercices concernés.

Les interactions utilisent de grandes cibles espacées, le clic ou le tap et la navigation au clavier, sans glisser-déposer fin obligatoire. La musique de fond est bannie pendant la lecture et la réflexion.

La persistance prévue repose sur une sauvegarde locale immédiate et une synchronisation par code avatar à quatre chiffres, sans compte nominatif ni collecte de nom, prénom ou adresse e-mail. Les exigences de protection des données des mineurs sont décrites dans la spécification.

## Documents de référence

- [Plan d’amélioration](docs/plan-amelioration.md) : lots prioritaires, simplicité du parcours enfant, couverture des objectifs et critères de validation.

- [description.md](description.md) : vision du projet, besoins et exigences initiales.
- [spec.md](spec.md) : spécification fonctionnelle et technique, parcours, accessibilité, catalogue d'exercices et critères de couverture pédagogique.

Avant toute implémentation, consulter ces deux documents. Les technologies présentées dans la spécification sont des recommandations ; la stack finale reste à arrêter lors du développement.


## Informations pour les parents et référencement

L’espace `/parents/` comprend la présentation du projet, la démarche, l’accessibilité, les données locales et une FAQ. Les liens Parents et Enseignants sont regroupés dans une navigation adulte discrète de l’accueil, séparée des commandes audio et des réglages. La phrase près du logo ouvre aussi l’espace parents. Ces liens disparaissent pendant les exercices, Découvrir et les choix du compagnon ou du niveau.

Les pages sont générées en HTML complet, sans JavaScript nécessaire, à partir de `content/parents.mjs`. La construction ajoute titres et descriptions distincts, URL canoniques, métadonnées de partage, données structurées cohérentes avec la FAQ visible, sitemap et robots.txt. Le serveur de développement expose les mêmes pages.

L’origine canonique vaut `https://www.azyl.it` par défaut. Pour une autre origine publique :

```bash
SITE_URL=https://exemple.fr npm run build
```

Pour un aperçu à ne pas indexer :

```bash
SITE_URL=https://preview.exemple.fr INDEXABLE=false npm run build
```

Les tests de référencement vérifient les pages, les liens, les métadonnées et le JSON-LD. La publication sur le domaine, le contrôle des réponses de l’hébergeur, la validation visuelle, la configuration des outils propriétaires des moteurs et le suivi d’indexation restent nécessaires. Le GEO repose sur des contenus accessibles, clairs et vérifiables ; aucune indexation, citation IA ou position n’est garantie.

Le bouton « Mon niveau » indique le niveau sélectionné. La page « Choisis ton niveau » affiche ce niveau, un aperçu et une flèche de retour à l’écran précédent, sans démarrer une mission. Le compagnon et le grand bouton Jouer restent prioritaires sur l’accueil.


## Jeux de cartes débutants

- Lettres : deux activités d’association par paires complètent les choix de réponse dans la mission de huit exercices.
- Syllabes : quatre activités permettent de poser deux lettres dans l’ordre pour former une syllabe, avec un modèle visible.
- Assemblage : huit activités construisent de vrais mots avec deux cartes syllabes, sans glisser-déposer. Les cartes identiques restent distinctes, par exemple les deux « pa » de « papa ».

Les assemblages gardent leur début correct après une erreur. Une flèche de retour retire la dernière carte avant de terminer. Les cartes posées, les associations trouvées et le recours à une aide sont conservés lors de la reprise d’une mission. Une activité entière compte pour une seule étoile, même si plusieurs cartes sont nécessaires. Les audios restent ceux du navigateur ; les enregistrements de phonèmes validés ne sont pas encore intégrés.


## Missions variées et historique local

Le catalogue contient 364 exercices : 36 exercices de lettres, 48 premiers sons, 48 syllabes, 68 assemblages, 68 mots et phrases, 48 secrets des mots et 48 histoires. Une mission garde huit exercices au palier choisi ; les nouvelles missions peuvent varier les mécaniques, tandis qu’une reprise conserve son plan exact. Les exercices non réalisés sont prioritaires, puis les moins revus ; le dernier plan proposé est aussi pris en compte si une mission a été abandonnée. Une fois les exemples parcourus, ils reviennent en révision, avec un ordre et des positions de réponses ou de cartes variés.

Le plan et ses mélanges sont sauvegardés avant de jouer : reprendre une mission conserve exactement les mêmes exercices, réponses et cartes. Une nouvelle mission fait une nouvelle sélection. La complexité ne change pas automatiquement.

Chaque exercice terminé ajoute un résultat daté (autonome ou accompagné, nombre d’erreurs ou recours à l’aide) à l’historique local, même si la mission est ensuite abandonnée. Aucun résultat n’est ajouté au simple lancement. Les 2 000 derniers résultats sont conservés ; les 40 plus récents sont visibles dans **Réglages → Pour les adultes → Historique des exercices**, avec un export JSON de l’historique conservé.

Les anciens compteurs sont préservés, mais les anciens résultats détaillés qui n’avaient pas été enregistrés ne peuvent pas être reconstitués. L’effacement du profil supprime aussi cet historique. Il reste propre à ce navigateur, sans synchronisation distante.


## Jouer sans choisir de groupe

L’enfant choisit son niveau puis touche Jouer, ou Continuer si une mission est en cours. Aucun numéro ni sélecteur de groupe n’apparaît. Les huit étapes restent visibles avec les étoiles et les exercices varient grâce à l’historique local.

Dans les premiers exercices, l’audio prononce uniquement la cible : nom de la lettre, voyelle, syllabe ou mot à assembler. Le lancement, la réécoute et le retour après erreur n’ajoutent aucune phrase autour de cette cible. Les aides visuelles et le compagnon restent disponibles. Les exercices avancés conservent leurs consignes nécessaires.

## Découvrir les lettres, les syllabes et les mots

Le bouton **Découvrir** de l’accueil ouvre un parcours libre distinct de **Jouer** : alphabet sonore (26 lettres et 18 formes complémentaires), des syllabes immédiatement visibles (ma, mi…), avec les autres séries dépliables au même endroit et des mots à écouter. Les lignes montrent des exemples de syllabes plutôt que des initiales isolées ; « on · ou » reste accessible sur sa propre ligne. Les 124 entrées de syllabes proposées renvoient à 697 mots distincts, avec au moins six mots par syllabe ; le segment associé est surligné. Une flèche permet de revenir à chaque étape.

**Écoute et trouve** propose un mot à entendre et trois mots écrits parmi lesquels le retrouver. Réécoute, essais sans pénalité, coche et nouveau mot sont disponibles. Cette exploration ne change ni la mission conservée ni l’historique des exercices.

Le catalogue est extensible et ne couvre pas toutes les syllabes du français. Les découpages et prononciations nécessitent une validation pédagogique et des essais avec les voix des appareils cibles. Les cartes de l’alphabet prononcent les noms des lettres, distincts de leurs sons dans les mots. La voix française dépend du navigateur ; une panne audio empêche de répondre au quiz jusqu’à une nouvelle écoute.

Dans « Écoute et trouve », le compagnon choisi apparaît après une réponse : cœur d’encouragement après une erreur, sourire et étoiles après réussite. Il reste petit et sans animation, puis disparaît au mot suivant pour laisser la place à l’écoute et aux choix.

L’[audit de navigation enfant](docs/audit-navigation-enfant.md) détaille les points à simplifier et les essais utilisateurs à prévoir.


### Navigation simplifiée

L’état sonore est visible avec un haut-parleur actif ou barré. Les lettres sont visibles dans un alphabet aéré ; les syllabes s’ouvrent directement sur une première série de cartes, les autres séries restant repliées sur la même page, sans pagination. Les mots restent présentés six par six. Aucun groupe n’est proposé à l’enfant. Les consignes d’accueil sont courtes. Les réglages enfant exposent la taille et l’espacement ; police, interligne et aides sont repliés dans la partie adulte.

Le bouton Retour du navigateur et les flèches internes retrouvent les écrans précédents pendant la visite, avec leurs pages de cartes et sélections. Les résultats ne sont jamais annulés par ce retour, et une mission terminée ou abandonnée n’est pas restaurée. Le rechargement revient à l’accueil avec la progression locale conservée. La validation auprès d’enfants et les vérifications visuelles sur appareils restent nécessaires.

Depuis un exercice, le bouton inférieur de « Choisis ton niveau » affiche un triangle et revient directement au jeu : le même niveau conserve la mission et sa position ; un niveau différent lance une nouvelle mission au niveau choisi. Depuis l’accueil, ce bouton conserve la maison et revient à l’accueil.

Le catalogue proposé dans Découvrir est limité aux syllabes disposant d’au moins six exemples distincts et explicitement associés. Les anciennes entrées sans suffisamment d’exemples ont été retirées de la liste enfant. Les mots restent affichés six par six ; certains sons ont plusieurs graphies, par exemple « noi » et « noy » dans « noyau », avec le segment réellement écrit surligné. Les exemples restent à valider pédagogiquement.

Dans Découvrir, les cartes composées d’une seule lettre sont réservées à la rubrique Lettres. La liste Syllabes présente uniquement des cartes d’au moins deux lettres, chacune accompagnée d’au moins six mots. Ce choix organise la navigation enfant ; il ne constitue pas une définition linguistique de la syllabe.

Après une réussite dans les exercices de fondation, la voix répète la cible (lettre, syllabe ou mot), attend 450 ms après la fin de sa prononciation, puis dit « Bravo ! ». Cela vaut aussi pour la dernière réponse de la mission. Une navigation, une nouvelle écoute ou la coupure du son annule la félicitation en attente. Les consignes de lancement et de réessai restent limitées à la cible seule.

Dans les exercices de choix d’une syllabe, la réécoute utilise un grand pictogramme haut-parleur au côté du compagnon discret. L’ensemble forme un seul bouton, sans dépendre de la lecture d’un libellé et sans ajouter une seconde commande au même niveau.

Les « Bravo ! » utilisent quatre variations légères de hauteur et de débit, sans répétition immédiate de la même combinaison. La voix française et son volume restent identiques ; la prononciation des lettres, syllabes et mots conserve ses réglages habituels. La pause de 450 ms avant la félicitation et son annulation lors d’une navigation sont conservées. Le rendu émotionnel dépend des capacités de la voix du navigateur.

La navigation directe remplace les anciennes pages de lettres et de syllabes. Le catalogue inclut désormais on, in, au, oi, chi, gui, gé, ju, le, me, pe, re, se, te, ve, ge et son. Il reste non exhaustif ; voir le [suivi de couverture](docs/catalogue-syllabes.md). Les tests garantissent six mots distincts pour chaque entrée proposée et l’accès à toutes les entrées depuis les lignes dépliables.

Le grand haut-parleur est commun aux exercices de sons, de syllabes et d’assemblage. En cas d’erreur de synthèse vocale signalée par le navigateur, les réponses nécessitant l’écoute sont retirées jusqu’à une réécoute, avec accès à un exercice alternatif sans écoute. Réessayer le son ne compte ni comme erreur ni comme aide pédagogique. Le niveau Syllabes contient 40 exercices couvrant 32 syllabes simples, dont 24 nouvelles syllabes consonne-voyelle. Chaque mission conserve quatre choix de réponse et quatre constructions de lettres.

La page publique `/enseignants/` présente les usages d’entraînement en classe, une proposition de séance, les limites de l’historique local et les fonctions prévues dans le plan. Elle est liée depuis la navigation adulte, incluse au sitemap et dispose de métadonnées et d’une FAQ spécifiques. Le volet enseignant reste facultatif : aucun compte, choix de séance ou accord adulte n’est requis pour jouer et progresser.

Le parcours pilote Syllabes propose une démonstration facultative depuis l’ampoule avec un exemple distinct. Le bouton pause conserve la place ; la maison garde son rôle d’arrêt. La reprise conserve les aides et ne compte pas deux fois une réussite. Le [plan d’amélioration](docs/plan-amelioration.md) indique les statuts de chaque phase. La [matrice de compétences](docs/matrice-competences.md), encore non validée professionnellement, est contrôlée par `npm run audit:coverage` ; elle ne produit aucun score élève.

La navigation adulte commence par Parents, Enseignants, ULIS et AESH, puis Notre démarche, Accessibilité, Données et Questions. Les pages communes sont à la racine du site. Les anciennes adresses sous `/parents/` redirigent en 301 vers les nouvelles ; la construction génère un fichier `_redirects` pour Cloudflare Pages et met à jour les URL canoniques, les liens et le sitemap. L’en-tête enfant distingue les informations adultes des commandes de jeu ; les liens adultes sont absents des écrans de travail et de choix.

L’[audit SEO / GEO / AEO](docs/audit-seo-geo-aeo.md) recense les corrections et les contrôles de production restant à faire. Les pages adultes disposent de titres descriptifs, sources, sommaires, FAQ cohérentes et aperçus de partage. Les prévisualisations sont exclues de l’index via métadonnées et `_headers`, avec un sitemap sans URL. Aucun positionnement ni citation dans un moteur de réponse n’est garanti.

### Préparation du niveau Premiers sons

Le [parcours proposé](docs/parcours-premiers-sons.md) documente 37 unités sonores et les 26 lettres, avec un premier pilote éditorial sur l, r, f et j. Les données sont dans `content/sound-curriculum.mjs` ; elles ne sont pas utilisées par le jeu tant que contenus et enregistrements ne sont pas relus. `npm run audit:sounds` recense les éléments prêts et manquants ; `node scripts/audit-sounds.mjs --require-ready` retourne un échec lorsque des unités ne disposent pas des métadonnées requises et d’un fichier présent. La vérification technique ne remplace pas une écoute compétente. Les correspondances vocaliques jouables restent a, i, o et u ; d’autres jeux de phonologie utilisent maintenant des mots entiers, sans faire passer le nom d’une lettre pour son phonème.

Le lecteur des futurs sons enregistrés est intégré : MP3 local, pas de repli vers un nom de lettre, réponses après démarrage audio, arrêt et erreurs pris en charge. Aucun nouveau phonème n’est encore activé. Le [kit de production du pilote](docs/kit-enregistrement-pilote.md) décrit les quatre fichiers l/r/f/j et les relectures nécessaires. `npm run audit:sound-pilot` contrôle les fichiers et leur empreinte ; ajouter `-- --export` pour produire un export de revue uniquement lorsque toutes les conditions sont réunies. Cet export ne modifie pas le jeu.

Les pages `/ulis/` et `/aesh/` présentent les usages d’entraînement et d’accompagnement, les problèmes d’accès auxquels les commandes cherchent à répondre et les limites du prototype. Elles citent des ressources institutionnelles, disposent de FAQ visibles et structurées et sont reliées aux autres pages adultes. Aucun mode handicap, compte professionnel ou nouvel accès ne s’ajoute au parcours enfant. Dans les exercices, maison et pause sont à gauche ; son et réglages restent à droite, les réglages étant toujours la dernière commande.

Naya et Pico possèdent les mêmes états discrets de guidage, d’encouragement et de joie que les autres compagnons, y compris dans Découvrir. Le choix affiche les six cartes, sur trois colonnes sur grand écran et deux sur petit écran, et conserve la mission et les résultats existants.

La [couverture complète préparée](docs/couverture-premiers-sons.md) contient 104 essais non activés : sons et mots en contexte, avec suivi des 26 lettres. `npm run audit:sound-coverage` détaille les manques ; `npm run audit:sound-coverage -- --export` refuse de produire un dossier de revue si un audio ou une relecture manque. Aucun export ne modifie la banque du jeu. Les enregistrements restent à produire avant de finaliser la couverture jouable.

Dans Découvrir/Syllabes, l’écran d’index est supprimé : une série est ouverte d’emblée et une seule peut être dépliée à la fois. Toucher une syllabe l’écoute et affiche ses six mots. Sur la page des mots, les syllabes de la même série restent accessibles pour changer de cible en un clic, sans retour intermédiaire. Le haut-parleur identifie la syllabe sélectionnée et permet de la réécouter. Le retour retrouve la dernière syllabe et sa ligne ouverte, y compris avec l’historique du navigateur.


## Voix ralentie et bilan adulte — 19 novembre 2026

Suite au retour des enfants sur une voix trop rapide et robotique, le débit par défaut passe de 0,97 à 0,8. Les voix françaises annoncées comme naturelles, neuronales ou améliorées sont privilégiées avant les voix compactes. Le nom de voix est un indice de sélection, pas une preuve de qualité ou d’âge. Le site ne transforme pas une voix adulte en voix d’enfant en montant artificiellement sa hauteur. Les cibles restent à leur hauteur d’origine ; les quatre Bravo gardent de petites variations et suivent le rythme choisi.

Dans **Réglages → Pour les adultes → Voix et rythme**, choisir et écouter une voix disponible, puis régler le débit (0,7 / 0,8 / 0,9). Le choix est conservé sur cet appareil ; si la voix disparaît, une autre voix française est utilisée sans effacer la préférence. Les voix qui arrivent après l’ouverture du dialogue actualisent la liste. Le chargement vocal attend une voix française plutôt que de démarrer sur une liste anglaise provisoire. Aucun nouveau bouton n’est ajouté à l’exercice.

Dans **Réglages → Pour les adultes → Historique des exercices**, un bilan descriptif regroupe l’historique encore conservé par objectif travaillé : réponses sans aide supplémentaire, avec aide ou nouvel essai, nombre d’exercices distincts et exemples à reprendre si utile. Il n’attribue aucun statut d’acquisition et ne change pas la progression. Les modèles visibles restent signalés dans les limites de chaque objectif. L’export JSON contient aussi ce bilan. Un appareil partagé mélange toujours les résultats ; aucun suivi individuel de classe n’est déduit.

Les audios enregistrés de consonnes et une voix d’enfant uniforme ne sont pas fournis par cet incrément. Les tests simulés ne remplacent pas une écoute avec les enfants sur leurs appareils. Voir [le retour et la recette d’écoute](docs/retours-enfants.md).

Références techniques : [vitesse de parole](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisUtterance/rate), [voix disponibles](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis/getVoices), [chargement des voix](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis/voiceschanged_event).


## Version de recette du plan — 19 novembre 2026

La [recette complète](docs/recette-complete.md) décrit les chemins pour essayer chaque jeu. Le [plan](docs/plan-amelioration.md) sépare développement livré, ressources manquantes et validations externes. La recette utilisateur et la relecture professionnelle ne sont pas déclarées réalisées.

- **Premiers apprentissages** : nouvelles comparaisons de débuts de mots, intrus, comptage de sons et de syllabes, formes proches et assemblages avec distracteur sans modèle écrit. Les comparaisons auditives portent sur des mots entiers ; aucun phonème de consonne n’est synthétisé à partir de son nom.
- **Parcours avancés** : huit lectures flash, huit phrases à segmenter, huit histoires à remettre en ordre et huit lectures déclarées terminées. Les corpus de mots, morphologie et compréhension sont enrichis. Le flash attend la fin de la consigne et peut fonctionner sans minuterie ; la réexposition est disponible.
- **Confort** : nombre de choix de la prochaine mission (2/3/4, avec minimum de trois pour les tâches qui le nécessitent), mouvement réduit, lettres muettes grisées et sons complexes soulignés sur les mots annotés seulement. Aucun diagnostic n’est demandé.
- **Enseignants** : 30 fiches éditoriales avec prérequis, exemples, erreurs possibles, aides et transfert hors écran. 29 objectifs permettent de préparer les huit exercices d’une prochaine mission. La mission en cours reste intacte ; changer manuellement de niveau annule la préparation. Aucun passage adulte n’est obligatoire pour jouer.
- **Suivi** : la lecture déclarée terminée est distincte d’une réponse évaluée. Sa durée facultative reste dans l’historique adulte, sans score de mots corrects par minute, classement ou compte à rebours. L’export JSON est au format version 2.

Après `npm test` et `npm run build`, `npm run audit:release` vérifie les imports distribués, la couverture et les effectifs. `npm run audit:release -- --require-audio` échoue tant que la couverture audio enregistrée reste incomplète. La première commande seule ne déclare donc pas les audios prêts.

**Restes identifiés** : fichiers de consonnes isolées et voix d’enfant enregistrée absents ; polices de confort non embarquées ; rendu navigateur, appareils, enfants et relecture professionnelle non vérifiés ici. Le catalogue de recette ne démontre pas une couverture pédagogique exhaustive du CP au CM2.


## Branchement des enregistrements — 20 novembre 2026

Le build et le serveur de développement génèrent `recorded-content.js` à partir des lots explicitement activés dans `content/audio-release.mjs`. Les trois lots (`pilot`, `coverage`, `voice`) restent désactivés : aucun vrai fichier n’a été fourni. Un lot demandé mais incomplet fait échouer le build avant de supprimer la précédente distribution.

Le pilote ajoute huit questions aux identifiants f1-17 à f1-24 ; la couverture complète utilise f1-201 à f1-304, sans collision avec les questions déjà livrées. Les fichiers et leurs relectures sont contrôlés avant de les intégrer. Les exercices phonémiques ne prennent jamais le nom d’une lettre comme repli TTS.

`content/voice-library.mjs` reçoit les prises de voix approuvées, avec leur texte exact, chemin local `/audio/voice/fr-fr/…mp3`, provenance, droits, relecteur, date et empreinte SHA-256. Plusieurs prises de « Bravo ! » peuvent partager le même texte ; elles alternent quand plusieurs fichiers sont disponibles. La voix enregistrée passe avant la synthèse pour les textes couverts ; un fichier de consigne ou de mot défaillant permet un repli de synthèse. Ce repli n’existe pas pour les phonèmes isolés. La vitesse de synthèse ne déforme pas les MP3 : produire ces fichiers directement au rythme souhaité.

Après production, relecture et écoute sur appareils : renseigner les métadonnées réelles, actualiser les effectifs et explications des pages publiques, activer le lot voulu, puis exécuter tests, build et audit de livraison avant le push. Les tests utilisent des octets synthétiques pour vérifier le mécanisme ; ils ne prouvent ni la jouabilité ni la qualité acoustique des fichiers.

La distribution actuelle contient **zéro nouvel enregistrement**. Cette intégration termine le branchement technique, pas la production de la voix ni la couverture audio.
