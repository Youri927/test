// Aperçu rapide de tous les cadrages (peu de passes) : node apercu.cjs
const VUES = require('./vues.cjs');
for (const v of Object.values(VUES)) v.echantillons = 6;
require.cache[require.resolve('./vues.cjs')].exports = VUES;
require('./rendre.cjs');
