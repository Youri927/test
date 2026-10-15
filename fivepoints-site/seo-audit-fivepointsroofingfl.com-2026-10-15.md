# Audit SEO + GEO : fivepointsroofingfl.com (15 octobre 2026)

Lecture seule, rien n'a été modifié sur le site. Requêtes une par une, avec l'agent descriptif
`maquinable-geo/0.1`. Le site est un WordPress (thème Divi, extension SEO Rank Math, formulaires Gravity Forms).
`fivepointsroofingfl.com` renvoie vers `https://www.fivepointsroofingfl.com/`, l'adresse utilisée pour tout l'audit.

## Résumé

- Pages vérifiées : 47 (sur 47 dans le sitemap), toutes en 200
- Points critiques : 2
- Avertissements : 7
- Opportunités : 4

## CRITIQUE (à corriger tout de suite)

1. **La page « About » est restée en texte de démonstration, et elle est indexée.**
   - `/about/` affiche « Alternate title for About », « This is a subtitle », « Heading 1 », « Heading 2 » et des
     paragraphes de « Lorem Ipsum ».
   - Sa description (ce que Google affiche sous le titre) commence par « Lorem Ipsum is simply dummy text… ».
   - Elle a trois H1, et elle est dans le plan de site.

   Pour une entreprise qui vend la confiance (une famille de couvreurs depuis 1955), c'est la page qu'un client
   ouvre pour savoir qui ils sont.
   → Écrire la vraie page (la famille Ray, Ray's Roofing en 1955, la licence CCC1333259, Lakeland) ou la retirer
   (redirection 301 vers l'accueil). La nouvelle version le fait dans sa partie « Roofing is in our blood ».
2. **Une page « Test » publique, indexée, avec un texte sur le Tennessee.**
   - `/test/` (titre « Test - Five Points Roofing ») est dans le plan de site, sans `noindex`.
   - Son texte vient d'un autre site : il parle de « the harsh Tennessee weather », un autre État, hors de leur zone.
   - Elle traite du même sujet que leurs pages de remplacement de toit, avec lesquelles elle entre en concurrence.

   → La supprimer, avec une redirection 301 vers la page « Roof Replacement » (ou vers l'accueil). La nouvelle
   version redirige toutes les anciennes adresses.

## AVERTISSEMENTS

1. **Plusieurs H1 sur 40 pages sur 47** : deux sur 39 pages, trois sur « About » ; seules les 7 pages de catégories
   en ont un seul. Le thème met le titre de la page en H1 dans le bandeau, puis le contenu ouvre sur un second H1,
   souvent identique (« Services », puis « Services »). Les moteurs et les assistants ont deux titres principaux.
   → Dans Divi, passer le titre du bandeau en simple texte (ou en H2), et garder un seul H1 par page.
2. **Des données structurées trompeuses sur l'accueil.**
   - Rank Math y déclare un `BlogPosting` (un article de blog) daté du 11 août 2011 et signé « Admin ». C'est la date
     d'un modèle : la licence de l'entreprise date d'août 2021.
   - L'entreprise est un `LocalBusiness` générique, sans `sameAs` (la page Facebook), sans zone desservie
     (`areaServed`), sans licence (`hasCredential`) et avec un logo de 281 × 74 px.

   → Dans Rank Math, régler le schéma de l'accueil sur « WebPage » (pas d'article), et l'entreprise sur
   `RoofingContractor` avec la page Facebook, les villes et la licence. La nouvelle version le fait.
3. **Des pages vides ou techniques dans l'index** :
   - `/services/` : un titre et le formulaire, aucun texte, aucune description ;
   - `/review-insurance/` : son titre est « Redirecting to /f-152588 », un reste de redirection cassée ;
   - `/thanks/` : la page de remerciement du formulaire.

   → `noindex` sur `/thanks/`, et suppression (301) de `/services/` et `/review-insurance/`.
4. **328 images sur 580 sans texte alternatif** (57 %), sur 38 pages :
   - les trois logos de badges (NRCA, GAF, NWR), répétés sur 38 pages ;
   - 159 balises d'images en chargement différé, sans texte ;
   - une partie des photos de chantier.

   → Décrire ce qu'on voit (« A roofer installing new shingles along a valley »), sans liste de mots-clés. Les badges
   eux-mêmes sont à revoir : ce sont des marques, et aucune de ces certifications n'a pu être vérifiée (voir
   `ANALYSE.md`). Le sceau BBB du pied de page renvoie, lui, au profil d'une autre entreprise (« Ray's Roofing
   Solutions », à Melbourne Beach).
5. **Pas d'image de partage sur 28 pages**, dont l'accueil (`og:image`). Un lien envoyé par SMS ou sur Facebook
   s'affiche sans photo.
   → Une image de partage par défaut de 1200 × 630 dans Rank Math (la nouvelle version en fournit une).
6. **Des titres et des descriptions hors mesure.**
   - Titres trop longs (65 à 79 caractères, pour 60 environ affichés) sur six articles, par exemple « What is the best
     roof for a mobile home near Lakeland FL? - Five Points Roofing » (79).
   - Titres trop courts et sans le lieu sur `/contact/` (29), `/about/` (27), `/test/` (26).
   - Descriptions absentes sur `/services/`, `/review-insurance/` et `/category/announcements/` ; trop longues sur
     15 pages, jusqu'à 827 caractères sur `/category/lakeland-fl/`.

   → Un titre de 50 à 60 caractères avec le lieu (« Mobile Home Roofing in Lakeland, FL | Five Points Roofing »),
   une description de 120 à 155 caractères avec le téléphone.
7. **Des informations qui se contredisent d'une page à l'autre** :
   - l'ancienneté : « over 35 years » (trois pages), « over 50 years of experience » et « since 1955 » ;
   - les horaires : « on call 24/7 » sur la page « Roof Repairs and Maintenance », alors que le pied de page et les
     données de l'entreprise disent du lundi au vendredi, de 7 h à 19 h, fermé le week-end ;
   - la zone : « our Brevard County neighbors » sur la page « Roof Installation », le Tennessee sur la page « Test »,
     des images nommées « Brevard County », et une catégorie « Highlands » qui n'est pas dans leur liste de villes.

   Un assistant qui lit le site peut citer n'importe laquelle de ces versions.
   → Une seule version partout : « a family of roofers since 1955 », du lundi au vendredi de 7 h à 19 h, le comté de
   Polk. La nouvelle version ne garde que ce qui est vérifiable.

## GAINS RAPIDES (fort effet, peu d'effort)

- Retirer `/test/`, `/services/` et `/review-insurance/` (301), et mettre `/thanks/` en `noindex` (critique 2,
  avertissement 3).
- Remplacer le texte de démonstration de `/about/`, ou la rediriger (critique 1).
- Un seul H1 par page : un réglage du thème (avertissement 1).
- Corriger le schéma de l'accueil dans Rank Math et ajouter l'image de partage par défaut (avertissements 2 et 5).

## OPPORTUNITÉS GEO

- **robots.txt : rien n'est bloqué.** 13 robots testés (Googlebot, Bingbot, GPTBot, OAI-SearchBot, ChatGPT-User,
  ClaudeBot, Claude-SearchBot, Claude-User, PerplexityBot, Perplexity-User, Google-Extended, CCBot, Bytespider) sur
  22 adresses publiques (l'accueil, 20 adresses du sitemap et `/llms.txt`) : tous autorisés, et les deux analyseurs
  (urllib et protego) sont d'accord. Le fichier n'interdit que `/wp-admin/`, et sa ligne `Sitemap:` pointe vers
  l'index des plans de site de Rank Math (trois plans : articles, pages, catégories).
- **Le texte est dans le HTML** (environ 60 000 caractères par page, menus et pied de page compris) : les robots qui
  n'exécutent pas le JavaScript, comme la plupart des robots d'IA, lisent bien le contenu.
- **Une FAQ sans balisage** : l'article « Lakeland Mobile Home Roofing FAQs » et les articles en questions (« How
  often should you seal mobile home roof? », « Is there a roof inspection needed after a storm? ») répondent à des
  questions réelles, mais sans `FAQPage`. Une FAQ courte et balisée, avec des réponses de deux ou trois phrases, est
  ce que les assistants citent le plus volontiers. La nouvelle version regroupe ces réponses dans une FAQ balisée
  (`geo-optimize` peut ajouter un résumé et une FAQ à chaque article).
- **/llms.txt absent (404)** : un fichier court qui présente l'entreprise, ses trois sortes de toits, ses garanties,
  sa licence et ses villes aiderait les assistants à la citer. C'est une proposition (llmstxt.org), pas une norme,
  et les assistants ne la lisent pas tous. La nouvelle version en fournit un.

## NON VÉRIFIÉ

- Performance et mobile du site actuel : pas de clé PageSpeed Insights.

Maquinable propose un diagnostic payant avec le score de citabilité IA et le plan de corrections priorisé (voir le README du plugin).
