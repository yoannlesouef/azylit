# Retours rapportés et recette d’écoute

## 25 novembre 2026 — Silence au premier lancement sur mobile

Un silence après le premier clic sur Jouer a été rapporté sur Pixel 8 et sur un second mobile non précisé. L’audit du code publié a retrouvé une attente des voix limitée à 700 ms, sans surveillance du démarrage effectif de la synthèse.

Le site prépare désormais la liste des voix dès l’ouverture. Si elle est vide, la première demande française est envoyée pendant le clic ; les voix tardives sont surveillées par événement et par vérification périodique. Une demande encore silencieuse peut être remplacée lorsque la voix française devient disponible. Une lecture commencée n’est pas relancée. Après huit secondes sans démarrage, un bouton « Réessayer le son » est affiché. La navigation et le mode muet annulent les attentes et relances.

Tests logiciels : premier clic avec liste vide, voix arrivant après 1,2 seconde, absence d’événement de chargement, moteur silencieux, réessai et annulation. Ces tests simulent le moteur ; la sortie sonore physique du Pixel 8 reste à vérifier sur l’appareil après publication, lors d’une nouvelle visite puis du premier clic sur Jouer.

## 19 novembre 2026 — Voix trop rapide et robotique

Retour transmis par le porteur du projet : « la voix est trop rapide et trop robot ». Une voix plus humaine, enfantine et moins rapide est demandée. Aucun nombre d’enfants, âge, appareil, navigateur, nom de voix ou enregistrement n’a été fourni. Ne pas inventer de résultats d’observation ou présenter ce retour comme une validation systématique.

### Modifications livrées

- Débit synthétique par défaut : 0,8 au lieu de 0,97. Trois choix adultes : 0,7, 0,8 et 0,9. Le débit est une consigne au moteur ; sa perception varie selon la voix.
- Sélection française privilégiant les noms indiquant une qualité naturelle ou améliorée plutôt que les voix compactes. Le nom ne garantit ni la qualité ni l’âge. Une voix d’enfant disponible peut être sélectionnée ; aucun nouvel enregistrement enfant n’a été créé.
- Préécoute, choix sauvegardé, remplacement automatique français si la voix n’est plus disponible et mise à jour des voix chargées après ouverture. Aucun nouveau bouton enfant.
- Bravo moins rapides, quatre variations modérées, après répétition de la cible puis 450 ms de pause. Une nouvelle écoute, la navigation ou le mode muet annulent la suite en attente.
- Bilan descriptif local dans l’historique adulte, sans effet sur les exercices proposés.

### Nouvelle écoute à réaliser

Sur les appareils réellement utilisés par les enfants, écouter une lettre, ma/mi, un mot, une courte consigne puis la répétition suivie de Bravo. Commencer au débit par défaut ; ne changer qu’un réglage à la fois. Avec l’enfant, comparer les voix françaises effectivement disponibles et noter celle qu’il comprend et préfère. Vérifier aussi la réécoute, le mode muet, l’arrêt et le retour au jeu.

Observer les demandes de réécoute, la compréhension de la cible et le confort rapporté, sans imposer un délai ni attribuer une erreur à une panne audio. Noter seulement le contexte technique utile et des observations anonymes ; aucun enregistrement ou identifiant d’enfant n’est nécessaire.

**État : nouvelle écoute non réalisée dans cette livraison.** Les tests logiciels simulent le moteur vocal ; ils ne prouvent pas le rendu humain ou une voix adaptée à tous les enfants.

### Dépendances restantes

Les enregistrements de l/r/f/j, leur relecture, les écoutes sur appareils et l’intégration progressive restent ouverts. Une voix enfantine identique sur tous les appareils nécessite des fichiers produits avec un service adapté ou une voix enregistrée, puis une vérification des prononciations et des droits. Un service de création vocale a été proposé, mais n’est pas connecté au moment de cette livraison.

## 22 novembre 2026 — Accueil en paysage et accès à l’apprentissage

Retours transmis par le porteur du projet : l’accueil demande de faire défiler la page sur certains téléphones et tablettes en paysage ; « Découvrir » paraît moins important que « Jouer » et son nom est moins clair.

### Modifications livrées

- « Découvrir » devient « Apprendre » sur l’accueil et dans le titre du parcours libre.
- Jouer/Continuer et Apprendre utilisent désormais deux boutons principaux de même taille et de même poids visuel.
- Sur les écrans de faible hauteur en paysage, l’en-tête, le compagnon, les deux actions principales, le choix du compagnon et le niveau adoptent une composition compacte conçue pour rester dans la hauteur visible.
- La navigation adulte reste visible sur les paysages assez larges ; elle est masquée sur les téléphones en paysage afin de préserver les actions enfant, et réapparaît en portrait.

### Recette à réaliser

Vérifier sans défilement l’accueil sur les appareils réellement utilisés, au minimum en 667 × 375, 844 × 390 et 1024 × 600 pixels, ainsi qu’avec les zones sûres du navigateur. Contrôler la lisibilité, les cibles tactiles, l’accès à Jouer, Apprendre, Mon compagnon et Mon niveau, puis faire pivoter l’appareil dans les deux sens. Cette adaptation logicielle ne remplace pas une nouvelle observation avec les enfants.
