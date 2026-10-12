## Revue de design : nouveau site One Place Wellness

Revue faite sur des captures écran par écran, en défilant pour de vrai :
- ordinateur : 1440 × 900 et 1180 × 900 ;
- téléphone : 390 × 844 ;
- contrôles à 320, 700, 960 et 1100 px ;
- l'ouverture image par image (horloge des animations arrêtée et calée), sur ordinateur et sur téléphone ;
- le balayage de la ligne du temps, en temps réel.

Stade : version finale. Tout ce qui est marqué « corrigé » est fait dans cette version.

### Impression générale
On comprend en deux secondes chez qui l'on est et ce qui la distingue :
- leur propre phrase en très grand, en Bodoni : « Look as healthy and happy as you feel. » ;
- juste dessous, ce qui fait la différence : une chirurgienne plasticienne qui a fait des liftings pendant plus de 25 ans, et qui travaille sans chirurgie ;
- le téléphone et la consultation offerte à portée de main.

Le moment dont on se souvient est la lumière : une fenêtre de soleil se pose sur la page pendant que les ombres des lettres raccourcissent. Il porte l'idée du site (elle traite les ombres, pas le volume) sans une seule image inventée.

Le plus gros défaut de la première version était le vide de l'accueil ; le plus gros risque, des étiquettes de la ligne du temps qui se chevauchaient ou disaient plus que leurs pages.

### Utilisabilité
| Constat | Gravité | Correction |
|---------|---------|------------|
| Accueil : 270 px vides entre le titre et le texte, sur ordinateur. Sans photo de la docteure ni du cabinet, la page paraissait inachevée. | 🟡 Moyen | Corrigé : une fenêtre de lumière (quatre carreaux aux bords flous) se pose dans ce vide, derrière la fin du titre. C'est elle qui bouge à l'ouverture : partie basse et étirée, elle vient se placer de face pendant que les ombres des lettres raccourcissent. |
| Accueil : la première fenêtre de lumière était trop grande et trop floue ; on n'en voyait que des morceaux, et les boutons tombaient sur un bord de carreau. | 🟢 Mineur | Corrigé : une fenêtre plus petite et plus nette, entière, à droite du titre, au-dessus des boutons. Au téléphone, elle couvre le titre et l'espace dessous, un peu plus nette encore. |
| Ligne du temps : des étiquettes se chevauchaient (« Complimentary booster at 2 weeks » sur « Lasts 3 to 6 months ») ou débordaient sur le nom du soin, selon la largeur. | 🟡 Moyen | Corrigé : chaque étiquette au-dessus ou au-dessous du trait, alignée sur le début ou la fin de ce qu'elle désigne. Vérifié automatiquement à 19 largeurs (voir `ACCESSIBILITE.md`). |
| Ligne du temps, fillers : un pointillé fléché prolongeait le trait au-delà de 18 mois, comme si le Restylane durait plus. Leurs pages disent « up to 18 months » pour le Restylane, et que les fillers durent souvent plus que les 6 à 12 mois qu'on imagine. | 🟡 Moyen | Corrigé : le trait s'arrête à 18 mois, sur un point (« Restylane: up to 18 months »). Il dépasse déjà nettement le crochet « What most people expect: 6 to 12 months » : c'est ce que dit leur page. La phrase « they can last much longer » reste dans le texte du soin, à leur compte. |
| Ligne du temps : le signe + de chaque soin était centré sur la ligne, le nom du soin collé en haut ; sur deux lignes (« Botox and Microbotox »), les deux ne se répondaient pas. | 🟢 Mineur | Corrigé : le nom et le signe sont centrés ensemble sur la piste. |
| Cas : seize lignes, 2 400 px de liste sur ordinateur ; et les six premiers cas de la galerie étaient tous des fillers. | 🟡 Moyen | Corrigé : six cas d'abord, choisis pour montrer chaque soin (le cas photographié en premier, puis le front au Xeomin, la mâchoire, le threadlift, les bandes du cou, le laser), puis « Show all 16 cases ». Un filtre affiche toujours tous les cas de son soin. |
| Les ombres : la légende de la règle disait « at the scale of this ruler », alors que la règle est agrandie. | 🟢 Mineur | Corrigé : « Three to five millimeters, enlarged: the depth of shadow Dr. Fox softens. » |
| Les ombres, sur ordinateur : la colonne du cas s'arrêtait à mi-hauteur ; en lisant le texte, la droite de l'écran restait vide. | 🟢 Mineur | Corrigé : le cas reste en vue à côté du texte pendant qu'on le lit. |
| La docteure, sur ordinateur : sous le titre, la moitié gauche du fond prune restait vide pendant qu'on lisait les faits. | 🟢 Mineur | Corrigé : le titre reste en vue à côté du texte. |
| Photo du cas : l'image de la galerie réunit l'avant et l'après, séparés par un filet bleu, avec un liseré blanc sur les bords. | 🟢 Mineur | Corrigé (`tools/images.py`) : deux tirages de même taille (292 × 225, leur taille d'origine), sans le filet ni le liseré, posés côte à côte sur un passe-partout couleur peau. |
| Cartes : « Myrtle Terrace » passait sous l'anneau du cabinet, « Seagate Drive » touchait une rue, et au téléphone « Tamiami Trail North (US 41) » croisait une bretelle. | 🟢 Mineur | Corrigé (`tools/map.py`) : aucun nom ne croise plus un trait. |

### Hiérarchie visuelle
- **Ce qui attire l'œil d'abord :** le titre dans la lumière, puis le texte et les deux boutons. C'est le bon ordre : leur promesse, qui la tient, comment la joindre.
- **Parcours de lecture :**
  1. la promesse, la chirurgienne, le téléphone ;
  2. les ombres : la phrase la plus singulière de leur site (3 à 5 mm d'ombre, cinq ans de plus), une règle, et un vrai cas ;
  3. les soins, comparables d'un coup d'œil sur une seule ligne du temps : le temps au fauteuil, le retour à la vie normale, l'arrivée des résultats, leur durée ;
  4. les cas : ce que chaque patiente demandait, ce qui a été fait, en quelle quantité ;
  5. la docteure : ce que 25 ans de liftings lui apprennent sur un visage ;
  6. la visite : la carte des vraies rues, les horaires, la demande de consultation.

  Chaque partie répond à la question que la précédente fait naître : « qu'a-t-elle de différent ? », « que fait-elle, et combien de temps ça prend ? », « est-ce que ça marche ? », « qui est-elle ? », « comment la voir ? ».
- **Mise en avant :**
  - un seul violet, celui du marqueur chirurgical, pour ce qui agit et ce qui mesure (boutons, liens, traits de durée, graduations) ;
  - le prune, seulement pour la docteure et le pied de page ;
  - l'italique de Bodoni, seulement pour ce que demandent ou disent les patientes (la demande de chaque cas, telle que la galerie la rapporte ; « why do you look so young? ») : on sait toujours de qui vient la phrase.

### Cohérence
| Élément | Constat | Correction |
|---------|---------|------------|
| Verbes d'action | « Request a consultation » dans l'en-tête, le menu et la barre d'appel ; « Request a complimentary consultation » dans l'accueil et en titre du formulaire ; « Call 239-262-8585 » partout où l'on peut appeler. | Rien à changer : le mot « complimentary » apparaît là où il y a la place. |
| Voix | Le site parle de la docteure à la troisième personne (« Dr. Fox explains where each suture will go »), sauf le titre, qui est leur phrase. Les demandes des patientes sont en italique. | Rien à changer. |
| Têtes de section | Titre à gauche, chapô décalé à droite, sur la même grille de douze colonnes de section en section. | Rien à changer. |
| Rayons | Boutons, filtres et choix du sujet en pilule ; formulaire et passe-partout à 6-8 px ; photos et carte à angles vifs. | Rien à changer : les arrondis suivent la hiérarchie. |
| Typographie | Bodoni Moda pour les titres, les noms des soins et des cas, les demandes ; Hanken Grotesk pour le texte, l'interface, les étiquettes de la ligne du temps et les doses (chiffres tabulaires). | Rien à changer. |
| Filets | Seulement là où ils mesurent (règle, axe du temps, graduations) ou séparent des données (cas, coordonnées, faits de la docteure). | Rien à changer. |
| Contours de focus | Violet sur les fonds clairs, lilas sur le prune. | Rien à changer. |

### L'ouverture, image par image
Mesurée à intervalles fixes, l'horloge des animations arrêtée et calée, sur ordinateur et sur téléphone :
- **0 à 0,5 s :** la lumière rasante : chaque lettre du titre traîne une ombre longue vers la droite, nette contre le trait et floue plus loin, comme des lettres découpées posées sur la page au soleil bas ; la lumière n'est qu'une bande pâle, basse, en diagonale ;
- **0,9 à 1,7 s :** la fenêtre glisse et se redresse, les ombres raccourcissent ;
- **1,7 à 2,6 s :** la fenêtre se pose à droite du titre, en quatre carreaux ; il ne reste sous les lettres qu'une ombre courte et douce, celle d'une lumière de face ;
- **après 2,95 s :** plus rien ne bouge.

Elle ne se joue qu'une fois, en haut de la page. Arrivé par un lien vers une section, ou avec « réduire les animations », on voit directement l'état final.

### Accessibilité
- **Contrastes :** tout le texte passe de 5,33:1 à 16,39:1 (détail dans `ACCESSIBILITE.md`).
- **Cibles tactiles :** 44 px partout sur téléphone, sauf quatre liens dans des phrases (exemptés).
- **Lisibilité :**
  - texte courant à 17-18 px, interligne 1,6, lignes de 48 à 60 caractères ;
  - les plus petites mentions (13 px : axe du temps, crédit de la carte, pied de page) restent au-dessus de 6,7:1.
- **Chargement :** Lighthouse 100 en accessibilité, bonnes pratiques et SEO, sur ordinateur et sur téléphone. Le plus grand élément (le titre) s'affiche en 0,39 s au téléphone ralenti (processeur ralenti 4 fois, 4G), 0,23 s sur ordinateur ; aucun décalage de mise en page (CLS 0).

### Ce qui marche bien
- **La lumière :** l'idée du site (« light, not volume ») tient dans un seul mouvement, une fois, sans image inventée. Le titre en Bodoni est fait pour ça : ses pleins prennent la lumière, ses déliés sont le millimètre.
- **La ligne du temps :** six soins comparables d'un coup d'œil, sur une échelle par paliers (15 minutes, 1 heure, 1 jour… 2 ans), avec leurs vraies durées. Un curseur la balaie une fois : on voit le temps passer. Ce qui était dispersé sur six pages du site actuel tient sur un écran.
- **Les cas :** l'âge, la demande en italique, le produit, la quantité en cc et l'endroit. C'est leur meilleure preuve, et elle était cachée dans les légendes de leur galerie.
- **La carte :** dessinée d'après les vraies rues d'OpenStreetMap, au violet du marqueur pour le cabinet ; on voit qu'il est juste à l'ouest du Tamiami Trail, au sud de Pine Ridge Road.
- **Une réservation qui marche :** le bouton du site actuel menait à une prise de rendez-vous désactivée. Le nouveau propose l'appel et une demande écrite, qui marchent tous les deux.

### Recommandations prioritaires
1. **Des photos réelles :** demander au cabinet les originaux des cas de la galerie (en grande taille), un portrait de la Dre Fox et une ou deux photos du cabinet. Le site est prêt à les recevoir : chaque cas peut prendre ses deux tirages sur le même passe-partout, et la docteure une photo à côté de son titre. Aujourd'hui, la seule photo récupérable est le premier cas, en 601 × 225 px (voir `ANALYSE.md`).
2. **Les horaires :** l'accueil et la fiche de l'entreprise (leur `llms.txt`) disent du lundi au jeudi, de 9 h à 16 h ; la page Contact dit du lundi au vendredi, de 9 h à 17 h (horaires par défaut de GoDaddy). Le site reprend les premiers ; à confirmer par le cabinet.
3. **Un vrai envoi du formulaire :** aujourd'hui, il prépare un courriel dans la messagerie du visiteur. Branché à un service de formulaires, le bouton pourrait dire « Send my request ».
4. **La réservation en ligne :** si le cabinet réactive AestheticsPro, ajouter « Book online » à côté de l'appel, dans l'accueil et dans la visite.
5. **Le logo :** le site utilise un logotype typographique (le nom en Bodoni, le nom de la docteure dessous). À valider avec le client, ou à remplacer par son logo en vectoriel.

---

## Textes d'interface

Contexte :
- lectrices et lecteurs : surtout des femmes de Naples, de 40 à 75 ans, qui veulent paraître reposées sans avoir l'air « refaites » ; aussi des hommes (la page Botox les cite) ;
- état d'esprit : prudent ; on se renseigne avant de confier son visage ;
- ton : calme, précis, chaleureux ; on explique, on ne vend pas, on attribue les avis à la docteure ;
- langue : anglais (américain).

### Textes retenus
- **Bouton principal (en-tête, menu, barre d'appel) :** « Request a consultation » ; dans l'accueil et en titre du formulaire, « Request a complimentary consultation ».
- **Téléphone :** « Call 239-262-8585 » ; dans la barre d'appel du téléphone, « Call ».
- **Ligne du temps :** « How long you're in the chair, when you're back to your day, when results show, and how long they last. Open a treatment to read what it treats and how Dr. Fox does it. »
- **Légende de la ligne du temps :** « In the chair », « Recovery », « Results », « How long it lasts ».
- **Note sous la ligne du temps :** « Durations from the practice's own pages. Times vary with the area treated and how each patient responds. »
- **Filtres :** « All 16 », « Fillers 10 », « Botox and Xeomin 3 », « Threadlift 2 », « Laser 1 » ; annonce : « Showing 3 Botox and Xeomin cases. »
- **Suite des cas :** « Show all 16 cases ».
- **Sujets du formulaire :** « Fillers », « Botox or Microbotox », « Threadlift », « ThermiSmooth », « MicroLaser Peel », « Medical skincare », « Not sure yet ».
- **Envoi :** « Email my request ».
- **Note sous le bouton :** « This opens your email app with the request written out, addressed to Oneplacewellness@gmail.com. Rather talk? Call 239-262-8585. »
- **Erreurs :**
  - « Enter your name so the office knows who to ask for. » ;
  - « Enter a phone number with at least 10 digits. » ;
  - « This email address looks incomplete. Check it, or leave the field empty. »
- **Confirmation :** « Your email app should now be open with the request. Not seeing it? Call 239-262-8585. »

### Variantes étudiées pour le bouton principal
| Option | Texte | Ton | Quand l'utiliser |
|--------|-------|-----|------------------|
| A (retenue) | Request a consultation | Juste : on demande, le cabinet rappelle pour fixer l'heure | Tant que le rendez-vous se fixe par téléphone ou par courriel |
| B | Book a complimentary consult | Promet une réservation immédiate | Seulement si la réservation en ligne (AestheticsPro) est réactivée |
| C | Send my request | Dit ce qui se passe à l'envoi | Pour le bouton du formulaire, s'il est branché à un vrai service d'envoi |

### Ce qui a changé par rapport au site actuel
- Les coquilles sont corrigées : « Canidates », « Restylene », « Lawlije » (jawline), « Poly-L-Latic », « complementary » (complimentary), « retina » (retinol), et la phrase inachevée sur le collagène.
- Les superlatifs (« safest », « best results available ») et les promesses qu'on ne peut pas tenir (des fillers de lèvres qui dureraient « des décennies », le Botox contre les migraines) ne sont pas repris.
- Les durées du fabricant et celles de la docteure sont distinguées : « up to 2 years, according to the maker; longer for many of Dr. Fox's patients ».
- Les cas reprennent la demande de chaque patiente telle que la galerie la rapporte (« She felt she always looked angry. »), sans nom ni prénom.

### Pourquoi
- Le bouton principal dit ce que le visiteur peut vraiment faire, et garde le même nom jusqu'au formulaire.
- « Email my request » dit exactement ce qui va se passer : la messagerie s'ouvre. La note juste dessous évite la surprise.
- Les étiquettes de la ligne du temps sont des faits courts, avec leurs chiffres ; le détail et les nuances (« Times vary… ») sont dans le texte du soin et sous la ligne.
- Les erreurs disent quoi corriger, sans s'excuser, et le courriel n'est jamais exigé.

### Notes pour une traduction
- Une version espagnole servirait une partie des patients de Naples. Prévoir +20 à 30 % de longueur : les étiquettes de la ligne du temps sont déjà serrées à 1 100 px ; au besoin, les passer en liste plus tôt.
- Botox, Xeomin, Juvederm (Voluma XC, Ultra XC, Volbella XC), Restylane, Radiesse, Sculptra, Revance, Silhouette InstaLift®, ThermiSmooth, Sciton, Obagi et SkinCeuticals sont des marques : à garder telles quelles.
- Les doses restent en cc, comme dans la galerie ; les numéros et l'adresse suivent le format américain (239-262-8585 ; 827 Myrtle Terrace, Naples, FL 34103).
