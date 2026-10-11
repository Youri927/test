# Heritage Pools Texas : vidéo de présentation du nouveau site (Remotion)

Vidéo de 57,3 s en anglais (1920 × 1080, 60 i/s), faite pour Heritage Pools Texas : elle leur présente leur nouveau site et leur parle directement (« your builds », « your photos »).

On s'y promène sur le **vrai nouveau site** (`../heritagepools-site/dist/index.html`) :
- il est filmé image par image en 2×, sur ordinateur et sur téléphone (défilement, animations, glisser, clics) ;
- puis mis en scène dans un navigateur et des téléphones, avec des mouvements de caméra et une légende par partie.

Pendant l'ouverture du site et la règle des jours, **tout l'écran prend la couleur du chantier**, comme la page : gazon, terre, béton projeté, pierre, enduit, eau, puis nuit.

| Fichier | Usage |
| --- | --- |
| `renders/presentation-heritage-16x9.mp4` | présentation avec musique (−14 LUFS) |
| `renders/presentation-heritage-16x9-muet.mp4` | même vidéo sans son |

| Temps | Séquence |
| --- | --- |
| 0 – 3,3 s | Leur piscine de nuit, qui s'allume ; leur logotype monte, puis « Your new website » |
| 3,3 – 16,7 s | L'ouverture du site en entier : « Lawn to lights in 41 days. », puis on descend et les 41 jours passent dans leurs photos ; le compteur tourne, l'eau monte, la nuit tombe et la piscine s'allume ; « Lawn to lights » |
| 16,7 – 22 s | La règle des jours : la souris la ramène du jour 41 au jour 8, puis clique sur le jour 30 ; « Drag the timeline » |
| 22 – 27,3 s | Leurs six services en très grand, qui arrivent en glissant ; « What you do » |
| 27,3 – 33,3 s | La galerie, de 2018 à 2022 : l'année tourne comme un compteur ; « Every job, by date » |
| 33,3 – 38,7 s | « After dark » : la grande photo s'allume, puis la souris choisit le rouge ; « After dark » |
| 38,7 – 42,7 s | « Trust, integrity and honesty are what we stand for. » s'allume mot à mot |
| 42,7 – 48 s | Le contact : le numéro, les horaires avec « Open now », le formulaire ; puis le grand « Heritage » du pied de page ; « Open now? » |
| 48 – 54 s | Trois téléphones : l'ouverture du chantier, les services, le menu ; « On a phone » |
| 54 – 57,3 s | La piscine, le logotype, « Built with your photos, your dates and your words. » ; fondu au noir |

**Rien d'inventé** : tout ce qui est à l'écran vient du nouveau site, écrit à partir de leurs pages et de leurs photos ; les légendes décrivent ce que fait le site. Le site est filmé un jeudi à 10 h, heure du Texas : le contact affiche donc « Open now, until 4 PM Central Time ».

## Fabrication

1. **Captures** : `npm run capture` filme le site avec Playwright (`capture/shots.mjs`, `capture/lib.mjs`). On peut filmer un seul plan : `node capture/shots.mjs d-night`.
   - L'horloge de la page est simulée : elle avance d'exactement 1/60 s entre deux images. GSAP tourne sur ce temps, les animations CSS sont recalées dessus, et Lenis et ScrollTrigger sont mis à jour à chaque défilement.
   - Les plans sont écrits en 2880 × 1800 (ordinateur) et 780 × 1688 (téléphone) dans `public/site/`, avec la trajectoire de la souris, redessinée nette par-dessus (sur téléphone, un vrai toucher d'écran).
   - Les trois groupes de plans peuvent tourner en parallèle : `d-open d-ruler`, `d-services d-pools d-night` et `d-values d-contact mobile`.
   - `node tools/tones.mjs d-open d-ruler` relève ensuite la couleur de la page image par image (`public/site/*.tones.json`) : le fond de ces deux scènes la suit.
2. **Musique** : `npm run music` la synthétise (`sound/music.mjs`), sans échantillon ni droit tiers : 90 BPM, fa majeur, piano électrique, vibraphone, basse ronde, batterie douce.
   - Les accords changent sur les coupes ; pendant l'ouverture du site, le motif du vibraphone monte puis retombe, et deux cloches douces sonnent quand la piscine s'allume.
   - Dans la scène de nuit, le groove passe dans un filtre qui se referme à moitié. Pas de bruitages.
3. **Rendu** : `bash tools/render.sh` rend l'image par segments, les raccorde, mixe la musique (`sound/mix.mjs`) et assemble `out/presentation-heritage.mp4`. Puis `npm run finalize` normalise le son à −14 LUFS et crée la version muette et une version légère de moins de 30 Mo pour l'envoi (`out/`).

`node tools/stills.mjs <dossier> <image> …` sort des images fixes du montage pour vérifier une scène.

Dans Remotion Studio (`npm run studio`), deux compositions : `Presentation-Heritage` et `Presentation-Heritage-Muet`.

Après une modification du site : `node build.mjs` dans `heritagepools-site`, puis `npm run capture` et `node tools/tones.mjs d-open d-ruler`. Si l'ouverture change de rythme, revoir aussi `BUILD` (l'eau, les lumières) dans `src/beats.ts`.

`node_modules` est un lien vers celui de `../enhance-video` (mêmes versions de Remotion) ; sinon, `npm install`.

Polices : Ultra (licence Apache 2.0) et Libre Franklin (licence OFL), avec leurs licences dans `public/fonts/`.
