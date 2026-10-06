# Cameron Dental Studio : vidéo de présentation du nouveau site (Remotion)

Vidéo de 85 s en anglais (1920 × 1080, 60 i/s) pour présenter la refonte du site à Cameron Dental Studio.

Le fil rouge : avant de prendre rendez-vous, les patients cherchent en ligne, et leur meilleure preuve, ce sont les sourires des patients. La vidéo montre d'abord le site actuel, puis le **vrai nouveau site** (`../cameron-dental-site/dist/index.html`) :
- filmé image par image en 2×, sur ordinateur et sur mobile ;
- mis en scène dans un navigateur et des téléphones, avec des mouvements de caméra.

| Fichier | Usage |
| --- | --- |
| `renders/presentation-cameron-16x9.mp4` | présentation avec musique et bruitages (−14 LUFS) |
| `renders/presentation-cameron-16x9-muet.mp4` | même vidéo sans son |

| Temps | Séquence |
| --- | --- |
| 0 – 6 s | « Before they book, they look you up. » : une recherche « dentist naples fl » et des résultats schématiques |
| 6 – 13,5 s | « Today, the proof is hidden. » : la page actuelle défile (vraie capture) ; trois constats tirés de l'analyse |
| 13,5 – 17,25 s | « Your best proof? Your patients’ smiles. » |
| 17,25 – 24,75 s | First impression : le site s'ouvre, les douze visages arrivent « avant » puis basculent en vague sur « après » |
| 24,75 – 33 s | Before & after : l'interrupteur bascule tout le mur, un cas s'ouvre, on passe au suivant |
| 33 – 40,5 s | Feature case : la section se fige, le balayage révèle le nouveau sourire de Donald |
| 40,5 – 46,5 s | The artist : le bandeau des soins, puis la Dr. Cameron |
| 46,5 – 54,75 s | Treatments, puis Comfort : l'accordéon s'ouvre, le témoignage de Dawn s'allume mot à mot |
| 54,75 – 62,25 s | The team, puis Reviews : la photo d'équipe s'élargit, la page bleue des avis arrive |
| 62,25 – 72 s | Insurance, puis Booking : « Delta » est accepté ; le formulaire est rempli, le remerciement s'affiche |
| 72 – 78 s | Trois téléphones : l'accueil, le balayage, le menu |
| 78 – 84,75 s | « Show the smiles. », puis le logo, un mur de sourires, « Every smile is a work of art. » |

**Transitions.** Les chapitres changent par la ligne avant / après du site : un trait blanc et sa poignée « ‹ › » balaient l'écran de gauche à droite. Entre les sections du site, la caméra file d'un plan à l'autre, avec un flou de mouvement calculé sur sa vitesse.

**Rien d'inventé.**
- Les résultats de recherche sont schématiques : aucun cabinet réel n'est montré ni nommé.
- La page « Today » est une capture complète du site actuel ; les constats viennent de `../cameron-dental-site/ANALYSE.md`.
- Le formulaire est rempli avec un nom et une adresse fictifs (`example.com`).

## Fabrication

1. **Captures.** `npm run capture:site` filme le site avec Playwright (`capture/shots.mjs`).
   - L'horloge de la page est simulée (mardi 6 octobre 2026, 10 h, heure de Naples, pour que le site affiche « Open now ») et avancée d'exactement 1/60 s entre deux images ; les animations CSS sont recalées dessus.
   - Le hasard de la page est reproductible : les « coups d'œil » du mur tombent toujours sur les mêmes visages.
   - Les plans sont écrits en 2880 × 1800 (ordinateur) et 780 × 1688 (mobile) dans `public/site/`, avec la trajectoire de la souris, redessinée nette par-dessus.
   - On peut filmer un seul plan : `node capture/shots.mjs d-hero`.
2. **Son.** `npm run sound` synthétise la musique originale (`sound/music.mjs`, 80 BPM, Ré majeur) et les bruitages (`sound/sfx.mjs`). Aucun échantillon, aucun droit tiers.
   - Pendant le constat, l'harmonie passe en mineur et un battement sourd monte.
   - La bascule se fait sur la dominante.
   - Une petite cascade de notes accompagne la vague des visages, et l'accord final tombe sur le logo.
3. **Rendu.**
   - Rendu par segments : `npx remotion render Presentation-Cameron out/seg.mp4 --frames=début-fin --muted`.
   - Raccord des segments avec ffmpeg.
   - Bande-son : `npm run mix`.
   - Finalisation : `node sound/finalize.mjs` normalise le son et crée la version muette.

Dans Remotion Studio (`npm run studio`), trois compositions : `Presentation-Cameron` (complète), `-Bruitages` (sans musique) et `-Muet`.

Après une modification du site : relancer `node build.mjs` dans `cameron-dental-site`, puis `npm run capture:site`.

`node_modules` est un lien vers celui de `../enhance-video` (mêmes versions de Remotion) ; sinon, `npm install`.

Polices : Bricolage Grotesque et Hanken Grotesk, licence OFL (`public/fonts/`).
