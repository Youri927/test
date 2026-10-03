# Escape TV : vidéo de présentation du nouveau site (Remotion)

Vidéo de 78 s en français (1920×1080, 60 i/s) pour présenter la refonte du site à Escape TV. Elle compare ce que montre le site actuel avec le **vrai nouveau site** (`../escapetv-site/dist/index.html`), filmé image par image en 2× sur ordinateur et sur mobile, puis mis en scène dans un navigateur et des téléphones, avec des mouvements de caméra lents. Les transitions reprennent celles du site : un écran cathodique qui s'allume ou s'éteint, et de la neige quand on « zappe » d'une partie à l'autre.

| Fichier | Usage |
| --- | --- |
| `renders/presentation-escapetv-16x9.mp4` | présentation avec musique et bruitages (−14 LUFS) |
| `renders/presentation-escapetv-16x9-muet.mp4` | même vidéo sans son |

| Temps | Séquence |
| --- | --- |
| 0 – 5,3 s | Ouverture : la régie s'allume sur le labyrinthe ; « Vous êtes le programme. » |
| 5,3 – 14,7 s | Avant : les titres réels des pages du site actuel, tels que les affichent les moteurs de recherche ; « Nouvel Escape Game » se surligne. Deux constats tirés de l'analyse |
| 14,7 – 23,3 s | Après, la régie : l'écran du site s'allume, la régie change de caméra, la souris passe sur le bouton de réservation |
| 23,3 – 31,3 s | 01 Le pitch, dont les mots s'allument, puis la fiche du jeu en générique |
| 31,3 – 40 s | 02 Six genres : la page de magazine télé ; la souris passe d'une chaîne à l'autre |
| 40 – 49,3 s | 03 Le Minotaure en caméra thermique : il poursuit la souris, puis la rattrape |
| 49,3 – 56,7 s | 04 Votre film : les deux lecteurs, pause puis lecture |
| 56,7 – 64,7 s | 05 L'audience (4,8/5 sur 137 avis), la FAQ, la réservation |
| 64,7 – 72 s | Sur mobile : trois téléphones |
| 72 – 78 s | Fin |

La partie « Avant » n'invente aucune maquette de l'ancien site, bloqué depuis l'environnement de travail : elle montre les titres réels de ses pages (voir `../escapetv-site/ANALYSE.md`). Des captures d'écran du site actuel peuvent la remplacer ou la compléter.

Fabrication :

1. **Captures.** `npm run capture:site` filme le site avec Playwright (`capture/shots.mjs`). L'horloge de la page est simulée et avancée d'exactement 1/60 s entre deux images (labyrinthe, caméra thermique et lecteurs compris) ; les animations CSS sont recalées dessus. Les plans sont écrits en 2880×1800 (ordinateur) et 780×1688 (mobile) dans `public/site/`, avec la trajectoire de la souris (et du doigt sur mobile), redessinée nette par-dessus.
2. **Son.** `npm run sound` synthétise la musique originale (`sound/music.mjs`, 90 BPM, Ré mineur : une horloge, un cœur qui bat, une basse en croches) et les bruitages (`sound/sfx.mjs` : téléviseur qui s'allume et s'éteint, neige, clic, coups sourds) : aucun échantillon, aucun droit tiers. Les coupes du montage tombent sur les temps.
3. **Rendu.** `npm run build` rend la vidéo, normalise le son et crée la version muette.

Le labyrinthe de l'ouverture et de la fin est celui du site, avec le même algorithme et la même graine (`src/lib/maze.tsx`).

Dans Remotion Studio (`npm run studio`) : `Presentation-EscapeTV` (complète), `Presentation-EscapeTV-Bruitages` (sans musique) et `Presentation-EscapeTV-Muet`.

Après une modification du site, relancez `node build.mjs` dans `escapetv-site`, puis `npm run capture:site`.
