# Frontline Pools : vidéo de présentation du nouveau site (Remotion)

Vidéo de 100 s en anglais (1920 × 1080, 60 i/s) pour présenter la refonte du site à Frontline Pools.

Le fil rouge part de la phrase d'un de leurs clients, Vincent : « You hear horror stories about pool contractors all the time… ». Avant de laisser une équipe entrer dans leur jardin, les gens cherchent des preuves : le travail, et qui le fait. La vidéo montre d'abord le site actuel, puis le **vrai nouveau site** (`../frontline-pools-site/dist/index.html`) :
- filmé image par image en 2×, sur ordinateur et sur mobile ;
- mis en scène dans un navigateur et des téléphones, avec des mouvements de caméra.

Elle finit sur la suite de la phrase de Vincent : « …but this is one team who won’t disappoint!! ».

| Fichier | Usage |
| --- | --- |
| `renders/presentation-frontline-16x9.mp4` | présentation avec musique et bruitages (−14 LUFS) |
| `renders/presentation-frontline-16x9-muet.mp4` | même vidéo sans son |

| Temps | Séquence |
| --- | --- |
| 0 – 6 s | « You hear horror stories about pool contractors all the time. » (Vincent, Citrus Park) ; trois de leurs piscines se posent à côté |
| 6 – 14 s | Today : la page d'accueil actuelle défile (vraie capture) ; trois constats tirés de l'analyse |
| 14 – 17,3 s | « Keep the shell, renew the rest » |
| 17,3 – 25,3 s | First impression : la photo d'accueil se pose en mosaïque, le titre monte, survol du bouton |
| 25,3 – 37,3 s | What we rebuild : la visite guidée, chapitre par chapitre, jusqu'au local technique |
| 37,3 – 45,3 s | Recent work : les quatre fiches de chantier s'empilent |
| 45,3 – 53,3 s | Equipment : l'« après » monte derrière la ligne d'eau, puis les marques |
| 53,3 – 61,3 s | Reviews : « 19/33 », les extraits, les avis avec les prénoms surlignés |
| 61,3 – 69,3 s | License, puis Financing : la licence en compteur, puis les chiffres de Lyon Financial |
| 69,3 – 76,7 s | Service area : la carte de la baie ; trois secteurs, puis Hudson sur la carte |
| 76,7 – 86 s | Free estimate : trois travaux cochés, le formulaire rempli, le remerciement |
| 86 – 92,7 s | Trois téléphones : l'accueil en mosaïque, la visite guidée, le menu |
| 92,7 – 100 s | « …but this is one team who won’t disappoint!! », puis le nom, six de leurs piscines et le contact |

**Transitions.** Les chapitres changent par des carreaux qui se posent en diagonale puis se retirent, comme la mosaïque d'ouverture du site. Entre les sections du site, la caméra file d'un plan à l'autre, avec un flou de mouvement calculé sur sa vitesse.

**Rien d'inventé.**
- Les phrases de Vincent sont tirées de son avis publié sur leur site, mot pour mot.
- La page « Today » est une capture complète du site actuel ; les constats viennent de `../frontline-pools-site/ANALYSE.md`.
- Le formulaire est rempli avec un nom et une adresse fictifs (`example.com`, « Example Ave »).

## Fabrication

1. **Captures.** `npm run capture:site` filme le site avec Playwright (`capture/shots.mjs`).
   - L'horloge de la page est simulée (mardi 6 octobre 2026, 10 h, heure de Tampa, pour que le site affiche « Open now »).
   - Elle avance d'exactement 1/60 s entre deux images ; les animations CSS sont recalées dessus.
   - Le hasard de la page est reproductible : la mosaïque se pose toujours dans le même ordre.
   - Les plans sont écrits en 2880 × 1800 (ordinateur) et 780 × 1688 (mobile) dans `public/site/`, avec la trajectoire de la souris, redessinée nette par-dessus.
   - On peut filmer un seul plan : `node capture/shots.mjs d-tour`.
2. **Son.** `npm run sound` synthétise la musique originale (`sound/music.mjs`) et les bruitages (`sound/sfx.mjs`). Aucun échantillon, aucun droit tiers.
   - **Musique** : 90 BPM, La majeur.
     - Pendant le constat, l'harmonie passe en mineur et un battement sourd monte.
     - La bascule se fait sur la dominante.
     - Une cascade de notes accompagne la mosaïque de l'accueil, et l'accord final tombe sur le nom.
   - **Bruitages** : les carreaux sont une pluie de petits clics de céramique qui traverse l'image de gauche à droite ; s'y ajoutent les filés de caméra, les clics et la frappe au clavier.
   - Les repères des bruitages sont partagés entre l'aperçu Remotion et le mixage (`src/cues.ts`).
3. **Rendu.**
   - Rendu par segments : `npx remotion render Presentation-Frontline-Muet out/seg.mp4 --frames=début-fin --muted`.
   - Raccord des segments avec ffmpeg.
   - Bande-son : `npm run mix`.
   - Finalisation : `node sound/finalize.mjs` normalise le son à −14 LUFS et crée la version muette.

Dans Remotion Studio (`npm run studio`), trois compositions : `Presentation-Frontline` (complète), `-Bruitages` (sans musique) et `-Muet`.

Après une modification du site : relancer `node build.mjs` dans `frontline-pools-site`, puis `npm run capture:site`.

`node_modules` est un lien vers celui de `../enhance-video` (mêmes versions de Remotion) ; sinon, `npm install`.

Police : Archivo, licence OFL (`public/fonts/`).
