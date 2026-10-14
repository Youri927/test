## Audit d'accessibilité : nouveau site Mendieta Roofing
**Norme :** WCAG 2.1 AA, avec deux critères de la 2.2 en plus (2.4.11 focus non masqué, 2.5.8 taille des cibles) | **Date :** 14 octobre 2026

Page auditée : `dist-web/index.html`, servie en local. Testée sur ordinateur (de 1000 à 1920 px), sur tablette et
sur téléphone (de 320 à 999 px).

Méthode :
- Lighthouse, sur ordinateur et sur téléphone ;
- scripts Playwright :
  - `tools/a11y.mjs` :
    - parcours complet au clavier, focus caché ou non ;
    - cibles tactiles, menu ouvert compris ;
    - contrastes mesurés sur les vrais pixels : tout le texte de la page est masqué, pour ne garder que le fond ;
    - contours, traits de la coupe et de la carte, contours de focus ;
    - espacement du texte élargi ;
    - titres, noms des contrôles, textes alternatifs, références entre éléments ;
  - `tools/interact.mjs` : 71 essais de chaque interaction à la souris, au doigt et au clavier, mouvement réduit,
    arrivée au milieu de la page, débordements sur 18 largeurs d'écran ;
- arbre d'accessibilité de Chromium, lu partie par partie.

Pas de test avec un vrai lecteur d'écran (VoiceOver ou NVDA) : il reste à faire avant la mise en ligne.

### Résumé
**Problèmes trouvés :** 9 | **Critiques :** 1 | **Majeurs :** 2 | **Mineurs :** 6

**Les 9 sont corrigés dans cette version.**

Lighthouse Accessibilité : 100 sur ordinateur et sur téléphone (Bonnes pratiques, SEO et navigation par agents : 100
aussi).

### Constats

#### Perceptible
| # | Problème | Critère WCAG | Gravité | Correction |
|---|----------|--------------|---------|------------|
| 1 | À 320 px, la carte de la licence (son grand numéro) et la partie du secteur (liste et carte) étaient plus larges que l'écran : la page défilait de côté. | 1.4.10 Redistribution | 🔴 Critique | Corrigé : les colonnes peuvent rétrécir sous la largeur de leur contenu, et le numéro de licence suit la largeur de l'écran. Aucun débordement sur 18 largeurs, de 320 à 1920 px. |
| 2 | Les photos des chantiers : la liste portait elle-même le rôle de panneau d'onglets, et ses éléments n'étaient plus reconnus comme les éléments d'une liste. | 1.3.1 Information et relations | 🟡 Majeur | Corrigé : le rôle de panneau est porté par une enveloppe ; la liste des 21 photos reste une liste. |
| 3 | Carte : les noms des villes, posés sur la carte, passaient tantôt sur le blanc, tantôt sur une ville colorée. | 1.4.3 Contraste (minimum) | 🟢 Mineur | Corrigé : chaque nom a un fond blanc ; le pire point mesuré est à 6,22:1. |

#### Utilisable
| # | Problème | Critère WCAG | Gravité | Correction |
|---|----------|--------------|---------|------------|
| 4 | Téléphone : cachée (sur l'accueil, le devis et le pied de page), la barre d'appel gardait ses deux liens dans l'ordre de tabulation ; le focus arrivait sur des liens invisibles. | 2.4.7 Visibilité du focus (et 2.4.3) | 🟡 Majeur | Corrigé : cachée, la barre n'a plus de liens actifs (`visibility: hidden`). |
| 5 | Téléphone : un champ ou un lien qui reçoit le focus près du bas de l'écran pouvait passer sous la barre d'appel. | 2.4.11 Focus non masqué | 🟢 Mineur | Corrigé : la page garde 84 px libres au-dessus de la barre (`scroll-padding-bottom`). Aucun focus caché sous l'en-tête ni sous la barre. |
| 6 | Téléphone : des cibles faisaient moins de 44 px : des liens de l'en-tête, du menu et du pied de page (38 px de haut), les deux numéros du pied de page (22 px). Toutes passaient le minimum de 24 px de la 2.2, par leur taille ou leur espacement. | 2.5.8 Taille des cibles (et 2.5.5) | 🟢 Mineur | Corrigé : 44 px de haut pour toutes, sans changer la mise en page (la marge ou un débord invisible passe dans la zone cliquable). Reste sous 44 px un seul lien, pris dans une phrase et donc exempté : le numéro de licence de l'accueil. |

#### Compréhensible
| # | Problème | Critère WCAG | Gravité | Correction |
|---|----------|--------------|---------|------------|
| 7 | La note sous le bouton du formulaire disait « This opens your phone's messages » sur ordinateur aussi, où le bouton prépare un texte à copier. | 3.3.2 Étiquettes ou instructions | 🟢 Mineur | Corrigé : une note pour le téléphone, une pour l'ordinateur, choisie comme le fait le bouton. |

Rien d'autre à signaler sur le formulaire :
- chaque champ a son étiquette visible, le message est marqué « (optional) » ;
- les deux choix (type de toit, besoin) sont des groupes de boutons radio avec leur légende ;
- une erreur dit quoi faire (« Enter a phone number with the area code, like (561) 555-0123. »), s'affiche sous le
  champ, et elle est reliée au champ (`aria-describedby`, `aria-invalid`) ;
- à l'envoi, le focus va au premier champ à corriger ;
- le bouton dit ce qui va se passer (« Write my text to Mendieta »), et la note précise que rien n'est envoyé par la
  page.

Rien ne change au focus seul (3.2.1) : les filtres des photos agissent aux flèches comme des onglets, ce qui est le
comportement attendu, et le nombre de photos affichées est annoncé.

#### Robuste
| # | Problème | Critère WCAG | Gravité | Correction |
|---|----------|--------------|---------|------------|
| 8 | Les boutons des photos ouvrent une visionneuse sans l'annoncer. | 4.1.2 Nom, rôle et valeur | 🟢 Mineur | Corrigé : `aria-haspopup="dialog"` ; chaque bouton est nommé par la description de sa photo. |
| 9 | Visionneuse : en passant à la photo suivante, rien n'était annoncé ; le focus restait sur « Next ». | 4.1.3 Messages d'état | 🟢 Mineur | Corrigé : la légende et le compteur (« 4 of 21 ») sont annoncés. La photo affichée garde la description de la vignette. |

Chaque composant expose son nom, son rôle et son état (tableau « Lecteur d'écran »). Aucun identifiant en double,
aucune référence cassée (`aria-labelledby`, `aria-describedby`, `aria-controls`, `for`).

### Contrôle des contrastes
75 mesures de texte : tout est au-dessus du seuil, de 6,22:1 à 17,34:1. Le texte courant ne descend pas sous
7,60:1.

| Élément | Texte | Fond | Rapport | Exigé | OK ? |
|---------|-------|------|---------|-------|------|
| Titres, texte principal, liens, boutons à contour | #0B1B4D | #FFFFFF | 16,43:1 | 4,5:1 | ✅ |
| Les mêmes sur le fond ciel (coupe, photos, secteur) | #0B1B4D | #EAF1FA | 14,44:1 | 4,5:1 | ✅ |
| Texte secondaire (chapôs, étapes, légendes, intitulés de la licence) | #3D4B6E | #FFFFFF | 8,64:1 | 4,5:1 | ✅ |
| Texte secondaire sur le fond ciel, légendes des photos | #3D4B6E | #EAF1FA | 7,60:1 | 4,5:1 | ✅ |
| Bouton jaune (« Get a free estimate », « Write my text to Mendieta ») | #0B1B4D | #FFC93C | 10,70:1 | 4,5:1 | ✅ |
| Avis et pied de page : texte | #FFFFFF | #0B1B4D | 16,43:1 | 4,5:1 | ✅ |
| Avis : villes, mention Porch ; pied de page : intitulés | #C9D5EE | #0B1B4D | 11,14:1 | 4,5:1 | ✅ |
| Filtre choisi : nombre | #C9D5EE | #0B1B4D | 11,14:1 | 4,5:1 | ✅ |
| Erreurs du formulaire | #B3261E | #FFFFFF | 6,54:1 | 4,5:1 | ✅ |
| Carte : noms des villes (pire point, fond blanc à 94 %) | #0B1B4D | la carte | 6,22:1 | 4,5:1 | ✅ |
| Carte : comtés / « Atlantic Ocean » | #3D4B6E | #FFFFFF / #D6E4F5 | 8,64 / 6,70:1 | 4,5:1 | ✅ |
| Visionneuse : légende, compteur, « Close » | #C9D5EE / #FFFFFF | marine | 12,99 / 11,75 / 17,34:1 | 4,5:1 | ✅ |
| Contour d'un filtre des photos | #7D8AA8 | #EAF1FA | 3,04:1 | 3:1 | ✅ |
| Contours des champs et des choix du formulaire | #7D8AA8 | #FFFFFF | 3,46:1 | 3:1 | ✅ |
| Contours des boutons à contour, cadre de la licence, numéros des étapes | #0B1B4D | #FFFFFF | 16,43:1 | 3:1 | ✅ |
| Coupe : traits des tuiles et du voligeage | #0B1B4D | #FFFFFF | 16,43:1 | 3:1 | ✅ |
| Carte : côte et limites des comtés | #0B1B4D | #EAF1FA | 14,44:1 | 3:1 | ✅ |
| Contour de focus (3 px) | #0B1B4D / #FFC93C | fonds clairs / marine | 16,43 / 10,70:1 | 3:1 | ✅ |

Rien n'est dit par la couleur seule (1.4.1) :
- sur ordinateur, l'étape en cours a son numéro plein et la frise remplie jusqu'à elle ; elle est annoncée
  (`aria-current="step"`) ;
- le filtre choisi est plein et annoncé « sélectionné » ;
- sur la coupe, la couche en cours est en jaune et son étiquette passe en gras ;
- les erreurs du formulaire sont écrites, pas seulement en rouge.

### Navigation au clavier
54 arrêts sur ordinateur, 48 sur téléphone, dans l'ordre de lecture ; focus toujours visible (3 px), jamais caché
sous l'en-tête ni sous la barre d'appel.

| Élément | Ordre | Entrée / Espace | Échap | Flèches |
|---------|-------|-----------------|-------|---------|
| Lien « Skip to content » | 1er | Va au contenu | — | — |
| En-tête : nom, 5 liens, téléphone, « Free estimate » | 2 à 9 | Le nom remonte en haut ; un lien fait défiler jusqu'à la partie, qui reçoit le focus ; le téléphone appelle | — | — |
| Bouton « Menu » (jusqu'à 1099 px) | après le nom | Ouvre le menu, focus sur « Close » ; la page dessous devient inerte, Tab reste dans le menu | Ferme le menu, focus sur « Menu » | — |
| Accueil : « Get a free estimate », « Call (561) 797-5457 », numéro de licence | ensuite | Va au devis ; appelle ; va à la licence | — | — |
| Couche par couche | aucun arrêt | Le défilement au clavier (flèches, Espace, Page suivante) fait avancer la coupe | — | — |
| Photos : filtres | un seul arrêt | — | — | Gauche, droite, Début, Fin : changent de filtre ; le nombre affiché est annoncé |
| Photos : les 21 vignettes | ensuite | Ouvre la visionneuse, focus sur « Close » | Ferme, focus rendu à la vignette | Gauche, droite : photo précédente, suivante (en boucle) |
| Licence : vérification | ensuite | Ouvre le site de l'État dans un nouvel onglet (annoncé) | — | — |
| Secteur : champ « Check your city », bouton « Check » | ensuite | Répond sous le champ (annoncé) | — | — |
| Devis : appel, texto, 2 groupes de choix, 4 champs, bouton | ensuite | Appelle ; ouvre la messagerie ; vérifie le formulaire, focus sur le premier champ à corriger, ou prépare le message | — | Changent de choix dans un groupe |
| Pied de page : deux numéros, six liens | à la fin | Appellent ; font défiler jusqu'à la partie | — | — |

### Lecteur d'écran
Relevé dans l'arbre d'accessibilité de Chromium. Reste à confirmer avec VoiceOver et NVDA.

| Élément | Annoncé comme | Problème |
|---------|---------------|----------|
| Repères | bannière, navigation « Main », principal, pied de page avec sa navigation « Footer » ; chaque partie est une région nommée par son titre | Aucun |
| Nom de l'en-tête | lien « Mendieta Roofing Corp., back to the top » | Aucun |
| Menu | dialogue modal « Menu », bouton « Close », navigation « Menu » | Aucun |
| Accueil | titre de niveau 1 « Family roofers in West Palm Beach since 1988. » ; figure nommée par sa légende, photo décrite | Aucun |
| Couche par couche | image « Cross-section of a tile roof at the eave… » qui décrit les quatre couches ; liste ordonnée de quatre étapes, chacune avec son titre de niveau 3, l'étape en cours marquée ; photos décrites | Aucun |
| Photos | liste d'onglets (« All 21 », « Tile 10 », « Shingle 9 », « On the job 6 »), l'onglet choisi « sélectionné » ; panneau nommé par l'onglet choisi ; message « Showing 10 tile roof photos. » ; 21 boutons nommés par la description de leur photo, avec « ouvre une boîte de dialogue » | Aucun |
| Visionneuse | dialogue modal « Photo » ; photo décrite ; légende et compteur annoncés à chaque changement ; boutons « Previous », « Next », « Close » | Aucun |
| Avis | titre de niveau 2 ; chaque avis en citation, signé dans sa légende | Aucun |
| Licence | liste de définitions (Type, Held by, Licensed since, Status) ; lien « Look it up on myfloridalicense.com (opens in a new tab) » | Aucun |
| Secteur | recherche « Check your city » : champ, bouton, réponse annoncée ; deux listes de villes sous leur titre de comté ; carte en image, avec une description qui nomme les deux comtés, les 25 villes de Jupiter à Pembroke Pines et la base | Aucun |
| Formulaire | groupes « What kind of roof? » et « What do you need? » ; champs nommés par leur étiquette ; erreur lue avec le champ ; état « invalide » sur les champs à corriger ; message prêt, titre « Your request is ready. », bouton « Copy the message » | Aucun |

### Mouvement
- Avec « réduire les animations » :
  - pas d'ouverture : le titre, la photo et sa légende sont là dès l'affichage ;
  - pas de défilement doux ;
  - la coupe est complète, et la partie n'est pas épinglée ;
  - les photos, la carte et les villes sont visibles d'emblée ;
  - aucune transition.
- Sans ce réglage :
  - une seule ouverture, 1,9 s, jouée au chargement : le titre monte ligne par ligne, la photo se découvre du bas
    vers le haut, sans zoom ; rien ne clignote, la page ne se décale pas (CLS 0) et rien ne la bloque ;
  - en réponse au défilement : la coupe se monte et se démonte avec lui ; les photos se découvrent du bas vers le
    haut en arrivant (0,7 s) ; les villes de la carte se colorent une à une, une fois (1,7 s en tout) ;
  - en réponse à un geste : la visionneuse s'ouvre (0,3 s), les photos filtrées se découvrent ;
  - rien ne se répète en boucle.

### Corrections prioritaires
Toutes les corrections ci-dessus sont faites. Il reste :
1. **Tester avec VoiceOver (iPhone) et NVDA (Windows)** : surtout les onglets des photos (nombre annoncé), la
   visionneuse (légende et compteur), la coupe (description et étape en cours) et les erreurs du formulaire.
2. **Le formulaire ouvre la messagerie du visiteur au téléphone, et prépare un texte à copier sur ordinateur.** Les
   deux numéros sont écrits en grand juste au-dessus ; un vrai envoi par le site demandera un service de
   formulaire, à choisir avec l'entreprise.
3. **Le lien de vérification mène au site de l'État** (myfloridalicense.com) : son accessibilité ne dépend pas de
   nous. Le numéro, le titulaire et le statut de la licence sont écrits en texte sur la page.
