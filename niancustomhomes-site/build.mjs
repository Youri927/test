// Deux sorties :
//  - dist/index.html : le site en un seul fichier (polices, styles, photos, logo, librairie et script intégrés), à ouvrir
//    d'un double-clic ; chaque photo y est intégrée une seule fois (1 400 px de large au plus, 480 pour les vignettes),
//    et le script la pose partout où elle sert ;
//  - dist-web/ : la version à mettre en ligne, la page légère, et les photos (en plusieurs largeurs) et les polices
//    en fichiers.
//   node build.mjs
import {readFileSync, writeFileSync, mkdirSync, copyFileSync, rmSync, existsSync} from 'node:fs';
import {VIEW, ROOF, LETTERS} from './tools/mark.mjs';

const here = (p) => new URL(p, import.meta.url);
const read = (p) => readFileSync(here(p), 'utf8');
const b64 = (p) => readFileSync(here(p)).toString('base64');
const fail = (m) => {
  throw new Error(m);
};
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const SITE = 'https://www.niancustomhomes.com';
const MAIL = 'contact@niancustomhomes.com';
const LICENSE = 'CBC1260134';
const LICENSE_URL = 'https://www.myfloridalicense.com/LicenseDetail.asp?SID=&id=08F3D700350AFAA9AF52ADF47F5FED63';

/* ——— les polices : Petrona (les titres) et Gantari (le texte, l'interface), licence OFL ———
   Les polices de secours reprennent la chasse et la hauteur des vraies (Times et Arial ajustées, mesurées sur les
   textes du site, tools/fallback.py) : le texte bouge à peine quand elles arrivent. */
const FONTS = [
  {family: 'Petrona', file: 'Petrona.woff2', weight: '200 500'},
  {family: 'Gantari', file: 'Gantari.woff2', weight: '400 700'},
];
const FB = JSON.parse(read('./data/fallback.json'));
const fallback = (name, locals, m) =>
  `@font-face{font-family:"${name}";src:${locals.map((l) => `local("${l}")`).join(',')};size-adjust:${m.size};ascent-override:${m.ascent};descent-override:${m.descent};line-gap-override:0%}`;
const fontCss = (url) =>
  FONTS.map((f) => `@font-face{font-family:"${f.family}";src:url(${url(f.file)}) format("woff2");font-weight:${f.weight};font-style:normal;font-display:swap}`).join('') +
  fallback('Petrona Fallback', ['Times New Roman', 'TimesNewRomanPSMT', 'Liberation Serif', 'Times'], FB.head) +
  fallback('Gantari Fallback', ['Arial', 'ArialMT', 'Liberation Sans', 'Helvetica'], FB.text);

/* ——— le logo redessiné (tools/mark.mjs), défini une fois ———
   Ses couleurs passent par --mark-roof et --mark-ink (sur le pied de page sombre, tout devient clair). */
const symbols =
  `<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">` +
  `<symbol id="mark" viewBox="${VIEW}"><path d="${ROOF}" style="fill:var(--mark-roof,#6B1D22)"/><path d="${LETTERS}" fill-rule="evenodd" style="fill:var(--mark-ink,#A9AAA8)"/></symbol>` +
  `<symbol id="roof" viewBox="0 0 793 339"><path d="${ROOF}"/></symbol>` +
  `</svg>`;
const mark = `<svg class="mark" viewBox="${VIEW}" aria-hidden="true" focusable="false"><use href="#mark"/></svg>`;
const favicon = `data:image/png;base64,${b64('./web/favicon.png')}`;

/* ——— les six maisons : leurs noms et leurs styles (leurs mots, sans les fautes), leurs photos ——— */
const HOMES = [
  {id: 'park', name: 'The Park Modern Home', style: 'Modern West Indies design', photos: ['p-1', 'p-2', 'p-3', 'p-4', 'p-5', 'p-6']},
  {id: 'villa', name: 'Villa Estate Home', style: 'Large estate villa design', photos: ['v-1', 'v-2', 'v-3', 'v-4', 'v-5', 'v-6']},
  {id: 'oakes-estate', name: 'Oakes Estate Home', style: 'Large single-family custom design', photos: ['e-1', 'e-2', 'e-3', 'e-4', 'e-5', 'e-6']},
  {id: 'oakes-woods', name: 'Oakes Woods Custom Home', style: 'Contemporary single-family custom home', photos: ['w-1', 'w-2', 'w-3', 'w-4', 'w-5']},
  {id: 'collier-woods', name: 'Collier Woods Custom Home', style: 'Mid-size single-family custom home', photos: ['c-1', 'c-2', 'c-3', 'c-4']},
  {id: 'gates', name: 'Gates Custom Home', style: 'Mid-size estate home', photos: ['g-1', 'g-2', 'g-3', 'g-4', 'g-5', 'g-6']},
];
// ce que montre chaque photo (la légende, et le nom du bouton qui l'ouvre)
const PH = {
  'p-1': 'The front: a two-story entry, a metal roof and concrete pavers set in the lawn.',
  'p-2': 'The pool courtyard at dusk, under the upstairs balcony.',
  'p-3': 'The kitchen and the living room, in one open space.',
  'p-4': 'The living room, open to the kitchen and the stairs.',
  'p-5': 'The upstairs landing: a wood floor and an iron railing.',
  'p-6': 'A double vanity with a stone top and two mirrors.',
  'v-1': 'The front: a gold-toned metal roof, palms, and a fountain on the circular drive.',
  'v-2': 'The pool, along the arched loggia.',
  'v-3': 'The entry: double doors in leaded glass, under a transom.',
  'v-4': 'The kitchen: wood cabinets, a stone island and a glass-tile backsplash.',
  'v-5': 'A freestanding tub between two walk-in showers, in stone tile.',
  'v-6': 'The villa, seen from the drive.',
  'e-1': 'Cypress trees and flower barrels in front of the house.',
  'e-2': 'The front of the house, under the pines.',
  'e-3': 'The back: covered terraces on both floors, and the fenced pool.',
  'e-4': 'The pool, along the covered patio.',
  'e-5': 'The living area, open to the kitchen and the pool.',
  'e-6': 'The kitchen: dark wood cabinets, a stone island and a stainless hood.',
  'w-1': 'The front: a tile roof, a paver driveway and a wide garage.',
  'w-2': 'The pool and its spillway, by the covered lanai.',
  'w-3': 'A white kitchen with a stone island and a stainless hood.',
  'w-4': 'A bright room with sliding doors to the pool.',
  'w-5': 'A soaking tub and a glass shower, under a wide window.',
  'c-1': 'The front: tan stucco and a tile roof, under tall pines.',
  'c-2': 'Wood cabinets, a mosaic backsplash and lights under the cabinets.',
  'c-3': 'A room with a wood floor and sliding doors to the trees.',
  'c-4': 'A bathroom with a glass shower and a wood vanity.',
  'g-1': 'The front: arched windows and a tile roof.',
  'g-2': 'The drive winds through the pines to the house.',
  'g-3': 'The back of the house, on a wide lawn.',
  'g-4': 'An open kitchen and living area, with sliding doors.',
  'g-5': 'A tub and a glass shower, with black-framed windows.',
  'g-6': 'A wood soffit and a light, against the pines.',
};
// « Then, every selection » : quatre de leurs intérieurs, là où se voient les choix (meubles, plans, carrelage, robinets)
const FINISHES = ['c-2', 'v-5', 'w-3', 'p-6'];

const sizes = JSON.parse(read('./data/photos.json'));
const capOf = (n) => PH[n] || fail(`photo sans légende : ${n}`);
const sizeOf = (n) => sizes[n] || fail(`photo inconnue : ${n}`);
const homeOf = (n) => HOMES.find((h) => h.photos.includes(n)) || fail(`photo hors des maisons : ${n}`);
// le cadrage dans la scène (16:10) : les photos proches de ce format la remplissent, les autres (portraits, carrés,
// panoramiques) y tiennent entières
const fit = (n) => {
  const [w, h] = sizeOf(n);
  return w / h > 1.3 && w / h < 1.95 ? 'cover' : 'contain';
};

/* ——— les maisons : six noms, et pour chacune sa scène (la photo, sa légende, les vignettes) ——— */
const homeHtml = (h, i) => {
  const first = h.photos[0];
  const open = i === 0;
  const thumbs = h.photos
    .map(
      (n, k) =>
        `<li><button class="thumb" type="button" data-at="${k}" aria-pressed="${k === 0}" aria-label="${esc(capOf(n))}"><img data-img="${n}" data-one="480" sizes="(min-width: 1000px) 9vw, 26vw" alt="" loading="lazy"></button></li>`,
    )
    .join('');
  return (
    `<h3 class="home__head"><button class="home__btn" type="button" id="hb-${h.id}" aria-expanded="${open}" aria-controls="hp-${h.id}">` +
    `<span class="home__name">${esc(h.name)}</span><span class="sr">, </span><span class="home__style">${esc(h.style)}</span><span class="home__sign" aria-hidden="true"></span></button></h3>` +
    `<div class="home__panel${open ? ' is-open' : ''}" id="hp-${h.id}" role="region" aria-labelledby="hb-${h.id}" data-home="${h.id}">` +
    `<figure class="home__fig"><button class="home__photo" type="button" data-open data-rv="photo" aria-labelledby="hc-${h.id} view-hint">` +
    `<img class="is-${fit(first)}" data-img="${first}" sizes="(min-width: 1000px) 58vw, 100vw" alt="" loading="lazy" data-main></button>` +
    `<figcaption class="home__cap"><span class="home__capt" id="hc-${h.id}" data-cap>${esc(capOf(first))}</span><span class="home__count" data-count>1 of ${h.photos.length}</span></figcaption></figure>` +
    `<ul class="home__thumbs" aria-label="Photos of ${esc(h.name)}">${thumbs}</ul>` +
    `<p class="home__ask"><a href="#consultation" data-liked="${h.id}">Ask about a home like this one</a></p></div>`
  );
};
const homes = `<div class="homes__grid" data-homes><svg class="homes__marker" viewBox="0 0 793 339" aria-hidden="true" focusable="false"><use href="#roof"/></svg>${HOMES.map(homeHtml).join('')}</div>`;

// une photo seule, dans sa figure, qui ouvre la visionneuse de sa maison
const figInner = (n, sizesAttr) => {
  const h = homeOf(n);
  return (
    `<button class="fig__photo" type="button" data-home="${h.id}" data-at="${h.photos.indexOf(n)}" data-rv="photo" aria-labelledby="fc-${n} view-hint"><img data-img="${n}" sizes="${sizesAttr}" alt="" loading="lazy"></button>` +
    `<figcaption class="fig__cap" id="fc-${n}"><span class="fig__home">${esc(h.name)}.</span> ${esc(capOf(n))}</figcaption>`
  );
};
const finishes =
  `<ul class="strip">` +
  FINISHES.map((n, i) => {
    const [w, h] = sizeOf(n);
    return `<li class="strip__item" style="--r:${(w / h).toFixed(3)};--d:${(i * 0.09).toFixed(2)}s"><figure class="fig">${figInner(n, '(min-width: 1000px) 32vw, 72vw')}</figure></li>`;
  }).join('') +
  `</ul>`;
const liked = HOMES.map((h) => `<option value="${h.id}">${esc(h.name)}</option>`).join('');

/* ——— les données structurées : l'entreprise, sa licence, ses deux adresses, ses deux lignes ——— */
const BIZ = `${SITE}/#business`;
const ld = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': ['HomeAndConstructionBusiness', 'GeneralContractor'],
      '@id': BIZ,
      name: 'NIAN Custom Homes',
      legalName: 'NIAN Custom Homes, Inc.',
      slogan: 'Turning your vision into reality',
      url: `${SITE}/`,
      logo: `${SITE}/assets/logo.png`,
      image: `${SITE}/assets/og.jpg`,
      description:
        'Family-owned custom home builder in Naples, Florida, in the Southwest Florida real estate market since 2006. Lot selection, floor plan customization and in-house design consultation, Lot + Home packages, and remodeling throughout Collier County. Free consultation.',
      telephone: '+1-239-280-6428',
      email: MAIL,
      address: {'@type': 'PostalAddress', streetAddress: '2055 Trade Center Way', addressLocality: 'Naples', addressRegion: 'FL', postalCode: '34109', addressCountry: 'US'},
      department: {
        '@type': 'HomeAndConstructionBusiness',
        name: 'NIAN Custom Homes, sales branch',
        address: {'@type': 'PostalAddress', streetAddress: '6020 Radio Rd.', addressLocality: 'Naples', addressRegion: 'FL', postalCode: '34104', addressCountry: 'US'},
        telephone: '+1-239-280-6428',
      },
      areaServed: [
        {'@type': 'City', name: 'Naples, Florida'},
        {'@type': 'AdministrativeArea', name: 'Collier County, Florida'},
      ],
      contactPoint: [
        {'@type': 'ContactPoint', telephone: '+1-239-280-6428', email: MAIL, contactType: 'customer service'},
        {'@type': 'ContactPoint', telephone: '+1-239-260-1523', email: 'sales@niancorp.com', contactType: 'sales', description: 'Realtor program: 4% commission on all new construction.'},
      ],
      hasCredential: {
        '@type': 'EducationalOccupationalCredential',
        credentialCategory: 'license',
        name: 'Florida Certified Building Contractor',
        identifier: LICENSE,
        url: LICENSE_URL,
        recognizedBy: {'@type': 'GovernmentOrganization', name: 'Florida Department of Business and Professional Regulation'},
      },
      knowsAbout: ['Custom home building', 'Lot selection', 'Floor plan customization', 'Interior design consultation', 'Lot and home packages', 'Home remodeling'],
      sameAs: ['https://www.facebook.com/Nianhomes'],
    },
    {'@type': 'WebSite', '@id': `${SITE}/#site`, url: `${SITE}/`, name: 'NIAN Custom Homes', publisher: {'@id': BIZ}, inLanguage: 'en-US'},
  ],
};

/* ——— la page ——— */
let src = read('./src/index.html')
  .replaceAll('<!--MARK-->', () => mark)
  .replace('<!--FAVICON-->', () => favicon)
  .replaceAll('<!--LICENSE_URL-->', () => esc(LICENSE_URL))
  .replace('<!--HOMES-->', () => homes)
  .replace('<!--FINISHES-->', () => finishes)
  .replace(/<!--FIG:([\w-]+)-->/g, (_, n) => figInner(n, n === 'g-2' ? '(min-width: 1000px) 52vw, 100vw' : '(min-width: 1000px) 36vw, 100vw'))
  .replace('<!--LIKED-->', () => liked)
  .replace('<!--JSONLD-->', () => JSON.stringify(ld).replace(/</g, '\\u003c'))
  .replace('<body>', () => `<body>\n${symbols}`);

/* ——— vérifications : ce qui est affiché correspond au contenu ——— */
const clean = (s) => s.replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
const shown = clean(src.split('</head>')[1].replace(/<script[\s\S]*?<\/script>|<svg[\s\S]*?<\/svg>|<template[\s\S]*?<\/template>/g, ' '));
if ((shown.match(new RegExp(LICENSE, 'g')) || []).length < 3) fail('la licence doit figurer dans la phrase d’accueil, l’entreprise et le pied de page');
if ((src.match(new RegExp(esc(LICENSE_URL).replace(/[.?]/g, '\\$&'), 'g')) || []).length < 3) fail('le lien vers la fiche du registre doit accompagner chaque mention de la licence');
if ((shown.match(/239-280-6428/g) || []).length < 5) fail('le téléphone doit figurer dans l’en-tête, le menu, l’accueil, la demande et le pied de page');
if ((shown.match(/239-260-1523/g) || []).length < 2) fail('la ligne des agents doit figurer dans leur section et le pied de page');
// les seules adresses de rue : le bureau et la succursale ; pas de numéro de maison, pas de nom du modèle Wix
const streets = shown.match(/\b\d{2,5}\s+[A-Z][a-z]+(\s+[A-Z][a-z]+)*\s+(Lane|Ln|Avenue|Ave|Road|Rd|Street|St|Drive|Dr|Blvd|Way|Court|Ct|Circle|Cir|Terrace|Ter|Place|Pl)\b/g) || [];
for (const s of streets) if (!['2055 Trade Center Way', '6020 Radio Rd'].includes(s)) fail(`une adresse de rue s’affiche : ${s}`);
for (const w of ['Tina', 'Heart', 'van den Reich', 'Susan Taylor', 'CHATSWORTH', 'mysite', 'andresb', 'Roofing', 'Google+']) if (shown.includes(w) || src.includes(w)) fail(`un texte à ne pas reprendre s’affiche : ${w}`);
for (const y of shown.replace(/2055 Trade Center Way/g, '').match(/\b(19|20)\d\d\b/g) || []) if (!['2006', '2026', '2028'].includes(y)) fail(`une année s’affiche : ${y}`);
for (const n of Object.keys(PH)) homeOf(n);
for (const h of HOMES) for (const n of h.photos) capOf(n);
for (const m of src.matchAll(/<img\b[^>]*>/g)) if (!/\salt="[^"]*"/.test(m[0])) fail(`photo sans attribut alt : ${m[0].slice(0, 80)}`);
for (const [, ids] of src.matchAll(/aria-(?:labelledby|describedby|controls)="([^"]+)"/g)) for (const id of ids.split(/\s+/)) if (!src.includes(`id="${id}"`)) fail(`identifiant manquant : ${id}`);
if ((src.match(/<h1[\s>]/g) || []).length !== 1) fail('il faut un seul h1');
if (/<!--(MARK|FAVICON|LICENSE_URL|HOMES|FINISHES|FIG|LIKED|JSONLD)/.test(src)) fail('un repère du gabarit n’a pas été remplacé');

/* ——— les photos : chaque <img data-img> et <source data-img>, intégrées (fichier unique) ou en fichiers (en ligne) ——— */
const variants = (name) =>
  Object.keys(sizes)
    .filter((k) => k === name || (k.startsWith(`${name}-`) && /^\d+$/.test(k.slice(name.length + 1))))
    .map((k) => ({file: k, w: sizeOf(k)[0], h: sizeOf(k)[1]}))
    .sort((a, b) => a.w - b.w);
// la version du fichier unique : la plus grande qui ne dépasse pas la largeur voulue (1 400 par défaut)
const pickOne = (name, want = 1400) => {
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
const webSet = (name) => {
  const v = variants(name);
  if (!v.length) fail(`photo inconnue : ${name}`);
  for (const x of v) used.add(x.file);
  return {srcset: v.map((x) => `assets/img/${x.file}.avif ${x.w}w`).join(', '), mid: v.find((x) => x.w >= 720) || v[v.length - 1], big: v[v.length - 1]};
};
const photos = (html, mode) =>
  html
    .replace(/<source\b([^>]*)\sdata-img="([\w-]+)"([^>]*)>/g, (m, a, name, b) => {
      let attrs = `${a}${b}`;
      const want = +((attrs.match(/data-one="(\d+)"/) || [])[1] || 1400);
      attrs = attrs.replace(/\sdata-one="[^"]*"/g, '');
      if (mode === 'one') return `<source data-k="${embed(pickOne(name, want).file)}"${attrs.replace(/\ssizes="[^"]*"/g, '')}>`;
      return `<source srcset="${webSet(name).srcset}"${attrs}>`;
    })
    .replace(/<img\b([^>]*)\sdata-img="([\w-]+)"([^>]*)>/g, (m, a, name, b) => {
      let attrs = `${a}${b}`;
      const want = +((attrs.match(/data-one="(\d+)"/) || [])[1] || 1400);
      attrs = attrs.replace(/\sdata-one="[^"]*"/g, '');
      if (mode === 'one') {
        const pick = pickOne(name, want);
        return `<img data-k="${embed(pick.file)}" width="${pick.w}" height="${pick.h}"${attrs.replace(/\ssizes="[^"]*"/g, '')}>`;
      }
      const {srcset, mid, big} = webSet(name);
      return `<img src="assets/img/${mid.file}.avif" srcset="${srcset}" width="${big.w}" height="${big.h}"${attrs}>`;
    });

// ce que lit le script : les maisons, et pour chaque photo sa légende, sa taille, son cadrage et ses fichiers
const data = (mode) => {
  const ph = {};
  for (const h of HOMES)
    for (const n of h.photos) {
      const [w, hh] = sizeOf(n);
      const item = {cap: capOf(n), fit: fit(n), r: +(w / hh).toFixed(4)};
      if (mode === 'one') {
        const pick = pickOne(n);
        Object.assign(item, {k: embed(pick.file), w: pick.w, h: pick.h});
      } else {
        const {srcset, mid, big} = webSet(n);
        Object.assign(item, {src: `assets/img/${mid.file}.avif`, srcset, w: big.w, h: big.h});
      }
      ph[n] = item;
    }
  const out = {homes: HOMES.map(({id, name, photos: p}) => ({id, name, photos: p})), photos: ph};
  return `<script type="application/json" id="site-data">${JSON.stringify(out).replace(/</g, '\\u003c')}</script>`;
};

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
const oneData = data('one');
const imgMap = `<script>window.__IMG=${JSON.stringify(Object.fromEntries(embedded))}</script>`;
const page = one
  .replace('<!--STYLES-->', () => `<style>\n${fontCss((f) => `data:font/woff2;base64,${b64(`./vendor/fonts/${f}`)}`)}\n${css}\n</style>`)
  .replace('<!--DATA-->', () => `${oneData}\n${imgMap}`)
  .replace('<!--SCRIPTS-->', () => `<script>\n${js}\n</script>`);
if (/data-img=/.test(page)) fail('fichier unique : une photo n’a pas été intégrée');
for (const [, k] of page.matchAll(/data-k="([\w-]+)"/g)) if (!embedded.has(k)) fail(`fichier unique : photo ${k} absente`);
mkdirSync(here('./dist/'), {recursive: true});
writeFileSync(here('./dist/index.html'), page);
console.log(`dist/index.html : ${(Buffer.byteLength(page) / 1024).toFixed(0)} Ko, ${embedded.size} photos intégrées`);

/* ——— la version en ligne ——— */
const web = (p) => here(`./dist-web/${p}`);
rmSync(web(''), {recursive: true, force: true});
for (const d of ['assets/img', 'assets/fonts']) mkdirSync(web(d), {recursive: true});
for (const f of FONTS) copyFileSync(here(`./vendor/fonts/${f.file}`), web(`assets/fonts/${f.file}`));
const pageWeb = photos(src, 'web')
  .replace('<!--STYLES-->', () =>
    [
      `<link rel="apple-touch-icon" href="assets/apple-touch-icon.png">`,
      `<link rel="preload" as="font" type="font/woff2" href="assets/fonts/Petrona.woff2" crossorigin>`,
      `<link rel="preload" as="font" type="font/woff2" href="assets/fonts/Gantari.woff2" crossorigin>`,
      `<style>\n${fontCss((f) => `assets/fonts/${f}`)}\n${css}\n</style>`,
    ].join('\n'),
  )
  .replace('<!--DATA-->', () => data('web'))
  .replace('<!--SCRIPTS-->', () => `<script>\n${js}\n</script>`);
if (/data-img=|data-k=/.test(pageWeb)) fail('version en ligne : un chemin de photo n’a pas été réécrit');
for (const n of used) copyFileSync(here(`./src/img/${n}.avif`), web(`assets/img/${n}.avif`));
writeFileSync(web('index.html'), pageWeb);
// robots.txt, sitemap.xml, llms.txt, en-têtes, redirections des anciennes adresses, image de partage et logo
for (const f of ['_headers', '_redirects', 'vercel.json', 'robots.txt', 'sitemap.xml', 'llms.txt']) if (existsSync(here(`./web/${f}`))) copyFileSync(here(`./web/${f}`), web(f));
for (const f of ['og.jpg', 'logo.png', 'apple-touch-icon.png']) if (existsSync(here(`./web/${f}`))) copyFileSync(here(`./web/${f}`), web(`assets/${f}`));
console.log(`dist-web/index.html : ${(Buffer.byteLength(pageWeb) / 1024).toFixed(0)} Ko, ${used.size} fichiers de photos`);
