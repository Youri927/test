/* L'exemple de démonstration (repris du prototype) : un flacon rendu en 3D, sans marque reproduite, qui sert à
   montrer ce qu'on vérifie (« point par point », le guide, « Comment ça marche »). Il est toujours présenté comme un
   exemple : aucune annonce n'est inventée. Images dans public/demo. */
export const DEMO = {
  id: 'a101',
  ml: 70,
  etat: 'entame',
  niveau: 85,
  boite: true,
  lot: '3A21',
  prix: 189,
  fond: '#EDE7E1',
};
export const DEMO_PARFUM = {
  id: 'baccarat-rouge-540',
  maison: 'Maison Francis Kurkdjian',
  nom: 'Baccarat Rouge 540',
  conc: 'Eau de parfum',
  forme: 'facette',
  jus: '#E2A985',
  bouchon: '#B79B62',
  formats: [{ml: 35, neuf: 215}, {ml: 70, neuf: 325}, {ml: 200, neuf: 650}],
};
export const LEGENDES: Record<string, string> = {
  face: 'le flacon de face',
  dessous: 'le dessous du flacon et le code lot',
  niveau: 'le niveau',
  preuve: 'le flacon avec le pseudo du vendeur et la date',
  dessus: 'le flacon sans bouchon, vu de dessus, avec le spray',
  tige: 'le flacon sans le bouton spray, la tige visible',
  boite: 'la boîte',
  ticket: 'le ticket d\'achat',
};
export const demoSrc = (vue: string, id = DEMO.id) => (vue === 'ticket' ? '/demo/ticket.webp' : `/demo/${id}-${vue}.webp`);
