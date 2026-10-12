# Mad River Pools : vidéo de présentation du nouveau site (Remotion)

Vidéo de 48 s en anglais (1920 × 1080, 60 i/s), faite pour Mad River Pool Construction. Elle leur présente leur nouveau site et leur parle directement (« your shapes », « your pools »).

On s'y promène sur le **vrai nouveau site** (`../madriverpools-site/dist/index.html`) :
- il est filmé image par image en 2×, sur ordinateur et sur téléphone (défilement, clics, touchers) ;
- puis mis en scène dans un navigateur et des téléphones, avec une légende par partie.

L'ouverture reprend le geste du site :
1. on voit d'abord **leur site actuel** ;
2. il s'efface en fondu sur le nouveau site, filmé dès sa première image ;
3. le slogan s'élargit, un trait dessine le bassin et le spa ;
4. l'eau monte dans le bassin : leur photo se dévoile, puis le spa arrive.

| Fichier | Usage |
| --- | --- |
| `renders/presentation-mrp-16x9.mp4` | présentation avec musique (−14 LUFS), 21,8 Mo |
| `renders/presentation-mrp-16x9-muet.mp4` | même vidéo sans son, 20,6 Mo |

| Temps | Séquence |
| --- | --- |
| 0 – 10,8 s | Leur site actuel (« Your website today »), puis l'ouverture du nouveau : le trait, l'eau qui monte, le spa ; légende « Your new website » avec le logotype |
| 10,8 – 16,8 s | Trois façons de construire, puis le graphique « From dig to deck » qui se trace ; « Three pools, side by side » |
| 16,8 – 22,8 s | Les formes à l'échelle : trois formes choisies, la photo du vrai bassin change ; « Your shapes, drawn to scale » |
| 22,8 – 27,6 s | « One call covers the whole project », les neuf éléments se surlignent ; « One call for the whole project » |
| 27,6 – 33,6 s | La rénovation : l'onglet du béton, l'après qui se dévoile, puis le projet 2 ; « Renovation, by problem » |
| 33,6 – 38,4 s | La visite gratuite, sur leur piscine éclairée la nuit (« Open now ») ; « A free home visit » |
| 38,4 – 44,4 s | Trois téléphones : l'ouverture, les formes (la photo reste en haut), l'avant et l'après en pleine largeur ; « On a phone » |
| 44,4 – 48 s | Le trait dessine le logotype, « Built from your shapes, your timelines and your photos. », à la nuit ; fondu au noir |

**Rien d'inventé :**
- Tout ce qui est à l'écran vient :
  - du nouveau site, écrit à partir de leurs pages et de leurs photos ;
  - ou de leur site actuel, filmé tel quel.
- Une exception, expliquée : le Chromium de test ne lit pas leur vidéo d'accueil (H.264) et affiche « Media error », ce qu'un visiteur ne voit pas dans Chrome ou Safari. La vidéo est donc remplacée par une image tirée de cette même vidéo (`capture/old.mjs`).
- Les légendes décrivent ce que fait le site.
- Le site est filmé un jeudi à 10 h, heure de Maitland : la visite affiche donc « Open now ».

## Pas de saccades

Mêmes règles que pour les vidéos précédentes :
- **Chaque plan est lu à vitesse 1**, image pour image : aucune image sautée ni doublée.
- **Le site défile par pas entiers et réguliers** (3 ou 4 px par image), avec des accélérations progressives : Chrome arrondit le défilement au pixel.
- **Rien ne dérive.** Le navigateur est immobile pendant chaque plan. Les seuls mouvements sont francs et courts : la mise de côté pour la légende de l'ouverture, la montée des téléphones.
- **Caméra en 2D**, sans flou de mouvement : le monde est un seul calque composité, dessiné en grand (navigateur de 1850 px) et seulement réduit.
- **Les passages par le noir** ne jouent que sur l'opacité.

**Contrôlé sur le rendu** (`tools/motion.py`) :
- la mise de côté du navigateur suit la courbe prévue à 0,45 px près (0,17 px en moyenne), sans arrondi au pixel ;
- les trois téléphones montent sur leur courbe à 0,31 px près (0,07 px en moyenne), puis ne bougent plus ;
- dans les captures, le défilement avance par pas réguliers (écart de 0,02 px au plus d'une image à l'autre) ;
- aucune image doublée ni sautée pendant un mouvement : les seules alertes tombent sur les coupes, les clics et les fondus les plus sombres ;
- le slogan s'élargissait par petits sauts dans le site lui-même. C'est corrigé dans le site (`font-variation-settings` et `text-rendering: geometricPrecision`, voir `../madriverpools-site/REVUE.md`), puis l'ouverture a été refilmée.

## Fabrication

1. **Captures :** `npm run capture` filme le site avec Playwright (`capture/shots.mjs`, `capture/lib.mjs`). On peut filmer un seul plan : `node capture/shots.mjs d-shapes`.
   - L'horloge de la page est simulée : elle avance d'exactement 1/60 s entre deux images. Le tracé, le remplissage, l'élargissement du slogan et Lenis tournent sur ce temps.
   - Les plans sont écrits en 2880 × 1800 (ordinateur) et 780 × 1688 (téléphone) dans `public/site/`, avec la trajectoire de la souris, redessinée nette par-dessus. Au téléphone, ce sont de vrais touchers d'écran.
   - Les clics et les touchers tombent sur des temps de la musique (`EVENTS` et `TIMING` dans `src/beats.ts`).
   - `node capture/old.mjs <image.jpg>` filme une fois le site actuel en 2× (`public/old/home.jpg`), avec une image de leur vidéo d'accueil.
2. **Musique :** `npm run music` la synthétise (`sound/music.mjs`), sans échantillon ni droit tiers : 100 BPM, ré majeur, guitare pincée (Karplus-Strong), nappe, basse ronde, batterie douce et maillets de verre.
   - Sur le site actuel, elle est étouffée.
   - Quand l'eau monte dans le bassin, le filtre s'ouvre, des éclats de verre montent avec elle, puis le groove arrive.
   - La visite à la nuit passe à moitié dans un filtre.
   - Les gestes filmés sont soulignés d'un maillet, sur le temps. Pas de bruitages.
3. **Rendu :** `bash tools/render.sh` rend l'image par segments, les raccorde, mixe la musique (`sound/mix.mjs`) et assemble `out/presentation-mrp.mp4`.
   - Puis `npm run finalize` normalise le son à −14 LUFS.
   - Il crée aussi la version muette, et une version légère de moins de 30 Mo pour l'envoi (`out/`).

`node tools/stills.mjs <dossier> <image> …` sort des images fixes du montage pour vérifier une scène.

`python3 -I tools/motion.py …` mesure les mouvements sur des images du rendu :
- `col` et `row` : la position d'un bord au sous-pixel ;
- `track` : le suivi d'un morceau d'image ;
- `dup` : les images doublées ou sautées d'une vidéo.
