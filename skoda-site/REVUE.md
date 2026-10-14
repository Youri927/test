## Revue de design : nouveau site Skoda Construction

Revue faite sur des captures écran par écran et en défilant pour de vrai :
- ordinateur : 1440 × 900 et 1000 × 800, la page entière, et la maison restaurée à trois moments du défilement ;
- téléphone : 390 × 844, la page entière ;
- contrôles automatiques à toutes les largeurs de 320 à 1920 px ;
- les états : l'ouverture, la visionneuse des pièces, les erreurs du formulaire, les fourchettes de budget qui
  changent avec le projet, le message prêt, le menu du téléphone, le mouvement réduit.

Stade : version finale. Tout ce qui est marqué « corrigé » est fait dans cette version.

### Impression générale
On comprend en deux secondes chez qui l'on est :
- leur métier et leur région, en clair : « Custom homes on Florida's Gulf coast, built by the Skoda family. » ;
- leur nom, en très grand, dans le bleu de leur logo ;
- deux façons de les joindre : « Book a consultation » et le téléphone.

Le moment dont on se souvient vient tout de suite : en défilant, leurs chantiers passent devant le nom, qui reste en
place. Le terrain nu, la coque en blocs sur trois niveaux, la maison finie, une cuisine, la maison refaite après la
tempête, un studio de fitness. Puis la phrase qui donne la clé : « All our jobs are owner supervised. A Skoda is on
every one of them. » Leur argument le plus fort (les propriétaires suivent chaque chantier) devient la mise en page.

Le reste du site est calme :
- du blanc, comme les maisons de leurs photos ;
- de grands titres en Clarendon, le descendant des lettres de leur logo ;
- de vraies photos, légendées pour ce qu'elles montrent ;
- une seule partie sombre, pour l'histoire de la maison après la tempête.

Les plus gros défauts trouvés par cette revue :
- sur ordinateur avec le mouvement réduit, l'histoire de la maison restaurée restait vide ;
- le titre de l'accueil attendait les polices et l'animation pour s'afficher ;
- l'en-tête débordait à 320 px ;
- l'en-tête translucide devenait gris sur la partie sombre et bleu sur le pied de page.

### Utilisabilité
| Constat | Gravité | Correction |
|---------|---------|------------|
| Ordinateur, mouvement réduit : la maison restaurée ne s'épinglait pas, et ses trois étapes, cachées en attendant le défilement, ne s'affichaient jamais. | 🔴 Critique | Corrigé : l'épinglage ne joue que si le mouvement n'est pas réduit ; sinon les trois étapes sont posées l'une sous l'autre. Un essai vérifie qu'elles sont visibles. |
| Ouverture : le titre et le texte de l'accueil attendaient les polices et l'animation. Sur un téléphone lent, le contenu principal arrivait à 1,36 s. | 🟡 Moyen | Corrigé : le titre et le texte sont là d'emblée, seules les lettres du nom et la première photo s'animent. Contenu principal affiché en 0,15 s sur ordinateur, 0,68 s sur un téléphone ralenti (4G rapide, processeur divisé par 4 ; médiane de cinq chargements à cache vide), aucun décalage. |
| À 320 px, l'en-tête (le nom, Menu) dépassait de l'écran. | 🟡 Moyen | Corrigé : en-tête compact sous 380 px ; le nom peut passer sur deux lignes. Aucun débordement de 320 à 1920 px. |
| Ordinateur : dans l'histoire épinglée, les petites photos des dégâts se chevauchaient. | 🟡 Moyen | Corrigé : nouvelles positions. Un essai vérifie qu'aucune photo n'en couvre une autre, à 10, 50 et 95 % du défilement. |
| Les pièces : 12 photos en grands formats, la partie était trop longue. | 🟡 Moyen | Corrigé : rangs à hauteur fixe (38 % de la largeur de l'écran, 560 px au plus), formats variés dans chaque rang. |
| L'en-tête translucide devenait gris sur la partie sombre, bleuté sur le pied de page : on aurait dit un autre état. | 🟢 Mineur | Corrigé : blanc plein, avec un filet dès qu'on a quitté le haut. |
| Le menu de l'en-tête gardait « Our family » allumé sur la carte et le formulaire. | 🟢 Mineur | Corrigé : hors des cinq parties du menu, aucun lien n'est allumé. |
| Les six métiers de la rénovation sur une seule ligne : « Open floor plans » touchait presque « Outdoor living ». | 🟢 Mineur | Corrigé : deux rangs de trois sur ordinateur, chaque métier sur une ligne. |
| Téléphone : l'adresse e-mail du formulaire se coupait au milieu d'un mot. | 🟢 Mineur | Corrigé : elle passe à la ligne après « @ ». |
| Grands écrans : à 1920 px, des paragraphes montaient à 106 caractères par ligne (Chris et Mike, les maisons neuves). | 🟡 Moyen | Corrigé : la mesure des paragraphes est limitée (32 em) ; 72 caractères par ligne au plus, de 320 à 1920 px. |
| Des légendes et des phrases finissaient par un mot seul (« up », « it? »). | 🟢 Mineur | Corrigé : les fins de paragraphe sont équilibrées (`text-wrap: pretty`). |
| Carte : « Boca Grande » coupé par le bord ; « Sanibel » et « Fort Myers Beach » l'un sur l'autre. | 🟢 Mineur | Corrigé : noms déplacés, « Fort Myers Beach » sous son point. |
| Téléphone : des liens isolés faisaient de 25 à 43 px de haut. | 🟢 Mineur | Corrigé : 44 px. |

### Relecture des textes
Le texte reste celui de l'entreprise ; la relecture a resserré les phrases, retiré ce qui n'était pas prouvé ou était
faux, et rendu les avis fidèles à leurs auteurs.

| Endroit | Avant (leur site) | Après | Pourquoi |
|---------|-------------------|-------|----------|
| Titre de l'accueil | « Luxury Home Builder Specializing in New Custom Home Construction, Custom Home Remodeling… » | « Custom homes on Florida's Gulf coast, built by the Skoda family. » | Une phrase qui dit quoi, où et qui, au lieu d'une liste de mots-clés. |
| Ancienneté | « 35 years », « over 30 years » selon les pages | « since 1985 », et « since 1950 » pour la famille | Les deux chiffres de leur site se contredisaient ; une date ne vieillit pas. |
| Promesses | « Award winning », « A+ rating with the Better Business Bureau », « a leader in green building practices » | Retirées | Aucun prix nommé, aucune fiche du BBB trouvée, aucune preuve. La licence de l'État, vérifiable, les remplace. |
| Suivi des chantiers | « All jobs are owner supervised » | « All our jobs are owner supervised. A Skoda is on every one of them. » | Leur argument, dit avec leur nom. |
| Restauration | « Skoda Construction can help you rebuild to the luxury standard you had… » | « When a hurricane, wind or water damages your home, we rebuild it to the standard it had before the storm. » | Plus court ; « Better than new », leur formule, devient le titre. |
| Commercial | « …in the Highland Heights area » (pages de Naples et d'Estero) | Retiré | C'est une ville de l'Ohio, reprise de leur autre site. |
| Légendes des intérieurs | « Naples », « Bonita Springs »… | Ce que montre la photo, sans ville ; « in Florida and in Ohio » pour l'ensemble | Les arbres d'automne par les fenêtres disent l'Ohio. |
| Avis | Nom complet | Prénom et initiale (« Salvatore T., a new home ») ; les coupes marquées « … » | Le respect des clients ; aucune phrase réécrite. |

Gardés tels quels, parce qu'ils disent exactement ce qui se passe :
- « Book a consultation » dans l'en-tête, l'accueil et le menu ; « Call 239-777-7288 » partout où l'on appelle ;
- « Write my email to Skoda », puis « Your request is ready. », « Copy the request » et « Copied. » : la même
  action, nommée de la même façon de bout en bout ;
- la note du bouton : « This opens your email app with your request filled in, addressed to
  skodabuilding@gmail.com. Nothing is sent from this page. » ;
- les erreurs, qui disent quoi faire : « Choose the kind of project. », « Enter your name. », « Enter a phone number
  or an email address, so we can reach you. », « Check the email address: it should look like name@example.com. » ;
- « Check it on the State of Florida's site » pour la licence ;
- « Choose a photo to see it larger. » au-dessus des pièces.

### Hiérarchie visuelle
- **Ce qui attire l'œil d'abord :** le grand nom bleu, puis le titre, puis le bouton bleu « Book a consultation ».
  C'est le bon ordre : qui, quoi, comment les joindre.
- **Parcours de lecture :**
  1. l'accueil : qui, quoi, où, et leurs chantiers devant leur nom ;
  2. les maisons neuves : ce qu'ils vérifient sur votre terrain, puis le terrain, la coque et la maison ;
  3. les rénovations : six métiers, douze pièces en grand ;
  4. « Better than new » : une maison, de la tempête aux clés, et deux avis sur l'assurance ;
  5. le commercial : sept types de projets, puis le déroulé d'un aménagement de bureaux ;
  6. la famille : 1950, 1985, 2014, 2023, puis Chris et Mike ;
  7. le secteur : la carte des onze villes ;
  8. la consultation.

  Chaque partie répond à la question que la précédente fait naître : « que construisent-ils ? », « et chez moi,
  une rénovation ? », « et après un ouragan ? », « et pour mon entreprise ? », « qui sont-ils ? », « viennent-ils
  chez moi ? », « comment les joindre ? ».
- **Mise en avant :**
  - le bleu seulement pour le nom, les boutons, les liens et les dates de la famille ;
  - une seule partie sombre (la tempête), un seul fond gris (la famille), le pied de page bleu ;
  - les avis posés dans le chapitre dont ils parlent, en grand, au lieu d'une partie « Testimonials » à part.

### Cohérence
| Élément | Constat | Correction |
|---------|---------|------------|
| Verbes d'action | « Book a consultation » et « Call 239-777-7288 » partout ; « Write my email to Skoda » pour le seul bouton qui ouvre la messagerie. | Rien à changer. |
| Voix | L'entreprise parle au pluriel (« we rebuild », « our office »), Chris et Mike à la troisième personne ; leurs phrases entre guillemets. | Rien à changer. |
| Numéros | Seulement pour le déroulé d'un aménagement de bureaux (une vraie suite) et les dates de la famille. | Rien à changer. |
| Formes | Photos à angles vifs ; boutons, champs, choix et message prêt à 3 px ; les points de la frise ronds. | Rien à changer. |
| Typographie | Besley pour le nom, les titres et les citations ; Rethink Sans pour le reste. Bas de casse partout, aucune capitale espacée. | Rien à changer. |
| Contours de focus | 2 px bleus sur le blanc et le gris, bleu clair sur le sombre, blancs sur le bleu. | Corrigé (ils étaient invisibles sur le bleu du pied de page). |
| En-tête | Le même blanc sur toutes les parties. | Corrigé (il était translucide). |

### L'ouverture
Une seule séquence, jouée quand les polices sont là (1,2 s au plus d'attente) :
- **tout de suite :** le titre, le texte et les boutons, sans animation ;
- **0,1 à 1,34 s :** les cinq lettres du nom montent une à une derrière leur ligne de base, à 0,06 s d'écart ;
- **0,55 à 1,65 s :** la première photo entre par le bas ;
- **ensuite :** plus rien ne bouge seul. Le reste répond au défilement ou aux gestes.

Rien ne bloque la page pendant ce temps, et rien ne se décale (CLS 0). Avec « réduire les animations », on voit
directement l'état final.

### Accessibilité
Le détail est dans `ACCESSIBILITE.md`. En bref :
- **contrastes :** 89 mesures de texte, toutes au-dessus du seuil ; le texte courant ne descend pas sous 6,66:1 ;
- **cibles tactiles :** 44 px pour tous les liens et boutons isolés au téléphone ;
- **lisibilité :** texte courant de 17 à 18 px, interligne 1,6, 72 caractères par ligne au plus ;
- **clavier :** tout est atteignable, le focus se voit partout, rien n'est caché sous l'en-tête ;
- Lighthouse : 100 en accessibilité, bonnes pratiques, SEO et navigation par agents, sur ordinateur et téléphone.

### Ce qui marche
- **Le nom derrière les chantiers.** La marque devient l'image de l'accueil, et elle porte leur meilleur argument.
  Tout est en CSS (position sticky) : rien ne flotte, rien n'est recalculé, et le site reste fluide sur un téléphone
  modeste.
- **Une vraie histoire, datée.** La même maison, abîmée en novembre 2022, séchée, puis refaite en décembre 2023, avec
  la barre du temps qui avance au défilement. Aucun concurrent ne peut montrer la même chose.
- **La confiance vérifiable.** La licence CBC1266776 de l'État, son titulaire et sa date de fin, avec le lien vers le
  registre, à la place de prix et de notes qu'on ne peut pas vérifier.
- **Des légendes honnêtes.** Chaque photo dit ce qu'elle montre ; aucune ville inventée.
- **Le formulaire.** Il reprend leurs propres fourchettes de budget, qui changent avec le projet, et il écrit
  l'e-mail à leur place.
- **Léger.** 145 Ko de HTML, des photos AVIF jamais agrandies, chargées au fil du défilement.

### Recommandations prioritaires
1. **Des photos professionnelles de deux ou trois maisons récentes de Floride.** Les plus belles photos de maisons
   finies sont prises au téléphone, parfois depuis une voiture (le rétroviseur a été recadré). Une demi-journée de
   prise de vue ferait plus pour le site que n'importe quel effet.
2. **Confirmer avec eux ce que le site affirme :** que les maisons de Floride des photos sont les leurs, où sont les
   intérieurs, et la ville de la maison restaurée (leur site dit Naples sur la page, Captiva ou Sanibel dans les
   légendes).
3. **Une adresse e-mail à leur nom de domaine,** à la place de l'adresse Gmail, et un test avec VoiceOver et NVDA
   avant la mise en ligne.
