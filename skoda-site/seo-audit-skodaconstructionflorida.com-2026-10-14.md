# Audit SEO + GEO : skodaconstructionflorida.com (14 octobre 2026)

Lecture seule, rien n'a été modifié sur le site. Requêtes une par une, avec l'agent descriptif
`maquinable-geo/0.1`. Le site est un site Squarespace ; d'après son plan de site, il a été mis à jour pour la dernière
fois le 26 juin 2024.

## Résumé

- Pages vérifiées : 33 (sur 33 dans le sitemap), toutes en 200
- Points critiques : 1
- Avertissements : 7
- Opportunités : 4

## CRITIQUE (à corriger tout de suite)

1. **27 pages par ville qui répètent le même texte.** Les pages « remodeling », « custom home builder » et « storm
   damage repair » sont déclinées pour dix villes en changeant surtout le nom de la ville :
   - 99 % de mots en commun entre la page rénovation de Naples et celle de Captiva ;
   - 99 % entre les pages « custom home builder » de Naples et d'Estero ;
   - 89 % entre deux pages « storm damage repair » de Naples.

   Les règles anti-spam de Google décrivent exactement ce cas parmi les pages satellites (« doorway abuse » : des
   pages presque identiques visant chacune une ville). Ces pages risquent d'être déclassées ou ignorées, et elles se
   concurrencent entre elles sur les mêmes recherches.
   → Une seule page par service. Les villes y figurent dans une vraie partie « où nous travaillons ». Les anciennes
   adresses redirigent (301) vers la page du service. La nouvelle version du site le fait, avec un fichier de
   redirections pour les 33 adresses.

## AVERTISSEMENTS

1. **Aucun H1 sur les 33 pages.** Les titres sont des H2 à H4, ou du texte mis en forme (sur l'accueil : 2 H2, dont
   « Testimonials », 5 H3, 4 H4). Les moteurs et les assistants n'ont pas de titre principal pour comprendre le
   sujet de la page.
   → Passer le premier titre de chaque page en « Heading 1 » dans l'éditeur Squarespace.
2. **Des titres trop longs sur toutes les pages** : de 63 à 191 caractères, pour 60 environ affichés par Google.
   - Celui de l'accueil fait 191 caractères : « Naples FL Luxury Home Builder and Remodeling serving Naples, Sanibel,
     Ft Myers, and Southwest Florida - Luxury Home Remodeling and Storm Damage Repair of Custom Homes - Skoda
     Construction Inc ».
   - Le nom de l'entreprise, à la fin, n'apparaît jamais dans les résultats.

   → Un titre court par page, par exemple « Custom Home Builder in Naples, FL | Skoda Construction ».
3. **Des descriptions trop longues** : 20 pages sur 33 dépassent 160 caractères (de 144 à 286 ; 286 sur l'accueil).
   Elles seront coupées dans les résultats. → 120 à 155 caractères, avec le téléphone ou le secteur.
4. **432 images sur 589 sans texte alternatif**, sur 27 pages des 33. Seules les pages « storm damage » en ont
   partout. → Décrire chaque photo (ce qu'on voit : « Kitchen with a waterfall island in gray stone »), sans liste
   de mots-clés.
5. **Pas d'image de partage sur 32 pages** (`og:image`). L'accueil partage le logo en JPEG sur fond blanc. Un lien
   envoyé par SMS ou sur Facebook s'affiche donc sans photo, ou avec le logo seul.
   → Une image de partage par défaut de 1200 × 630, avec une photo de maison.
6. **Le sitemap liste `/home`, et pas l'accueil `/`.** Or la balise canonique de `/home` pointe vers `/` : le seul
   plan de site du domaine annonce une adresse que le site déclare lui-même secondaire.
   → Le plan de site doit lister `/`, l'adresse canonique. Squarespace le génère seul : si la page d'accueil y
   reste sous `/home`, le signaler à leur support. C'est un point mineur : Google suit en général la canonique.
7. **Des erreurs de contenu** :
   - « Highland Heights area » sur les pages commerciales de Naples et d'Estero. C'est une ville de l'Ohio, reprise de
     leur autre site : l'information locale de la page est fausse.
   - « Storm Damage Repair Naples » apparaît deux fois dans le menu.
   - Un panier d'achat vide s'affiche en haut de chaque page.

## GAINS RAPIDES (fort effet, peu d'effort)

- Un H1 par page (avertissement 1) : un réglage de style par page.
- Raccourcir les titres et les descriptions (avertissements 2 et 3) : champs SEO de chaque page.
- Remplacer « Highland Heights » par la bonne ville, retirer le doublon du menu et le panier (avertissement 7).
- Ajouter l'image de partage par défaut (avertissement 5).

## OPPORTUNITÉS GEO

- **robots.txt : rien n'est bloqué.** 13 robots testés (Googlebot, Bingbot, GPTBot, OAI-SearchBot, ChatGPT-User,
  ClaudeBot, Claude-SearchBot, Claude-User, PerplexityBot, Perplexity-User, Google-Extended, CCBot, Bytespider) sur
  35 adresses publiques (l'accueil, les 33 du sitemap et `/llms.txt`) : tous autorisés, et les deux analyseurs
  (urllib et protego) sont d'accord.
  - Le fichier nomme 29 robots, dont plusieurs robots d'IA (GPTBot, ClaudeBot, CCBot…), mais dans le même groupe
    que `*`.
  - Ils n'ont donc que les interdictions habituelles de Squarespace (`/config`, `/search`, `/api/`…).
  - La ligne `Sitemap:` est présente.
- **Le texte est dans le HTML** (de 6 000 à 10 000 caractères par page) : les robots qui n'exécutent pas le
  JavaScript, comme la plupart des robots d'IA, lisent bien le contenu.
- **Données structurées : seulement `WebSite`**, sur toutes les pages. Il n'y a ni `Organization` ni `LocalBusiness` :
  aucun téléphone, secteur, licence ni date de création lisibles par les machines.
  → Ajouter un `GeneralContractor` (sous-type de `LocalBusiness`) avec :
  - le téléphone ;
  - les onze villes desservies (`areaServed`) ;
  - la licence de Floride CBC1266776 (`hasCredential`, valable jusqu'au 31/08/2028) ;
  - l'année de création, 1985 (`foundingDate`) ;
  - le fondateur.

  La nouvelle version du site le fait.
- **/llms.txt absent (404)** : un fichier court qui présente l'entreprise, ses services, sa licence et ses villes
  aiderait les assistants à la citer. C'est une proposition (llmstxt.org), pas une norme, et les assistants ne la
  lisent pas tous. La nouvelle version en fournit un.

## NON VÉRIFIÉ

- Performance et mobile du site actuel : pas de clé PageSpeed Insights.

Maquinable propose un diagnostic payant avec le score de citabilité IA et le plan de corrections priorisé (voir le README du plugin).
