// Deux sorties :
//  - dist/index.html : le site en un seul fichier (police, styles, photos, librairie et script intégrés), à ouvrir d'un double-clic ;
//  - dist-web/ : la version à mettre en ligne, la page légère, et les photos et la police en fichiers.
//   node build.mjs
import {readFileSync, writeFileSync, mkdirSync, copyFileSync, rmSync, existsSync, readdirSync} from 'node:fs';

const here = (p) => new URL(p, import.meta.url);
const read = (p) => readFileSync(here(p), 'utf8');
const b64 = (p) => readFileSync(here(p)).toString('base64');
// Mona Sans, variable en graisse (200 à 900) et en largeur (75 à 125 %), licence OFL
const face = (src) =>
  `@font-face{font-family:"Mona Sans";src:url(${src}) format("woff2");font-weight:200 900;font-stretch:75% 125%;font-style:normal;font-display:swap}` +
  // chasse moyenne de Mona Sans (largeur 100, graisse 430) : Arial agrandie de 104,88 %
  '@font-face{font-family:"Mona Fallback";src:local("Arial"),local("Liberation Sans"),local("Helvetica");size-adjust:104.88%;ascent-override:103.93%;descent-override:30.51%;line-gap-override:0%}';

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
const src = read('./src/index.html');

/* ——— le fichier unique ——— */
const seen = new Map();
const PIXEL = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
// une photo utilisée deux fois n'est intégrée qu'une fois ; la copie reprend sa source au chargement
const copy = 'for(const i of document.querySelectorAll("img[data-dup]"))i.src=document.querySelector(`img[data-img="${i.dataset.dup}"]`).src;';
const page = src
  .replace(IMG, (m, a, name, b) => {
    const n = (seen.get(name) || 0) + 1;
    seen.set(name, n);
    const s = n > 1 ? `src="${PIXEL}" data-dup="${name}"` : `src="data:image/avif;base64,${b64(`./src/img/${name}.avif`)}" data-img="${name}"`;
    return `<img${a}${s}${dims(name, a + b)}${b}>`;
  })
  .replace('<!--STYLES-->', () => `<style>\n${face(`data:font/woff2;base64,${b64('./vendor/fonts/MonaSans.woff2')}`)}\n${css}\n</style>`)
  .replace('<!--SCRIPTS-->', () => `<script>${copy}</script>\n<script>\n${js}\n</script>`);
mkdirSync(here('./dist/'), {recursive: true});
writeFileSync(here('./dist/index.html'), page);
console.log(`dist/index.html : ${(Buffer.byteLength(page) / 1024 / 1024).toFixed(2)} Mo, ${seen.size} photos`);

/* ——— la version en ligne ——— */
const web = (p) => here(`./dist-web/${p}`);
rmSync(web(''), {recursive: true, force: true});
for (const d of ['assets/img', 'assets/fonts']) mkdirSync(web(d), {recursive: true});
copyFileSync(here('./vendor/fonts/MonaSans.woff2'), web('assets/fonts/MonaSans.woff2'));
const used = new Set();
// versions réduites (<nom>.w<largeur>.avif) : le navigateur choisit selon l'attribut sizes de la page
const files = readdirSync(here('./src/img/'));
const variants = (name) =>
  files
    .map((f) => f.match(new RegExp(`^${name}\\.w(\\d+)\\.avif$`)))
    .filter(Boolean)
    .map((m) => [m[0], Number(m[1])]);
const pageWeb = src
  .replace(IMG, (m, a, name, b) => {
    used.add(name);
    const vs = variants(name);
    if (!vs.length) return `<img${a}src="assets/img/${name}.avif"${dims(name, a + b)}${b}>`;
    vs.forEach(([f]) => used.add(f.replace(/\.avif$/, '')));
    const set = [...vs.map(([f, w]) => `assets/img/${f} ${w}w`), `assets/img/${name}.avif ${size(name)[0]}w`].join(', ');
    const sz = /\bsizes=/.test(a + b) ? '' : ' sizes="(max-width: 760px) 92vw, 50vw"';
    return `<img${a}src="assets/img/${name}.avif" srcset="${set}"${sz}${dims(name, a + b)}${b}>`;
  })
  .replace('<!--STYLES-->', () =>
    [
      '<link rel="preload" as="font" type="font/woff2" href="assets/fonts/MonaSans.woff2" crossorigin>',
      '<link rel="preload" as="image" type="image/avif" imagesrcset="assets/img/hero-pool.w640.avif 640w, assets/img/hero-pool.w900.avif 900w, assets/img/hero-pool.avif 1600w" imagesizes="(max-width: 1080px) 76vw, min(48vw, 680px)" fetchpriority="high">',
      `<style>\n${face('assets/fonts/MonaSans.woff2')}\n${css}\n</style>`,
    ].join('\n'),
  )
  .replace('<!--SCRIPTS-->', () => `<script>\n${js}\n</script>`);
for (const n of used) copyFileSync(here(`./src/img/${n}.avif`), web(`assets/img/${n}.avif`));
writeFileSync(web('index.html'), pageWeb);
// la maquette en ligne n'est pas indexée (à retirer au lancement) ; robots.txt, sitemap.xml et llms.txt sont prêts pour le lancement
for (const f of ['_headers', 'vercel.json', 'robots.txt', 'sitemap.xml', 'llms.txt']) copyFileSync(here(`./web/${f}`), web(f));
if (existsSync(here('./web/og.jpg'))) copyFileSync(here('./web/og.jpg'), web('assets/og.jpg'));
console.log(`dist-web/index.html : ${(Buffer.byteLength(pageWeb) / 1024).toFixed(0)} Ko, ${used.size} photos`);
