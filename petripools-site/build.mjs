// Deux sorties :
//  - dist/index.html : le site en un seul fichier (police, styles, photos, librairies et scripts intégrés),
//    à ouvrir d'un double-clic ;
//  - dist-web/ : la version à mettre en ligne, la page légère et les photos et la police en fichiers séparés.
//   node build.mjs
import {readFileSync, writeFileSync, mkdirSync, copyFileSync, rmSync, existsSync} from 'node:fs';

const here = (p) => new URL(p, import.meta.url);
const read = (p) => readFileSync(here(p), 'utf8');
const b64 = (p) => readFileSync(here(p)).toString('base64');
// Archivo, variable en largeur (62 à 125 %) et en graisse (100 à 900), licence OFL
const face = (src) => `@font-face{font-family:"Archivo";src:url(${src}) format("woff2");font-weight:100 900;font-stretch:62% 125%;font-style:normal;font-display:swap}`;

const sizes = existsSync(here('./data/photo-sizes.json')) ? JSON.parse(read('./data/photo-sizes.json')) : {};
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
// la carte des villes : les lacs (tools/map.py) et une étiquette par ville, avec le nombre d'avis qui en viennent
const towns = JSON.parse(read('./data/cities.json')).cities;
const townCfg = JSON.parse(read('./data/towns.json'));
const html = read('./src/index.html');
const count = (name) => (html.match(new RegExp(`data-city="${name}"`, 'g')) || []).length;
const townsHtml = Object.entries(towns)
  .map(([name, [x, y]]) => {
    const n = count(name);
    const label = townCfg.label[name] || name;
    const a = townCfg.anchor[name] || 'r';
    const style = `style="--x:${x}%;--y:${y}%"`;
    const home = name === 'Lewisville' ? '<em class="town__home">Our showroom</em>' : '';
    if (!n) return `<span class="town" ${style} data-a="${a}" aria-hidden="true"><span class="town__label">${label}</span></span>`;
    return `<span class="town has-rv${home ? ' is-home' : ''}" ${style} data-a="${a}"><button class="town__btn" type="button" data-town="${name}" aria-pressed="false">${label} <b>${n}</b><span class="sr-only"> review${n > 1 ? 's' : ''}</span>${home}</button></span>`;
  })
  .join('');
const src = html
  .replace('<!--MAP-LAKES-->', () => read('./src/partials/map-lakes.svg').trim())
  .replace('<div class="map__towns" data-map-towns></div>', () => `<div class="map__towns" data-map-towns>${townsHtml}</div>`);

/* ——— le fichier unique ——— */
const seen = new Map();
const PIXEL = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
const copy = 'for(const i of document.querySelectorAll("img[data-dup]"))i.src=document.querySelector(`img[data-img="${i.dataset.dup}"]`).src;';
const page = src
  .replace(IMG, (m, a, name, b) => {
    const n = (seen.get(name) || 0) + 1;
    seen.set(name, n);
    const s = n > 1 ? `src="${PIXEL}" data-dup="${name}"` : `src="data:image/avif;base64,${b64(`./src/img/${name}.avif`)}" data-img="${name}"`;
    return `<img${a}${s}${dims(name, a + b)}${b}>`;
  })
  // une seule taille par photo dans le fichier unique : la plus grande (src)
  .replace(/\ssrcset="[^"]*"/g, '')
  .replace(/\ssizes="[^"]*"/g, '')
  .replace('<!--STYLES-->', () => `<style>\n${face(`data:font/woff2;base64,${b64('./vendor/fonts/Archivo.woff2')}`)}\n${css}\n</style>`)
  .replace('<!--SCRIPTS-->', () => `<script>${copy}</script>\n<script>\n${js}\n</script>`);
mkdirSync(here('./dist/'), {recursive: true});
writeFileSync(here('./dist/index.html'), page);
console.log(`dist/index.html : ${(Buffer.byteLength(page) / 1024 / 1024).toFixed(2)} Mo, ${seen.size} photos`);

/* ——— la version en ligne ——— */
const web = (p) => here(`./dist-web/${p}`);
rmSync(web(''), {recursive: true, force: true});
for (const d of ['assets/img', 'assets/fonts']) mkdirSync(web(d), {recursive: true});
copyFileSync(here('./vendor/fonts/Archivo.woff2'), web('assets/fonts/Archivo.woff2'));
const used = new Set();
const pageWeb = src
  .replace(IMG, (m, a, name, b) => {
    used.add(name);
    return `<img${a}src="assets/img/${name}.avif"${dims(name, a + b)}${b}>`;
  })
  .replace(/(srcset="[^"]*")/g, (m) => m.replace(/img\/([\w-]+)\.avif/g, (x, n) => (used.add(n), `assets/img/${n}.avif`)))
  .replace('<!--STYLES-->', () =>
    [
      '<link rel="preload" as="font" type="font/woff2" href="assets/fonts/Archivo.woff2" crossorigin>',
      `<style>\n${face('assets/fonts/Archivo.woff2')}\n${css}\n</style>`,
    ].join('\n'))
  .replace('<!--SCRIPTS-->', () => `<script>\n${js}\n</script>`);
for (const n of used) copyFileSync(here(`./src/img/${n}.avif`), web(`assets/img/${n}.avif`));
writeFileSync(web('index.html'), pageWeb);
// la maquette en ligne n'est pas indexée (à retirer au lancement) ; robots.txt, sitemap.xml et llms.txt sont prêts pour le lancement
for (const f of ['_headers', 'vercel.json', 'robots.txt', 'sitemap.xml', 'llms.txt']) copyFileSync(here(`./web/${f}`), web(f));
if (existsSync(here('./web/og.jpg'))) copyFileSync(here('./web/og.jpg'), web('assets/og.jpg'));
console.log(`dist-web/index.html : ${(Buffer.byteLength(pageWeb) / 1024).toFixed(0)} Ko, ${used.size} photos`);
