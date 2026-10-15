## Audit d'accessibilité : nouveau site Five Points Roofing
**Norme :** WCAG 2.1 AA, avec deux critères de la 2.2 en plus (2.4.11 focus non masqué, 2.5.8 taille des cibles) | **Date :** 15 octobre 2026

Page auditée : `dist-web/index.html`, servie en local. Testée sur ordinateur (de 1000 à 1920 px), sur tablette et
sur téléphone (de 320 à 999 px).

Méthode :
- Lighthouse, sur ordinateur et sur téléphone ;
- scripts Playwright :
  - `tools/a11y.mjs` :
    - parcours complet au clavier, focus caché ou non ;
    - cibles tactiles, menu ouvert compris ;
    - contrastes mesurés sur les vrais pixels : tout le texte de la page est masqué, pour ne garder que le fond ;
    - contours des champs, indicateur des onglets, repères du dessin, contours de focus ;
    - espacement du texte élargi ;
    - titres, noms des contrôles, textes alternatifs, références entre éléments ;
  - `tools/interact.mjs` : 83 essais de chaque interaction à la souris, au doigt et au clavier, mouvement réduit,
    lien d'évitement, débordements sur les largeurs de 320 à 1920 px.

Pas de test avec un vrai lecteur d'écran (VoiceOver ou NVDA) : il reste à faire avant la mise en ligne.

### Résumé
**Problèmes trouvés :** 4 | **Critiques :** 0 | **Majeurs :** 1 | **Mineurs :** 3

**Les 4 sont corrigés dans cette version.**

Lighthouse Accessibilité : 100 sur ordinateur et sur téléphone (Bonnes pratiques, SEO et navigation par agents : 100
aussi).

### Constats

#### Perceptible
| # | Problème | Critère WCAG | Gravité | Correction |
|---|----------|--------------|---------|------------|
| 1 | Les contours des champs et des choix du formulaire (« A home », « Repair »…) étaient trop pâles : 2,61:1 sur blanc. | 1.4.11 Contraste du non-textuel | 🟡 Majeur | Corrigé : gris plus soutenu, 3,6:1. |
| 2 | Règle des garanties : les graduations touchaient le bas des chiffres « 0 », « 10 », « 20 », « 30 years ». | 1.4.3 Contraste (minimum) | 🟢 Mineur | Corrigé : les graduations descendent sous les chiffres (5,8:1). |

#### Utilisable
| # | Problème | Critère WCAG | Gravité | Correction |
|---|----------|--------------|---------|------------|
| 3 | Au téléphone, la rangée des photos de chantier défile de côté : sans contrôle focalisable, le clavier ne pouvait pas la faire défiler. | 2.1.1 Clavier | 🟢 Mineur | Corrigé : quand elle déborde, la rangée prend le focus (avec son nom, « Photos from our roofs ») et défile aux flèches. |
| 4 | Dans le dessin des toits, le chiffre d'un repère captait le pointeur à la place de la pastille. | 2.5.1 (confort) | 🟢 Mineur | Corrigé : le chiffre laisse passer le pointeur ; survoler un repère allume sa ligne dans la liste, et l'inverse. |

#### Compréhensible et robuste
Aucun problème trouvé :
- les onglets suivent le modèle ARIA (rôles `tablist`, `tab`, `tabpanel`, `aria-selected`, un seul onglet dans
  l'ordre de tabulation, flèches gauche et droite, Début, Fin) ; le panneau affiché prend le focus au Tab suivant ;
- chaque champ a son étiquette ; les erreurs sont reliées au champ (`aria-describedby`, `aria-invalid`), le focus va
  au premier champ en erreur, et le message prêt prend le focus ;
- le bouton du formulaire dit ce qui se passe, et la note précise que rien n'est envoyé depuis la page ;
- le bouton d'appel de l'en-tête s'appelle « Call 863-660-5834 » : son nom commence par le mot affiché (2.5.3).

### Contrastes
| Élément | Texte | Fond | Rapport | Requis | OK ? |
|---------|-------|------|---------|--------|------|
| Texte courant | #1C1E21 | #F4F5F2 | 15,3:1 | 4,5:1 | ✅ |
| Texte secondaire, légendes | #596068 | #F4F5F2 | 5,8:1 | 4,5:1 | ✅ |
| Onglet non choisi | #596068 | #FFFFFF | 6,4:1 | 4,5:1 | ✅ |
| Or foncé (« Lifetime », 14 px) | #7E6215 | #F4F5F2 | 5,3:1 | 4,5:1 | ✅ |
| « Lakeland » en or foncé (47 px) | #7E6215 | #F4F5F2 | 3,75:1 | 3:1 (grand texte) | ✅ |
| Texte de la tempête et du pied de page | #D9DDE1 / #AEB5BC | #1C1E21 | 12,2:1 / 8,1:1 | 4,5:1 | ✅ |
| Numéro de licence en or | #C3A046 | #1C1E21 | 4,05:1 mesuré (6,7:1 théorique) | 3:1 (grand texte) | ✅ |
| Numéro de téléphone du pied de page | #C3A046 | #1C1E21 | 6,7:1 | 3:1 (grand texte) | ✅ |
| Erreurs du formulaire | #B3261E | #FFFFFF | 6,5:1 | 4,5:1 | ✅ |
| Contour des champs | #7F878E | #FFFFFF | 3,6:1 | 3:1 | ✅ |
| Focus (asphalte, et blanc sur fond sombre) | — | — | 15,3:1 à 16,7:1 | 3:1 | ✅ |

L'or du logo (#C3A046) n'écrit jamais de texte sur fond clair. La ligne de toit dorée du dessin et les barres des
garanties ne sont pas seules à porter l'information : la liste des endroits et les durées écrites la donnent aussi
(1.4.11 ne s'applique qu'aux graphiques nécessaires à la compréhension).

### Clavier
| Élément | Ordre | Entrée / Espace | Échap | Flèches |
|---------|-------|-----------------|-------|---------|
| Lien d'évitement | 1er | va au contenu | — | — |
| Menu du téléphone | dans l'en-tête | ouvre, le focus va au premier lien | ferme et rend le focus au bouton | — |
| Onglets des toits | un seul arrêt | — | — | gauche et droite changent de toit ; Début, Fin |
| Questions | un arrêt par question | ouvre, ferme | — | — |
| Choix du formulaire | un arrêt par groupe | coche | — | changent de choix |
| Rangée de photos (téléphone) | un arrêt quand elle déborde | — | — | font défiler |

Le focus n'est jamais caché sous l'en-tête collant (`scroll-padding-top`), ni sur ordinateur ni au téléphone.

### Lecteur d'écran
| Élément | Annoncé comme | Remarque |
|---------|---------------|----------|
| Toit de mots de l'accueil | ignoré (`aria-hidden`) | La phrase « Roofing is in our blood » est aussi le titre de la partie famille ; le H1 est un vrai texte. |
| Dessin des toits | ignoré (`aria-hidden`) | Tout ce qu'il montre est dans la liste numérotée du panneau. |
| Logo | « Five Points Roofing, back to the top » | Le lien porte le nom ; le dessin du logo est caché. |
| Règle des garanties | liste de trois durées | Les graduations sont cachées ; chaque barre est suivie de sa durée écrite. |

### Mouvement
- Avec « réduire les animations » : pas de défilement amorti, le toit de l'accueil est là d'emblée, le dessin des
  toits est entier, les photos sont visibles sans biais, les onglets et les questions changent sans glisser (vérifié
  par les essais).
- Rien ne clignote, rien ne bouge seul plus de quelques secondes (2.2.2) : l'ouverture dure 1,8 s.

### Priorités
1. **Avant la mise en ligne** : un passage avec VoiceOver (iPhone) et NVDA (Windows) sur les onglets, le formulaire
   et le message prêt.
2. **Les cibles** : 19 liens isolés font de 42 à 43 px (le pied de page, le menu) : au-dessus du minimum de 24 px
   (2.5.8, AA), un peu sous les 44 px recommandés (2.5.5, AAA).
