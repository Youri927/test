/* Données du prototype.
   Le catalogue reprend de vrais parfums (maison, nom, année) pour que le site se lise comme le vrai. Les prix neufs
   sont indicatifs. Les annonces, les vendeurs et les avis sont inventés. Les visuels sont dessinés : ils tiennent la
   place des photos que les vendeurs prendront. */

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

const VENDEURS = {
  v1: {pseudo: 'lea.parfums', ville: 'Paris 17e', note: 4.9, avis: 86, ventes: 112, reponse: 'en moins d\'1 h', depuis: 'mars 2026'},
  v2: {pseudo: 'yanis_b', ville: 'Lyon 7e', note: 5.0, avis: 31, ventes: 41, reponse: 'en 2 h', depuis: 'avril 2026'},
  v3: {pseudo: 'ines.m', ville: 'Bordeaux', note: 4.8, avis: 7, ventes: 9, reponse: 'dans la journée', depuis: 'juin 2026'},
  v4: {pseudo: 'hugo_collection', ville: 'Lille', note: 4.9, avis: 52, ventes: 64, reponse: 'en 1 h', depuis: 'mars 2026'},
  v5: {pseudo: 'sarah.k', ville: 'Marseille 6e', note: 4.7, avis: 12, ventes: 15, reponse: 'dans la journée', depuis: 'mai 2026'},
  v6: {pseudo: 'mathis.d', ville: 'Nantes', note: null, avis: 0, ventes: 0, reponse: 'en 3 h', depuis: 'novembre 2026'},
  v7: {pseudo: 'camille.r', ville: 'Paris 11e', note: 5.0, avis: 19, ventes: 23, reponse: 'en 1 h', depuis: 'avril 2026'},
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
