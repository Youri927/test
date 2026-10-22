# Revue de design et relecture des textes

Revue faite sur le site construit (`dist-web`, servi en local), en captures de 320 à 2560 px, image par image pendant
l'ouverture et les apparitions, et en mouvement réduit, comme le ferait un directeur artistique qui découvre le
travail. Ce qui a été trouvé a été corrigé avant la livraison ; ce qui reste dépend de Boca Remodeling Group
(confirmations, photos, accords).

## Première impression (2 secondes)

L'œil va d'abord au titre, très grand et étroit, sur une seule ligne : « We draw it. Then we build it. » Il descend
aussitôt sur l'esquisse aux crayons de couleur, qui s'ouvre depuis sa porte dans un rectangle bordé de bleu. Puis il
passe au texte d'appui et au bouton. En deux secondes, on sait que c'est une entreprise de rénovation de Boca Raton qui
dessine avant de construire, et on a envie de faire défiler pour voir la suite : la 3D sort de la porte de l'esquisse,
puis la vraie pièce sort de la porte de la 3D. L'impression est nette, sérieuse et vivante. Rien n'évoque un modèle de
site : pas de grande photo sous un slogan, pas de rangée de chiffres, pas d'étoiles, pas de dessin fait pour l'occasion.

## Hiérarchie

- **Ce qui attire l'œil** : le titre, puis la scène, puis le bouton. C'est la bonne hiérarchie : la promesse, sa
  preuve, l'action.
- **Rythme** : on alterne, et chaque partie a sa forme.
  - Le plâtre de l'accueil, épinglé pendant que la pièce passe du dessin à la photo.
  - Le plâtre des deux histoires : petits tirages à marge blanche (le dessiné), grandes photos sans cadre (le
    construit). La salle de bain descend en escalier, comme son estrade.
  - Le blanc de la liste des camions, en lettres immenses.
  - Le plâtre du travail, huit projets en quinconce.
  - L'encre du bureau, l'adresse en très grand.
  - Le plâtre du devis, puis le blanc du pied de page.
- **Typographie** : une seule famille, deux styles nettement différents.
  - Mozilla Headline étroite et grasse pour tout ce qui est grand ; sa chasse variable sert d'interaction (le mot
    choisi de la liste s'élargit).
  - Mozilla Text pour le reste.
  - Ce qu'on évite : les capitales espacées, les étiquettes au-dessus des titres, un mot mis en couleur dans un titre,
    la numérotation décorative. Les seuls numéros sont les étapes, qui sont vraiment une suite.

## Ce qui a été corrigé pendant la revue

| Constat | Gravité | Correction |
|---|---|---|
| Sous l'accueil, la page était propre mais immobile | 🟡 | Les apparitions, une fois chacune : les titres montent ligne à ligne, les photos des projets s'ouvrent depuis leur centre avec le trait bleu, le geste de l'accueil. Dans une histoire, elles s'ouvrent dans l'ordre des étapes (1, 2, 3, 4, vérifié par un essai). Pas de fondu générique |
| L'ouverture de l'accueil n'existait pas : la page arrivait d'un bloc | 🟡 | Le titre monte phrase par phrase, l'esquisse s'ouvre depuis sa porte : le visiteur voit le geste de toute la page avant de faire défiler |
| Lighthouse sur téléphone : 93, le texte d'appui (le plus grand élément du premier écran) compté à 3,2 s | 🟡 | Le texte d'appui n'est plus caché pendant l'ouverture ; la 3D et la photo, cachées sous l'esquisse, se chargent après elle. Mesuré derrière un serveur qui compresse comme un hébergeur (le petit serveur local ne compressait pas la page) : 98 |
| Dans la cuisine, un grand vide sous la photo finie, et les légendes des deux tirages décalées (formats différents) | 🟡 | La cuisine finie reste en vue pendant qu'on lit les étapes 1 à 3 ; les deux tirages ont le même format, leurs légendes s'alignent |
| Les photos des histoires ne s'ouvraient pas | 🟡 | Chacune ouvre la visionneuse sur elle-même ; les vignettes du travail s'ouvrent sur leur propre photo (la vignette devient la photo) |
| Visionneuse au téléphone : chaque photo débordait de 40 px sur la suivante, les légendes étaient décalées et le compteur se coupait (« 4 of / 5 ») | 🔴 | La largeur plafond de chaque photo devient « la largeur du fichier, sans dépasser l'écran » ; photo et légende centrées ensemble ; compteur insécable |
| Téléphone : la photo de la liste des camions venait après le texte : on touchait un mot sans voir la photo changer | 🟡 | La photo vient juste sous les mots, le texte suit |
| Tablette : les huit projets en une colonne, photos en portrait de près d'un mètre de haut | 🟡 | Deux colonnes de vignettes carrées entre 600 et 1023 px |
| Téléphone : les vignettes du travail perdaient leur place réservée (la page grandissait de 2 800 px pendant qu'on la parcourait, et un lien du menu s'arrêtait avant sa section) | 🔴 | Le format carré ne s'applique qu'à la tablette ; un essai vérifie que rien ne bouge pendant les apparitions |
| 320 px : le bouton « Menu » coupé par le bord | 🟡 | Logo et nom un peu plus petits sous 360 px |
| Au-delà de 1928 px, la page s'étirait sans fin | 🟢 | 1800 px de contenu au plus, centrés |
| Tablette : les faits du bureau et le formulaire sur une colonne | 🟢 | Deux colonnes dès 600 px |
| « See the 3 photos » à côté de « See all 5 photos » | 🟢 | « See all 3 photos » |
| Pendant leur apparition, les titres de deux lignes gagnaient quelques pixels | 🟢 | Le cache est une découpe, qui ne change rien à la mise en page |
| « Windows » n'a pas de photo de fenêtres | 🟢 | Le mot montre les camions, avec une légende honnête : « Windows are on the list too: it's painted on every truck door. » |

## Cohérence

| Élément | Règle | Vérifié |
|---|---|---|
| Couleurs | L'encre pour le texte, le bleu crayon pour les liens et le bouton, l'azur seulement pour les traits (le rectangle qui s'ouvre, la progression, les soulignés) et le focus sur l'encre. Jamais de texte azur sur clair | ✅ |
| Boutons | Un seul style plein, en bleu. Le même nom partout : « Free quote » dans l'en-tête, « Get a free quote » à l'accueil, qui est aussi le titre de la section où il mène | ✅ |
| Photos | Les leurs uniquement, prises en Floride, jamais agrandies au-delà de leur fichier, sans aucune métadonnée. Petit et à marge blanche : c'est dessiné ; grand et sans cadre : c'est construit | ✅ |
| Mouvement | Un seul geste, le rectangle bordé de bleu qui s'agrandit, dans l'ouverture, la scène, la liste et les apparitions. Une seule ouverture se joue seule ; le reste répond au défilement ou au clic ; rien ne flotte | ✅ |
| Dates | Aucune date de chantier : seulement l'écart entre deux étapes (« two weeks later », « the same afternoon ») | ✅ |
| Noms | « Boca Remodeling Group » partout, le nom des camions et du registre de l'État ; jamais le nom du titulaire de la licence, jamais un client | ✅ |

## Ce qui marche bien

- **La scène de l'accueil** : leur meilleure preuve, la même salle de bain esquissée, dessinée en 3D puis construite,
  mise à la place d'un slogan. Les portes des trois images sont calées entre elles : la 3D sort vraiment de la porte
  dessinée, la photo de la porte en 3D.
- **La liste des camions comme titre** : les cinq mots peints sur leurs portières, chacun avec une photo de chantier.
- **Le bureau** : l'adresse en très grand, l'état du moment (« Closed now. We open today at 9 am. »), l'itinéraire, la
  licence vérifiable en un clic sur la fiche de l'État.
- **Leurs propres photos partout** : les photos d'annonces californiennes et les images générées de l'ancien site ont
  disparu.

## Relecture des textes d'interface

| Élément | Texte | Pourquoi |
|---|---|---|
| Bouton principal | **Free quote** (en-tête), **Get a free quote** (accueil) | Leurs mots (« GET A FREE QUOTE ») ; le verbe dit l'action, le titre de la section reprend la même phrase |
| Appel | or call **561-247-2727** | Le numéro reste écrit en entier : on peut le lire, le recopier ou le toucher |
| Étapes | Sketched by hand / Drawn in 3D / Built, chacune avec une phrase de ce qu'on voit | Ce que fait l'entreprise, dans l'ordre, sans jargon |
| Histoires | The plan, on our office screen / The same afternoon, in 3D / Two months later, polishing an island on site / Two weeks after that: finished… | Ce qu'on voit, et l'écart de temps : la preuve que le dessin a été suivi |
| Photos des histoires | See all 5 photos / See all 3 photos | Le même modèle partout |
| Indication de la liste | Choose a word to see one of our jobs. | Dit qu'on peut toucher les mots, et ce qu'on gagne à le faire |
| Lien sous la liste | Tell us about your project | Mène au devis sans répéter « free quote » une fois de plus |
| Bureau | Come by the office / Our customers are welcome to visit us. / Get directions | Leur phrase (« Our Customers are welcome to visit us! »), rendue plus simple |
| État du bureau | Open now, until 5 pm. / Closed now. We open today at 9 am. / … tomorrow … / … Monday … | Un fait utile, à l'heure de Boca Raton |
| Faits | Check it on the state's website (opens in a new tab) / Read what our clients say on Google | Chaque lien dit où il mène |
| Formulaire | A phone number or an email is enough. / What is it about? (choose any) | Lève les deux hésitations avant qu'elles arrivent |
| Bouton du formulaire | **Email my request** | Dit ce qui se passe vraiment : la messagerie s'ouvre |
| Sous le bouton | This opens your email app with your request written out, addressed to bocarcg@gmail.com. Nothing is sent until you press send. | Rassure avant le clic |
| Après le clic | Your email app should open with your request written out. If it didn't, email bocarcg@gmail.com or call 561-247-2727. | Donne la sortie si rien ne s'ouvre |
| Erreurs | Enter your name. / Enter a phone number or an email, so we can reach you. / Check the phone number: it should have 10 digits, like 561-555-0142. / Check the email address: it should look like name@example.com. | Ce qui manque et comment corriger, sans excuse |
| Visionneuse | Previous / Next / Close, « 2 of 3 » | Les mots attendus |
| Pied de page | The photos on this site are of our own projects. | Une phrase vraie, qui répond à ce que l'ancien site laissait croire |

**Alternatives écartées** pour le bouton principal : « Contact us » (vague), « Request an estimate » (eux disent
« quote »), « Start your project » (générique).

## À fournir par Boca Remodeling Group (pour aller plus loin)

1. **L'assurance** : le tee-shirt de l'équipe dit « Licensed • Insured », le site actuel n'en parle pas. Le nouveau site
   n'en parle pas non plus ; à ajouter s'ils le confirment (avec le nom de l'assureur).
2. **Des avis à citer** : trois à cinq avis de leur fiche Google, avec l'accord des clients (prénom et initiale).
3. **Les dates des chantiers** : sous quelle licence ont été faits les chantiers de 2024 et 2025, la licence actuelle
   datant de décembre 2025 (voir ANALYSE.md). Tant que ce n'est pas clair, le site ne date aucun chantier.
4. **Un seul numéro et un seul nom** partout (site, camions, fiche Google), et une adresse e-mail au nom du domaine
   plutôt qu'une adresse Gmail.
5. **Des photos de fenêtres** : c'est sur la liste des camions, et c'est le seul métier sans photo.
6. **Le logo redessiné à plat** (les deux toits bleus et la porte) : à valider.
7. **Leurs chantiers de Californie** (2019 à 2023), s'ils veulent les montrer : avec le lieu écrit, pour ne pas les
   faire passer pour Boca Raton.
