# Audit SEO + GEO : prestigepoolsofwilmington.com (12 octobre 2026)

Audit en lecture seule du site actuel, fait avant la refonte. Rien n'a été modifié sur leur site.

Le site actuel est fait de pages PHP servies par Apache (« Site by Miller Interactive » en pied de page). Les liens internes pointent vers `https://www.prestigepoolsofwilmington.com` : c'est l'origine retenue pour l'audit.

Requêtes faites une par une, avec un agent utilisateur descriptif, à 1,5 s d'intervalle (puis 6 et 12 s pour les reprises).

## Résumé
- Pages vérifiées : 34, sur 35 trouvées en suivant les liens du site (il n'y a pas de plan du site). La 35e, `contact.php`, n'a renvoyé que la page de contrôle décrite plus bas.
- Problèmes critiques : 0
- Avertissements : 11
- Opportunités : 4

## CRITIQUE (à corriger tout de suite)
Rien de critique au sens strict : le site n'a pas de `robots.txt`, donc aucune page n'est bloquée par des règles pour Googlebot ou Bingbot.

Les deux premiers avertissements sont pourtant à traiter en priorité.

## AVERTISSEMENTS
1. **Un contrôle « humains » renvoie une page vide aux clients qui n'exécutent pas JavaScript.**

   Ce qu'on a observé :
   - la réponse est un code 409, avec une page de 83 octets ;
   - cette page ne contient qu'un script, qui pose un cookie `humans_21909=1` puis recharge la page ;
   - au premier passage (1,5 s entre deux pages), 10 pages sur 35 ont reçu cette réponse ;
   - en espaçant les requêtes de 6 s, 8 des 10 sont revenues normalement : le contrôle se déclenche quand les requêtes s'enchaînent ;
   - `contact.php` est restée en 409 aux quatre essais (1,5 s, 6 s, après une pause de 40 s, 12 s), et aussi avec l'outil de lecture web de Claude.

   Pourquoi c'est important :
   - la plupart des robots des assistants IA (ChatGPT, Claude, Perplexity) n'exécutent pas JavaScript ; quand le contrôle se déclenche, ils ne reçoivent rien ;
   - pour Google, une page qui répond 409 n'est pas indexée lors de ce passage.

   Ce qu'on n'a pas pu vérifier : le traitement des vrais robots, dont les adresses sont peut-être exemptées. On n'a pas envoyé de requêtes en se faisant passer pour eux.

   → Vérifier dans Google Search Console (Inspection de l'URL, « Tester l'URL en direct ») sur `contact.php` et quelques autres pages. Chercher les réponses 409 dans les journaux du serveur (Googlebot, Bingbot, GPTBot, ClaudeBot, PerplexityBot). Demander à l'hébergeur, ou à Miller Interactive, de retirer ce contrôle ou d'en exempter les robots vérifiés.
2. **Pas de balise `viewport` : le site n'est pas fait pour le téléphone.** Aucune des 34 pages n'a `<meta name="viewport">`. Sur un téléphone, la page s'affiche à la largeur d'un ordinateur, en tout petit. Or Google indexe d'abord la version mobile des sites.

   → Ajouter la balise seule ne suffit pas : la mise en page est à largeur fixe. Il faut une version qui s'adapte à l'écran, ce que fait la nouvelle version.
3. **Titres trop longs sur 34 pages sur 34, et six annoncent un service que l'entreprise ne propose pas.**
   - Ils font de 79 à 184 caractères. Tous commencent par « Prestige Pools of Wilmington, NC | » et la plupart finissent par le téléphone : Google les coupe vers 60 caractères.
   - Six pages se présentent comme « Vinyl Pool Builder » : about-us, eco-friendly, financing, installation, service et testimonials. Leur propre page « About us » dit pourtant : « Prestige only installs Latham fiberglass pools ».

   → Le service et la ville au début, moins de 60 caractères, sans téléphone. Exemple : « Fiberglass Pools in Wilmington, NC | Prestige Pools » (51 caractères).
4. **Même description sur 14 pages :** « Prestige Pools of Wilmington, NC - The preferred swimming pool builder for Wilmington, NC customers. »
   - Elle est sur l'accueil, about-us, gallery, giving-back, installation, service, spas, swimming-pools et six autres pages.
   - Quatre pages Pentair partagent une autre description.
   - Trois descriptions font moins de 100 caractères : cocktail-pool (79), eco-friendly (80), financing (84).

   → Une phrase par page, de 100 à 160 caractères, qui dit ce qu'on y trouve.
5. **Ni URL canonique, ni adresse unique.**
   - Aucune des 34 pages n'a de `<link rel="canonical">`.
   - `https://prestigepoolsofwilmington.com/` et `https://www.prestigepoolsofwilmington.com/` répondent tous deux 200 avec la même page : le site existe en double. Le passage de http à https, lui, redirige bien (301).

   → Rediriger l'adresse sans `www` vers celle avec `www` (301), et ajouter l'URL canonique dans l'en-tête commun.
6. **Pas d'image de partage (`og:image`) ni de titre de partage, sur 34 pages.** Un lien envoyé par SMS, sur Facebook ou dans une messagerie s'affiche sans photo.

   → Une image par défaut de 1200 × 630, par exemple une piscine éclairée le soir.
7. **254 images sans attribut `alt` sur 905** (47 autres ont un `alt` vide, ce qui convient aux images décoratives). La galerie est bien traitée (7 sur 398). Les pires pages :

   | Page | Images sans `alt` |
   |------|-------------------|
   | `/testimonials.php` | 26 sur 28 |
   | `/pentair-cleaning.php` | 19 sur 22 |
   | accueil | 17 sur 23 |
   | `/pentair-filters.php` | 16 sur 19 |
   | `/pentair-heating.php` | 14 sur 17 |
   | `/financing.php` | 11 sur 13 |
   | `/outdoor-lighting.php` | 11 sur 23 |
   | `/pentair-intellichlor.php` | 11 sur 14 |

   → Une courte description par photo utile (type de piscine, ce qu'on voit) ; `alt=""` pour les images de décor.
8. **Une phrase cassée en bas de chaque page :** « Prestige Pools of , provides new pool installation, fiberglass swimming pool installation, inground pool construction… ». Le nom de la ville manque, sur les 34 pages lues. C'est un paragraphe de mots-clés qui fait négligé et n'apporte rien.

   → Le corriger (« Prestige Pools of Wilmington, NC provides… ») ou le retirer.
9. **Des mots-clés meta sur les 34 pages, avec des noms d'autres entreprises :**
   - « parrot bay pools wilmington » et « Trilogy pools » ;
   - les anciens noms des marques Latham (« Viking Pools », « blue hawaiian pool dealer ») ;
   - des fautes (« swimmng », « Fiberglas »).

   Google ignore cette balise, mais n'importe qui peut la lire dans le code de la page.

   → La supprimer.
10. **Des titres `<h1>` génériques ou datés.** Chaque page en a bien un seul, mais :
    - « Viking Pools Fiberglass Swimming Pools » sur 4 pages : c'est l'ancien nom de la marque, devenue Latham ;
    - « Swimming Pool Equipment from Pentair » sur 5 pages ;
    - « Latest Swimming Pool Articles » sur la page eco-friendly, qui n'est pas une liste d'articles.

    → Un titre par page qui dit son sujet.
11. **Pas de `robots.txt` ni de plan du site** : les deux adresses répondent 404. Les moteurs découvrent les pages par les liens, mais aucun fichier ne leur indique la liste complète.

    → Un `robots.txt` qui autorise tout et déclare le plan du site, et un `sitemap.xml` avec les 35 pages.

## GAINS RAPIDES (fort impact, peu d'effort)
Le site est fait de pages qui partagent le même en-tête et le même pied de page : la plupart de ces corrections se font en un seul endroit.
1. Corriger ou retirer la phrase cassée du pied de page (avertissement 8) : une ligne, toutes les pages.
2. Retirer « Vinyl Pool Builder » des six titres et raccourcir le modèle de titre (avertissement 3).
3. Ajouter une image de partage par défaut et l'URL canonique dans l'en-tête commun, et rediriger l'adresse sans `www` (avertissements 5 et 6).
4. Supprimer la balise des mots-clés (avertissement 9) et ajouter `lang="en"` sur `<html>`, absent aujourd'hui.
5. Déposer un `robots.txt` et un `sitemap.xml` (avertissement 11).

## OPPORTUNITÉS GEO
1. **robots.txt : rien n'est bloqué, puisqu'il n'existe pas.**
   - 13 robots testés sur 36 adresses (les 35 pages et `/llms.txt`), 0 blocage :
     - Googlebot, Bingbot ;
     - GPTBot, OAI-SearchBot, ChatGPT-User ;
     - ClaudeBot, Claude-SearchBot, Claude-User ;
     - PerplexityBot, Perplexity-User ;
     - Google-Extended, CCBot, Bytespider.
   - Un seul analyseur utilisé, celui de Python (protego n'est pas installé). Sans fichier, les deux donneraient le même verdict.
   - Pour les robots IA, le vrai frein est le contrôle « humains » (avertissement 1), pas `robots.txt`.
2. **`/llms.txt` n'existe pas (404).** Un fichier court qui résume les faits aiderait les assistants :
   - depuis 1999 à Monkey Junction ;
   - uniquement des piscines Latham en fibre de verre ;
   - téléphone et horaires ;
   - les pages utiles.

   Rappel : `llms.txt` est une proposition, pas un standard. Les assistants IA ne le lisent pas tous.
3. **Aucune donnée structurée (JSON-LD) sur les 34 pages.** Un bloc `HomeAndConstructionBusiness` (sous-type de `LocalBusiness`) donnerait aux moteurs et aux assistants :
   - l'adresse, le téléphone et les horaires ;
   - le fondateur et l'année de création ;
   - la récompense WECT ;
   - les profils Facebook, Instagram et Houzz.

   Ne pas baliser leurs propres avis en étoiles : Google n'affiche pas les avis qu'une entreprise publie sur elle-même.
4. **Le texte est bien dans le HTML.** Les pages sont rendues par le serveur (de 1 146 à 10 870 caractères de texte visible), donc lisibles sans JavaScript, à condition que le contrôle « humains » laisse passer. Ce point est à garder.

### Ce que la nouvelle version (`prestigepools-site/`) règle déjà
- Une seule page qui s'adapte à l'écran, testée de 320 à 1440 px.
- Bloc `HomeAndConstructionBusiness` complet :
  - adresse, téléphone, courriel des ventes ;
  - horaires (lundi au vendredi de 8 h à 17 h, samedi de 10 h à 14 h) ;
  - fondateur Shane Kosnik, création en 1999 ;
  - récompense WECT Best of the Cape Fear 2024 et zone servie ;
  - catalogue des services ;
  - `sameAs` vers Facebook, Instagram et Houzz.
- Bloc `WebSite`. Pas de bloc `FAQPage` : la page n'a pas de foire aux questions visible, et Google exige que le contenu balisé soit visible tel quel.
- Titre de 60 caractères (« Fiberglass pools and spas in Wilmington, NC | Prestige Pools »), description de 140 caractères, URL canonique sur `www`.
- Un seul `<h1>`, un texte alternatif sur chaque photo, `lang="en"`, pas de mots-clés meta.
- Uniquement la fibre de verre Latham dans les titres et les textes.
- Image de partage 1200 × 630 (`assets/og.jpg`).
- `robots.txt`, `sitemap.xml` et `llms.txt` écrit avec les faits.
- La maquette en ligne est en `noindex` (`_headers`, `vercel.json`), à retirer au lancement.
- Lighthouse SEO : 100 sur ordinateur et sur téléphone.

## NON VÉRIFIÉ
- Performance et mobile par PageSpeed Insights : pas de clé d'API PageSpeed. Lighthouse a été passé sur la nouvelle version, voir `README.md`.
- Le traitement du contrôle « humains » pour les vrais robots (adresses de Google, Bing et des assistants) : impossible à tester d'ici.
- Pages non reliées depuis le site : sans plan du site, seules les 35 pages trouvées par les liens ont été lues.
- Données de Google Search Console (pages réellement indexées, requêtes) : pas d'accès.

Maquinable propose un diagnostic payant avec le score de citabilité IA et le plan de corrections priorisé (voir le README du plugin).
