# Idoine Piscines : vidéo de présentation du nouveau site (Remotion)

Vidéo de 85 s (1920×1080, 60 i/s) pour présenter la refonte du site à Idoine Piscines. Elle compare ce que montre le site actuel avec le **vrai nouveau site** (`../idoine-piscines-site/dist/index.html`), filmé image par image sur ordinateur et sur mobile en 2×, puis mis en scène dans un navigateur et des téléphones, avec des mouvements de caméra lents.

| Fichier | Usage |
| --- | --- |
| `renders/presentation-idoine-16x9.mp4` | présentation avec musique et bruitages (−14 LUFS) |
| `renders/presentation-idoine-16x9-muet.mp4` | même vidéo sans son |

| Temps | Séquence |
| --- | --- |
| 0 – 5,3 s | Ouverture : l'eau monte et immerge « Le nouveau site. », comme la page d'accueil |
| 5,3 – 15 s | Avant : les titres des pages du site actuel, tels que les affichent les moteurs de recherche. Les mots répétés (pisciniste, haut de gamme, sur mesure, à Paris) se surlignent. Deux constats tirés de l'analyse |
| 15 – 23,3 s | Après, 01 La ligne d'eau : le titre se pose, l'eau monte, la souris fait naître des ondes ; zoom sur la surface |
| 23,3 – 39 s | 02 Paris, en coupe : on descend du toit à la cave, la caméra s'approche des dessins |
| 39 – 48,8 s | 03 Le bord de l'eau : débordement, goulotte, reprise classique, puis le fond mobile |
| 48,8 – 54,8 s | 04 Les références : la souris passe sur les palaces |
| 54,8 – 66 s | 05 Le métier : bien-être, bureau d'étude, depuis 1966 |
| 66 – 72,8 s | 06 Votre projet : trois questions, un e-mail prêt à envoyer |
| 72,8 – 79,5 s | Sur mobile : trois téléphones |
| 79,5 – 85,5 s | Fin |

La partie « Avant » n'invente aucune maquette de l'ancien site : elle montre les titres réels des pages (voir `../idoine-piscines-site/ANALYSE.md`). Des captures d'écran du site actuel peuvent la remplacer ou la compléter.

Fabrication :

1. `npm run capture:site` filme le site avec Playwright (`capture/shots.mjs`). L'horloge de la page est simulée et avancée d'exactement 1/60 s entre deux images ; les animations CSS sont recalées dessus. Les plans sont écrits en 2880×1800 (ordinateur) et 780×1688 (mobile) dans `public/site/`, avec la trajectoire de la souris, redessinée nette par-dessus.
2. `npm run sound` synthétise la musique originale (`sound/music.mjs`, 80 BPM, Ré majeur) et les bruitages d'eau (`sound/sfx.mjs`) : aucun échantillon, aucun droit tiers. Les coupes du montage tombent sur les temps.
3. `npm run build` rend la vidéo, normalise le son et crée la version muette.

Dans Remotion Studio (`npm run studio`) : `Presentation-Idoine` (complète), `Presentation-Idoine-Bruitages` (sans musique) et `Presentation-Idoine-Muet`.

Après une modification du site, relancez `node build.mjs` dans `idoine-piscines-site`, puis `npm run capture:site`.
