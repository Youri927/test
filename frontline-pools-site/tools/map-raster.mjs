// Fige le fond de carte (src/map-bg.svg) en image WebP 2× (src/img/map-bg.webp) : une image se défile sans être redessinée.
// Usage : node tools/map-raster.mjs   (Playwright et Python/Pillow requis)
import {chromium} from '/opt/node-tools/node_modules/playwright/index.mjs';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const here = (p) => fileURLToPath(new URL(p, import.meta.url));
const b = await chromium.launch();
const p = await b.newPage({viewport: {width: 800, height: 859}, deviceScaleFactor: 2});
await p.goto('file://' + here('../src/map-bg.svg'));
await p.screenshot({path: here('../src/img/map-bg.png'), clip: {x: 0, y: 0, width: 800, height: 859}});
await b.close();
execFileSync('python3', ['-c', `from PIL import Image; im = Image.open(r'${here('../src/img/map-bg.png')}').convert('RGB'); im.save(r'${here('../src/img/map-bg.webp')}', 'WEBP', quality=88, method=6)`]);
execFileSync('rm', [here('../src/img/map-bg.png')]);
console.log('src/img/map-bg.webp');
