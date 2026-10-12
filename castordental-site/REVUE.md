## Revue de design : nouveau site Castor Dental Associates

Revue faite sur des captures écran par écran, en défilant pour de vrai :
- ordinateur : 1440 × 900 ;
- téléphone : 390 × 844 ;
- contrôles à 320, 700, 1024 et 1180 px ;
- l'ouverture image par image, sur ordinateur et sur téléphone.

Stade : version finale. Tout ce qui est marqué « corrigé » est fait dans cette version.

### Impression générale
On comprend en deux secondes où l'on est et ce que ce cabinet a de particulier :
- la promesse en très grand, dans le bleu de leur enseigne : « Most dentistry looks like dentistry. Ours is meant to go unnoticed. » Elle vient de leur propre phrase (« Most dentistry, looks like dentistry. Our goal is to provide dentistry that is undetectable. ») ;
- leur enseigne, composée en vraies lettres, qui recule et se pose sur la façade du 785 Central Avenue ;
- le téléphone et « Request a visit » à portée de main, avec la promesse pour les urgences.

C'est le moment dont on se souvient, et il est vrai : c'est leur enseigne, leur maison, leur numéro.

Les plus gros défauts trouvés étaient dans l'ouverture elle-même et dans la mesure du chargement, pas dans le contenu.

### Utilisabilité
| Constat | Gravité | Correction |
|---------|---------|------------|
| Ouverture : vers 1,3 s, les lettres du site et celles de la photo se superposaient en grand, avec des écarts (« DENTAL » et « JOSEPH A CASTOR DMD » dédoublés). | 🟡 Moyen | Corrigé : une « plaque », la photo de la façade sans ses lettres, se pose sous l'enseigne animée (`tools/plate.py`). Les lettres sont effacées ligne par ligne, puisque le bardage est horizontal. La plaque est découpée dans chaque version de la photo et tombe dessus au pixel près ; elle s'efface avec l'enseigne à la fin, quand les lettres sont petites, et l'on retrouve la vraie enseigne. |
| Ouverture : à la fin du recul, l'enseigne du site tombait jusqu'à 6 % à côté de la vraie. Composées en 10 px, les lettres ont une chasse arrondie par le navigateur. | 🟢 Mineur | Corrigé : l'enseigne est composée en 200 px puis réduite. Chaque ligne est calée encre sur encre (début et fin des vraies lettres, mesurés dans la photo et dans Chromium). Le fondu final ressemble à une mise au point. |
| Ouverture : les lettres du site passaient du bleu vif aux lettres presque noires de la photo (#030B23, à l'ombre du porche) au moment du fondu. | 🟢 Mineur | Corrigé : l'enseigne fonce pendant que la photo apparaît, comme si elle entrait à l'ombre du porche. Au fondu, les deux ont le même ton. |
| Chargement sur téléphone : le plus grand élément (la photo) n'était compté qu'à 3,2 s (processeur ralenti 4 fois, 4G). Masquée à opacité 0 pendant l'ouverture, la photo n'était prise en compte qu'à la fin, quand les animations sont retirées. | 🟡 Moyen | Corrigé : la photo démarre à 1 % d'opacité, invisible à l'œil, et elle est comptée dès sa première peinture. LCP mesuré : 0,96 s au téléphone ralenti, 0,5 s sur ordinateur. |
| Liens vers les sections : la section arrivait 180 px sous le haut de l'écran au lieu de 92. Lenis 1.3 retire déjà la marge prévue sous l'en-tête (`scroll-padding-top`), et le script en ajoutait une seconde. | 🟡 Moyen | Corrigé : une seule marge, celle de la feuille de style, que Lenis et le défilement du navigateur respectent tous les deux. La section reçoit aussi le focus (voir `ACCESSIBILITE.md`). |
| Cas d'orthodontie, sur ordinateur : les trois photos étaient alignées à gauche, avec 208 px vides à droite. Elles sont limitées à 352 px parce que les originaux font 640 px (pas d'agrandissement). | 🟢 Mineur | Corrigé : les photos gardent leur taille, la place qui reste va entre les étapes, et la ligne du temps traverse toute la largeur, de « Before » à « Five months ». |
| Équipe, sur ordinateur : la biographie n'occupait que la moitié gauche de la bande verte, la droite restait vide. | 🟢 Mineur | Corrigé : le nom et la fonction à gauche, le texte et la liste à droite, alignés sur le chapô de la section. |
| Formulaire : l'exemple du champ « When suits you? » était coupé sur ordinateur (« next w… »). | 🟢 Mineur | Corrigé : « e.g. mornings, or after 3 pm ». |
| Enseigne en bardage de la visite, sur téléphone : le téléphone et « JOSEPH A CASTOR DMD » tombaient à 10 px. | 🟢 Mineur | Corrigé : 13 à 20 px selon la largeur, toujours sur une ligne. |
| Polices : 204 Ko à charger, dont 111 Ko de Literata pour les seules citations. | 🟢 Mineur | Corrigé (`tools/fonts.py`) : Commissioner sans l'axe d'inclinaison (jamais utilisé), Literata figée en graisse 400, les deux réduites au latin. 93 Ko en tout, et un rendu identique au pixel près sur huit zones comparées. |

### Hiérarchie visuelle
- **Ce qui attire l'œil d'abord :** le titre, puis l'enseigne qui se pose sur la façade. C'est le bon ordre : la promesse, puis le lieu.
- **Parcours de lecture :**
  1. la promesse, le téléphone et la façade ;
  2. l'orthodontie cachée, leur soin le plus singulier, prouvée par un vrai cas photographié côté langue ;
  3. les soins, en mots simples, avec les définitions de leur propre dictionnaire ;
  4. les gens : huit visages sur la même haie, et la biographie de chacun ;
  5. ce que les patients remarquent : cinq engagements, chacun avec un vrai avis ;
  6. les prix : assurances, paiement, financement, avant tout soin ;
  7. la visite : l'enseigne recomposée en bardage, la porte, l'adresse, la demande.

  Chaque section répond à la question que la précédente fait naître : « c'est où ? », « qu'ont-ils de différent ? », « que font-ils ? », « qui vais-je voir ? », « est-ce que ça se passe bien ? », « combien ? », « comment y aller ? ».
- **Mise en avant :**
  - un seul bleu, celui des lettres de la façade, pour les titres et tout ce qui agit ;
  - le vert de la haie, seulement pour l'équipe, et le vert feuille pour la personne choisie ;
  - l'italique de Literata, seulement pour la parole des patients et les définitions : on sait toujours qui parle.

### Cohérence
| Élément | Constat | Correction |
|---------|---------|------------|
| Verbes d'action | « Request a visit » dans l'en-tête, l'accueil, le menu, la barre d'appel et le titre du formulaire ; « Call 239.300.4635 » partout où l'on peut appeler. | Rien à changer. |
| Voix | Le site parle du cabinet à la troisième personne (« The practice bills your insurance for you »), sauf le titre, qui reprend leur propre phrase. L'introduction du formulaire disait « Tell us ». | Corrigé : « Choose what it's about and say when suits you. The office will get back to you to set a time. » Elle décrit aussi ce qu'on fait dans le formulaire (choisir, puis écrire). |
| Têtes de section | Titre à gauche, chapô à droite, sur la même grille (7/5) de section en section. | La biographie de l'équipe suit maintenant la même grille. |
| Rayons | Photos à 14-16 px, formulaire à 18 px, boutons et choix en pilule ; les portraits n'en ont pas, pour que la haie reste continue d'un visage à l'autre. | Rien à changer. |
| Typographie | Commissioner pour tout le texte (l'axe FLAR donne l'évasement des lettres de l'enseigne, utilisé pour le nom du cabinet et l'enseigne) ; Literata italique pour la parole des patients et les définitions. | Rien à changer. |
| Contours de focus | Bleu sur les fonds clairs, vert feuille sur la haie ; dans le pied de page bleu nuit, le bleu ne se voyait pas. | Corrigé : contour blanc dans le pied de page. |

### L'ouverture, image par image
Mesurée à intervalles fixes après son vrai départ (police et photo prêtes), sur ordinateur et sur téléphone :
- **0 à 0,5 s :** l'enseigne seule, en grand, sur le blanc : « 785 », le nom, le numéro, « JOSEPH A CASTOR DMD » ;
- **0,5 à 1,4 s :** la façade apparaît autour d'elle ; les lettres reposent sur la plaque, sans se dédoubler, et foncent vers le ton de l'ombre du porche ;
- **1 à 1,8 s :** la caméra recule pour de bon, on découvre le porche, le banc, la maison ;
- **1,7 à 2,4 s :** l'enseigne du site se fond dans la vraie, à leur taille finale.

Elle ne se joue qu'une fois, en haut de la page. Arrivé par un lien vers une section, ou avec « réduire les animations », on voit directement la photo.

### Accessibilité
- **Contrastes :** tout le texte passe de 6,45:1 à 17,19:1 (détail dans `ACCESSIBILITE.md`).
- **Cibles tactiles :** 44 px partout sur téléphone, sauf les mots expliqués et les liens dans des phrases (exemptés, 26-27 px).
- **Lisibilité :**
  - texte courant à 17 px, interligne 1,6, lignes de 44 à 70 caractères ;
  - les plus petites mentions (13 px, pied de page) restent à 8:1.

### Ce qui marche bien
- **L'ouverture :** leur propre enseigne, composée en vraies lettres, se pose sur leur façade. Rien n'est inventé ni retouché : à la fin, c'est la vraie enseigne de la photo qu'on voit.
- **L'orthodontie cachée prouvée par leur cas :** avant, pendant, cinq mois, photographié du seul côté où le fil se voit. Un repère « the wire » montre le fil, la ligne du temps se trace d'une étape à l'autre.
- **Les mots expliqués :** quinze termes (lingual, scaling, crown, implant…) ouvrent leur définition, citée telle quelle depuis le dictionnaire dentaire de leur site. Le site tient la promesse de son titre de section : « in plain words ».
- **L'équipe :** huit portraits recadrés au même écart entre les yeux et à la même hauteur, qui se suivent sur la même haie. On choisit un visage, sa biographie s'affiche.
- **Les avis comme preuves :** chaque engagement (« He shows you, then explains. », « Nothing you don't need. »…) est suivi d'un vrai avis qui le dit, avec son prénom, sa source et sa date.
- **La visite :** l'enseigne du porche recomposée en bardage, puis la photo de la porte : « The door is on the porch, next to the white bench. » On sait où entrer avant d'arriver.

### Recommandations prioritaires
1. **Un vrai envoi du formulaire :** aujourd'hui, il prépare un courriel dans la messagerie du visiteur. Branché à un service de formulaires, le bouton pourrait dire « Send my request » (voir « Textes d'interface »).
2. **Les horaires :** leur site n'en donne pas, et les annuaires se contredisent. À ajouter dans la visite et dans les données structurées dès qu'ils sont confirmés par le cabinet.
3. **Des photos du cas en meilleure définition :** les originaux font 640 px, ce qui limite le cas à 352 px de large. Avec des fichiers plus grands, les trois étapes pourraient prendre toute la largeur.
4. **Le logo :** le site utilise un logotype typographique (le nom en petites capitales évasées, comme les lettres du porche). À valider avec le client, ou à remplacer par son logo officiel en vectoriel.

---

## Textes d'interface

Contexte :
- lecteurs : familles, retraités et actifs du centre de Naples qui cherchent un dentiste, des patients qui veulent redresser leurs dents sans que cela se voie, des parents qui préparent la première visite d'un enfant ;
- ton : calme, précis, rassurant ; on explique, on ne vend pas ;
- langue : anglais (américain) ;
- vocabulaire du métier gardé, mais toujours expliqué (les mots expliqués).

### Textes retenus
- **Bouton principal (en-tête, accueil, menu, barre d'appel) :** « Request a visit ». Le titre du formulaire reprend les mêmes mots.
- **Téléphone :** « Call 239.300.4635 » ; dans la barre d'appel du téléphone, « Call ».
- **Urgences :** « In pain? Call. Every attempt will be made to see you that day. » (leur formule, sous les boutons de l'accueil).
- **Sujets du formulaire :** « A cleaning or checkup », « Straightening my teeth », « Crowns, veneers or whitening », « Implants or dentures », « My child's first visit », « Something hurts ».
- **Note quand quelque chose fait mal :** « If it hurts, the fastest way is the phone: call 239.300.4635. Every attempt will be made to see you today. »
- **Envoi :** « Email my request ».
- **Note sous le bouton :** « This opens your email app with the request written out, addressed to Castordentalassociates@gmail.com. Rather talk? 239.300.4635. »
- **Erreurs :**
  - « Enter your name so the office knows who to ask for. » ;
  - « Enter a phone number with at least 10 digits. » ;
  - « This email address looks incomplete. Check it, or leave the field empty. »
- **Confirmation :** « Your email app should now be open with the request. Not seeing it? Call 239.300.4635. »
- **Soins :** « Open a treatment to read what it involves. A word with a dotted line opens its definition, taken from the practice's own dental dictionary. »
- **Définition :** le mot, sa définition, puis « From the practice's dental dictionary ».

### Variantes étudiées pour le bouton principal
| Option | Texte | Ton | Quand l'utiliser |
|--------|-------|-----|------------------|
| A (retenue) | Request a visit | Juste : on demande, le cabinet rappelle pour fixer l'heure | Tant que le rendez-vous se fixe par téléphone |
| B | Book an appointment | Promet une réservation immédiate | Seulement avec un vrai agenda en ligne (heures libres, confirmation) |
| C | Send my request | Dit ce qui se passe à l'envoi | Pour le bouton du formulaire, s'il est branché à un vrai service d'envoi |

### Pourquoi
- Le bouton principal dit ce que le visiteur peut vraiment faire, et garde le même nom jusqu'au formulaire.
- « Email my request » dit exactement ce qui va se passer : la messagerie s'ouvre. La note juste dessous évite la surprise.
- Les urgences passent par le téléphone, partout : c'est ce que promet le cabinet.
- Les erreurs disent quoi corriger, sans s'excuser, et le courriel n'est jamais exigé.

### Notes pour une traduction
- Amanda parle espagnol : une version espagnole servirait une partie des patients de Naples. Prévoir +20 à 30 % de longueur ; l'en-tête du téléphone est déjà serré à 320 px.
- « Stealth Orthodontics™ » est leur marque ; Invisalign®, Six Month Smiles®, Lucid-Lok®, SmartTrack® et CareCredit sont des marques de tiers : à garder tels quels.
- Les définitions viennent de leur dictionnaire : à traduire avec un dentiste, pas mot à mot.
- Les numéros suivent le format américain (239.300.4635) ; l'adresse aussi (785 Central Avenue, Naples, FL 34102).
