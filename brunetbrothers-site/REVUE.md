# Revue de design et relecture des textes

Revue faite sur le site construit (`dist-web`, servi en local), comme le ferait un directeur artistique qui découvre le
travail :
- en captures de 320 à 1 920 px, en anglais et en espagnol ;
- image par image pendant l'ouverture et les apparitions ;
- en mouvement réduit.

Ce qui a été trouvé a été corrigé avant la livraison. Ce qui reste dépend de Brunet Brothers : des confirmations, des
photos plus récentes, un vrai envoi du formulaire.

## Première impression (2 secondes)

L'œil va d'abord à la planche : six photos au même format, trois douches au-dessus de trois cuisines, qui passent du flou
au net sous une paroi de verre qui glisse. Il revient sur le titre, très gras : « Masters of consistency and quality. »,
leur propre devise. Puis il trouve le bouton orange et les deux numéros, « Call in English » et « Llame en español ».

En deux secondes, on sait trois choses. C'est une entreprise de rénovation de Floride. Elle fait surtout des salles de
bain et des cuisines. Toutes se ressemblent par le soin, pas par la forme. On a envie de descendre voir les autres.

Rien n'évoque un modèle de site : pas de grande photo sous un slogan, pas de rangée de chiffres, pas d'étoiles, pas de
dessin fait pour l'occasion.

## Hiérarchie et rythme

- **Ce qui attire l'œil** : la planche, puis le titre, puis le bouton. C'est la bonne hiérarchie : la preuve, la
  promesse, l'action.
- **Le rythme.** Les parties alternent, et chacune a sa forme :
  - les **planches** de l'intérieur : des rangées serrées de photos de même format, une par type de pièce (douches,
    meubles-vasques, baignoires, cuisines, autres pièces) ;
  - **dehors** : une grande photo de la cuisine d'été, puis deux photos côte à côte ;
  - **la construction neuve** : trois photos de formats différents, alignées à la même hauteur, dont leur story en
    espagnol ;
  - **la bande sombre** de l'entreprise : leurs camionnettes, puis les quatre numéros de licence en très grand ;
  - **le déroulé** : six questions numérotées, sur trois colonnes ;
  - **les témoignages** : de l'italique serif, en deux colonnes ;
  - **la demande** : un formulaire blanc, et les téléphones en grand ;
  - **le pied de page** sombre.
- **La typographie.**
  - Chivo très grasse pour les titres. Ses lettres larges répondent aux « BB » du logo.
  - Chivo normale pour le texte.
  - Piazzolla italique pour la seule voix qui n'est pas celle de l'entreprise, ses clients.
  - Ce qu'on évite : les capitales espacées, les étiquettes au-dessus des titres, un mot mis en couleur dans un titre,
    la numérotation décorative. Les seuls numéros sont ceux du déroulé, qui est une vraie suite.

## Ce qui a été corrigé pendant la revue

| Constat | Gravité | Correction |
|---|---|---|
| Après un lien du menu, la page défile vite à travers les sections. Les photos croisées en chemin faisaient la queue, et celles de la section visée attendaient leur tour, jusqu'à 3 s. | 🔴 | Une file : au moins 140 ms entre deux photos à l'écran, mais une photo déjà sortie de l'écran quand vient son tour apparaît sans attendre. Vérifié par un essai, au rythme d'une lecture rapide. |
| La note qui suit l'envoi du formulaire était visible avant tout envoi | 🔴 | Une règle de mise en page l'emportait sur `hidden` ; corrigé et vérifié par un essai |
| La construction neuve : trois petites photos à côté du texte, à 260 px de haut. La légende de la story tenait sur quatre lignes. | 🟡 | Le texte d'abord, puis les trois photos sur toute la largeur, à la même hauteur (environ 470 px) |
| 290 px de vide entre l'accueil et l'intérieur | 🟡 | La marge du bas de l'accueil est réduite ; la section suivante garde la sienne |
| Les numéros paraissaient collés (« (561)904-1465 ») : l'espace de Chivo est étroit | 🟢 | Un peu plus d'espace entre les mots des numéros ; un numéro ne se coupe jamais |
| Au téléphone, les six cuisines l'une sous l'autre allongeaient la page d'environ 1 000 px | 🟡 | Deux par rangée, comme les autres planches |
| Au téléphone, le déroulé prenait beaucoup de hauteur (de grands chiffres et beaucoup de marge) | 🟢 | Chiffres plus petits sur téléphone |
| Dans la visionneuse, pendant un long défilement (touches Début et Fin), le compteur affichait les photos traversées | 🟢 | Le compteur attend la photo visée |
| L'e-mail du pied de page se coupait au milieu (« …construction@gm / ail.com ») | 🟢 | Il se coupe avant « @ », si besoin |
| « Free in- / home estimate. » sur deux lignes au téléphone | 🟢 | « in-home » ne se coupe plus |
| À 320 et 360 px, le nom de l'entreprise passait sous le choix de la langue | 🔴 | Le nom sur deux lignes sous 420 px (voir ACCESSIBILITE.md) |

## Cohérence

| Élément | Constat | État |
|---|---|---|
| Formats des photos | Une rangée n'a qu'un seul format : 3:4 pour les salles de bain, 4:3 pour les cuisines et les pièces. Les photos de formats différents (la construction neuve) partagent la même hauteur. | ✅ |
| La paroi de verre | Un seul geste pour toutes les photos, de gauche à droite, une fois. L'ouverture fait la même chose sur toute la planche. | ✅ |
| L'orange | Seulement en aplat (boutons, sujets cochés, logo), en soulignement de liens, et sur la bande sombre. Jamais pour du texte sur le quartz. | ✅ |
| Les deux langues | Les mêmes textes, la même mise en page. Aucun mot anglais ne reste en espagnol, hors les témoignages, qui sont signalés (vérifié automatiquement). | ✅ |
| Les boutons | Un seul style d'action principale (orange) et un style secondaire (contour graphite) | ✅ |

## Ce qui marche

- **La preuve plutôt que l'adjectif.** La devise « Masters of Consistency and Quality » était un slogan. Elle devient
  visible : quinze salles de bain et neuf cuisines au même format, une rangée par type.
- **La paroi de verre** vient de leur produit le plus photographié (la douche à paroi de verre sans cadre). Elle sert
  aussi d'aperçu pendant le chargement : il n'y a jamais de case grise.
- **Deux langues, pour de vrai.** Le site existant mentionnait une ligne en espagnol. Le nouveau est entièrement
  bilingue, en un clic, et garde le choix d'une visite à l'autre.
- **Les quatre licences**, introuvables sur le site actuel, sont maintenant au centre de la page de l'entreprise. Chaque
  numéro ouvre sa fiche au registre de l'État.
- **Leurs vraies paroles.**
  - Les 18 témoignages, mot pour mot.
  - Les six questions de leur FAQ, mises dans l'ordre d'un chantier.
  - « Our clients are our toughest critics and our best salespeople », tiré de leur page d'avis, devient un titre.
  - « Se lucieron los muchachos », leur propre légende de chantier.

## Comparaison avec le site actuel

| | Site actuel (Wix) | Nouveau site |
|---|---|---|
| Premier écran | « Welcome to Brunet Brothers Construction » sur une photo de maison dont on ignore l'origine | Leur devise, six de leurs salles de bain et cuisines, le bouton de devis et les deux lignes téléphoniques |
| Photos | 63 dans une mosaïque à part, sans légende ni texte alternatif, avec leur filigrane | 35 choisies, recadrées sans filigrane, rangées par type, légendées dans les deux langues, en grand dans une visionneuse |
| Licences | « A State Certified General Contractor », sans numéro | Les quatre licences, chaque numéro lié à la fiche de l'État |
| Langues | Anglais seulement (une ligne « for Spanish ») | Anglais et espagnol, en un clic |
| Témoignages | Sur une page à part, chacun en titre h2 | Six mis en avant, les douze autres en un clic, mot pour mot |
| FAQ | Une page à part | Le déroulé d'un chantier, en six questions, avec ses données structurées |
| Contact | 8 champs obligatoires, sans étiquette visible | 3 informations utiles (nom, téléphone ou e-mail), le reste facultatif, des erreurs qui disent quoi corriger |
| Boutons « Get in Touch », « Find Out More » | Ils renvoient en haut de la page d'accueil | Chaque bouton mène là où il le dit |
| Accessibilité, performance | Pas de favicon, ni d'image de partage, ni de description sur une page | Lighthouse 100/100/100/100 sur ordinateur, 98/100/100/100 sur téléphone |

## Relecture des textes d'interface

### Les actions

| Élément | Anglais | Espagnol | Pourquoi |
|---|---|---|---|
| Bouton de l'en-tête | Free estimate | Presupuesto gratis | Court : la place est comptée |
| Bouton de l'accueil | Get a free estimate | Pida un presupuesto gratis | Un verbe, ce qu'on obtient, et c'est gratuit (leur offre) |
| Titre de la demande | Free in-home estimate. | Presupuesto gratis, en su casa. | Leur offre exacte : « free in-home design consultation and work estimate » |
| Envoi | Send my request | Enviar mi solicitud | Dit ce qui part ; la phrase suivante dit comment (la messagerie) |
| Après l'envoi | Your email app should now show the request. Send it from there, and we'll call you back. | Su aplicación de correo debería mostrar la solicitud. Envíela desde allí y le llamaremos. | L'état réel, ce qu'il reste à faire, et un recours (les deux numéros) |
| Témoignages | Read the other 12 testimonials / Show fewer | Leer los otros 12 testimonios / Mostrar menos | Dit combien il en reste |

### Les erreurs (ce qui ne va pas, et comment le corriger)

- **Enter your name.** — **Escriba su nombre.**
- **Enter a phone number or an email, so we can reach you.** — **Escriba un teléfono o un correo, para poder
  contactarle.**
- **Check the phone number: it should have 10 digits, like 561-555-0142.** — **Revise el teléfono: debe tener 10
  dígitos, como 561-555-0142.**
- **Check the email address: it should look like name@example.com.** — **Revise el correo: debe parecerse a
  nombre@ejemplo.com.**

### Corrections apportées aux textes

- **Le déroulé.** La première version donnait six étapes à titres inventés (« A free visit », « A schedule ») et une
  question à part. Elles sont remplacées par leurs six vraies questions de FAQ, mises dans l'ordre d'un chantier. C'est
  plus utile au visiteur et plus fidèle à leur contenu, et ces questions alimentent les données structurées de la FAQ.
- **Une citation retouchée par erreur.** Elle commençait par « They coordinated… » au lieu de « Then they
  coordinated… ». Elle est rétablie mot pour mot.
- **La légende de la story.** Elle disait « On our Instagram », ce que rien ne prouve : la capture est sur leur site.
  Elle dit maintenant « Our caption, in Spanish », et l'espagnol dit « Nuestro mensaje ».
- **Les formules creuses du site actuel** sont retirées : « It's All in the Details », « Welcome to… », « we are indeed
  the best ».

### Le ton

- **Anglais.** Un « we » d'entreprise familiale, des phrases courtes, les faits d'abord.
- **Espagnol.** Un espagnol neutre des États-Unis, au vouvoiement (« usted »), avec des mots d'ici comme « gabinetes »
  et « clóset ».
- **Les témoignages** restent en anglais, coquilles comprises (« From the moment I meet them »). Une note le dit en
  espagnol.

## Ce qui reste à décider avec Brunet Brothers

1. **Les licences de climatisation et de toiture** (obtenues en juin et août 2026). Le site les montre comme des faits.
   À confirmer avant la mise en ligne : veulent-ils aussi les présenter comme des services ?
2. **Des photos récentes.** Presque toutes datent de 2017 à 2020. Une dizaine de chantiers de 2025 et 2026, pris du même
   point de vue, rendraient la série encore plus forte. Les planches en acceptent autant qu'on veut.
3. **Une photo de l'équipe ou des frères.** Une entreprise familiale gagne à montrer ses visages. Il n'en existe aucune
   aujourd'hui, et le site n'en invente pas.
4. **Les témoignages.** Ils sont sans nom. Avec l'accord des clients, un prénom et une ville les rendraient plus
   crédibles. Un lien vers leur fiche Google (à créer ou à revendiquer) ajouterait des avis vérifiables.
5. **Le formulaire.** Il écrit un e-mail dans la messagerie du visiteur, sans serveur. Un vrai service d'envoi
   (Formspree, Netlify Forms) supprimerait cette étape.
6. **Une relecture de l'espagnol** par quelqu'un de l'entreprise, pour le vocabulaire qu'ils emploient avec leurs
   clients.
