# Azyl.it

Projet d'application web éducative pour aider les enfants à apprendre à lire de manière ludique, inclusive et bienveillante.

**Domaine cible :** `www.azyl.it`

## État du projet

Une première version fonctionnelle est disponible : choix du compagnon et du parcours, missions de huit questions, aide guidée, encouragements audio, réglages de lecture, sauvegarde locale et reprise de mission. Le catalogue contient 112 questions de démonstration réparties entre les quatre parcours.

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

Le code actuel peut être déployé directement sur Cloudflare Pages. La construction produit les fichiers statiques des jeux, les cinq pages parents, le sitemap, `robots.txt` et une page `404.html`. Aucun serveur Node.js en production, Pages Function ou secret d’API n’est nécessaire.

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

Les URL canoniques et le sitemap utilisent déjà `https://www.azyl.it`. Pour les déploiements de prévisualisation, définir `INDEXABLE=false` dans l’environnement **Preview** ; conserver l’origine canonique de production. Les prochains pushs sur `main` déclenchent un nouveau déploiement lorsque l’intégration Git est activée.

La progression reste propre au navigateur et à l’origine du site : les données enregistrées sur localhost, sur `pages.dev` ou sur `azyl.it` ne sont pas automatiquement transférées à `www.azyl.it`. Les voix restent celles disponibles sur l’appareil de l’utilisateur.

Références : [déploiement HTML statique](https://developers.cloudflare.com/pages/framework-guides/deploy-anything/), [domaines personnalisés](https://developers.cloudflare.com/pages/configuration/custom-domains/), [gestion des routes et des erreurs 404](https://developers.cloudflare.com/pages/configuration/serving-pages/).

## Structure

- `app/` : interface, styles, contenus et gestion du profil local.
- `scripts/` : serveur local et construction du site.
- `tests/` : vérifications automatiques du profil, du positionnement et d'une mission complète.
- `.openai/hosting.json` : configuration de l'aperçu Sites.

## Limites de cette première version

- La progression reste dans le navigateur utilisé, sans synchronisation distante ni code avatar.
- La voix privilégie les voix françaises naturelles ou améliorées disponibles dans le navigateur, à un débit proche de la conversation. Leur disponibilité et leur qualité dépendent de l’appareil ; les fichiers audio validés et les phonèmes isolés restent à produire. Une alternative sans écoute est proposée si la voix est indisponible ou coupée.
- Les questions sont des démonstrations à valider pédagogiquement. Les missions choisissent huit exercices parmi seize au même palier, en privilégiant ceux encore non réalisés puis les moins revus. Un accompagnement pédagogique adaptatif complet reste à développer.
- Le positionnement propose un parcours indicatif selon une règle de démonstration non étalonnée.
- Les exercices combinent choix de réponse, association de lettres par paires, fusion de lettres et assemblage de syllabes par clics successifs. La lecture flash, la fluence chronométrée et les interactions de segmentation et de remise en ordre décrites dans la spécification restent à implémenter.
- Les réglages proposent les polices système, la taille, les espacements, l'interligne, la coloration des syllabes renseignées et un guide de lecture. Les polices Andika, Lexend et OpenDyslexic ainsi que les aides sur les lettres muettes et les graphèmes complexes restent à intégrer.
- Le site ne charge aucun service tiers ni police distante.

Les paragraphes ci-dessous décrivent la cible du produit ; `spec.md` conserve la spécification complète.

## Objectifs

Azyl.it vise à couvrir les apprentissages de lecture du CP au CM2, en organisant les activités selon les compétences de l'enfant plutôt que sa classe. La couverture complète devra être démontrée par une matrice de compétences et validée pédagogiquement.

L'expérience est pensée pour les enfants avec ou sans troubles des apprentissages : dyslexie, dysorthographie, dysphasie, TDAH et déficience intellectuelle. La dyspraxie / TDC est prise en compte dans l'ergonomie motrice de l'interface. La dyscalculie est hors périmètre.

## Navigation pour les enfants non lecteurs

L’accueil présente le compagnon et un grand bouton de jeu. Les choix sont illustrés et annoncés oralement. Le triangle lance le jeu, la flèche fait avancer, la maison permet une pause, le haut-parleur répète les consignes et l’ampoule demande un indice. Les réglages proposent des échantillons visuels. La gestion des données reste dans une section adulte repliée.

Les compagnons sont Lumi la licorne, Arthur le chevalier, Alma la princesse et Malo le pirate. Les anciens profils sont migrés sans effacer la progression.

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

Le choix se fait dans un sélecteur visuel accessible par le pictogramme moins / plus : un aperçu du jeu, deux boutons pour rendre le jeu plus facile ou plus difficile et un grand triangle pour démarrer. Ce sélecteur est aussi présenté après le choix du compagnon, sans menu de niveaux à lire. Une étape suivante peut être proposée après deux missions consécutives avec au moins sept réponses autonomes sur huit ; l’enfant reste libre de refaire la même étape. Une réponse avec indice ou exercice de remplacement ne compte pas comme autonome. Cette règle de démonstration reste à valider pédagogiquement.

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

- [description.md](description.md) : vision du projet, besoins et exigences initiales.
- [spec.md](spec.md) : spécification fonctionnelle et technique, parcours, accessibilité, catalogue d'exercices et critères de couverture pédagogique.

Avant toute implémentation, consulter ces deux documents. Les technologies présentées dans la spécification sont des recommandations ; la stack finale reste à arrêter lors du développement.


## Informations pour les parents et référencement

L’espace `/parents/` comprend la présentation du projet, la démarche, l’accessibilité, les données locales et une FAQ. Le lien est accessible dans l’en-tête près du son et de l’accessibilité ; la phrase près du logo ouvre aussi cet espace. Ces accès restent absents des écrans d’exercice.

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

Le bouton « Choisir la complexité » indique le niveau sélectionné. La page Complexité affiche ce niveau, un aperçu et une flèche de retour à l’écran précédent, sans démarrer une mission. Le compagnon et le grand bouton Jouer restent prioritaires sur l’accueil.


## Jeux de cartes débutants

- Lettres : deux activités d’association par paires complètent les choix de réponse dans la mission de huit exercices.
- Syllabes : quatre activités permettent de poser deux lettres dans l’ordre pour former une syllabe, avec un modèle visible.
- Assemblage : huit activités construisent de vrais mots avec deux cartes syllabes, sans glisser-déposer. Les cartes identiques restent distinctes, par exemple les deux « pa » de « papa ».

Les assemblages gardent leur début correct après une erreur. Une flèche de retour retire la dernière carte avant de terminer. Les cartes posées, les associations trouvées et le recours à une aide sont conservés lors de la reprise d’une mission. Une activité entière compte pour une seule étoile, même si plusieurs cartes sont nécessaires. Les audios restent ceux du navigateur ; les enregistrements de phonèmes validés ne sont pas encore intégrés.


## Missions variées et historique local

Le catalogue contient 112 activités, soit 16 pour chacune des sept positions de complexité. Une mission garde huit exercices et la répartition des mécaniques du palier choisi. Les exercices non réalisés sont prioritaires, puis les moins revus ; le dernier plan proposé est aussi pris en compte si une mission a été abandonnée. Une fois les exemples parcourus, ils reviennent en révision, avec un ordre et des positions de réponses ou de cartes variés.

Le plan et ses mélanges sont sauvegardés avant de jouer : reprendre une mission conserve exactement les mêmes exercices, réponses et cartes. Une nouvelle mission fait une nouvelle sélection. La complexité ne change pas automatiquement.

Chaque exercice terminé ajoute un résultat daté (autonome ou accompagné, nombre d’erreurs ou recours à l’aide) à l’historique local, même si la mission est ensuite abandonnée. Aucun résultat n’est ajouté au simple lancement. Les 2 000 derniers résultats sont conservés ; les 40 plus récents sont visibles dans **Réglages → Pour les adultes → Historique des exercices**, avec un export JSON de l’historique conservé.

Les anciens compteurs sont préservés, mais les anciens résultats détaillés qui n’avaient pas été enregistrés ne peuvent pas être reconstitués. L’effacement du profil supprime aussi cet historique. Il reste propre à ce navigateur, sans synchronisation distante.


## Retrouver un groupe de jeux

Le choix porte sur un groupe complet de huit exercices. « Groupe N » reste affiché pendant toute la séquence ; la voix donne directement les consignes, sans dire « activité » ni annoncer de numéro avant chaque exercice.

Depuis **Choisir la complexité → Choisir un groupe**, sélectionner **Nouveau groupe** ou la carte d’un groupe déjà proposé, puis toucher le triangle. Une coche indique les groupes terminés. Rejouer conserve le numéro, les huit exercices, leur ordre et les mélanges sauvegardés. Les groupes rejoués comptent comme des missions terminées, mais ne déclenchent pas de proposition de montée de niveau.

Les 200 derniers groupes sont conservés localement, en plus de l’historique détaillé des 2 000 derniers exercices. Les anciens groupes complets peuvent être récupérés à partir des huit résultats conservés, sans inventer leurs anciennes positions de réponses. Le sélecteur ne propose plus de révision d’un seul exercice.


## Découvrir les lettres, les syllabes et les mots

Le bouton **Découvrir** de l’accueil ouvre un parcours libre distinct de **Jouer** : alphabet sonore (26 lettres et 18 formes complémentaires), des syllabes présentées six par six, avec trois chemins de complexité et des mots à écouter. Les 272 entrées de syllabes renvoient à 218 mots ; le segment associé est surligné. Une flèche permet de revenir à chaque étape.

**Écoute et trouve** propose un mot à entendre et trois mots écrits parmi lesquels le retrouver. Réécoute, essais sans pénalité, coche et nouveau mot sont disponibles. Cette exploration ne change ni la mission conservée ni l’historique des exercices.

Le catalogue est extensible et ne couvre pas toutes les syllabes du français. Les découpages et prononciations nécessitent une validation pédagogique et des essais avec les voix des appareils cibles. Les cartes de l’alphabet prononcent les noms des lettres, distincts de leurs sons dans les mots. La voix française dépend du navigateur ; une panne audio empêche de répondre au quiz jusqu’à une nouvelle écoute.

Dans « Écoute et trouve », le compagnon choisi apparaît après une réponse : cœur d’encouragement après une erreur, sourire et étoiles après réussite. Il reste petit et sans animation, puis disparaît au mot suivant pour laisser la place à l’écoute et aux choix.
