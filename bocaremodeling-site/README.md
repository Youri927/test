# Boca Remodeling Group : nouveau site

Refonte complète de https://bocaremodelinggroup.com.

Boca Remodeling Group est une entreprise de rénovation de Boca Raton, en Floride :
- « Over 30 years experience in construction », « high-quality home and back yard 3D design for many years » (leurs
  mots) ;
- licence de l'État CGC1539814 (Certified General Contractor), active jusqu'au 31 août 2028, au nom commercial Boca
  Remodeling Group (vérifiée sur le registre de l'État le 22 octobre 2026) ;
- sur leurs camions : kitchens, bathrooms, windows, roofs, pools ; sur leur site : plomberie, électricité, menuiserie,
  jardins et terrasses, « everything from repairs to major renovations » ;
- un bureau au 7284 West Palmetto Park Road, où « Our Customers are welcome to visit us! ».

- **À ouvrir** : `dist/index.html`, d'un double-clic. C'est un seul fichier (4,2 Mo : les photos, les polices, le logo
  et le script compris), qui marche sans serveur ni connexion.
- **À mettre en ligne** : le dossier `dist-web/` (la page fait 116 Ko, 32 Ko une fois compressée par l'hébergeur ; les
  polices et les photos à part, chargées à la demande, en plusieurs tailles).
  - On le glisse sur app.netlify.com/drop, ou on le publie sur Vercel avec `vercel.json`.
  - `_headers` (Netlify) et `vercel.json` demandent aux moteurs de recherche de ne pas indexer la maquette. Ils sont
    à retirer au lancement.
  - Le site actuel n'a qu'une page : il n'y a pas d'anciennes adresses à rediriger. `_redirects` et `vercel.json`
    envoient seulement l'adresse avec `www` vers celle sans `www`, en une redirection.
  - Prêts pour leur domaine :
    - `robots.txt` ;
    - `sitemap.xml` ;
    - `llms.txt` (qui ils sont, la licence, les trois histoires « dessiné, puis construit », les métiers, le bureau) ;
    - l'image de partage (`assets/og.jpg`) et les icônes (l'onglet, l'écran d'accueil des téléphones, le logo des
      données structurées).

**À dire au client :**
- **48 photos de leur site actuel gardent la position GPS de la maison du client**, dans le fichier : n'importe qui
  peut retrouver la maison à partir d'une photo de salle de bain. C'est à corriger tout de suite, sur le site actuel,
  sans attendre le nouveau (voir l'audit SEO, point 1). Les photos du nouveau site n'ont aucune métadonnée.
- **Le bouton d'appel du bandeau compose le numéro de licence** (`tel:1539814`), pas le 561-247-2727.
- **La faute de l'accroche** : « You're local trusted Remodeling CO. » (pour « Your »). GoDaddy la recopie dans leur
  llms.txt et dans la description de partage.
- **Leur accueil montre des photos d'annonces de maisons californiennes** (une soixantaine, dont cinq au filigrane
  « CRISNET ») et **des images générées** : deux versions réinventées de leur salle de bain en pierre, une quinzaine
  de « rendus », une image de banque d'images. Aucune n'est reprise ; le nouveau site ne montre que leurs chantiers de
  Floride.
- **Leurs chantiers de Californie (2019 à 2023)** sont écartés eux aussi : les montrer sans le dire tromperait. S'ils
  le souhaitent, on peut les ajouter avec le lieu écrit.
- **La licence date du 16 décembre 2025**, mais leurs photos de chantiers en Floride remontent à 2024. Le nouveau site
  ne date aucun chantier ; à eux de dire sous quelle licence ces travaux ont été faits.
- **Deux numéros** (561-247-2727 sur le site, un autre sur les camions) et **deux noms** (avec ou sans « Consulting ») :
  le nouveau site garde 561-247-2727 et « Boca Remodeling Group », le nom du logo, des camions et du registre. À
  harmoniser partout, fiche Google comprise.
- **L'e-mail est une adresse Gmail** : une adresse au nom du domaine ferait plus sérieux.
- **Aucun avis sur la page** (« Reviews coming soon! » trois fois sur le site actuel). Le nouveau site renvoie à leur
  fiche Google sans citer d'avis qu'il n'a pas pu lire. Trois à cinq avis, avec l'accord des clients, renforceraient
  beaucoup la page.
- **« Insured »** est écrit sur le tee-shirt de l'équipe, pas sur le site : à confirmer (avec l'assureur) avant de
  l'écrire.
- **Le logo** : leur logo de catalogue (deux maisons brillantes, étincelles, cercle argenté sur noir) est redessiné à
  plat, leurs deux toits bleus et la porte. À valider avec eux.
- **« Windows »** est sur la liste des camions, mais aucune photo de fenêtres n'existe : le mot montre les camions,
  avec une légende honnête. Une photo de pose de fenêtres compléterait la liste.
- Le site ne nomme personne : ni le titulaire de la licence, ni le prénom écrit sur les camions, ni aucun client.
- Le formulaire prépare un e-mail dans la messagerie du visiteur (rien ne part de la page, et la page le dit). Pour
  recevoir les demandes directement, avec les photos, un service de formulaires (Netlify Forms, Formspree) peut
  prendre le relais : une petite modification.

**Les documents de travail :**
- `ANALYSE.md` : le site actuel, ce qui a été vérifié ailleurs (la licence), ce qui se contredit, et le tri des 145
  photos (gardées, écartées, et pourquoi) ;
- `seo-audit-bocaremodelinggroup.com-2026-10-22.md` : l'audit SEO et GEO du site actuel ;
- `DIRECTION.md` : la direction artistique, revue contre le brief avant de coder, puis après la première version ;
- `REVUE.md` : la revue de design et la relecture des textes ;
- `ACCESSIBILITE.md` : l'audit d'accessibilité ;
- `boards/` : les planches :
  - l'ouverture image par image, la scène de l'accueil au défilement, le téléphone et l'image de partage
    (`l-accueil.jpg`) ;
  - la cuisine et la salle de bain à l'estrade, leurs apparitions, la visionneuse (`dessine-puis-construit.jpg`) ;
  - la liste des camions, survolée et choisie, et le travail, sur ordinateur, tablette et téléphone
    (`la-liste-et-le-travail.jpg`) ;
  - le bureau, le devis, les erreurs, l'envoi, le pied de page (`le-bureau-et-le-devis.jpg`).

## La méthode, et les extensions installées

- Le site est écrit à la main, en HTML, CSS et JavaScript.
- Lenis fait le défilement doux, et `build.mjs` assemble le tout. À chaque construction, il vérifie aussi que :
  - la licence, le téléphone, le bureau et « over 30 years » sont bien là ;
  - « coming soon » n'est pas revenu, et qu'aucune année ne s'affiche hors 2026 (le pied de page) et 2028 (la licence) ;
  - chaque bouton ouvre un projet qui existe, sur une photo qui existe ;
  - chaque image a son texte de remplacement, et chaque cadre de porte de la scène est valide ;
  - la page a un seul h1.
- Les animations sont natives (la scène menée par le défilement, des animations CSS jouées une fois), sans GSAP ni
  WebGL.

**Ce qui a servi :**
- **`frontend-design`** : le plan de direction artistique (couleurs, polices, mise en page, principes), revu contre
  le brief et contre les réflexes des pages générées avant de coder, puis une seconde fois après la première version
  (voir `DIRECTION.md`). Une esquisse en plein écran, un fondu entre les trois états, une serif de magazine et le rose
  de Boca Raton ont été écartés ; plus tard, l'apparition en fondu de chaque section aussi, au profit du rectangle
  bleu de l'accueil.
- **`design-critique`, `accessibility-review` et `ux-copy`** (extension Design) : la revue des captures de 320 à
  2560 px, l'audit WCAG et la relecture des textes. Les corrections sont faites et listées dans `REVUE.md` et
  `ACCESSIBILITE.md`, dont deux bloquantes : les mots non choisis de la liste tombaient à 2,1:1, et le titre d'une
  ligne débordait quand on élargit l'espacement du texte.
- **`seo-audit`** (Maquinable GEO) : l'audit du site actuel (sa page unique, ses plans de site, deux analyseurs de
  robots.txt, son llms.txt), puis les mêmes contrôles sur le nouveau.
- **Lighthouse 13.5**, installé en local (l'extension des outils de Chrome ne se connecte pas), mesuré aussi derrière
  un petit serveur qui compresse comme un hébergeur.
- **Playwright** :
  - l'ouverture et les apparitions capturées image par image ;
  - les 52 essais d'interaction (`tools/interact.mjs`), dont la scène au défilement et par ses étapes, l'ordre des
    apparitions, la visionneuse à la souris, au clavier et au doigt, la liste des camions, le devis, le menu du
    téléphone, le mouvement réduit, la page sans JavaScript et les débordements de 320 à 1920 px ;
  - le parcours au clavier, les cibles tactiles et le contraste mesuré sur les pixels, à 1440 px et sur téléphone
    (`tools/a11y.mjs`) ;
  - les planches, l'image de partage et les icônes (`tools/shots.mjs`, `tools/boards.mjs`, `tools/og.mjs`,
    `tools/icons.mjs`).
- **Pillow** (`tools/images.py`) : les photos en AVIF, converties en sRGB, sans aucune métadonnée (vérifié à la fin de
  chaque export), et le numéro d'une maison effacé.
- **Fontsource** : les deux polices, en paquets npm, réduites au latin, aux graisses et aux chasses utiles.
- **Les sources publiques**, pour ne rien inventer :
  - le registre de l'État de Floride (myfloridalicense.com) pour la licence ;
  - leur site actuel, pour les textes et les photos (les 145 originaux du CDN de GoDaddy, lus un par un) ;
  - la documentation de Google sur les données structurées, pour vérifier la lecture des horaires.
- **21st.dev** : la recherche du catalogue a échoué trois fois le 22 octobre 2026 (« catalog search failed », côté
  serveur). Rien n'en vient.

**Ce qui n'a pas été retenu, et pourquoi :**
- **Facade UI et shadcn** : des sections React, et justement le découpage modèle (héros, cartes, chiffres,
  témoignages) que le brief refuse.
- **Les photos d'annonces, les images générées, l'image de banque d'images, les rendus de jeu vidéo** et trois photos
  de terrasses très retouchées (voir `ANALYSE.md`).
- **Leurs chantiers de Californie.**
- **Les photos qui montrent un numéro de maison, une boîte aux lettres, une plaque d'immatriculation ou une personne
  de la maison** : neuf écartées, deux recadrées, un numéro effacé.
- **Les noms et les adresses** : ni le titulaire de la licence, ni le prénom des camions, ni les adresses de clients
  lues dans les noms de fichiers.
- **Les dates de chantier** (voir plus haut).
- **Un curseur avant/après** (leurs trois états ne sont pas un avant et un après), **un carrousel**, **une rangée de
  chiffres** et **des étoiles**.

## L'idée : « We draw it. Then we build it. »

Leur meilleure preuve était noyée dans une galerie intitulée « Before & After » : **la même salle de bain esquissée
aux crayons de couleur dans un carnet, dessinée en 3D quinze jours plus tard, puis construite**, vue du même endroit.
Le site s'ouvre là-dessus.

1. **À l'ouverture**, le titre monte derrière son cache, et l'esquisse s'ouvre depuis sa porte, dans un rectangle
   bordé de bleu (le bleu du crayon qui trace la douche sur l'esquisse, et celui de leur logo).
2. **Au défilement**, la scène se fige : la 3D sort de la porte de l'esquisse, puis la vraie pièce sort de la porte de
   la 3D, et la caméra recule. Les trois images sont calées sur la porte du fond (son axe, la ligne du sol, sa
   hauteur). Les trois étapes à droite sont aussi des boutons.
3. **Plus bas**, le même rectangle bleu fait apparaître chaque photo de projet, une fois, et ouvre la photo de la
   liste des camions.

Le reste se tait : le plâtre, l'encre et le bleu de leur logo ; Mozilla Headline étroite pour tout ce qui est grand,
Mozilla Text pour le reste. Petit et à marge blanche, c'est dessiné ; grand et sans cadre, c'est construit.

## La page, partie par partie

- **L'en-tête** : leurs deux toits et leur nom, Drawn first, What we do, Our work, Visit us, le téléphone et « Free
  quote » ; il se range quand on descend, revient quand on remonte, et souligne la partie où l'on est.
- **L'accueil** (« We draw it. Then we build it. ») : le texte d'appui, « Get a free quote » et le téléphone ; la scène
  et ses trois étapes : Sketched by hand, Drawn in 3D, Built.
- **Deux autres pièces** (« Two more rooms, drawn first ») : la cuisine aux deux îlots de quartzite (le plan et la 3D
  sur l'écran du bureau, le polissage de l'îlot, la cuisine finie, qui reste en vue), puis la salle de bain à
  l'estrade (la 3D cotée, la douche, la pièce), en escalier. Chaque photo s'ouvre en grand.
- **La liste des camions** : « Kitchens, Bathrooms, Windows, Roofs, Pools. » en très grand ; chaque mot montre un de
  leurs chantiers, et s'élargit quand on le choisit. Puis les autres métiers, de la plomberie aux terrasses.
- **Le travail** (« More of our work ») : huit projets en quinconce, de la salle de bain de l'accueil aux toits de
  l'été, chacun ouvrant sa visionneuse.
- **Le bureau** (« Come by the office »), sur l'encre : l'adresse en très grand, ouvert ou fermé à l'heure de Boca
  Raton, l'itinéraire ; le téléphone, l'e-mail, la licence avec le lien vers sa fiche à l'État, plus de 30 ans, la
  fiche Google ; leur pick-up sur un chantier de toit.
- **Le devis** (« Get a free quote ») : nom, téléphone ou e-mail, adresse du chantier, les sujets à cocher, les
  détails ; le bouton « Email my request » prépare l'e-mail.
- **Le pied de page** : le logo, le bureau, le contact, la licence ; « The photos on this site are of our own
  projects. »

## Les photos

32 images, toutes les leurs (voir `ANALYSE.md`) : leurs photos de chantiers en Floride, l'esquisse, le rendu 3D et les
deux photos de l'écran du bureau. Exportées en AVIF par `tools/images.py` :
- les originaux du CDN de GoDaddy (2560 px de côté au plus, 1290 au moins), jamais agrandis : chaque image est servie au plus à sa
  taille d'origine, en 1600, 1000 et 600 px de large (1200, 800 et 480 en hauteur), les trois de la scène en plus
  grand ;
- les photos d'iPhone converties du Display P3 vers le sRGB, sans autre retouche ;
- recadrées seulement pour ôter le cadre de la capture du rendu 3D, la barre des tâches de l'écran du bureau, et deux
  plaques d'immatriculation ; le numéro d'une maison est effacé ;
- sans aucune métadonnée : ni date, ni appareil, ni position.

## Le logo

Leurs deux toits (le grand avec sa porte cintrée et sa cheminée, le petit derrière), redessinés à plat d'après leur
logo de catalogue (`tools/mark.mjs`) : en bleu azur et encre sur clair, en bleu et blanc sur l'encre. Il sert aussi
d'icône (l'onglet, l'écran d'accueil des téléphones) et de logo des données structurées, avec le nom en Mozilla
Headline.

## Les mesures

Lighthouse 13.5, sur la version en ligne servie en local ; téléphone simulé (4G lente, processeur ralenti 4 fois) ;
médiane des passages 2 et 3.

| Mesure | Résultat |
|--------|----------|
| Performance (Lighthouse) | **98** au téléphone, **100** sur ordinateur, derrière un serveur qui compresse comme un hébergeur (sans compression : 93 et 99) |
| Accessibilité (Lighthouse) | **100** sur ordinateur et sur téléphone |
| Bonnes pratiques (Lighthouse) | **100** |
| SEO (Lighthouse) | **100** |
| Affichage du contenu principal (LCP), téléphone ralenti | **2,3 s** (0,7 s sur ordinateur) ; c'est le texte d'appui de l'accueil |
| Temps de blocage (TBT) | **0 ms** |
| Décalage de la mise en page (CLS) | **0** |
| Essais d'interaction (`tools/interact.mjs`) | **52 sur 52** |
| Audit d'accessibilité (`tools/a11y.mjs`) | aucun point bloquant |
| Débordements, de 320 à 1920 px | aucun |

## Refaire le site

```
python3 -I tools/fonts.py <paquet @fontsource-variable/mozilla-headline> <paquet @fontsource-variable/mozilla-text>
python3 -I tools/images.py <dossier des photos téléchargées>    # les photos → src/img/*.avif et data/*.json
node tools/icons.mjs                                             # l'icône de l'onglet, celle des téléphones, le logo
python3 -I tools/fallback.py                                     # les polices de secours ajustées
node tools/og.mjs                                                # l'image de partage
node build.mjs                                                   # dist/ et dist-web/
node tools/interact.mjs <dossier>                                # les 52 essais
python3 -m http.server 8795 --bind 127.0.0.1 --directory dist-web
node tools/a11y.mjs                                              # l'audit d'accessibilité
node tools/shots.mjs <dossier> && node tools/boards.mjs <dossier> boards
```
