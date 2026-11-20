# Kit de production et de relecture — pilote Premiers sons

Mise à jour : 18 novembre 2026. Ce kit est destiné aux adultes qui produisent et relisent les sons. Aucun enregistrement n’a été produit ou validé dans cette livraison.

## Quatre fichiers nécessaires au pilote

| Fichier proposé | Cible orale à vérifier | Exemple de repérage, à ne pas ajouter au fichier | État |
| --- | --- | --- | --- |
| /audio/sounds/fr-fr/l-v1.mp3 | /l/ ; pas le nom elle | lune, lama | À produire |
| /audio/sounds/fr-fr/r-v1.mp3 | /ʁ/, avec réalisation à discuter selon la variété de français | rue, radis | À produire |
| /audio/sounds/fr-fr/f-v1.mp3 | /f/ ; pas effe ni feu | fée, farine | À produire |
| /audio/sounds/fr-fr/j-v1.mp3 | /ʒ/ ; pas ji ni le son /j/ | jupe, joli | À produire |

La notation phonétique sert à la relecture humaine ; elle ne doit pas être envoyée à la synthèse vocale comme moyen de produire le son. Les voyelles a/i/o/u des propositions concurrentes ne sont pas prononcées dans ces huit questions : seul le fichier de la cible est joué. Les enregistrements vérifiés de ces voyelles restent à préparer pour remplacer ultérieurement la synthèse du parcours existant.

## Production

Chaque fichier contient une seule cible isolée, sans annoncer le nom de la lettre, sans mot d’introduction ni Bravo. Les mots du tableau servent à vérifier la correspondance avec le relecteur. La qualité de prononciation et l’intérêt de la réalisation retenue demandent une écoute humaine compétente.

Conserver un original de qualité, produire un MP3 pour le lecteur actuel et harmoniser le niveau sonore sans saturer. Éviter musique, bruit et grands silences. La consigne d’enregistrement doit être ajustée avec le relecteur ; ce document n’établit pas une norme acoustique validée.

Documenter qui a fourni le fichier, la provenance, les droits de diffusion, la version, le relecteur et la date. Aucune information sur un enfant n’est nécessaire. Si un fichier est remplacé après relecture, refaire le contrôle ; son empreinte SHA-256 doit correspondre exactement au fichier relu.

## Questions préparées pour la relecture

Ces essais de conception ne sont pas dans le jeu. Les noms de lettres et les mots exemples ne remplacent pas leur cible orale.

| Essai | Propositions | Réponse prévue | Cible phonétique | Relecture |
| --- | --- | --- | --- | --- |
| draft-sound-l-1 | l / a | l | l | En attente |
| draft-sound-l-2 | a / l | l | l | En attente |
| draft-sound-r-1 | r / i | r | ʁ | En attente |
| draft-sound-r-2 | i / r | r | ʁ | En attente |
| draft-sound-f-1 | f / o | f | f | En attente |
| draft-sound-f-2 | o / f | f | f | En attente |
| draft-sound-j-1 | j / u | j | ʒ | En attente |
| draft-sound-j-2 | u / j | j | ʒ | En attente |

Le relecteur vérifie la pertinence des correspondances, des distracteurs, de l’ordre proposé, de l’aide et du vocabulaire. Les deux positions de réponse sont prévues, sans nouvelle mécanique ni menu à apprendre.

## Contrôle avant activation

1. Relire les contenus et les huit essais. Renseigner les statuts dans content/sound-curriculum.mjs uniquement après cette relecture.
2. Placer les quatre fichiers dans app/audio/sounds/fr-fr/, puis documenter provenance, droits, relecture, écoute sur appareils et empreinte. Pour calculer celle d’un fichier présent : `shasum -a 256 app/audio/sounds/fr-fr/l-v1.mp3`.
3. Exécuter `npm run audit:sound-pilot`. La commande décrit les manques ; elle ne fait pas d’écoute automatique ni d’approbation pédagogique.
4. Après résolution de tous les manques, `npm run audit:sound-pilot -- --export` produit un fichier de revue dans artifacts/sound-pilot.json. Il ne modifie pas la banque du jeu. Les identifiants proposés commencent à f1-17, pour préserver f1-1 à f1-16.
5. Avant l’activation explicite : vérifier les fichiers réels sur les appareils cibles, l’autoplay après un geste, la réécoute, l’arrêt, le retour au jeu, le refus de lecture et l’absence de substitution TTS. Actualiser les effectifs publics si de nouveaux exercices sont livrés, puis observer l’usage avec les enfants.

Le lecteur et ses interactions sont testés avec des simulations. Ces tests ne prouvent pas la prononciation, la qualité acoustique ni l’ergonomie sur appareil. Le pilote reste désactivé tant que les fichiers et validations manquent.


## Activation raccordée — 20 novembre 2026

L’export reste utile pour la revue. Après production et approbations réelles, actualiser les informations publiques, puis passer `pilot` à true dans content/audio-release.mjs. Le build et le serveur local contrôlent le lot et génèrent son module ; il n’est plus nécessaire de recopier ses questions dans le moteur. Toute activation incomplète échoue. Les sauvegardes gardent les identifiants f1-17 à f1-24 ; la couverture plus large est réservée à f1-201 à f1-304.

Aucune activation n’a été faite : les fichiers sont toujours absents. Le nouveau mécanisme de bibliothèque vocale utilise content/voice-library.mjs pour les mots, consignes et félicitations ; il reste lui aussi vide et désactivé.
