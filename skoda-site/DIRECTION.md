# Skoda Construction : direction artistique

## Le sujet

Une famille de bâtisseurs. Le grand-père de Chris construisait des maisons en 1950. Chris a fondé l'entreprise en
1985. Son fils Mike l'a rejoint en 2014, et porte la licence de Floride depuis 2023.

Aujourd'hui, ils bâtissent et rebâtissent des maisons de luxe sur la côte du golfe, de Boca Grande à Marco Island.
Leur argument le plus fort tient en une phrase de leur site : « All jobs are owner supervised ». Chris et Mike sont sur
chaque chantier, de la première conversation à la fin des travaux.

Le site s'adresse aux propriétaires qui :
- font construire (souvent sur leur propre terrain), de 1 à plus de 10 millions de dollars d'après leur formulaire ;
- rénovent, de 250 000 dollars à plus d'un million ;
- doivent réparer après un ouragan ;
- ou cherchent une entreprise pour des locaux commerciaux.

Sa tâche : leur montrer le travail, la famille et la licence, puis les amener à appeler ou à demander une consultation.

## L'idée : un Skoda derrière chaque chantier

**Le moment fort est l'accueil.**
- Le nom « Skoda », très grand, en bleu, reste épinglé au milieu de l'écran.
- Leurs chantiers défilent par-dessus, photo après photo : un terrain nu, une maison en blocs de béton, une maison
  finie, une cuisine, la maison restaurée après la tempête, un studio de fitness.
- Le nom reste derrière chaque photo, comme Chris et Mike derrière chaque chantier. Le titre le dit en clair.
- Tout est en CSS (position sticky) : le défilement est celui du navigateur, rien ne flotte, rien n'est recalculé.

**À l'ouverture**, une seule séquence orchestrée, en moins d'une seconde et demie :
1. le titre apparaît ;
2. les cinq lettres du nom montent une à une derrière leur ligne de base ;
3. la première photo entre par le bas.

**Ensuite, le mouvement n'arrive que là où il dit quelque chose :**
- **Du terrain à la maison.** Trois photos de trois chantiers (le terrain, la coque en blocs, la maison finie) se
  découvrent dans l'ordre, au défilement.
- **« Better than new ».** La seule histoire complète de leurs photos : une maison abîmée par la tempête (novembre
  2022), séchée, murs ouverts, puis refaite (décembre 2023).
  - Sur ordinateur, la partie reste en place pendant qu'on fait défiler.
  - Une barre de temps avance de novembre 2022 à décembre 2023.
  - Les petites photos de dégâts laissent la place à la grande photo de la maison refaite.
- **La famille.** Les quatre dates (1950, 1985, 2014, 2023) se suivent sur une ligne, qui se trace une fois.
- **Les réponses aux gestes** :
  - la visionneuse des photos ;
  - le choix du type de projet dans le formulaire, qui adapte les fourchettes de budget ;
  - le message prêt.

Pas d'apparition en fondu à chaque section. Pas de parallaxe, pas de curseur, rien qui flotte.

**Ce qu'on ne refait pas :**
- le cadre du logo qui s'ouvre sur une photo (Hideout) ;
- la ligne tracée qui ouvre la photo (Ehlers) ;
- la coupe qui se construit couche par couche, et la galerie en rangs (Mendieta) ;
- le jour et la nuit (Prestige) ;
- l'enseigne (Castor).

## Les couleurs

| Nom | Valeur | Rôle |
| --- | --- | --- |
| Stuc | `#FFFFFF` | Le fond : le blanc des maisons modernes de leurs photos. Pas de crème. |
| Bleu Skoda | `#0253A0` | Le bleu exact de leur logo : le grand nom, les boutons, les liens (7,4 : 1 sur blanc). |
| Châssis | `#17212E` | Le texte : le noir bleuté des menuiseries aluminium de leurs maisons. Fond de la partie « Better than new ». |
| Bloc | `#E9EAE6` | Le gris clair du bloc de béton : le fond de la famille, les comtés servis sur la carte. |
| Joint | `#C9CBC5` | Le gris du mortier : les filets. Les bords des champs, des choix et du bouton Menu sont plus soutenus (`#8F959C`, 3 : 1), pour qu'on les voie. |
| Ardoise | `#565D66` | Le texte secondaire (6,6 : 1 sur blanc). |

Les photos apportent le reste : le ciel, les palmiers, le bois.

Sur le fond Châssis, le bleu Skoda est trop sombre. Les liens y passent en `#9CC2EE` (8,9 : 1).

## La typographie

**Besley**, un Clarendon (Owen Earl, licence OFL), variable de 400 à 900, avec son italique, pour :
- le grand nom ;
- les titres ;
- les citations.

C'est le descendant direct des lettres de leur logo de 1985, des caractères de bois à empattements, sans le relief
western. Aucun site précédent n'a utilisé de Clarendon.

**Rethink Sans** (licence OFL), variable de 400 à 800, pour :
- le texte courant ;
- les légendes ;
- les boutons et le menu.

C'est une linéale nette et actuelle, qui tient le Clarendon à distance.

| Rôle | Police | Taille (ordinateur → téléphone) |
| --- | --- | --- |
| Le grand nom | Besley 900, interlettrage −0,02 em | calé sur la largeur de la page |
| Titre de l'accueil | Besley 700, −0,02 em | 66 → 36 px |
| Titres de partie | Besley 700, −0,015 em | 56 → 34 px |
| Sous-titres | Besley 700 | 26 → 22 px |
| Citations | Besley 500 italique | 30 → 22 px |
| Texte | Rethink Sans 400, interligne 1,6 | 18 → 17 px |
| Légendes, menu, boutons | Rethink Sans 500 à 600 | 15 → 14 px |

**Règles :**
- Bas de casse partout.
- Pas de capitales espacées, pas d'étiquette au-dessus des titres.
- Pas de mot isolé en italique ou en couleur.
- Lignes de moins de 70 caractères.
- Les chiffres (dates, licence, téléphone) sont en chiffres alignés dans les listes.

## La composition

Grille de 12 colonnes, marges de 48 px (20 px au téléphone), contenu aligné à gauche.

```
ACCUEIL (épinglé, environ 3 écrans)
┌────────────────────────────────────────────────────────────┐
│ ⌂ Skoda Construction   Homes Remodels Restoration … [Book] │
│                                                            │
│ Custom homes on Florida's Gulf coast,      Chris and Mike  │
│ run by the Skoda family.                   are on every…   │
│                                                            │
│  S k o d a   ← épinglé au milieu de l'écran, bleu          │
│     [photo]          [photo]                [photo]        │
│            [photo]            [photo]     ← passent devant │
└────────────────────────────────────────────────────────────┘
HOMES : texte à gauche (5 col.), terrain → coque → maison à droite (7 col.)
REMODELS : texte, puis une grille de photos de tailles variées, visionneuse
BETTER THAN NEW : fond Châssis ; histoire épinglée nov. 2022 → déc. 2023 ; deux avis
COMMERCIAL : la liste des sept types de projets, photos, les sept étapes d'un aménagement de bureaux (une vraie suite)
THE FAMILY : 1950 · 1985 · 2014 · 2023 sur une ligne ; Chris et Mike, leur parcours, leurs phrases
LES AVIS : pas de partie à part ; les sept avis (prénom et initiale) sont posés dans le chapitre dont ils parlent
WHERE WE BUILD : trois comtés, onze villes
CONSULTATION : formulaire (type de projet, leur fourchette de budget, ville) → message prêt ; téléphone, e-mail, licence
```

## La marque

La fenêtre en arc de leur logo est redessinée au trait, en bleu :
- l'arc avec ses trois rayons ;
- quatre colonnes et trois rangs de carreaux.

Elle sert de logo dans l'en-tête, dans le pied de page et dans l'icône d'onglet. L'image de partage reprend l'accueil :
le grand nom derrière une maison finie. Le nom s'écrit « Skoda Construction » en Besley. Le relief et les lettres
western disparaissent.

## Les principes

- **Les vraies photos font le luxe.**
  - Recadrées : le rétroviseur et l'échafaudage du voisin disparaissent ; la photo avec une poubelle au premier plan
    est écartée.
  - Jamais agrandies : 2 500 px au plus, affichées à 1 250 px au plus.
  - Les numéros de maison sont floutés.
- **Chaque photo dit ce qu'elle montre, sans ville inventée.** Les intérieurs ne portent aucun nom de ville, et la
  partie le dit : « Floride et Ohio ».
- **Leurs mots, raccourcis.** Pas de « award-winning », pas de note du BBB, pas de promesse sans preuve.
- **La licence est vérifiable** en un clic, sur le site de l'État.
- **Un seul moment fort,** l'accueil. Le reste est calme : du blanc, du texte bien composé, des photos.
