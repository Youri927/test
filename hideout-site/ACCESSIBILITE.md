## Audit d'accessibilité : nouveau site Hideout Boutique
**Norme :** WCAG 2.1 AA, avec deux critères de la 2.2 en plus (2.4.11 focus non masqué, 2.5.8 taille des cibles) | **Date :** 13 octobre 2026

Page auditée : `dist-web/index.html`, servie en local. Testée sur ordinateur (de 960 à 1920 px) et sur téléphone (de 320 à 820 px).

Méthode :
- Lighthouse, sur ordinateur et sur téléphone ;
- scripts Playwright :
  - `tools/a11y.mjs` : parcours complet au clavier, focus caché ou non, cibles tactiles, contrastes mesurés sur les vrais pixels (tout le texte de la page masqué, pour ne garder que le fond, familles ouvertes), contours et repères, espacement du texte élargi ;
  - `tools/interact.mjs` : 50 essais de chaque interaction à la souris, au doigt et au clavier, mouvement réduit, arrivée au milieu de la page, débordements sur 19 largeurs d'écran ;
- arbre d'accessibilité de Chromium, lu composant par composant.

Pas de test avec un vrai lecteur d'écran (VoiceOver ou NVDA) : il reste à faire avant la mise en ligne.

### Résumé
**Problèmes trouvés :** 7 | **Critiques :** 0 | **Majeurs :** 3 | **Mineurs :** 4

**Les 7 sont corrigés dans cette version.**

Lighthouse Accessibilité : 100 sur ordinateur et sur téléphone (Bonnes pratiques, SEO et navigation par agents : 100 aussi).

### Constats

#### Perceptible
| # | Problème | Critère WCAG | Gravité | Correction |
|---|----------|--------------|---------|------------|
| 1 | Avec un espacement du texte élargi (lettres, mots, lignes), le titre de l'accueil, forcé sur une ligne, élargissait la page de 338 px sur ordinateur : la fin du titre sortait de l'écran. Au téléphone, le courriel du pied de page dépassait de 5 px. | 1.4.12 Espacement du texte | 🟡 Majeur | Corrigé : le titre n'est plus forcé sur une ligne ; sa taille est calculée pour tenir sur une ligne à l'ordinateur, et il passe à la ligne si l'espacement grandit. Le courriel se coupe avant l'arobase. Aucun texte coupé ni défilement horizontal, à 1440 et à 390 px. |
| 2 | Contours des filtres, des choix de préoccupation et des boutons « Menu » et « Close » : #CFC4BD, 1,71:1 sur blanc. | 1.4.11 Contraste du non-textuel | 🟢 Mineur | Corrigé : #948780, 3,48:1 sur blanc. Le filtre choisi est plein (encre) et annoncé « pressé ». |
| 3 | Curseur du Beauty Bank : le rail et la pastille, gris, à 2,52:1 sur le rose poudré. | 1.4.11 Contraste du non-textuel | 🟢 Mineur | Corrigé : rail et pastille à l'encre, 14,73:1. Le nombre de mois est aussi écrit au-dessus, et les mois remplis sont des cases pleines. |
| 4 | Carte : le bâtiment du cabinet, à l'or du logo, à 2,19:1 sur le fond de la carte. | 1.4.11 Contraste du non-textuel | 🟢 Mineur | Corrigé : l'or assombri, #9C8019, 3,45:1. Le nom « Hideout Boutique » est écrit à côté (13,37:1), et le cadre du logo se pose autour. |
| 5 | Entre 320 et 375 px, des noms Instagram de l'équipe (@aesthetics_nursediana, @injectorlinabinabeauty) dépassaient de leur colonne. | 1.4.10 Redistribution | 🟢 Mineur | Corrigé : ils passent à la ligne. Les essais vérifient qu'aucun élément ne dépasse, à 19 largeurs, familles ouvertes. |

#### Utilisable
| # | Problème | Critère WCAG | Gravité | Correction |
|---|----------|--------------|---------|------------|
| 6 | La fenêtre de réservation Boulevard, fermée, est seulement poussée hors de l'écran par leur script : elle prenait deux arrêts de tabulation invisibles. | 2.4.7 Focus visible, 2.4.3 Parcours du focus | 🟡 Majeur | Corrigé : fermée, elle est masquée et sort de la tabulation ; elle revient dès qu'elle s'ouvre. |
| 7 | Au téléphone, la barre « Book now / Call » cachait l'élément qui avait le focus : « Injectables », « @baileynoelbeauty », « @skinwithpriscilla ». | 2.4.11 Focus non masqué | 🟡 Majeur | Corrigé : la page garde une marge de 84 px au-dessus de la barre (plus la zone du bord de l'écran sur iPhone). Mesuré au centre de chaque élément, sur les 66 arrêts (ordinateur) et les 60 arrêts (téléphone) : aucun focus caché. |

Construit dès le départ, et vérifié par les essais :
- « Skip to content » mène au contenu : après l'évitement, Tab va sur « Book now » dans l'accueil ;
- un lien de l'en-tête fait défiler jusqu'à la section, qui reçoit le focus : après « Results », Tab continue sur « All 38 » ;
- au téléphone, le menu met le focus sur « Close », la page dessous devient inerte, Tab reste dans le menu, Échap le ferme et rend le focus au bouton « Menu » ;
- une famille s'ouvre et se ferme au clavier, le bouton garde le focus ;
- le lien d'une famille, dans la réponse à une préoccupation, ouvre la famille et y amène le focus ;
- « Show all 38 » met le focus sur le treizième résultat, le premier des nouveaux, au lieu de le laisser retomber en haut de la page ;
- la visionneuse garde le focus, les flèches passent d'une photo à l'autre, Échap la ferme et rend le focus à la photo ouverte ;
- les cibles tactiles : 44 px pour tous les boutons du téléphone. Restent sous 44 px le logo de l'en-tête (150 × 29) et les noms Instagram de l'équipe (36 px de haut), au-dessus du minimum de 24 px ; onze liens sont dans des phrases (exemptés par 2.5.8).

#### Compréhensible
Rien à signaler. Le site n'a pas de formulaire : la réservation se fait chez Boulevard.

Rien ne change au focus seul (3.2.1) : approcher un bouton « Book now » charge le script de Boulevard sans rien afficher ; la fenêtre ne s'ouvre qu'au clic. Les filtres et les préoccupations ne changent que le contenu sous eux, et le changement est annoncé.

#### Robuste
Rien à signaler. Chaque composant expose son nom, son rôle et son état (tableau « Lecteur d'écran »).

### Contrôle des contrastes
97 mesures : tout le texte est au-dessus du seuil, de 4,82:1 à 17,11:1. Le texte courant ne descend pas sous 5,31:1.

| Élément | Texte | Fond | Rapport | Exigé | OK ? |
|---------|-------|------|---------|-------|------|
| Titres, texte principal, boutons | #221A16 | #FFFFFF | 17,11:1 | 4,5:1 | ✅ |
| Texte secondaire (chapôs, légendes, faits des soins) | #6B5F58 | #FFFFFF | 6,17:1 | 4,5:1 | ✅ |
| Texte secondaire des abonnements | #6B5F58 | #F6ECE8 | 5,31:1 | 4,5:1 | ✅ |
| Bouton plein | #FFFFFF | #221A16 | 17,11:1 | 4,5:1 | ✅ |
| Équipe : titres, noms, avis | crème | #231B17 | 14,71:1 | 4,5:1 | ✅ |
| Équipe : rôles, chapô | crème atténuée | #231B17 | 7,31:1 | 4,5:1 | ✅ |
| Équipe : noms Instagram, signatures des avis | #C4A42C | #231B17 | 7,01:1 | 4,5:1 | ✅ |
| Pied de page : texte, mentions (13 px) | crème atténuée | #231B17 | 7,31:1 | 4,5:1 | ✅ |
| Carte : noms des rues | #6B5F58 | fond et bâtiments de la carte (pire point) | 5,59:1 | 4,5:1 | ✅ |
| Carte : repère, échelle (13,7 px) | #6B5F58 | fond et bâtiments de la carte (pire point) | 4,82:1 | 4,5:1 | ✅ |
| Carte : nom du cabinet | #221A16 | fond et bâtiments de la carte (pire point) | 13,37:1 | 4,5:1 | ✅ |
| Contours des filtres et des boutons secondaires | #948780 | #FFFFFF | 3,48:1 | 3:1 | ✅ |
| Contour du bouton à contour | #221A16 | #FFFFFF | 17,11:1 | 3:1 | ✅ |
| Beauty Bank : curseur, mois remplis | #221A16 | #F6ECE8 | 14,73:1 | 3:1 | ✅ |
| Signe plus d'une famille | #221A16 | #FFFFFF | 17,11:1 | 3:1 | ✅ |
| Carte : bâtiment du cabinet | #9C8019 | #F7F3F0 | 3,45:1 | 3:1 | ✅ |
| Contour de focus | #221A16 / #C4A42C | blanc / expresso | 17,11 / 7,01:1 | 3:1 | ✅ |

Le cadre doré du logo (#C4A42C, 2,4:1 sur blanc) ne porte aucune information : il souligne une photo déjà décrite ou une adresse déjà écrite. Il n'est jamais utilisé pour du texte sur fond clair.

Rien n'est dit par la couleur seule (1.4.1) :
- le filtre et la préoccupation choisis sont pleins et annoncés « pressés » ;
- les soins concernés par une préoccupation sont aussi listés en texte, par famille, au-dessus de la liste ;
- le cabinet, sur la carte, est marqué par son nom et par le cadre.

### Navigation au clavier
66 arrêts sur ordinateur, 60 sur téléphone, dans l'ordre de lecture ; focus toujours visible, jamais caché par l'en-tête ni par la barre du téléphone.

| Élément | Ordre | Entrée / Espace | Échap | Flèches |
|---------|-------|-----------------|-------|---------|
| Lien « Skip to content » | 1er | Va au contenu ; Tab continue sur « Book now » | — | — |
| En-tête : logo, 5 liens, téléphone, « Book now » | 2 à 9 | Fait défiler jusqu'à la section, qui reçoit le focus ; « Book now » ouvre leur réservation | — | — |
| Bouton « Menu » (sous 960 px) | après le logo | Ouvre le menu ; la page dessous devient inerte | Ferme le menu, focus sur « Menu » | — |
| Accueil : « Book now », « Call 239-936-0758 » | ensuite | Ouvre leur réservation ; appelle | — | — |
| Préoccupations : 3 boutons | dans l'ordre | Souligne les soins concernés et les liste (bouton « pressé », réponse annoncée) ; un second appui efface | — | — |
| Familles : 5 boutons | dans l'ordre | Ouvre ou ferme la famille (état annoncé), le bouton garde le focus | — | — |
| Résultats : 5 filtres, 12 photos, « Show all 38 » | dans l'ordre | Filtre (bouton « pressé », nombre annoncé) ; ouvre la visionneuse ; affiche tout, focus sur le premier des nouveaux | — | — |
| Visionneuse | le focus y reste | « Previous », « Next », « Close » | Ferme, focus sur la photo ouverte | Photo précédente ou suivante |
| Équipe : 11 liens Instagram | dans l'ordre | Suit le lien | — | — |
| Abonnements : téléphone, curseur du Beauty Bank | dans l'ordre | Appelle | — | Un mois de plus ou de moins (de 3 à 12) |
| Visite : téléphone, courriel, « Book now », itinéraire, consignes, boutique, réseaux | dans l'ordre | Suit le lien | — | — |
| Pied de page : téléphone, courriel, 2 réseaux, 3 règles | dans l'ordre | Suit le lien | — | — |
| Barre du téléphone : « Book now », « Call » | après le pied de page, seulement quand elle est affichée | Ouvre leur réservation ; appelle | — | — |

### Lecteur d'écran
Relevé dans l'arbre d'accessibilité de Chromium. Reste à confirmer avec VoiceOver et NVDA.

| Élément | Annoncé comme | Problème |
|---------|---------------|----------|
| Repères | bannière, navigation « Sections », principal, pied de page ; chaque section porte son titre | Aucun |
| Logo de l'en-tête | lien « Hideout Boutique, back to top » | Aucun |
| Accueil | région « Come hide out with us. », titre de niveau 1 ; figure nommée par sa légende, photo décrite (« Lina Davis, NP-C, treating a client's lips, seen in the round mirror of her treatment room… ») ; le cadre est masqué (décor) | Aucun |
| Préoccupations | groupe « Start from what bothers you », 3 boutons pressés ou non ; la réponse est annoncée (`aria-live`) | Aucun |
| Familles | liste ; chaque famille : titre de niveau 3 avec son bouton « Facials and body 17 treatments », déplié ou replié. Les lettres découpées pour l'animation sont masquées : le nom n'est lu qu'une fois | Aucun |
| Photo des familles | masquée, sur ordinateur comme dans chaque famille ouverte au téléphone : elle double ce que dit la famille | Aucun |
| Filtres des résultats | groupe « Show results for », 5 boutons « All 38 », « Injectables 16 »…, pressés ou non ; le nombre affiché est annoncé (« 5 results: lashes. ») | Aucun |
| Résultats | liste ; chaque résultat : bouton nommé par sa photo (« Before and after: facial balancing by Lina Davis, NP-C »), puis sa légende | Aucun |
| Visionneuse | dialogue nommé par la légende (« Facial balancing, Lina Davis, NP-C ») ; la photo décrite ; « 1 of 38 » ; boutons « Previous », « Next », « Close » | Aucun |
| Équipe | photo de groupe décrite ; trois responsables, chacune avec son portrait, son titre de niveau 3, son rôle, son Instagram et un avis (citation signée) ; puis la liste des dix autres | Aucun |
| Beauty Bank | curseur « If you join for », valeur lue « 6 months, $594 to spend » ; le total est une zone de statut | À confirmer : le total pourrait être lu deux fois (valeur du curseur et statut) |
| Carte | image « Map: Hideout Boutique at 1342 Colonial Blvd, Suite H57, Fort Myers, just south of Colonial Boulevard and east of McGregor Boulevard » ; les noms des rues dessinés ne sont pas lus un par un. L'adresse et « Get directions » suivent en texte | Aucun |
| Pied de page | image « Hideout Boutique, boutique and med spa » (le logo), puis quatre titres de niveau 2 : Visit, Contact, Follow, Policies | Aucun |
| Barre du téléphone | masquée tant qu'elle n'est pas affichée, liens hors de la tabulation | Aucun |

### Mouvement
- Avec « réduire les animations » :
  - pas d'ouverture : la page s'affiche telle quelle ;
  - pas de défilement doux ;
  - les cadres de l'équipe et de la carte sont tracés d'emblée ;
  - les familles s'ouvrent sans animation ;
  - toutes les transitions sont ramenées à 0,01 ms.
- Sans ce réglage :
  - une seule ouverture, 2 s, jouée seulement si la page est chargée en haut (pas en arrivant sur un lien vers une section) ; une touche, un clic ou un défilement l'achèvent aussitôt ; rien ne clignote, la photo n'est pas zoomée, la page ne se décale pas ;
  - le cadre se trace autour de la photo de groupe (1,2 s) et se pose sur l'adresse de la carte (1,1 s), une fois, quand ils arrivent à l'écran ;
  - en réponse à un geste : le cadre passe d'une photo de famille à l'autre (0,45 s), une famille s'ouvre en 0,56 s, les résultats filtrés apparaissent en 0,5 s ;
  - rien ne se répète en boucle.

### Corrections prioritaires
Toutes les corrections ci-dessus sont faites. Il reste :
1. **Tester avec VoiceOver (iPhone) et NVDA (Windows)** : surtout les familles (bouton, puis la liste des soins), la réponse aux préoccupations, les filtres des résultats (nombre annoncé), la visionneuse et le curseur du Beauty Bank (le total ne doit être lu qu'une fois).
2. **La fenêtre de réservation appartient à Boulevard.** Son accessibilité interne (formulaire, calendrier) dépend d'eux ; à tester avec le cabinet sur un vrai rendez-vous.
3. **La carte est une image.** Son équivalent est l'adresse écrite et le lien d'itinéraire juste dessous ; si l'on ajoute des repères sur la carte (parking, entrée de la suite H57), il faudra les écrire aussi en texte.
