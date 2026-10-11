# We Clean Pools (D's Pool Care) : vidéo de présentation du nouveau site (Remotion)

Vidéo de 49,8 s en anglais (1920 × 1080, 60 i/s), faite pour D's Pool Care : elle leur présente leur nouveau site et leur parle directement (« your prices », « your remodels »).

On s'y promène sur le **vrai nouveau site** (`../wecleanpools-site/dist/index.html`) :
- il est filmé image par image en 2×, sur ordinateur et sur téléphone (défilement, clics, appui maintenu) ;
- puis mis en scène dans un navigateur et des téléphones, avec une légende par partie.

L'ouverture reprend le geste du site :
- on voit d'abord **leur site actuel** ;
- l'eau verte le recouvre ;
- le nouveau site apparaît sous cette eau, avec leur question, « Can you see the bottom of your pool? » ;
- l'eau s'éclaircit jusqu'aux lettres du fond du bassin : **WE CLEAN POOLS.**

| Fichier | Usage |
| --- | --- |
| `renders/presentation-wcp-16x9.mp4` | présentation avec musique (−14 LUFS) |
| `renders/presentation-wcp-16x9-muet.mp4` | même vidéo sans son |

| Temps | Séquence |
| --- | --- |
| 0 – 12 s | Leur site actuel (« Your website today »), puis l'eau verte le recouvre ; le nouveau site apparaît sous l'eau, avec sa question ; l'eau s'éclaircit jusqu'aux lettres du fond ; légende « Your new website » avec le logotype |
| 12 – 18 s | L'entretien : les coches se tracent et la tournée se remplit ; « Every visit, checked off » |
| 18 – 23,4 s | La liste des prix : la vidange s'ouvre sur ses photos avant/après ; « Your prices, in plain sight » |
| 23,4 – 30,6 s | Les rénovations : la souris choisit un chantier, puis maintient la photo (l'avant), la caméra s'approche ; « Hold to see the before » |
| 30,6 – 35,4 s | Dallas, sur le grand bain, et la licence vérifiable ; « A license anyone can check » |
| 35,4 – 40,2 s | Le devis, sur une eau limpide (« Open now ») ; « Free estimate, on clear water » |
| 40,2 – 46,2 s | Trois téléphones : l'eau qui s'éclaircit, les prix, l'appui maintenu sur une rénovation ; « On a phone » |
| 46,2 – 49,8 s | Le logotype, « Built with your question, your prices and your photos. », sur la lumière au fond de l'eau ; fondu au noir |

**Rien d'inventé :**
- tout ce qui est à l'écran vient du nouveau site, écrit à partir de leurs pages, de leurs photos et de leurs avis, ou de leur site actuel (filmé tel quel) ;
- les légendes décrivent ce que fait le site ;
- le site est filmé un jeudi à 10 h, heure du Texas : le devis affiche donc « Open now, until 5 PM Central Time ».

## Pas de saccades

Dans les vidéos précédentes, les fenêtres et les téléphones « sautillaient » un peu. Les causes, et ce qui est fait ici :

- **Plans rejoués plus vite** (1,25 ou 1,3 fois) : des images sautées à intervalles irréguliers.
  - Ici, chaque plan est lu à vitesse 1, image pour image.
- **Défilement au pixel entier** : Chrome arrondit le défilement, donc une vitesse comme 2,4 px par image donne des pas de 2 puis 3 px.
  - Ici, le site défile par pas entiers et réguliers (2 ou 5 px par image), avec des accélérations progressives (1, 1, 2, 2…).
- **Mouvements très lents** (un téléphone qui flotte, un zoom qui dérive) : l'image avance d'un pixel toutes les quelques images, par petits sauts.
  - Ici, rien ne dérive. Le navigateur est immobile pendant chaque plan.
  - Les seuls mouvements sont francs et courts : la mise de côté pour une légende, l'approche sur la photo maintenue, la montée des téléphones.
- **Caméra en 3D et flou de mouvement qui s'allume et s'éteint.**
  - Ici, la caméra est en 2D. Le monde est un seul calque composité (`will-change`), déplacé d'un bloc au sous-pixel près.
  - Il est dessiné en grand (navigateur de 1850 px) et seulement réduit : il reste net.
  - Il n'y a pas de flou de mouvement.
- **Fondus avec zoom** : ici, les passages par le noir ne jouent que sur l'opacité.

**Contrôlé sur le rendu** (`tools/motion.py`) :
- la mise de côté du navigateur suit la courbe prévue à 0,3 px près, sans arrondi au pixel ;
- les trois téléphones montent sur leur courbe à 0,5 px près, puis ne bougent plus ;
- dans la capture, le défilement avance de 4 px exactement à chaque image ;
- aucune image doublée ni sautée pendant un mouvement.

## Fabrication

1. **Captures :** `npm run capture` filme le site avec Playwright (`capture/shots.mjs`, `capture/lib.mjs`). On peut filmer un seul plan : `node capture/shots.mjs d-remodels`.
   - L'horloge de la page est simulée : elle avance d'exactement 1/60 s entre deux images. La lumière au fond de l'eau, les coches et Lenis tournent sur ce temps.
   - Les plans sont écrits en 2880 × 1800 (ordinateur) et 780 × 1688 (téléphone) dans `public/site/`, avec la trajectoire de la souris. Elle est redessinée nette par-dessus ; au téléphone, ce sont de vrais touchers d'écran, et un appui maintenu.
   - Les gestes tombent sur des temps de la musique : clics, appui maintenu (`EVENTS` et `TIMING` dans `src/beats.ts`).
   - `node capture/old.mjs` filme une fois le site actuel en 2× (`public/old/home.jpg`).
2. **Musique :** `npm run music` la synthétise (`sound/music.mjs`), sans échantillon ni droit tiers : 100 BPM, ré majeur, guitare pincée (Karplus-Strong), nappe, basse ronde, batterie douce et maillets de verre.
   - Sur le site actuel et l'eau verte, elle est étouffée, comme entendue sous l'eau.
   - Quand l'eau s'éclaircit, le filtre s'ouvre, des éclats de verre montent avec la lumière, et le groove arrive avec l'eau limpide.
   - La partie sur Dallas (le grand bain) passe à moitié dans un filtre.
   - Les gestes filmés sont soulignés d'un maillet, sur le temps. Pas de bruitages.
3. **Rendu :** `bash tools/render.sh` rend l'image par segments, les raccorde, mixe la musique (`sound/mix.mjs`) et assemble `out/presentation-wcp.mp4`.
   - Puis `npm run finalize` normalise le son à −14 LUFS.
   - Il crée aussi la version muette, et une version légère de moins de 30 Mo pour l'envoi (`out/`).

`node tools/stills.mjs <dossier> <image> …` sort des images fixes du montage pour vérifier une scène.

`python3 -I tools/motion.py …` mesure les mouvements sur des images du rendu :
- `col` et `row` : la position d'un bord au sous-pixel ;
- `track` : le suivi d'un morceau d'image ;
- `dup` : les images doublées ou sautées d'une vidéo.

`node_modules` est un lien vers celui de `../enhance-video` (mêmes versions de Remotion) ; sinon, `npm install`.

Police : Overpass (licence OFL), celle du site, avec sa licence dans `public/fonts/`. Textures de l'eau : celles du site (`public/tex/`).
