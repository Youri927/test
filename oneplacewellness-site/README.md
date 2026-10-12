# One Place Wellness : nouveau site

Refonte complète de https://oneplacewellness.com.

One Place Wellness est le cabinet de médecine esthétique sans chirurgie de la Dre Elizabeth Fox, M.D., à Naples, en Floride :
- au 827 Myrtle Terrace, dans le quartier de Park Shore, juste à l'ouest du Tamiami Trail ;
- une chirurgienne plasticienne qui a fait des liftings pendant plus de 25 ans, et qui a traité plus de 9 000 patients ;
- fillers, Botox et Microbotox, threadlift Silhouette InstaLift®, ThermiSmooth, Sciton MicroLaser Peel et soins de la peau ;
- sa façon de faire : restaurer sans en faire trop, et adoucir les ombres du visage plutôt que le « gonfler ».

- **À ouvrir** : `dist/index.html`, d'un double-clic. C'est un seul fichier (0,42 Mo, photos, cartes et polices comprises), qui marche sans serveur ni connexion.
- **À mettre en ligne** : le dossier `dist-web/`.
  - On le glisse sur app.netlify.com/drop, ou on le publie sur Vercel avec `vercel.json`.
  - `_headers` (Netlify) et `vercel.json` demandent aux moteurs de recherche de ne pas indexer la maquette. Ils sont à retirer au lancement.
  - Prêts pour leur domaine :
    - `robots.txt` ;
    - `sitemap.xml` ;
    - `llms.txt` ;
    - l'image de partage (`assets/og.jpg`).

**Les documents de travail :**
- `ANALYSE.md` : le site actuel ;
- `seo-audit-oneplacewellness.com-2026-10-12.md` : l'audit SEO et GEO du site actuel ;
- `DIRECTION.md` : la direction artistique ;
- `REVUE.md` : la revue de design et des textes d'interface ;
- `ACCESSIBILITE.md` : l'audit d'accessibilité ;
- `boards/` : les planches :
  - l'ouverture image par image, sur ordinateur et sur téléphone ;
  - les sections ;
  - les détails (le balayage de la ligne du temps, un soin ouvert, un filtre, le formulaire) ;
  - le téléphone.

## La méthode, et les extensions installées

- Le site est écrit à la main, en HTML, CSS et JavaScript.
- Lenis fait le défilement doux, et `build.mjs` assemble le tout.
- Les animations sont natives (CSS), sans GSAP ni WebGL.

**Ce qui a servi :**
- **`frontend-design`** : le plan de direction artistique, revu contre le brief avant de coder (voir `DIRECTION.md`).
- **`design-critique`, `accessibility-review` et `ux-copy`** (extension Design) : la revue des captures, l'audit WCAG et la relecture des boutons et des messages. Les corrections sont faites et listées dans `REVUE.md` et `ACCESSIBILITE.md`.
- **`seo-audit`** (Maquinable GEO) : l'audit du site actuel, puis les mêmes contrôles sur le nouveau.
- **Les outils de Chrome** : Lighthouse et les traces de chargement, au téléphone ralenti et à l'ordinateur (voir « Mesures »).
- **Playwright** :
  - l'ouverture capturée image par image, l'horloge des animations arrêtée et calée, pour régler la lumière ;
  - les 51 contrôles d'interaction (`tools/interact.mjs`), dont un contrôle automatique des étiquettes de la ligne du temps à 19 largeurs ;
  - le parcours au clavier, le focus caché ou non et le contraste mesuré sur les pixels (`tools/a11y.mjs`) ;
  - les planches et l'image de partage (`tools/shots.mjs`, `tools/boards.mjs`, `tools/og.mjs`).
- **OpenStreetMap** : les rues, les bâtiments, les canaux et le trait de côte autour du 827 Myrtle Terrace, dessinés en SVG par `tools/map.py` (données ODbL, avec la mention « © OpenStreetMap contributors »).
- **21st.dev**, pour la recherche. Cherchés :
  - des graphiques de durées comparées (« timeline chart comparing durations ») ;
  - des titres qui se révèlent dans la lumière (« text reveal light shadow hero ») ;
  - des accueils de cliniques esthétiques (« medical aesthetics clinic landing »).

**Ce qui n'a pas été retenu, et pourquoi :**
- **Les graphiques de durées** de 21st.dev sont des chronologies de type Gantt et des graphiques de tableau de bord. La ligne du temps du site doit porter de vraies durées, de 15 minutes à 2 ans, sur une échelle par paliers : elle est écrite à la main.
- **Les révélations de titres** (texte en volets, flous à l'entrée, titres lumineux) sont justement ce qui fait paraître une page générée. L'ouverture du site joue sur la lumière et les ombres des lettres, pas sur leur apparition.
- **Les accueils de cliniques** proposaient des formes 3D et géométriques : le brief écarte tout ce qui fait « IA », et le site n'invente aucune image.
- **Facade UI et les registres shadcn** fournissent des sections en React et Tailwind. Le brief écarte ces gabarits, et la méthode du site est sans framework.

## L'idée : la lumière, pas le volume

La phrase la plus singulière de leur site est sur la page des fillers : 3 à 5 mm d'ombre peuvent ajouter jusqu'à cinq ans à un visage. La Dre Fox ne « gonfle » pas, elle adoucit les ombres. Le site est construit sur la lumière, l'ombre et le millimètre.

**L'ouverture** (2,6 s, une seule fois, en haut de la page) :
1. la lumière est rasante : chaque lettre du titre, « Look as healthy and happy as you feel. » (leur propre phrase), traîne une ombre longue ;
2. une fenêtre de soleil, basse et étirée, glisse et se redresse ;
3. elle se pose derrière le titre, en quatre carreaux aux bords flous, et il ne reste sous les lettres qu'une ombre courte et douce, celle d'une lumière de face.

Rien ne grossit ni ne se déplace : seule la lumière change. Avec « réduire les animations », ou en arrivant par un lien vers une section, on voit directement l'état final.

**Le violet du marqueur.** Avant un threadlift, elle trace au stylo l'emplacement des fils sur le visage. Ce violet (Gentian, #5B2C93) est la seule couleur vive du site : boutons, liens, et tout ce qui mesure (la règle, les durées, le cabinet sur la carte).

**La ligne du temps.** Le site actuel donne les durées de chaque soin sur six pages différentes. Le nouveau les met sur une seule ligne du temps, de la séance à deux ans : le temps au fauteuil, le rétablissement, l'arrivée des résultats, la durée. Quand elle arrive à l'écran, un curseur la balaie une fois, et chaque trait apparaît à son passage.

## La direction

- **Couleurs** (détail et contrastes dans `DIRECTION.md` et `ACCESSIBILITE.md`) :
  - Lilac White (#F3F0F4), le fond : la lumière sur la peau, froide et nette ;
  - Plum Ink (#271B2D), le texte, et le fond de la partie sur la docteure ;
  - Mauve (#5E4E63), le texte secondaire ;
  - Gentian (#5B2C93), le violet du marqueur ;
  - Skin (#E8D2C7), seulement le passe-partout de la photo du cas.
- **Typographie :** deux familles sous licence OFL, hébergées avec le site.
  - Bodoni Moda pour les titres, les noms des soins et des cas : ses déliés très fins sont le millimètre, ses pleins prennent la lumière de l'ouverture. Son italique est réservé aux demandes des patientes.
  - Hanken Grotesk pour le texte et l'interface, avec des chiffres tabulaires pour les doses, les minutes et les mois.
  - Des polices de secours aux mêmes mesures évitent tout saut au chargement.
- **Mise en page :** une seule longue page (« one place »), titres à gauche et chapôs décalés à droite sur la même grille ; une ligne du temps et un registre de cas, jamais de grille de cartes identiques.

## La page

1. **L'accueil** : leur phrase, la chirurgienne et ses soins en deux lignes, « Call 239-262-8585 », « Request a complimentary consultation », l'adresse et les horaires.
2. **« Three to five millimeters of shadow can add up to five years to a face. »** : une règle de 0 à 10 mm, la bande des 3 à 5 mm au violet du marqueur ; sa façon de lire un visage ; et le vrai cas de leur galerie, avant et après (69 ans, 3 cc de Restylane dans les joues et les rides d'amertume, 1 cc dans les lèvres).
3. **« Six treatments, on one timeline. »** : Botox et Microbotox, fillers, threadlift, ThermiSmooth, MicroLaser Peel, soins de la peau. Chaque soin s'ouvre : ce qu'il traite, comment, le mot de la docteure, les produits.
4. **« What patients asked for, and what she did. »** : les 16 cas légendés de leur galerie, chacun avec l'âge (quand il est donné), la demande, le produit, la quantité et l'endroit. Six d'abord, choisis pour montrer chaque soin, puis « Show all 16 cases » ; un filtre par soin.
5. **« A facelift surgeon's eye, without the surgery. »** : 25 ans de liftings, 9 000 patients, formatrice pour Radiesse, le lifting du cou sans chirurgie qu'elle a mis au point, des patients de 20 à 90 ans, le rappel de Botox offert.
6. **La visite** : « 827 Myrtle Terrace, Naples. », la carte dessinée d'après OpenStreetMap, le téléphone, le courriel, les horaires, l'itinéraire, Instagram et Facebook, et la demande de consultation.
   - On choisit d'abord le sujet (sept choix, dont « Not sure yet ») ; le nom et le téléphone sont demandés, le reste est facultatif.
   - Le formulaire vérifie les champs, puis ouvre la messagerie du visiteur avec la demande rédigée, vers Oneplacewellness@gmail.com. Le site n'a pas de serveur pour l'envoyer lui-même.

**Au téléphone :**
- l'en-tête se resserre : le nom et le bouton « Menu », qui ouvre un menu plein écran (la page derrière devient inerte) ;
- la fenêtre de lumière couvre le titre ;
- chaque soin garde sa piste, avec ses faits écrits en liste dessous ;
- la carte passe en hauteur, resserrée sur le cabinet ;
- une barre « Call » / « Request a consultation » apparaît après l'accueil et se retire sur la section visite.

**Avec le réglage « moins d'animations » :** pas d'ouverture, pas de défilement doux, la ligne du temps déjà tracée, pas d'ondes sur la carte, les soins qui s'ouvrent d'un coup.

## Rien d'inventé

- **Les textes** viennent de leurs 9 pages, raccourcis et réécrits en phrases simples, sans ajouter de soin, de prix ni de chiffre.
  - Les coquilles sont corrigées (« Restylene », « Canidates », « Lawlije »…) ; les superlatifs (« safest », « best results available ») et les promesses intenables (des fillers de lèvres « pour des décennies », le Botox contre les migraines) ne sont pas repris.
  - Les durées annoncées par les fabricants et celles de la docteure sont distinguées (« up to 2 years, according to the maker; longer for many of Dr. Fox's patients »).
- **Les cas** viennent des légendes de leur galerie : l'âge, la demande, le produit et la quantité, sans nom ni prénom. Deux cas sans légende ne sont pas repris.
- **La seule photo** est le premier cas de leur galerie (601 × 225 px), la seule récupérable (voir `ANALYSE.md`). Elle est coupée en deux tirages de 292 × 225 px, sans le filet bleu ni le liseré blanc, convertie en AVIF à sa taille d'origine, jamais agrandie.
- **Les photos de banque d'images** de leur site (Getty, fournies par GoDaddy) ne sont pas reprises : elles sont sous licence pour les sites GoDaddy seulement, et ne montrent ni la docteure ni le cabinet.
- **La carte** est dessinée d'après les données d'OpenStreetMap (code postal 34103 et coordonnées du bâtiment compris), avec leur mention.
- **Pas d'avis de patients** : leur site n'en publie pas, et la fiche RealSelf est une source tierce, non reprise.
- **Les coordonnées** viennent de leurs pages : téléphone, courriel, adresse, Facebook, Instagram, horaires de l'accueil.

## À confirmer avec eux

- **Les horaires.** L'accueil et la fiche de l'entreprise (leur `llms.txt`) disent du lundi au jeudi, de 9 h à 16 h ; la page Contact dit du lundi au vendredi, de 9 h à 17 h (les horaires par défaut de GoDaddy). Le site reprend les premiers.
- **La réservation en ligne.** Le lien AestheticsPro est désactivé (« This booking link has been disabled »). Le site propose l'appel et la demande écrite ; si la réservation revient, ajouter « Book online » à côté.
- **Des photos réelles** : les originaux des cas de la galerie, un portrait de la Dre Fox, une ou deux photos du cabinet. Le site est prêt à les recevoir (voir `REVUE.md`).
- **La consultation offerte et le rappel de Botox de 30 unités** : tous deux annoncés sur leur site actuel, à confirmer avant le lancement.
- **Un vrai envoi du formulaire** (service de formulaires), au lieu de la messagerie du visiteur. Le bouton deviendrait « Send my request ».
- **Le logo.** Le site utilise un logotype typographique (le nom en Bodoni, le nom de la docteure dessous). À valider, ou à remplacer par leur logo en vectoriel.
- **À corriger sur leur site actuel**, en attendant le lancement (voir l'audit SEO) :
  - le bouton « Complimentary Consult », qui mène à la réservation désactivée ;
  - les horaires et l'adresse de la page Contact ;
  - les coquilles, surtout « Restylene ».

## Mesures

Lighthouse et traces de chargement de Chrome, téléphone simulé (réseau 4G rapide, processeur ralenti 4 fois) et ordinateur, sur le nouveau site servi en local.

Le site actuel n'a pas pu être mesuré : son serveur coupe les connexions venues de notre environnement, et rien n'a été contourné. Son texte a été lu avec l'outil de lecture web (voir l'audit SEO).

| | Site actuel | Nouveau site |
| --- | --- | --- |
| Accessibilité, bonnes pratiques, SEO (Lighthouse) | non mesurable (connexions coupées) | **100, 100, 100** au téléphone et à l'ordinateur |
| Affichage du plus grand élément (LCP) | non mesurable | **0,39 s** au téléphone (processeur ralenti 4 fois, 4G) ; 0,23 s sur ordinateur |
| Décalage de mise en page (CLS) | non mesurable | **0** |
| Poids de l'accueil | non mesurable | **229 Ko** de page (81 Ko compressée), 135 Ko de polices, 15 Ko de photos : 6 requêtes en tout |
| Bouton principal | mène à une réservation désactivée | appel et demande écrite, qui marchent |
| Horaires | deux versions qui se contredisent | une seule |
| Données structurées | non vérifiables | **`MedicalClinic` complet**, avec la Dre Fox et les six soins |

**Notes sur ces chiffres :**
- Les deux cartes sont dans la page, en SVG. Leur tracé a été compacté (points relatifs, au dixième d'unité) : de 226 à 131 Ko, pour un rendu identique au pixel près sur la carte du téléphone, et partout ailleurs que l'animation du cabinet sur la carte large.
- Servie compressée par l'hébergeur (Netlify et Vercel le font d'office), la page passe de 229 à 81 Ko (gzip).

**Les mêmes contrôles SEO/GEO que pour le site actuel :**
- un titre de 52 caractères et une description de 160 ;
- une image de partage et une adresse canonique ;
- un seul `<h1>`, un `<h2>` par partie, `lang="en"` ;
- un texte alternatif qui décrit chaque photo utile (les deux tirages du cas) et la carte ;
- des données structurées `MedicalClinic` : adresse complète avec le code postal, coordonnées, téléphone, courriel, horaires, Facebook, Instagram, la Dre Fox et les six soins ;
- aucun robot bloqué ;
- un `llms.txt` écrit avec les faits.

**Vérifié aussi :**
- de 320 à 1920 px (19 largeurs), sans débordement ni étiquette de la ligne du temps qui sorte de sa piste ou touche sa voisine, y compris avec l'espacement du texte élargi ;
- au clavier : 44 arrêts sur ordinateur et 39 sur téléphone, focus toujours visible, jamais caché sous l'en-tête ni sous la barre d'appel ;
- le lien « Skip to content », qui mène bien au contenu ;
- les contrastes mesurés sur les vrais pixels (70 textes, de 5,33:1 à 16,39:1) ;
- avec « moins d'animations », et en arrivant par un lien vers une section ;
- les 51 contrôles d'interaction de `tools/interact.mjs` :
  - l'ouverture (l'ombre longue au départ, qui s'adoucit, puis l'ombre de face) ;
  - les liens de l'en-tête et le focus qui les suit ;
  - le balayage de la ligne du temps, un soin qui s'ouvre et se referme au clavier ;
  - les filtres des cas, l'annonce du nombre, « Show all 16 cases » et le focus qui suit ;
  - la carte ;
  - le formulaire, ses erreurs et le courriel préparé ;
  - le menu et la barre d'appel du téléphone.

## Fabrication

- **`node build.mjs`** assemble :
  - `dist/index.html`, tout intégré (0,42 Mo) ;
  - `dist-web/`, une page légère, avec les photos et les polices en fichiers séparés.
- **`src/`** : `index.html`, `styles.css`, `main.js`, les deux cartes (`map-wide.svg` pour l'ordinateur, `map-tall.svg` pour le téléphone) et `img/` (les deux tirages du cas, en AVIF).
- **`data/`** :
  - `case-marionette-1.jpg` : la photo du cas, telle que sur leur galerie ;
  - `photo-sizes.json` : les dimensions des photos.
- **`tools/`** :
  - `images.py` refait les deux tirages depuis la photo d'origine : `python3 -I tools/images.py data/case-marionette-1.jpg` ;
  - `map.py` redessine les deux cartes depuis des extraits OpenStreetMap (API `/api/0.6/map`) : `python3 -I tools/map.py <extrait.osm> [<extrait.osm> …]` ;
  - `interact.mjs` rejoue les 51 contrôles d'interaction sur `dist/index.html` ;
  - `a11y.mjs` fait le parcours au clavier, les cibles tactiles et les contrastes, sur le site servi en local (`python3 -m http.server 8770 --bind 127.0.0.1 --directory dist-web`) ;
  - `shots.mjs` fait les captures, `boards.mjs` compose les planches, `og.mjs` l'image de partage.
- **`web/`** : les fichiers de mise en ligne (`_headers`, `vercel.json`, `robots.txt`, `sitemap.xml`, `llms.txt`, `og.jpg`).
- **`vendor/`** : Lenis 1.3.26, et les polices Bodoni Moda (romain et italique) et Hanken Grotesk, dans leur version latine de Google Fonts, avec leurs licences OFL (les feuilles de style d'origine, qui donnent leur adresse, sont dans `fonts/src/`).
