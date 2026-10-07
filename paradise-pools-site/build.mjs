// Assemble un site monofichier (polices, styles, photos, carte, librairies et scripts intégrés) : dist/index.html
import {readFileSync, writeFileSync, mkdirSync} from 'node:fs';

const here = (p) => new URL(p, import.meta.url);
const read = (p) => readFileSync(here(p), 'utf8');
const b64 = (p) => readFileSync(here(p)).toString('base64');
const face = (file, family, weight) =>
  `@font-face{font-family:"${family}";src:url(data:font/woff2;base64,${b64(file)}) format("woff2");font-weight:${weight};font-style:normal;font-display:swap}`;
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Funnel Display et Funnel Sans, polices variables : graisse 300 à 800
const fonts = face('./vendor/fonts/FunnelDisplay.woff2', 'Funnel Display', '300 800') + face('./vendor/fonts/FunnelSans.woff2', 'Funnel Sans', '300 800');

const {photos} = JSON.parse(read('./data/photos.json'));
const sizes = JSON.parse(read('./src/img/sizes.json'));
const byName = Object.fromEntries(photos.map((p) => [p.name, p]));
if (photos.length !== 49) throw new Error(`49 photos attendues, ${photos.length} trouvées`);

// ---------- les six chantiers ----------
// label : « New pool » pour les deux chantiers montrés sur leur page New Pool Construction,
// « Remodel » pour celui des bannières de leur page Services (rénovation) ; sinon rien.
const WORK = [
  {job: 'a', label: 'New pool', title: 'Geometric pool, raised spa and a sun shelf', main: 'a-1', side: ['a-2', 'a-3'],
    facts: ['Raised spa wrapped in blue glass tile', 'Sun shelf with four loungers and bubblers', 'Gray paver deck, white fence, palms']},
  {job: 'b', label: 'New pool', title: 'Freeform pool with a glass tile waterfall', main: 'b-1', side: ['b-5', 'b-4'],
    facts: ['Sheer waterfall from a curved glass tile wall', 'Sun shelf with loungers and a handrail', 'Light pavers all the way to the porch']},
  {job: 'f', title: 'Freeform pool with a round raised spa', main: 'f-1', side: ['f-2', 'f-3'],
    facts: ['Round raised spa spilling into the pool', 'Shallow lounging area with in-pool tables', 'Brick pavers, golf course view']},
  {job: 'c', title: 'Screened pool with a waterfall wall', main: 'c-2', side: ['c-1', 'c-3'],
    facts: ['Sheer descents from a glass tile wall', 'Shallow lounging area', 'Under a screen enclosure, pond behind']},
  {job: 'e', title: 'A pool on the water', main: 'e-1', side: ['e-2', 'e-3'],
    facts: ['Light stone deck', 'Blue tile at the waterline', 'Docks and boats beyond the hedge']},
  {job: 'd', label: 'Remodel', title: 'A large pool under the palms', main: 'd-1', side: ['d-2', 'd-3'],
    facts: ['Entry steps outlined in blue tile', 'White deck all around', 'Raised river rock wall']},
];
const img = (name, attrs = '') => {
  const [w, h] = sizes[name];
  return `<img src="img/${name}.avif" alt="${esc(byName[name].alt)}" width="${w}" height="${h}" loading="lazy"${attrs}>`;
};
const work = WORK.map((j) => {
  const all = photos.filter((p) => p.job === j.job).map((p) => p.name);
  const list = [j.main, ...j.side, ...all.filter((n) => n !== j.main && !j.side.includes(n))];
  const at = (n) => list.indexOf(n);
  return `      <article class="job" data-job="${j.job}">
        <figure class="job__main">${img(j.main)}</figure>
        <div class="job__text">
          ${j.label ? `<p class="job__label">${j.label}</p>` : ''}
          <h3>${esc(j.title)}</h3>
          <ul>${j.facts.map((f) => `<li>${esc(f)}</li>`).join('')}</ul>
          <button type="button" class="link job__open" data-job-open="${list.join(' ')}">See all ${list.length} photos</button>
        </div>
        <div class="job__side">${j.side.map((n) => `<button type="button" data-job-open="${list.join(' ')}" data-start="${at(n)}" aria-label="Open photo: ${esc(byName[n].alt)}">${img(n, ' aria-hidden="true"')}</button>`).join('')}</div>
      </article>`;
}).join('\n');

// ---------- galerie ----------
const TAGS = [['all', 'All'], ['freeform', 'Freeform'], ['geometric', 'Geometric'], ['shelf', 'Sun shelf'], ['spa', 'Spa'],
  ['feature', 'Water features'], ['screen', 'Screened'], ['water', 'Waterfront']];
const count = (t) => (t === 'all' ? photos.length : photos.filter((p) => p.tags.includes(t)).length);
const chips = TAGS.map(([t, label]) => `      <button type="button" class="chip" data-tag="${t}" aria-pressed="${t === 'all'}">${label}<small>${count(t)}</small></button>`).join('\n');
// ordre de la galerie : on alterne les chantiers et les photos isolées pour que les premières lignes montrent de tout
const ORDER = ['canal', 'b-2', 'a-1', 'modern', 'f-1', 'c-1', 'e-1', 'd-1', 'b-1', 'screen-spa', 'raised', 'sheer',
  'a-2', 'b-5', 'stone-wall', 'c-2', 'screen-2', 'f-3', 'e-2', 'kidney', 'tile', 'deck-1', 'screen-shelf', 'b-3',
  'plan', 'eye', 'a-3', 'b-4', 'b-6', 'c-3', 'd-2', 'd-3', 'd-4', 'e-3', 'e-4', 'f-2', 'resurface', 'pads', 'deck-2',
  'lap', 'screen-1', 'screen-3', 'screen-4', 'screen-5', 'screen-6', 'brick', 'spa-step', 'spa-close', 'kidney-2'];
if (ORDER.length !== 49 || new Set(ORDER).size !== 49 || ORDER.some((n) => !byName[n])) throw new Error('ordre de la galerie incomplet');
const gallery = ORDER.map((n) => `    <button type="button" class="g" data-name="${n}" data-tags="${byName[n].tags.join(' ')}">${img(n)}</button>`).join('\n');

// ---------- assemblage ----------
const css = fonts + '\n' + read('./src/styles.css');
const js = [read('./vendor/gsap.min.js'), read('./vendor/ScrollTrigger.min.js'), read('./vendor/lenis.min.js'), read('./src/main.js')]
  .join('\n;\n').replace(/<\/script/gi, '<\\/script');

// dimensions réelles de chaque image, puis intégration : chaque image n'est intégrée qu'une fois,
// une image répétée reprend la source de la première
const seen = new Map();
const PIXEL = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
const copy = 'for(const i of document.querySelectorAll("img[data-dup]"))i.src=document.querySelector(`img[data-img="${i.dataset.dup}"]`).src;';
const MIME = {avif: 'image/avif', webp: 'image/webp'};
const html = read('./src/index.html')
  .replace('<!--WORK-->', () => work)
  .replace('<!--CHIPS-->', () => chips)
  .replace('<!--GALLERY-->', () => gallery)
  .replace('<!--MAP-->', () => read('./src/map.svg'))
  .replace(/<img src="img\/([\w-]+)\.(avif|webp)"([^>]*)>/g, (m, name, ext, rest) => {
    if (sizes[name] && !/data-hero/.test(rest)) rest = rest.replace(/width="\d+" height="\d+"/, `width="${sizes[name][0]}" height="${sizes[name][1]}"`);
    const n = (seen.get(name) || 0) + 1;
    seen.set(name, n);
    if (n > 1) return `<img src="${PIXEL}" data-dup="${name}"${rest}>`;
    return `<img src="data:${MIME[ext]};base64,${b64(`./src/img/${name}.${ext}`)}" data-img="${name}"${rest}>`;
  })
  .replace('<!--STYLES-->', () => `<style>\n${css}\n</style>`)
  .replace('<!--SCRIPTS-->', () => `<script>${copy}</script>\n<script>\n${js}\n</script>`);

if (/src="img\//.test(html)) throw new Error('image non intégrée : ' + html.match(/src="img\/[^"]+"/)[0]);
mkdirSync(here('./dist/'), {recursive: true});
writeFileSync(here('./dist/index.html'), html);
console.log(`dist/index.html — ${(Buffer.byteLength(html) / 1024 / 1024).toFixed(2)} Mo, ${seen.size} images`);
