# Audit de navigation enfant — 17 novembre 2026

Périmètre : revue des écrans, du contrôleur, des styles et des tests automatisés. Il ne s’agit pas d’un test en navigateur ni d’une validation auprès d’enfants. Les priorités ci-dessous sont des hypothèses ergonomiques à vérifier, notamment avec des enfants non lecteurs et ayant des difficultés d’attention.

## Changements réalisés avant l’audit

- « Mon niveau » sur l’accueil, « Choisis ton niveau » dans le sélecteur et repère court « 2 · Sons ».
- Bouton maison en bas des pages compagnon et niveau : validation puis accueil, sans démarrer de jeu.
- Voix adaptée à ce retour. Le choix du compagnon conserve une mission en cours. Valider un niveau différent abandonne le plan en cours, mais conserve les résultats déjà enregistrés.
- Les syllabes sont déjà limitées à six cartes par page ; le compagnon du quiz reste statique et apparaît après une réponse.

## Priorités proposées

| Priorité | Observation dans le code | Modification conseillée | Vérification attendue |
| --- | --- | --- | --- |
| Haute | Le bouton son affiche toujours le pictogramme barré, même lorsque le son est actif (`controls`). | Montrer un haut-parleur actif ou barré selon l’état ; conserver le même emplacement. | L’enfant retrouve le son coupé sans aide écrite. |
| Haute | L’alphabet expose 26 cartes simultanément ; certains mots associés à une syllabe sont nombreux. | Petites séries stables de six cartes et flèches ; conserver la page au retour, comme pour les syllabes. | Accéder à toutes les lettres et aux mots sans longue liste. |
| Haute | La bibliothèque peut afficher jusqu’à 200 groupes avec peu de repères autres que leurs numéros. | Montrer d’abord le groupe en cours et quelques groupes récents ; placer les anciens derrière un accès secondaire. | Reprendre et rejouer sans parcourir une grande grille. |
| Haute | Le bouton Retour du navigateur n’est pas relié aux écrans internes : aucune gestion de l’historique de navigation. | Relier les principaux écrans à l’historique et conserver les états de sélection. | Retour navigateur et retour visuel mènent au même écran sans perdre la mission. |
| Moyenne | Le guidage d’accueil explique simultanément Jouer, Découvrir, compagnon et niveau. | Une consigne d’action principale, puis une aide courte propre à chaque écran. | L’enfant identifie sa prochaine action après une seule écoute. |
| Moyenne | Les réglages exposent taille, espacements, interligne, police et aides ensemble. | Montrer quelques choix visuels simples, placer les réglages avancés dans la partie adulte. | Modifier le confort de lecture sans explorer tous les paramètres. |
| Moyenne | Le choix du niveau repose surtout sur un aperçu, des points et les symboles − / +. | Ajouter les libellés courts « Plus facile » et « Plus difficile », annoncés à l’oral ; conserver les images. | Comprendre la direction du changement sans connaître les symboles. |
| Moyenne | Au tout premier lancement, Jouer ouvre le compagnon ; sa validation revient désormais à l’accueil. | Conserver ce comportement demandé, mais annoncer « Ton compagnon est prêt. Touche Jouer. » au premier retour. | Comprendre que le choix est terminé et savoir comment commencer. |
| Moyenne | La validation d’un niveau différent remplace le plan de la mission en cours. | Expliquer oralement le changement avant validation, sans ajouter de fenêtre de confirmation. | Comprendre pourquoi l’accueil affiche Jouer au lieu de Continuer. |

## Points solides à conserver

Une action Jouer dominante, les explications parents séparées, de grandes cibles, l’absence de glisser-déposer obligatoire, la maison pour quitter immédiatement, les résultats sauvegardés, une seule flèche après réussite et les retours sans texte à lire. Le choix du compagnon ne doit pas lancer de mission. L’exploration libre ne doit pas modifier les résultats.

## Essais à prévoir

Sur téléphone et tablette, observer sans guider verbalement : lancer le premier jeu, changer de compagnon puis jouer, choisir plus facile, réactiver le son, écouter une syllabe puis revenir, retrouver un groupe et quitter un exercice. Relever les hésitations, erreurs de navigation, demandes d’aide et abandons. Vérifier aussi le clavier, le zoom et la réduction des animations. Ajuster les séries de cartes selon ces observations plutôt que présumer qu’une présentation convient à tous les enfants.


## Mise en œuvre des recommandations

Les recommandations de cet audit sont maintenant implémentées : pictogramme audio selon l’état ; lettres et mots par six ; groupe en cours et quatre autres groupes récents, puis anciens par six ; retour et avance du navigateur pour les écrans internes pendant la visite ; consigne d’accueil raccourcie ; taille et espacement visibles, réglages avancés repliés côté adulte ; libellés Plus facile / Plus difficile ; annonce du premier compagnon prêt et du remplacement d’un groupe lors du changement de niveau.

L’historique du navigateur conserve les écrans et les pages de cartes, sans restaurer d’anciens résultats. Une mission terminée ou abandonnée n’est pas ressuscitée par Retour. Le rechargement et le retour depuis une page parents réinitialisent la navigation à l’accueil ; la progression sauvegardée reste disponible. Les tests automatisés ne remplacent pas la vérification visuelle sur appareils ni les essais avec les enfants.

Mise à jour : les groupes ont ensuite été retirés de l’interface à la demande du porteur du projet. Les recommandations historiques relatives à leur bibliothèque sont donc remplacées par le lancement automatique des missions. L’audio des exercices de fondation prononce désormais la cible seule.

## Simplification de Découvrir — 18 novembre 2026

L’index d’initiales est remplacé par une seule page de lignes dépliables, avec des exemples concrets. La ligne ma/mi est ouverte au départ ; une seule ligne est développée à la fois. Depuis le choix Découvrir, deux clics ouvrent les mots de ma, au lieu de trois. Sur les mots, passer à une autre syllabe de la même série demande un seul clic au lieu d’un retour suivi d’une sélection. La cible porte un haut-parleur et un état sélectionné ; sa réécoute conserve le mot déjà écouté. Le retour retrouve la dernière cible et sa ligne ouverte.

Les tests couvrent les 124 syllabes accessibles, six mots par cible, les changements en place, l’historique et l’absence de modification de la mission. Les commandes restent de vrais boutons avec état annoncé et utilisation clavier native. Les vérifications visuelles à 320 px, au zoom, sur tablette et l’observation des enfants restent à réaliser ; aucune efficacité spécifique au TDAH n’est déclarée démontrée.
