# Feely Developments : nouveau site

Refonte complète de https://feelydevelopments.com.

Feely Developments construit des maisons sur mesure et fait des rénovations à Winter Park, en Floride :
- « Feely Developments specializes in residential custom homes and remodeling in Winter Park, FL. » ;
- « From Real Estate services, design, demo, all the way through move in, our construction team has been serving our
  neighbors since 2007. » ; leur devise : Design-Build-Live ;
- Ryan Feely, CEO, rencontre lui-même les clients, et ils répondent sous cinq jours ouvrés ;
- deux licences de l'État de Floride au nom commercial Feely Developments LLC, actives jusqu'au 31 août 2028 (vérifiées
  sur le registre le 27 octobre 2026) : Certified Building Contractor CBC1268587 et Certified Residential Contractor
  CRC1330421 ;
- une villa en construction sur Palmer Avenue (5 800 000 $), une maison vendue sur Whipple Avenue ;
- 160 Whipple Avenue, Winter Park ; (321) 663-1433 ; FeelyDev@gmail.com.

- **À ouvrir** : `dist/index.html`, d'un double-clic. C'est un seul fichier (1,3 Mo : les photos, les polices, le logo,
  Lenis et le script compris), qui marche sans serveur ni connexion. Chaque photo n'y est intégrée qu'une fois.
- **À mettre en ligne** : le dossier `dist-web/` (la page fait 91 Ko, 28 Ko une fois compressée par l'hébergeur ; les
  polices et les photos à part, chargées à la demande, en plusieurs tailles).
  - On le glisse sur app.netlify.com/drop, ou on le publie sur Vercel avec `vercel.json`.
  - `_headers` (Netlify) et `vercel.json` demandent aux moteurs de recherche de ne pas indexer la maquette. Ils sont
    à retirer au lancement.
  - `_redirects` et `vercel.json` envoient l'adresse avec `www` vers celle sans `www` (leur adresse actuelle). Le site
    GoDaddy n'a qu'une page : aucune autre adresse à reprendre.
  - Prêts pour leur domaine :
    - `robots.txt` (tout le site ouvert, avec l'adresse du plan du site) ;
    - `sitemap.xml` ;
    - `llms.txt` (qui ils sont, la devise et ses trois phrases, les cinq étapes, les deux maisons, les deux licences
      liées au registre, le contact) ;
    - l'image de partage (`assets/og.jpg`) et les icônes (l'onglet, l'écran d'accueil des téléphones, le logo des
      données structurées).

**À dire au client :**
- **Leurs licences n'apparaissent nulle part** sur le site actuel. Le nouveau site en montre deux, chacune liée à sa
  fiche du registre de l'État, dans « Build » et à la fin.
- **L'adresse publiée est celle de la maison marquée « Sold »** (160 Whipple Avenue), et c'est aussi l'adresse
  principale des licences au registre. Laquelle publier ? Le nouveau site la donne une seule fois, à la fin.
- **La plaque d'un pilier donne le numéro de la maison** sur leur photo de façade, et leur page publie les adresses
  complètes des deux maisons, numéros compris. Le nouveau site efface la plaque et nomme les maisons par leur rue.
- **Palmer Avenue** : le prix (5 800 000 $) et l'avancement, à confirmer avant la mise en ligne. Des rendus ou des
  photos de chantier rempliraient le mur vert.
- **La galerie est vide** sur le site actuel (un titre « Photo Gallery », puis rien). Le site n'a que trois photos :
  d'autres maisons pourraient devenir de nouvelles pièces de l'enfilade, sans rien changer à la structure.
- **Une adresse Gmail** pour une maison à 5,8 M$ : une adresse sur leur domaine ferait plus sérieux.
- **La licence d'agent immobilier de Ryan** explique « Real estate services ». Pour l'afficher, la Floride demande le
  nom de son agence : à voir avec lui.
- **GrowthSpotter (2015)** annonce Feely Developments comme constructeur d'un projet de quatre maisons : à confirmer
  avant d'en parler.
- **Le profil GuildQuality** donne une ancienne adresse et des photos qui n'existent plus. **La page Facebook** citée
  par leur llms.txt n'est liée nulle part sur leur site : si elle est active, le nouveau site peut la lier.
- **Aucun témoignage** n'est publié : le site n'en invente pas. Des mots de clients, avec leur accord, seraient un vrai
  plus.
- **Leurs fautes** sont corrigées (« the 2nd Floor floor », « First first floor », « live In »).
- Le formulaire prépare un e-mail dans la messagerie du visiteur (rien ne part de la page, et la page le dit). Pour
  recevoir les demandes directement, un service de formulaires (Netlify Forms, Formspree) peut prendre le relais : une
  petite modification.

**Les documents de travail :**
- `ANALYSE.md` : le site actuel, ce qui sert la confiance, le registre, les photos ;
- `seo-audit-feelydevelopments.com-2026-10-27.md` : l'audit SEO et GEO du site actuel ;
- `DIRECTION.md` : la direction artistique, revue contre le brief avant de coder ;
- `REVUE.md` : la revue de design et la relecture des textes ;
- `ACCESSIBILITE.md` : l'audit d'accessibilité ;
- `boards/` : les planches :
  - l'arrivée image par image, l'accueil au repos, la jonction entre deux pièces, « Build », « Live », le téléphone,
    la tablette et l'image de partage (`l-enfilade.jpg`) ;
  - le cadre des détails sur les grandes photos, les étapes et les licences, au téléphone aussi (`les-details.jpg`) ;
  - les deux maisons, le rendez-vous rempli par « Ask about Palmer Avenue », les erreurs, l'envoi, la fin
    (`les-maisons-et-le-rendez-vous.jpg`).

## La méthode, et les extensions installées

- Le site est écrit à la main, en HTML, CSS et JavaScript.
- Lenis lisse le défilement, et `build.mjs` assemble le tout. À chaque construction, il vérifie aussi que :
  - chaque licence figure deux fois, chaque fois avec le lien de sa fiche, et le téléphone s'affiche au moins cinq fois ;
  - la seule adresse de rue est celle de l'entreprise, une seule fois, et aucune année n'apparaît hors 2007 (leurs
    débuts) et 2026 (le pied de page) ;
  - aucun numéro de maison ne revient (ni ceux de leur page, ni celui de la plaque), ni GuildQuality, ni la licence
    d'agent immobilier, ni le projet de GrowthSpotter, ni « GoDaddy » ou « reCAPTCHA » ;
  - chaque image a son attribut de remplacement, chaque référence (`aria-labelledby`, `aria-describedby`,
    `aria-controls`) et chaque ancre existent, la page a un seul h1, et aucun trait d'union insécable (absent des
    polices) ne s'est glissé.
- Les animations sont natives, sans GSAP ni WebGL. L'enfilade est le défilement normal de la page : une scène épinglée,
  dont la piste glisse de côté d'autant que la page descend ; le reste, ce sont des transitions CSS.

**Ce qui a servi :**
- **`frontend-design`** : le plan de direction artistique (couleurs, polices, mise en page, principes), revu contre le
  brief et contre les réflexes des pages générées avant de coder (voir `DIRECTION.md`).
- **21st.dev** : la recherche « horizontal scroll gallery » a donné « Scroll Horizontal Gallery » (motion.dev) et
  « Horizontal Scroll Gallery » : une scène épinglée dont le défilement vertical fait glisser une piste. C'est le
  principe de l'enfilade, réécrit ici en quelques lignes de JavaScript, sans React ni Motion. Les autres résultats (cartes
  en 3D qui se chevauchent, galeries en orbite, grilles qui se déplient en 3D, galerie infinie à faire glisser) ont été
  écartés : des effets de démonstration, pas une visite.
- **`design-critique`, `accessibility-review` et `ux-copy`** (extension Design) : leurs grilles ont servi à la revue des
  captures de 320 à 2 560 px, à l'audit WCAG et à la relecture des textes. Les corrections sont faites et listées dans
  `REVUE.md` et `ACCESSIBILITE.md`, dont quatre importantes : les photos lointaines qui ne se chargeaient pas dans
  l'enfilade, la touche Tab qui amenait un lien hors de l'écran, un trajet vers le formulaire qui s'annulait, et la page
  qui repasse de haut en bas quand le texte est agrandi.
- **`seo-audit`** (Maquinable GEO) : l'audit du site actuel (sa page, ses deux plans de site, deux analyseurs de
  robots.txt pour 13 robots, son llms.txt), puis les mêmes contrôles sur le nouveau.
- **Lighthouse 13.5**, installé en local, mesuré derrière un petit serveur qui compresse comme un hébergeur : 99 / 100 /
  100 / 100 sur ordinateur, 99 / 100 / 100 / 100 sur téléphone, sans aucun décalage de mise en page.
- **Playwright** :
  - les 43 essais d'interaction (`tools/interact.mjs`) : l'arrivée, la longueur exacte de l'enfilade, la barre qui
    continue d'une pièce à l'autre, la navigation et la barre sous la pièce en cours, le clavier (Tab, flèches, Entrée),
    le cadre des détails, la date de réponse, « Ask about Palmer Avenue », le formulaire, le passage de l'enfilade à la
    page verticale quand la fenêtre change, l'ajustement de 1 280 × 720 à 2 560 × 1 440, les débordements de 320 à
    1 024 px au doigt, le menu du téléphone, le mouvement réduit, la page sans JavaScript et le fichier unique hors
    ligne ;
  - le parcours au clavier, les cibles tactiles, le contraste mesuré sur les pixels, l'espacement de texte élargi et le
    zoom à 200 % (`tools/a11y.mjs`) ;
  - les captures, les planches, l'image de partage et les icônes (`tools/shots.mjs`, `tools/boards.mjs`,
    `tools/og.mjs`, `tools/icons.mjs`). Les essais et les captures lisent `dist-web` servi en local sur le port 8798.
- **Pillow** (`tools/images.py`) : les photos en AVIF, jamais agrandies, la plaque du pilier effacée, sans aucune
  métadonnée.
- **Fontsource et fontTools** (`tools/fonts.py`, `tools/fallback.py`) : les deux polices, réduites au latin et aux
  graisses utiles, et des polices de secours ajustées pour que la page ne bouge pas quand les vraies arrivent.
- **Les sources publiques**, pour ne rien inventer :
  - le registre des licences de l'État de Floride (myfloridalicense.com) ;
  - leur site actuel, lu avec l'outil de lecture web (nos requêtes directes étaient coupées par le réseau), et les
    originaux de leurs photos sur le CDN de GoDaddy.

**Ce qui n'a pas été retenu, et pourquoi :**
- **Facade UI et shadcn** : des sections React, et justement le découpage modèle (héros, cartes, chiffres,
  témoignages) que le brief refuse.
- **Hubot Sans**, la linéale qui ressemblait le plus à leur logo : ses zéros sont barrés, « 2007 » et « $5,800,000 »
  auraient eu l'air de codes.
- **Une loupe sur les photos, une galerie, une visionneuse** : trois photos, déjà en grand, et des détails recadrés à
  leur taille réelle.
- **Le profil GuildQuality** (une ancienne adresse, des photos disparues), **l'article de GrowthSpotter** (à confirmer),
  **la licence d'agent immobilier** (il faudrait le nom de l'agence), un article de Bungalower et la fiche Sunbiz (403,
  non lus).
- **Les numéros des maisons**, sur la photo comme dans le texte.
- **Des compteurs, un carrousel, des étoiles, des témoignages** : les réflexes d'un modèle de site, et rien de tout cela
  n'est à eux.

## L'idée : l'enfilade

Leur devise tient en trois mots reliés par deux traits d'union : Design-Build-Live. Le site en fait sa structure.

1. **Sur ordinateur, on traverse la maison de côté**, pièce après pièce, comme une enfilade (la façon française
   d'aligner les pièces, pour des maisons « Modern French Revival » et « Modern French Country »). La molette, le pavé
   tactile, la barre de défilement, les flèches et la touche Tab font avancer.
2. **Le trait d'union s'étire en une barre** qui court d'un mot au suivant, exactement à sa hauteur dans la lettre :
   « Design » en part, la barre file vers « Build », puis vers « Live ». Elle entre dans le B de Build comme la barre
   du milieu entre dans les E de leur logo.
3. **Chaque pièce a son mot, une de leurs photos en grand et une de leurs phrases.** À l'arrivée, le mot monte de
   derrière sa ligne, la barre file vers la droite, la photo s'ouvre dans le sens de la marche. Au survol d'un détail,
   son cadre se pose sur la grande photo, et le reste s'assombrit.

Sur un téléphone, une tablette, un écran trop bas, avec « réduire les animations » ou sans JavaScript, la même page se
lit de haut en bas : la barre entre alors dans chaque mot depuis le bord gauche, comme dans le logo, et ressort vers la
partie suivante.

La couleur vient de leurs photos : la chaux de la brique blanchie pour le fond, l'acier des huisseries noires pour le
texte et la barre, le vert buis des haies taillées pour le bouton et le mur de Palmer Avenue. Spectral très fine pour
les grands mots, Jost pour l'interface.

## La page, pièce par pièce

- **L'en-tête** : le logo, Design, Build, Live, Homes (une barre sous la pièce en cours, qui suit la souris), le
  téléphone et « Meet with Ryan ». Au téléphone, « Menu ».
- **Design** : « Custom homes and renovations in Winter Park. », leur phrase d'introduction, « Meet with Ryan » et le
  téléphone ; la photo de l'entrée ; « Our services transform your dream from paper to a residence. » ; trois détails.
- **Build** : la façade ; « Our goal is simply to serve our clients and honor their custom home through dedication,
  respect and hard work. » ; de l'immobilier à l'emménagement en cinq étapes ; les deux licences ; « Ryan Feely, CEO.
  Serving Winter Park since 2007. »
- **Live** : le séjour ; « Our passion is building a luxury home you love to live in. » ; trois détails.
- **Available homes** : Palmer Avenue sur son mur vert (en construction, 5 800 000 $, 7 426 pieds carrés sous toit, un
  terrain de 0,36 acre, l'entrée à double portail, « Plans and price may change. », « Ask about Palmer Avenue ») ; puis
  Whipple Avenue, vendue, et ses deux étages.
- **Meet with Ryan** : leur invitation, la date de réponse calculée, le téléphone et l'e-mail ; le formulaire (nom,
  e-mail, téléphone, sujet, message) et « Send to Ryan ».
- **La fin** : le logo en très grand, comme dernier mot de la frise ; l'adresse, le téléphone, l'e-mail, les licences ;
  « Back to the start ».

## Les photos

Leurs trois photos, et rien d'autre : l'entrée, la façade et le séjour (voir `ANALYSE.md`). Exportées en AVIF par
`tools/images.py` :
- depuis les originaux du CDN de GoDaddy, jamais agrandies : 2 560, 1 920, 1 280 et 800 px de large pour l'entrée et le
  séjour, 2 002, 1 600 et 1 000 px pour la façade ;
- six détails recadrés dans ces originaux, à leur taille réelle (de 460 à 560 px de large, et 360 px) : les portes
  anciennes sur leur rail, la brique blanchie, le chêne en chevrons ; les poutres et le plafond de planches, la cheminée
  dans le mur de chêne, la hotte en bois ;
- la plaque du pilier de la façade, qui donnait le numéro de la maison, effacée ;
- les couleurs du photographe, sans autre retouche ;
- sans aucune métadonnée (les intérieurs gardaient l'appareil et la date).

## Le logo

Le leur, redessiné en vectoriel d'après leur seul fichier, un JPEG gris et flou (`tools/mark.mjs`) : « FEELY » en
lettres très larges aux angles arrondis ; la barre du milieu de chaque E traverse le fût et dépasse à gauche. Le tracé
recouvre l'original à 90 %. Sur le site, il est en acier sur la chaux ; son E sert d'icône (l'onglet, l'écran d'accueil
des téléphones).
