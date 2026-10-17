# Audit SEO + GEO : floridasouth.us (17 octobre 2026)

Lecture seule, rien n'a été modifié sur le site. Requêtes une par une, avec l'agent descriptif `maquinable-geo/0.1`.
Le site est un Squarespace (modèle « Pacific », 2015). `http://floridasouth.us/`, `https://www.floridasouth.us/` et
`https://www.floridasouthconstruction.com/` renvoient tous vers `https://floridasouth.us/`, l'adresse utilisée pour tout
l'audit.

## Résumé

- Pages vérifiées : 11 (les 6 du plan de site, plus l'accueil et les 4 pages du menu, qui n'y sont pas), toutes en 200
- Points critiques : 2
- Avertissements : 7
- Opportunités : 3

## CRITIQUE (à corriger tout de suite)

1. **Une page « Portfolio » en faux texte, publique et dans le plan de site.**
   `/portfolio` affiche « Lorem ipsum dolor sit amet… », sans `noindex`, et c'est l'une des six adresses que le site
   donne lui-même aux moteurs. Pour un entrepreneur, « Portfolio » est justement la page qu'on ouvre pour voir son
   travail.
   → La supprimer, avec une redirection 301 vers la galerie (ou vers l'accueil). La nouvelle version le fait.
2. **Un brouillon « Home 2 » public et dans le plan de site.**
   `/home-1` (titre « Home 2 — Florida South Construction », trois H1) est un essai de page d'accueil resté en ligne.
   → Le supprimer, avec une redirection 301 vers l'accueil.

## AVERTISSEMENTS

1. **Le plan de site oublie l'essentiel.** `sitemap.xml` liste 6 adresses : la galerie, les idées, une copie des
   services, et les trois pages ci-dessus et ci-dessous (Portfolio, Home 2, welcome-pacific). Il n'y a ni l'accueil,
   ni « About », ni « Contracting », ni « Reviews », ni « Contact ».
   → Un plan de site avec l'accueil et les vraies pages, sans brouillons ni copies.
2. **Aucune description sur 10 pages sur 11.** Seule la galerie en a une (52 signes, trop courte). Google compose
   alors lui-même le texte sous le titre.
   → Une description de 100 à 160 signes par page (métier, ville, licence, téléphone).
3. **Un titre d'accueil sans métier ni ville** : « Florida South Construction » (26 signes). Rien ne dit
   « entrepreneur général » ni « Naples ».
   → Par exemple « Florida South Construction | General contractor in Naples, FL » (60 signes).
4. **Des pages en double.**
   - `/contracting` et `/contractor-services` ont le même titre (« Contractor Services — Florida South Construction »)
     et le même texte.
   - `/welcome-pacific` est une copie de l'accueil (au nom du modèle Squarespace) ; sa balise canonique renvoie bien
     vers l'accueil, mais elle est dans le plan de site.
   → Garder une page par sujet, rediriger les autres (301).
5. **Plusieurs H1, et le premier est toujours une image.** Le logo est un H1 sur toutes les pages ; l'accueil en a 4,
   les services 3, les avis et la galerie 2. Le seul titre principal de « About », « Contact », « Ideas » et
   « Portfolio » est donc l'image du logo, sans texte.
   → Un seul H1 par page, en texte, qui dit le sujet de la page.
6. **Des données structurées incomplètes.** L'accueil déclare `WebSite`, `Organization` et `LocalBusiness`, mais :
   - `LocalBusiness` n'a ni téléphone, ni adresse du site (`url`), ni zone servie, ni licence ;
   - l'adresse est une seule chaîne de texte, sans le numéro de bureau (« Suite 10 ») ;
   - la description de `WebSite` est vide, et son image a une adresse sans protocole (`//images…`).
   → Un `GeneralContractor` complet : adresse structurée, téléphone, comtés de Lee et de Collier, licence
   CGC1515532 (`hasCredential`), Judson White, avis. La nouvelle version le fait.
7. **L'image de partage est servie en `http://`** (`og:image`), pas en `https://` : certaines applications ne
   l'affichent pas.

## QUICK WINS (beaucoup d'effet, peu d'effort)

- Écrire le titre et la description de l'accueil (5 minutes dans les réglages SEO de Squarespace).
- Désactiver `/portfolio`, `/home-1` et `/welcome-pacific` (avec redirections 301) : trois pages en moins dans le plan
  de site, trois problèmes réglés.
- Mettre le logo hors des titres (ou passer le titre du modèle en texte) pour retrouver un seul H1 par page.

## OPPORTUNITÉS GEO

1. **robots.txt : rien n'est bloqué.** Le fichier nomme une trentaine de robots (GPTBot, ClaudeBot, Google-Extended,
   CCBot…), mais dans le même groupe que `User-agent: *` : il ne leur interdit que des chemins techniques (`/config`,
   `/search`, `/api/`, `/static/`, des paramètres d'adresse). Vérifié pour 13 robots (Googlebot, Bingbot, GPTBot,
   OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-SearchBot, Claude-User, PerplexityBot, Perplexity-User,
   Google-Extended, CCBot, Bytespider) sur 8 adresses publiques (l'accueil, les 6 du plan de site et `/llms.txt`), avec
   deux analyseurs (`urllib.robotparser` et `protego`, qui donnent le même verdict) : tout est autorisé. La ligne
   `Sitemap:` est présente.
2. **Pas de `/llms.txt`** (404). C'est une proposition, pas un standard, et les assistants la lisent inégalement ;
   mais un court résumé (qui, quoi, où, licence, contact, liens) aide les assistants à citer juste. La nouvelle
   version en a un.
3. **Rien de vérifiable pour un assistant.** La licence n'apparaît qu'en petit (« LIC. # CGC1515532 »), sans lien vers
   le registre de l'État ; les services tiennent en une liste de mots ; aucune page ne dit en une phrase qui ils sont,
   où, depuis quand. La nouvelle version le dit dès l'accueil (titre, texte, données structurées) et renvoie au
   registre de l'État.

## NON VÉRIFIÉ

- Performance et mobile du site actuel : pas de clé PageSpeed Insights.

Maquinable propose un diagnostic payant avec le score de citabilité IA et le plan de corrections priorisé (voir le README du plugin).
