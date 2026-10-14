# Skoda Construction : vidéo de présentation du nouveau site (Remotion)

Vidéo de 61,2 s en anglais (1920 × 1080, 60 i/s), faite pour Skoda Construction (Naples, Floride). Elle leur présente
leur nouveau site et leur parle directement (« your job sites », « your family », « your license »).

On s'y promène sur le **vrai nouveau site** (`../skoda-site/dist/index.html`) :
- il est filmé image par image en 2×, sur ordinateur et sur téléphone (défilement, survols, clics) ;
- puis mis en scène dans un navigateur et des téléphones, avec une légende par partie, aux couleurs et aux polices du
  site (Besley pour les titres, Rethink Sans pour le texte, le bleu du logo, le gris du bloc de béton).

L'ouverture est celle du site, filmée dès sa première image : le titre est là, puis les cinq lettres du nom montent une
à une derrière leur ligne de base, dans le bleu du logo, et la première photo (un terrain nu) entre par le bas. Le
navigateur se range ensuite de côté pour la légende de la vidéo.

| Fichier | Usage |
| --- | --- |
| `renders/presentation-skoda-16x9.mp4` | présentation avec musique (−14 LUFS) |
| `renders/presentation-skoda-16x9-muet.mp4` | même vidéo sans son |

| Temps | Séquence |
| --- | --- |
| 0 – 7,2 s | L'ouverture : le titre, les lettres du nom qui montent, la première photo qui entre ; légende « Your new website » avec la fenêtre en arc |
| 7,2 – 16,8 s | Un Skoda derrière chaque chantier : la page descend dans l'accueil, le nom reste en place et leurs chantiers passent devant lui (le terrain, la coque en blocs, la maison finie, la cuisine, la maison refaite, le studio de fitness), jusqu'à « All our jobs are owner supervised. » ; « A Skoda behind every job » |
| 16,8 – 21,6 s | Les maisons neuves : le texte reste en place, la coque et la maison finie se découvrent en arrivant ; « From the lot up » |
| 21,6 – 27,6 s | Les pièces : des six métiers aux photos ; un clic ouvre la cuisine à l'îlot de pierre dans la visionneuse, puis deux fois « Next photo » ; « Rooms you've built » |
| 27,6 – 37,2 s | Better than new : la page descend dans l'histoire épinglée ; la maison passe de novembre 2022 au séchage (sur un temps), puis à décembre 2023 ; « Better than new » |
| 37,2 – 42 s | La famille : la ligne des dates se trace (1950, 1985, 2014, 2023), puis Chris et Mike ; « Since 1950 » |
| 42 – 49,2 s | La consultation : « A new home », leurs fourchettes de budget apparaissent, « $1 million to $5 million », puis « Write my email to Skoda » : la demande est prête et la page l'amène à l'écran ; « A consultation, by email » |
| 49,2 – 55,2 s | Trois téléphones : l'ouverture, le nom avec les chantiers qui passent devant, la maison restaurée étape par étape ; « On a phone » |
| 55,2 – 61,2 s | Sur le bleu du pied de page : la fenêtre en arc, les lettres du nom qui montent, « Built from your job sites, your family and your license. » ; fondu au noir |

**Rien d'inventé :**
- Tout ce qui est à l'écran vient du nouveau site, écrit à partir de leur site actuel et du registre des licences de
  l'État de Floride.
- Les légendes décrivent ce que fait le site, avec ses chiffres et ses faits : douze intérieurs (en Floride et dans
  l'Ohio, comme le dit la partie), la maison de novembre 2022 à décembre 2023, Joe Cicero en 1950, Chris en 1985, Mike
  en 2014 et sa licence de Floride en 2023, leurs propres fourchettes de budget.
- Le nom, le téléphone, la ville et le message de la consultation filmée (« Jordan Avery », (239) 555-0142, Naples)
  sont des exemples de démonstration, tapés dans le formulaire ; rien n'est envoyé.

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
- **L'ouverture est celle du site**, filmée sur l'horloge simulée : ses transitions (les lettres, la photo) sont tenues
  en pause et placées image par image.
- **La maison restaurée défile à vitesse constante**, réglée pour que le séchage arrive exactement sur un temps de la
  musique ; décembre 2023 suit.
- **Après le clic sur « Write my email to Skoda »**, la caméra laisse le site amener lui-même la demande prête à
  l'écran (son défilement doux, sur l'horloge simulée).
- **Au téléphone, la page est filmée en 390 × 797** (l'écran moins la barre d'état) : rien n'est coupé en bas.

**Contrôlé sur le rendu** (`tools/motion.py`, `tools/curves.py` et `tools/fades.py`) : voir la partie « Contrôles »
plus bas.

## Fabrication

1. **Captures :** `npm run capture` filme le site avec Playwright (`capture/shots.mjs`, `capture/lib.mjs`). On peut
   filmer un seul plan : `node --no-warnings capture/shots.mjs d-story`.
   - L'horloge de la page est simulée : elle avance d'exactement 1/60 s entre deux images. Les transitions du site
     (l'ouverture, les étapes qui se découvrent, la maison restaurée, la ligne de la famille) et Lenis tournent sur ce
     temps.
   - Les plans sont écrits en 2880 × 1800 (ordinateur) et 780 × 1594 (téléphone) dans `public/site/`, avec la
     trajectoire de la souris, redessinée nette par-dessus.
   - Les clics tombent sur des temps de la musique (`EVENTS` et `TIMING` dans `src/beats.ts`).
   - `node --no-warnings capture/shots.mjs --probe` rejoue les plans sans filmer et relève les repères (chaque chantier
     qui passe devant le nom, les étapes qui se découvrent, la visionneuse, les étapes de la maison restaurée, la ligne
     de la famille, les choix et la demande prête).
2. **Musique :** `npm run music` la synthétise (`sound/music.mjs`), sans échantillon ni droit tiers : 100 BPM, mi bémol
   majeur, chaleureuse et posée. Piano feutré, cordes, contrebasse pincée, batterie aux balais, et un carillon pour les
   gestes.
   - À l'ouverture, les cordes seules, à travers un filtre fermé ; une note de piano par lettre du nom, qui monte, et le
     filtre s'ouvre ; le carillon quand la photo entre ; la contrebasse et la grosse caisse quand le navigateur se range,
     les balais avec la légende.
   - Le nom : chaque chantier qui passe devant lui a sa note de piano, en haut du clavier ; « All our jobs are owner
     supervised » : le carillon.
   - La maison restaurée : la batterie s'arrête et l'accord passe en mineur (novembre 2022), la contrebasse revient au
     séchage, décembre 2023 retombe sur mi bémol avec le carillon et tout le groove.
   - Chaque autre geste filmé a sa note, à l'image près : les étapes qui se découvrent, la visionneuse, les quatre
     dates de la famille quand la ligne les passe, les choix du formulaire, la demande prête, les téléphones, les
     lettres du nom à la fin. Pas de bruitages.
   - L'équilibre des instruments (`MIX` dans `sound/music.mjs`) et le mixage (`sound/mix.mjs`) sont réglés sur le
     spectre des présentations précédentes ; la contrebasse reste au-dessus de 60 Hz, que les petits haut-parleurs
     rendent.
3. **Rendu :** `bash tools/render.sh` rend l'image par segments, les raccorde, mixe la musique (`sound/mix.mjs`) et
   assemble `out/presentation-skoda.mp4`. Ses fichiers temporaires vont en mémoire (`/dev/shm`).
   - Puis `npm run finalize` normalise le son à −14 LUFS.
   - Il crée aussi la version muette, et une version d'envoi de moins de 30 Mo (`out/`).

`node tools/stills.mjs <dossier> <image> …` sort des images fixes du montage pour vérifier une scène.

`python3 -I tools/motion.py …` mesure les mouvements sur des images du rendu :
- `col` et `row` : la position d'un bord au sous-pixel ;
- `track` : le suivi d'un morceau d'image ;
- `dup` : les images doublées ou sautées d'une vidéo.

`python3 -I tools/curves.py …` compare la mise de côté du navigateur et la montée des téléphones à leur courbe prévue
(les formules du montage).

`python3 -I tools/fades.py <vidéo.mp4> 432,1008,…` mesure la luminosité moyenne image par image autour de chaque coupe :
la plus forte marche de lumière et les images noires.

Polices : Besley et Rethink Sans (licence OFL, `public/fonts/`), les mêmes que le site. La fenêtre en arc est celle du
site, redessinée au trait.
