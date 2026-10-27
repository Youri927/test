// Deux sorties :
//  - dist/index.html : le site en un seul fichier (polices, styles, photos, logo, librairie et script intégrés), à ouvrir
//    d'un double-clic ; chaque photo y est intégrée une fois, et le script la pose ;
//  - dist-web/ : la version à mettre en ligne, la page légère, et les photos (en plusieurs largeurs) et les polices
//    en fichiers.
//   node build.mjs
import {readFileSync, writeFileSync, mkdirSync, copyFileSync, rmSync, existsSync} from 'node:fs';
import {VIEW, LETTERS} from './tools/mark.mjs';

const here = (p) => new URL(p, import.meta.url);
const read = (p) => readFileSync(here(p), 'utf8');
const b64 = (p) => readFileSync(here(p)).toString('base64');
const fail = (m) => {
  throw new Error(m);
};
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const SITE = 'https://feelydevelopments.com';
const MAIL = 'FeelyDev@gmail.com';
const PHONE = '(321) 663-1433';
// les deux licences de Ryan Feely, au nom commercial Feely Developments LLC (registre du DBPR de Floride)
const CBC = {id: 'CBC1268587', name: 'Florida Certified Building Contractor', url: 'https://www.myfloridalicense.com/LicenseDetail.asp?SID=&id=3872AD64AFB2724005E7E7FD51EEE5EF'};
const CRC = {id: 'CRC1330421', name: 'Florida Certified Residential Contractor', url: 'https://www.myfloridalicense.com/LicenseDetail.asp?SID=&id=26F0CFD097A7BB4D1878BB2D0FB56585'};

/* ——— les polices : Spectral (titres et texte) et Jost (l'interface), licence OFL ———
   Les polices de secours reprennent la chasse et la hauteur des vraies (Times et Arial ajustées, mesurées sur les
   textes du site, tools/fallback.py) : le texte bouge à peine quand elles arrivent. */
const FONTS = [
  {family: 'Spectral', file: 'Spectral-200.woff2', weight: '200'},
  {family: 'Spectral', file: 'Spectral-300.woff2', weight: '300'},
  {family: 'Spectral', file: 'Spectral-400.woff2', weight: '400'},
  {family: 'Jost', file: 'Jost.woff2', weight: '400 600'},
];
const FB = JSON.parse(read('./data/fallback.json'));
const fallback = (name, locals, m) =>
  `@font-face{font-family:"${name}";src:${locals.map((l) => `local("${l}")`).join(',')};size-adjust:${m.size};ascent-override:${m.ascent};descent-override:${m.descent};line-gap-override:0%}`;
const fontCss = (url) =>
  FONTS.map((f) => `@font-face{font-family:"${f.family}";src:url(${url(f.file)}) format("woff2");font-weight:${f.weight};font-style:normal;font-display:swap}`).join('') +
  fallback('Spectral Fallback', ['Times New Roman', 'TimesNewRomanPSMT', 'Liberation Serif', 'Times'], FB.serif) +
  fallback('Jost Fallback', ['Arial', 'ArialMT', 'Liberation Sans', 'Helvetica'], FB.sans);

/* ——— le logo redessiné (tools/mark.mjs), défini une fois ——— */
const symbols = `<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><symbol id="mark" viewBox="${VIEW}"><path d="${LETTERS}"/></symbol></svg>`;
const mark = `<svg class="mark" viewBox="${VIEW}" aria-hidden="true" focusable="false"><use href="#mark"/></svg>`;
const favicon = `data:image/png;base64,${b64('./web/favicon.png')}`;

/* ——— les trois photos, et les détails recadrés dedans ——— */
const sizes = JSON.parse(read('./data/photos.json'));
const lqip = JSON.parse(read('./data/lqip.json'));
const sizeOf = (n) => sizes.sizes[n] || fail(`photo inconnue : ${n}`);
const PLATES = {
  foyer: {
    alt: 'An entry hall with whitewashed brick walls, two antique doors hung on an iron rail, a herringbone oak floor and black steel-framed glass doors.',
    cap: 'Whitewashed brick, antique doors on an iron rail, herringbone oak, steel and glass.',
    sizes: '(min-width: 1000px) calc((100vh - 310px) * 1.5), 100vw',
    lcp: true,
  },
  house: {
    alt: 'A white two-story house with a columned front porch, two chimneys and a gravel drive between brick pillars with lanterns, framed by oaks and clipped hedges.',
    cap: 'A two-story house with a columned porch, in Winter Park.',
    sizes: '(min-width: 1000px) calc((100vh - 310px) * 1.78), 100vw',
  },
  living: {
    alt: 'A living room under a vaulted white plank ceiling with reclaimed wood beams, an oak-clad wall with a linear fireplace and floating shelves, and the kitchen beyond.',
    cap: 'Reclaimed beams under a white plank ceiling, a fireplace wall in oak, the kitchen beyond.',
    sizes: '(min-width: 1000px) calc((100vh - 310px) * 1.5), 100vw',
  },
};
const DETAILS = {
  foyer: {
    label: 'Details from the entry hall',
    items: [
      ['foyer-doors', 'Antique doors on an iron rail'],
      ['foyer-brick', 'Whitewashed brick'],
      ['foyer-oak', 'Herringbone oak floor'],
    ],
  },
  living: {
    label: 'Details from the living room',
    items: [
      ['living-beams', 'Reclaimed beams, white plank ceiling'],
      ['living-fire', 'Linear fireplace in an oak wall'],
      ['living-hood', 'Wood range hood, scale tile'],
    ],
  },
};
const plateHtml = (name) => {
  const p = PLATES[name] || fail(`photo sans légende : ${name}`);
  const [w, h] = sizeOf(name);
  const load = p.lcp ? ' fetchpriority="high"' : ' loading="lazy"';
  return (
    `<figure class="plate plate--${name}" data-plate="${name}" style="--r:${(w / h).toFixed(4)}">` +
    `<div class="plate__frame" style="--lqip:url(${lqip[name]})"><img data-img="${name}" data-one="1920" sizes="${p.sizes}" alt="${esc(p.alt)}" decoding="async"${load}><span class="plate__mark" aria-hidden="true"></span></div>` +
    `<figcaption class="plate__cap">${esc(p.cap)}</figcaption></figure>`
  );
};
const detailsHtml = (name) => {
  const set = DETAILS[name] || fail(`détails inconnus : ${name}`);
  return (
    `<ul class="details" aria-label="${esc(set.label)}">` +
    set.items
      .map(([n, cap]) => {
        const place = sizes.places[n] || fail(`détail sans place : ${n}`);
        return (
          `<li data-for="${name}" data-place="${place.join(',')}"><figure class="detail">` +
          `<div class="detail__frame" style="--lqip:url(${lqip[n]})"><img data-img="${n}" data-one="560" sizes="(min-width: 1000px) 216px, 31vw" alt="" decoding="async" loading="lazy"></div>` +
          `<figcaption>${esc(cap)}</figcaption></figure></li>`
        );
      })
      .join('') +
    `</ul>`
  );
};

/* ——— les données structurées : l'entreprise, ses deux licences, la villa en construction ——— */
const BIZ = `${SITE}/#business`;
const credential = (c) => ({
  '@type': 'EducationalOccupationalCredential',
  credentialCategory: 'license',
  name: c.name,
  identifier: c.id,
  url: c.url,
  recognizedBy: {'@type': 'GovernmentOrganization', name: 'Florida Department of Business and Professional Regulation'},
});
const ld = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': ['HomeAndConstructionBusiness', 'GeneralContractor'],
      '@id': BIZ,
      name: 'Feely Developments',
      legalName: 'Feely Developments LLC',
      slogan: 'Design-Build-Live',
      url: `${SITE}/`,
      logo: `${SITE}/assets/logo.png`,
      image: `${SITE}/assets/og.jpg`,
      description:
        'Custom homes and renovations in Winter Park, Florida, since 2007: real estate services, design, demo, construction and move-in. Clients meet with Ryan Feely, CEO.',
      telephone: '+1-321-663-1433',
      email: MAIL,
      address: {'@type': 'PostalAddress', streetAddress: '160 Whipple Avenue', addressLocality: 'Winter Park', addressRegion: 'FL', postalCode: '32789', addressCountry: 'US'},
      areaServed: {'@type': 'City', name: 'Winter Park, Florida'},
      employee: {'@type': 'Person', name: 'Ryan Feely', jobTitle: 'CEO'},
      hasCredential: [credential(CBC), credential(CRC)],
      knowsAbout: ['Custom home building', 'Home renovation and remodeling', 'Design-build', 'Real estate services'],
      makesOffer: {
        '@type': 'Offer',
        price: 5800000,
        priceCurrency: 'USD',
        description: 'Under construction. Plans and price may change.',
        itemOffered: {
          '@type': 'SingleFamilyResidence',
          name: 'Modern French Country Villa on Palmer Avenue',
          address: {'@type': 'PostalAddress', streetAddress: 'Palmer Avenue', addressLocality: 'Winter Park', addressRegion: 'FL', postalCode: '32789', addressCountry: 'US'},
          floorSize: {'@type': 'QuantitativeValue', value: 7426, unitCode: 'FTK', description: 'Under roof'},
        },
      },
    },
    {'@type': 'WebSite', '@id': `${SITE}/#site`, url: `${SITE}/`, name: 'Feely Developments', publisher: {'@id': BIZ}, inLanguage: 'en-US'},
  ],
};

/* ——— la page ——— */
const src = read('./src/index.html')
  .replaceAll('<!--MARK-->', () => mark)
  .replace('<!--FAVICON-->', () => favicon)
  .replaceAll('<!--CBC_URL-->', () => esc(CBC.url))
  .replaceAll('<!--CRC_URL-->', () => esc(CRC.url))
  .replace(/<!--PLATE:(\w+)-->/g, (_, n) => plateHtml(n))
  .replace(/<!--DETAILS:(\w+)-->/g, (_, n) => detailsHtml(n))
  .replace('<!--JSONLD-->', () => JSON.stringify(ld).replace(/</g, '\\u003c'))
  .replace('<body>', () => `<body>\n${symbols}`);

/* ——— vérifications : ce qui est affiché correspond au contenu ——— */
const clean = (s) => s.replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
const body = src.split('</head>')[1].replace(/<script[\s\S]*?<\/script>|<svg[\s\S]*?<\/svg>/g, ' ');
const shown = clean(body);
for (const c of [CBC, CRC]) {
  if ((shown.match(new RegExp(c.id, 'g')) || []).length < 2) fail(`la licence ${c.id} doit figurer dans la construction et à la fin`);
  if ((src.match(new RegExp(esc(c.url).replace(/[.?]/g, '\\$&'), 'g')) || []).length < 2) fail(`le lien du registre doit accompagner chaque mention de ${c.id}`);
}
if ((shown.match(/\(321\) 663-1433/g) || []).length < 5) fail('le téléphone doit figurer dans l’en-tête, le menu, l’accueil, le rendez-vous et la fin');
// la seule adresse de rue : celle qu'ils publient ; aucun numéro de maison (ni la plaque de la photo, ni les maisons)
const streets = shown.match(/\b\d{2,5}\s+[A-Z][a-z]+(\s+[A-Z][a-z]+)*\s+(Lane|Ln|Avenue|Ave|Road|Rd|Street|St|Drive|Dr|Blvd|Way|Court|Ct|Circle|Cir|Terrace|Ter|Place|Pl)\b/g) || [];
for (const s of streets) if (s !== '160 Whipple Avenue') fail(`une adresse de rue s’affiche : ${s}`);
if ((shown.match(/160 Whipple Avenue/g) || []).length !== 1) fail('l’adresse ne doit figurer qu’une fois, à la fin');
for (const w of ['1660', '1011', 'Park Ave.', 'GuildQuality', 'SL3225382', 'Pennsylvania', 'GoDaddy', 'reCAPTCHA']) if (shown.includes(w)) fail(`un texte à ne pas reprendre s’affiche : ${w}`);
for (const y of shown.replace(/160 Whipple Avenue|32789/g, '').match(/\b(19|20)\d\d\b/g) || []) if (!['2007', '2026'].includes(y)) fail(`une année s’affiche : ${y}`);
for (const m of src.matchAll(/<img\b[^>]*>/g)) if (!/\salt="[^"]*"/.test(m[0])) fail(`photo sans attribut alt : ${m[0].slice(0, 80)}`);
for (const [, ids] of src.matchAll(/aria-(?:labelledby|describedby|controls)="([^"]+)"/g)) for (const id of ids.split(/\s+/)) if (!src.includes(`id="${id}"`)) fail(`identifiant manquant : ${id}`);
for (const [, href] of src.matchAll(/href="#([\w-]+)"/g)) if (!src.includes(`id="${href}"`)) fail(`ancre sans cible : #${href}`);
if ((src.match(/<h1[\s>]/g) || []).length !== 1) fail('il faut un seul h1');
if (/<!--(MARK|FAVICON|CBC_URL|CRC_URL|PLATE|DETAILS|JSONLD)/.test(src)) fail('un repère du gabarit n’a pas été remplacé');
if (/‑/.test(src)) fail('trait d’union insécable : absent des polices du site');

/* ——— les photos : chaque <img data-img>, intégrée (fichier unique) ou en fichiers (en ligne) ——— */
const variants = (name) =>
  Object.keys(sizes.sizes)
    .filter((k) => k === name || (k.startsWith(`${name}-`) && /^\d+$/.test(k.slice(name.length + 1))))
    .map((k) => ({file: k, w: sizeOf(k)[0], h: sizeOf(k)[1]}))
    .sort((a, b) => a.w - b.w);
const pickOne = (name, want) => {
  const v = variants(name);
  if (!v.length) fail(`photo inconnue : ${name}`);
  return [...v].reverse().find((x) => x.w <= want) || v[0];
};
const used = new Set();
const embedded = new Map();
const embed = (file) => {
  if (!embedded.has(file)) embedded.set(file, `data:image/avif;base64,${b64(`./src/img/${file}.avif`)}`);
  return file;
};
const photos = (html, mode) =>
  html.replace(/<img\b([^>]*)\sdata-img="([\w-]+)"([^>]*)>/g, (m, a, name, b) => {
    let attrs = `${a}${b}`;
    const want = +((attrs.match(/data-one="(\d+)"/) || [])[1] || 1920);
    attrs = attrs.replace(/\sdata-one="[^"]*"/g, '');
    const big = variants(name).at(-1);
    if (mode === 'one') {
      const pick = pickOne(name, want);
      return `<img data-k="${embed(pick.file)}" width="${big.w}" height="${big.h}"${attrs.replace(/\ssizes="[^"]*"/g, '')}>`;
    }
    const v = variants(name);
    for (const x of v) used.add(x.file);
    const mid = v.find((x) => x.w >= 760) || big;
    return `<img src="assets/img/${mid.file}.avif" srcset="${v.map((x) => `assets/img/${x.file}.avif ${x.w}w`).join(', ')}" width="${big.w}" height="${big.h}"${attrs}>`;
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
const one = photos(src, 'one');
const imgMap = `<script>window.__IMG=${JSON.stringify(Object.fromEntries(embedded))}</script>`;
const page = one
  .replace('<!--STYLES-->', () => `<style>\n${fontCss((f) => `data:font/woff2;base64,${b64(`./vendor/fonts/${f}`)}`)}\n${css}\n</style>`)
  .replace('<!--DATA-->', () => imgMap)
  .replace('<!--SCRIPTS-->', () => `<script>\n${js}\n</script>`);
if (/data-img=/.test(page)) fail('fichier unique : une photo n’a pas été intégrée');
for (const [, k] of page.matchAll(/data-k="([\w-]+)"/g)) if (!embedded.has(k)) fail(`fichier unique : photo ${k} absente`);
mkdirSync(here('./dist/'), {recursive: true});
writeFileSync(here('./dist/index.html'), page);
console.log(`dist/index.html : ${(Buffer.byteLength(page) / 1024).toFixed(0)} Ko, ${embedded.size} photos intégrées`);

/* ——— la version en ligne ——— */
const web = (p) => here(`./dist-web/${p}`);
rmSync(web(''), {recursive: true, force: true});
for (const dir of ['assets/img', 'assets/fonts']) mkdirSync(web(dir), {recursive: true});
for (const f of FONTS) copyFileSync(here(`./vendor/fonts/${f.file}`), web(`assets/fonts/${f.file}`));
const pageWeb = photos(src, 'web')
  .replace('<!--STYLES-->', () =>
    [
      `<link rel="apple-touch-icon" href="assets/apple-touch-icon.png">`,
      ...['Spectral-200.woff2', 'Spectral-300.woff2', 'Jost.woff2'].map((f) => `<link rel="preload" as="font" type="font/woff2" href="assets/fonts/${f}" crossorigin>`),
      `<style>\n${fontCss((f) => `assets/fonts/${f}`)}\n${css}\n</style>`,
    ].join('\n'),
  )
  .replace('<!--DATA-->', () => '')
  .replace('<!--SCRIPTS-->', () => `<script>\n${js}\n</script>`);
if (/data-img=|data-k=/.test(pageWeb)) fail('version en ligne : un chemin de photo n’a pas été réécrit');
for (const n of used) copyFileSync(here(`./src/img/${n}.avif`), web(`assets/img/${n}.avif`));
writeFileSync(web('index.html'), pageWeb);
for (const f of ['_headers', '_redirects', 'vercel.json', 'robots.txt', 'sitemap.xml', 'llms.txt']) if (existsSync(here(`./web/${f}`))) copyFileSync(here(`./web/${f}`), web(f));
for (const f of ['og.jpg', 'logo.png', 'apple-touch-icon.png']) if (existsSync(here(`./web/${f}`))) copyFileSync(here(`./web/${f}`), web(`assets/${f}`));
console.log(`dist-web/index.html : ${(Buffer.byteLength(pageWeb) / 1024).toFixed(0)} Ko, ${used.size} fichiers de photos`);
