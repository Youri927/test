// Deux sorties :
//  - dist/index.html : le site en un seul fichier (polices, styles, photos, logo, librairie et script intégrés),
//    à ouvrir d'un double-clic ;
//  - dist-web/ : la version à mettre en ligne, la page légère, et les photos et les polices en fichiers.
//   node build.mjs
import {readFileSync, writeFileSync, mkdirSync, copyFileSync, rmSync, existsSync} from 'node:fs';

const here = (p) => new URL(p, import.meta.url);
const read = (p) => readFileSync(here(p), 'utf8');
const b64 = (p) => readFileSync(here(p)).toString('base64');
const fail = (m) => {
  throw new Error(m);
};

/* ——— les polices : Montagu Slab (Florian Karsten) et Reddit Sans (Pentagram), licence OFL ———
   Les polices de secours reprennent la chasse et la hauteur des vraies (Georgia et Arial ajustées, mesurées sur les
   textes du site, tools/fallback.py) : rien ne bouge quand elles arrivent. */
const FONTS = [
  {family: 'Montagu Slab', file: 'MontaguSlab.woff2', weight: '200 500'},
  {family: 'Reddit Sans', file: 'RedditSans.woff2', weight: '400 700'},
];
const FB = JSON.parse(read('./data/fallback.json'));
const fallback = (name, locals, m) =>
  `@font-face{font-family:"${name}";src:${locals.map((l) => `local("${l}")`).join(',')};size-adjust:${m.size};ascent-override:${m.ascent};descent-override:${m.descent};line-gap-override:0%}`;
const fontCss = (url) =>
  FONTS.map((f) => `@font-face{font-family:"${f.family}";src:url(${url(f.file)}) format("woff2");font-weight:${f.weight};font-style:normal;font-display:swap}`).join('') +
  fallback('Montagu Fallback', ['Georgia', 'DejaVu Serif', 'Liberation Serif', 'Times New Roman'], FB.serif) +
  fallback('Reddit Fallback', ['Arial', 'Liberation Sans', 'Helvetica'], FB.sans);

/* ——— le logo de Zynda, vectorisé d'après leurs fichiers (tools/logo.py) : défini une fois, repris par <use> ;
   il prend la couleur du texte ——— */
const logo = JSON.parse(read('./data/logo.json'));
const vb = (k) => `0 0 ${logo[k].w} ${logo[k].h}`;
const symbols =
  `<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">` +
  ['emblem', 'word', 'line'].map((k) => `<symbol id="z-${k}" viewBox="${vb(k)}"><path d="${logo[k].d}" fill="currentColor" fill-rule="evenodd"/></symbol>`).join('') +
  `</svg>`;
const use = (k) => `<svg class="${k}" viewBox="${vb(k)}" aria-hidden="true" focusable="false"><use href="#z-${k}"/></svg>`;
const logoTop = use('emblem') + use('word');
const logoFoot = use('emblem') + `<span class="lockup">${use('word')}${use('line')}</span>`;
// l'onglet : l'emblème blanc sur noir
const E = logo.emblem;
const favicon = encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${-E.w * 0.12} ${-E.h * 0.12} ${E.w * 1.24} ${E.h * 1.24}">` +
    `<rect x="${-E.w * 0.12}" y="${-E.h * 0.12}" width="${E.w * 1.24}" height="${E.h * 1.24}" rx="${E.w * 0.2}" fill="#000"/>` +
    `<path d="${E.d}" fill="#fff" fill-rule="evenodd"/></svg>`,
);

/* ——— le cadran de l'année : 365 jours, le 1er janvier en haut ———
   La saison des condos, du 1er mai au 1er octobre, en arc couleur d'eau ; le reste de l'année en pointillé. Le
   repère, la traînée, l'arc qui se remplit, la date et l'étiquette du centre sont animés par main.js ; les traits des
   jours sont un cercle en tirets (un tiret par jour), ceux des mois de vrais traits. */
const CX = 320;
const CY = 320;
const R = 250; // le cercle
const RT = 222; // la piste de la saison
const RL = 184; // les mois
const START = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const ang = (d) => ((d % 365) / 365) * Math.PI * 2 - Math.PI / 2;
const pt = (d, r) => [CX + r * Math.cos(ang(d)), CY + r * Math.sin(ang(d))];
const f1 = (n) => n.toFixed(1);
const arc = (d0, d1, r) => {
  const [x0, y0] = pt(d0, r);
  const [x1, y1] = pt(d1, r);
  return `M${f1(x0)} ${f1(y0)}A${r} ${r} 0 ${d1 - d0 > 182.5 ? 1 : 0} 1 ${f1(x1)} ${f1(y1)}`;
};
const C = 2 * Math.PI * (R - 4);
const dialSvg = [
  `<svg viewBox="-40 20 720 600" aria-hidden="true" focusable="false" data-cx="${CX}" data-cy="${CY}" data-r="${R}" data-rt="${RT}">`,
  `<circle class="ring" cx="${CX}" cy="${CY}" r="${R}"/>`,
  // un tiret par jour, le premier sur le 1er janvier
  `<circle class="tick" cx="${CX}" cy="${CY}" r="${R - 4}" fill="none" stroke-width="8" stroke-dasharray="0.9 ${(C / 365 - 0.9).toFixed(3)}" transform="rotate(-90 ${CX} ${CY})"/>`,
  ...START.map((d) => {
    const [x0, y0] = pt(d, R);
    const [x1, y1] = pt(d, R - 18);
    return `<line class="tick tick--month" x1="${f1(x0)}" y1="${f1(y0)}" x2="${f1(x1)}" y2="${f1(y1)}"/>`;
  }),
  `<path class="winter" d="${arc(273, 365 + 120, RT)}"/>`,
  `<path class="summer" d="${arc(120, 273, RT)}"/>`,
  `<path class="trail" data-trail d=""/>`,
  `<path class="fill" data-fill d=""/>`,
  ...MON.map((m, i) => {
    const mid = START[i] + ((START[i + 1] ?? 365) - START[i]) / 2;
    const [x, y] = pt(mid, RL);
    return `<text class="month" x="${f1(x)}" y="${f1(y + 5.5)}" text-anchor="middle">${m}</text>`;
  }),
  (() => {
    const [x, y] = pt(273, RT);
    return `<circle class="oct" cx="${f1(x)}" cy="${f1(y)}" r="6"/><text class="oct-label" x="${f1(CX - R - 18)}" y="${f1(CY + 5)}" text-anchor="end">Oct 1</text>`;
  })(),
  `<g class="today" data-today-mark visibility="hidden"><path d=""/><text>Today</text></g>`,
  (() => {
    const [x, y] = pt(304, RT);
    return `<circle class="marker" data-marker r="9" cx="${f1(x)}" cy="${f1(y)}" style="display:none"/>`;
  })(),
  `<text class="date" data-date x="${CX}" y="${CY + 12}" text-anchor="middle">May–Oct 1</text>`,
  `<text class="label" data-label x="${CX}" y="${CY + 50}" text-anchor="middle">The condo season</text>`,
  `</svg>`,
].join('');

/* ——— la page ——— */
let src = read('./src/index.html')
  .replace('<!--LOGO:top-->', () => logoTop)
  .replace('<!--LOGO:foot-->', () => logoFoot)
  .replace('<!--FAVICON-->', () => favicon)
  .replace('<!--DIAL-->', () => dialSvg)
  .replace('<body>', () => `<body>\n${symbols}`);

/* ——— vérifications : ce qui est affiché correspond au contenu ——— */
const clean = (s) => s.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
const ld = JSON.parse(src.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
const biz = ld['@graph'].find((n) => n['@type'] === 'GeneralContractor');
const shown = clean(src.split('</head>')[1].replace(/<script[\s\S]*?<\/script>|<svg[\s\S]*?<\/svg>/g, ' '));
// chaque avis des données structurées est une citation affichée, mot pour mot ; les clients nommés le sont pareil
for (const r of biz.review) {
  if (!shown.includes(r.reviewBody)) fail(`données structurées : l’avis « ${r.reviewBody.slice(0, 40)}… » n’est pas sur la page`);
  if (!/client$/.test(r.author.name) && !shown.includes(r.author.name)) fail(`données structurées : ${r.author.name} n’est pas sur la page`);
}
if (biz.review.length !== (src.match(/<figure class="quote/g) || []).length - 1) fail('avis : pas autant de citations de clients que dans les données (la citation des propriétaires mise à part)');
if ((src.match(/CGC056812/g) || []).length < 4) fail('la licence doit figurer dans la section des engagements, le contact, le pied de page et les données');
if (!shown.includes(biz.address.streetAddress)) fail('le bureau des données n’est pas celui de la page');
if (!shown.includes('(239) 213-1314')) fail('le téléphone manque');
// (les photos des prestations ont un texte de remplacement vide, voulu : le nom de la prestation est écrit à côté)
for (const m of src.matchAll(/<img\b[^>]*>/g)) if (!/\salt="[^"]+"/.test(m[0]) && !/data-vimg/.test(m[0]) && !src.slice(0, m.index).endsWith('<span class="svc__ph">')) fail(`photo sans texte de remplacement : ${m[0].slice(0, 80)}`);
// chaque photo des pièces a sa légende
for (const li of src.matchAll(/<li class="w w--(?!q)[^"]+">([\s\S]*?)<\/li>/g)) if (!/<figcaption>[^<]+<\/figcaption>/.test(li[1])) fail('une photo des pièces n’a pas de légende');
// les gros plans mènent à une photo qui existe
for (const [, id] of src.matchAll(/data-open="([\w-]+)"/g)) if (!src.includes(`id="${id}"`)) fail(`gros plan : la photo ${id} n’existe pas`);
if (/<!--(LOGO|FAVICON|DIAL)/.test(src)) fail('un repère du gabarit n’a pas été remplacé');

/* ——— les photos : chaque balise img/source, en fichier unique (intégrées) ou en ligne (assets/) ——— */
const sizes = JSON.parse(read('./data/photos.json'));
const size = (name) => sizes[name] || fail(`photo inconnue : ${name}`);
const used = new Set();
const embedded = new Set();
const largest = (set) => set.split(',').map((s) => s.trim().split(/\s+/)[0]).pop();
const tag = (mode) => (m) => {
  let t = m;
  const own = m.match(/^<img\b[^>]*\ssrc="img\/([\w-]+)\.avif"/);
  if (mode === 'one') {
    // fichier unique : une seule version de chaque photo, la plus grande de la liste
    const set = t.match(/\ssrcset="([^"]+)"/);
    if (set) {
      const best = largest(set[1]);
      t = /^<img/.test(t)
        ? t.replace(/\ssrc="[^"]+"/, ` src="${best}"`).replace(/\s(srcset|sizes)="[^"]*"/g, '')
        : t.replace(/\ssrcset="[^"]+"/, ` srcset="${best}"`).replace(/\ssizes="[^"]*"/, '');
    }
    for (const [, n] of t.matchAll(/img\/([\w-]+)\.avif/g)) {
      if (embedded.has(n)) fail(`fichier unique : photo répétée ${n}`);
      embedded.add(n);
    }
    t = t.replace(/img\/([\w-]+)\.avif/g, (x, n) => (size(n), `data:image/avif;base64,${b64(`./src/img/${n}.avif`)}`));
  } else {
    // en ligne : la visionneuse ira chercher la plus grande version des photos qu'elle montre
    const set = t.match(/\ssrcset="([^"]+)"/);
    if (set && own && /\sid="/.test(t)) t = t.replace(/^<img/, `<img data-full="${largest(set[1])}"`);
    t = t.replace(/img\/([\w-]+)\.avif/g, (x, n) => (size(n), used.add(n), `assets/img/${n}.avif`));
  }
  // largeur et hauteur de la photo affichée par défaut (pas de décalage au chargement)
  if (own && !/\swidth=/.test(m)) {
    const best = mode === 'one' && t.match(/\ssrcset/) ? own[1] : own[1];
    t = t.replace(/^<img/, `<img width="${size(best)[0]}" height="${size(best)[1]}"`);
  }
  return t;
};
const photos = (html, mode) => html.replace(/<(img|source)\b[^>]*>/g, tag(mode));

const css = read('./src/styles.css');
const js = [read('./vendor/lenis.min.js'), read('./src/main.js')].join('\n;\n').replace(/<\/script/gi, '<\\/script');

/* ——— le fichier unique ——— */
const page = photos(src, 'one')
  .replace('<!--STYLES-->', () => `<style>\n${fontCss((f) => `data:font/woff2;base64,${b64(`./vendor/fonts/${f}`)}`)}\n${css}\n</style>`)
  .replace('<!--SCRIPTS-->', () => `<script>\n${js}\n</script>`);
if (/["( ]img\//.test(page)) fail('fichier unique : une photo n’a pas été intégrée');
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
      `<link rel="preload" as="font" type="font/woff2" href="assets/fonts/MontaguSlab.woff2" crossorigin>`,
      `<link rel="preload" as="font" type="font/woff2" href="assets/fonts/RedditSans.woff2" crossorigin>`,
      `<style>\n${fontCss((f) => `assets/fonts/${f}`)}\n${css}\n</style>`,
    ].join('\n'),
  )
  .replace('<!--SCRIPTS-->', () => `<script>\n${js}\n</script>`);
if (/["( ]img\//.test(pageWeb)) fail('version en ligne : un chemin de photo n’a pas été réécrit');
for (const n of used) copyFileSync(here(`./src/img/${n}.avif`), web(`assets/img/${n}.avif`));
writeFileSync(web('index.html'), pageWeb);
// robots.txt, sitemap.xml, llms.txt, en-têtes, redirections des anciennes pages, image de partage et logo
for (const f of ['_headers', '_redirects', 'vercel.json', 'robots.txt', 'sitemap.xml', 'llms.txt']) if (existsSync(here(`./web/${f}`))) copyFileSync(here(`./web/${f}`), web(f));
for (const f of ['og.jpg', 'logo.png']) if (existsSync(here(`./web/${f}`))) copyFileSync(here(`./web/${f}`), web(`assets/${f}`));
console.log(`dist-web/index.html : ${(Buffer.byteLength(pageWeb) / 1024).toFixed(0)} Ko, ${used.size} fichiers de photos`);
