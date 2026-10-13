// Deux sorties :
//  - dist/index.html : le site en un seul fichier (police, styles, photos, logo, cartes, librairie et script intégrés),
//    à ouvrir d'un double-clic ;
//  - dist-web/ : la version à mettre en ligne, la page légère, et les photos et la police en fichiers.
//   node build.mjs
import {readFileSync, writeFileSync, mkdirSync, copyFileSync, rmSync, existsSync} from 'node:fs';

const here = (p) => new URL(p, import.meta.url);
const read = (p) => readFileSync(here(p), 'utf8');
const b64 = (p) => readFileSync(here(p)).toString('base64');

// Archivo (Omnibus-Type, licence OFL), variable : largeur 62 à 125, graisse 100 à 900.
// La police de secours reprend la chasse et la hauteur d'Archivo (Arial ajustée, mesurée sur un paragraphe du site) :
// rien ne bouge au chargement.
const FONT = 'Archivo.woff2';
const faces = (url) =>
  `@font-face{font-family:"Archivo";src:url(${url(FONT)}) format("woff2");font-weight:100 900;font-stretch:62% 125%;font-style:normal;font-display:swap}` +
  '@font-face{font-family:"Archivo Fallback";src:local("Arial"),local("Liberation Sans"),local("Helvetica");size-adjust:98.32%;ascent-override:89.3%;descent-override:21.36%;line-gap-override:0%}';

const sizes = JSON.parse(read('./data/photo-sizes.json'));
const size = (name) => {
  const s = sizes[name];
  if (!s) throw new Error(`photo inconnue : ${name}`);
  return s;
};
// largeur et hauteur de chaque photo (pas de décalage au chargement)
const dims = (name, attrs) => (/\bwidth=/.test(attrs) ? '' : ` width="${size(name)[0]}" height="${size(name)[1]}"`);
const IMG = /<img\b([^>]*?)src="img\/([\w-]+)\.avif"([^>]*)>/g;

const css = read('./src/styles.css');
const js = [read('./vendor/lenis.min.js'), read('./src/main.js')].join('\n;\n').replace(/<\/script/gi, '<\\/script');

// le logo (tools/logo.py) et les deux cartes (tools/map.py) vont directement dans la page
const PARTS = {
  '<!--LOGO-COMPACT-->': read('./src/logo-compact.svg').trim(),
  '<!--LOGO-FULL-->': read('./src/logo-full.svg').trim(),
  '<!--MAP-WIDE-->': read('./src/map-wide.svg').trim(),
  '<!--MAP-TALL-->': read('./src/map-tall.svg').trim(),
};
let src = read('./src/index.html');
for (const [k, v] of Object.entries(PARTS)) src = src.replaceAll(k, () => v);
for (const k of Object.keys(PARTS)) if (src.includes(k)) throw new Error(`morceau manquant : ${k}`);

/* ——— vérifications : les nombres affichés correspondent au contenu ——— */
for (const m of src.matchAll(/<li class="fam" data-fam="(\w+)">([\s\S]*?)\n {8}<\/li>/g)) {
  const shown = +/data-count="(\d+)"/.exec(m[2])[1];
  const real = (m[2].match(/<li class="tx"/g) || []).length;
  if (shown !== real) throw new Error(`famille ${m[1]} : ${shown} soins affichés, ${real} dans la liste`);
}
const kinds = [...src.matchAll(/<li class="res__item[^"]*" data-k="(\w+)">/g)].map((m) => m[1]);
for (const m of src.matchAll(/data-k="(\w+)">[^<]*<span>(\d+)<\/span>/g)) {
  const real = m[1] === 'all' ? kinds.length : kinds.filter((k) => k === m[1]).length;
  if (real !== +m[2]) throw new Error(`résultats ${m[1]} : ${m[2]} affichés, ${real} dans la grille`);
}
if (!src.includes(`Show all ${kinds.length}`)) throw new Error('le bouton « Show all » ne donne pas le bon total');

/* ——— le fichier unique ——— */
const page = src
  .replace(IMG, (m, a, name, b) => `<img${a}src="data:image/avif;base64,${b64(`./src/img/${name}.avif`)}"${dims(name, a + b)}${b}>`)
  .replace('<!--STYLES-->', () => `<style>\n${faces((f) => `data:font/woff2;base64,${b64(`./vendor/fonts/${f}`)}`)}\n${css}\n</style>`)
  .replace('<!--SCRIPTS-->', () => `<script>\n${js}\n</script>`);
mkdirSync(here('./dist/'), {recursive: true});
writeFileSync(here('./dist/index.html'), page);
console.log(`dist/index.html : ${(Buffer.byteLength(page) / 1024).toFixed(0)} Ko`);

/* ——— la version en ligne ——— */
const web = (p) => here(`./dist-web/${p}`);
rmSync(web(''), {recursive: true, force: true});
for (const d of ['assets/img', 'assets/fonts']) mkdirSync(web(d), {recursive: true});
copyFileSync(here(`./vendor/fonts/${FONT}`), web(`assets/fonts/${FONT}`));
const used = new Set();
const pageWeb = src
  .replace(IMG, (m, a, name, b) => {
    used.add(name);
    return `<img${a}src="assets/img/${name}.avif"${dims(name, a + b)}${b}>`;
  })
  .replace('<!--STYLES-->', () =>
    [
      // la police du titre et du texte, et la photo de l'accueil, dès le départ
      `<link rel="preload" as="font" type="font/woff2" href="assets/fonts/${FONT}" crossorigin>`,
      '<link rel="preload" as="image" href="assets/img/hero.avif" type="image/avif" fetchpriority="high">',
      `<style>\n${faces((f) => `assets/fonts/${f}`)}\n${css}\n</style>`,
    ].join('\n'),
  )
  .replace('<!--SCRIPTS-->', () => `<script>\n${js}\n</script>`);
for (const n of used) copyFileSync(here(`./src/img/${n}.avif`), web(`assets/img/${n}.avif`));
writeFileSync(web('index.html'), pageWeb);
// le logo seul (données structurées), robots.txt, sitemap.xml, llms.txt, en-têtes et image de partage
writeFileSync(web('assets/logo.svg'), read('./src/logo-full.svg').replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ').replace(' aria-hidden="true" focusable="false"', ' role="img" aria-label="Hideout Boutique, boutique and med spa"'));
for (const f of ['_headers', 'vercel.json', 'robots.txt', 'sitemap.xml', 'llms.txt']) if (existsSync(here(`./web/${f}`))) copyFileSync(here(`./web/${f}`), web(f));
if (existsSync(here('./web/og.jpg'))) copyFileSync(here('./web/og.jpg'), web('assets/og.jpg'));
console.log(`dist-web/index.html : ${(Buffer.byteLength(pageWeb) / 1024).toFixed(0)} Ko, ${used.size} photos`);
