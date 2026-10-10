// Deux sorties :
//  - dist/index.html : le site en un seul fichier (polices, styles, photos, vidéos, librairies et scripts intégrés),
//    à ouvrir d'un double-clic ;
//  - dist-web/ : la version à mettre en ligne, la page légère et les photos, vidéos et polices en fichiers séparés
//    (chargées au fur et à mesure, mises en cache par le navigateur).
//   node build.mjs
import {readFileSync, writeFileSync, mkdirSync, copyFileSync, rmSync} from 'node:fs';

const here = (p) => new URL(p, import.meta.url);
const read = (p) => readFileSync(here(p), 'utf8');
const b64 = (p) => readFileSync(here(p)).toString('base64');
const face = (file, family, weight) =>
  `@font-face{font-family:"${family}";src:url(data:font/woff2;base64,${b64(file)}) format("woff2");font-weight:${weight};font-style:normal;font-display:swap}`;

// Unbounded pour les titres (graisses 200 à 900), Figtree pour le texte (300 à 900) : deux polices variables, OFL
const fonts = face('./vendor/fonts/Unbounded.woff2', 'Unbounded', '200 900') + face('./vendor/fonts/Figtree.woff2', 'Figtree', '300 900');
const sizes = JSON.parse(read('./data/photo-sizes.json'));

const css = fonts + '\n' + read('./src/styles.css').replace(/url\(img\/([\w-]+)\.avif\)/g, (m, n) => `url(data:image/avif;base64,${b64(`./src/img/${n}.avif`)})`);
const js = [read('./vendor/gsap.min.js'), read('./vendor/ScrollTrigger.min.js'), read('./vendor/lenis.min.js'), read('./src/main.js')]
  .join('\n;\n')
  .replace(/<\/script/gi, '<\\/script');

// chaque photo n'est intégrée qu'une fois : une photo répétée reprend la source de la première au chargement
const seen = new Map();
const videos = new Set();
const PIXEL = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
const copy = 'for(const i of document.querySelectorAll("img[data-dup]"))i.src=document.querySelector(`img[data-img="${i.dataset.dup}"]`).src;';
const html = read('./src/index.html')
  // largeur et hauteur de chaque photo (pas de décalage au chargement), puis la photo elle-même
  .replace(/<img\b([^>]*?)src="img\/([\w-]+)\.avif"([^>]*)>/g, (m, a, name, b) => {
    const [w, h] = sizes[name] || [];
    if (!w) throw new Error(`photo inconnue : ${name}`);
    const dims = /\bwidth=/.test(a + b) ? '' : ` width="${w}" height="${h}"`;
    const n = (seen.get(name) || 0) + 1;
    seen.set(name, n);
    const src = n > 1 ? `src="${PIXEL}" data-dup="${name}"` : `src="data:image/avif;base64,${b64(`./src/img/${name}.avif`)}" data-img="${name}"`;
    return `<img${a}${src}${dims}${b}>`;
  })
  // la version téléphone de la photo d'accueil (<source srcset>)
  .replace(/srcset="img\/([\w-]+)\.avif"/g, (m, n) => `srcset="data:image/avif;base64,${b64(`./src/img/${n}.avif`)}"`)
  .replace(/poster="img\/([\w-]+)\.avif"/g, (m, n) => `poster="data:image/avif;base64,${b64(`./src/img/${n}.avif`)}"`)
  // les vidéos arrivent en fin de fichier : le premier écran s'affiche sans les attendre
  .replace(/src="video\/([\w-]+)\.mp4"/g, (m, n) => {
    videos.add(n);
    return `data-video="${n}"`;
  })
  .replace(/href="img\/([\w-]+)\.png"/g, (m, n) => `href="data:image/png;base64,${b64(`./src/img/${n}.png`)}"`)
  .replace('<!--STYLES-->', () => `<style>\n${css}\n</style>`)
  .replace('<!--SCRIPTS-->', () => `<script>${copy}</script>\n<script>\n${js}\n</script>\n<!--VIDEOS-->`);
const load = `<script>(function(){var v={${[...videos].map((n) => `"${n}":"data:video/mp4;base64,${b64(`./src/video/${n}.mp4`)}"`).join(',')}};document.querySelectorAll('video[data-video]').forEach(function(e){e.src=v[e.dataset.video];if(e.dataset.visible&&document.documentElement.classList.contains('motion'))e.play().catch(function(){})})})()</script>`;
const page = html.replace('<!--VIDEOS-->', () => load);

mkdirSync(here('./dist/'), {recursive: true});
writeFileSync(here('./dist/index.html'), page);
console.log(`dist/index.html : ${(Buffer.byteLength(page) / 1024 / 1024).toFixed(2)} Mo, ${seen.size} photos, ${videos.size} vidéos`);

/* ——— la version en ligne ——— */
const web = (p) => here(`./dist-web/${p}`);
rmSync(web(''), {recursive: true, force: true});
for (const d of ['assets/img', 'assets/video', 'assets/fonts']) mkdirSync(web(d), {recursive: true});
const used = new Set();
const fontsWeb = ['Unbounded', 'Figtree'].map((f, i) => {
  copyFileSync(here(`./vendor/fonts/${f}.woff2`), web(`assets/fonts/${f}.woff2`));
  return `@font-face{font-family:"${f}";src:url(assets/fonts/${f}.woff2) format("woff2");font-weight:${i ? '300 900' : '200 900'};font-style:normal;font-display:swap}`;
}).join('');
const cssWeb = fontsWeb + '\n' + read('./src/styles.css').replace(/url\(img\/([\w-]+)\.avif\)/g, (m, n) => (used.add(n), `url(assets/img/${n}.avif)`));
const preload = [
  '<link rel="preload" as="font" type="font/woff2" href="assets/fonts/Unbounded.woff2" crossorigin>',
  '<link rel="preload" as="font" type="font/woff2" href="assets/fonts/Figtree.woff2" crossorigin>',
  // la photo d'accueil : chaque écran ne précharge que la sienne
  '<link rel="preload" as="image" href="assets/img/hero.avif" media="(min-width: 761px)" fetchpriority="high">',
  '<link rel="preload" as="image" href="assets/img/hero-m.avif" media="(max-width: 760px)" fetchpriority="high">',
].join('\n');
const htmlWeb = read('./src/index.html')
  .replace(/<img\b([^>]*?)src="img\/([\w-]+)\.avif"([^>]*)>/g, (m, a, name, b) => {
    const [w, h] = sizes[name];
    used.add(name);
    const dims = /\bwidth=/.test(a + b) ? '' : ` width="${w}" height="${h}"`;
    return `<img${a}src="assets/img/${name}.avif"${dims}${b}>`;
  })
  .replace(/srcset="img\/([\w-]+)\.avif"/g, (m, n) => (used.add(n), `srcset="assets/img/${n}.avif"`))
  .replace(/poster="img\/([\w-]+)\.avif"/g, (m, n) => (used.add(n), `poster="assets/img/${n}.avif"`))
  .replace(/src="video\/([\w-]+)\.mp4"/g, (m, n) => {
    copyFileSync(here(`./src/video/${n}.mp4`), web(`assets/video/${n}.mp4`));
    return `src="assets/video/${n}.mp4"`;
  })
  .replace(/href="img\/([\w-]+)\.png"/g, (m, n) => {
    copyFileSync(here(`./src/img/${n}.png`), web(`assets/img/${n}.png`));
    return `href="assets/img/${n}.png"`;
  })
  .replace('<!--STYLES-->', () => `${preload}\n<style>\n${cssWeb}\n</style>`)
  .replace('<!--SCRIPTS-->', () => `<script>\n${js}\n</script>`);
for (const n of used) copyFileSync(here(`./src/img/${n}.avif`), web(`assets/img/${n}.avif`));
writeFileSync(web('index.html'), htmlWeb);
// Netlify et Vercel : un an de cache pour les fichiers du dossier assets, et pas d'indexation tant que c'est une maquette
writeFileSync(web('_headers'), '/*\n  X-Robots-Tag: noindex\n/assets/*\n  Cache-Control: public, max-age=31536000, immutable\n');
console.log(`dist-web/index.html : ${(Buffer.byteLength(htmlWeb) / 1024).toFixed(0)} Ko, ${used.size} photos en fichiers`);
