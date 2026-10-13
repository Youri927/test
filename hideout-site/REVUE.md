## Revue de design : nouveau site Hideout Boutique

Revue faite sur des captures écran par écran, en défilant pour de vrai :
- ordinateur : 1440 × 900 et 1180 × 900 ;
- téléphone : 390 × 844 ;
- contrôles automatiques à 19 largeurs, de 320 à 1920 px ;
- l'ouverture image par image (horloge des animations arrêtée et calée), sur ordinateur et sur téléphone ;
- les états : famille survolée et ouverte, préoccupation choisie, filtre des résultats, visionneuse, menu du téléphone.

Stade : version finale. Tout ce qui est marqué « corrigé » est fait dans cette version.

### Impression générale
On comprend en deux secondes chez qui l'on est :
- leur propre phrase, en très grand et en large : « Come hide out with us. » ;
- au-dessus, une vraie photo de leur cabinet : Lina, l'infirmière praticienne, en plein soin des lèvres, vue dans le miroir rond de sa salle ;
- dessous, ce qui les distingue : depuis 2017, une équipe médicale, des esthéticiennes diplômées et des artistes cils et maquillage permanent sous le même toit ;
- « Book now » et le téléphone à portée de main.

Le moment dont on se souvient est le cadre du logo. Il apparaît tel quel au centre, son nom s'efface, une photo s'ouvre dedans, puis il s'agrandit jusqu'à devenir la fenêtre de l'accueil. Leur seul signe graphique devient le seul dispositif du site : on le retrouve sur la photo de chaque famille de soins, autour de l'équipe et sur leur adresse.

Les plus gros défauts de la première version étaient dans cette ouverture : le nom imprimé sur la photo pendant qu'elle s'ouvrait, et une page qui se décalait pendant l'animation.

### Utilisabilité
| Constat | Gravité | Correction |
|---------|---------|------------|
| Ouverture : pendant 300 ms, le nom « HIDEOUT BOUTIQUE » restait imprimé sur la photo qui s'ouvrait dans le cadre, comme un filigrane. | 🟡 Moyen | Corrigé : le nom s'efface d'abord (0,6 à 0,82 s) ; la photo s'ouvre ensuite dans le cadre resté seul (0,7 à 1 s). Aucun texte ne passe plus sur la photo. |
| Ouverture : la page se décalait (CLS 0,11). Le cadre grandissait en changeant de place et de taille, et le titre s'élargissait, ce qui repoussait le texte. | 🟡 Moyen | Corrigé : le cadre est agrandi par transformation, son trait reste net ; le titre est posé d'emblée à sa largeur et découvert par un masque. CLS 0, mesuré sur ordinateur et sur téléphone. |
| Ouverture : au téléphone ralenti, le texte de l'accueil ne comptait comme affiché qu'à la fin de l'animation, à 2,5 s, parce qu'il apparaissait en fondu. Un léger zoom sur la photo retardait aussi l'image. | 🟡 Moyen | Corrigé : plus de fondu ni de zoom ; la photo et le texte sont découverts par des masques. Le contenu principal est affiché à 0,32 s au téléphone ralenti, 0,37 s sur ordinateur. |
| Réservation : le script de Boulevard était chargé avec la page. Il déposait des cookies tiers et ralentissait le chargement (Lighthouse, bonnes pratiques : 77). | 🟡 Moyen | Corrigé : il n'est chargé que si l'on s'approche d'un bouton « Book now » (survol ou focus), sur ordinateur, et leur fenêtre de réservation s'ouvre comme sur leur site actuel. Au téléphone, « Book now » ouvre leur page Boulevard dans un nouvel onglet. Bonnes pratiques : 100. |
| Clavier : la fenêtre de Boulevard, fermée et invisible, prenait quand même le focus. | 🟡 Moyen | Corrigé : elle sort de la tabulation tant qu'elle est fermée. |
| Téléphone : la barre « Book now / Call » n'apparaissait pas au milieu de la page. | 🟢 Mineur | Corrigé : elle apparaît dès que les boutons de l'accueil quittent l'écran, et se retire sur la visite, où les mêmes boutons sont déjà là. |
| Téléphone : des noms Instagram de l'équipe dépassaient de leur colonne entre 320 et 375 px. | 🟢 Mineur | Corrigé : ils passent à la ligne. Aucun débordement sur 19 largeurs, familles ouvertes. |
| Téléphone : dans le pied de page, le courriel se coupait en « HideoutBoutique@gmai / l.com ». | 🟢 Mineur | Corrigé : il se coupe avant l'arobase, « HideoutBoutique / @gmail.com ». |
| Pied de page : la phrase « Where results and relaxation collide. » prenait le style des petits textes. | 🟢 Mineur | Corrigé : elle garde sa taille de titre. |
| Carte : le nom « Alliance for the Arts » chevauchait une rue. | 🟢 Mineur | Corrigé (`tools/map.py`) : il est retiré ; il reste « Broadway Palm » comme repère, et aucun nom ne croise plus un trait. |
| Logo : refait en vectoriel, le sous-titre « BOUTIQUE & MED SPA » était trop grand et un peu trop bas. | 🟢 Mineur | Corrigé (`tools/logo.py`) : tailles et positions mesurées sur leur fichier. |

### Hiérarchie visuelle
- **Ce qui attire l'œil d'abord :** la photo dans le cadre doré, puis le titre, puis « Book now ». C'est le bon ordre : où l'on est, leur invitation, comment venir.
- **Parcours de lecture :**
  1. qui ils sont : l'accueil ;
  2. ce qu'ils font : 55 soins en cinq familles, avec leur nombre, ou à partir de ce qui gêne (rides, acné, taches) ;
  3. la preuve : 38 avant/après de leurs clientes, chacun avec son soin et sa praticienne quand elle signe ;
  4. qui s'occupe de vous : l'équipe, ses diplômes, trois avis ;
  5. ce que ça coûte : les abonnements, leurs prix, le financement ;
  6. comment venir : la carte, l'adresse, les règles avant la visite.

  Chaque partie répond à la question que la précédente fait naître : « que font-ils ? », « est-ce que ça marche ? », « qui me soigne ? », « combien ? », « où et comment ? ».
- **Mise en avant :**
  - l'or du logo, seulement pour le cadre, jamais pour du texte sur fond clair ;
  - l'encre pour ce qui agit : boutons, filtres, curseur ;
  - l'expresso pour l'équipe et le pied de page, le rose poudré pour les abonnements : deux changements de fond, deux moments différents.

### Cohérence
| Élément | Constat | Correction |
|---------|---------|------------|
| Verbes d'action | « Book now » dans l'en-tête, le menu, l'accueil, la visite et la barre du téléphone ; « Call 239-936-0758 » dans l'accueil et le menu, « Call » dans la barre. | Rien à changer : un seul mot pour réserver, partout. |
| Voix | Le cabinet parle en « we » (« we'll tell you at your consultation ») ; les avis sont entre guillemets, signés d'un prénom et d'une initiale. | Rien à changer. |
| Têtes de section | Titre à gauche, chapô à droite, sur la même grille de section en section ; empilés au téléphone. | Rien à changer. |
| Rayons | Boutons et filtres en pilule ; photos et carte à angles vifs ; portraits en médaillon ovale, comme sur leur site. | Rien à changer : les formes suivent la hiérarchie. |
| Typographie | Archivo seule (le logo est un dessin) : largeur 125 pour les titres, 100 pour le texte ; les noms des familles s'élargissent au survol, comme les capitales espacées du logo. | Rien à changer. |
| Faits des soins | Toujours les mêmes étiquettes : « Session », « Downtime », « Series », « Lasts », « By ». | Rien à changer. |
| Le cadre | Toujours le même dessin : l'or du logo, un trait de 2 px, des pattes à 23,6 % de la hauteur, le milieu ouvert. Quatre endroits seulement : l'accueil, la photo des familles, l'équipe, l'adresse. | Rien à changer. |
| Contours de focus | 2 px d'encre sur les fonds clairs, d'or sur l'expresso et dans la visionneuse (7:1). | Rien à changer. |

### L'ouverture, image par image
Mesurée à intervalles fixes, l'horloge des animations arrêtée et calée, sur ordinateur et sur téléphone :
- **0 à 0,5 s :** le logo apparaît au centre ; son cadre se trace du milieu vers les coins ;
- **0,6 à 0,82 s :** le nom s'efface, le cadre reste seul ;
- **0,7 à 1 s :** la photo s'ouvre dans le cadre, à partir d'un trait à mi-hauteur, comme un volet ;
- **1 à 2 s :** le cadre s'agrandit jusqu'à la photo, lent au départ, posé à l'arrivée ; son trait s'affine de l'épaisseur du logo à 2 px ;
- **1,1 à 2 s :** le titre, puis le texte et les boutons, puis la légende, se découvrent de gauche à droite ; l'en-tête arrive à 1,45 s ;
- **après 2 s :** plus rien ne bouge.

Elle ne se joue qu'une fois, en haut de la page. Une touche, un clic ou un défilement l'achèvent aussitôt. Arrivé par un lien vers une section, ou avec « réduire les animations », on voit directement l'état final.

### Accessibilité
- **Contrastes :** le texte courant passe de 5,31:1 (sur le rose poudré) à 17,11:1 ; les plus petites mentions de la carte sont à 4,82:1 (détail dans `ACCESSIBILITE.md`).
- **Cibles tactiles :** 44 px pour tous les boutons du téléphone. Le logo (29 px de haut) et les noms Instagram de l'équipe (36 px) restent au-dessus du minimum de 24 px ; onze liens sont dans des phrases.
- **Lisibilité :** texte courant à 17 px, interligne 1,6, lignes de moins de 70 caractères ; aucun texte coupé avec un espacement élargi.
- **Chargement :** Lighthouse 100 en accessibilité, bonnes pratiques, SEO et navigation par agents, sur ordinateur et sur téléphone. Le contenu principal s'affiche en 0,37 s sur ordinateur, 0,32 s au téléphone ralenti (processeur 4 fois plus lent, 4G lente) ; aucun décalage de mise en page (CLS 0).

### Ce qui marche bien
- **Le cadre :** leur logo devient le site. Il ouvre la page, désigne la photo de la famille qu'on survole, se trace autour de l'équipe et se pose sur leur adresse. Rien n'est ajouté à leur identité ; tout en vient.
- **Les soins :** plus de 40 pages et un menu de 40 entrées deviennent cinq familles, avec les faits utiles (durée, éviction, séances) écrits pareil partout. Les trois pages « par préoccupation » de leur site deviennent trois boutons qui soulignent les soins concernés.
- **Les résultats :** seulement les leurs, 38 avant/après signés, triables par famille, avec une visionneuse au clavier. Les avant/après de fabricants mêlés à leurs galeries ne sont pas repris.
- **L'équipe :** quinze personnes nommées avec leurs diplômes, treize avec leur portrait, dont un directeur médical, une infirmière praticienne et une infirmière. C'est leur premier argument face aux instituts.
- **Beauty Bank :** un curseur calcule le crédit qu'on accumule (« $594 to spend, at $99 a month »). L'abonnement le plus singulier du cabinet se comprend en un geste.
- **La réservation :** leur Boulevard, comme aujourd'hui, sans alourdir la page.

### Recommandations prioritaires
1. **Valider le logo :** il est redessiné en vectoriel d'après leur fichier, avec la police Lato. À comparer avec leurs fichiers d'origine, ou à remplacer par leur logo vectoriel s'ils l'ont.
2. **Des photos manquantes :** un portrait du Dr. Davek Sharma et de Chloe Waddel (aujourd'hui nommés sans photo), et une photo d'un soin laser dans leurs salles, qui remplacerait l'avant/après dans le cadre de « Skin and lasers ».
3. **Les horaires :** le site dit « By appointment only », comme le leur. S'ils ont des horaires fixes, les ajouter à la visite et aux données structurées.
4. **Les pages à garder en ligne :** les consignes avant et après les soins, les règles d'annulation et la boutique restent sur leur site actuel ; le nouveau site y renvoie. À la mise en ligne, garder ces adresses ou les rediriger.
5. **AviClear :** une page existe sur leur site, mais le soin n'apparaît ni dans le menu ni dans la liste. Il n'est pas repris ; à ajouter si le cabinet le propose toujours.

---

## Textes d'interface

Contexte :
- lectrices et lecteurs : surtout des femmes de Fort Myers, Cape Coral, Estero, Bonita Springs et Naples, de 20 à 60 ans ; des habituées des soins du visage et des cils, et des personnes qui envisagent une première injection ; aussi des hommes (la micropigmentation du cuir chevelu, les avis le montrent) ;
- état d'esprit : curieux pour les soins de beauté, prudent pour les injections et les lasers ; on veut voir les personnes et de vrais résultats ;
- ton : chaleureux, direct et honnête, comme leur article sur le Botox (« If your concerns can be addressed conservatively, we'll say so ») ; pas de superlatifs ;
- langue : anglais (américain).

### Textes retenus
- **Bouton principal (en-tête, menu, accueil, visite, barre du téléphone) :** « Book now ».
- **Téléphone :** « Call 239-936-0758 » ; dans la barre du téléphone, « Call » ; dans l'en-tête de l'ordinateur, le numéro seul.
- **Préoccupations :** « Start from what bothers you », puis « Lines and wrinkles », « Acne », « Dark spots and discoloration ».
- **Réponse à un choix :** « For acne: 10 treatments to start with. », la liste par famille (chaque famille ouvre la sienne), puis « Not sure where to start? Every plan begins with a consultation. »
- **Familles :** « Facials and body, 17 treatments », « Skin and lasers, 20 treatments », « Injectables, 7 treatments », « Lashes, 5 treatments », « Permanent makeup, 6 treatments ».
- **Filtres des résultats :** « All 38 », « Injectables 16 », « Skin and lasers 8 », « Lashes 5 », « Permanent makeup 9 » ; annonce : « 5 results: lashes. » ; suite : « Show all 38 ».
- **Visionneuse :** « Previous », « 2 of 9 », « Next », « Close ».
- **Beauty Bank :** « If you join for 6 months », « $594 to spend, at $99 a month. It never expires. » ; lu par un lecteur d'écran : « 6 months, $594 to spend ».
- **Visite :** « By appointment only. Can't find a time that works? Call us: our hours are flexible. », « Get directions ».
- **Avant la visite :** « Arrive 15 minutes early. », « Come with little or no makeup. », « Need to cancel? », « Running late? », chacun suivi de la règle.

### Variantes étudiées pour le bouton principal
| Option | Texte | Ton | Quand l'utiliser |
|--------|-------|-----|------------------|
| A (retenue) | Book now | Direct ; c'est leur mot, sur leur site et dans Boulevard | Partout : le bouton ouvre leur réservation en ligne |
| B | Book a consultation | Rassurant pour une première injection | Si Boulevard propose la consultation comme premier choix |
| C | Book online | Dit le canal | À côté du téléphone, si des clientes confondent réserver et appeler |

### Ce qui a changé par rapport au site actuel
- Les liens cassés de l'en-tête sont réparés : le courriel (« hideoutboutque », il manquait un i), le téléphone (`tel:http://239-936-0758`), et les icônes qui menaient à facebook.com et instagram.com plutôt qu'à leurs pages.
- Les coquilles sont corrigées : « Mircoblading », « TightScuplt », « memebrship incudes », « upgrages », « Agnus » (AGNES), « tention », « Estro » (Estero).
- L'erreur de copier-coller de l'épilation laser (« proudly offering Chemical Peel treatments ») et les pages de démonstration du thème (Reflexology, Thermo Stone…) ne sont pas reprises.
- « Welcome To The Hideout » et « book & feel Incredible » laissent la place à leur propre phrase, « Come hide out with us. », et à leur promesse, « Where results and relaxation collide. ».
- Les prix sont repris tels quels, avec « Some exclusions apply ».
- Les avis gardent leurs mots, coupés par « […] », signés d'un prénom et d'une initiale.

### Pourquoi
- « Book now » dit ce que fait le bouton, ouvrir leur réservation, et garde le même nom partout.
- Les préoccupations reprennent les trois pages de leur site ; la réponse dit combien de soins et dans quelles familles, et ramène à la consultation.
- Les nombres des familles et des filtres sont ceux du contenu : la construction du site s'arrête s'ils ne correspondent plus.
- Les faits des soins sont courts et toujours étiquetés pareil ; les nuances (« Best suited to lighter skin tones: we'll tell you at your consultation ») restent dans la phrase du soin.
- Les règles de la visite sont écrites comme des réponses aux questions qu'on se pose : « Need to cancel? », « Running late? ».

### Notes pour une traduction
- Une version espagnole servirait une partie de leur clientèle du sud-ouest de la Floride. Prévoir 20 à 30 % de longueur en plus : les noms des familles, larges à l'ordinateur, devront être un peu plus petits ; les filtres et les boutons passent déjà à la ligne.
- Les noms de soins, d'appareils et de marques restent tels quels : Botox, Jeuveau, Xeomin, HydraFacial, AquaFirmeXS, SkinPen, Collagen P.I.N., Morpheus8, Scarlet RF, AGNES RF, BioRePeel, PRX-T33, Lumecca, Fotona 4D, Tetra CO2 CoolPeel, Deka Peel, LipLase, NightLase, TightSculpt, HaiRestart, DE|RIVE, Discovery Pico, DiolazeXL, Cellenis Derma, Sculptra, Face Reality, EXO|E, SkinBetter Science, Alumier, Grande Cosmetics, CareCredit, Cherry.
- Les numéros, les prix et l'adresse suivent le format américain (239-936-0758 ; $99 ; 1342 Colonial Blvd, Suite H57, Fort Myers, FL 33907).
