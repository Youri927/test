# WAVE Pool Remodeling : vidéo de présentation du nouveau site (Remotion)

Vidéo de 92 s en anglais (1920 × 1080, 60 i/s) pour présenter la refonte du site à WAVE Pool Remodeling Scottsdale AZ.

Le fil rouge est la concurrence : les clients comparent plusieurs entreprises, et le meilleur site emporte l'appel. La vidéo montre d'abord le problème, puis le **vrai nouveau site** (`../pool-remodeling-site/dist/index.html`) :
- filmé image par image en 2×, sur ordinateur et sur mobile ;
- mis en scène dans un navigateur et des téléphones, avec des mouvements de caméra.

| Fichier | Usage |
| --- | --- |
| `renders/presentation-wave-16x9.mp4` | présentation avec musique et bruitages (−14 LUFS) |
| `renders/presentation-wave-16x9-muet.mp4` | même vidéo sans son |

| Temps | Séquence |
| --- | --- |
| 0 – 6 s | « They’re comparing you. » : une recherche « pool remodeling scottsdale » et des résultats qui se ressemblent |
| 6 – 14,25 s | « Same template. Same stock photos. Same “CALL NOW”. » : huit sites gabarits dessinés, la page actuelle de WAVE au milieu, qui s'y fond. « Which one gets the call? » |
| 14,25 – 21,75 s | « Today, WAVE blends in. » : la page actuelle défile (vraie capture) ; trois constats tirés de l'analyse |
| 21,75 – 25,5 s | « In a crowded market, the best website wins the call. » Le sable du midi monte comme un soleil |
| 25,5 – 34,5 s | First impression : l'arche monte, puis s'ouvre en plein écran |
| 34,5 – 40,5 s | Trust : le texte s'allume, licensed / bonded / insured, 20+ ans |
| 40,5 – 48 s | Services : « Where’s your pool today? », les trois cas |
| 48 – 55,5 s | Prices : les prix de départ publiés par WAVE, l'échelle se remplit |
| 55,5 – 63 s | Work : les photos montent comme une vague |
| 63 – 71,25 s | Local : les températures NOAA de Scottsdale, puis la carte des villes |
| 71,25 – 79,5 s | Contact : « Open now », le formulaire rempli, le remerciement |
| 79,5 – 85,5 s | Mobile : trois téléphones |
| 85,5 – 92,25 s | « Don’t blend in. Stand out. », puis le logo, et la photo dans l'arche |

**Transitions.** Les chapitres changent par l'arche du logo : un dôme qui monte et couvre l'écran, avec un liseré vert citron. Entre les sections du site, la caméra file d'un plan à l'autre, avec un flou de mouvement calculé sur sa vitesse.

**Rien d'inventé.**
- Les huit sites de la grille sont des gabarits dessinés : aucun concurrent réel n'est montré ni nommé. La vidéo l'indique en bas de l'écran.
- La page « Today » est une capture complète du site actuel, et les constats viennent de `../pool-remodeling-site/ANALYSE.md`.

## Fabrication

1. **Captures.** `npm run capture:site` filme le site avec Playwright (`capture/shots.mjs`).
   - L'horloge de la page est simulée (mardi 6 octobre 2026, 10 h, heure de l'Arizona, pour que le site affiche « Open now ») et avancée d'exactement 1/60 s entre deux images ; les animations CSS sont recalées dessus.
   - Les plans sont écrits en 2880 × 1800 (ordinateur) et 780 × 1688 (mobile) dans `public/site/`, avec la trajectoire de la souris, redessinée nette par-dessus.
   - On peut filmer un seul plan : `node capture/shots.mjs d-hero`.
2. **Son.** `npm run sound` synthétise la musique originale (`sound/music.mjs`, 80 BPM, La majeur) et les bruitages (`sound/sfx.mjs`). Aucun échantillon, aucun droit tiers.
   - Pendant la concurrence et le constat, l'harmonie passe en mineur et un battement sourd monte.
   - La bascule se fait sur la dominante ; l'accord final tombe sur le logo.
3. **Rendu.**
   - Rendu par segments : `npx remotion render Presentation-WAVE out/seg.mp4 --frames=début-fin --muted`.
   - Raccord des segments avec ffmpeg.
   - Bande-son : `npm run mix`.
   - Finalisation : `node sound/finalize.mjs` normalise le son et crée la version muette.

Dans Remotion Studio (`npm run studio`), trois compositions : `Presentation-WAVE` (complète), `-Bruitages` (sans musique) et `-Muet`.

Après une modification du site : relancer `node build.mjs` dans `pool-remodeling-site`, puis `npm run capture:site`.

`node_modules` est un lien vers celui de `../enhance-video` (mêmes versions de Remotion) ; sinon, `npm install`.
