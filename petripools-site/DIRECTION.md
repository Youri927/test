# Petri Pools : direction artistique

## Le sujet

Petri Pools rénove des piscines existantes et répare leurs équipements dans le nord de Dallas–Fort Worth, depuis juin 2000.

- **Le public** : des propriétaires dont la piscine a vingt ou trente ans, et qui veulent qu'elle redevienne belle ; ou dont la pompe vient de lâcher.
- **Le travail du site** : obtenir une demande de devis gratuit (formulaire ou appel), et rassurer en montrant le vrai travail et les vrais clients.

## L'idée : la coupe d'une piscine

Le site est construit comme la coupe d'un bord de piscine.

- **En haut**, la plage : le fond clair et la grande question « Is your pool stuck in the '80s? ».
- **En travers de l'accueil**, la frise de ligne d'eau. C'est le premier geste de toute rénovation, et le plus visible.
  - À l'ouverture, elle est en carreaux de céramique beige de 15 cm, comme leur spa « avant ».
  - Puis elle est recarrelée sous les yeux du visiteur, carreau par carreau, en mosaïque de verre grise et bleutée, celle de leurs spas « après ».
  - La moitié basse de la frise est sous l'eau, et la ligne d'eau ondule.
- **En dessous**, on est dans l'eau : les parties sombres alternent avec les parties claires.
- **Tout en bas**, le fond de la piscine : le pied de page porte « PETRI » en mosaïque, comme les incrustations au fond des bassins.

Pas d'icône ni d'illustration. Les seuls éléments graphiques sont des matériaux de piscine : le carrelage, la margelle, la ligne d'eau, le fond du bassin.

## Couleurs

| Nom | Valeur | Rôle |
| --- | --- | --- |
| Enduit | `#f4f5f3` | le fond clair (un blanc d'enduit minéral, pas une crème) |
| Galet | `#11232d` | le texte, la couleur d'une eau sur finition foncée |
| Grand bain | `#0f3446` | les parties sombres |
| Petit bain | `#5cc0e3` | la couleur de l'eau de leur spa « après » : aplats et accents sur fond sombre |
| Verre | `#2f3a42` à `#e3eaee` | la mosaïque, relevée sur leurs spas (gris, bleu-gris, reflets turquoise) |
| Soleil | `#ffc431` | le soleil de leur logo, pour la marque seulement |

Le beige des vieux carreaux (`#dacbb2`) n'apparaît que pendant le recarrelage.

## Typographie

**Archivo**, une seule famille à largeur et graisse variables (licence OFL). C'est une grotesque héritée des « gothic » américaines du XIXᵉ siècle, celles des enseignes et des marquages de profondeur.

- **Titres** : largeur étendue (125 %), graisse 800, interlettrage serré. Une typo horizontale, comme une ligne d'eau.
- **Texte** : largeur normale, graisse 400, 18 px pour 1,55 d'interligne, lignes de moins de 70 signes.
- **Citations des clients** : largeur normale, graisse légère, en grand. C'est la voix des gens.
- **Pas de capitales d'étiquette**, pas de surtitres, pas de flèches dans les boutons.

## Mise en page

Grille de 12 colonnes, contenu aligné à gauche, asymétrique.

- **Les photos** sont cadrées comme des tirages, jamais affichées au-delà de leur définition. Les grands aplats viennent de la mosaïque (dessinée, donc nette à toutes les tailles) et des couleurs.
- **Le rythme des fonds** : clair (accueil) → sombre (rénovation) → clair (réparation) → sombre (déroulé) → clair (avis) → sombre (devis) → fond du bassin (pied de page).

```
ACCUEIL (ordinateur)
┌──────────────────────────────────────────────────────────────┐
│ ● Petri Pools     Remodeling  Repair  Reviews   (972)…  [Get a free estimate] │
│                                                              │
│ Is your pool stuck                                           │
│ in the '80s?                                                 │
│══════════════════════════════════════════════ margelle       │
│▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ frise (sèche)    │
│~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ ligne d'eau    │
│▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ frise (mouillée) │
│ (eau)  New tile, coping, finish and deck…  [Get a free estimate] │
└──────────────────────────────────────────────────────────────┘

RÉNOVATION (sombre)
│ Same spa, new tile.            ┌──────────────┐               │
│ texte court                    │ avant/après  │ ← on « remplit » │
│                                │ ≈≈ poignée ≈≈ │   l'image après │
│ Tile · Coping · Finish · Deck : une liste, une photo qui suit  │

RÉPARATION (clair)
│ ┌────────────────────────────┐  Heater, Filter, Pumps,        │
│ │ leur local technique, avec │  Automation, Electrical :      │
│ │ les appareils annotés      │  le détail de l'appareil choisi │
│ └────────────────────────────┘  « We don't do leak detection. » │

DÉROULÉ (sombre) : 1 → 7, chaque étape racontée par un client, avec son nom et sa ville
AVIS (clair) : l'histoire du condensateur en grand ; les villes du nord de DFW placées comme sur une carte ; les plateformes
DEVIS (sombre) : formulaire, téléphone, showroom, horaires avec « ouvert maintenant »
FOND DU BASSIN : « PETRI » en mosaïque, liens, mentions
```

## Principes

1. **Des matériaux, pas de la décoration.** Chaque élément graphique est un matériau de piscine.
2. **Les clients parlent.** Les avis structurent la page : le déroulé d'un chantier, l'histoire du condensateur, la carte des villes. Pas de carrousel.
3. **Le vrai travail.** Leurs photos, nettes et cadrées. Leur local technique expliqué sur leur propre photo.
4. **Un seul moment orchestré** : le recarrelage à l'ouverture. Ailleurs, le mouvement explique quelque chose ou répond au visiteur : remplir l'avant/après, choisir un appareil, avancer dans le déroulé.
5. **Des mots simples et exacts** : de vrais chiffres, ce qu'ils ne font pas, aucune promesse inventée.

## Revue contre le brief

- **Ce que donnerait un site de piscine générique** : une grande photo d'eau en plein écran, « Dive into… », des cartes de services à icônes, un carrousel d'avis, des chiffres-clés animés.
  - Ici, l'accueil est un geste de métier (recarreler), pas une photo.
  - Les services sont la coupe d'un bord de piscine et un vrai local technique.
  - Les avis sont la structure de la page.
  - Aucun chiffre-clé animé.
- **Corrigé en route** :
  - La première idée était une jauge de profondeur fixe sur le côté (3 FT → 8 FT). Je l'ai retirée : c'était un deuxième dispositif décoratif à côté de la mosaïque.
  - L'avant/après était une partie à part entière. Il ouvre maintenant la partie rénovation, pour qu'il y ait moins de sections.
- **Les risques surveillés** :
  - Une mosaïque qui ferait « pixel art » : carreaux petits, couleurs de verre relevées sur leurs photos, joints fins, aucune couleur vive.
  - Le bleu partout : le fond principal reste l'enduit clair, et le bleu sombre vient par grands blocs alternés.
