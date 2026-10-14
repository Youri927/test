// Deux sorties :
//  - dist/index.html : le site en un seul fichier (police, styles, photos, dessins, librairie et script intégrés),
//    à ouvrir d'un double-clic ;
//  - dist-web/ : la version à mettre en ligne, la page légère, et les photos et la police en fichiers.
//   node build.mjs
import {readFileSync, writeFileSync, mkdirSync, copyFileSync, rmSync, existsSync} from 'node:fs';

const here = (p) => new URL(p, import.meta.url);
const read = (p) => readFileSync(here(p), 'utf8');
const b64 = (p) => readFileSync(here(p)).toString('base64');

// Encode Sans (Impallari Type et al., licence OFL), variable : graisse 100 à 900, chasse 75 à 125 %.
// La police de secours reprend la chasse et la hauteur d'Encode Sans en chasse normale (Arial ajustée, mesurée sur
// un paragraphe du site) : le texte courant ne bouge pas au chargement.
const FONT = 'EncodeSans.woff2';
const FALLBACK = JSON.parse(read('./data/fallback.json'));
const fontCss = (url) =>
  `@font-face{font-family:"Encode Sans";src:url(${url}) format("woff2");font-weight:100 900;font-stretch:75% 125%;font-style:normal;font-display:swap}` +
  `@font-face{font-family:"Encode Fallback";src:local("Arial"),local("Liberation Sans"),local("Helvetica");size-adjust:${FALLBACK.size};ascent-override:${FALLBACK.ascent};descent-override:${FALLBACK.descent};line-gap-override:0%}`;

const sizes = JSON.parse(read('./data/photo-sizes.json'));
const size = (name) => {
  if (!sizes[name]) throw new Error(`photo inconnue : ${name}`);
  return sizes[name];
};

/* ——— les dessins ——— */
const section = read('./src/section.svg').trim();
const map = JSON.parse(read('./data/map.json'));
const ANCHORS = new Set(['Jupiter', 'West Palm Beach', 'Boca Raton', 'Fort Lauderdale', 'Pembroke Pines']);
// les étiquettes vont à droite du point, sauf quand elles déborderaient de la carte
const lab = (c) => {
  const base = c.name === 'West Palm Beach';
  const left = c.x > map.w - 30 - c.name.length * 11;
  const tx = left ? -10 : 10;
  const anchor = left ? ' text-anchor="end"' : '';
  // le fond blanc du nom : sa largeur est estimée d'après le nombre de lettres (Encode Sans à 19 unités)
  const w = Math.round(c.name.length * 10.6 + 12);
  const x0 = (base ? tx * 1.4 : tx) - (left ? w - 6 : 6);
  return (
    `<g class="map__lab${ANCHORS.has(c.name) ? ' is-anchor' : ''}${base ? ' is-base' : ''}" data-city="${c.name}" transform="translate(${c.x} ${c.y})">` +
    `<rect class="map__chip" x="${x0}" y="-13" width="${w}" height="${base ? 46 : 26}" rx="3"/>` +
    `<circle r="${base ? 7 : 4}"/><text x="${base ? tx * 1.4 : tx}" y="6"${anchor}>${c.name}</text>` +
    (base ? `<text class="map__sub" x="${tx * 1.4}" y="26"${anchor}>our base</text>` : '') +
    '</g>'
  );
};
const counties = Object.values(map.counties);
const mapSvg =
  `<svg class="map" viewBox="0 0 ${map.w} ${map.h}" role="img" aria-labelledby="map-t" focusable="false">` +
  `<title id="map-t">Map of Palm Beach and Broward counties on the Atlantic coast, showing the city limits of the 25 cities we work in, from Jupiter in the north to Pembroke Pines in the south. Our base is West Palm Beach.</title>` +
  `<defs><clipPath id="map-clip"><rect width="${map.w}" height="${map.h}"/></clipPath></defs><g clip-path="url(#map-clip)">` +
  `<rect class="map__sea" width="${map.w}" height="${map.h}"/>` +
  counties.map((d) => `<path class="map__land" d="${d}"/>`).join('') +
  `<g>${map.cities.map((c, i) => `<path class="map__city" data-city="${c.name}" style="--o:${i}" d="${c.d}"/>`).join('')}</g>` +
  counties.map((d) => `<path class="map__line" d="${d}"/>`).join('') +
  `<text class="map__county" x="22" y="452">Palm Beach County</text><text class="map__county" x="22" y="720">Broward County</text>` +
  `<text class="map__sea-t" transform="translate(${map.w - 26} 560) rotate(90)">Atlantic Ocean</text>` +
  `<g>${map.cities.map(lab).join('')}</g></g></svg>`;

const css = read('./src/styles.css');
const js = [read('./vendor/lenis.min.js'), read('./src/main.js')].join('\n;\n').replace(/<\/script/gi, '<\\/script');
const src = read('./src/index.html')
  .replace('<!--SECTION-->', () => section)
  .replace('<!--MAP-->', () => mapSvg)
  .replace(/<!--KIND:(\w+)-->/g, (m, k) => read(`./src/kind-${k}.svg`).trim());

/* ——— vérifications : ce qui est affiché correspond au contenu ——— */
const work = [...src.matchAll(/<li data-k="([\w ]+)"><button class="ph"/g)].map((m) => m[1].split(' '));
for (const m of src.matchAll(/data-k="(\w+)"[^>]*>[^<]*<span>(\d+)<\/span>/g)) {
  const real = m[1] === 'all' ? work.length : work.filter((k) => k.includes(m[1])).length;
  if (real !== +m[2]) throw new Error(`photos « ${m[1]} » : ${m[2]} annoncées, ${real} dans la grille`);
}
const listed = [...src.matchAll(/<ul data-county="[^"]+">([\s\S]*?)<\/ul>/g)].flatMap((m) => [...m[1].matchAll(/<li>([^<]+)<\/li>/g)].map((x) => x[1]));
const onMap = map.cities.map((c) => c.name);
if (listed.length !== 25 || onMap.length !== 25 || listed.some((n) => !onMap.includes(n)))
  throw new Error(`villes : ${listed.length} dans la liste, ${onMap.length} sur la carte, ou des noms différents`);
if (!/25 cities/.test(src)) throw new Error('le titre du secteur ne dit plus 25 villes');
const ld = src.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
const ldData = JSON.parse(ld[1]);
if (ldData.areaServed.length !== 25) throw new Error('données structurées : il faut les 25 villes');
const steps = [...src.matchAll(/<li data-step="(\d)">/g)].length;
const tiles = (section.match(/class="xs__tile"/g) || []).length;
if (steps !== 4 || tiles < 3) throw new Error(`couche par couche : ${steps} étapes, ${tiles} tuiles`);

/* ——— les photos : chaque balise img/source, en fichier unique (intégrées) ou en ligne (assets/) ——— */
const used = new Set();
const NAME = /img\/([\w-]+)\.avif/g;
const embedded = new Set();
const BLANK = 'data:image/gif;base64,R0lGODlhAQABAAAAACw=';
const tag = (mode) => (m) => {
  let t = m;
  if (mode === 'one') {
    // fichier unique : une seule version de chaque photo, la plus grande de la liste, intégrée une seule fois ;
    // les répétitions reprennent la même image au chargement (main.js, data-same)
    const set = t.match(/\ssrcset="([^"]+)"/);
    if (set && /^<img/.test(t)) {
      const best = set[1].split(',').map((s) => s.trim().split(/\s+/)[0]).pop();
      t = t.replace(/\ssrc="[^"]+"/, ` src="${best}"`).replace(/\s(srcset|sizes)="[^"]*"/g, '');
    }
    const one = /^<img/.test(t) && t.match(/\ssrc="img\/([\w-]+)\.avif"/);
    if (one && embedded.has(one[1])) t = t.replace(/\ssrc="[^"]+"/, ` src="${BLANK}" data-same="${one[1]}"`);
    else if (one) (embedded.add(one[1]), (t = t.replace(/^<img/, `<img data-name="${one[1]}"`)));
    t = t.replace(NAME, (x, n) => `data:image/avif;base64,${b64(`./src/img/${n}.avif`)}`);
  } else {
    t = t.replace(NAME, (x, n) => (used.add(n), `assets/img/${n}.avif`));
  }
  // largeur et hauteur de la photo affichée par défaut (pas de décalage au chargement)
  const own = m.match(/^<img\b[^>]*\ssrc="img\/([\w-]+)\.avif"/);
  if (own && !/\swidth=/.test(m)) t = t.replace(/^<img/, `<img width="${size(own[1])[0]}" height="${size(own[1])[1]}"`);
  return t;
};
const photos = (html, mode) =>
  html
    .replace(/<(img|source)\b[^>]*>/g, tag(mode))
    // la visionneuse : en ligne, la grande photo est un fichier ; dans le fichier unique, elle est déjà dans la page
    .replace(/\sdata-full="img\/([\w-]+)\.avif"/g, (m, n) => (mode === 'one' ? '' : (used.add(n), ` data-full="assets/img/${n}.avif"`)));

/* ——— le fichier unique ——— */
const page = photos(src, 'one')
  .replace('<!--STYLES-->', () => `<style>\n${fontCss(`data:font/woff2;base64,${b64(`./vendor/fonts/${FONT}`)}`)}\n${css}\n</style>`)
  .replace('<!--SCRIPTS-->', () => `<script>\n${js}\n</script>`);
if (/["(]img\//.test(page)) throw new Error('fichier unique : une photo n’a pas été intégrée');
mkdirSync(here('./dist/'), {recursive: true});
writeFileSync(here('./dist/index.html'), page);
console.log(`dist/index.html : ${(Buffer.byteLength(page) / 1024).toFixed(0)} Ko`);

/* ——— la version en ligne ——— */
const web = (p) => here(`./dist-web/${p}`);
rmSync(web(''), {recursive: true, force: true});
for (const d of ['assets/img', 'assets/fonts']) mkdirSync(web(d), {recursive: true});
copyFileSync(here(`./vendor/fonts/${FONT}`), web(`assets/fonts/${FONT}`));
const pageWeb = photos(src, 'web')
  .replace('<!--STYLES-->', () =>
    [
      // la police et la photo de l'accueil (large ou en hauteur) dès le départ
      `<link rel="preload" as="font" type="font/woff2" href="assets/fonts/${FONT}" crossorigin>`,
      '<link rel="preload" as="image" type="image/avif" imagesrcset="assets/img/hero-800.avif 800w, assets/img/hero-1280.avif 1280w, assets/img/hero-1920.avif 1920w" imagesizes="100vw" media="(min-width: 701px)" fetchpriority="high">',
      '<link rel="preload" as="image" type="image/avif" href="assets/img/hero-tall.avif" media="(max-width: 700px)" fetchpriority="high">',
      `<style>\n${fontCss(`assets/fonts/${FONT}`)}\n${css}\n</style>`,
    ].join('\n'),
  )
  .replace('<!--SCRIPTS-->', () => `<script>\n${js}\n</script>`);
if (/["(]img\//.test(pageWeb)) throw new Error('version en ligne : un chemin de photo n’a pas été réécrit');
for (const n of used) copyFileSync(here(`./src/img/${n}.avif`), web(`assets/img/${n}.avif`));
writeFileSync(web('index.html'), pageWeb);
// robots.txt, sitemap.xml, llms.txt, en-têtes et image de partage
for (const f of ['_headers', 'vercel.json', 'robots.txt', 'sitemap.xml', 'llms.txt']) if (existsSync(here(`./web/${f}`))) copyFileSync(here(`./web/${f}`), web(f));
if (existsSync(here('./web/og.jpg'))) copyFileSync(here('./web/og.jpg'), web('assets/og.jpg'));
console.log(`dist-web/index.html : ${(Buffer.byteLength(pageWeb) / 1024).toFixed(0)} Ko, ${used.size} photos`);
