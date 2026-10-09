# Custom Pools by Rob Abel : nouveau site (React + shadcn/ui)

Refonte complète de https://custompoolsbyrobabel.com, constructeur de piscines sur mesure à Fort Walton Beach, sur l'Emerald Coast (Floride). L'analyse du site actuel est dans `ANALYSE.md`.

**À ouvrir** : `dist/index.html`, d'un double-clic (un seul fichier, sans serveur).

## L'idée : « Lights on »

Leur meilleure photo est une piscine et son spa au bord de l'eau, au crépuscule, éclairés en violet, avec les palmiers éclairés au pied. Le nouveau site s'ouvre sur cette photo lumières éteintes, puis l'allume comme on allume un jardin le soir : la maison, chaque palmier l'un après l'autre, puis la piscine. Ensuite le visiteur choisit la couleur de la piscine.

- **L'accueil** :
  - la photo est découpée en calques de lumière (`tools/hero.py`) : allumés à fond, ils redonnent exactement la photo d'origine ;
  - le violet est la vraie couleur de la photo ; le bleu, l'aqua, le magenta et le blanc sont simulés, et la page le dit ;
  - le cadrage suit la taille de l'écran comme une photo en « cover », centré sur la piscine.
- **Rob** : un seul constructeur du premier rendez-vous à la première baignade ; plus de 30 ans de métier, le rendez-vous chez soi, une piscine pensée pour être simple à entretenir après la garantie, le matériel à l'intérieur. La photo : le ferraillage, puis la coque projetée.
- **Deux de leurs piscines** :
  - la piscine aux deux motos-fontaines : une boucle de 3 secondes tirée de leur film (sans couture, à l'arrêt si le visiteur demande moins d'animations), leurs photos, et leur film entier dans un lecteur (version en ligne) ;
  - la piscine au bord de l'eau, l'après-midi, au crépuscule et la nuit : les photos de nuit s'allument en arrivant à l'écran.
- **Le local technique**, leur vraie signature, présenté comme le circuit de l'eau :
  - de la piscine à la pompe Pentair, au filtre, au régulateur de chimie, à l'UV Solaxx, à la pompe à chaleur Rheem et à l'électrolyseur Solaxx, puis retour à la piscine ;
  - au défilement, l'eau avance dans le tuyau et chaque appareil s'allume quand elle l'atteint, avec sa propre photo ;
  - la tuyauterie se choisit comme sur leur page : PVC schedule 40, schedule 80 ou transparent (on voit alors l'eau couler et l'UV briller) ;
  - leur phrase « We don't install expensive equipment on the ground here in the panhandle », ce que le local accueille d'autre, les marques qu'ils posent.
- **Autour de l'eau** : leur page paysage et espaces extérieurs, avec leurs photos ; sur ordinateur, la photo reste en place et change avec le sujet au milieu de l'écran (elle monte comme l'eau par-dessus la précédente).
- **Neuve ou existante** : leurs deux méthodes, construction et rénovation, en étapes, dans deux onglets.
- **Chlore ou sel** : leurs sept points ; on coche ce qui compte pour soi et le fléau penche du côté qui l'emporte.
- **Destin à 30A** : une vraie carte de la côte, tracée d'après les données du Census américain (la baie de Choctawhatchee, le golfe, la route 30A), avec leur bureau.
- **Le rendez-vous** : 850-362-POOL en très grand, un formulaire court (nom, téléphone, ville, projet), et leur financement Lyon Financial.

**Mouvement** : défilement fluide (Lenis) et animations liées au défilement (GSAP ScrollTrigger), toutes sur le thème de l'eau et de la lumière :
- en quittant l'accueil, la scène avance vers la piscine, le titre file en s'effaçant et la nuit tombe sur la photo ;
- la boucle des fontaines part de la largeur du texte et s'élargit jusqu'aux bords de l'écran ;
- les photos de nuit s'allument au fil du défilement ; l'après-midi, le crépuscule et la nuit montent à des vitesses différentes ;
- sur ordinateur, le circuit du local technique (avec le choix de la tuyauterie) reste fixé au milieu de l'écran le temps que l'eau le parcoure ;
- les étapes de construction et de rénovation sont reliées par un tuyau qui se remplit, chaque numéro s'allume quand l'eau l'atteint ;
- la carte part de leur bureau et recule jusqu'à toute la côte, les villes apparaissent, la route 30A se trace ;
- les grandes photos glissent un peu moins vite que la page ; les titres montent ligne par ligne ; au survol, l'eau circule dans le soulignement des liens.

Tout est coupé avec « réduire les animations » : la page s'affiche alors allumée, le circuit et les étapes pleins. Chaque animation est préparée dans sa propre tâche, pour ne pas bloquer le chargement.

**Typographie et couleurs** : Sofia Sans Extra Condensed pour les titres, très grands et serrés, et Sofia Sans pour le texte (une seule famille, licence OFL, chiffres tabulaires pour le téléphone). Les deux couleurs du logo : le bleu nuit (#0C2448) et l'azur (#009CCC), avec un bleu presque noir pour la nuit et le local technique.

**Composants** : shadcn/ui (fenêtre du film, panneau du menu sur téléphone, champs du formulaire) et les primitives Radix (onglets, choix de la couleur, groupes de boutons). Recherche faite sur 21st.dev (révélations au défilement, remplissage liquide, comparateurs d'images) : rien qui colle mieux au sujet que des composants dessinés pour lui, donc le circuit, le fléau, la carte et l'allumage sont faits sur mesure.

## Rien d'inventé

- Textes : leurs pages (30 ans de métier, rendez-vous à domicile, local technique climatisé, tuyauteries, régulateur, socle composite, marques, comparatif chlore et sel, étapes de construction et de rénovation, paysage, financement) ; adresse, téléphone, e-mail, horaires, villes et comtés de leur pied de page.
- Photos : les leurs, toutes tirées de leur médiathèque ; la boucle vidéo et le film viennent de leur propre film. Les photos d'aménagement n'existent qu'en 512 px de large : le site les montre dans des cadres qui ne les agrandissent pas trop.
- Écartés : les photos de banque d'images (galerie, accueil, page paysage), les textes de modèle, le compteur « Years of expience » (faute comprise), les piscines hors-sol, polyester et liner (formule de modèle, à confirmer), les icônes de réseaux sociaux qui ne mènent nulle part.
- Les couleurs de piscine autres que le violet sont simulées et présentées comme telles.
- **Le formulaire est une démonstration** : rien n'est envoyé. À brancher avant la mise en ligne (Netlify Forms, Formspree ou leur messagerie).

## Fabrication

- `npm run build` : `dist/index.html`, un seul fichier avec tout dedans (5,2 Mo ; sans le film).
- `npm run build:web` : version de production dans `dist-web/` (HTML pré-rendu, styles dans la page, photos, calques et polices en fichiers séparés ; les deux polices et la photo de l'accueil sont préchargées ; le film est servi depuis `public/film/`).
  - Les calques de l'accueil existent en 2560 et 1440 px de large : le téléphone prend la version allégée. Les grandes photos ont aussi une version allégée pour les petits cadres.
- **Netlify** : `npm run build:web`, puis glisser le dossier `dist-web/` sur https://app.netlify.com/drop. Le fichier `public/_headers` y est copié : cache d'un an pour les fichiers versionnés, et `noindex` tant que c'est une maquette (à retirer à la mise en ligne).
- **Vercel** : `vercel.json` lance `npm run build:web` et sert `dist-web/`.
- `python3 -I tools/hero.py <photo> src/assets/hero` : la photo lumières éteintes et les calques de lumière (maison, palmiers, piscine, couleurs simulées) en AVIF, avec leurs positions dans `hero.json`. Il faut OpenCV, NumPy et Pillow.
- `python3 tools/images.py <dossier des originaux>` : les photos en AVIF (et leurs versions allégées), d'après `data/photos.json`.
- `python3 tools/map.py <dossier>` : la carte, d'après les fichiers du Census (voir l'en-tête du script).
- La boucle des fontaines (`src/assets/video/fountains.mp4`) : 3 secondes de leur film, refermées sur elles-mêmes par un fondu (ffmpeg, filtre xfade). Une version WebM (VP9, `fountains.webm`, 768 Ko) sert de repli aux navigateurs sans H.264, comme le Chromium des captures vidéo : le MP4 déclare son codec, ils le sautent sans le charger.
- `python3 tools/boards.py …` : les planches de présentation de `boards/`, en anglais pour le client (captures du site actuel et du nouveau, voir l'en-tête du script).

## Mesures

Lighthouse 12, profil téléphone (4G lente et processeur ralenti simulés), mêmes réglages des deux côtés, le 9 octobre 2026. Le site actuel en ligne : ses résultats varient avec le réseau, on garde son meilleur passage sur quatre. Le nouveau site servi en local et compressé comme sur Netlify : médiane de trois passages.

| Téléphone | Site actuel | Nouveau site |
|---|---|---|
| Performance | 89 | 89 |
| Accessibilité | 84 | 100 |
| Bonnes pratiques | 61 | 100 |
| Référencement | 92 | 100 |
| Blocage pendant le chargement (TBT) | 0,31 s | 0,08 s |
| Téléchargé au chargement | 1 179 Ko | 481 Ko |

Sur ordinateur, le nouveau site obtient 99, 100, 100 et 100 (affichage principal en 0,9 s). La performance est à égalité sur téléphone : le site actuel est léger tant que sa vidéo d'accueil de 22 Mo ne s'est pas chargée (il affiche un cadre gris en attendant), le nouveau charge et anime la vraie photo dès l'ouverture. Les planches de `boards/` reprennent ces chiffres.

## À confirmer avec Rob Abel

- Le numéro de licence de constructeur et l'assurance (rien sur le site, rien de vérifiable trouvé).
- Le nom à garder : « Custom Pools by Rob Abel » (le site dit aussi « Pools by Rob » et « Rob's Pool Service »).
- Les lieux et dates des deux piscines montrées, et l'accord des propriétaires.
- Un lien vers leurs avis Google, s'ils en ont.
- Les piscines hors-sol, en polyester ou à liner : en proposent-ils vraiment ?
