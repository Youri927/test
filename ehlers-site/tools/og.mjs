// L'image de partage (web/og.jpg, 1200 × 630) : l'accueil du site en petit. Le séjour de Park Shore sur la baie, le
// titre en Host Grotesk, le nom et la licence. Composée en HTML avec la police et la
// photo du site.
//   node tools/og.mjs
import {createRequire} from 'node:module';
import {writeFileSync, rmSync} from 'node:fs';
import {resolve} from 'node:path';
const {chromium} = createRequire(import.meta.url)('/opt/node-tools/node_modules/playwright');
const file = (p) => 'file://' + resolve(p);
const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><style>
@font-face { font-family: "Host Grotesk"; src: url("${file('vendor/fonts/HostGrotesk.woff2')}") format("woff2"); font-weight: 300 800; }
* { box-sizing: border-box; margin: 0; }
body { position: relative; width: 1200px; height: 630px; overflow: hidden; background: #fff; color: #12333a; font-family: "Host Grotesk", sans-serif; }
.shot { position: absolute; left: 48px; right: 48px; top: 44px; height: 330px; overflow: hidden; }
.shot img { width: 100%; height: 100%; display: block; object-fit: cover; object-position: 50% 40%; }
h1 { position: absolute; left: 46px; top: 404px; font-size: 56px; font-weight: 560; line-height: 1.02; letter-spacing: -0.035em; }
.foot { position: absolute; left: 48px; right: 48px; bottom: 34px; display: flex; align-items: baseline; justify-content: space-between; }
.foot .name { font-weight: 640; font-size: 30px; letter-spacing: -0.045em; color: #12333a; }
.foot .name small { margin-left: 10px; font-weight: 400; font-size: 16px; letter-spacing: 0; color: #4d6168; }
.foot p { font-size: 18px; color: #4d6168; }
</style></head><body>
<div class="shot"><img src="${file('src/img/hero.avif')}" alt=""></div>
<h1>Kitchens, baths and whole homes,<br>remodeled in Naples.</h1>
<div class="foot"><p class="name">Ehlers<small>Contracting Services, Inc.</small></p><p>Certified Building Contractor CBC1250125</p></div>
</body></html>`;
const tmp = resolve('web/_og.html');
writeFileSync(tmp, html);
const b = await chromium.launch();
const p = await b.newPage({viewport: {width: 1200, height: 630}, deviceScaleFactor: 1});
await p.goto('file://' + tmp, {waitUntil: 'load'});
await p.evaluate(() => document.fonts.ready);
// le titre et le pied tiennent dans les marges
const w = await p.$eval('h1', (h) => Math.round(h.getBoundingClientRect().right));
if (w > 1152) throw new Error(`le titre dépasse : ${w} px`);
await p.screenshot({path: 'web/og.jpg', type: 'jpeg', quality: 88});
await b.close();
rmSync(tmp);
console.log(`web/og.jpg : 1200 × 630 (titre jusqu'à ${w} px)`);
