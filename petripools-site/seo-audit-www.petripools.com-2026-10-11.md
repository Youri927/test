# Audit SEO + GEO : www.petripools.com (11 octobre 2026)

Audit en lecture seule du site actuel, fait avant la refonte. Rien n'a été modifié sur leur site.

## Résumé
- Pages vérifiées : 34 (sur 34 dans le plan du site `wp-sitemap.xml`)
- Problèmes critiques : 3
- Avertissements : 5
- Opportunités : 4

## CRITIQUE (à corriger tout de suite)
1. **Aucune meta description** : 34 pages sur 34. Google écrit alors son propre extrait, souvent pris dans le menu ou dans le pied de page.
   → Écrire une description de 100 à 160 caractères par page.
2. **Le même titre H1 sur toutes les pages** : « Dallas & Fort Worth Swimming Pool Repair & Pool Remodeling | Petri Pools » (le nom du site placé dans l'en-tête). Huit pages ont même deux H1 : la rénovation, le contact, le ré-enduit, l'article des conseils d'entretien, et les archives.
   → Un seul H1 par page, qui dit ce que contient la page.
3. **Aucune donnée structurée (JSON-LD)** : ni `LocalBusiness`, ni `Organization` (nom, adresse, téléphone, horaires, zones), ni `BlogPosting` pour les articles.
   → Ajouter au moins un bloc `HomeAndConstructionBusiness` (sous-type de `LocalBusiness`) sur l'accueil, avec l'adresse de Lewisville, le téléphone, les horaires, les villes desservies et les profils (`sameAs`).

## AVERTISSEMENTS
1. **Titres trop longs et répétés** : de 72 à 146 caractères. Tous commencent par la même phrase de 72 caractères, et la page du sujet n'arrive qu'à la fin. Deux pages portent le même titre (la rénovation et sa catégorie).
   → 30 à 60 caractères, le sujet de la page d'abord.
2. **Pas d'image de partage (`og:image`)** sur les 34 pages : un lien partagé sur Facebook ou par message s'affiche sans image.
3. **Images sans texte alternatif** : 9 sur 9 sur l'accueil, 23 sur 30 sur « About us », 5 à 8 par page ailleurs.
4. **Zoom bloqué sur téléphone** : `maximum-scale=1, user-scalable=no` dans la balise viewport. Un visiteur malvoyant ne peut pas agrandir la page. C'est aussi un problème d'accessibilité.
5. **Contenu mixte** : 5 icônes de l'en-tête sont appelées en `http://` sur une page `https://`.

## GAINS RAPIDES (fort impact, peu d'effort)
- Une meta description par page, et des titres courts.
- Le bloc `LocalBusiness` sur l'accueil.
- Un texte alternatif sur chaque photo de piscine.
- Retirer `user-scalable=no`.
- Mettre à jour le pied de page : il affiche « Copyright © 2019 », et des liens vers Google+, fermé en 2019.
- Ne plus indexer les pages vides ou techniques : `/callrail/`, `/thank-you/`, et les archives d'étiquettes (`/tag/sweet-tea-ribs/`…).

## OPPORTUNITÉS GEO
- **Robots.txt** : aucun robot bloqué. 13 robots testés (Googlebot, Bingbot, GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-SearchBot, Claude-User, PerplexityBot, Perplexity-User, Google-Extended, CCBot, Bytespider) sur 36 adresses publiques : tout est autorisé.
- **`/llms.txt`** : absent (404). Ce n'est pas une erreur. C'est une proposition de format, pas une norme, et les assistants IA le lisent inégalement. Un fichier court (services, zones, contact) ne coûte presque rien.
- **Contenu lisible par les IA** : le site est en HTML classique (WordPress), lisible sans JavaScript. En revanche, l'accueil ne contient presque aucun texte, seulement un diaporama et un slogan. Les assistants IA n'y trouvent ni les services, ni les villes, ni les avis.
- **Les avis clients** (une quarantaine, avec ville et prénom) sont sur une seule page, sans données structurées. Une FAQ courte reprenant les vraies questions des clients (délais, enduits, ce qu'ils ne font pas : la détection de fuites) donnerait des réponses citables. `geo-optimize` peut ajouter une FAQ à un article.

## NON VÉRIFIÉ
- Performance et mobile par PageSpeed Insights : pas de clé d'API PageSpeed. Lighthouse est passé à part, voir `ANALYSE.md`.
- Second analyseur de robots.txt (protego non installé) : un seul analyseur utilisé. Le fichier ne contient que `Disallow: /wp-admin/`, donc aucun écart possible entre analyseurs sur les pages publiques.

Maquinable propose un diagnostic payant avec le score de citabilité IA et le plan de corrections priorisé (voir le README du plugin).
