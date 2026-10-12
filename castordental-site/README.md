# Castor Dental Associates : nouveau site

Refonte complète de https://www.castordentalassociates.com.

Castor Dental Associates est un cabinet dentaire privé et familial du centre de Naples, en Floride :
- au 785 Central Avenue, un cottage blanc à bardage, avec son enseigne en lettres bleues sur le porche ;
- ouvert « in Downtown Naples » en avril 2014, d'après leur site ;
- Dr. Joseph A. Castor, DMD, exerce depuis 1996 (diplômé avec mention de Temple University) ;
- sept personnes autour de lui : une administratrice, deux assistantes, quatre hygiénistes ;
- de l'esthétique et de la dentisterie familiale, et une orthodontie dont le fil passe derrière les dents.

- **À ouvrir** : `dist/index.html`, d'un double-clic. C'est un seul fichier (0,85 Mo, photos et polices comprises), qui marche sans serveur ni connexion.
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
- `seo-audit-castordentalassociates.com-2026-10-12.md` : l'audit SEO et GEO du site actuel ;
- `DIRECTION.md` : la direction artistique ;
- `REVUE.md` : la revue de design et des textes d'interface ;
- `ACCESSIBILITE.md` : l'audit d'accessibilité ;
- `boards/` : les planches :
  - l'ouverture image par image, sur ordinateur et sur téléphone ;
  - les sections ;
  - les détails (soins, mots expliqués, équipe, cas, formulaire) ;
  - le téléphone.

## La méthode, et les extensions installées

- Le site est écrit à la main, en HTML, CSS et JavaScript.
- Lenis fait le défilement doux, et `build.mjs` assemble le tout.
- Les animations sont natives (CSS et Web Animations), sans GSAP ni WebGL.

**Ce qui a servi :**
- **`frontend-design`** : le plan de direction artistique, revu contre le brief avant de coder (voir `DIRECTION.md`).
- **`design-critique`, `accessibility-review` et `ux-copy`** (extension Design) : la revue des captures, l'audit WCAG et la relecture des boutons et des messages. Les corrections sont faites et listées dans `REVUE.md` et `ACCESSIBILITE.md`.
- **`seo-audit`** (Maquinable GEO) : l'audit du site actuel, puis les mêmes contrôles sur le nouveau.
- **Les outils de Chrome** : Lighthouse et les traces de chargement sur le nouveau site. Ils ont trouvé un vrai défaut, corrigé : la photo de l'accueil n'était comptée qu'à 3,2 s sur un téléphone lent (voir « Mesures »).
- **Playwright** :
  - l'ouverture capturée image par image, pour régler le passage d'une enseigne à l'autre ;
  - les 49 contrôles d'interaction (`tools/interact.mjs`) ;
  - le parcours au clavier, le focus caché ou non et le contraste mesuré sur les pixels (`tools/a11y.mjs`) ;
  - les planches et l'image de partage (`tools/shots.mjs`, `tools/boards.mjs`, `tools/og.mjs`).
- **OpenCV** :
  - le repérage des yeux sur les huit portraits (détecteur YuNet), pour les aligner ;
  - le repérage des lettres de l'enseigne dans la photo, pour la plaque de l'ouverture.
- **fontTools** : les polices allégées (204 Ko à 93 Ko), au rendu identique au pixel près.
- **21st.dev**, pour la recherche. Cherchés :
  - des révélations d'image au défilement (« Scroll Reveal Image ») ;
  - des infobulles accessibles (« Accessible Tooltip ») ;
  - des présentations d'équipe (« Team Showcase ») ;
  - des pellicules qu'on fait défiler (« Filmstrip Scrub »).

**Ce qui n'a pas été retenu, et pourquoi :**
- **Les révélations au défilement et les pellicules** animent chaque image qui arrive à l'écran : c'est le tic des sites générés, et le brief veut des animations qui ne fassent jamais gadget. Le site garde un seul moment mis en scène, l'ouverture ; le reste répond à un geste.
- **Les infobulles** de 21st.dev sont des composants React. Celle des mots expliqués fait la même chose en quelques dizaines de lignes : rôle `tooltip`, `aria-describedby`, ouverture au survol, au focus et au toucher, Échap pour fermer.
- **Les présentations d'équipe** sont des grilles de cartes avec effet au survol. Ici, les huit portraits forment une seule bande devant la même haie, comme une photo de groupe dont chacun garde son cadre.
- **Facade UI et les registres shadcn** fournissent des sections en React (héros centré, grille de services, carrousel d'avis). Le brief écarte ces gabarits, et la méthode du site est sans React.

## L'idée : l'enseigne de Central Avenue

Leur façade est leur meilleure image : un cottage blanc, un toit de métal, des palmiers, un grand ciel. Sur le mur du porche, en lettres bleues : « 785 », « Castor Dental Associates », le téléphone, « Joseph A Castor DMD ». Le site prend son identité de cette enseigne.

**L'ouverture** (2,4 s, une seule fois, en haut de la page) :
1. l'enseigne apparaît en grand, en vraies lettres, sur le blanc de la page ;
2. la façade apparaît autour d'elle, et la caméra recule ;
3. les lettres se posent exactement sur celles du porche, puis se fondent dans la vraie enseigne.

Elle dit sans un mot : « ce cabinet existe, et le voici ».

**Comment elle est faite :**
- Chaque ligne de l'enseigne a été mesurée dans la photo (début et fin de l'encre, au pixel). Les lettres du site sont composées en 200 px puis réduites, et calées encre sur encre.
- Pendant le recul, une « plaque » se pose sous les lettres : le morceau de façade autour de l'enseigne, sans ses lettres (`tools/plate.py`). Sans elle, les deux enseignes se dédoublaient.
  - Les lettres de la photo y sont effacées ligne par ligne, puisque le bardage est horizontal.
  - La plaque est découpée dans chaque taille de la photo et tombe dessus au pixel près.
- Les lettres du site foncent pendant que la photo apparaît : à l'ombre du porche, les vraies sont presque noires.
- À la fin, la plaque et les lettres s'effacent ensemble : il reste la photo, telle qu'elle a été prise.
- Avec « réduire les animations », ou en arrivant par un lien vers une section, la photo est là tout de suite.

Le titre est leur propre phrase, raccourcie : « Most dentistry looks like dentistry. Ours is meant to go unnoticed. » (leur page des couronnes : « Most dentistry, looks like dentistry. Our goal is to provide dentistry that is undetectable. »).

**Deuxième fil : tout est expliqué.** Leurs patients le répètent (« a Doctor who constantly explains his actions and what he sees »). Quinze mots de la page sont soulignés en pointillés (lingual, scaling, crown, implant…). Au survol, au clavier ou au toucher, leur définition s'ouvre, citée depuis le dictionnaire dentaire de leur propre site.

**La haie.** Les huit portraits ont été pris devant la même haie. Ils sont recadrés au même écart entre les yeux et à la même hauteur, puis posés côte à côte : la haie court d'un visage à l'autre. Un visage choisi donne sa biographie. C'est le seul aplat de couleur forte du site, le vert de cette haie.

## La direction

- **Couleurs** (détail et contrastes dans `DIRECTION.md`), relevées sur leurs photos :
  - Bardage (#FFFFFF), le blanc de la façade ;
  - Brume (#EEF2F6), le mur à l'ombre du porche, pour les bandes secondaires ;
  - Encre (#0E1A37), le texte ;
  - Bleu enseigne (#22348C), le bleu des lettres : logotype, titres, boutons, liens ;
  - Haie (#2F3B22) et Feuille (#B5C77A), pour la section de l'équipe.
- **Typographie :** deux familles sous licence OFL, hébergées avec le site.
  - Commissioner pour tout le texte. Son axe « flair » donne l'évasement des lettres de l'enseigne : le nom du cabinet est en petites capitales évasées, comme sur le porche.
  - Literata en italique, seulement pour la parole des patients et les définitions : on sait toujours qui parle.
  - Une police de secours aux mêmes mesures évite tout saut au chargement.
- **Mise en page :** titres à gauche, chapôs à droite, sur la même grille de section en section ; des listes et des colonnes de texte, jamais de grille de cartes identiques ; une seule bande de photos (l'équipe).

## La page

1. **L'accueil** : « Most dentistry looks like dentistry. Ours is meant to go unnoticed. », un chapô (le cabinet, les couronnes, les fils cachés, Dr. Castor depuis 1996), « Call 239.300.4635 », « Request a visit », la phrase pour les urgences, puis la façade et son enseigne.
2. **« The wire goes behind your teeth. »** : Stealth Orthodontics™, prouvée par un vrai cas du cabinet, photographié côté langue (avant, pendant, cinq mois), avec un repère sur le fil et une ligne du temps qui se trace. Puis trois questions (prix, durée, âge), un avis, et Invisalign® et Six Month Smiles®, pour lesquels Dr. Castor est certifié.
3. **« Care for the whole family, in plain words. »** : quatre familles de soins, chaque soin s'ouvre ; la caméra intra-orale, les radios numériques et les spécialistes.
4. **« The people you'll see. »** : les huit visages, puis la biographie choisie.
5. **« What patients notice instead. »** : cinq engagements, chacun avec un vrai avis, puis huit autres avis.
6. **« Costs, before anything starts. »** : les assurances, le paiement, CareCredit.
7. **La visite** : l'enseigne recomposée sur un bardage, la photo de la porte (« The door is on the porch, next to the white bench. »), l'adresse, l'itinéraire, le téléphone, le courriel, et le formulaire.
   - On choisit d'abord le sujet ; « Something hurts » propose d'appeler.
   - Le formulaire vérifie les champs, puis ouvre la messagerie du visiteur avec la demande rédigée, vers Castordentalassociates@gmail.com. Le site n'a pas de serveur pour l'envoyer lui-même.

**Au téléphone :**
- l'en-tête se resserre : le nom et le bouton « Menu », qui ouvre un menu plein écran (la page derrière devient inerte) ;
- la façade passe en 4:3, recadrée sur le porche et l'enseigne ;
- le cas et l'équipe glissent du doigt ;
- une barre « Call » / « Request a visit » apparaît après l'accueil et se retire sur la section visite.

**Avec le réglage « moins d'animations » :** pas d'ouverture, pas de défilement doux, la ligne du temps déjà tracée, les soins qui s'ouvrent d'un coup.

## Rien d'inventé

- **Les textes** viennent de leurs 24 pages, raccourcis et réécrits en phrases simples, sans ajouter de soin, de prix ni de chiffre.
  - Le téléphone de leur page de politique financière (239-300-4365) est une faute de frappe : le site garde celui de la façade et des autres pages, 239.300.4635.
  - L'ouverture : leur accueil dit « opened in Downtown Naples in April 2014 ». Le site dit « in downtown Naples since April 2014, at 785 Central Avenue », sans affirmer que le cabinet a toujours été à cette adresse (voir « À confirmer »).
- **Les définitions** sont citées telles quelles depuis leur dictionnaire dentaire. Deux mots entre crochets réparent leur texte : « which [can] be put » (le verbe manquait) et « to prevent [cavities] » (« cavity » au singulier).
- **Les avis** viennent des 36 avis publiés sur leur site (RateABiz, RateMDs, Google, de 2014 à 2017), cités tels quels, avec le prénom seulement, la source et la date.
  - Quand leur page attribue mal une citation (deux prénoms possibles pour « true artistry »), elle n'est pas reprise.
  - Aucun annuaire tiers n'est utilisé quand il contredit leur site (horaires, accueil de nouveaux patients).
- **Les photos** sont les leurs (CDN de Wix, en taille d'origine), recadrées et converties en AVIF, jamais agrandies.
  - La façade vient d'une photo de 4032 px ; elle n'est jamais retouchée. Seule la plaque de l'ouverture, qui ne reste jamais à l'écran, a les lettres effacées.
  - Les portraits sont recadrés autour des yeux, à la même échelle, sans retouche.
  - Les trois photos du cas font 640 px à l'origine : elles sont affichées à 352 px au plus.
- **Les coordonnées** viennent de leurs pages : téléphone, fax, courriel, adresse, Facebook. Pas d'horaires : leur site n'en donne pas.

## À confirmer avec eux

- **Les horaires.** Les annuaires se contredisent (du lundi au vendredi de 8 h 30 à 16 h, ou du lundi au jeudi jusqu'à 16 h et le vendredi jusqu'à midi). À ajouter à la visite et aux données structurées une fois confirmés.
- **Les photos de Shana et de Cindy.** Leurs fichiers n'ont pas de nom ; elles sont attribuées d'après leur place sur la page de l'équipe (chaque photo précède le texte de la personne).
- **L'histoire du lieu.** Un avis de janvier 2017 parle d'un déménagement depuis Pelican Bay. Si le cabinet n'est au 785 Central Avenue que depuis, la phrase de l'accueil reste juste, mais il vaut mieux le savoir.
- **Un vrai envoi du formulaire** (service de formulaires), au lieu de la messagerie du visiteur. Le bouton deviendrait « Send my request » (voir `REVUE.md`).
- **Le logo.** Le site utilise un logotype typographique tiré des lettres du porche. À valider, ou à remplacer par un logo officiel en vectoriel.
- **Des photos du cas en meilleure définition**, et une version espagnole (Amanda parle espagnol).
- **À corriger sur leur site actuel**, en attendant le lancement (voir l'audit SEO) :
  - le nom du site Wix, « castordentalassoc », à la fin de 23 titres ;
  - le téléphone des données structurées, « +239 300-4635 », à écrire « +1-239-300-4635 » ;
  - le lien Google+ mort et « © 2023 by The Amazing Smile » en bas de chaque page.

## Mesures

Lighthouse 13.4.1 et traces de chargement de Chrome, téléphone simulé (réseau 4G rapide, processeur ralenti 4 fois) et ordinateur, sur le nouveau site servi en local.

Le site actuel n'a pas pu être mesuré : un navigateur automatisé reste bloqué par la vérification Cloudflare, et rien n'a été contourné. Une requête honnête avec un agent utilisateur descriptif passe, elle : l'audit SEO a été fait ainsi.

| | Site actuel | Nouveau site |
| --- | --- | --- |
| Accessibilité, bonnes pratiques, SEO (Lighthouse) | non mesurable (vérification Cloudflare) | **100, 100, 100** au téléphone et à l'ordinateur |
| Affichage du plus grand élément au téléphone (LCP) | non mesurable | **0,96 s** (processeur ralenti 4 fois, 4G) ; 0,5 s sur ordinateur |
| Décalage de mise en page (CLS) | non mesurable | **0** |
| Poids de l'accueil | 450 Ko pour la seule page HTML, avant scripts, photos et polices | **303 à 407 Ko en tout**, en 8 requêtes (503 à 607 Ko pour la page entière, en 17) |
| `<h1>` | 2 à 5 par page, dont le nom découpé en deux | **un seul** |
| Titre | « …\| castordentalassoc » sur 23 pages sur 24 | « Castor Dental Associates \| Dentist in Downtown Naples, FL » (57 caractères) |
| Données structurées | `LocalBusiness` minimal, téléphone au mauvais format | **`Dentist` complet**, avec Dr. Castor |

**Notes sur ces chiffres :**
- Le premier LCP mesuré était de 3,2 s : masquée pendant l'ouverture, la photo n'était comptée par Chrome qu'à la fin, quand les animations sont retirées. Elle démarre maintenant à 1 % d'opacité, invisible à l'œil, et elle est comptée dès sa première peinture.
- Servie compressée par l'hébergeur (Netlify et Vercel le font d'office), la page HTML passe de 107 Ko à 25 Ko (brotli) ou 30 Ko (gzip).
- Les polices sont passées de 204 à 93 Ko (`tools/fonts.py`), sans changer un pixel du rendu.

**Les mêmes contrôles SEO/GEO que pour le site actuel :**
- un titre de 57 caractères et une description de 158 ;
- une image de partage et une adresse canonique ;
- un seul `<h1>` et `lang="en"` ;
- un texte alternatif qui décrit chaque photo utile ;
- des données structurées `Dentist` : adresse, téléphone, fax, courriel, ouverture en avril 2014, Facebook, et Dr. Joseph A. Castor, DMD, diplômé de Temple University ;
- aucun robot bloqué ;
- un `llms.txt` écrit avec les faits.

**Vérifié aussi :**
- de 320 à 1920 px (18 largeurs), sans débordement, y compris avec l'espacement du texte élargi ;
- au clavier : 55 arrêts sur ordinateur et 49 sur téléphone, focus toujours visible, jamais caché sous l'en-tête ni sous la barre d'appel ;
- le lien « Skip to content », qui mène bien au contenu ;
- les contrastes mesurés sur les vrais pixels (71 textes, de 6,45:1 à 17,19:1) ;
- avec « moins d'animations », et en arrivant par un lien vers une section ;
- les 49 contrôles d'interaction de `tools/interact.mjs` :
  - l'ouverture (départ, plaque, fin) ;
  - les liens de l'en-tête et le focus qui les suit ;
  - l'équipe, les soins, les mots expliqués (survol, clic, Échap, toucher) ;
  - le cas d'orthodontie ;
  - le formulaire, ses erreurs, la note « Something hurts » et le courriel préparé ;
  - le menu et la barre d'appel du téléphone.

## Fabrication

- **`node build.mjs`** assemble :
  - `dist/index.html`, tout intégré (0,85 Mo) ;
  - `dist-web/`, une page légère, avec les photos (en plusieurs tailles, choisies par le navigateur) et les polices en fichiers séparés.
- **`src/`** : `index.html`, `styles.css`, `main.js`, et `img/` (les photos en AVIF, avec leurs versions réduites `<nom>.w<largeur>.avif`, et les plaques de l'ouverture).
- **`data/`** :
  - `photos.json` : les photos retenues, leurs recadrages et leurs largeurs ;
  - `faces.json` : les yeux repérés sur chaque portrait ;
  - `sign.json` : les lettres de l'enseigne dans la photo, et les rectangles des plaques ;
  - `photo-sizes.json` : les dimensions des photos.
- **`tools/`** :
  - `images.py` refait les AVIF depuis les photos d'origine : `python3 -I tools/images.py <dossier>` ;
  - `plate.py` refait les plaques de l'ouverture : `python3 -I tools/plate.py <dossier>` ;
  - `fonts.py` refait les polices allégées depuis `vendor/fonts/src/` : `python3 -I tools/fonts.py` ;
  - `interact.mjs` rejoue les 49 contrôles d'interaction sur `dist/index.html` ;
  - `a11y.mjs` fait le parcours au clavier, les cibles tactiles et les contrastes, sur le site servi en local (`python3 -m http.server 8765 --bind 127.0.0.1 --directory dist-web`) ;
  - `shots.mjs` fait les captures, `boards.mjs` compose les planches, `og.mjs` l'image de partage.
- **`web/`** : les fichiers de mise en ligne (`_headers`, `vercel.json`, `robots.txt`, `sitemap.xml`, `llms.txt`, `og.jpg`).
- **`vendor/`** : Lenis 1.3.26, et les polices Commissioner et Literata (originaux dans `fonts/src/`, avec leurs licences OFL).
