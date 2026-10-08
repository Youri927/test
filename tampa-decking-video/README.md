# Tampa Decking & Pools : vidéo de présentation du nouveau site (Remotion)

Vidéo de 105 s en anglais (1920 × 1080, 60 i/s) pour présenter la refonte du site à Tampa Decking & Pools.

**Le fil rouge : « From the deck to the deep end ».** La vidéo descend comme le nouveau site, de la plage jusqu'au fond du bassin.
- Elle montre d'abord le site actuel, puis le **vrai nouveau site** (`../tampa-decking-site/dist/index.html`).
- Le nouveau site est filmé image par image en 2×, sur ordinateur et sur téléphone, puis mis en scène dans un navigateur et des téléphones, avec des mouvements de caméra.
- D'une section à l'autre, la caméra plonge, et le fond s'assombrit comme celui du site : du blanc au bleu d'eau, puis au bleu nuit du grand bain.
- Elle finit sur la phrase du pied de page du site : « You have reached the deep end ».

| Fichier | Usage |
| --- | --- |
| `renders/presentation-tampa-16x9.mp4` | présentation avec musique et bruitages (−14 LUFS) |
| `renders/presentation-tampa-16x9-muet.mp4` | même vidéo sans son |

| Temps | Séquence |
| --- | --- |
| 0 – 6,6 s | Ce qu'ils font, en une phrase de leur site (« Pool resurfacing, tile, coping and new decks… ») ; à droite, une fenêtre descend de la plage jusqu'à l'enduit, sur quatre de leurs photos |
| 6,6 – 16,2 s | Today : la page d'accueil actuelle (vraie capture) et trois constats tirés de l'analyse. La caméra montre l'absence de menu, surligne le code brut affiché à la place du formulaire, puis descend jusqu'aux quatre vignettes de leurs bassins, en bas de page |
| 16,2 – 19,8 s | « One page, from the deck to the deep end » |
| 19,8 – 28,2 s | L'arrivée sur le nouveau site : le titre monte, la photo monte comme l'eau, survol du bouton de devis |
| 28,2 – 42,6 s | La coupe : le dessin se construit, puis chaque couche s'allume (plage, margelle, carrelage, enduit) et le panneau change de photo |
| 42,6 – 51,6 s | Le travail : les trois colonnes glissent, une photo s'ouvre dans la visionneuse, puis les deux suivantes |
| 51,6 – 58,2 s | Les surfaces : l'échantillon survolé s'ouvre |
| 58,2 – 63,6 s | Les prix : les barres s'allongent, les montants comptent |
| 63,6 – 71,4 s | La famille, sur le bleu nuit : le titre se révèle mot à mot, Mark Haskins et sa femme, les deux avis signés |
| 71,4 – 78 s | Les villes : « Bra », le site propose Brandon ; « Brandon » : oui |
| 78 – 88,2 s | Le devis : deux travaux, les coordonnées, le message, l'envoi, « Thanks, Maria. Your request is in. » |
| 88,2 – 96 s | Trois téléphones : l'arrivée, les couches au toucher, le menu puis le formulaire |
| 96 – 105 s | « You have reached the deep end », puis leur logo, leur téléphone et leurs bassins qui défilent |

**Transitions.**
- **La ligne d'eau** : entre les chapitres (site actuel, idée, nouveau site), la scène suivante monte par le bas derrière une ligne jaune, comme la photo d'ouverture du site monte à l'arrivée.
- **La plongée** : entre deux sections du nouveau site, la caméra descend, avec un flou de mouvement calculé sur sa vitesse ; le fond prend la couleur de la section suivante.
- Les légendes suivent la même idée : une plaque pleine qui monte avec sa ligne d'eau jaune, puis redescend.

**Rien d'inventé.**
- Les phrases viennent de leur site ou du nouveau site (titres, avis, prix, villes).
- La page « Today » est une capture complète du site actuel, faite le 8 octobre 2026 ; les constats viennent de `../tampa-decking-site/ANALYSE.md`.
- Les photos sont celles de leur médiathèque, avec les recadrages du site.
- Le formulaire est rempli avec un nom fictif et une adresse `example.com`.

**Un défaut du site trouvé en filmant, et corrigé** : dans la visionneuse, les grandes photos dépassaient de l'écran et cachaient leur légende sur ordinateur. Le site a été corrigé et revérifié (les 28 tests passent) avant de filmer ce plan.

## Fabrication

1. **Captures.**
   - `npm run capture:site` filme le nouveau site avec Playwright (`capture/shots.mjs`). On peut filmer un seul plan : `node capture/shots.mjs d-layers`.
   - L'horloge de la page est simulée : elle avance d'exactement 1/60 s entre deux images. GSAP tourne sur ce temps, les animations CSS sont recalées dessus, et Lenis et ScrollTrigger sont mis à jour à chaque défilement.
   - Rendu processeur (`--disable-gpu`) : l'émulateur graphique du conteneur laisse des bandes dupliquées sur les grands dessins SVG.
   - Les plans sont écrits en 2880 × 1800 (ordinateur) et 780 × 1688 (téléphone) dans `public/site/`, avec la trajectoire de la souris, redessinée nette par-dessus.
   - `npm run capture:before` capture le site actuel en entier, en 2× (`public/before/`), avec la position du code brut du formulaire.
   - `python3 tools/photos.py <dossier des photos d'origine>` exporte les photos de l'ouverture et de la fin (`public/img/`).
2. **Son.** `npm run sound` synthétise la musique (`sound/music.mjs`) et les bruitages (`sound/sfx.mjs`). Aucun échantillon, aucun droit tiers.
   - **Musique** : 100 BPM, ré majeur : piano électrique, basse ronde, batterie feutrée, marimba.
     - Une phrase de marimba qui descend (ré, la, fa dièse, ré) accompagne la fenêtre de l'ouverture ; les couches du site la reprennent, une note par couche.
     - Le site actuel passe en si mineur, sur une pulsation sourde ; la bascule monte sur la dominante.
     - Dans le grand bain (à partir de la famille), le son s'assombrit et la basse descend d'une octave ; la fin se pose sur ré majeur.
   - **Bruitages** : ligne d'eau qui monte, plongées (une plus profonde pour le grand bain), clics, frappe au clavier, surligneur, carillon du formulaire envoyé.
   - Tous les points de synchronisation sont dans `src/beats.ts` : les coupes, les couches et le surligneur tombent sur les temps de la musique. Les repères des bruitages sont partagés entre l'aperçu Remotion et le mixage (`src/cues.ts`).
3. **Rendu.**
   - Rendu par segments : `npx remotion render Presentation-Tampa-Muet out/seg.mp4 --frames=début-fin --muted`, puis raccord avec ffmpeg.
   - Bande-son : `npm run mix`. Un limiteur ne prend que les crêtes (grosse caisse, chocs des plongées) : la normalisation finale reste un simple gain, sans compression.
   - Finalisation : `npm run finalize` normalise le son à −14 LUFS (crête vraie sous −1,5 dB), crée la version muette et une version légère de moins de 30 Mo pour l'envoi (`out/`).
   - `node tools/stills.mjs <dossier> <image> …` sort des images fixes pour vérifier une scène.

Dans Remotion Studio (`npm run studio`), trois compositions : `Presentation-Tampa` (complète), `-Bruitages` (sans musique) et `-Muet`.

Après une modification du site : relancer `npm run build` dans `tampa-decking-site`, puis `npm run capture:site`.

`node_modules` est un lien vers celui de `../enhance-video` (mêmes versions de Remotion) ; sinon, `npm install`.

Police : Mona Sans, licence OFL (`public/fonts/`).
