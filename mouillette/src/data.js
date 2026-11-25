/* Mouillette : données du prototype.
   Le catalogue reprend de vrais parfums (maison, nom, année, parfumeur, notes) pour que le prototype se lise comme le
   vrai site. Les prix neufs sont indicatifs. Les annonces, les vendeurs, les cotes, les codes lot et les passeports
   sont fictifs. Les flacons sont dessinés, de formes génériques : aucun visuel de marque. */

const DENSITE = 0.86; // g/ml, densité moyenne d'un parfum alcoolique, pour passer d'une pesée à des millilitres

const PARFUMS = [
  {
    id: 'baccarat-rouge-540', maison: 'Maison Francis Kurkdjian', nom: 'Baccarat Rouge 540', conc: 'Eau de parfum',
    annee: 2015, parfumeur: 'Francis Kurkdjian', famille: 'Ambrée florale',
    notes: {tete: ['safran', 'jasmin'], coeur: ['ambre gris', 'cèdre'], fond: ['résine de sapin', 'ambroxan']},
    formats: [{ml: 35, vide: 162, neuf: 215}, {ml: 70, vide: 256, neuf: 325}, {ml: 200, vide: 478, neuf: 650}],
    cote: 3.35, tendance: 4, ventes90: 61, tenue: 5, sillage: 5, forme: 'facette', jus: '#E6B08C', bouchon: '#B9A06A',
    ean: '3700559603109',
    aSavoir: "L'Extrait de parfum a sa propre fiche : flacon, code-barres et cote différents. Une annonce « Eau de parfum » rattachée à la fiche Extrait est refusée.",
  },
  {
    id: 'santal-33', maison: 'Le Labo', nom: 'Santal 33', conc: 'Eau de parfum', annee: 2011, parfumeur: 'Frank Voelkl',
    famille: 'Boisée', notes: {tete: ['cardamome', 'iris', 'violette'], coeur: ['ambrox', 'santal australien', 'papyrus'], fond: ['cèdre', 'cuir', 'musc']},
    formats: [{ml: 50, vide: 176, neuf: 225}, {ml: 100, vide: 264, neuf: 320}],
    cote: 2.25, tendance: 1, ventes90: 38, tenue: 4, sillage: 4, forme: 'apothicaire', jus: '#E8DFC6', bouchon: '#1E1E21',
    ean: '0842185107223',
    aSavoir: "L'étiquette porte la date et la ville où le flacon a été préparé : elle est lue à la vérification et doit correspondre au code lot.",
  },
  {
    id: 'delina', maison: 'Parfums de Marly', nom: 'Delina', conc: 'Eau de parfum', annee: 2017, parfumeur: 'Quentin Bisch',
    famille: 'Florale fruitée', notes: {tete: ['litchi', 'rhubarbe', 'bergamote'], coeur: ['rose turque', 'pivoine', 'vanille'], fond: ['cachemire', 'cèdre', 'vétiver', 'encens']},
    formats: [{ml: 30, vide: 121, neuf: 145}, {ml: 75, vide: 282, neuf: 305}],
    cote: 2.7, tendance: 0, ventes90: 33, tenue: 4, sillage: 4, forme: 'galet', jus: '#F2B5C5', bouchon: '#C9C2B4',
    ean: '3700578502148',
  },
  {
    id: 'naxos', maison: 'Xerjoff', nom: 'Naxos', conc: 'Eau de parfum', annee: 2015, parfumeur: 'Chris Maurice',
    famille: 'Ambrée aromatique', notes: {tete: ['lavande', 'bergamote', 'citron'], coeur: ['miel', 'cannelle', 'cachemire', 'jasmin'], fond: ['tabac', 'fève tonka', 'vanille']},
    formats: [{ml: 50, vide: 214, neuf: 195}, {ml: 100, vide: 332, neuf: 255}],
    cote: 1.95, tendance: 3, ventes90: 27, tenue: 5, sillage: 4, forme: 'carre', jus: '#D7892C', bouchon: '#C2A25E',
    ean: '8033488155780',
  },
  {
    id: 'portrait-of-a-lady', maison: 'Frédéric Malle', nom: 'Portrait of a Lady', conc: 'Eau de parfum', annee: 2010,
    parfumeur: 'Dominique Ropion', famille: 'Ambrée florale', notes: {tete: ['rose turque', 'framboise', 'cassis'], coeur: ['patchouli', 'encens', 'santal'], fond: ['musc', 'ambre', 'benjoin']},
    formats: [{ml: 50, vide: 198, neuf: 270}, {ml: 100, vide: 309, neuf: 390}],
    cote: 2.6, tendance: 2, ventes90: 19, tenue: 5, sillage: 5, forme: 'tour', jus: '#E7A877', bouchon: '#232326',
    ean: '3700135000148',
  },
  {
    id: 'gypsy-water', maison: 'Byredo', nom: 'Gypsy Water', conc: 'Eau de parfum', annee: 2008, parfumeur: 'Jérôme Épinette',
    famille: 'Boisée aromatique', notes: {tete: ['bergamote', 'citron', 'poivre', 'genièvre'], coeur: ['encens', 'aiguilles de pin', 'iris'], fond: ['ambre', 'vanille', 'santal']},
    formats: [{ml: 50, vide: 212, neuf: 190}, {ml: 100, vide: 331, neuf: 270}],
    cote: 1.85, tendance: -2, ventes90: 24, tenue: 3, sillage: 3, forme: 'cylindre', jus: '#EDE5CF', bouchon: '#2A2A2D',
    ean: '7340032806052',
  },
  {
    id: 'tobacco-vanille', maison: 'Tom Ford', nom: 'Tobacco Vanille', conc: 'Eau de parfum', annee: 2007,
    parfumeur: 'Olivier Gillotin', famille: 'Ambrée épicée', notes: {tete: ['feuille de tabac', 'épices'], coeur: ['vanille', 'fève tonka', 'fleur de tabac', 'cacao'], fond: ['fruits secs', 'bois']},
    formats: [{ml: 50, vide: 243, neuf: 285}, {ml: 100, vide: 362, neuf: 410}],
    cote: 3.4, tendance: 2, ventes90: 22, tenue: 5, sillage: 5, forme: 'carre', jus: '#A65B26', bouchon: '#3A2A20',
    ean: '0888066000512',
  },
  {
    id: 'shalimar', maison: 'Guerlain', nom: 'Shalimar', conc: 'Eau de parfum', annee: 1925, parfumeur: 'Jacques Guerlain',
    famille: 'Ambrée', notes: {tete: ['bergamote', 'citron'], coeur: ['iris', 'jasmin', 'rose'], fond: ['vanille', 'fève tonka', 'encens', 'opopanax']},
    formats: [{ml: 50, vide: 231, neuf: 125}, {ml: 90, vide: 329, neuf: 165}],
    cote: 1.25, tendance: 2, ventes90: 29, tenue: 5, sillage: 4, forme: 'galet', jus: '#C88934', bouchon: '#2C3E6B',
    ean: '3346470144436',
    aSavoir: "Les flacons anciens ont leur propre cote, affichée à part : leur formule n'est pas celle d'aujourd'hui. Un flacon est dit vintage quand son code lot date d'avant 2000.",
  },
  {
    id: 'coco-mademoiselle', maison: 'Chanel', nom: 'Coco Mademoiselle', conc: 'Eau de parfum', annee: 2001,
    parfumeur: 'Jacques Polge', famille: 'Chyprée florale', notes: {tete: ['orange', 'bergamote'], coeur: ['rose', 'jasmin'], fond: ['patchouli', 'vétiver', 'vanille', 'musc blanc']},
    formats: [{ml: 35, vide: 151, neuf: 110}, {ml: 50, vide: 192, neuf: 135}, {ml: 100, vide: 302, neuf: 185}],
    cote: 1.3, tendance: -1, ventes90: 44, tenue: 4, sillage: 4, forme: 'carre', jus: '#F1C1A6', bouchon: '#D7D3CB',
    ean: '3145891164605',
  },
  {
    id: 'alien', maison: 'Mugler', nom: 'Alien', conc: 'Eau de parfum', annee: 2005,
    parfumeur: 'Dominique Ropion et Laurent Bruyère', famille: 'Florale boisée', notes: {tete: ['jasmin sambac'], coeur: ['bois de cachemire'], fond: ['ambre blanc']},
    formats: [{ml: 30, vide: 148, neuf: 95}, {ml: 60, vide: 238, neuf: 135}, {ml: 90, vide: 311, neuf: 170}],
    cote: 1.4, tendance: 0, ventes90: 36, tenue: 5, sillage: 5, forme: 'facette', jus: '#7C52C2', bouchon: '#B9BCC5',
    ean: '3439600056075',
    aSavoir: "Flacon rechargeable : l'évaluation olfactive de l'Atelier vérifie qu'il n'a pas été rempli avec un autre jus.",
  },
  {
    id: 'libre', maison: 'Yves Saint Laurent', nom: 'Libre', conc: 'Eau de parfum', annee: 2019,
    parfumeur: 'Anne Flipo et Carlos Benaïm', famille: 'Florale ambrée', notes: {tete: ['lavande', 'mandarine', 'cassis'], coeur: ['fleur d\'oranger', 'jasmin'], fond: ['vanille', 'musc', 'cèdre', 'ambre gris']},
    formats: [{ml: 50, vide: 209, neuf: 125}, {ml: 90, vide: 301, neuf: 160}],
    cote: 1.15, tendance: -3, ventes90: 41, tenue: 4, sillage: 4, forme: 'tour', jus: '#F0C788', bouchon: '#C9A85B',
    ean: '3614272648425',
  },
  {
    id: 'terre-d-hermes', maison: 'Hermès', nom: "Terre d'Hermès", conc: 'Eau de toilette', annee: 2006,
    parfumeur: 'Jean-Claude Ellena', famille: 'Boisée', notes: {tete: ['orange', 'pamplemousse'], coeur: ['poivre', 'géranium', 'silex'], fond: ['vétiver', 'cèdre', 'benjoin']},
    formats: [{ml: 50, vide: 219, neuf: 95}, {ml: 100, vide: 331, neuf: 130}],
    cote: 0.95, tendance: -1, ventes90: 31, tenue: 4, sillage: 3, forme: 'carre', jus: '#DD9C52', bouchon: '#C47A3A',
    ean: '3346131400017',
  },
  {
    id: 'sauvage', maison: 'Dior', nom: 'Sauvage', conc: 'Eau de toilette', annee: 2015, parfumeur: 'François Demachy',
    famille: 'Aromatique fougère', notes: {tete: ['bergamote', 'poivre'], coeur: ['poivre du Sichuan', 'lavande', 'géranium'], fond: ['ambroxan', 'cèdre', 'labdanum']},
    formats: [{ml: 60, vide: 214, neuf: 92}, {ml: 100, vide: 299, neuf: 125}, {ml: 200, vide: 468, neuf: 190}],
    cote: 0.82, tendance: -6, ventes90: 52, tenue: 4, sillage: 4, forme: 'tour', jus: '#B7C9DE', bouchon: '#2A2C33',
    ean: '3348901250146',
  },
  {
    id: 'philosykos', maison: 'Diptyque', nom: 'Philosykos', conc: 'Eau de toilette', annee: 1996, parfumeur: 'Olivia Giacobetti',
    famille: 'Boisée verte', notes: {tete: ['feuille de figuier'], coeur: ['figue', 'lait de figue'], fond: ['bois de figuier', 'cèdre']},
    formats: [{ml: 50, vide: 201, neuf: 110}, {ml: 100, vide: 309, neuf: 160}],
    cote: 1.1, tendance: 1, ventes90: 17, tenue: 3, sillage: 3, forme: 'galet', jus: '#DCE2C1', bouchon: '#1F1F22',
    ean: '3700431400017',
  },
  {
    id: 'khamrah', maison: 'Lattafa', nom: 'Khamrah', conc: 'Eau de parfum', annee: 2022, parfumeur: 'Non communiqué',
    famille: 'Ambrée gourmande', notes: {tete: ['cannelle', 'muscade', 'bergamote'], coeur: ['dattes', 'praliné', 'tubéreuse'], fond: ['vanille', 'fève tonka', 'benjoin', 'myrrhe']},
    formats: [{ml: 100, vide: 358, neuf: 39}],
    cote: 0.28, tendance: -8, ventes90: 48, tenue: 4, sillage: 5, forme: 'facette', jus: '#C26826', bouchon: '#B69145',
    ean: '6291108735411',
    aSavoir: 'Parfum très copié : le code-barres, la gravure du bouchon et le sertissage sont comparés aux flacons de référence.',
  },
];

const VENDEURS = {
  v1: {pseudo: 'Léa P.', ville: 'Paris 17e', depuis: 'mars 2026', ventes: 112, envoi: 0.6, conformite: 99.1, nezFondateur: true},
  v2: {pseudo: 'Yanis B.', ville: 'Lyon 7e', depuis: 'avril 2026', ventes: 41, envoi: 0.8, conformite: 100},
  v3: {pseudo: 'Inès M.', ville: 'Bordeaux', depuis: 'juin 2026', ventes: 9, envoi: 1.9, conformite: 100},
  v4: {pseudo: 'Hugo L.', ville: 'Lille', depuis: 'mars 2026', ventes: 64, envoi: 1.0, conformite: 98.4},
  v5: {pseudo: 'Sarah K.', ville: 'Marseille 6e', depuis: 'mai 2026', ventes: 15, envoi: 2.3, conformite: 100},
  v6: {pseudo: 'Mathis D.', ville: 'Nantes', depuis: 'novembre 2026', ventes: 0, envoi: null, conformite: null},
  v7: {pseudo: 'Camille R.', ville: 'Paris 11e', depuis: 'avril 2026', ventes: 23, envoi: 1.2, conformite: 100},
  atelier: {pseudo: 'Conciergerie Mouillette', ville: 'Paris 10e (Atelier)', depuis: 'mars 2026', ventes: 318, envoi: 0.4, conformite: 100, conciergerie: true},
};

/* niveau : 'controle' (photos, pesée et code lot contrôlés), 'atelier' (authentifié à l'Atelier), 'passeport' (authentifié, scellé et puce NFC)
   restant : millilitres mesurés ; scelle : neuf sous blister ; jours : depuis la mise en ligne */
const ANNONCES = [
  {id: 'm4127', p: 'baccarat-rouge-540', ml: 70, restant: 61, scelle: false, boite: true, lot: '3A21', prod: 'mars 2023', niveau: 'passeport', prix: 189, v: 'v1', mainPropre: true, jours: 1, scelleNo: 'MO-004127', poids: 308.6},
  {id: 'm4131', p: 'baccarat-rouge-540', ml: 70, restant: 70, scelle: true, boite: true, lot: '4K08', prod: 'novembre 2024', niveau: 'atelier', prix: 249, v: 'atelier', mainPropre: false, jours: 2},
  {id: 'm4098', p: 'baccarat-rouge-540', ml: 35, restant: 22, scelle: false, boite: false, lot: '2F14', prod: 'juin 2022', niveau: 'controle', prix: 79, v: 'v5', mainPropre: true, jours: 6, poids: 180.9},
  {id: 'm4102', p: 'baccarat-rouge-540', ml: 200, restant: 148, scelle: false, boite: true, lot: '3C02', prod: 'mars 2023', niveau: 'passeport', prix: 455, v: 'v4', mainPropre: false, jours: 4, scelleNo: 'MO-003988', poids: 605.3},
  {id: 'm4140', p: 'santal-33', ml: 100, restant: 83, scelle: false, boite: false, lot: '28/06/24 NYC', prod: 'juin 2024', niveau: 'atelier', prix: 172, v: 'v2', mainPropre: true, jours: 1, poids: 335.4},
  {id: 'm4117', p: 'santal-33', ml: 50, restant: 31, scelle: false, boite: false, lot: '11/02/24 PAR', prod: 'février 2024', niveau: 'controle', prix: 74, v: 'v7', mainPropre: true, jours: 3, poids: 202.7},
  {id: 'm4089', p: 'santal-33', ml: 100, restant: 100, scelle: true, boite: true, lot: '03/09/25 LON', prod: 'septembre 2025', niveau: 'passeport', prix: 255, v: 'atelier', mainPropre: false, jours: 8, scelleNo: 'MO-003871'},
  {id: 'm4135', p: 'delina', ml: 75, restant: 52, scelle: false, boite: true, lot: '23B117', prod: 'avril 2023', niveau: 'atelier', prix: 129, v: 'v3', mainPropre: false, jours: 2, poids: 326.7},
  {id: 'm4121', p: 'delina', ml: 30, restant: 30, scelle: true, boite: true, lot: '25A042', prod: 'janvier 2025', niveau: 'controle', prix: 99, v: 'v5', mainPropre: true, jours: 5},
  {id: 'm4129', p: 'naxos', ml: 100, restant: 78, scelle: false, boite: true, lot: 'XJ2309', prod: 'septembre 2023', niveau: 'passeport', prix: 139, v: 'v4', mainPropre: false, jours: 2, scelleNo: 'MO-004061', poids: 399.1},
  {id: 'm4110', p: 'naxos', ml: 50, restant: 44, scelle: false, boite: false, lot: 'XJ2402', prod: 'février 2024', niveau: 'controle', prix: 89, v: 'v6', mainPropre: true, jours: 4, poids: 251.8},
  {id: 'm4133', p: 'portrait-of-a-lady', ml: 100, restant: 69, scelle: false, boite: true, lot: '2207', prod: 'juillet 2022', niveau: 'atelier', prix: 169, v: 'v1', mainPropre: true, jours: 1, poids: 368.3},
  {id: 'm4096', p: 'portrait-of-a-lady', ml: 50, restant: 47, scelle: false, boite: true, lot: '2311', prod: 'novembre 2023', niveau: 'controle', prix: 129, v: 'v3', mainPropre: false, jours: 7, poids: 238.4},
  {id: 'm4125', p: 'gypsy-water', ml: 100, restant: 64, scelle: false, boite: false, lot: '23062', prod: 'juin 2023', niveau: 'controle', prix: 109, v: 'v2', mainPropre: true, jours: 3, poids: 386.1},
  {id: 'm4138', p: 'gypsy-water', ml: 50, restant: 50, scelle: true, boite: true, lot: '25031', prod: 'mars 2025', niveau: 'atelier', prix: 119, v: 'atelier', mainPropre: false, jours: 1},
  {id: 'm4119', p: 'tobacco-vanille', ml: 50, restant: 37, scelle: false, boite: true, lot: 'A73', prod: 'juillet 2023', niveau: 'passeport', prix: 119, v: 'v7', mainPropre: true, jours: 2, scelleNo: 'MO-004002', poids: 274.9},
  {id: 'm4104', p: 'tobacco-vanille', ml: 100, restant: 91, scelle: false, boite: true, lot: 'B42', prod: 'avril 2024', niveau: 'controle', prix: 319, v: 'v4', mainPropre: false, jours: 9, poids: 440.3},
  {id: 'm4136', p: 'shalimar', ml: 90, restant: 74, scelle: false, boite: true, lot: '3B01', prod: 'février 2023', niveau: 'controle', prix: 85, v: 'v5', mainPropre: true, jours: 1, poids: 392.6},
  {id: 'm4093', p: 'shalimar', ml: 50, restant: 39, scelle: false, boite: true, lot: '7G02', prod: '1997 (vintage)', niveau: 'passeport', prix: 72, v: 'atelier', mainPropre: false, jours: 3, vintage: true, scelleNo: 'MO-003944', poids: 264.5},
  {id: 'm4127b', p: 'coco-mademoiselle', ml: 100, restant: 58, scelle: false, boite: false, lot: '3902', prod: '2023', niveau: 'controle', prix: 69, v: 'v6', mainPropre: true, jours: 2, poids: 351.9},
  {id: 'm4114', p: 'coco-mademoiselle', ml: 50, restant: 50, scelle: true, boite: true, lot: '5101', prod: '2025', niveau: 'atelier', prix: 79, v: 'v3', mainPropre: false, jours: 6},
  {id: 'm4130', p: 'alien', ml: 60, restant: 41, scelle: false, boite: true, lot: '23Z41', prod: 'octobre 2023', niveau: 'atelier', prix: 59, v: 'v7', mainPropre: true, jours: 2, poids: 273.3},
  {id: 'm4108', p: 'alien', ml: 90, restant: 85, scelle: false, boite: true, lot: '24P08', prod: 'août 2024', niveau: 'controle', prix: 109, v: 'v2', mainPropre: false, jours: 5, poids: 384.1},
  {id: 'm4134', p: 'libre', ml: 90, restant: 63, scelle: false, boite: false, lot: '42YS07', prod: 'juillet 2024', niveau: 'controle', prix: 64, v: 'v6', mainPropre: true, jours: 1, poids: 355.2},
  {id: 'm4116', p: 'terre-d-hermes', ml: 100, restant: 88, scelle: false, boite: true, lot: '23M04', prod: 'avril 2023', niveau: 'controle', prix: 79, v: 'v4', mainPropre: false, jours: 4, poids: 406.7},
  {id: 'm4126', p: 'sauvage', ml: 100, restant: 72, scelle: false, boite: false, lot: '3N01', prod: '2023', niveau: 'controle', prix: 52, v: 'v2', mainPropre: true, jours: 2, poids: 361},
  {id: 'm4112', p: 'sauvage', ml: 200, restant: 200, scelle: true, boite: true, lot: '5A02', prod: '2025', niveau: 'atelier', prix: 155, v: 'atelier', mainPropre: false, jours: 7},
  {id: 'm4139', p: 'philosykos', ml: 100, restant: 57, scelle: false, boite: true, lot: '24E11', prod: 'mai 2024', niveau: 'controle', prix: 59, v: 'v3', mainPropre: true, jours: 1, poids: 358},
  {id: 'm4120', p: 'khamrah', ml: 100, restant: 96, scelle: false, boite: true, lot: 'L230914', prod: 'septembre 2023', niveau: 'controle', prix: 27, v: 'v6', mainPropre: true, jours: 3, poids: 440.6},
];

/* l'étagère d'exemple (« Mon étagère ») : ce qu'une utilisatrice possède, ses envies et ses alertes */
const ETAGERE = {
  prenom: 'Camille',
  flacons: [
    {p: 'delina', ml: 75, restant: 41},
    {p: 'libre', ml: 50, restant: 18},
    {p: 'philosykos', ml: 50, restant: 44},
    {p: 'coco-mademoiselle', ml: 35, restant: 30},
  ],
  envies: [
    {p: 'santal-33', seuil: 1.9, niveauMin: 60, verif: 'atelier'},
    {p: 'portrait-of-a-lady', seuil: 2.4, niveauMin: 50, verif: 'controle'},
    {p: 'tobacco-vanille', seuil: 3.0, niveauMin: 70, verif: 'passeport'},
  ],
  echange: {de: 'Hugo L.', propose: {p: 'naxos', ml: 100, restant: 82}, contre: {p: 'delina', ml: 75, restant: 41}, soulte: 15},
};
