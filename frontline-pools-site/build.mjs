// Assemble un site monofichier (police, styles, photos, carte, avis, librairies et scripts intégrés) : dist/index.html
import {readFileSync, writeFileSync, mkdirSync} from 'node:fs';

const here = (p) => new URL(p, import.meta.url);
const read = (p) => readFileSync(here(p), 'utf8');
const b64 = (p) => readFileSync(here(p)).toString('base64');
const face = (file, family, {weight = '400', stretch = '100%', style = 'normal'} = {}) =>
  `@font-face{font-family:"${family}";src:url(data:font/woff2;base64,${b64(file)}) format("woff2");font-weight:${weight};font-stretch:${stretch};font-style:${style};font-display:swap}`;

// Archivo, police variable : graisse 100 à 900, largeur 62 % à 125 %
const fonts = face('./vendor/fonts/Archivo.woff2', 'Archivo', {weight: '100 900', stretch: '62% 125%'});

// les 33 avis publiés sur leur site (11 sur l'accueil, 25 sur la page avis, dont 3 en double), mot pour mot
const data = JSON.parse(read('./data/reviews.json'));
const DUPS = new Set(['David B.', 'Vincent L.', 'Amy J.']);
const all = [...data.home, ...data.page.filter((r) => !DUPS.has(r.name))];
const FIRST = ['John', 'Tim', 'Sandy & Glen', 'Kaitlyn', 'Vincent', 'Amy', 'Hank', 'AJ', 'Jerry'];
all.sort((a, b) => {
  const ia = FIRST.indexOf(a.name);
  const ib = FIRST.indexOf(b.name);
  return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
});
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const slug = (s) => s.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const ids = new Set();
const reviews = all.map((r) => {
  let id = slug(r.name);
  while (ids.has(id)) id += '-2';
  ids.add(id);
  // les guillemets d'origine (droits, typographiques ou doublés) sont retirés : la carte les remplace
  const text = r.text.trim().replace(/^["“”]+\s*/, '').replace(/\s*["“”]+$/, '');
  const body = esc(text).replace(/\b(Matt|Matthew|Mathew|Jacob)\b/g, '<mark>$1</mark>');
  const place = r.place ? `, ${esc(r.place.replace(/,?\s*FL$/i, '').replace(/^Davis island$/i, 'Davis Island'))}` : '';
  return `<blockquote class="rev" id="rev-${id}"><p>“${body}”</p><footer><b>${esc(r.name === 'C2CDS ADMIN' ? 'C2CDS Admin' : r.name)}</b>${place}</footer></blockquote>`;
}).join('\n      ');
if (all.length !== 33) throw new Error(`33 avis attendus, ${all.length} trouvés`);

const css = fonts + '\n' + read('./src/styles.css');
const js = [
  read('./vendor/gsap.min.js'),
  read('./vendor/ScrollTrigger.min.js'),
  read('./vendor/lenis.min.js'),
  read('./src/main.js'),
].join('\n;\n').replace(/<\/script/gi, '<\\/script');

// chaque image n'est intégrée qu'une fois : une image répétée reprend la source de la première
const seen = new Map();
const PIXEL = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
const copy = 'for(const i of document.querySelectorAll("img[data-dup]"))i.src=document.querySelector(`img[data-img="${i.dataset.dup}"]`).src;';
const html = read('./src/index.html')
  .replace('<!--REVIEWS-->', () => reviews)
  .replace('<!--MAP-->', () => read('./src/map.svg'))
  .replace(/src="img\/([\w-]+)\.webp"/g, (m, name) => {
    const n = (seen.get(name) || 0) + 1;
    seen.set(name, n);
    if (n > 1) return `src="${PIXEL}" data-dup="${name}"`;
    return `src="data:image/webp;base64,${b64(`./src/img/${name}.webp`)}" data-img="${name}"`;
  })
  .replace('<!--STYLES-->', () => `<style>\n${css}\n</style>`)
  .replace('<!--SCRIPTS-->', () => `<script>${copy}</script>\n<script>\n${js}\n</script>`);

mkdirSync(here('./dist/'), {recursive: true});
writeFileSync(here('./dist/index.html'), html);
console.log(`dist/index.html — ${(Buffer.byteLength(html) / 1024 / 1024).toFixed(2)} Mo, ${seen.size} images, ${all.length} avis`);
