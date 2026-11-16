# Azyl.it

Projet d'application web éducative pour aider les enfants à apprendre à lire de manière ludique, inclusive et bienveillante.

**Domaine cible :** `www.azyl.it`

## État du projet

Une première version fonctionnelle est disponible : choix du compagnon et du parcours, missions de huit questions, aide guidée, encouragements audio, réglages de lecture, sauvegarde locale et reprise de mission. Le catalogue contient 56 questions de démonstration réparties entre les quatre parcours.

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

## Structure

- `app/` : interface, styles, contenus et gestion du profil local.
- `scripts/` : serveur local et construction du site.
- `tests/` : vérifications automatiques du profil, du positionnement et d'une mission complète.
- `.openai/hosting.json` : configuration de l'aperçu Sites.

## Limites de cette première version

- La progression reste dans le navigateur utilisé, sans synchronisation distante ni code avatar.
- La voix privilégie les voix françaises naturelles ou améliorées disponibles dans le navigateur, à un débit proche de la conversation. Leur disponibilité et leur qualité dépendent de l’appareil ; les fichiers audio validés et les phonèmes isolés restent à produire. Une alternative sans écoute est proposée si la voix est indisponible ou coupée.
- Les questions sont des démonstrations à valider pédagogiquement. Les missions réutilisent le même jeu de questions par parcours ; la sélection adaptative et le catalogue complet restent à développer.
- Le positionnement propose un parcours indicatif selon une règle de démonstration non étalonnée.
- Les exercices sont actuellement des choix multiples. La lecture flash, la fluence chronométrée et les interactions de segmentation et de remise en ordre décrites dans la spécification restent à implémenter.
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
