## Audit d'accessibilité : nouveau site Prestige Pools of Wilmington
**Norme :** WCAG 2.1 AA (avec le critère 2.5.8 de la 2.2 en bonus) | **Date :** 12 octobre 2026

Page auditée : `dist-web/index.html`, servie en local, lumières éteintes (jour) puis allumées (nuit). Testée sur ordinateur (1440, 1280, 1200, 1100, 1024 px) et sur téléphone (820, 600, 390, 360, 320 px).

Méthode :
- Lighthouse, sur ordinateur, sur téléphone, et sur téléphone de nuit ;
- scripts Playwright (`tools/a11y.mjs`, `tools/interact.mjs`) :
  - parcours complet au clavier ;
  - mesure des cibles tactiles ;
  - contraste mesuré sur les vrais pixels, sous les lettres seulement, de jour et de nuit ;
  - dix largeurs d'écran ;
  - espacement du texte élargi ;
  - mouvement réduit ;
  - arbre d'accessibilité lu par les lecteurs d'écran.

Pas de test avec un vrai lecteur d'écran (VoiceOver ou NVDA) : il reste à faire avant la mise en ligne.

### Résumé
**Problèmes trouvés :** 6 | **Critiques :** 0 | **Majeurs :** 3 | **Mineurs :** 3

**Les 6 sont corrigés dans cette version.**

Le site a deux thèmes complets, le jour et la nuit (« Pool lights »). Chaque mesure a donc été faite deux fois : 50 textes mesurés de jour, les mêmes 50 de nuit, tous au-dessus du seuil.

Lighthouse Accessibilité : 100 sur ordinateur, 100 sur téléphone, 100 sur téléphone de nuit (Bonnes pratiques et SEO : 100 aussi).

### Constats

#### Perceptible
| # | Problème | Critère WCAG | Gravité | Correction |
|---|----------|--------------|---------|------------|
| 1 | Tableau « fibre de verre, béton, liner » sur téléphone : en empilant les lignes, les valeurs perdaient le nom de leur colonne. « 3 to 5 days » s'affichait sans dire de quel type de piscine il s'agit. | 1.3.1 Information et relations | 🟡 Majeur | Corrigé : sur téléphone, chaque valeur est précédée du nom de sa colonne (Fiberglass, Concrete, Vinyl liner), affiché et lu. Sur ordinateur, c'est un vrai tableau, avec en-têtes de colonnes et de lignes. |
| 2 | En-tête sur téléphone : à 390, 360 et 320 px, le logo, l'interrupteur et le bouton « Menu » ne tenaient pas sur une ligne, et la page défilait de côté. | 1.4.10 Redistribution | 🟡 Majeur | Corrigé : en-tête compact. Le mot « Pool lights » de l'interrupteur y est masqué à l'écran mais toujours lu. Plus aucun défilement de côté, de 1440 à 320 px. |
| 3 | Avec l'espacement du texte élargi : à 320 px, le mot « Fiberglass » du titre et le grand « 10 × 16 ft » élargissaient leur colonne (45 px de débordement) ; à 390 et 320 px, le bouton « Menu » sortait de l'écran. | 1.4.12 Espacement du texte | 🟡 Majeur | Corrigé : ces textes passent à la ligne si nécessaire, et le nom de l'entreprise peut tenir sur deux lignes. Rien n'est coupé ni caché à 1440, 1024, 390 et 320 px. La mise en page normale ne change pas. |
| 4 | Interrupteur « Pool lights » éteint : pastille blanche sur rail gris clair (1,74:1), rail presque invisible sur le fond (1,43:1). | 1.4.11 Contraste du non-textuel | 🟢 Mineur | Corrigé : rail plus foncé. Mesuré sur les pixels : pastille sur rail 3,92:1, rail sur fond 3,25:1. Allumé : 5,61:1. L'état se voit aussi à la page entière, qui passe de nuit. |
| 5 | Bords des champs du formulaire : 1,8:1 de jour, 2,7:1 de nuit. | 1.4.11 Contraste du non-textuel | 🟢 Mineur | Corrigé : bords plus marqués. Mesuré sur les pixels : 3,57 à 3,81:1 de jour, 3,94 à 4,24:1 de nuit. |

#### Utilisable
| # | Problème | Critère WCAG | Gravité | Correction |
|---|----------|--------------|---------|------------|
| 6 | Liens seuls sur leur ligne (« Ask about the cocktail pool », « Ask about spas and hot tubs », téléphone et « Get directions » de la visite) : 21 à 23 px de haut sur téléphone. | 2.5.8 Taille de la cible (24 px), 2.5.5 (44 px) | 🟢 Mineur | Corrigé : 44 px de haut, sans changer la mise en page. |

#### Compréhensible
Rien à signaler. Le formulaire a été construit avec ses messages d'erreur :
- en cas d'oubli, un seul message dit tout ce qui manque (« To send your request, add your first name, your last name, a valid email address and a phone number with its area code. ») ;
- il est annoncé dès l'envoi (`role="alert"`) ;
- chaque champ en erreur y renvoie (`aria-describedby`) ;
- le curseur va au premier champ à compléter.

Une note sous le bouton dit à l'avance ce qui va se passer : « Opens your email app with the request written out, ready to send to sales.ppow@gmail.com. » L'adresse change si l'on choisit « Service for my Prestige pool ».

Les lumières ne changent jamais au focus. Elles changent quand on appuie sur l'interrupteur, ou toutes seules au coucher du soleil si le visiteur n'a rien choisi (voir « Mouvement »).

#### Robuste
Rien à signaler. Chaque composant expose son nom, son rôle et son état (détails dans le tableau « Lecteur d'écran »).

### Contrôle des contrastes
Chaque texte a aussi été mesuré sur les vrais pixels, en ne gardant que la zone sous les lettres, soulignés des liens masqués. Résultat : 50 textes sur 50 au-dessus du seuil, de jour comme de nuit. Les calculs ci-dessous donnent les mêmes valeurs.

| Élément | Texte | Fond | Rapport | Exigé | OK ? |
|---------|-------|------|---------|-------|------|
| Jour : texte courant | #0C1838 | #E4EBEF | 14,48:1 | 4,5:1 | ✅ |
| Jour : texte secondaire (chapôs, légendes, notes) | #46546B | #E4EBEF | 6,36:1 | 4,5:1 | ✅ |
| Jour : texte secondaire sur les encarts | #46546B | #EDF2F4 | 6,79:1 | 4,5:1 | ✅ |
| Jour : liens | #2B47F5 | #E4EBEF / #EDF2F4 | 5,25 / 5,60:1 | 4,5:1 | ✅ |
| Jour : bouton bleu | #FFFFFF | #2B47F5 | 6,32:1 | 4,5:1 | ✅ |
| Jour : filtre ou sujet choisi | #E4EBEF | #0C1838 | 14,48:1 | 4,5:1 | ✅ |
| Nuit : texte courant | #EAF0F7 | #0A1430 | 15,84:1 | 4,5:1 | ✅ |
| Nuit : texte secondaire | #A8B6CC | #0A1430 | 8,85:1 | 4,5:1 | ✅ |
| Nuit : texte secondaire sur les encarts | #A8B6CC | #101B3C | 8,22:1 | 4,5:1 | ✅ |
| Nuit : liens | #A9B9FF | #0A1430 / #101B3C | 9,58 / 8,90:1 | 4,5:1 | ✅ |
| Nuit : bouton bleu | #FFFFFF | #3550FF | 5,61:1 | 4,5:1 | ✅ |
| Nuit : filtre ou sujet choisi | #0A1430 | #EAF0F7 | 15,84:1 | 4,5:1 | ✅ |
| Grand « 10 × 16 ft » (décoratif, masqué aux lecteurs d'écran) | #2B47F5 / #7A90FF | encart jour / nuit | 5,60 / 5,84:1 | 3:1 | ✅ |
| Devise « Helping families have fun. That's us. » (pixels réels) | bleu, halo la nuit | fond jour / nuit | 5,25 / 6,28:1 | 3:1 | ✅ |
| Bande de nuit et pied de page (toujours de nuit) | #EAF0F7, #A8B6CC | #0A1430 | 15,84 / 8,85:1 | 4,5:1 | ✅ |
| Contour de focus, jour | #2B47F5 | #E4EBEF | 5,25:1 | 3:1 | ✅ |
| Contour de focus, nuit, bande de nuit, pied de page, visionneuse | #A9B9FF | #0A1430 | 9,58:1 | 3:1 | ✅ |
| Interrupteur éteint (pixels réels) | pastille blanche / rail | rail / fond | 3,92 / 3,25:1 | 3:1 | ✅ |
| Interrupteur allumé (pixels réels) | pastille blanche | rail bleu | 5,61:1 | 3:1 | ✅ |
| Bords des champs (pixels réels) | bord | fond, intérieur du champ | 3,57 à 4,24:1 | 3:1 | ✅ |

Les pastilles colorées (point vert « Open now », point ambré « After dark » la nuit, point du logo) accompagnent un texte qui dit déjà la même chose : elles ne portent aucune information seules.

### Navigation au clavier
62 arrêts de tabulation dans l'ordre de lecture, focus toujours visible et jamais caché par l'en-tête (l'en-tête masqué au défilement réapparaît dès qu'il reçoit le focus).

| Élément | Ordre | Entrée / Espace | Échap | Flèches |
|---------|-------|-----------------|-------|---------|
| Lien « Skip to content » | 1er | Va au contenu | — | — |
| En-tête : logo, 6 liens, téléphone, interrupteur, « Plan your pool » | 2 à 11 | Suit le lien ; l'interrupteur allume ou éteint (état « pressé ») | — | — |
| Bouton « Menu » (sous 1180 px) | après le logo | Ouvre ou ferme le menu ; la page derrière devient inerte | Ferme le menu, focus sur « Menu » | — |
| Accueil : « Plan your pool », « or call 910-509-2370 », grand interrupteur | 12 à 14 | Suit le lien ; allume ou éteint, les deux interrupteurs restent d'accord | — | — |
| Filtres de la galerie | 6 boutons | Filtre les photos (état « pressé »), le nombre de photos est annoncé | — | — |
| Vignettes de la galerie | 18 boutons sur ordinateur, 10 sur téléphone, puis « Show all 34 photos » | Ouvre la visionneuse ; le focus y reste enfermé | Ferme, le focus revient sur la vignette | Gauche et droite : photo précédente ou suivante |
| Couleur des projecteurs (White, Blue, Red) | un seul arrêt (groupe de boutons radio) | — | — | Changent la couleur, la photo suit |
| Liens « Ask about… » et « Request service » | dans l'ordre | Vont au formulaire avec le bon sujet déjà coché | — | — |
| Formulaire : sujet (4 choix), 6 champs, envoi | dans l'ordre ; le sujet est un seul arrêt | Envoi : message d'erreur ou courriel préparé | — | Changent de sujet |
| Visite et pied de page : téléphone, courriels, plan, réseaux | dans l'ordre | Suit le lien | — | — |

### Lecteur d'écran
Relevé dans l'arbre d'accessibilité de Chromium. Reste à confirmer avec VoiceOver et NVDA.

| Élément | Annoncé comme | Problème |
|---------|---------------|----------|
| Repères | bannière, navigation « Main », principal, pied de page ; chaque section porte son titre | Aucun |
| Logo | lien « Prestige Pools of Wilmington, back to top » | Aucun |
| Interrupteur | bouton « Pool lights », pressé ou non | Aucun |
| Photo de l'accueil | figure avec une seule photo décrite : celle qu'on voit (« A rectangular Prestige pool at dusk… » ou la même allumée). L'autre est masquée et les descriptions s'échangent avec les lumières | Aucun |
| Légende de l'accueil | « A Prestige pool at dusk. Sunset in Wilmington today: 6:41 pm. » | Aucun |
| Tableau comparatif | tableau avec en-têtes ; sur téléphone, chaque valeur précédée du nom de sa colonne | Corrigé (constat 1) |
| Étapes de la pose | liste numérotée « How a Prestige pool goes in », un titre par étape | Aucun |
| Filtres | groupe « Show pools », boutons pressés ou non ; « 7 pools by the water » annoncé au changement | Aucun |
| Vignette | bouton « Open photo: » suivi de la description | Aucun |
| Visionneuse | dialogue « Photo viewer », figure décrite, « 1 of 34 », « Previous photo », « Next photo », « Close » | Aucun |
| Projecteurs | groupe « Light this pool in », 3 boutons radio ; seule la photo visible est lue | Aucun |
| Statut | « Open now » ou « Closed now », à l'heure de Wilmington | Aucun |
| Formulaire | groupe « What are you planning? », 4 boutons radio ; champs « First name », « Last name », « Email », « Phone », obligatoires, avec saisie automatique ; « Where will it go? » et « Anything else? » facultatifs | Aucun |
| Erreur | alerte « To send your request, add your first name, … » | Aucun |

### Mouvement
- Avec « réduire les animations » :
  - pas de défilement doux ;
  - le titre de l'accueil est affiché tout de suite ;
  - les photos ne se révèlent pas au défilement, elles sont déjà là ;
  - l'interrupteur change la page d'un coup, sans passage par le crépuscule (vérifié : fond de nuit et photo allumée 60 ms après l'appui) ;
  - toutes les transitions sont ramenées à 0,01 ms.
- Sans ce réglage :
  - le titre monte une fois au chargement, en 0,9 s ;
  - l'interrupteur de la photo s'éclaire une seule fois, pour qu'on le remarque ;
  - le passage jour-nuit dure 1,25 s ;
  - rien ne clignote, rien ne se répète.
- Le passage automatique au coucher du soleil se fait une seule fois, en douceur, et seulement si le visiteur n'a rien choisi. Un appui sur l'interrupteur revient en arrière, et ce choix est gardé pour les visites suivantes.

### Corrections prioritaires
Toutes les corrections ci-dessus sont faites. Il reste :
1. **Tester avec VoiceOver (iPhone) et NVDA (Windows)** : surtout l'interrupteur, la visionneuse, le choix des projecteurs et le formulaire. C'est le seul moyen de confirmer ce que l'arbre d'accessibilité laisse prévoir.
2. **Agrandir les liens du pied de page** (28 px de haut aujourd'hui) si l'on vise 44 px partout. Ils respectent déjà le minimum de 24 px (2.5.8), et le téléphone existe en grand plus haut dans la page.
3. **Trois liens dans des phrases** (« our Facebook page », le courriel et le téléphone de « Already swimming in a Prestige pool? ») font 21 px de haut. Ils sont exemptés comme liens dans le texte, à garder en tête si on les sort de leur phrase.
