/* Scento répond en anglais : les notes, les familles, les saisons et les moments, en français. Une note absente du
   dictionnaire reste en anglais (on l'ajoute ici le jour où on la voit). */
const NOTES: Record<string, string> = {
  'akigalawood': 'akigalawood', 'aldehydes': 'aldéhydes', 'almond': 'amande', 'amber': 'ambre', 'amberwood': 'bois ambré', 'ambergris': 'ambre gris', 'ambrette': 'ambrette',
  'ambroxan': 'ambroxan', 'angelica': 'angélique', 'anise': 'anis', 'apple': 'pomme', 'apricot': 'abricot', 'aquatic notes': 'notes aquatiques', 'artemisia': 'armoise',
  'basil': 'basilic', 'bay leaf': 'laurier', 'benzoin': 'benjoin', 'bergamot': 'bergamote', 'birch': 'bouleau', 'bitter orange': 'orange amère', 'black pepper': 'poivre noir',
  'blackberry': 'mûre', 'blackcurrant': 'cassis', 'blood orange': 'orange sanguine', 'cacao': 'cacao', 'cocoa': 'cacao', 'caramel': 'caramel', 'cardamom': 'cardamome',
  'carrot seed': 'graine de carotte', 'cashmeran': 'cashmeran', 'cashmere wood': 'bois de cachemire', 'cedar': 'cèdre', 'cedarwood': 'cèdre', 'chamomile': 'camomille',
  'cherry': 'cerise', 'chocolate': 'chocolat', 'cinnamon': 'cannelle', 'citrus': 'agrumes', 'civet': 'civette', 'clary sage': 'sauge sclarée', 'clove': 'clou de girofle',
  'coconut': 'noix de coco', 'coffee': 'café', 'coriander': 'coriandre', 'cumin': 'cumin', 'cypress': 'cyprès', 'dates': 'dattes', 'davana': 'davana', 'elemi': 'élémi',
  'fig': 'figue', 'fig leaf': 'feuille de figuier', 'fir': 'sapin', 'fir balsam': 'baume de sapin', 'floral notes': 'notes florales', 'frankincense': 'encens', 'freesia': 'freesia',
  'fruit': 'fruits', 'fruity notes': 'notes fruitées', 'galbanum': 'galbanum', 'gardenia': 'gardénia', 'geranium': 'géranium', 'ginger': 'gingembre', 'grapefruit': 'pamplemousse',
  'grass': 'herbe', 'green leaves': 'feuilles vertes', 'green notes': 'notes vertes', 'guaiac wood': 'gaïac', 'hay': 'foin', 'hazelnut': 'noisette', 'heliotrope': 'héliotrope',
  'honey': 'miel', 'honeysuckle': 'chèvrefeuille', 'incense': 'encens', 'iris': 'iris', 'orris': 'iris', 'jasmine': 'jasmin', 'jasmine sambac': 'jasmin sambac', 'juniper': 'genièvre',
  'labdanum': 'labdanum', 'lavender': 'lavande', 'leather': 'cuir', 'lemon': 'citron', 'lily': 'lys', 'lily of the valley': 'muguet', 'lime': 'citron vert', 'lychee': 'litchi',
  'magnolia': 'magnolia', 'mahonial': 'mahonial', 'mandarin': 'mandarine', 'mandarin orange': 'mandarine', 'mango': 'mangue', 'marine notes': 'notes marines', 'mimosa': 'mimosa',
  'mint': 'menthe', 'moss': 'mousse', 'oakmoss': 'mousse de chêne', 'musk': 'musc', 'white musk': 'musc blanc', 'myrrh': 'myrrhe', 'neroli': 'néroli', 'nutmeg': 'muscade',
  'oud': 'oud', 'agarwood': 'oud', 'opoponax': 'opoponax', 'orange': 'orange', 'orange blossom': 'fleur d\'oranger', 'osmanthus': 'osmanthus', 'papyrus': 'papyrus',
  'patchouli': 'patchouli', 'peach': 'pêche', 'pear': 'poire', 'peony': 'pivoine', 'pepper': 'poivre', 'pink pepper': 'poivre rose', 'petitgrain': 'petit-grain',
  'pine': 'pin', 'pine needle': 'aiguilles de pin', 'pineapple': 'ananas', 'pistachio': 'pistache', 'plum': 'prune', 'praline': 'praliné', 'raspberry': 'framboise',
  'red berries': 'fruits rouges', 'rhubarb': 'rhubarbe', 'rose': 'rose', 'damask rose': 'rose de Damas', 'turkish rose': 'rose turque', 'rosemary': 'romarin', 'rum': 'rhum',
  'saffron': 'safran', 'sage': 'sauge', 'salt': 'sel', 'sea salt': 'sel marin', 'sandalwood': 'santal', 'smoke': 'fumée', 'spice': 'épices', 'spices': 'épices',
  'star anise': 'anis étoilé', 'strawberry': 'fraise', 'styrax': 'styrax', 'suede': 'daim', 'sugar': 'sucre', 'tea': 'thé', 'black tea': 'thé noir', 'thyme': 'thym',
  'tobacco': 'tabac', 'tobacco leaf': 'feuille de tabac', 'tonka bean': 'fève tonka', 'tuberose': 'tubéreuse', 'vanilla': 'vanille', 'vetiver': 'vétiver', 'violet': 'violette',
  'violet leaf': 'feuille de violette', 'water lily': 'nénuphar', 'whisky': 'whisky', 'ylang-ylang': 'ylang-ylang', 'ylang ylang': 'ylang-ylang', 'woody notes': 'notes boisées',
  'white flowers': 'fleurs blanches', 'yuzu': 'yuzu', 'ambrette seed': 'graine d\'ambrette', 'cistus': 'ciste', 'immortelle': 'immortelle', 'olibanum': 'oliban',
  'calone': 'calone (note marine)', 'hedione': 'hédione', 'algae': 'algues', 'seaweed': 'algues', 'ozonic notes': 'notes ozoniques',
};
export const noteFr = (n: string) => NOTES[n.trim().toLowerCase()] ?? n.trim().toLowerCase();

/* les 14 familles de Scento, en français, avec la couleur de Respray (les mêmes 4 que le formulaire de vente) */
const FAMILLES: Record<string, [string, string]> = {
  'Sunlit Citrus': ['Hespéridée', 'fam-fraiche'], 'Green Leaf': ['Verte et aromatique', 'fam-fraiche'], 'Salt & Mineral': ['Marine et minérale', 'fam-fraiche'],
  'Orchard Fruit': ['Fruitée', 'fam-florale'], 'Petal Garden': ['Florale', 'fam-florale'], 'White Bloom': ['Fleurs blanches', 'fam-florale'], 'Powder Veil': ['Poudrée', 'fam-florale'],
  'Spice Route': ['Épicée', 'fam-chaude'], 'Amber & Resin': ['Ambrée', 'fam-chaude'], 'Velvet Sweet': ['Gourmande', 'fam-chaude'], 'Skin Musk': ['Musquée', 'fam-chaude'],
  'Wood & Root': ['Boisée', 'fam-boisee'], 'Smoke & Leather': ['Cuir et fumée', 'fam-boisee'], 'Oud Court': ['Oud', 'fam-boisee'],
};
export const familleFr = (f?: string | null) => (f ? FAMILLES[f]?.[0] ?? f : '');
export const familleClasse = (f?: string | null) => (f ? FAMILLES[f]?.[1] ?? 'fam-boisee' : 'fam-boisee');

const SAISONS: Record<string, string> = {spring: 'printemps', summer: 'été', autumn: 'automne', fall: 'automne', winter: 'hiver'};
const MOMENTS: Record<string, string> = {day: 'le jour', evening: 'le soir', night: 'la nuit'};
const liste = (l: string[]) => (l.length > 1 ? `${l.slice(0, -1).join(', ')} et ${l[l.length - 1]}` : l[0] ?? '');
export function aPorter(saisons: string[], moments: string[]) {
  const s = saisons.map((x) => SAISONS[x] ?? x);
  const m = moments.map((x) => MOMENTS[x] ?? x);
  const quand = s.length >= 4 ? 'toute l\'année' : liste(s);
  return [quand, m.length >= 2 ? `${m.slice(0, -1).join(', ')} comme ${m[m.length - 1]}` : m[0]].filter(Boolean).join(', ');
}
