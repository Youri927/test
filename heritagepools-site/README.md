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

- **L'accueil**, sur le bleu roi : « Lawn to lights in 41 days. » À côté, le film du chantier :
  - les 11 photos défilent en accéléré, de la pelouse aux lumières ;
  - le jour et l'heure de chaque photo s'affichent, et une barre avance de 0 à 41 jours ;
  - le film part au premier geste du visiteur (clic, doigt, molette, clavier) ou au bout de deux secondes, puis s'arrête sur la piscine allumée ;
  - « Watch it again » le relance.
- **One backyard, 41 days.** : sur ordinateur, l'écran reste en place et les 11 photos passent une à une.
  - Chaque photo a son jour (Day 0 à Day 41), sa date, son heure et une légende qui décrit ce qu'on voit.
  - Le fond prend la couleur du matériau du moment : gazon, terre, béton projeté, pierre, enduit, eau, puis nuit.
  - En bas, une règle des jours va du 7 janvier au 17 février, avec un point par photo.
  - Sur téléphone, les photos se suivent, chacune sur sa bande de couleur.
- **What we do** : leurs six services en très grand, avec une phrase chacun :
  - les piscines neuves ;
  - les inspections par des inspecteurs agréés ;
  - les réparations ;
  - la rénovation ;
  - le ré-enduit ;
  - l'entretien.

  Puis leur phrase « With Heritage Pools TX on your side… ».
- **More of our pools** : 41 photos de leurs autres chantiers, rangées par année (2018, 2019, 2020, 2022) puis par chantier, chacune avec sa date.
  - Une photo s'ouvre en grand dans une visionneuse (précédente, suivante, Échap pour fermer).
  - Sur téléphone, chaque chantier défile de côté.
- **After dark** :
  - la même piscine éclairée en bleu ou en rouge, au choix (deux boutons) ;
  - la vasque allumée le soir de la mise en eau (6 février 2018, 17 h 57) ;
  - un éclairage bleu d'avril 2020.
- **From the founders** : leur message, puis « Trust, integrity and honesty are what we stand for. » en très grand.
- **Schedule an appointment**, sur le bleu roi :
  - le numéro en très grand et l'e-mail ;
  - les horaires, avec « ouvert maintenant » ou « fermé » selon l'heure du Texas (fuseau du Centre) ;
  - le formulaire. Il vérifie les champs, puis ouvre la messagerie du visiteur avec le message prêt, adressé à HeritagepoolsTexas@gmail.com. Le site n'a pas de serveur pour l'envoyer lui-même.
- **Le pied de page** : le logotype, leur slogan, le contact, les horaires et les liens.

**Sur téléphone** : une barre en bas (Call, Schedule) apparaît une fois l'accueil passé, et s'efface au contact. Le menu s'ouvre en plein écran.

**Avec le réglage « moins d'animations »** : pas de film ni d'écran épinglé. La piscine allumée s'affiche d'emblée, et les 11 photos du chantier se suivent.

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
- **téléphone** : 98, 98, 99 et 98 en performance, sur 4 passages ; LCP 1,9 s ; 211 Ko au chargement ;
- **ordinateur** : 100 ;
- **accessibilité, bonnes pratiques et SEO** : 100 partout.

Vérifié aussi :
- de 320 à 1920 px de large, sans débordement ;
- au clavier : lien d'évitement en premier, contours de focus visibles ;
- avec le réglage « moins d'animations » ;
- la visionneuse, les lumières, le menu, la barre du téléphone, le formulaire et les horaires.

## Fabrication

- **`node build.mjs`** assemble :
  - `dist/index.html`, tout intégré (3,8 Mo) ;
  - `dist-web/`, une page de 216 Ko avec les photos et les polices en fichiers séparés ; la première photo du film est préchargée.
- **`src/`** : `index.html`, `styles.css`, `main.js` et `img/` (les photos en AVIF).
- **`data/photos.json`** liste les photos retenues : fichier d'origine, largeur, date.
  - `python3 -I tools/images.py <dossier des photos d'origine>` refait les AVIF et `data/photo-sizes.json`.
  - Les photos du chantier existent en 1008 et en 760 px de large : le navigateur prend la taille qu'il faut.
- **`vendor/`** : GSAP, ScrollTrigger, Lenis, et les polices avec leurs licences.
- **`boards/`** : les planches de captures (accueil, chantier, sections, téléphone).
