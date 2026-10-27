# Accessibilité : nouveau site Feely Developments

**Référence :** WCAG 2.1 niveau AA (et 2.2 pour la taille des cibles et le focus jamais masqué)
**Date :** 27 octobre 2026
**Outils :**
- `tools/a11y.mjs` (Chromium, sur `dist-web` servi en local) ;
- `tools/interact.mjs` (43 essais) ;
- Lighthouse 13.

## En bref

**Points trouvés : 5. Bloquants : 0. Corrigés : 5.**

- **Clavier.** Le site se parcourt entièrement au clavier, dans l'ordre de lecture : 27 arrêts sur ordinateur (dans
  l'enfilade), 22 au téléphone. Dans l'enfilade, la page suit le focus : un lien hors de l'écran y est amené.
- **Focus.** Il se voit partout : un contour plein de 2 px, vert buis sur la chaux (11,3:1), lichen sur le mur vert
  (9,7:1). Il ne passe jamais sous l'en-tête.
- **Contrastes.** Les 52 textes mesurés sur ordinateur et les 11 textes qui rapetissent au téléphone passent les seuils,
  sur les vrais pixels de la page.
- **Au doigt.** Aucune cible ne fait moins de 44 px de haut.
- **Mouvement.** Avec « réduire les animations », il n'y a pas d'enfilade : la page se lit de haut en bas, sans
  défilement lissé, sans apparitions ; tout est déjà en place.
- **Texte agrandi.** Avec un espacement de texte élargi ou au zoom à 200 %, la page passe de haut en bas d'elle-même :
  aucun texte n'est coupé, rien ne défile de côté.
- **Lighthouse.** Accessibilité 100 sur ordinateur et au téléphone.

## Ce qui a été corrigé pendant la construction et l'audit

| # | Problème | Critère | Correction |
|---|---|---|---|
| 1 | Dans l'enfilade, la touche Tab amenait le focus sur un lien hors de l'écran : le navigateur faisait défiler la vue (coupée), et la page ne suivait pas | 2.4.7, 2.4.11 | Le défilement de la vue est rendu à la page : le lien arrive à l'écran ; un essai tabule jusqu'à une licence lointaine |
| 2 | Avec l'espacement de texte élargi (interligne 1,5, lettres +0,12 em, mots +0,16 em), un texte pouvait sortir d'une pièce de hauteur fixe | 1.4.12 | Le script mesure chaque pièce ; si un texte dépasse, la page repasse de haut en bas. Vérifié à 1 440, 1 280 et 390 px |
| 3 | Au doigt, le lien d'évitement et le logo de la fin faisaient moins de 44 px de haut | 2.5.8 (AA : 24 px, respecté) | 44 px |
| 4 | Le cadre d'un détail, blanc, se perdait sur la brique blanchie | 1.4.11 (complément visuel) | La photo s'assombrit autour du cadre : 3,2:1 là où elle est la plus claire |
| 5 | « What is it about? » était décalé de 2 px des autres étiquettes du formulaire (marge par défaut d'une `legend`) | lisibilité | Aligné |

## Constats par principe

### Perceptible

| # | Constat | Critère | État |
|---|---|---|---|
| 1 | **Les trois grandes photos** ont un texte alternatif qui décrit ce qu'on voit (« An entry hall with whitewashed brick walls, two antique doors hung on an iron rail… »). Les six détails sont des figures dont la légende visible dit le contenu ; leur image a un `alt=""` pour ne pas le lire deux fois. Le cadre posé au survol est décoratif (`aria-hidden`). | 1.1.1 | ✅ |
| 2 | **La frise.** Les titres « Design », « Build » et « Live » sont de vrais `h2` ; les barres qui les relient sont décoratives (`aria-hidden`). | 1.1.1, 1.3.1 | ✅ |
| 3 | **La structure des titres.** Un seul h1 (« Custom homes and renovations in Winter Park. »), un h2 par pièce, des h3 pour les étapes, les licences et les deux maisons, sans niveau sauté. Les repères `header`, `nav` (deux, nommés « Rooms » et « Menu »), `main` et `footer` sont présents. | 1.3.1 | ✅ |
| 4 | **L'ordre.** Dans l'enfilade comme de haut en bas, l'ordre du code est celui de la lecture : la page n'est pas réordonnée par la mise en page. | 1.3.2 | ✅ |
| 5 | **Les contrastes du texte.** L'acier fait 14,5:1 sur la chaux ; l'ardoise des légendes, 5,9:1 ; sur le mur vert, le blanc des titres 12,7:1 et le lichen des textes 9,7:1 ; les erreurs, 6,2:1. | 1.4.3 | ✅ |
| 6 | **Les erreurs du formulaire** sont dites en mots, sous leur champ ; elles ne reposent pas sur la couleur. | 1.4.1 | ✅ |
| 7 | **Les contours.** Champs du formulaire : 3,8:1. Puces des sujets : 11,3:1. Bouton clair sur le mur vert : 9,7:1. Cadre d'un détail : 3,2:1 au pire. Les filets entre les étapes et les étages sont décoratifs. | 1.4.11 | ✅ |
| 8 | **Le zoom et l'espacement du texte.** Zoom à 200 % (1 440 × 900 vu en 720 × 450) : la page de haut en bas, sans défilement de côté. Espacement élargi : aucun texte coupé, à 1 440, 1 280 et 390 px. De 320 à 1 024 px au doigt, rien ne dépasse sur le côté. | 1.4.4, 1.4.10, 1.4.12 | ✅ |

### Utilisable

| # | Constat | Critère | État |
|---|---|---|---|
| 1 | **Au clavier**, tout est atteignable : la navigation, les boutons, les licences, « Ask about Palmer Avenue », le formulaire et les liens de la fin. Dans l'enfilade, les flèches gauche et droite font aussi avancer et reculer. | 2.1.1 | ✅ |
| 2 | **Aucun piège.** Le menu du téléphone garde le focus tant qu'il est ouvert (le reste de la page est inerte) ; Échap le ferme et rend le focus au bouton « Menu ». | 2.1.2 | ✅ |
| 3 | **Le défilement de côté n'est pas imposé.** Il n'existe que sur un grand écran en largeur, avec une souris ou un pavé tactile, si les animations sont permises ; la molette, le pavé, la barre de défilement, Page suivante et Espace font avancer, car c'est le défilement normal de la page qui déplace l'enfilade. Partout ailleurs, la page est verticale. | 2.1.1, 1.4.10 | ✅ |
| 4 | **Rien ne bouge seul** au-delà de l'arrivée de chaque pièce (une fois, moins de 1,5 s). Aucun carrousel, aucune vidéo. | 2.2.2 | ✅ |
| 5 | **Le lien d'évitement** « Skip to content » est le premier arrêt et déplace le focus dans `main`. Un lien de la navigation amène la pièce et, au clavier, met le focus sur son titre. | 2.4.1, 2.4.3 | ✅ |
| 6 | **Le titre de la page** dit qui et quoi : « Feely Developments \| Custom Homes in Winter Park, FL ». | 2.4.2 | ✅ |
| 7 | **Le focus est visible** et jamais caché par l'en-tête : vérifié arrêt par arrêt (l'élément sous le point central de chaque arrêt est bien l'élément focalisé). | 2.4.7, 2.4.11 | ✅ |
| 8 | **Les noms des liens** disent où ils mènent : « Certified Building Contractor CBC1268587 » (la fiche du registre), « Feely Developments, back to the start » (le logo). | 2.4.4 | ✅ |
| 9 | **Au doigt**, toutes les cibles font au moins 44 px de haut. | 2.5.8 | ✅ |

### Compréhensible

| # | Constat | Critère | État |
|---|---|---|---|
| 1 | **La langue** de la page est déclarée (`lang="en"`). | 3.1.1 | ✅ |
| 2 | **Rien ne change au focus.** Les puces des sujets et « Ask about Palmer Avenue » ne font que choisir un sujet ; seul le bouton « Send to Ryan » envoie. | 3.2.1, 3.2.2 | ✅ |
| 3 | **Les erreurs** sont annoncées dans le champ (`aria-invalid`, `aria-describedby`) et le focus va au premier champ en erreur : « Enter your name. », « Enter your email address. », « Check your email address. It should look like name@example.com. » | 3.3.1, 3.3.3 | ✅ |
| 4 | **Les étiquettes** sont visibles et reliées : « Name », « Email », « Phone (optional) », « Message (optional) » ; les trois sujets sont un groupe de boutons radio sous « What is it about? ». | 3.3.2 | ✅ |
| 5 | **Ce que fait le bouton** est dit avant l'envoi (« The button opens your email app, with your message addressed to FeelyDev@gmail.com. », relié au formulaire) et confirmé après, dans une zone de statut qui reçoit le focus. | 3.3.2, 4.1.3 | ✅ |

### Robuste

| # | Constat | Critère | État |
|---|---|---|---|
| 1 | **Les états** sont dans le code : la pièce en cours (`aria-current` sur son lien), le menu (`aria-expanded`, `aria-controls`), les champs en erreur (`aria-invalid`). | 4.1.2 | ✅ |
| 2 | **Aucun identifiant en double**, aucune référence cassée, aucun contrôle sans nom. | 4.1.1, 4.1.2 | ✅ |
| 3 | **Sans JavaScript**, la page se lit de haut en bas, avec toutes les photos ; le formulaire reste un formulaire, et la promesse garde sa phrase d'origine (« We get back to you within five business days. »). | robustesse | ✅ |

## Contrastes principaux

| Élément | Texte | Fond | Rapport | Seuil | |
|---|---|---|---|---|---|
| Texte courant, titres, frise | Acier `#1F201E` | Chaux `#F2F1EE` | 14,5:1 | 4,5:1 | ✅ |
| Légendes, notes, « (optional) » | Ardoise `#5B5D59` | Chaux | 5,9:1 | 4,5:1 | ✅ |
| Boutons verts | Chaux | Buis `#22372A` | 12,7:1 | 4,5:1 | ✅ |
| Textes du mur de Palmer Avenue | Lichen `#DCE3D8` | Buis | 9,7:1 | 4,5:1 | ✅ |
| Bouton « Ask about Palmer Avenue » | Buis | Lichen | 9,7:1 | 4,5:1 | ✅ |
| Erreurs | `#A33025` | Chaux | 6,2:1 | 4,5:1 | ✅ |
| Note après l'envoi | Acier | Vert très pâle | 13,4:1 | 4,5:1 | ✅ |
| Contour des champs | Gris Feely `#818181` | Fond du champ | 3,8:1 | 3:1 | ✅ |
| Focus | Buis | Chaux | 11,3:1 | 3:1 | ✅ |
| Cadre d'un détail | Blanc | Photo assombrie, au plus clair | 3,2:1 | 3:1 | ✅ |

## Ce qui reste à tester à la main

- **Un vrai lecteur d'écran** (VoiceOver sur Mac et iPhone, NVDA sur Windows) : la structure, les noms et les états
  sont vérifiés dans le code, pas à l'oreille.
- **Le formulaire branché** : à la mise en ligne, s'il passe par un service d'envoi au lieu de la messagerie du
  visiteur, refaire l'essai des erreurs et du message de confirmation.
- **Un pavé tactile sous Windows** et une souris à molette crantée, pour le confort de l'enfilade (le défilement est
  celui du navigateur, lissé par Lenis).
