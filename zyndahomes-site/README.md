# Zynda Custom Homes & Remodeling : nouveau site

Refonte complète de https://www.zyndahomes.com.

Zynda Custom Homes & Remodeling, Inc. est un entrepreneur général de Naples, en Floride :
- une entreprise familiale venue de Buffalo (New York), à Naples et Marco Island depuis 2001 ;
- licence de l'État CGC056812 (Certified General Contractor), active jusqu'au 31 août 2028 (vérifiée sur le registre
  de l'État le 18 octobre 2026) ;
- maisons neuves sur mesure, rénovations de condos et de maisons entières, cuisines, salles de bain, agrandissements,
  cuisines d'extérieur et lanais ; des projets de 100 000 $ à plus de 7 000 000 $ ;
- peu de chantiers à la fois, sur place chaque jour ; et pour les condos, une saison fixe : ils commencent en mai et
  finissent le 1er octobre, pendant que les propriétaires passent l'été dans le Nord.

- **À ouvrir** : `dist/index.html`, d'un double-clic. C'est un seul fichier (3 Mo : les photos, les polices, le logo et
  le script compris), qui marche sans serveur ni connexion.
- **À mettre en ligne** : le dossier `dist-web/` (la page fait 166 Ko ; les polices et les photos à part, chargées à
  la demande, en plusieurs tailles).
  - On le glisse sur app.netlify.com/drop, ou on le publie sur Vercel avec `vercel.json`.
  - `_headers` (Netlify) et `vercel.json` demandent aux moteurs de recherche de ne pas indexer la maquette. Ils sont
    à retirer au lancement.
  - `_redirects` (Netlify) et `vercel.json` renvoient les 7 anciennes pages (`/home`, doublon de l'accueil, les
    services, « What sets us apart », la page des propriétaires, le recrutement, les zones, le contact) vers la bonne
    partie de la nouvelle page, par une redirection permanente (301).
  - Le blog (42 articles, et 337 pages de mots-clés et de catégories) mène à la partie sur l'année, dont parlent la
    plupart des articles. Si le blog est gardé ou migré, retirer ces lignes (signalées dans `_redirects` ; dans
    `vercel.json`, ce sont les deux lignes `/blog`).
  - Prêts pour leur domaine :
    - `robots.txt` ;
    - `sitemap.xml` ;
    - `llms.txt` (qui ils sont, la licence, la saison des condos, les zones, les sept avis) ;
    - l'image de partage (`assets/og.jpg`) et les icônes (l'onglet, l'écran d'accueil des téléphones, le logo carré
      des données structurées).

**À dire au client :**
- sur leur site actuel, l'accueil s'ouvre sur une image générée par IA (la cuisine « kitchen WOW »), et une quinzaine
  d'autres images d'IA (ouvriers en casque, t-shirts au « Z ») sont mêlées à leurs vraies photos ; quatre photos
  d'annonces immobilières portent encore le filigrane « SWFLAMLS ». Aucune n'est reprise : le nouveau site ne montre
  que leurs chantiers ;
- toutes leurs pages portent le même titre (45 pages, articles compris), et cinq adresses de leur plan de site
  renvoient une erreur 404 (voir l'audit SEO) ;
- le code postal du bureau est 34116 dans les données structurées de leur site, 34104 partout ailleurs et au registre
  de l'État : le nouveau site dit 34104 ;
- « member of our local CBIA » : l'adhésion n'a pas pu être vérifiée, elle n'est pas reprise. À confirmer ;
- « since 2001 », « over 20+ years », « over 25 years » selon les pages : le nouveau site ne dit que « since 2001 » ;
- le site ne nomme personne, comme le leur. S'ils veulent apparaître sous leur nom, il suffit de le dire ;
- les avis restent signés comme sur leur site (initiales et lieux) ; avec l'accord des clients, un prénom les rendrait
  plus vivants ;
- il manque des photos récentes de condos finis, idéalement un même appartement avant et après l'été : c'est leur cœur
  de métier, et le site n'en montre qu'une, le chantier face au golfe. Les lieux des photos, quand les clients sont
  d'accord, feraient des légendes des preuves ;
- le formulaire prépare un e-mail dans la messagerie du visiteur (rien ne part de la page, et la page le dit). Pour
  recevoir les demandes directement, un service de formulaires (Netlify Forms, Formspree) peut prendre le relais :
  une petite modification.

**Les documents de travail :**
- `ANALYSE.md` : le site actuel, ce qui a été vérifié ailleurs (licence, CBIA), et le tri des 85 images (gardées,
  écartées, et pourquoi) ;
- `seo-audit-zyndahomes.com-2026-10-18.md` : l'audit SEO et GEO du site actuel ;
- `DIRECTION.md` : la direction artistique, revue contre le brief avant de coder ;
- `REVUE.md` : la revue de design et la relecture des textes ;
- `ACCESSIBILITE.md` : l'audit d'accessibilité ;
- `boards/` : les planches :
  - l'ouverture en Z image par image, sur ordinateur et sur téléphone, et l'image de partage (`l-accueil.jpg`) ;
  - le cadran aux quatre temps de l'année, et les condos (`l-annee.jpg`) ;
  - les pièces, la visionneuse, les détails et leurs gros plans (`les-pieces.jpg`) ;
  - ce qui les distingue, les prestations, la famille, les quartiers (`la-maison.jpg`) ;
  - la demande, la fenêtre d'absence, les erreurs, l'envoi, le pied de page (`demande.jpg`) ;
  - le téléphone, en douze écrans (`telephone.jpg`).

## La méthode, et les extensions installées

- Le site est écrit à la main, en HTML, CSS et JavaScript.
- Lenis fait le défilement doux, et `build.mjs` assemble le tout (il dessine aussi le cadran, en SVG).
- Les animations sont natives (transitions CSS, et le cadran mené par le défilement), sans GSAP ni WebGL.

**Ce qui a servi :**
- **`frontend-design`** : le plan de direction artistique (couleurs, polices, mise en page, principes), revu contre
  le brief et contre les réflexes des pages générées avant de coder (voir `DIRECTION.md`). L'accueil en photo plein
  écran, les quatre étapes numérotées, le carrousel d'avis et une première palette trop proche d'Ehlers ont été
  remplacés à cette relecture.
- **`design-critique`, `accessibility-review` et `ux-copy`** (extension Design) : la revue des captures de 320 à
  1920 px, l'audit WCAG et la relecture des textes. Les corrections sont faites et listées dans `REVUE.md` et
  `ACCESSIBILITE.md`, dont deux bloquantes : des photos qui restaient blanches au défilement, et les étiquettes du
  cadran à 7 px sur téléphone.
- **`seo-audit`** (Maquinable GEO) : l'audit du site actuel (50 pages sur les 387 adresses de son plan de site, deux
  analyseurs de robots.txt), puis les mêmes contrôles sur le nouveau.
- **Lighthouse 13.5**, installé en local (l'extension des outils de Chrome ne se connecte pas) : le score au téléphone
  est passé de 91 à 95 (l'icône de l'onglet en PNG plutôt qu'en tracé, la feuille de style minifiée, un logo allégé,
  une ouverture qui n'attend pas les polices plus de 0,7 s).
- **Playwright** :
  - l'ouverture capturée à des instants donnés ;
  - les 40 essais d'interaction (`tools/interact.mjs`), dont le cadran lié au défilement et à la vraie date du jour,
    la visionneuse à la souris, au clavier et au doigt, la demande, le mouvement réduit, la page sans JavaScript et
    les débordements de 320 à 1920 px ;
  - le parcours au clavier, les cibles tactiles et le contraste mesuré sur les pixels (`tools/a11y.mjs`) ;
  - les planches, l'image de partage et les icônes (`tools/shots.mjs`, `tools/boards.mjs`, `tools/og.mjs`,
    `tools/icons.mjs`).
- **potrace** (potracer) : leur logo vectorisé à partir de leurs deux fichiers publiés.
- **Fontsource** : les deux polices, en paquets npm, réduites au latin.
- **Les sources publiques**, pour ne rien inventer :
  - le registre de l'État de Floride (myfloridalicense.com) pour la licence ;
  - leur site actuel, pour les textes, les sept avis et les photos (à 2 500 px, le maximum que sert Squarespace), et
    les 42 articles du blog pour la saison des condos.
- **21st.dev**, consulté pour la recherche (une frise ou un calendrier mené par le défilement, des photos qui
  s'ouvrent en entrant à l'écran, des sites d'architectes) : des calendriers React, des galeries à défilement, un
  carrousel 3D, trop génériques pour Zynda. Rien n'est repris : le cadran, les ouvertures et la liste des prestations
  sont écrits ici.

**Ce qui n'a pas été retenu, et pourquoi :**
- **Facade UI et shadcn** : des sections React, et justement le découpage modèle (héros, cartes, chiffres,
  témoignages) que le brief refuse.
- **Les images générées par IA, les photos d'annonces à filigrane**, la photo créditée à un autre studio (« Interior
  Design by Heddy Z Designs ») et celle d'un export Flickr de provenance incertaine.
- **L'adhésion à la CBIA** (non vérifiée), « over 25 years » (contredit par « since 2001 »), et les textes « SEO »
  répétés de page en page.
- **Les noms** : le registre de l'État nomme le titulaire de la licence, mais leur site ne nomme personne ; le nouveau
  non plus.
- **Une carte du secteur** : Skoda et Mendieta en avaient une. Ici, les quartiers sont écrits en grand : à Naples, ces
  noms parlent d'eux-mêmes.
- **Le bleu « confiance »**, et toute couleur ajoutée : leur logo est noir et blanc, le site aussi. La seule couleur est
  celle de leur piscine, réservée à la saison des condos.
- **Un carrousel d'avis** : les sept avis sont posés là où ils prouvent quelque chose.
- **« Get a free estimate »** : leurs projets commencent par une rencontre ; le bouton dit « Plan a consultation »,
  comme les « Schedule a Consultation » de leurs pages.

## L'idée : « The people who show up. Every single day. »

C'est leur phrase. Et ce qui les distingue n'est pas d'être « luxe » (tous leurs concurrents le disent), c'est leur
année : ils préparent avec les propriétaires en hiver, commencent en mai quand ceux-ci repartent dans le Nord, sont sur
place chaque jour de l'été, envoient photos et e-mails d'avancement, et rendent l'appartement fini le 1er octobre. Le
site raconte cette année ; leurs photos portent le luxe.

1. **L'accueil en Z.** La première moitié de la phrase en haut à gauche, leur plus belle photo (la maison neuve au bord
   de l'eau et sa piscine) en bandeau d'un bord à l'autre de l'écran, la fin de la phrase en bas à droite. L'œil lit en
   Z, comme le monogramme de leur logo, sans qu'on dessine de Z.
2. **Le cadran de l'année.** Rond comme leur emblème : les douze mois, 365 traits comme la minuterie d'une montre,
   l'hiver en pointillé, la saison des condos en arc couleur d'eau de piscine. Sur ordinateur, il reste à l'écran
   pendant les quatre temps de l'année : un repère avance, la date change au centre, l'arc se remplit. Un second repère
   marque la vraie date du jour, avec une ligne utile : hors saison, leur conseil (plus tôt on prépare, plus tôt on
   commence) ; en saison, les jours qui restent jusqu'au 1er octobre.
3. **Les détails** : leur devise, « Adding pop is what we do best. », sur un bandeau noir de six gros plans pris dans
   leurs photos ; un clic ouvre la pièce entière.
4. **« When are you away? »** Dans la demande, deux mois dessinent la fenêtre d'absence sur une frise de l'année, à côté
   de la saison des condos.

Le reste se tait : le noir et blanc de leur logo, beaucoup de blanc, de grandes photos nettes, des légendes exactes.
Deux polices : Montagu Slab, une égyptienne fine et contrastée en grand, qui s'accorde au « ZYNDA » de leur logo sans
le copier, pour tout ce qui est grand ; Reddit Sans pour le reste.

## La page, partie par partie

- **L'en-tête** : leur emblème et leur mot « ZYNDA », Work, Your year, Services, About, Contact, le téléphone et
  « Plan a consultation » ; il se range quand on descend, revient quand on remonte, et souligne la partie où l'on est.
- **L'accueil** : « Custom homes and renovations in Naples and Marco Island », « The people who show up. », la maison et
  sa piscine, « Every single day. » ; une entreprise familiale depuis 2001, peu de chantiers à la fois, sur place
  chaque jour ; « Plan a consultation » et le téléphone.
- **Ce qui les distingue** : « We intentionally take on only a few projects at a time. », leurs quatre engagements (sur
  place chaque jour ; des chantiers propres, la poussière contenue, sols et meubles protégés ; des sous-traitants de
  confiance ; tout au bouche-à-oreille, références sur demande) et la licence, avec le lien vers le registre de l'État.
- **L'année** (« We plan in winter. We build while you're away. ») : le cadran et les quatre temps, « Winter. You're
  here. », « May. We start. », « June to September. On site, every day. », « October 1st. You're home. », chacun avec
  sa photo ; l'avis sur les photos d'avancement sous l'été, les deux avis sur les délais tenus sous le 1er octobre.
  Puis les condos : les approbations de la copropriété, les règles de l'immeuble, la logistique, les immeubles où ils
  ont travaillé, et l'avis de Pelican Bay.
- **Les pièces** (« The work ») : douze photos en suite éditoriale, de tailles différentes, une légende courte sous
  chacune ; deux avis posés entre les photos ; la visionneuse (flèches, clavier, doigt, Échap).
- **Les détails** : « Adding pop is what we do best. », l'avis de Marco Island sur les « BIG details », six gros plans
  qui ouvrent chacun sa pièce.
- **Les prestations** (« What we build ») : sept lignes, de la maison neuve aux cuisines d'extérieur ; au survol, la
  photo se découvre à sa place. Leurs fourchettes, de 100 000 $ à plus de 7 000 000 $, et le travail avec l'architecte
  et le designer du client.
- **La famille** (« A family business, here since 2001. ») : leur portrait, Buffalo, leur phrase sur les détails,
  l'offre d'emploi.
- **Les quartiers** (« Where we've worked ») : Naples, Marco Island et les immeubles, en grand.
- **La demande** (« Plan a consultation ») : nom, e-mail, téléphone, le projet, l'immeuble ou le quartier, les mois
  d'absence, le message ; le bouton « Email my request » prépare l'e-mail. À côté : le téléphone, l'e-mail, le bureau,
  les horaires, la licence.
- **Le pied de page**, en noir : le logo, le bureau et les horaires, le contact, Instagram et Facebook, la licence.

## Les photos

19 photos, toutes les leurs (voir `ANALYSE.md`), exportées en AVIF (`tools/images.py`) en 25 images, les recadrages
du bandeau, du téléphone et des gros plans compris :
- prises à la plus grande taille que sert leur site (jusqu'à 2 500 px de large) et jamais agrandies : chaque image
  est servie au plus à sa taille d'origine ;
- les photos prises au téléphone (la cheminée, les deux photos des carreaux en écailles) converties du Display P3 vers
  le sRGB, sans autre retouche ;
- vérifiées une à une, à pleine taille : sur la photo de la vasque aux écailles, la personne qu'on apercevait en haut
  est retirée par le recadrage ;
- légendées pour ce qu'elles montrent, avec le lieu seulement quand leur site le donne.

## Le logo

Leur emblème rond (l'anneau, son texte en réserve, le Z au centre), leur mot « ZYNDA » et la ligne « CUSTOM HOMES &
REMODELING INC. », vectorisés depuis leurs deux fichiers publiés (`tools/logo.py`) : au pixel près, sans rien
redessiner, nets à toutes les tailles, en noir sur blanc ou en blanc sur noir. L'emblème sert aussi d'icône (l'onglet,
l'écran d'accueil des téléphones).

## Les mesures

Lighthouse 13.5, sur la version en ligne servie en local ; téléphone simulé (4G lente, processeur ralenti 4 fois).

| Mesure | Résultat |
|--------|----------|
| Performance (Lighthouse) | **95** au téléphone (91 avant correction), **100** sur ordinateur |
| Accessibilité (Lighthouse) | **100** sur ordinateur et sur téléphone |
| Bonnes pratiques (Lighthouse) | **100** |
| SEO (Lighthouse) | **100** |
| Navigation par agents (Lighthouse) | **100** |
| Affichage du contenu principal (LCP), téléphone ralenti | **2,7 s** (0,6 s sur ordinateur) |
| Temps de blocage (TBT) | **0 ms** |
| Décalage de la mise en page (CLS) | **0** |
| Essais d'interaction (`tools/interact.mjs`) | **40 sur 40** |
| Audit d'accessibilité (`tools/a11y.mjs`) | aucun point bloquant |
| Débordements, de 320 à 1920 px | aucun |

## Refaire le site

```
python3 -I tools/fonts.py <paquet @fontsource-variable/montagu-slab> <paquet @fontsource-variable/reddit-sans>
python3 -I tools/logo.py <emblème.jpg> <logo horizontal.jpg>    # le logo → data/logo.json
python3 -I tools/images.py <dossier des photos téléchargées>    # les photos → src/img/*.avif et data/photos.json
node tools/icons.mjs                                             # l'icône de l'onglet, celle des téléphones, le logo carré
python3 -I tools/fallback.py                                     # les polices de secours ajustées
node tools/og.mjs                                                # l'image de partage
node build.mjs                                                   # dist/ et dist-web/
node tools/interact.mjs <dossier>                                # les 40 essais
python3 -m http.server 8796 --bind 127.0.0.1 --directory dist-web
node tools/a11y.mjs                                              # l'audit d'accessibilité
node tools/shots.mjs <dossier> && node tools/boards.mjs <dossier> boards
```

Les sources : `src/index.html` (le contenu), `src/styles.css`, `src/main.js`, `vendor/` (Lenis, et les polices
Montagu Slab et Reddit Sans, licence OFL, dans `vendor/fonts/`).

`build.mjs` vérifie à chaque fois que les sept avis des données structurées sont sur la page mot pour mot (et qu'il y a
autant de citations de clients que d'avis), que la licence figure dans les engagements, le contact, le pied de page et
les données, que le bureau et le téléphone sont ceux de la page, que chaque photo est décrite, que chaque photo des
pièces a sa légende, que chaque gros plan mène à une photo qui existe, et qu'aucune photo n'est intégrée deux fois dans
le fichier unique.
