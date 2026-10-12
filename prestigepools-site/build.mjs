// Deux sorties :
//  - dist/index.html : le site en un seul fichier (polices, styles, photos, librairie et script intégrés), à ouvrir d'un double-clic ;
//  - dist-web/ : la version à mettre en ligne, la page légère, et les photos et les polices en fichiers.
//   node build.mjs
import {readFileSync, writeFileSync, mkdirSync, copyFileSync, rmSync, existsSync, readdirSync} from 'node:fs';

const here = (p) => new URL(p, import.meta.url);
const read = (p) => readFileSync(here(p), 'utf8');
const b64 = (p) => readFileSync(here(p)).toString('base64');
// Syne (titres, graisses 400 à 800) et Onest (texte, 100 à 900), licence OFL.
// Les polices de secours reprennent la chasse et la hauteur de chacune (Arial agrandie), pour que rien ne bouge au chargement.
const faces = (syne, onest) =>
  `@font-face{font-family:"Syne";src:url(${syne}) format("woff2");font-weight:400 800;font-style:normal;font-display:swap}` +
  `@font-face{font-family:"Onest";src:url(${onest}) format("woff2");font-weight:100 900;font-style:normal;font-display:swap}` +
  '@font-face{font-family:"Syne Fallback";src:local("Arial Bold"),local("Liberation Sans Bold"),local("Helvetica Bold");font-weight:700;size-adjust:114.26%;ascent-override:80.96%;descent-override:24.07%;line-gap-override:0%}' +
  '@font-face{font-family:"Onest Fallback";src:local("Arial"),local("Liberation Sans"),local("Helvetica");size-adjust:105.73%;ascent-override:91.75%;descent-override:28.85%;line-gap-override:0%}';

const sizes = JSON.parse(read('./data/photo-sizes.json'));
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

/* ——— la galerie et les options sont écrites d'après data/gallery.json et data/options.json ——— */
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const TAG = [['night', 'After dark'], ['water', 'By the water'], ['spa', 'With a spa'], ['rect', 'Rectangle'], ['free', 'Freeform']];
const tagLabel = (tags) => (TAG.find(([t]) => tags.split(' ').includes(t)) || [, ''])[1];
const gallery = JSON.parse(read('./data/gallery.json'))
  .map(
    (g) =>
      `    <li data-tags="${g.tags}"><button class="tile" type="button" aria-label="Open photo: ${esc(g.alt)}"><img src="img/${g.id}.avif" alt="${esc(g.alt)}" loading="lazy" decoding="async" sizes="(max-width: 760px) 92vw, 44vw">${tagLabel(g.tags) ? `<span class="tile__tag" aria-hidden="true">${tagLabel(g.tags)}</span>` : ''}</button></li>`,
  )
  .join('\n');
const options = JSON.parse(read('./data/options.json'));
const board = (list) =>
  list
    .map(
      (o) =>
        `      <li${o.wide ? ' class="is-wide"' : ''}><figure><img src="img/${o.id}.avif" alt="${esc(o.alt)}" loading="lazy" decoding="async" sizes="${o.wide ? '(max-width: 760px) 92vw, 36vw' : '(max-width: 760px) 46vw, 18vw'}"><figcaption><strong>${o.title}</strong> ${o.text}</figcaption></figure></li>`,
    )
    .join('\n');
const src = read('./src/index.html')
  .replace('<!--GALLERY-->', () => gallery)
  .replace('<!--OPT-WATER-->', () => board(options.water))
  .replace('<!--OPT-AROUND-->', () => board(options.around))
  .replace('<!--OPT-BACK-->', () => board(options.back));

/* ——— le fichier unique ——— */
const seen = new Map();
const PIXEL = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
// une photo utilisée deux fois n'est intégrée qu'une fois ; la copie reprend sa source au chargement
const copy = 'for(const i of document.querySelectorAll("img[data-dup]"))i.src=document.querySelector(`img[data-img="${i.dataset.dup}"]`).src;';
const page = src
  .replace(IMG, (m, a, name, b) => {
    const n = (seen.get(name) || 0) + 1;
    seen.set(name, n);
    const s = n > 1 ? `src="${PIXEL}" data-dup="${name}"` : `src="data:image/avif;base64,${b64(`./src/img/${name}.avif`)}" data-img="${name}"`;
    return `<img${a}${s}${dims(name, a + b)}${b}>`;
  })
  .replace('<!--STYLES-->', () => `<style>\n${faces(`data:font/woff2;base64,${b64('./vendor/fonts/Syne.woff2')}`, `data:font/woff2;base64,${b64('./vendor/fonts/Onest.woff2')}`)}\n${css}\n</style>`)
  .replace('<!--SCRIPTS-->', () => `<script>${copy}</script>\n<script>\n${js}\n</script>`);
mkdirSync(here('./dist/'), {recursive: true});
writeFileSync(here('./dist/index.html'), page);
console.log(`dist/index.html : ${(Buffer.byteLength(page) / 1024 / 1024).toFixed(2)} Mo, ${seen.size} photos`);

/* ——— la version en ligne ——— */
const web = (p) => here(`./dist-web/${p}`);
rmSync(web(''), {recursive: true, force: true});
for (const d of ['assets/img', 'assets/fonts']) mkdirSync(web(d), {recursive: true});
for (const f of ['Syne', 'Onest']) copyFileSync(here(`./vendor/fonts/${f}.woff2`), web(`assets/fonts/${f}.woff2`));
const used = new Set();
// versions réduites (<nom>.w<largeur>.avif) : le navigateur choisit selon l'attribut sizes de la page
const files = readdirSync(here('./src/img/'));
const variants = (name) =>
  files
    .map((f) => f.match(new RegExp(`^${name}\\.w(\\d+)\\.avif$`)))
    .filter(Boolean)
    .map((m) => [m[0], Number(m[1])]);
const pageWeb = src
  .replace(IMG, (m, a, name, b) => {
    used.add(name);
    const vs = variants(name);
    if (!vs.length) return `<img${a}src="assets/img/${name}.avif"${dims(name, a + b)}${b}>`;
    vs.forEach(([f]) => used.add(f.replace(/\.avif$/, '')));
    const set = [...vs.map(([f, w]) => `assets/img/${f} ${w}w`), `assets/img/${name}.avif ${size(name)[0]}w`].join(', ');
    const sz = /\bsizes=/.test(a + b) ? '' : ' sizes="(max-width: 760px) 92vw, 50vw"';
    return `<img${a}src="assets/img/${name}.avif" srcset="${set}"${sz}${dims(name, a + b)}${b}>`;
  })
  .replace('<!--STYLES-->', () =>
    [
      '<link rel="preload" as="font" type="font/woff2" href="assets/fonts/Syne.woff2" crossorigin>',
      '<link rel="preload" as="font" type="font/woff2" href="assets/fonts/Onest.woff2" crossorigin>',
      `<link rel="preload" as="image" type="image/avif" imagesrcset="${['hero-day', ...variants('hero-day').map(([f]) => f.replace(/\.avif$/, ''))]
        .map((n) => `assets/img/${n}.avif ${n === 'hero-day' ? size('hero-day')[0] : n.split('.w')[1]}w`)
        .join(', ')}" imagesizes="(max-width: 860px) 92vw, 44vw" fetchpriority="high">`,
      `<style>\n${faces('assets/fonts/Syne.woff2', 'assets/fonts/Onest.woff2')}\n${css}\n</style>`,
    ].join('\n'),
  )
  .replace('<!--SCRIPTS-->', () => `<script>\n${js}\n</script>`);
for (const n of used) copyFileSync(here(`./src/img/${n}.avif`), web(`assets/img/${n}.avif`));
writeFileSync(web('index.html'), pageWeb);
// la maquette en ligne n'est pas indexée (à retirer au lancement) ; robots.txt, sitemap.xml et llms.txt sont prêts pour le lancement
for (const f of ['_headers', 'vercel.json', 'robots.txt', 'sitemap.xml', 'llms.txt']) if (existsSync(here(`./web/${f}`))) copyFileSync(here(`./web/${f}`), web(f));
if (existsSync(here('./web/og.jpg'))) copyFileSync(here('./web/og.jpg'), web('assets/og.jpg'));
console.log(`dist-web/index.html : ${(Buffer.byteLength(pageWeb) / 1024).toFixed(0)} Ko, ${used.size} photos`);
