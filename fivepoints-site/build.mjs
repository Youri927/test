// Deux sorties :
//  - dist/index.html : le site en un seul fichier (police, styles, photos, librairie et script intégrés),
//    à ouvrir d'un double-clic ;
//  - dist-web/ : la version à mettre en ligne, la page légère, et les photos et la police en fichiers.
//   node build.mjs
import {readFileSync, writeFileSync, mkdirSync, copyFileSync, rmSync, existsSync} from 'node:fs';

const here = (p) => new URL(p, import.meta.url);
const read = (p) => readFileSync(here(p), 'utf8');
const b64 = (p) => readFileSync(here(p)).toString('base64');

/* ——— la police : Saira (Omnibus-Type), licence OFL, variable en largeur (62,5 à 125 %) et en graisse (400 à 800) ———
   Les polices de secours reprennent la chasse et la hauteur de Saira (Arial et Arial Narrow ajustées, mesurées sur
   les textes du site, tools/fallback.py) : rien ne bouge quand elle arrive. */
const FONT = 'Saira.woff2';
const FB = JSON.parse(read('./data/fallback.json'));
const fallback = (name, locals, m) =>
  `@font-face{font-family:"${name}";src:${locals.map((l) => `local("${l}")`).join(',')};size-adjust:${m.size};ascent-override:${m.ascent};descent-override:${m.descent};line-gap-override:0%}`;
const fontCss = (url) =>
  `@font-face{font-family:"Saira";src:url(${url}) format("woff2");font-weight:400 800;font-stretch:62.5% 125%;font-style:normal;font-display:swap}` +
  fallback('Saira Fallback', ['Arial', 'Liberation Sans', 'Helvetica'], FB.sans) +
  fallback('Saira Cond Fallback', ['Arial Narrow', 'Liberation Sans Narrow', 'Arial Narrow Bold'], FB.cond);

/* ——— le logo, redessiné en vecteurs (tools/logo.py) ——— */
const logo = JSON.parse(read('./data/logo.json'));
const GOLD = '#C3A046';
// l'étoile : le chevron du haut (un toit) et la branche de droite à l'encre ; la barre, la branche de gauche et le « 5 »
// en or, le « 5 » détouré de la couleur du fond
const mark = (ink, bg) =>
  `<path d="${logo.mark.roof}" fill="${ink}" fill-rule="evenodd"/>` +
  `<path d="${logo.mark.bar}" fill="${GOLD}"/>` +
  `<path d="${logo.mark.right}" fill="${ink}" fill-rule="evenodd"/>` +
  `<path d="${logo.mark.left}" fill="${GOLD}" fill-rule="evenodd"/>` +
  `<path d="${logo.mark.five}" fill="${GOLD}" stroke="${bg}" stroke-width="2.2" paint-order="stroke" stroke-linejoin="round"/>`;
const lockup = (ink, bg) => {
  const w = logo.word;
  return (
    `<svg viewBox="0 6 ${+(114 + w.w).toFixed(1)} 88" aria-hidden="true" focusable="false">${mark(ink, bg)}` +
    `<g transform="translate(114 ${+(50 - w.h / 2).toFixed(2)})"><path d="${w.five}" fill="${ink}"/><path d="${w.points}" fill="${GOLD}"/><path d="${w.roofing}" fill="${ink}"/></g></svg>`
  );
};
const favicon = encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="18" fill="#F4F5F2"/>${mark('#1C1E21', '#F4F5F2')}</svg>`,
);

/* ——— la page ——— */
const clean = (s) => s.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
let src = read('./src/index.html')
  .replace('<!--LOGO:top-->', () => lockup('#1C1E21', '#F4F5F2'))
  .replace('<!--LOGO:foot-->', () => lockup('#F4F5F2', '#1C1E21'))
  .replace('<!--STAR:hero-->', () => mark('#1C1E21', '#F4F5F2'))
  .replace('<!--STAR:foot-->', () => mark('#F4F5F2', '#1C1E21'))
  .replace('<!--FAVICON-->', () => favicon);
// les questions des données structurées sont celles de la page, mot pour mot
const faq = [...src.matchAll(/<details>\s*<summary>([\s\S]*?)<\/summary>\s*<p>([\s\S]*?)<\/p>\s*<\/details>/g)].map(([, q, a]) => ({
  '@type': 'Question',
  name: clean(q),
  acceptedAnswer: {'@type': 'Answer', text: clean(a)},
}));
src = src.replace('"<!--FAQ-LD-->"', () => JSON.stringify(faq).replace(/</g, '\\u003c'));

/* ——— vérifications : ce qui est affiché correspond au contenu ——— */
const fail = (m) => {
  throw new Error(m);
};
const ld = JSON.parse(src.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
const biz = ld['@graph'].find((n) => n['@type'] === 'RoofingContractor');
const shown = clean(src.split('</head>')[1].replace(/<script[\s\S]*?<\/script>|<svg[\s\S]*?<\/svg>/g, ' ')).replace(/&amp;/g, '&');
// chaque avis des données structurées est la citation affichée, mot pour mot
for (const r of biz.review) if (!shown.includes(r.reviewBody)) fail(`données structurées : l’avis de ${r.author.name} n’est pas celui de la page`);
if (biz.review.length !== (src.match(/<figure class="quote/g) || []).length) fail('avis : pas autant de citations que dans les données');
const towns = [...src.match(/<ul class="towns">([\s\S]*?)<\/ul>/)[1].matchAll(/<li>([^<]+)<\/li>/g)].map((m) => m[1]);
const served = biz.areaServed.filter((a) => a['@type'] !== 'AdministrativeArea').map((a) => a.name.replace(/, FL$/, ''));
if (towns.length !== 9 || towns.join() !== served.join()) fail(`villes : ${towns.join(', ')} ≠ ${served.join(', ')}`);
if (faq.length !== 6) fail(`questions : ${faq.length} au lieu de 6`);
if ((src.match(/CCC1333259/g) || []).length < 5) fail('la licence doit figurer dans l’accueil, la famille, le pied de page, la description et les données');
for (const m of src.matchAll(/<img\b[^>]*>/g)) if (!/\salt="[^"]+"/.test(m[0])) fail(`photo sans texte de remplacement : ${m[0].slice(0, 80)}`);
if (/<!--(LOGO|STAR|FAVICON|FAQ-LD)/.test(src)) fail('un repère du gabarit n’a pas été remplacé');

/* ——— les photos : en fichier unique (intégrées) ou en ligne (assets/img), avec leur taille (pas de décalage) ——— */
const sizes = JSON.parse(read('./data/photo-sizes.json'));
const used = new Set();
const photos = (html, mode) =>
  html.replace(/<img\b[^>]*>/g, (m) => {
    const n = (m.match(/\ssrc="img\/([\w-]+)\.avif"/) || [])[1];
    if (!n) return m;
    if (!sizes[n]) fail(`photo inconnue : ${n}`);
    if (mode === 'one' && used.has(n)) fail(`photo répétée : ${n}`);
    used.add(n);
    const url = mode === 'one' ? `data:image/avif;base64,${b64(`./src/img/${n}.avif`)}` : `assets/img/${n}.avif`;
    return m.replace(/\ssrc="[^"]+"/, ` src="${url}"`).replace(/^<img/, `<img width="${sizes[n][0]}" height="${sizes[n][1]}"`);
  });

const css = read('./src/styles.css');
const js = [read('./vendor/lenis.min.js'), read('./src/main.js')].join('\n;\n').replace(/<\/script/gi, '<\\/script');

/* ——— le fichier unique ——— */
const page = photos(src, 'one')
  .replace('<!--STYLES-->', () => `<style>\n${fontCss(`data:font/woff2;base64,${b64(`./vendor/fonts/${FONT}`)}`)}\n${css}\n</style>`)
  .replace('<!--SCRIPTS-->', () => `<script>\n${js}\n</script>`);
if (/["(]img\//.test(page)) fail('fichier unique : une photo n’a pas été intégrée');
mkdirSync(here('./dist/'), {recursive: true});
writeFileSync(here('./dist/index.html'), page);
console.log(`dist/index.html : ${(Buffer.byteLength(page) / 1024).toFixed(0)} Ko, ${used.size} photos`);

/* ——— la version en ligne ——— */
used.clear();
const web = (p) => here(`./dist-web/${p}`);
rmSync(web(''), {recursive: true, force: true});
for (const d of ['assets/img', 'assets/fonts']) mkdirSync(web(d), {recursive: true});
copyFileSync(here(`./vendor/fonts/${FONT}`), web(`assets/fonts/${FONT}`));
const pageWeb = photos(src, 'web')
  .replace('<!--STYLES-->', () =>
    [
      `<link rel="preload" as="font" type="font/woff2" href="assets/fonts/${FONT}" crossorigin>`,
      `<style>\n${fontCss(`assets/fonts/${FONT}`)}\n${css}\n</style>`,
    ].join('\n'),
  )
  .replace('<!--SCRIPTS-->', () => `<script>\n${js}\n</script>`);
if (/["(]img\//.test(pageWeb)) fail('version en ligne : un chemin de photo n’a pas été réécrit');
for (const n of used) copyFileSync(here(`./src/img/${n}.avif`), web(`assets/img/${n}.avif`));
writeFileSync(web('index.html'), pageWeb);
// robots.txt, sitemap.xml, llms.txt, en-têtes, redirections des anciennes pages et image de partage
for (const f of ['_headers', '_redirects', 'vercel.json', 'robots.txt', 'sitemap.xml', 'llms.txt']) if (existsSync(here(`./web/${f}`))) copyFileSync(here(`./web/${f}`), web(f));
if (existsSync(here('./web/og.jpg'))) copyFileSync(here('./web/og.jpg'), web('assets/og.jpg'));
console.log(`dist-web/index.html : ${(Buffer.byteLength(pageWeb) / 1024).toFixed(0)} Ko, ${used.size} photos`);
