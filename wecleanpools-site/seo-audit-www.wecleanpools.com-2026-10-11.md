# Audit SEO + GEO : www.wecleanpools.com (11 octobre 2026)

Audit en lecture seule du site actuel, fait avant la refonte. Rien n'a été modifié sur leur site.

## Résumé
- Pages vérifiées : 16 (sur 16 dans le plan du site `sitemap.xml`)
- Problèmes critiques : 3
- Avertissements : 6
- Opportunités : 4

## CRITIQUE (à corriger tout de suite)
1. **Aucune donnée structurée (JSON-LD)** sur les 16 pages.
   - Il n'y a ni `LocalBusiness`, ni `Organization` : nom, téléphone, horaires, ville, licence.
   - → Ajouter un bloc `HomeAndConstructionBusiness` (sous-type de `LocalBusiness`) sur l'accueil, avec :
     - Arlington, le téléphone, les horaires du lundi au vendredi de 9 h à 17 h ;
     - les services et leurs prix publiés (entretien à partir de 185 $ par mois, vidange à partir de 595 $, filtres à 150 et 125 $) ;
     - l'année de création (1999).
2. **Des pages techniques dans le plan du site et dans l'index** : `/Test` (une page de test vide) et `/Search-Results`. Toutes deux portent la même description générique.
   - → Les retirer du plan du site et les passer en `noindex`.
3. **Deux adresses pour chaque service, sans URL canonique**.
   - Le menu et l'accueil pointent vers `/Service/Weekly-Service`, `/Service/Pool-Repairs`…
   - Le plan du site liste `/Services/Weekly-Service`, `/Services/Pool-Repairs`…
   - Les deux répondent 200, et aucune page n'a de `<link rel="canonical">`. Google voit deux fois le même contenu.
   - → Une seule adresse par service, une redirection 301 depuis l'autre, et une URL canonique sur chaque page.

## AVERTISSEMENTS
1. **Descriptions trop longues et bourrées de mots-clés.**
   - Elles font de 229 à 500 caractères : aucune n'est dans la plage utile de 100 à 160.
   - Celle de l'accueil se termine par une liste de mots-clés : « good pool cleaner, great pool cleaner, best pool cleaner, reliable pool cleaner, cheap pool cleaner, D's Pool Service ».
   - → Une phrase claire de 100 à 160 caractères par page.
2. **Titre de l'accueil de 114 caractères** (« Top-Rated Weekly Pool Maintenance in Arlington, TX | Expert Pool Remodels & Renovations in Dallas-Fort Worth (DFW) »). Celui du carrelage en fait 89.
   - → 30 à 60 caractères, le sujet d'abord.
3. **Balise `meta keywords` remplie de mots-clés** : ignorée par Google, mais elle signale un bourrage.
4. **Pas d'image de partage (`og:image`)** sur les 16 pages : un lien partagé par message ou sur Facebook s'affiche sans image.
5. **Contenu mixte** : un script appelé en `http://` (`html5shim.googlecode.com`, un service fermé) sur une page `https://`. Il est bloqué par les navigateurs et ne sert plus à rien.
6. **Images sans texte alternatif** : 2 sur la page de l'entretien hebdomadaire, 3 sur `/Test`. Les autres pages sont complètes.

## GAINS RAPIDES (fort impact, peu d'effort)
- Le bloc `LocalBusiness` sur l'accueil.
- Retirer `/Test` et `/Search-Results` du plan du site.
- Une description et un titre courts par page.
- Une seule adresse par service, avec une URL canonique.
- Retirer le script html5shim et la balise `meta keywords`.
- Ajouter la ligne `Sitemap:` dans `robots.txt` : elle y est en commentaire, avec l'adresse d'exemple du modèle (`http://www.DomainNamehere.com/sitemap.aspx`).

## OPPORTUNITÉS GEO
- **Robots.txt** : aucun robot bloqué.
  - 13 robots testés (Googlebot, Bingbot, GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-SearchBot, Claude-User, PerplexityBot, Perplexity-User, Google-Extended, CCBot, Bytespider) sur 18 adresses publiques : tout est autorisé.
  - Le fichier est celui livré par défaut avec DotNetNuke et ne bloque que des dossiers techniques.
- **`/llms.txt`** : absent (404).
  - Ce n'est pas une erreur. C'est une proposition de format, pas une norme, et les assistants IA le lisent inégalement.
  - Un fichier court (services et prix, Arlington, contact, licence) ne coûte presque rien.
- **Contenu lisible par les IA** : les pages sont en HTML, lisibles sans JavaScript.
  - En revanche, leurs points forts sont éparpillés : les prix, la licence vérifiable, le policier fondateur, ce que comprend l'entretien.
  - Une page d'accueil qui rassemble ces faits en phrases simples serait directement citable.
- **Une FAQ courte** reprenant leurs propres questions donnerait des réponses citables :
  - « Can you see the bottom of your pool? » ;
  - « What is your time worth? » ;
  - ce que comprend l'entretien, le prix d'un nettoyage de filtre ;
  - l'outil `geo-optimize` peut ajouter une FAQ à un article.

## NON VÉRIFIÉ
- Performance et mobile par PageSpeed Insights : pas de clé d'API PageSpeed. Lighthouse est passé à part, voir `ANALYSE.md`.
- Second analyseur de robots.txt : protego n'est pas installé, un seul analyseur a été utilisé. Le fichier ne bloque que des dossiers techniques (`/admin/`, `/App_Code/`, `/*/ctl/`…), sans écart possible sur les pages publiques.

Maquinable propose un diagnostic payant avec le score de citabilité IA et le plan de corrections priorisé (voir le README du plugin).
