# Plan d’amélioration — Azyl.it

Document de travail du 17 novembre 2026. Référence : [objectifs initiaux](../description.md), [spécification actuelle](../spec.md), [audit de navigation](audit-navigation-enfant.md) et [couverture du catalogue](catalogue-syllabes.md).

## Statut des phases — suivi du 17 novembre 2026

| Phase | Statut | Avancée de cet incrément | Prochaine validation |
| --- | --- | --- | --- |
| 1 · Autonomie | **En cours — incrément pilote développé et testé** | Démonstration facultative via l’aide, pause/reprise, en-tête séparant informations adultes et commandes du jeu, tests du parcours syllabes | Rendu sur téléphone/tablette, clavier et essais avec enfants ; navigateur indisponible pendant cette session |
| 2 · Socle pédagogique et audio | **En cours — matrice et parcours Premiers sons préparés** | 29 objectifs définis et 180 exercices rattachés ; 31 unités sonores proposées, 26 lettres documentées, huit essais de conception sur l/r/f/j et contrat audio préparés ; aucun nouveau son activé | Relecture professionnelle du classement, des contenus et des prérequis ; audios validés à produire |
| 3 · Premiers apprentissages | **À démarrer dans ce plan** | Fonctions existantes conservées ; aucune nouvelle mécanique de ce lot livrée ici | Après le premier sous-ensemble relu de la phase 2 |
| 4 · Parcours avancés | **À démarrer** | QCM existants conservés | Après définition des compétences et des mécanismes prioritaires |
| 5 · Personnalisation et accompagnement enseignant | **À démarrer** | Réglages existants et information enseignants disponibles ; aucun nouveau bilan ou affectation | Relecture des critères et essais d’usage |
| 6 · Validation publique | **En cours — contrôles techniques uniquement** | Navigation publique, nouvelles URL racine, redirections 301, sitemap et liens testés ; ni évaluation terrain ni validation de conformité réalisée | Appareils, publics concernés et examen des flux de données |

Une phase n’est pas déclarée terminée tant que ses critères d’acceptation ne sont pas satisfaits. Chaque incrément technique terminé est enregistré et poussé sur GitHub ; les phases terminées feront également l’objet d’un push. Les tâches dépendant d’une validation professionnelle ou d’un essai utilisateur restent explicitement ouvertes.

Documents de suivi : [recette du parcours pilote](recette-parcours-syllabes.md), [première matrice de compétences](matrice-competences.md), [préparation du niveau Premiers sons](parcours-premiers-sons.md). Recalcul du rattachement : `npm run audit:coverage`.

## Résultat visé

Proposer un compagnon d’entraînement à la lecture, du premier repérage des lettres à la compréhension de textes, avec un parcours enfant stable et simple. Les compétences remplacent les classes scolaires dans l’interface. L’efficacité pédagogique et l’utilisabilité pour les publics concernés devront être évaluées ; elles ne sont pas établies par la présence de réglages ou par les tests logiciels.

La stratégie est de garder peu de commandes et de faire évoluer les contenus et les aides derrière une interface connue. Une nouvelle compétence ne doit pas imposer un nouveau menu.

## Point de départ

Le prototype comprend quatre compagnons, sept positions de niveau, des missions de huit exercices, une exploration libre, des consignes audio, des réglages et une sauvegarde locale. Il contient 180 exercices : 60 mots à assembler, 40 exercices couvrant 32 syllabes simples et 16 exercices dans chacun des cinq autres paliers. Découvrir propose 124 entrées de sons ou syllabes avec six mots par entrée, sans prétendre couvrir toutes les correspondances du français.

Le positionnement existe dans le code mais n’est pas proposé dans le parcours visible. Les mécanismes avancés sont surtout des QCM. Il n’existe pas encore d’évaluation auprès des enfants, de bibliothèque audio validée ou de couverture pédagogique démontrée du CP au CM2.

## Règles à conserver dans tous les lots

| Élément | Règle produit |
| --- | --- |
| Accueil | Jouer ou Continuer reste l’action dominante ; Découvrir reste séparé. Compagnon et niveau sont secondaires. |
| Navigation | Maison, retour, haut-parleur et aide gardent un rôle et un emplacement cohérents. Aucun groupe ni numéro de groupe. |
| Exercice | Une tâche à la fois. Deux choix pour commencer ; davantage seulement si la compétence le justifie et après observation. |
| Consignes | Une action courte, rejouable. Une démonstration visuelle pour une mécanique nouvelle, sans long tutoriel obligatoire. |
| Audio d’apprentissage | Lettre, son, syllabe ou mot seul quand c’est la cible. La félicitation reste séparée de sa prononciation. |
| Retours | Erreur sans punition ; aide graduée ; compagnon discret. Après réussite, une seule action centrale pour avancer. |
| Contrôle du rythme | Huit étapes visibles, aucune limite pour répondre. Pause ou arrêt toujours possible ; reprise du travail conservé lorsque l’enfant quitte temporairement le jeu. Le temps visé de quatre à six minutes est à mesurer, pas à imposer. |
| Motricité | Cibles principales d’au moins 64 px, espacées ; clic, tap, clavier. Pas de geste fin ni de glisser-déposer obligatoire. |
| Confort | Pas de musique continue pendant la lecture, pas d’animation pendant la réflexion. Réduction des mouvements respectée. |
| Paramètres | Quelques choix enfant, réglages détaillés et informations pédagogiques côté adulte. Aucun diagnostic demandé à l’enfant. |
| Exploration | Alphabet direct et recherche des syllabes par leur début ; mots par petites séries. Ne pas réintroduire de longues listes de syllabes ou de nombreuses flèches. |

Les valeurs de taille, nombre de choix et présentation sont des décisions produit initiales à vérifier sur appareils et avec les enfants, pas des garanties universelles d’accessibilité.

## Lot 1 — Autonomie et clarté, avant tout ajout de mécanique

**Statut : en cours.** Démonstration du choix de syllabes accessible depuis l’aide, sans passage obligatoire, et pause/reprise implémentées. Tests automatisés ajoutés ; rendu navigateur et essais avec enfants à faire. La demande d’aide est conservée comme accompagnement ; la démonstration n’ajoute pas de résultat.

Objectif : vérifier que l’enfant comprend quoi faire et peut retrouver son chemin.

Travaux :

- Observer les parcours existants sur téléphone et tablette : premier lancement, choix du compagnon, démarrage, réécoute, aide, changement de niveau, arrêt et reprise.
- Prévoir une courte démonstration au premier usage de chaque mécanique : une action illustrée, rejouable depuis l’aide. Ne pas révéler la réponse de l’exercice courant dans cette démonstration.
- Conserver les repères lors d’une navigation, replacer le focus sur la carte concernée et vérifier Retour/Avance du navigateur.
- Vérifier les erreurs audio, les voix indisponibles, le son coupé, la sauvegarde bloquée et les interruptions ; chaque situation doit offrir une suite compréhensible.
- Éviter qu’un changement de niveau fasse perdre du travail sans explication. Depuis un exercice, la validation mène directement au jeu ; depuis l’accueil, elle revient à l’accueil.
- Corriger les difficultés réellement observées avant d’ajouter des boutons ou de modifier à nouveau les listes.

Livrables : parcours de référence illustrés, scénarios de tests navigateur et compte rendu d’observation anonymisé.

Acceptation : aucune impasse connue sur les scénarios ; reprise conservée ; commandes utilisables au clavier et sur petit écran. Pour les essais, suivre les demandes d’aide et les erreurs de navigation séparément des erreurs de lecture. Un lancement en deux actions au maximum depuis l’accueil est une cible de conception, pas une condition imposée à l’enfant.

## Lot 2 — Fiabiliser le socle pédagogique et l’audio

**Statut : en cours, préparation.** Matrice éditoriale de 29 objectifs et 180 exercices rattachés. Parcours Premiers sons préparé avec 31 unités sonores, 26 lettres documentées, huit essais de conception sur l/r/f/j, prérequis, aides et contrat audio. Tests de cohérence et audit des métadonnées disponibles. Aucune relecture professionnelle ni production d’audios validés réalisée ; le jeu conserve ses quatre voyelles actuelles.

Objectif : rendre les contenus justes et cohérents avant de les multiplier.

Travaux :

- Construire une matrice de compétences et de prérequis couvrant tous les objectifs initiaux ; identifier les lacunes du corpus existant.
- Séparer les données du nom d’une lettre, du phonème, du graphème écrit et de la syllabe. Le rangement des cartes à deux lettres minimum est une règle de navigation ; il ne doit pas devenir une définition pédagogique erronée.
- Réviser les mots et les découpages avec un enseignant spécialisé ou un professionnel de la lecture. Privilégier le vocabulaire compréhensible et les correspondances déjà abordées.
- Réexaminer les listes de six mots : conserver l’objectif de six exemples utiles sans fabriquer des associations ou employer des mots très rares pour atteindre le quota. Une entrée insuffisamment documentée reste signalée comme à compléter dans la matrice adulte ; la lacune pédagogique ne doit pas disparaître du suivi.
- Compléter les correspondances courantes absentes et leurs contextes. Distinguer leur couverture pédagogique de la présence d’une carte dans Découvrir.
- Préparer des fichiers audio français vérifiés pour les phonèmes et les syllabes prioritaires. Prévoir un manifeste audio versionné et une lecture locale des fichiers ; conserver une solution de repli explicite.
- Séparer une erreur de reconnaissance, une aide demandée et un incident technique dans les résultats.

Livrables : matrice de couverture, schéma de contenu, premier corpus révisé et premier lot d’audios approuvés.

Acceptation : chaque contenu pilote a un objectif, un prérequis, une correction et une prononciation relus ; aucun son pédagogique n’est remplacé par le nom d’une lettre à son insu. Les anciens profils et exercices sauvegardés restent compatibles. Le rendu audio est vérifié sur les appareils cibles, au-delà des tests de code.

## Lot 3 — Compléter les premiers apprentissages

**Statut : à démarrer dans ce plan.**

Objectif : aller au-delà du repérage visuel et des syllabes simples.

Ajouter progressivement :

| Compétence | Interaction enfant | Aide prévue |
| --- | --- | --- |
| Repérer un son entendu | Écouter puis choisir entre deux mots illustrés | Réécoute distincte des exemples |
| Trouver un intrus sonore | Choisir l’image dont le mot diffère sur le son travaillé | Exemple guidé avant le jeu |
| Associer graphème et phonème | Écouter puis toucher une lettre ou un graphème | Modèle explicite après difficulté |
| Discriminer des sons proches | Comparer deux propositions avec une seule opposition pertinente | Réécoutes sans superposition |
| Fusionner puis segmenter | Poser ou séparer des cartes par clics | Étape courante matérialisée |
| Lire des mots décodables | Réutiliser les correspondances abordées dans de nouveaux mots | Aide ciblée, sans donner toute la réponse immédiatement |

La discrimination visuelle de lettres et la discrimination auditive de sons sont suivies comme deux compétences différentes. Les images sont vérifiées pour leur nom attendu et ne doivent pas rendre la réponse ambiguë.

Acceptation : chaque mécanique possède une démonstration courte, un usage au clavier, une réécoute et une aide ; une nouvelle série n’ajoute qu’une difficulté pédagogique identifiée. La banque varie les exemples avant de les remettre en révision.

## Lot 4 — Développer les parcours avancés

**Statut : à démarrer dans ce plan.**

Objectif : couvrir les axes demandés sans multiplier les types d’écrans.

| Axe initial | À développer | Simplicité conservée |
| --- | --- | --- |
| Reconnaissance et fluence | Mots-outils, présentation brève à durée ajustable, relecture de petits textes | Réécouter, recommencer, avancer ; aucune élimination |
| Lecture chronométrée bienveillante | Mesure facultative, activée côté adulte et masquable | Pas de compte à rebours ni de classement enfant ; pas de pénalité liée au temps |
| Segmentation | Séparer une phrase collée par des clics sur de grandes zones | Une phrase courte, annulation simple |
| Syntaxe et morphologie | Accords, familles, préfixes et suffixes dans des exemples variés | Choix de cartes connu et modèle après aide |
| Compréhension | Textes à trous, substituts, ordre chronologique et inférences | Court texte ou récit, une question à la fois |
| Chronologie | Choisir successivement les cartes de l’histoire | Pas de glisser-déposer obligatoire |

Pour la fluence, distinguer le temps d’interaction avec l’interface de la qualité de lecture. Ne pas déduire une maîtrise orale d’un clic rapide. La reconnaissance vocale automatique n’est pas un prérequis ; un retour d’adulte peut servir dans une modalité accompagnée. L’écoute d’un récit et la compréhension autonome d’un texte sont aussi distinguées dans le suivi.

Acceptation : chaque axe est relié à la matrice, avec plusieurs familles d’exemples, des règles de révision et des contenus relus. La couverture CP–CM2 n’est annoncée complète qu’après revue de l’ensemble des compétences, pas après atteinte d’un nombre global d’exercices.

## Lot 5 — Personnaliser par besoins, sans compliquer le choix enfant

**Statut : à démarrer dans ce plan.**

Objectif : adapter l’expérience avec peu de commandes visibles.

- Proposer côté adulte des réglages indépendants : nombre de choix, longueur des consignes, taille/espacement, mouvement, aide de lecture et quantité de contenu. Éviter un bouton générique « mode handicap » ou un profil rigide par diagnostic.
- Introduire les polices prévues comme options de confort et tester leur lisibilité ; ne pas les présenter comme un traitement.
- Ajouter lettres muettes et graphèmes complexes renseignés dans les contenus. Vérifier les aides de couleur, leur contraste et leur désactivation lorsqu’elles révéleraient la réponse.
- Vérifier la règle de lecture, la taille du texte et le zoom sans masquer les actions.
- Étendre le suivi des compétences : réussite autonome, aidée, répétitions et révision. Aucun changement automatique brutal de niveau ni interprétation diagnostique.
- Proposer une étape plus facile ou plus avancée avec un aperçu, en laissant l’enfant ou l’adulte décider.
- Garder le choix manuel. Ne rendre le positionnement visible qu’après validation de ses épreuves et recommandations ; il reste facultatif et interruptible.

Acceptation : les réglages persistent, se combinent sans casser les écrans et ne créent pas de réponses involontaires. Le prototype reste utilisable avec ses paramètres par défaut. Les critères de progression sont documentés et relus avant tout usage adaptatif.

## Lot 6 — Validation de la version publique et suivi adulte

**Statut : en cours, volet technique.** Pages adultes réorganisées, URL canoniques et sitemap mis à jour, anciennes adresses redirigées. Tests locaux réussis ; contrôle du déploiement public, essais terrain et examen des données encore à faire.

Objectif : une version testée et un positionnement honnête.

- Proposer un bilan adulte court par compétence, compréhensible sans données techniques, avec historique local et export. Pas de notes ni de classement sur l’écran enfant.
- Conserver la persistance locale sans compte comme fonctionnement de base. Le code avatar et la synchronisation restent une option distincte à concevoir seulement si le besoin multi-appareil est confirmé ; un code à quatre chiffres seul ne suffit pas à protéger des données distantes.
- Faire examiner les flux de données et les informations des parents avant d’ajouter statistiques distantes, microphone ou comptes. Prévoir suppression et conservation documentées. Une validation de conformité est distincte d’une fonctionnalité de sauvegarde.
- Vérifier navigation tactile et clavier, zoom, contraste, annonces d’état, focus, mouvements réduits et lecteurs d’écran sur les parcours compatibles.
- Tester les pages publiques, leurs liens, les erreurs 404 et les métadonnées sur le domaine déployé ; maintenir les informations parents à jour.
- Organiser plusieurs petites sessions d’observation avec des profils de besoins différents et un adulte référent. Consentement approprié, minimisation des données et possibilité d’arrêter à tout moment ; aucun enregistrement nominatif nécessaire au prototype.
- Mesurer les progrès d’utilisabilité et, dans un protocole distinct avec des professionnels, l’intérêt pédagogique. Ne pas présenter une facilité de navigation comme une preuve d’efficacité d’apprentissage.

Acceptation : anomalies bloquantes résolues, limites connues documentées, revue des données réalisée et retours utilisateurs pris en compte. L’ouverture du domaine ne suffit pas à déclarer une adaptation universelle ou une efficacité clinique.

## Volet enseignant — aider à choisir le prochain apprentissage

Ce volet est facultatif, dans un espace adulte séparé. Il ne conditionne jamais Jouer, Continuer, Découvrir, l’aide ou le choix du niveau à un compte, une affectation ou une validation d’enseignant. Aucun groupe à sélectionner, note, bilan technique ou planning n’apparaît dans le parcours enfant. Une proposition adulte de travail ne verrouille pas le parcours et n’empêche pas l’enfant de choisir une étape plus accessible. Aucun nouveau contrôle bloquant n’est ajouté au démarrage.

La boucle proposée est : **observer un besoin → choisir une compétence → entraîner → vérifier sur un nouvel exemple → ajuster**. Les traces d’entraînement aident l’enseignant à formuler une hypothèse ; elles ne remplacent pas son jugement ni une évaluation adaptée.

| Besoin enseignant | Disponible maintenant | Amélioration prévue et lot |
| --- | --- | --- |
| Choisir un travail pertinent | Choix manuel d’un niveau et aperçu | Matrice, prérequis et fiches par compétence : lot 2 |
| Préparer une courte séance | Missions de huit exercices et réglages adultes | Fiche objectif, exemples, erreurs possibles, aide et réinvestissement : lots 2–3 |
| Différencier sans stigmatiser | Niveau sans classe affichée, confort réglable | Sélection adulte d’une compétence et propositions facultatives conservant le même bouton Jouer : lots 3 et 5 |
| Comprendre une réussite | Historique local autonome/accompagné et tentatives | Bilan par compétence, distinguant aide, incident technique, tâche avec modèle et transfert : lots 5–6 |
| Décider de la suite | Observation de l’élève et changement manuel | Pistes explicites à confirmer : réexpliquer, réviser, essayer un autre exemple ; jamais de diagnostic automatique : lots 2 et 5 |
| Relier entraînement et classe | L’enseignant choisit lui-même une tâche hors écran | Pistes d’activités orales, de manipulation et de lecture contextualisée : lots 2–4 |

Une fiche prévue précise : compétence, prérequis, ce que la tâche permet réellement d’observer, mots et correspondances nécessaires, réglages possibles, erreurs fréquentes, aide graduée et exemple de transfert hors écran. Sa validation professionnelle est visible côté adulte.

Exemple : si l’élève hésite entre ma et mi, l’enseignant vérifie d’abord s’il a entendu la cible et compris le geste. Il peut ensuite proposer un entraînement ciblé, puis un nouvel exemple sans le modèle. La réussite par reproduction du modèle ne prouve pas à elle seule le décodage. L’enfant n’a pas à lire la fiche ni à sélectionner un objectif pédagogique.

Le prototype ne gère qu’un profil par navigateur. Plusieurs élèves sur le même profil mélangent leurs traces ; aucun bilan ne doit être présenté comme individuel dans cette situation. Une éventuelle gestion multi-élèves doit être conçue séparément, avec examen des données et validation du besoin, sans imposer de connexion aux usages autonomes existants.

Acceptation du volet : un enfant sans configuration enseignante peut toujours commencer et reprendre ; les propositions adultes ne bloquent pas les aides ou le changement de niveau ; aucune information enseignant n’est injectée dans l’exercice. L’enseignant peut distinguer ce qui est réellement disponible de ce qui reste prévu, et interpréter les résultats sans en faire une note ou un diagnostic.

La page publique [/enseignants/](https://www.azyl.it/enseignants/) explique les usages, les limites et le plan. Son contenu doit rester cohérent avec les fonctions livrées. Elle est accessible depuis les pages d’information adultes, sans bouton supplémentaire sur l’accueil enfant.

## Traçabilité des objectifs initiaux

| Exigence de description.md | Lot principal | Preuve attendue |
| --- | --- | --- |
| Site clair et ludique, compagnon au choix | 1 | Observation des choix et du démarrage |
| Autonomie sans lecture, consignes rejouables | 1–2 | Parcours observé et audios vérifiés |
| Départ avant la reconnaissance des lettres | 2–3 | Prérequis et progression du corpus relus |
| Exercices couvrant CP–CM2 sans classes affichées | 2–4 | Matrice de couverture complète et contenus associés |
| Phonologie, décodage et sons proches | 3 | Exercices distincts, exemples et aides validés |
| Reconnaissance et fluence | 4 | Interactions opérationnelles et mesure pertinente |
| Syntaxe et morphologie | 4 | Corpus varié et corrections relues |
| Compréhension, chronologie et inférences | 4 | Interactions et textes relus |
| Besoins Dys, TDAH, langage, cognition et motricité | 1–6 | Réglages par besoins et essais avec les publics concernés |
| Huit étapes, durée raisonnable, encouragements discrets | 1 et 6 | Observation du rythme, des pauses et des retours |
| Aides de lecture sans fuite de réponse | 5 | Tests de contenu et d’affichage par exercice |
| Choix du niveau ou positionnement | 1 et 5 | Choix manuel conservé ; positionnement facultatif validé |
| Sauvegarde sans compte nominatif | 6 | Reprise, export et suppression testés |
| Information et protection des données des mineurs | 6 | Flux documentés et examen dédié |

## Ordre de livraison et conditions de passage

1. **Autonomie** : lot 1, puis correction des obstacles observés.
2. **Socle fiable** : lot 2, avec un premier sous-ensemble révisé avant généralisation.
3. **Premiers apprentissages** : lot 3 ; les validations utilisateur continuent après chaque mécanique.
4. **Couverture avancée** : lot 4, axe par axe. Le travail de confort du lot 5 peut commencer en parallèle après les premiers essais.
5. **Version évaluée** : finalisation des lots 5 et 6, avec validation sur appareils et auprès des publics concernés.

Les contrôles de données, d’accessibilité et de non-régression commencent dès le premier lot ; ils ne sont pas reportés à la fin. Pas de calendrier ferme avant estimation du corpus et disponibilité des professionnels, des voix et des participants.

Chaque élément du suivi distingue trois états : **implémenté**, **relu par un professionnel**, **observé auprès des utilisateurs**. Le succès technique ne fait pas passer automatiquement aux autres états. Les critères d’efficacité pédagogique demandent une évaluation distincte.

## Prochain incrément concret

Commencer par un seul parcours : **Accueil → Jouer → syllabe entendue → choix → aide ou réussite → suivant → pause/reprise**. Décrire le comportement attendu, ajouter une démonstration non verbale et vérifier son usage sur téléphone et tablette. Préparer simultanément la matrice et un petit lot d’audios pour les sons et syllabes de ce parcours. Livrer ce sous-ensemble avant d’étendre toutes les banques.

## Références de conception

Les recommandations de repères familiers et cohérents s’appuient sur le [W3C — comprendre les commandes et leur usage](https://www.w3.org/WAI/WCAG2/supplemental/objectives/o1-understandable/) ; la décomposition des actions s’appuie sur le [W3C — consignes étape par étape](https://www.w3.org/WAI/WCAG2/supplemental/patterns/o4p07-step-instructions/). Ce sont des ressources de conception ; les citer n’établit pas une conformité du site.

Le choix de structurer les contenus par correspondances et prérequis est éclairé par le [CSEN — faciliter l’apprentissage de la lecture et de l’écriture](https://www.csen.education.gouv.fr/publications/faciliter-apprentissage-lecture-ecriture/). La distinction entre décodage et compréhension est explicitée par le [CSEN — enseigner la lecture](https://www.csen.education.gouv.fr/enseigner-la-lecture-pourquoi-et-comment-ca-marche/). Ces références n’attestent pas la validation de nos contenus.

Pour le volet enseignant : [CSEN — Évaluer pour mieux aider](https://www.csen.education.gouv.fr/evaluer-pour-mieux-aider/), qui relie l’identification des besoins à l’ajustement de l’intervention pédagogique. Il ne s’agit pas d’une validation d’Azyl.it.

## Journal des incréments

- 17 novembre 2026 — Phase 1 : démonstration facultative de la sélection de syllabes via l’ampoule ; exemple distinct de la question, sans résultat attribué. Ajout d’une pause qui conserve la place, tandis que la maison continue d’arrêter. Tests de l’aide, de la reprise après rechargement et de l’absence de double résultat. Vérification visuelle et observations externes encore à réaliser.
- 17 novembre 2026 — Phase 2 : première matrice de compétences et prérequis, rapport reproductible de couverture et fiche pilote. Les tâches guidées sont distinguées de la lecture autonome ; les objectifs sans exercices restent visibles. Statuts professionnels et utilisateurs : en attente pour tous les objectifs.

- 17 novembre 2026 — Phases 1 et 6 : en-tête d’accueil avec liens Parents et Enseignants séparés des commandes enfant, sans liens adultes pendant les écrans de choix ou de travail. Navigation des pages adultes ordonnée par public puis par sujet ; pages communes déplacées à la racine, redirections 301 générées pour les anciennes URL, liens/canoniques/sitemap actualisés et testés. Vérification visuelle et déploiement public non vérifiés dans cette session.

- 17 novembre 2026 — Phase 6, audit SEO/GEO/AEO : titres et résumés précisés, sommaires et sources visibles, métadonnées de partage avec image, dates éditoriales et FAQ liées à leurs réponses. Prévisualisations Cloudflare en noindex automatique avec en-tête et sitemap cohérents. Contrôles techniques locaux réussis ; accès au domaine public, indexation et visibilité dans les moteurs non vérifiés. Voir audit-seo-geo-aeo.md.
- 17 novembre 2026 — Phase 2 : intitulé « Premiers sons » et FAQ explicitant la couverture a/i/o/u. Les consonnes et autres correspondances restent à développer avec des audios vérifiés ; aucun remplacement du phonème par le nom de lettre n’a été introduit.

- 17 novembre 2026 — Phase 2, niveau Premiers sons : progression proposée en six étapes éditoriales (sans ajouter de menu enfant), distinctions entre noms/phonèmes/contextes, inventaire de 31 unités et suivi des 26 lettres. Huit essais de conception de deux choix sur l/r/f/j préparés mais non activés. Contrat audio et commande audit:sounds vérifiant métadonnées puis présence des fichiers. Tous les nouveaux audios restent absents et non validés. Prochaine étape : relecture professionnelle du premier pilote, production des fichiers et écoutes sur appareils avant intégration en phase 3.
