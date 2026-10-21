// Deux sorties :
//  - dist/index.html : le site en un seul fichier (polices, styles, photos, logo, librairie et script intégrés),
//    à ouvrir d'un double-clic ; les photos y sont en 800 px de large (1200 pour l'accueil), pour rester léger ;
//  - dist-web/ : la version à mettre en ligne, la page légère, et les photos (en plusieurs largeurs) et les polices
//    en fichiers.
//   node build.mjs
import {readFileSync, writeFileSync, mkdirSync, copyFileSync, rmSync, existsSync} from 'node:fs';

const here = (p) => new URL(p, import.meta.url);
const read = (p) => readFileSync(here(p), 'utf8');
const b64 = (p) => readFileSync(here(p)).toString('base64');
const fail = (m) => {
  throw new Error(m);
};
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const SITE = 'https://www.stellarlivinghomes.com';

/* ——— les polices : Imbue (Tyler Finck) et Zalando Sans, licence OFL ———
   Les polices de secours reprennent la chasse et la hauteur des vraies (Georgia et Arial ajustées, mesurées sur les
   textes du site, tools/fallback.py) : rien ne bouge quand elles arrivent. */
const FONTS = [
  {family: 'Imbue', file: 'Imbue.woff2', weight: '150 500'},
  {family: 'Zalando Sans', file: 'ZalandoSans.woff2', weight: '400 650'},
];
const FB = JSON.parse(read('./data/fallback.json'));
const fallback = (name, locals, m) =>
  `@font-face{font-family:"${name}";src:${locals.map((l) => `local("${l}")`).join(',')};size-adjust:${m.size};ascent-override:${m.ascent};descent-override:${m.descent};line-gap-override:0%}`;
const fontCss = (url) =>
  FONTS.map((f) => `@font-face{font-family:"${f.family}";src:url(${url(f.file)}) format("woff2");font-weight:${f.weight};font-style:normal;font-display:swap}`).join('') +
  fallback('Imbue Fallback', ['Georgia', 'DejaVu Serif', 'Liberation Serif', 'Times New Roman'], FB.serif) +
  fallback('Zalando Fallback', ['Arial', 'Liberation Sans', 'Helvetica'], FB.sans);

/* ——— le logo, vectorisé d'après leur fichier (tools/logo.py) : défini une fois, repris par <use> ———
   Ses deux couleurs passent par --logo-navy et --logo-olive (l'en-tête : bleu et olive ; le pied de page : blanc et
   olive). */
const logo = JSON.parse(read('./data/logo.json'));
const vb = (k) => `0 0 ${logo[k].w} ${logo[k].h}`;
const paint = (d, c) => `<path d="${d}" style="fill:var(--logo-${c})" fill-rule="evenodd"/>`;
const symbols =
  `<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">` +
  `<symbol id="l-mark" viewBox="${vb('mark')}">${paint(logo.mark.navy, 'navy')}${paint(logo.mark.olive, 'olive')}</symbol>` +
  `<symbol id="l-word" viewBox="${vb('word')}">${paint(logo.word.d, 'navy')}</symbol>` +
  `<symbol id="l-llc" viewBox="${vb('llc')}">${paint(logo.llc.d, 'olive')}</symbol>` +
  `</svg>`;
const use = (k) => `<svg class="${k}" viewBox="${vb(k)}" aria-hidden="true" focusable="false"><use href="#l-${k}"/></svg>`;
const logoTop = use('mark') + use('word');
const logoFoot = `<p class="sr">Stellar Living Homes LLC</p>${use('mark')}${use('word')}`;
const favicon = `data:image/png;base64,${b64('./web/favicon.png')}`;

/* ——— les reportages : les photos de chaque chantier, dans l'ordre de prise de vue (tools/images.py) ——— */
const sizes = JSON.parse(read('./data/photos.json'));
const sets = JSON.parse(read('./data/sets.json'));
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const when = (shot) => {
  // « 2025:11:03 10:38:38 » → { day: 'November 3, 2025', month: 'November 2025', time: '10:38 am' }
  if (!shot) return null;
  const [d, t] = shot.split(' ');
  const [y, m, dd] = d.split(':').map(Number);
  const [h, mi] = t.split(':').map(Number);
  const time = `${h % 12 || 12}:${String(mi).padStart(2, '0')} ${h < 12 ? 'am' : 'pm'}`;
  return {day: `${MONTHS[m - 1]} ${dd}, ${y}`, month: `${MONTHS[m - 1]} ${y}`, time};
};
/* Le texte de chaque reportage : son titre dans la visionneuse, et ce qu'on en dit sur la page. */
const PROJECTS = {
  bw25: {title: 'Breakwater, Pelican Bay', what: 'A whole condo: kitchen, baths, lanai'},
  bw24: {title: 'Breakwater, Pelican Bay', what: 'Kitchen, dining area and bath'},
  bw22: {title: 'Breakwater, Pelican Bay', what: 'Kitchen, bar and two baths'},
  bw7: {title: 'Breakwater, Pelican Bay', what: 'Kitchen, bar, two baths and a laundry room'},
  bw15: {title: 'Breakwater, Pelican Bay', what: 'Powder room'},
  bwc: {title: 'Breakwater clubhouse, Pelican Bay', what: 'Lounge, kitchen and dining room'},
  tr: {title: 'Trieste, Bay Colony', what: 'A primary bath with a view over Naples'},
  hl: {title: 'Hidden Lakes, Park Shore', what: 'A whole condo: a kitchen with a long island and a glass mosaic backsplash, two baths, closets'},
  gt: {title: 'Gulf Tower, Gulf Shores', what: 'A kitchen opened up around two columns under a white plank ceiling, and two baths'},
  im: {title: 'Imperial Golf Club, North Naples', what: 'A bath with a walk-in shower and a frosted glass panel'},
  pi: {title: 'Pistoia, Talis Park', what: 'A whole home: kitchen, great room, bar and a primary bath with a freestanding tub'},
  se: {title: 'Screen enclosures', what: 'Pool cages on the lake and screened lanais, rescreened or new'},
};
const setInfo = (id) => {
  const s = sets[id] || fail(`reportage inconnu : ${id}`);
  const first = when(s[0].shot);
  const days = new Set(s.map((p) => p.shot && p.shot.slice(0, 10)));
  const dated = s.filter((p) => p.shot);
  const last = dated.length ? when(dated[dated.length - 1].shot) : null;
  const span = !first ? '' : first.month === last.month ? first.month : first.month.split(' ')[1] === last.month.split(' ')[1] ? `${first.month.split(' ')[0]} to ${last.month}` : `${first.month} to ${last.month}`;
  return {photos: s, count: s.length, first, span, oneDay: days.size === 1};
};
const templates = Object.keys(sets)
  .map((id) => {
    const info = setInfo(id);
    const p = PROJECTS[id] || fail(`reportage sans texte : ${id}`);
    const title = `${p.title}${info.first ? `, ${info.oneDay ? info.first.day : info.span}` : ''}`;
    const items = info.photos
      .map((ph) => {
        const w = when(ph.shot);
        return `<li><figure><img data-img="${ph.name}" data-cap sizes="(min-width: 700px) 70vh, 100vw" loading="lazy" alt="${esc(`${ph.caption}, ${p.title}`)}"><figcaption><b>${esc(ph.caption)}</b>${w ? `, ${info.oneDay ? w.time : w.day}` : ''}</figcaption></figure></li>`;
      })
      .join('');
    return `<template id="set-${id}" data-title="${esc(title)}">${items}</template>`;
  })
  .join('\n');

/* ——— la section des chantiers : les six projets de Breakwater, puis les autres ——— */
const count = (n) => `${n} photo${n === 1 ? '' : 's'}`;
const card = (c) => {
  const info = setInfo(c.set);
  return `<li class="card"><button class="card__ph reveal" type="button" data-set="${c.set}"><img data-img="${c.cover}" sizes="(min-width: 1100px) 30vw, (min-width: 700px) 46vw, 74vw" loading="lazy" alt="${esc(c.alt)}"></button><h3 class="card__name">${esc(c.name)}</h3><p class="card__meta">${esc(PROJECTS[c.set].what)}. ${info.span ? `${info.span}, ` : ''}${count(info.count)}.</p></li>`;
};
const BW = [
  {set: 'bw25', cover: 'bw25-13', name: 'A condo, top to bottom', alt: 'A wood-paneled peninsula with a white stone top under two glass pendants, in a finished condo at Breakwater.'},
  {set: 'bw24', cover: 'bw24-05', name: 'A kitchen with blue stools', alt: 'A kitchen island with a wine refrigerator and blue leather stools, white cabinets behind, at Breakwater.'},
  {set: 'bw22', cover: 'bw22-08', name: 'A kitchen in white and gray', alt: 'A white kitchen with a marble-look island, gray plank floors and a heron print on the wall, at Breakwater.'},
  {set: 'bw15', cover: 'bw15-01', name: 'A powder room in blue palms', alt: 'A powder room papered in blue palm trees, with a navy vanity, a white scalloped mirror and brass fixtures, at Breakwater.'},
  {set: 'bw7', cover: 'bw7-09', name: 'A kitchen in dark wood', alt: 'A kitchen in dark wood cabinets with a white stone counter, four stools and a pendant light, at Breakwater.'},
  {set: 'bwc', cover: 'bwc-06', name: 'The clubhouse', alt: 'The Breakwater clubhouse lounge: gray sofas and armchairs, French doors open to the pool.'},
];
/* les autres chantiers, chacun avec sa photo ; « wide » pour les photos en largeur */
const ELSE = [
  {set: 'tr', cover: 'tr-01', name: 'Trieste', where: 'Bay Colony', alt: 'A primary bath with a frameless glass shower, a modern chandelier and a tall window over the treetops of Naples.'},
  {set: 'hl', cover: 'hl-02', name: 'Hidden Lakes', where: 'Park Shore', wide: true, alt: 'A white kitchen with a long waterfall island, a glass mosaic backsplash and a stainless hood.'},
  {set: 'im', cover: 'im-02', name: 'Imperial Golf Club', where: 'North Naples', alt: 'A walk-in shower in white tile with a marble mosaic floor, beside a frosted glass panel and a window with white shutters.'},
  {set: 'gt', cover: 'gt-03', name: 'Gulf Tower', where: 'Gulf Shores', alt: 'A white kitchen with an island set between two square columns, under a white plank ceiling.'},
  {set: 'pi', cover: 'pi-01', name: 'Pistoia', where: 'Talis Park', alt: 'A kitchen under a wide arch: a waterfall island in white stone, gray stools, a stainless hood and bright paintings beyond.'},
  {set: 'se', cover: 'se-02', name: 'Screen enclosures', where: 'Pool cages and screened lanais', wide: true, alt: 'A pool cage over a curved pool on the edge of a lake, palm trees and a blue sky beyond the screens.'},
];
const place = (c) => {
  const info = setInfo(c.set);
  const date = info.span ? ` ${info.span}.` : '';
  return `<li class="place"><div class="place__ph${c.wide ? ' place__ph--wide' : ''}"><button class="card__ph reveal" type="button" data-set="${c.set}"><img data-img="${c.cover}" sizes="(min-width: 1100px) ${c.wide ? 50 : 34}vw, (min-width: 700px) ${c.wide ? 66 : 50}vw, 100vw" loading="lazy" alt="${esc(c.alt)}"></button></div><div class="place__text"><h4 class="place__name">${esc(c.name)}</h4><p class="place__where">${esc(c.where)}</p><p class="place__what">${esc(PROJECTS[c.set].what)}.${date}</p><p class="place__open"><button class="link" type="button" data-set="${c.set}">${info.count === 1 ? 'See the photo' : `See the ${info.count} photos`}</button></p></div></li>`;
};
const workHtml = `<ul class="bw">${BW.map(card).join('')}</ul><div class="else"><h3 class="else__h">Across Naples</h3><ul class="else__list">${ELSE.map(place).join('')}</ul></div>`;

/* ——— la page ——— */
let src = read('./src/index.html')
  .replace('<!--LOGO:top-->', () => logoTop)
  .replace('<!--LOGO:foot-->', () => logoFoot)
  .replace('<!--FAVICON-->', () => favicon)
  .replace('<!--WORK-->', () => workHtml)
  .replace('<!--SETS-->', () => templates)
  .replace('<body>', () => `<body>\n${symbols}`);

/* ——— les données structurées, tirées de la page : les avis y sont mot pour mot ——— */
const clean = (s) => s.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
const reviews = [...src.matchAll(/<li class="rev">\s*<blockquote><p>([\s\S]*?)<\/p><\/blockquote>\s*<p class="rev__by">([^<]+)<\/p>/g)].map((m) => ({body: clean(m[1]), by: m[2].trim()}));
if (reviews.length !== 12) fail(`avis : ${reviews.length} trouvés, 12 attendus`);
const BIZ = `${SITE}/#business`;
const ld = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'GeneralContractor',
      '@id': BIZ,
      name: 'Stellar Living Homes LLC',
      alternateName: 'Stellar Living Homes',
      url: `${SITE}/`,
      logo: `${SITE}/assets/logo.png`,
      image: `${SITE}/assets/og.jpg`,
      description: 'General contractor in Naples, Florida: condo and home remodeling, custom homes, storm repairs, screen enclosures and commercial construction.',
      telephone: '+1-908-507-2088',
      email: 'dpalmeri100@gmail.com',
      foundingDate: '2014',
      address: {'@type': 'PostalAddress', streetAddress: '2338 Immokalee Rd', addressLocality: 'Naples', addressRegion: 'FL', postalCode: '34110', addressCountry: 'US'},
      areaServed: {'@type': 'City', name: 'Naples, Florida'},
      hasCredential: {
        '@type': 'EducationalOccupationalCredential',
        credentialCategory: 'license',
        name: 'Florida Certified General Contractor',
        identifier: 'CGC1531679',
        url: 'https://www.myfloridalicense.com/LicenseDetail.asp?SID=&id=479174AC769225C92A4331B17635ED61',
        recognizedBy: {'@type': 'GovernmentOrganization', name: 'Florida Department of Business and Professional Regulation'},
      },
      knowsAbout: ['Condo renovation', 'Kitchen remodeling', 'Bathroom remodeling', 'Custom homes', 'Hurricane damage repair', 'Screen enclosures', 'Commercial construction'],
      sameAs: ['https://www.instagram.com/stellar_living_homes/'],
      review: reviews.map((r) => ({'@type': 'Review', author: {'@type': 'Person', name: r.by}, reviewBody: r.body})),
    },
    {'@type': 'WebSite', '@id': `${SITE}/#site`, url: `${SITE}/`, name: 'Stellar Living Homes', publisher: {'@id': BIZ}, inLanguage: 'en-US'},
  ],
};
src = src.replace('<!--JSONLD-->', () => JSON.stringify(ld).replace(/</g, '\\u003c'));

/* ——— vérifications : ce qui est affiché correspond au contenu ——— */
const shown = clean(src.split('</head>')[1].replace(/<script[\s\S]*?<\/script>|<svg[\s\S]*?<\/svg>|<template[\s\S]*?<\/template>/g, ' '));
for (const r of reviews) if (!shown.includes(r.body)) fail(`avis de ${r.by} : le texte des données n’est pas celui de la page`);
// l'avis de l'accueil est un extrait fidèle de celui de Scott D.
const heroQuote = clean(src.match(/<blockquote class="skim">([\s\S]*?)<\/blockquote>/)[1]).replace(/[“”]/g, '');
const scott = reviews.find((r) => r.by === 'Scott D.').body;
for (const part of heroQuote.split(' … ')) if (!scott.includes(part)) fail(`accueil : « ${part.slice(0, 40)}… » n’est pas dans l’avis de Scott D.`);
// chaque sujet des avis a au moins deux avis, et chaque passage marqué a un sujet connu
const topics = [...src.matchAll(/data-topic="(\w+)"/g)].map((m) => m[1]).filter((t) => t !== 'all');
for (const t of topics) {
  const n = reviews.length && [...src.matchAll(/<li class="rev">([\s\S]*?)<\/li>/g)].filter((m) => new RegExp(`data-t="[^"]*\\b${t}\\b`).test(m[1])).length;
  if (n < 2) fail(`sujet « ${t} » : ${n} avis seulement`);
}
for (const [, t] of src.matchAll(/<mark data-t="([^"]+)"/g)) for (const x of t.split(' ')) if (!topics.includes(x)) fail(`passage marqué d’un sujet inconnu : ${x}`);
for (const [, t] of src.matchAll(/data-goto-topic="(\w+)"/g)) if (!topics.includes(t)) fail(`prestation : sujet inconnu ${t}`);
for (const [, s] of src.matchAll(/data-set="([\w-]+)"/g)) if (!sets[s]) fail(`bouton : reportage inconnu ${s}`);
if ((src.match(/CGC1531679/g) || []).length < 4) fail('la licence doit figurer dans l’entreprise, le pied de page et les données');
if (!shown.includes('2338 Immokalee Rd')) fail('le bureau manque');
if ((shown.match(/908-507-2088/g) || []).length < 3) fail('le téléphone doit figurer dans l’en-tête, l’accueil et le contact');
for (const m of src.matchAll(/<img\b[^>]*>/g)) if (!/\salt="[^"]+"/.test(m[0])) fail(`photo sans texte de remplacement : ${m[0].slice(0, 80)}`);
// la visite : les heures des étapes sont celles des fichiers
for (const m of src.matchAll(/<li class="stop" data-time="([\d:]+)"[^>]*>[\s\S]*?data-at="(\d+)"/g)) {
  const ph = sets.bw25[+m[2] - 1] || fail(`visite : photo ${m[2]} absente`);
  const t = ph.shot.slice(11, 16);
  if (t !== m[1]) fail(`visite : l’étape ${m[2]} dit ${m[1]}, le fichier ${t}`);
}
if (/<!--(LOGO|FAVICON|WORK|SETS|JSONLD)/.test(src)) fail('un repère du gabarit n’a pas été remplacé');

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
    // data-cap : la photo ne s'affiche jamais plus grande que son fichier (la visionneuse, les petites photos des cages)
    const capped = /\sdata-cap/.test(attrs);
    attrs = attrs.replace(/\sdata-cap(="[^"]*")?/g, '');
    if (mode === 'one') {
      // fichier unique : une seule version, 800 px de large (1000 pour les photos en largeur, ou ce que demande
      // data-one), jamais agrandie ; la taille annoncée est celle du fichier intégré
      const landscape = big.w > big.h;
      const want = +((attrs.match(/data-one="(\d+)"/) || [])[1] || (landscape ? 1000 : 800));
      const pick = [...v].reverse().find((x) => x.w <= want) || v[0];
      if (!embedded.has(pick.file)) embedded.set(pick.file, `data:image/avif;base64,${b64(`./src/img/${pick.file}.avif`)}`);
      const cap = capped ? ` style="max-width:${pick.w}px"` : '';
      return `<img src="${embedded.get(pick.file)}" width="${pick.w}" height="${pick.h}"${cap}${attrs.replace(/\s(sizes|data-one)="[^"]*"/g, '')}>`;
    }
    for (const x of v) used.add(x.file);
    const srcset = v.map((x) => `assets/img/${x.file}.avif ${x.w}w`).join(', ');
    const mid = v.find((x) => x.w >= 800) || big;
    const cap = capped ? ` style="max-width:${big.w}px"` : '';
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
const pageWeb = photos(src, 'web')
  .replace('<!--STYLES-->', () =>
    [
      `<link rel="apple-touch-icon" href="assets/apple-touch-icon.png">`,
      `<link rel="preload" as="font" type="font/woff2" href="assets/fonts/Imbue.woff2" crossorigin>`,
      `<link rel="preload" as="font" type="font/woff2" href="assets/fonts/ZalandoSans.woff2" crossorigin>`,
      `<style>\n${fontCss((f) => `assets/fonts/${f}`)}\n${css}\n</style>`,
    ].join('\n'),
  )
  .replace('<!--SCRIPTS-->', () => `<script>\n${js}\n</script>`);
if (/data-img=/.test(pageWeb)) fail('version en ligne : un chemin de photo n’a pas été réécrit');
for (const n of used) copyFileSync(here(`./src/img/${n}.avif`), web(`assets/img/${n}.avif`));
writeFileSync(web('index.html'), pageWeb);
// robots.txt, sitemap.xml, llms.txt, en-têtes, redirections des anciennes pages, image de partage et logo
for (const f of ['_headers', '_redirects', 'vercel.json', 'robots.txt', 'sitemap.xml', 'llms.txt']) if (existsSync(here(`./web/${f}`))) copyFileSync(here(`./web/${f}`), web(f));
for (const f of ['og.jpg', 'logo.png', 'apple-touch-icon.png']) if (existsSync(here(`./web/${f}`))) copyFileSync(here(`./web/${f}`), web(`assets/${f}`));
console.log(`dist-web/index.html : ${(Buffer.byteLength(pageWeb) / 1024).toFixed(0)} Ko, ${used.size} fichiers de photos`);
