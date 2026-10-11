// Deux sorties :
//  - dist/index.html : le site en un seul fichier (police, styles, textures de l'eau, photos, librairie et script
//    intégrés), à ouvrir d'un double-clic ;
//  - dist-web/ : la version à mettre en ligne, la page légère, et les photos, les textures et la police en fichiers.
//   node build.mjs
import {readFileSync, writeFileSync, mkdirSync, copyFileSync, rmSync, existsSync} from 'node:fs';

const here = (p) => new URL(p, import.meta.url);
const read = (p) => readFileSync(here(p), 'utf8');
const b64 = (p) => readFileSync(here(p)).toString('base64');
// Overpass, variable en graisse (100 à 900), licence OFL
const face = (src) => `@font-face{font-family:"Overpass";src:url(${src}) format("woff2");font-weight:100 900;font-style:normal;font-display:swap}`;

const sizes = JSON.parse(read('./data/photo-sizes.json'));
const size = (name) => {
  const s = sizes[name];
  if (!s) throw new Error(`photo inconnue : ${name}`);
  return s;
};
// largeur et hauteur de chaque photo (pas de décalage au chargement)
const dims = (name, attrs) => (/\bwidth=/.test(attrs) ? '' : ` width="${size(name)[0]}" height="${size(name)[1]}"`);
const IMG = /<img\b([^>]*?)src="img\/([\w-]+)\.avif"([^>]*)>/g;
// les textures de l'eau, appelées depuis la feuille de styles
const TEX = /url\(img\/([\w-]+)\.webp\)/g;

const css = read('./src/styles.css');
const js = [read('./vendor/lenis.min.js'), read('./src/main.js')]
  .join('\n;\n')
  .replace(/<\/script/gi, '<\\/script');
const src = read('./src/index.html');

/* ——— le fichier unique ——— */
const seen = new Map();
const PIXEL = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
const copy = 'for(const i of document.querySelectorAll("img[data-dup]"))i.src=document.querySelector(`img[data-img="${i.dataset.dup}"]`).src;';
const cssOne = css.replace(TEX, (m, name) => `url(data:image/webp;base64,${b64(`./src/img/${name}.webp`)})`);
const page = src
  .replace(IMG, (m, a, name, b) => {
    const n = (seen.get(name) || 0) + 1;
    seen.set(name, n);
    const s = n > 1 ? `src="${PIXEL}" data-dup="${name}"` : `src="data:image/avif;base64,${b64(`./src/img/${name}.avif`)}" data-img="${name}"`;
    return `<img${a}${s}${dims(name, a + b)}${b}>`;
  })
  .replace('<!--STYLES-->', () => `<style>\n${face(`data:font/woff2;base64,${b64('./vendor/fonts/Overpass.woff2')}`)}\n${cssOne}\n</style>`)
  .replace('<!--SCRIPTS-->', () => `<script>${copy}</script>\n<script>\n${js}\n</script>`);
mkdirSync(here('./dist/'), {recursive: true});
writeFileSync(here('./dist/index.html'), page);
console.log(`dist/index.html : ${(Buffer.byteLength(page) / 1024 / 1024).toFixed(2)} Mo, ${seen.size} photos`);

/* ——— la version en ligne ——— */
const web = (p) => here(`./dist-web/${p}`);
rmSync(web(''), {recursive: true, force: true});
for (const d of ['assets/img', 'assets/fonts']) mkdirSync(web(d), {recursive: true});
copyFileSync(here('./vendor/fonts/Overpass.woff2'), web('assets/fonts/Overpass.woff2'));
const used = new Set();
const textures = new Set();
const cssWeb = css.replace(TEX, (m, name) => (textures.add(name), `url(assets/img/${name}.webp)`));
const pageWeb = src
  .replace(IMG, (m, a, name, b) => {
    used.add(name);
    return `<img${a}src="assets/img/${name}.avif"${dims(name, a + b)}${b}>`;
  })
  .replace('<!--STYLES-->', () =>
    [
      '<link rel="preload" as="font" type="font/woff2" href="assets/fonts/Overpass.woff2" crossorigin>',
      '<link rel="preload" as="image" type="image/webp" href="assets/img/murk.webp">',
      `<style>\n${face('assets/fonts/Overpass.woff2')}\n${cssWeb}\n</style>`,
    ].join('\n'))
  .replace('<!--SCRIPTS-->', () => `<script>\n${js}\n</script>`);
for (const n of used) copyFileSync(here(`./src/img/${n}.avif`), web(`assets/img/${n}.avif`));
for (const n of textures) copyFileSync(here(`./src/img/${n}.webp`), web(`assets/img/${n}.webp`));
writeFileSync(web('index.html'), pageWeb);
// la maquette en ligne n'est pas indexée (à retirer au lancement) ; robots.txt, sitemap.xml et llms.txt sont prêts pour le lancement
for (const f of ['_headers', 'vercel.json', 'robots.txt', 'sitemap.xml', 'llms.txt']) copyFileSync(here(`./web/${f}`), web(f));
if (existsSync(here('./web/og.jpg'))) copyFileSync(here('./web/og.jpg'), web('assets/og.jpg'));
console.log(`dist-web/index.html : ${(Buffer.byteLength(pageWeb) / 1024).toFixed(0)} Ko, ${used.size} photos, ${textures.size} textures`);
