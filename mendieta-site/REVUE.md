## Revue de design : nouveau site Mendieta Roofing

Revue faite sur des captures écran par écran et en défilant pour de vrai :
- ordinateur : 1440 × 900, la page entière et la partie « couche par couche » à six moments du défilement ;
- téléphone : 390 × 844, la page entière ;
- contrôles automatiques à 18 largeurs, de 320 à 1920 px ;
- les états : les quatre filtres des photos, la visionneuse, « Check your city » (ville trouvée, hors liste, champ
  vide), les erreurs du formulaire, le message prêt à copier, le menu et la barre d'appel du téléphone.

Stade : version finale. Tout ce qui est marqué « corrigé » est fait dans cette version.

### Impression générale
On comprend en deux secondes chez qui l'on est :
- une vraie photo de leur travail : un toit de tuiles plates, leur panneau sur la pelouse ;
- leur métier, leur ville et leur ancienneté, en très grand : « Family roofers in West Palm Beach since 1988. » ;
- leur licence de l'État, avec un lien vers la preuve plus bas ;
- deux façons de les joindre : le devis et le téléphone du bureau.

Le moment dont on se souvient est la coupe d'un toit de tuiles qui se monte couche par couche au fil du défilement :
l'ancien toit part jusqu'au voligeage, la sous-couche se déroule depuis l'égout, puis les tuiles se posent rang par
rang. Chaque étape est montrée sur une vraie photo d'un de leurs chantiers, au même stade ; à la dernière, les mêmes
maisons pendant et après les travaux.

Le reste du site parle la même langue :
- les trois types de toit (tuile, bardeau, toit plat) en petites coupes, dessinées comme la grande ;
- les photos posées comme des rangs de tuiles : quatre, puis trois décalées d'une demi-photo, chacune à cheval sur le
  joint du rang du dessous ;
- la licence en grand, avec son titulaire, sa date et son statut, et le lien vers le registre de l'État ;
- la vraie carte des 25 villes, tracée d'après les limites communales du Census, avec la liste et « Check your
  city ».

Les plus gros défauts trouvés par cette revue :
- la première version de la coupe : traits trop fins, motifs invisibles (une règle de style effaçait leur
  remplissage) ;
- sur ordinateur, la photo de l'étape qui débordait sur la liste des étapes ;
- une page qui défilait de côté à 320 px ;
- la note du formulaire qui parlait de la messagerie du téléphone, même sur ordinateur.

### Utilisabilité
| Constat | Gravité | Correction |
|---------|---------|------------|
| À 320 px, la carte de la licence et la partie du secteur dépassaient de l'écran : la page défilait de côté. | 🔴 Critique | Corrigé : les colonnes peuvent rétrécir, le grand numéro de licence aussi. Aucun débordement sur 18 largeurs, de 320 à 1920 px. |
| Coupe, première version : traits trop fins pour être lus, motifs du bois et du crépi effacés par une règle de style, tuiles trop détaillées pour leur taille. | 🟡 Moyen | Corrigé : coupe redessinée à plus grande échelle, motifs rétablis, tuiles simplifiées, l'ancien toit ajouté (il s'en va à l'étape 1) et le cadrage resserré sur le toit. |
| Ordinateur : dans la partie épinglée, la photo de l'étape débordait sur la liste des étapes, et les photos du téléphone s'affichaient aussi. | 🟡 Moyen | Corrigé : la photo tient dans la hauteur qui reste entre le titre et les étapes ; les photos du téléphone sont masquées sur ordinateur. |
| Formulaire : la note disait « This opens your phone's messages » même sur ordinateur, où le bouton prépare un texte à copier. | 🟡 Moyen | Corrigé : une note pour chaque cas, choisie comme le fait le bouton (pointeur tactile ou non). |
| Liens du menu et de l'en-tête : la partie arrivait 88 px trop bas (le décalage de l'en-tête était compté deux fois). | 🟡 Moyen | Corrigé : la partie arrive juste sous l'en-tête (72 px sur ordinateur, 62 px au téléphone). |
| Téléphone : le bouton « Free estimate » de l'en-tête coupait le nom de l'entreprise. | 🟡 Moyen | Corrigé : au téléphone, l'en-tête garde le nom et le menu ; le devis est dans le menu, l'accueil et la barre d'appel. |
| Photos : 21 photos sur 4 colonnes (2 au téléphone) laissaient une photo seule au dernier rang, et la grille uniforme était monotone. | 🟢 Mineur | Corrigé : les photos sont posées en rangs de tuiles (4 puis 3 décalées, trois paires de rangs pour les 21). Au téléphone, deux par deux, et la dernière seule se pose au milieu. Les filtres gardent le décalage. |
| Barre d'appel du téléphone : cachée, ses liens restaient atteignables au clavier ; un champ pouvait passer dessous en recevant le focus. | 🟢 Mineur | Corrigé : cachée, elle n'a plus de liens actifs ; la page garde 84 px libres au-dessus d'elle. |
| Carte : le fond des comtés dépassait du cadre, et les noms des villes perdaient en lisibilité sur les zones colorées. | 🟢 Mineur | Corrigé : la carte est découpée à son cadre ; chaque nom a un fond blanc. |
| Téléphone : des liens de l'en-tête, du menu et du pied de page faisaient 38 px de haut, les numéros du pied de page 22 px. | 🟢 Mineur | Corrigé : 44 px, sans rien déplacer. |
| Visionneuse : en passant à la photo suivante, rien n'était annoncé aux lecteurs d'écran. | 🟢 Mineur | Corrigé : la légende et le compteur (« 4 of 21 ») sont annoncés. |

### Relecture des textes
Le texte reste celui de l'entreprise ; la relecture a resserré les phrases, corrigé ce qui ne correspondait pas à ce
que fait la page, et rendu les avis fidèles à leurs auteurs.

| Endroit | Avant | Après | Pourquoi |
|---------|-------|-------|----------|
| Étape 3 | « The tile goes up on the roof in stacks, then it is set course by course, starting at the bottom edge. » | « The tile is loaded onto the roof in stacks, then laid course by course from the bottom edge up. » | Plus court, avec les mots du métier. |
| Note du formulaire, téléphone | « This opens your phone's messages with your request written out, addressed to our cell. Nothing is sent until you press send. » | « This opens your messages with your request written out, addressed to our cell. Nothing is sent until you press send. » | Elle ne s'affiche plus qu'au téléphone. |
| Note du formulaire, ordinateur | (la note du téléphone) | « This writes out your request for you to copy and text to our cell. Nothing is sent from this page. » | Sur ordinateur, le bouton prépare le texte ; il n'ouvre rien. |
| Message prêt | « On a computer, copy it and text it to (561) 543-6287, or call the office at (561) 797-5457. » | « Copy it and text it to our cell at (561) 543-6287, or call the office at (561) 797-5457. » | Ce cadre ne s'affiche que sur ordinateur. |
| Copie impossible | « Selected: press Ctrl+C » | « Selected: press Cmd+C » sur Mac, iPhone et iPad | Le bon raccourci pour chacun. |
| Avis de Mary S. | Une phrase raccourcie sans le signaler, et une fin réécrite (« It was a pleasure… »). | « …followed thru with estimate same day! … it was a pleasure to deal with a true professional and a gentleman! » | La coupe est marquée, la fin reprend ses mots. |
| Avis d'Eva H. | « Well groomed, professional, fair estimate. » | « He was on time, well groomed, professional, fair estimate. » | Le début de son avis rétabli (« tome » corrigé en « time »). |
| Avis « Two men arrived early… » | Sans « Very professional. », signé « A homeowner, West Palm Beach » | Avec « Very professional. », signé « A homeowner » | Le début rétabli. Leur site donne deux villes pour cet avis (West Palm Beach dans le module d'avis, Lake Worth sur la fiche de l'accueil) : la ville est retirée. |

Gardés tels quels, parce qu'ils disent exactement ce qui se passe :
- « Get a free estimate », « Call (561) 797-5457 », « Call the office », « Text our cell » ;
- « Write my text to Mendieta », et « Your request is ready. » quand le texte est prêt ;
- les erreurs, qui disent quoi faire : « Enter your name. », « Enter a phone number with the area code, like (561)
  555-0123. », « Enter the city where the roof is. » ;
- les réponses de « Check your city » : « Yes, Boca Raton is on our list, in Palm Beach County. », et hors liste,
  « Miami is not on our list of 25 cities. Call the office at (561) 797-5457 to ask. » ;
- « Look it up on myfloridalicense.com », annoncé comme ouvrant un nouvel onglet.

### Hiérarchie visuelle
- **Ce qui attire l'œil d'abord :** le titre, qui monte ligne par ligne, puis la photo qui se découvre du bas vers le
  haut, puis le bouton jaune « Get a free estimate ». C'est le bon ordre : qui, leur travail, comment les joindre.
- **Parcours de lecture :**
  1. l'accueil : qui, quoi, où, depuis quand ;
  2. couche par couche : comment ils refont un toit, preuves à l'appui ;
  3. les toits : ce qu'ils font, et 21 photos de leurs chantiers ;
  4. les avis : ce qu'en disent leurs clients ;
  5. la licence : la preuve, vérifiable ;
  6. le secteur : les 25 villes, et la sienne ;
  7. le devis.

  Chaque partie répond à la question que la précédente fait naître : « comment travaillent-ils ? », « l'ont-ils
  déjà fait ? », « sont-ils sérieux ? », « viennent-ils chez moi ? », « comment les joindre ? ».
- **Mise en avant :**
  - le bleu marine de leur blason pour le texte et les traits ;
  - le jaune seulement pour l'action principale et pour la couche en cours sur la coupe ;
  - deux changements de fond : le bleu ciel pour les parties de travail (coupe, photos, secteur), le marine pour les
    avis et le pied de page.

### Cohérence
| Élément | Constat | Correction |
|---------|---------|------------|
| Verbes d'action | « Get a free estimate » à l'accueil, « Free estimate » dans l'en-tête, le menu, la barre d'appel et le pied de page ; « Call (561) 797-5457 » partout où l'on appelle le bureau ; « Text our cell » pour le portable. | Rien à changer. |
| Voix | L'entreprise parle à la première personne du pluriel (« our crew », « our cell », « We are based in West Palm Beach ») ; Mario Mendieta à la troisième personne. | Rien à changer. |
| Numéros | Seulement pour les quatre étapes de la coupe, qui sont une vraie suite. | Rien à changer. |
| Formes | Boutons, filtres et choix en pilule ; photos à angles vifs ; la licence dans un cadre de 2 px, comme un document. | Rien à changer : les formes suivent la hiérarchie. |
| Typographie | Encode Sans seule : chasse large (125 %) et graisse 760 à 800 pour les titres, chasse normale et 400 pour le texte, 560 à 680 pour les étiquettes. | Rien à changer. |
| Dessin | Un seul langage : traits marine, remplissages ciel et jaune, mêmes épaisseurs pour la grande coupe et les trois petites. | Rien à changer. |
| Contours de focus | 3 px marine sur les fonds clairs, jaune sur le marine. | Rien à changer. |

### L'ouverture
Une seule séquence, jouée au chargement :
- **0 à 0,95 s :** la première ligne du titre monte depuis sa ligne de base ; les deux suivantes suivent à 0,08 s
  d'écart (jusqu'à 1,11 s) ;
- **0,2 à 1,45 s :** la photo se découvre du bas vers le haut, comme un toit qui se couvre depuis l'égout ;
- **0,5 à 1,3 s :** le texte, les boutons et la licence apparaissent ;
- **1,3 à 1,9 s :** la légende ;
- **après 1,9 s :** plus rien ne bouge.

Rien ne bloque la page pendant ce temps, et rien ne se décale (CLS 0). Avec « réduire les animations », on voit
directement l'état final.

### Couche par couche
- **Sur ordinateur**, la partie reste épinglée pendant un peu plus de quatre hauteurs d'écran, partagées en quatre
  étapes :
  1. l'ancien toit (sous-couche et tuiles, en pointillés) se soulève et s'efface, le voligeage s'allume ;
  2. la bavette et la sous-couche se déroulent depuis l'égout ;
  3. les tuiles se posent une à une, du bas vers le haut ;
  4. la coupe est complète ; les photos montrent les mêmes maisons pendant et après.

  La photo change avec l'étape, l'étiquette de la couche en cours passe en avant, la frise des étapes se remplit.
  Tout suit le défilement, dans les deux sens.
- **Au téléphone**, la coupe reste en haut de l'écran, recadrée sur le toit ; elle suit l'étape dont on lit le
  texte dessous. Les étiquettes passent dans le texte.
- **Avec « réduire les animations »**, la coupe est complète d'emblée et la partie n'est pas épinglée.

### Accessibilité
- **Contrastes :** 75 mesures de texte, de 6,22:1 à 17,34:1 ; le texte courant ne descend pas sous 7,60:1 (détail
  dans `ACCESSIBILITE.md`).
- **Cibles tactiles :** 44 px pour tous les boutons et liens du téléphone, sauf le numéro de licence de l'accueil,
  pris dans une phrase (exempté par 2.5.8).
- **Lisibilité :** texte courant à 18 px sur ordinateur et 17 px au téléphone, lignes de 68 caractères au plus ;
  aucun texte coupé avec un espacement élargi.
- **Chargement :** Lighthouse 100 en accessibilité, bonnes pratiques, SEO et navigation par agents, sur ordinateur
  et sur téléphone. Le titre, plus grand élément de l'écran, s'affiche en 0,86 s au téléphone ralenti (médiane de
  cinq chargements à cache vide, processeur 4 fois plus lent, 4G rapide) et en 0,18 s sur ordinateur ; aucun
  décalage de mise en page (CLS 0). La page pèse 141 Ko, plus 45 Ko de police et la photo de l'accueil : 86 Ko au
  téléphone, 191 Ko sur un écran de 1920 px. Les autres photos se chargent en arrivant à l'écran.

### Ce qui marche bien
- **La coupe et les photos :** le dessin explique, la photo prouve. Chaque étape est un vrai chantier à ce stade,
  et la dernière montre les mêmes maisons avant et après.
- **La licence au premier plan :** le numéro en très grand, le titulaire, la date, le statut et le lien vers le
  registre de l'État. Leur site actuel ne donne que le numéro.
- **La carte :** les vraies limites des 25 villes, la liste par comté et « Check your city », qui reconnaît aussi
  « Lake Worth Beach », « Ft. Lauderdale » ou « Boca ».
- **Le formulaire :** il rédige le texto et l'adresse au portable écrit sur leurs panneaux de chantier ; rien à
  installer chez eux.
- **Les rangs de tuiles :** une galerie de 21 photos ordinaires devient un motif qui parle de leur métier.

### Recommandations prioritaires
1. **Le certificat de leur site actuel :** depuis le 2 octobre 2026, tout visiteur voit une alerte de sécurité. Le
   nouveau certificat est déjà émis ; il suffit de l'installer (voir l'audit SEO).
2. **Faire valider par Mario Mendieta :** les services (le site actuel titre « Roofing & Gutters » et montre deux
   toits en métal, sans en faire des services), le courriel et les horaires (absents du site actuel), les photos (les
   numéros de maison et les plaques sont floutés) et la mention Porch de 2020.
3. **Des photos :** les originaux en pleine taille (le site actuel n'a que des versions de 800 px), et des photos
   de toits plats, qui n'ont aujourd'hui que leur petite coupe.
4. **Les avis :** les pages 2 et 3 du module (9 avis) n'ont pas été lues ; une fois récupérés, ils trouvent leur
   place sous les sept cités.
5. **L'envoi du formulaire :** il ouvre la messagerie du visiteur. Pour recevoir les demandes par courriel, il
   faudra un service de formulaire, à choisir avec eux.
