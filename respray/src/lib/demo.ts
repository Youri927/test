/* L'exemple de démonstration : Bois Impérial d'Essential Parfums (photos dans tools/exemple), toujours présenté comme un exemple, qui sert à
   montrer ce qu'on vérifie (« point par point », le guide, « Comment ça marche »). Il est toujours présenté comme un
   exemple : aucune annonce n'est inventée. Images dans public/demo. */
export const DEMO = {
  id: 'a101',
  ml: 100,
  etat: 'entame',
  niveau: 85,
  boite: true,
  lot: '3A21',
  prix: 85,
  fond: '#EDE7E1',
};
export const DEMO_PARFUM = {
  id: 'bois-imperial',
  maison: 'Essential Parfums', // le flacon des photos d'exemple (tools/exemple)
  nom: 'Bois Impérial',
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
/* les images d'exemple sont gardées en cache par les navigateurs : quand on en change une, on augmente VERSION
   pour que tout le monde voie la nouvelle tout de suite */
const VERSION = 3;
export const demo = (fichier: string) => `/demo/${fichier}?v=${VERSION}`;
export const demoSrc = (vue: string, id = DEMO.id) => demo(vue === 'ticket' ? 'ticket.webp' : `${id}-${vue}.webp`);
