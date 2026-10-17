// Deux sorties :
//  - dist/index.html : le site en un seul fichier (polices, styles, photos, emblème, librairie et script intégrés),
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

/* ——— les polices : Gloock (Duarte Pires) et Albert Sans, licence OFL ———
   Les polices de secours reprennent la chasse et la hauteur des vraies (Times et Arial ajustées, mesurées sur les
   textes du site, tools/fallback.py) : rien ne bouge quand elles arrivent. */
const FONTS = [
  {family: 'Gloock', file: 'Gloock.woff2', weight: '400'},
  {family: 'Albert Sans', file: 'AlbertSans.woff2', weight: '400 700'},
];
const FB = JSON.parse(read('./data/fallback.json'));
const fallback = (name, locals, m) =>
  `@font-face{font-family:"${name}";src:${locals.map((l) => `local("${l}")`).join(',')};size-adjust:${m.size};ascent-override:${m.ascent};descent-override:${m.descent};line-gap-override:0%}`;
const fontCss = (url) =>
  FONTS.map((f) => `@font-face{font-family:"${f.family}";src:url(${url(f.file)}) format("woff2");font-weight:${f.weight};font-style:normal;font-display:swap}`).join('') +
  fallback('Gloock Fallback', ['Times New Roman', 'Liberation Serif', 'Times'], FB.serif) +
  fallback('Albert Fallback', ['Arial', 'Liberation Sans', 'Helvetica'], FB.sans);

/* ——— l'emblème, redessiné (tools/logo.py) : défini une fois, repris par <use> ; il prend la couleur du texte.
   Deux graisses : l'anneau fin pour le pied de page, l'anneau fort pour l'en-tête, la licence et l'onglet. ——— */
const logo = JSON.parse(read('./data/logo.json'));
const VB = `0 0 ${logo.w} ${logo.h}`;
const symbol =
  `<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">` +
  `<symbol id="emblem" viewBox="${VB}"><path d="${logo.ring}" fill="currentColor" fill-rule="evenodd"/><path d="${logo.land}" fill="currentColor" fill-rule="evenodd"/></symbol>` +
  `<symbol id="emblem-b" viewBox="${VB}"><path d="${logo.ringBold}" fill="currentColor" fill-rule="evenodd"/><path d="${logo.landBold}" fill="currentColor" fill-rule="evenodd"/></symbol></svg>`;
const emblem = (bold) => `<svg class="emblem" viewBox="${VB}" aria-hidden="true" focusable="false"><use href="#emblem${bold ? '-b' : ''}"/></svg>`;
// l'onglet : l'emblème blanc sur le ciel, en graisse forte
const favicon = encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-60 -60 ${logo.w + 120} ${logo.w + 120}"><rect x="-60" y="-60" width="${logo.w + 120}" height="${logo.w + 120}" rx="150" fill="#2E5AB2"/>` +
    `<g transform="translate(0 ${((logo.w - logo.h) / 2).toFixed(1)})" fill="#fff"><path d="${logo.ringBold}" fill-rule="evenodd"/><path d="${logo.landBold}" fill-rule="evenodd"/></g></svg>`,
);

/* ——— la page ——— */
let src = read('./src/index.html')
  .replace('<!--EMBLEM:top-->', () => emblem(true))
  .replace('<!--EMBLEM:license-->', () => emblem(true))
  .replace('<!--EMBLEM:foot-->', () => emblem(false))
  .replace('<!--FAVICON-->', () => favicon)
  .replace('<body>', () => `<body>\n${symbol}`);

/* ——— vérifications : ce qui est affiché correspond au contenu ——— */
const clean = (s) => s.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
const ld = JSON.parse(src.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
const biz = ld['@graph'].find((n) => n['@type'] === 'GeneralContractor');
const shown = clean(src.split('</head>')[1].replace(/<script[\s\S]*?<\/script>|<svg[\s\S]*?<\/svg>/g, ' '));
// chaque avis des données structurées est la citation affichée, mot pour mot, avec le même nom
for (const r of biz.review) {
  if (!shown.includes(r.reviewBody)) fail(`données structurées : l’avis de ${r.author.name} n’est pas celui de la page`);
  if (!shown.includes(r.author.name)) fail(`données structurées : ${r.author.name} n’est pas sur la page`);
}
if (biz.review.length !== (src.match(/<figure class="quote/g) || []).length) fail('avis : pas autant de citations que dans les données');
if ((src.match(/CGC1515532/g) || []).length < 5) fail('la licence doit figurer dans l’accueil, la licence, le pied de page, les données et la description');
if (!shown.includes(biz.address.streetAddress)) fail('le bureau des données n’est pas celui de la page');
for (const m of src.matchAll(/<img\b[^>]*>/g)) if (!/\salt="[^"]+"/.test(m[0]) && !/data-vimg/.test(m[0])) fail(`photo sans texte de remplacement : ${m[0].slice(0, 80)}`);
// la liste de l'accueil : cinq lignes, du plus petit chantier au plus grand
if ((src.match(/<ul class="todo"[\s\S]*?<\/ul>/)[0].match(/<li>/g) || []).length !== 5) fail('la liste de l’accueil doit avoir cinq lignes');
// chaque photo de la mosaïque a sa légende
for (const li of src.matchAll(/<li class="m-[^"]+"[^>]*>([\s\S]*?)<\/li>/g)) if (!/<p class="cap">[^<]+<\/p>/.test(li[1])) fail('une photo de la mosaïque n’a pas de légende');
if (/<!--(EMBLEM|FAVICON)/.test(src)) fail('un repère du gabarit n’a pas été remplacé');

/* ——— les photos : chaque balise img/source, en fichier unique (intégrées) ou en ligne (assets/) ——— */
const sizes = JSON.parse(read('./data/photo-sizes.json'));
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
    // en ligne : la visionneuse ira chercher la plus grande version des photos de la mosaïque
    const set = t.match(/\ssrcset="([^"]+)"/);
    if (set && own && /^[rb]-/.test(own[1])) t = t.replace(/^<img/, `<img data-full="${largest(set[1])}"`);
    t = t.replace(/img\/([\w-]+)\.avif/g, (x, n) => (size(n), used.add(n), `assets/img/${n}.avif`));
  }
  // largeur et hauteur de la photo affichée par défaut (pas de décalage au chargement)
  if (own && !/\swidth=/.test(m)) t = t.replace(/^<img/, `<img width="${size(own[1])[0]}" height="${size(own[1])[1]}"`);
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
      `<link rel="preload" as="font" type="font/woff2" href="assets/fonts/Gloock.woff2" crossorigin>`,
      `<link rel="preload" as="font" type="font/woff2" href="assets/fonts/AlbertSans.woff2" crossorigin>`,
      `<style>\n${fontCss((f) => `assets/fonts/${f}`)}\n${css}\n</style>`,
    ].join('\n'),
  )
  .replace('<!--SCRIPTS-->', () => `<script>\n${js}\n</script>`);
if (/["( ]img\//.test(pageWeb)) fail('version en ligne : un chemin de photo n’a pas été réécrit');
for (const n of used) copyFileSync(here(`./src/img/${n}.avif`), web(`assets/img/${n}.avif`));
writeFileSync(web('index.html'), pageWeb);
// robots.txt, sitemap.xml, llms.txt, en-têtes, redirections des anciennes pages et image de partage
for (const f of ['_headers', '_redirects', 'vercel.json', 'robots.txt', 'sitemap.xml', 'llms.txt']) if (existsSync(here(`./web/${f}`))) copyFileSync(here(`./web/${f}`), web(f));
if (existsSync(here('./web/og.jpg'))) copyFileSync(here('./web/og.jpg'), web('assets/og.jpg'));
console.log(`dist-web/index.html : ${(Buffer.byteLength(pageWeb) / 1024).toFixed(0)} Ko, ${used.size} fichiers de photos`);
