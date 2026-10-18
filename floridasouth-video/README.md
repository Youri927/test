# Florida South Construction : vidéo de présentation du nouveau site (Remotion)

Vidéo de 67,2 s en anglais (1920 × 1080, 60 i/s), faite pour Florida South Construction (Naples, Floride). Elle leur
présente leur nouveau site et leur parle directement (« your own words », « your two reviews », « the email to you »).

On s'y promène sur le **vrai nouveau site** (`../floridasouth-site/dist/index.html`) :
- il est filmé image par image en 2×, sur ordinateur et sur téléphone (défilement, clics, la liste tapée ligne par
  ligne, le pouce qui ouvre le menu et qui fait glisser une photo) ;
- puis mis en scène dans un navigateur et des téléphones, avec une légende par partie, aux couleurs et aux polices du
  site (Gloock pour les titres, Albert Sans pour le texte ; le ciel de leurs photos, le blanc, le stuc, l'encre).

L'ouverture est celle du site, filmée dès sa première image : « Give us your list. » et les cinq lignes, du trou à
reboucher à la maison à construire ; elles se barrent l'une après l'autre, puis « Consider it done. » s'écrit. Les
traits tombent sur des croches de la musique, la phrase sur le premier temps de la mesure, quand le groupe entre. Le
navigateur se range ensuite de côté pour la légende de la vidéo.

Les légendes bougent comme le site : le panneau blanc se découvre de gauche à droite, comme le trait qui barre une
ligne de la liste ; le titre s'écrit ensuite dans le même sens, comme « Consider it done. ».

| Fichier | Usage |
| --- | --- |
| `renders/presentation-floridasouth-16x9.mp4` | présentation avec musique (−14 LUFS) |
| `renders/presentation-floridasouth-16x9-muet.mp4` | même vidéo sans son |
| `out/presentation-floridasouth-16x9-envoi.mp4` | version d'envoi, moins de 30 Mo (refaite par `npm run finalize`, non versionnée) |

| Temps | Séquence |
| --- | --- |
| 0 – 9,6 s | L'ouverture : la liste sur le ciel, ses cinq lignes qui se barrent, « Consider it done. » qui s'écrit ; légende « Your new website » avec le logo |
| 9,6 – 18,1 s | Ce qu'ils font : la page arrive sur « No job is too small. » ; les trois rangées passent et chaque cadre s'ouvre à la mesure du chantier, l'étrier un peu, l'ossature davantage, la maison jusqu'aux bords de l'écran ; « Sized to the job » |
| 18,1 – 26,7 s | Les deux maisons : la mosaïque de la maison sur pilotis ; un clic sur la photo des débords blancs, qui grandit depuis sa vignette dans la visionneuse ; « Next photo » : le panneau du chantier, « Another Quality Home » ; « Close » : la photo retourne à sa place ; « Two houses you built » |
| 26,7 – 35,2 s | Judson : son portrait, sa phrase, la photo avec l'équipe, les trois engagements, puis la carte de la licence de l'État (CGC1515532) ; « Judson, and the license » |
| 35,2 – 41,6 s | Les avis : l'avis de Carol F. se lit mot à mot, du gris à l'encre, au fil du défilement ; « Read word by word » |
| 41,6 – 52,3 s | La demande : un clic dans « Your list », trois lignes s'écrivent ; « Email my list » : la demande est prête et la page l'amène à l'écran ; « Send us your list » |
| 52,3 – 60,8 s | Trois téléphones, des gestes qui se suivent : la liste qui se barre ; le menu (le ciel, les liens en grand), « What we do » et la page qui descend ; une photo touchée, qui grandit, puis glissée vers la suivante ; « On a phone » |
| 60,8 – 67,2 s | Sur le ciel : l'emblème, « Give us your list. », « Consider it done. » qui s'écrit, l'adresse du site ; fondu au noir |

**Rien d'inventé :**
- Tout ce qui est à l'écran vient du nouveau site, écrit à partir de leur site actuel et du registre des licences de
  l'État de Floride.
- Les légendes décrivent ce que fait le site : la liste de l'accueil, les trois rangées (réparation, rénovation,
  construction neuve), les quinze photos des deux maisons, la licence avec son numéro, son titulaire et ses dates, les
  deux avis cités mot pour mot.
- Les photos sont les leurs, telles que le site les montre.
- Le nom, le quartier, le téléphone, qui les a recommandés et la liste de la demande filmée (« Pat Morgan », « Golden
  Gate », (239) 555-0142, « A neighbor » ; « Fix the screen door. », « Paint the guest room. », « Price a new
  kitchen. », les exemples du site) sont des exemples de démonstration ; le numéro est dans la tranche 555-01xx,
  réservée aux exemples. Rien n'est envoyé.

## Pas de saccades

Mêmes règles que pour les vidéos précédentes :
- **Chaque plan est lu à vitesse 1**, image pour image : aucune image sautée ni doublée.
- **Le site défile par pas entiers et réguliers** (2 à 5 px par image), avec des accélérations progressives : Chrome
  arrondit le défilement au pixel.
- **Rien ne dérive.** Le navigateur est immobile pendant chaque plan. Les seuls mouvements sont francs et courts : la
  mise de côté pour la légende de l'ouverture, la montée des téléphones.
- **Caméra en 2D**, sans flou de mouvement : le monde est un seul calque composité, dessiné en grand (navigateur de
  1850 px) et seulement réduit.
- **Les passages par le noir** ne jouent que sur l'opacité, en courbe douce : la dernière image d'une scène et la
  première de la suivante sont noires.
- **L'ouverture, les cadres, les avis et la visionneuse sont ceux du site**, filmés sur l'horloge simulée : les
  transitions CSS et les animations sont tenues en pause et placées image par image ; arrivées au bout, elles se
  terminent pour de bon, pour que ce qui attend leur fin suive (la visionneuse se referme quand la photo est revenue à
  sa place). La visionneuse décode sa photo en temps réel : la capture attend qu'elle soit prête avant l'image
  suivante, et l'ouverture part bien de la vignette.
- **Le défilement amorti du site (Lenis) avance à l'heure exacte de chaque image.** L'horloge simulée de Playwright
  cadence `requestAnimationFrame` sur une grille de 16 ms, qui glisse d'une image toutes les 24 images : après « Email
  my list » et après le lien du menu, la page faisait un pas double. Les rappels d'animation du site sont donc mis en
  file et joués une fois par image, à 1000/60 ms d'écart.
- **Les cadres s'ouvrent pendant le plan** : chaque plan part d'assez haut pour que ses photos soient encore fermées.
- **Les avis partent du gris** : la citation entre par le bas de l'écran avant le premier mot allumé, et le plan
  s'arrête quand son dernier mot s'allume.
- **Le point d'insertion de « Your list » est redessiné** par le montage, à la position relevée dans la page : celui du
  navigateur clignote en temps réel, pas en temps simulé. Il reste allumé pendant la frappe, puis clignote.
- **Aucune lettre coupée sous l'en-tête** : chaque cadrage d'arrivée laisse le texte au-dessus entièrement sous
  l'en-tête collant (la légende de la photo de l'équipe, au-dessus de la licence).
- **Au téléphone, la page est filmée en 390 × 797** (l'écran moins la barre d'état) : rien n'est coupé en bas. Le
  glissé de la photo passe par les événements du doigt que la visionneuse écoute (`pointerdown`, `pointermove`,
  `pointerup`, envoyés image par image) : la photo suit le doigt, et la suivante arrive au lever ; le doigt est
  redessiné par-dessus.

**Contrôlé sur le rendu** (`tools/motion.py`, `tools/curves.py` et `tools/fades.py`) :
- la mise de côté du navigateur suit la courbe prévue à 0,44 px près sur son bord gauche (0,12 px en moyenne) et à
  0,43 px près sur son bord haut (0,10 px en moyenne), sans arrondi au pixel ;
- les trois téléphones montent sur leur courbe à 0,37 px près (0,07 px en moyenne au plus), puis ne bougent plus
  (0,21 px d'écart au plus) ;
- dans le plan des cadres, la page défile à pas égaux, 4,05 px à l'écran par image (5 px du site), après une montée par
  paliers (0,9, 1,8, 2,4 puis 3,2 px) ; d'un pas au suivant, l'écart ne dépasse jamais 0,93 px ;
- après « Email my list », le défilement du site vers la demande prête décroît de 17,2 à 0,9 px par image, sans pas
  double ; d'un pas au suivant, l'écart ne dépasse jamais 0,95 px ;
- les fondus par le noir changent la luminosité moyenne de 28,9 niveaux au plus d'une image à l'autre (sur 255), sans
  saut, et chaque coupe passe par deux images noires (trois aux deux dernières) ;
- aucune image doublée ni sautée pendant un mouvement. Les seules alertes tombent :
  - sur les coupes, où deux images noires se suivent ;
  - au début et à la fin d'un fondu (une image immobile à côté d'une image qui bouge) ;
  - sur les changements instantanés du site : la première image de la visionneuse (la photo est encore à la place de
    sa vignette), la photo suivante qui part de la transparence, la demande prête qui apparaît, le menu du téléphone
    qui s'ouvre d'un coup, et les touchers du pouce.
- Le son de la présentation mesure −14,0 LUFS (crête à −3,1 dBFS).
- La présentation fait 23,9 Mo : la version d'envoi en est une copie (moins de 30 Mo, aucun réencodage).

## Fabrication

1. **Captures :** `npm run capture` filme le site avec Playwright (`capture/shots.mjs`, `capture/lib.mjs`). On peut
   filmer un seul plan : `node --no-warnings capture/shots.mjs d-houses`.
   - L'horloge de la page est simulée : elle avance d'exactement 1/60 s entre deux images. L'ouverture du site, les
     cadres, les avis, la visionneuse et Lenis tournent sur ce temps.
   - Les plans sont écrits en 2880 × 1800 (ordinateur) et 780 × 1594 (téléphone) dans `public/site/`, avec la
     trajectoire de la souris (et du doigt) et le point d'insertion, redessinés nets par-dessus.
   - Les gestes tombent sur des temps de la musique (`EVENTS` et `TIMING` dans `src/beats.ts`).
   - `node --no-warnings capture/shots.mjs --probe` rejoue les plans sans filmer et relève les repères (les traits de
     la liste, la phrase, l'ouverture des cadres, la visionneuse, la lecture des avis, les lignes tapées, la demande
     prête, le menu, le glissé).
2. **Musique :** `npm run music` la synthétise (`sound/music.mjs`), sans échantillon ni droit tiers : 112,5 BPM, la
   majeur, une pop ensoleillée et posée. Un piano électrique à anches (façon Wurlitzer, en synthèse FM, avec son
   trémolo), une guitare électrique claire, étouffée, sur les contretemps (cordes en synthèse Karplus-Strong), une
   nappe, une basse électrique aux doigts, une batterie légère (grosse caisse douce, claquements de doigts,
   charleston, shaker), et un célesta et des cloches pour les gestes. Pas de bruitages : chaque geste filmé a sa note.
   - À 112,5 BPM, un temps fait 32 images : les traits de la liste (270 ms d'écart sur le site, 16 images une fois
     calés sur les images) tombent sur des croches. La musique commence par une levée de deux temps : « Consider it
     done. » s'écrit sur le premier temps de la deuxième mesure, et chaque coupe suivante tombe sur un premier temps.
   - L'ouverture : la nappe seule, dans un filtre fermé, pendant qu'on lit la liste ; les cinq traits, cinq notes de
     célesta qui montent, et le filtre s'ouvre ; « Consider it done. » : les cloches, et le groupe entre.
   - Les cadres qui s'ouvrent ont chacun leur note, la maison la sienne, plus grande ; la visionneuse : un arpège qui
     monte au rythme de son ouverture (480 ms, la courbe du site), deux notes pour la photo suivante, l'arpège qui
     redescend quand la photo retourne à sa place.
   - Judson et les avis : le groupe s'allège ; chaque phrase de l'avis de Carol F. a sa note quand son dernier mot
     s'allume (les phrases sont relues dans la page du site).
   - La demande : chaque ligne de la liste a sa note quand son point est tapé ; la demande prête, les cloches. Les
     téléphones : les mêmes gestes, plus doux.
   - La fin : le groupe s'arrête ; « Consider it done. » s'écrit sur un arpège qui suit son masque, et l'accord de la
     se pose avec l'adresse du site.
   - Le son est décalé de 50 ms (3 images) sur l'image : un trait qui commence à se tracer ne se voit qu'après quelques
     images, et un son un peu en retard sur un geste paraît juste, jamais un son en avance.
   - L'équilibre des instruments (`MIX` dans `sound/music.mjs`) est réglé sur celui de la présentation de Five Points,
     mesuré instrument par instrument (le niveau de chacun quand il joue, relatif à la grosse caisse, affiché par le
     script). La basse reste au-dessus de 60 Hz, que les petits haut-parleurs rendent : sa ligne descend du la
     (110 Hz) au si (62 Hz).
   - Le spectre du mélange final a été comparé à celui de Five Points : même part de grave, un médium un peu plus
     plein, des aigus de présence (2 à 6 kHz) plus doux de 3 dB, la couleur du piano électrique ; `sound/mix.mjs` leur
     donne 4 dB de présence vers 3 kHz.
3. **Rendu :** `bash tools/render.sh` rend l'image par segments, les raccorde, mixe la musique (`sound/mix.mjs`) et
   assemble `out/presentation-floridasouth.mp4`. Ses fichiers temporaires vont en mémoire (`/dev/shm`).
   - Puis `npm run finalize` normalise le son à −14 LUFS. Le son y est complété par du silence jusqu'à la durée exacte
     de l'image : aucune image n'est coupée à la fin.
   - Il crée aussi la version muette, et une version d'envoi de moins de 30 Mo (`out/`).

`node tools/stills.mjs <dossier> <image> …` sort des images fixes du montage pour vérifier une scène.

`python3 -I tools/motion.py …` mesure les mouvements sur des images du rendu :
- `col` et `row` : la position d'un bord au sous-pixel ;
- `track` : le déplacement d'un morceau d'image ;
- `dup` : les images doublées ou sautées pendant un mouvement, sur la vidéo.

`python3 -I tools/curves.py <dossier> aside|phones <début>` compare la mise de côté du navigateur et la montée des
téléphones à leur courbe prévue ; `python3 -I tools/fades.py <vidéo> <débuts des scènes>` mesure les passages par le
noir.

Projet Remotion 4.0.532 ; `node_modules` est un lien vers celui de `../enhance-video` (mêmes versions).
