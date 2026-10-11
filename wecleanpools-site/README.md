# We Clean Pools (D's Pool Care) : nouveau site

Refonte complète de https://www.wecleanpools.com. D's Pool Care Inc. fait l'entretien hebdomadaire, les nettoyages ponctuels, les réparations et les rénovations de piscines à Arlington, au Texas. L'entreprise existe depuis le printemps 1999. Son fondateur, Dallas Dodson, est un policier qui fait ce travail en dehors de son service.

- **À ouvrir** : `dist/index.html`, d'un double-clic. C'est un seul fichier, qui marche sans serveur ni connexion.
- **À mettre en ligne** : le dossier `dist-web/`.
  - On le glisse sur app.netlify.com/drop, ou on le publie sur Vercel avec `vercel.json`.
  - `_headers` (Netlify) et `vercel.json` demandent aux moteurs de recherche de ne pas indexer la maquette. Ils sont à retirer au lancement.
  - `robots.txt`, `sitemap.xml`, `llms.txt` et l'image de partage (`assets/og.jpg`) sont prêts pour leur domaine.

**Les documents de travail :**
- `ANALYSE.md` : le site actuel ;
- `seo-audit-www.wecleanpools.com-2026-10-11.md` : l'audit SEO et GEO du site actuel ;
- `DIRECTION.md` : la direction artistique ;
- `REVUE.md` : la revue de design, des textes et de la fluidité ;
- `ACCESSIBILITE.md` : l'audit d'accessibilité.

## La méthode, et les extensions installées

Le site est écrit à la main, en HTML, CSS et JavaScript.
- Lenis fait le défilement doux.
- `build.mjs` assemble le tout.
- Les animations sont natives : CSS et quelques lignes de script, sans GSAP ni WebGL.
- La page web pèse 113 Ko. Avec ce qui s'affiche au premier écran, le téléphone charge 275 Ko.

**Ce qui a servi :**
- **`frontend-design`** : le plan de direction artistique, revu contre le brief avant de coder (voir `DIRECTION.md`).
- **`design-critique`, `accessibility-review` et `ux-copy`** (extension Design) : la revue des captures, l'audit WCAG et la relecture des boutons et des messages. Les corrections sont faites et listées dans `REVUE.md` et `ACCESSIBILITE.md`.
- **`seo-audit`** (Maquinable GEO) : l'audit du site actuel, puis les mêmes contrôles sur le nouveau.
- **Les outils de Chrome** :
  - les mesures Lighthouse ;
  - une trace de performance de l'ouverture, qui a fait trouver et corriger des animations qui tournaient sur le fil principal (voir `REVUE.md`).
- **21st.dev** : la recherche de composants. Cherchés :
  - des fonds d'eau et des caustiques ;
  - des boutons à maintenir ;
  - des listes dépliantes ;
  - des textes qui se révèlent au défilement.

**Ce qui n'a pas été retenu, et pourquoi :**
- **Les caustiques de 21st.dev** (« Water Caustic », « Caustic Pool ») sont des shaders WebGL en temps réel. C'est exactement ce qui rame au téléphone.
  - Ici, la lumière est calculée une fois, hors ligne : une vraie simulation de rayons réfractés par une houle (`tools/textures.py`).
  - Elle est enregistrée en images raccordables, puis animée par la carte graphique. Le rendu est le même, sans calcul pendant la visite.
- **Les boutons « hold to confirm »** remplissent une jauge avant de valider une action. L'idée du maintien est gardée pour la visionneuse des rénovations : tant qu'on appuie, on voit l'avant. Elle est faite sur mesure, au doigt, à la souris et au clavier.
- **Les textes qui apparaissent au défilement et les accordéons animés** sont des gestes génériques, qu'on voit sur des milliers de sites. La liste des prix est une liste HTML simple, qui s'ouvre sur ses photos.
- **Facade UI et les registres shadcn** fournissent des sections de page d'accueil standard en React (héros centré, grille de services, carrousel d'avis…). Ce sont les gabarits que le brief écarte, et la méthode du site est sans React.

## L'idée : « Can you see the bottom of your pool? »

C'est leur propre question, prise sur leur page de vidange. Le site en fait sa scène d'ouverture.

1. L'écran montre une piscine vue d'en haut, dans un bassin aux coins arrondis, avec la plage claire autour. L'eau est verte et trouble : des nuages d'algues, des particules en suspension, un reflet du ciel à la surface.
2. La question flotte en blanc à la surface.
3. On fait défiler la page, et l'eau s'éclaircit comme dans un vrai nettoyage :
   - verte, puis laiteuse ;
   - puis limpide, avec la lumière du soleil qui danse au fond.
4. Les lettres du fond du bassin, d'abord floues, deviennent nettes : **WE CLEAN POOLS.** C'est leur nom de domaine, qu'on ne peut lire que si l'eau est propre.

Ce n'est pas un dessin : c'est de la lumière, de l'eau et de la typographie.

La fin de la page répond au début : le devis se remplit sur une eau limpide.

## La direction

- **Couleurs :**
  - l'enduit (#F1F5F4) pour le fond ;
  - l'encre (#0D2235), un bleu marine d'uniforme, pour le texte ;
  - l'eau claire (#1190BC, et #0B6E93 pour les liens) ;
  - le grand bain (#08324A) pour la partie sur Dallas ;
  - le vert d'algue, seulement dans l'eau trouble ;
  - le rouge du « D's », gardé de leur logo.
- **Typographie :** Overpass, une seule famille, sous licence OFL. C'est l'héritière libre de *Highway Gothic*, la lettre des panneaux routiers américains : celle du service public, et des panneaux de piscine.
  - Black, en capitales, pour les lettres du fond du bassin, la seule référence assumée aux panneaux.
  - ExtraBold pour les titres, Regular pour le texte.
  - Light pour la question et les citations.
- **Logo :** « D's Pool Care » en Overpass, le « D's » en rouge. Le dessin de la mascotte, daté, est remplacé.

## La page

1. **L'ouverture** :
   - la scène de l'eau qui s'éclaircit ;
   - en bas, sur la plage, l'accroche : « Weekly pool care in Arlington, Texas. Run by an off-duty police officer since the spring of 1999. » ;
   - « Get a free estimate » et le téléphone ;
   - trois faits : à partir de 185 $ par mois, depuis le printemps 1999, licence d'État TICL 410, avec un lien pour la vérifier.
2. **« What is your time worth? »** : leur question.
   - Le prix en grand.
   - Les huit gestes de chaque passage : chaque coche se trace quand on arrive à sa ligne, et un trait relie les coches, comme la tournée du technicien.
   - Deux photos de leur travail.
3. **« One-time jobs, and what they cost. »** : une liste de prix, comme une carte de restaurant. Chaque ligne s'ouvre sur ce qui est fait et sur sa vraie paire avant/après.
   - Vidange, nettoyage et lavage acide : à partir de 595 $ ;
   - remise en état des piscines vertes : estimation gratuite ;
   - nettoyage de filtre : 150 $ (DE) ou 125 $ (cartouche) ;
   - carrelage, par micro-billage : estimation gratuite.
4. **« When something stops working. »** : les réparations.
   - Le local technique d'un client.
   - La liste de ce qu'ils réparent ou installent.
   - L'avis de Bill Nelson sur son système au sel.
5. **« Take the pool you have. Turn it into the pool you want. »** : les rénovations.
   - Deux bassins terminés en grand. Les photos glissent à peine dans leur cadre au défilement.
   - **La visionneuse de neuf chantiers :** on choisit une vignette, puis on maintient la photo (ou le bouton, ou la barre d'espace) pour voir la piscine telle qu'ils l'ont trouvée. Une démonstration a lieu une seule fois, quand la photo arrive à l'écran.
   - Les trois étapes : estimation ferme sous 24 h, réunion de choix avec échantillons, 10 à 14 jours de travaux.
   - Les avis de Janet Leski, Thomas Routt et Danny M.
6. **« Rather do it yourself? »** : la Pool School, en une bande courte.
7. **« Who’s coming to your backyard. »** : Dallas, à la première personne.
   - Sa photo en uniforme avec ses fils.
   - Ses titres : CPO, licence TICL 410 (« Look it up on the state’s site »), licencié et assuré, entreprise familiale.
8. **« What customers say. »** :
   - l'avis de Hayden Brian Templeton (4 acres, 15 à 20 chevaux de l'autre côté de la clôture, et « Tommy ») en très grand ;
   - trois autres avis ;
   - le lien vers Google.
9. **« Get a free estimate. »**, sur une eau limpide :
   - le téléphone en grand ;
   - les horaires, avec « Open now » ou « Closed now » selon l'heure du Texas ;
   - la zone et l'adresse e-mail ;
   - le formulaire. On choisit d'abord son besoin. Le formulaire vérifie les champs, puis ouvre la messagerie du visiteur avec le message prêt, adressé à Dallasdodson77@wecleanpools.com. Le site n'a pas de serveur pour l'envoyer lui-même.

**Au téléphone :**
- la piscine prend presque toute la largeur ;
- les lettres passent sur trois lignes (« WE / CLEAN / POOLS. ») ;
- une barre « Call / Free estimate » apparaît après l'ouverture et s'efface au niveau du devis ;
- le menu s'ouvre en plein écran.

**Avec le réglage « moins d'animations » :**
- l'eau est limpide d'emblée, sans épinglage ;
- rien ne bouge seul ;
- les coches sont tracées.

**Sans JavaScript :** l'eau est limpide, les prix sont ouverts, les coches tracées.

## Rien d'inventé

- **Les textes** viennent de leurs pages : accueil, services, « About Us », témoignages, et leur site de rénovation pour les étapes d'un chantier.
  - Ils sont raccourcis et réécrits en phrases simples, sans ajouter de service, de prix ni de chiffre.
  - Les durées d'activité se contredisent : « 27+ years » sur l'accueil, « over 20 years » sur la page À propos. Le site dit « since the spring of 1999 », qui ne vieillit pas.
  - Le nombre de piscines rénovées se contredit aussi (« thousands » ici, « hundreds » sur le site de rénovation). Il n'est pas cité.
- **Les avis** sont ceux de leur page « Testimonials », et celui de Danny M., un avis Google repris par leur site de rénovation.
- **Les photos** sont les leurs.
  - Écartées : la galerie de weremodelpools.com, retouchée à l'excès (probablement par une IA) ;
  - les bandeaux de l'accueil, assombris, dont deux semblent venir d'une banque d'images ;
  - les images d'illustration génériques.
  - Les neuf paires avant/après de rénovation sont recadrées sans leur cadre blanc.
- **La lumière au fond de l'eau, l'eau trouble et l'enduit** sont calculés (`tools/textures.py`). Ce ne sont pas des photos.

## À confirmer avec eux

- **Dallas fait-il toujours ce travail en dehors de son service de policier ?** L'accueil le dit (« by an off duty police officer »). Le site le reprend.
- **L'adresse Dallasdodson77@wecleanpools.com** : c'est celle de leur pied de page. Est-ce la bonne pour les demandes d'estimation ?
- **Une adresse postale** : le site ne donne que « Arlington ». Une adresse ou un code postal renforcerait la fiche locale (données structurées, Google).
- **« Tommy »**, cité dans l'avis de Hayden Templeton : toujours dans l'équipe ?
- **Pool School** : le format et le prix, pour en dire plus.
- **Des photos récentes**, en grande taille, de leur entretien et de leurs rénovations. Les photos de service ont une dizaine d'années. De nouvelles photos permettraient de plus grands visuels dans la seconde moitié de la page.
- **Les doublons d'adresses de leur site actuel** (`/Service/...` et `/Services/...`), la page `/Test` indexée : à rediriger au lancement (voir l'audit SEO).

## Mesures

Lighthouse, sur `dist-web` servi en local avec compression, comparé au site actuel :

| | Site actuel | Nouveau site |
| --- | --- | --- |
| Performance au téléphone | 27 à 43 (LCP 8,4 à 14,3 s) | **95 à 98** (LCP 2,4 à 2,6 s, blocage de 0 à 50 ms) |
| Performance à l'ordinateur | 56 | **100** (LCP 0,5 à 0,6 s) |
| Accessibilité | 93 | **100** |
| Bonnes pratiques | 75 à 78 | **100** |
| SEO | 83 | **100** |
| Décalage de mise en page (CLS) | 0,23 à 0,37 | **0** |
| Poids de l'accueil au téléphone | 3,5 Mo | **275 Ko** |

**Les mêmes contrôles SEO/GEO que pour le site actuel :**
- un titre de 52 caractères et une description de 157 ;
- une image de partage et une adresse canonique ;
- un seul H1 ;
- aucune image sans texte alternatif ;
- des données structurées `HomeAndConstructionBusiness` : Arlington, téléphone, horaires, fondateur, licence et certification, et les services avec leurs prix publiés ;
- aucun robot bloqué ;
- un `llms.txt` et un plan du site.

**La fluidité de l'ouverture**, au téléphone simulé avec le processeur ralenti 4 fois :
- 60 images par seconde en médiane ;
- aucune image de plus de 34 ms ;
- 16 repeints en 3 secondes de défilement.

**Vérifié aussi :**
- de 320 à 1920 px, sans débordement ;
- au clavier, avec un contour de focus visible partout ;
- avec « moins d'animations » et sans JavaScript ;
- chaque interaction : lignes de prix, visionneuse (souris, doigt, clavier), vignettes, menu (Échap, focus gardé), formulaire et ses erreurs, statut d'ouverture, liens internes.

## Fabrication

- **`node build.mjs`** assemble :
  - `dist/index.html`, tout intégré (3,6 Mo) ;
  - `dist-web/`, une page de 113 Ko, avec les photos, les textures et la police en fichiers séparés, chargés au fil de la page.
- **`src/`** : `index.html`, `styles.css`, `main.js`, et `img/` (les photos en AVIF et les textures de l'eau en WebP).
- **`data/photos.json`** liste les photos retenues, avec leurs recadrages ; `photo-sizes.json` donne leurs dimensions.
- **`tools/images.py`** refait les AVIF depuis les photos d'origine : `python3 -I tools/images.py <dossier>`.
- **`tools/textures.py`** recalcule les textures de l'eau :
  - les deux couches de caustiques, par simulation de rayons ;
  - les nuages d'algues ;
  - les particules ;
  - le grain de l'enduit.

  Toutes sont raccordables : `python3 -I tools/textures.py`.
- **`web/`** contient les fichiers copiés tels quels dans `dist-web/` : en-têtes, robots, plan du site, `llms.txt` et image de partage.
- **`vendor/`** : Lenis, et la police Overpass avec sa licence.
- **`boards/`** : les planches.
  - `avant-apres.jpg` compare le site actuel au nouveau.
  - `accueil.jpg` montre l'eau qui s'éclaircit, à quatre instants.
  - `sections.jpg` et `telephone.jpg` montrent toutes les parties, à l'ordinateur et au téléphone.
