/* Les guides : ce que cherchent, sur Google, les gens qui vont vendre ou acheter un parfum de seconde main. Chaque
   guide répond à une question précise, et finit par une action sur Respray. */
export type Guide = {lien: string; titre: string; resume: string; sections: {t: string; p: string[]}[]; faq: [string, string][]; action: {texte: string; href: string}};

export const GUIDES: Guide[] = [
  {
    lien: 'parfum-perime-combien-de-temps',
    titre: 'Un parfum se périme-t-il ? Combien de temps il se garde',
    resume: 'Date de péremption, petit pot ouvert « 36M », signes qu\'un parfum a tourné : ce qu\'il faut savoir avant d\'acheter ou de jeter un flacon.',
    sections: [
      {t: 'Pas de vraie date de péremption', p: ['Un parfum n\'a pas de date limite comme un aliment. L\'alcool qu\'il contient le protège : bien rangé, il se garde en général plusieurs années, souvent bien plus que ce qu\'on imagine.', 'Le petit pot ouvert dessiné sur la boîte (« 24M », « 36M ») indique la durée d\'utilisation conseillée après ouverture. C\'est une indication prudente, pas une date après laquelle il devient mauvais.']},
      {t: 'Ce qui le fait tourner', p: ['La lumière, surtout le soleil, la chaleur et les écarts de température : une salle de bain, un rebord de fenêtre, une voiture. Un flacon rangé dans un placard, idéalement dans sa boîte, vieillit très lentement.']},
      {t: 'Les signes qu\'il a tourné', p: ['Une odeur aigre, métallique ou de vernis dès la première vaporisation, une couleur nettement plus foncée qu\'à l\'origine, un jus trouble. Les notes de tête (agrumes, notes fraîches) s\'estompent les premières : un parfum un peu plus « rond » qu\'au départ n\'est pas forcément abîmé.']},
      {t: 'Acheter un flacon qui a quelques années', p: ['Le code lot donne souvent la date de fabrication : un flacon de quatre ou cinq ans bien conservé peut être parfait. Sur Respray, le vendeur indique comment il l\'a rangé, et vous avez 7 jours après la livraison pour vérifier qu\'il n\'a pas tourné.']},
    ],
    faq: [
      ['Un parfum de 10 ans est-il encore bon ?', 'Souvent oui, s\'il a été gardé à l\'abri de la lumière et de la chaleur. Vaporisez-le : s\'il ne sent ni l\'aigre ni le vernis, il est bon.'],
      ['Que veut dire « 36M » sur une boîte de parfum ?', 'C\'est la durée d\'utilisation conseillée après ouverture : 36 mois. Une indication prudente, pas une date de péremption.'],
      ['Comment savoir l\'âge d\'un parfum ?', 'Avec son code lot, imprimé ou gravé sous le flacon et sur la boîte : chez beaucoup de marques, il permet de retrouver la date de fabrication.'],
    ],
    action: {texte: 'Où trouver le code lot', href: '/guides/trouver-le-code-lot-d-un-parfum'},
  },
  {
    lien: 'eau-de-toilette-eau-de-parfum-extrait',
    titre: 'Eau de toilette, eau de parfum, extrait : quelle différence ?',
    resume: 'La concentration change la tenue, le sillage et le prix. Ce qu\'il faut savoir pour choisir, et pour comparer les prix d\'occasion.',
    sections: [
      {t: 'Une question de concentration', p: ['La différence tient à la part de matières parfumées dans l\'alcool. En général : eau de Cologne, 2 à 5 % ; eau de toilette, 5 à 15 % ; eau de parfum, 15 à 20 % ; extrait (ou parfum), 20 % et plus. Chaque maison a ses propres dosages : ce sont des ordres de grandeur.']},
      {t: 'Ce que ça change sur la peau', p: ['Plus c\'est concentré, plus ça tient longtemps et plus l\'odeur est riche ; le sillage, lui, dépend surtout de la formule. Une eau de toilette est souvent plus fraîche et plus légère, un extrait plus dense et plus proche de la peau.']},
      {t: 'Pas toujours le même parfum', p: ['L\'eau de toilette et l\'eau de parfum d\'un même nom sont souvent des formules différentes, pas seulement plus ou moins diluées. Comparez-les avant d\'acheter : la version que vous aimez n\'est pas forcément la plus chère.']},
      {t: 'Pour comparer les prix', p: ['Comparez au millilitre, à concentration égale : un extrait de 50 ml et une eau de toilette de 100 ml ne se comparent pas. La cote Respray donne le prix neuf et le prix d\'occasion au millilitre de chaque parfum.']},
    ],
    faq: [
      ['Quelle concentration tient le plus longtemps ?', 'L\'extrait, puis l\'eau de parfum, puis l\'eau de toilette. Mais la tenue dépend aussi beaucoup de la formule et de la peau.'],
      ['Eau de parfum ou eau de toilette, laquelle choisir ?', 'Essayez les deux : ce sont souvent deux formules différentes. L\'eau de toilette est souvent plus fraîche, l\'eau de parfum plus ronde et plus tenace.'],
    ],
    action: {texte: 'Voir la cote des parfums', href: '/cote'},
  },
  {
    lien: 'parfum-arrete-ou-le-trouver',
    titre: 'Parfum arrêté ou reformulé : où le trouver encore',
    resume: 'Votre parfum n\'est plus vendu, ou il ne sent plus pareil ? La seconde main est souvent le seul moyen de retrouver l\'original. Comment le chercher sans se faire avoir.',
    sections: [
      {t: 'Arrêté ou reformulé', p: ['Les maisons arrêtent régulièrement des parfums, ou les reformulent : nouvelles règles sur certains ingrédients, matières premières devenues rares ou trop chères. Le nom reste parfois le même, mais l\'odeur change.']},
      {t: 'La seconde main, souvent la seule solution', p: ['Des flacons achetés avant l\'arrêt dorment encore dans des placards. Le code lot permet souvent de savoir quand un flacon a été fabriqué, donc s\'il date d\'avant une reformulation.']},
      {t: 'Attention aux prix et aux faux', p: ['Un parfum introuvable attire les contrefaçons et les prix gonflés. Exigez des photos du code lot, du spray et de la tige, et ne payez jamais un inconnu par virement. Sur Respray, l\'équipe vérifie chaque annonce, et votre paiement reste bloqué jusqu\'à ce que vous ayez vérifié le flacon.']},
      {t: 'Être prévenu dès qu\'il apparaît', p: ['Sur la page d\'un parfum, ajoutez-le à vos envies : vous êtes prévenu dès qu\'une annonce vérifiée est publiée. Les vendeurs voient aussi combien de personnes l\'attendent.']},
    ],
    faq: [
      ['Comment savoir si mon parfum a été reformulé ?', 'Comparez avec un ancien flacon, et regardez le code lot : il donne souvent la date de fabrication. Les passionnés signalent aussi les reformulations sur les forums.'],
      ['Où acheter un parfum qui n\'est plus fabriqué ?', 'En seconde main, entre particuliers : sur Respray, chaque annonce est vérifiée avant d\'être en ligne, et vous pouvez être prévenu dès qu\'un flacon apparaît.'],
    ],
    action: {texte: 'Chercher un parfum', href: '/parfums'},
  },
  {
    lien: 'acheter-un-parfum-d-occasion',
    titre: 'Acheter un parfum d\'occasion sans se faire avoir',
    resume: 'Parfum de seconde main : où l\'acheter, comment éviter les contrefaçons, à quel prix, et comment être remboursé s\'il n\'est pas conforme.',
    sections: [
      {t: 'Pourquoi acheter son parfum d\'occasion', p: ['Un parfum de niche ou de créateur coûte souvent plus de 150 € neuf. D\'occasion, le même flacon entamé se trouve en général 30 à 50 % moins cher au millilitre, et c\'est parfois le seul moyen de retrouver un parfum qui n\'est plus fabriqué.', 'Un parfum bien conservé, à l\'abri de la lumière et de la chaleur, garde son odeur des années : un flacon déjà ouvert n\'a rien perdu s\'il a été bien rangé.']},
      {t: 'Le vrai risque : la contrefaçon', p: ['Les faux parfums imitent le flacon, la boîte et parfois le code lot. Les signes qui trompent le moins : un code lot identique sur la boîte et sous le flacon, au format de la maison ; un spray, une bague et une tige d\'origine ; un niveau cohérent avec les photos ; un prix qui n\'est pas trop beau pour être vrai.', 'Sur un site de petites annonces classique, personne ne regarde ces points avant vous. Sur Respray, chaque annonce est vérifiée par l\'équipe avant d\'être en ligne, à partir de 6 photos imposées : face, dessous avec le code lot, niveau, vue de dessus avec le spray et la bague, tige sans le bouton spray, et le flacon à côté d\'un papier avec le pseudo du vendeur et la date.']},
      {t: 'Payer sans prendre de risque', p: ['Ne payez jamais un inconnu par virement ou par un moyen « entre amis » : vous n\'auriez aucun recours. Sur Respray, votre paiement reste bloqué : le vendeur n\'est payé qu\'une fois que vous avez reçu le parfum et vérifié qu\'il est conforme.', 'Vous avez 7 jours après la livraison pour vérifier. S\'il n\'est pas conforme à l\'annonce (contrefaçon, autre parfum, niveau plus bas, flacon abîmé), vous êtes remboursé en entier, livraison comprise. Cette protection coûte 5 % du prix plus 0,70 €, affichés avant de payer.']},
      {t: 'Le bon prix', p: ['Comparez au prix neuf au millilitre, en tenant compte de ce qui reste dans le flacon. La cote Respray le fait pour vous : pour chaque parfum, le prix neuf, le prix d\'occasion au millilitre et ce que vaut un flacon entamé.']},
    ],
    faq: [
      ['Est-ce risqué d\'acheter un parfum d\'occasion ?', 'Le risque principal est la contrefaçon. Il disparaît presque si l\'annonce est vérifiée avant d\'être en ligne et si votre paiement reste bloqué jusqu\'à ce que vous ayez vérifié le flacon, comme sur Respray.'],
      ['Un parfum entamé est-il encore bon ?', 'Oui, s\'il a été conservé à l\'abri de la lumière et de la chaleur. Un parfum tourné sent l\'aigre ou le vernis dès la première vaporisation : sur Respray, vous avez 7 jours pour le vérifier.'],
      ['Puis-je être remboursé ?', 'Sur Respray, oui, s\'il n\'est pas conforme à l\'annonce : remboursement complet, livraison comprise. Un parfum conforme qui ne vous plaît pas peut être remis en vente.'],
      ['Combien coûte un parfum d\'occasion ?', 'En général 30 à 50 % de moins que neuf au millilitre, selon le niveau restant, la boîte et la rareté.'],
    ],
    action: {texte: 'Voir les parfums vérifiés', href: '/parfums'},
  },
  {
    lien: 'vendre-son-parfum-d-occasion',
    titre: 'Vendre son parfum d\'occasion : le guide complet',
    resume: 'Où vendre un parfum entamé ou jamais porté, à quel prix, comment l\'envoyer, et comment être payé.',
    sections: [
      {t: 'Peut-on vendre un parfum entamé ?', p: ['Oui. Entre particuliers, vendre un parfum que vous avez acheté pour vous est permis, même ouvert et entamé, tant que vous le décrivez honnêtement : contenance, niveau restant, état du flacon et de la boîte.', 'Un flacon offert qui ne vous plaît pas, un parfum porté quelques fois, une collection à alléger : c\'est ce qui se vend le mieux.']},
      {t: 'Où le vendre', p: ['Sur les sites de petites annonces généralistes, l\'acheteur se méfie des contrefaçons et négocie beaucoup. Respray est fait pour le parfum : l\'équipe vérifie chaque annonce avant de la publier, ce qui rassure les acheteurs, et le vendeur ne paie que 5 % de commission (0 % pour les vendeurs fondateurs).']},
      {t: 'Les 6 photos', p: ['Le flacon de face, le dessous avec le code lot lisible, le niveau à hauteur des yeux, la vue de dessus sans le bouchon, la tige sans le bouton spray, et le flacon à côté d\'un papier avec votre pseudo et la date. Ces photos font la vérification, et elles vous protègent : elles prouvent l\'état du flacon avant l\'envoi.']},
      {t: 'Fixer le prix', p: ['Partez du prix neuf au millilitre, multipliez par ce qui reste, puis retirez 30 à 50 %. Le formulaire de vente propose une fourchette dès que vous avez choisi le parfum : dans cette fourchette, un parfum part vite.']},
      {t: 'Envoyer et être payé', p: ['Une fois vendu, vous recevez l\'étiquette d\'envoi en point relais : emballez le flacon bien calé, déposez le colis. L\'acheteur a 7 jours après la livraison pour vérifier ; dès qu\'il confirme (ou à la fin du délai), la vente est versée le lundi suivant sur votre compte bancaire.']},
    ],
    faq: [
      ['Combien coûte la vente sur Respray ?', 'La mise en ligne est gratuite. Quand le parfum est vendu, Respray retient 5 % du prix (0 % pour les vendeurs fondateurs). L\'acheteur paie la protection et la livraison.'],
      ['Est-ce légal de vendre son parfum ?', 'Oui, entre particuliers, pour des parfums que vous avez achetés ou reçus pour votre usage. Au-delà de 30 ventes ou 2 000 € par an, la plateforme transmet un récapitulatif à l\'administration fiscale, comme toutes les plateformes.'],
      ['Comment envoyer un parfum par colis ?', 'Bouchon bien serré, flacon emballé dans du papier bulle, calé dans un carton sans espace vide. Le guide « Emballer un parfum » détaille chaque étape.'],
      ['Quand suis-je payé ?', 'Dès que l\'acheteur confirme que tout est conforme, ou automatiquement 7 jours après la livraison.'],
    ],
    action: {texte: 'Vendre un parfum', href: '/vendre'},
  },
  {
    lien: 'reconnaitre-un-faux-parfum',
    titre: 'Comment reconnaître un faux parfum',
    resume: 'Les points à regarder avant d\'acheter un parfum d\'occasion : le code lot, la tige, la bague, le flacon, le prix.',
    sections: [
      {t: 'Le code lot', p: ['Chaque flacon authentique porte un code lot, gravé ou imprimé sous le flacon, et le même code sur la boîte. Deux codes différents, un code absent ou effacé exprès, c\'est un signal d\'alerte.', 'Le format du code change d\'une maison à l\'autre (lettres et chiffres, longueur) : il doit ressembler à ceux des autres flacons de la même maison.']},
      {t: 'La bague et la tige du vaporisateur', p: ['Sur un flacon serti, la bague métallique autour du col ne s\'ouvre pas sans laisser de traces. Une bague tordue, rayée ou recollée doit alerter.', 'Retirez le bouton spray : la tige doit être propre, droite, sans colle. Un flacon ouvert pour être rempli avec autre chose garde souvent la trace de l\'opération.']},
      {t: 'Le flacon, le bouchon, l\'étiquette', p: ['Comparez avec les photos officielles de la maison : poids du bouchon, gravures, police de l\'étiquette, alignement. Les contrefaçons se trompent souvent sur ces détails.']},
      {t: 'Le prix', p: ['Un parfum de niche vendu au quart de son prix, presque plein, par un compte tout neuf : méfiance. Sur Respray, l\'équipe signale les prix anormalement bas avant de publier.']},
    ],
    faq: [
      ['Un parfum sans boîte est-il forcément faux ?', 'Non. Beaucoup de gens jettent la boîte. Le code lot sous le flacon, la bague et la tige restent vérifiables.'],
      ['Que faire si je reçois un faux ?', 'Sur Respray, vous avez 7 jours après la livraison pour le signaler : l\'argent reste bloqué, et une contrefaçon est remboursée en entier.'],
    ],
    action: {texte: 'Voir les annonces vérifiées', href: '/parfums'},
  },
  {
    lien: 'trouver-le-code-lot-d-un-parfum',
    titre: 'Où trouver le code lot d\'un parfum',
    resume: 'Sous le flacon, sur la boîte : où chercher le code lot, comment le lire, et à quoi il sert.',
    sections: [
      {t: 'Sous le flacon', p: ['Retournez le flacon : le code est gravé dans le verre ou imprimé sur une petite étiquette, souvent à côté de la contenance (100 ml ℮).', 'S\'il est difficile à lire, inclinez le flacon sous une lumière rasante, ou prenez une photo de près.']},
      {t: 'Sur la boîte', p: ['Il est en général imprimé ou embossé sous la boîte ou sur un côté, près du code-barres. Sur un flacon authentique, il est le même que sous le flacon.']},
      {t: 'À quoi il sert', p: ['Il identifie la série de fabrication : il permet de vérifier que le flacon et sa boîte vont ensemble, et donne souvent une idée de l\'année de fabrication.']},
    ],
    faq: [
      ['Le code lot est effacé, c\'est grave ?', 'Pas forcément sur un vieux flacon. Mais un code effacé exprès doit alerter : c\'est une technique pour cacher l\'origine d\'un flacon.'],
      ['Faut-il le mettre dans l\'annonce ?', 'Sur Respray, oui : le vendeur le recopie depuis la photo du dessous, et l\'équipe vérifie qu\'il correspond.'],
    ],
    action: {texte: 'Vendre un parfum', href: '/vendre'},
  },
  {
    lien: 'photographier-un-parfum-pour-le-vendre',
    titre: 'Comment photographier un parfum pour le vendre',
    resume: 'Les 6 photos qui font vendre (et rassurent l\'acheteur) : face, dessous, niveau, spray, tige, preuve.',
    sections: [
      {t: 'La lumière', p: ['Près d\'une fenêtre, de jour, sans flash. Un fond clair et uni : une feuille blanche ou un mur suffisent.']},
      {t: 'Les 6 photos', p: ['De face, bien droit. Le dessous, avec le code lot lisible. Le niveau, à hauteur des yeux. Sans le bouchon vu de dessus, avec le spray. Sans le bouton spray, pour montrer la tige. Et le flacon à côté d\'un papier avec votre pseudo et la date.']},
      {t: 'Un flacon opaque', p: ['Pour montrer le niveau, éteignez la lumière, allumez la lampe d\'un téléphone et collez-la contre le dos du flacon : la limite du parfum apparaît.']},
    ],
    faq: [['Pourquoi un papier avec mon pseudo ?', 'Il prouve que vous avez le flacon en main, et que les photos ne sont pas reprises d\'une autre annonce.']],
    action: {texte: 'Vendre un parfum', href: '/vendre'},
  },
  {
    lien: 'combien-vendre-son-parfum',
    titre: 'À combien vendre son parfum d\'occasion',
    resume: 'Comment fixer un prix juste : le prix neuf, ce qui reste dans le flacon, l\'état, la boîte, la rareté.',
    sections: [
      {t: 'Partir du prix au millilitre', p: ['Divisez le prix neuf par la contenance, puis multipliez par ce qu\'il reste. Un flacon de 100 ml à 200 € neuf, rempli à 70 %, vaut 140 € de parfum au prix neuf.']},
      {t: 'Appliquer une remise', p: ['Un parfum entamé se vend en général entre 30 et 50 % moins cher que neuf, au millilitre. Moins de remise s\'il a sa boîte, s\'il est presque plein, ou s\'il n\'est plus fabriqué.']},
      {t: 'Regarder la cote', p: ['Sur Respray, le formulaire de vente propose une fourchette dès que vous avez choisi le parfum, la contenance et le niveau : la cote. Elle suit le prix réel des annonces du même parfum quand il y en a au moins 3, et sinon part du prix neuf. Dans la fourchette, un parfum part vite.', 'La cote de tous les parfums est en accès libre, et votre placard estime d\'un coup tous les flacons que vous avez.']},
    ],
    faq: [['Une commission sera-t-elle prise sur mon prix ?', 'Sur Respray, 5 % du prix, retenus au versement (0 % pour les vendeurs fondateurs). Pensez-y en fixant votre prix.']],
    action: {texte: 'Estimer mon placard', href: '/placard'},
  },
  {
    lien: 'conserver-un-parfum',
    titre: 'Comment conserver un parfum (et savoir s\'il est encore bon)',
    resume: 'La lumière, la chaleur, l\'air : ce qui abîme un parfum, et les signes qu\'il a tourné.',
    sections: [
      {t: 'Ce qui l\'abîme', p: ['La lumière du soleil, la chaleur (une salle de bain, un radiateur) et les variations de température. Le mieux : dans un placard, ou dans sa boîte.']},
      {t: 'Un parfum ne se périme pas, il évolue', p: ['Bien rangé, il se garde des années. Les notes de tête s\'estompent les premières.']},
      {t: 'Les signes qu\'il a tourné', p: ['Une couleur nettement plus foncée, une odeur aigre ou métallique au départ. Sur Respray, le vendeur dit comment il l\'a rangé : vous le savez avant d\'acheter.']},
    ],
    faq: [['Faut-il le garder au réfrigérateur ?', 'Non : les écarts de température font plus de mal que de bien. Un placard frais suffit.']],
    action: {texte: 'Voir les parfums', href: '/parfums'},
  },
  {
    lien: 'emballer-un-parfum-pour-l-envoyer',
    titre: 'Comment emballer un parfum pour l\'envoyer',
    resume: 'Un flacon en verre voyage très bien s\'il ne peut ni bouger ni fuir : les 5 étapes, et ce qui vous protège si le colis arrive abîmé.',
    sections: [
      {t: '1. Empêcher la fuite', p: ['Vissez ou enfoncez bien le bouchon. Pour un flacon entamé, entourez le col et le vaporisateur d\'un film alimentaire ou d\'un petit sachet fermé : en cas de choc, le parfum ne coule pas sur le reste.']},
      {t: '2. Protéger le verre', p: ['Enroulez le flacon dans deux ou trois couches de papier bulle, scotchées. S\'il a sa boîte, mettez-le dedans ensuite : la boîte seule ne protège pas d\'une chute.']},
      {t: '3. Le caler', p: ['Choisissez un carton à peine plus grand, et remplissez tous les vides (papier froissé, calage). Secouez le colis : rien ne doit bouger.']},
      {t: '4. Fermer et étiqueter', p: ['Scotchez toutes les ouvertures, collez l\'étiquette bien à plat sur le dessus. Pas de mention « parfum » ni « fragile » au feutre : elles ne protègent pas et attirent l\'attention.']},
      {t: '5. Garder une trace', p: ['Prenez une photo du colis fermé et gardez le reçu du point relais. Avec vos 6 photos vérifiées au moment de l\'annonce, elles prouvent que le flacon est parti en bon état.']},
    ],
    faq: [
      ['Et si le flacon arrive cassé ?', 'L\'acheteur le signale dans les 7 jours, photos à l\'appui. Le paiement reste bloqué le temps de regarder. Au-dessus de 150 €, l\'envoi assuré couvre la vraie valeur du parfum.'],
      ['Puis-je réutiliser un carton ?', 'Oui, s\'il est rigide et sans anciennes étiquettes visibles.'],
    ],
    action: {texte: 'Vendre un parfum', href: '/vendre'},
  },
];
