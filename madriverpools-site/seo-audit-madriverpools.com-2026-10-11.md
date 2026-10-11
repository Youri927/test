# Audit SEO + GEO : madriverpools.com (11 octobre 2026)

Audit en lecture seule du site actuel, fait avant la refonte. Rien n'a été modifié sur leur site.

Le site actuel tourne sous WordPress avec le thème Divi et Yoast SEO 28.5. L'origine finale est `https://madriverpools.com` (sans `www`).

## Résumé
- Pages vérifiées : 17 (sur 17 dans le plan du site)
- Problèmes critiques : 0
- Avertissements : 7
- Opportunités : 4

## CRITIQUE (à corriger tout de suite)
Rien de critique : aucune page publique n'est bloquée pour Googlebot ou Bingbot, et le plan du site répond.

## AVERTISSEMENTS
1. **Données structurées fausses sur l'adresse.** Le bloc `ProfessionalService` de l'accueil (ajouté à côté de celui de Yoast) contient :
   - `"postalCode": "407-810-3453"` : le numéro de téléphone à la place du code postal ;
   - pas de région (`addressRegion`) ;
   - des horaires vides (`"openingHours": []`) ;
   - une rue abrégée (« 1704 Shawnee Tr »).

   La page déclare aussi deux entités `WebSite`, celle de Yoast et celle du bloc ajouté.

   → Code postal 32751, région FL, horaires du lundi au vendredi de 9 h à 17 h, et un seul `WebSite`.
2. **Une page de la galerie en double.** `/pool-renovation-gallery/` est dans le plan du site, mais son URL canonique pointe vers `/central-florida-pool-renovation/`. Les deux pages ont le même titre et la même description.

   → La retirer du plan du site (Yoast : ne pas l'indexer), ou lui donner son propre contenu et sa propre URL canonique.
3. **Pas d'image de partage (`og:image`) sur 16 pages sur 17** : seule `/financing/` en a une. Un lien envoyé par SMS, sur Facebook ou dans une messagerie s'affiche sans photo.

   → Définir une image par défaut dans Yoast (réglages des réseaux sociaux), par exemple une belle piscine terminée en 1200 × 630.
4. **220 photos sans texte alternatif**, toutes dans les galeries :

   | Page | Photos sans `alt` |
   |------|-------------------|
   | `/fiberglass-pool-gallery/` | 87 sur 92 |
   | `/vinyl-pool-gallery/` | 33 sur 37 |
   | `/spa-and-hot-tub-gallery/` | 31 sur 49 |
   | `/concrete-pool-gallery/` | 30 sur 70 |
   | `/paver-gallery/` | 27 sur 33 |
   | `/central-florida-pool-renovation/` | 12 sur 18 |

   Ces photos sont invisibles pour Google Images et pour les lecteurs d'écran.

   → Une courte description par photo dans la médiathèque (type de piscine, forme, ce qu'on voit : spa, cascade, enclos).
5. **Titres trop longs** (plus de 60 caractères), coupés dans les résultats de Google :

   | Page | Longueur du titre |
   |------|-------------------|
   | fibre de verre | 74 |
   | béton | 72 |
   | installation de piscines | 68 |
   | contact | 67 |
   | spas | 62 |
   | rénovation (deux URL) | 61 |

   → Garder le service et la ville au début. Exemple : « Concrete Pools in Central Florida | Mad River Pools » (51 caractères).
6. **Descriptions hors de la plage utile de 100 à 160 caractères :**
   - trop longues : béton (178), vinyle (172), fibre de verre (170) ;
   - trop courtes : contact (95), galerie vinyle (93) ;
   - une coquille dans celle des pavés : « specializes Paver Patio Installation » (il manque « in »).

   → Une phrase claire par page.
7. **`/mad-river-pools-galleries/` n'a pas de titre `<h1>`** (les 16 autres pages en ont exactement un).

   → Ajouter un titre de page, par exemple « Our Pool, Spa and Paver Galleries ».

## GAINS RAPIDES (fort impact, peu d'effort)
1. Image de partage par défaut dans Yoast (avertissement 3) : un réglage, effet sur toutes les pages.
2. Corriger le code postal, la région et les horaires du bloc d'entreprise (avertissement 1) : quelques lignes.
3. Raccourcir les 6 titres et les 5 descriptions hors plage (avertissements 5 et 6), directement dans Yoast.
4. Ajouter la page Facebook (`https://www.facebook.com/MadRiverPoolConstruction`) dans `sameAs` de l'organisation (Yoast : profils sociaux). Aujourd'hui, `sameAs` est absent.

## OPPORTUNITÉS GEO
1. **robots.txt : rien n'est bloqué.**
   - 13 robots testés sur 19 adresses (l'accueil, les pages du plan du site et `/llms.txt`) :
     - Googlebot, Bingbot ;
     - GPTBot, OAI-SearchBot, ChatGPT-User ;
     - ClaudeBot, Claude-SearchBot, Claude-User ;
     - PerplexityBot, Perplexity-User ;
     - Google-Extended, CCBot, Bytespider.
   - Les deux analyseurs (celui de Python et protego, qui suit la RFC 9309) donnent le même verdict.
   - Le fichier n'interdit que `/wp-admin/` et déclare le plan du site.
2. **`/llms.txt` existe, mais il est généré tel quel par Yoast et pollué.**
   - 6 liens sur 15 pointent vers des taxonomies internes du thème Divi (`/layout_type/module/`, `/layout_type/row/`, `/module_width/regular/`, `/scope/global/`…). Elles redirigent toutes vers l'accueil.
   - Il manque l'accueil, le financement et les cinq galeries par type.
   - Aucun fait sur l'entreprise : depuis 1998, Maitland (FL), licence CPC 1457780, téléphone, horaires, délais de construction.
   - Le fichier commence par un caractère invisible (BOM) et le résumé contient un point échappé (`\.`).
   - → Un fichier écrit à la main : un résumé en une phrase, les faits, puis les pages utiles.
   - Rappel : `llms.txt` est une proposition, pas un standard. Les assistants IA ne le lisent pas tous.
3. **JSON-LD plus complet pour les moteurs et les assistants.**
   - Passer de `ProfessionalService` à `HomeAndConstructionBusiness` (sous-type de `LocalBusiness`), avec :
     - l'adresse corrigée et les horaires ;
     - la zone servie (Central Florida) ;
     - la licence ;
     - la liste des services : béton, fibre de verre, liner vinyle, spas, terrasses, rénovation.
   - Ajouter un bloc `FAQPage` le jour où le site a une foire aux questions : il n'en a pas aujourd'hui.
4. **Le texte est bien dans le HTML.** Les pages sont rendues par le serveur (de 450 à 3 800 caractères de texte visible), donc lisibles par les robots IA qui n'exécutent pas JavaScript. Ce point est à garder.

### Ce que la nouvelle version (`madriverpools-site/`) règle déjà
- Bloc `HomeAndConstructionBusiness` complet :
  - adresse avec 32751 et FL, les coordonnées de leur propre fiche ;
  - horaires, licence, services ;
  - `sameAs` Facebook.
- Bloc `FAQPage` avec les 6 questions de la page.
- Image de partage 1200 × 630 (`assets/og.jpg`).
- Titre de 56 caractères, description de 145 caractères, URL canonique.
- Un seul `<h1>`, un texte alternatif sur chaque photo.
- `llms.txt` réécrit avec les faits, `robots.txt` et `sitemap.xml` prêts.
- La maquette en ligne est en `noindex` (`_headers`, `vercel.json`), à retirer au lancement.

## NON VÉRIFIÉ
- Performance et mobile par PageSpeed Insights : pas de clé d'API PageSpeed. Lighthouse a été passé sur la nouvelle version, voir `README.md`.
- Pages hors du plan du site : seules les 17 adresses du plan du site ont été lues.
- Données de Google Search Console (pages réellement indexées, requêtes) : pas d'accès.

Maquinable propose un diagnostic payant avec le score de citabilité IA et le plan de corrections priorisé (voir le README du plugin).
