# Mendieta Roofing : nouveau site

Refonte complète de https://mendietaroofingcorp.com.

Mendieta Roofing Corp. est une entreprise familiale de couverture à West Palm Beach, en Floride :
- dans le métier depuis 1988, « family owned and operated » ;
- licence de l'État CCC1328504 (Certified Roofing Contractor), au nom de Mario M. Mendieta, active jusqu'au 31 août
  2028 ;
- toits en tuiles, en bardeaux d'asphalte et toits plats (mousse et membrane), réparés ou refaits, pour les maisons
  et les bâtiments commerciaux, dans 25 villes des comtés de Palm Beach et de Broward.

- **À ouvrir** : `dist/index.html`, d'un double-clic. C'est un seul fichier (2,2 Mo, les photos, la police, les
  dessins et le script compris), qui marche sans serveur ni connexion.
- **À mettre en ligne** : le dossier `dist-web/`.
  - On le glisse sur app.netlify.com/drop, ou on le publie sur Vercel avec `vercel.json`.
  - `_headers` (Netlify) et `vercel.json` demandent aux moteurs de recherche de ne pas indexer la maquette. Ils sont
    à retirer au lancement.
  - Prêts pour leur domaine :
    - `robots.txt` ;
    - `sitemap.xml` ;
    - `llms.txt` ;
    - l'image de partage (`assets/og.jpg`).

**À dire au client tout de suite :** le certificat HTTPS de leur site actuel a expiré le 2 octobre 2026. Depuis,
chaque visiteur voit une alerte de sécurité avant la page. Un nouveau certificat a été émis le 1er septembre par
GoDaddy ; il suffit de l'installer (voir `ANALYSE.md` et l'audit SEO).

**Les documents de travail :**
- `ANALYSE.md` : le site actuel, et ce qui a été vérifié ailleurs (licence, certificat, photos, avis) ;
- `seo-audit-mendietaroofingcorp.com-2026-10-14.md` : l'audit SEO et GEO du site actuel ;
- `DIRECTION.md` : la direction artistique ;
- `REVUE.md` : la revue de design et la relecture des textes ;
- `ACCESSIBILITE.md` : l'audit d'accessibilité ;
- `boards/` : les planches :
  - l'ouverture image par image, sur ordinateur et sur téléphone ;
  - couche par couche : la coupe à chaque étape, sur ordinateur et sur téléphone ;
  - les parties du site ;
  - les détails (un filtre, la visionneuse, « Check your city », les erreurs et le message du formulaire, l'image
    de partage) ;
  - le téléphone.

## La méthode, et les extensions installées

- Le site est écrit à la main, en HTML, CSS et JavaScript.
- Lenis fait le défilement doux, et `build.mjs` assemble le tout.
- Les animations sont natives (CSS, avec un peu de JavaScript pour suivre le défilement), sans GSAP ni WebGL.
- Les dessins sont générés par script : la coupe et les trois petites coupes (`tools/section.mjs`), la carte à partir
  des limites officielles du Census (`tools/geo.py`).

**Ce qui a servi :**
- **`frontend-design`** : le plan de direction artistique, revu contre le brief avant de coder (voir `DIRECTION.md`).
- **`design-critique`, `accessibility-review` et `ux-copy`** (extension Design) : la revue des captures, l'audit
  WCAG et la relecture des textes. Les corrections sont faites et listées dans `REVUE.md` et `ACCESSIBILITE.md`.
- **`seo-audit`** (Maquinable GEO) : l'audit du site actuel, puis les mêmes contrôles sur le nouveau.
- **Les outils de Chrome** : Lighthouse et les traces de chargement, au téléphone ralenti et à l'ordinateur.
- **Playwright** :
  - l'ouverture capturée image par image, l'horloge des animations arrêtée et calée ;
  - les 71 essais d'interaction (`tools/interact.mjs`), dont un contrôle des débordements à 18 largeurs ;
  - le parcours au clavier, les cibles tactiles et le contraste mesuré sur les pixels (`tools/a11y.mjs`) ;
  - les planches et l'image de partage (`tools/shots.mjs`, `tools/boards.mjs`, `tools/og.mjs`).
- **Les sources publiques**, pour ne rien inventer :
  - le site de l'État de Floride (myfloridalicense.com) pour la licence ;
  - leur site actuel, lu par son API WordPress publique, pour les textes, les avis et les photos ;
  - le registre public des certificats (crt.sh) pour le certificat ;
  - le Census Bureau (limites des villes et des comtés, 2023) pour la carte.
- **21st.dev, Facade UI et shadcn**, consultés pour la recherche (le détail est dans `DIRECTION.md`) : des
  composants React génériques, dont aucun n'est pensé pour un toit. Rien n'en a été repris.

**Ce qui n'a pas été retenu, et pourquoi :**
- **Un comparateur avant/après à glissière** : leurs photos « pendant » et « après » ne sont pas prises du même point
  de vue ; la glissière tromperait l'œil. Elles sont montrées côte à côte.
- **Une rangée de chiffres sous le titre** (« 38 ans, 16 avis, 25 villes ») : remplacée par la licence, vérifiable.
- **Des cartes de services avec icônes** : remplacées par trois petites coupes de toit, dessinées comme la grande.
- **Les avis de Yelp et de BuildZoom**, et les pages 2 et 3 du module d'avis de leur site (chargées par un appel
  protégé, non forcé) : rien n'en est cité.

## L'idée : couche par couche

Un toit tient parce qu'il est fait de couches posées dans l'ordre. Leurs propres photos le montrent : des maisons
photographiées pendant le chantier puis terminées, des équipes sur le bois nu, une sous-couche, des tuiles montées en
piles. Le site raconte donc un toit qui se construit :
- **la coupe d'un toit de tuiles**, dessinée au trait, qui se monte au fil du défilement : l'ancien toit part
  jusqu'au voligeage, la bavette et la sous-couche se déroulent depuis l'égout, puis les tuiles se posent rang par
  rang ; chaque étape à côté de la vraie photo d'un de leurs chantiers, au même stade ;
- **les photos posées comme des rangs de tuiles** : quatre, puis trois décalées d'une demi-photo, chacune à cheval
  sur le joint du rang du dessous ;
- **trois petites coupes** pour les types de toit, dans le même langage que la grande.

**L'ouverture** (1,9 s, une fois, au chargement) :
1. le titre monte ligne par ligne depuis sa ligne de base ;
2. la photo de l'accueil se découvre du bas vers le haut, comme un toit qui se couvre depuis l'égout ;
3. le texte, les boutons et la licence apparaissent, puis la légende.

Rien ne se décale dans la page (CLS 0), la photo n'est pas zoomée, et rien ne bloque la page pendant ce temps. Avec
« réduire les animations », on voit directement l'état final, et la coupe est complète.

## La direction

- **Couleurs** (détail et contrastes dans `DIRECTION.md` et `ACCESSIBILITE.md`) :
  - l'encre (#0B1B4D), le bleu outremer de leur blason, pour le texte, les traits et les parties sombres, et sa
    version douce (#3D4B6E) pour le texte secondaire ;
  - le blanc, et le ciel (#EAF1FA) pris dans le ciel de leurs photos ;
  - le soleil (#FFC93C), seulement pour ce qui agit ou ce qui est actif : le bouton de devis, la couche en cours,
    la ville trouvée, les étoiles.
- **Typographie :** une seule famille, Encode Sans (Impallari Type, licence OFL, hébergée avec le site), variable en
  graisse et en chasse : les titres en chasse large, bas et longs comme les maisons de plain-pied de leurs photos, le
  texte en chasse normale. Une police de secours aux mêmes mesures évite tout saut au chargement.
- **Mise en page :** une seule longue page sur une grille de 12 colonnes, alignée à gauche ; des fonds blancs pour
  lire, le ciel pour les parties de travail, l'encre pour les avis et le pied de page. Les seuls numéros sont ceux
  des quatre étapes de la coupe, qui sont une vraie suite.

## La page

1. **L'accueil** : « Family roofers in West Palm Beach since 1988. », les toits qu'ils font, « Get a free
   estimate » et « Call (561) 797-5457 », la licence avec un lien vers sa partie, et un toit de tuiles plates refait
   par leur équipe, leur panneau sur la pelouse.
2. **« A new tile roof, layer by layer. »** : la coupe qui se monte en quatre étapes (Off to the deck, Underlayment,
   Tile from the eave up, Done), chacune avec la photo d'un de leurs chantiers.
3. **« Shingle, tile or flat. Repaired or replaced. »** : les trois types de toit en petites coupes, puis 21 photos
   de chantiers en rangs de tuiles, filtrables (All, Tile, Shingle, On the job), avec une visionneuse.
4. **« 16 reviews on our website. All five stars. »** : sept avis cités, signés d'un prénom et d'une initiale, et
   la mention Porch de 2020.
5. **« Licensed by the State of Florida. A family business since 1988. »** : la licence CCC1328504 en grand, son
   titulaire, sa date et son statut, le lien vers le registre de l'État ; la famille, les marques, les paiements.
6. **« 25 cities, from Jupiter to Pembroke Pines. »** : la vraie carte des 25 villes, la liste par comté, et « Check
   your city », qui reconnaît aussi « Lake Worth Beach », « Ft. Lauderdale » ou « Boca ».
7. **« Get a free estimate. »** : le bureau et le portable en grand, et un formulaire qui rédige le texto adressé au
   portable (au téléphone, la messagerie s'ouvre avec lui ; sur ordinateur, il est prêt à copier).

**Au téléphone :**
- l'en-tête garde le nom et « Menu », qui ouvre un menu plein écran (la page derrière devient inerte) ;
- la photo de l'accueil est cadrée en hauteur ;
- la coupe reste en haut de l'écran, recadrée sur le toit, et suit l'étape qu'on lit dessous ;
- les photos vont deux par deux ;
- une barre « Call » / « Free estimate » apparaît après l'accueil, et se retire sur le devis et le pied de page.

## Rien d'inventé

- **Les textes** viennent de leur site, raccourcis et réécrits en phrases simples, sans ajouter de service, de
  chiffre ni de promesse. Les étapes de la coupe décrivent ce que montrent leurs photos.
- **Les avis** sont ceux de leur site, avec le prénom et l'initiale qu'il affiche ; les coupes sont marquées « … ».
  Un avis attribué à deux villes différentes sur leur site est signé « A homeowner », sans ville.
- **Les photos** sont les leurs : 26 photos de chantiers (800 px, de 2022) et la photo de 2024 de l'accueil. Converties
  en AVIF, jamais agrandies. Les numéros de maison et les plaques sont floutés ; une photo avec un panneau de rue et
  une autre avec une personne au premier plan sont écartées.
- **La licence** est celle du site de l'État : numéro, type, titulaire, date, statut et date d'expiration. Aucune
  adresse de rue n'est publiée : celle de la licence est résidentielle ; le site dit « West Palm Beach, Florida ».
- **La carte** est tracée d'après les limites officielles des 25 villes de leur liste (Census Bureau, 2023).
- **Pas repris** (voir `ANALYSE.md`) : les avis de sites tiers, l'adresse de la licence, les photos de banque
  d'images de leur site actuel.

## À confirmer avec l'entreprise

- **Le certificat** de leur site actuel, à installer au plus vite.
- **Les services** : leur site titre « Roofing & Gutters », cite LeafGuard et montre deux toits en métal, sans en
  faire des services. Le nouveau site s'en tient aux trois types de toit.
- **Un courriel et des horaires**, absents de leur site actuel.
- **Les assurances, les garanties et les langues parlées**, si elles comptent pour eux.
- **La mention Porch** (2020) : toujours d'actualité ?
- **Les avis** des pages 2 et 3 de leur module (9 avis non lus).
- **Le formulaire** : il passe par la messagerie du visiteur et le portable ; pour recevoir les demandes par
  courriel, il faudra un service de formulaire, à choisir avec eux.
- **Des photos** : les originaux en pleine taille, et des toits plats.

## Mesures

Lighthouse et traces de chargement de Chrome, téléphone simulé (4G rapide, processeur ralenti 4 fois) et
ordinateur, sur le nouveau site servi en local.

Le site actuel n'a pas pu être mesuré : son certificat expiré bloque la connexion HTTPS, et nous n'avons pas
contourné la vérification. Ses pages ont été lues en HTTP simple et par son API WordPress.

| | Nouveau site |
| --- | --- |
| Accessibilité (Lighthouse) | **100** sur ordinateur et sur téléphone |
| Bonnes pratiques (Lighthouse) | **100** |
| SEO (Lighthouse) | **100** |
| Navigation par agents (Lighthouse) | **100** |
| Affichage du contenu principal (LCP) | **0,18 s** sur ordinateur, **0,86 s** au téléphone ralenti (médiane de cinq chargements à cache vide) |
| Décalage de mise en page (CLS) | **0** |
| Premier chargement, ordinateur | **11 requêtes, 591 Ko, 1 domaine** |
| Premier chargement, téléphone | **9 requêtes, 530 Ko, 1 domaine** (la photo de l'accueil en hauteur, plus légère) |
| Données structurées | **`RoofingContractor`** : téléphone, ville, les 25 villes desservies, la licence reconnue par le DBPR, 1988, les paiements |

**Notes sur ces chiffres :**
- Servie compressée par l'hébergeur (Netlify et Vercel le font d'office), la page passe de 141 à 38 Ko.
- Les photos de la coupe, juste sous l'accueil, se chargent d'avance ; les autres photos se chargent en arrivant à
  l'écran.
- La trace signale un calcul de mise en page forcé au démarrage (Lenis mesure la page) : c'est le premier calcul de
  la page de toute façon, et Chrome n'estime aucun gain possible.

**Les mêmes contrôles SEO/GEO que pour le site actuel :**
- un titre de 55 caractères et une description de 155, une image de partage et une adresse canonique ;
- un seul `<h1>`, un `<h2>` par partie, un `<h3>` par étape, par type de toit et par comté, `lang="en"` ;
- un texte alternatif sur chaque photo ;
- des données structurées `RoofingContractor`, sans adresse de rue ;
- aucun robot bloqué ;
- un `llms.txt` écrit avec les faits.

**Vérifié aussi :**
- de 320 à 1920 px (18 largeurs), sans débordement, y compris avec l'espacement du texte élargi ;
- au clavier : 54 arrêts sur ordinateur et 48 sur téléphone, focus toujours visible, jamais caché sous l'en-tête ni
  sous la barre d'appel ;
- les contrastes mesurés sur les vrais pixels (75 mesures de texte, de 6,22:1 à 17,34:1 ; les contours et les traits
  au-dessus de 3:1) ;
- avec « moins d'animations », et en arrivant par un lien vers une partie ;
- les 71 essais d'interaction de `tools/interact.mjs` :
  - l'ouverture, les liens de l'en-tête et le focus qui les suit ;
  - la coupe à chaque étape, en descendant et en remontant, sur ordinateur et au téléphone ;
  - les rangs de photos, avec et sans filtre, sur ordinateur et au téléphone ;
  - les filtres au clavier, la visionneuse (taille réelle, flèches, Échap, focus rendu) ;
  - la carte et « Check your city », y compris les variantes de noms ;
  - le formulaire : les erreurs, le message rédigé, la note adaptée à l'appareil, la messagerie au téléphone ;
  - le menu, la barre d'appel.

## Fabrication

- **`node build.mjs`** assemble :
  - `dist/index.html`, tout intégré (2,2 Mo), chaque photo intégrée une seule fois ;
  - `dist-web/`, une page légère (141 Ko), avec les photos et la police en fichiers séparés, la photo de l'accueil
    préchargée dans la bonne version (large ou en hauteur), et les fichiers de `web/`.

  Il vérifie au passage que les nombres affichés correspondent au contenu (photos de chaque filtre, 25 villes dans
  la liste, sur la carte, dans le titre et dans les données structurées, quatre étapes et leurs tuiles).
- **`src/`** : `index.html`, `styles.css`, `main.js`, les dessins (`section.svg`, `kind-*.svg`) et `img/` (les photos en
  AVIF).
- **`data/`** : les dimensions des photos (`photo-sizes.json`), la carte (`map.json`) et les réglages de la police de
  secours (`fallback.json`).
- **`tools/`** :
  - `images.py` refait les photos depuis les fichiers téléchargés (floutage compris) :
    `python3 -I tools/images.py <dossier des téléchargements>` ;
  - `geo.py` refait la carte depuis les fichiers du Census : `python3 -I tools/geo.py <pyshp> <dossier du Census>` ;
  - `section.mjs` redessine la coupe et les trois petites coupes ;
  - `interact.mjs` rejoue les 71 essais d'interaction sur `dist/index.html` ;
  - `a11y.mjs` fait le parcours au clavier, les cibles tactiles, les contrastes et la structure, sur le site servi en
    local (`python3 -m http.server 8773 --bind 127.0.0.1 --directory dist-web`) ;
  - `shots.mjs` fait les captures, `boards.mjs` compose les planches, `og.mjs` l'image de partage.
- **`web/`** : les fichiers de mise en ligne (`_headers`, `vercel.json`, `robots.txt`, `sitemap.xml`, `llms.txt`,
  `og.jpg`).
- **`vendor/`** : Lenis 1.3.26, et la police Encode Sans (sous-ensemble latin, 45 Ko, avec sa licence OFL).
