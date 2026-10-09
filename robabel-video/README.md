# Custom Pools by Rob Abel : vidéo de présentation du nouveau site (Remotion)

Vidéo de 103,3 s en anglais (1920 × 1080, 60 i/s), faite pour Rob Abel et son équipe : elle leur présente leur nouveau site et leur parle directement (« your pool », « your pump room »).

**Le fil rouge : « Lights on ».** Le nouveau site s'ouvre sur leur photo au crépuscule, lumières éteintes, puis la maison, chaque palmier et la piscine s'allument. La vidéo reprend ce geste.
- L'ouverture rejoue l'allumage sur la photo en plein cadre, puis le nom arrive.
- Chaque scène s'allume sur un déclic d'interrupteur et s'éteint en partant, comme un projecteur de piscine.
- La fin éteint la piscine, les palmiers un à un, puis la maison.

Elle montre d'abord la galerie du site actuel, puis le **vrai nouveau site** (`../robabel-site/dist/index.html`).
- Le site est filmé image par image en 2×, sur ordinateur et sur téléphone, puis mis en scène dans un navigateur et des téléphones, avec des mouvements de caméra.
- **Les légendes** : un tuyau se remplit d'eau (le même que celui des étapes du site), puis le panneau se déplie dessous.
- Quand une légende parle d'une section entière, le navigateur se range contre un bord, entier, pour lui laisser la place : aucune légende ne cache le site.

| Fichier | Usage |
| --- | --- |
| `renders/presentation-robabel-16x9.mp4` | présentation avec musique et bruitages (−14 LUFS) |
| `renders/presentation-robabel-16x9-muet.mp4` | même vidéo sans son |

| Temps | Séquence |
| --- | --- |
| 0 – 7,3 s | Dans le noir, leur photo de l'accueil, lumières éteintes ; la maison, les six palmiers un à un, puis la piscine en violet ; « Custom Pools by Rob Abel », « Your new website » |
| 7,3 – 14 s | Today : la galerie du site actuel ; la caméra va lire les légendes, des noms de fichiers ; « Your gallery today » |
| 14 – 24 s | L'accueil : les lumières s'allument dans le navigateur ; la souris choisit l'aqua, le bleu, le blanc, et revient au violet, la couleur de la photo |
| 24 – 34,7 s | « One builder, from the first meeting to the first swim », puis la piscine aux motos : la boucle de leur film s'élargit jusqu'aux bords de l'écran, puis les trois photos |
| 34,7 – 40,7 s | Au bord de l'eau : l'après-midi, le crépuscule et la nuit ; les photos de nuit s'allument |
| 40,7 – 54,7 s | Le local technique : le circuit reste fixé pendant que l'eau le parcourt et chaque appareil s'allume avec sa photo ; schedule 40, schedule 80, puis le PVC transparent ; la pièce et leur citation |
| 54,7 – 61,3 s | Autour de l'eau : la photo change avec chaque aménagement de la liste |
| 61,3 – 69,3 s | Neuve ou existante : les cinq étapes de la piscine neuve, reliées par un tuyau qui se remplit ; on remonte à l'onglet « The pool you have », et les quatre étapes de la rénovation se remplissent à leur tour |
| 69,3 – 76 s | Chlore ou sel : cinq choix, le fléau penche vers le sel |
| 76 – 88 s | La carte, de Destin à 30A, puis le rendez-vous : le nom, le téléphone, la ville, le projet, l'envoi, le remerciement |
| 88 – 95,3 s | Trois téléphones : l'arrivée, le circuit du local technique, le menu |
| 95,3 – 103,3 s | La photo de l'accueil : la piscine, les palmiers puis la maison s'éteignent ; le nom, « Built with your photos, your film and your pages. » ; fondu |

**Rien d'inventé.**
- Les textes à l'écran sont ceux du nouveau site, écrit à partir de leurs pages (services, marques, adresse, téléphone) ; les légendes décrivent ce que fait le site.
- La galerie « Today » est une capture complète du site actuel, faite le 9 octobre 2026 (`capture/before.mjs`), bandeau de cookies retiré. Ses cinq photos viennent d'une banque d'images ; quatre ont leur nom de fichier pour légende.
- Les couleurs de lumière autres que le violet sont simulées sur la même photo, et le site le dit.
- La carte est tracée d'après les données du recensement des États-Unis (U.S. Census Bureau), comme sur le site.
- La demande de rendez-vous est un essai : un nom fictif et un numéro en 555.

## Fabrication

1. **Captures.**
   - `npm run capture:site` filme le nouveau site avec Playwright (`capture/shots.mjs`). On peut filmer un seul plan : `node capture/shots.mjs d-pump`.
   - L'horloge de la page est simulée : elle avance d'exactement 1/60 s entre deux images. GSAP tourne sur ce temps, les animations CSS sont recalées dessus, et Lenis et ScrollTrigger sont mis à jour à chaque défilement. La date simulée est le jeudi 8 octobre 2026 à 10 h, heure de Fort Walton Beach (fuseau Centre).
   - Les vidéos du site (la boucle des fontaines) suivent la même horloge : leur lecture est recalée à chaque image. Chromium sans tête ne lit pas le H.264 : il prend la version WebM (VP9) de la boucle, que le site propose en repli.
   - La ville est choisie directement dans la liste, sans clic : le menu natif ne s'affiche pas dans une capture, et l'ouvrir bloque la prise de vue.
   - Les plans sont écrits en 2880 × 1800 (ordinateur) et 780 × 1688 (téléphone) dans `public/site/`, avec la trajectoire de la souris, redessinée nette par-dessus (sur téléphone, un vrai toucher d'écran), et les valeurs relevées à chaque image (appareils allumés, étapes atteintes, demande envoyée) qui placent les bruitages.
   - `npm run capture:before` capture la galerie du site actuel en 2× (`public/before/`), avec la position exacte de ses légendes (mesurée sur le texte lui-même).
   - La photo de l'accueil et ses calques de lumière (maison, six palmiers, piscine) sont ceux du site (`public/hero/`) : l'ouverture et la fin les allument et les éteignent comme la page.
2. **Son.** `npm run sound` synthétise la musique (`sound/music.mjs`) et les bruitages (`sound/sfx.mjs`). Aucun échantillon, aucun droit tiers.
   - **Musique** : 90 BPM, mi bémol majeur : nappe, piano électrique (synthèse FM), vibraphone, basse ronde, grosse caisse douce, rimshot et shaker.
     - L'ouverture : une nappe dans le noir, une note grave quand la maison s'allume, et l'accord s'ouvre quand la piscine s'allume.
     - Le site actuel passe en do mineur, sans batterie.
     - Les scènes sombres du site (local technique, chlore ou sel, rendez-vous) : le groove passe dans un filtre qui se referme à moitié.
     - La fin se pose sur mi bémol, avec des cloches, pendant que les lumières s'éteignent.
   - **Bruitages** : peu de sons, courts et nets, mixés très bas sous la musique, sans aucun souffle ni glissé : un déclic d'interrupteur à l'allumage de chaque scène, une note de vibraphone par palmier qui s'allume, par appareil que l'eau atteint et par étape (en mi bémol pentatonique), les clics, la frappe au clavier et le carillon de la demande envoyée.
   - Tous les points de synchronisation sont dans `src/beats.ts` : les coupes tombent sur les temps de la musique. Les repères des bruitages sont partagés entre l'aperçu Remotion et le mixage (`src/cues.ts`).
3. **Rendu.**
   - `bash tools/render.sh` : rendu muet par segments (`out/seg/`), raccord avec ffmpeg, bande-son mixée à part (`npm run mix`), puis assemblage dans `out/presentation-robabel.mp4`.
   - Finalisation : `npm run finalize` normalise le son à −14 LUFS (crête vraie sous −1,5 dB), crée la version muette et une version légère de moins de 30 Mo pour l'envoi (`out/`).
   - GitHub refuse les fichiers de plus de 100 Mo : si le rendu dépasse 94 Mo, la finalisation réencode l'image en H.264 en deux passes pour tenir dessous (la version légère repart du rendu d'origine).
   - `node tools/stills.mjs <dossier> <image> …` sort des images fixes pour vérifier une scène.

Dans Remotion Studio (`npm run studio`), trois compositions : `Presentation-RobAbel` (complète), `-Bruitages` (sans musique) et `-Muet`.

Après une modification du site : relancer `npm run build` dans `robabel-site`, puis `npm run capture:site`.

`node_modules` est un lien vers celui de `../enhance-video` (mêmes versions de Remotion) ; sinon, `npm install`.

Polices : Sofia Sans et Sofia Sans Extra Condensed, licence OFL (`public/fonts/`).
