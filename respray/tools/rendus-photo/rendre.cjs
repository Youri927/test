// Rend les photos d'exemple de Respray en lancer de rayons (PNG bruts dans bruts/), puis :
//   python3 finir.py bruts ../../public/demo   (débruitage léger et WebP)
//   cd tools/rendus-photo && npm install && node rendre.cjs [nom…]
// Il faut Playwright (son Chromium). Le rendu se fait par le processeur (SwiftShader) : compter une à quelques minutes
// par image.
const http = require('http');
const fs = require('fs');
const path = require('path');
const {chromium} = require('playwright');

const ICI = __dirname;
// les PNG bruts ici ; finir.py les débruite et les met en WebP dans public/demo
const SORTIE = process.env.SORTIE || path.join(ICI, 'bruts');
fs.mkdirSync(SORTIE, {recursive: true});
const VUES = require(process.env.VUES || './vues.cjs');

const TYPES = {'.html': 'text/html', '.js': 'text/javascript'};
const serveur = http.createServer((req, res) => {
  const f = path.join(ICI, decodeURIComponent(req.url.split('?')[0]));
  if (!f.startsWith(ICI) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, {'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream'});
  fs.createReadStream(f).pipe(res);
});

serveur.listen(0, async () => {
  const port = serveur.address().port;
  const nav = await chromium.launch({args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader']});
  const page = await nav.newPage({viewport: {width: 600, height: 800}});
  page.on('pageerror', (e) => console.error('erreur page :', e.message));
  page.on('console', (m) => m.type() === 'error' && console.error('console :', m.text()));
  await page.goto(`http://localhost:${port}/scene.html`);
  await page.waitForFunction(() => window.pret, null, {timeout: 60000});
  const choisis = process.argv.slice(2);
  for (const [nom, o] of Object.entries(VUES)) {
    if (choisis.length && !choisis.includes(nom)) continue;
    const t = Date.now();
    const r = await page.evaluate((x) => window.rendre(x), o, {timeout: 0});
    fs.writeFileSync(path.join(SORTIE, nom + '.png'), Buffer.from(r.image.split(',')[1], 'base64'));
    if (r.buse) fs.writeFileSync(path.join(SORTIE, nom + '.buse.json'), JSON.stringify(r.buse));
    console.log(`${nom} : ${r.echantillons} passes, ${Math.round((Date.now() - t) / 1000)} s${r.buse ? `, buse ${JSON.stringify(r.buse)}` : ''}`);
  }
  await nav.close();
  serveur.close();
});
