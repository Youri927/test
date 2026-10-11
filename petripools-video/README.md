# Petri Pools : vidéo de présentation du nouveau site (Remotion)

Vidéo de 58,8 s en anglais (1920 × 1080, 60 i/s), faite pour Petri Pools : elle leur présente leur nouveau site et leur parle directement (« your tile », « your reviews »).

On s'y promène sur le **vrai nouveau site** (`../petripools-site/dist/index.html`) :
- il est filmé image par image en 2×, sur ordinateur et sur téléphone (défilement, animations, glisser, clics) ;
- puis mis en scène dans un navigateur et des téléphones, avec des mouvements de caméra et une légende par partie.

L'ouverture reprend le geste du site, la ligne d'eau :
- on voit d'abord **leur site actuel**, posé sur un mur de céramique beige de 15 cm, comme leurs vieux spas ;
- puis l'eau monte sur toute l'image : le fond devient le bleu du bassin, et sous la ligne d'eau apparaît le nouveau site (« Before », « After ») ;
- le nouveau site se charge, et sa frise beige se recarrelle en mosaïque de verre sous la caméra.

| Fichier | Usage |
| --- | --- |
| `renders/presentation-petri-16x9.mp4` | présentation avec musique (−14 LUFS) |
| `renders/presentation-petri-16x9-muet.mp4` | même vidéo sans son |

| Temps | Séquence |
| --- | --- |
| 0 – 10,8 s | Leur site actuel, puis l'eau monte et découvre le nouveau. Le titre « Is your pool stuck in the ’80s? » monte, la frise se recarrelle carreau par carreau, un reflet passe ; légende « Your new website » avec le logotype |
| 10,8 – 18 s | L'avant/après : l'eau monte d'elle-même, puis la souris prend la ligne d'eau, la monte, la descend et la remonte ; « Before and after » |
| 18 – 22,8 s | « Tile, coping, finish, deck » : la photo suit le nom qu'on lit |
| 22,8 – 30 s | Le local technique : la souris choisit les pompes, l'automatisme, le chauffage ; le reste passe dans l'ombre ; « Every box on the pad » |
| 30 – 34,8 s | Le déroulé d'un chantier, avec les mots de leurs clients ; « In your customers’ words » |
| 34,8 – 42 s | « He saved us $500. », puis la carte des villes : Dallas, puis Carrollton ; « Reviews by town » |
| 42 – 49,2 s | L'entreprise, la salle d'exposition (« Open now »), le devis, puis « PETRI » qui se pose en mosaïque dans le pied de page ; « Open now? » |
| 49,2 – 55,2 s | Trois téléphones : la frise et l'avant/après, les boutons des villes, le menu ; « On a phone » |
| 55,2 – 58,8 s | Le logotype, « Built with your photos, your tile and your customers’ words. », la frise qui se pose sur la céramique beige ; fondu au noir |

**Rien d'inventé** :
- tout ce qui est à l'écran vient du nouveau site, écrit à partir de leurs pages, de leurs photos et de leurs avis, ou de leur site actuel (filmé tel quel) ;
- les légendes décrivent ce que fait le site ;
- le site est filmé un jeudi à 10 h, heure du Texas : la salle d'exposition affiche donc « Open now, until 5 PM Central Time ».

## Fabrication

1. **Captures** : `npm run capture` filme le site avec Playwright (`capture/shots.mjs`, `capture/lib.mjs`). On peut filmer un seul plan : `node capture/shots.mjs d-pad`.
   - L'horloge de la page est simulée : elle avance d'exactement 1/60 s entre deux images. La frise, la mosaïque du pied de page et Lenis tournent sur ce temps ; les animations CSS et natives (WAAPI) sont recalées dessus.
   - Les plans sont écrits en 2880 × 1800 (ordinateur) et 780 × 1688 (téléphone) dans `public/site/`, avec la trajectoire de la souris, redessinée nette par-dessus (sur téléphone, un vrai toucher d'écran).
   - Les gestes sont placés pour tomber sur des temps de la musique : clics, ligne d'eau, photos qui changent (`EVENTS` et `TIMING` dans `src/beats.ts`). `node capture/shots.mjs d-close --probe` relève sans filmer le début de la pose de « PETRI ».
   - `node capture/old.mjs` filme une fois le site actuel en 2× (`public/old/home.jpg`).
2. **Musique** : `npm run music` la synthétise (`sound/music.mjs`), sans échantillon ni droit tiers : 100 BPM, ré majeur, guitare pincée (Karplus-Strong), nappe, basse ronde, batterie douce et maillets de verre.
   - Sur l'ancien site, elle est étouffée ; quand l'eau monte, le filtre s'ouvre et une montée de verre arrive sur le temps où le nouveau site apparaît.
   - Chaque fois qu'une mosaïque se pose à l'image (la frise de l'accueil, « PETRI », la frise de la fin), une cascade de verre la suit, de gauche à droite dans le stéréo, comme la pose.
   - Les clics, la ligne d'eau et les photos qui changent sont soulignés d'un maillet, sur le temps. Pas de bruitages.
3. **Rendu** : `bash tools/render.sh` rend l'image par segments, les raccorde, mixe la musique (`sound/mix.mjs`) et assemble `out/presentation-petri.mp4`. Puis `npm run finalize` normalise le son à −14 LUFS et crée la version muette et une version légère de moins de 30 Mo pour l'envoi (`out/`).

`node tools/stills.mjs <dossier> <image> …` sort des images fixes du montage pour vérifier une scène.

Dans Remotion Studio (`npm run studio`), deux compositions : `Presentation-Petri` et `Presentation-Petri-Muet`.

Après une modification du site : `node build.mjs` dans `petripools-site`, puis `npm run capture`. Si un geste change de moment, revoir `TIMING` et `EVENTS` dans `src/beats.ts`.

`node_modules` est un lien vers celui de `../enhance-video` (mêmes versions de Remotion) ; sinon, `npm install`.

Police : Archivo (licence OFL), celle du site, avec sa licence dans `public/fonts/`.
