// Assemble un site monofichier (polices, styles, images, librairies et scripts intégrés) : dist/index.html
import {readFileSync, writeFileSync, mkdirSync} from 'node:fs';

const here = (p) => new URL(p, import.meta.url);
const read = (p) => readFileSync(here(p), 'utf8');
const b64 = (p) => readFileSync(here(p)).toString('base64');
const face = (file, family, {weight = '400', style = 'normal', stretch = '100%'} = {}) =>
  `@font-face{font-family:"${family}";src:url(data:font/woff2;base64,${b64(file)}) format("woff2");font-weight:${weight};font-stretch:${stretch};font-style:${style};font-display:swap}`;

const fonts = [
  face('./vendor/fonts/BricolageGrotesque.woff2', 'Bricolage Grotesque', {weight: '200 800', stretch: '75% 100%'}),
  face('./vendor/fonts/DMMono-400.woff2', 'DM Mono'),
  face('./vendor/fonts/DMMono-500.woff2', 'DM Mono', {weight: '500'}),
].join('\n');

const css = read('./src/styles.css').replace('/*FONTS*/', () => fonts);
const js = [
  read('./vendor/gsap.min.js'),
  read('./vendor/ScrollTrigger.min.js'),
  read('./vendor/lenis.min.js'),
  read('./src/water.js'),
  read('./src/main.js'),
].join('\n;\n').replace(/<\/script/gi, '<\\/script');

// chaque image n'est intégrée qu'une fois : une image répétée reprend la source de la première
const seen = new Map();
const PIXEL = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
const copy = 'for(const i of document.querySelectorAll("img[data-dup]"))i.src=document.querySelector(`img[data-img="${i.dataset.dup}"]`).src;';
const html = read('./src/index.html')
  .replace(/(src|href)="img\/([\w-]+)\.webp"/g, (m, attr, name) => {
    const n = (seen.get(name) || 0) + 1;
    seen.set(name, n);
    if (n > 1) return `src="${PIXEL}" data-dup="${name}"`;
    return `${attr}="data:image/webp;base64,${b64(`./src/img/${name}.webp`)}"${attr === 'src' ? ` data-img="${name}"` : ''}`;
  })
  .replace('<!--STYLES-->', () => `<style>\n${css}\n</style>`)
  .replace('<!--SCRIPTS-->', () => `<script>${copy}</script>\n<script>\n${js}\n</script>`);

mkdirSync(here('./dist/'), {recursive: true});
writeFileSync(here('./dist/index.html'), html);
console.log(`dist/index.html — ${(Buffer.byteLength(html) / 1024 / 1024).toFixed(2)} Mo, ${seen.size} images`);
