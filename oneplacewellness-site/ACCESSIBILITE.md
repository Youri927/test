## Audit d'accessibilité : nouveau site One Place Wellness
**Norme :** WCAG 2.1 AA, avec deux critères de la 2.2 en plus (2.4.11 focus non masqué, 2.5.8 taille des cibles) | **Date :** 12 octobre 2026

Page auditée : `dist-web/index.html`, servie en local. Testée sur ordinateur (de 960 à 1920 px) et sur téléphone (de 320 à 820 px).

Méthode :
- Lighthouse, sur ordinateur et sur téléphone ;
- scripts Playwright :
  - `tools/a11y.mjs` : parcours complet au clavier, focus caché ou non, cibles tactiles, contrastes mesurés sur les vrais pixels (tout le texte de la page masqué, pour ne garder que le fond), contours et repères, espacement du texte élargi ;
  - `tools/interact.mjs` : chaque interaction à la souris, au doigt et au clavier, mouvement réduit, arrivée au milieu de la page, débordements et chevauchements d'étiquettes sur 19 largeurs d'écran ;
- arbre d'accessibilité de Chromium, lu composant par composant.

Pas de test avec un vrai lecteur d'écran (VoiceOver ou NVDA) : il reste à faire avant la mise en ligne.

### Résumé
**Problèmes trouvés :** 5 | **Critiques :** 0 | **Majeurs :** 1 | **Mineurs :** 4

**Les 5 sont corrigés dans cette version.**

Lighthouse Accessibilité : 100 sur ordinateur et sur téléphone (Bonnes pratiques et SEO : 100 aussi).

### Constats

#### Perceptible
| # | Problème | Critère WCAG | Gravité | Correction |
|---|----------|--------------|---------|------------|
| 1 | Ligne du temps des soins : des étiquettes se chevauchaient ou sortaient de leur piste. Sur la ligne du Botox, « Complimentary booster at 2 weeks » recouvrait « Lasts 3 to 6 months » ; « 45 minutes, then the lift shows right away » (threadlift) et « About 15 minutes » (laser, à 1180 px) débordaient sur le nom du soin ; « What most people expect: 6 to 12 months » sortait de la piste à 960 px. | 1.4.10 Redistribution, 1.3.1 Information et relations | 🟡 Majeur | Corrigé : chaque étiquette a sa place au-dessus ou au-dessous du trait, alignée sur le début ou la fin de ce qu'elle désigne. Les essais vérifient maintenant, à chacune des 19 largeurs, qu'aucune étiquette ne sort de sa piste ni ne touche sa voisine. Sous 820 px, les étiquettes laissent la place aux faits écrits en liste sous chaque piste. |
| 2 | Texte indicatif des champs (« e.g. Tuesday mornings ») à 4,34:1 sur le fond du champ. | 1.4.3 Contraste | 🟢 Mineur | Corrigé : #6C5E71, 5,34:1. L'étiquette du champ reste toujours visible au-dessus. |
| 3 | Règle des 3 à 5 mm : la bande violette pâle se distinguait à peine du fond (1,2:1). | 1.4.11 Contraste du non-textuel | 🟢 Mineur | Corrigé : le haut de la bande est tracé au violet du marqueur (8,35:1). Les chiffres 3 et 5 et la légende disent déjà la même chose en texte. |
| 4 | Cartes : « Myrtle Terrace » passait sous l'anneau du cabinet ; au téléphone, « Tamiami Trail North (US 41) » croisait la bretelle de la route. | 1.4.3 Contraste (lisibilité du texte sur un trait) | 🟢 Mineur | Corrigé (`tools/map.py`) : le nom de la rue du cabinet passe sous l'anneau ; au téléphone, « Tamiami Trail », plus court, tient entre Pine Ridge Road et la bretelle. Aucun nom ne croise plus un trait. |

#### Utilisable
| # | Problème | Critère WCAG | Gravité | Correction |
|---|----------|--------------|---------|------------|
| 5 | Cibles tactiles au téléphone : le téléphone et le courriel de la visite faisaient 22 px de haut, les liens du pied de page 24 px. | 2.5.8 Taille de la cible (24 px), 2.5.5 (44 px) | 🟢 Mineur | Corrigé : 44 px de haut, sans changer la mise en page. Restent sous 44 px quatre liens dans des phrases ou dans le bloc d'adresse du pied de page (exemptés par 2.5.8). |

Construit dès le départ, et vérifié par les essais :
- « Skip to content » mène au contenu : après l'évitement, Tab va sur « Call 239-262-8585 » dans l'accueil ;
- un lien de l'en-tête fait défiler jusqu'à la section, qui reçoit le focus (sans cadre autour de toute la section) : Tab repart de la section ;
- au téléphone, le menu garde le focus, le reste de la page devient inerte, Échap le ferme et rend le focus au bouton « Menu » ;
- « Show all 16 cases » disparaît une fois les seize cas affichés : le focus passe au septième cas, le premier des nouveaux, au lieu de retomber en haut de la page, et le nombre de cas affichés est annoncé (« Showing 16 cases. ») ;
- la barre d'appel du téléphone ne cache jamais l'élément qui a le focus : mesuré au centre de chaque élément, sur les 44 arrêts (ordinateur) et les 39 arrêts (téléphone).

#### Compréhensible
Rien à signaler. Le formulaire a été construit avec ses messages :
- chaque erreur est écrite sous son champ et dit quoi faire (« Enter a phone number with at least 10 digits. ») ;
- le champ en erreur est signalé (`aria-invalid`) et renvoie à son message (`aria-describedby`) ;
- le curseur va au premier champ à corriger, et le message disparaît dès que le champ est corrigé ;
- le courriel est facultatif et n'est refusé que s'il est incomplet ;
- rien ne se perd : après l'envoi, le formulaire garde ce qui a été écrit.

Une note sous le bouton dit à l'avance ce qui va se passer : « This opens your email app with the request written out, addressed to Oneplacewellness@gmail.com. Rather talk? Call 239-262-8585. »

Rien ne change au focus seul (3.2.1). Les filtres des cas ne changent que la liste, et le nombre de cas affichés est annoncé.

#### Robuste
Rien à signaler. Chaque composant expose son nom, son rôle et son état (tableau « Lecteur d'écran »).

### Contrôle des contrastes
70 textes mesurés sur les vrais pixels : tous au-dessus du seuil, de 5,33:1 à 16,39:1. Les calculs ci-dessous donnent les mêmes valeurs.

| Élément | Texte | Fond | Rapport | Exigé | OK ? |
|---------|-------|------|---------|-------|------|
| Texte courant | #271B2D | #F3F0F4 | 14,51:1 | 4,5:1 | ✅ |
| Texte courant sur blanc (soins, formulaire) | #271B2D | #FFFFFF | 16,39:1 | 4,5:1 | ✅ |
| Titre de l'accueil, dans la lumière de la fenêtre | #271B2D | #FFFDFB | 16,16:1 | 3:1 | ✅ |
| Texte secondaire (chapôs, légendes, étiquettes de la ligne du temps) | #5E4E63 | #F3F0F4 / #FFFFFF | 6,77 / 7,65:1 | 4,5:1 | ✅ |
| Texte secondaire au bas de l'accueil (fond le plus sombre) | #5E4E63 | #EDE8EF | 6,33:1 | 4,5:1 | ✅ |
| Violet du marqueur (liens, bouton secondaire) | #5B2C93 | #F3F0F4 / #FFFFFF | 8,35 / 9,43:1 | 4,5:1 | ✅ |
| Bouton violet | #FFFFFF | #5B2C93 | 9,43:1 | 4,5:1 | ✅ |
| Filtre choisi (texte, nombre) | #F3F0F4, lilas à 72 % | #271B2D | 14,51 / 8,07:1 | 4,5:1 | ✅ |
| La docteure : titres, texte, nom | #F3F0F4, lilas à 84 %, #B9A3E3 | #271B2D | 14,51 / 10,55 / 7,35:1 | 4,5:1 | ✅ |
| Tirages du cas : « Before », « After » | #271B2D | #E8D2C7 | 11,30:1 | 4,5:1 | ✅ |
| Cartes : noms des rues (sur le fond, un bâtiment, l'eau) | #5E4E63 | #F3F0F4 / #E2DAE5 / #DDD4E5 | 6,77 / 5,61 / 5,33:1 | 4,5:1 | ✅ |
| Cartes : nom du cabinet | #5B2C93 | #F3F0F4 / #E2DAE5 | 8,35 / 6,91:1 | 3:1 | ✅ |
| Texte indicatif des champs | #6C5E71 | #F3F0F4 | 5,34:1 | 4,5:1 | ✅ |
| Message d'erreur | #A3241E | #FFFFFF | 7,42:1 | 4,5:1 | ✅ |
| Pied de page, mentions (13 px) | lilas à 86 %, lilas à 66 % | #271B2D | 10,98 / 7,05:1 | 4,5:1 | ✅ |
| Bords des champs, des choix du sujet, des filtres | #8E7F93 | #FFFFFF / #F3F0F4 | 3,75 / 3,31:1 | 3:1 | ✅ |
| Ligne du temps : durée, point des résultats, temps au fauteuil | #5B2C93, #271B2D | #FFFFFF | 9,43 / 16,39:1 | 3:1 | ✅ |
| Ligne du temps : axe, crochet « 6 à 12 mois » | #8E7F93 | #FFFFFF | 3,75:1 | 3:1 | ✅ |
| Règle : graduations, bord de la bande | #271B2D, #5B2C93 | #F3F0F4 | 14,51 / 8,35:1 | 3:1 | ✅ |
| Cartes : bâtiment et anneau du cabinet | #5B2C93 | #F3F0F4 | 8,35:1 | 3:1 | ✅ |
| Contour de focus | #5B2C93 / #F3F0F4 | lilas ou blanc / prune | 8,35 à 14,51:1 | 3:1 | ✅ |

Rien n'est dit par la couleur seule (1.4.1) :
- le temps au fauteuil est un trait plein et noir, le rétablissement des hachures, la durée un trait fin, l'arrivée des résultats un point ; la légende au-dessus de l'axe le dit, et chaque ligne a ses faits écrits en liste ;
- le filtre choisi est plein (prune) et annoncé « pressé » ;
- le cabinet, sur les cartes, est marqué d'un anneau et de son nom.

### Navigation au clavier
44 arrêts sur ordinateur, 39 sur téléphone, dans l'ordre de lecture ; focus toujours visible, jamais caché par l'en-tête ni par la barre d'appel.

| Élément | Ordre | Entrée / Espace | Échap | Flèches |
|---------|-------|-----------------|-------|---------|
| Lien « Skip to content » | 1er | Va au contenu ; Tab continue dans l'accueil | — | — |
| En-tête : nom du cabinet, 4 liens, téléphone, « Request a consultation » | 2 à 8 | Fait défiler jusqu'à la section, qui reçoit le focus | — | — |
| Bouton « Menu » (sous 960 px) | après le nom | Ouvre le menu ; le reste de la page devient inerte | Ferme le menu, focus sur « Menu » | — |
| Accueil : « Call 239-262-8585 », « Request a complimentary consultation » | ensuite | Appelle ; va au formulaire | — | — |
| Ligne du temps : 6 soins | dans l'ordre | Déplie ou replie le texte du soin (état annoncé) | — | — |
| Cas : 5 filtres, puis « Show all 16 cases » | dans l'ordre | Filtre la liste (bouton « pressé », nombre annoncé) ; affiche les seize cas, focus sur le premier des nouveaux | — | — |
| Visite : crédit OpenStreetMap, téléphone, courriel, itinéraire, Instagram, Facebook | dans l'ordre | Suit le lien | — | — |
| Formulaire : sujet (7 choix), 5 champs, envoi | le sujet est un seul arrêt | Envoi : messages d'erreur ou courriel préparé | — | Changent de sujet |
| Pied de page : téléphone, courriel, 6 liens | dans l'ordre | Suit le lien | — | — |
| Barre d'appel du téléphone : « Call », « Request a consultation » | après le pied de page, seulement quand elle est affichée | Appelle ; va au formulaire | — | — |

### Lecteur d'écran
Relevé dans l'arbre d'accessibilité de Chromium. Reste à confirmer avec VoiceOver et NVDA.

| Élément | Annoncé comme | Problème |
|---------|---------------|----------|
| Repères | bannière, navigation « Sections », principal, pied de page ; chaque section porte son titre | Aucun |
| Nom du cabinet | lien « One Place Wellness, Elizabeth Fox, M.D., back to top » | Aucun |
| Accueil | région « Look as healthy and happy as you feel. », titre de niveau 1 ; la fenêtre de lumière est masquée (décor) | Aucun |
| Règle des 3 à 5 mm | figure nommée par sa légende : « Three to five millimeters, enlarged: the depth of shadow Dr. Fox softens. » ; le dessin est masqué | Aucun |
| Cas en photo | figure nommée par sa légende ; deux images décrites (« Before: the lower face of a 69-year-old patient, with deep lines running down from the corners of the mouth. », « After: the same face, with softer lines and fuller lips. ») ; les mots « Before » et « After » sous les tirages sont masqués, les descriptions les disent déjà | Aucun |
| Ligne du temps | liste de 6 soins ; chaque soin : titre de niveau 3 avec son bouton (déplié ou replié), puis ses faits en liste (« No anesthetic; tender for an hour or two »…). La piste dessinée, l'axe et la légende sont masqués : la liste en est l'équivalent | Aucun |
| Filtres des cas | groupe « Show cases by treatment », 5 boutons « All 16 », « Fillers 10 »…, pressés ou non ; le nombre affiché est annoncé (`aria-live`) | Aucun |
| Cas | liste ; chaque cas : titre de niveau 3 (« Marionette lines »), l'âge, la demande, ce qui a été fait | Aucun |
| La docteure | région « A facelift surgeon's eye, without the surgery. », ses faits en liste, la citation (`q`) | Aucun |
| Carte | figure ; image « Map: One Place Wellness at 827 Myrtle Terrace, Naples, just off the Tamiami Trail, south of Pine Ridge Road » ; les noms des rues dessinés ne sont pas lus un par un. L'adresse et « Get directions » suivent en texte | Aucun |
| Coordonnées | liste de définitions : Phone, Email, Hours, Address | Aucun |
| Formulaire | formulaire « Request a complimentary consultation » ; groupe « What would you like to talk about? », 7 boutons radio ; champs « Your name », « Phone » (obligatoires, saisie automatique), « Email (optional) », « When suits you? (optional) », « Anything else? (optional) » | Aucun |
| Erreurs | chaque champ en erreur renvoie à son message, lu avec le champ | Aucun |
| Confirmation | « Your email app should now be open with the request… » (`role="status"`) | Aucun |
| Barre d'appel | masquée tant qu'elle n'est pas affichée, liens hors de la tabulation | Aucun |

### Mouvement
- Avec « réduire les animations » :
  - pas d'ouverture : le titre a tout de suite son ombre courte et douce, la fenêtre de lumière est à sa place ;
  - pas de défilement doux ;
  - la ligne du temps est tracée d'emblée, sans curseur ;
  - pas d'ondes autour du cabinet sur la carte ;
  - les soins s'ouvrent sans animation ;
  - toutes les transitions sont ramenées à 0,01 ms.
- Sans ce réglage :
  - une seule ouverture, 2,6 s, jouée seulement si la page est chargée en haut (pas en arrivant sur un lien vers une section) : la lumière passe de rasante à de face, les ombres des lettres raccourcissent, rien ne grossit ni ne se déplace ;
  - la ligne du temps est balayée une fois (2,8 s), quand elle arrive à l'écran ;
  - deux ondes partent du cabinet quand la carte arrive à l'écran, puis plus rien ne bouge ;
  - les soins s'ouvrent en 0,42 s, les cas apparaissent en fondu en 0,45 s ;
  - rien ne clignote, rien ne se répète en boucle.

### Corrections prioritaires
Toutes les corrections ci-dessus sont faites. Il reste :
1. **Tester avec VoiceOver (iPhone) et NVDA (Windows)** : surtout la ligne du temps (bouton du soin, puis ses faits), les filtres des cas (nombre annoncé) et le formulaire.
2. **Le formulaire passe par la messagerie du visiteur.** Branché à un vrai service d'envoi, il éviterait de dépendre d'une application de courriel configurée (voir `REVUE.md`).
3. **La carte est une image.** Son équivalent est l'adresse écrite et le lien d'itinéraire juste dessous ; si l'on ajoute des repères sur la carte (parking, entrée), il faudra les écrire aussi en texte.
