# Audit SEO + GEO : mendietaroofingcorp.com (14 octobre 2026)

Lecture seule, rien n'a été modifié sur le site. Requêtes une par une, avec l'agent descriptif
`maquinable-geo/0.1`. Le certificat HTTPS du site étant expiré, les pages ont été lues en HTTP simple (sans jamais
désactiver la vérification des certificats) et l'accueil par l'API WordPress publique.

## Résumé

- Pages vérifiées : 13 (sur 13 dans le sitemap), dont l'accueil en partie (voir NON VÉRIFIÉ)
- Points critiques : 1
- Avertissements : 7
- Opportunités : 4

## CRITIQUE (à corriger tout de suite)

1. **Le certificat HTTPS a expiré le 2 octobre 2026** : `https://mendietaroofingcorp.com/` répond par une erreur
   de certificat (`certificate has expired`), et les navigateurs affichent un écran d'alerte avant la page.
   L'accueil en HTTP redirige vers HTTPS (301), les balises canoniques, le sitemap et le robots.txt pointent tous vers
   HTTPS : il n'y a pas d'accès à l'accueil sans l'alerte. Le registre public des certificats (crt.sh) montre qu'un
   certificat GoDaddy a été émis le 1er septembre 2026, valable jusqu'au 18 mars 2027, mais il n'est pas installé.
   → L'installer depuis l'hébergement GoDaddy, puis vérifier l'accueil et une page intérieure dans un navigateur.

## AVERTISSEMENTS

1. **Deux versions de chaque page intérieure** : `/services/`, `/contact-us/`, `/gallery/`, `/testimonials/`,
   `/about-us/` répondent 200 en HTTP sans rediriger, alors que leur canonique est en HTTPS (seul l'accueil
   redirige). → Une fois le certificat installé, rediriger tout le HTTP vers HTTPS (301) au niveau du serveur.
2. **Pages d'extensions dans le sitemap** (7 des 13 adresses) :
   - `/bwg_share/image/` répond 200 avec une page vide (0 octet) ;
   - `/bwg_gallery/gallery/` double la galerie, sans meta description ;
   - quatre fiches de témoignage d'une phrase, dont `/testimonial/978/` et `/testimonial/reviews-home-page/` (fiche
     d'Eva H.), avec le texte de l'avis en guise de description (290 caractères pour celle de Mary S.) ;
   - l'archive `/testimonial-category/home-reviews/`, sans description, dont le H1 est « Testimonial Category
     Archives: ».
   → Retirer ces types de contenu du sitemap dans All in One SEO et les passer en `noindex`.
3. **Deux H1 sur 4 des 5 pages intérieures** : le titre du thème plus celui du contenu (« Services » et « MENDIETA
   ROOFING CORP SERVICES », « Gallery » deux fois, « About Us » deux fois, « Contact Us » et « Set an
   Appointment »). → Garder un seul H1 par page.
4. **Aucune image de partage (`og:image`)** sur les 13 pages : un lien envoyé par SMS, WhatsApp ou Facebook s'affiche
   sans image. → Définir une image par défaut dans All in One SEO (une photo de chantier de 1200 × 630).
5. **« Just another WordPress site »**, la phrase par défaut de WordPress, sert de description à l'organisation et
   au site dans les données structurées, et s'affiche dans `og:site_name` (« Mendieta Roofing Corp - Just another
   WordPress site »). → Remplacer le slogan dans Réglages > Général.
6. **Des titres qui ne parlent pas de leur page** : « Single Ply Roof Repair in West Palm Beach | Testimonials »,
   « Roof Replacement & Maintenance in West Palm Beach | Gallery », « Commercial & Residential Roofing West Palm
   Beach FL | Contact Us ». Chaque service a été rattaché à une page qui n'en parle pas. → Donner à chaque service
   son contenu (au minimum une section par type de toit) et aligner les titres sur ce que la page montre.
7. **Deux balises Google Analytics 4 différentes** chargées sur chaque page : les visites risquent d'être comptées
   en double. → N'en garder qu'une.

## GAINS RAPIDES (fort effet, peu d'effort)

- Installer le certificat déjà émis (critique 1) et rediriger le HTTP vers HTTPS (avertissement 1).
- Remplacer « Just another WordPress site » (avertissement 5) : un champ à changer.
- Ajouter l'image de partage par défaut (avertissement 4).
- Sortir les pages d'extensions du sitemap (avertissement 2).
- Retirer la deuxième balise Analytics (avertissement 7).

## OPPORTUNITÉS GEO

- **robots.txt : rien n'est bloqué.** 13 robots testés (Googlebot, Bingbot, GPTBot, OAI-SearchBot, ChatGPT-User,
  ClaudeBot, Claude-SearchBot, Claude-User, PerplexityBot, Perplexity-User, Google-Extended, CCBot, Bytespider) sur
  11 adresses publiques : tous autorisés, et les deux analyseurs (urllib et protego) sont d'accord. Ils ne divergent
  que sur `/wp-admin/admin-ajax.php`, une adresse technique. Mais tant que le certificat est expiré, un robot qui
  vérifie les certificats (le comportement normal) ne peut lire aucune adresse HTTPS.
- **Données structurées** : seulement `Organization`, `WebSite`, `WebPage` et `BreadcrumbList`, sans logo, sans
  `sameAs`, sans téléphone ni adresse. → Ajouter un `RoofingContractor` (sous-type de `LocalBusiness`) avec le
  téléphone, West Palm Beach, les 25 villes desservies (`areaServed`), la licence CCC1328504 (`hasCredential`) et
  l'année 1988 (`foundingDate`). La nouvelle version du site le fait.
- **Les avis** : le module annonce 16 avis, mais les pages 2 et 3 se chargent par un appel protégé en JavaScript.
  Neuf avis sur seize ne figurent pas dans le HTML, donc pas pour les robots qui n'exécutent pas le JavaScript.
  → Afficher tous les avis dans la page.
- **/llms.txt absent (404)** : un fichier court qui présente l'entreprise, ses services, sa licence et ses villes
  aiderait les assistants à la citer. C'est une proposition (llmstxt.org), pas une norme, et les assistants ne la
  lisent pas tous. La nouvelle version en fournit un.

## NON VÉRIFIÉ

- Performance et mobile : pas de clé PageSpeed Insights.
- Le HTML brut de l'accueil et toutes les versions HTTPS : il faudrait passer outre le certificat expiré, ce que nous
  n'avons pas fait. L'accueil a été lu par l'API WordPress (balises SEO et contenu, sans l'en-tête du thème) : titre
  « Mendieta Roofing Corp. | Roofing Company in West Palm Beach » (59 caractères), description de 155 caractères,
  un H1 dans le contenu (« Welcome Mendieta ROOFING CORP. »), aucune image sans texte alternatif.
- Les pages 2 et 3 des avis (appel protégé, non forcé).

Maquinable propose un diagnostic payant avec le score de citabilité IA et le plan de corrections priorisé (voir le README du plugin).
