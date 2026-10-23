# Revue de design et relecture des textes

Revue faite sur le site construit (`dist/index.html` et `dist-web` servi en local), comme le ferait un directeur
artistique qui découvre le travail :
- en captures de 320 à 1 920 px, en largeur et en hauteur (tablette tenue droite) ;
- image par image pendant l'arrivée et pendant que les deux moitiés se recollent ;
- en mouvement réduit, et sans JavaScript.

Ce qui a été trouvé a été corrigé avant la livraison. Ce qui reste dépend de NIAN : des confirmations, et un vrai envoi
du formulaire.

## Première impression (2 secondes)

L'œil va d'abord à l'addition : « Lot » à gauche, « Home » à droite, en très grand, et un « + » bordeaux au milieu.
Sous chaque mot, sa moitié de photo : à gauche le jardin (les cyprès, un tonneau de fleurs rouges), à droite la maison
blanche et son allée. Puis le titre, « Custom homes in Naples, from the lot up. », et le bouton bordeaux.

En deux secondes, on sait trois choses : c'est un constructeur de maisons sur mesure à Naples ; il s'occupe aussi du
terrain ; on peut prendre rendez-vous gratuitement. Au premier tour de molette, les deux moitiés se rapprochent, le
« + » s'efface, et la photo redevient une, en plein cadre : une maison NIAN sur son terrain. La légende paraît : « Oakes
Estate Home ».

Rien n'évoque un modèle de site : pas de grande photo sous un slogan, pas de trois cartes de services, pas de rangée de
chiffres, pas de témoignages (leurs seuls témoignages sont ceux du modèle Wix, avec de faux noms).

## Hiérarchie et rythme

- **Ce qui attire l'œil** : l'addition, puis le titre, puis le bouton. La promesse, sa phrase, l'action.
- **Le rythme.** Chaque partie a sa forme, et le « + » revient comme un fil :
  - **leur phrase**, « No two clients are the same and neither should their home. », seule, en très grand, avec trois
    faits sous des filets (familiale, depuis 2006, la licence liée au registre) ;
  - **les six maisons** : leurs noms en liste, le chevron du logo devant la maison ouverte, et la scène à côté (la
    grande photo, sa légende, ses vignettes) ; au téléphone, un accordéon où chaque maison a son « + » ;
  - **le choix** : « Your lot » + « Your home », trois réponses de chaque côté d'un grand « + » qui se trace ; le résumé
    se compose (« Your starting point: one of our lots + one of our proven plans. ») et remplit la demande ;
  - **les finitions** : quatre intérieurs à la même hauteur, chacun à son format ;
  - **la bande bordeaux** : les Lot + Home packages, avec l'allée qui traverse les pins jusqu'à la maison, puis la
    rénovation ;
  - **les agents** : « 4% » en très grand, et la barre des deux versements (la moitié à la signature, l'autre au
    certificat d'occupation) ;
  - **l'entreprise** : un détail de toit sous les pins, l'histoire, la licence, les deux adresses ;
  - **la demande**, puis **le pied de page** sombre, avec le logo en clair.
- **La typographie.**
  - Petrona très fine (200) pour « Lot », « Home » et le « 4% » ; en 300 pour les titres ; en 400 pour les noms des
    maisons. Une serif contemporaine, sans le côté magazine de luxe.
  - Gantari pour le texte et l'interface, nette comme une fiche de chantier.
  - Ce qu'on évite : les capitales espacées (seul le logo écrit « CUSTOM HOMES »), les étiquettes au-dessus des titres,
    un mot mis en couleur dans un titre, la numérotation décorative.
- **Le mouvement.** Un seul grand geste, l'accueil qui se recolle, lié au défilement dans les deux sens. Autour, des
  gestes de la même famille : les titres montent de sous leur ligne, les photos s'ouvrent depuis le milieu comme les
  deux moitiés depuis le « + », les filets se tracent. Chacun ne joue qu'une fois.

## Ce qui a été corrigé pendant la revue

| Constat | Gravité | Correction |
|---|---|---|
| Le « + » de l'accueil n'était pas au-dessus de l'écart entre les deux moitiés : placé entre « Lot » et « Home », il tombait 100 px à gauche du milieu, parce que « Lot » est plus court que « Home ». | 🔴 | Le « + » est au milieu exact de la scène. Au téléphone, où la ligne est pleine, il descend dans l'écart des deux moitiés. Un essai le vérifie. |
| Au téléphone, chaque moitié montrait la maison : la photo, très large, coupée au milieu d'un écran en hauteur, ne gardait que les cyprès devant la façade. | 🔴 | Sur un écran en hauteur (téléphone, tablette tenue droite), la photo est réduite au départ pour que la boîte en montre 62 % : le tonneau et les fleurs à gauche, la maison à droite. Elle s'agrandit ensuite jusqu'au plein cadre en se recollant. |
| Pendant la jonction, le titre et le texte de l'accueil restaient visibles dans l'écart qui se refermait, à moitié recouverts par la photo. | 🟡 | Les mots et le texte s'effacent pendant que la photo les recouvre. |
| Chrome calculait faux une découpe écrite en CSS (`clamp()` divisé par 2, multiplié dans une soustraction imbriquée) : la moitié gauche débordait jusqu'au bord de l'écran. | 🔴 | Les découpes et les échelles sont calculées par le script, en pixels, à chaque image. |
| Le « + » s'affichait en pointillés. | 🟡 | La longueur du trait est déclarée (`pathLength`) : il se trace d'un seul geste. |
| Les liens du menu amenaient les sections 76 px trop bas (64 px au téléphone) : Lenis ajoutait la hauteur de l'en-tête, déjà comptée par la page. | 🟡 | Un seul décalage. Un essai mesure la position d'arrivée. |
| Au téléphone, « Then, every selection. » s'écrivait lettre par lettre dans une colonne de 20 px, et les quatre photos en lamelles : une règle de la grille l'emportait sur celle du téléphone. | 🔴 | Corrigé ; les débordements sont vérifiés de 320 à 1 920 px. |
| Sur tablette, le bouton de l'accueil se coupait sur trois lignes. | 🟡 | Jusqu'à 1 099 px, le titre et sa phrase à gauche, le bouton à droite, sur une ligne. |
| Au téléphone, un grand vide séparait la photo du titre. | 🟢 | L'espace libre est partagé au-dessus des mots et sous la photo. |
| Les puces du formulaire étaient des pilules arrondies, seules formes rondes d'un site aux angles droits (le toit du logo). | 🟢 | Angles droits, comme les boutons. |
| Le titre de la page restait invisible pendant les 0,6 s du fondu d'arrivée. | 🟡 | Le titre est là dès le premier affichage ; la phrase et le bouton suivent. Lighthouse : plus aucun écart d'affichage. |
| Glisser une photo de la visionneuse à la souris lançait le glisser-déposer de l'image au lieu de passer à la suivante. | 🟢 | Les photos de la visionneuse ne se glissent plus ; le doigt, lui, a toujours fonctionné (vérifié avec de vrais événements tactiles). |
| « Your start: … » et « Ask about this start » : « start » comme nom se lit mal en anglais. | 🟢 | « Your starting point: … » et « Ask about this starting point ». |

## Relecture des textes d'interface

- **Les boutons disent ce qui se passe** : « Schedule a free consultation » (et « Free consultation » dans l'en-tête),
  « Ask about this starting point », « Ask about available packages », « Ask about a remodel », « Ask about a home like
  this one », « Schedule my consultation » (leur propre libellé). Aucune flèche ajoutée.
- **Le choix vide** n'est pas un message d'erreur : « Choose a lot and a home. Not sure yet? That's what the
  consultation is for. »
- **Les erreurs** disent quoi corriger, sans s'excuser : « Enter your name. », « Enter your email address. »,
  « Check your email address. It should look like name@example.com. »
- **L'envoi est honnête.** Sous le bouton : « This opens your email app with your request, addressed to
  contact@niancustomhomes.com. » (sales@niancorp.com si l'on choisit « I'm a realtor »). Après : « Your email app
  should now be open with your request. Send it from there, and we'll get back to you. Nothing opened? Email
  contact@niancustomhomes.com or call 239-280-6428. »
- **Leurs mots, sans leurs fautes.** « desings », « commited », « rennovation », « commision », « realtions »,
  « emmited » sont corrigés. Les noms et les styles des six maisons sont les leurs.
- **Rien d'inventé.** Chaque phrase vient de leurs pages : le terrain (leurs lots dans le comté de Collier, le vôtre,
  celui qu'ils aident à trouver avec Sun Realty), les plans (de zéro, un de leurs plans éprouvés, retouché ou non, vos
  plans), le conseil en design (« from color schemes to fixture styles »), les packages et les maisons à vendre, la
  rénovation, les 4 % des agents. La licence vient du registre de l'État.

## Lighthouse (`dist-web`, servi avec compression)

| Profil | Performance | Accessibilité | Bonnes pratiques | SEO | Affichage du contenu principal |
|---|---|---|---|---|---|
| Ordinateur | 100 | 100 | 100 | 100 | 0,7 s |
| Téléphone (4G lente simulée) | 95 | 100 | 100 | 100 | 2,6 s |

Au téléphone, le contenu principal est la photo de l'accueil (222 Ko). Une version plus légère gagnerait un dixième de
seconde, mais serait floue au plein cadre sur les écrans à forte densité : la netteté a été préférée.

## Ce qui reste à confirmer avec NIAN

- **Les packages et les maisons à vendre.** Leur page Sales est vide : le site dit « Several finished Lot + Home packages
  … and inventory homes for sale », sans en lister. Une liste à jour (photo, terrain, prix) serait le meilleur ajout.
- **Le téléphone.** Leurs données structurées actuelles donnent un autre numéro que celui de leurs pages. Le nouveau site
  utilise celui des pages (239-280-6428) ; à confirmer.
- **Sun Realty et le programme des agents** (4 %, 50/50) : toujours en vigueur ?
- **Le formulaire** ouvre la messagerie du visiteur. À la mise en ligne, le relier à un service d'envoi (Formspree,
  Netlify Forms ou leur outil) pour recevoir les demandes directement.
- **Les photos.** Ce sont celles de leur photographe (traitement HDR, ciels très bleus), sans retouche des couleurs. Des
  photos plus récentes, ou des intérieurs meublés, donneraient encore plus d'envie.
