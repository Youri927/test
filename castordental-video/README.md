# Castor Dental Associates : vidéo de présentation du nouveau site (Remotion)

Vidéo de 52 s en anglais (1920 × 1080, 60 i/s), faite pour Castor Dental Associates. Elle leur présente leur nouveau site et leur parle directement (« your sign », « your patients »).

On s'y promène sur le **vrai nouveau site** (`../castordental-site/dist/index.html`) :
- il est filmé image par image en 2×, sur ordinateur et sur téléphone (défilement, clics, survols, touchers) ;
- puis mis en scène dans un navigateur et des téléphones, avec une légende par partie.

L'ouverture est celle du site, filmée dès sa première image :
1. leur enseigne, composée en vraies lettres, seule sur le blanc ;
2. la caméra du site recule, la photo du 785 Central Avenue apparaît autour des lettres ;
3. l'enseigne se pose sur la vraie, sur un temps de la musique ;
4. la page descend de 60 px pour montrer la façade entière et sa légende, puis le navigateur se range de côté pour la légende de la vidéo.

**Pourquoi la vidéo ne commence pas sur leur site actuel :** castordentalassociates.com affiche une page de vérification Cloudflare aux navigateurs automatisés. On ne la contourne pas : la vidéo s'ouvre directement sur le nouveau site.

| Fichier | Usage |
| --- | --- |
| `renders/presentation-cda-16x9.mp4` | présentation avec musique (−14 LUFS), 23,6 Mo |
| `renders/presentation-cda-16x9-muet.mp4` | même vidéo sans son, 22,3 Mo |

| Temps | Séquence |
| --- | --- |
| 0 – 10,7 s | L'ouverture : l'enseigne en vraies lettres sur le blanc, la photo qui apparaît, l'enseigne qui se pose sur la vraie ; légende « Your new website » avec le logotype |
| 10,7 – 17,3 s | L'orthodontie cachée : la page descend jusqu'au cas, dont les trois étapes s'allument une à une ; « The wire behind the teeth » |
| 17,3 – 24 s | Les soins : « Crowns and bridges » s'ouvre, puis la souris passe sur « crown » et « bridge » et leur définition s'affiche ; « Every word explained » |
| 24 – 30,7 s | L'équipe, devant la haie : Denise, puis Amanda, et leur biographie ; « The people patients will see » |
| 30,7 – 36 s | Les cinq engagements et leurs avis défilent ; « What your patients notice » |
| 36 – 41,3 s | La visite : l'enseigne recomposée en bardage, la porte, la demande ; « Something hurts » renvoie au téléphone ; « From the sign to the door » |
| 41,3 – 48 s | Trois téléphones : l'ouverture sur la façade en 4:3, l'équipe qui glisse, la barre d'appel qui monte et la définition de « lingual » au toucher ; « On a phone » |
| 48 – 52 s | Leur enseigne recomposée sur le bardage blanc, « Built from your sign, your team and your patients’ own words. » ; fondu au noir |

**Rien d'inventé :**
- Tout ce qui est à l'écran vient du nouveau site, écrit à partir de leurs pages et de leurs photos.
- Les légendes décrivent ce que fait le site, avec ses chiffres : les trois étapes du cas (avant, en cours, cinq mois), les définitions citées de leur dictionnaire dentaire, huit portraits devant la même haie, cinq engagements chacun avec un vrai avis (prénoms seuls), « Something hurts » qui renvoie au téléphone.
- « One of your patients » : le site présente le cas comme celui d'un patient du cabinet.
- La fin recompose l'enseigne de leur porche, mot pour mot : 785, Castor Dental Associates, 239-300-4635, JOSEPH A CASTOR DMD (relevée sur la photo de la façade, `../castordental-site/data/sign.json`).

## Pas de saccades

Mêmes règles que pour les vidéos précédentes :
- **Chaque plan est lu à vitesse 1**, image pour image : aucune image sautée ni doublée.
- **Le site défile par pas entiers et réguliers** (2 ou 3 px par image sur ordinateur, 2 à 6 au téléphone), avec des accélérations progressives : Chrome arrondit le défilement au pixel. La bande des visages du téléphone glisse de même ; son aimantation est coupée pendant la capture seulement.
- **Rien ne dérive.** Le navigateur est immobile pendant chaque plan. Les seuls mouvements sont francs et courts : la mise de côté pour la légende de l'ouverture, la montée des téléphones.
- **Caméra en 2D**, sans flou de mouvement : le monde est un seul calque composité, dessiné en grand (navigateur de 1850 px) et seulement réduit.
- **Les passages par le noir** ne jouent que sur l'opacité, en courbe douce : la dernière image d'une scène et la première de la suivante sont noires, et la lumière ne fait aucune marche d'une image à l'autre.
- **L'ouverture est celle du site**, filmée sur l'horloge simulée (2,4 s). Les animations sont tenues en pause et placées image par image : la fin de l'ouverture, qui retire normalement ses animations, ne se déclenche donc pas, mais leur dernier état reste en place (identique à l'œil).
- **Au téléphone, la page est filmée en 390 × 797** (l'écran moins la barre d'état) : rien n'est coupé en bas, la barre d'appel reste entière.

**Contrôlé sur le rendu** (`tools/motion.py` et `tools/curves.py`) :
- la mise de côté du navigateur suit la courbe prévue à 0,40 px près sur son bord gauche (0,16 px en moyenne) et à 0,50 px près sur son bord haut (0,13 px en moyenne), sans arrondi au pixel ;
- les trois téléphones montent sur leur courbe à 0,27 px près (0,07 px en moyenne au plus), puis ne bougent plus (0,17 px d'écart au plus) ;
- dans les captures, le défilement avance par pas entiers et réguliers (1, 2 puis 3 px par image, identiques d'une image à l'autre) ;
- les fondus par le noir changent la luminosité moyenne de 27 niveaux au plus d'une image à l'autre (sur 255), sans saut ;
- aucune image doublée ni sautée pendant un mouvement. Les seules alertes tombent :
  - sur les coupes, où deux images noires se suivent, et sur les images presque noires des fondus ;
  - au début et à la fin d'un défilement, ou juste à la fin d'un fondu (une image immobile à côté d'une image qui bouge) ;
  - sur les gestes qui changent beaucoup de pixels d'un coup, comme sur le site : une définition qui s'affiche ou se retire, le mot « lingual » touché au téléphone.
- Le son de la présentation mesure −14,0 LUFS.

## Fabrication

1. **Captures :** `npm run capture` filme le site avec Playwright (`capture/shots.mjs`, `capture/lib.mjs`). On peut filmer un seul plan : `node capture/shots.mjs d-care`.
   - L'horloge de la page est simulée : elle avance d'exactement 1/60 s entre deux images. Les animations du site (l'ouverture, la ligne du temps du cas, les soins qui s'ouvrent, les biographies, la barre d'appel) et Lenis tournent sur ce temps.
   - Les plans sont écrits en 2880 × 1800 (ordinateur) et 780 × 1594 (téléphone) dans `public/site/`, avec la trajectoire de la souris, redessinée nette par-dessus. Au téléphone, ce sont de vrais touchers d'écran.
   - Les clics et les touchers tombent sur des temps de la musique (`EVENTS` et `TIMING` dans `src/beats.ts`).
   - `node capture/shots.mjs --probe` rejoue les plans sans filmer et relève les repères (l'image où chaque étape du cas s'allume, où une définition s'affiche, où la barre d'appel monte).
2. **Musique :** `npm run music` la synthétise (`sound/music.mjs`), sans échantillon ni droit tiers : 90 BPM, ré majeur, piano électrique à contretemps, guitare pincée (Karplus-Strong), nappe, basse ronde à la brésilienne, batterie douce (cross-stick, balai, shaker), maillets de verre et cloches.
   - Sur l'enseigne seule, un accord de piano, tout est feutré ; quand la photo apparaît, une montée de verre et le filtre s'ouvre ; quand l'enseigne se pose, l'accord de ré s'épanouit avec trois cloches. Le groove entre avec la légende.
   - Les trois étapes du cas ont chacune leur note, à l'image près (relevé du plan `d-straight`).
   - Chaque geste filmé (le soin qui s'ouvre, chaque définition, chaque visage, « Something hurts », la barre d'appel, le mot touché) est souligné d'un maillet ou d'une cloche, à l'image près. Pas de bruitages.
   - La scène de l'équipe, devant la haie, passe à moitié dans un filtre ; un motif de verre accompagne les avis.
3. **Rendu :** `bash tools/render.sh` rend l'image par segments, les raccorde, mixe la musique (`sound/mix.mjs`) et assemble `out/presentation-cda.mp4`.
   - Puis `npm run finalize` normalise le son à −14 LUFS.
   - Il crée aussi la version muette, et une version d'envoi de moins de 30 Mo (`out/`).

`node tools/stills.mjs <dossier> <image> …` sort des images fixes du montage pour vérifier une scène.

`python3 -I tools/motion.py …` mesure les mouvements sur des images du rendu :
- `col` et `row` : la position d'un bord au sous-pixel ;
- `track` : le suivi d'un morceau d'image ;
- `dup` : les images doublées ou sautées d'une vidéo.

`python3 -I tools/curves.py …` compare la mise de côté du navigateur et la montée des téléphones à leur courbe prévue (les formules du montage).

Police : Commissioner (licence OFL, `public/fonts/OFL-Commissioner.txt`), la même que le site ; comme sur le site, les petites capitales de l'enseigne sont dessinées par Chrome à partir des capitales.
