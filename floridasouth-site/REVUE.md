## Revue de design : nouveau site Florida South Construction

Revue faite sur des captures écran par écran et en défilant pour de vrai :
- ordinateur : 1440 × 900 et 1366 × 768, la page entière, puis 1024, 1280, 1536, 1680 et 1920 px de large ;
- tablette : 768 × 1024 ;
- téléphone : 390 × 844 (et 320, 340, 360, 375 px pour l'en-tête), la page entière ;
- contrôles automatiques à toutes les largeurs de 320 à 1920 px ;
- les états : l'ouverture image par image, les cadres qui s'ouvrent au défilement, les avis lus mot à mot, la
  visionneuse (ouverture depuis la vignette, flèches, doigt, fermeture), les erreurs du formulaire, la demande prête,
  le menu du téléphone, le mouvement réduit, la page sans JavaScript.

Stade : version finale. Tout ce qui est marqué « corrigé » est fait dans cette version.

### Impression générale
On comprend en deux secondes chez qui l'on est :
- leur phrase, « Give us your list », puis une vraie liste de travaux, du trou à reboucher à la maison à construire,
  écrite de plus en plus grand ;
- les lignes se barrent une à une, et « Consider it done. » s'écrit en très grand ;
- dessous, ce qu'ils sont et où : « A general contractor in Naples, Florida, for repairs, remodels and new homes. »,
  Lee et Collier, la licence de l'État depuis 2008 ;
- deux façons de les joindre : « Get an estimate » et le téléphone.

Le fond de tout l'accueil est le ciel de leur photo : la photo des débords blancs monte du bas de l'écran et son
ciel se confond avec la page (même dégradé, relevé pixel par pixel). On ne voit pas où elle commence. C'est la chose
dont on se souvient, et elle ne doit rien à une illustration : leurs mots, leur photo, leur ciel.

Le reste est calme et précis :
- blanc, stuc vert d'eau, encre ; le bleu seulement là où il continue un ciel (l'accueil, la demande en bas de page) ;
- deux familles de lettres bien distinctes : Gloock pour la liste, les titres et les citations, Albert Sans pour le
  reste ;
- des cadres qui s'ouvrent à la mesure du chantier : la petite photo d'un étrier, la photo moyenne d'une ossature,
  puis la maison qui s'ouvre jusqu'aux bords de l'écran ;
- deux mosaïques écrites pour leurs photos, chaque photo légendée pour ce qu'elle montre.

Les plus gros défauts trouvés par cette revue :
- la visionneuse étirait les photos (proportions faussées) ;
- à 320 px, le bouton « Menu » sortait de l'écran ;
- l'emblème de l'en-tête perdait son anneau (1 px) ;
- au téléphone ralenti, le script bloquait la page 460 ms au chargement.

### Utilisabilité
| Constat | Gravité | Correction |
|---------|---------|------------|
| La visionneuse étirait les photos : la hauteur était limitée par l'écran, mais la largeur restait au maximum (comportement des images dans une grille). | 🔴 Critique | Corrigé : la taille est calculée par le script, photo contenue dans l'écran, proportions exactes ; un essai vérifie le rapport largeur/hauteur. |
| À 320 et 340 px, le bouton « Menu » sortait de l'écran (défilement horizontal de 23 px). | 🔴 Critique | Corrigé : en-tête resserré sous 360 px (marges, emblème, boutons) ; un essai vérifie toutes les largeurs de 320 à 1920 px. |
| Après un clic sur la photo de la visionneuse, les flèches du clavier ne répondaient plus (le focus revenait à la page). | 🟡 Moyen | Corrigé : les flèches sont écoutées sur toute la page tant que la visionneuse est ouverte. |
| Au téléphone, la photo du panneau de chantier, recadrée en hauteur, coupait « Another Quality Home ». | 🟡 Moyen | Corrigé : elle passe en pleine largeur au téléphone et à la tablette. |
| La liste se barrait trop tôt (0,38 s après les polices) : on n'avait pas le temps de la lire entière. | 🟢 Mineur | Corrigé : 0,62 s ; la liste se lit d'abord, puis les traits. |
| Au téléphone, le soulignement de « Call (239) 449-4477 » flottait 14 px sous le texte. | 🟢 Mineur | Corrigé : un vrai soulignement, près des lettres, dans une cible de 44 px. |
| Les avis s'allumaient trop lentement : la fin de la citation restait grise alors qu'elle était entière à l'écran. | 🟢 Mineur | Corrigé : le dernier mot s'allume quand la citation arrive aux trois quarts de l'écran. |

### Hiérarchie visuelle
- **Ce qui attire l'œil d'abord** : « Consider it done. », puis la liste barrée au-dessus, puis le titre et les
  boutons dessous. C'est juste : la promesse d'abord, la preuve de l'étendue (la liste) ensuite, l'offre tout de suite
  après.
- **Le parcours de lecture** : la liste, la phrase, le titre et les boutons, puis le débord blanc qui monte et invite
  à descendre. Ensuite une partie par question qu'un propriétaire se pose : que font-ils (« No job is too small. »),
  qu'ont-ils construit (« Another quality home. »), qui est derrière (Judson et la licence), qu'en disent les clients,
  comment demander.
- **L'accent** : le bleu ne sert qu'aux deux ciels, aux liens et aux boutons. Les titres sont à l'encre. Les seules
  couleurs vives sont celles des photos.

### Cohérence
| Élément | Constat | Correction |
|---------|---------|------------|
| Mouvement | Un seul vocabulaire : des traits qui s'allongent de gauche à droite (la liste, la phrase, le soulignement des liens) et des cadres qui s'ouvrent (toutes les photos, plus ou moins selon leur taille). | — |
| Emblème | À 54 px, l'anneau et les pointes faisaient 1 px. | Corrigé : une seconde graisse pour les petites tailles (en-tête, licence, onglet du navigateur). |
| Photos | Toutes légendées de la même façon (ce qu'on voit, l'année), jamais agrandies, converties de l'Adobe RGB vers le sRGB pour garder leurs couleurs. | — |
| Angles | Boutons, champs, carte de la licence : des angles presque vifs (2 px), comme les débords. | — |

### Accessibilité
- **Contrastes** : tout le texte au-dessus du seuil, mesuré sur les vrais pixels. Le texte barré de la liste est
  réglé pour rester lisible : 4,1:1 sur ordinateur (lignes de plus de 24 px), 4,8:1 au téléphone (blanc à 80 %).
- **Cibles** : toutes au-dessus de 24 px (le pied de page passé de 22 à 32 px) ; boutons de 44 à 52 px.
- **Lisibilité** : texte courant en 17 à 18 px, interligne 1,6, lignes sous 70 signes.
- **Textes alternatifs** : les 21 photos sont décrites ; l'emblème est caché (le lien du logo porte le nom).
- Détail dans `ACCESSIBILITE.md`.

### Performance
- **Corrigé** : au téléphone ralenti (processeur ÷4), Lighthouse donnait 86 en performance, avec 460 ms de blocage :
  le script mesurait et réglait les cadres un par un (une mise en page forcée par photo) et découpait les avis dès le
  chargement. Les mesures sont maintenant groupées, et les avis découpés quand le navigateur a le temps : **99**, 10 ms
  de blocage.
- Ordinateur : 100.

### Ce qui marche
- La liste barrée est leur phrase même (« give us your list, and consider the job done »), mise en scène sans un seul
  dessin : rien qui fasse « illustration d'IA ».
- Le ciel de la photo devient la page : la marque, c'est la lumière de leurs chantiers.
- L'échelle comme idée : la taille des lignes de la liste, puis celle des cadres, dit la taille du travail.
- Les preuves sont vérifiables : la licence a sa carte, avec le lien vers le registre de l'État ; les deux avis sont
  les leurs, mot pour mot ; Judson est nommé et montré.
- Tout tient dans un fichier de 3,1 Mo (21 photos en grand compris), sans bibliothèque à part Lenis.

### Recommandations restantes
1. **Des photos de rénovation** : leurs cuisines, salles de bain et le surf shack ne sont en ligne qu'en vignettes de
   185 à 521 px, trop petites pour le site. Quelques photos neuves (même au téléphone, en grand) montreraient la moitié
   du métier qui manque en images.
2. **Le bureau** : 1575 Pine Ridge Rd., Suite 10 est l'adresse publiée par l'entreprise depuis 2015 ; le registre de
   l'État en donne une autre. À faire confirmer avant la mise en ligne.
3. **Avant la mise en ligne** : un passage avec VoiceOver (iPhone) et NVDA (Windows) sur la visionneuse et le
   formulaire.

---

## Relecture des textes d'interface

Contexte : des propriétaires de Lee et de Collier, souvent avec une petite liste de choses à faire, parfois un projet
plus gros, sur leur téléphone. Ton : simple, concret, celui d'un entrepreneur qui répond lui-même. Les textes
reprennent leur site, raccourcis ; rien n'est inventé.

### Les textes retenus
- **Accueil** : « Give us your list. », la liste, « Consider it done. » ; titre : « A general contractor in Naples,
  Florida, for repairs, remodels and new homes. »
- **Bouton principal** : « Get an estimate » (en-tête, accueil, menu) ; le formulaire reprend le mot : « For an
  estimate, write your list here or call (239) 449-4477. »
- **Au téléphone** : le bouton « Call » dans l'en-tête (nommé « Call (239) 449-4477 » pour les lecteurs d'écran).
- **Titres** : leurs mots ou ceux de leur panneau : « No job is too small. », « Another quality home. », « Send us your
  list. »
- **Bouton du formulaire** : « Email my list », avec la note « This opens your email app with your list, addressed to
  Jwhite@floridasouth.us. Nothing is sent from this page. » ; puis « Your list is ready. » et « Copy the text » →
  « Copied. Paste it into an email to Jwhite@floridasouth.us. »
- **Erreurs** : ce qui manque et comment le corriger :
  - « Enter your name. » ;
  - « Enter a phone number or an email address, so we can reach you. » ;
  - « Check the email address: it should look like name@example.com. » ;
  - « Write at least one job on your list. »
- **Visionneuse** : « Previous photo », « Next photo », « Close the viewer », et « 3 of 15 ».

### Variantes écartées
| Option | Texte | Pourquoi pas |
|--------|-------|--------------|
| A | « Send my list » | Faux : rien ne part de la page, c'est l'application d'e-mail qui s'ouvre. |
| B | « Submit » | Ne dit pas ce qui se passe. |
| C | « Southwest Florida's choice for custom home remodeling » | Leur ancienne accroche : invérifiable. |
| D | « The best general contractor in Southwest Florida » | Leur ancien texte : une promesse qu'on ne peut pas prouver. |

### Corrigé à la relecture
- « Write it here, or call… » → « For an estimate, write your list here or call… » : le mot du bouton qui y mène.
- « Send my list » → « Email my list », et la note dit que rien ne part de la page.
- « Pale green lap siding » → « Pale blue-green lap siding » : la couleur telle qu'on la voit sur leurs photos.
- La citation de Marti L. garde son tiret (« accomplish—they have ») : la ponctuation de l'original.

### Notes pour la traduction
- « Consider it done » est leur expression : à traduire par une expression équivalente (« C'est comme si c'était
  fait »), pas mot à mot.
- « Bahama shutter » (volet bahamien, à charnière en haut) n'a pas d'équivalent courant hors de Floride.
