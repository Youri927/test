# Scottsdale Pool Resurfacing : vidéo de présentation du nouveau site (Remotion)

Vidéo de 95 s en anglais (1920 × 1080, 60 i/s) pour présenter la refonte du site à Scottsdale Pool Resurfacing.

Elle montre d'abord la page d'accueil actuelle. Elle montre ensuite le **vrai nouveau site** (`../pool-resurfacing-site/dist/index.html`) :
- filmé image par image en 2×, sur ordinateur et sur mobile ;
- mis en scène dans un navigateur et des téléphones, avec des mouvements de caméra.

| Fichier | Usage |
| --- | --- |
| `renders/presentation-pool-resurfacing-16x9.mp4` | présentation avec musique et bruitages (−14 LUFS) |
| `renders/presentation-pool-resurfacing-16x9-muet.mp4` | même vidéo sans son |

| Temps | Séquence |
| --- | --- |
| 0 – 6 s | Ouverture : « Love your pool again. » Le titre monte ; à côté, la passe de lisseuse efface l'ancien fond du bassin |
| 6 – 15 s | Before : la page d'accueil actuelle défile (vraie capture) ; trois constats tirés de l'analyse |
| 15 – 24,75 s | The new site : l'accueil, la passe de lisseuse, puis la souris fait glisser la comparaison avant/après |
| 24,75 – 33 s | 01 Signs : trois signes cochés, ils s'allument dans la coupe technique |
| 33 – 42 s | 02 Finishes : trois finitions s'ouvrent en cercle sous l'eau |
| 42 – 49,5 s | 03 Services : les cartes s'empilent |
| 49,5 – 58,5 s | 04 Process : vidange, sablage, nouvelle finition, remplissage |
| 58,5 – 65,25 s | 05 Reviews : « Excellent », la citation, le mur d'avis |
| 65,25 – 72 s | 06 L'offre, puis une question de la FAQ |
| 72 – 81,75 s | 07 Contact : le formulaire rempli, puis le remerciement |
| 81,75 – 88,5 s | Mobile : trois téléphones |
| 88,5 – 95,25 s | Fin : le grand numéro du pied de page, puis le nom et le bassin qui finit neuf |

**Transitions.** Entre les sections, la caméra file d'un plan à l'autre, avec un flou de mouvement calculé sur sa vitesse. Les changements de chapitre se font par une montée d'eau, avec une ligne d'eau qui ondule.

**La partie « Before ».** Elle n'invente rien : c'est une capture complète de la page d'accueil actuelle, et les constats viennent de `../pool-resurfacing-site/ANALYSE.md`.

## Fabrication

1. **Captures.** `npm run capture:site` filme le site avec Playwright (`capture/shots.mjs`).
   - L'horloge de la page est simulée et avancée d'exactement 1/60 s entre deux images ; les animations CSS sont recalées dessus.
   - Les plans sont écrits en 2880 × 1800 (ordinateur) et 780 × 1688 (mobile) dans `public/site/`, avec la trajectoire de la souris, redessinée nette par-dessus.
   - Sur mobile, le doigt glisse vraiment sur la comparaison (événements tactiles).
   - On peut filmer un seul plan : `node capture/shots.mjs d-hero`.
2. **Son.** `npm run sound` synthétise la musique originale (`sound/music.mjs`, 80 BPM, La majeur) et les bruitages (`sound/sfx.mjs`). Aucun échantillon, aucun droit tiers.
3. **Rendu.**
   - Rendu par segments : `npx remotion render Presentation-PoolResurfacing out/seg.mp4 --frames=début-fin --muted`.
   - Raccord des segments avec ffmpeg.
   - Bande-son : `npm run mix`, avec les bruitages placés comme dans `src/PresSound.tsx`.
   - Finalisation : `node sound/finalize.mjs` normalise le son et crée la version muette.

Dans Remotion Studio (`npm run studio`), trois compositions : `Presentation-PoolResurfacing` (complète), `-Bruitages` (sans musique) et `-Muet`.

Après une modification du site : relancer `node build.mjs` dans `pool-resurfacing-site`, puis `npm run capture:site`.

`node_modules` est un lien vers celui de `../enhance-video` (mêmes versions de Remotion) ; sinon, `npm install`.
