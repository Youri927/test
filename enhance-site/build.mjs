// Assemble un site monofichier (polices, styles, librairies et scripts intégrés) : dist/index.html
import {readFileSync, writeFileSync, mkdirSync} from 'node:fs';

const here = (p) => new URL(p, import.meta.url);
const read = (p) => readFileSync(here(p), 'utf8');
const face = (file, family, {weight = '100 900', stretch = '100%', style = 'normal'} = {}) =>
  `@font-face{font-family:"${family}";src:url(data:font/woff2;base64,${readFileSync(here(file)).toString('base64')}) format("woff2");font-weight:${weight};font-stretch:${stretch};font-style:${style};font-display:swap}`;

const fonts = [
  face('./vendor/fonts/Anybody.woff2', 'Anybody', {stretch: '50% 150%'}),
  face('./vendor/fonts/Newsreader.woff2', 'Newsreader', {weight: '200 800'}),
  face('./vendor/fonts/Newsreader-Italic.woff2', 'Newsreader', {weight: '200 800', style: 'italic'}),
].join('\n');

const css = read('./src/styles.css').replace('/*FONTS*/', () => fonts);
const js = [
  read('./vendor/gsap.min.js'),
  read('./vendor/ScrollTrigger.min.js'),
  read('./vendor/lenis.min.js'),
  read('./src/art.js'),
  read('./src/main.js'),
].join('\n;\n').replace(/<\/script/gi, '<\\/script');

const html = read('./src/index.html')
  .replace('<!--STYLES-->', () => `<style>\n${css}\n</style>`)
  .replace('<!--SCRIPTS-->', () => `<script>\n${js}\n</script>`);

mkdirSync(here('./dist/'), {recursive: true});
writeFileSync(here('./dist/index.html'), html);
console.log(`dist/index.html — ${(Buffer.byteLength(html) / 1024).toFixed(0)} Ko`);
