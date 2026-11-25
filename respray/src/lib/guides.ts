/* Les guides : ce que cherchent, sur Google, les gens qui vont vendre ou acheter un parfum de seconde main. Chaque
   guide répond à une question précise, et finit par une action sur Respray. */
export type Guide = {lien: string; titre: string; resume: string; sections: {t: string; p: string[]}[]; faq: [string, string][]; action: {texte: string; href: string}};

export const GUIDES: Guide[] = [
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
    action: {texte: 'Vendre un parfum, sans commission', href: '/vendre'},
  },
  {
    lien: 'combien-vendre-son-parfum',
    titre: 'À combien vendre son parfum d\'occasion',
    resume: 'Comment fixer un prix juste : le prix neuf, ce qui reste dans le flacon, l\'état, la boîte, la rareté.',
    sections: [
      {t: 'Partir du prix au millilitre', p: ['Divisez le prix neuf par la contenance, puis multipliez par ce qu\'il reste. Un flacon de 100 ml à 200 € neuf, rempli à 70 %, vaut 140 € de parfum au prix neuf.']},
      {t: 'Appliquer une remise', p: ['Un parfum entamé se vend en général entre 30 et 50 % moins cher que neuf, au millilitre. Moins de remise s\'il a sa boîte, s\'il est presque plein, ou s\'il n\'est plus fabriqué.']},
      {t: 'Regarder les annonces', p: ['Sur Respray, le formulaire de vente montre la fourchette des annonces en ligne du même parfum.']},
    ],
    faq: [['Une commission sera-t-elle prise sur mon prix ?', 'Pas sur Respray : le vendeur touche 100 % du prix affiché.']],
    action: {texte: 'Estimer et vendre mon parfum', href: '/vendre'},
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
];
