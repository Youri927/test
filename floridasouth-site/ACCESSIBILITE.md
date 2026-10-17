## Audit d'accessibilité : nouveau site Florida South Construction
**Norme :** WCAG 2.1 AA, avec deux critères de la 2.2 en plus (2.4.11 focus non masqué, 2.5.8 taille des cibles) | **Date :** 17 octobre 2026

Page auditée : `dist-web/index.html`, servie en local. Testée sur ordinateur (de 1000 à 1920 px), sur tablette et
sur téléphone (de 320 à 999 px).

Méthode :
- Lighthouse 13.5, sur ordinateur et sur téléphone ;
- scripts Playwright :
  - `tools/a11y.mjs` :
    - parcours complet au clavier, focus caché ou non ;
    - cibles tactiles, menu ouvert compris ;
    - contrastes mesurés sur les vrais pixels : tout le texte de la page est masqué, pour ne garder que le fond (le
      trait qui barre la liste est retiré pour la mesure : il traverse le texte exprès) ;
    - contours du bouton Menu, des champs, des boutons de la visionneuse, contours de focus ;
    - espacement du texte élargi ;
    - titres, noms des contrôles, textes alternatifs, références entre éléments ;
  - `tools/interact.mjs` : 42 essais de chaque interaction à la souris, au doigt et au clavier, mouvement réduit,
    page sans JavaScript, lien d'évitement, débordements sur les largeurs de 320 à 1920 px.

Pas de test avec un vrai lecteur d'écran (VoiceOver ou NVDA) : il reste à faire avant la mise en ligne.

### Résumé
**Problèmes trouvés :** 6 | **Critiques :** 0 | **Majeurs :** 2 | **Mineurs :** 4

**Les 6 sont corrigés dans cette version.**

Lighthouse Accessibilité : 100 sur ordinateur et sur téléphone (Bonnes pratiques, SEO et navigation par agents : 100
aussi).

### Constats

#### Perceptible
| # | Problème | Critère WCAG | Gravité | Correction |
|---|----------|--------------|---------|------------|
| 1 | Le texte barré de la liste, blanc à 64 %, faisait 3,7:1 : assez pour les grandes lignes de l'ordinateur, pas pour la première ligne du téléphone (18 px). | 1.4.3 Contraste (minimum) | 🟡 Majeur | Corrigé : blanc à 80 % au téléphone (4,8:1), à 66 % sur ordinateur où toutes les lignes dépassent 24 px (4,1:1). |
| 2 | Les précisions des étiquettes (« Town or neighborhood », « Optional, so we can thank them ») : 4,2:1 sur le côté clair du ciel. | 1.4.3 Contraste (minimum) | 🟢 Mineur | Corrigé : 4,9:1. |

#### Utilisable
| # | Problème | Critère WCAG | Gravité | Correction |
|---|----------|--------------|---------|------------|
| 3 | À 320 et 340 px, le bouton « Menu » sortait de l'écran : défilement horizontal. | 1.4.10 Redistribution | 🟡 Majeur | Corrigé : l'en-tête tient de 320 à 1920 px (vérifié à chaque largeur). |
| 4 | Les liens du pied de page faisaient 22 px de haut. | 2.5.8 Taille des cibles (2.2) | 🟢 Mineur | Corrigé : 32 px. |
| 5 | Dans la visionneuse, après un clic sur la photo, les flèches ne répondaient plus. | 2.1.1 Clavier | 🟢 Mineur | Corrigé : les flèches marchent où que soit le focus, tant que la visionneuse est ouverte. |

#### Compréhensible et robuste
| # | Problème | Critère WCAG | Gravité | Correction |
|---|----------|--------------|---------|------------|
| 6 | Le lien du logo s'appelle « Florida South Construction, back to the top », mais son texte visible se lisait « Florida SouthConstruction » (sans espace). | 2.5.3 Étiquette dans le nom | 🟢 Mineur | Corrigé : l'espace est dans le texte ; le nom commence par les mots affichés. |

Rien d'autre :
- chaque champ a son étiquette ; les erreurs sont reliées au champ (`aria-describedby`, `aria-invalid`), le focus va
  au premier champ en erreur, et la demande prête prend le focus ;
- le bouton du formulaire dit ce qui se passe (« Email my list »), et la note précise que rien ne part de la page ;
- le bouton d'appel de l'en-tête s'appelle « Call (239) 449-4477 » : son nom commence par le mot affiché.

### Contrastes
| Élément | Texte | Fond | Rapport | Requis | OK ? |
|---------|-------|------|---------|--------|------|
| Texte courant | #18213A | #FFFFFF | 15,9:1 | 4,5:1 | ✅ |
| Texte secondaire, légendes | #4E5A6C | #FFFFFF | 7,0:1 | 4,5:1 | ✅ |
| Texte secondaire sur le stuc | #4E5A6C | #DDE4E2 | 5,4:1 | 4,5:1 | ✅ |
| Blanc sur le ciel (titres, liens, texte) | #FFFFFF | #254EA8 → #4268B7 | 5,4:1 à 7,4:1 | 4,5:1 | ✅ |
| Texte du ciel en blanc à 86 % | rgba(255,255,255,.86) | ciel | 5,2:1 mesuré | 4,5:1 | ✅ |
| Liste barrée, ordinateur (lignes de 27 à 56 px) | blanc à 66 % | ciel | 4,1:1 mesuré | 3:1 (grand texte) | ✅ |
| Liste barrée, téléphone (dès 18 px) | blanc à 80 % | ciel | 4,8:1 | 4,5:1 | ✅ |
| Mots des avis pas encore lus (24 à 42 px) | #7D8696 | #FFFFFF | 3,7:1 | 3:1 (grand texte) | ✅ |
| Liens bleus (licence, références) | #2E5AB2 | #FFFFFF | 6,5:1 | 4,5:1 | ✅ |
| Erreurs du formulaire | #9B1C2C | #FFFFFF | 8,1:1 | 4,5:1 | ✅ |
| Pied de page, texte atténué | blanc à 64-74 % | #18213A | 7,3:1 à 9,2:1 | 4,5:1 | ✅ |
| Contour du bouton Menu | blanc à 55 % | #2E5AB2 | 3,15:1 | 3:1 | ✅ |
| Champs blancs sur le ciel | #FFFFFF | #4268B7 (côté clair) | 5,4:1 | 3:1 | ✅ |
| Focus (blanc sur le ciel, encre sur le blanc) | — | — | 6,5:1 à 15,9:1 | 3:1 | ✅ |

Le trait blanc qui barre les lignes de la liste les traverse exprès : il fait partie du texte, pas du fond. Les
filets entre les engagements et sous les lignes de la liste des travaux sont décoratifs (1.4.11 ne s'applique pas).

### Clavier
| Élément | Ordre | Entrée / Espace | Échap | Flèches |
|---------|-------|-----------------|-------|---------|
| Lien d'évitement | 1er | va au contenu | — | — |
| Menu du téléphone | dans l'en-tête | ouvre, le focus va au premier lien | ferme et rend le focus au bouton | — |
| Photos des deux maisons | un arrêt par photo | ouvre la visionneuse, le focus sur « fermer » | — | — |
| Visionneuse | les trois boutons ; le reste de la page est inerte | — | ferme et rend le focus à la photo affichée | gauche et droite changent de photo |
| Formulaire | un arrêt par champ, puis le bouton | envoie à l'application d'e-mail | — | — |

Le focus n'est jamais caché sous l'en-tête collant (`scroll-padding-top`), ni sur ordinateur ni au téléphone.

### Lecteur d'écran
| Élément | Annoncé comme | Remarque |
|---------|---------------|----------|
| La liste de l'accueil | une liste de cinq éléments, puis « Consider it done. » | Le trait est visuel ; le texte est lu tel quel. Le titre de la page (H1) suit, en texte. |
| Emblème | ignoré (`aria-hidden`) | Le lien du logo porte le nom. |
| Photos des maisons | « bouton », avec la description de la photo | `aria-haspopup="dialog"` ; la légende visible suit. |
| Visionneuse | « Photo viewer », dialogue modal | La description, la légende et « 3 of 15 » changent avec la photo. |
| Avis | la citation entière, d'un trait | Les mots sont dans des éléments séparés pour leur couleur, sans rien changer à la lecture. |
| Demande prête | région qui prend le focus ; « Copied… » annoncé (`role="status"`) | — |

### Mouvement
- Avec « réduire les animations » : pas de défilement amorti, la liste déjà barrée et la phrase là d'emblée, les cadres
  ouverts, les avis entiers à l'encre, la visionneuse s'ouvre sans grandir (vérifié par les essais).
- Sans JavaScript : la liste est barrée et la phrase visible.
- Rien ne clignote, rien ne bouge seul plus de quelques secondes (2.2.2) : l'ouverture dure 2,9 s, une fois.

### Priorités
1. **Avant la mise en ligne** : un passage avec VoiceOver (iPhone) et NVDA (Windows) sur la visionneuse et le
   formulaire.
2. **Les cibles** : les liens isolés du pied de page font 32 px, au-dessus du minimum de 24 px (2.5.8, AA), sous les
   44 px recommandés (2.5.5, AAA).
