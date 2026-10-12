// Deux sorties :
//  - dist/index.html : le site en un seul fichier (polices, styles, photos, librairie et script intégrés), à ouvrir d'un double-clic ;
//  - dist-web/ : la version à mettre en ligne, la page légère, et les photos et les polices en fichiers.
//   node build.mjs
import {readFileSync, writeFileSync, mkdirSync, copyFileSync, rmSync, existsSync, readdirSync} from 'node:fs';

const here = (p) => new URL(p, import.meta.url);
const read = (p) => readFileSync(here(p), 'utf8');
const b64 = (p) => readFileSync(here(p)).toString('base64');

// Commissioner (graisses 100 à 900, axes FLAR et VOLM) et Literata italique, licence OFL.
// La police de secours reprend la chasse et la hauteur de Commissioner (Arial ajustée), pour que rien ne bouge au chargement.
const faces = (comm, lit) =>
  `@font-face{font-family:"Commissioner";src:url(${comm}) format("woff2");font-weight:100 900;font-style:normal;font-display:swap}` +
  `@font-face{font-family:"Literata";src:url(${lit}) format("woff2");font-weight:200 900;font-style:italic;font-display:swap}` +
  '@font-face{font-family:"Commissioner Fallback";src:local("Arial"),local("Liberation Sans"),local("Helvetica");size-adjust:99.95%;ascent-override:101.75%;descent-override:20.61%;line-gap-override:0%}';

const sizes = JSON.parse(read('./data/photo-sizes.json'));
const size = (name) => {
  const s = sizes[name];
  if (!s) throw new Error(`photo inconnue : ${name}`);
  return s;
};
// largeur et hauteur de chaque photo (pas de décalage au chargement)
const dims = (name, attrs) => (/\bwidth=/.test(attrs) ? '' : ` width="${size(name)[0]}" height="${size(name)[1]}"`);
const IMG = /<img\b([^>]*?)src="img\/([\w-]+)\.avif"([^>]*)>/g;
const SOURCE = /<source\b([^>]*?)srcset="img\/([\w-]+)\.avif"([^>]*)>/g;

const css = read('./src/styles.css');
const js = [read('./vendor/lenis.min.js'), read('./src/main.js')]
  .join('\n;\n')
  .replace(/<\/script/gi, '<\\/script');
const src = read('./src/index.html');

/* ——— le fichier unique ——— */
const page = src
  .replace(SOURCE, (m, a, name, b) => `<source${a}srcset="data:image/avif;base64,${b64(`./src/img/${name}.avif`)}"${b}>`)
  .replace(IMG, (m, a, name, b) => `<img${a}src="data:image/avif;base64,${b64(`./src/img/${name}.avif`)}"${dims(name, a + b)}${b}>`)
  .replace('<!--STYLES-->', () => `<style>\n${faces(`data:font/woff2;base64,${b64('./vendor/fonts/Commissioner.woff2')}`, `data:font/woff2;base64,${b64('./vendor/fonts/Literata-Italic.woff2')}`)}\n${css}\n</style>`)
  .replace('<!--SCRIPTS-->', () => `<script>\n${js}\n</script>`);
mkdirSync(here('./dist/'), {recursive: true});
writeFileSync(here('./dist/index.html'), page);
console.log(`dist/index.html : ${(Buffer.byteLength(page) / 1024 / 1024).toFixed(2)} Mo`);

/* ——— la version en ligne ——— */
const web = (p) => here(`./dist-web/${p}`);
rmSync(web(''), {recursive: true, force: true});
for (const d of ['assets/img', 'assets/fonts']) mkdirSync(web(d), {recursive: true});
copyFileSync(here('./vendor/fonts/Commissioner.woff2'), web('assets/fonts/Commissioner.woff2'));
copyFileSync(here('./vendor/fonts/Literata-Italic.woff2'), web('assets/fonts/Literata-Italic.woff2'));
const used = new Set();
// versions réduites (<nom>.w<largeur>.avif) : le navigateur choisit selon l'attribut sizes de la page
const files = readdirSync(here('./src/img/'));
const variants = (name) =>
  files
    .map((f) => f.match(new RegExp(`^${name}\\.w(\\d+)\\.avif$`)))
    .filter(Boolean)
    .map((m) => [m[0], Number(m[1])]);
// une plaque (<photo>-plate, tools/plate.py) déclare les largeurs de sa photo : le navigateur choisit la même version
// pour les deux, et la plaque tombe pixel pour pixel sur la photo affichée
const set = (name) => {
  used.add(name);
  const vs = variants(name);
  vs.forEach(([f]) => used.add(f.replace(/\.avif$/, '')));
  return [...vs.map(([f, w]) => `assets/img/${f} ${w}w`), `assets/img/${name}.avif ${size(name.replace(/-plate$/, ''))[0]}w`].join(', ');
};
const pageWeb = src
  .replace(SOURCE, (m, a, name, b) => `<source${a}srcset="${set(name)}" sizes="100vw" width="${size(name)[0]}" height="${size(name)[1]}"${b}>`)
  .replace(IMG, (m, a, name, b) => {
    const vs = variants(name);
    if (!vs.length) {
      used.add(name);
      return `<img${a}src="assets/img/${name}.avif"${dims(name, a + b)}${b}>`;
    }
    return `<img${a}src="assets/img/${name}.avif" srcset="${set(name)}"${dims(name, a + b)}${b}>`;
  })
  .replace('<!--STYLES-->', () =>
    [
      '<link rel="preload" as="font" type="font/woff2" href="assets/fonts/Commissioner.woff2" crossorigin>',
      `<style>\n${faces('assets/fonts/Commissioner.woff2', 'assets/fonts/Literata-Italic.woff2')}\n${css}\n</style>`,
    ].join('\n'),
  )
  .replace('<!--SCRIPTS-->', () => `<script>\n${js}\n</script>`);
for (const n of used) copyFileSync(here(`./src/img/${n}.avif`), web(`assets/img/${n}.avif`));
writeFileSync(web('index.html'), pageWeb);
// robots.txt, sitemap.xml, llms.txt, en-têtes et image de partage, prêts pour le lancement
for (const f of ['_headers', 'vercel.json', 'robots.txt', 'sitemap.xml', 'llms.txt']) if (existsSync(here(`./web/${f}`))) copyFileSync(here(`./web/${f}`), web(f));
if (existsSync(here('./web/og.jpg'))) copyFileSync(here('./web/og.jpg'), web('assets/og.jpg'));
console.log(`dist-web/index.html : ${(Buffer.byteLength(pageWeb) / 1024).toFixed(0)} Ko, ${used.size} photos`);
