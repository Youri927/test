# Mendieta Roofing Corp : analyse du site actuel

Site analysé : https://mendietaroofingcorp.com, le 14 octobre 2026.

## Le problème numéro un : le site ne s'ouvre plus normalement

Le certificat HTTPS servi par le site a **expiré le 2 octobre 2026**. Depuis, tout visiteur voit l'écran d'alerte du navigateur (« Votre connexion n'est pas privée ») avant la moindre page. La version HTTP redirige vers HTTPS, donc il n'y a pas d'autre porte d'entrée.

Le registre public des certificats (crt.sh) montre qu'un **nouveau certificat GoDaddy a été émis le 1er septembre 2026**, valable jusqu'au 18 mars 2027. Il n'a simplement pas été installé sur le serveur. C'est réparable en quelques minutes depuis l'hébergement GoDaddy, et c'est la première chose à leur dire.

Nous n'avons pas contourné l'alerte. Le contenu a été lu par l'interface publique de WordPress (l'API REST, accessible en HTTP), et les images directement dans leur dossier de médias public.

## Ce qu'est le site aujourd'hui

Un WordPress hébergé chez GoDaddy, monté par l'agence TechnoDream LLC (logo dans les médias), avec le constructeur de pages SiteOrigin, All in One SEO, Contact Form 7, WP Customer Reviews et le cache NitroPack. Six pages :

- **Home** : « Welcome Mendieta ROOFING CORP. », les services, un aperçu de galerie, quatre avis, les badges Porch ;
- **About Us** : trois phrases, dont une phrase de modèle jamais remplie ;
- **Services** : quatre services, 25 villes, 8 marques ;
- **Gallery** : 50 photos dans un diaporama ;
- **Testimonials** : un formulaire « Submit your review » en haut de page, puis 7 avis sur 16, page par page ;
- **Contact Us** : « Set an Appointment », un formulaire de rendez-vous.

Le menu mobile utilise des pastilles jaunes et bleues dessinées en 2023, puis remplacées en 2024 par des icônes noires génériques : deux jeux d'icônes coexistent dans les médias.

## Ce que dit le site (à garder)

- **Le nom** : Mendieta Roofing Corp.
- **L'ancienneté** : « Proudly serving West Palm Beach, FL & the surrounding area since 1988 », « We started in this industry in since 1988 ». La page About dit aussi « over 20 years experience », une phrase plus ancienne.
- **L'entreprise** : « Family owned and operated ».
- **La licence** affichée sur l'accueil : « License ID: CCC1328504 (Certified Roofing Contractor) ».
- **La promesse** : « high quality work performed by qualified professionals », « your complete solution to all your roofing needs ».
- **Les services** :
  - Residential Roofing, Commercial Roofing ;
  - Asphalt Shingle Roof Repair ;
  - Flat Foam / Single Ply Roof Repair ;
  - Traditional Tile Roof Repair.
- **Le remplacement de toiture**, présent dans les titres SEO (« Roof Replacement & Maintenance ») et sur presque toutes les photos.
- **« Roofing & Gutters »** : titre d'une section de l'accueil ; LeafGuard (gouttières) figure dans les marques.
- **Les 25 villes** :
  - comté de Palm Beach (11) : West Palm Beach, Palm Beach, Palm Beach Gardens, Jupiter, Wellington, Greenacres, Lake Worth, Loxahatchee, Boynton Beach, Delray Beach, Boca Raton ;
  - comté de Broward (14) : Deerfield Beach, Pompano Beach, Coconut Creek, Margate, Coral Springs, Tamarac, Lauderhill, Oakland Park, Sunrise, Plantation, Fort Lauderdale, Davie, Dania, Pembroke Pines ;
  - Royal Palm Beach et North Palm Beach, d'où viennent deux avis, ne sont pas dans la liste.
- **Les marques** (« Product Brands Used ») : Allied Construction Industries, CertainTeed (Bufftech), Elk Corp, GAF, LeafGuard, Owens Corning, Roof Tile Solutions, Tamko.
- **Le paiement** : MasterCard, Visa, American Express, Discover, PayPal (image des cartes dans les médias).
- **Les téléphones** : (561) 797-5457 et (561) 543-6287. Sur leurs panneaux de chantier, le 543-6287 est marqué « CELL » et le 797-5457 « OFFICE » (panneau de 2022) puis « MANAGER » (panneau de 2024).
- **L'appel à l'action** : « FREE ESTIMATE ».
- **Le formulaire** de rendez-vous : nom, téléphone, e-mail, adresse, type de service, date, heure, moyen de contact préféré, pièce jointe, message.
- **Les badges Porch** : « Best of Porch 2020, Roofing Contractors in West Palm Beach, FL » et « Background Checked ».

Pas d'adresse e-mail lisible (celle du panneau de 2022 est floue), pas d'horaires, pas d'adresse.

## Vérifié ailleurs

| Fait | Source | Retenu |
| --- | --- | --- |
| Licence **CCC1328504**, Certified Roofing Contractor, au nom de **Mario M. Mendieta**, DBA Mendieta Roofing Corp, « Current, Active », délivrée le **10/03/2008**, expire le **31/08/2028**, comté de Palm Beach | Site officiel de l'État (DBPR, myfloridalicense.com), consulté le 14/10/2026 | Oui : affichée, avec le lien pour la vérifier |
| L'adresse de la licence, dans le nord-ouest de West Palm Beach | DBPR | Non : c'est visiblement un domicile ; on écrit « West Palm Beach, Florida » |
| « Mario » nommé dans un avis du site (Mary S.) | Leur page d'accueil | Oui : Mario est le titulaire de la licence |
| Plus de 30 ans d'activité, 22 permis en trois ans | BuildZoom | Non : on s'en tient aux dates du site et du DBPR |
| Note Yelp moyenne, avec un avis négatif non vérifié | Yahoo Local / Yelp | Non : avis tiers non vérifiables |
| Profil Porch | porch.com redirige | Non vérifié : les badges sont repris tels que le site les affiche |

## Les avis

Le module d'avis annonce **16 avis, note moyenne 5,0**. Seule la première page (7 avis) est lisible : les pages 2 et 3 se chargent par un appel protégé du site, que nous n'avons pas forcé. L'accueil en cite un huitième.

| Client | Ville | Texte |
| --- | --- | --- |
| Mary S. | West Palm Beach | « Mario was a pleasure to work with!! He responded within minutes to my request and followed thru with estimate same day!! […] Once I accepted his quote the work was done same day and bill emailed to me!!! I would highly recommend him as it was a pleasure to deal with a true professional and a gentleman! » |
| Eva H. | West Palm Beach | « […] well groomed, professional fair estimate. Great to work with. Recommended to many of my Real Estate clients and friends. » |
| Mark M. | Lake Worth | « Very professional. They did a great job. I would highly recommend. » |
| Clay M. | Royal Palm Beach | « always on time, knowes this trade throughly, fair price » |
| Jay B. | West Palm Beach | « Very good installation, Great service. » |
| Un propriétaire | West Palm Beach | « Very professional. Two men arrived early and worked throughout the day. They were able to complete the job by mid-afternoon. » |
| Un propriétaire | Lake Worth | « prompt, quick and efficient. my roof does not leak any longer. » |
| Chris C. | North Palm Beach | 5 étoiles, sans texte |

Tous sont datés du 11 mai 2022, jour de leur import dans le site. Prénom et initiale seulement, comme sur le site.

## Les photos

- **50 photos de chantiers** (800 × 600 px ou 800 × 799, quelques portraits), prises au téléphone en 2022 : des maisons de plain-pied du sud de la Floride, ciel bleu, palmiers, leurs camionnettes au blason, leurs panneaux sur la pelouse, leurs équipes sur les toits. Nettes, honnêtes, mais petites : on ne les affichera jamais plus grand que leur taille réelle.
- **Une photo de 2024 en 1920 × 897** : une maison blanche au toit neuf en tuiles plates grises, un palmier, leur panneau. C'est la seule grande image réelle.
- **Trois séries « pendant → terminé » sur la même maison**, retrouvées en comparant les photos :
  - photos 11 et 16 (toit déposé jusqu'au voligeage en bois, équipe sur le toit) → 12, 13, 14, 19 (tuiles blanches posées) ;
  - photo 31 (sous-couche posée, panneau Mendieta) → 28 (tuiles terre cuite posées) ;
  - photo 32 (voligeage en cours) → 33 (maison blanche aux volets bleus, terminée).
- **D'autres étapes visibles** : bardeaux en pose (15, 17), tuiles montées sur la sous-couche (35), tuiles terre cuite en pose (22), toit en cours (21, 23, 34, 37).
- **Par type de toit** (lecture des photos) :
  - bardeaux d'asphalte : 2, 6, 7, 10, 15, 17, 18, 20, 24, 25, 26, 36, 38, 39, 40, 41, 42 ;
  - tuiles (terre cuite ou béton, tons chauds) : 1, 3, 4, 5, 8, 9, 22, 27, 28, 34, 35, 37, 48, 49, 50 ;
  - tuiles blanches : 12, 13, 14, 19, 29, 30, 45, 46, 47, et la photo de 2024 (tuiles grises) ;
  - métal (joint debout) : 43, 44.
- **Doublons** : 4 et 5, 46 et 47, 15 et 17 sont presque identiques ; plusieurs maisons ont 3 ou 4 photos. On ne parlera donc pas de « 50 toits ».
- **À ne pas montrer tel quel** : numéros de maison lisibles (7, 12, 13, 14, 19, 22), panneau « For Sale » d'un agent et plaque de rue (43), une personne au premier plan (32). On floute les numéros, on recadre ou on écarte.
- **À ne pas reprendre** : les quatre images de services de 2024 (photos de banque d'images), la bannière de l'accueil (assombrie, agrandie, floue, avec un numéro de maison), les icônes, les logos de marques.
- **Le blason** (logo.png, 344 × 227) : couronne, deux chevaux cabrés, grand « M », « MENDIETA » et « ROOFING CORP », bleu marine et blanc. Assez petit : utilisable en en-tête, pas en grand.

## Ce qui ne va pas sur le site actuel

1. Le certificat expiré, qui bloque tout le monde (voir plus haut).
2. Des textes de modèle jamais remplis :
   - « I love working in Geographical Location because Reason You Enjoy Working There. » (page About) ;
   - « Cleaning & Maid Services » en titre de la page Services ;
   - « Just another WordPress site » comme slogan, repris dans le nom du site partagé sur les réseaux.
3. Des phrases bancales : « We started in this industry in since 1988 », « Protecting your most valuable from the rain ».
4. Les photos sont réelles mais rangées dans un diaporama sans légende, avec des textes alternatifs « 25 », « 24 »…
5. La page d'avis commence par un formulaire pour en laisser un, et n'en montre que 7 sur 16.
6. Pas d'image de partage, pas de données structurées d'entreprise locale (seulement une « Organization » au slogan par défaut).
7. Le formulaire de contact demande dix informations, dont une date et une heure, pour un simple devis.

## Ce qu'on garde, ce qu'on laisse

**On garde** : le nom, le blason, le bleu marine, « family owned », « since 1988 », la licence vérifiée, les quatre services et le remplacement, les 25 villes, les marques (en texte), les deux numéros avec leur rôle, le devis gratuit, les avis (prénom et initiale), les vraies photos et les trois séries « pendant → terminé ».

**On laisse** : les textes de modèle, les images de banque, la bannière floue, les icônes, la page d'avis qui commence par un formulaire, les logos de marques en vignettes.

## À confirmer avec eux

- Une adresse e-mail à publier, et des horaires.
- S'ils posent aussi des toits en métal (deux photos) et des gouttières (titre « Roofing & Gutters », LeafGuard) : le site n'en fait pas des services.
- Assurance, garanties, langues parlées : le site n'en dit rien, nous non plus.
- Les pages 2 et 3 des avis (9 avis que nous n'avons pas pu lire).
- Les badges Porch : toujours valables ?
