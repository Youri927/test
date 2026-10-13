// L'image de partage (web/og.jpg, 1200 × 630) : l'accueil du site en petit. La photo de Lina dans le miroir, dans le
// cadre du logo, le titre en Archivo large, le logo et le lieu. Composée en HTML avec la police et les fichiers du site.
//   node tools/og.mjs
import {createRequire} from 'node:module';
import {readFileSync, writeFileSync, rmSync} from 'node:fs';
import {resolve} from 'node:path';
const {chromium} = createRequire(import.meta.url)('/opt/node-tools/node_modules/playwright');
const file = (p) => 'file://' + resolve(p);
const logo = readFileSync('src/logo-compact.svg', 'utf8');
const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><style>
@font-face { font-family: "Archivo"; src: url("${file('vendor/fonts/Archivo.woff2')}") format("woff2"); font-weight: 100 900; font-stretch: 62% 125%; }
* { box-sizing: border-box; margin: 0; }
body { position: relative; width: 1200px; height: 630px; overflow: hidden; background: #fff; color: #221a16; font-family: "Archivo", sans-serif; }
.shot { position: absolute; left: 58px; right: 58px; top: 46px; height: 322px; }
.shot img { width: 100%; height: 100%; display: block; object-fit: cover; object-position: 44% 56%; }
.frame { position: absolute; left: -13px; top: -13px; width: calc(100% + 26px); height: calc(100% + 26px); overflow: visible; fill: none; stroke: #c4a42c; stroke-width: 2.5px; }
.frame path { vector-effect: non-scaling-stroke; }
h1 { position: absolute; left: 44px; top: 398px; font-size: 89px; font-weight: 300; font-stretch: 125%; line-height: 1; letter-spacing: -0.01em; white-space: nowrap; }
.foot { position: absolute; left: 46px; right: 46px; bottom: 36px; display: flex; align-items: center; justify-content: space-between; }
.foot .logo { width: 200px; height: auto; color: #221a16; display: block; }
.foot p { font-size: 22px; color: #6b5f58; }
</style></head><body>
<div class="shot"><img src="${file('src/img/hero.avif')}" alt=""><svg class="frame" viewBox="0 0 100 100" preserveAspectRatio="none"><path d="M0 23.6V0H100V23.6M0 76.4V100H100V76.4"/></svg></div>
<h1>Come hide out with us.</h1>
<div class="foot">${logo}<p>Med spa in Fort Myers, Florida, since 2017</p></div>
</body></html>`;
const tmp = resolve('web/_og.html');
writeFileSync(tmp, html);
const b = await chromium.launch();
const p = await b.newPage({viewport: {width: 1200, height: 630}, deviceScaleFactor: 1});
await p.goto('file://' + tmp, {waitUntil: 'load'});
await p.evaluate(() => document.fonts.ready);
// le titre tient sur une ligne, dans les marges
const w = await p.$eval('h1', (h) => Math.round(h.getBoundingClientRect().right));
if (w > 1160) throw new Error(`le titre dépasse : ${w} px`);
await p.screenshot({path: 'web/og.jpg', type: 'jpeg', quality: 88});
await b.close();
rmSync(tmp);
console.log(`web/og.jpg : 1200 × 630 (titre jusqu'à ${w} px)`);
