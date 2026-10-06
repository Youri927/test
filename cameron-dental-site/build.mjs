// Assemble un site monofichier (polices, styles, images, logo, planche des cas, librairies et scripts intégrés) : dist/index.html
import {readFileSync, writeFileSync, mkdirSync} from 'node:fs';

const here = (p) => new URL(p, import.meta.url);
const read = (p) => readFileSync(here(p), 'utf8');
const b64 = (p) => readFileSync(here(p)).toString('base64');
const face = (file, family, {weight = '400', stretch = '100%', style = 'normal'} = {}) =>
  `@font-face{font-family:"${family}";src:url(data:font/woff2;base64,${b64(file)}) format("woff2");font-weight:${weight};font-stretch:${stretch};font-style:${style};font-display:swap}`;

const fonts = [
  face('./vendor/fonts/NotoSerifDisplay.woff2', 'Noto Serif Display', {weight: '100 900', stretch: '62.5% 100%'}),
  face('./vendor/fonts/NotoSerifDisplay-Italic.woff2', 'Noto Serif Display', {weight: '100 900', stretch: '62.5% 100%', style: 'italic'}),
  face('./vendor/fonts/InstrumentSans.woff2', 'Instrument Sans', {weight: '400 700', stretch: '75% 100%'}),
  face('./vendor/fonts/InstrumentSans-Italic.woff2', 'Instrument Sans', {weight: '400 700', stretch: '75% 100%', style: 'italic'}),
].join('\n');

// la planche-contact des 18 cas de leur galerie (images préparées par tools/images.py)
const CASES = 18;
const cases = Array.from({length: CASES}, (_, i) => {
  const n = String(i + 1).padStart(2, '0');
  const img = (k, cls, w, h) => `<img${cls} src="img/case${n}-${k}.webp" alt="" width="${w}" height="${h}" loading="lazy"`;
  return `<li class="shot"><button class="shot__btn" type="button" aria-haspopup="dialog" aria-label="Smile no. ${n}: see it up close">`
    + `<span class="shot__img">${img('fa', ' class="shot__a"', 480, 600)}>${img('fb', ' class="shot__b"', 480, 600)}></span>`
    + `<span class="shot__n"><b>${n}</b><span data-state>After</span></span></button>`
    + `${img('cb', '', 720, 460)} hidden data-cb>${img('ca', '', 720, 460)} hidden data-ca></li>`;
}).join('\n      ');

const css = read('./src/styles.css').replace('/*FONTS*/', () => fonts);
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
  .replace('<!--CASES-->', () => cases)
  .replace(/src="img\/([\w-]+)\.webp"/g, (m, name) => {
    const n = (seen.get(name) || 0) + 1;
    seen.set(name, n);
    if (n > 1) return `src="${PIXEL}" data-dup="${name}"`;
    return `src="data:image/webp;base64,${b64(`./src/img/${name}.webp`)}" data-img="${name}"`;
  })
  .replace('<!--LOGO-->', () => read('./src/logo.svg'))
  .replace('<!--STYLES-->', () => `<style>\n${css}\n</style>`)
  .replace('<!--SCRIPTS-->', () => `<script>${copy}</script>\n<script>\n${js}\n</script>`);

mkdirSync(here('./dist/'), {recursive: true});
writeFileSync(here('./dist/index.html'), html);
console.log(`dist/index.html — ${(Buffer.byteLength(html) / 1024 / 1024).toFixed(2)} Mo, ${seen.size} images`);
