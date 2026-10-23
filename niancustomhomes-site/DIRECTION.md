# NIAN Custom Homes : la direction

## L'idée : Lot + Home

NIAN ne vend pas seulement une maison. Sur leur site, tout commence par le terrain :
- un de leurs lots dans le comté de Collier, le vôtre, ou celui qu'ils vous aident à trouver (avec Sun Realty, qui peut
  aussi vendre votre maison actuelle) ;
- puis la maison : dessinée de zéro, un de leurs plans éprouvés retouché, ou vos propres plans ;
- et leurs « Lot + Home Packages », terrain et maison vendus ensemble.

Le site s'ouvre sur cette addition.

1. **L'accueil** montre une de leurs photos coupée en deux. À gauche, le terrain : les cyprès, la pelouse, les tonneaux
   fleuris. À droite, la maison. Au-dessus, deux mots très grands, « Lot » et « Home », et entre eux un « + » bordeaux,
   la couleur du toit de leur logo, au milieu exact de l'écart entre les deux moitiés (au téléphone, où la ligne est
   pleine, il descend dans l'écart).
2. **Quand on fait défiler**, les deux moitiés se rapprochent jusqu'à se toucher. Le « + » s'efface, et la photo
   redevient une : une maison NIAN sur son terrain. Une légende apparaît : « Oakes Estate Home, Naples ». C'est le seul
   grand mouvement de la page. Il suit le défilement, dans les deux sens.
3. **Plus bas**, le visiteur compose sa propre addition : son terrain + sa maison. Il coche une des trois réponses de
   chaque côté du « + ». Son choix est repris dans la demande de consultation.

Le reste de la page se tait et laisse la place à leurs photos : six maisons, une trentaine d'images en grand.

**Sur un écran en hauteur** (téléphone, tablette tenue droite), la photo, très large, coupée au milieu, ne montrerait
que les cyprès devant la façade, des deux côtés. Elle est donc réduite au départ, pour que la boîte en montre 62 % : le
tonneau et les fleurs à gauche, la maison à droite. Elle grandit en se recollant, jusqu'au plein écran sur la tablette
et jusqu'à une bande au format 4:5 sur le téléphone.

## Les pistes écartées, et pourquoi

- **Les couleurs de chaque maison, relevées sur ses photos.** Leur conseil en design commence par les couleurs, et
  chaque maison a les siennes : toit doré, enduit jaune paille, tuiles brunes. Mais le traitement HDR de leurs photos
  donne des blancs brûlés et des gris bleutés. Les relevés étaient faux ou ternes, et les embellir aurait été les
  inventer.
- **Une loupe sur les détails** (le carrelage, les plans de travail). À pleine résolution, les photos montrent les halos
  du HDR : on ne les agrandit pas.
- **Une caméra qui remonte l'allée** ou une visite épinglée pièce par pièce : trop proche de Boca et de Stellar.
- **Le chevron du logo comme cadre des photos** : déjà fait pour Hideout.
- **Des volets qui s'ouvrent** (« West Indies ») : l'effet de store de PowerPoint n'est pas loin.
- **Une grille de six maisons en cartes identiques** : c'est la page modèle qu'ils ont déjà.

## Couleurs

| Nom | Valeur | Rôle |
|---|---|---|
| Stucco | `#F3F4F2` | Le fond. Le blanc de leurs façades, légèrement froid : les ciels très bleus de leurs photos y restent propres. |
| Encre | `#1E1F21` | Le texte et les titres (15,0:1 sur le stucco). |
| Ardoise | `#5D6065` | Le texte secondaire, les légendes (5,7:1). |
| Bordeaux | `#6B1D22` | La couleur du toit de leur logo : le « + », les boutons, la bande des packages. Texte blanc dessus : 11,5:1 ; le bordeaux comme texte sur le stucco : 10,4:1. |
| Gris logo | `#A9AAA8` | Seulement en filets et dans le logo redessiné, jamais pour du texte (2,1:1). |
| Encre profonde | `#18191A` | Le pied de page. |

## Typographie

- **Petrona** (Ringo R. Seeber), variable de 100 à 900. Une serif contemporaine aux empattements en coin, très fine en
  grand.
  - « Lot » et « Home » en 200, à 13 vw ;
  - les titres en 300, de 40 à 76 px, serrés à −0,02 em ;
  - les noms des maisons en 400.
- **Gantari** (Lafontaine), linéale géométrique et ouverte, de 100 à 900. Le texte (18 px, interligne 1,6, 66 signes au
  plus), les légendes (14,5 px), l'interface et les chiffres.
- **Pourquoi elles.** Petrona donne la main de l'artisan sans le côté magazine de luxe ; Gantari est nette comme une fiche
  de chantier. Aucune des deux n'a servi pour les sites précédents.
- **Pas de capitales espacées** en étiquette, pas de sur-titre, pas de mot mis en couleur dans un titre. Seul le logo
  écrit NIAN en capitales.

## La mise en page

Texte aligné à gauche. 12 colonnes, gouttière de 20 à 64 px, 1 440 px de contenu au plus.

### L'accueil

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ ^NIAN Custom Homes     Homes  How it works  Packages  Realtors  About  ☎  [Free consultation] │
│                                                                              │
│  Lot                              +                              Home        │
│ ┌────────────────────────────────┐   ┌────────────────────────────────┐      │
│ │ le terrain (moitié gauche)     │   │ la maison (moitié droite)      │      │
│ └────────────────────────────────┘   └────────────────────────────────┘      │
│ Custom homes in Naples,     NIAN is a family-owned   [Schedule a free        │
│ from the lot up.            builder. We help you…     consultation]          │
│                                                       or call 239-280-6428   │
└──────────────────────────────────────────────────────────────────────────────┘
au défilement : les deux moitiés se rejoignent, le + s'efface, la légende paraît
```

### Les maisons

```
Six homes. No two alike.
┌───────────────────┬──────────────────────────────────────────────────────┐
│ The Park          │  [ photo principale ]                                │
│ Villa Estate      │                                                      │
│ Oakes Estate      │                                                      │
│ Oakes Woods       │  légende                                             │
│ Collier Woods     │  [vignette][vignette][vignette][vignette][vignette]  │
│ Gates             │  Modern West Indies design      [See all 6 photos]   │
└───────────────────┴──────────────────────────────────────────────────────┘
```

Les six noms restent toujours visibles. Choisir un nom change la scène (fondu de 450 ms). La photo et les vignettes
ouvrent la visionneuse de la maison.

### Votre addition

```
Start where you are.
┌─────────────────────────────┐        ┌─────────────────────────────┐
│ Your lot                    │   +    │ Your home                   │
│ ○ One of our lots           │        │ ○ Designed from scratch     │
│ ○ Your own land             │        │ ○ One of our plans, adjusted│
│ ○ One we help you find      │        │ ○ Your own design           │
└─────────────────────────────┘        └─────────────────────────────┘
Then every selection, with our design team: from color schemes to fixture styles.
[ intérieurs : cuisines, bains, sols, en bande ]
```

### Ensuite

- **Une bande bordeaux en deux moitiés** : les Lot + Home Packages (certains prêts) et la rénovation dans le comté de
  Collier. Chaque bouton ouvre la demande avec le bon sujet.
- **Les agents immobiliers** : « 4 % » dans une phrase, la moitié à la signature, l'autre au certificat d'occupation.
- **L'entreprise** : familiale, dans l'immobilier du sud-ouest de la Floride depuis 2006, la licence et sa fiche, Sun
  Realty, le bureau et sa salle d'exposition, la succursale de vente.
- **La consultation gratuite** : un formulaire court qui écrit l'e-mail.

## Le mouvement

1. **L'accueil** : les mots montent de sous leur ligne, le « + » se trace (0,9 s), et les deux moitiés s'ouvrent depuis
   le « + » dès que la photo est prête (1,25 s). Au défilement, elles se rejoignent ; les mots et le texte s'effacent
   pendant que la photo les recouvre.
2. **Le « + » du choix** se trace quand il entre à l'écran.
3. **Les maisons** : un fondu quand on change de maison ou de photo ; un chevron bordeaux glisse devant le nom choisi.
4. **La visionneuse** : un fondu à l'ouverture et d'une photo à l'autre ; glissement au doigt, flèches au clavier.
5. **Les apparitions**, une fois, à l'entrée dans l'écran, toutes de la même famille que l'accueil : les titres montent
   de sous leur ligne comme « Lot » et « Home », les photos s'ouvrent depuis le milieu comme les deux moitiés depuis le
   « + », les filets se tracent de gauche à droite. Le brief demande des apparitions au défilement ; elles reprennent le
   geste de l'accueil plutôt qu'un fondu générique.

Rien ne bouge tout seul après l'arrivée. En mouvement réduit, l'accueil reste séparé, avec son « + », et tout le reste
est immédiat.

## Les photos

Leurs photos, rien d'autre. Aucune n'est agrandie. Les filigranes sont hors cadre. Six numéros de maison sont effacés,
en reportant l'enduit voisin. Aucune métadonnée n'est gardée. Les couleurs du HDR ne sont pas corrigées.

## Revue du plan contre le brief (avant de coder)

- **« Pas une version un peu plus moderne. »** L'accueil ne reprend ni la grande photo sous un slogan, ni les trois
  cartes de services. Il pose une addition qui est leur offre.
- **« Ne pas ressembler à un modèle. »**
  - Le premier plan était une photo à droite et un titre à gauche, banal. La photo coupée en deux, qui se recolle, le
    remplace.
  - La galerie en grille est remplacée par une scène à six noms.
- **« Leur contenu réel, sans inventer. »**
  - Chaque option du choix vient de leurs pages Services et Home.
  - « From the lot up » résume leur ordre : le terrain, le plan, les choix.
  - Les noms et les styles des maisons sont les leurs, corrigés de leurs fautes.
  - Aucun témoignage : leur seule page de témoignages est celle du modèle Wix, avec de faux noms.
- **« Premium et jeune. »** Le bordeaux de leur logo, sur un blanc froid, avec une serif fine et une linéale ouverte. Ni
  crème, ni terre cuite, ni fond noir.
- **Les réflexes des pages générées.** Une seule couleur d'accent, qui vient du logo. Aucune étiquette en capitales.
  Aucune flèche ajoutée aux boutons. Aucun chiffre décoratif : le seul chiffre en grand, 4 %, est leur offre aux
  agents.

## Les extensions consultées

- **21st.dev** : la recherche du catalogue et la recherche d'inspiration ont échoué (« catalog search failed », côté
  serveur) le 23 octobre 2026. Rien n'en vient.
- **Facade UI, shadcn** : des sections React, hors de la méthode (HTML, CSS et JavaScript écrits à la main).
- **frontend-design** : ce plan, revu avant de coder.
- **design-critique, accessibility-review, ux-copy** et **seo-audit** (Maquinable GEO) : après la construction.
