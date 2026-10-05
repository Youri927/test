// Assemble un site monofichier (polices, styles, images, logo, carte, librairies et scripts intégrés) : dist/index.html
import {readFileSync, writeFileSync, mkdirSync} from 'node:fs';

const here = (p) => new URL(p, import.meta.url);
const read = (p) => readFileSync(here(p), 'utf8');
const b64 = (p) => readFileSync(here(p)).toString('base64');
const face = (file, family, {weight = '400', style = 'normal'} = {}) =>
  `@font-face{font-family:"${family}";src:url(data:font/woff2;base64,${b64(file)}) format("woff2");font-weight:${weight};font-style:${style};font-display:swap}`;

const fonts = [
  face('./vendor/fonts/FunnelDisplay.woff2', 'Funnel Display', {weight: '300 800'}),
  face('./vendor/fonts/FunnelSans.woff2', 'Funnel Sans', {weight: '300 800'}),
  face('./vendor/fonts/FunnelSans-Italic.woff2', 'Funnel Sans', {weight: '300 800', style: 'italic'}),
].join('\n');

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
  .replace(/src="img\/([\w-]+)\.webp"/g, (m, name) => {
    const n = (seen.get(name) || 0) + 1;
    seen.set(name, n);
    if (n > 1) return `src="${PIXEL}" data-dup="${name}"`;
    return `src="data:image/webp;base64,${b64(`./src/img/${name}.webp`)}" data-img="${name}"`;
  })
  .replace('<!--LOGO-->', () => read('./src/logo.svg'))
  .replace('<!--MAPBG-->', () => read('./src/map-bg.svg'))
  .replace('<!--MAP-->', () => read('./src/map.svg'))
  .replace('<!--STYLES-->', () => `<style>\n${css}\n</style>`)
  .replace('<!--SCRIPTS-->', () => `<script>${copy}</script>\n<script>\n${js}\n</script>`);

mkdirSync(here('./dist/'), {recursive: true});
writeFileSync(here('./dist/index.html'), html);
console.log(`dist/index.html — ${(Buffer.byteLength(html) / 1024 / 1024).toFixed(2)} Mo, ${seen.size} images`);
