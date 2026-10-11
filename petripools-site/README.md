# Petri Pools : nouveau site

Refonte complète de https://www.petripools.com, entreprise familiale de rénovation de piscines et de réparation d'équipements à Lewisville (nord de Dallas–Fort Worth), depuis juin 2000.

- **À ouvrir** : `dist/index.html`, d'un double-clic. C'est un seul fichier, qui marche sans serveur ni connexion.
- **À mettre en ligne** : le dossier `dist-web/`, à glisser sur app.netlify.com/drop, ou sur Vercel avec `vercel.json`.
  - `_headers` (Netlify) et `vercel.json` demandent aux moteurs de recherche de ne pas indexer la maquette : à retirer au lancement.
  - `robots.txt`, `sitemap.xml`, `llms.txt` et l'image de partage (`assets/og.jpg`) sont prêts pour leur domaine.

Les documents de travail :
- `ANALYSE.md` : le site actuel ;
- `seo-audit-www.petripools.com-2026-10-11.md` : l'audit SEO et GEO du site actuel ;
- `DIRECTION.md` : la direction artistique ;
- `REVUE.md` : la revue de design et des textes d'interface ;
- `ACCESSIBILITE.md` : l'audit d'accessibilité.

## La méthode, et les extensions installées

Le site est écrit à la main en HTML, CSS et JavaScript. Lenis fait le défilement doux, et `build.mjs` assemble le tout. Les animations sont natives : CSS, canvas et l'API d'animation du navigateur. Sans GSAP, la page web pèse 149 Ko.

**Ce qui a servi** :
- **`frontend-design`** : le plan de direction artistique, revu contre le brief avant de coder (voir `DIRECTION.md`).
- **`design-critique`, `accessibility-review` et `ux-copy`** (extension Design) : la revue des captures, l'audit WCAG et la relecture des boutons et des messages. Les corrections sont faites et listées dans `REVUE.md` et `ACCESSIBILITE.md`.
- **`seo-audit`** (Maquinable GEO) : l'audit du site actuel, puis les mêmes contrôles sur le nouveau.
- **Les outils de Chrome** : les mesures Lighthouse.
- **21st.dev** : la recherche de composants (avant/après, révélation en mosaïque, textes animés, fonds d'eau, cartes).

**Ce qui n'a pas été retenu, et pourquoi** :
- Les composants trouvés sur 21st.dev sont soit des blocs génériques (curseurs avant/après classiques, textes qui apparaissent en flou), soit des fonds d'eau en WebGL, trop lourds au téléphone.
- Facade UI et les registres shadcn fournissent des sections de page d'accueil standard (héros centré, grille de services, carrousel d'avis…). Ce sont exactement les gabarits que le brief écarte.
- Les éléments forts du site sont donc faits sur mesure : la frise recarrelée, la ligne d'eau de l'avant/après, le local technique annoté, la carte des villes et la mosaïque du fond du bassin.

## L'idée : la coupe d'une piscine

Le site se lit comme la coupe d'un bord de piscine.

- **En haut**, la plage : un fond clair et leur propre accroche, « Is your pool stuck in the ’80s? ».
- **En travers de l'accueil**, la frise de ligne d'eau. C'est la première chose qu'on refait dans une rénovation, et la plus visible.
  - À l'ouverture, elle est en carreaux de céramique beige de 15 cm, comme leur spa « avant ».
  - Puis elle est recarrelée carreau par carreau, en mosaïque de verre grise et bleutée, celle de leurs spas « après ».
  - La moitié basse est sous l'eau : les carreaux y paraissent décalés, comme dans une vraie piscine, et la ligne d'eau ondule.
  - Un reflet passe une fois sur le verre neuf.
- **En dessous**, on est dans l'eau : les parties bleu sombre alternent avec les parties claires, puis vient le petit bain turquoise du devis.
- **Tout en bas**, le fond de la piscine : « PETRI » en mosaïque, comme les incrustations au fond des bassins.

**Pourquoi pas une grande photo en plein écran à l'accueil** : leurs photos font au plus 1400 px de large. Agrandies sur un grand écran, elles seraient floues. La mosaïque, dessinée par le navigateur, est nette à toutes les tailles. Les photos, elles, sont cadrées à des tailles où elles restent nettes, et la première arrive juste sous l'accueil.

## La direction

- **Couleurs** :
  - l'enduit clair (#f4f5f3) pour le fond ;
  - le galet (#11232d) pour le texte ;
  - le grand bain (#0f3446) pour les parties sombres ;
  - le petit bain (#9fdcef) ;
  - le verre de leurs mosaïques, relevé sur leurs photos ;
  - le jaune soleil de leur logo (#ffc431), pour la marque et les actions principales.
- **Typographie** : Archivo, une seule famille à largeur variable (licence OFL), héritière des « gothic » américaines des enseignes.
  - Titres en largeur étendue et très grasse : une écriture horizontale, comme une ligne d'eau.
  - Texte et citations en largeur normale.
- **Logo** : leur nom en Archivo, précédé d'un disque jaune, le soleil de leur logo historique sans le visage dessiné.

## La page

1. **L'accueil** :
   - la question, en très grand, et la frise recarrelée ;
   - deux repères : « Since June 2000 in Lewisville » et « BBB accredited since 2009, rated A+ » ;
   - l'accroche, le bouton « Get a free estimate » et le téléphone.
2. **La rénovation**, sur le grand bain :
   - **« Same spa. New tile. »** : leur avant/après. On fait monter ou descendre la ligne d'eau pour remplir l'image « après » ; la première fois, l'eau monte seule à mi-hauteur.
   - **« Tile, coping, finish, deck. »** : les quatre changements, avec les revêtements qu'ils proposent (Quartzscapes, Designer Series, Stonescapes). La photo à côté suit le texte qu'on lit.
   - **La citation de Cody B.** (Plano) : « …from a 1980’s Magnum PI backyard to a superfly, modern… ».
3. **La réparation** : « Every box on the equipment pad. »
   - La photo du local technique d'un client, avec cinq appareils : chauffage (un Pentair MasterTemp 400), filtre, pompes, automatisme, électricité.
   - On en choisit un : le reste de la photo s'assombrit, et le détail de ce qu'ils font s'affiche.
   - Puis : « One thing we don’t do: leak detection. »
4. **Le déroulé d'un chantier**, raconté par leurs clients, en 7 étapes, chacune citée avec le nom et la ville :
   - la visite le lendemain ;
   - le devis l'après-midi même ;
   - les échantillons au showroom ;
   - la date de début la semaine suivante ;
   - un e-mail chaque matin ;
   - les équipes qui nettoient ;
   - « We were swimming again within 2 weeks! ».

   Une ligne se remplit à mesure qu'on lit.
5. **Les avis** :
   - **« He saved us $500. »** : l'histoire du condensateur, racontée par Adrienne Dworak (Lewisville).
   - **La carte du nord de DFW**, avec les vrais lacs (Lewisville Lake, Grapevine Lake…) et les 39 villes desservies. Les 12 villes d'où viennent des avis se choisissent, et leurs avis s'affichent à côté. Au téléphone, une rangée de boutons remplace les étiquettes.
   - **Le relevé des plateformes** (Google, Houzz, Yelp…).
   - **Les 43 avis** au complet, dépliables.
6. **L'entreprise** :
   - Justin Petri, juin 2000, une entreprise familiale ;
   - les labels : BBB A+ depuis 2009, Best Pick, APSP ;
   - le showroom et ses horaires, avec « ouvert maintenant » ou « fermé » selon l'heure du Texas.
7. **Le devis**, sur le petit bain :
   - le formulaire. On choisit d'abord son besoin : une rénovation, une réparation ou autre chose. Le formulaire vérifie les champs, puis ouvre la messagerie du visiteur avec le message prêt, adressé à petripools@gmail.com. Le site n'a pas de serveur pour l'envoyer lui-même.
   - le téléphone en grand, les horaires, les adresses et les villes desservies.
8. **Le fond du bassin** : « PETRI » se pose carreau par carreau quand on arrive en bas, puis les liens.

**Au téléphone** :
- une barre Call / Free estimate apparaît après l'accueil et s'efface au niveau du devis ;
- le menu s'ouvre en plein écran.

**Avec le réglage « moins d'animations »** :
- la frise est déjà posée ;
- rien ne bouge seul ;
- le défilement reste celui du navigateur.

## Rien d'inventé

- **Les textes** viennent de leurs pages : accueil, « About us », rénovation, réparation, ré-enduit, articles du blog. Ils sont raccourcis et réécrits en phrases simples, sans ajouter de service ni de chiffre.
- **Les citations** sont celles de leur page « Testimonials ».
  - J'ai corrigé les fautes de frappe évidentes : « title » en « tile », « Perri Pools » en « Petri Pools », « servie », « adverisement »…
  - J'ai raccourci les plus longues, en marquant les coupures par […].
  - J'ai retiré l'adresse e-mail personnelle qu'un client avait laissée dans son avis.
- **Les durées** (2 jours et demi, moins de 10 jours, 2 semaines) sont celles que racontent les clients. Elles sont présentées comme telles, sans promesse.
- **Les photos** sont les leurs, prises sur leur site.
  - Écartées : les photos de 2012 de leur médiathèque (elles viennent d'un ancien thème, avec le logo d'un autre piscinier) et quatre photos professionnelles jamais affichées, d'origine incertaine.
  - Les photos du chantier (carrelage du spa, pose du travertin, enduit) viennent d'une page qui décrit une construction : leurs légendes ne disent pas qu'il s'agit d'une rénovation.
- **La carte** :
  - le centre de chaque ville vient du Gazetteer 2024 du recensement américain ;
  - les lacs viennent des fichiers TIGER/Line 2024 ;
  - « North Arlington » et « North Grand Prairie » sont placées au nord de ces villes, comme sur leur site.

## À confirmer avec eux

- **Le relevé des avis par plateforme** : leur page « About » donne des chiffres de 2018 (Google 72 avis à 4,8, Houzz 63…), repris tels quels. Ils sont sûrement plus élevés aujourd'hui.
- **L'entretien hebdomadaire** : beaucoup d'avis le citent, mais il n'est plus dans leur menu. Toujours proposé ? Si oui, il mérite sa place à côté de la rénovation et de la réparation.
- **« TICL #593 »** : le numéro cité pour les électriciens agréés, à vérifier.
- **Les labels** : l'année du badge Best Pick, et l'adhésion à la PHTA (l'APSP a fusionné en 2019).
- **Les revêtements encore proposés** : Quartzscapes, Designer Series, Stonescapes.
- **Des photos récentes** en grande taille, par exemple celles de leur profil Houzz, inaccessible depuis ici. Elles permettraient une galerie.

## Mesures

Lighthouse, sur `dist-web` servi en local avec compression, comparé au site actuel :

| | Site actuel | Nouveau site |
| --- | --- | --- |
| Performance au téléphone | 40 à 47 (LCP 7,4 à 8,9 s) | **97 à 100** (LCP 1,6 à 1,7 s, blocage de 0 à 20 ms) |
| Performance à l'ordinateur | 85 | **100** |
| Accessibilité | 74 | **100** |
| Bonnes pratiques | 54 | **100** |
| SEO | 77 | **100** |
| Poids de l'accueil au téléphone | 1,7 Mo | **207 Ko** |

**Les mêmes contrôles SEO/GEO que pour le site actuel** :
- un titre de 54 caractères et une description de 156 ;
- une image de partage et une adresse canonique ;
- un seul H1 ;
- aucune image sans texte alternatif ;
- des données structurées `HomeAndConstructionBusiness` : adresse, horaires, 39 villes, services, profils ;
- aucun robot bloqué ;
- un `llms.txt` et un plan du site.

**Vérifié aussi** :
- de 320 à 1920 px, sans débordement ;
- au clavier, avec un contour de focus visible partout ;
- avec le réglage « moins d'animations » ;
- chaque interaction : ligne d'eau à la souris, au doigt et aux flèches ; appareils du local ; villes de la carte et boutons du téléphone ; avis dépliables ; menu ; formulaire et ses erreurs ; horaires.

## Fabrication

- **`node build.mjs`** assemble :
  - `dist/index.html`, tout intégré (1,5 Mo) ;
  - `dist-web/`, une page de 149 Ko avec les photos et la police en fichiers séparés, chargées au fil de la page.
- **`src/`** : `index.html`, `styles.css`, `main.js`, `img/` (les photos en AVIF) et `partials/map-lakes.svg` (les lacs).
- **`data/`** :
  - `photos.json` liste les photos retenues ;
  - `cities.json` donne la position des villes ;
  - `towns.json` règle le placement des étiquettes sur la carte.
- **`tools/images.py`** refait les AVIF depuis les photos d'origine : `python3 -I tools/images.py <dossier>`.
- **`tools/map.py`** refait la carte depuis les fichiers du recensement : `python3 -I tools/map.py <dossier>`.
- **`web/`** contient les fichiers copiés tels quels dans `dist-web/` : en-têtes, robots, plan du site, `llms.txt` et image de partage.
- **`vendor/`** : Lenis et la police Archivo, avec sa licence.
- **`boards/`** : les planches.
  - `avant-apres.jpg` compare le site actuel au nouveau.
  - `accueil.jpg` montre le recarrelage à trois instants.
  - `sections.jpg` et `telephone.jpg` montrent toutes les parties, à l'ordinateur et au téléphone.
