// Deux sorties :
//  - dist/index.html : le site en un seul fichier (polices, styles, photos, carte, librairie et script intégrés),
//    à ouvrir d'un double-clic ;
//  - dist-web/ : la version à mettre en ligne, la page légère, et les photos et les polices en fichiers.
//   node build.mjs
import {readFileSync, writeFileSync, mkdirSync, copyFileSync, rmSync, existsSync} from 'node:fs';

const here = (p) => new URL(p, import.meta.url);
const read = (p) => readFileSync(here(p), 'utf8');
const b64 = (p) => readFileSync(here(p)).toString('base64');

/* ——— les polices : Besley (Owen Earl) et Rethink Sans, licence OFL, variables ———
   Les polices de secours reprennent la chasse et la hauteur des vraies (Georgia et Arial ajustées, mesurées sur les
   textes du site) : rien ne bouge quand elles arrivent. */
const FONTS = [
  {family: 'Besley', file: 'Besley.woff2', weight: '400 900', style: 'normal'},
  {family: 'Besley', file: 'Besley-Italic.woff2', weight: '400 900', style: 'italic'},
  {family: 'Rethink Sans', file: 'RethinkSans.woff2', weight: '400 800', style: 'normal'},
];
const FALLBACK = JSON.parse(read('./data/fallback.json'));
const fontCss = (url) =>
  FONTS.map((f) => `@font-face{font-family:"${f.family}";src:url(${url(f.file)}) format("woff2");font-weight:${f.weight};font-style:${f.style};font-display:swap}`).join('') +
  `@font-face{font-family:"Besley Fallback";src:local("Georgia");size-adjust:${FALLBACK.serif.size};ascent-override:${FALLBACK.serif.ascent};descent-override:${FALLBACK.serif.descent};line-gap-override:0%}` +
  `@font-face{font-family:"Rethink Fallback";src:local("Arial"),local("Liberation Sans"),local("Helvetica");size-adjust:${FALLBACK.sans.size};ascent-override:${FALLBACK.sans.ascent};descent-override:${FALLBACK.sans.descent};line-gap-override:0%}`;

const sizes = JSON.parse(read('./data/photo-sizes.json'));
const size = (name) => {
  if (!sizes[name]) throw new Error(`photo inconnue : ${name}`);
  return sizes[name];
};

/* ——— la carte du secteur : la côte du golfe, du Recensement américain (tools/geo.py) ——— */
const map = JSON.parse(read('./data/map.json'));
// les étiquettes à gauche du point quand, à droite, elles mordraient sur une voisine ou sur la terre de l'île
// Fort Myers Beach, coincée entre Sanibel et Estero, a son nom sous le point
const LEFT = new Set(['Captiva', 'Sanibel']);
const BELOW = new Set(['Fort Myers Beach']);
const town = (t) => {
  const base = t.name === 'Naples';
  const left = LEFT.has(t.name);
  const below = BELOW.has(t.name);
  const tx = below ? 0 : left ? -12 : 12;
  const ty = below ? 32 : 7;
  const anchor = below ? ' text-anchor="middle"' : left ? ' text-anchor="end"' : '';
  return (
    `<g class="map__town${base ? ' is-base' : ''}" transform="translate(${t.x} ${t.y})">` +
    `<circle r="${base ? 7 : 5}"/><text x="${tx}" y="${ty}"${anchor}>${t.name}</text>` +
    (base ? `<text class="map__sub" x="${tx}" y="31"${anchor}>our office</text>` : '') +
    '</g>'
  );
};
// chaque comté n'est écrit qu'une fois (defs) ; les trois couches le reprennent avec <use>
const defs = map.counties.map((c, i) => `<path id="c${i}" d="${c.d}"/>`).join('');
const uses = (cls) => map.counties.map((c, i) => `<use href="#c${i}" class="${typeof cls === 'function' ? cls(c) : cls}"/>`).join('');
const land = uses((c) => `map__land${c.served ? ' is-served' : ''}`);
// la côte : chaque comté est tracé deux fois, un trait bleu épais dessous, puis le remplissage par-dessus ;
// entre deux comtés, le remplissage du voisin recouvre le trait : il ne reste du bleu que le long de l'eau
const mapSvg =
  `<svg class="map" viewBox="0 0 ${map.w} ${map.h}" role="img" aria-labelledby="map-t" focusable="false">` +
  `<title id="map-t">Map of Florida’s Gulf coast from Port Charlotte and Boca Grande in the north to Marco Island in the south, with the eleven towns where we build. Our office is in Naples.</title>` +
  `<defs><clipPath id="map-clip"><rect width="${map.w}" height="${map.h}"/></clipPath>${defs}</defs><g clip-path="url(#map-clip)">` +
  `<rect class="map__sea" width="${map.w}" height="${map.h}"/>` +
  `<g>${uses('map__coast')}</g>` +
  `<g>${land}</g>` +
  `<g>${uses('map__border')}</g>` +
  `<text class="map__gulf" x="40" y="${map.h - 250}">The Gulf</text>` +
  `<text class="map__county" x="${map.w - 30}" y="122" text-anchor="end">Charlotte</text>` +
  `<text class="map__county" x="${map.w - 30}" y="470" text-anchor="end">Lee</text>` +
  `<text class="map__county" x="${map.w - 30}" y="700" text-anchor="end">Collier</text>` +
  `<g>${map.towns.map(town).join('')}</g></g></svg>`;

const css = read('./src/styles.css');
const js = [read('./vendor/lenis.min.js'), read('./src/main.js')].join('\n;\n').replace(/<\/script/gi, '<\\/script');
const src = read('./src/index.html').replace('<!--MAP-->', () => mapSvg);

/* ——— vérifications : ce qui est affiché correspond au contenu ——— */
const listed = [...src.matchAll(/<div><h3>[^<]+County<\/h3><ul>([\s\S]*?)<\/ul><\/div>/g)].flatMap((m) => [...m[1].matchAll(/<li>([^<]+)<\/li>/g)].map((x) => x[1]));
const onMap = map.towns.map((t) => t.name);
if (listed.length !== 11 || onMap.length !== 11 || listed.some((n) => !onMap.includes(n)))
  throw new Error(`villes : ${listed.length} dans la liste, ${onMap.length} sur la carte, ou des noms différents`);
const ld = JSON.parse(src.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
if (ld.areaServed.length !== 11) throw new Error('données structurées : il faut les 11 villes');
if (ld.areaServed.some((c) => !onMap.includes(c.name.replace(/, FL$/, '')))) throw new Error('données structurées : une ville n’est pas sur la carte');
// chaque avis des données structurées est la citation affichée, mot pour mot (coupes « … » comprises)
const shown = src.split('</head>')[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ');
for (const r of ld.review) if (!shown.includes(r.reviewBody)) throw new Error(`données structurées : l’avis de ${r.author.name} n’est pas celui de la page`);
const rooms = (src.match(/class="r r--/g) || []).length;
if (rooms !== 12) throw new Error(`pièces : ${rooms} au lieu de 12`);
const steps = (src.match(/class="story__step"/g) || []).length;
if (steps !== 3) throw new Error(`histoire de la maison : ${steps} étapes au lieu de 3`);
if ((src.match(/CBC1266776/g) || []).length < 4) throw new Error('la licence doit figurer dans l’accueil, la consultation, le pied de page et les données');

/* ——— les photos : chaque balise img/source, en fichier unique (intégrées) ou en ligne (assets/) ——— */
const used = new Set();
const NAME = /img\/([\w-]+)\.avif/g;
const embedded = new Set();
const BLANK = 'data:image/gif;base64,R0lGODlhAQABAAAAACw=';
const tag = (mode) => (m) => {
  let t = m;
  if (mode === 'one') {
    // fichier unique : une seule version de chaque photo, la plus grande de la liste, intégrée une seule fois ;
    // les répétitions reprennent la même image au chargement (main.js n'en a pas besoin : data-same est lu ici)
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
// fichier unique : une image répétée reprend la source de la première (un petit script, avant le reste)
const same = `document.querySelectorAll('img[data-same]').forEach(function(i){var s=document.querySelector('img[data-name="'+i.dataset.same+'"]');if(s)i.src=s.src});`;

/* ——— le fichier unique ——— */
const page = photos(src, 'one')
  .replace('<!--STYLES-->', () => `<style>\n${fontCss((f) => `data:font/woff2;base64,${b64(`./vendor/fonts/${f}`)}`)}\n${css}\n</style>`)
  .replace('<!--SCRIPTS-->', () => `<script>\n${same}\n${js}\n</script>`);
if (/["(]img\//.test(page)) throw new Error('fichier unique : une photo n’a pas été intégrée');
mkdirSync(here('./dist/'), {recursive: true});
writeFileSync(here('./dist/index.html'), page);
console.log(`dist/index.html : ${(Buffer.byteLength(page) / 1024).toFixed(0)} Ko`);

/* ——— la version en ligne ——— */
const web = (p) => here(`./dist-web/${p}`);
rmSync(web(''), {recursive: true, force: true});
for (const d of ['assets/img', 'assets/fonts']) mkdirSync(web(d), {recursive: true});
for (const f of FONTS) copyFileSync(here(`./vendor/fonts/${f.file}`), web(`assets/fonts/${f.file}`));
const pageWeb = photos(src, 'web')
  .replace('<!--STYLES-->', () =>
    [
      // les polices des titres et du texte dès le départ ; l'italique attend son tour
      `<link rel="preload" as="font" type="font/woff2" href="assets/fonts/Besley.woff2" crossorigin>`,
      `<link rel="preload" as="font" type="font/woff2" href="assets/fonts/RethinkSans.woff2" crossorigin>`,
      `<style>\n${fontCss((f) => `assets/fonts/${f}`)}\n${css}\n</style>`,
    ].join('\n'),
  )
  .replace('<!--SCRIPTS-->', () => `<script>\n${js}\n</script>`);
if (/["(]img\//.test(pageWeb)) throw new Error('version en ligne : un chemin de photo n’a pas été réécrit');
for (const n of used) copyFileSync(here(`./src/img/${n}.avif`), web(`assets/img/${n}.avif`));
writeFileSync(web('index.html'), pageWeb);
// robots.txt, sitemap.xml, llms.txt, en-têtes, redirections des anciennes pages et image de partage
for (const f of ['_headers', '_redirects', 'vercel.json', 'robots.txt', 'sitemap.xml', 'llms.txt']) if (existsSync(here(`./web/${f}`))) copyFileSync(here(`./web/${f}`), web(f));
if (existsSync(here('./web/og.jpg'))) copyFileSync(here('./web/og.jpg'), web('assets/og.jpg'));
console.log(`dist-web/index.html : ${(Buffer.byteLength(pageWeb) / 1024).toFixed(0)} Ko, ${used.size} photos`);
