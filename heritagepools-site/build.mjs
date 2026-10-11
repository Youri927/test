// Deux sorties :
//  - dist/index.html : le site en un seul fichier (polices, styles, photos, librairies et scripts intégrés),
//    à ouvrir d'un double-clic ;
//  - dist-web/ : la version à mettre en ligne, la page légère et les photos et polices en fichiers séparés
//    (chargées au fur et à mesure, mises en cache par le navigateur).
//   node build.mjs
import {readFileSync, writeFileSync, mkdirSync, copyFileSync, rmSync} from 'node:fs';

const here = (p) => new URL(p, import.meta.url);
const read = (p) => readFileSync(here(p), 'utf8');
const b64 = (p) => readFileSync(here(p)).toString('base64');
const face = (src, family, weight) =>
  `@font-face{font-family:"${family}";src:url(${src}) format("woff2");font-weight:${weight};font-style:normal;font-display:swap}`;

// Ultra pour les titres (une seule graisse, licence Apache 2.0), Libre Franklin pour le texte (variable, 300 à 900, OFL)
const FONTS = [
  {file: 'Ultra', family: 'Ultra', weight: '400'},
  {file: 'LibreFranklin', family: 'Libre Franklin', weight: '300 900'},
];
const sizes = JSON.parse(read('./data/photo-sizes.json'));
const size = (name) => {
  const s = sizes[name];
  if (!s) throw new Error(`photo inconnue : ${name}`);
  return s;
};
// largeur et hauteur de chaque photo (pas de décalage au chargement)
const dims = (name, attrs) => (/\bwidth=/.test(attrs) ? '' : ` width="${size(name)[0]}" height="${size(name)[1]}"`);
// <img src="img/x.avif"> et <img data-src="img/x.avif"> (photo chargée par le script : les images 2 à 11 du film de l'accueil)
const IMG = /<img\b([^>]*?)(data-)?src="img\/([\w-]+)\.avif"([^>]*)>/g;

const css = read('./src/styles.css');
const js = [read('./vendor/gsap.min.js'), read('./vendor/ScrollTrigger.min.js'), read('./vendor/lenis.min.js'), read('./src/main.js')]
  .join('\n;\n')
  .replace(/<\/script/gi, '<\\/script');
// les proportions des photos de la galerie ({r:nom} dans la page), pour des rangées alignées
const src = read('./src/index.html').replace(/\{r:([\w-]+)\}/g, (m, n) => (size(n)[0] / size(n)[1]).toFixed(4));

/* ——— le fichier unique ——— */
// chaque photo n'est intégrée qu'une fois : une photo répétée reprend la source de la première au chargement
const seen = new Map();
const PIXEL = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
const copy = 'for(const i of document.querySelectorAll("img[data-dup]"))i.src=document.querySelector(`img[data-img="${i.dataset.dup}"]`).src;';
const fontsInline = FONTS.map((f) => face(`data:font/woff2;base64,${b64(`./vendor/fonts/${f.file}.woff2`)}`, f.family, f.weight)).join('');
const page = src
  .replace(IMG, (m, a, lazy, name, b) => {
    const n = (seen.get(name) || 0) + 1;
    seen.set(name, n);
    const s = n > 1 ? `src="${PIXEL}" data-dup="${name}"` : `src="data:image/avif;base64,${b64(`./src/img/${name}.avif`)}" data-img="${name}"`;
    return `<img${a}${s}${dims(name, a + b)}${b}>`;
  })
  // une seule taille par photo dans le fichier unique : la plus grande (src)
  .replace(/\s(?:data-)?srcset="[^"]*"/g, '')
  .replace(/\ssizes="[^"]*"/g, '')
  .replace('<!--STYLES-->', () => `<style>\n${fontsInline}\n${css}\n</style>`)
  .replace('<!--SCRIPTS-->', () => `<script>${copy}</script>\n<script>\n${js}\n</script>`);
mkdirSync(here('./dist/'), {recursive: true});
writeFileSync(here('./dist/index.html'), page);
console.log(`dist/index.html : ${(Buffer.byteLength(page) / 1024 / 1024).toFixed(2)} Mo, ${seen.size} photos`);

/* ——— la version en ligne ——— */
const web = (p) => here(`./dist-web/${p}`);
rmSync(web(''), {recursive: true, force: true});
for (const d of ['assets/img', 'assets/fonts']) mkdirSync(web(d), {recursive: true});
const used = new Set();
const fontsWeb = FONTS.map((f) => {
  copyFileSync(here(`./vendor/fonts/${f.file}.woff2`), web(`assets/fonts/${f.file}.woff2`));
  return face(`assets/fonts/${f.file}.woff2`, f.family, f.weight);
}).join('');
const HERO_SIZES = (src.match(/class="frame is-on"[^>]*?sizes="([^"]+)"/) || [])[1];
if (!HERO_SIZES) throw new Error('tailles de la première image du film introuvables');
const preload = [
  ...FONTS.map((f) => `<link rel="preload" as="font" type="font/woff2" href="assets/fonts/${f.file}.woff2" crossorigin>`),
  // la première image du film de l'accueil, à la taille de l'écran
  `<link rel="preload" as="image" href="assets/img/log-01.avif" imagesrcset="assets/img/log-01-s.avif 760w, assets/img/log-01.avif 1008w" imagesizes="${HERO_SIZES}" fetchpriority="high">`,
].join('\n');
const pageWeb = src
  .replace(IMG, (m, a, lazy, name, b) => {
    used.add(name);
    return `<img${a}${lazy || ''}src="assets/img/${name}.avif"${dims(name, a + b)}${b}>`;
  })
  // les photos du chantier existent en deux tailles (760 et 1008 px) : le navigateur prend celle qu'il faut
  .replace(/((?:data-)?srcset=")([^"]+)"/g, (m, a, v) => a + v.replace(/img\/([\w-]+)\.avif/g, (mm, n) => (used.add(n), `assets/img/${n}.avif`)) + '"')
  .replace('<!--STYLES-->', () => `${preload}\n<style>\n${fontsWeb}\n${css}\n</style>`)
  .replace('<!--SCRIPTS-->', () => `<script>\n${js}\n</script>`);
for (const n of used) copyFileSync(here(`./src/img/${n}.avif`), web(`assets/img/${n}.avif`));
writeFileSync(web('index.html'), pageWeb);
// Netlify (et Vercel, voir vercel.json) : un an de cache pour le dossier assets, pas d'indexation tant que c'est une maquette
writeFileSync(web('_headers'), '/*\n  X-Robots-Tag: noindex\n/assets/*\n  Cache-Control: public, max-age=31536000, immutable\n');
console.log(`dist-web/index.html : ${(Buffer.byteLength(pageWeb) / 1024).toFixed(0)} Ko, ${used.size} photos en fichiers`);
