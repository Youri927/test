# Revue de design et relecture des textes

Revue faite sur le site construit (`dist-web`, servi en local), en captures de 320 à 1920 px, au défilement animé et en
mouvement réduit, comme le ferait un directeur artistique qui découvre le travail. Ce qui a été trouvé a été corrigé
avant la livraison ; ce qui reste dépend de Stellar Living Homes (photos, confirmations).

## Première impression (2 secondes)

L'œil va d'abord aux quatre passages à l'encre de l'avis de Scott D. : « more than 5 stars », « attention to detail »,
« protect our floors », « cleaned everyday ». Ils se détachent d'un texte resté pâle. Le regard passe ensuite à la
cuisine aux tabourets bleus, à droite, puis à la phrase qui dit qui ils sont, et enfin au bouton. En deux secondes, on
sait que c'est un entrepreneur de Naples et que ses clients parlent du soin. L'impression est calme, nette et sérieuse ;
le bleu du logo tient toute la page. Rien n'évoque un modèle de site : pas de grande photo sous un slogan, pas de
rangée de chiffres, pas d'étoiles.

## Hiérarchie

- **Ce qui attire l'œil** : l'avis en Imbue très fin et très grand, et ses quatre passages à l'encre ; puis la photo ;
  puis la phrase en linéale, le bouton plein. C'est la bonne hiérarchie : la preuve d'abord, la promesse ensuite.
- **Rythme** : on alterne et rien ne se répète.
  - Le blanc de l'accueil.
  - Le bleu nuit de la visite, figée à l'écran pendant que les pièces défilent.
  - Le blanc de Breakwater, avec six cartes en escalier.
  - La liste alternée « Across Naples », photo d'un côté et texte de l'autre.
  - La brume des avis, qu'on filtre par sujet.
  - Les prestations en lignes.
  - La brume de l'entreprise et de sa licence.
  - Le bleu nuit de la demande, puis le pied de page.
- **Typographie** : deux familles nettement différentes.
  - Imbue, une didone étroite à axe optique, pour tout ce qui est grand et pour les avis.
  - Zalando Sans pour le reste.
  - Ce qu'on évite : les capitales espacées, la numérotation décorative, un mot mis en couleur dans un titre. Les
    seuls mots mis en avant sont dans les avis, et c'est le sujet du site.
  - Les heures de la visite (10:38… 10:45) sont des données lues dans les fichiers, pas un décor.

## Ce qui a été corrigé pendant la revue

| Constat | Gravité | Correction |
|---|---|---|
| L'ouverture : les quatre passages ne paraissaient jamais pâles avant de passer à l'encre (l'état pâle arrivait lui-même par une transition, déjà finie quand on regardait) | 🔴 | État pâle immédiat (la classe `js` est posée dans l'en-tête de la page, avant le premier rendu) ; seule la montée à l'encre est animée, à 1,05 s puis toutes les 0,3 s |
| La visite : la dernière pièce (le sol de la douche) ne devenait jamais la pièce en cours | 🟡 | Un point de lecture qui glisse de 18 % à 82 % de la largeur pendant le défilement ; la pièce en cours est la plus proche de ce point |
| La visionneuse agrandissait les petites photos (photos de pose des cages, version fichier unique) | 🔴 | Largeur maximale égale à la largeur réelle du fichier affiché ; les photos en largeur passent en 1000 px dans le fichier unique |
| Le logo s'affichait en noir | 🔴 | Les deux couleurs du logo sont définies pour l'en-tête (bleu et olive) et le pied de page (blanc et olive) |
| Les chiffres du téléphone, à chasse fixe dans Zalando Sans, donnaient un air de tableur | 🟢 | Chiffres proportionnels |
| « Across Naples » : quand une photo en largeur tombait à droite, elle chevauchait son texte d'une colonne et le texte passait au-dessus | 🟡 | Le texte se décale d'une colonne ; l'alternance photo et texte est régulière à 1024 et à 1440 px |
| « Five homes at Breakwater » n'en montrait que quatre | 🟡 | Le cinquième a été trouvé : une photo à eux (des toilettes d'invités au papier peint de palmiers bleus, novembre 2024), sur une page par ailleurs faite de photos d'annonce |
| Imperial Golf Club figurait dans « Where we've worked » sans aucune photo | 🟢 | Leurs quatre photos de la douche (avril 2023) ont été ajoutées ; les 20 photos d'annonce de la même page restent écartées |
| Trieste n'avait que sa couverture (la page répondait 429) | 🟢 | Galerie lue à la quatrième tentative : 9 photos de la salle de bain, dans l'ordre, en trois minutes |
| Nom de carte coupé sur deux lignes (« A powder room with palm wallpaper ») | 🟢 | « A powder room in blue palms » |
| Cages de piscine : « repaired or newly installed » et « re-screened » | 🟢 | Leurs mots : « We rescreen, add new or alter an existing enclosure, residential and commercial. » |
| Le bouton du formulaire disait « Send my request » alors qu'il ouvre la messagerie | 🟡 | « Email my request », et la note précise : « Nothing is sent until you press send. » |
| Le menu du téléphone s'arrêtait sous ses liens : la page apparaissait juste dessous, comme une suite du menu | 🟡 | Le menu occupe toute la hauteur de l'écran |
| Au doigt, les liens soulignés seuls faisaient 29 px de haut, ceux du pied de page 19 px | 🟡 | 44 px au doigt, sans rien changer à la mise en page ni à la place du trait (voir ACCESSIBILITE.md) |

## Cohérence

| Élément | Règle | Vérifié |
|---|---|---|
| Couleurs | Le bleu du logo pour tout ce qui se lit. L'olive seulement pour les soulignés des avis filtrés, le repère de la pièce en cours et le focus sur fond sombre. Le pâle seulement en grand texte | ✅ |
| Boutons | Un seul style plein, en bleu. Le même nom partout : « Free estimate » dans l'en-tête, « Get a free estimate » à l'accueil, qui est aussi le titre de la section où il mène | ✅ |
| Photos | Les leurs uniquement, jamais agrandies, dans l'ordre de prise de vue. La légende donne la pièce et l'heure (ou la date) lues dans le fichier | ✅ |
| Avis | Les douze, mot pour mot, une fois chacun dans la section. L'ouverture reprend un extrait de l'avis de Scott D., dont le texte est vérifié à la construction | ✅ |
| Lieux | Les noms de communautés et d'immeubles qu'ils donnent (plus « North Naples » pour situer Imperial Golf Club) ; jamais un numéro de logement ni un nom de client | ✅ |
| Mouvement | Une seule ouverture se joue seule. Le reste répond au défilement ou au clic, et rien ne flotte | ✅ |

## Ce qui marche bien

- **L'ouverture** : on lit l'avis comme on lit tous les avis, en diagonale, et ce qu'on retient est exactement ce qui
  ressort à l'encre. C'est leur meilleur argument, mis à la place d'un slogan.
- **La visite de sept minutes** : la preuve la plus forte, ce sont des photos prises en faisant le tour d'un logement
  fini. Ici, elle est racontée par les heures des fichiers.
- **Les avis par sujet** : ils répondent aux questions qu'un propriétaire se pose (le budget sera-t-il tenu ? la maison
  respectée ?). Les prestations y renvoient, par exemple « Storm repairs » mène aux deux avis sur les ouragans.
- **La licence vérifiable en un clic**, sur la fiche officielle de l'État, à la place d'un PDF.
- **Leurs propres photos partout** : les photos d'annonce à filigrane de l'ancien site ont disparu.

## Relecture des textes d'interface

| Élément | Texte | Pourquoi |
|---|---|---|
| Bouton principal | **Free estimate** (en-tête), **Get a free estimate** (accueil) | Leurs mots (« FREE estimate ») ; le verbe dit l'action, le titre de la section reprend la même phrase |
| Appel | or call **908-507-2088** | Le numéro reste écrit en entier : on peut le lire, le recopier ou le toucher |
| Bouton du formulaire | **Email my request** | Dit ce qui se passe vraiment : la messagerie s'ouvre |
| Sous le bouton | This opens your email app with your request written out, addressed to dpalmeri100@gmail.com. Nothing is sent until you press send. | Rassure avant le clic |
| Après le clic | Your email app should open with your request written out. If it didn't, email dpalmeri100@gmail.com or call 908-507-2088. | Donne la sortie si rien ne s'ouvre |
| Erreurs | Enter your name. / Enter a phone number or an email, so we can reach you. / Check the phone number: it should have 10 digits, like 239-555-0142. / Check the email address: it should look like name@example.com. | Ce qui manque et comment corriger, sans excuse |
| Sujets des avis | Everything, Time and budget, Care for the home, Communication, Advice and ideas, Storm repairs, Hiring them again | Les questions d'un client, dans ses mots |
| État du filtre | Five of the twelve reviews talk about time and budget. / All twelve reviews. | Un fait compté, annoncé poliment aux lecteurs d'écran |
| Liens des prestations | Walk through one, Read about time and budget, Read the two reviews, See the photos, See the clubhouse | Chaque lien dit où il mène |
| Visionneuse | Previous / Next / Close, « 15 of 24 » | Les mots attendus |
| Licence | Check it on the state's website (opens in a new tab) | Une action, vers la fiche officielle |

**Alternatives écartées** pour le bouton principal : « Contact us » (vague), « Request a quote » (ils parlent
d'« estimate »), « Start your project » (générique).

## À fournir par Stellar Living Homes (pour aller plus loin)

1. **Des photos à eux pour Talis Park** (Prato, Corsica, Brightling) : leurs pages n'ont que des photos d'annonce ou de
   maisons modèles, laissées de côté. Pistoia montre qu'ils en prennent.
2. **Un exemple de construction commerciale** autre que le club-house, et une photo d'une maison neuve qu'ils ont
   construite : deux prestations annoncées sans image.
3. **La date de fondation et les 38 ans** à confirmer face à la licence de 2022 (voir ANALYSE.md), avant de les
   afficher ailleurs que dans leur propre phrase.
4. **L'accord des clients** dont les avis sont cités, et un numéro en 239 si possible.
