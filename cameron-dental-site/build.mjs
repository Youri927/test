// Assemble un site monofichier (polices, styles, images, logo, mur des sourires, librairies et scripts intégrés) : dist/index.html
import {readFileSync, writeFileSync, mkdirSync} from 'node:fs';

const here = (p) => new URL(p, import.meta.url);
const read = (p) => readFileSync(here(p), 'utf8');
const b64 = (p) => readFileSync(here(p)).toString('base64');
const face = (file, family, {weight = '400', stretch = '100%', style = 'normal'} = {}) =>
  `@font-face{font-family:"${family}";src:url(data:font/woff2;base64,${b64(file)}) format("woff2");font-weight:${weight};font-stretch:${stretch};font-style:${style};font-display:swap}`;

const fonts = [
  face('./vendor/fonts/BricolageGrotesque.woff2', 'Bricolage Grotesque', {weight: '200 800', stretch: '75% 100%'}),
  face('./vendor/fonts/HankenGrotesk.woff2', 'Hanken Grotesk', {weight: '100 900'}),
  face('./vendor/fonts/HankenGrotesk-Italic.woff2', 'Hanken Grotesk', {weight: '100 900', style: 'italic'}),
].join('\n');

// les 18 cas de leur galerie (images préparées par tools/images.py) : les 12 premiers forment le mur de l'accueil
const CASES = 18;
const WALL = 12;
const nn = (i) => String(i + 1).padStart(2, '0');
const wall = Array.from({length: WALL}, (_, i) => `<li class="face"><button class="face__btn" type="button" data-open-case="${i}" aria-label="Smile ${i + 1}: see it before and after">`
  + `<img class="face__a" src="img/case${nn(i)}-fa.webp" alt="" width="480" height="600">`
  + `<img class="face__b" src="img/case${nn(i)}-fb.webp" alt="" width="480" height="600"></button></li>`).join('\n        ');
const cases = Array.from({length: CASES}, (_, i) => `<div data-case-i="${i}">`
  + ['fb', 'fa', 'cb', 'ca'].map((k) => `<img src="img/case${nn(i)}-${k}.webp" alt="" data-k="${k}" loading="lazy">`).join('') + '</div>').join('\n  ');

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
  .replace('<!--WALL-->', () => wall)
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
