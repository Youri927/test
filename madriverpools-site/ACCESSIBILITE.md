## Audit d'accessibilité : nouveau site Mad River Pools
**Norme :** WCAG 2.1 AA (avec les critères 2.5.8 et 2.4.11 de la 2.2 en bonus) | **Date :** 11 octobre 2026

Page auditée : `dist-web/index.html`, servie en local, sur ordinateur (1440, 1280, 1180, 1024 px) et sur téléphone (390, 360, 320 px).

Méthode :
- Lighthouse (ordinateur et téléphone) ;
- scripts Playwright :
  - parcours complet au clavier ;
  - mesure des cibles tactiles ;
  - contraste mesuré sur les vrais pixels, sous les lettres seulement ;
  - largeur 320 px ;
  - espacement du texte élargi ;
  - mouvement réduit ;
  - arbre d'accessibilité lu par les lecteurs d'écran.

Pas de test avec un vrai lecteur d'écran (VoiceOver ou NVDA) : il reste à faire avant la mise en ligne.

### Résumé
**Problèmes trouvés :** 10 | **Critiques :** 0 | **Majeurs :** 4 | **Mineurs :** 6

**Les 10 sont corrigés dans cette version.**

Lighthouse Accessibilité : 100 sur ordinateur, 100 sur téléphone.

### Constats

#### Perceptible
| # | Problème | Critère WCAG | Gravité | Correction |
|---|----------|--------------|---------|------------|
| 1 | Les 8 photos de « Vinyl liner shapes » étaient toutes annoncées alors qu'une seule est visible, et toute la figure était une zone annoncée à chaque changement. | 1.3.1 Information et relations | 🟡 Majeur | Corrigé : seule la photo visible reste lue (`aria-hidden` sur les autres). Seule la légende (« Kidney, 15 × 30 ft ») est annoncée au changement. |
| 2 | Défilement horizontal à 320 px : la plus longue forme (18 × 75 ft) dépassait de 37 px. | 1.4.10 Redistribution | 🟡 Majeur | Corrigé : l'échelle en pieds se calcule sur la largeur de l'écran. Les formes restent toutes à la même échelle. Plus aucun débordement de 1440 à 320 px. |
| 3 | Contour de focus bleu canard sur les fonds sombres (contact, pied de page, barre d'appel, visionneuse) : 2,83:1. | 1.4.11 Contraste du non-textuel | 🟡 Majeur | Corrigé : le contour passe au bleu clair (#3FD0E8) sur fond sombre, soit 9,62:1. |
| 4 | Bords des cases « What are you thinking about? » (2,57:1) et des champs du formulaire (2,39:1). | 1.4.11 Contraste du non-textuel | 🟢 Mineur | Corrigé : bords à 50 % de blanc. Mesuré sur les pixels réels : 4,25:1 et 4,78:1. |
| 5 | Contour de focus des vignettes de la galerie dessiné sur la photo : contraste variable selon l'image. | 1.4.11 Contraste du non-textuel | 🟢 Mineur | Corrigé : triple contour sombre, clair, sombre, visible sur n'importe quelle photo. |
| 6 | Avec l'espacement du texte élargi, le titre de l'accueil débordait de 27 px sur téléphone. | 1.4.12 Espacement du texte | 🟢 Mineur | Corrigé : chaque morceau du titre peut passer à la ligne si nécessaire. Rien n'est coupé à 1440, 1180, 1024, 390 et 320 px. |

#### Utilisable
| # | Problème | Critère WCAG | Gravité | Correction |
|---|----------|--------------|---------|------------|
| 7 | Menu ouvert sur téléphone : la touche Tab pouvait partir dans la page cachée sous le menu. | 2.4.3 Parcours du focus | 🟡 Majeur | Corrigé : la page devient inerte tant que le menu est ouvert. Échap le referme et rend le focus au bouton « Menu ». |
| 8 | Cibles de moins de 44 px sur téléphone : logo (28 px de haut), bouton du menu (38 px de large), liens « Ask about… » et « or call » (26 px), téléphone et courriel du contact (26 px), cases du formulaire (42 px). | 2.5.5 Taille de la cible (44 px), 2.5.8 (24 px) | 🟢 Mineur | Corrigé : zones de clic agrandies à 44 px par une marge invisible. Le texte ne bouge pas et la mise en page est identique. |

#### Compréhensible
| # | Problème | Critère WCAG | Gravité | Correction |
|---|----------|--------------|---------|------------|
| 9 | Les champs en erreur étaient marqués invalides, mais pas reliés au message qui dit quoi corriger. | 3.3.1 Identification des erreurs | 🟢 Mineur | Corrigé : chaque champ en erreur renvoie au message (`aria-describedby`). Le message est annoncé dès l'envoi (`role="alert"`), et le curseur va au premier champ à compléter. |

#### Robuste
| # | Problème | Critère WCAG | Gravité | Correction |
|---|----------|--------------|---------|------------|
| 10 | Sur un téléphone de 320 px, l'adresse courriel du contact dépassait de sa colonne de 16 px. | 1.4.10 Redistribution | 🟢 Mineur | Corrigé : colonne des libellés plus étroite sous 420 px. L'adresse tient sur une ligne. |

Rien d'autre à signaler en robustesse. Chaque composant expose son nom, son rôle et son état (détails dans le tableau « Lecteur d'écran »).

### Contrôle des contrastes
Chaque texte a aussi été mesuré sur les vrais pixels, en ne gardant que la zone sous les lettres (en-tête visible, sans soulignés ni pictogrammes). Les résultats sont identiques aux calculs ci-dessous.

| Élément | Texte | Fond | Rapport | Exigé | OK ? |
|---------|-------|------|---------|-------|------|
| Texte courant | #17232B | #F4F5F1 | 14,62:1 | 4,5:1 | ✅ |
| Texte secondaire (chapôs, notes, règle des formes) | #4A5861 | #F4F5F1 | 6,71:1 | 4,5:1 | ✅ |
| Texte secondaire sur travertin | #4A5861 | #E8E0D2 | 5,60:1 | 4,5:1 | ✅ |
| Liens « Ask about… », licence | #076A7B | #F4F5F1 | 5,71:1 | 4,5:1 | ✅ |
| Liens sur travertin | #076A7B | #E8E0D2 | 4,77:1 | 4,5:1 | ✅ |
| Bouton orange | #17232B | #F57A1F | 5,86:1 | 4,5:1 | ✅ |
| Bouton orange survolé | #17232B | #FF8E3C | 7,00:1 | 4,5:1 | ✅ |
| Onglet ou filtre choisi | #F4F5F1 | #17232B | 14,62:1 | 4,5:1 | ✅ |
| Texte de la section de nuit | #F4F5F1 | #0A1A23 | 16,18:1 | 4,5:1 | ✅ |
| Libellés du contact (62 % de blanc) | rgba(244,245,241,.62) | #0A1A23 | 6,83:1 | 4,5:1 | ✅ |
| Liens du contact | #FFFFFF | #0A1A23 | 17,72:1 | 4,5:1 | ✅ |
| Pastille « Open now » | #3FD0E8 | bleu clair à 16 % sur la nuit | 6,89:1 | 4,5:1 | ✅ |
| Pastille « Closed now » | rgba(244,245,241,.75) | blanc à 10 % sur la nuit | 7,70:1 | 4,5:1 | ✅ |
| Case cochée du formulaire | #0A1A23 | #3FD0E8 | 9,62:1 | 4,5:1 | ✅ |
| Contour de focus, fonds clairs | #076A7B | #F4F5F1 / #E8E0D2 | 5,71 / 4,77:1 | 3:1 | ✅ |
| Contour de focus, fonds sombres | #3FD0E8 | #0A1A23 | 9,62:1 | 3:1 | ✅ |
| Bords des onglets et filtres | #17232B | #F4F5F1 | 14,62:1 | 3:1 | ✅ |
| Bords des cases et des champs (pixels réels) | blanc à 50 % | fond du formulaire | 4,25 / 4,78:1 | 3:1 | ✅ |

Le rond orange du logo (2,50:1 sur le fond clair) fait partie du logo : il est exempté.

### Navigation au clavier
85 arrêts de tabulation dans l'ordre de lecture, focus toujours visible et jamais caché par l'en-tête.

| Élément | Ordre | Entrée / Espace | Échap | Flèches |
|---------|-------|-----------------|-------|---------|
| Lien « Skip to content » | 1er | Va au contenu | — | — |
| En-tête : logo, 6 liens, téléphone, « Free home visit » | 2 à 10 | Suit le lien, la section arrive sous l'en-tête | — | — |
| Bouton « Menu » (sous 1180 px) | après le logo | Ouvre ou ferme le menu ; la page derrière devient inerte | Ferme le menu, focus sur « Menu » | — |
| Formes à l'échelle (8 boutons) | dans l'ordre de la liste | Choisit la forme : photo et légende changent | — | — |
| Onglets « What's wrong with your pool? » | un seul arrêt (focus mobile) | — | — | Gauche et droite changent d'onglet ; Début et Fin vont au premier et au dernier |
| Projets avant/après (« Project 1 of 3 ») | après le texte du panneau | Montre la paire de photos | — | — |
| Filtres de la galerie | 5 boutons | Filtre les photos (état « pressé ») | — | — |
| Vignettes de la galerie | 22 boutons | Ouvre la visionneuse ; le focus y reste enfermé | Ferme, le focus revient sur la vignette | Gauche et droite : photo précédente ou suivante |
| Questions fréquentes (6 volets) | dans l'ordre | Ouvre ou ferme la réponse | — | — |
| Formulaire : 5 cases, 7 champs, envoi | dans l'ordre | Coche ; envoi : message d'erreur ou courriel préparé | — | — |
| Barre d'appel (téléphone) | après le pied de page | Appelle ou va au formulaire | — | — |

### Lecteur d'écran
Relevé dans l'arbre d'accessibilité de Chromium. Reste à confirmer avec VoiceOver et NVDA.

| Élément | Annoncé comme | Problème |
|---------|---------------|----------|
| Repères | bannière, navigation « Main », principal, pied de page | Aucun |
| Logo | lien « Mad River Pools, back to top » | Aucun |
| Plan de l'accueil | figure, 2 images décrites (bassin et spa) ; les traits dessinés sont masqués | Aucun |
| Forme | bouton « Kidney 15 × 30 ft », pressé | Corrigé : les 7 photos invisibles étaient lues |
| Photo de la forme | figure « Kidney, 15 × 30 ft » avec la seule photo visible ; la légende est annoncée au changement | Aucun |
| Onglets | liste d'onglets « What's wrong with your pool? », onglet sélectionné | Aucun |
| Filtres | groupe « Show projects », boutons pressés ou non | Aucun |
| Vignette | bouton portant la description de la photo | Aucun |
| Visionneuse | dialogue « Project photo », figure décrite, « Previous photo », « Next photo », « Close », « 2 of 22 » | Aucun |
| Question | groupe avec son intitulé, développé ou réduit | Aucun |
| Statut | « Open now » ou « Closed now », à l'heure de Maitland | Aucun |
| Cases du formulaire | groupe « What are you thinking about? », cases à cocher nommées | Aucun |
| Champs | « First name », « Last name », « Email », « Phone », obligatoires, avec saisie automatique | Corrigé : les champs en erreur pointent maintenant vers le message |
| Erreur | alerte « To send your request, add your first name, … » | Aucun |
| Liens externes | « (opens in a new tab) » lu en fin de lien | Aucun |

### Mouvement
- Avec « réduire les animations » :
  - pas de défilement doux ;
  - le plan de l'accueil est dessiné et rempli dès l'affichage ;
  - le titre est affiché tout de suite ;
  - pas d'effet de profondeur au défilement ;
  - toutes les transitions sont ramenées à 0,01 ms.
- Sans ce réglage :
  - l'animation d'ouverture dure environ 2 s ;
  - elle ne se répète pas ;
  - rien ne clignote.

### Corrections prioritaires
Toutes les corrections ci-dessus sont faites. Il reste :
1. **Tester avec VoiceOver (iPhone) et NVDA (Windows)** : surtout les onglets, la visionneuse et le formulaire. C'est le seul moyen de confirmer ce que l'arbre d'accessibilité laisse prévoir.
2. **Agrandir les liens du pied de page** (29 px de haut aujourd'hui) si l'on vise 44 px partout. Ils respectent déjà le minimum de 24 px (2.5.8), et le téléphone existe en grand dans « Book a free home visit » et dans la barre d'appel.
3. **Trois liens dans des phrases** (« Look it up… » deux fois, un lien dans une réponse) font 21 à 23 px de haut. Ils sont exemptés comme liens dans le texte, à garder en tête si on les sort de leur phrase.
