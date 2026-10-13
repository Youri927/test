# Ehlers Contracting : nouveau site

Refonte complète de https://ehlerscontracting.com.

Ehlers Contracting Services, Inc. est l'entreprise de Rick Ehlers, à Naples, en Floride :
- un entrepreneur certifié par l'État de Floride (Certified Building Contractor, licence CBC1250125, active jusqu'au 31 août 2028), Floridien de naissance, plus de 20 ans dans les « premier communities » de Naples ;
- cuisines, salles de bain, rénovations complètes, condominiums, cages moustiquaires de piscine et de lanai, agrandissements, sols, rénovations commerciales ;
- leur promesse : un service personnel et courtois, et Rick impliqué dans chaque détail, « from conception to completion ».

- **À ouvrir** : `dist/index.html`, d'un double-clic. C'est un seul fichier (592 Ko, les photos, la police et le script compris), qui marche sans serveur ni connexion.
- **À mettre en ligne** : le dossier `dist-web/`.
  - On le glisse sur app.netlify.com/drop, ou on le publie sur Vercel avec `vercel.json`.
  - `_headers` (Netlify) et `vercel.json` demandent aux moteurs de recherche de ne pas indexer la maquette. Ils sont à retirer au lancement.
  - Prêts pour leur domaine :
    - `robots.txt` ;
    - `sitemap.xml` ;
    - `llms.txt` ;
    - l'image de partage (`assets/og.jpg`).

**Les documents de travail :**
- `ANALYSE.md` : le site actuel, et ce qui a été vérifié ailleurs ;
- `seo-audit-ehlerscontracting.com-2026-10-13.md` : l'audit SEO et GEO du site actuel ;
- `DIRECTION.md` : la direction artistique ;
- `REVUE.md` : la revue de design et la relecture des textes ;
- `ACCESSIBILITE.md` : l'audit d'accessibilité ;
- `boards/` : les planches :
  - l'ouverture image par image, sur ordinateur et sur téléphone ;
  - les parties du site ;
  - les détails (la cuisine détail par détail, le plan des cages, la fourchette, un filtre, les erreurs du formulaire) ;
  - le téléphone.

## La méthode, et les extensions installées

- Le site est écrit à la main, en HTML, CSS et JavaScript.
- Lenis fait le défilement doux, et `build.mjs` assemble le tout.
- Les animations sont natives (CSS, avec un peu de JavaScript pour savoir ce qui est à l'écran), sans GSAP ni WebGL.

**Ce qui a servi :**
- **`frontend-design`** : le plan de direction artistique, revu contre le brief avant de coder (voir `DIRECTION.md`).
- **`design-critique`, `accessibility-review` et `ux-copy`** (extension Design) : la revue des captures, l'audit WCAG et la relecture des textes. Les corrections sont faites et listées dans `REVUE.md` et `ACCESSIBILITE.md`.
- **`seo-audit`** (Maquinable GEO) : l'audit du site actuel, puis les mêmes contrôles sur le nouveau.
- **Les outils de Chrome** : Lighthouse et les traces de chargement, au téléphone ralenti et à l'ordinateur.
- **Playwright** :
  - l'ouverture capturée image par image, l'horloge des animations arrêtée et calée, pour régler chaque instant ;
  - les 49 essais d'interaction (`tools/interact.mjs`), dont un contrôle des débordements à 19 largeurs ;
  - le parcours au clavier, les cibles tactiles et le contraste mesuré sur les pixels (`tools/a11y.mjs`) ;
  - les planches et l'image de partage (`tools/shots.mjs`, `tools/boards.mjs`, `tools/og.mjs`).
- **Les sources publiques**, pour ne rien inventer :
  - le site de l'État de Floride (myfloridalicense.com) pour la licence ;
  - leur profil Houzz pour les photos, les quartiers et la fourchette de prix ;
  - les permis du comté de Collier, lus sur BuildZoom, pour les chantiers.
- **21st.dev et Facade UI**, consultés pour la recherche (le détail est dans `DIRECTION.md`) : on en garde l'idée d'un découpage net pour découvrir le texte et les images, refaite en CSS.

**Ce qui n'a pas été retenu, et pourquoi :**
- **Une image qui suit le curseur** sur la liste des services : un tic de site d'agence, et il n'y a que deux photos.
- **Un comparateur avant/après** : il n'y a pas de photo « avant ».
- **Les sections de Facade UI et des registres shadcn** : du React et du Tailwind, et précisément la composition de page modèle qu'on évite.
- **Une carte** : Hideout en avait une ; ici, la liste des quartiers suffit.
- **Le logo et la note BBB** : l'entreprise n'est pas accréditée, elle ne peut pas les utiliser. **Des avis** : ceux de Houzz ne sont pas lisibles, rien n'est cité.

## L'idée : des plans de construction pour une maison de Naples

Rick dépose des permis et passe des inspections. Le site se lit comme un jeu de plans :
- **des repères numérotés** qui lisent la photo ;
- **une cuisine cadrée détail par détail**, comme sur un relevé ;
- **des lignes de cote, seulement pour de vraies mesures** : les étapes d'un projet, les cages moustiquaires à l'échelle de leurs permis, la fourchette de prix ;
- **un cartouche de plan** en pied de page : l'entrepreneur, la licence, le téléphone, le courriel, la ville.

**L'ouverture : la ligne d'horizon** (2,7 s, une fois, au chargement) :
1. un trait d'encre se tend à travers la page, comme le cordeau qu'on claque sur un chantier ;
2. la photo du séjour de Park Shore s'ouvre verticalement à partir de lui. Le trait est posé à 40 % de la hauteur de la photo, exactement sur l'horizon de la baie, quel que soit l'écran ;
3. le titre, puis le texte et les boutons, se découvrent de gauche à droite ;
4. le trait s'efface, et trois repères (deux au téléphone) nomment ce qu'on voit : les baies vitrées sur la baie, le parquet large, le plan de travail ouvert sur la pièce.

Rien ne se décale dans la page (CLS 0), la photo n'est pas zoomée, et rien ne bloque la page pendant ce temps. Avec « réduire les animations », on voit directement l'état final.

## La direction

- **Couleurs**, tirées des photos (détail et contrastes dans `DIRECTION.md` et `ACCESSIBILITE.md`) :
  - le blanc (#FFFFFF), comme leurs cuisines ;
  - l'estuaire (#12333A), le bleu-vert profond de la baie, pour le texte, les traits et les boutons, et sa version douce (#4D6168) pour le texte secondaire ;
  - la brume de la baie (#E6EEEC) pour la cuisine ;
  - le chêne du parquet (#A27C4B), seulement pour les lignes de cote, jamais pour du texte.
- **Typographie :** une seule famille, Host Grotesk (Element Type, licence OFL, hébergée avec le site), variable de 300 à 800. Une police de secours aux mêmes mesures évite tout saut au chargement.
- **Mise en page :** une seule longue page sur une grille de 12 colonnes, alignée à gauche ; titres à gauche et chapôs à droite ; un fond blanc, puis la brume, puis l'estuaire pour la partie « officielle ». Pas de cartes identiques, pas de numérotation décorative : les seuls numéros sont des repères sur une photo.

## La page

1. **L'accueil** : la ligne d'horizon et le séjour de Park Shore avec ses repères, « Kitchens, baths and whole homes, remodeled in Naples. », qui est Rick, « Call (239) 289-0896 » et « Email Rick ».
2. **Rick** : « One builder, from concept to completion. », son portrait, ses faits (licence, 20 ans à Naples, maisons et commerces), puis les étapes d'un projet sur une ligne de cote : Concept, Design, Permit, Build, Completion.
3. **« Park Shore, detail by detail. »** : la cuisine reste à l'écran pendant qu'on lit cinq détails ; celui qu'on lit est cadré sur la photo (vitrines à croisillons, suspension lanterne, crédence en mosaïque, portes Shaker, mur d'armoires).
4. **« What Rick builds. »** : un tableau des huit services, ce que chacun couvre, et des exemples tirés de leurs permis ; les deux cages d'Ave Maria dessinées à l'échelle ; la fourchette de prix.
5. **« On the record. »** : la licence en grand, son statut et le lien pour la vérifier ; 16 chantiers de 2024 et 2025 tirés des permis, huit d'abord, filtrables par type ; les quartiers.
6. **« Tell Rick about your project. »** : le téléphone et le courriel en grand, et un formulaire qui rédige le message dans la messagerie du visiteur.

**Au téléphone :**
- l'en-tête se resserre : le nom, « Call » et « Menu », qui ouvre un menu plein écran (la page derrière devient inerte) ;
- la photo de l'accueil est cadrée en hauteur, avec ses propres repères ;
- la photo de la cuisine reste en haut, et le détail cadré est celui qu'on lit juste dessous ;
- les exemples du tableau des services gardent leur intitulé.

## Rien d'inventé

- **Les textes** viennent de leur site, raccourcis et réécrits en phrases simples, sans ajouter de service, de chiffre ni de promesse. Les étapes d'un projet ne disent que ce qu'ils disent (le design, les rendus 3D, l'implication de Rick) ou ce qu'un permis impose (il est déposé sous la licence, l'inspection finale le clôt).
- **Les photos** sont les leurs : les deux photos du projet Park Shore publiées sur leur profil Houzz, et le portrait du profil (à confirmer). Converties en AVIF, exportées à 2000 px au plus, jamais agrandies.
- **La licence** est celle du site de l'État : numéro, type, titulaire, statut et date d'expiration.
- **Les chantiers** sont les permis de 2024 et 2025 du comté de Collier, résumés, avec l'année et le quartier ou le code postal ; ni adresse, ni nom de client.
- **Les quartiers et la fourchette de prix** viennent de leur profil Houzz ; Park Shore, Old Naples, Heritage Bay et Ave Maria s'y ajoutent parce que leurs permis y sont.
- **Pas repris** (voir `ANALYSE.md`) : la marque BBB, l'autre licence que BuildZoom leur attribue (CRC1326789, celle d'une autre entreprise), l'autre téléphone de BuildZoom, l'adresse de rue, une date de création (les sources se contredisent), les avis de Houzz (illisibles).

## À confirmer avec Rick

- **Le portrait** : celui de son profil Houzz.
- **La liste des chantiers**, résumée des permis, et la **fourchette de prix** de Houzz.
- **Des photos** : les 9 autres photos du projet Park Shore (derrière la vérification anti-robot de Houzz), et des salles de bain, des cages, des chantiers commerciaux.
- **Des avis** de clients, avec leur accord, signés d'un prénom.
- **Le formulaire** : il ouvre la messagerie du visiteur ; un envoi direct demandera un service de formulaire, à choisir avec lui.
- **Des horaires**, s'il en a, pour le site et les données structurées.
- **À corriger ailleurs**, en attendant le lancement (voir l'audit SEO) :
  - le numéro de licence, absent de leur site actuel alors que la loi de Floride le demande dans toute publicité ;
  - la fiche BuildZoom (autre licence, autre téléphone) ;
  - le pied de page « Construction Company MP Template » de leur site actuel.

## Mesures

Lighthouse et traces de chargement de Chrome, téléphone simulé (4G lente, processeur ralenti 4 fois) et ordinateur, sur le nouveau site servi en local.

Le site actuel n'a pas pu être mesuré : il ne répond pas depuis notre environnement (la connexion est coupée pendant la négociation TLS, et le navigateur de Chrome reçoit « upstream request failed »). Il a été lu par l'outil de lecture web de Claude : deux pages, aucune photo (deux GIF transparents de 1 × 1 px), aucun numéro de licence, un formulaire qui ne demande que le nom et le courriel.

| | Nouveau site |
| --- | --- |
| Accessibilité (Lighthouse) | **100** sur ordinateur et sur téléphone |
| Bonnes pratiques (Lighthouse) | **100** |
| SEO (Lighthouse) | **100** |
| Navigation par agents (Lighthouse) | **100** |
| Affichage du contenu principal (LCP) | **0,20 s** sur ordinateur, **0,66 s** au téléphone ralenti (médiane de cinq chargements) |
| Décalage de mise en page (CLS) | **0** |
| Premier chargement, ordinateur | **5 requêtes, 368 Ko, 1 domaine** |
| Premier chargement, téléphone | **5 requêtes, 292 Ko, 1 domaine** (la photo de l'accueil en hauteur, plus légère) |
| Données structurées | **`GeneralContractor`** : téléphone, courriel, ville, zone servie, huit services, Rick, la licence reconnue par le DBPR |

**Notes sur ces chiffres :**
- Servie compressée par l'hébergeur (Netlify et Vercel le font d'office), la page passe de 89 à 23 Ko.
- La trace signale un calcul de mise en page forcé au démarrage (Lenis mesure la page, les repères se posent sur la photo) : c'est le premier calcul de la page de toute façon, et Chrome n'estime aucun gain possible. Ensuite, pendant toute l'ouverture, aucune image de l'animation ne prend plus de 50 ms à calculer, à l'ordinateur comme au téléphone ralenti.

**Les mêmes contrôles SEO/GEO que pour le site actuel :**
- un titre de 60 caractères et une description de 159 ;
- une image de partage et une adresse canonique ;
- un seul `<h1>`, un `<h2>` par partie, un `<h3>` par détail de la cuisine et par service, `lang="en"` ;
- un texte alternatif sur les deux photos ;
- des données structurées `GeneralContractor`, sans adresse de rue ;
- aucun robot bloqué ;
- un `llms.txt` écrit avec les faits.

**Vérifié aussi :**
- de 320 à 1920 px (19 largeurs), sans débordement, y compris avec l'espacement du texte élargi ;
- au clavier : 30 arrêts sur ordinateur et 26 sur téléphone, focus toujours visible, jamais caché sous l'en-tête ;
- le lien « Skip to content », qui mène bien au contenu ;
- les contrastes mesurés sur les vrais pixels (74 mesures de texte, de 5,25:1 à 13,46:1 ; les contours et les repères au-dessus de 3:1) ;
- avec « moins d'animations », et en arrivant par un lien vers une partie ;
- les 49 essais d'interaction de `tools/interact.mjs` :
  - l'ouverture, en cours et terminée ;
  - les repères posés dans l'écran, sur ordinateur et au téléphone ;
  - les liens de l'en-tête et le focus qui les suit ;
  - la ligne de cote, le plan des cages et la fourchette qui se tracent ;
  - la cuisine détail par détail, sur ordinateur et au téléphone ;
  - le registre : huit chantiers, « Show all 16 jobs », les filtres et l'annonce du nombre ;
  - le formulaire : les erreurs, puis le message rédigé ;
  - le menu du téléphone.

## Fabrication

- **`node build.mjs`** assemble :
  - `dist/index.html`, tout intégré (592 Ko) ;
  - `dist-web/`, une page légère (89 Ko), avec les photos et la police en fichiers séparés, la photo de l'accueil préchargée dans la bonne version (large ou en hauteur), et les fichiers de `web/`.

  Il vérifie au passage que les nombres affichés correspondent au contenu (chantiers de chaque filtre) et que chaque détail de la cuisine a son repère.
- **`src/`** : `index.html`, `styles.css`, `main.js` et `img/` (les photos en AVIF).
- **`data/`** : les dimensions des photos (`photo-sizes.json`) et les réglages de la police de secours (`fallback.json`).
- **`tools/`** :
  - `images.py` refait les photos depuis les fichiers téléchargés sur Houzz : `python3 -I tools/images.py <dossier des téléchargements>` ;
  - `interact.mjs` rejoue les 49 essais d'interaction sur `dist/index.html` ;
  - `a11y.mjs` fait le parcours au clavier, les cibles tactiles, les contrastes et la structure, sur le site servi en local (`python3 -m http.server 8772 --bind 127.0.0.1 --directory dist-web`) ;
  - `shots.mjs` fait les captures, `boards.mjs` compose les planches, `og.mjs` l'image de partage.
- **`web/`** : les fichiers de mise en ligne (`_headers`, `vercel.json`, `robots.txt`, `sitemap.xml`, `llms.txt`, `og.jpg`).
- **`vendor/`** : Lenis 1.3.26, et la police Host Grotesk (sous-ensemble latin, 20 Ko, avec sa licence OFL).
