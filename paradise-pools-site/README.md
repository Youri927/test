# Paradise Pools of Tampa Bay : proposition de refonte

Maquette complète du nouveau site de **Paradise Pools of Tampa Bay** (paradisepoolstb.com), en anglais, sur ordinateur et sur mobile.

**À ouvrir** : `dist/index.html`, double-clic, sans serveur ni connexion.
- Un seul fichier de 8,4 Mo : polices, photos, carte et scripts sont dedans.
- L'analyse du site actuel est dans `ANALYSE.md`.
- Les planches de présentation sont dans `boards/`.

## L'idée

Leur plus belle photo est une **vue de drone** d'une de leurs piscines neuves. Le même chantier a aussi été photographié depuis la plage.

**L'ouverture**
- Le titre « Paradise, built in your backyard », puis la vue de drone annotée d'un trait fin, comme un plan : spa, plage immergée, bassin.
- Au défilement, la photo s'ouvre à tout l'écran et « descend » : on se retrouve au bord de la même piscine.
- Le texte relie les deux images à leur promesse : voir le projet en entier avant les travaux (conception en 3D).

**La suite de la page**
- **Family owned and operated** : leur phrase en grand, avec la licence, les six comtés et la réponse sous 24 h.
- **New pools** : trois temps tirés de leur page « New Pool Construction ». La photo de chaque étape glisse en place pendant la lecture.
- **Remodels** : leurs prestations sous forme d'index. Le survol (ou le toucher sur mobile) montre la photo correspondante.
- **Our work** : six chantiers reconnus dans leur galerie, chacun photographié sous plusieurs angles.
  - Défilement horizontal sur ordinateur, liste sur mobile.
  - Chaque chantier ouvre toutes ses photos dans la visionneuse.
- **All 49 photos** : galerie filtrable (forme libre, géométrique, plage immergée, spa, jeux d'eau, sous cage, bord de l'eau) et visionneuse plein écran (clavier, glissé du doigt).
- **Financing** : Lyon Financial et HFS comparés par les chiffres de leur site, avec compteurs, barres et liens de demande.
- **Six counties** : une vraie carte (données du recensement américain). Les comtés s'allument un à un et répondent au survol de la liste.
- **Quote** : les mêmes champs qu'aujourd'hui, un statut « ouvert / fermé » en direct à l'heure de Tampa, et le délai de 24 h.
- Sur mobile, une barre « Call / Get a quote » suit la page.

**Forme**
- Couleurs du logo :
  - orange soleil `#F05A28` pour les actions ;
  - bleu profond `#00466D` pour le texte ;
  - bleu océan `#0090C8`.
- Fond blanc, typographie **Funnel Display / Funnel Sans** (licence OFL).
- Pas d'italique décoratif, pas d'étiquettes en capitales, pas de sections numérotées, pas de dégradés.

**Animations** : uniquement des transformations et des fondus. Si le visiteur a réduit les animations sur son appareil :
- tout s'affiche directement ;
- la vue de drone et la photo au bord de l'eau se suivent simplement.

## Rien d'inventé

- **Textes** : repris ou raccourcis depuis leurs six pages. Les superlatifs de la page Services, qui semblent copiés d'un autre pisciniste et pointaient vers son site, ne sont pas repris.
- **Avis et note** : aucun, puisque leur site n'en publie aucun.
- **Photos** :
  - leurs 51 fichiers d'origine, récupérés en pleine définition, dont 49 retenus ;
  - les deux plus petits ont été agrandis ×2 par super-résolution (EDSR) ;
  - aucune retouche.
- **Description des photos** : on dit ce qu'on y voit (`data/photos.json`).
  - Aucune adresse : celles des clients apparaissent dans les fichiers du site actuel.
  - L'étiquette « New pool » ne figure que sur les deux chantiers montrés sur leur page New Pool Construction. « Remodel » ne figure que sur celui de leur page Services.
- **Formulaire** : c'est une démonstration, rien n'est envoyé.

## Fabrication

| Fichier | Rôle |
| --- | --- |
| `src/index.html`, `src/styles.css`, `src/main.js` | la page |
| `data/photos.json` | les 49 photos : description, étiquettes des filtres, chantier |
| `tools/images.py` | export AVIF (2048, 1600 ou 1200 px) et vignettes de 560 px |
| `tools/map.py` | carte des six comtés, d'après le fichier `cb_2024_us_county_500k` du US Census Bureau |
| `tools/boards.py` | planches de présentation |
| `build.mjs` | assemble `dist/index.html` |
| `vendor/` | GSAP + ScrollTrigger, Lenis, polices Funnel (OFL) |

```
python3 tools/images.py <dossier des photos d'origine>   # raw/ (+ sr/ pour les deux agrandies)
python3 tools/map.py <dossier du shapefile cb_2024_us_county_500k>
node build.mjs
```

## Vérifié

**Largeurs testées** :
- 390 px (téléphone) ;
- 820 × 1180 (tablette en portrait) ;
- 1024 × 768 (tablette en paysage) ;
- 1280, 1440 et 1920 px.

**Résultats** :
- aucun débordement horizontal ;
- aucune erreur JavaScript ;
- toutes les interactions testées automatiquement : menu, index des rénovations, filtres et visionneuse, photos des chantiers, carte, validation et envoi du formulaire, compteurs ;
- le mode « animations réduites » affiche tout le contenu.

**Fluidité** : mesurée en rendu logiciel, sans carte graphique.
- Le code ne bloque jamais le navigateur : aucune tâche longue.
- Le premier passage sur la section Remodels descend vers 25–40 images par seconde, le temps que le navigateur décode les photos.
- À vérifier sur un vrai téléphone et un vrai ordinateur.

## À fournir par l'entreprise pour aller plus loin

- Des avis clients, avec l'accord de leurs auteurs.
- L'année de création, les prénoms de la famille, une photo de l'équipe.
- La ville de chaque chantier, s'ils souhaitent l'afficher.
- Des rendus 3D et des photos « avant » de rénovations.
- Idéalement, une adresse e-mail @paradisepoolstb.com.
