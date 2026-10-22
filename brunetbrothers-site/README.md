# Brunet Brothers Construction : nouveau site

Refonte complète de https://www.brunetbrothersconstruction.com.

Brunet Brothers Construction est une entreprise familiale de construction et de rénovation de Lake Worth, dans le comté
de Palm Beach, en Floride :
- leur devise : « Masters of Consistency and Quality » ;
- « family-owned », « since 2008 », dans tout le sud de la Floride : surtout des salles de bain et des cuisines, aussi
  des jardins et de la construction neuve, résidentielle ou commerciale ;
- quatre licences certifiées de l'État, toutes actives jusqu'au 31 août 2028 (vérifiées sur le registre de l'État le
  22 octobre 2026) : entrepreneur général CGC1524915, plomberie CFC1430197, climatisation CAC1825088, toiture
  CCC1337876 ;
- deux lignes : (561) 904-1465 en anglais, (561) 904-1893 en espagnol.

- **À ouvrir** : `dist/index.html`, d'un double-clic. C'est un seul fichier (4 Mo : les photos, les polices, le
  monogramme, les textes espagnols et le script compris), qui marche sans serveur ni connexion.
- **À mettre en ligne** : le dossier `dist-web/` (la page fait 166 Ko, 47 Ko une fois compressée par l'hébergeur ; les
  polices et les photos à part, chargées à la demande, en plusieurs tailles).
  - On le glisse sur app.netlify.com/drop, ou on le publie sur Vercel avec `vercel.json`.
  - `_headers` (Netlify) et `vercel.json` demandent aux moteurs de recherche de ne pas indexer la maquette. Ils sont
    à retirer au lancement.
  - `_redirects` et `vercel.json` envoient l'adresse sans `www` vers celle avec `www` (leur adresse actuelle), et les
    trois anciennes pages vers leur partie de la nouvelle : /projects vers le travail, /testimonials vers les clients,
    /faq vers le déroulé.
  - Prêts pour leur domaine :
    - `robots.txt` ;
    - `sitemap.xml` ;
    - `llms.txt` (qui ils sont, les quatre licences liées au registre, leur FAQ, les témoignages, le contact, la
      version espagnole) ;
    - l'image de partage (`assets/og.jpg`) et les icônes (l'onglet, l'écran d'accueil des téléphones, le logo des
      données structurées).

**À dire au client :**
- **40 photos de leur site actuel gardent la position GPS de la maison du client** (39 dans le comté de Palm Beach).
  Les originaux restent téléchargeables sur le CDN de Wix, avec leurs métadonnées : n'importe qui peut retrouver la
  maison à partir d'une photo de salle de bain. C'est à corriger tout de suite, sur le site actuel, sans attendre le
  nouveau (voir l'audit SEO, point 1). Les photos du nouveau site n'ont aucune métadonnée.
- **Leurs quatre licences n'apparaissent nulle part** sur le site actuel, qui dit seulement « A State Certified General
  Contractor ». Le nouveau site les montre, chaque numéro lié à sa fiche du registre.
- **La climatisation (juin 2026) et la toiture (août 2026) sont des licences récentes.** Le site les affiche comme des
  licences, pas comme des services. À confirmer avec eux : veulent-ils aussi les proposer ?
- **Les boutons « Get in Touch », « Find Out More » et « Schedule an Appointment »** renvoient en haut de l'accueil au
  lieu du formulaire.
- **Une entreprise bilingue, un site en anglais seulement.** Le nouveau site est entier en espagnol, en un clic. Une
  relecture de l'espagnol par quelqu'un de l'entreprise reste conseillée, pour les mots qu'ils emploient avec leurs
  clients.
- **La photo de maison de l'en-tête** n'a ni date ni appareil : rien ne dit que c'est un de leurs chantiers. Elle n'est
  pas reprise.
- **Leurs photos datent de 2017 à 2020.** Une dizaine de chantiers récents, photographiés du même point de vue,
  rendraient la série encore plus forte ; les planches en acceptent autant qu'on veut. Il n'existe aucune photo de
  l'équipe ou des frères, et le site n'en invente pas.
- **Les témoignages sont sans nom** sur leur site : ils le restent. Avec l'accord des clients, un prénom et une ville
  les rendraient plus crédibles. Une fiche Google à jour apporterait des avis vérifiables (un profil Birdeye non
  revendiqué affiche une autre adresse : à revendiquer ou à faire corriger).
- **Le pied de page dit « © Copyright 2020 »**, et l'e-mail est écrit de deux façons. Une adresse au nom de leur
  domaine ferait plus sérieux qu'une adresse Gmail.
- **Cloudflare** soumet nos requêtes à un défi. Il faut vérifier que les robots des moteurs et des assistants passent
  (audit SEO, point 2).
- Le site ne nomme personne de lui-même : ni le titulaire des licences, ni l'adresse du registre (il garde « Lake
  Worth »). Les seuls prénoms sont ceux que les clients écrivent dans leurs témoignages.
- Le formulaire prépare un e-mail dans la messagerie du visiteur (rien ne part de la page, et la page le dit). Pour
  recevoir les demandes directement, un service de formulaires (Netlify Forms, Formspree) peut prendre le relais : une
  petite modification.

**Les documents de travail :**
- `ANALYSE.md` : le site actuel, le registre des licences, les témoignages, l'inventaire des 72 photos ;
- `seo-audit-brunetbrothersconstruction.com-2026-10-22.md` : l'audit SEO et GEO du site actuel ;
- `DIRECTION.md` : la direction artistique, revue contre le brief avant de coder ;
- `REVUE.md` : la revue de design et la relecture des textes, dans les deux langues ;
- `ACCESSIBILITE.md` : l'audit d'accessibilité ;
- `boards/` : les planches :
  - l'ouverture arrêtée à trois moments, la ligne sous la planche, le téléphone et l'image de partage
    (`l-accueil.jpg`) ;
  - la série de l'intérieur, une apparition en cours, la visionneuse, le téléphone (`la-serie.jpg`) ;
  - le jardin, la construction neuve, l'entreprise et ses licences, le déroulé, les témoignages
    (`dehors-le-neuf-l-entreprise.jpg`) ;
  - l'espagnol, la demande de visite, les erreurs, l'envoi, le pied de page (`deux-langues-et-la-visite.jpg`).

## La méthode, et les extensions installées

- Le site est écrit à la main, en HTML, CSS et JavaScript.
- Lenis fait le défilement doux, et `build.mjs` assemble le tout. À chaque construction, il vérifie aussi que :
  - chaque texte traduit existe dans les deux langues ;
  - les quatre licences sont là, avec leur lien, et chaque numéro de téléphone s'affiche au moins quatre fois ;
  - aucune adresse de rue n'apparaît, ni aucune année hors 2008 (leurs débuts) et 2026 (le pied de page) ;
  - chaque photo ouvre un groupe qui existe, sur une photo qui existe, et chaque légende existe ;
  - chaque image a son attribut de remplacement, et la page a un seul h1.
- Les animations sont natives (une propriété CSS animée, déclarée avec `@property`, et quelques lignes de JavaScript
  pour l'ouverture), sans GSAP ni WebGL.

**Ce qui a servi :**
- **`frontend-design`** : le plan de direction artistique (couleurs, polices, mise en page, principes), revu contre
  le brief et contre les réflexes des pages générées avant de coder (voir `DIRECTION.md`). Ont été écartés : une caméra
  qui plonge dans une photo (trop proche de Boca), le logo comme cadre (Hideout), des rangées qui se construisent
  (Mendieta), des onglets pour filtrer (Stellar), des compteurs, un fond sombre partout, un fond crème à grande serif.
- **`design-critique`, `accessibility-review` et `ux-copy`** (extension Design) : la revue des captures de 320 à
  1 920 px dans les deux langues, l'audit WCAG et la relecture des textes. Les corrections sont faites et listées dans
  `REVUE.md` et `ACCESSIBILITE.md`, dont trois bloquantes : la note d'envoi visible avant tout envoi, le nom de
  l'entreprise qui passait sous le choix de la langue à 320 px, et les photos d'une section qui attendaient leur tour
  après un lien du menu.
- **`seo-audit`** (Maquinable GEO) : l'audit du site actuel (ses quatre pages, son plan de site, deux analyseurs de
  robots.txt pour 14 robots, son llms.txt), puis les mêmes contrôles sur le nouveau.
- **Lighthouse 13.5**, installé en local (l'extension des outils de Chrome ne se connecte pas), mesuré derrière un
  petit serveur qui compresse comme un hébergeur.
- **Playwright** :
  - l'ouverture arrêtée à des instants précis (l'horloge de la page est contrôlée) et les apparitions capturées en
    cours ;
  - les 43 essais d'interaction (`tools/interact.mjs`) : l'ouverture, l'ordre des apparitions, la visionneuse à la
    souris, au clavier et au doigt, les deux langues (le bouton, la mémoire, l'adresse, un navigateur réglé en
    espagnol), le formulaire, le menu du téléphone, le mouvement réduit, la page sans JavaScript et les débordements
    de 320 à 1 920 px ;
  - le parcours au clavier, les cibles tactiles et le contraste mesuré sur les pixels, à 1 440 px et sur téléphone, en
    anglais et en espagnol (`tools/a11y.mjs`) ;
  - les planches, l'image de partage et les icônes (`tools/shots.mjs`, `tools/boards.mjs`, `tools/og.mjs`,
    `tools/icons.mjs`).
- **Pillow** (`tools/images.py`) : les photos en AVIF, converties en sRGB, recadrées au format de leur rangée, sans
  aucune métadonnée (vérifié à la fin de chaque export), et l'aperçu flou de chaque photo, qui sert de verre dépoli.
- **Fontsource et fontTools** : les deux polices, réduites au latin, aux graisses et aux tailles optiques utiles, et
  des polices de secours ajustées pour que la page ne bouge pas quand les vraies arrivent.
- **Les sources publiques**, pour ne rien inventer :
  - le registre des licences de l'État de Floride (myfloridalicense.com) ;
  - leur site actuel, lu en ligne et dans les copies publiques de la Wayback Machine (le site est derrière un défi
    Cloudflare, qui n'a pas été contourné) ;
  - les 72 originaux de leurs photos, sur le CDN de Wix.
- **21st.dev** : la recherche du catalogue a échoué deux fois le 22 octobre 2026 (« catalog search failed », côté
  serveur). Rien n'en vient.

**Ce qui n'a pas été retenu, et pourquoi :**
- **Facade UI et shadcn** : des sections React, et justement le découpage modèle (héros, cartes, chiffres,
  témoignages) que le brief refuse.
- **La photo de maison de l'en-tête**, d'origine inconnue.
- **Les profils tiers** (Birdeye, BuildZoom) : leurs informations contredisent celles du site.
- **Les noms et les adresses** : ni le titulaire des licences, ni l'adresse du registre. Les positions GPS des photos
  n'ont été ni affichées ni enregistrées : on a seulement vérifié si elles tombaient dans le comté.
- **Les dates de chantier.**
- **Des compteurs** (« 41 bathrooms ») : plusieurs photos montrent souvent le même chantier, le chiffre exagérerait.
- **Un carrousel, des étoiles, une rangée de chiffres** : les réflexes d'un modèle de site.

## L'idée : la série

Leur devise est « Masters of Consistency and Quality ». Le site actuel l'écrit sous le logo, puis ne la montre nulle
part. Le nouveau site la prouve avec leurs propres photos. Elles sont rangées comme les « typologies » de Bernd et Hilla
Becher : une rangée par type de pièce, toutes au même format. On y voit un niveau qui se répète d'une maison à l'autre,
pas une belle salle de bain chanceuse.

1. **À l'ouverture**, une paroi de verre dépoli traverse d'un geste la planche de l'accueil (trois douches au-dessus de
   trois cuisines). Chaque photo devient nette au passage de sa tranche blanche. Le geste vient de leur produit le plus
   photographié : la douche à paroi de verre sans cadre.
2. **Plus bas**, chaque photo apparaît une fois, derrière la même paroi, l'une après l'autre. Son aperçu flou sert de
   verre : il n'y a jamais de case grise pendant le chargement.
3. **Deux langues**, en un clic, sans changer de page. Dès l'accueil, chaque numéro est annoncé dans sa langue :
   « Call in English », « Llame en español ».

Le reste se tait : le gris quartz de leurs plans de travail, le graphite, l'orange de leur logo en aplat, une seule
bande sombre (l'entreprise et ses licences). Chivo pour tout, Piazzolla italique pour la seule voix qui n'est pas la
leur : celle de leurs clients.

## La page, partie par partie

- **L'en-tête** : leur monogramme et leur nom, Our work, The company, How it works, Clients, le choix EN / ES et
  « Free estimate » ; il se range quand on descend, revient quand on remonte, et souligne la partie où l'on est.
- **L'accueil** (« Masters of consistency and quality. ») : qui ils sont, depuis quand, « Get a free estimate » et les
  deux lignes ; la planche des six photos et sa ligne, qui dit ce que montre la photo survolée.
- **L'intérieur** (« Interior remodeling ») : leur texte, raccourci, et un témoignage ; puis cinq rangées : Showers,
  Vanities, Tubs and powder rooms, Kitchens, Closets, offices and living rooms. Chaque photo a sa légende et s'ouvre en
  grand, dans la visionneuse de sa rangée.
- **Dehors** (« Exterior remodeling ») : un jardin, la cuisine d'été sous la pergola, le foyer dans le sable, la
  piscine.
- **Le neuf** (« New construction ») : leur phrase sur le travail avec les architectes et les ingénieurs, la charpente
  sur les murs en blocs, leur story « Se lucieron los muchachos », un salon de coiffure.
- **L'entreprise** (« Family-owned. Licensed by the State of Florida. »), sur la bande sombre : Lake Worth, depuis
  2008, les deux langues, leurs camionnettes ; les quatre licences en très grand, chacune liée à sa fiche du registre.
- **Le déroulé** (« From the first visit to the last payment. ») : leurs six questions de FAQ, dans l'ordre d'un
  chantier, de l'estimation gratuite à l'avenant.
- **Les clients** (« Our clients are our toughest critics and our best salespeople. », leur phrase) : six témoignages
  en italique, les douze autres en un clic, mot pour mot.
- **La demande** (« Free in-home estimate. ») : les deux lignes en grand, l'e-mail, la zone ; un formulaire court
  (nom, téléphone ou e-mail, ville, les sujets à cocher, les détails, la langue du rappel) ; « Send my request »
  prépare l'e-mail.
- **Le pied de page** : le monogramme, la devise, le contact, les licences, Facebook et Instagram, le choix de la
  langue.

## Les photos

35 images, toutes les leurs (voir `ANALYSE.md`) : quinze salles de bain, neuf cuisines, quatre autres pièces, le jardin
(trois photos), la construction neuve (trois) et leurs camionnettes. Exportées en AVIF par `tools/images.py` :
- depuis les originaux du CDN de Wix, jamais agrandies : chaque image est servie au plus à sa taille d'origine, en
  1 200, 720 et 480 px de large pour les photos en hauteur, en 1 600, 1 000 et 640 pour celles en largeur ; les deux
  originaux agrandis dans Photoshop ne servent pas au-delà de 1 600 px ;
- les photos d'iPhone converties du Display P3 vers le sRGB, sans autre retouche ;
- recadrées au format de leur rangée, et pour retirer le filigrane « BB Brunet Brothers Construction Corp » de trois
  photos (le logo est déjà sur la page) ;
- sans aucune métadonnée : ni date, ni appareil, ni position.

## Le logo

Leur monogramme, redessiné à plat (`tools/mark.mjs`) : le crochet orange ouvert à droite, et les deux « B » massifs aux
contre-formes rectangulaires. Les lettres sont graphite sur le clair, blanches sur le sombre. Il sert aussi d'icône
(l'onglet, l'écran d'accueil des téléphones) et de logo des données structurées, avec le nom en Chivo.

## Les mesures

Lighthouse 13.5, sur la version en ligne servie en local derrière un serveur qui compresse ; téléphone simulé (4G
lente, processeur ralenti 4 fois) ; médiane des passages 2 et 3.

| Mesure | Résultat |
|--------|----------|
| Performance (Lighthouse) | **98** au téléphone, **100** sur ordinateur |
| Accessibilité (Lighthouse) | **100** sur ordinateur et sur téléphone |
| Bonnes pratiques (Lighthouse) | **100** |
| SEO (Lighthouse) | **100** |
| Affichage du contenu principal (LCP), téléphone ralenti | **2,4 s** (0,6 s sur ordinateur) ; c'est le texte d'appui de l'accueil |
| Temps de blocage (TBT) | **0 ms** |
| Décalage de la mise en page (CLS) | **0** |
| Essais d'interaction (`tools/interact.mjs`) | **43 sur 43** |
| Audit d'accessibilité (`tools/a11y.mjs`) | aucun point bloquant |
| Débordements, de 320 à 1 920 px, en anglais et en espagnol | aucun |

## Refaire le site

```
python3 -I tools/fonts.py <paquet @fontsource-variable/chivo> <paquet @fontsource-variable/piazzolla>
python3 -I tools/images.py <dossier des originaux téléchargés>    # les photos → src/img/*.avif et data/*.json
node tools/icons.mjs                                               # l'icône de l'onglet, celle des téléphones, le logo
python3 -I tools/fallback.py                                       # les polices de secours ajustées
node tools/og.mjs                                                  # l'image de partage
node build.mjs                                                     # dist/ et dist-web/
node tools/interact.mjs <dossier>                                  # les 43 essais
python3 -m http.server 8796 --bind 127.0.0.1 --directory dist-web
node tools/a11y.mjs                                                # l'audit d'accessibilité
node tools/shots.mjs <dossier> && node tools/boards.mjs <dossier> boards
```
