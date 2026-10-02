# Enhance® Medical Center : vidéo de présentation du nouveau site (Remotion)

Vidéo de 86 s en anglais (1920×1080, 60 i/s) pour présenter la refonte du site au cabinet du Dr Charles S. Lee. Elle compare ce que montre le site actuel avec le **vrai nouveau site** (`../enhance-site/dist/index.html`), filmé image par image en 2× sur ordinateur et sur mobile, puis mis en scène dans un navigateur et des téléphones, avec des mouvements de caméra lents.

| Fichier | Usage |
| --- | --- |
| `renders/presentation-enhance-16x9.mp4` | présentation avec musique et bruitages (−14 LUFS) |
| `renders/presentation-enhance-16x9-muet.mp4` | même vidéo sans son |

| Temps | Séquence |
| --- | --- |
| 0 – 5,3 s | Opening : « The face, layer by layer. » ; le visage se dessine puis se sépare en cinq calques, comme sur le site |
| 5,3 – 15 s | Before : les titres réels des pages du site actuel, tels que les affichent les moteurs de recherche. « Beverly Hills » et « West Hollywood » se surlignent. Deux constats tirés de l'analyse |
| 15 – 23,3 s | After, l'accueil : le titre, le visage annoté, le survol des couches ; zoom sur l'index |
| 23,3 – 39,8 s | 01 Five layers : le visage s'éclate, on descend de la peau à l'os, une case est cochée |
| 39,8 – 49,5 s | 02 Signature procedures : les dessins se tracent au fil du défilement |
| 49,5 – 58,5 s | 03 Dr. Charles S. Lee : le nom, la carte des certifications, le parcours qui se remplit |
| 58,5 – 66 s | 04 Before & after : survol des galeries, puis la note et les avis |
| 66 – 73,5 s | 05 Consultation : les soins cochés, le nom et le téléphone, le message qui se rédige |
| 73,5 – 80,3 s | Mobile : trois téléphones |
| 80,3 – 86,3 s | End |

La partie « Before » n'invente aucune maquette de l'ancien site : elle montre les titres réels de ses pages (voir `../enhance-site/ANALYSE.md`). Des captures d'écran du site actuel peuvent la remplacer ou la compléter.

Fabrication :

1. **Captures.** `npm run capture:site` filme le site avec Playwright (`capture/shots.mjs`). L'horloge de la page est simulée et avancée d'exactement 1/60 s entre deux images ; les animations CSS sont recalées dessus. Les plans sont écrits en 2880×1800 (ordinateur) et 780×1688 (mobile) dans `public/site/`, avec la trajectoire de la souris, redessinée nette par-dessus.
2. **Son.** `npm run sound` synthétise la musique originale (`sound/music.mjs`, 80 BPM) et les bruitages (`sound/sfx.mjs`) : aucun échantillon, aucun droit tiers.
3. **Rendu.** `npm run build` rend la vidéo, normalise le son et crée la version muette.

Les dessins du visage viennent du site lui-même (`src/lib/art.js`, copie de `../enhance-site/src/art.js`).

Dans Remotion Studio (`npm run studio`) : `Presentation-Enhance` (complète), `Presentation-Enhance-Bruitages` (sans musique) et `Presentation-Enhance-Muet`.
