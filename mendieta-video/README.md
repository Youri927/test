# Mendieta Roofing : vidéo de présentation du nouveau site (Remotion)

Vidéo de 55,5 s en anglais (1920 × 1080, 60 i/s), faite pour Mendieta Roofing Corp. (West Palm Beach). Elle leur
présente leur nouveau site et leur parle directement (« your crew », « your license », « your 25 cities »).

On s'y promène sur le **vrai nouveau site** (`../mendieta-site/dist/index.html`) :
- il est filmé image par image en 2×, sur ordinateur et sur téléphone (défilement, survols, clics, frappe au clavier) ;
- puis mis en scène dans un navigateur et des téléphones, avec une légende par partie.

L'ouverture est celle du site, filmée dès sa première image : sur la page blanche, le titre monte ligne par ligne,
puis la photo d'un toit refait par leur équipe se découvre du bas vers le haut, comme un toit qui se couvre depuis
l'égout. Le navigateur se range ensuite de côté pour la légende de la vidéo.

| Fichier | Usage |
| --- | --- |
| `renders/presentation-mendieta-16x9.mp4` | présentation avec musique (−14 LUFS) |
| `renders/presentation-mendieta-16x9-muet.mp4` | même vidéo sans son |

| Temps | Séquence |
| --- | --- |
| 0 – 8,5 s | L'ouverture : la page blanche, le titre qui monte, la photo qui se découvre ; légende « Your new website » avec le blason |
| 8,5 – 19,2 s | Couche par couche : la page descend dans la partie épinglée ; l'ancien toit s'en va, la sous-couche se déroule, les tuiles se posent, puis les maisons pendant et après ; « Layer by layer » |
| 19,2 – 24,5 s | Les toits et les photos : des trois petites coupes aux photos en rangs de tuiles ; un clic sur « Tile », les dix photos se reposent en rangs décalés ; « Your work, laid like tile » |
| 24,5 – 30,9 s | La preuve : les avis sur le marine, puis la licence en grand ; « Proof, not promises » |
| 30,9 – 37,3 s | Le secteur : les villes de la carte se colorent une à une ; « Boca Raton » tapé dans « Check your city », « Check » : la ville s'allume ; « 25 cities, on the real map » |
| 37,3 – 43,7 s | Le devis : « Tile », « A leak fixed », puis « Write my text to Mendieta » : le message est prêt, adressé au portable ; « A free estimate, by text » |
| 43,7 – 50,1 s | Trois téléphones : l'ouverture en hauteur, la coupe qui reste en haut pendant que les étapes défilent, les photos deux par deux avec la barre « Call / Free estimate » ; « On a phone » |
| 50,1 – 55,5 s | Sur l'encre du pied de page : le blason, le nom qui monte, un trait jaune ; « Built from your jobs, your license and your 25 cities. » ; fondu au noir |

**Rien d'inventé :**
- Tout ce qui est à l'écran vient du nouveau site, écrit à partir de leur site actuel, du registre des licences de
  l'État de Floride et des limites des villes du Census.
- Les légendes décrivent ce que fait le site, avec ses chiffres : 21 photos de leurs chantiers, 16 avis à cinq étoiles
  sur leur site, la licence CCC1328504 au nom de Mario M. Mendieta, active jusqu'en 2028, 25 villes.
- Le nom, le téléphone, la ville et le message du devis filmé (« Dana », (561) 555-0123, Wellington) sont des exemples
  de démonstration, tapés dans le formulaire ; rien n'est envoyé.

## Pas de saccades

Mêmes règles que pour les vidéos précédentes :
- **Chaque plan est lu à vitesse 1**, image pour image : aucune image sautée ni doublée.
- **Le site défile par pas entiers et réguliers** (4 à 6 px par image), avec des accélérations progressives : Chrome
  arrondit le défilement au pixel.
- **Rien ne dérive.** Le navigateur est immobile pendant chaque plan. Les seuls mouvements sont francs et courts : la
  mise de côté pour la légende de l'ouverture, la montée des téléphones.
- **Caméra en 2D**, sans flou de mouvement : le monde est un seul calque composité, dessiné en grand (navigateur de
  1850 px) et seulement réduit.
- **Les passages par le noir** ne jouent que sur l'opacité, en courbe douce : la dernière image d'une scène et la
  première de la suivante sont noires.
- **L'ouverture est celle du site**, filmée sur l'horloge simulée : ses animations (le titre, la photo, le texte, la
  légende) sont tenues en pause et placées image par image.
- **Couche par couche défile à vitesse constante**, réglée pour que la coupe passe à l'étape 2 exactement sur un temps
  de la musique ; les étapes suivantes tombent toutes les quatre mesures environ.
- **Au téléphone, la page est filmée en 390 × 797** (l'écran moins la barre d'état) : rien n'est coupé en bas, la barre
  « Call / Free estimate » reste entière.

CONTROLES

## Fabrication

1. **Captures :** `npm run capture` filme le site avec Playwright (`capture/shots.mjs`, `capture/lib.mjs`). On peut
   filmer un seul plan : `node capture/shots.mjs d-layers`.
   - L'horloge de la page est simulée : elle avance d'exactement 1/60 s entre deux images. Les animations du site
     (l'ouverture, la coupe, les photos qui se découvrent, les villes de la carte, la barre du téléphone) et Lenis
     tournent sur ce temps.
   - Les plans sont écrits en 2880 × 1800 (ordinateur) et 780 × 1594 (téléphone) dans `public/site/`, avec la
     trajectoire de la souris, redessinée nette par-dessus.
   - Les clics et la frappe tombent sur des temps de la musique (`EVENTS` et `TIMING` dans `src/beats.ts`).
   - `node capture/shots.mjs --probe` rejoue les plans sans filmer et relève les repères (chaque étape de la coupe,
     chaque tuile posée, l'ancien toit qui s'en va, la sous-couche déroulée, le filtre, la carte, la ville trouvée,
     les choix du devis, le message prêt).
2. **Musique :** `npm run music` la synthétise (`sound/music.mjs`), sans échantillon ni droit tiers : 112,5 BPM, ré
   majeur, une pop lumineuse et boisée. Marimba, guitare pincée (corde de Karplus-Strong), nappe chaude, basse ronde,
   batterie légère (grosse caisse, mains, shaker), cloches et verre.
   - Elle se construit couche par couche, comme le site : à l'ouverture, la nappe seule, trois notes de marimba quand
     le titre monte, une montée de verre pendant que la photo se découvre, les cloches et le groove quand elle est
     entière ;
   - couche par couche, tout retombe à la nappe : l'ancien toit s'en va (quatre notes qui descendent), la sous-couche
     se déroule (la basse et la grosse caisse entrent, une montée de verre suit le rouleau), les tuiles se posent (une
     note de marimba par tuile ; le shaker et la guitare entrent), le toit est fini (l'accord de ré, les cloches, les
     mains) ;
   - chaque geste filmé a sa note, à l'image près : le filtre, la carte qui se colore, chaque lettre tapée, la ville
     trouvée, les choix du devis, le message prêt, les téléphones. Pas de bruitages.
   - L'équilibre des instruments (`MIX` dans `sound/music.mjs`) et le mixage (`sound/mix.mjs`) sont réglés sur le
     spectre des présentations précédentes ; la basse reste au-dessus de 60 Hz, que les petits haut-parleurs rendent.
3. **Rendu :** `bash tools/render.sh` rend l'image par segments, les raccorde, mixe la musique (`sound/mix.mjs`) et
   assemble `out/presentation-mendieta.mp4`. Ses fichiers temporaires vont en mémoire (`/dev/shm`) : quand le disque du
   conteneur est presque plein, Chrome refuse sinon de lire les images des plans.
   - Puis `npm run finalize` normalise le son à −14 LUFS.
   - Il crée aussi la version muette, et une version d'envoi de moins de 30 Mo (`out/`).

`node tools/stills.mjs <dossier> <image> …` sort des images fixes du montage pour vérifier une scène.

`python3 -I tools/motion.py …` mesure les mouvements sur des images du rendu :
- `col` et `row` : la position d'un bord au sous-pixel ;
- `track` : le suivi d'un morceau d'image ;
- `dup` : les images doublées ou sautées d'une vidéo.

`python3 -I tools/curves.py …` compare la mise de côté du navigateur et la montée des téléphones à leur courbe prévue
(les formules du montage).

Police : Encode Sans (licence OFL, `public/fonts/OFL-EncodeSans.txt`), la même que le site. Le blason est l'image du
site (`public/img/`).
