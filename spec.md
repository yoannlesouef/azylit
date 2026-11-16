# Spécification Technique et Fonctionnelle — Azyl.it (`www.azyl.it`)
**Version :** 1.0.2  
**Domaine cible :** `https://www.azyl.it`  
**Objet :** Application web éducative et inclusive d'apprentissage et d'entraînement à la lecture (compétences équivalentes CP à CM2), conçue selon les principes de la Conception Universelle de l'Apprentissage (CUA) pour les enfants avec ou sans troubles neurodéveloppementaux (TND).

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

## 2. Architecture Technique Recommandée

### 2.1 Stack Front-End & Hébergement
- **Framework :** Next.js (App Router) ou Astro + React/TypeScript (rendu statique rapide et hydration légère, idéal pour déploiement sur **Cloudflare Pages**).
- **Styling :** Tailwind CSS avec variables CSS dédiées au moteur d'accessibilité (`--font-reading`, `--letter-spacing`, `--line-height`, `--word-spacing`).
- **État et Persistance :** Zustand (ou React Context) synchronisé avec `localStorage` + API légère (Cloudflare Workers + D1/KV) requise pour la synchronisation par **Code Avatar à 4 chiffres**. Le profil et la progression sont sauvegardés localement immédiatement, sans attendre le réseau ; la synchronisation distante reprend dès que la connexion est disponible.
- **Audio & Synthèse Vocale (TTS) :**
  - Priorité 1 : Fichiers audio pré-générés (MP3/Opus statiques sur R2/CDN) pour les consignes fixes, les phonèmes isolés et les encouragements des super-héros (garantit une prononciation française parfaite des sons comme `/ʃ/`, `/ɔ̃/`, `/u/`).
  - Priorité 2 (Fallback) : Web Speech API (`window.speechSynthesis`, `lang: 'fr-FR'`, `rate: 0.9`) pour les textes dynamiques.

### 2.2 Conformité RGPD Mineurs (< 15 ans)
- **Zéro donnée personnelle (PII) :** Aucune collecte de nom, prénom, adresse e-mail, date de naissance, établissement scolaire ou géolocalisation.
- **Identification anonyme :**
  - À la première visite, génération immédiate d'un profil local dans `localStorage`.
  - Attribution d'un **Code Avatar à 4 chiffres** (ex. `4829` + icône du super-héros choisi) permettant à l'enfant ou à l'enseignant/parent de retrouver la progression synchronisée sur un autre appareil sans création de compte. Cette récupération nécessite une connexion et une sauvegarde distante réussie ; l'interface indique clairement l'état de synchronisation.
  - Aucun cookie publicitaire ni tracker tiers.

---

## 3. Parcours Utilisateur (User Flow)

### 3.1 Onboarding (Première visite)
1. **Choix du Mentor Super-Héros (Obligatoire) :**
   - L'enfant choisit parmi 4 archétypes de super-héros inclusifs (ex. *Nova l'Éclair*, *Atlas le Gardien*, *Lyra la Exploratrice*, *Zéphyr le Stratège*).
   - Ce choix applique un thème chromatique doux, contrasté et adapté (couleurs primaires d'accentuation, illustrations du compagnon).
   - Le design doit être clair, moderne, attrayant et adapté aux enfants. Les illustrations et animations servent la compréhension et la motivation sans surcharger l'écran. Chaque type d'exercice comporte une mécanique ludique adaptée à la compétence travaillée. La lisibilité, la compréhension des interactions et l'intérêt des activités doivent être vérifiés lors d'essais avec des enfants représentatifs des publics cibles.
2. **Détermination du Niveau de Départ (2 options au choix) :**
   - **Option A — Choix direct valorisé :** Sélection parmi 4 paliers valorisants :
     1. *Niveau 1 : Apprenti Décodeur* (Sons, syllabes et premiers mots)
     2. *Niveau 2 : Explorateur de Phrases* (Lecture fluide et mots fréquents)
     3. *Niveau 3 : Détective des Mots* (Accords, familles de mots et sens)
     4. *Niveau 4 : Maître des Histoires* (Compréhension fine et énigmes)
   - **Option B — Mini-jeu de calibrage (2 minutes max) :** Parcours adaptatif de 5 écrans au maximum, sans score ni jugement affiché : deux épreuves de reconnaissance graphème-phonème, puis une lecture de mot, une phrase à trou et une micro-inférence. Les épreuves suivantes peuvent être omises si elles sont trop difficiles ; le parcours propose un palier de départ à partir des réponses obtenues, sans présenter ce résultat comme une mesure définitive du niveau. La durée totale ne dépasse pas 2 minutes ; à son terme, proposer un palier à partir des réponses disponibles, avec possibilité de choix direct si elles sont insuffisantes. Les consignes restent vocalisées et rejouables ; les épreuves phonologiques conservent les sons nécessaires, dans le respect du réglage `Muet / Audio`.

### 3.2 Déroulement d'une Mission (Session de travail)
- **Structure fixe :** `1 Mission = 8 micro-exercices` (durée cible : **4 à 6 minutes**).
- **Mode Focus (Plein écran) :**
  - Dès le lancement d'une mission, masquage de toute navigation secondaire, menu, pied de page ou lien externe.
  - Un seul exercice affiché à la fois, occupant le centre de l'écran.
  - **En-tête minimaliste :**
    - Bouton `Quitter` (retour sécurisé à l'accueil avec confirmation simple).
    - **Jauge de progression visuelle finie :** 8 étoiles ou boucliers alignés s'allumant un à un (indispensable pour rassurer les enfants TDAH et TSA sur la durée restante).
    - Bouton `Muet / Audio` (toujours accessible, grande taille).
    - Bouton `Réglages Dys` (tiroir d'accessibilité rapide).

---

## 4. Moteur d'Accessibilité « Dys / TDC »

Le moteur d'accessibilité est configurable à tout moment via un panneau dédié et sauvegardé dans le profil enfant.

### 4.1 Typographie et Espacement
- **Polices disponibles :**
  - `Andika` (par défaut — sans empattement, caractères non ambigus `b/d/p/q`).
  - `Lexend` (optimisée pour la fluence visuelle).
  - `OpenDyslexic` (en option activable).
- **Paramètres ajustables :**
  - Taille de police : `Normal (22px)`, `Grand (28px)`, `Très Grand (34px)`.
  - Interligne : minimum `1.6` (extensible à `2.0`).
  - Espacement inter-lettres (`letter-spacing`) : `+0.05em` par défaut (extensible à `+0.12em`).
  - Espacement inter-mots (`word-spacing`) : `+0.25em` par défaut.

### 4.2 Aides Visuelles à la Lecture (Règles de cloisonnement strictes)
Chaque aide est activable/désactivable indépendamment en 1 clic :
1. **Coloration syllabique :** Alternance bleu (`#1D4ED8`) / rouge (`#B91C1C`) par syllabe orale.
2. **Lettres muettes grisées :** Affichage en gris atténué (`#9CA3AF`) des lettres finales non prononcées (ex. *cha**t***, *ils mange**nt***).
3. **Mise en évidence des graphèmes complexes :** Soulignement léger ou teinte dédiée sur les digrammes/trigrammes (`ou`, `on`, `an`, `en`, `in`, `ch`, `oi`, `eau`, `ph`).
4. **Règle de lecture (Masque horizontal) :** Bandeau translucide focalisant l'attention sur la ligne survolée ou sélectionnée. Disponible pour tout texte de lecture pertinent, quel que soit le niveau, notamment les paragraphes du niveau 2.

> **RÈGLE CRITIQUE DE CLOISONNEMENT :**  
> Les aides visuelles (coloration syllabique, lettres muettes, sons complexes) s'appliquent **exclusivement aux corpus de lecture** (`<ReadingText />`). Elles doivent être **automatiquement désactivées** :
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
- **Musique de fond :** **Strictement bannie** pendant la lecture et la réflexion.
- **Commande audio globale :** Le bouton `Muet / Audio` est présent et accessible sur tous les écrans, y compris l'accueil, le choix du héros et du niveau, le positionnement, les exercices, les réglages et la célébration. Son état est conservé dans le profil. Le mode muet coupe les voix, les bruitages et tout autre son ; les consignes et feedbacks restent disponibles visuellement. Un exercice nécessitant l'écoute propose de réactiver l'audio ou de choisir une activité sans écoute obligatoire. En positionnement, une épreuve non réalisable en mode muet n'est jamais comptée comme une erreur ; proposer le choix direct du niveau si les réponses disponibles ne suffisent pas.
- **Audio utile systématique :**
  - Toutes les consignes et tous les feedbacks écrits (indices, corrections, encouragements et bilans) sont doublés d'une voix off claire et naturelle, rejouable au clic. La consigne est lue automatiquement à l'affichage de chaque exercice lorsque l'audio est activé.
  - Bouton haut-parleur large à côté de chaque consigne, feedback écrit et mot-clé pour réécouter à volonté. Le réglage `Muet / Audio` reste toujours accessible et interrompt toute lecture vocale en cours.
  - Prononciation isolée des phonèmes au clic dans les exercices de Niveau 1.
  - Bruitages doux, non stridents, pour la validation d'une réponse.

---

## 5. Architecture Pédagogique & Catalogue des Exercices

Le contenu est structuré en **4 niveaux de compétence** avec pour objectif de couvrir l'intégralité des apprentissages de lecture du CP au CM2. Cette couverture doit être démontrée par la matrice et la validation prévues en section 5.1 avant d'être déclarée complète.

### Niveau 1 : Conscience Phonologique & Décodage (*Apprenti Décodeur*)
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


### 5.1 Vérification de la couverture pédagogique
- Maintenir une matrice de couverture reliant chaque compétence de lecture visée sur le périmètre CP–CM2 à un ou plusieurs types d'exercices, aux contenus disponibles et aux critères de réussite observables.
- Pour chaque compétence, préciser les prérequis, la difficulté progressive, les aides autorisées et des exemples de contenus validés pédagogiquement.
- Le catalogue ci-dessus constitue la base de cette matrice ; ajouter des variantes ou des types d'exercices si la vérification révèle une compétence non couverte. L'exhaustivité ne peut pas être déclarée sur la seule présence des quatre niveaux.
- Avant de déclarer la couverture complète, vérifier qu'aucune compétence visée ne reste sans contenu ni critère de réussite et faire valider la matrice pédagogiquement. Les références aux classes restent réservées à la documentation pédagogique et ne sont jamais affichées dans l'interface enfant.

---

## 6. Système de Récompense et Gestion de l'Erreur

### 6.1 Traitement bienveillant de l'erreur (Zéro punition)
- **En cas d'erreur :**
  - Jamais de croix rouge agressive, de buzzer négatif ni de perte de points/vies.
  - Animation douce de tremblement horizontal sur l'option choisie + indice vocal/visuel fourni par le super-héros (ex. : *"Écoute bien le début du mot : [f] comme fusée"*).
  - Pour les choix multiples, la mauvaise réponse devient grisée et non cliquable ; pour les autres interactions, une correction reste possible avec un indice adapté.
  - L'effort est explicitement valorisé dès l'erreur par un encouragement discret, écrit et vocalisé (ex. : *"Tu as essayé, cherchons ensemble !"*).
  - Après deux tentatives incorrectes, proposer une aide guidée montrant la démarche puis une action simple pour terminer l'étape avec accompagnement. L'enfant peut aussi demander cette aide plus tôt ; aucune étape ne doit le bloquer dans une boucle d'échecs.
  - Une étape terminée avec accompagnement allume son étoile et permet de poursuivre la mission sans perte de récompense. La progression distingue une réussite autonome d'une réussite accompagnée pour adapter les exercices suivants.

### 6.2 Calibrage des félicitations des Super-Héros
- **Pendant la mission (écrans 1 à 8) :**
  - **Micro-encouragement discret :** Petite bulle vocale/textuelle courte du super-héros dans un coin non intrusif (ex. *"Bien vu !"*, *"Super décodage !"*) et allumage de l'étoile correspondante dans la barre de progression. L'animation visuelle dure moins de `1.5 seconde` pour ne pas casser la concentration (TDAH). La voix peut se terminer au-delà de ce délai ; le feedback reste consultable et rejouable. Aucune nouvelle consigne vocale ne se superpose à un encouragement : le passage volontaire à l'exercice suivant interrompt l'encouragement avant de lire la nouvelle consigne.
- **En fin de mission (après le 8ème exercice) :**
  - **Célébration complète :** Animation riche du super-héros choisi, attribution d'un badge de compétence ou d'une pièce d'équipement pour le héros, récapitulatif positif des progrès et des efforts, y compris après des réussites accompagnées, et proposition claire : *"Faire une nouvelle mission"* ou *"Faire une pause"*.

---

## 7. Modèle de Données JSON (Schéma d'un Exercice)

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
