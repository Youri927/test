// Deux sorties :
//  - dist/index.html : le site en un seul fichier (polices, styles, photos, cartes, librairie et script intégrés),
//    à ouvrir d'un double-clic ;
//  - dist-web/ : la version à mettre en ligne, la page légère, et les photos et les polices en fichiers.
//   node build.mjs
import {readFileSync, writeFileSync, mkdirSync, copyFileSync, rmSync, existsSync} from 'node:fs';

const here = (p) => new URL(p, import.meta.url);
const read = (p) => readFileSync(here(p), 'utf8');
const b64 = (p) => readFileSync(here(p)).toString('base64');

// Bodoni Moda (romain et italique, graisses 400 à 900, taille optique 6 à 96) et Hanken Grotesk (100 à 900), licence OFL.
// Les polices de secours reprennent la chasse et la hauteur des vraies (Times et Arial ajustées) : rien ne bouge au
// chargement.
const FONTS = {roman: 'BodoniModa.woff2', italic: 'BodoniModa-Italic.woff2', sans: 'HankenGrotesk.woff2'};
const faces = (url) =>
  `@font-face{font-family:"Bodoni Moda";src:url(${url(FONTS.roman)}) format("woff2");font-weight:400 900;font-style:normal;font-display:swap}` +
  `@font-face{font-family:"Bodoni Moda";src:url(${url(FONTS.italic)}) format("woff2");font-weight:400 900;font-style:italic;font-display:swap}` +
  `@font-face{font-family:"Hanken Grotesk";src:url(${url(FONTS.sans)}) format("woff2");font-weight:100 900;font-style:normal;font-display:swap}` +
  '@font-face{font-family:"Bodoni Fallback";src:local("Times New Roman"),local("Liberation Serif"),local("Times");size-adjust:112.31%;ascent-override:100.17%;descent-override:35.62%;line-gap-override:0%}' +
  '@font-face{font-family:"Hanken Fallback";src:local("Arial"),local("Liberation Sans"),local("Helvetica");size-adjust:100.2%;ascent-override:99.8%;descent-override:30.24%;line-gap-override:0%}';

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
const js = [read('./vendor/lenis.min.js'), read('./src/main.js')]
  .join('\n;\n')
  .replace(/<\/script/gi, '<\\/script');
// les deux cartes (tools/map.py), dessinées d'après OpenStreetMap, vont directement dans la page
const maps = (html) =>
  html.replace('<!--MAP-WIDE-->', () => read('./src/map-wide.svg').trim()).replace('<!--MAP-TALL-->', () => read('./src/map-tall.svg').trim());
const src = maps(read('./src/index.html'));
for (const left of ['<!--MAP-WIDE-->', '<!--MAP-TALL-->']) if (src.includes(left)) throw new Error(`carte manquante : ${left}`);

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
for (const f of Object.values(FONTS)) copyFileSync(here(`./vendor/fonts/${f}`), web(`assets/fonts/${f}`));
const used = new Set();
const pageWeb = src
  .replace(IMG, (m, a, name, b) => {
    used.add(name);
    return `<img${a}src="assets/img/${name}.avif"${dims(name, a + b)}${b}>`;
  })
  .replace('<!--STYLES-->', () =>
    [
      // les deux polices de l'ouverture : le titre (Bodoni romain) et le texte (Hanken)
      `<link rel="preload" as="font" type="font/woff2" href="assets/fonts/${FONTS.roman}" crossorigin>`,
      `<link rel="preload" as="font" type="font/woff2" href="assets/fonts/${FONTS.sans}" crossorigin>`,
      `<style>\n${faces((f) => `assets/fonts/${f}`)}\n${css}\n</style>`,
    ].join('\n'),
  )
  .replace('<!--SCRIPTS-->', () => `<script>\n${js}\n</script>`);
for (const n of used) copyFileSync(here(`./src/img/${n}.avif`), web(`assets/img/${n}.avif`));
writeFileSync(web('index.html'), pageWeb);
// robots.txt, sitemap.xml, llms.txt, en-têtes et image de partage, prêts pour le lancement
for (const f of ['_headers', 'vercel.json', 'robots.txt', 'sitemap.xml', 'llms.txt']) if (existsSync(here(`./web/${f}`))) copyFileSync(here(`./web/${f}`), web(f));
if (existsSync(here('./web/og.jpg'))) copyFileSync(here('./web/og.jpg'), web('assets/og.jpg'));
console.log(`dist-web/index.html : ${(Buffer.byteLength(pageWeb) / 1024).toFixed(0)} Ko, ${used.size} photos`);
