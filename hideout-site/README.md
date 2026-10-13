# Hideout Boutique : nouveau site

Refonte complète de https://www.hideoutboutique.com.

Hideout Boutique est un med spa de Fort Myers, en Floride, ouvert en 2017 par Jennifer Linzalone Sepielli :
- au 1342 Colonial Blvd, suite H57, juste au sud de Colonial Boulevard et à l'est de McGregor ;
- un directeur médical, une infirmière praticienne qui fait toutes les injections, une infirmière, des esthéticiennes diplômées, des artistes cils et maquillage permanent ;
- plus de 40 soins : soins du visage, microneedling, peelings et lasers (Fotona, CO2, Pico), injections, cils, maquillage permanent ;
- leur phrase : « Come hide out with us. » ; leur promesse : « Where results and relaxation collide. »

- **À ouvrir** : `dist/index.html`, d'un double-clic. C'est un seul fichier (4,4 Mo, les 59 photos, la police, le logo et les cartes compris), qui marche sans serveur ni connexion.
- **À mettre en ligne** : le dossier `dist-web/`.
  - On le glisse sur app.netlify.com/drop, ou on le publie sur Vercel avec `vercel.json`.
  - `_headers` (Netlify) et `vercel.json` demandent aux moteurs de recherche de ne pas indexer la maquette. Ils sont à retirer au lancement.
  - Prêts pour leur domaine :
    - `robots.txt` ;
    - `sitemap.xml` ;
    - `llms.txt` ;
    - le logo seul (`assets/logo.svg`) et l'image de partage (`assets/og.jpg`).

**Les documents de travail :**
- `ANALYSE.md` : le site actuel ;
- `seo-audit-hideoutboutique.com-2026-10-13.md` : l'audit SEO et GEO du site actuel ;
- `DIRECTION.md` : la direction artistique ;
- `REVUE.md` : la revue de design et des textes d'interface ;
- `ACCESSIBILITE.md` : l'audit d'accessibilité ;
- `boards/` : les planches :
  - l'ouverture image par image, sur ordinateur et sur téléphone ;
  - les sections ;
  - les détails (le survol d'une famille, une famille ouverte, une préoccupation, un filtre, la visionneuse) ;
  - le téléphone.

## La méthode, et les extensions installées

- Le site est écrit à la main, en HTML, CSS et JavaScript.
- Lenis fait le défilement doux, et `build.mjs` assemble le tout.
- Les animations sont natives (CSS et Web Animations), sans GSAP ni WebGL.

**Ce qui a servi :**
- **`frontend-design`** : le plan de direction artistique, revu contre le brief avant de coder (voir `DIRECTION.md`).
- **`design-critique`, `accessibility-review` et `ux-copy`** (extension Design) : la revue des captures, l'audit WCAG et la relecture des boutons et des messages. Les corrections sont faites et listées dans `REVUE.md` et `ACCESSIBILITE.md`.
- **`seo-audit`** (Maquinable GEO) : l'audit du site actuel, puis les mêmes contrôles sur le nouveau.
- **Les outils de Chrome** : Lighthouse et les traces de chargement, au téléphone ralenti et à l'ordinateur, sur le nouveau site et sur l'actuel (voir « Mesures »).
- **Playwright** :
  - l'ouverture capturée image par image, l'horloge des animations arrêtée et calée, pour régler chaque instant ;
  - les 49 essais d'interaction (`tools/interact.mjs`), dont un contrôle des débordements à 19 largeurs ;
  - le parcours au clavier, le focus caché ou non et le contraste mesuré sur les pixels (`tools/a11y.mjs`) ;
  - les planches et l'image de partage (`tools/shots.mjs`, `tools/boards.mjs`, `tools/og.mjs`).
- **fontTools** : leur logo redessiné en vectoriel, lettre par lettre, d'après leur fichier (`tools/logo.py`).
- **OpenStreetMap** : le fleuve, les rues et les bâtiments autour du 1342 Colonial Blvd, dessinés en SVG par `tools/map.py` (données ODbL, avec la mention « © OpenStreetMap contributors »).
- **21st.dev**, pour la recherche (le détail est dans `DIRECTION.md`) :
  - **adopté comme idée** : « Variable Font Hover By Letter », des lettres qui changent une à une au survol. Sur le nom des familles de soins, les lettres s'élargissent une à une, comme les capitales espacées de leur logo. Refait en CSS, lisible d'un bloc par les lecteurs d'écran ;
  - **gardé en partie** : l'idée d'un curseur qui recalcule un prix (« Volume Pricing »), pour le Beauty Bank, sans le pastiche de ticket de caisse ;
  - **le principe seulement** : une liste qui montre une photo au survol (« Hover Image List »), refaite avec le cadre du logo et le clavier.
- **Boulevard**, leur réservation en ligne, gardée telle quelle.

**Ce qui n'a pas été retenu, et pourquoi :**
- **Les comparateurs avant/après à curseur** : leurs avant/après sont déjà des montages côte à côte, cadrés par eux. Les couper pour un curseur fausserait leur alignement ; ils sont montrés tels quels, avec une visionneuse.
- **Les galeries d'équipe en noir et blanc ou en 3D** : le noir et blanc éteindrait leurs portraits de studio, et la 3D est un gadget.
- **Les accueils de med spa** (carrousels en 3D, boutons en « métal liquide » WebGL, listes « éditoriales » numérotées) : des gabarits génériques, lourds, qui font « généré ».
- **Facade UI et les registres shadcn** : des sections en React et Tailwind. La méthode du site est sans framework, et ces sections forment justement la composition marketing qu'on évite.

## L'idée : le cadre du logo s'ouvre

Le logo de Hideout est un cadre doré ouvert sur les côtés, le nom passant par les ouvertures. C'est leur seul signe graphique ; le site en fait son unique dispositif.

**L'ouverture** (2 s, une seule fois, en haut de la page) :
1. le logo apparaît au centre, tel quel ; son cadre se trace du milieu vers les coins ;
2. le nom s'efface, le cadre reste seul ;
3. une vraie photo de leur cabinet s'ouvre dedans comme un volet : Lina, l'infirmière praticienne, en plein soin des lèvres, vue dans le miroir rond de sa salle ;
4. le cadre s'agrandit jusqu'à devenir la fenêtre de l'accueil, pendant que le titre, « Come hide out with us. », puis le texte se découvrent de gauche à droite.

Rien ne se décale dans la page et la photo n'est pas zoomée : le cadre est agrandi par transformation, la photo et le texte sont découverts par des masques. Une touche, un clic ou un défilement achèvent l'ouverture aussitôt ; avec « réduire les animations », ou en arrivant par un lien vers une section, on voit directement l'état final.

**Ensuite, le cadre ne revient que là où il désigne quelque chose :** sur la photo de la famille de soins que l'on survole, autour de la photo de groupe de l'équipe, et sur leur adresse, sur la carte.

## La direction

- **Couleurs** (détail et contrastes dans `DIRECTION.md` et `ACCESSIBILITE.md`) :
  - le blanc de studio (#FFFFFF), comme leurs salles et le fond de leurs portraits ;
  - l'encre (#221A16), le noir de leurs tenues tiré vers l'expresso, et l'encre douce (#6B5F58) ;
  - l'or du logo (#C4A42C), seulement pour le cadre ;
  - l'expresso (#231B17) pour l'équipe et le pied de page, le pétale (#F6ECE8) pour les abonnements.
- **Typographie :** une seule famille, Archivo (licence OFL, hébergée avec le site), variable en largeur et en graisse. Les titres sont à la largeur maximale, en écho au nom très espacé du logo ; le texte est à la largeur normale. Une police de secours aux mêmes mesures évite tout saut au chargement.
- **Le logo :** redessiné en vectoriel d'après leur fichier, avec la police Lato de l'original ; le cadre reste or, le nom prend la couleur du texte autour.
- **Mise en page :** une seule longue page, titres à gauche et chapôs à droite sur la même grille ; pas de grille de cartes identiques, pas de numérotation.

## La page

1. **L'accueil** : la photo dans le cadre, « Come hide out with us. », leur promesse et ce qui la prouve, « Book now » et « Call 239-936-0758 ».
2. **« What we do »** : 55 soins en cinq familles (soins du visage et du corps, peau et lasers, injections, cils, maquillage permanent), avec leur nombre. Chaque famille s'ouvre sur ses soins et leurs faits (durée d'une séance, éviction, nombre de séances). On peut aussi partir de ce qui gêne (« Lines and wrinkles », « Acne », « Dark spots and discoloration ») : les soins concernés sont soulignés et listés par famille.
3. **« Results »** : 38 avant/après de leurs clientes, chacun avec son soin et sa praticienne quand elle signe ; un filtre par famille, douze à la fois, et une visionneuse au clavier.
4. **« The team »** : la photo de groupe, les trois responsables (diplômes, Instagram, un avis de cliente), les dix autres membres de l'équipe, le directeur médical.
5. **« Memberships »** : le Beauty Bank, avec un curseur qui calcule le crédit accumulé ; Skin Health, Perfectly Bare et le paiement en plusieurs fois (CareCredit, Cherry).
6. **« Find the hideout »** : la carte dessinée d'après OpenStreetMap, l'adresse, « Book now », l'itinéraire, les règles avant la visite, les soins à la maison.

**La réservation.** « Book now » ouvre leur Boulevard : sur ordinateur, leur fenêtre de réservation par-dessus la page, comme aujourd'hui ; au téléphone, leur page de réservation. Leur script n'est chargé que si l'on s'approche d'un bouton « Book now » : la page reste légère et sans cookies tiers.

**Au téléphone :**
- l'en-tête se resserre : le logo et le bouton « Menu », qui ouvre un menu plein écran (la page derrière devient inerte) ;
- la photo de chaque famille apparaît dans son cadre quand on l'ouvre ;
- la carte passe en hauteur, resserrée sur le cabinet ;
- une barre « Book now » / « Call » apparaît après l'accueil et se retire sur la visite.

## Rien d'inventé

- **Les textes** viennent de leurs pages, raccourcis et réécrits en phrases simples, sans ajouter de soin, de prix ni de chiffre. Les coquilles sont corrigées (« Mircoblading », « TightScuplt », « memebrship incudes »…).
- **Les photos** sont les leurs, téléchargées depuis leur site, converties en AVIF, jamais agrandies : les photos du cabinet prises par un photographe, la photo de groupe, les 13 portraits et 38 avant/après.
- **Pas repris** (voir `DIRECTION.md`) : les avant/après de fabricants mêlés aux leurs, les images de banque du thème, les pages de démonstration, une photo retouchée, et AviClear (à confirmer).
- **Les avis** sont ceux de leur accueil, coupés par « […] », signés comme chez eux d'un prénom et d'une initiale (« Keelie B. », « Malin J. ») ou de prénoms seuls (« Stephanie and Jorge »).
- **La carte** est dessinée d'après les données d'OpenStreetMap, avec leur mention ; l'emplacement est celui que donne leur propre site.
- **Les coordonnées** viennent de leurs pages, corrigées : le courriel (il manquait un i), le téléphone, leurs vraies pages Instagram et Facebook.

## À confirmer avec eux

- **Le logo** redessiné : à comparer avec leurs fichiers d'origine, ou à remplacer par leur logo vectoriel.
- **Des photos manquantes** : le Dr. Davek Sharma et Chloe Waddel (nommés sans portrait), et une photo d'un soin laser dans leurs salles pour la famille « Skin and lasers ».
- **Les horaires** : le site dit « By appointment only », comme le leur ; à compléter s'ils ont des horaires fixes.
- **AviClear** et les perfusions IV : cités sur leur site, mais pas dans leur liste de soins.
- **Les pages qui restent sur leur site** (consignes avant et après les soins, règles d'annulation, boutique) : le nouveau site y renvoie ; garder ces adresses à la mise en ligne.
- **À corriger sur leur site actuel**, en attendant le lancement (voir l'audit SEO) :
  - les faux liens de l'en-tête (courriel, téléphone, réseaux) ;
  - les pages de démonstration et les gabarits indexés ;
  - les pages en double (LipLase, NightLase, TightSculpt).

## Mesures

Lighthouse et traces de chargement de Chrome, téléphone simulé (4G lente, processeur ralenti 4 fois) et ordinateur. Le nouveau site est servi en local, le site actuel depuis leur serveur.

| | Site actuel | Nouveau site |
| --- | --- | --- |
| Accessibilité (Lighthouse) | 88 à l'ordinateur, 87 au téléphone | **100** |
| Bonnes pratiques (Lighthouse) | 77 (cookies tiers) | **100** |
| SEO (Lighthouse) | 92 | **100** |
| Navigation par agents (Lighthouse) | 10 à l'ordinateur, 5 au téléphone | **100** |
| Affichage du contenu principal (LCP), téléphone ralenti | 3,26 s | **0,32 s** (0,37 s sur ordinateur) |
| Décalage de mise en page (CLS) | 0,60 | **0** |
| Premier chargement, ordinateur | 189 requêtes, 10,4 Mo, 23 domaines | **19 requêtes, 1,4 Mo, 1 domaine** |
| Premier chargement, téléphone | 157 requêtes, 6,8 Mo, 12 domaines | **11 requêtes, 0,9 Mo, 1 domaine** |
| Données structurées | `DaySpa` incomplet, image cassée | **`MedicalBusiness` complet** : équipe, soins, abonnements et prix |

**Notes sur ces chiffres :**
- Le premier chargement du nouveau site compte les photos que Chrome charge à l'avance, en dessous de l'écran. Avant le premier affichage, il ne faut que la page (292 Ko, 94 Ko compressée), la police (88 Ko) et la photo de l'accueil (69 Ko).
- Servie compressée par l'hébergeur (Netlify et Vercel le font d'office), la page passe de 292 à 94 Ko. Les deux cartes et le logo, dessinés en SVG dans la page, en font la plus grande part.
- La trace signale un seul calcul de mise en page forcé, au démarrage de l'ouverture (la mesure du logo et du cadre) : c'est le premier calcul de la page de toute façon, et Chrome n'estime aucun gain possible.

**Les mêmes contrôles SEO/GEO que pour le site actuel :**
- un titre de 44 caractères et une description de 147 ;
- une image de partage et une adresse canonique ;
- un seul `<h1>`, un `<h2>` par partie, un `<h3>` par famille et par personne, `lang="en"` ;
- un texte alternatif sur les 55 photos utiles (chaque avant/après dit le soin et la praticienne) et sur la carte ;
- des données structurées `MedicalBusiness` et `HealthAndBeautyBusiness` : adresse, coordonnées, téléphone, courriel, fondatrice, équipe médicale, familles de soins, les trois abonnements avec leurs prix, Instagram, Facebook, réservation ;
- aucun robot bloqué ;
- un `llms.txt` écrit avec les faits.

**Vérifié aussi :**
- de 320 à 1920 px (19 largeurs), sans débordement, familles ouvertes, y compris avec l'espacement du texte élargi ;
- au clavier : 66 arrêts sur ordinateur et 60 sur téléphone, focus toujours visible, jamais caché sous l'en-tête ni sous la barre du téléphone ;
- le lien « Skip to content », qui mène bien au contenu ;
- les contrastes mesurés sur les vrais pixels (97 mesures : le texte de 4,82:1 à 17,11:1, les contours au-dessus de 3:1) ;
- avec « moins d'animations », et en arrivant par un lien vers une section ;
- les 49 essais d'interaction de `tools/interact.mjs` :
  - l'ouverture, en cours et terminée, et la touche qui l'achève ;
  - les liens de l'en-tête et le focus qui les suit ;
  - les familles (lettres qui s'élargissent, photo encadrée, ouverture au clavier), les préoccupations ;
  - les filtres des résultats, l'annonce du nombre, « Show all 38 », la visionneuse ;
  - le Beauty Bank à la souris et au clavier ;
  - la réservation Boulevard ;
  - les cadres qui se tracent, la carte ;
  - le menu et la barre du téléphone.

## Fabrication

- **`node build.mjs`** assemble :
  - `dist/index.html`, tout intégré (4,4 Mo) ;
  - `dist-web/`, une page légère, avec les photos et la police en fichiers séparés, et le logo seul pour les données structurées.

  Il vérifie au passage que les nombres affichés correspondent au contenu (soins de chaque famille, résultats de chaque filtre, « Show all 38 »).
- **`src/`** : `index.html`, `styles.css`, `main.js`, le logo (`logo-full.svg`, `logo-compact.svg`), les deux cartes (`map-wide.svg` pour l'ordinateur, `map-tall.svg` pour le téléphone) et `img/` (les 59 photos en AVIF).
- **`data/photo-sizes.json`** : les dimensions des photos.
- **`tools/`** :
  - `images.py` refait les photos depuis les fichiers téléchargés sur leur site : `python3 -I tools/images.py <dossier des téléchargements>` ;
  - `logo.py` redessine le logo avec la police Lato (`vendor/fonts/lato/`) : `python3 -I tools/logo.py` ;
  - `map.py` redessine les deux cartes depuis un extrait OpenStreetMap (API `/api/0.6/map`) : `python3 -I tools/map.py <extrait.osm>` ;
  - `interact.mjs` rejoue les 49 essais d'interaction sur `dist/index.html` ;
  - `a11y.mjs` fait le parcours au clavier, les cibles tactiles et les contrastes, sur le site servi en local (`python3 -m http.server 8771 --bind 127.0.0.1 --directory dist-web`) ;
  - `shots.mjs` fait les captures, `boards.mjs` compose les planches, `og.mjs` l'image de partage.
- **`web/`** : les fichiers de mise en ligne (`_headers`, `vercel.json`, `robots.txt`, `sitemap.xml`, `llms.txt`, `og.jpg`).
- **`vendor/`** : Lenis 1.3.26, la police Archivo (version variable de Google Fonts, avec sa licence OFL ; la feuille de style d'origine est dans `fonts/src/`) et Lato, qui sert seulement à redessiner le logo.
