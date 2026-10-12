# Prestige Pools of Wilmington : vidéo de présentation du nouveau site (Remotion)

Vidéo de 51 s en anglais (1920 × 1080, 60 i/s), faite pour Prestige Pools of Wilmington. Elle leur présente leur nouveau site et leur parle directement (« your pools », « your crews »).

On s'y promène sur le **vrai nouveau site** (`../prestigepools-site/dist/index.html`) :
- il est filmé image par image en 2×, sur ordinateur et sur téléphone (défilement, clics, touchers) ;
- puis mis en scène dans un navigateur et des téléphones, avec une légende par partie.

L'ouverture reprend le geste du site :
1. on voit d'abord **leur site actuel** ;
2. il s'efface en fondu sur le nouveau site, de jour, filmé dès sa première image ;
3. la souris actionne l'interrupteur « Pool lights » : la page passe du jour à la nuit par le crépuscule, et le fond de la scène suit le même ciel, sur la même courbe ;
4. le navigateur se range de côté pour la légende.

| Fichier | Usage |
| --- | --- |
| `renders/presentation-ppw-16x9.mp4` | présentation avec musique (−14 LUFS), 22,6 Mo |
| `renders/presentation-ppw-16x9-muet.mp4` | même vidéo sans son, 21,3 Mo |

| Temps | Séquence |
| --- | --- |
| 0 – 13,8 s | Leur site actuel (« Your website today »), puis le nouveau, de jour ; la souris allume la piscine et tout passe à la nuit ; légende « Your new website » avec le logotype |
| 13,8 – 19,8 s | La pose, de nuit : la page descend jusqu'aux huit étapes, qui s'allument deux par deux ; « Your machines, your crews » |
| 19,8 – 25,8 s | La galerie : le filtre « By the water », puis une photo ouverte en grand ; « Every pool is one of yours » |
| 25,8 – 31,8 s | Les projecteurs : la même piscine en blanc, en bleu, puis en rouge ; « Pool time doesn’t end at sunset » |
| 31,8 – 36,6 s | Les avis : la grande citation, puis les premiers avis ; « In your customers’ words » |
| 36,6 – 41,4 s | Le formulaire, de nuit : un spa, puis l'entretien, et l'adresse du mail change ; « Plan your pool » |
| 41,4 – 47,4 s | Trois téléphones : l'interrupteur au doigt, la galerie, les trois couleurs ; « On a phone » |
| 47,4 – 51 s | Le point du logotype s'allume, « Built from your pools, your lights and your customers’ words. », à la nuit ; fondu au noir |

**Rien d'inventé :**
- Tout ce qui est à l'écran vient :
  - du nouveau site, écrit à partir de leurs pages et de leurs photos ;
  - ou de leur site actuel, filmé tel quel (`capture/old.mjs`).
- Les légendes décrivent ce que fait le site, avec ses chiffres : huit étapes, 34 photos et cinq filtres, trois couleurs, dix avis (la moitié citent Jordan).
- La galerie compte 34 photos : la légende dit « 34 photos of your pools », pas 34 piscines, car plusieurs photos peuvent montrer le même bassin.
- Les avis gardent ce que montre le site : le prénom et la source (Google ou Facebook).
- Le site est filmé le lundi 12 octobre 2026 à 10 h, heure de Wilmington : le formulaire affiche donc « Open now ». La nuit vient de l'interrupteur (ou de `?lights=on` pour les plans de nuit), pas de l'heure.

## Pas de saccades

Mêmes règles que pour les vidéos précédentes :
- **Chaque plan est lu à vitesse 1**, image pour image : aucune image sautée ni doublée.
- **Le site défile par pas entiers et réguliers** (2 ou 3 px par image sur ordinateur, 3 à 6 sur téléphone), avec des accélérations progressives : Chrome arrondit le défilement au pixel.
- **Rien ne dérive.** Le navigateur est immobile pendant chaque plan. Les seuls mouvements sont francs et courts : la mise de côté pour la légende de l'ouverture, la montée des téléphones.
- **Caméra en 2D**, sans flou de mouvement : le monde est un seul calque composité, dessiné en grand (navigateur de 1850 px) et seulement réduit.
- **Les passages par le noir** ne jouent que sur l'opacité.
- **Le passage à la nuit est celui du site**, filmé sur l'horloge simulée (1,25 s, crépuscule à 46 %). Pendant ce passage, les boutons et l'interrupteur relançaient leur propre transition de couleur à chaque image et restaient gris un instant : c'est corrigé dans le site avant le tournage (voir `../prestigepools-site/REVUE.md`).

**Contrôlé sur le rendu** (`tools/motion.py` et `tools/curves.py`) :
- la mise de côté du navigateur suit la courbe prévue à 0,20 px près (0,06 px en moyenne), sur son bord gauche comme sur son bord haut, sans arrondi au pixel ;
- les trois téléphones montent sur leur courbe à 0,30 px près (0,06 px en moyenne), puis ne bougent plus ;
- dans les captures, le défilement avance par pas entiers et réguliers (1, 2 puis 3 px par image, à 0,01 px près d'une image à l'autre) ;
- aucune image doublée ni sautée pendant un mouvement. Les seules alertes tombent :
  - sur les coupes et les fondus les plus sombres ;
  - sur la toute fin du passage à la nuit, où les couleurs ne bougent plus que d'un niveau ;
  - sur les deux clics de la galerie, qui changent beaucoup de pixels d'un coup. C'est le comportement du site, filmé tel quel : un filtre retire les photos d'un coup puis fait monter les nouvelles en fondu, et la visionneuse s'ouvre directement, la photo passant de 40 à 100 % d'opacité.

## Fabrication

1. **Captures :** `npm run capture` filme le site avec Playwright (`capture/shots.mjs`, `capture/lib.mjs`). On peut filmer un seul plan : `node capture/shots.mjs d-build`.
   - L'horloge de la page est simulée : elle avance d'exactement 1/60 s entre deux images. Les animations du site (le passage à la nuit, l'entrée du titre, les étapes, la galerie) et Lenis tournent sur ce temps.
   - Les plans sont écrits en 2880 × 1800 (ordinateur) et 780 × 1688 (téléphone) dans `public/site/`, avec la trajectoire de la souris, redessinée nette par-dessus. Au téléphone, ce sont de vrais touchers d'écran.
   - Les clics et les touchers tombent sur des temps de la musique (`EVENTS` et `TIMING` dans `src/beats.ts`).
   - `node capture/shots.mjs --probe` rejoue les plans sans filmer et relève les repères (l'image où la page passe à la nuit, celle où chaque rangée d'étapes s'allume).
   - `node capture/old.mjs` filme une fois le site actuel en 2× (`public/old/home.jpg`).
2. **Musique :** `npm run music` la synthétise (`sound/music.mjs`), sans échantillon ni droit tiers : 100 BPM, fa majeur, guitare pincée (Karplus-Strong), nappe, piano électrique, basse ronde, batterie douce, maillets de verre et cloches.
   - Sur le site actuel puis le nouveau site de jour, elle reste étouffée ; une basse douce mène jusqu'au clic.
   - Au clic, l'accord de fa arrive avec trois cloches, une cascade de verre monte pendant que le site passe à la nuit et le filtre s'ouvre sur la même durée ; puis le groove arrive.
   - Les huit étapes ont chacune leur note, à l'image près (relevé du plan `d-build`).
   - La scène des projecteurs passe à moitié dans un filtre ; un motif de verre accompagne les avis.
   - Les gestes filmés sont soulignés d'un maillet ou d'une cloche, sur le temps. Pas de bruitages.
3. **Rendu :** `bash tools/render.sh` rend l'image par segments, les raccorde, mixe la musique (`sound/mix.mjs`) et assemble `out/presentation-ppw.mp4`.
   - Puis `npm run finalize` normalise le son à −14 LUFS.
   - Il crée aussi la version muette, et une version d'envoi de moins de 30 Mo (`out/`). Ici, la présentation fait déjà 22,6 Mo : la version d'envoi en est une simple copie, sans réencodage.

`node tools/stills.mjs <dossier> <image> …` sort des images fixes du montage pour vérifier une scène.

`python3 -I tools/motion.py …` mesure les mouvements sur des images du rendu :
- `col` et `row` : la position d'un bord au sous-pixel ;
- `track` : le suivi d'un morceau d'image ;
- `dup` : les images doublées ou sautées d'une vidéo.

`python3 -I tools/curves.py …` compare la mise de côté du navigateur et la montée des téléphones à leur courbe prévue (les formules du montage).
