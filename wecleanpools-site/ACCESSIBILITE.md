# Audit d'accessibilité : nouveau site D's Pool Care (We Clean Pools)

**Norme :** WCAG 2.1 AA, plus le critère 2.5.8 des WCAG 2.2 (taille des cibles). **Date :** 11 octobre 2026.

Fait avec la grille de l'extension `accessibility-review`, sur `dist-web` servi en local. Méthode :
- un scan automatique avec Lighthouse, au téléphone (3 passages) et à l'ordinateur ;
- la navigation au clavier seul : 80 tabulations, avec relevé du nom, de l'état et du contour de chaque élément ;
- le calcul des contrastes, couleur par couleur, y compris sur l'eau verte et l'eau du devis ;
- les largeurs de 320 à 1920 px, dont 600 et 768 px pour un zoom à 200 % ;
- les réglages « moins d'animations » et « JavaScript désactivé ».

## Résumé

**Problèmes trouvés :** 6. **Bloquant :** 0. **Important :** 1. **Mineurs :** 5. Les 6 sont corrigés.

**Lighthouse après corrections :** accessibilité 100, au téléphone comme à l'ordinateur. Le site actuel est à 93.

## Constats

### Perceptible

| # | Problème | Critère | Gravité | Correction |
| --- | --- | --- | --- | --- |
| 1 | L'indication « Scroll to clear the water », en blanc à 86 %, descendait à 3,6:1 sur la partie la plus claire de l'eau verte. | 1.4.3 Contraste | 🟢 Mineur | Blanc plein et une légère ombre. Placée en bas à gauche, où l'eau est la plus sombre, elle dépasse 12:1. |
| 2 | Sans JavaScript, la liste des prix restait fermée et les coches vides : contenu invisible. | 1.3.1 Information et relations | 🟡 Important | Sans JavaScript, tout est ouvert et coché. |

### Utilisable

| # | Problème | Critère | Gravité | Correction |
| --- | --- | --- | --- | --- |
| 3 | Le lien « Look it up » (la licence) faisait 20 px de haut. | 2.5.8 Taille des cibles (WCAG 2.2) | 🟢 Mineur | 26 px. |
| 4 | L'anneau de focus des champs du formulaire était pâle (18 %). | 2.4.7 Focus visible | 🟢 Mineur | Bordure bleue (3,7:1) et anneau à 30 %. |
| 5 | Après un lien du menu, la section arrivait 76 px plus bas que prévu, le titre loin du haut de l'écran. | 2.4.3 Ordre du focus | 🟢 Mineur | La section arrive sous l'en-tête et reçoit le focus. |

### Compréhensible

| # | Problème | Critère | Gravité | Correction |
| --- | --- | --- | --- | --- |
| 6 | Au doigt, un défilement sur la photo des rénovations montrait l'avant par surprise. | 3.2.1 Au focus (comportement prévisible) | 🟢 Mineur | L'avant n'apparaît qu'après un appui de 140 ms. |

Pour le reste, rien à signaler :
- chaque champ a une étiquette visible ;
- les erreurs disent quoi corriger, champ par champ, et le premier champ en erreur reçoit le focus ;
- la note sous le bouton dit ce qui va se passer (la messagerie s'ouvre).

### Robuste

Rien à signaler :
- les boutons de la liste des prix portent `aria-expanded` et `aria-controls` ;
- les vignettes des rénovations et le bouton « Hold to see the before » portent `aria-pressed` ;
- le compteur « Remodel 5 of 9 » est annoncé (`aria-live`) ;
- le menu est une boîte de dialogue modale, qui garde le focus.

## Contrastes

| Élément | Texte | Fond | Rapport | Exigé | Conforme |
| --- | --- | --- | --- | --- | --- |
| Texte courant | #0D2235 | enduit #F1F5F4 | 14,7:1 | 4,5:1 | ✅ |
| Texte secondaire | #3D5163 | enduit | 7,5:1 | 4,5:1 | ✅ |
| Texte secondaire, liste des prix | #3D5163 | blanc | 8,2:1 | 4,5:1 | ✅ |
| Liens et prix bleus | #0B6E93 | enduit / blanc | 5,2 / 5,7:1 | 4,5:1 | ✅ |
| Lien « Ask about Pool School » | #0B6E93 | bleu pâle #DCEFEE | 4,8:1 | 4,5:1 | ✅ |
| Boutons | blanc | #0D2235 (survol #0B6E93) | 16,2 (5,7):1 | 4,5:1 | ✅ |
| « D's » du logo, gras 21 px | #D2282D | enduit | 4,7:1 | 3:1 | ✅ |
| La question sur l'eau verte (grand texte) | blanc | eau verte, au plus clair | 4,3:1 | 3:1 | ✅ |
| Texte de la partie Dallas | #E8F2F4 (78 %) | #08324A | 11,8 (7,8):1 | 4,5:1 | ✅ |
| Liens de la partie Dallas | #93E0E8 | #08324A | 9,0:1 | 4,5:1 | ✅ |
| Texte du devis, sur l'eau | #0D2235 | #2096BD (le plus sombre) | 4,8:1 | 4,5:1 | ✅ |
| « Open now » | #0B5A3A | eau #6FD3E2 | 4,8:1 | 4,5:1 | ✅ |
| Erreurs du formulaire | #A11D16 | blanc | 7,8:1 | 4,5:1 | ✅ |
| Pied de page, mentions | #D9E4E7 (80 / 66 %) | #0D2235 | 8,4 / 6,2:1 | 4,5:1 | ✅ |
| Étiquettes « Before » / « After » | blanc | pastille #0D2235 à 78 % | 8,0:1 | 4,5:1 | ✅ |
| Coches, trait de la tournée (graphique) | #1190BC | enduit | 3,3:1 | 3:1 | ✅ |

## Clavier

| Élément | Tabulation | Entrée / Espace | Échap | Remarque |
| --- | --- | --- | --- | --- |
| Lien d'évitement « Skip to content » | 1er | va au contenu | — | visible au focus |
| Navigation, téléphone, « Free estimate » | dans l'ordre | suit le lien (défilement doux) | — | la section reçoit le focus |
| Lignes de la liste des prix | une par ligne | ouvre ou ferme | — | `aria-expanded` |
| « Hold to see the before » | après la liste | **montre l'avant tant qu'on appuie** | — | relâcher remet l'après |
| Vignettes des rénovations (9) | une par vignette | affiche le chantier | — | `aria-pressed`, compteur annoncé |
| Formulaire | besoins, puis champs | coche, saisit, envoie | — | erreurs reliées par `aria-describedby` |
| Menu du téléphone | garde le focus | — | ferme | le focus revient au bouton « Menu » |

## Lecteurs d'écran

| Élément | Annoncé | Remarque |
| --- | --- | --- |
| L'ouverture | titre de niveau 1 « We clean pools. », puis la question et l'accroche | l'eau, la lumière et la copie floue des lettres sont masquées (`aria-hidden`) |
| Photos | chaque photo est décrite (« Before: a pool with dark, murky water… ») | les vignettes sont décoratives : leur bouton porte « Remodel 3 » |
| Visionneuse | les deux photos du chantier choisi, avant et après, avec leur description | l'étiquette visuelle « After / Before » est masquée, elle doublerait l'information |
| Prix | « Drain, clean and acid wash, from $595, bouton, réduit » | le contenu ouvert suit directement |

## Mouvement

- Avec « moins d'animations » :
  - l'ouverture s'affiche directement limpide, sans épinglage ;
  - la lumière ne bouge plus ;
  - les coches sont déjà tracées ;
  - les photos ne glissent pas ;
  - le défilement reste celui du navigateur.
- Sans ce réglage, la lumière au fond de l'eau glisse lentement (une boucle de 41 à 80 secondes). Elle s'arrête hors de l'écran, et sous l'eau trouble.

## Priorités (toutes faites)

1. **Le contenu sans JavaScript.** Les prix et les coches sont visibles pour tous, y compris les robots qui n'exécutent pas le script.
2. **Le contraste de l'indication de défilement.**
3. **Les petites cibles et le focus des champs.**
