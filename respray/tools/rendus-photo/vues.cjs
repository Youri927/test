// Les images à rendre : nom du fichier → réglages de la scène. Flacons, maisons et noms de parfums sont inventés.
// Le flacon d'exemple (a101) : « Ambre 27 » d'« Atelier Séverin », 70 ml, entamé (~85 %), avec sa boîte.
const PI = Math.PI;
const A101 = {l: 2.2, h: 2.6, p: 1.3, niveau: 0.85, couleur: '#E2A985', bouchon: 'laiton', maison: 'ATELIER SÉVERIN', nom: 'AMBRE 27', ml: 70, lot: '3A21'};

// un flacon de face, cadré selon sa hauteur (corps + bouchon)
const face = (f, extra = {}) => {
  const haut = f.h + 1.2;
  return {...f, cam: [0.45, haut * 0.55, haut * 3.5], vise: [0, haut * 0.48, 0], fov: 22, ...extra};
};

module.exports = {
  'a101-face': face(A101),
  // le niveau : la surface du jus au milieu de l'image
  'a101-niveau': {...A101, cam: [0.3, 2.09, 9], vise: [0, 2.09, 0], fov: 16},
  // le dessous : le flacon couché, le fond (et son code lot gravé) face à l'objectif
  'a101-dessous': {...A101, rot: [-PI / 2, 0, 0], pos: [0, 0.65, 0], cam: [0.15, 0.75, 4.2], vise: [0, 0.65, 0], fov: 34},
  // sans le bouchon, vu de dessus : la bague et le bouton spray
  'a101-dessus': {...A101, bouchon: 'aucun', spray: 'bouton', cam: [1.1, 4.9, 3.4], vise: [0, 2.55, 0], fov: 24},
  // sans le bouton : la tige
  'a101-tige': {...A101, bouchon: 'aucun', spray: 'tige', cam: [1.1, 4.9, 3.4], vise: [0, 2.55, 0], fov: 24},
  // la photo preuve : le flacon et le papier avec le pseudo et la date
  'a101-preuve': {...A101, papier: {lignes: ['@lea.parfums', '24/11/2026'], pos: [1.75, 0.64, 0.75], rot: [-0.22, -0.38, 0.02]}, cam: [0.9, 2.1, 13.5], vise: [0.75, 1.55, 0], fov: 25},
  // la boîte, derrière le flacon
  'a101-boite': {...A101, pos: [0.95, 0, 0.7], boite: {pos: [-1.2, 0, -1.1], ry: 0.28}, cam: [0.3, 2.5, 15], vise: [-0.1, 1.9, 0], fov: 25},

  // les autres flacons de l'accueil (de face)
  'a102-face': face({l: 1.55, h: 3.3, p: 1.0, r: 0.12, niveau: 0.7, couleur: '#F1DE96', bouchon: 'noir', maison: 'MAISON VALCOURT', nom: 'NÉROLI', ml: 100}),
  'a103-face': face({forme: 'cylindre', l: 1.9, h: 2.8, niveau: 0.6, couleur: '#E9B3B6', bouchon: 'argent', maison: 'ÉDITIONS LUNE', nom: 'ROSE 9', ml: 50}),
  'a104-face': face({l: 2.6, h: 2.0, p: 1.5, r: 0.22, niveau: 0.92, couleur: '#A9561F', bouchon: 'bois', maison: 'NOVEMBRE', nom: 'CUIR FAUVE', ml: 75, encre: '#f4efe6'}),
  'a106-face': face({l: 2.0, h: 2.75, p: 1.2, niveau: 0.45, couleur: '#CDE2C2', bouchon: 'laiton', maison: 'ATELIER SÉVERIN', nom: 'FIGUIER', ml: 70}),
  'a109-face': face({forme: 'cylindre', l: 1.6, h: 3.1, niveau: 0.75, couleur: '#7E3F22', bouchon: 'noir', maison: 'MAISON VALCOURT', nom: 'BOIS FUMÉ', ml: 100, encre: '#f4efe6'}),

  // l'astuce du niveau : un flacon opaque, la lampe du téléphone collée derrière
  contrejour: {l: 2.1, h: 2.7, p: 1.2, niveau: 0.55, couleur: '#5a3418', teinte: '#1a1714', bouchon: 'noir', maison: 'NOVEMBRE', nom: 'NUIT', ml: 100, encre: '#d9d2c6',
    sombre: true, lumiere: 0.5, fond: '#2a2826', contrejour: [0, 1.55, -0.7], nom: '', maison: '', cam: [0.3, 2.1, 13], vise: [0, 1.9, 0], fov: 22},

  // la porte « Vendre » (600 × 800), sans bouchon : la brume part de la buse
  vendre: {...A101, bouchon: 'aucun', spray: 'bouton', fond: '#e9e8ee', l_img: 600, h_img: 800, cam: [0.4, 2.0, 12.5], vise: [0.35, 1.55, 0], fov: 24},
  'vendre-sombre': {...A101, bouchon: 'aucun', spray: 'bouton', fond: '#2b2a27', lumiere: 0.85, l_img: 600, h_img: 800, cam: [0.4, 2.0, 12.5], vise: [0.35, 1.55, 0], fov: 24},
};
for (const v of Object.values(module.exports)) v.echantillons = v.echantillons ?? 110;
