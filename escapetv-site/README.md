# Escape TV (Lyon) : refonte du site

Proposition de refonte pour [escapetv.fr](https://escapetv.fr), « le seul escape game filmé de France ». L'analyse du site actuel et les choix de direction sont dans [`ANALYSE.md`](ANALYSE.md).

**Le livrable est un fichier unique, `dist/index.html`**, qui s'ouvre directement dans un navigateur, sans serveur ni connexion : polices, styles et scripts y sont intégrés.

## Le concept : « Vous êtes le programme »

Le site est la retransmission de l'émission.

| Section | Ce qu'on y voit |
| --- | --- |
| Hero, la régie | Le plan du labyrinthe, généré et animé : l'équipe avance, le Minotaure rôde (tache de chaleur), le trésor brille au centre. La régie change de caméra toutes les 4,6 s (vue d'ensemble, l'équipe, le Minotaure, la salle du trésor). Le timecode décompte l'heure de jeu. À l'ouverture, l'écran s'allume comme une télévision |
| Le jeu | Le pitch, dont les mots s'allument au défilement, puis la fiche du programme présentée comme un générique de fin |
| Le concept | Les cinq genres deviennent cinq chaînes. Le défilement (ou un clic) zappe de l'une à l'autre avec de la neige, et l'écran change de mode : plan du jeu, cadre cinéma, direct télé avec applaudimètre, interface de jeu vidéo, lumières de scène |
| Le Minotaure | Une caméra thermique plein écran. La chaleur du Minotaure se rapproche de la souris ou du doigt ; la jauge de proximité monte, l'image tremble quand il vous trouve |
| Votre film | Les deux formats de la vidéo souvenir dans de vrais lecteurs (16:9 de 2 minutes, vertical de 30 secondes), avec montage, barre de lecture et pause au clic |
| L'audience | Les notes réelles (The Escapers, escapegame.fr, Tripadvisor) en applaudimètres |
| Infos | Adresse, horaires, contact, tarif, FAQ, réservation |

Tous les boutons « Réserver » mènent à la page de réservation actuelle (`https://escapetv.fr/#/catalog/57cfe152-8311-40f2-97df-a37e0d88007a`).

## Direction artistique

- **Couleurs.** Noir chaud, pierre et os pour le labyrinthe ; l'or du trésor pour les actions. Le rouge est réservé au direct (REC, « En direct »).
- **Typographie.** Anybody, une grotesque variable très étroite et lourde pour les titres et le logo ; Instrument Sans pour le texte ; Geist Mono seulement pour les incrustations de régie (timecode, numéro de caméra, chaîne).
- **Aucune photo inventée.** Tous les visuels sont dessinés en direct sur canvas (`src/maze.js`). Les vraies images des parties filmées pourront remplacer les écrans des lecteurs.

## Responsive et accessibilité

- Testé à 390, 768, 1024, 1280 × 720, 1440 et 1920 px de large, sans défilement horizontal.
- Sur mobile, les chaînes passent en pastilles défilantes sous l'écran, et la caméra thermique suit le doigt.
- Avec « réduire les animations », le défilement doux, les changements de caméra, la neige et les animations sont coupés ; les écrans restent fixes.
- Les animations des écrans s'arrêtent quand ils sortent de l'écran.

## Fabrication

```
node build.mjs     # assemble src/ et vendor/ dans dist/index.html
```

| Fichier | Rôle |
| --- | --- |
| `src/index.html` | structure et contenu |
| `src/styles.css` | styles |
| `src/maze.js` | labyrinthe généré, personnages, modes de la régie, caméra thermique |
| `src/main.js` | caméras du hero, zapping, lecteurs, audimat, FAQ, navigation |
| `vendor/` | GSAP + ScrollTrigger, Lenis, polices (licences SIL OFL jointes) |

## À vérifier avant une mise en ligne

- La grille de prix exacte (de 25 € à 49 € par joueur selon les fiches publiques).
- Le texte réel de la page Corporate (offre de groupe, privatisation), absent de cette maquette.
- Des extraits vidéo réels pour remplacer les écrans générés des lecteurs.
