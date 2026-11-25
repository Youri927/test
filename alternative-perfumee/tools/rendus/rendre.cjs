// Rend toutes les photos du prototype, en 3D, dans photos/ :
//   - pour chaque annonce (en ligne et à vérifier) : de face, gros plan sur le niveau (la surface du jus au milieu de
//     l'image), dessous (code lot), vue de dessus avec le spray, tige, photo preuve (pseudo et date), boîte s'il y en a ;
//   - les photos des réclamations (back-office), un ticket d'achat, un flacon opaque éclairé par derrière (l'astuce du niveau), et le flacon de la porte
//     « Vendre », sur le gris de cette porte ;
//   - photos/mesures.json : la position de la buse sur la porte « Vendre » (pour y poser la brume).
//
//   cd tools/rendus && npm install && node rendre.cjs
// Il faut Playwright (son Chromium) ; le rendu se fait par le processeur (SwiftShader), sans carte graphique.
const http = require('http');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const {chromium} = require('playwright');

const PROJET = path.resolve(__dirname, '../..');
const SORTIE = path.join(PROJET, 'photos');
fs.mkdirSync(SORTIE, {recursive: true});

// les données du site, telles quelles
const ctx = {};
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(PROJET, 'src/data.js'), 'utf8') + '\nthis.D = {PARFUMS, ANNONCES, VENDEURS, A_VERIFIER, COMMANDES, LITIGES};', ctx);
const {PARFUMS, ANNONCES, VENDEURS, A_VERIFIER, COMMANDES, LITIGES} = ctx.D;
const P = Object.fromEntries(PARFUMS.map((p) => [p.id, p]));

const TYPES = {'.html': 'text/html', '.js': 'text/javascript', '.woff2': 'font/woff2'};
const serveur = http.createServer((req, res) => {
  const f = path.join(PROJET, decodeURIComponent(req.url.split('?')[0]));
  if (!f.startsWith(PROJET) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) {
    res.writeHead(404);
    return res.end();
  }
  res.writeHead(200, {'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream'});
  fs.createReadStream(f).pipe(res);
});

serveur.listen(0, async () => {
  const port = serveur.address().port;
  const navigateur = await chromium.launch({args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader']});
  const page = await navigateur.newPage();
  const erreurs = [];
  page.on('pageerror', (e) => erreurs.push(e.message));
  await page.goto(`http://localhost:${port}/tools/rendus/scene.html`);
  await page.waitForFunction(() => window.pret, null, {timeout: 30000});
  const mesures = {};
  let n = 0;
  const rendre = async (nom, o) => {
    const r = await page.evaluate((x) => window.rendre(x), o);
    fs.writeFileSync(path.join(SORTIE, nom + '.webp'), Buffer.from(r.image.split(',')[1], 'base64'));
    n++;
    return r;
  };
  for (const a of [...ANNONCES, ...A_VERIFIER]) {
    const p = P[a.p];
    const base = {forme: p.forme, jus: p.jus, bouchon: p.bouchon, niveau: a.niveau};
    await rendre(`${a.id}-face`, {...base, vue: 'face'});
    await rendre(`${a.id}-niveau`, {...base, vue: 'niveau'});
    await rendre(`${a.id}-dessous`, {...base, vue: 'dessous', lot: a.lot, ml: a.ml});
    await rendre(`${a.id}-dessus`, {...base, vue: 'dessus'});
    await rendre(`${a.id}-tige`, {...base, vue: 'tige'});
    await rendre(`${a.id}-preuve`, {...base, vue: 'preuve', pseudo: VENDEURS[a.v].pseudo});
    if (a.boite) await rendre(`${a.id}-boite`, {vue: 'boite', lot: a.lot});
    process.stdout.write('.');
  }
  // les photos envoyées par les acheteurs dans leurs réclamations (back-office)
  for (const l of LITIGES) {
    const c = COMMANDES.find((x) => x.id === l.c);
    const p = P[c.p];
    for (const r of l.rendus || []) await rendre(r.cle, {forme: p.forme, jus: p.jus, bouchon: p.bouchon, niveau: r.niveau, vue: r.vue, lot: r.lot, ml: c.ml});
  }
  await rendre('ticket', {vue: 'ticket', nom: P['baccarat-rouge-540'].nom});
  // l'astuce du niveau d'un flacon opaque : la lampe d'un téléphone collée derrière
  await rendre('contrejour', {vue: 'contrejour', forme: 'carre', jus: '#E4A171', bouchon: '#B79B62', niveau: 58, fond: '#2c2c2f'});
  const libre = P.libre;
  const v = await rendre('vendre', {forme: libre.forme, jus: libre.jus, bouchon: libre.bouchon, niveau: 70, vue: 'vendre', fond: '#e8e8ed', w: 600, h: 800});
  mesures.buse = {x: Math.round(v.buse.x * 1000) / 1000, y: Math.round(v.buse.y * 1000) / 1000};
  // le même, sur la porte « Vendre » du mode sombre
  await rendre('vendre-sombre', {forme: libre.forme, jus: libre.jus, bouchon: libre.bouchon, niveau: 70, vue: 'vendre', fond: '#2b2a27', w: 600, h: 800});
  fs.writeFileSync(path.join(SORTIE, 'mesures.json'), JSON.stringify(mesures, null, 1) + '\n');
  const poids = fs.readdirSync(SORTIE).reduce((s, f) => s + fs.statSync(path.join(SORTIE, f)).size, 0);
  console.log(`\n${n} photos, ${Math.round(poids / 1024)} Ko, dans photos/`, erreurs.length ? erreurs : '');
  await navigateur.close();
  serveur.close();
});
