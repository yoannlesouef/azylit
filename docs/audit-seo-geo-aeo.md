# Audit SEO, GEO et AEO — 17 novembre 2026

Périmètre : code, construction statique, contenus et tests locaux. L’accès au domaine public n’a pas pu être confirmé depuis les outils de cette session. Cela ne prouve pas que le site est indisponible. Aucun accès à Search Console ou Bing Webmaster Tools, aucune mesure Core Web Vitals ni observation de citations dans un moteur de réponse n’a été effectué.

## Conclusion

Les fondamentaux techniques étaient déjà présents : pages HTML adultes, liens, canoniques, redirections et sitemap. Les corrections portent sur la précision des contenus, la compréhension des pages, les aperçus de partage et les prévisualisations. Elles ne constituent ni une garantie d’indexation ou de positionnement ni une certification GEO/AEO.

Les recommandations Google pour les fonctionnalités d’IA s’appuient sur les fondamentaux du référencement, l’accessibilité du contenu et sa cohérence. Aucun balisage spécifique supplémentaire n’est requis : [Google Search — AI features and your website](https://developers.google.com/search/docs/appearance/ai-features). L’audit n’ajoute donc pas de fichier ou de données structurées prétendant garantir une citation IA.

## Points corrigés

| Priorité | Constat | Correction | Vérification |
| --- | --- | --- | --- |
| Haute | Plusieurs titres visibles étaient vagues et ne décrivaient pas le sujet de la page | H1 explicites : jeux de lecture, démarche, accessibilité, données, questions et enseignants | Un H1 par page et titres uniques testés |
| Haute | La présentation du produit manquait de précision en début de page Parents | Introduction définissant le site, ses lettres/sons/syllabes, ses missions et son statut de prototype | Contenu HTML vérifié sans JavaScript |
| Haute | Le palier Sons pouvait laisser penser que toutes les lettres étaient couvertes | Intitulé Premiers sons ; FAQ et description limitant explicitement la couverture à a, i, o, u | Cohérence du texte et tests du jeu |
| Haute | Les prévisualisations reposaient uniquement sur un réglage manuel d’indexation | Noindex automatique lorsque CF_PAGES_BRANCH diffère de PRODUCTION_BRANCH (main par défaut), métadonnées et X-Robots-Tag Cloudflare | Environnements de test et branche de production personnalisée testés |
| Haute | Un aperçu désindexé pouvait encore annoncer ses pages dans le sitemap | Sitemap sans URL et absence de référence Sitemap dans robots.txt pour cet aperçu ; exploration autorisée pour permettre la lecture du noindex | Tests des fichiers générés |
| Moyenne | L’image de partage manquait | PNG local 1200 × 630, métadonnées Open Graph et Twitter, textes alternatifs | Dimensions, fichier et type MIME testés ; image inspectée visuellement |
| Moyenne | Les pages adultes longues étaient difficiles à parcourir directement | Sommaire repliable, liens d’ancrage, fil d’Ariane visible cohérent avec la structure | Cibles d’ancrage et liens testés |
| Moyenne | Les sources et l’état de validation pouvaient être mieux exposés | Liens CSEN sur la démarche, lien vers le code et son historique, rappel du statut de prototype | Liens HTML et limites visibles |
| Moyenne | Les mises à jour n’étaient pas décrites dans les données structurées ou le sitemap | dateModified et lastmod issus de la date éditoriale du contenu, sans modification automatique à chaque build | Dates cohérentes testées |
| Moyenne | La nature de l’application était peu décrite pour les machines | Entité WebApplication liée à l’accueil, catégorie éducative, exigences navigateur et langue | JSON-LD parsé ; aucune note, revue, tarification ou affiliation inventée |
| Moyenne | Les questions structurées n’avaient pas de lien direct vers leur réponse visible | Identifiants de questions correspondant aux ancres HTML | Correspondance FAQ visible / JSON-LD testée |
| Moyenne | Quelques descriptions du modèle et du choix du niveau étaient dépassées | Description du modèle selon la mécanique et comportement réel des boutons corrigés | Contenus générés et suite de tests |

## Bases conservées

Les informations adultes restent sur des pages distinctes, accessibles sans JavaScript. L’accueil et les exercices ne reçoivent pas de blocs de texte destinés aux moteurs. Tous les visiteurs reçoivent le même contenu, sans version réservée aux robots. L’absence de longs textes sur l’accueil est un choix d’ergonomie ; les pages Parents, Enseignants et les pages communes portent les explications détaillées.

Les nouvelles adresses racine sont les seules URL canoniques du sitemap. Les anciennes adresses sous /parents/ redirigent en 301. Les pages absentes retournent une véritable erreur 404. Les pages adultes se relient entre elles et les accès Parents/Enseignants restent dans l’en-tête d’accueil, hors des écrans de travail.

Les FAQ structurées décrivent les questions réellement visibles. Leur présence n’implique pas l’éligibilité ou l’affichage d’un résultat enrichi Google. Les fonctions prévues, comme le bilan enseignant par compétence, ne sont pas annoncées comme déjà disponibles.

## Contrôles à effectuer après déploiement

1. Vérifier les réponses HTTPS de l’accueil, des six pages publiques, de robots.txt, du sitemap et de l’image de partage, ainsi que les redirections des anciennes adresses.
2. Contrôler qu’aucun réglage Cloudflare, règle de pare-feu ou protection de robots ne bloque involontairement les moteurs souhaités. Le fichier robots.txt du dépôt ne prouve pas le comportement de l’infrastructure.
3. Vérifier que la production n’a pas de noindex ; vérifier l’inverse sur une prévisualisation. Si la branche de production change, renseigner PRODUCTION_BRANCH.
4. Vérifier la propriété du domaine dans Search Console et Bing Webmaster Tools, soumettre le sitemap et inspecter quelques URL. La validation de propriété exige des informations propres au propriétaire et ne peut pas être inventée dans le code.
5. Examiner le HTML retenu par les moteurs, les données structurées et les aperçus de partage. Mesurer les performances réelles sur mobile avant toute conclusion sur les Core Web Vitals.
6. Suivre les requêtes, impressions, pages indexées et éventuelles citations IA disponibles, sans présenter leur variation comme une preuve d’efficacité pédagogique.
7. Continuer à enrichir les contenus avec des exemples utiles et relus, sans pages répétitives par mot-clé ni promesse d’adaptation ou d’efficacité non vérifiée.

## Références

- [Google : fonctionnalités IA et sites web](https://developers.google.com/search/docs/appearance/ai-features) — fondamentaux SEO, texte accessible et cohérence des données structurées ; aucune présence garantie.
- [Google : liens explorables](https://developers.google.com/search/docs/crawling-indexing/links-crawlable) — liens HTML et ancres compréhensibles.
- [Bing : Webmaster Guidelines](https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a) — découverte, compréhension et qualité des contenus pour la recherche et les expériences IA.
- [Cloudflare Pages : en-têtes personnalisés](https://developers.cloudflare.com/pages/configuration/headers/) — fichier _headers utilisé pour les prévisualisations.

Le fichier scripts/generate-share-image.swift est un outil facultatif de création de l’image sur macOS. Le PNG est versionné ; le déploiement conserve uniquement son prérequis Node.js.

## Complément du 18 novembre 2026

Ajout de `/ulis/` et `/aesh/` : deux contenus distincts, sources institutionnelles, exemples d’usage, limites et trois questions-réponses chacun. Les fonctions présentes ne sont pas assimilées à une efficacité pédagogique démontrée. La navigation adulte, les liens, les canoniques et le sitemap couvrent désormais huit pages d’information. Les tests vérifient l’absence de lien supplémentaire vers ces pages dans le contrôleur enfant. Les contrôles du domaine public restent à faire.
