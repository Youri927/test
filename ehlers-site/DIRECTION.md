# Ehlers Contracting : direction artistique

## L'idée : des plans de construction pour une maison de Naples

Rick est un entrepreneur certifié par l'État, qui dépose ses permis et passe ses inspections. Il travaille dans les plus beaux quartiers de Naples. Le site lui ressemble : une page claire et précise, construite comme un jeu de plans d'architecte.

On y retrouve les codes de ces plans, chacun pour une raison :
- **les repères numérotés et les cadres de détail**, qui lisent la photo de la cuisine ;
- **les lignes de cote**, mais seulement pour de vraies mesures : les dimensions des cages moustiquaires, la fourchette de prix, la durée d'un projet ;
- **le cartouche**, cet encadré en bas des plans qui porte le nom de l'entreprise et son numéro de licence, en pied de page.

À côté de ces plans, il y a la lumière de la pièce finie : les deux vraies photos de Park Shore.

## Le moment fort : la ligne d'horizon

À l'ouverture, une ligne fine se tend d'un bord à l'autre de la page, comme le cordeau à tracer qu'on claque sur un chantier. La photo du séjour s'ouvre ensuite à partir de cette ligne, vers le haut et vers le bas. La ligne est posée exactement à la hauteur de l'horizon de la baie dans la photo : la ligne du constructeur et l'horizon du golfe ne font qu'une.

Viennent ensuite le titre et la légende. C'est la seule animation qui se joue sans geste du visiteur. (Trois repères nommaient aussi ce qu'on voit dans la pièce ; ils ont été retirés : selon le recadrage de la photo, ils tombaient à côté ou sortaient du cadre.) Le reste répond au défilement ou à la main : on survole, on choisit, on ouvre.

## Couleurs

Elles viennent des photos : murs blancs, eau de la baie, parquet de chêne clair.

| Nom | Hex | Rôle |
| --- | --- | --- |
| Paper | #FFFFFF | fond, comme leurs cuisines |
| Estuary | #12333A | texte, traits, boutons ; le bleu-vert profond de la baie |
| Estuary 2 | #4D6168 | texte secondaire (6,51:1 sur blanc, 5,52:1 sur la brume) |
| Bay mist | #E6EEEC | sections d'appoint, étiquettes |
| White oak | #A27C4B | lignes de cote et traits, le chêne du parquet (3,8:1 sur blanc) ; jamais pour du texte |
| Line | #D3DCDA | filets |

Pas de crème ni de terre cuite, et pas d'accent vif. L'audace est dans la mise en page, pas dans la couleur.

## Typographie

**Host Grotesk** (Element Type, licence OFL), une seule famille, en graisse variable de 300 à 800. Ses courbes un peu carrées et ses chiffres nets lui donnent un air « construit », sans froideur.

- **Titres :** 560, approche serrée (−0,035 em), interlignage de 0,98.
- **Texte :** 400, 17 à 19 px, interlignage de 1,55, au plus 75 caractères par ligne.
- Pas de capitales espacées, pas de police à chasse fixe, pas de mot mis en italique dans un titre.

## Composition

```
┌──────────────────────────────────────────────────────────────┐
│ Ehlers          Rick  Work  Services  License  Contact  Call │
├──────────────────────────────────────────────────────────────┤
│ ━━━━━━━━━━━━━━━━━ ligne d'horizon ━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│ [séjour sur la baie, pleine largeur, légende]                │
├──────────────────────────────────────────────────────────────┤
│ Kitchens, baths and whole homes,  │ Rick Ehlers… [Call][Email]│
│ remodeled in Naples.              │                          │
├──────────────────────────────────────────────────────────────┤
│ Rick : un constructeur, de l'idée à la fin                   │
│ |—— concept ——— design ——— permit ——— build ——— completion —|│
├──────────────────────────────────────────────────────────────┤
│ Park Shore : la cuisine fixée à gauche, │ 1 Vitrines …       │
│ un cadre de détail par repère           │ 2 Lanterne …       │
├──────────────────────────────────────────────────────────────┤
│ Le tableau des services (comme un tableau de finitions)      │
│ Kitchens │ ce qu'on fait │ exemples tirés des permis         │
├──────────────────────────────────────────────────────────────┤
│ Au registre (fond estuaire) : licence, chantiers des permis  │
│ filtrés par type, quartiers                                  │
├──────────────────────────────────────────────────────────────┤
│ Parlez de votre projet à Rick : téléphone, e-mail, formulaire│
├──────────────────────────────────────────────────────────────┤
│ Cartouche : entreprise │ licence │ téléphone │ e-mail │ ville │
└──────────────────────────────────────────────────────────────┘
```

Tout est aligné à gauche sur une grille de 12 colonnes, avec de grandes marges. Le rythme alterne une section blanche, une section brume, puis une section estuaire.

## Ce que j'ai revu après une première version du plan

- **Les étapes du projet** ne forment plus une grille 01 / 02 / 03, qui est le réflexe de tous les sites. Elles deviennent une seule ligne de cote qui va du concept à la fin du chantier. Rick est présent sur toute sa longueur, c'est exactement sa promesse.
- **Pas d'avis inventés, pas de logo BBB.** La confiance vient du registre : la licence vérifiable et les chantiers repris des permis.
- **Pas de carte.** Hideout en avait une. Ici la liste des quartiers suffit, et la page reste sobre.

## Les extensions consultées

- **21st.dev :** listes de services avec image qui suit la souris, révélations au défilement, comparateurs avant/après.
  - L'image qui suit le curseur est un tic des sites d'agence, et elle ne servirait à rien avec deux photos.
  - Il n'y a pas de photo « avant » pour un comparateur.
  - Je retiens l'idée d'un découpage net pour révéler texte et images, réécrite en CSS.
- **Facade UI et les registres shadcn :** sections marketing en React et Tailwind. Elles mènent à une page de modèle, et le site reste en HTML, CSS et JS simples, avec Lenis.
