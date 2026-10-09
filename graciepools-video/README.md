# Gracie Pools : vidéo de présentation du nouveau site (Remotion)

Vidéo de 102,6 s en anglais (1920 × 1080, 60 i/s) pour présenter la refonte du site à Gracie Pools.

**Le fil rouge : « Every model, drawn to scale ».** Le nouveau site pose chaque modèle Barrier Reef à sa vraie taille, sur une grille en pieds. La vidéo parle la même langue, celle des cotes et des règles.
- Elle montre d'abord le site actuel, puis le **vrai nouveau site** (`../graciepools-site/dist/index.html`).
- Le nouveau site est filmé image par image en 2×, sur ordinateur et sur téléphone, puis mis en scène dans un navigateur et des téléphones, avec des mouvements de caméra.
- **Les transitions** : une règle graduée en pieds se trace au milieu de l'image, puis ses deux mâchoires s'écartent comme celles d'un pied à coulisse, et la scène suivante apparaît entre elles. Les graduations restent fixes à l'écran (un pied tous les 32 px, l'image fait 60 pieds de large).
- **Les légendes** : leur cote se trace d'abord, avec ses deux butées, puis le panneau se déplie dessous.
- **Les preuves** du site actuel sont mesurées : un cadre qui se trace et sa cote au-dessus.
- **Le pivot** : la fiche Barrier Reef 2025, que leur site propose en PDF. La caméra lit sa note « Measurements are approximate and not to scale », puis les 23 dessins se détachent de la page et se rangent à l'échelle, en prenant la vraie eau.

| Fichier | Usage |
| --- | --- |
| `renders/presentation-gracie-16x9.mp4` | présentation avec musique et bruitages (−14 LUFS) |
| `renders/presentation-gracie-16x9-muet.mp4` | même vidéo sans son |

| Temps | Séquence |
| --- | --- |
| 0 – 6 s | Sur une grille d'un pied, la cote de la longueur se trace et compte jusqu'à 35′ 3⅛″, puis la largeur (16′) ; le contour du Billabong Cove se dessine, l'eau le remplit ; la marque et le nom de Gracie Pools |
| 6 – 20,4 s | Today : le site actuel (vraies captures de cinq pages) et trois constats tirés de l'analyse. La caméra va chercher chaque preuve : « Daily Specials » (demi-tarif pour les moins de 12 ans) et le toboggan sur la page Fabrication, la fiche du Billabong Cove à 40′–35′ × 15′ 8″, la page « Fiberglass Installations » réduite à une carte cadeau, puis le lien « Download PDF » de la fiche 2025 |
| 20,4 – 31,2 s | La fiche Barrier Reef 2025 : la note « not to scale » mesurée, puis les 23 dessins quittent la page et se rangent à l'échelle sur une grille en pieds, avec leur nom et leur longueur ; « Every model, drawn to scale » et une échelle graphique de 20 pieds |
| 31,2 – 39,6 s | L'accueil : « Hello Florida » monte ligne par ligne, le bassin se dévoile avec ses cotes, survol de « Find your pool », puis le Billabong Cove laisse la place au Laguna |
| 39,6 – 47,4 s | La coque d'un seul tenant : le site descend jusqu'au titre et à la photo du Laguna, puis la caméra suit les sept étapes, des quatre de l'usine Barrier Reef aux trois du jardin, toutes tracées sur le contour du Coral Sea |
| 47,4 – 55,2 s | Le comparateur : le panneau sombre s'ouvre ; Whitsunday Deep s'étire jusqu'à 40′, le filtre « Plunge », l'Escape se rétracte à 17′, on l'épingle |
| 55,2 – 63,6 s | Même prise : Whitsunday Deep avec l'Escape en pointillés, trois coloris (Ocean, Arctic, Sandstone), puis le Billabong Cove, toujours avec l'Escape en pointillés |
| 63,6 – 70,8 s | Les photos : on fait glisser la bande, puis le nom « Billabong Cove » ouvre le comparateur sur lui |
| 70,8 – 78 s | Les piscines existantes : la carte « Text a photo » au survol, puis « Resurfacing and tile » s'ouvre |
| 78 – 87 s | La demande : « Ask about this pool » sur le Sydney Harbour ; le site descend jusqu'au formulaire, qui l'a déjà joint ; le nom, le téléphone, la ville, l'envoi, « Thanks, Maria. Your request is in. » |
| 87 – 94,2 s | Trois téléphones : l'arrivée, le comparateur au doigt (Bondi, puis Grande), le menu |
| 94,2 – 102,6 s | La gamme entière à la même échelle sur l'encre du pied de page ; la marque, le téléphone, l'offre du SMS, la licence, l'adresse ; fondu |

**Rien d'inventé.**
- Les phrases viennent du site actuel ou du nouveau site (titres, constats, licence, adresse, téléphone).
- Les pages « Today » sont des captures complètes du site actuel, faites le 9 octobre 2026 (`capture/before.mjs`) ; les constats viennent de `../graciepools-site/ANALYSE.md`.
  - L'accueil est montré tel qu'on y arrive, bandeau de cookies compris.
  - Sur les pages suivantes, les cookies sont acceptés et le bandeau retiré, comme pour un visiteur qui a déjà accepté.
- La fiche est celle de Barrier Reef (2025), que leur site héberge en PDF ; les dessins et les mesures sont ceux de la fiche, les mêmes que sur le nouveau site.
- Le formulaire est rempli avec un nom fictif et un numéro en 555.

## Fabrication

1. **Captures.**
   - `npm run capture:site` filme le nouveau site avec Playwright (`capture/shots.mjs`). On peut filmer un seul plan : `node capture/shots.mjs d-planner`.
   - L'horloge de la page est simulée : elle avance d'exactement 1/60 s entre deux images. GSAP tourne sur ce temps, les animations CSS sont recalées dessus, et Lenis et ScrollTrigger sont mis à jour à chaque défilement. La date simulée est le jeudi 8 octobre 2026 à 10 h (la ligne « Monday – Friday » des horaires est signalée).
   - `npm run capture:probe` rejoue les plans sans filmer et relève les repères (passage au Laguna, comparaison, Billabong Cove ouvert depuis la galerie, onglet ouvert, formulaire envoyé) dans les fichiers JSON des plans.
   - Les plans du comparateur et de la comparaison sont une seule prise : la scène « Compare » reprend à l'image 504, là où « Models » s'arrête.
   - Rendu processeur (`--disable-gpu`) : l'émulateur graphique du conteneur laisse des bandes dupliquées sur les grands dessins SVG.
   - Les plans sont écrits en 2880 × 1800 (ordinateur) et 780 × 1688 (téléphone) dans `public/site/`, avec la trajectoire de la souris, redessinée nette par-dessus (sur téléphone, un vrai toucher d'écran).
   - `npm run capture:before` capture le site actuel en 2× (`public/before/`), avec la position exacte des passages cités (mesurée sur le texte lui-même).
   - `python3 -I tools/sheet.py <fiche.pdf>` rend la page 2 de la fiche (`public/img/sheet.jpg`, 4 px par point) et relève la place de chaque dessin (`src/sheet.json`), avec l'extraction du site (`../graciepools-site/tools/drawings.py`).
   - Les bassins de l'ouverture, de la fiche et de la fin sont dessinés en vectoriel dans Remotion (`src/Pool.tsx`), avec les données du site (`src/drawings.json`, `src/data-pools.json`) et les textures d'eau des six coloris : même rendu que le site (margelle en pierre, eau du coloris, relief en lumière douce). Pour la fiche, les mêmes dessins prennent d'abord les bleus à plat du PDF.
2. **Son.** `npm run sound` synthétise la musique (`sound/music.mjs`) et les bruitages (`sound/sfx.mjs`). Aucun échantillon, aucun droit tiers.
   - **Musique** : 100 BPM, la majeur : marimba, piano électrique (synthèse FM), basse ronde, grosse caisse douce, rimshot, claquement et shaker.
     - L'ouverture se pose sur la majeur quand l'eau remplit le bassin.
     - Le site actuel passe en fa dièse mineur, sur une pulsation sourde.
     - La fiche tient un accord pendant que la caméra lit la note, puis la grosse caisse monte pendant que les dessins se posent ; le groove part sur « Every model, drawn to scale ».
     - Les panneaux sombres du site (comparateur, piscines existantes) : le groove passe dans un filtre qui se referme à moitié, et se rouvre avec la galerie et la demande.
   - **Bruitages** : peu de sons, courts et nets, mixés bas sous la musique (24 dB dessous en moyenne), sans aucun souffle ni glissé : les déclics de la cote qui compte, une goutte quand l'eau arrive, un déclic feutré quand les mâchoires de la règle s'écartent, une note de marimba pour chacun des 23 dessins qui se posent (en la majeur pentatonique), les clics, l'épingle, une goutte par coloris, la frappe au clavier et le carillon du formulaire envoyé.
   - Tous les points de synchronisation sont dans `src/beats.ts` : les coupes tombent sur les temps de la musique. Les repères des bruitages sont partagés entre l'aperçu Remotion et le mixage (`src/cues.ts`).
3. **Rendu.**
   - `bash tools/render.sh` : rendu muet par segments (`out/seg/`), raccord avec ffmpeg, bande-son mixée à part (`npm run mix`), puis assemblage dans `out/presentation-gracie.mp4`.
   - Finalisation : `npm run finalize` normalise le son à −14 LUFS (crête vraie sous −1,5 dB), crée la version muette et une version légère de moins de 30 Mo pour l'envoi (`out/`).
   - GitHub refuse les fichiers de plus de 100 Mo : si le rendu dépasse 94 Mo, la finalisation réencode l'image en H.264 en deux passes pour tenir dessous (la version légère repart du rendu d'origine).
   - `node tools/stills.mjs <dossier> <image> …` sort des images fixes pour vérifier une scène.

Dans Remotion Studio (`npm run studio`), trois compositions : `Presentation-Gracie` (complète), `-Bruitages` (sans musique) et `-Muet`.

Après une modification du site : relancer `npm run build` dans `graciepools-site`, puis `npm run capture:site` et `npm run capture:probe`.

`node_modules` est un lien vers celui de `../enhance-video` (mêmes versions de Remotion) ; sinon, `npm install`.

Police : Familjen Grotesk, licence OFL (`public/fonts/`).
