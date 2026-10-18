# Zynda Custom Homes & Remodeling : vidéo de présentation du nouveau site (Remotion)

Vidéo de 70,8 s en anglais (1920 × 1080, 60 i/s), faite pour Zynda Custom Homes & Remodeling (Naples et Marco Island,
Floride). Elle leur présente leur nouveau site et leur parle directement (« your own words », « your year », « an email
to you »).

On s'y promène sur le **vrai nouveau site** (`../zyndahomes-site/dist/index.html`) :
- il est filmé image par image en 2×, sur ordinateur et sur téléphone (défilement, clics, survols, une phrase tapée, le
  pouce qui ouvre le menu et fait glisser les gros plans) ;
- puis mis en scène dans un navigateur et des téléphones, avec une légende par partie, aux couleurs et aux polices du
  site (Montagu Slab pour les titres, Reddit Sans pour le texte ; le blanc, le noir de leur logo, le marbre, et la
  couleur de leur piscine seulement pour les gestes).

L'ouverture est celle du site, filmée dès sa première image : « The people who show up. » monte de son masque, le
bandeau de la maison neuve et de sa piscine s'ouvre depuis sa ligne d'horizon, « Every single day. » monte à droite,
puis le texte et le bouton : on a lu un Z, comme le monogramme de leur logo. « Every single day. » monte sur le premier
temps de la musique, quand le piano et la basse entrent. Le navigateur se range ensuite de côté pour la légende.

Les légendes bougent comme le site : le panneau blanc se découvre de bas en haut, comme ses photos (un volet de la
couleur du fond se retire vers le haut) ; les lignes du titre montent ensuite de leur masque, l'une après l'autre, comme
ses titres.

La fin rejoue le Z en grand, aux temps de l'accueil du site : le métier, « The people who show up. », le bandeau qui
s'ouvre, « Every single day. », et, à la place du texte et du bouton, le logo et l'adresse du site.

| Fichier | Usage |
| --- | --- |
| `renders/presentation-zynda-16x9.mp4` | présentation avec musique (−14 LUFS) |
| `renders/presentation-zynda-16x9-muet.mp4` | même vidéo sans son |
| `out/presentation-zynda-16x9-envoi.mp4` | version d'envoi, moins de 30 Mo (refaite par `npm run finalize`, non versionnée) |

| Temps | Séquence |
| --- | --- |
| 0 – 10,8 s | L'ouverture en Z : la phrase, le bandeau de la maison, « Every single day. », le texte et le bouton ; légende « Your new website » avec le logo |
| 10,8 – 22,8 s | L'année : la page descend le long des quatre temps (« Winter. You’re here. », « May. We start. », « June to September. On site, every day. », « October 1st. You’re home. ») ; le cadran reste à l'écran, son repère avance de novembre au 1er octobre, la date change au centre, l'arc de l'été se remplit ; le repère du jour marque le 18 octobre ; « Your year, on a dial » |
| 22,8 – 30 s | Les pièces : « The work » monte, le séjour à l'escalier de verre se découvre (et l'avis de Park Shore), puis la cuisine et la vasque aux écailles ; « Only your own photos » |
| 30 – 37,2 s | Les détails : la page entre dans le bandeau noir, « Adding pop is what we do best. » monte, les six gros plans arrivent ; un clic sur la pierre bleue : la cheminée entière dans la visionneuse ; « Close » ; « The details, up close » |
| 37,2 – 44,4 s | Les prestations : la souris se pose, la page défile dessous ; une ligne tous les deux temps passe sous la souris et découvre sa photo, à sa place ; « What you build » |
| 44,4 – 54 s | La demande : « I leave in » May, « I’m back in » October, la fenêtre se dessine sur la saison des condos (« That covers the whole condo season. ») ; une phrase s'écrit ; « Email my request » : la note dit que la messagerie s'ouvre avec la demande ; « When are you away? » |
| 54 – 63,6 s | Trois téléphones, des gestes qui se suivent : l'ouverture en Z ; le menu, « Your year » et la page qui descend jusqu'au cadran ; deux glissés dans les gros plans, puis la pièce entière dans la visionneuse ; « On a phone » |
| 63,6 – 70,8 s | Le Z rejoué en grand, le logo et l'adresse du site ; fondu au noir |

**Rien d'inventé :**
- Tout ce qui est à l'écran vient du nouveau site, écrit à partir de leur site actuel et du registre des licences de
  l'État de Floride.
- Les légendes décrivent ce que fait le site : l'accueil en Z, le cadran et ses quatre temps (mai, le 1er octobre, sur
  place chaque jour : leurs mots), les photos jamais agrandies et légendées, les six gros plans, les sept prestations, la
  fenêtre d'absence et l'e-mail préparé.
- Les photos sont les leurs, telles que le site les montre. Le site ne nomme personne, la vidéo non plus.
- Le nom, l'e-mail, le téléphone et la phrase de la demande filmée (« Pat Morgan », pat@example.com, (239) 555-0142,
  « Kitchen and two baths, while we’re up north. ») sont des exemples de démonstration : le domaine example.com et la
  tranche 555-01xx sont réservés aux exemples. Rien n'est envoyé.
- Le cadran marque le 18 octobre 2026, le jour où la vidéo a été faite (l'horloge de la page est réglée sur ce jour).

## Pas de saccades

Mêmes règles que pour les vidéos précédentes :
- **Chaque plan est lu à vitesse 1**, image pour image : aucune image sautée ni doublée.
- **Le site défile par pas entiers et réguliers** (3 à 6 px par image), avec des accélérations progressives : Chrome
  arrondit le défilement au pixel.
- **Rien ne dérive.** Le navigateur est immobile pendant chaque plan. Les seuls mouvements sont francs et courts : la
  mise de côté pour la légende de l'ouverture, la montée des téléphones.
- **Caméra en 2D**, sans flou de mouvement : le monde est un seul calque composité, dessiné en grand (navigateur de
  1850 px) et seulement réduit.
- **Les passages par le noir** ne jouent que sur l'opacité, en courbe douce : la dernière image d'une scène et la
  première de la suivante sont noires.
- **L'ouverture, les titres, les photos qui se découvrent, le cadran et Lenis sont ceux du site**, filmés sur l'horloge
  simulée : les transitions CSS sont tenues en pause et placées image par image (leurs délais compris : les lignes d'un
  titre montent l'une après l'autre) ; les rappels d'animation du site sont joués une fois par image, à 1000/60 ms
  d'écart, et le cadran se met à jour dans la même image que le défilement.
- **La visionneuse décode sa photo en temps réel** : la capture attend qu'elle soit prête avant l'image suivante (aucune
  image vide à l'écran).
- **Les mois de la fenêtre d'absence sont choisis par le script** au moment du clic : la liste déroulante du navigateur
  s'ouvre hors de la page et ne se filme pas.
- **Le point d'insertion de « About the project » est redessiné** par le montage, à la position relevée dans la page :
  celui du navigateur clignote en temps réel, pas en temps simulé. Il reste allumé pendant la frappe, puis clignote.
- **Les gros plans du téléphone** : la rangée suit le doigt pendant l'appui (110 px en 12 images), puis file jusqu'au gros
  plan suivant en ralentissant (22 images) ; son aimantation est suspendue pendant le plan, et chaque glissé s'arrête
  exactement là où elle l'aurait arrêté. Le doigt est redessiné par-dessus.
- **Au téléphone, la page est filmée en 390 × 797** (l'écran moins la barre d'état) : rien n'est coupé en bas.
- **Les lignes qui montent** (les titres des légendes, la fin) sont chacune un calque déplacé au sous-pixel : une rotation
  infime (0,0001°) empêche Chrome de les recaler au pixel entier, ce qui, dans la fin lente de la courbe, les faisait
  avancer une image sur deux.
- **Le bandeau de la fin** s'ouvre par deux volets du blanc de la page, déplacés au sous-pixel : une découpe (clip-path)
  avançait au pixel entier.

**Contrôlé sur le rendu** (`tools/motion.py`, `tools/curves.py` et `tools/fades.py`) : voir « Les mesures » plus bas.

## Fabrication

1. **Captures :** `npm run capture` filme le site avec Playwright (`capture/shots.mjs`, `capture/lib.mjs`). On peut
   filmer un seul plan : `node --no-warnings capture/shots.mjs d-year`.
   - L'horloge de la page est simulée : elle avance d'exactement 1/60 s entre deux images. L'ouverture du site, les
     titres, les photos, le cadran et Lenis tournent sur ce temps.
   - Les plans sont écrits en 2880 × 1800 (ordinateur) et 780 × 1594 (téléphone) dans `public/site/`, avec la
     trajectoire de la souris (et du doigt) et le point d'insertion, redessinés nets par-dessus.
   - Les gestes tombent sur des temps de la musique (`EVENTS` et `TIMING` dans `src/beats.ts`).
   - `node --no-warnings capture/shots.mjs --probe` rejoue les plans sans filmer et relève les repères (le départ de
     l'ouverture, les quatre temps du cadran et le 1er octobre, les photos qui se découvrent, la visionneuse, les lignes
     survolées, les deux mois, la phrase, la demande prête, le menu, les glissés).
2. **Musique :** `npm run music` la synthétise (`sound/music.mjs`), sans échantillon ni droit tiers : 100 BPM, fa majeur,
   calme et précise. Un piano feutré (des cordes amorties partiel par partiel, un peu inharmoniques, un marteau de
   feutre, le battement du chœur des cordes), qui pose les accords puis tient une ostinato de croches ; une nappe ; une
   basse ronde ; une batterie très légère (grosse caisse douce, coups de baguette sur le cercle, shaker) ; pour le cadran,
   le tic-tac d'une montre ; un vibraphone, un célesta et des cloches pour les gestes. Pas de bruitages : chaque geste
   filmé a sa note.
   - À 100 BPM, un temps fait 36 images. La musique commence par une levée de deux temps : « Every single day. » monte
     sur le premier temps de la première mesure, et chaque coupe suivante tombe sur un premier temps.
   - L'ouverture : la nappe seule, dans un filtre fermé, pendant que la première ligne monte ; un arpège suit le bandeau
     qui s'ouvre (1,5 s, la courbe du site) et le filtre s'ouvre avec lui ; « Every single day. » : les cloches, le piano
     et la basse entrent ; avec la légende, l'ostinato et la pulsation.
   - L'année : le groupe entier et le tic-tac, tic sur les temps, tac sur les contretemps ; chaque temps de l'année a sa
     cloche quand le cadran l'affiche, et le 1er octobre atteint, un accord de cloches.
   - Les pièces : une note par photo qui se découvre ; les détails : les cloches quand la visionneuse s'ouvre, deux notes
     qui descendent quand elle se referme ; les prestations : une note de célesta, de plus en plus haut, pour chaque ligne
     qui découvre sa photo ; la demande : les deux mois, la fenêtre, la phrase finie, puis la demande prête (les cloches).
     Les téléphones : les mêmes gestes, plus doux.
   - La fin : le groupe s'arrête ; un arpège suit le bandeau qui s'ouvre, et l'accord de fa se pose quand « Every single
     day. » monte.
   - Le son est décalé de 50 ms (3 images) sur l'image : un mouvement qui commence ne se voit qu'après quelques images,
     et un son un peu en retard sur un geste paraît juste, jamais un son en avance.
   - L'équilibre des instruments (`MIX` dans `sound/music.mjs`) est réglé sur celui de la présentation de Florida South,
     mesurée de même (le niveau de chacun quand il joue, relatif à la grosse caisse, affiché par le script) ; le spectre
     du mélange a été comparé au sien, bande par bande, et `sound/mix.mjs` adoucit de 1,5 dB le médium vers 1,5 kHz, où
     le vibraphone et le célesta sont plus présents.
3. **Rendu :** `bash tools/render.sh` rend l'image par segments, les raccorde, mixe la musique (`sound/mix.mjs`) et
   assemble `out/presentation-zynda.mp4`. Ses fichiers temporaires vont en mémoire (`/dev/shm`).
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

## Les mesures

Sur le rendu final (`renders/presentation-zynda-16x9.mp4`), avec `tools/motion.py`, `tools/curves.py`, `tools/fades.py` et
ffmpeg :
- **La présentation** : 70,8 s, 4 248 images, 1920 × 1080 à 60 i/s ; 26,1 Mo (la version d'envoi en est une copie, sans
  réencodage) ; la version muette, 24,4 Mo.
- **Le son** : −14,0 LUFS, plage de 3,0 LU, crête à −2,7 dBFS.
- **Les fondus** : la luminosité moyenne change de 30,5 niveaux au plus d'une image à l'autre (sur 255), sans marche ;
  chaque coupe passe par deux images noires (trois à l'entrée des téléphones).
- **La mise de côté du navigateur** suit sa courbe à 0,38 px près sur son bord gauche (0,15 px en moyenne) et à
  0,56 px près sur son bord haut (0,14 px en moyenne), sans arrondi au pixel.
- **Les trois téléphones** montent sur leur courbe à 0,32 px près (0,05 px en moyenne au plus), puis ne bougent plus
  (0,15 px d'écart au plus).
- **L'année** : le site défile par pas entiers, 1 à 5 px puis 6 px par image pendant 531 images (relevés dans la page) ;
  à l'écran, de 4,96 à 5,01 px par image, mesurés sur le bord du cadran avant qu'il s'épingle ; épinglé, il ne bouge plus
  (de 363,33 à 363,42 px).
- **Les gros plans au téléphone** : la rangée accélère jusqu'à 18 px par image au lever du doigt, puis ralentit sur sa
  lancée (17, 16, 15… 2 px), sans temps d'arrêt. Le premier contrôle avait relevé un arrêt au lever : corrigé.
- **La ligne qui monte, à la fin** : une fois entière, elle avance à chaque image, de 0,57 px puis de moins en moins ; d'un
  pas au suivant, l'écart ne dépasse pas 0,07 px. Le premier contrôle l'avait vue avancer d'un pixel une image sur deux :
  corrigé (voir plus haut).
- **Aucune image doublée ni sautée pendant un mouvement.** Les seules alertes du contrôle tombent :
  - sur les coupes, où deux images noires se suivent ;
  - au début et à la fin d'un fondu (une image immobile à côté d'une image qui bouge) ;
  - sur les changements instantanés du site : la visionneuse qui s'ouvre et se referme, le menu du téléphone qui s'ouvre
    et se ferme, la visionneuse du téléphone.
