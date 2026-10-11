# Revue de design : nouveau site Petri Pools

Revue faite avec la grille de l'extension `design-critique`, sur les captures du site à l'ordinateur (1440 × 900) et au téléphone (390 × 844). Les corrections retenues sont faites ; elles sont cochées en fin de fichier.

## Impression d'ensemble

En deux secondes, on lit la grande question « Is your pool stuck in the ’80s? », puis l'œil descend sur la frise, qui se fait recarreler sous ses yeux. On comprend tout de suite qu'il s'agit de rénover des piscines, et que l'entreprise connaît le carrelage.

La plus grande marge de progrès : aucune photo de piscine n'apparaît au premier écran. La première photo, l'avant/après, arrive juste en dessous.

## Utilisation

| Constat | Gravité | Correction |
| --- | --- | --- |
| Les étiquettes des villes sur la carte font 22 px de haut : sous le minimum de 24 px pour une cible à la souris (WCAG 2.2, critère 2.5.8). | 🟡 Moyen | Des étiquettes de 28 px. |
| Dans le local technique, rien n'indique au premier regard que les étiquettes sont cliquables, à part la phrase d'introduction. | 🟡 Moyen | Un léger halo sur les étiquettes, une fois, quand la photo arrive à l'écran. |
| La liste « Tile, coping, finish, deck » laisse de longs vides à droite sur ordinateur : chaque élément occupe 38 % de la hauteur de l'écran. | 🟢 Mineur | Ramené à 30 %. |
| Sur téléphone, la carte trop petite rendait les étiquettes illisibles. | 🟡 Moyen | Fait : une rangée de boutons par ville sous la carte, et seule la ville choisie reste étiquetée sur la carte. |
| Le panneau des avis affichait d'un coup tous les avis d'une ville (8 pour Dallas). | 🟡 Moyen | Fait : 2 avis, puis « Show N more from… ». |

## Hiérarchie visuelle

- **Ce qui attire l'œil en premier** : le titre, puis la frise en mouvement. C'est le bon ordre.
- **Le parcours de lecture** :
  - le titre, puis l'accroche et le bouton dans l'eau ;
  - puis, plus bas, « Same spa. New tile. » avec l'avant/après ;
  - chaque partie s'ouvre par un grand titre, qui reste le point d'entrée.
- **L'accent** :
  - Les citations des clients sont mises au même niveau que les titres : voulu, ce sont eux qui parlent.
  - Le relevé des plateformes ressemble à des chiffres-clés. C'est pourtant un vrai tableau de notes, présenté comme tel.

## Cohérence

| Élément | Constat | Correction |
| --- | --- | --- |
| Boutons | Arrondis partout. Le bouton encre devient blanc sur les fonds sombres. | Aucune |
| Arrondis | Photos 6 px, formulaire 10 px, boutons et étiquettes en pilule : trois niveaux, toujours les mêmes. | Aucune |
| Typographie | Archivo étendue pour les titres et les noms des changements, normale pour le texte et les citations. | Aucune |
| Couleurs | Le jaune soleil sert à la marque, au bouton d'envoi, à l'élément choisi (carte, local technique) et à la barre du téléphone. | Aucune |

## Accessibilité

- **Contrastes** :
  - blanc sur bleu « grand bain » : 12:1 ;
  - gris du texte secondaire sur fond clair : 6,6:1 ;
  - bleu pâle des signatures sur bleu sombre : 8:1 ;
  - les éléments estompés de la liste des changements restent au-dessus de 4,5:1.
- **Cibles tactiles** : boutons du local technique 40 px, boutons des villes 40 px, barre du téléphone 48 px. La carte à la souris passe à 28 px.
- **Lecture** : texte de 18 px (17 au téléphone), interligne 1,55, lignes de moins de 70 signes.
- **Textes alternatifs** : chaque photo est décrite. La frise et la mosaïque du pied de page sont décoratives et masquées aux lecteurs d'écran.
- **Au clavier** :
  - la ligne d'eau de l'avant/après est un curseur réglable aux flèches ;
  - le menu garde le focus et se ferme avec Échap ;
  - le formulaire annonce ses erreurs champ par champ.

## Ce qui marche

- La frise recarrelée : un seul geste, propre au métier, qu'on ne verra pas chez un autre piscinier.
- Leurs vraies photos et les vrais mots de leurs clients portent toute la page, jusqu'au déroulé d'un chantier.
- La carte avec les vrais lacs (Lewisville Lake, Grapevine Lake) : un habitant du nord de Dallas s'y repère tout de suite.
- Le pied de page en mosaïque répond à l'accueil : on part de la ligne d'eau, on finit au fond du bassin.

## Corrections

1. ☑ Étiquettes de la carte à 28 px.
2. ☑ Halo sur les étiquettes du local technique, une fois, à l'arrivée de la photo.
3. ☑ La liste des changements resserrée.
4. ☑ Un reflet de lumière passe une fois sur le verre neuf de la frise, quand le recarrelage se termine. Il ne se joue pas avec le réglage « moins d'animations ».
5. ☑ Carte au téléphone et panneau des avis (corrigés avant la revue).

## Textes d'interface

Relus avec la grille de l'extension `ux-copy` : le verbe d'abord, le même mot pour la même chose, et un bouton qui fait exactement ce qu'il dit.

| Élément | Avant | Après | Pourquoi |
| --- | --- | --- | --- |
| Bouton du formulaire | Send my request | **Email my request** | Le site n'envoie rien lui-même : il ouvre la messagerie du visiteur avec le message prêt. Le bouton le dit. |
| Note sous le bouton | Sending opens your email app… | **Your email app opens with the message ready, addressed to petripools@gmail.com.** | Même mot, même promesse que le bouton. |
| Résumé des erreurs | N fields need a fix before sending. | **N fields need a fix before your email can be written.** | Cohérent avec « Email my request ». |
| Liste des avis ouverte | Read all 43 reviews (inchangé) | **Hide the reviews** | Le bouton dit ce qu'il fera au prochain clic. |

Gardés tels quels, parce qu'ils disent déjà ce qui se passe :
- « Get a free estimate », le mot de leur site (« FREE estimate »), partout où il apparaît ;
- « Call about a repair » ;
- « Drag the water line to see this spa before and after its remodel » ;
- « Choose a part to see what we do with it » ;
- les erreurs champ par champ (« Enter a phone number we can call. ») ;
- les statuts « Open now, until 5 PM Central Time » et « Closed now, opens Monday at 9 AM Central Time ».

