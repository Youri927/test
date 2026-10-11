# Audit d'accessibilité : nouveau site Petri Pools

**Norme :** WCAG 2.1 AA, plus le critère 2.5.8 des WCAG 2.2 (taille des cibles). **Date :** 11 octobre 2026.

Fait avec la grille de l'extension `accessibility-review`, sur `dist-web` servi en local. Méthode :
- un scan automatique avec Lighthouse (outils de Chrome), sur téléphone et sur ordinateur ;
- la navigation au clavier seul, 95 tabulations ;
- la lecture des noms accessibles de chaque élément interactif ;
- le calcul des contrastes ;
- les largeurs de 320 à 1920 px, dont 640 et 720 px pour un zoom à 200 %.

## Résumé

**Problèmes trouvés :** 5. **Bloquant :** 0. **Importants :** 2. **Mineurs :** 3. Les 5 sont corrigés.

Lighthouse après corrections : accessibilité 100 sur téléphone et sur ordinateur. Le site actuel est à 73 sur téléphone et 79 sur ordinateur.

## Constats

### Perceptible

| # | Problème | Critère | Gravité | Correction |
| --- | --- | --- | --- | --- |
| 1 | Le statut « Open now » en vert sur le bleu du devis : contraste de 4,4:1. | 1.4.3 Contraste | 🟡 Important | Un vert plus sombre : 6,0:1. |
| 2 | Les changements estompés de la liste de rénovation (texte à 50 % sur bleu sombre) : 4,5:1, à la limite. | 1.4.3 Contraste | 🟢 Mineur | Passés à 56 % : 5,2:1. |

### Utilisable

| # | Problème | Critère | Gravité | Correction |
| --- | --- | --- | --- | --- |
| 3 | Les étiquettes des villes sur la carte faisaient 22 px de haut. | 2.5.8 Taille des cibles (WCAG 2.2) | 🟢 Mineur | 28 px. Au téléphone, une rangée de boutons de 40 px les remplace. |
| 4 | Le contour de focus des champs du formulaire était trop pâle (anneau à 14 % d'opacité). | 2.4.7 Focus visible | 🟢 Mineur | Bordure foncée et anneau à 38 %. |

### Compréhensible

Rien à signaler.
- Chaque champ a une étiquette visible.
- Les erreurs disent quoi corriger : « Enter a phone number we can call. », et le résumé indique combien de champs sont en cause.
- Le premier champ en erreur reçoit le focus.

### Robuste

| # | Problème | Critère | Gravité | Correction |
| --- | --- | --- | --- | --- |
| 5 | Les boutons de la carte avaient un nom (« Carrollton: 5 reviews ») différent du texte affiché (« Carrollton 5 »). | 2.5.3 Étiquette dans le nom | 🟡 Important | Le nom reprend le texte affiché, complété d'un mot invisible à l'écran : « Carrollton 5 reviews ». |

## Contrastes

| Élément | Texte | Fond | Rapport | Exigé | Conforme |
| --- | --- | --- | --- | --- | --- |
| Texte | #11232d | #f4f5f3 | 14,7:1 | 4,5:1 | ✅ |
| Texte secondaire | #4c5d66 | #f4f5f3 | 6,3:1 | 4,5:1 | ✅ |
| Blanc sur bleu sombre | #ffffff | #0f3446 | 13,1:1 | 4,5:1 | ✅ |
| Texte courant sur bleu sombre | 84 % de blanc | #0f3446 | 9,7:1 | 4,5:1 | ✅ |
| Signatures des clients | #9fdcef | #0f3446 | 8,7:1 | 4,5:1 | ✅ |
| Texte sur le turquoise du devis | #11232d | #9fdcef | 10,7:1 | 4,5:1 | ✅ |
| Bouton encre | #ffffff | #11232d | 16,1:1 | 4,5:1 | ✅ |
| Bouton soleil | #11232d | #ffc431 | 10,1:1 | 4,5:1 | ✅ |
| Message d'erreur | #b3261e | #f4f5f3 | 6,0:1 | 4,5:1 | ✅ |
| Villes de la carte | #4c5d66 | #e8eded | 5,8:1 | 4,5:1 | ✅ |
| « Open now » sur bleu sombre | #7fe3b0 | #0f3446 | 8,4:1 | 4,5:1 | ✅ |
| « Open now » sur le turquoise du devis | #095430 | #9fdcef | 6,0:1 | 4,5:1 | ✅ (corrigé) |
| Pied de page | 80 % de blanc | #0a2530 | 10,5:1 | 4,5:1 | ✅ |
| Mentions du pied de page | 60 % de blanc | #0a2530 | 6,5:1 | 4,5:1 | ✅ |

## Navigation au clavier

| Élément | Ordre | Entrée / Espace | Échap | Flèches |
| --- | --- | --- | --- | --- |
| Lien d'évitement | 1ᵉʳ | va au contenu | — | — |
| Menu (téléphone) | bouton de l'en-tête | ouvre ; le focus va sur « Close » et reste dans le menu | ferme et rend le focus au bouton | — |
| Ligne d'eau de l'avant/après | après l'accueil | — | — | haut et bas par 5 %, Maj par 20 %, Début, Fin, Page préc./suiv. |
| Appareils du local technique | dans l'ordre de lecture de la photo | choisit ; un deuxième appui revient à la vue d'ensemble | — | — |
| Villes de la carte | après le local technique | affiche les avis de la ville | — | — |
| « Show N more from… » | après les villes | affiche le reste et place le focus sur le 3ᵉ avis | — | — |
| « Read all 43 reviews » | ensuite | déplie la liste (élément natif) | — | — |
| Formulaire | ensuite | « Send my request » vérifie puis ouvre la messagerie | — | choix du besoin |

Le contour de focus est visible partout : 3 px encre sur fond clair, jaune soleil sur fond sombre.

## Lecteurs d'écran

| Élément | Annoncé comme | Remarque |
| --- | --- | --- |
| Ligne d'eau | « Water line: drag up to show the remodeled spa », curseur, valeur « Half after » | La valeur parlée suit la position : « Mostly after », « All after »… |
| Appareils | « Heater », bouton, non enfoncé | Le détail de l'appareil choisi est annoncé : zone `aria-live`. |
| Villes | « Dallas 8 reviews », bouton, enfoncé ou non | Lewisville : « … Our showroom ». |
| Frise et mosaïque du pied de page | ignorées | Elles sont décoratives (`aria-hidden`). |
| Avant/après | les deux photos décrites (« Before: a raised spa clad in beige ceramic tile… ») | — |
| Ouvert ou fermé | texte complet : « Closed now, opens Monday at 9 AM Central Time. » | Il ne repose pas sur la couleur. |

## Réglage « moins d'animations »

- La frise s'affiche directement en mosaïque.
- Pas de vague, de reflet, de halo ni de remplissage automatique de l'avant/après.
- Le défilement reste celui du navigateur.

## À faire avec de vrais utilisateurs

Ces tests automatiques et au clavier couvrent l'essentiel, mais un passage avec VoiceOver (iPhone) et NVDA (Windows) reste conseillé avant la mise en ligne, surtout pour la ligne d'eau et la carte.
