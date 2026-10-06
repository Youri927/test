# Cameron Dental Studio : refonte du site (maquette)

`dist/index.html` est un fichier unique (5,1 Mo) : polices, photos, logo, librairies et scripts sont intégrés. Il s'ouvre directement dans un navigateur, sans serveur.

L'analyse du site actuel et les choix de direction sont dans `ANALYSE.md`. Les planches avant/après sont dans `boards/`.

## L'idée : « The Smile Issue »

Leurs patientes font la couverture de magazines, et la Dr. Cameron se présente comme une artiste (« every smile is a work of art »). Le site devient donc **un numéro de magazine consacré au sourire** :
- une couverture avec le nom du cabinet en grand titre ;
- un sommaire ;
- des rubriques numérotées, avec leur titre courant et leur numéro de page ;
- des légendes, des citations, un « courrier des lecteurs » ;
- une quatrième de couverture pour prendre rendez-vous.

Le registre est celui des magazines de mode et d'art : un papier chaud, une encre presque noire et une seule couleur d'accent, le bleu cobalt (le bleu de leur logo, en plus franc). Deux pages changent de couleur pour rythmer la lecture : le courrier (cobalt) et la prise de rendez-vous (encre).

## La page

| Rubrique | Contenu |
| --- | --- |
| Couverture | « CAMERON » en grand titre condensé, qui remplit la largeur de l'écran ; la photo de la Dr. Cameron qui tend le miroir à sa patiente passe devant le titre, comme sur une couverture. Quatre « titres de une » mènent aux rubriques. Accroche : « Every smile is a work of art. » |
| En-tête | Le folio (« 04 · Before & after ») suit la rubrique en cours. L'état « Open now / Closed » est calculé à l'heure de Naples (lundi–vendredi, 7 h–17 h). |
| 02 · Sommaire | Les rubriques ; au survol, chaque ligne découvre une photo. |
| 03 · L'artiste | Le portrait de la Dr. Cameron, son parcours (textes de leur page), ses diplômes et prix, Top Dentist 2021, et l'avis d'une patiente. |
| 04 · Avant / après | Un cas à la une (Donald Rebello, avec son avis signé), puis la planche des 18 sourires de leur galerie. L'interrupteur « Before / After » retourne toutes les photos en vague. Un clic ouvre le cas : les deux visages, et le gros plan du sourire ; on appuie dessus pour voir l'avant. Puis les couvertures de magazines, qui s'ouvrent en éventail au défilement. |
| 05 · Les soins | Huit onglets : esthétique, blanchiment, aligneurs, implants et prothèses, famille, holistique, ronflement, urgences. Chaque lien « Ask about… » présélectionne le sujet dans le formulaire. |
| 06 · Confort | « How do you feel about the dentist? » : un curseur à trois positions propose l'approche douce, le protoxyde d'azote ou la sédation consciente, d'après leurs propres textes. |
| 07 · Les dentistes | La photo d'équipe et les cinq dentistes ; chaque carte s'ouvre sur une courte biographie. |
| 08 · Le courrier | Des avis réels et signés, classés par thème : sans pression, douceur, honnêteté, service, premières visites. |
| 09 · Le cabinet | Les photos du cabinet, les équipements, le lien vers leur visite vidéo. |
| 10 · Pratique | La première visite en quatre étapes. Un vérificateur d'assurance : on tape le nom de son assurance, la liste de leur page « finances » répond (25 PPO, 6 plans de réduction). Les moyens de paiement. |
| 11 · Rendez-vous | Le formulaire (sujet, nom, e-mail, téléphone), le téléphone, l'adresse, les horaires. Le nom du cabinet en grand ferme la page. |

Sur téléphone, une barre « Call / Book a visit » apparaît après la couverture. Elle se retire sur la page de rendez-vous.

## Contenus

- Tous les textes viennent de leur site, raccourcis ou réécrits ; rien n'est inventé (ni chiffre, ni avis, ni badge).
- Les avis sont ceux publiés sur leur site, avec le nom de leur auteur.
- La note reprend la phrase de leur page « Best Naples Dentist » : « nearly a perfect five-star rating, with over 150 Google reviews ».
- Les photos des patients ne portent pas de nom, sauf Donald Rebello, dont l'avis est signé.

## Fabrication

- **Photos** : `tools/images.py` exporte les photos du site actuel en WebP.
  - Les photos des patients ne sont ni retouchées ni étalonnées. Petites à l'origine (430 × 536 px pour les visages, 385 × 246 px pour les gros plans), elles ont été agrandies ×2 par super-résolution (EDSR, OpenCV), comme les portraits des dentistes et la photo d'équipe.
  - Les photos de banque d'images, les affiches de films et l'ancienne publicité du site actuel ne sont pas reprises.
- **Logo** : `tools/logo.py` vectorise la dent de leur logo (tracé fidèle, potrace) dans `src/logo.svg` ; le nom est composé dans la police du site.
- **Planches** : `tools/boards.py`.
- **Animations** : GSAP 3 + ScrollTrigger, défilement doux Lenis (`vendor/`).
  - Uniquement des transformations, des opacités et des découpes ; rien n'est calculé en continu.
  - Pas de curseur personnalisé, pas d'effet 3D.
  - Mesuré : 60 images par seconde à l'arrêt sur toutes les sections, aucune tâche longue au défilement.
- **Polices** : Noto Serif Display (variable en graisse et en largeur, condensée pour le grand titre) et Instrument Sans, licence OFL (`vendor/fonts/`).

Pour reconstruire la page : `node build.mjs`.

## Comportements prévus

- **Mouvement réduit** (réglage système) : pas de défilement doux ni d'animation ; tout est affiché d'emblée.
- **Clavier** : onglets et thèmes au clavier (flèches), visionneuse des cas (flèches, Échap, la touche Espace maintenue montre l'avant).
- **Écrans testés** : 390 px (téléphone), 820 px (tablette), 1440 et 1920 px (ordinateur).

## À vérifier avec le client avant mise en ligne

1. **Le bon numéro.** Le site actuel en affiche quatre : (239) 423-5481, 422-7924, 256-1330 et 402-2413 (probablement du suivi d'appels). La maquette utilise celui de la page contact, (239) 422-7924.
2. **L'accord des patients** pour mettre leurs photos avant / après en avant sur l'accueil. Elles sont déjà publiques sur leur galerie, avec leurs noms.
3. **Les droits sur les couvertures** de Gulfshore Life et Naples Illustrated.
4. **La note Google et le nombre d'avis**, à mettre à jour.
5. **Formulaire non branché.** Il vérifie les champs et affiche un remerciement, mais n'envoie rien. Il faut le relier à leur outil de rendez-vous et ajouter un anti-spam.
6. **Les assurances** : la liste est celle de leur page « finances » ; à tenir à jour.
