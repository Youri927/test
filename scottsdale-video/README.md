# Scottsdale Pool Patio & Landscape : vidéo de présentation du nouveau site (Remotion)

Vidéo de 100 s en anglais (1920 × 1080, 60 i/s) pour présenter la refonte du site à Scottsdale Pool Patio & Landscape Design. Elle montre la page d'accueil actuelle, puis le **vrai nouveau site** (`../scottsdale-pool-site/dist/index.html`), filmé image par image en 2× sur ordinateur et sur mobile, mis en scène dans un navigateur et des téléphones, avec des mouvements de caméra.

| Fichier | Usage |
| --- | --- |
| `renders/presentation-scottsdale-16x9.mp4` | présentation avec musique et bruitages (−14 LUFS) |
| `renders/presentation-scottsdale-16x9-muet.mp4` | même vidéo sans son |

| Temps | Séquence |
| --- | --- |
| 0 – 6 s | Ouverture : « A new website for life outside. » La photo se lève dans un cercle à côté du titre, qui s'éclaire là où il le traverse, puis le cercle s'ouvre en grand, comme sur le site |
| 6 – 15 s | Before : la page d'accueil actuelle défile dans un navigateur (vraie capture) ; trois constats tirés de l'analyse |
| 15 – 24,75 s | The new site : le soleil se lève sur le titre, puis s'ouvre au défilement |
| 24,75 – 32,25 s | 01 Three trades : les volets photo se découvrent et s'ouvrent au survol |
| 32,25 – 40,5 s | 02 All 25 services : l'index, la photo de chaque élément suit la souris |
| 40,5 – 51 s | 03 Pool designs : les plans se tracent, on en choisit trois autres |
| 51 – 60,75 s | 04 Work : la galerie horizontale, la pastille « View », la visionneuse |
| 60,75 – 69 s | 05 Process : les étapes s'allument, la frise des délais |
| 69 – 75,75 s | 06 Reviews : la note de 5,0, les étoiles, deux avis de plus |
| 75,75 – 86,25 s | 07 Free quote : le formulaire en trois étapes, jusqu'au remerciement |
| 86,25 – 93 s | Mobile : trois téléphones |
| 93 – 99,75 s | Fin : le grand mot du pied de page se remplit, puis le nom et le soleil |

Entre les sections, la caméra file d'un plan à l'autre (flou de mouvement calculé sur sa vitesse). Les changements de chapitre se font par un store de sable bordé de terre cuite.

La partie « Before » n'invente rien : c'est une capture complète de la page d'accueil actuelle, et les constats viennent de `../scottsdale-pool-site/ANALYSE.md`.

Fabrication :

1. **Captures.** `npm run capture:site` filme le site avec Playwright (`capture/shots.mjs`). L'horloge de la page est simulée et avancée d'exactement 1/60 s entre deux images ; les animations CSS sont recalées dessus. Les plans sont écrits en 2880 × 1800 (ordinateur) et 780 × 1688 (mobile) dans `public/site/`, avec la trajectoire de la souris, redessinée nette par-dessus. Les plans peuvent être filmés en parallèle : `node capture/shots.mjs d-hero d-disc`, etc.
2. **Son.** `npm run sound` synthétise la musique originale (`sound/music.mjs`, 80 BPM, La majeur) et les bruitages (`sound/sfx.mjs` : souffle, clic, filé) : aucun échantillon, aucun droit tiers. Les clics des plans filmés sont replacés automatiquement sur la ligne de temps (`src/PresSound.tsx`).
3. **Rendu.** `npm run build` rend la vidéo, normalise le son et crée la version muette. Pour retoucher une seule scène sans tout refaire : `npx remotion render Presentation-Scottsdale out/seg.mp4 --frames=début-fin --muted`, raccord dans la vidéo avec ffmpeg, puis `npm run mix` pour la bande-son (même placement des bruitages que `src/PresSound.tsx`) et `node sound/finalize.mjs`.

Dans Remotion Studio (`npm run studio`) : `Presentation-Scottsdale` (complète), `Presentation-Scottsdale-Bruitages` (sans musique) et `Presentation-Scottsdale-Muet`.

Après une modification du site, relancez `node build.mjs` dans `scottsdale-pool-site`, puis `npm run capture:site`.

`node_modules` est un lien vers celui de `../enhance-video` (mêmes versions de Remotion) ; sinon, `npm install`.
