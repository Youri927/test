// Images fixes de la page, rendues une fois pour toutes avec le moteur d'eau (tools/water.js).
// La page n'a donc rien à calculer : elle affiche des images et les enchaîne en CSS.
//   node tools/stills.mjs            → src/img/{hero-*,fin-*,proc-*}.webp
//   node tools/stills.mjs fin-quartz → seulement cette image
import {execFileSync} from 'node:child_process';
import {mkdirSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';

const require = createRequire(import.meta.url);
const {chromium} = require(process.env.PLAYWRIGHT_MODULE || '/opt/node-tools/node_modules/playwright');
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const tmp = resolve(root, 'tools/.stills');
mkdirSync(tmp, {recursive: true});

// teintes de l'eau selon le fond (même réglage que l'ancien rendu en direct)
const LOOK = {
  'plaster': {deep: '#0b5566', trans: [0.27, 0.79, 0.89]},
  'quartz': {deep: '#0a4f60', trans: [0.26, 0.77, 0.88]},
  'diamond-brite': {deep: '#0a4a62', trans: [0.24, 0.71, 0.87]},
  'pebble-fina': {deep: '#0b4652', trans: [0.3, 0.72, 0.8]},
  'pebble-tec': {deep: '#073a4c', trans: [0.22, 0.62, 0.78]},
  'pebble-sheen': {deep: '#083e50', trans: [0.24, 0.66, 0.8]},
  'hydrazzo': {deep: '#0a4a64', trans: [0.24, 0.72, 0.9]},
  'beadcrete': {deep: '#08465e', trans: [0.24, 0.72, 0.9]},
  'glass-tile': {deep: '#0a4a60', trans: [0.22, 0.7, 0.86], size: 1.5},
  'worn': {deep: '#2c5047', trans: [0.46, 0.66, 0.55], size: 3.4},
  'stripped': {size: 1.4},
};
const tex = (...names) => names.map((n) => ({name: n, file: n.startsWith('fin') ? n : n === 'worn' || n === 'stripped' ? n : 'fin-' + n, look: LOOK[n.replace(/^fin-/, '')]}));

// accueil : le même bassin avant / après, même surface, même instant
const HERO = {w: 1100, h: 1375, t: 6.4, opts: {scale: 1, tile: 330, depth: 1500, focus: 2.8, lam: [80, 240], amb: 0.34, sun: 0.8, seed: 7, blur: 1.1, grain: 0.008}};
const FIN = {w: 1400, h: 1120, t: 3.2, opts: {scale: 1, tile: 820, depth: 1100, focus: 3, seed: 3, wind: 0.9, spread: 4.2, blur: 0.5, tint: 0.62, view: 0.25, grain: 0.008}};
const PROC = {w: 1100, h: 1100, t: 5.1, opts: {scale: 1, tile: 420, depth: 1300, focus: 3.2, seed: 5, wind: 2.2, blur: 1.1, grain: 0.008}};

const SCENES = {
  // l'ancien fond se lit à travers une eau plus fine : moins de flou, moins de teinte
  'hero-before': {...HERO, opts: {...HERO.opts, blur: 0.35, tint: 0.72}, tex: tex('worn'), state: {a: 'worn', level: 1, clear: 1}},
  'hero-after': {...HERO, tex: tex('quartz'), state: {a: 'quartz', level: 1, clear: 1}},
  ...Object.fromEntries(Object.keys(LOOK).filter((k) => k !== 'worn' && k !== 'stripped').map((k) => ['fin-' + k, {...FIN, tex: tex(k), state: {a: k, level: 1}}])),
  'proc-old': {...PROC, opts: {...PROC.opts, blur: 0.35, tint: 0.72}, tex: tex('worn'), state: {a: 'worn', level: 1, clear: 1}},
  'proc-drained': {...PROC, tex: tex('worn'), state: {a: 'worn', level: 0}},
  'proc-stripped': {...PROC, tex: tex('stripped'), state: {a: 'stripped', level: 0}},
  'proc-finish': {...PROC, tex: tex('diamond-brite'), state: {a: 'diamond-brite', level: 0}},
  'proc-cloudy': {...PROC, tex: tex('diamond-brite'), state: {a: 'diamond-brite', level: 1, clear: 0.55}},
  'proc-clear': {...PROC, tex: tex('diamond-brite'), state: {a: 'diamond-brite', level: 1, clear: 1}},
};

const only = process.argv.slice(2);
const browser = await chromium.launch({args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--allow-file-access-from-files']});
for (const [name, s] of Object.entries(SCENES)) {
  if (only.length && !only.includes(name)) continue;
  const page = await browser.newPage({viewport: {width: s.w, height: s.h}});
  await page.goto('file://' + resolve(root, 'tools/stills.html') + '#' + encodeURIComponent(JSON.stringify(s)));
  await page.waitForFunction(() => document.title === 'ready', null, {timeout: 60000});
  const png = resolve(tmp, name + '.png');
  await page.screenshot({path: png});
  await page.close();
  const out = resolve(root, 'src/img', name + '.webp');
  execFileSync('python3', ['-c', `from PIL import Image; Image.open('${png}').convert('RGB').save('${out}', 'WEBP', quality=${name.startsWith('hero') ? 80 : 76}, method=6)`]);
  console.log('✓', name);
}
await browser.close();

// pastilles du sélecteur : la matière sèche, en petit (plus lisible que sous l'eau)
if (!only.length || only.includes('chips')) {
  execFileSync('python3', ['-c', `
from PIL import Image
for k in ${JSON.stringify(Object.keys(LOOK).filter((k) => k !== 'worn' && k !== 'stripped'))}:
    Image.open('${root}/textures/fin-' + k + '.webp').convert('RGB').resize((224, 224), Image.LANCZOS).save('${root}/src/img/chip-' + k + '.webp', 'WEBP', quality=80, method=6)
`]);
  console.log('✓ chips');
}
