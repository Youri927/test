# Frontline Pools : refonte du site (maquette)

`dist/index.html` est un fichier unique (4,6 Mo) : police, photos, carte, avis, librairies et scripts y sont intégrés. Il s'ouvre directement dans un navigateur, sans serveur.

L'analyse du site actuel et les choix de direction sont dans `ANALYSE.md`. Les planches avant / après sont dans `boards/`.

## L'idée : « Keep the shell. Renew the rest. »

Frontline rénove des piscines existantes : l'entreprise garde la coque et refait tout le reste. Un client sait rarement ce qu'il veut refaire, alors le site le lui montre sur une de leurs vraies piscines. Puis il prouve, chantier par chantier et avis par avis.

**Couleurs.** Celles du logo : le bleu marine #1D305D et le jaune #FEBC11, sur du blanc et un gris bleuté très clair.

**Typographie.** Une seule famille, Archivo, sur toute sa largeur :
- extra-large et extra-grasse en capitales pour les titres, comme les capitales larges de leur logo ;
- normale pour le texte ;
- étroite pour les fiches techniques.

**Photos.** Uniquement leurs photos de chantier : pas de banque d'images, pas de photos de catalogue, rien de généré.

## La page

| Section | Contenu |
| --- | --- |
| En-tête | Le nom recomposé dans la police du site, le menu et l'état « Open now / Closed » à l'heure de Tampa (lundi–vendredi, 8 h–17 h). Aussi le téléphone et le bouton « Free estimate ». Une fine ligne jaune suit la lecture. |
| Accueil | « Tampa Bay pools, rebuilt » sur toute la largeur. Dessous : les services, deux boutons (devis, appel), une grande photo de chantier et les preuves du site (85 avis cinq étoiles, 20+ ans d'expérience cumulée, 150+ piscines, licence CPC1460668). |
| La coque | La phrase de John, « Our shell was sound, but nothing else. », qui s'allume mot à mot, et ce que fait Frontline. |
| What we rebuild | La visite guidée (voir plus bas) : enduit, ligne d'eau, margelle, plage, eau et lumière, local technique. Chaque chapitre reprend les textes et les matériaux de leur site. |
| Recent work | Les quatre chantiers décrits sur leur site : Davis Islands, Citrus Park, South Tampa, Walden Lake. Chacun occupe tout l'écran, avec sa fiche (enduit, carrelage, margelle, équipement). Puis une bande de sept autres photos, à faire glisser, avec une visionneuse plein écran. |
| Equipment | Les trois avant / après du site (deux locaux techniques, une piscine vidée puis remise en eau). Puis six familles d'équipement, trois réparations racontées par des clients, et les marques en très grand (Jandy, Pentair, Hayward, Madimack). |
| Meet Matt and Jacob | « 19/33 » : 19 des 33 avis publiés citent Matt ou Jacob. Viennent ensuite les mots qui reviennent (recommend, professional, communication), quatre extraits en grand et les 33 avis, prénoms surlignés. |
| How it goes | Les trois étapes, une frise des délais (2–4 semaines, 4–8+ semaines) et six questions. |
| Licensed means accountable | La licence en très grand, un lien pour la vérifier sur le registre de l'État, les certifications (Floride, CWR, CPO) et la garantie. |
| Pay over time | Le financement Lyon Financial : 2,99 %, 150 000 $, 25 ans, et ses conditions. |
| Where we work | Une carte de la baie de Tampa, tracée d'après le recensement américain, et les 16 secteurs. Choisir un secteur l'allume sur la carte et affiche le chantier et les avis qui en viennent. |
| Devis | Téléphone, SMS, e-mail, horaires et état en direct. Le formulaire reprend les champs du site actuel : ce qu'il faut refaire, nom, téléphone, e-mail, adresse, budget, message. |
| Pied de page | « Keep the shell, renew the rest », les liens, les réseaux, et « FRONTLINE » sur toute la largeur. |

Sur téléphone, une barre « Call / Text / Free estimate » apparaît après l'accueil et se retire sur la section devis.

## Les animations

- **Ouverture, la mosaïque** :
  - la photo d'accueil se pose carreau par carreau, en diagonale, avec des joints bleu marine ;
  - les joints se referment ensuite ;
  - c'est le geste de leur métier, le carrelage de ligne d'eau ;
  - en même temps, le titre monte ligne par ligne.

  La même mosaïque reprend sur la photo de la section devis.
- **La visite guidée** :
  - la photo reste à l'écran pendant qu'on fait défiler six chapitres ;
  - à chaque chapitre, la caméra s'approche de la bonne partie du bassin ;
  - un viseur se trace sur le point visé, avec son nom ;
  - au dernier chapitre, la photo du local technique prend le relais.
- **Les chantiers** : les fiches s'empilent ; celle du dessous recule et s'assombrit.
- **Le local technique** : l'« après » monte derrière une ligne jaune, comme l'eau qui remonte.
- **Les marques** : elles défilent en continu, accélèrent et changent de sens avec le défilement.
- **Les avis** : les prénoms de Matt et Jacob se surlignent quand les avis apparaissent.
- **La licence** : les chiffres défilent comme un compteur, puis un trait jaune la souligne.
- **La carte** : les points se posent, du code postal 33603 vers l'extérieur.
- **Détails** :
  - les chiffres comptent jusqu'à leur valeur, les barres des délais se remplissent ;
  - les questions s'ouvrent en douceur ;
  - les boutons se remplissent au survol ;
  - le grand mot du pied de page monte lettre par lettre.
- **Technique** :
  - uniquement des transformations et des opacités ;
  - la mosaïque est dessinée une seule fois dans un canvas, puis retirée ;
  - le fond de carte est une image figée : il ne se redessine pas au défilement.

## Contenus

- Tous les textes viennent de leur site, raccourcis ou réécrits ; aucun service, chiffre ni badge n'est inventé.
- Les avis sont ceux publiés sur leur site, mot pour mot, avec leur signature (les guillemets d'origine sont harmonisés).
- Le « 19/33 » et les décomptes de mots sont calculés sur ces 33 avis.

## Fabrication

- **Photos** : `tools/images.py`.
  - Les photos du site actuel ont été téléchargées à la plus grande taille proposée par leur serveur, puis recadrées et exportées en WebP, sans retouche ni étalonnage.
  - Les plus petites (510 à 1 600 px) ont d'abord été agrandies ×2 par super-résolution (EDSR, OpenCV).
  - La mention « Galaxy A52 5G » d'une photo est recadrée.
- **Carte** : `tools/map.py` trace le fond (côtes, lacs, autoroutes) et les secteurs ; `tools/map-raster.mjs` fige le fond en image 2×.
  - Données : US Census Bureau, TIGER/Line 2024 (domaine public).
  - Les positions des villes sont les points officiels du recensement.
  - Davis Islands, South Tampa et New Tampa, quartiers de Tampa, sont placés d'après OpenStreetMap.
- **Avis** : `data/reviews.json`, insérés et surlignés par `build.mjs`.
- **Animations** : GSAP 3 + ScrollTrigger, défilement doux Lenis (`vendor/`).
- **Police** : Archivo (Omnibus-Type), licence OFL (`vendor/fonts/`).
- **Planches** : `tools/boards.py`.

Pour reconstruire la page : `node build.mjs`.

## Comportements prévus

- **Mouvement réduit** (réglage système) : pas de défilement doux ni d'animation ; tout est affiché d'emblée, et les avant / après sont côte à côte.
- **Clavier** : tout se pilote au clavier. Dans la visionneuse, les flèches changent de photo et Échap la ferme ; sur téléphone, on balaie.
- **Écrans testés** : 390 px (téléphone), 820 px (tablette), 1280, 1440 et 1920 px (ordinateur).
- **Fluidité** : aucune tâche longue au défilement, 60 images par seconde à l'arrêt sur toutes les sections.

## À vérifier avec le client avant mise en ligne

1. **Les photos du jardin aux bassins carrelés de verre bleu** (accueil, visite guidée, galerie) : confirmer le chantier.
   - Elles ressemblent au chantier Davis Islands et à l'avis de John (bassin et spa refaits, déversoirs, travertin).
   - Si c'est confirmé, on peut les nommer et les regrouper avec la fiche Davis Islands.
   - La photo utilisée par leur site pour Davis Islands (spas carrelés beige) pourrait d'ailleurs être un « avant ».
2. **Une photo de Matt et Jacob.** Le site actuel n'en a aucune. La section « Meet Matt and Jacob » est typographique ; un portrait la rendrait plus forte.
3. **Le rôle de Jacob** : seul Matt est désigné comme propriétaire (« Matt (owner) », dans un avis).
4. **Les chiffres du site** (85 avis cinq étoiles, 20+ ans, 150+ piscines), à mettre à jour.
5. **Le financement** : les chiffres viennent de la bannière Lyon Financial de leur site (2,99 %, 150 000 $, 25 ans). Les conditions et les mentions légales sont à valider avec Lyon.
6. **Le logo** : le nom est recomposé dans la police du site ; le logo chromé n'est pas repris. À valider ; un fichier vectoriel d'origine serait bienvenu.
7. **Formulaire non branché.** Il vérifie les champs et affiche un remerciement, mais n'envoie rien. Il faut le relier à leur outil et ajouter un anti-spam.
8. **La carte** : le point « Tampa 33603 » est placé dans le code postal, pas à une adresse.
9. **Les certifications** (CWR, CPO) : confirmer qu'elles sont à jour.
