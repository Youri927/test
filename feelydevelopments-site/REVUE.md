# Revue de design et relecture des textes

Revue faite sur le site construit (`dist/index.html`, et `dist-web` servi en local), comme le ferait un directeur
artistique qui découvre le travail :
- en captures de 320 à 2 560 px, en largeur et en hauteur (tablette tenue droite) ;
- image par image pendant l'arrivée (les transitions arrêtées à 150, 450, 800 et 1 600 ms) ;
- pièce par pièce dans l'enfilade, et aux jonctions entre deux pièces ;
- en mouvement réduit, sans JavaScript, avec un espacement de texte élargi et au zoom à 200 %.

Ce qui a été trouvé a été corrigé avant la livraison. Ce qui reste dépend de Feely Developments : des confirmations,
des photos, et un vrai envoi du formulaire.

## Première impression (2 secondes)

L'œil va d'abord au mot « Design », en très grand, et à la barre noire qui part de sa dernière lettre jusqu'au bord de
l'écran. Puis la photo de l'entrée (la brique blanchie, les portes anciennes sur leur rail, le chêne en chevrons), puis le
titre : « Custom homes and renovations in Winter Park. » En bas, le bouton « Meet with Ryan » et le téléphone.

En deux secondes, on sait trois choses : c'est un constructeur de maisons sur mesure et de rénovations à Winter Park ;
le niveau est haut (la photo, l'espace, la lettre) ; on rencontre le patron lui-même. Au premier tour de molette, la
page glisse de côté et la barre mène à « Build » : le trait d'union de leur devise devient le chemin de la visite.

Rien n'évoque un modèle de site : pas de grande photo sous un slogan centré, pas de trois cartes de services, pas de
rangée de chiffres, pas de témoignages (ils n'en publient pas), pas d'étiquettes en capitales au-dessus des titres.

## Hiérarchie et rythme

- **Ce qui attire l'œil** : le mot de la pièce, puis la photo, puis leur phrase. Sur l'accueil seulement, le titre et
  l'action passent devant la photo.
- **Le rythme.** Une enfilade de six pièces, chacune avec sa forme, toutes tenues par la même ligne :
  - **Design** : l'accueil, la photo de l'entrée en grand, leur phrase (« Our services transform your dream from paper
    to a residence. ») et les trois détails recadrés dans la photo ;
  - **Build** : la façade, leur phrase la plus longue en grand, les cinq étapes de leur texte et les deux licences ;
  - **Live** : le séjour sous les poutres, « a luxury home you love to live in », et trois détails ;
  - **Available homes** : un mur vert pour Palmer Avenue, la villa en construction (le prix, la surface et le terrain en
    grands chiffres), puis Whipple Avenue, vendue, et ses deux étages ;
  - **Meet with Ryan** : le titre en très grand, la promesse datée, le formulaire ;
  - **La fin** : leur logo, redessiné, en très grand, comme dernier mot de la frise, et les coordonnées.
- **La typographie.**
  - Spectral très fine (200) pour les mots de la frise, « Available homes » et « Meet with Ryan » ; en 300 pour les
    phrases de la devise et les noms des maisons. Une serif d'écran, droite et calme, qui répond aux lettres larges et
    tracées au cordeau de leur logo.
  - Jost pour l'interface : les liens, les boutons, les légendes, les étiquettes du formulaire.
  - La barre se tient exactement à la hauteur du trait d'union de Spectral : « Design-Build-Live » reste lisible comme
    leur devise, même étirée sur trois écrans.
  - Ce qu'on évite : les capitales espacées, les étiquettes au-dessus des titres, un mot mis en couleur dans un titre,
    les numéros décoratifs (les seuls numéros sont ceux des cinq étapes, qui se suivent vraiment).
- **La couleur.** La chaux de la brique blanchie (`#F2F1EE`) pour le fond, l'acier des huisseries noires (`#1F201E`)
  pour le texte et la barre, et un seul vert, celui des haies taillées de leurs photos (`#22372A`), pour le bouton et le
  mur de Palmer Avenue. Pas de crème chaude, pas de terre cuite, pas de dégradé.
- **Le mouvement.** Un seul geste, répété à chaque pièce : le mot monte de derrière sa ligne, la barre file vers la
  droite, la photo s'ouvre dans le sens de la marche. Chacun ne joue qu'une fois. Le reste répond à la main : la barre
  sous la pièce en cours suit la souris dans l'en-tête, et le survol d'un détail pose son cadre sur la grande photo.

## Ce qui a été corrigé pendant la revue

| Constat | Gravité | Correction |
|---|---|---|
| Dans l'enfilade, les photos des pièces lointaines ne se chargeaient jamais : la vue coupe tout ce qui dépasse, et le chargement différé du navigateur ne les voyait pas arriver. | 🔴 | Le script charge les photos deux écrans et demi avant qu'elles n'entrent. Les essais vérifient chaque photo. |
| Au clavier, la touche Tab amenait un lien hors de l'écran sans que la page suive : le navigateur faisait défiler la vue, que rien ne montrait. | 🔴 | Le défilement de la vue est repris et rendu à la page : le lien arrive à l'écran, et la barre de l'en-tête suit. |
| « Ask about Palmer Avenue » annulait parfois son propre trajet vers le formulaire (une reprise de défilement arrivait pendant le glissement). | 🔴 | Pendant un trajet demandé, rien ne l'interrompt. Un essai clique et mesure l'arrivée. |
| Avec un espacement de texte élargi ou un grand zoom, un texte pouvait sortir d'une pièce de hauteur fixe. | 🔴 | Le script mesure chaque pièce ; si un texte dépasse, la page repasse de haut en bas, où rien ne se coupe. Vérifié à 1 440, 1 280 et 390 px. |
| Le cadre d'un détail, blanc sur la brique blanchie, ne se voyait presque pas. | 🟡 | Le reste de la photo s'assombrit doucement autour du cadre : le détail se lit sur toutes les photos. |
| À 320 px, les trois chiffres de Palmer Avenue sortaient de l'écran. | 🟡 | Ils passent à la ligne, un peu plus petits. Les débordements sont vérifiés de 320 à 1 024 px au doigt. |
| Les polices n'ont pas de trait d'union insécable : il s'affichait dans une police de secours. | 🟡 | Trait d'union simple partout ; la construction refuse le caractère s'il revient. |
| La phrase de « Build » se coupait sur six lignes dans une colonne trop étroite. | 🟢 | Colonne élargie : cinq lignes, comme les autres phrases. |
| Un fil d'un pixel de chaque photo restait visible au bord gauche avant son ouverture. | 🟢 | La photo reste cachée jusqu'au début de son ouverture. |
| Les légendes des détails étaient en serif, comme les phrases. | 🟢 | En Jost, comme les autres légendes. |
| « What is it about? » était décalé de 2 px par rapport aux autres étiquettes du formulaire. | 🟢 | Aligné. |
| L'accueil empilait le titre, le texte et le bouton en haut, avec un vide dessous. | 🟢 | Le titre en haut, le texte et l'action en bas, alignés sur le bas de la photo. |
| Au doigt, le lien d'évitement et le logo de la fin faisaient moins de 44 px de haut. | 🟢 | 44 px. |

## Relecture des textes d'interface

- **Une seule action, un seul nom.** « Meet with Ryan » dans l'en-tête, sur l'accueil, dans le menu et comme titre de
  la pièce ; le bouton du formulaire dit ce qu'il fait : « Send to Ryan ». Sur la maison en construction, « Ask about
  Palmer Avenue », qui ouvre la demande sur ce sujet. Aucune flèche ajoutée.
- **La promesse devient une date.** Leur phrase, « We will get back in touch with you within 5 business days », devient :
  « Send it today and we'll get back to you by **Tuesday, November 3**, within five business days. » La date est
  calculée à l'heure de Winter Park, sans les week-ends ni les jours fériés américains. Sans JavaScript, la phrase
  d'origine reste.
- **Les erreurs** disent quoi corriger, sans s'excuser : « Enter your name. », « Enter your email address. »,
  « Check your email address. It should look like name@example.com. »
- **L'envoi est honnête.** Sous le bouton : « The button opens your email app, with your message addressed to
  FeelyDev@gmail.com. » Après : « Your email app should open with your message to Ryan. If nothing opens, write to
  FeelyDev@gmail.com or call (321) 663-1433. » L'e-mail préparé a pour objet « Meeting request: a custom home », « … a
  remodel » ou « … the villa on Palmer Avenue ».
- **Leurs mots, sans leurs fautes.** « the 2nd Floor floor », « First first floor », « live In » sont corrigés ;
  « Coming Soon - Under Construction » devient « Under construction » ; « $ *Undisclosed » disparaît (la maison est
  vendue) ; « Drop us a line! » laisse la place au rendez-vous avec Ryan, qui est leur vraie proposition.
- **Rien d'inventé.** Chaque phrase vient de leur page : les trois phrases de la devise, les cinq étapes (« From Real
  Estate services, design, demo, all the way through move in »), les deux maisons, la réserve sur le plan et le prix
  (« Plans and price may change. »), le délai de réponse. Les licences viennent du registre de l'État. Les légendes
  décrivent ce que montrent les photos, sans nommer de maison : on ne sait pas de laquelle viennent les intérieurs.

## Lighthouse (`dist-web`, servi avec compression)

| Profil | Performance | Accessibilité | Bonnes pratiques | SEO | Affichage du contenu principal |
|---|---|---|---|---|---|
| Ordinateur | 99 | 100 | 100 | 100 | 0,6 s |
| Téléphone (4G lente simulée) | 99 | 100 | 100 | 100 | 2,1 s |

Aucun décalage de mise en page (CLS 0) : les polices de secours ont les mesures de Spectral et de Jost, et chaque photo
réserve sa place avec un aperçu flou de 24 px de large.

## Ce qui reste à voir avec Feely Developments

- **Des photos.** Leur galerie est vide, et le site n'en a que trois. Des rendus ou des photos de chantier de la villa de
  Palmer Avenue rempliraient le mur vert ; d'autres maisons pourraient devenir des pièces de l'enfilade, sans rien
  changer à la structure.
- **L'adresse.** 160 Whipple Avenue est l'adresse publiée par l'entreprise et celle de ses licences, mais c'est aussi
  la maison marquée « Sold ». Laquelle publier ?
- **Palmer Avenue.** Le prix (5 800 000 $) et l'avancement, à confirmer avant la mise en ligne.
- **La photo de façade.** Sur leur site actuel, la plaque d'un pilier donne le numéro et la rue de la maison. Elle est
  effacée ici ; ils voudront peut-être la retirer de leur site actuel aussi.
- **L'e-mail.** Une adresse sur leur domaine ferait plus sérieux qu'une adresse Gmail pour une maison à 5,8 M$.
- **Le formulaire** ouvre la messagerie du visiteur. À la mise en ligne, le relier à un service d'envoi (Formspree,
  Netlify Forms ou leur outil) pour recevoir les demandes directement.
- **La licence d'agent immobilier de Ryan** explique « Real estate services ». Pour l'afficher, la Floride demande le
  nom de son agence.
- **La presse.** Un article de GrowthSpotter (2015) annonce Feely Developments comme constructeur d'un projet ; à
  confirmer avant d'en parler.
- **Le profil GuildQuality** donne une ancienne adresse et des photos qui n'existent plus.
- **Des mots de clients**, s'ils en ont et avec leur accord : il n'y en a aucun aujourd'hui, et le site n'en invente pas.
