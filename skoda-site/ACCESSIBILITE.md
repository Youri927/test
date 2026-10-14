## Audit d'accessibilité : nouveau site Skoda Construction
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
    - contours, repères de la frise, côte de la carte, contours de focus ;
    - espacement du texte élargi ;
    - titres, noms des contrôles, textes alternatifs, références entre éléments ;
  - `tools/interact.mjs` : 56 essais de chaque interaction à la souris, au doigt et au clavier, mouvement réduit,
    lien d'évitement, débordements sur les largeurs de 320 à 1920 px ;
- arbre d'accessibilité de Chromium, lu partie par partie.

Pas de test avec un vrai lecteur d'écran (VoiceOver ou NVDA) : il reste à faire avant la mise en ligne.

### Résumé
**Problèmes trouvés :** 11 | **Critiques :** 1 | **Majeurs :** 3 | **Mineurs :** 7

**Les 11 sont corrigés dans cette version.**

Lighthouse Accessibilité : 100 sur ordinateur et sur téléphone (Bonnes pratiques, SEO et navigation par agents : 100
aussi).

### Constats

#### Perceptible
| # | Problème | Critère WCAG | Gravité | Correction |
|---|----------|--------------|---------|------------|
| 1 | Carte : les noms des comtés (« Charlotte », « Lee », « Collier ») et « The Gulf » étaient trop pâles : 3,17:1 et 2,92:1. | 1.4.3 Contraste (minimum) | 🟡 Majeur | Corrigé : gris plus soutenus, 4,81:1 au pire point (sur la terre grise) et 5,47:1 (sur la mer blanche). |
| 2 | Espacement du texte élargi (interlignes, lettres, mots) : la page défilait de côté de 69 px sur ordinateur, et de 10 px au téléphone, où le bouton Menu sortait de l'écran. | 1.4.12 Espacement du texte | 🟡 Majeur | Corrigé : l'en-tête et les grilles absorbent l'espacement ; aucun texte coupé, aucun défilement de côté, sur ordinateur comme au téléphone. |
| 3 | Frise de la famille : le point bleu de chaque date se posait sur les chiffres de l'année (1950, 1985…). | 1.4.3 Contraste (minimum) | 🟢 Mineur | Corrigé : les années descendent sous la ligne ; les points restent sur la ligne, au-dessus du texte (6,32:1). |

#### Utilisable
| # | Problème | Critère WCAG | Gravité | Correction |
|---|----------|--------------|---------|------------|
| 4 | Contour de focus invisible dans le pied de page (bleu sur bleu, 1,00:1), et trop faible dans la partie sombre de la restauration (2,12:1). | 2.4.7 Visibilité du focus | 🔴 Critique | Corrigé : contour blanc sur le bleu (7,64:1), bleu clair sur le sombre (8,79:1), bleu ailleurs (7,64:1). |
| 5 | Le bouton Menu (téléphone) n'avait pour bord qu'un gris très clair, 1,64:1 : on voyait un mot, pas un bouton. | 1.4.11 Contraste du non-textuel | 🟡 Majeur | Corrigé : bord gris à 3,02:1, le même que les champs et les choix du formulaire. |
| 6 | Le bord du bouton Close de la visionneuse : 2,69:1 sur le fond sombre. | 1.4.11 Contraste du non-textuel | 🟢 Mineur | Corrigé : 6,17:1. |
| 7 | Téléphone : 28 cibles sous 44 px, dont 6 seules (le nom de l'entreprise, 29 px de haut ; « Call 239-777-7288 », 27 px ; les numéros, 25 px), puis les liens du pied de page (38 px) et les coordonnées du formulaire (43 px). Toutes passaient déjà le minimum de 24 px de la 2.2. | 2.5.8 Taille des cibles (et 2.5.5) | 🟢 Mineur | Corrigé : 44 px de haut pour toutes, sans déplacer la mise en page. « Call 239-777-7288 » de la partie restauration, pris dans une phrase, passe aussi à 44 px : c'est l'appel le plus urgent du site. Restent sous 44 px seulement des liens pris dans une phrase, exemptés : le lien vers le registre de l'État et les coordonnées dans le texte du message prêt. |

Le parcours au clavier suit l'ordre de lecture : 44 arrêts sur ordinateur, 38 au téléphone (tableau plus bas). Aucun
focus n'est caché sous l'en-tête fixe (2.4.11) : la page garde la hauteur de l'en-tête plus 16 px en haut
(`scroll-padding-top`).

#### Compréhensible
| # | Problème | Critère WCAG | Gravité | Correction |
|---|----------|--------------|---------|------------|
| 8 | Formulaire : l'erreur « Choose the kind of project. » n'était pas reliée au groupe de choix. Le focus allait bien au premier choix, mais un lecteur d'écran ne lisait pas l'erreur. | 3.3.1 Identification des erreurs | 🟢 Mineur | Corrigé : le groupe est décrit par l'erreur (`aria-describedby`). |

Rien d'autre à signaler sur le formulaire :
- chaque champ a son étiquette visible ; le budget et le message sont marqués « (optional) » ;
- les choix (projet, budget, moyen de contact) sont des groupes de boutons radio avec leur légende ;
- le budget n'apparaît qu'après le choix d'une maison ou d'une rénovation, sous le groupe du projet : rien ne bouge
  au-dessus du focus ;
- une erreur dit quoi faire (« Enter a phone number or an email address, so we can reach you. », « Check the email
  address: it should look like name@example.com. »), s'affiche sous le champ, et elle est reliée au champ
  (`aria-describedby`, `aria-invalid`) ;
- à l'envoi, le focus va au premier champ à corriger ;
- le bouton dit ce qui va se passer (« Write my email to Skoda »), et la note précise que rien n'est envoyé par la
  page ;
- le message prêt reçoit le focus, et « Copied. » est annoncé.

Rien ne change au focus seul (3.2.1).

#### Robuste
| # | Problème | Critère WCAG | Gravité | Correction |
|---|----------|--------------|---------|------------|
| 9 | Menu de l'en-tête : « Our family » restait marqué comme partie courante sur la carte et sur le formulaire, qui ne sont pas dans le menu. | 4.1.2 Nom, rôle et valeur (état) | 🟢 Mineur | Corrigé : hors des cinq parties du menu, aucun lien n'est marqué (`aria-current`). Un essai le vérifie. |
| 10 | Les photos des pièces ouvrent une visionneuse sans l'annoncer. | 4.1.2 Nom, rôle et valeur | 🟢 Mineur | Corrigé : `aria-haspopup="dialog"` ; chaque bouton est nommé par la description de sa photo. |
| 11 | Visionneuse : en passant à la photo suivante, rien n'était annoncé ; le focus restait sur « Next photo ». | 4.1.3 Messages d'état | 🟢 Mineur | Corrigé : la légende et le compteur (« 3 of 12 ») sont annoncés. La photo affichée garde la description de la vignette. |

Chaque composant expose son nom, son rôle et son état (tableau « Lecteur d'écran »). Aucun identifiant en double,
aucune référence cassée (`aria-labelledby`, `aria-describedby`, `aria-controls`, `for`).

### Contrôle des contrastes
89 mesures de texte : tout est au-dessus du seuil. Le texte courant ne descend pas sous 6,66:1.

| Élément | Texte | Fond | Rapport | Exigé | OK ? |
|---------|-------|------|---------|-------|------|
| Titres, texte principal, liens de l'en-tête | #17212E | #FFFFFF | 16,24:1 | 4,5:1 | ✅ |
| Texte secondaire (accroche, légendes, notes) | #565D66 | #FFFFFF | 6,66:1 | 4,5:1 | ✅ |
| Boutons pleins, pied de page | #FFFFFF | #0253A0 | 7,64:1 | 4,5:1 | ✅ |
| Liens bleus | #0253A0 | #FFFFFF | 7,64:1 | 4,5:1 | ✅ |
| La famille : texte | #17212E | #E9EAE6 | 13,43:1 | 4,5:1 | ✅ |
| La famille : années et rôles | #0253A0 | #E9EAE6 | 6,32:1 | 3:1 (grand) / 4,5:1 | ✅ |
| Restauration : titres et citations | #FFFFFF | #17212E | 16,24:1 | 4,5:1 | ✅ |
| Restauration : texte | #D3D8DE | #17212E | 11,32:1 | 4,5:1 | ✅ |
| Restauration : dates et liens | #9CC2EE | #17212E | 8,79:1 | 4,5:1 | ✅ |
| Restauration : auteurs des avis | #B9C1CB | #17212E | 8,93:1 | 4,5:1 | ✅ |
| Pied de page : texte | #EEF4FB | #0253A0 | 6,90:1 | 4,5:1 | ✅ |
| Pied de page : intitulés et mention finale | #C8DBF2 | #0253A0 | 5,41:1 | 4,5:1 | ✅ |
| Erreurs du formulaire | #B3261E | #FFFFFF | 6,54:1 | 4,5:1 | ✅ |
| Carte : noms des comtés | #5F666E | #E9EAE6 | 4,81:1 | 4,5:1 | ✅ |
| Carte : « The Gulf » | #5D6B78 | #FFFFFF | 5,47:1 | 4,5:1 | ✅ |
| Visionneuse : légende | #E3E8EE | #0F151E | 14,87:1 | 4,5:1 | ✅ |
| Visionneuse : compteur | #9AA5B1 | #0F151E | 7,32:1 | 4,5:1 | ✅ |

Contours et repères (seuil 3:1) : champs, choix et bouton Menu 3,02:1 ; côte de la carte 7,64:1 ; repères de la frise
6,32:1 ; bouton Close de la visionneuse 6,17:1 ; contours de focus de 7,64:1 à 8,79:1.

Le grand nom bleu derrière les photos (#0253A0 sur blanc, 7,64:1) est décoratif et caché aux lecteurs d'écran : le
titre de la page dit déjà « built by the Skoda family ».

### Navigation au clavier
| Élément | Ordre | Entrée / Espace | Échap | Flèches |
|---------|-------|-----------------|-------|---------|
| « Skip to content » | 1 | Va au contenu, sans passer par l'en-tête | — | — |
| En-tête (ordinateur) | 2 à 9 : le nom, les 5 parties, le téléphone, « Book a consultation » | Va à la partie, sous l'en-tête ; le focus suit | — | — |
| Menu (téléphone) | 2 à 5 : le nom, Menu, puis l'accueil | Ouvre le menu, le focus va au premier lien | Ferme le menu, le focus revient sur Menu | — |
| Accueil | « Book a consultation », « Call 239-777-7288 », « Meet the family » | Va au formulaire, appelle, va à la famille | — | — |
| Pièces (12 photos) | Une à une, dans l'ordre de la grille | Ouvre la visionneuse sur cette photo | Ferme, le focus revient sur la photo | ← → : photo précédente ou suivante, en boucle |
| Restauration | « Call 239-777-7288 » | Appelle | — | — |
| Formulaire | Téléphone, e-mail, registre de l'État, puis les champs dans l'ordre | Choisit, envoie | — | ← → ↑ ↓ dans chaque groupe de choix |
| Pied de page | Téléphone, e-mail, puis les 6 parties | Va à la partie | — | — |

Avec le mouvement réduit, Lenis n'est pas chargé : le défilement est celui du navigateur.

### Lecteur d'écran
| Élément | Annoncé comme | Problème |
|---------|---------------|----------|
| Nom de l'en-tête | « Skoda Construction, back to the top », lien | Aucun |
| Bouton Menu | « Menu », bouton, réduit / développé (`aria-expanded`, `aria-controls`) | Aucun |
| Grand nom « Skoda » | Rien (`aria-hidden`) : le titre le dit | Aucun |
| Photos de l'accueil | Liste « Some of our work », 8 photos décrites, avec leur légende | Aucun |
| Étapes du terrain à la maison | Figure « Three of our job sites, at three stages », 3 photos décrites | Aucun |
| Photos des pièces | « A white kitchen with a gray stone waterfall island… », bouton, ouvre une boîte de dialogue | Corrigé (n° 10) |
| Visionneuse | Boîte de dialogue « Photo viewer » ; « Previous photo », « Next photo », « Close » ; légende et compteur annoncés | Corrigé (n° 11) |
| La maison restaurée | 3 titres datés (novembre 2022, séchage, décembre 2023), 9 photos décrites ; la barre de progression est cachée | Aucun |
| Frise | Liste ordonnée de 4 dates | Aucun |
| Carte | Image : « Map of Florida's Gulf coast from Port Charlotte and Boca Grande in the north to Marco Island in the south… » ; la liste des villes par comté suit en texte | Aucun |
| Formulaire | Groupes « What are you planning? », « Budget (optional) », « Best way to reach you » ; erreurs reliées | Corrigé (n° 8) |
| Message prêt | Région focalisable « Your request is ready. » ; « Copied. » annoncé | Aucun |

### Mouvement
- L'ouverture (les lettres du nom qui montent, la première photo) se joue en 1,65 s une fois les polices là, et ne
  se répète pas.
- La maison restaurée ne s'épingle que sur ordinateur, et seulement si le mouvement n'est pas réduit.
- Avec « réduire les animations » : pas de Lenis, pas d'ouverture, pas de dévoilement des photos ; les trois étapes
  de la restauration sont posées l'une sous l'autre. Les 56 essais le vérifient.
- Rien ne clignote, rien ne bouge seul plus de 5 secondes (2.2.2).

### Corrections par ordre de priorité
1. **Focus visible partout** (n° 4) : les personnes au clavier perdaient leur position dans le pied de page.
2. **Contrastes de la carte, bord du bouton Menu, espacement du texte** (n° 1, 2, 5) : lisibilité pour les
   personnes malvoyantes, et un bouton reconnaissable comme tel.
3. **Annonces pour les lecteurs d'écran et cibles tactiles** (n° 6 à 11) : confort.

Toutes sont faites. Reste à tester avec VoiceOver (iPhone, Mac) et NVDA (Windows) avant la mise en ligne.
