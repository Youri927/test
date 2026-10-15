# Five Points Roofing : direction artistique

## Le sujet, le public, le travail de la page

- **Le sujet** : un couvreur familial de Lakeland (comté de Polk, centre de la Floride), pour trois sortes de toits :
  maisons, mobile-homes, bâtiments commerciaux. La famille Ray est dans le métier depuis 1955 ; la licence de Floride
  est au nom d'Angela Ray.
- **Le public** : des propriétaires du comté de Polk, souvent après une fuite ou une tempête ; beaucoup vivent en
  mobile-home (des communautés entières autour de Lakeland et de Winter Haven) ; des bailleurs ; des propriétaires de
  petits bâtiments commerciaux. Ils veulent savoir vite : est-ce sérieux, combien de temps avant qu'on vienne, qu'est-ce
  qui est garanti.
- **Le travail de la page** : obtenir l'appel ou la demande d'estimation gratuite, en donnant confiance dès le premier
  écran (la licence, la garantie, le délai, la famille, les avis).

## L'idée : la pente

Un couvreur pense en **pente** : l'angle d'un toit décide de tout (le matériau, la façon dont l'eau s'en va, l'endroit
où il fuira). Le site prend cette ligne comme fil conducteur.

Et leur logo le dit déjà : **la pointe du haut de l'étoile est un chevron noir, la forme exacte d'un toit**. Cinq
pointes, la première est un toit.

1. **L'accueil est un pignon de mots.** Leur phrase, « Roofing is in our blood », est écrite le long des deux rampants
   d'un toit à 6/12 (26,6°), comme posée sur la couverture. L'étoile est au faîte, là où la pointe du logo est déjà un
   toit. Sous ce toit, tout le reste de l'accueil.
2. **Une seule ligne de toit qui s'aplatit.** Dans la partie des toits, le même profil passe du toit en pente d'une
   maison au toit bas d'un mobile-home, puis au toit plat d'un bâtiment commercial à acrotères. Sur chaque profil,
   les endroits où ce toit-là fuit, d'après leur propre expérience (solins de tuyaux, noues, solins de murs ; autour des
   tuyaux et des aérations ; eau stagnante et joints).
3. **Les garanties sur une règle graduée en années** : 10 ans de main-d'œuvre, 20 ans NDL, 30 ans à vie.

C'est le seul endroit où l'on dépense de l'audace : la ligne de toit. Le reste est calme, net, aligné à gauche.

## Couleurs

Pas de crème, pas de noir dominant avec un accent : un fond clair et froid, comme une membrane neuve au soleil de
Floride, et l'or exact de leur logo.

| Nom | Valeur | Rôle |
| --- | --- | --- |
| Membrane | `#F4F5F2` | le fond : le blanc froid d'un toit en TPO |
| Blanc | `#FFFFFF` | les panneaux (formulaire, avis) |
| Asphalte | `#1C1E21` | le texte ; les parties sombres (la tempête, le pied de page) ; la pointe de l'étoile |
| Ardoise | `#596068` | le texte secondaire |
| Solin | `#CDD1D4` | les filets, la règle des garanties |
| Or | `#C3A046` | l'or du logo : l'étoile, la ligne de toit, les barres ; sur fond sombre, il peut écrire |
| Or foncé | `#7E6215` | l'or quand il doit se lire sur fond clair (liens actifs, petits textes) |

L'or ne sert jamais de texte sur fond clair (contraste trop faible) : il y devient or foncé.

## Typographie : Saira, la lettre de leur logo

Leur logo est composé dans une linéale aux formes carrées ; **Saira**, en largeur étendue, en est presque la copie.
On en fait toute la typographie, en jouant sur sa largeur variable :
- **condensée et grasse** (largeur 62,5 %, graisse 780) : le pignon de mots, les titres, les grands chiffres ;
- **étendue** (largeur 125 %) : seulement le nom dans le logo ;
- **normale** (largeur 100 %, graisse 400) : le texte courant, en 18 à 19 px, interligne 1,6.

Une seule famille (sous licence OFL, servie depuis le site), trois voix. Les titres sont en casse normale ; seules les
lettres du pignon sont en capitales, comme une inscription sur une couverture. Pas de petits libellés en capitales
espacées au-dessus des titres.

## Composition

Grille de 12 colonnes, contenu jusqu'à 1320 px, marges de 16 px sur téléphone. Tout est aligné à gauche, sauf l'accueil
qui est symétrique sous son toit.

```
ACCUEIL (ordinateur)
                         ★                         ← l'étoile au faîte
                    ╱         ╲
      ROOFING IS IN               OUR BLOOD.       ← lettres posées sur les rampants (6/12)
            ╱                           ╲
   Roofs for homes, mobile homes          ┌──────────┐
   and businesses across Polk County.     │ photo :  │  ← leur camionnette, un couvreur
   texte · [Free estimate] [Call]         │ inspection│    sur le toit (taille réelle)
                                          └──────────┘
   ─────────────────────────────────────────────────────
   Licence CCC1333259   10 ans de garantie   Sur place sous 5 jours

LES TOITS
   [Homes] [Mobile homes] [Commercial]   ← onglets, l'indicateur s'étire vers le suivant
   ┌─────────────────────────┐  ce que l'on fait sur ce toit
   │  profil du toit +       │  les matériaux
   │  points de fuite        │  photo
   └─────────────────────────┘

LA TEMPÊTE (fond asphalte)         RÉPARER, RECOUVRIR, REMPLACER
   4 étapes · « 5 days »              trois colonnes de décision ; ce que comprend un toit neuf

LES GARANTIES                        LA FAMILLE
   0 ─── 10 ─── 20 ─── 30 ─── à vie     1955 → aujourd'hui ; la licence ; les véhicules

AVIS · ZONE · QUESTIONS · ESTIMATION · PIED DE PAGE
```

## Le mouvement

- **Un seul moment à l'ouverture** : les deux rampants se tracent des avant-toits au faîte, les lettres montent le
  long de la pente jusqu'à leur place, l'étoile se pose au faîte en tournant d'une pointe (72°, elle retombe sur
  elle-même). Puis le texte de l'accueil apparaît, sans glisser.
- **En réponse aux gestes** : la ligne de toit qui se transforme d'un type à l'autre, l'indicateur d'onglet qui s'étire
  vers le suivant (principe repris d'un composant de 21st.dev, réécrit sans bibliothèque), les questions qui s'ouvrent,
  le formulaire qui rédige l'e-mail.
- **Au défilement, une seule fois** : les barres des garanties qui s'allongent jusqu'à leur durée.
- Pas d'apparition en fondu à chaque partie, pas de parallaxe, pas de curseur, rien qui flotte. Défilement amorti par
  Lenis. Avec « réduire les animations », tout est directement à sa place.

## Les photos

Toutes petites (550 à 640 px de large) : on les montre **à 60 % de leur largeur au plus**, pour qu'elles restent nettes
sur les écrans haute densité, et jamais agrandies. Ce sont des pièces au dossier, cadrées net, avec une légende factuelle
et sans nom de ville quand on ne le connaît pas. Les plaques d'immatriculation et le numéro de maison sont floutés.

## Ce qu'on a écarté, et pourquoi

- **Une grande étoile seule dans l'accueil** : premier réflexe, mais elle aurait fait insigne de shérif. On a gardé
  l'étoile au faîte d'un toit de mots : c'est le sens même du logo (sa pointe du haut est un toit).
- **Un fond noir et or** : le réflexe « premium », qui fait gabarit de luxe. Fond clair et froid à la place, l'asphalte
  pour deux parties seulement.
- **Le toit monté couche par couche, une galerie en rangs de tuiles, une carte des villes** : c'était le site de
  Mendieta Roofing. Ici, le profil d'un toit et ses points de fuite, une règle des garanties, une liste des villes.
- **Pathway Extreme** : essayée ; Saira l'emporte parce qu'elle est la lettre de leur logo.
- **Les badges (GAF, NRCA, BBB), « top rated », « 35 ans », « 24 h/24 »** : invérifiables ou contradictoires.
- **Les photos génériques ou empruntées** : on montre peu de photos, mais ce sont les leurs.

## Ne pas répéter les sites précédents

Castor (enseigne sur la façade), Prestige (jour/nuit), Hideout (cadre du logo qui s'ouvre sur une photo), Ehlers
(cordeau et plans), Mendieta (toit couche par couche, galerie en tuiles, carte), Petri (ligne d'eau en mosaïque),
One Place (lumière et ombre), Skoda (nom fixe et chantiers qui passent devant, histoire épinglée avec barre du temps).
Polices déjà utilisées : aucune n'est reprise.
