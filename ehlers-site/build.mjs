// Deux sorties :
//  - dist/index.html : le site en un seul fichier (police, styles, photos, librairie et script intégrés),
//    à ouvrir d'un double-clic ;
//  - dist-web/ : la version à mettre en ligne, la page légère, et les photos et la police en fichiers.
//   node build.mjs
import {readFileSync, writeFileSync, mkdirSync, copyFileSync, rmSync, existsSync} from 'node:fs';

const here = (p) => new URL(p, import.meta.url);
const read = (p) => readFileSync(here(p), 'utf8');
const b64 = (p) => readFileSync(here(p)).toString('base64');

// Host Grotesk (Element Type, licence OFL), variable : graisse 300 à 800.
// La police de secours reprend la chasse et la hauteur de Host Grotesk (Arial ajustée, mesurée sur un paragraphe du
// site) : rien ne bouge au chargement.
const FONT = 'HostGrotesk.woff2';
const faces = (url) =>
  `@font-face{font-family:"Host Grotesk";src:url(${url(FONT)}) format("woff2");font-weight:300 800;font-style:normal;font-display:swap}` +
  '@font-face{font-family:"Host Fallback";src:local("Arial"),local("Liberation Sans"),local("Helvetica");size-adjust:SIZE_ADJUST;ascent-override:ASCENT;descent-override:DESCENT;line-gap-override:0%}';
const FALLBACK = JSON.parse(read('./data/fallback.json'));
const fontCss = (url) =>
  faces(url).replace('SIZE_ADJUST', FALLBACK.size).replace('ASCENT', FALLBACK.ascent).replace('DESCENT', FALLBACK.descent);

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
const js = [read('./vendor/lenis.min.js'), read('./src/main.js')].join('\n;\n').replace(/<\/script/gi, '<\\/script');
const src = read('./src/index.html');

/* ——— vérifications : les nombres affichés correspondent au contenu ——— */
const kinds = [...src.matchAll(/<li data-k="(\w+)">/g)].map((m) => m[1]);
for (const m of src.matchAll(/data-k="(\w+)">[^<]*<span>(\d+)<\/span>/g)) {
  const real = m[1] === 'all' ? kinds.length : kinds.filter((k) => k === m[1]).length;
  if (real !== +m[2]) throw new Error(`registre ${m[1]} : ${m[2]} affichés, ${real} dans la liste`);
}
const details = [...src.matchAll(/data-detail="(\d+)"/g)].map((m) => m[1]);
const pinsK = [...src.matchAll(/data-pin="(\d+)"/g)].map((m) => m[1]);
if (details.join() !== pinsK.join()) throw new Error(`cuisine : détails ${details} et repères ${pinsK} ne correspondent pas`);

/* ——— le fichier unique ——— */
const page = src
  .replace(IMG, (m, a, name, b) => `<img${a}src="data:image/avif;base64,${b64(`./src/img/${name}.avif`)}"${dims(name, a + b)}${b}>`)
  .replace(SOURCE, (m, a, name, b) => `<source${a}srcset="data:image/avif;base64,${b64(`./src/img/${name}.avif`)}"${b} type="image/avif">`)
  .replace('<!--STYLES-->', () => `<style>\n${fontCss((f) => `data:font/woff2;base64,${b64(`./vendor/fonts/${f}`)}`)}\n${css}\n</style>`)
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
  .replace(SOURCE, (m, a, name, b) => {
    used.add(name);
    return `<source${a}srcset="assets/img/${name}.avif"${b} type="image/avif">`;
  })
  .replace('<!--STYLES-->', () =>
    [
      // la police du titre et du texte, et la photo de l'accueil (large ou en hauteur), dès le départ
      `<link rel="preload" as="font" type="font/woff2" href="assets/fonts/${FONT}" crossorigin>`,
      '<link rel="preload" as="image" href="assets/img/hero.avif" type="image/avif" media="(min-width: 701px)" fetchpriority="high">',
      '<link rel="preload" as="image" href="assets/img/hero-tall.avif" type="image/avif" media="(max-width: 700px)" fetchpriority="high">',
      `<style>\n${fontCss((f) => `assets/fonts/${f}`)}\n${css}\n</style>`,
    ].join('\n'),
  )
  .replace('<!--SCRIPTS-->', () => `<script>\n${js}\n</script>`);
for (const n of used) copyFileSync(here(`./src/img/${n}.avif`), web(`assets/img/${n}.avif`));
writeFileSync(web('index.html'), pageWeb);
// robots.txt, sitemap.xml, llms.txt, en-têtes et image de partage
for (const f of ['_headers', 'vercel.json', 'robots.txt', 'sitemap.xml', 'llms.txt']) if (existsSync(here(`./web/${f}`))) copyFileSync(here(`./web/${f}`), web(f));
if (existsSync(here('./web/og.jpg'))) copyFileSync(here('./web/og.jpg'), web('assets/og.jpg'));
console.log(`dist-web/index.html : ${(Buffer.byteLength(pageWeb) / 1024).toFixed(0)} Ko, ${used.size} photos`);
