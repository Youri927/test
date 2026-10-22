// Deux sorties :
//  - dist/index.html : le site en un seul fichier (polices, styles, photos, logo, librairie et script intégrés),
//    à ouvrir d'un double-clic ; les photos y sont en 1000 px de large (800 en portrait, plus pour l'accueil) ;
//  - dist-web/ : la version à mettre en ligne, la page légère, et les photos (en plusieurs largeurs) et les polices
//    en fichiers.
//   node build.mjs
import {readFileSync, writeFileSync, mkdirSync, copyFileSync, rmSync, existsSync} from 'node:fs';
import {ROOF_BIG, ROOF_SMALL, CHIMNEY, DOOR, gapMask} from './tools/mark.mjs';

const here = (p) => new URL(p, import.meta.url);
const read = (p) => readFileSync(here(p), 'utf8');
const b64 = (p) => readFileSync(here(p)).toString('base64');
const fail = (m) => {
  throw new Error(m);
};
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const SITE = 'https://bocaremodelinggroup.com';
const LICENSE_URL = 'https://www.myfloridalicense.com/LicenseDetail.asp?SID=&id=0FBFAAEFC1719C352CF00E0F73808757';
const REVIEWS_URL = 'https://maps.app.goo.gl/2Lc1DkWTFQ7by9kW8';

/* ——— les polices : Mozilla Headline (étroite à normale) et Mozilla Text, licence OFL ———
   Les polices de secours reprennent la chasse et la hauteur des vraies (Arial Narrow et Arial ajustées, mesurées sur
   les textes du site, tools/fallback.py) : le texte bouge à peine quand elles arrivent. */
const FONTS = [
  {family: 'Mozilla Headline', file: 'MozillaHeadline.woff2', weight: '400 700', stretch: '75% 100%'},
  {family: 'Mozilla Text', file: 'MozillaText.woff2', weight: '400 600'},
];
const FB = JSON.parse(read('./data/fallback.json'));
const fallback = (name, locals, m) =>
  `@font-face{font-family:"${name}";src:${locals.map((l) => `local("${l}")`).join(',')};size-adjust:${m.size};ascent-override:${m.ascent};descent-override:${m.descent};line-gap-override:0%}`;
const fontCss = (url) =>
  FONTS.map((f) => `@font-face{font-family:"${f.family}";src:url(${url(f.file)}) format("woff2");font-weight:${f.weight};${f.stretch ? `font-stretch:${f.stretch};` : ''}font-style:normal;font-display:swap}`).join('') +
  fallback("Headline Fallback", ["Arial Bold", "Arial-BoldMT", "Liberation Sans Bold", "Arial"], FB.head) +
  fallback('Text Fallback', ['Arial', 'Liberation Sans', 'Helvetica'], FB.text);

/* ——— le logo : leurs deux toits, redessinés à plat (tools/mark.mjs), défini une fois ———
   Ses couleurs passent par --mark-roof et --mark-door (sur fond sombre, la fenêtre devient blanche). */
const symbols =
  `<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">` +
  `<defs>${gapMask('mark-gap')}</defs>` +
  `<symbol id="mark" viewBox="0 0 64 40"><path d="${ROOF_SMALL}" mask="url(#mark-gap)" style="fill:var(--mark-roof)"/><path d="${CHIMNEY}" mask="url(#mark-gap)" style="fill:var(--mark-roof)"/><path d="${ROOF_BIG}" style="fill:var(--mark-roof)"/><path d="${DOOR}" style="fill:var(--mark-door)"/></symbol>` +
  `</svg>`;
const mark = `<svg class="mark" viewBox="0 0 64 40" aria-hidden="true" focusable="false"><use href="#mark"/></svg>`;
const favicon = `data:image/png;base64,${b64('./web/favicon.png')}`;

/* ——— les projets : les photos de chaque projet, dans l'ordre où on les montre (tools/images.py) ——— */
const sizes = JSON.parse(read('./data/photos.json'));
const sets = JSON.parse(read('./data/sets.json'));
const PROJECTS = {
  primary: 'The sketched bathroom, finished',
  kitchen: 'A kitchen with two quartzite islands',
  step: 'A bathroom with the tub on a step',
  stone: 'A bath in blue-gray stone',
  baths: 'Two baths with lit mirrors, and a glass shower',
  living: 'A living room with a grand piano',
  kitchen2: 'A kitchen going in',
  pool: 'A pool under its screen cage',
  deck: 'A pool deck',
  roofs: 'New tile roofs, with our crews',
};
const ALT = {
  'st-3': 'The finished primary bathroom: dark wood vanities under a gold mirror, a white tub on brass legs under the window and a glass shower with a bench.',
  'mb-1': 'The tub on brass legs under a window with sheer shades, beside a frameless glass shower with brass hinges and a bench.',
  'mb-2': 'The tub and the glass shower, with the door to the toilet room open on the right.',
  'mb-3': 'The glass shower with its bench and pebble floor, and the white door with frosted glass panes.',
  'mb-4': 'Close on the frameless glass shower: brass hinges and handle, a stone bench and a pebble floor.',
  'kd-1': 'A line drawing of the kitchen on a computer screen.',
  'kd-2': 'The kitchen in 3D on the computer screen: wood-grain cabinets, two islands in white veined stone.',
  'k-1': 'A worker polishing the top of a quartzite island with waterfall sides.',
  'k-2': 'The finished kitchen with two quartzite islands, wood-grain cabinets and black-framed glass cabinets along the top.',
  'k-3': 'A worker in a Boca Remodeling Group shirt putting in a microwave above the cooktop, under lit glass cabinets.',
  'bd-1': 'A 3D plan of the bathroom seen from above, with its measurements.',
  'b2-1': 'The shower in gray stone with a wood slat floor, beside the tub on its step.',
  'b2-2': 'The whole bathroom: a wood vanity with a makeup counter, the glass shower and the tub on its step under a chandelier.',
  'sb-1': 'A bathroom in blue-gray veined stone, with a freestanding tub, a brass floor faucet, a black double vanity and a lit mirror.',
  'sb-2': 'Inside a shower walled in blue-gray veined stone: a stone bench, brass fixtures and a hexagon stone floor.',
  'sb-3': 'A bedroom with a TV set into a white wall above a long fireplace.',
  'ba-1': 'A bathroom with a white vanity under a lit mirror and a glass shower at the far end.',
  'ba-2': 'A black floating vanity under a lit mirror, a tall plant beside it.',
  'ba-3': 'A large glass shower in gray tile with a niche and a hand shower.',
  'lv-1': 'A bright living room with a grand piano, an abstract painting and a black glass front door.',
  'kp-1': 'A kitchen going in: white cabinets with frosted glass doors, quartzite counters and a brass faucet.',
  'po-1': 'A pool with a blue finish under a white screen cage, a light gray deck around it.',
  'po-2': 'The same pool under its screen cage, a golf course beyond the hedge.',
  'pd-1': 'A white pool deck behind a two-story house with a red tile roof, seen across the pool fence.',
  'pd-2': 'The pool deck and the back of the house from the other side of the pool.',
  'rf-1': 'Our crew taking the old tiles off a roof, our orange dump truck in the driveway.',
  'rf-2': 'A crane truck lifting pallets of new roof tiles, our white pickup in the front.',
  'rf-3': 'Our crew on a new gray tile roof, our pickup in the driveway.',
  'rf-4': 'Our pickup parked in a brick driveway while the crew works on the roof.',
  'rf-5': 'A house with a new gray tile roof on a golf course, a sand trap in front.',
};
const altOf = (name) => ALT[name] || fail(`photo sans texte de remplacement : ${name}`);
const count = (n) => (n === 1 ? '1 photo' : `${n} photos`);
const templates = Object.entries(sets)
  .map(([id, list]) => {
    const title = PROJECTS[id] || fail(`projet sans titre : ${id}`);
    const items = list
      .map((p) => `<li><figure><img data-img="${p.name}" data-cap sizes="(min-width: 900px) 80vw, 100vw" loading="lazy" alt="${esc(altOf(p.name))}"><figcaption>${esc(p.caption)}</figcaption></figure></li>`)
      .join('');
    return `<template id="set-${id}" data-title="${esc(title)}">${items}</template>`;
  })
  .join('\n');

/* ——— le travail : huit projets, la première photo en vignette ——— */
const WORK = [
  {set: 'primary', cover: 'mb-1', cls: 'a', name: 'The sketched bathroom, finished'},
  {set: 'stone', cover: 'sb-2', cls: 'b', name: 'A bath in blue-gray stone'},
  {set: 'roofs', cover: 'rf-3', cls: 'c', name: 'New tile roofs'},
  {set: 'pool', cover: 'po-1', cls: 'd', name: 'A pool under its screen cage'},
  {set: 'baths', cover: 'ba-2', cls: 'e', name: 'Two baths with lit mirrors'},
  {set: 'living', cover: 'lv-1', cls: 'f', name: 'A living room with a grand piano'},
  {set: 'deck', cover: 'pd-1', cls: 'g', name: 'A pool deck'},
  {set: 'kitchen', cover: 'k-3', cls: 'h', name: 'The two-island kitchen, going in'},
];
const card = (c) => {
  const n = (sets[c.set] || fail(`projet inconnu : ${c.set}`)).length;
  const [w, h] = sizes[c.cover] || fail(`photo inconnue : ${c.cover}`);
  const portrait = h > w;
  // la visionneuse s'ouvre sur la photo de la vignette (la vignette devient cette photo)
  const at = sets[c.set].findIndex((p) => p.name === c.cover);
  if (at < 0) fail(`la vignette ${c.cover} n’est pas dans le projet ${c.set}`);
  return `<li class="project project--${c.cls}"><button class="project__ph" type="button" data-set="${c.set}" data-at="${at}" aria-label="${esc(`${c.name}: see ${n === 1 ? 'the photo' : `the ${n} photos`}`)}"><img data-img="${c.cover}" sizes="(min-width: 1024px) ${portrait ? 26 : 50}vw, 100vw" loading="lazy" alt="${esc(altOf(c.cover))}"></button><h3 class="project__name">${esc(c.name)}</h3><p class="project__meta">${count(n)}</p></li>`;
};
const workHtml = `<ul class="projects">${WORK.map(card).join('')}</ul>`;

/* ——— la page ——— */
let src = read('./src/index.html')
  .replaceAll('<!--MARK-->', () => mark)
  .replace('<!--FAVICON-->', () => favicon)
  .replace('<!--WORK-->', () => workHtml)
  .replace('<!--SETS-->', () => templates)
  .replace('<body>', () => `<body>\n${symbols}`);

/* ——— les données structurées ——— */
const BIZ = `${SITE}/#business`;
const ld = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'GeneralContractor',
      '@id': BIZ,
      name: 'Boca Remodeling Group',
      alternateName: 'Boca Remodeling Consulting Group',
      url: `${SITE}/`,
      logo: `${SITE}/assets/logo.png`,
      image: `${SITE}/assets/og.jpg`,
      description: 'Remodeling contractor in Boca Raton, Florida: kitchens, bathrooms, windows, roofs, pools, back yards and decks, designed in 3D before they are built.',
      telephone: '+1-561-247-2727',
      email: 'bocarcg@gmail.com',
      address: {'@type': 'PostalAddress', streetAddress: '7284 West Palmetto Park Road, Suite 101', addressLocality: 'Boca Raton', addressRegion: 'FL', postalCode: '33433', addressCountry: 'US'},
      geo: {'@type': 'GeoCoordinates', latitude: 26.3490321, longitude: -80.1589989},
      openingHoursSpecification: [{'@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '09:00', closes: '17:00'}],
      areaServed: {'@type': 'City', name: 'Boca Raton, Florida'},
      hasCredential: {
        '@type': 'EducationalOccupationalCredential',
        credentialCategory: 'license',
        name: 'Florida Certified General Contractor',
        identifier: 'CGC1539814',
        url: LICENSE_URL,
        recognizedBy: {'@type': 'GovernmentOrganization', name: 'Florida Department of Business and Professional Regulation'},
      },
      knowsAbout: ['Kitchen remodeling', 'Bathroom remodeling', 'Windows', 'Roofing', 'Pools', 'Back yards and decks', 'Plumbing', 'Electrical work', 'Carpentry', '3D design'],
      sameAs: [REVIEWS_URL],
    },
    {'@type': 'WebSite', '@id': `${SITE}/#site`, url: `${SITE}/`, name: 'Boca Remodeling Group', publisher: {'@id': BIZ}, inLanguage: 'en-US'},
  ],
};
src = src.replace('<!--JSONLD-->', () => JSON.stringify(ld).replace(/</g, '\\u003c'));

/* ——— vérifications : ce qui est affiché correspond au contenu ——— */
const clean = (s) => s.replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
const shown = clean(src.split('</head>')[1].replace(/<script[\s\S]*?<\/script>|<svg[\s\S]*?<\/svg>|<template[\s\S]*?<\/template>|<span class="sr">[\s\S]*?<\/span>/g, ' '));
if ((src.match(/CGC1539814/g) || []).length < 4) fail('la licence doit figurer dans l’accueil ou le bureau, le pied de page, la description et les données');
if (!src.includes(LICENSE_URL.replace(/&/g, '&amp;'))) fail('le lien vers la fiche de la licence manque');
if ((shown.match(/561-247-2727/g) || []).length < 4) fail('le téléphone doit figurer dans l’en-tête, l’accueil, le bureau, le devis et le pied de page');
if (!shown.includes('7284 West Palmetto Park Road')) fail('le bureau manque');
if (!shown.includes('Over 30 years') && !shown.includes('over 30 years')) fail('« over 30 years » manque');
if (/coming soon/i.test(shown)) fail('« coming soon » ne doit pas revenir');
// pas de date de chantier : seules l'année du pied de page et la fin de validité de la licence sont des années
for (const y of shown.match(/\b(19|20)\d\d\b/g) || []) if (!['2026', '2028'].includes(y)) fail(`une année s’affiche : ${y}`);
for (const [, s] of src.matchAll(/data-set="([\w-]+)"/g)) if (!sets[s]) fail(`bouton : projet inconnu ${s}`);
for (const [, s, at] of src.matchAll(/data-set="([\w-]+)" data-at="(\d+)"/g)) if (!sets[s]?.[+at]) fail(`bouton : pas de photo ${at} dans ${s}`);
for (const m of src.matchAll(/<img\b[^>]*>/g)) if (!/\salt="[^"]+"/.test(m[0])) fail(`photo sans texte de remplacement : ${m[0].slice(0, 80)}`);
for (const m of src.matchAll(/<img\b[^>]*\sdata-door="([^"]+)"/g)) {
  const v = m[1].split(' ').map(Number);
  if (v.length !== 4 || v.some((x) => !(x >= 0 && x <= 1)) || v[0] >= v[2] || v[1] >= v[3]) fail(`cadre de porte invalide : ${m[1]}`);
}
if ((src.match(/<h1[\s>]/g) || []).length !== 1) fail('il faut un seul h1');
if (/<!--(MARK|FAVICON|WORK|SETS|JSONLD)/.test(src)) fail('un repère du gabarit n’a pas été remplacé');

/* ——— les photos : chaque <img data-img>, en fichier unique (intégrées) ou en ligne (assets/) ——— */
const size = (name) => sizes[name] || fail(`photo inconnue : ${name}`);
const variants = (name) =>
  Object.keys(sizes)
    .filter((k) => k === name || (k.startsWith(`${name}-`) && /^\d+$/.test(k.slice(name.length + 1))))
    .map((k) => ({file: k, w: size(k)[0], h: size(k)[1]}))
    .sort((a, b) => a.w - b.w);
const used = new Set();
const embedded = new Map();
const photos = (html, mode) =>
  html.replace(/<img\b([^>]*)\sdata-img="([\w-]+)"([^>]*)>/g, (m, a, name, b) => {
    const v = variants(name);
    if (!v.length) fail(`photo inconnue : ${name}`);
    const big = v[v.length - 1];
    let attrs = `${a}${b}`;
    // data-cap : la photo ne s'affiche jamais plus grande que son fichier (la visionneuse)
    const capped = /\sdata-cap/.test(attrs);
    attrs = attrs.replace(/\sdata-cap(="[^"]*")?/g, '');
    if (mode === 'one') {
      // fichier unique : une seule version, 1000 px de large (800 en portrait, ou ce que demande data-one), jamais
      // agrandie ; la taille annoncée est celle du fichier intégré
      const portrait = big.h > big.w;
      const want = +((attrs.match(/data-one="(\d+)"/) || [])[1] || (portrait ? 800 : 1000));
      const pick = [...v].reverse().find((x) => x.w <= want) || v[0];
      if (!embedded.has(pick.file)) embedded.set(pick.file, `data:image/avif;base64,${b64(`./src/img/${pick.file}.avif`)}`);
      const cap = capped ? ` style="max-width:min(100%,${pick.w}px)"` : '';
      return `<img src="${embedded.get(pick.file)}" width="${pick.w}" height="${pick.h}"${cap}${attrs.replace(/\s(sizes|data-one)="[^"]*"/g, '')}>`;
    }
    for (const x of v) used.add(x.file);
    const srcset = v.map((x) => `assets/img/${x.file}.avif ${x.w}w`).join(', ');
    const mid = v.find((x) => x.w >= 1000) || big;
    const cap = capped ? ` style="max-width:min(100%,${big.w}px)"` : '';
    return `<img src="assets/img/${mid.file}.avif" srcset="${srcset}" width="${big.w}" height="${big.h}"${cap}${attrs.replace(/\sdata-one="[^"]*"/g, '')}>`;
  });

const minCss = (c) =>
  c
    .split(/("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/)
    .map((part, i) =>
      i % 2
        ? part
        : part
            .replace(/\/\*[\s\S]*?\*\//g, '')
            .replace(/\s+/g, ' ')
            .replace(/\s*([{};,>])\s*/g, '$1')
            .replace(/;}/g, '}'),
    )
    .join('')
    .trim();
const css = minCss(read('./src/styles.css'));
const js = [read('./vendor/lenis.min.js'), read('./src/main.js')].join('\n;\n').replace(/<\/script/gi, '<\\/script');

/* ——— le fichier unique ——— */
const page = photos(src, 'one')
  .replace('<!--STYLES-->', () => `<style>\n${fontCss((f) => `data:font/woff2;base64,${b64(`./vendor/fonts/${f}`)}`)}\n${css}\n</style>`)
  .replace('<!--SCRIPTS-->', () => `<script>\n${js}\n</script>`);
if (/data-img=/.test(page)) fail('fichier unique : une photo n’a pas été intégrée');
mkdirSync(here('./dist/'), {recursive: true});
writeFileSync(here('./dist/index.html'), page);
console.log(`dist/index.html : ${(Buffer.byteLength(page) / 1024).toFixed(0)} Ko, ${embedded.size} photos`);

/* ——— la version en ligne ——— */
const web = (p) => here(`./dist-web/${p}`);
rmSync(web(''), {recursive: true, force: true});
for (const d of ['assets/img', 'assets/fonts']) mkdirSync(web(d), {recursive: true});
for (const f of FONTS) copyFileSync(here(`./vendor/fonts/${f.file}`), web(`assets/fonts/${f.file}`));
// la première image de la scène (l'esquisse) est l'image principale de l'accueil : chargée en priorité
// la 3D et la photo, cachées sous l'esquisse au chargement, passent après elle
const pageWeb = photos(src, 'web')
  .replace(/(<img src="assets\/img\/st-1[^"]*"[^>]*?)>/, '$1 fetchpriority="high">')
  .replace(/(<img src="assets\/img\/st-[23][^"]*"[^>]*?stage__img[^>]*?)>/g, '$1 fetchpriority="low">')
  .replace('<!--STYLES-->', () =>
    [
      `<link rel="apple-touch-icon" href="assets/apple-touch-icon.png">`,
      `<link rel="preload" as="font" type="font/woff2" href="assets/fonts/MozillaHeadline.woff2" crossorigin>`,
      `<link rel="preload" as="font" type="font/woff2" href="assets/fonts/MozillaText.woff2" crossorigin>`,
      `<style>\n${fontCss((f) => `assets/fonts/${f}`)}\n${css}\n</style>`,
    ].join('\n'),
  )
  .replace('<!--SCRIPTS-->', () => `<script>\n${js}\n</script>`);
if (/data-img=/.test(pageWeb)) fail('version en ligne : un chemin de photo n’a pas été réécrit');
for (const n of used) copyFileSync(here(`./src/img/${n}.avif`), web(`assets/img/${n}.avif`));
writeFileSync(web('index.html'), pageWeb);
// robots.txt, sitemap.xml, llms.txt, en-têtes, redirections des anciennes adresses, image de partage et logo
for (const f of ['_headers', '_redirects', 'vercel.json', 'robots.txt', 'sitemap.xml', 'llms.txt']) if (existsSync(here(`./web/${f}`))) copyFileSync(here(`./web/${f}`), web(f));
for (const f of ['og.jpg', 'logo.png', 'apple-touch-icon.png']) if (existsSync(here(`./web/${f}`))) copyFileSync(here(`./web/${f}`), web(`assets/${f}`));
console.log(`dist-web/index.html : ${(Buffer.byteLength(pageWeb) / 1024).toFixed(0)} Ko, ${used.size} fichiers de photos`);
