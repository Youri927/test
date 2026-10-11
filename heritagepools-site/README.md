# Heritage Pools Texas : nouveau site

Refonte complète de https://heritagepoolstx.com, entreprise de piscines neuves et d'entretien au Texas. L'analyse du site actuel est dans `ANALYSE.md`.

- **À ouvrir** : `dist/index.html`, d'un double-clic (un seul fichier, sans serveur).
- **À mettre en ligne** : le dossier `dist-web/`, à glisser sur app.netlify.com/drop, ou sur Vercel avec `vercel.json`.
  - `_headers` (Netlify) et `vercel.json` demandent aux moteurs de recherche de ne pas indexer la maquette : à retirer au lancement.

Même méthode que Coastal Creations :
- du HTML, du CSS et du JavaScript écrits pour ce site ;
- GSAP et ScrollTrigger pour les animations au défilement, Lenis pour le défilement doux ;
- `build.mjs` pour assembler le tout.

## L'idée : leur journal de chantier

Le site actuel montre des photos de banque d'images. Leurs propres photos racontent pourtant un chantier complet, dans un même jardin. Chaque photo est datée à la minute près par le nom de son fichier :
- le 7 janvier 2018 : la pelouse ;
- le 6 février : la mise en eau ;
- le 17 février : les lumières.

De la pelouse aux lumières : 41 jours. Le site est construit autour de ce chantier.

## La direction

- **Couleurs** :
  - le bleu roi de leur icône (#002BAB, ajusté en #0b2fb3), pour l'accueil, les titres et le contact ;
  - l'encre (#0a1238) pour le texte ;
  - la nuit (#081033) ;
  - l'eau (#2ad1df) ;
  - la brume (#eef2fb) pour la galerie.
- **Les couleurs du chantier** : celles des matériaux, une par étape :
  - gazon (#4c6a2e) ;
  - terre (#8f4a28) ;
  - béton projeté (#62676d) ;
  - pierre (#d6c4a1) ;
  - enduit (#41679f) ;
  - eau (#3cc3d0) ;
  - nuit (#081033).
- **Typographies** :
  - Ultra pour les titres et les chiffres : une slab très grasse, comme les affiches en caractères de bois (licence Apache 2.0) ;
  - Libre Franklin pour le texte : police variable, licence OFL.
- **Logo** : un logotype à leur nom à la place du nageur en clipart. « Heritage » est en Ultra, « Pools Texas » en Libre Franklin. L'icône d'onglet est un H à empattements sur le bleu roi.

## La page

### L'ouverture : le chantier au défilement

C'est le moment fort du site. L'écran reste en place pendant environ cinq hauteurs d'écran, et le chantier se déroule à mesure qu'on descend, sur ordinateur comme sur téléphone.

- **Au départ**, sur le vert du gazon :
  - « Lawn to lights in 41 days. » ;
  - la photo de la pelouse ;
  - les boutons de rendez-vous et d'appel ;
  - en bas, la règle des jours, du 7 janvier au 17 février.
- **En descendant** :
  - le titre laisse la place à un compteur géant, « Day 0 », qui avance jour après jour ;
  - les 11 photos arrivent une à une, chacune avec sa date, son heure et une légende qui décrit ce qu'on voit ;
  - pendant les 19 jours où la coque sèche, le compteur continue de tourner sur la même photo.
- **Toute la page prend la couleur du matériau du moment** : gazon, terre, béton projeté, pierre, enduit, eau, puis nuit. Le texte, les boutons et l'en-tête suivent.
- **Au jour 30, l'eau monte** : une vague turquoise recouvre l'écran avant la photo de la mise en eau.
- **Au jour 41, la nuit tombe** : la piscine s'allume, sa lueur se répand autour de la photo et le bouton « Schedule an appointment » apparaît.
- **La règle des jours** suit le défilement, avec un point par photo. On peut aussi :
  - cliquer sur un jour ;
  - la faire glisser, à la souris ou au doigt ;
  - la piloter au clavier (flèches, Début, Fin).

  Dans tous les cas, la page défile jusqu'au jour choisi.

### La suite

- **What we do**, sur le bleu roi : leurs six services en très grand. Chaque nom arrive en glissant, un d'un côté, un de l'autre, puis son filet se trace et sa phrase apparaît. Les services :
  - les piscines neuves ;
  - les inspections par des inspecteurs agréés ;
  - les réparations ;
  - la rénovation ;
  - le ré-enduit ;
  - l'entretien.

  Puis leur phrase « With Heritage Pools TX on your side… ».
- **More of our pools** : 41 photos de leurs autres chantiers, rangées par année puis par chantier, chacune avec sa date.
  - À gauche, l'année en très grand tourne comme un compteur quand on passe de 2018 à 2019, 2020, puis 2022.
  - Les photos de chaque chantier se découvrent l'une après l'autre.
  - Une photo s'ouvre en grand dans une visionneuse (précédente, suivante, Échap pour fermer).
  - Sur téléphone, chaque chantier défile de côté.
- **After dark** :
  - la grande photo s'allume à mesure qu'on arrive dessus ;
  - deux boutons éclairent la même piscine en bleu ou en rouge, et la lueur autour de la photo prend la couleur choisie ;
  - à côté, la vasque allumée le soir de la mise en eau (6 février 2018, 17 h 57) et un éclairage bleu d'avril 2020.
- **From the founders** : leur message, puis « Trust, integrity and honesty are what we stand for. » en très grand, qui s'allume mot à mot à la lecture.
- **Schedule an appointment**, sur le bleu roi :
  - le numéro en très grand et l'e-mail ;
  - les horaires, avec « ouvert maintenant » ou « fermé » selon l'heure du Texas (fuseau du Centre) ;
  - le formulaire. Il vérifie les champs, puis ouvre la messagerie du visiteur avec le message prêt, adressé à HeritagepoolsTexas@gmail.com. Le site n'a pas de serveur pour l'envoyer lui-même.
- **Le pied de page** : le logotype, leur slogan, le contact, les horaires et les liens. « Heritage » monte en très grand, en bleu électrique sur la nuit.

**Sur téléphone** : une barre en bas (Call, Schedule) apparaît une fois l'ouverture entamée, et s'efface au contact. Le menu s'ouvre en plein écran.

**Avec le réglage « moins d'animations »** (ou un écran très bas) : rien n'est épinglé. L'accueil montre le titre et la pelouse, puis les 11 photos du chantier se suivent, chacune sur sa bande de couleur.

## Rien d'inventé

- **Les textes** viennent de leurs pages, avec les fautes corrigées :
  - « next lever » devient « next level » ;
  - « easimate » devient « estimate » ;
  - « rest assure » devient « rest assured » ;
  - « you and your pool is » et « Trust, integrity and honesty is » passent au pluriel ;
  - « texas » prend sa majuscule.

  Les phrases des services sont tirées de leurs intitulés. La phrase « We go an extra mile » devient « We go the extra mile ».
- **Les dates et les heures** viennent du nom des fichiers photo. Le compte des jours en découle : 30 jours jusqu'à l'eau, 41 jusqu'aux lumières.
- **Les légendes** décrivent ce qu'on voit sur les photos.
- **Pas de ville, de numéro de licence, de nom ni de chiffre** (années d'expérience, nombre de piscines) : leur site n'en donne pas.
- **Écarté** :
  - les photos de banque d'images ;
  - les fichiers du thème de comptable ;
  - le nageur en clipart ;
  - une photo de 2022 sur laquelle un cercle jaune a été dessiné.

## À confirmer avec eux

- **La ville et la zone d'intervention.** L'indicatif 281 correspond à la région de Houston. Elles iraient dans l'accueil, le contact et les données pour Google.
- **Le numéro de licence des inspecteurs** (« Licensed Pool Inspectors »).
- **Les noms des fondateurs**, pour signer leur message.
- **Le pavillon et la cuisine d'été** (2018 et 2022) : les ont-ils construits ?
- **Les deux photos de nuit, bleue et rouge** (IMG_3328 et IMG_3329) : est-ce bien la même piscine ?
- **Le fuseau horaire** : « ouvert maintenant » suit l'heure du Centre (Houston).
- **Le slogan** « Amazing pools at amazing prices. » est repris en pied de page : à garder ?

## Mesures

Lighthouse sur `dist-web`, servi en local avec compression :
- **téléphone** : 99 en performance sur 4 passages ; LCP 1,8 s ; temps de blocage de 0 à 30 ms ;
- **ordinateur** : 100 ;
- **accessibilité, bonnes pratiques et SEO** : 100 partout.

Vérifié aussi :
- de 320 à 1920 px de large, sans débordement ;
- au clavier : lien d'évitement en premier, contours de focus visibles ;
- avec le réglage « moins d'animations » ;
- la règle des jours : clic, glisser à la souris et au doigt, flèches, Début et Fin ;
- la visionneuse, les lumières, l'année-compteur, le menu, la barre du téléphone, le formulaire et les horaires.

## Fabrication

- **`node build.mjs`** assemble :
  - `dist/index.html`, tout intégré (3,8 Mo) ;
  - `dist-web/`, une page de 231 Ko avec les photos et les polices en fichiers séparés ; la première photo du chantier est préchargée.
- **Ce qui attend le visiteur** :
  - les photos 2 à 11 du chantier se chargent au premier geste (clic, doigt, molette, clavier, défilement) ou deux secondes après le premier affichage : le premier écran garde la connexion pour lui ;
  - les animations des parties du bas se mettent en place au premier geste, en petites étapes.
- **`src/`** : `index.html`, `styles.css`, `main.js` et `img/` (les photos en AVIF).
- **`data/photos.json`** liste les photos retenues : fichier d'origine, largeur, date.
  - `python3 -I tools/images.py <dossier des photos d'origine>` refait les AVIF et `data/photo-sizes.json`.
  - Les photos du chantier existent en 1008 et en 760 px de large : le navigateur prend la taille qu'il faut.
- **`vendor/`** : GSAP, ScrollTrigger, Lenis, et les polices avec leurs licences.
- **`boards/`** : les planches de captures (accueil, chantier, sections, téléphone).
