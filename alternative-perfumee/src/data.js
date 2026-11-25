/* Données du prototype.
   Le catalogue reprend de vrais parfums (maison, nom, année) pour que le site se lise comme le vrai. Les prix neufs
   sont indicatifs. Les annonces, les vendeurs et les avis sont inventés. Les photos sont des rendus 3D (tools/rendus) :
   elles tiennent la place de celles que les vendeurs prendront. */

const PARFUMS = [
  {id: 'baccarat-rouge-540', maison: 'Maison Francis Kurkdjian', nom: 'Baccarat Rouge 540', conc: 'Eau de parfum', annee: 2015, genre: 'Mixte', famille: 'Ambrée florale', notes: 'safran, jasmin, ambre gris, cèdre', formats: [{ml: 35, neuf: 215}, {ml: 70, neuf: 325}, {ml: 200, neuf: 650}], forme: 'facette', jus: '#E2A985', bouchon: '#B79B62'},
  {id: 'santal-33', maison: 'Le Labo', nom: 'Santal 33', conc: 'Eau de parfum', annee: 2011, genre: 'Mixte', famille: 'Boisée', notes: 'cardamome, iris, santal, cuir', formats: [{ml: 50, neuf: 225}, {ml: 100, neuf: 320}], forme: 'apothicaire', jus: '#E6DCC2', bouchon: '#1E1E21'},
  {id: 'delina', maison: 'Parfums de Marly', nom: 'Delina', conc: 'Eau de parfum', annee: 2017, genre: 'Femme', famille: 'Florale fruitée', notes: 'litchi, rhubarbe, rose turque, vanille', formats: [{ml: 30, neuf: 145}, {ml: 75, neuf: 305}], forme: 'galet', jus: '#F0B1C2', bouchon: '#CFC6B6'},
  {id: 'naxos', maison: 'Xerjoff', nom: 'Naxos', conc: 'Eau de parfum', annee: 2015, genre: 'Homme', famille: 'Ambrée aromatique', notes: 'lavande, miel, tabac, fève tonka', formats: [{ml: 50, neuf: 195}, {ml: 100, neuf: 255}], forme: 'carre', jus: '#D4842A', bouchon: '#BFA05C'},
  {id: 'portrait-of-a-lady', maison: 'Frédéric Malle', nom: 'Portrait of a Lady', conc: 'Eau de parfum', annee: 2010, genre: 'Femme', famille: 'Ambrée florale', notes: 'rose, framboise, patchouli, encens', formats: [{ml: 50, neuf: 270}, {ml: 100, neuf: 390}], forme: 'tour', jus: '#E4A171', bouchon: '#232326'},
  {id: 'gypsy-water', maison: 'Byredo', nom: 'Gypsy Water', conc: 'Eau de parfum', annee: 2008, genre: 'Mixte', famille: 'Boisée aromatique', notes: 'bergamote, genièvre, encens, vanille', formats: [{ml: 50, neuf: 190}, {ml: 100, neuf: 270}], forme: 'cylindre', jus: '#EBE2CA', bouchon: '#2A2A2D'},
  {id: 'tobacco-vanille', maison: 'Tom Ford', nom: 'Tobacco Vanille', conc: 'Eau de parfum', annee: 2007, genre: 'Mixte', famille: 'Ambrée épicée', notes: 'tabac, vanille, cacao, fruits secs', formats: [{ml: 50, neuf: 285}, {ml: 100, neuf: 410}], forme: 'carre', jus: '#A35A25', bouchon: '#3A2A20'},
  {id: 'shalimar', maison: 'Guerlain', nom: 'Shalimar', conc: 'Eau de parfum', annee: 1925, genre: 'Femme', famille: 'Ambrée', notes: 'bergamote, iris, vanille, encens', formats: [{ml: 50, neuf: 125}, {ml: 90, neuf: 165}], forme: 'galet', jus: '#C78632', bouchon: '#2C3E6B'},
  {id: 'coco-mademoiselle', maison: 'Chanel', nom: 'Coco Mademoiselle', conc: 'Eau de parfum', annee: 2001, genre: 'Femme', famille: 'Chyprée florale', notes: 'orange, rose, jasmin, patchouli', formats: [{ml: 35, neuf: 110}, {ml: 50, neuf: 135}, {ml: 100, neuf: 185}], forme: 'carre', jus: '#EFBDA2', bouchon: '#D9D5CD'},
  {id: 'alien', maison: 'Mugler', nom: 'Alien', conc: 'Eau de parfum', annee: 2005, genre: 'Femme', famille: 'Florale boisée', notes: 'jasmin sambac, bois de cachemire, ambre blanc', formats: [{ml: 30, neuf: 95}, {ml: 60, neuf: 135}, {ml: 90, neuf: 170}], forme: 'facette', jus: '#7B51C0', bouchon: '#BCBFC8'},
  {id: 'libre', maison: 'Yves Saint Laurent', nom: 'Libre', conc: 'Eau de parfum', annee: 2019, genre: 'Femme', famille: 'Florale ambrée', notes: 'lavande, fleur d\'oranger, vanille', formats: [{ml: 50, neuf: 125}, {ml: 90, neuf: 160}], forme: 'tour', jus: '#EEC384', bouchon: '#C9A85B'},
  {id: 'terre-d-hermes', maison: 'Hermès', nom: "Terre d'Hermès", conc: 'Eau de toilette', annee: 2006, genre: 'Homme', famille: 'Boisée', notes: 'orange, poivre, vétiver, cèdre', formats: [{ml: 50, neuf: 95}, {ml: 100, neuf: 130}], forme: 'carre', jus: '#DA984F', bouchon: '#C47A3A'},
  {id: 'sauvage', maison: 'Dior', nom: 'Sauvage', conc: 'Eau de toilette', annee: 2015, genre: 'Homme', famille: 'Aromatique fougère', notes: 'bergamote, poivre, lavande, ambroxan', formats: [{ml: 60, neuf: 92}, {ml: 100, neuf: 125}, {ml: 200, neuf: 190}], forme: 'tour', jus: '#B4C6DC', bouchon: '#2A2C33'},
  {id: 'philosykos', maison: 'Diptyque', nom: 'Philosykos', conc: 'Eau de toilette', annee: 1996, genre: 'Mixte', famille: 'Boisée verte', notes: 'feuille de figuier, figue, cèdre', formats: [{ml: 50, neuf: 110}, {ml: 100, neuf: 160}], forme: 'galet', jus: '#D9DFBF', bouchon: '#1F1F22'},
  {id: 'khamrah', maison: 'Lattafa', nom: 'Khamrah', conc: 'Eau de parfum', annee: 2022, genre: 'Mixte', famille: 'Ambrée gourmande', notes: 'cannelle, dattes, praliné, vanille', formats: [{ml: 100, neuf: 39}], forme: 'facette', jus: '#BF6524', bouchon: '#B69145'},
];

/* conformes : la part des ventes sans non-conformité reconnue par l'équipe ; envoi : le délai moyen d'envoi, en jours ;
   criteres : la part des acheteurs qui ont répondu oui à « conforme aux photos ? », « bien emballé ? », « envoyé vite ? » */
const VENDEURS = {
  v1: {pseudo: 'lea.parfums', ville: 'Paris 17e', note: 4.9, avis: 86, ventes: 112, reponse: 'en moins d\'1 h', depuis: 'mars 2026', conformes: 100, envoi: 1.2, criteres: [100, 98, 95]},
  v2: {pseudo: 'yanis_b', ville: 'Lyon 7e', note: 5.0, avis: 31, ventes: 41, reponse: 'en 2 h', depuis: 'avril 2026', conformes: 100, envoi: 1.6, criteres: [100, 100, 94]},
  v3: {pseudo: 'ines.m', ville: 'Bordeaux', note: 4.8, avis: 7, ventes: 9, reponse: 'dans la journée', depuis: 'juin 2026', conformes: 100, envoi: 2.1, criteres: [100, 86, 86]},
  v4: {pseudo: 'hugo_collection', ville: 'Lille', note: 4.9, avis: 52, ventes: 64, reponse: 'en 1 h', depuis: 'mars 2026', conformes: 98, envoi: 1.4, criteres: [98, 100, 96]},
  v5: {pseudo: 'sarah.k', ville: 'Marseille 6e', note: 4.7, avis: 12, ventes: 15, reponse: 'dans la journée', depuis: 'mai 2026', conformes: 100, envoi: 2.4, criteres: [100, 92, 83]},
  v6: {pseudo: 'mathis.d', ville: 'Nantes', note: null, avis: 0, ventes: 0, reponse: 'en 3 h', depuis: 'novembre 2026', conformes: null, envoi: null, criteres: null},
  v7: {pseudo: 'camille.r', ville: 'Paris 11e', note: 5.0, avis: 19, ventes: 23, reponse: 'en 1 h', depuis: 'avril 2026', conformes: 100, envoi: 1.1, criteres: [100, 100, 100]},
  // vous, quand vous essayez le formulaire Vendre du prototype
  v0: {pseudo: 'vous', ville: 'Paris', note: null, avis: 0, ventes: 0, reponse: 'en 1 h', depuis: 'novembre 2026', conformes: null, envoi: null, criteres: null},
};

/* des avis d'acheteurs : seuls ceux d'une vente conclue peuvent en laisser, un par vente */
const AVIS = {
  v1: [
    {note: 5, qui: 'm…e', quand: 'novembre 2026', quoi: 'Baccarat Rouge 540', texte: 'Le niveau est exactement celui de la photo, et le flacon était emballé dans du papier bulle, dans une boîte.', reponse: 'Merci, belle découverte à vous.'},
    {note: 5, qui: 'k…n', quand: 'octobre 2026', quoi: 'Gypsy Water', texte: 'Envoyé le lendemain. Code lot identique sur la boîte et le flacon.'},
  ],
  v2: [{note: 5, qui: 's…a', quand: 'novembre 2026', quoi: 'Delina', texte: 'Conforme en tout point, très bien protégé.'}],
  v4: [
    {note: 5, qui: 'a…l', quand: 'novembre 2026', quoi: 'Naxos', texte: 'Vendeur sérieux, flacon comme sur les photos.'},
    {note: 4, qui: 'j…s', quand: 'septembre 2026', quoi: 'Santal 33', texte: 'Parfait, mais le colis est parti au bout de 3 jours.', reponse: 'Désolé pour le délai : j\'étais en déplacement.'},
  ],
  v7: [{note: 5, qui: 'l…o', quand: 'octobre 2026', quoi: 'Libre', texte: 'Rien à redire, merci !'}],
};

/* etat : 'blister' (neuf, jamais ouvert) ou 'entame' ; niveau : en %, déclaré par le vendeur et contrôlé sur la photo
   du niveau ; fond : la couleur de la surface sur la « photo » ; jours : depuis la publication */
const ANNONCES = [
  {id: 'a101', p: 'baccarat-rouge-540', ml: 70, etat: 'entame', niveau: 85, boite: true, lot: '3A21', achat: '2023', prix: 189, v: 'v1', mainPropre: true, jours: 0, fond: '#EDE7E1', desc: 'Acheté aux Galeries Lafayette en 2023, porté une dizaine de fois. Toujours rangé dans sa boîte, à l\'abri de la lumière. Je le vends parce que je préfère la version Extrait.'},
  {id: 'a102', p: 'baccarat-rouge-540', ml: 35, etat: 'entame', niveau: 60, boite: false, lot: '2F14', achat: '2022', prix: 79, v: 'v5', mainPropre: true, jours: 3, fond: '#E6EAEE', desc: 'Flacon de voyage, sans la boîte. Il reste un peu plus de la moitié.'},
  {id: 'a103', p: 'baccarat-rouge-540', ml: 70, etat: 'blister', niveau: 100, boite: true, lot: '4K08', achat: '2024', prix: 245, v: 'v4', mainPropre: false, jours: 1, fond: '#F0ECE6', desc: 'Reçu en cadeau, jamais ouvert, blister intact. Ticket de caisse disponible.'},
  {id: 'a104', p: 'santal-33', ml: 100, etat: 'entame', niveau: 80, boite: false, lot: '28/06/24', achat: '2024', prix: 172, v: 'v2', mainPropre: true, jours: 0, fond: '#E9E5DF', desc: 'Acheté en boutique à Paris, étiquette datée. Vendu car j\'en ai reçu un autre.'},
  {id: 'a105', p: 'santal-33', ml: 50, etat: 'entame', niveau: 60, boite: false, lot: '11/02/24', achat: '2024', prix: 74, v: 'v7', mainPropre: true, jours: 2, fond: '#ECEDEA', desc: 'Flacon de 50 ml, un peu plus de la moitié.'},
  {id: 'a106', p: 'delina', ml: 75, etat: 'entame', niveau: 70, boite: true, lot: '23B117', achat: '2023', prix: 129, v: 'v3', mainPropre: false, jours: 1, fond: '#F1E8E8', desc: 'Très bon état, avec sa boîte. Je n\'en porte plus assez.'},
  {id: 'a107', p: 'delina', ml: 30, etat: 'blister', niveau: 100, boite: true, lot: '25A042', achat: '2025', prix: 99, v: 'v5', mainPropre: true, jours: 4, fond: '#EDE7E1', desc: 'Neuf sous blister.'},
  {id: 'a108', p: 'naxos', ml: 100, etat: 'entame', niveau: 80, boite: true, lot: 'XJ2309', achat: '2023', prix: 139, v: 'v4', mainPropre: false, jours: 1, fond: '#E8E4DD', desc: 'Utilisé l\'hiver dernier, rangé depuis. Boîte en bon état.'},
  {id: 'a109', p: 'portrait-of-a-lady', ml: 100, etat: 'entame', niveau: 70, boite: true, lot: '2207', achat: '2022', prix: 169, v: 'v1', mainPropre: true, jours: 0, fond: '#EFE9E4', desc: 'Il reste environ 70 ml. Flacon et boîte en très bon état.'},
  {id: 'a110', p: 'gypsy-water', ml: 100, etat: 'entame', niveau: 65, boite: false, lot: '23062', achat: '2023', prix: 109, v: 'v2', mainPropre: true, jours: 2, fond: '#E6EAEE', desc: 'Sans la boîte. Le bouchon a une petite marque, visible sur les photos.'},
  {id: 'a111', p: 'tobacco-vanille', ml: 50, etat: 'entame', niveau: 75, boite: true, lot: 'A73', achat: '2023', prix: 119, v: 'v7', mainPropre: true, jours: 1, fond: '#EAE4DC', desc: 'Parfait pour l\'hiver, mais trop fort pour moi au quotidien.'},
  {id: 'a112', p: 'shalimar', ml: 90, etat: 'entame', niveau: 80, boite: true, lot: '3B01', achat: '2023', prix: 85, v: 'v5', mainPropre: true, jours: 0, fond: '#ECE6E0', desc: 'Shalimar actuel (pas vintage), acheté chez Sephora.'},
  {id: 'a113', p: 'coco-mademoiselle', ml: 100, etat: 'entame', niveau: 60, boite: false, lot: '3902', achat: '2023', prix: 69, v: 'v6', mainPropre: true, jours: 2, fond: '#EDEBE8', desc: 'Première vente sur le site : la vérification de l\'équipe est passée.'},
  {id: 'a114', p: 'coco-mademoiselle', ml: 50, etat: 'blister', niveau: 100, boite: true, lot: '5101', achat: '2025', prix: 79, v: 'v3', mainPropre: false, jours: 5, fond: '#F0ECE6', desc: 'Neuf, jamais ouvert.'},
  {id: 'a115', p: 'alien', ml: 60, etat: 'entame', niveau: 70, boite: true, lot: '23Z41', achat: '2023', prix: 59, v: 'v7', mainPropre: true, jours: 1, fond: '#E9E6EE', desc: 'Flacon rechargeable, jamais rechargé.'},
  {id: 'a116', p: 'libre', ml: 90, etat: 'entame', niveau: 70, boite: false, lot: '42YS07', achat: '2024', prix: 64, v: 'v6', mainPropre: true, jours: 1, fond: '#EFE9E2', desc: 'Il en reste les trois quarts environ.'},
  {id: 'a117', p: 'terre-d-hermes', ml: 100, etat: 'entame', niveau: 90, boite: true, lot: '23M04', achat: '2023', prix: 79, v: 'v4', mainPropre: false, jours: 3, fond: '#E8E4DD', desc: 'Presque plein, porté quelques fois.'},
  {id: 'a118', p: 'sauvage', ml: 100, etat: 'entame', niveau: 70, boite: false, lot: '3N01', achat: '2023', prix: 52, v: 'v2', mainPropre: true, jours: 2, fond: '#E4E8EC', desc: 'Sans boîte, flacon en bon état.'},
  {id: 'a119', p: 'sauvage', ml: 200, etat: 'blister', niveau: 100, boite: true, lot: '5A02', achat: '2025', prix: 155, v: 'v1', mainPropre: true, jours: 6, fond: '#EDE7E1', desc: 'Grand format, neuf sous blister.'},
  {id: 'a120', p: 'philosykos', ml: 100, etat: 'entame', niveau: 55, boite: true, lot: '24E11', achat: '2024', prix: 59, v: 'v3', mainPropre: true, jours: 0, fond: '#EAEDE6', desc: 'Un peu plus de la moitié.'},
  {id: 'a121', p: 'khamrah', ml: 100, etat: 'entame', niveau: 95, boite: true, lot: 'L230914', achat: '2023', prix: 27, v: 'v6', mainPropre: true, jours: 3, fond: '#EDE6DF', desc: 'Testé deux fois, pas pour moi.'},
];

/* Les maisons de la liste : celles du catalogue, plus d'autres maisons connues. Une maison proposée par un vendeur
   s'y ajoute quand l'équipe la valide depuis le panel. */
const MAISONS_EN_PLUS = ['Acqua di Parma', 'Amouage', 'Carolina Herrera', 'Creed', 'Givenchy', 'Initio', 'Jean Paul Gaultier', 'Kilian', 'Lancôme', 'Maison Margiela', 'Memo Paris', 'Nishane', 'Penhaligon\'s', 'Prada', 'Rabanne', 'Serge Lutens', 'Valentino', 'Viktor&Rolf'];

/* Ce qui attend l'équipe dans le panel au chargement du prototype */
const PROPOSITIONS_INITIALES = [
  {id: 'pr1', type: 'maison', tape: 'parfum de marly', par: 'nina.parfums', il: 'il y a 25 min', annonce: 'Delina Exclusif, 75 ml'},
  {id: 'pr2', type: 'maison', tape: 'ORTO PARISI', par: 'theo_m', il: 'il y a 1 h', annonce: 'Megamare, 50 ml'},
  {id: 'pr3', type: 'parfum', tape: 'santal 33 parfum d\'interieur', maison: 'Le Labo', par: 'julie.b', il: 'il y a 3 h', annonce: '100 ml'},
];
const A_VERIFIER = [
  {id: 'v203', p: 'santal-33', ml: 100, etat: 'entame', niveau: 70, boite: false, lot: '28/06/24', achat: '2024', prix: 118, v: 'v5', mainPropre: true, jours: 0, fond: '#E9E5DF', il: 'il y a 2 h 10', alerte: 'Photo de face très proche de celle de l\'annonce a104 (yanis_b) : photo reprise ?', doublon: 'a104'},
  {id: 'v201', p: 'naxos', ml: 100, etat: 'entame', niveau: 75, boite: true, lot: 'XJ2402', achat: '2024', prix: 135, v: 'v6', mainPropre: true, jours: 0, fond: '#ECE7E0', il: 'il y a 8 min'},
  {id: 'v202', p: 'alien', ml: 60, etat: 'entame', niveau: 40, boite: false, lot: '24P11', achat: '2024', prix: 21, v: 'v3', mainPropre: false, jours: 0, fond: '#E8E6ED', il: 'il y a 34 min', alerte: 'Prix très bas pour ce parfum (cote habituelle : 45 à 60 € pour ce niveau)'},
];

/* ——— le back-office de l'équipe ———
   Données fictives. Les dates sont relatives au jour où l'on ouvre le prototype : [jours, heure, minute], jours
   négatifs dans le passé. */

/* l'équipe : les actions passées du journal sont signées par elles et eux ; les nouvelles, par la personne connectée */
const EQUIPE = {
  'equipe:ines': {nom: 'Inès', role: 'Vérification des annonces'},
  'equipe:tom': {nom: 'Tom', role: 'Service client'},
};

/* ce que seul l'équipe voit sur les membres : identité, contact, compte de versement */
const PRIVE = {
  v1: {nom: 'Léa Moreau', email: 'lea.moreau@exemple.fr', tel: '06 •• •• •• 42', inscrit: [-266, 10, 4], iban: 'FR76 •••• •••• 4821', strikes: 0},
  v2: {nom: 'Yanis Benali', email: 'yanis.benali@exemple.fr', tel: '07 •• •• •• 18', inscrit: [-232, 18, 30], iban: 'FR76 •••• •••• 0937', strikes: 0},
  v3: {nom: 'Inès Marchand', email: 'ines.marchand@exemple.fr', tel: '06 •• •• •• 77', inscrit: [-170, 9, 12], iban: 'FR76 •••• •••• 5510', strikes: 0},
  v4: {nom: 'Hugo Lambert', email: 'hugo.lambert@exemple.fr', tel: '06 •• •• •• 03', inscrit: [-262, 21, 45], iban: 'FR76 •••• •••• 2264', strikes: 1},
  v5: {nom: 'Sarah Kaci', email: 'sarah.kaci@exemple.fr', tel: '07 •• •• •• 56', inscrit: [-201, 13, 2], iban: 'FR76 •••• •••• 7718', strikes: 0},
  v6: {nom: 'Mathis Durand', email: 'mathis.durand@exemple.fr', tel: '06 •• •• •• 91', inscrit: [-21, 22, 16], iban: 'En attente de vérification', strikes: 0},
  v0: {nom: 'Vous (démo)', email: 'vous@exemple.fr', tel: '06 •• •• •• 00', inscrit: [0, 9, 0], iban: 'En attente de vérification', strikes: 0},
  v7: {nom: 'Camille Roux', email: 'camille.roux@exemple.fr', tel: '06 •• •• •• 35', inscrit: [-229, 11, 40], iban: 'FR76 •••• •••• 6043', strikes: 0},
};
const ACHETEURS = {
  b1: {pseudo: 'clara.v', nom: 'Clara Vidal', email: 'clara.vidal@exemple.fr', tel: '06 •• •• •• 24', ville: 'Toulouse', inscrit: [-150, 20, 11]},
  b2: {pseudo: 'nina.parfums', nom: 'Nina Rousseau', email: 'nina.rousseau@exemple.fr', tel: '07 •• •• •• 60', ville: 'Paris 9e', inscrit: [-98, 8, 50]},
  b3: {pseudo: 'theo_m', nom: 'Théo Martin', email: 'theo.martin@exemple.fr', tel: '06 •• •• •• 13', ville: 'Rennes', inscrit: [-77, 19, 5]},
  b4: {pseudo: 'julie.b', nom: 'Julie Bernard', email: 'julie.bernard@exemple.fr', tel: '06 •• •• •• 88', ville: 'Lyon 3e', inscrit: [-130, 12, 30]},
  b5: {pseudo: 'karim.s', nom: 'Karim Saïdi', email: 'karim.saidi@exemple.fr', tel: '07 •• •• •• 49', ville: 'Montpellier', inscrit: [-61, 17, 22]},
  b6: {pseudo: 'manon.l', nom: 'Manon Lefèvre', email: 'manon.lefevre@exemple.fr', tel: '06 •• •• •• 71', ville: 'Strasbourg', inscrit: [-112, 10, 0]},
  b7: {pseudo: 'antoine.d', nom: 'Antoine Dubois', email: 'antoine.dubois@exemple.fr', tel: '06 •• •• •• 36', ville: 'Nice', inscrit: [-45, 21, 18]},
  b8: {pseudo: 'emma.g', nom: 'Emma Girard', email: 'emma.girard@exemple.fr', tel: '07 •• •• •• 02', ville: 'Grenoble', inscrit: [-33, 9, 41]},
};

/* les commandes. ph : l'annonce dont on montre les photos (le même flacon) ; statut : a_envoyer, en_transit, livree,
   litige, conclue, versee, annulee, remboursee ; suivi : les étapes du transporteur */
const COMMANDES = [
  {id: 'c3014', ph: 'a110', p: 'gypsy-water', ml: 100, niveau: 70, lot: '23062', prix: 104, v: 'v2', b: 'b1', mode: 'envoi', statut: 'a_envoyer', payee: [0, 9, 42]},
  {id: 'c3013', ph: 'a106', p: 'delina', ml: 75, niveau: 70, lot: '23B117', prix: 125, v: 'v3', b: 'b2', mode: 'envoi', statut: 'a_envoyer', payee: [-1, 21, 5]},
  {id: 'c3012', ph: 'a111', p: 'tobacco-vanille', ml: 50, niveau: 60, lot: 'A73', prix: 98, v: 'v5', b: 'b3', mode: 'envoi', statut: 'a_envoyer', payee: [-6, 14, 20]},
  {id: 'c3011', ph: 'a104', p: 'santal-33', ml: 100, niveau: 75, lot: '28/06/24', prix: 165, v: 'v1', b: 'b4', mode: 'envoi', statut: 'en_transit', payee: [-3, 18, 2], envoyee: [-2, 11, 30], suivi: {numero: 'MR 4821 3907', etapes: [[-2, 11, 30, 'Déposé en point relais, Paris 17e'], [-1, 6, 10, 'Pris en charge, centre de tri de Lyon'], [0, 7, 45, 'Arrivé en point relais, Lyon 3e']]}},
  {id: 'c3010', ph: 'a108', p: 'naxos', ml: 100, niveau: 85, lot: 'XJ2309', prix: 140, v: 'v4', b: 'b5', mode: 'envoi', statut: 'en_transit', payee: [-12, 10, 15], envoyee: [-11, 16, 40], suivi: {numero: 'MR 4807 1152', etapes: [[-11, 16, 40, 'Déposé en point relais, Lille'], [-10, 5, 20, 'Pris en charge, centre de tri de Lille']]}},
  {id: 'c3009', ph: 'a116', p: 'libre', ml: 90, niveau: 50, lot: '42YS07', prix: 55, v: 'v7', b: 'b6', mode: 'envoi', statut: 'livree', payee: [-6, 8, 30], envoyee: [-5, 12, 0], livree: [-3, 15, 20], suivi: {numero: 'MR 4815 7720', etapes: [[-5, 12, 0, 'Déposé en point relais, Paris 11e'], [-4, 4, 50, 'Pris en charge, centre de tri de Reims'], [-3, 15, 20, 'Retiré par le destinataire, Strasbourg']]}},
  {id: 'c3008', ph: 'a109', p: 'portrait-of-a-lady', ml: 100, niveau: 70, lot: '2207', prix: 175, v: 'v1', b: 'b7', mode: 'envoi', statut: 'litige', payee: [-9, 19, 12], envoyee: [-8, 10, 5], livree: [-5, 17, 40], suivi: {numero: 'MR 4810 0384', etapes: [[-8, 10, 5, 'Déposé en point relais, Paris 17e'], [-7, 3, 30, 'Pris en charge, centre de tri de Lyon'], [-5, 17, 40, 'Retiré par le destinataire, Nice']]}},
  {id: 'c3007', ph: 'a118', p: 'sauvage', ml: 100, niveau: 60, lot: '3N01', prix: 49, v: 'v6', b: 'b1', mode: 'envoi', statut: 'litige', payee: [-10, 12, 0], envoyee: [-9, 18, 25], livree: [-6, 11, 10], suivi: {numero: 'MR 4808 6631', etapes: [[-9, 18, 25, 'Déposé en point relais, Nantes'], [-8, 4, 0, 'Pris en charge, centre de tri de Tours'], [-6, 11, 10, 'Retiré par le destinataire, Toulouse']]}},
  {id: 'c3006', ph: 'a112', p: 'shalimar', ml: 90, niveau: 80, lot: '3B01', prix: 82, v: 'v5', b: 'b8', mode: 'envoi', statut: 'conclue', payee: [-16, 9, 0], envoyee: [-15, 14, 0], livree: [-13, 10, 30], conclue: [-6, 10, 30], suivi: {numero: 'MR 4799 2210', etapes: [[-15, 14, 0, 'Déposé en point relais, Marseille 6e'], [-13, 10, 30, 'Retiré par le destinataire, Grenoble']]}},
  {id: 'c3005', ph: 'a114', p: 'coco-mademoiselle', ml: 50, niveau: 100, lot: '5101', prix: 79, v: 'v3', b: 'b2', mode: 'envoi', statut: 'versee', payee: [-14, 20, 0], envoyee: [-13, 9, 0], livree: [-11, 16, 0], conclue: [-10, 9, 15], versee: [-9, 8, 0], suivi: {numero: 'MR 4801 5548', etapes: [[-13, 9, 0, 'Déposé en point relais, Bordeaux'], [-11, 16, 0, 'Retiré par le destinataire, Paris 9e']]}},
  {id: 'c3004', ph: 'a115', p: 'alien', ml: 60, niveau: 70, lot: '23Z41', prix: 52, v: 'v7', b: 'b3', mode: 'main', statut: 'versee', payee: [-11, 18, 30], conclue: [-11, 18, 52], versee: [-10, 8, 0]},
  {id: 'c3003', ph: 'a121', p: 'khamrah', ml: 100, niveau: 95, lot: 'L230914', prix: 30, v: 'v6', b: 'b4', mode: 'envoi', statut: 'annulee', payee: [-13, 15, 0], annulee: [-8, 15, 0], raison: 'Pas d\'envoi dans les 5 jours'},
  {id: 'c3002', ph: 'a117', p: 'terre-d-hermes', ml: 100, niveau: 90, lot: '23M04', prix: 75, v: 'v4', b: 'b6', mode: 'envoi', statut: 'remboursee', payee: [-20, 11, 0], envoyee: [-19, 17, 0], livree: [-17, 12, 0], remboursee: [-12, 14, 5], raison: 'Arrivé cassé : remboursé par l\'assurance du transporteur, vendeur payé', suivi: {numero: 'MR 4790 3315', etapes: [[-19, 17, 0, 'Déposé en point relais, Lille'], [-17, 12, 0, 'Retiré par le destinataire, Strasbourg']]}},
  {id: 'c3001', ph: 'a120', p: 'philosykos', ml: 100, niveau: 55, lot: '24E11', prix: 60, v: 'v3', b: 'b5', mode: 'envoi', statut: 'versee', payee: [-24, 10, 0], envoyee: [-23, 15, 0], livree: [-21, 11, 0], conclue: [-19, 9, 0], versee: [-18, 8, 0], suivi: {numero: 'MR 4785 9901', etapes: [[-23, 15, 0, 'Déposé en point relais, Bordeaux'], [-21, 11, 0, 'Retiré par le destinataire, Montpellier']]}},
];

/* les réclamations des acheteurs. recu : photos envoyées par l'acheteur (rendues dans photos/) */
const LITIGES = [
  {id: 'l504', c: 'c3010', motif: 'jamais_recu', statut: 'enquete', ouvert: [-1, 9, 14], acheteur: 'Mon colis n\'a pas bougé depuis 10 jours, le suivi est bloqué au centre de tri de Lille.'},
  {id: 'l502', c: 'c3007', motif: 'contrefacon', statut: 'a_trancher', ouvert: [-3, 20, 40], acheteur: 'L\'odeur disparaît au bout d\'une heure, et le code lot sous le flacon n\'est pas celui des photos de l\'annonce.', vendeur: 'C\'est le flacon que j\'ai acheté chez Sephora, je ne comprends pas.', repondu: [-2, 12, 5], recu: [{cle: 'l502-recu', vue: 'face', texte: 'Le flacon reçu'}, {cle: 'l502-dessous', vue: 'dessous', texte: 'Le dessous du flacon reçu : code lot 9Z99'}], lotRecu: '9Z99', rendus: [{cle: 'l502-recu', vue: 'face', niveau: 58}, {cle: 'l502-dessous', vue: 'dessous', niveau: 58, lot: '9Z99'}]},
  {id: 'l501', c: 'c3008', motif: 'niveau', statut: 'attente_vendeur', ouvert: [-1, 18, 30], acheteur: 'Il reste à peine la moitié, pas 70 % comme sur l\'annonce. Photo jointe, flacon posé bien droit.', recu: [{cle: 'l501-recu', vue: 'face', texte: 'Le flacon reçu, posé bien droit'}], rendus: [{cle: 'l501-recu', vue: 'face', niveau: 46}]},
  {id: 'l503', c: 'c3002', motif: 'casse', statut: 'clos', decision: 'assurance', ouvert: [-17, 13, 0], clos: [-12, 14, 5], acheteur: 'Le flacon est arrivé cassé, le carton était écrasé.'},
];

/* les maisons déjà ajoutées par l'équipe, d'après des propositions de vendeurs */
const MAISONS_AJOUTEES_BASE = [{nom: 'Maison Crivelli', le: [-4, 8, 31], par: 'equipe:ines', proposee: 'hugo_collection'}];

/* le journal d'avant : ce que l'équipe a fait ces derniers jours (affiché, pas rejoué : les données en tiennent compte) */
const JOURNAL_BASE = [
  {t: [-12, 14, 5], par: 'equipe:tom', texte: 'a tranché le litige l503 : remboursé par l\'assurance du transporteur, vendeur payé', lien: 'litiges/l503'},
  {t: [-8, 15, 0], par: 'equipe:tom', texte: 'a annulé la commande c3003 : pas d\'envoi en 5 jours, acheteur remboursé', lien: 'commandes/c3003'},
  {t: [-4, 8, 31], par: 'equipe:ines', texte: 'a ajouté la maison « Maison Crivelli » à la liste (proposée par @hugo_collection)', lien: 'maisons'},
  {t: [-2, 12, 20], par: 'equipe:tom', texte: 'a demandé sa version au vendeur pour le litige l502', lien: 'litiges/l502'},
  {t: [0, 8, 5], par: 'equipe:ines', texte: 'a publié l\'annonce Gypsy Water de @yanis_b', lien: 'annonces'},
];
