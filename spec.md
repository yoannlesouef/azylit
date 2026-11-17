# Spécification Technique et Fonctionnelle — Azyl.it (`www.azyl.it`)
**Version :** 1.7.0  
**Dernière mise à jour :** 17 novembre 2026  
**Domaine cible :** `https://www.azyl.it`  
**Objet :** Application web éducative et inclusive d'apprentissage et d'entraînement à la lecture (compétences équivalentes CP à CM2), conçue selon les principes de la Conception Universelle de l'Apprentissage (CUA) pour les enfants avec ou sans troubles neurodéveloppementaux (TND).


## État de référence et portée du document

Cette version intègre les retours sur les compagnons, l'autonomie des non-lecteurs, la difficulté de départ, la voix, les retours visuels et la hiérarchie des actions. Les exigences décrivent la cible du produit ; le tableau suivant précise l'état du prototype et ne constitue pas une validation pédagogique ou d'accessibilité auprès des enfants.

| Sujet | Réalisé dans le prototype | À compléter ou à valider |
| --- | --- | --- |
| Compagnons | Licorne Lumi, chevalier Arthur, princesse Alma et pirate Malo, avec illustrations vectorielles distinctes et thème associé | Animations et variantes d'expression plus riches |
| Accueil | Action principale de jeu, choix du compagnon et accès illustré à la difficulté | Essais avec des enfants non lecteurs |
| Information des parents | Espace HTML dédié en cinq pages et phrase cliquable près du logo : « Apprendre à lire, chacun à son rythme. » ; sous le logo sur petit écran ; absente des exercices | Vérification visuelle sur les appareils cibles |
| Difficulté | Sélecteur unique avec aperçu, moins, plus et triangle, accompagné oralement ; sept positions | Validation de la compréhension des pictogrammes et de la progression |
| Premiers apprentissages | Quatre sous-paliers de huit questions : lettres, sons des voyelles, syllabes simples et assemblage | Contenus supplémentaires, enseignement explicite de la fusion lettre-son et validation pédagogique |
| Catalogue | 156 activités de démonstration : choix de réponse, quatre associations de cartes lettres, huit fusions de lettres et soixante constructions de mots | Étendre les autres mécaniques et valider la couverture CP–CM2 |
| Retours | Compagnon et symboles, sans félicitations ni indices écrits visibles ; voix rejouable avant la réussite | Tests de compréhension des retours sans lecture |
| Page d'exercice | Réponses prioritaires, une réécoute centrale, outils secondaires ; après réussite, réponse statique et une grande flèche | Vérification en navigateur et essais utilisateurs |
| Audio | Français `fr-FR`, préférence pour les voix naturelles disponibles, débit `0.97`, intonation native, encouragements courts | Enregistrements humains ou synthèse naturelle validée, notamment pour les phonèmes isolés |
| Sauvegarde | Profil local immédiat, réglages, sous-palier, résultats et reprise après fermeture de la page | Synchronisation distante et code avatar sécurisé |
| Accessibilité | Polices système, taille et espacements, interligne, coloration des syllabes renseignées et guide de lecture | Polices Andika/Lexend/OpenDyslexic, lettres muettes et graphèmes complexes |
| Positionnement | Logique et écrans de démonstration présents dans le code, arrêt à la première difficulté, maximum deux minutes | Point d'entrée illustré à réintégrer dans le sélecteur et étalonnage pédagogique ; non proposé actuellement dans le parcours visible |

Les tests automatiques couvrent notamment la progression, la conservation des profils, le choix de difficulté, l'arrêt par la maison et l'absence de boutons de réponse après réussite. Leur succès ne remplace pas la vérification du rendu ni les essais avec les publics cibles. Le document ne déclare ni publication du site ni conformité complète vérifiée.

---

## 1. Périmètre Pédagogique et Clinique

### 1.1 Publics cibles et adaptations incluses
L'application doit offrir une expérience fluide, bienveillante et non stigmatisante aux enfants d'âge élémentaire, en particulier ceux présentant :
- **Troubles spécifiques du langage et des apprentissages (« Dys ») :**
  - *Dyslexie* : difficultés de décodage, d'automatisation et de fluence.
  - *Dysorthographie* : difficultés de mémorisation orthographique et morphologique.
  - *Dysphasie* : trouble structurel du langage oral (nécessitant un support visuel fort et des consignes orales lentes, articulées et rejouables).
  - *Dyspraxie / TDC (Trouble Développemental de la Coordination)* : **traitée exclusivement sur le plan de l'ergonomie motrice de l'interface** (aucun contenu linguistique spécifique), via des cibles larges et l'absence de gestes fins.
- **TDAH (Trouble Déficit de l'Attention avec ou sans Hyperactivité) :** besoin de sessions courtes, d'isolation visuelle stricte, de repères temporels finis et d'absence de surstimulation sensorielle.
- **Déficience intellectuelle (dispositifs ULIS, trisomie 21, syndrome de l'X fragile) :** découplage total entre l'âge/classe réelle et le niveau de lecture, valorisation systématique de chaque palier, consignes simples et univoques.

### 1.2 Hors-périmètre explicite
- **Dyscalculie :** non couverte (l'application se concentre exclusivement sur la lecture et la compréhension de l'écrit).
- **Classement scolaire :** aucune mention de classe (`CP`, `CE1`, `CE2`, `CM1`, `CM2`) ne doit apparaître dans l'interface enfant.

---

## 2. Architecture technique et persistance

### 2.1 Architecture réalisée et extensions prévues
- **Application actuelle :** site statique en HTML, CSS et modules JavaScript natifs, sans dépendance à installer. Le code se trouve dans `app/` ; Node.js 18 ou supérieur sert au développement, aux tests et à la construction.
- **Commandes :** `npm run dev` pour le serveur local, `npm test` pour les vérifications et `npm run build` pour produire `dist/`. `npm run preview` sert le site construit.
- **Présentation :** CSS avec variables de thème par compagnon et réglages de lecture (`--reading-font`, `--reading-size`, `--reading-spacing`, `--reading-line`). Les illustrations sont vectorielles et locales ; aucun service tiers ni police distante n'est chargé par l'interface.
- **État actuel :** profil sérialisé dans `localStorage` sous la clé `azylit.profile.v1`, avec validation des valeurs à la lecture. Si le stockage échoue, la session reste utilisable en mémoire et son absence de persistance est signalée.
- **Évolution de la persistance :** une API et un stockage serveur seront nécessaires avant de proposer une récupération multiappareil par code avatar. Cloudflare Workers et D1/KV restent une option d'architecture. Le prototype ne fournit actuellement ni API de synchronisation ni code de récupération.
- **Frameworks :** une migration vers un framework n'est pas nécessaire pour lancer cette version ; Next.js ou Astro/React restent des options futures, sans obligation de réécriture.
- **Audio actuel :** Web Speech API avec `lang: 'fr-FR'`, `rate: 0.97` et `pitch: 1`. Priorité à une voix française de France ; parmi les voix de même langue, privilégier les variantes naturelles ou améliorées. Attendre jusqu'à 700 ms le chargement initial des voix lorsque le navigateur le permet. Toute nouvelle lecture interrompt la précédente.
- **Audio cible :** fichiers audio validés pour les consignes, encouragements et phonèmes isolés, servis comme ressources statiques ; Web Speech API en repli pour les textes dynamiques. La qualité et la prononciation doivent être vérifiées, sans garantie fondée sur le seul format du fichier.

### 2.2 Conformité RGPD Mineurs (< 15 ans)
- **Zéro donnée personnelle (PII) :** Aucune collecte de nom, prénom, adresse e-mail, date de naissance, établissement scolaire ou géolocalisation.
- **Profil sans compte nominatif et récupération cible :**
  - À la première visite, génération immédiate d'un profil local dans `localStorage`.
  - **À réaliser avant toute promesse de récupération multiappareil :** attribution d'un **Code Avatar à 4 chiffres** (ex. `4829` + icône du compagnon choisi) permettant à l'enfant ou à l'enseignant/parent de retrouver la progression synchronisée sur un autre appareil sans création de compte. Cette récupération nécessite une connexion et une sauvegarde distante réussie ; l'interface indique clairement l'état de synchronisation.
  - Prévoir la gestion des collisions, la protection de l'accès aux progressions et les règles de conservation/suppression avant de déployer la récupération par code. Un code à quatre chiffres ne suffit pas à lui seul à garantir ces propriétés.
  - Dans le prototype, l'effacement des données locales est accessible dans la section adulte repliée des réglages.
  - Aucun cookie publicitaire ni tracker tiers.

---

## 3. Parcours Utilisateur (User Flow)

**Langue par défaut :** français (`fr-FR`) pour l'interface et la voix, indépendamment de la langue du navigateur.

### 3.1 Onboarding (Première visite)
1. **Choix du Compagnon (Obligatoire) :**
   - L'enfant choisit parmi 4 types de compagnons aux silhouettes distinctes : une licorne (*Lumi*), un chevalier (*Arthur*), une princesse (*Alma*) et un pirate (*Malo*).
   - Ce choix applique un thème chromatique doux, contrasté et adapté (couleurs primaires d'accentuation, illustrations du compagnon).
   - Le design doit être clair, moderne, attrayant et adapté aux enfants. Les illustrations et animations servent la compréhension et la motivation sans surcharger l'écran. Chaque type d'exercice comporte une mécanique ludique adaptée à la compétence travaillée. La lisibilité, la compréhension des interactions et l'intérêt des activités doivent être vérifiés lors d'essais avec des enfants représentatifs des publics cibles.
2. **Choix du point de départ :**
   - **Parcours visible actuel :** après le compagnon, ouvrir le sélecteur illustré commun à tous les changements de difficulté. Le premier point proposé correspond à une lettre isolée, mais l'enfant peut choisir immédiatement plus facile ou plus difficile avec les boutons moins et plus, avant de lancer une mission.
   - Les quatre grands domaines de compétences restent des catégories pédagogiques internes ; les sous-paliers du débutant et les domaines suivants forment les sept positions du sélecteur. Aucun menu de noms de niveaux à lire n'est nécessaire.
   - **Positionnement à réintégrer dans le parcours visible :** mini-jeu de deux minutes maximum, cinq épreuves au plus, dans cet ordre : reconnaissance visuelle d'une lettre, son d'une voyelle, syllabe simple, assemblage de syllabes, compréhension d'une phrase simple. Il s'arrête dès une difficulté, une question passée ou l'échéance.
   - Le résultat propose le premier sous-palier à travailler. Le parcours mots et phrases n'est proposé que si les cinq épreuves sont réussies. Les domaines de morphologie et de compréhension avancée ne sont jamais déduits de ces seules épreuves.
   - Un positionnement sans réponse exploitable renvoie au choix direct. Aucun score ni jugement n'est affiché. Les consignes et stimuli sonores restent rejouables ; une question non réalisable faute d'audio n'est pas assimilée à une erreur.

### Choix visuel de la difficulté
- Au premier lancement, après le compagnon, et à chaque demande de changement, afficher le même sélecteur utilisable sans lecture grâce aux pictogrammes et à la voix : un aperçu du jeu, un titre « Choisis ton niveau », le niveau actuellement sélectionné (numéro et nom), une flèche de retour, un bouton moins pour simplifier, un bouton plus pour augmenter la difficulté, puis un bouton maison pour valider et revenir à l’accueil.
- Les sept positions successives couvrent les lettres, les sons, les syllabes, l'assemblage, les mots et phrases, la morphologie et la compréhension. L'aperçu montre un échantillon pédagogique ou un pictogramme ; les noms des paliers ne doivent pas être déchiffrés pour choisir.
- Chaque changement est expliqué oralement, sans déclencher l'exercice. Le bouton maison valide le niveau et revient à l’accueil ; Jouer y démarre la mission. Valider un niveau différent de la mission en cours remplace son plan, sans supprimer les résultats déjà enregistrés. Le choix direct reste libre et distinct de la progression recommandée.
- Le bouton « Mon niveau » affiche le niveau sélectionné sur l'accueil, sous le grand bouton Jouer. Il utilise des cartes illustrées avec une lettre et une syllabe ; le même pictogramme donne accès au sélecteur depuis la zone secondaire de l'exercice. La flèche de retour de la page « Choisis ton niveau » revient au véritable écran précédent, en conservant une mission en cours si elle existe, sans en lancer une nouvelle. Les boutons sont désactivés aux extrémités ; le focus clavier reste utilisable.

### Navigation autonome sans lecture
- Aucune étape de navigation enfant ne nécessite de déchiffrer un texte : chaque action est représentée par une grande image ou un pictogramme constant, accompagné d'un libellé court facultatif et d'un nom accessible.
- Un grand triangle lance le jeu, une flèche permet de continuer, une maison de revenir à l'accueil ou de faire une pause, un haut-parleur de réécouter et une ampoule de demander de l'aide. Les confirmations utilisent elles aussi ces repères visuels.
- L'accueil présente le compagnon en grand et un bouton Jouer nettement dominant. Deux commandes secondaires, plus petites et regroupées dessous, permettent de changer le compagnon ou le jeu. L'accès au jeu utilise des cartes illustrées avec une lettre et une syllabe, plutôt qu'un symbole de marches abstrait. À côté du logo, ajouter pour les parents la phrase discrète « Apprendre à lire, chacun à son rythme. » ; sur petit écran, la placer sous le logo sans réduire les cibles interactives. Cette phrase n'apparaît pas dans le mode exercice. Les descriptions pédagogiques, les tableaux de progression et les informations techniques restent hors du parcours principal de l'enfant.
- Après le premier geste de l'enfant, les étapes de choix et les transitions sont expliquées oralement. Une commande de réécoute illustrée reste disponible. Le premier geste sur le bouton Jouer ou le haut-parleur permet l'activation de la voix dans les navigateurs qui bloquent l'audio automatique.
- Les choix de compagnon et de parcours sont illustrés ; leur sélection déclenche une présentation orale. Le parcours débutant est présélectionné, sans empêcher le choix direct d'une autre difficulté. Le mini-jeu reste une exigence cible à réexposer par un point d'entrée illustré.
- Les réglages enfant utilisent des échantillons visuels (taille des lettres, espacement, interligne) et une confirmation par coche. Les informations de gestion des données restent dans une section adulte repliée.
- Les réglages Muet / Audio restent respectés. L'autonomie sans lecture par guidage vocal nécessite une voix française disponible et le son activé ; cette condition doit être vérifiée avant de déclarer le parcours validé.
- Valider par des essais avec des enfants non lecteurs qu'ils peuvent démarrer, choisir un compagnon, demander de l'aide, avancer, faire une pause et reprendre sans explication écrite ni intervention d'un adulte.

### Hiérarchie des actions pendant l'exercice
- Le compagnon choisi est visible dès la consigne, en petit repère fixe de 72 × 80 px, à côté du modèle ou au centre si la question est sonore. Il reste immobile, sans bulle décorative ni fond coloré dominant pendant la réflexion. Sa cible reste supérieure à 64 × 64 px. Son illustration avec un petit repère de haut-parleur remplace le bouton audio isolé : la toucher réécoute la consigne, ou l’indice après une erreur. Aucun bouton supplémentaire n’est ajouté.
- Avant la réponse : le modèle et les grandes réponses dominent l'écran. Dans le prototype, le texte de la consigne reste disponible aux lecteurs d'écran mais n'est pas affiché ; la voix et le modèle guident l'enfant. Une seule commande de réécoute centrale lit la consigne et le stimulus sonore éventuel. La maison, le mode muet et les réglages restent accessibles mais visuellement discrets.
- L'aide et le changement de difficulté sont regroupés dans une zone secondaire séparée des réponses. Les cibles restent grandes même lorsque leurs pictogrammes sont discrets.
- Après une erreur : la réponse déjà essayée devient un élément statique grisé, et les réponses restantes restent l'action principale. Le compagnon et le repère de nouvelle tentative ne sont pas des boutons supplémentaires.
- Après une réussite : les propositions cliquables, les commandes de réécoute et l'aide quittent la zone centrale. Afficher la réponse correcte en élément statique, le compagnon et une seule grande flèche pour continuer. Aucune validation supplémentaire n'est nécessaire.

### Missions évolutives au même palier et historique
- Constituer un catalogue de seize activités pour chacune des sept positions de complexité ; sélectionner huit activités distinctes par mission en conservant la répartition des mécaniques et catégories du palier.
- Priorité aux activités non terminées auparavant, puis aux moins revues. À fréquence équivalente, éviter le dernier plan proposé et préférer les activités vues le moins récemment. Les ex æquo sont départagés aléatoirement.
- Le premier parcours d'un nouveau profil garde une introduction guidée. Les missions suivantes changent leur sélection ; même une mission abandonnée ne doit pas relancer systématiquement le même plan. La complexité reste celle choisie explicitement par l'enfant.
- Mélanger les positions des réponses, des cartes à construire et des cartes de droite à associer, en conservant la correction logique et les cartes identiques distinctes. Ne jamais modifier le catalogue source.
- Enregistrer les identifiants et les mélanges dans la mission avant son affichage. Une reprise restaure ce plan exact et l'état des cartes ; une nouvelle mission utilise un nouveau plan. Une ancienne sauvegarde sans plan conserve l'ordre de son ancien parcours.
- Enregistrer une seule entrée d'historique par exercice terminé : identifiant, mission, position, palier, résultat autonome/accompagné, nombre de réponses incorrectes, recours explicite à une aide et date. Une aide demandée ne crée pas de fausses erreurs dans ce compteur. Les exercices terminés restent enregistrés si la mission est ensuite abandonnée. Aucun résultat fictif n'est créé au lancement ou à l'abandon.
- Conserver les 2 000 derniers résultats dans le navigateur. Afficher les 40 derniers dans les réglages adultes, avec possibilité d'exporter l'historique conservé. L'effacement du profil efface aussi cet historique ; aucune transmission distante n'est ajoutée.
- Préserver les compteurs et les sauvegardes existants. Les résultats détaillés antérieurs à cette fonctionnalité ne peuvent pas être reconstitués s'ils n'avaient pas été enregistrés.
- Une fois le catalogue parcouru, proposer des révisions variées ; ne pas promettre des contenus nouveaux sans limite ni confondre variation et montée de niveau.

### Navigation sans groupes

L’interface ne présente ni numéro, ni bibliothèque, ni choix de groupe. Jouer crée automatiquement une mission variée de huit exercices ; Continuer reprend la mission conservée. Les étoiles restent le repère de progression. Les plans techniques et les résultats locaux existants sont conservés pour la compatibilité des profils, sans accès enfant au rejeu de groupes.

Pour les exercices de fondation, prononcer uniquement la cible au lancement, à la réécoute, après une erreur et lors de l’aide : nom de lettre, voyelle, syllabe ou mot. En association de lettres, prononcer la lettre sélectionnée ou la prochaine lettre non associée. Les consignes des exercices avancés restent disponibles. Les retours visuels et le compagnon accompagnent la réponse sans ajouter de phrase à la cible audio.

### 3.2 Déroulement d'une Mission (Session de travail)
- **Structure fixe :** `1 Mission = 8 micro-exercices` (durée cible : **4 à 6 minutes**).
- **Mode Focus (Plein écran) :**
  - Dès le lancement d'une mission, masquage des liens de présentation, menus de contenu, pied de page et liens externes. Les outils d'aide, de difficulté et d'accessibilité restent disponibles dans les zones secondaires décrites ci-dessus.
  - Un seul exercice affiché à la fois, occupant le centre de l'écran.
  - **Repères et commandes :**
    - Bouton maison `Quitter` : arrêt immédiat de l'exercice, de la voix et du positionnement éventuel, puis retour à l'accueil sans confirmation. La mission en cours est abandonnée ; le prochain lancement repart au premier exercice. Les missions déjà terminées, le compagnon et les réglages sont conservés.
    - **Jauge de progression visuelle finie :** 8 étoiles ou boucliers alignés s'allumant un à un (indispensable pour rassurer les enfants TDAH et TSA sur la durée restante).
    - Bouton `Muet / Audio` (toujours accessible, grande taille).
    - Bouton `Réglages Dys` (tiroir d'accessibilité rapide).

---

## 4. Moteur d'Accessibilité « Dys / TDC »

Le moteur d'accessibilité est configurable à tout moment via un panneau dédié et sauvegardé dans le profil enfant.

### 4.1 Typographie et Espacement
- **Polices cibles (à intégrer) :**
  - `Andika` (par défaut — sans empattement, caractères non ambigus `b/d/p/q`).
  - `Lexend` (optimisée pour la fluence visuelle).
  - `OpenDyslexic` (en option activable).
  - **Prototype actuel :** sans empattement système, Verdana et Arial. Les réglages sont montrés par des échantillons visuels, avec une coche pour revenir au jeu.
- **Paramètres ajustables :**
  - Taille de police : `Normal (22px)`, `Grand (28px)`, `Très Grand (34px)`.
  - Interligne : minimum `1.6` (extensible à `2.0`).
  - Espacement inter-lettres (`letter-spacing`) : `+0.05em` par défaut (extensible à `+0.12em`).
  - Espacement inter-mots (`word-spacing`) : `+0.25em` par défaut.

### 4.2 Aides Visuelles à la Lecture (Règles de cloisonnement strictes)
Chaque aide cible est activable/désactivable indépendamment en un clic. Dans le prototype, seules la coloration des syllabes renseignées et la règle de lecture sont disponibles ; les lettres muettes et les graphèmes complexes restent à réaliser :
1. **Coloration syllabique :** Alternance bleu (`#1D4ED8`) / rouge (`#B91C1C`) par syllabe orale.
2. **Lettres muettes grisées :** Affichage en gris atténué (`#9CA3AF`) des lettres finales non prononcées (ex. *cha**t***, *ils mange**nt***).
3. **Mise en évidence des graphèmes complexes :** Soulignement léger ou teinte dédiée sur les digrammes/trigrammes (`ou`, `on`, `an`, `en`, `in`, `ch`, `oi`, `eau`, `ph`).
4. **Règle de lecture (Masque horizontal) :** Bandeau translucide focalisant l'attention sur la ligne survolée ou sélectionnée. Disponible pour tout texte de lecture pertinent, quel que soit le niveau, notamment les paragraphes du niveau 2.

> **RÈGLE CRITIQUE DE CLOISONNEMENT :**  
> Les aides visuelles (coloration syllabique, lettres muettes, sons complexes) s'appliquent **exclusivement aux corpus de lecture** (rendu de lecture dédié ; `<ReadingText />` est un nom de composant cible, pas une dépendance du prototype). Elles doivent être **automatiquement désactivées** :
> - Sur les commandes d'interface (navigation, validation, réglages, sortie) et leurs libellés.
> - Sur les exercices de discrimination pure où la couleur révélerait la bonne réponse (ex. : exercice *"Trouve les syllabes du mot"* ou *"Repère le son [ou]"*).
>
> Les mots ou textes proposés comme réponses pédagogiques restent des corpus de lecture même lorsqu'ils sont cliquables : les aides y sont autorisées uniquement si elles ne révèlent pas la réponse. La règle d'exclusion des exercices de discrimination reste prioritaire.

### 4.3 Ergonomie Motrice (Adaptation Dyspraxie / TDC)
- **Zéro Drag-and-Drop obligatoire :** Aucun exercice ne doit exiger un glisser-déposer fin à la souris ou au doigt. Toutes les interactions de tri, classement ou remise en ordre fonctionnent par **clic/tap séquentiel** (ex. cliquer sur l'élément source puis sur l'emplacement cible, ou cliquer dans l'ordre chronologique).
- **Taille et espacement des cibles :**
  - Zone cliquable minimale : `64px x 64px` (idéalement `80px+` pour les choix multiples).
  - Marge minimale entre deux boutons interactifs : `16px` (`gap-4`) pour éviter les clics accidentels dus aux troubles praxiques.
- **Navigation clavier complète :** Toutes les commandes et interactions pédagogiques sont accessibles par `Tab` / `Maj+Tab`, avec un focus visible, puis `Entrée` ou `Espace` pour activer l'élément ciblé. Les touches `1`, `2`, `3`, `4` sont des raccourcis pour les réponses proposées. Hors d'une commande focalisée ou d'un champ de saisie, `Espace` permet de réécouter la consigne. Les sélections dans un texte utilisent les flèches pour déplacer le repère et `Entrée` pour confirmer.
- **Sélection dans les textes :** Les mots et les espaces entre lettres ne constituent jamais de petites cibles obligatoires. Prévoir des commandes de déplacement et de confirmation d'au moins `64px x 64px`, espacées de `16px`, utilisables au clic, au tap et au clavier ; le repère courant reste visible.

### 4.4 Politique Audio et Sensorielle
- **Discrétion visuelle du compagnon :** éviter toute animation pendant la recherche et après une erreur. Les encouragements intermédiaires restent statiques ; réserver le mouvement de célébration à la fin de mission, en respectant la réduction des animations. Ce choix vise à limiter les distractions, sans supposer une réaction identique chez tous les enfants avec TDAH ; il doit être évalué avec les enfants concernés.
- **Voix chaleureuse :** privilégier une voix française de France naturelle, neuronale ou améliorée lorsqu'elle est disponible. Conserver son intonation native et un débit proche de la conversation (`0.97` dans le prototype), sans ralentissement artificiel excessif. Attendre brièvement le chargement des voix au premier usage. Les encouragements sont courts, variés et familiers. La qualité du fallback dépend de l'appareil ; des enregistrements humains ou une synthèse naturelle validée sont nécessaires pour garantir un rendu homogène.
- **Musique de fond :** **Strictement bannie** pendant la lecture et la réflexion.
- **Commande audio globale :** Le bouton `Muet / Audio` est présent et accessible sur tous les écrans, y compris l'accueil, le choix du compagnon et de la difficulté, le positionnement, les exercices, les réglages et la célébration. Son état est conservé dans le profil. Le mode muet coupe les voix, les bruitages et tout autre son ; les consignes et feedbacks restent disponibles visuellement. Un exercice nécessitant l'écoute propose de réactiver l'audio ou de choisir une activité sans écoute obligatoire. En positionnement, une épreuve non réalisable en mode muet n'est jamais comptée comme une erreur ; proposer le choix direct du niveau si les réponses disponibles ne suffisent pas.
- **Audio utile systématique :**
  - Les consignes et stimuli sonores sont lus automatiquement lorsque l'audio est activé. Les encouragements et indices sont oraux et ne nécessitent aucun message écrit visible.
  - Avant la réussite, une seule commande centrale réécoute la consigne et le stimulus, ou l'aide après une erreur. Les exercices qui nécessitent d'écouter plusieurs propositions peuvent ajouter les commandes d'écoute correspondantes, sans les présenter comme des boutons de réponse.
  - Après une réussite, retirer les boutons de réécoute de la zone centrale au profit de la seule grande flèche. Le raccourci clavier de réécoute peut rappeler oralement comment continuer. Ne pas multiplier les boutons pour chaque feedback ou mot-clé.
  - Le réglage `Muet / Audio` reste toujours accessible et interrompt toute lecture vocale en cours. Un appui volontaire sur une commande explicite d'écoute du guidage peut réactiver l'audio.
  - **Cible :** prononciation isolée des phonèmes au clic dans les exercices débutants, avec enregistrements validés. Le prototype utilise les voyelles et les syllabes synthétisées ; il ne fournit pas encore les enregistrements de consonnes isolées.
  - **À réaliser :** bruitages doux et non stridents pour la validation, respectant le mode muet.

---

## 5. Architecture Pédagogique & Catalogue des Exercices

Le contenu est structuré en **4 niveaux de compétence** avec pour objectif de couvrir l'intégralité des apprentissages de lecture du CP au CM2. Cette couverture doit être démontrée par la matrice et la validation prévues en section 5.1 avant d'être déclarée complète.

### Niveau 1 : Conscience Phonologique & Décodage (*Apprenti Décodeur*)

**Prérequis et progression débutante :** Le démarrage par défaut ne suppose aucune lecture de mot entier. Prévoir quatre sous-paliers indépendants :
- **Lettres :** une lettre minuscule en grand, à retrouver parmi deux choix, sans exiger son nom ni un mot contenant cette lettre.
- **Sons :** association des voyelles simples (`a`, `i`, `o`, `u`) à leurs lettres, avant les confusions complexes. Pour les consonnes, utiliser des enregistrements validés de phonèmes, sans substituer le nom de la lettre au son.
- **Syllabes :** découverte et reconnaissance de syllabes ouvertes simples (`ma`, `mi`, `la`, `li`), avec réécoute et aide guidée.
- **Assemblage :** poser deux cartes syllabes dans l’ordre pour former un mot simple, par clic ou tap ; afficher l'assemblage complet après la réponse.

Chaque mission débutante reste dans son sous-palier pendant huit exercices, avec deux choix larges. Le sous-palier est sauvegardé avec la mission. Aucune réussite isolée ni mission terminée ne déclenche une montée automatique. Dans le prototype, proposer l'étape suivante après deux missions consécutives comprenant au moins sept réussites autonomes sur huit ; l'enfant décide de l'essayer ou de répéter. Les réponses aidées et les exercices de remplacement ne démontrent pas une maîtrise autonome. Cette règle reste à valider pédagogiquement.

Le positionnement commence par les lettres, puis les sons, les syllabes, l'assemblage et une phrase simple ; il s'arrête dès une difficulté ou une question passée. Il ne peut proposer un parcours avancé qu'après des épreuves couvrant ses prérequis. Le mini-jeu actuel ne propose donc que les fondations ou le parcours de mots et phrases simples.

Les types d'exercices ci-dessous constituent la suite du catalogue, à introduire après les prérequis correspondants.

1. `phoneme_grapheme_match` : **Association graphème-phonème** — Écouter un son (ex. `[ch]`, `[on]`, `[v]`) et cliquer sur la bonne lettre ou le bon groupe de lettres parmi 3 à 4 propositions larges.
2. `sound_intruder` : **Chasse aux intrus sonores** — 4 images avec audio associé ; identifier le mot qui ne commence pas (ou ne finit pas) par le même son.
3. `syllable_fusion` : **Fusion syllabique** — Assembler 2 ou 3 syllabes proposées (`ba` + `teau`) pour reconstruire le mot illustré et entendu.
4. `confusable_discrimination` : **Discrimination de sons/lettres proches** — Exercices ciblés sur les paires critiques de la dyslexie : visuelles (`b/d`, `p/q`, `m/n`, `u/n`) et auditives (`f/v`, `ch/j`, `t/d`, `p/b`, `c/g`).

### Niveau 2 : Fluence & Reconnaissance Rapide (*Explorateur de Phrases*)
1. `flash_words` : **Lecture flash de mots-outils** — Affichage bref (durée ajustable : 1.5s, 2.5s, ou illimité) d'un mot fréquent ou irrégulier (*beaucoup, aujourd'hui, toujours, monsieur*), suivi de sa reconnaissance parmi 4 choix.
2. `personal_best_fluence` : **Lecture chronométrée bienveillante** — Lecture d'un court paragraphe (30 à 50 mots). À la fin du minuteur doux (30s), le texte reste affiché sans limite de temps de réponse. L'enfant indique le dernier mot lu avec un repère déplacé par de grandes commandes précédent/suivant ou par les flèches du clavier, puis confirme sa sélection. Aucun clic précis sur un mot n'est requis. **Règle :** Aucun score négatif ; l'enfant bat uniquement son propre record personnel ou gagne une étoile de régularité.
3. `sentence_segmentation` : **Segmentation de phrases collées** — Séparer une phrase sans espaces (`Lechatboitsonlait.`) en déplaçant un repère entre les lettres à l'aide de grandes commandes précédent/suivant ou des flèches du clavier. Une commande « Ajouter / retirer un espace » insère ou supprime la coupure à la position du repère. Aucun clic précis entre deux lettres n'est requis.

### Niveau 3 : Syntaxe & Morphologie (*Détective des Mots*)
1. `agreement_spotting` : **Repérage des accords** — Compléter un groupe nominal ou un verbe en choisissant la bonne terminaison selon les indices de la phrase (singulier/pluriel `-s/-nt`, féminin/masculin `-e`).
2. `word_families` : **Familles de mots** — Identifier le mot intrus qui n'appartient pas à la même famille morphologique (ex. *terre, terrain, terrestre, terrible*).
3. `affix_builder` : **Préfixes et suffixes** — Associer un préfixe (`re-`, `dé-`, `im-`, `pré-`) ou un suffixe (`-ette`, `-eur`, `-able`) à un radical pour modifier le sens d'un mot (soulage la dysorthographie en enseignant la structure des mots).

### Niveau 4 : Compréhension Fine & Inférences (*Maître des Histoires*)
1. `contextual_cloze` : **Texte à trous contextuel** — Compléter 1 à 2 mots manquants dans un court récit en s'appuyant sur le sens global de la phrase.
2. `chronological_order` : **Remise en ordre chronologique** — Réordonner 3 à 4 phrases d'une histoire courte en cliquant dessus dans l'ordre logique (`1`, `2`, `3`, `4`).
3. `pronoun_substitutes` : **Identification des substituts (Anaphores)** — Dans un texte court, un pronom est surligné (*« Léo prête son vélo à Maya. **Elle** le remercie. »*) ; l'enfant clique sur le personnage ou l'objet désigné.
4. `implicit_inference` : **Questions d'implicite** — Répondre à une question dont la réponse n'est pas écrite littéralement dans le texte (déduction de lieu, de temps, d'émotion ou de cause).


### Diversification des mécaniques : exigence prioritaire

Le prototype comporte désormais quatre familles d'interactions : choix de réponse, association de cartes, fusion de lettres en syllabe et assemblage de syllabes en mot. Le catalogue contient 156 activités : soixante au niveau Assemblage et seize pour chacun des six autres paliers. Chaque mission sélectionne huit activités sans changer automatiquement de sous-palier. Les répartitions ci-dessous concernent une mission, et non la taille du catalogue.

| Sous-palier | Mécaniques réalisées | Répartition dans la mission |
| --- | --- | --- |
| Lettres | Choix du modèle et association de deux paires visibles, par un clic à gauche puis un clic à droite | Six choix de réponse et deux associations |
| Sons | Choix de la voyelle après écoute | Huit choix de réponse |
| Syllabes | Reconnaissance après écoute et placement de deux lettres dans l'ordre d'un modèle visible | Quatre choix de réponse et quatre fusions |
| Assemblage | Placement de deux cartes syllabes pour construire le mot entendu | Huit constructions |

**Règles des interactions :**
- Aucun geste de glisser-déposer, aucune limite de temps et aucune précision motrice fine ne sont exigés. Chaque carte est une grande cible, utilisable au clavier.
- Association : choisir une carte à gauche, puis son équivalent à droite. Les cibles à droite deviennent actives après ce premier choix. Une paire correcte devient statique et cochée ; une erreur ne retire pas les autres paires trouvées.
- Construction : la carte correcte remplit le prochain emplacement ; une carte incorrecte n'efface pas le début correct. Les deux cartes identiques d'un mot comme `pa` + `pa` sont deux objets distincts et ne peuvent pas être réutilisées deux fois.
- Une petite commande permet de retirer la dernière carte avant de terminer. Il n'y a pas de bouton Valider supplémentaire : la dernière association ou la dernière carte correcte termine l'activité.
- L'ampoule propose un indice vocal et un repère sur la prochaine carte utile. Une erreur ou une aide reste comptabilisée, y compris après fermeture de la page ; elle empêche de présenter cette réussite comme autonome.
- Les cartes posées, la source sélectionnée et les paires trouvées sont sauvegardées. La reprise valide ces données par rapport à la question courante et ignore les valeurs incohérentes.
- Une activité complète donne une seule étoile, indépendamment de son nombre de cartes. Après la réussite, il ne reste qu'une grande flèche pour continuer.
- La fusion guidée utilise un modèle visuel et peut être faite sans son ; elle ne prétend pas remplacer l'enseignement des phonèmes consonantiques, dont les enregistrements validés restent à produire.

**Diversification restante :** étendre les associations graphème-phonème, la lecture flash, la fluence, la segmentation interactive et la remise en ordre des récits. Le catalogue des quatre niveaux décrit la cible ; la variété des gestes ne prouve ni maîtrise pédagogique ni couverture exhaustive.

### 5.1 Vérification de la couverture pédagogique
- Maintenir une matrice de couverture reliant chaque compétence de lecture visée sur le périmètre CP–CM2 à un ou plusieurs types d'exercices, aux contenus disponibles et aux critères de réussite observables.
- Pour chaque compétence, préciser les prérequis, la difficulté progressive, les aides autorisées et des exemples de contenus validés pédagogiquement.
- Le catalogue ci-dessus constitue la base de cette matrice ; ajouter des variantes ou des types d'exercices si la vérification révèle une compétence non couverte. L'exhaustivité ne peut pas être déclarée sur la seule présence des quatre niveaux.
- Avant de déclarer la couverture complète, vérifier qu'aucune compétence visée ne reste sans contenu ni critère de réussite et faire valider la matrice pédagogiquement. Les références aux classes restent réservées à la documentation pédagogique et ne sont jamais affichées dans l'interface enfant.

---

## 6. Système de Récompense et Gestion de l'Erreur

Les retours enfant ne reposent sur aucun message écrit visible : une réussite utilise une étoile, une coche, le compagnon et la flèche pour continuer ; une erreur utilise une expression de soutien du compagnon, un cœur et un repère sur le modèle ou l'écoute, sans dupliquer le personnage dans un bandeau inférieur. Les indices restent oraux et rejouables avant la réussite, avec la commande centrale d'écoute. La célébration finale utilise une médaille et les étoiles de mission. Les libellés destinés aux lecteurs d'écran restent disponibles sans apparaître visuellement. Les animations restent brèves et sont désactivées si l'utilisateur préfère réduire les mouvements.

### 6.1 Traitement bienveillant de l'erreur (Zéro punition)
- **En cas d'erreur :**
  - Jamais de croix rouge agressive, de buzzer négatif ni de perte de points/vies.
  - Retour visuel calme : compagnon bienveillant, symbole pour réessayer et mise en évidence temporaire du modèle à observer ou du bouton d'écoute, avec un indice vocal fourni par le compagnon (ex. : *"Écoute bien le début du mot : [f] comme fusée"*).
  - Pour les choix multiples, la mauvaise réponse devient grisée et non cliquable ; pour les autres interactions, une correction reste possible avec un indice adapté.
  - L'effort est explicitement valorisé dès l'erreur par un encouragement discret, illustré et vocalisé (ex. : *"Tu as essayé, cherchons ensemble !"*).
  - Après deux tentatives incorrectes, proposer une aide guidée montrant la démarche puis une action simple pour terminer l'étape avec accompagnement. L'enfant peut aussi demander cette aide plus tôt ; aucune étape ne doit le bloquer dans une boucle d'échecs.
  - Une étape terminée avec accompagnement allume son étoile et permet de poursuivre la mission sans perte de récompense. La progression distingue une réussite autonome d'une réussite accompagnée pour adapter les exercices suivants.

### 6.2 Calibrage des félicitations des Compagnons
- **Pendant la mission (écrans 1 à 8) :**
  - **Micro-encouragement discret :** Compagnon de taille modérée avec expression joyeuse et étoiles statiques, sans mouvement pendant les retours intermédiaires, accompagné d’une coche et d’un encouragement vocal court (ex. *"Bien vu !"*, *"Super décodage !"*) et allumage de l'étoile correspondante dans la barre de progression. L'animation visuelle dure moins de `1.5 seconde` pour ne pas casser la concentration (TDAH). La voix peut se terminer au-delà de ce délai ; le feedback reste consultable et rejouable. Aucune nouvelle consigne vocale ne se superpose à un encouragement : le passage volontaire à l'exercice suivant interrompt l'encouragement avant de lire la nouvelle consigne.
- **En fin de mission (après le 8ème exercice) :**
  - **Réalisé :** compagnon, médaille et huit étoiles, avec encouragement oral. Le triangle relance une mission et la maison revient à l'accueil. Aucun titre « Bravo » ni bilan écrit n'est nécessaire pour comprendre la réussite.
  - **À développer :** animations plus riches et collection persistante de badges ou d'équipements. Leur attribution doit aussi valoriser les efforts et les réussites accompagnées, sans ajouter de menus de lecture obligatoires.

---

## 7. Modèles de données

### 7.1 Données réalisées dans le prototype
- **Historique et sélection :** `exerciseHistory` conserve au plus 2 000 résultats validés, `groupSequence` numérote les groupes, `missionGroups` conserve leurs plans et `missionSequence` attribue les identifiants de passage et `lastPlans` garde le dernier plan proposé par palier.
- **Profil local :** compagnon, grand domaine `level` (index interne de 0 à 3), `beginnerStage` (de 0 à 3), séries de missions réussies `beginnerWins`, état d'accueil, audio, réglages, compteur de missions terminées et réussites accompagnées.
- **Mission :** domaine, sous-palier, index courant, résultats autonomes ou accompagnés, tentatives, réponses déjà essayées, éventuels exercices de remplacement plan (`questionIds`), mélanges (`variants`), identifiant de mission et état des cartes (`interaction` : question, sélection, paires trouvées ou cartes posées).
- **Question actuelle :** `id`, `type`, `instruction`, `text`, `options`, index `answer`, `hint`, puis selon l'activité `listen`, `optionAudio`, `modelParts`, `syllables`, `ruler`, `foundation` et `visualAids`. Les activités de cartes ajoutent `mechanic`, `pairs`, `pairOrder`, `unit`, `parts`, `tiles` et éventuellement `requiresAudio`. Les chaînes d'indice servent à la voix ; elles ne sont pas affichées comme retour écrit.
- Les anciennes valeurs de compagnon sont migrées vers les quatre nouveaux personnages sans effacer les compteurs. Une ancienne mission débutante sans sous-palier explicite repart du début pour ne pas reprendre un exercice trop difficile.

### 7.2 Schéma cible enrichi d'un exercice

L'exemple suivant est une proposition de format pour le catalogue complet, avec ressources audio et illustrations. Il n'est pas encore le format consommé tel quel par le prototype. Les champs devront être adaptés aux mécaniques d'assemblage et de tri à mesure de leur développement.

```json
{
  "id": "exo_n1_conf_014",
  "level": 1,
  "domain": "conscience_phonologique",
  "type": "confusable_discrimination",
  "allowVisualAids": false,
  "instruction": {
    "text": "Clique sur le mot que tu entends.",
    "audioUrl": "/audio/consignes/clique_mot_entendu.mp3"
  },
  "prompt": {
    "targetWord": "ballon",
    "audioUrl": "/audio/mots/ballon.mp3",
    "imageUrl": "/images/mots/ballon.svg"
  },
  "options": [
    {
      "id": "opt_1",
      "text": "ballon",
      "syllables": ["bal", "lon"],
      "isCorrect": true
    },
    {
      "id": "opt_2",
      "text": "dallon",
      "syllables": ["dal", "lon"],
      "isCorrect": false,
      "hintAudioUrl": "/audio/indices/confusion_b_d.mp3",
      "hintText": "Attention, la lettre b a son ventre tourné vers la droite !"
    },
    {
      "id": "opt_3",
      "text": "pallon",
      "syllables": ["pal", "lon"],
      "isCorrect": false,
      "hintAudioUrl": "/audio/indices/confusion_b_p.mp3",
      "hintText": "Regarde bien : la barre du b monte vers le haut."
    }
  ]
}
```


---

## 8. Information des parents, SEO et visibilité dans les réponses IA

### 8.1 Deux expériences séparées
- Le jeu reste une expérience visuelle et orale. Aucune explication longue destinée aux adultes n'est ajoutée aux exercices, aux retours ou aux sélecteurs enfant.
- La phrase près du logo ouvre l'espace parents. Un lien « Pour les parents » est placé dans l'en-tête, près du son et des réglages d'accessibilité, sur les écrans hors exercice. Il n'est plus affiché en bas de page et reste absent du mode exercice.
- Cinq pages sont disponibles : `/parents/`, `/parents/demarche/`, `/parents/accessibilite/`, `/parents/donnees/` et `/parents/questions/`. Elles expliquent les objectifs, la progression, les adaptations présentes et prévues, la voix, la sauvegarde et les limites du prototype.
- Les pages parents ont leur propre présentation lisible, un menu entre rubriques et un retour au jeu. Elles sont entièrement consultables sans JavaScript, sans synthèse vocale automatique ni mesure d'audience ajoutée.
- Les textes distinguent les fonctionnalités réalisées et prévues. Ne pas inventer de validation pédagogique, d'avis de professionnel, de résultats, de témoignages, de certification ou de garantie d'efficacité. La rédaction est attribuée au projet Azyl.it et datée lors d'une modification réelle du contenu.

### 8.2 Référencement technique réalisé
- Le contenu source se trouve dans `content/parents.mjs`. `scripts/public-pages.mjs` génère les pages HTML, leurs métadonnées, `sitemap.xml`, `robots.txt` et une page 404 non indexable.
- Chaque page indexable dispose d'un titre et d'une description propres, d'une URL canonique absolue, de métadonnées Open Graph et Twitter, d'une langue française explicite, d'un titre principal unique et de liens HTML explorables.
- Les contenus parents sont servis dans la réponse HTML initiale, sans dépendre de l'exécution de l'application enfant. Le serveur de développement et la construction statique utilisent la même génération.
- Les données JSON-LD décrivent `WebSite`, `WebPage`, le fil d'Ariane et, sur la page de questions uniquement, `FAQPage`. Les questions et réponses structurées sont issues de la même source que les textes visibles. Aucun avis, classement ou prix fictif n'est ajouté.
- Les chemins parents sans barre finale sont redirigés vers leur forme canonique par le serveur local. Une URL inconnue renvoie une véritable réponse 404 ; le fichier `404.html` est fourni pour l'hébergement statique.
- `SITE_URL` configure l'origine canonique, avec `https://www.azyl.it` par défaut. `INDEXABLE=false` génère des métadonnées `noindex,follow` pour un aperçu ; `robots.txt` laisse l'exploration possible pour que cette directive puisse être lue.

### 8.3 GEO : clarté et vérifiabilité des informations
- Prévoir des réponses directes à des questions concrètes, des sections autonomes et des termes cohérents pour les compétences et les fonctionnalités.
- Garder les informations importantes dans le texte HTML visible aux parents. Les données structurées doivent refléter ce texte ; aucun contenu destiné uniquement aux robots ni instruction visant à manipuler une réponse IA n'est ajouté.
- Le GEO désigne ici la facilité d'exploration, de compréhension et de référence des contenus par les moteurs de réponse. Il ne constitue pas une certification et ne garantit ni citation, ni positionnement, ni indexation.
- Références techniques : [Google — fonctionnalités IA et site web](https://developers.google.com/search/docs/appearance/ai-features), [Google — bases du référencement JavaScript](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics).

### 8.4 Vérifications et conditions de mise en ligne
- Les tests vérifient le contenu HTML sans JavaScript, les titres distincts, les liens internes, les URL canoniques, le sitemap, le JSON-LD et la correspondance entre FAQ visible et structurée. Ils vérifient aussi la configuration de désindexation d'un aperçu.
- Avant de déclarer le référencement opérationnel, publier sur le domaine retenu, vérifier les réponses HTTP et les redirections de l'hébergeur, la disponibilité publique des pages, le certificat HTTPS, les directives de robots et l'origine canonique.
- Contrôler ensuite le rendu dans les navigateurs cibles, les données structurées et la découverte des URL par les outils des moteurs. Le suivi d'indexation nécessite un accès propriétaire aux outils concernés ; il n'est pas configuré par le prototype.
- Aucun succès de test local ne vaut preuve d'indexation ou de citation par un moteur de recherche ou une IA.


## Exploration libre « Découvrir »

Un bouton livre « Découvrir », distinct et secondaire par rapport à « Jouer », ouvre un espace sans score, limite de temps ni modification de la mission, du niveau ou de l’historique. Le bouton maison permet de retrouver la mission conservée.

Trois cartes illustrées donnent accès aux lettres, aux syllabes et au jeu « Écoute et trouve ». Chaque écran propose une flèche de retour et un guidage oral rejouable. Les réglages de lecture sont conservés ; les cartes sont utilisables au clavier.

- **Lettres** : les 26 lettres en majuscules et minuscules, plus 18 formes accentuées ou complémentaires. Toucher une carte prononce le nom de la lettre ; il ne s’agit pas d’enseigner le phonème isolé de chaque consonne.
- **Syllabes et mots** : 124 entrées accessibles par un index de débuts (b, br, ch, m…). Une carte « on · ou » ouvre les entrées sans consonne initiale. La sélection ouvre uniquement les syllabes correspondantes dans une grille aérée, sans flèches de pagination ni sélection préalable de complexité. Le début sélectionné est conservé au retour des mots. Toucher une syllabe la prononce et ouvre ses mots associés. Toucher un mot prononce le mot entier ; le segment associé est surligné. Le corpus associé comprend 697 mots distincts, avec au moins six exemples par syllabe et repose sur des segments renseignés explicitement, sans recherche approximative de sous-chaînes.
- **Écoute et trouve** : un mot est prononcé et doit être retrouvé parmi trois mots écrits. Le haut-parleur permet de le réécouter. Une erreur grise le choix et invite à réessayer, sans pénalité ; après deux erreurs, la bonne réponse est encadrée. Après réussite, une coche et une grande flèche permettent de passer à un autre mot. Le mot cible ne se répète pas immédiatement.

La bibliothèque est éditoriale et extensible, sans prétention d’exhaustivité des syllabes françaises. Les découpages, illustrations et prononciations contextuelles doivent être validés pédagogiquement. La synthèse vocale dépend des voix du navigateur ; les noms des lettres et les syllabes sont distincts des phonèmes. L’écoute explicite réactive le son ; sans API vocale, ou après une erreur signalée par la synthèse, les réponses du quiz restent désactivées jusqu’à une nouvelle écoute. Des enregistrements français validés restent souhaitables.

Dans « Écoute et trouve », le compagnon choisi apparaît après une réponse : cœur d’encouragement après une erreur, sourire et étoiles après réussite. Il reste petit et sans animation, puis disparaît au mot suivant pour laisser la place à l’écoute et aux choix.


### Navigation simplifiée

L’état sonore est visible avec un haut-parleur actif ou barré. Les lettres sont visibles dans un alphabet aéré ; les syllabes se trouvent par leur début, sans pagination. Les mots restent présentés six par six. Aucun groupe n’est proposé à l’enfant. Les consignes d’accueil sont courtes. Les réglages enfant exposent la taille et l’espacement ; police, interligne et aides sont repliés dans la partie adulte.

Le bouton Retour du navigateur et les flèches internes retrouvent les écrans précédents pendant la visite, avec leurs pages de cartes et sélections. Les résultats ne sont jamais annulés par ce retour, et une mission terminée ou abandonnée n’est pas restaurée. Le rechargement revient à l’accueil avec la progression locale conservée. La validation auprès d’enfants et les vérifications visuelles sur appareils restent nécessaires.

Depuis un exercice, le bouton inférieur de « Choisis ton niveau » affiche un triangle et revient directement au jeu : le même niveau conserve la mission et sa position ; un niveau différent lance une nouvelle mission au niveau choisi. Depuis l’accueil, ce bouton conserve la maison et revient à l’accueil.

Le catalogue proposé dans Découvrir est limité aux syllabes disposant d’au moins six exemples distincts et explicitement associés. Les anciennes entrées sans suffisamment d’exemples ont été retirées de la liste enfant. Les mots restent affichés six par six ; certains sons ont plusieurs graphies, par exemple « noi » et « noy » dans « noyau », avec le segment réellement écrit surligné. Les exemples restent à valider pédagogiquement.

Dans Découvrir, les cartes composées d’une seule lettre sont réservées à la rubrique Lettres. La liste Syllabes présente uniquement des cartes d’au moins deux lettres, chacune accompagnée d’au moins six mots. Ce choix organise la navigation enfant ; il ne constitue pas une définition linguistique de la syllabe.

Après une réussite dans les exercices de fondation, la voix répète la cible (lettre, syllabe ou mot), attend 450 ms après la fin de sa prononciation, puis dit « Bravo ! ». Cela vaut aussi pour la dernière réponse de la mission. Une navigation, une nouvelle écoute ou la coupure du son annule la félicitation en attente. Les consignes de lancement et de réessai restent limitées à la cible seule.

Dans les exercices de choix d’une syllabe, la réécoute utilise un grand pictogramme haut-parleur au côté du compagnon discret. L’ensemble forme un seul bouton, sans dépendre de la lecture d’un libellé et sans ajouter une seconde commande au même niveau.

Les « Bravo ! » utilisent quatre variations légères de hauteur et de débit, sans répétition immédiate de la même combinaison. La voix française et son volume restent identiques ; la prononciation des lettres, syllabes et mots conserve ses réglages habituels. La pause de 450 ms avant la félicitation et son annulation lors d’une navigation sont conservées. Le rendu émotionnel dépend des capacités de la voix du navigateur.

La navigation directe remplace les anciennes pages de lettres et de syllabes. Le catalogue inclut désormais on, in, au, oi, chi, gui, gé, ju, le, me, pe, re, se, te, ve, ge et son. Il reste non exhaustif ; voir le [suivi de couverture](docs/catalogue-syllabes.md). Les tests garantissent six mots distincts pour chaque entrée proposée et l’accès à toutes les entrées par l’index.
