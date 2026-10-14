# Mendieta Roofing : direction artistique

## L'idée : couche par couche

Un toit tient parce qu'il est fait de couches posées dans l'ordre : le voligeage en bois, la sous-couche, puis les tuiles, rang par rang, du bas vers le haut. Leurs propres photos le montrent : trois maisons photographiées pendant le chantier puis terminées, des équipes sur le bois nu, une sous-couche grise, des tuiles montées en piles.

Le site raconte donc un toit qui se construit. Le moment fort est une coupe de toiture dessinée au trait qui se monte, couche par couche, à mesure qu'on fait défiler la page, à côté de la vraie photo de chaque étape. Tout le reste reste calme : beaucoup de blanc, le bleu du blason, les vraies photos, et une seule couleur vive réservée aux actions.

Le public : des propriétaires de Palm Beach et de Broward, souvent pressés (une fuite), souvent méfiants (un toit coûte cher). Ce qu'ils doivent voir tout de suite : qui sont ces gens, s'ils sont en règle, à quoi ressemble leur travail, comment les joindre.

## Couleurs

| Nom | Valeur | Rôle |
| --- | --- | --- |
| Encre | `#0B1B4D` | Le bleu outremer très sombre du blason (`#031349` mesuré sur le logo, à peine éclairci pour l'écran). Texte, titres, traits du dessin, fond des parties sombres |
| Encre 2 | `#3D4B6E` | Textes secondaires (8,6:1 sur blanc) |
| Ciel | `#EAF1FA` | Fond des parties claires, l'océan de la carte ; pris dans le ciel de leurs photos |
| Trait | `#D3DCEA` | Filets, contours |
| Blanc | `#FFFFFF` | Fond principal : la lumière de Floride, les tuiles blanches |
| Soleil | `#FFC93C` | Uniquement ce qui agit ou ce qui est actif : le bouton de devis, la couche en cours sur le dessin, la ville trouvée sur la carte, les étoiles. Jamais en texte sur blanc |

Le jaune vient de leur propre histoire (les pastilles jaunes et bleues de leur menu de 2023), mais il est rationné : c'est un signal, pas une décoration.

## Typographie

**Encode Sans** (Impallari Type, licence OFL), une seule police variable, chasse de 75 à 125 % et graisse de 100 à 900 :
- **titres en chasse élargie** (125 %, graisse 780, interlettrage serré) : des lettres basses et larges, comme les maisons de plain-pied et leurs longs toits qu'on voit sur toutes leurs photos ;
- **texte en chasse normale** (100 %, graisse 400, 18 px, interligne 1,55), un dessin humaniste très lisible pour des lecteurs de tout âge ;
- **chiffres et petites informations** (licence, téléphones) en chasse 112 %, graisse 600.

Bas de casse partout, pas de capitales espacées, pas de police à chasse fixe. Aucune police déjà utilisée sur les sites précédents.

## Mise en page

Grille de 12 colonnes, 1360 px au plus, marges de 16 à 56 px. Texte aligné à gauche. Photos à angles vifs, jamais affichées plus grandes que leur taille réelle (800 px pour les photos de chantier).

```
ACCUEIL
[blason] Mendieta Roofing Corp.            Our work  Roofs  Reviews  Area   (561) 797-5457  [Free estimate]
Family roofers                                               ┌ Florida license ──────────┐
in West Palm Beach                                           │ CCC1328504                │
since 1988.                                                  │ Certified Roofing Contr.  │
Tile, shingle and flat roofs…  [Get a free estimate] [Call]  │ Active through 2028  →    │
[══════════════ la photo de 2024, pleine largeur, découverte de bas en haut ═══════════════]

COUCHE PAR COUCHE (épinglée, 4 écrans de défilement)
A new tile roof, layer by layer.
┌──── coupe de toiture au trait (60 %) ────┐   ┌── photo de l'étape ──┐
│ chevron, voligeage, sous-couche, tuiles  │   │  16 → 31 → 35 → 19+28 │
└──────────────────────────────────────────┘   └──────────────────────┘
1 Off to the deck   2 Underlayment   3 Tile, from the eave up   4 Done

LES TOITS : une liste de types (avec leur profil) qui filtre la grille de photos
[Shingle] [Tile] [Flat]        ▢ ▢ ▢ ▢
profil ~~~~~~                  ▢ ▢ ▢ ▢

AVIS (fond encre)              LICENCE ET FAMILLE          SECTEUR : carte réelle + « Check your city »
« Mario was a pleasure… »      CCC1328504 en grand          liste par comté | bande côtière

DEVIS : appeler le bureau, écrire au portable, ou un formulaire court qui rédige le SMS
```

## Principes

1. **Une seule audace** : la coupe qui se monte couche par couche. Les autres parties sont sobres.
2. **Rien d'inventé** : chaque étape du chantier est une vraie photo de leurs chantiers ; chaque fait vient de leur site ou du registre de l'État.
3. **Le mouvement répond au geste** : en dehors de l'ouverture (1,9 s, une fois), tout bouge parce qu'on fait défiler, qu'on choisit un type de toit, qu'on cherche une ville ou qu'on ouvre une photo.
4. **La confiance d'abord** : licence vérifiable dès l'accueil, téléphones partout, avis avec prénom et ville.
5. **Petites photos, bien traitées** : grilles nettes à la taille réelle, une visionneuse, légendes factuelles ; numéros de maison et plaques floutés.

## Relecture du plan face à la demande

Ce qui sortait par défaut et ce que j'ai changé :
- **« Bleu marine et jaune »** est la palette réflexe de n'importe quel artisan. J'ai gardé le bleu parce que c'est exactement celui de leur blason, mais le jaune n'apparaît que sur ce qui agit ou ce qui est actif ; la page est blanche et bleue.
- **Une rangée de chiffres sous le titre** (« 38 ans, 16 avis, 25 villes ») : remplacée par la licence vérifiée, présentée comme une pièce officielle, avec le lien vers le site de l'État.
- **Des cartes de services avec icônes** : remplacées par une liste de types de toit dessinés en profil, qui filtre leurs vraies photos.
- **Une galerie séparée** : fusionnée avec les types de toit ; on ne montre pas 50 photos dont des doublons, mais une sélection de vraies maisons différentes.
- **Les dessins** : uniquement des coupes techniques au trait, aux proportions d'un vrai toit de tuiles (chevron, voligeage, sous-couche, tuiles avec recouvrement), et une carte faite avec les contours officiels du Recensement. Pas d'illustration, pas de pictogrammes, pas de maison dessinée.
- **Ne pas répéter les sites précédents** : pas de ligne qui se tend (Ehlers), pas d'enseigne (Castor), pas de jour/nuit (Prestige), pas de cadre de logo (Hideout), pas de mosaïque (Petri).

## Extensions explorées

- **21st.dev** (recherche et inspiration) : comparateurs avant/après, cartes empilées au défilement, une section « Services Stack », une carte du monde. Tous en React avec Motion, dans le style « cartes arrondies » des sites de logiciels ; aucun n'est pensé pour un toit. Les photos de leurs chantiers ne sont de toute façon pas cadrées à l'identique, donc un comparateur à glissière tromperait l'œil.
- **Facade UI** : des sections marketing génériques (héros, grilles de fonctionnalités, tarifs) pour React et Tailwind. Rien à prendre ici.
- **shadcn** : des composants d'interface React, hors de notre méthode.

Tout est donc fait sur mesure en HTML, CSS et JavaScript, avec Lenis pour le défilement : la coupe qui se monte, les profils des toits, la carte et sa recherche, la visionneuse, le formulaire qui rédige le SMS.

## Ce qui a changé en construisant

- **Les types de toit et le filtre** sont séparés : trois petites coupes (tuile, bardeau, toit plat) disent ce qu'ils font, puis des onglets (All, Tile, Shingle, On the job) trient les photos. Les toits plats n'ont pas de photo : un filtre « Flat » aurait été vide.
- **Les photos sont posées comme des rangs de tuiles** : quatre, puis trois décalées d'une demi-photo, chacune à cheval sur le joint du rang du dessous ; au téléphone, deux par deux, et la dernière seule se pose au milieu. La grille uniforme de départ laissait une photo seule au dernier rang et ne disait rien du métier (voir `REVUE.md`).
- **La licence** est une ligne sous les boutons de l'accueil, avec un lien vers sa propre partie, où elle est présentée en grand comme une pièce officielle.
- **L'ouverture** dure 1,9 s : le titre monte ligne par ligne, la photo se découvre du bas vers le haut, puis le texte et la légende.

