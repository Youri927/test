## Audit d'accessibilité : nouveau site Castor Dental Associates
**Norme :** WCAG 2.1 AA, avec deux critères de la 2.2 en plus (2.4.11 focus non masqué, 2.5.8 taille des cibles) | **Date :** 12 octobre 2026

Page auditée : `dist-web/index.html`, servie en local. Testée sur ordinateur (de 960 à 1920 px) et sur téléphone (de 320 à 820 px).

Méthode :
- Lighthouse, sur ordinateur et sur téléphone ;
- scripts Playwright :
  - `tools/a11y.mjs` : parcours complet au clavier, focus caché ou non, cibles tactiles, contrastes mesurés sur les vrais pixels (sous les lettres seulement), contours et repères, espacement du texte élargi ;
  - `tools/interact.mjs` : chaque interaction à la souris, au doigt et au clavier, mouvement réduit, 18 largeurs d'écran ;
- arbre d'accessibilité de Chromium, lu composant par composant.

Pas de test avec un vrai lecteur d'écran (VoiceOver ou NVDA) : il reste à faire avant la mise en ligne.

### Résumé
**Problèmes trouvés :** 6 | **Critiques :** 0 | **Majeurs :** 3 | **Mineurs :** 3

**Les 6 sont corrigés dans cette version.**

Lighthouse Accessibilité : 100 sur ordinateur et sur téléphone (Bonnes pratiques et SEO : 100 aussi).

### Constats

#### Perceptible
| # | Problème | Critère WCAG | Gravité | Correction |
|---|----------|--------------|---------|------------|
| 1 | Contour de focus dans le pied de page : le bleu du site sur le bleu nuit du pied de page, 1,59:1. On ne voyait presque pas quel lien avait le focus. | 1.4.11 Contraste du non-textuel, 2.4.7 Focus visible | 🟡 Majeur | Corrigé : contour blanc dans le pied de page (17,19:1). Ailleurs : bleu sur blanc ou sur brume (9,63 à 10,84:1), vert feuille sur la haie de l'équipe (6,45:1). |

#### Utilisable
| # | Problème | Critère WCAG | Gravité | Correction |
|---|----------|--------------|---------|------------|
| 2 | Lien d'évitement et liens de la page : pour le défilement doux, le script interceptait les liens vers les sections, et le focus restait sur le lien. Au clavier, « Skip to content » ne menait pas au contenu, et après « Team » la touche Tab repartait de l'en-tête. | 2.4.1 Contourner des blocs, 2.4.3 Parcours du focus | 🟡 Majeur | Corrigé : la section visée reçoit le focus après le défilement (sans cadre autour de toute la section). Vérifié par les essais : après l'évitement, Tab va sur « Call 239.300.4635 » dans l'accueil. |
| 3 | Téléphone : la barre d'appel, fixée en bas, cachait les éléments qui recevaient le focus au clavier (« Root canals and extractions », « Whitening », « Laser dentistry »…). | 2.4.11 Focus non masqué (2.2) | 🟡 Majeur | Corrigé : la page garde 96 px libres en bas quand elle fait défiler un élément vers le focus. Mesuré au centre de chaque élément : plus aucun focus sous la barre ni sous l'en-tête, sur les 55 arrêts (ordinateur) et les 49 arrêts (téléphone). |
| 4 | Cibles tactiles sur téléphone : le nom du cabinet dans l'en-tête faisait 19 px de haut ; « Get directions », « carecredit.com », le téléphone et le courriel de la visite, 18 à 21 px ; les liens du pied de page, 24 px ; les choix du sujet, 40 px. | 2.5.8 Taille de la cible (24 px), 2.5.5 (44 px) | 🟢 Mineur | Corrigé : 44 px de haut pour tous, sans changer la mise en page. Restent sous 44 px les mots expliqués et les liens dans des phrases (exemptés par 2.5.8, à 26-27 px). |
| 5 | Menu du téléphone : le focus y restait enfermé, mais le reste de la page restait lisible par un lecteur d'écran derrière la fenêtre. | 4.1.2 Nom, rôle, valeur | 🟢 Mineur | Corrigé : pendant que le menu est ouvert, l'en-tête, la page, le pied de page et la barre d'appel deviennent inertes. Échap ferme le menu et rend le focus au bouton « Menu ». |
| 6 | Bouton « Email my request » et sa note : sur ordinateur, l'exemple du champ « When suits you? » était coupé (« next w… »). | 3.3.2 Étiquettes ou instructions | 🟢 Mineur | Corrigé : « e.g. mornings, or after 3 pm », qui tient dans le champ à toutes les largeurs. L'étiquette du champ reste visible au-dessus. |

#### Compréhensible
Rien d'autre à signaler. Le formulaire a été construit avec ses messages :
- chaque erreur est écrite sous son champ et dit quoi faire (« Enter a phone number with at least 10 digits. ») ;
- le champ en erreur est signalé (`aria-invalid`) et renvoie à son message (`aria-describedby`) ;
- le curseur va au premier champ à corriger ;
- le message disparaît dès que le champ est corrigé ;
- le courriel est facultatif et n'est refusé que s'il est incomplet ;
- choisir « Something hurts » fait apparaître, sans rien changer d'autre, la note qui propose d'appeler ;
- rien ne se perd : après l'envoi, le formulaire garde ce qui a été écrit, rien n'est à ressaisir si la messagerie ne s'ouvre pas.

Une note sous le bouton dit à l'avance ce qui va se passer : « This opens your email app with the request written out, addressed to Castordentalassociates@gmail.com. Rather talk? 239.300.4635. »

Rien ne change au focus seul, sauf la définition d'un mot expliqué, qui s'affiche à côté du mot sans le couvrir et sans déplacer la page (3.2.1).

#### Robuste
Rien à signaler. Chaque composant expose son nom, son rôle et son état (tableau « Lecteur d'écran »).

### Contrôle des contrastes
71 textes mesurés sur les vrais pixels, plus les trois lignes de la définition ouverte : tous au-dessus du seuil, de 6,45:1 à 17,19:1. Les calculs ci-dessous donnent les mêmes valeurs.

| Élément | Texte | Fond | Rapport | Exigé | OK ? |
|---------|-------|------|---------|-------|------|
| Texte courant | #0E1A37 | #FFFFFF | 17,19:1 | 4,5:1 | ✅ |
| Texte courant sur brume (soins, prix) | #0E1A37 | #EEF2F6 | 15,28:1 | 4,5:1 | ✅ |
| Texte secondaire (chapôs, légendes, notes) | #3A4660 | #FFFFFF | 9,44:1 | 4,5:1 | ✅ |
| Texte secondaire sur brume | #3A4660 | #EEF2F6 | 8,39:1 | 4,5:1 | ✅ |
| Bleu de l'enseigne (titres, liens, bouton secondaire) | #22348C | #FFFFFF | 10,84:1 | 4,5:1 | ✅ |
| Bleu sur brume | #22348C | #EEF2F6 | 9,63:1 | 4,5:1 | ✅ |
| Bouton bleu | #FFFFFF | #22348C | 10,84:1 | 4,5:1 | ✅ |
| Équipe : titres et noms | #FFFFFF | #2F3B22 | 11,87:1 | 4,5:1 | ✅ |
| Équipe : nom choisi, fonction dans la biographie | #B5C77A | #2F3B22 | 6,45:1 | 4,5:1 | ✅ |
| Équipe : fonction sous les portraits | blanc à 74 % | #2F3B22 | 7,31:1 | 4,5:1 | ✅ |
| Message d'erreur | #A3241E | #FFFFFF | 7,42:1 | 4,5:1 | ✅ |
| Pied de page | blanc à 86 % | #0E1A37 | 12,88:1 | 4,5:1 | ✅ |
| Mentions du pied de page (13 px) | blanc à 66 % | #0E1A37 | 8,01:1 | 4,5:1 | ✅ |
| Définition ouverte : mot et texte, source | blanc, blanc à 68 % | #0E1A37 | 17,19 / 8,46:1 | 4,5:1 | ✅ |
| Enseigne en bardage de la visite (pixels réels, décorative, masquée aux lecteurs d'écran) | #22348C | planches #FCFDFE à #C9D1DB | 7,85:1 | 3:1 | ✅ |
| Bords des champs et des choix du sujet | #7C879B | #FFFFFF | 3,62:1 | 3:1 | ✅ |
| Pointillé des mots expliqués, ligne du temps du cas | #22348C | #FFFFFF | 10,84:1 | 3:1 | ✅ |
| Contour de focus | #22348C / #B5C77A / #FFFFFF | blanc ou brume / haie / pied de page | 9,63 à 17,19:1 | 3:1 | ✅ |

Les mots expliqués se distinguent du texte par leur pointillé, pas seulement par la couleur (1.4.1). L'étape en cours du cas est marquée par un point plein et par son titre.

### Navigation au clavier
55 arrêts sur ordinateur, 49 sur téléphone, dans l'ordre de lecture ; focus toujours visible, jamais caché par l'en-tête ni par la barre d'appel.

| Élément | Ordre | Entrée / Espace | Échap | Flèches |
|---------|-------|-----------------|-------|---------|
| Lien « Skip to content » | 1er | Va au contenu ; Tab continue dans l'accueil | — | — |
| En-tête : nom du cabinet, 6 liens, téléphone, « Request a visit » | 2 à 10 | Fait défiler jusqu'à la section, qui reçoit le focus | — | — |
| Bouton « Menu » (sous 960 px) | après le nom | Ouvre le menu ; le reste de la page devient inerte | Ferme le menu, focus sur « Menu » | — |
| Accueil : « Call 239.300.4635 », « Request a visit » | ensuite | Appelle ; va au formulaire | — | — |
| Mots expliqués (15 dans la page) | dans le texte | Épingle la définition (elle s'affiche déjà au focus) | Ferme la définition | — |
| Cas d'orthodontie, sur téléphone | un arrêt, la bande qui défile | — | — | Gauche et droite font défiler les trois photos |
| Soins (11 dépliants et un lien vers l'orthodontie) | dans l'ordre | Ouvre ou ferme le soin | — | — |
| Équipe (8 portraits) | dans l'ordre | Affiche la biographie (état « pressé »), annoncée aux lecteurs d'écran | — | — |
| Prix : « carecredit.com » | ensuite | Ouvre le site de CareCredit | — | — |
| Visite : itinéraire, téléphone, courriel | dans l'ordre | Suit le lien | — | — |
| Formulaire : sujet (6 choix), 5 champs, envoi | le sujet est un seul arrêt | Envoi : messages d'erreur ou courriel préparé | — | Changent de sujet |
| Pied de page : téléphone, courriel, 6 liens, Facebook | dans l'ordre | Suit le lien | — | — |
| Barre d'appel du téléphone : « Call », « Request a visit » | après le pied de page, seulement quand elle est affichée | Appelle ; va au formulaire | — | — |

### Lecteur d'écran
Relevé dans l'arbre d'accessibilité de Chromium. Reste à confirmer avec VoiceOver et NVDA.

| Élément | Annoncé comme | Problème |
|---------|---------------|----------|
| Repères | bannière, navigation « Sections », principal, pied de page ; chaque section porte son titre | Aucun |
| Nom du cabinet | lien « Castor Dental Associates, back to top » | Aucun |
| Accueil | région nommée par le titre ; photo décrite (« The practice at 785 Central Avenue: a white clapboard cottage… ») ; l'enseigne animée et la plaque de l'ouverture sont masquées | Aucun |
| Cas d'orthodontie | liste « One patient's treatment, from the tongue side », trois figures décrites (« Before treatment: the lower front teeth seen from the tongue side… ») ; le repère « the wire » est masqué, la description le dit déjà | Aucun |
| Mot expliqué | bouton « lingual », décrit par sa définition (`aria-describedby`) : « Lingual. The side of the tooth towards the tongue. From the practice's dental dictionary. » | Aucun |
| Soins | groupes nommés par leur titre ; chaque soin est un dépliant natif (`details`), annoncé ouvert ou fermé | Aucun |
| Équipe | liste « The team, left to right », 8 boutons « Denise Practice administrator », pressés ou non ; la biographie choisie est annoncée (`aria-live`) | Aucun |
| Avis | chaque engagement : titre, phrase, citation (`blockquote`) et sa source | Aucun |
| Enseigne en bardage de la visite | masquée : l'adresse, le téléphone et le nom du docteur sont dits juste après en texte | Aucun |
| Formulaire | formulaire « Request a visit » ; groupe « What is it about? », 6 boutons radio ; champs « Your name », « Phone » (obligatoires, saisie automatique), « Email (optional) », « When suits you? (optional) », « Anything else? (optional) » | Aucun |
| Erreurs | chaque champ en erreur renvoie à son message, lu avec le champ | Aucun |
| Confirmation | « Your email app should now be open with the request… » (`role="status"`) | Aucun |
| Barre d'appel | masquée tant qu'elle n'est pas affichée, liens hors de la tabulation | Aucun |

### Mouvement
- Avec « réduire les animations » :
  - pas d'ouverture : la photo de la façade est là tout de suite, l'enseigne animée n'apparaît pas ;
  - pas de défilement doux ;
  - la ligne du temps du cas est tracée d'emblée ;
  - les soins s'ouvrent sans animation ;
  - toutes les transitions sont ramenées à 0,01 ms.
- Sans ce réglage :
  - une seule ouverture, 2,4 s, jouée seulement si la page est chargée en haut (pas en arrivant sur un lien vers une section) ;
  - la ligne du temps du cas se trace une fois, quand le cas arrive à l'écran ;
  - les soins s'ouvrent en 0,34 s, les biographies apparaissent en 0,45 s ;
  - rien ne clignote, rien ne se répète, rien ne bouge seul après l'ouverture.

### Corrections prioritaires
Toutes les corrections ci-dessus sont faites. Il reste :
1. **Tester avec VoiceOver (iPhone) et NVDA (Windows)** : surtout les mots expliqués (définition annoncée au focus), l'équipe (biographie annoncée) et le formulaire.
2. **Le formulaire passe par la messagerie du visiteur.** Branché à un vrai service d'envoi, il éviterait de dépendre d'une application de courriel configurée (voir `REVUE.md`).
3. **Les mots expliqués font 26-27 px de haut sur téléphone.** Ils sont exemptés comme mots dans le texte, et leur définition s'ouvre aussi au focus ; à garder en tête si l'on en ajoute hors des phrases.
