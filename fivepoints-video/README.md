# Five Points Roofing : vidéo de présentation du nouveau site (Remotion)

Vidéo de 62,7 s en anglais (1920 × 1080, 60 i/s), faite pour Five Points Roofing (Lakeland, Floride). Elle leur
présente leur nouveau site et leur parle directement (« your line », « your job sites », « your state license »).

On s'y promène sur le **vrai nouveau site** (`../fivepoints-site/dist/index.html`) :
- il est filmé image par image en 2×, sur ordinateur et sur téléphone (défilement, survols, clics, le doigt qui fait
  défiler la rangée des photos) ;
- puis mis en scène dans un navigateur et des téléphones, avec une légende par partie, aux couleurs et à la police du
  site (Saira, étroite pour les titres ; la membrane, l'asphalte et l'or du logo).

L'ouverture est celle du site, filmée dès sa première image : le titre est là, sous un toit encore vide ; les deux
rampants dorés se tracent des avant-toits au faîte, « Roofing is in our blood » monte les deux pentes, l'étoile du logo
se pose au faîte en tournant d'une pointe. Le navigateur se range ensuite de côté pour la légende de la vidéo.

Les légendes se découvrent comme les photos du site : un bord en biais à la pente d'un toit (6/12), qui monte.

| Fichier | Usage |
| --- | --- |
| `renders/presentation-fivepoints-16x9.mp4` | présentation avec musique (−14 LUFS) |
| `renders/presentation-fivepoints-16x9-muet.mp4` | même vidéo sans son |
| `out/presentation-fivepoints-16x9-envoi.mp4` | version d'envoi, moins de 30 Mo (refaite par `npm run finalize`, non versionnée) |

| Temps | Séquence |
| --- | --- |
| 0 – 8 s | L'ouverture : le titre sous un toit vide, les rampants qui se tracent, les mots qui montent la pente, l'étoile qui se pose ; légende « Your new website » avec le logo |
| 8 – 18,7 s | Les trois toits : la page arrive sur la partie et le dessin se trace (la ligne de toit des avant-toits au faîte, la maison dessous, les quatre repères un à un) ; un clic sur « Mobile homes » puis sur « Commercial » : l'indicateur de l'onglet s'étire, la ligne de toit s'aplatit et le bâtiment se transforme avec elle ; la souris survole « Flashing… » dans la liste et son repère s'allume en or sur le dessin ; « Three roofs, one line » |
| 18,7 – 24 s | Après une tempête : la page entre dans la partie sombre ; les quatre étapes, « 5 days or less », le platelage pourri qui se découvre à la pente d'un toit, puis les premiers gestes si le toit fuit ; « After a storm » |
| 24 – 29,3 s | Réparer, recouvrir, remplacer : les trois réponses, puis leurs quatre chantiers, qui se découvrent l'un après l'autre (la dépose, la sous-couche, les bardeaux, le toit fini) ; « Repair, reroof or replace » |
| 29,3 – 34,7 s | Les garanties : la photo d'un toit neuf, puis les trois barres de la règle qui s'allongent (10 ans, 20 ans, de 30 ans à vie) ; « What's covered » |
| 34,7 – 40 s | La famille : la ligne de 1955 se trace et ses trois dates se posent ; la licence de l'État en plaque, la camionnette où son numéro est peint ; « Since 1955 » |
| 40 – 48 s | L'estimation : « A mobile home », « Repair », la page descend, le bouton se remplit d'or au survol, « Write my request » : la demande est prête et la page l'amène à l'écran ; « A free estimate, by email » |
| 48 – 56 s | Trois téléphones : le toit de mots ; les trois toits (le dessin qui se trace, le pouce sur « Commercial ») ; la rangée des chantiers, que le doigt fait défiler d'un geste ; « On a phone » |
| 56 – 62,7 s | Sur l'asphalte du pied de page : le toit de l'accueil revient (les rampants, les mots, l'étoile), l'adresse du site sous le toit ; fondu au noir |

**Rien d'inventé :**
- Tout ce qui est à l'écran vient du nouveau site, écrit à partir de leur site actuel et du registre des licences de
  l'État de Floride.
- Les légendes décrivent ce que fait le site, avec ses chiffres et ses faits : les quatre étapes et les cinq jours,
  leurs garanties (10 ans de main-d'œuvre, 20 ans No Dollar Limit sur les toits commerciaux, de 30 ans à vie sur les
  bardeaux), Troy Ray Jr. et Ray's Roofing en 1955, la licence de l'État sur la page et sur la camionnette.
- Les photos sont les leurs, telles que le site les montre (plaques et numéro de maison floutés).
- L'adresse, le nom, le téléphone et le message de l'estimation filmée (« 1234 Example Rd », « Jordan Avery »,
  863-555-0142) sont des exemples de démonstration, tapés dans le formulaire ; rien n'est envoyé.

## Pas de saccades

Mêmes règles que pour les vidéos précédentes :
- **Chaque plan est lu à vitesse 1**, image pour image : aucune image sautée ni doublée.
- **Le site défile par pas entiers et réguliers** (2 à 6 px par image), avec des accélérations progressives : Chrome
  arrondit le défilement au pixel.
- **Rien ne dérive.** Le navigateur est immobile pendant chaque plan. Les seuls mouvements sont francs et courts : la
  mise de côté pour la légende de l'ouverture, la montée des téléphones.
- **Caméra en 2D**, sans flou de mouvement : le monde est un seul calque composité, dessiné en grand (navigateur de
  1850 px) et seulement réduit.
- **Les passages par le noir** ne jouent que sur l'opacité, en courbe douce : la dernière image d'une scène et la
  première de la suivante sont noires.
- **L'ouverture, le dessin des toits et la ligne de toit qui se transforme sont ceux du site**, filmés sur l'horloge
  simulée : les transitions CSS et les animations sont tenues en pause et placées image par image, la ligne de toit
  (calculée par le site à chaque image) suit la même horloge.
- **Le dessin des toits se trace pendant le plan** : la page part d'assez haut pour qu'il ne se soit pas encore tracé.
  Le cadrage d'arrivée garde le bas de l'écran au-dessus de la fin de la partie quand elle est la plus courte (le
  panneau du mobile-home) : la partie sombre qui suit n'apparaît pas en bas quand on change de toit.
- **Les photos se découvrent pendant le plan** : chaque plan part d'avant le seuil où elles se découvrent.
- **Au téléphone, la rangée des photos défile d'un geste** : le doigt la tire sur 0,22 s, la lâche, et son élan
  s'éteint sur près d'une seconde, par pas entiers ; elle s'arrête exactement sur la troisième photo, sa place
  d'accroche. L'accroche du navigateur est coupée pendant le geste (chaque pas la ramènerait en arrière). Le doigt est
  redessiné par-dessus, il suit le geste.
- **Après le clic sur « Write my request »**, la caméra laisse le site amener lui-même la demande prête à l'écran (son
  défilement doux, sur l'horloge simulée).
- **Au téléphone, la page est filmée en 390 × 797** (l'écran moins la barre d'état) : rien n'est coupé en bas.

**Contrôlé sur le rendu** (`tools/motion.py`, `tools/curves.py` et `tools/fades.py`) :
- la mise de côté du navigateur suit la courbe prévue à 0,43 px près sur son bord gauche (0,18 px en moyenne) et à
  0,47 px près sur son bord haut (0,16 px en moyenne), sans arrondi au pixel ;
- les trois téléphones montent sur leur courbe à 0,30 px près (0,05 px en moyenne au plus), puis ne bougent plus
  (0,14 px d'écart au plus) ;
- dans le plan des toits, la page défile à pas égaux (4,6 à 4,75 px à l'écran par image), après une montée et avant un
  freinage par paliers ; elle s'arrête au moment où les repères du dessin se posent ;
- au téléphone, la rangée des photos avance, mesurée sur la capture, de 1, 2, 5, 8, 10, 13 puis 15 px par image (le
  doigt), puis ralentit pas à pas de 14 à 1 px (l'élan), et s'arrête sur la troisième photo ;
- les fondus par le noir changent la luminosité moyenne de 30,7 niveaux au plus d'une image à l'autre (sur 255), sans
  saut, et chaque coupe passe par deux images noires (trois aux deux dernières) ;
- aucune image doublée ni sautée pendant un mouvement. Les seules alertes tombent :
  - sur les coupes, où deux images noires se suivent ;
  - au début et à la fin d'un fondu (une image immobile à côté d'une image qui bouge) ;
  - juste avant le clic sur « Write my request » : le curseur s'enfonce deux images avant le clic, la page est
    immobile entre les deux, puis la demande prête apparaît.
- Le son de la présentation mesure −13,9 LUFS (crête à −1,6 dBFS).
- La présentation fait 18,8 Mo : la version d'envoi en est une copie (moins de 30 Mo, aucun réencodage).

## Fabrication

1. **Captures :** `npm run capture` filme le site avec Playwright (`capture/shots.mjs`, `capture/lib.mjs`). On peut
   filmer un seul plan : `node --no-warnings capture/shots.mjs d-roofs`.
   - L'horloge de la page est simulée : elle avance d'exactement 1/60 s entre deux images. Les transitions du site
     (l'ouverture, le dessin des toits, les photos qui se découvrent, les barres des garanties, la ligne de la famille)
     et Lenis tournent sur ce temps.
   - Les plans sont écrits en 2880 × 1800 (ordinateur) et 780 × 1594 (téléphone) dans `public/site/`, avec la
     trajectoire de la souris (et du doigt), redessinée nette par-dessus.
   - Les clics tombent sur des temps de la musique (`EVENTS` et `TIMING` dans `src/beats.ts`).
   - `node --no-warnings capture/shots.mjs --probe` rejoue les plans sans filmer et relève les repères (le dessin qui se
     trace, les onglets, le repère allumé, les photos qui se découvrent, la règle, la ligne de la famille, les choix et
     la demande prête).
2. **Musique :** `npm run music` la synthétise (`sound/music.mjs`), sans échantillon ni droit tiers : 90 BPM, ré
   majeur, chaleureuse et simple. Une guitare acier (des cordes pincées en synthèse Karplus-Strong, accordées au
   sous-échantillon, grattées et arpégées, avec la caisse de l'instrument), une nappe, une contrebasse pincée, une
   batterie légère (grosse caisse, balais, shaker), et un piano feutré et un carillon pour les gestes.
   - À l'ouverture, la nappe seule, à travers un filtre fermé ; les rampants se tracent : la guitare monte en arpège, au
     rythme du tracé, et le filtre s'ouvre ; les mots montent : un accord gratté ; l'étoile se pose : le carillon ; le
     groupe entre quand tout est posé, les balais avec la légende.
   - Le dessin des toits : la guitare grattée se tait, et une seconde guitare suit le profil de la ligne de toit, une
     note par point (elle monte aux pignons, redescend dans la noue) ; les quatre repères tombent : quatre notes de
     piano. « Mobile homes » : trois notes qui descendent (la ligne s'aplatit) ; « Commercial » : trois notes qui
     remontent ; le repère qui s'allume : le carillon.
   - La tempête : la batterie se tait, l'accord passe en si mineur, la guitare arpège ; le platelage pourri : une note
     grave.
   - Chaque autre geste filmé a sa note, à l'image près : les photos qui se découvrent, les barres des garanties, les
     trois dates de la famille, les choix du formulaire, le bouton qui se remplit d'or, la demande prête, les
     téléphones, le pouce et le doigt. Pas de bruitages.
   - La fin : le groupe s'arrête ; le toit revient (l'arpège, l'accord, le carillon de l'étoile), et la cadence se pose
     sur ré quand l'adresse du site apparaît.
   - L'équilibre des instruments (`MIX` dans `sound/music.mjs`) est réglé sur celui de la présentation précédente,
     mesuré instrument par instrument (le niveau de chacun quand il joue, affiché par le script) ; la contrebasse reste
     au-dessus de 60 Hz, que les petits haut-parleurs rendent.
3. **Rendu :** `bash tools/render.sh` rend l'image par segments, les raccorde, mixe la musique (`sound/mix.mjs`) et
   assemble `out/presentation-fivepoints.mp4`. Ses fichiers temporaires vont en mémoire (`/dev/shm`).
   - Puis `npm run finalize` normalise le son à −14 LUFS. Le son y est complété par du silence jusqu'à la durée exacte
     de l'image : aucune image n'est coupée à la fin.
   - Il crée aussi la version muette, et une version d'envoi de moins de 30 Mo (`out/`).

`node tools/stills.mjs <dossier> <image> …` sort des images fixes du montage pour vérifier une scène.

`python3 -I tools/motion.py …` mesure les mouvements sur des images du rendu :
- `col` et `row` : la position d'un bord au sous-pixel ;
- `track` : le suivi d'un morceau d'image ;
- `dup` : les images doublées ou sautées d'une vidéo.

`python3 -I tools/curves.py …` compare la mise de côté du navigateur et la montée des téléphones à leur courbe prévue
(les formules du montage).

`python3 -I tools/fades.py <vidéo.mp4> 480,1120,…` mesure la luminosité moyenne image par image autour de chaque coupe :
la plus forte marche de lumière et les images noires.

Police : Saira (licence OFL, `public/fonts/`), la même que le site. Le logo (l'étoile et « FIVE POINTS ROOFING ») est
celui du site, redessiné en vecteurs (`src/logo.json`, copié de `../fivepoints-site/data/logo.json`).
