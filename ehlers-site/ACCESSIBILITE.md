## Audit d'accessibilité : nouveau site Ehlers Contracting
**Norme :** WCAG 2.1 AA, avec deux critères de la 2.2 en plus (2.4.11 focus non masqué, 2.5.8 taille des cibles) | **Date :** 13 octobre 2026

Page auditée : `dist-web/index.html`, servie en local. Testée sur ordinateur (de 861 à 1920 px) et sur téléphone (de 320 à 860 px).

Méthode :
- Lighthouse, sur ordinateur et sur téléphone ;
- scripts Playwright :
  - `tools/a11y.mjs` :
    - parcours complet au clavier, focus caché ou non ;
    - cibles tactiles, menu ouvert compris ;
    - contrastes mesurés sur les vrais pixels : tout le texte de la page est masqué, pour ne garder que le fond ;
    - contours, repères posés sur les photos et contours de focus ;
    - espacement du texte élargi ;
    - titres, noms des contrôles, textes alternatifs, références entre éléments ;
  - `tools/interact.mjs` : 49 essais de chaque interaction à la souris, au doigt et au clavier, mouvement réduit, arrivée au milieu de la page, débordements sur 19 largeurs d'écran ;
- arbre d'accessibilité de Chromium, lu partie par partie.

Pas de test avec un vrai lecteur d'écran (VoiceOver ou NVDA) : il reste à faire avant la mise en ligne.

### Résumé
**Problèmes trouvés :** 10 | **Critiques :** 1 | **Majeurs :** 3 | **Mineurs :** 6

**Les 10 sont corrigés dans cette version.**

Lighthouse Accessibilité : 100 sur ordinateur et sur téléphone (Bonnes pratiques, SEO et navigation par agents : 100 aussi).

### Constats

#### Perceptible
| # | Problème | Critère WCAG | Gravité | Correction |
|---|----------|--------------|---------|------------|
| 1 | Au téléphone, le titre de la partie Rick (« One builder, from concept to completion. ») et le portrait tombaient chacun dans une seule des 12 colonnes de la grille : le titre s'empilait lettre par lettre et était coupé, illisible. | 1.4.10 Redistribution | 🔴 Critique | Corrigé : au téléphone, le titre, le portrait et le texte prennent toute la largeur, dans l'ordre du code (titre, portrait, texte, faits). Vu sur les captures de la revue. |
| 2 | Cuisine : les détails qui ne sont pas cadrés sur la photo étaient atténués à 38 % : 2,1:1 sur le fond vert d'eau. | 1.4.3 Contraste (minimum) | 🟡 Majeur | Corrigé : plus d'atténuation. Les détails non cadrés gardent un texte lisible (#4D6168, 5,52:1) ; celui qui est cadré passe à l'encre (11,41:1) et son numéro se remplit. |
| 3 | Avec un espacement du texte élargi, une étiquette des repères de l'accueil sortait de l'écran au téléphone. | 1.4.12 Espacement du texte | 🟡 Majeur | Corrigé : les repères se replacent dès qu'une étiquette change de taille (police chargée, texte agrandi ou espacé). Une étiquette va à droite du point, ou à gauche s'il n'y a pas la place, et passe à la ligne du côté le plus large si elle ne tient d'aucun côté. Aucun texte coupé ni sorti de l'écran, à 1440 et à 390 px. |
| 4 | Tableau des services : le rôle de cellule était posé sur les titres (`<h3>`) et les listes eux-mêmes ; les huit titres de service disparaissaient de la navigation par titres, et les listes d'exemples n'étaient plus des listes. | 1.3.1 Information et relations | 🟡 Majeur | Corrigé : les rôles sont portés par des enveloppes ; chaque service garde son titre de niveau 3, et chaque exemple sa liste. |
| 5 | Cuisine : les numéros posés sur la photo, blancs, se perdaient sur les meubles blancs (1,23:1). | 1.4.11 Contraste du non-textuel | 🟢 Mineur | Corrigé : un filet d'encre de 2 px autour de chaque numéro (6,95:1 au plus faible). Le numéro du détail cadré est plein, à l'encre, avec un anneau blanc (13,46:1). |
| 6 | Au téléphone, l'en-tête du tableau des services est masqué : les exemples tirés des permis n'avaient plus d'intitulé et pouvaient passer pour des services. | 1.3.1 Information et relations | 🟢 Mineur | Corrigé : au téléphone, chaque liste d'exemples reprend son intitulé, « From recent permits ». |
| 7 | Le portrait de Rick avait pour texte alternatif « Rick Ehlers », que la légende, juste à côté, dit déjà : le nom était lu deux fois. | 1.1.1 Contenu non textuel | 🟢 Mineur | Corrigé : texte alternatif vide ; la figure est nommée par sa légende, « Rick Ehlers, Owner, Certified Building Contractor ». |

#### Utilisable
| # | Problème | Critère WCAG | Gravité | Correction |
|---|----------|--------------|---------|------------|
| 8 | Au téléphone, des cibles faisaient moins de 44 px : les boutons « Call », « Menu » et « Close » (42 px de haut), le grand numéro du contact (43 px), son courriel (28 px), le nom de l'en-tête (24 px) et les liens du cartouche (20 px). Toutes passaient le minimum de 24 px de la 2.2, par leur taille ou leur espacement. | 2.5.8 Taille des cibles (et 2.5.5) | 🟢 Mineur | Corrigé : 44 px de haut pour toutes, sans changer la mise en page (la marge ou un débord invisible passe dans la zone cliquable). Reste sous 44 px un seul lien, pris dans une phrase et donc exempté : « See the license ». |
| 9 | Le nom de l'en-tête était annoncé « Ehlers Contracting Services, back to the top », alors qu'on lit « Ehlers Contracting Services, Inc. ». | 2.5.3 Étiquette dans le nom | 🟢 Mineur | Corrigé : « Ehlers Contracting Services, Inc., back to the top » ; le nom commence par le texte visible. |

#### Compréhensible
Rien à signaler sur le formulaire :
- chaque champ a son étiquette visible ;
- le téléphone est marqué « (optional) » ;
- l'aide du message (« Where it is, what you’d like to change, and when. ») est reliée au champ ;
- une erreur dit quoi faire (« Enter a full email address. »), s'affiche sous le champ sans rien décaler, et elle est reliée au champ (`aria-describedby`, `aria-invalid`) ;
- à l'envoi, le focus va au premier champ à corriger ;
- le bouton dit ce qui va se passer (« Email this to Rick »), et la note dessous précise que rien n'est envoyé avant d'appuyer sur « Envoyer » dans sa messagerie.

Rien ne change au focus seul (3.2.1) : les filtres et « Show all 16 jobs » n'agissent qu'au clic, et le changement est annoncé.

#### Robuste
| # | Problème | Critère WCAG | Gravité | Correction |
|---|----------|--------------|---------|------------|
| 10 | Des blocs de texte voisins n'étaient séparés par aucun espace dans le code : le nom d'une étape et sa phrase, le nom de Rick et son titre, l'année, le chantier et le lieu d'un permis, un montant et son libellé. Chromium les sépare, mais certains lecteurs d'écran peuvent lire « ConceptYou call… ». | 4.1.2 Nom, rôle et valeur | 🟢 Mineur | Corrigé : un espace entre chaque bloc, sans effet à l'écran. |

Chaque composant expose son nom, son rôle et son état (tableau « Lecteur d'écran »). Aucun identifiant en double, aucune référence cassée (`aria-labelledby`, `aria-describedby`, `aria-controls`, `for`).

### Contrôle des contrastes
74 mesures de texte : tout est au-dessus du seuil, de 5,25:1 à 13,46:1. Le texte courant ne descend pas sous 5,52:1.

| Élément | Texte | Fond | Rapport | Exigé | OK ? |
|---------|-------|------|---------|-------|------|
| Titres, texte principal, liens, boutons | #12333A | #FFFFFF | 13,46:1 | 4,5:1 | ✅ |
| Texte secondaire (chapôs, faits, étapes, exemples, aides) | #4D6168 | #FFFFFF | 6,51:1 | 4,5:1 | ✅ |
| Cuisine : titres et texte (détail cadré) | #12333A / #4D6168 | #E6EEEC | 11,41 / 5,52:1 | 4,5:1 | ✅ |
| Cuisine : titres et texte (détails non cadrés) | #4D6168 | #E6EEEC | 5,52:1 | 4,5:1 | ✅ |
| Étiquettes des repères de l'accueil, légende de la photo | #12333A | #FFFFFF | 13,46:1 | 4,5:1 | ✅ |
| Bouton plein, numéros pleins | #FFFFFF | #12333A | 13,46:1 | 4,5:1 | ✅ |
| Registre et pied de page : texte | #FFFFFF | #12333A | 13,46:1 | 4,5:1 | ✅ |
| Registre : chapô, lieux des chantiers | blanc à 74 % et 70 % | #12333A | 8,07 / 7,40:1 | 4,5:1 | ✅ |
| Registre et cartouche : intitulés (Type, Holder, Phone…), mentions | blanc à 66 % | #12333A | 6,76:1 | 4,5:1 | ✅ |
| Registre : années | #D7B98C | #12333A | 7,18:1 | 4,5:1 | ✅ |
| Filtre choisi : nombre | encre à 70 % | #FFFFFF | 5,25:1 | 4,5:1 | ✅ |
| Erreurs du formulaire | #B42318 | #FFFFFF | 6,57:1 | 4,5:1 | ✅ |
| Contours des champs | #7B8E93 | #FFFFFF | 3,42:1 | 3:1 | ✅ |
| Contours des filtres et de « Show all 16 jobs » | blanc à 50 % | #12333A | 4,55:1 | 3:1 | ✅ |
| Contours des boutons à contour | #12333A | #FFFFFF | 13,46:1 | 3:1 | ✅ |
| Numéros des détails non cadrés | #4D6168 | #E6EEEC | 5,52:1 | 3:1 | ✅ |
| Plan des cages : traits / cotes | #12333A / #A27C4B | #FFFFFF | 13,46 / 3,80:1 | 3:1 | ✅ |
| Cadre du cartouche | blanc à 55 % | #12333A | 5,16:1 | 3:1 | ✅ |
| Repères sur les photos (pire direction autour du repère) | encre et anneau blanc ; blanc et filet d'encre | la photo | 12,81 / 6,95:1 | 3:1 | ✅ |
| Contour de focus | #12333A / #FFFFFF | fonds clairs / encre | 13,46:1 | 3:1 | ✅ |

Le cadre qui désigne un détail de la cuisine est un trait blanc de 2 px doublé d'un halo d'encre : il se voit sur les parties claires comme sur les parties sombres de la photo, et la photo autour est voilée.

Rien n'est dit par la couleur seule (1.4.1) :
- le détail cadré a un numéro plein, et il est le seul cadré sur la photo ;
- le filtre choisi est plein et annoncé « pressé » ;
- les erreurs du formulaire sont écrites, pas seulement en rouge.

### Navigation au clavier
30 arrêts sur ordinateur, 26 sur téléphone, dans l'ordre de lecture ; focus toujours visible (2 px), jamais caché sous l'en-tête.

| Élément | Ordre | Entrée / Espace | Échap | Flèches |
|---------|-------|-----------------|-------|---------|
| Lien « Skip to content » | 1er | Va au contenu | — | — |
| En-tête : nom, 5 liens, « Call (239) 289-0896 » | 2 à 8 | Le nom remonte en haut ; un lien fait défiler jusqu'à la partie, qui reçoit le focus ; « Call » appelle | — | — |
| Bouton « Menu » (jusqu'à 860 px) | après « Call » | Ouvre le menu, focus sur « Close » ; la page dessous devient inerte, Tab reste dans le menu | Ferme le menu, focus sur « Menu » | — |
| Accueil : « Call (239) 289-0896 », « Email Rick » | ensuite | Appelle ; ouvre la messagerie | — | — |
| Rick : « See the license » | ensuite | Fait défiler jusqu'au registre, qui reçoit le focus | — | — |
| Cuisine | aucun arrêt | Le défilement au clavier (flèches, Espace) fait avancer la lecture : le détail sur la ligne de lecture est cadré | — | — |
| Registre : vérification de la licence, 7 filtres, « Show all 16 jobs » | dans l'ordre | Ouvre le site de l'État dans un nouvel onglet (annoncé) ; filtre (bouton « pressé », nombre annoncé) ; affiche les 16, focus sur le 9e chantier, le premier des nouveaux | — | — |
| Contact : téléphone, courriel, 5 champs, « Email this to Rick » | dans l'ordre | Appelle ; ouvre la messagerie ; vérifie le formulaire, focus sur le premier champ à corriger, ou ouvre la messagerie avec le message rédigé | — | Le menu « Project » change de choix |
| Pied de page : téléphone, courriel | dans l'ordre | Appelle ; ouvre la messagerie | — | — |

### Lecteur d'écran
Relevé dans l'arbre d'accessibilité de Chromium. Reste à confirmer avec VoiceOver et NVDA.

| Élément | Annoncé comme | Problème |
|---------|---------------|----------|
| Repères | bannière, navigation « Main », principal, pied de page ; chaque partie est une région nommée par son titre | Aucun |
| Nom de l'en-tête | lien « Ehlers Contracting Services, Inc., back to the top » | Aucun |
| Accueil | figure nommée par sa légende (« Park Shore, Naples ») ; photo décrite (« A Park Shore living room remodeled by Ehlers Contracting: white sofas and armchairs… ») ; liste « In this room » de trois repères, sans leurs numéros (décor) ; puis le titre de niveau 1 | Aucun |
| Rick | titre de niveau 2 ; figure « Rick Ehlers, Owner, Certified Building Contractor » ; liste de définitions (Licensed, Local, Homes and businesses) ; liste « How a project runs » de cinq étapes | Aucun |
| Cuisine | photo décrite ; liste de cinq détails, chacun avec son titre de niveau 3 et sa phrase. Le cadre, le voile et les numéros posés sur la photo sont masqués : ils doublent la liste | Aucun |
| Services | tableau « Services » : 3 colonnes (Service, What it covers, From recent permits), 8 lignes ; chaque service est un en-tête de ligne et un titre de niveau 3. Le plan des cages est une image : « Two screen enclosures drawn to the same scale: 32 by 10 feet, and 16 by 12.5 feet. » | Aucun |
| Fourchette de prix | « Most projects fall between these two figures. », puis « $10,000 a bathroom », « $500,000 a home addition » ; la ligne de cote est masquée | Aucun |
| Registre | liste de définitions de la licence ; lien « Search CBC1250125 on myfloridalicense.com (opens in a new tab) » ; groupe « Show jobs by type », 7 boutons pressés ou non (« Kitchens 3 ») ; le nombre affiché est annoncé (« 3 jobs: kitchens. ») ; liste des chantiers ; bouton « Show all 16 jobs » | Aucun |
| Formulaire | champs nommés par leur étiquette ; aide et erreur lues avec le champ ; état « invalide » sur les champs à corriger | Aucun |
| Pied de page | « Ehlers », puis le cartouche en liste de définitions (Contractor, License, Phone, Email, Based in) | Aucun |

### Mouvement
- Avec « réduire les animations » :
  - pas d'ouverture : la photo, les repères et le titre sont là dès l'affichage ;
  - pas de défilement doux ;
  - la cote du projet, le plan des cages et la fourchette sont tracés d'emblée ;
  - le cadre de la cuisine passe d'un détail à l'autre sans glisser ;
  - aucune transition.
- Sans ce réglage :
  - une seule ouverture, 2,7 s, jouée au chargement : une ligne d'horizon se tend (0,12 à 0,67 s), la photo s'ouvre verticalement à partir d'elle (0,62 à 1,72 s), le titre et le texte se découvrent de gauche à droite, puis les repères et la légende ; rien ne clignote, la photo n'est pas zoomée, la page ne se décale pas (CLS 0) ; rien ne bloque la page pendant ce temps ;
  - les titres des parties se découvrent (1,1 s), la cote du projet, le plan des cages et la fourchette se tracent, une fois, quand ils arrivent à l'écran ;
  - en réponse au défilement ou à un geste : le cadre de la cuisine glisse vers le détail qu'on lit (0,7 s), les chantiers filtrés apparaissent (0,45 s) ;
  - rien ne se répète en boucle.

### Corrections prioritaires
Toutes les corrections ci-dessus sont faites. Il reste :
1. **Tester avec VoiceOver (iPhone) et NVDA (Windows)** : surtout le tableau des services (en-têtes de ligne et de colonne), les filtres du registre (nombre annoncé), « Show all 16 jobs » (focus sur le 9e chantier) et les erreurs du formulaire.
2. **Le formulaire ouvre la messagerie du visiteur.** Sans messagerie configurée (un ordinateur partagé, par exemple), rien ne s'ouvre. Le téléphone et le courriel sont écrits en grand juste au-dessus ; un vrai envoi par le site demandera un service de formulaire, à choisir avec Rick.
3. **Le lien de vérification mène au site de l'État** (myfloridalicense.com) : son accessibilité ne dépend pas de nous. Le numéro et le statut de la licence sont écrits en texte sur la page.
