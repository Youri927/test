# WAVE Pool Remodeling Scottsdale AZ : refonte du site (maquette)

`dist/index.html` est un fichier unique (4,8 Mo) : polices, photos, logo, carte, librairies et scripts sont intégrés. Il s'ouvre directement dans un navigateur, sans serveur.

L'analyse du site actuel et les choix de direction sont dans `ANALYSE.md`. Les planches avant/après sont dans `boards/`.

## L'idée : « De midi à l'heure bleue »

La page suit une journée dans un jardin de Scottsdale.
- Elle s'ouvre à midi, sur un blanc sable, avec la photo en plein soleil.
- Elle se réchauffe en lumière dorée au fil des services, des chantiers et de la saison.
- Elle finit à l'heure bleue, sur le bleu marine de la marque.

La couleur du fond change en continu au défilement, et celle du texte suit, pour rester lisible.

Le motif graphique est l'arche, tirée du cercle du logo WAVE et de l'architecture du désert. Les photos sont cadrées dans des arches qui montent comme un dôme.

## La page

| Section | Contenu |
| --- | --- |
| Accueil | « Your pool, remade. », appel, devis gratuit, les quatre preuves de confiance. La photo apparaît dans une arche. Au défilement, l'arche s'ouvre en plein écran : on « entre » dans le jardin, et la phrase « More than a place to swim. » apparaît. |
| En-tête | L'état « Open now / Closed » est calculé à l'heure de l'Arizona (lundi–vendredi, 7 h–17 h), avec le téléphone et le bouton de devis. |
| Introduction | Le texte de présentation s'allume mot à mot. Puis 20+ ans d'expérience cumulée, licensed / bonded / insured, devis gratuit, entreprise familiale. |
| Services | « Where's your pool today? » : les trois métiers présentés selon l'état du bassin. **Remodel** (il fonctionne mais ne vous plaît plus), **Resurface** (la surface est usée, avec la durée de vie des finitions et les signes d'usure), **Build** (pas encore de piscine : la coque, puis le bassin fini). |
| Coût | L'échelle des prix publiés par WAVE dans ses articles : une rénovation à partir d'environ 15 000 $, une piscine neuve à partir d'environ 55 000 $. Puis les six facteurs qui font varier le prix. |
| Réalisations | Huit bassins. Sur ordinateur, chaque photo monte comme une vague au défilement ; la liste permet d'aller directement à une photo. Sur téléphone, on les fait glisser. Une visionneuse plein écran s'ouvre au clic (clavier et balayage). |
| Saison | Les températures normales, mois par mois, à l'aéroport de Scottsdale. La période creuse (fin septembre à début mars) est repérée ; le mois en cours est marqué automatiquement, avec un conseil adapté. |
| Secteurs | Une carte tracée dans une arche : limites des villes, autoroutes, rivières, canaux et lits de ruisseaux, avec des cercles tous les 5 miles autour de l'adresse. Survoler une ville de la liste l'allume sur la carte. |
| Démarrage | Les trois premières étapes : nous contacter, consultation et devis gratuits, un plan sur mesure. |
| Journal | Six de leurs articles, avec le temps de lecture calculé sur le texte réel ; les liens mènent à leurs pages. |
| Contact | Le formulaire avec les champs du formulaire actuel, plus le choix du type de projet. Les liens « Get a … estimate » des services le préremplissent. Puis le téléphone, l'état ouvert/fermé, l'adresse (lien Google Maps), l'e-mail et les horaires. |
| Pied de page | Le logo en grand, « An Infinity Construction Group company », les liens et les réseaux. |

Sur téléphone, une barre « Call / Free estimate » apparaît après l'accueil. Elle se retire sur la section contact.

## Fabrication

- **Photos** : `tools/images.py` applique aux photos du site actuel un étalonnage commun léger (ciels calmés, hautes lumières adoucies), sans retouche du contenu. Les trois photos de 1 200 px ont été agrandies ×2 par super-résolution (EDSR, OpenCV).
- **Logo** : `tools/logo.py` vectorise leur fichier `Square.png` (tracé fidèle, potrace) dans `src/logo.svg`.
- **Carte** : `tools/map.py` trace `src/map.svg` et `src/map-bg.svg`.
  - Données : US Census Bureau, TIGER/Line 2024 (domaine public) : limites des villes, autoroutes, rivières, canaux et lits de ruisseaux du comté de Maricopa.
  - Desert Mountain n'est pas une commune : sa position vient d'OpenStreetMap.
- **Températures** : normales climatiques NOAA 1991-2020 de l'aéroport de Scottsdale (station USW00003192), à moins d'un mile de leur adresse. Elles sont inscrites dans `src/main.js`.
- **Planches** : `tools/boards.py`.
- **Animations** : GSAP 3 + ScrollTrigger, défilement doux Lenis (`vendor/`).
  - Rien n'est calculé en continu : uniquement des découpes CSS (arches), des transformations et une couleur de fond.
  - Mesuré : 60 images par seconde à l'arrêt sur toutes les sections, aucune tâche longue au défilement.
- **Polices** : Funnel Display et Funnel Sans (Dicotype, 2024), licence OFL (`vendor/fonts/`).

Pour reconstruire la page : `node build.mjs`.

## Comportements prévus

- **Mouvement réduit** (réglage système) : pas de défilement doux ni d'animation. L'arche d'accueil reste fixe ; la galerie montre une photo à la fois et se pilote par la liste.
- **Écrans testés** : 390 px (téléphone), 820 px (tablette), 1440 et 1920 px (ordinateur).

## À vérifier avec le client avant mise en ligne

1. **Droits des photos.** Elles viennent du site actuel. Il faut confirmer qu'il s'agit bien de leurs chantiers et qu'elles peuvent être réutilisées.
   - La photo de nuit « Small pool project » porte le filigrane d'un autre constructeur (« Pools by Design ») : elle n'est pas utilisée ici, et elle est à retirer aussi de leur site actuel.
   - Plusieurs autres photos ressemblent à des photos d'annonces immobilières : à confirmer une par une.
2. **Le bon numéro.** Le site affiche (480) 571-3969 ; le t-shirt de la photo de chantier porte (480) 790-8241.
3. **Les prix de départ** (15 000 $ et 55 000 $) sont ceux de leurs articles : à confirmer avant de les afficher sur l'accueil.
4. **Formulaire non branché.** Il vérifie les champs et affiche un remerciement, mais n'envoie rien. Il faut le relier à leur outil (LeadConnector) et ajouter un anti-spam.
5. **Avis clients.** Le site actuel n'en a pas et la maquette n'en invente pas. Leurs avis Google réels peuvent faire l'objet d'une section.
6. **Licence.** Leur numéro ROC n'est affiché nulle part ; à ajouter s'ils le souhaitent (à côté de « Licensed, bonded & insured »).
7. **Desert Mountain** est un quartier du nord de Scottsdale, pas une commune : son repère sur la carte est indicatif.
