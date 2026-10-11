# Coastal Creations Pools and Lagoons : vidéo de présentation du nouveau site (Remotion)

Vidéo de 52,7 s en anglais (1920 × 1080, 60 i/s), faite pour Coastal Creations : elle leur présente leur nouveau site et leur parle directement (« your work », « your prices »).

On s'y promène sur le **vrai nouveau site** (`../coastalcreations-site/dist/index.html`) :
- il est filmé image par image en 2×, sur ordinateur et sur téléphone (défilement, animations, clics) ;
- puis mis en scène dans un navigateur et des téléphones, avec des mouvements de caméra et une légende par partie.

| Fichier | Usage |
| --- | --- |
| `renders/presentation-coastal-16x9.mp4` | présentation avec musique (−14 LUFS) |
| `renders/presentation-coastal-16x9-muet.mp4` | même vidéo sans son |

| Temps | Séquence |
| --- | --- |
| 0 – 4 s | Leur photo de Bradenton en plein cadre ; leur logo monte, puis « Your new website » |
| 4 – 10 s | L'arrivée sur le site : la photo se pose, le titre monte, le devis arrive ; puis on descend ; « Your work, first » |
| 10 – 16 s | La phrase s'allume mot à mot, les chiffres comptent, puis les quatre cartes s'empilent ; « What you do » |
| 16 – 22,7 s | La construction : l'écran tient, les sept étapes passent avec leurs photos ; « Eleven steps » |
| 22,7 – 28 s | « Before. After. » glissent en sens contraire, l'après de Holmes Beach s'ouvre, l'avant dérive |
| 28 – 32,7 s | Le nuancier : la souris choisit Caribbean Blue Mini, French Gray, Tahoe Blue ; « Pick a water color » |
| 32,7 – 38,7 s | Les tarifs de détection de fuites comptent jusqu'à leur valeur ; le calcul (spa, deux jeux d'eau, une buse : 570 $) en gros plan ; « Readable prices » |
| 38,7 – 42,7 s | Le contact sur le corail : le titre, le numéro, les trois façons de les joindre |
| 42,7 – 48,7 s | Trois téléphones : l'arrivée, les cartes au pouce, le menu ; « On a phone » |
| 48,7 – 52,7 s | La photo, le logo, « Built with your photos, your prices and your pages. » ; fondu au noir |

**Rien d'inventé** : tout ce qui est à l'écran vient du nouveau site, écrit à partir de leurs pages ; les légendes décrivent ce que fait le site. Le calcul de la détection de fuites est un exemple fait avec leurs propres tarifs.

## Fabrication

1. **Captures** : `npm run capture` filme le site avec Playwright (`capture/shots.mjs`, `capture/lib.mjs`). On peut filmer un seul plan : `node capture/shots.mjs d-leaks`.
   - L'horloge de la page est simulée : elle avance d'exactement 1/60 s entre deux images. GSAP tourne sur ce temps, les animations CSS sont recalées dessus, et Lenis et ScrollTrigger sont mis à jour à chaque défilement.
   - Les plans sont écrits en 2880 × 1800 (ordinateur) et 780 × 1688 (téléphone) dans `public/site/`, avec la trajectoire de la souris, redessinée nette par-dessus (sur téléphone, un vrai toucher d'écran).
   - Les trois groupes de plans peuvent tourner en parallèle : `d-hero d-cards d-build`, `d-reno d-finish d-leaks d-contact` et `mobile`.
   - `npm run capture:stills` refait les images fixes de la première version (`public/stills/`).
2. **Musique** : `npm run music` la synthétise (`sound/music.mjs`), sans échantillon ni droit tiers : 90 BPM, mi bémol majeur, piano électrique, vibraphone, basse ronde, batterie douce. Les accords changent sur les coupes ; dans les scènes sombres (la construction, le nuancier), le groove passe dans un filtre qui se referme à moitié. Pas de bruitages.
3. **Rendu** : `bash tools/render.sh` rend l'image par segments, les raccorde, mixe la musique (`sound/mix.mjs`) et assemble `out/presentation-coastal.mp4`. Puis `npm run finalize` normalise le son à −14 LUFS et crée la version muette et une version légère de moins de 30 Mo pour l'envoi (`out/`).

`node tools/stills.mjs <dossier> <image> …` sort des images fixes du montage pour vérifier une scène.

Dans Remotion Studio (`npm run studio`), deux compositions : `Presentation-Coastal` et `Presentation-Coastal-Muet`.

Après une modification du site : `node build.mjs` dans `coastalcreations-site`, puis `npm run capture`.

`node_modules` est un lien vers celui de `../enhance-video` (mêmes versions de Remotion) ; sinon, `npm install`.

Polices : Unbounded et Figtree, licence OFL (`public/fonts/`).
