# Hideout Boutique : vidéo de présentation du nouveau site (Remotion)

Vidéo de 51,6 s en anglais (1920 × 1080, 60 i/s), faite pour Hideout Boutique & Med Spa (Fort Myers). Elle leur présente leur nouveau site et leur parle directement (« your logo », « your clients »).

On s'y promène sur le **vrai nouveau site** (`../hideout-site/dist/index.html`) :
- il est filmé image par image en 2×, sur ordinateur et sur téléphone (défilement, survols, clics, glisser, touchers) ;
- puis mis en scène dans un navigateur et des téléphones, avec une légende par partie.

L'ouverture est celle du site, filmée dès sa première image :
1. leur logo se pose au centre de la page blanche ;
2. le nom s'efface, le cadre or reste seul ;
3. une vraie photo de leur salle de soins s'ouvre dans le cadre ;
4. le cadre s'agrandit jusqu'à la page d'accueil et s'y pose sur un temps de la musique, le titre se découvre ;
5. le navigateur se range de côté pour la légende de la vidéo.

| Fichier | Usage |
| --- | --- |
| `renders/presentation-hob-16x9.mp4` | présentation avec musique (−14 LUFS) |
| `renders/presentation-hob-16x9-muet.mp4` | même vidéo sans son |

| Temps | Séquence |
| --- | --- |
| 0 – 9,6 s | L'ouverture : le logo sur le blanc, le nom qui s'efface, la photo qui s'ouvre dans le cadre, le cadre qui devient la page ; légende « Your new website » avec le logo |
| 9,6 – 16,8 s | Les soins : la souris passe sur Injectables, Lashes, puis Skin and lasers ; à chaque fois le nom s'élargit et la photo de la famille passe dans le cadre ; « Skin and lasers » s'ouvre ; « Every treatment, one frame » |
| 16,8 – 22,8 s | Les résultats : un clic sur « Permanent makeup », les neuf avant/après de la famille montent ; « Only your own results » |
| 22,8 – 28,8 s | L'équipe, sur l'expresso : le cadre se trace autour de la photo de groupe, puis les trois responsables, leur nom, leurs titres ; « Credentials first » |
| 28,8 – 34,8 s | Le Beauty Bank : la souris tire le curseur de 6 à 12 mois, les mois se remplissent, le crédit passe de $594 à $1,188 ; « Beauty Bank at a glance » |
| 34,8 – 39,6 s | La visite : la carte dessinée d'après OpenStreetMap ; quand le cabinet passe à l'écran, le cadre du logo se pose sur le 1342 Colonial Blvd ; « Find the hideout » |
| 39,6 – 46,8 s | Trois téléphones : l'ouverture en hauteur, « Facials and body » touché qui s'ouvre sur sa photo, la barre « Book now / Call » qui monte ; « On a phone » |
| 46,8 – 51,6 s | Le cadre du logo se trace du milieu vers les coins, le nom se découvre ; « Built from your logo, your team and your clients’ own results. » ; fondu au noir |

**Rien d'inventé :**
- Tout ce qui est à l'écran vient du nouveau site, écrit à partir de leurs pages et de leurs photos.
- Les légendes décrivent ce que fait le site, avec ses chiffres : cinq familles et 55 soins, 38 avant/après de leur clientèle (chacun avec le soin et la personne qui l'a fait), $99 par mois crédités sur le compte et qui n'expirent pas, l'adresse du cabinet.
- La photo de l'ouverture est la leur : Lina Davis, NP-C, au travail, vue dans le miroir de la salle de soins.
- Les avis visibles à la fin de l'équipe sont signés d'un prénom et d'une initiale, comme sur le site.

**Deux retouches du site, faites pendant le tournage** (et reprises dans `../hideout-site`) :
- le cadre de la carte attendait l'arrivée de la carte, alors que le cabinet était encore sous le bas de l'écran : il se pose maintenant quand le cabinet lui-même est à l'écran (un essai de plus dans `tools/interact.mjs`, 50 au total) ;
- au téléphone, Chrome dessinait un rectangle gris sous le doigt à chaque toucher : il est retiré, chaque contrôle répondant déjà lui-même (panneau qui s'ouvre, filtre qui se remplit).

## Pas de saccades

Mêmes règles que pour les vidéos précédentes :
- **Chaque plan est lu à vitesse 1**, image pour image : aucune image sautée ni doublée.
- **Le site défile par pas entiers et réguliers** (3 ou 4 px par image), avec des accélérations progressives : Chrome arrondit le défilement au pixel.
- **Rien ne dérive.** Le navigateur est immobile pendant chaque plan. Les seuls mouvements sont francs et courts : la mise de côté pour la légende de l'ouverture, la montée des téléphones.
- **Caméra en 2D**, sans flou de mouvement : le monde est un seul calque composité, dessiné en grand (navigateur de 1850 px) et seulement réduit.
- **Les passages par le noir** ne jouent que sur l'opacité, en courbe douce : la dernière image d'une scène et la première de la suivante sont noires, et la lumière ne fait aucune marche d'une image à l'autre.
- **L'ouverture est celle du site**, filmée sur l'horloge simulée (2 s). Les animations sont tenues en pause et placées image par image : la fin de l'ouverture, qui retire normalement ses animations, ne se déclenche donc pas, mais leur dernier état reste en place (identique à l'œil).
- **Au téléphone, la page est filmée en 390 × 797** (l'écran moins la barre d'état) : rien n'est coupé en bas, la barre « Book now / Call » reste entière.

**Contrôlé dans les captures** (`tools/motion.py track`) : le défilement avance par pas entiers et réguliers, 1, 2 puis 3 px par image, puis 4 px, identiques d'une image à l'autre.

## Fabrication

1. **Captures :** `npm run capture` filme le site avec Playwright (`capture/shots.mjs`, `capture/lib.mjs`). On peut filmer un seul plan : `node capture/shots.mjs d-bank`.
   - L'horloge de la page est simulée : elle avance d'exactement 1/60 s entre deux images. Les animations du site (l'ouverture, les noms qui s'élargissent, les photos dans le cadre, les panneaux qui s'ouvrent, les filtres, les cadres qui se tracent, la barre du téléphone) et Lenis tournent sur ce temps.
   - Les plans sont écrits en 2880 × 1800 (ordinateur) et 780 × 1594 (téléphone) dans `public/site/`, avec la trajectoire de la souris, redessinée nette par-dessus. Au téléphone, ce sont de vrais touchers d'écran.
   - Les clics, le curseur pris et lâché et les touchers tombent sur des temps de la musique (`EVENTS` et `TIMING` dans `src/beats.ts`).
   - `node capture/shots.mjs --probe` rejoue les plans sans filmer et relève les repères (l'image où chaque photo passe dans le cadre, où un cadre se trace, chaque mois du Beauty Bank, la barre du téléphone).
2. **Musique :** `npm run music` la synthétise (`sound/music.mjs`), sans échantillon ni droit tiers : 100 BPM, la bémol majeur, dans l'esprit neo-soul. Piano électrique (FM, avec un léger trémolo), nappe désaccordée, basse ronde, batterie en demi-temps balancée (grosse caisse, claquement de doigts, charleston), maillets de verre et cloches.
   - Sur le logo seul, un accord de piano feutré ; quand la photo s'ouvre, la suspension et une cascade de verre pendant que le cadre grandit ; quand il se pose, l'accord de la bémol s'épanouit avec les cloches et le groove entre à demi. Il est complet avec la légende.
   - Chaque geste filmé est souligné d'un maillet ou d'une cloche, à l'image près : chaque photo qui passe dans le cadre, le filtre, chaque cadre qui se trace, chaque mois du Beauty Bank, le curseur lâché, la barre du téléphone. Pas de bruitages.
   - La scène de l'équipe, sur l'expresso, passe dans un filtre plus sourd.
   - L'équilibre des instruments (`MIX` dans `sound/music.mjs`) est réglé sur le spectre des présentations précédentes : la basse et la grosse caisse en retrait, le piano et la nappe présents dans les médiums, le charleston discret.
3. **Rendu :** `bash tools/render.sh` rend l'image par segments, les raccorde, mixe la musique (`sound/mix.mjs`) et assemble `out/presentation-hob.mp4`.
   - Puis `npm run finalize` normalise le son à −14 LUFS.
   - Il crée aussi la version muette, et une version d'envoi de moins de 30 Mo (`out/`).

`node tools/stills.mjs <dossier> <image> …` sort des images fixes du montage pour vérifier une scène.

`python3 -I tools/motion.py …` mesure les mouvements sur des images du rendu :
- `col` et `row` : la position d'un bord au sous-pixel ;
- `track` : le suivi d'un morceau d'image ;
- `dup` : les images doublées ou sautées d'une vidéo.

`python3 -I tools/curves.py …` compare la mise de côté du navigateur et la montée des téléphones à leur courbe prévue (les formules du montage).

Police : Archivo (licence OFL, `public/fonts/OFL-Archivo.txt`), la même que le site. Le logo est le SVG du site (`src/logo.ts`).
