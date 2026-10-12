// L'image de partage (web/og.jpg, 1200 × 630) : le nom du cabinet, le titre de l'accueil et la façade, comme l'ouverture
// une fois posée. Composée en HTML avec les polices et la photo du site.
//   node tools/og.mjs
import {createRequire} from 'node:module';
import {writeFileSync, rmSync} from 'node:fs';
import {resolve} from 'node:path';
const {chromium} = createRequire(import.meta.url)('/opt/node-tools/node_modules/playwright');
const file = (p) => 'file://' + resolve(p);
const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><style>
@font-face { font-family: Commissioner; src: url("${file('vendor/fonts/Commissioner.woff2')}") format("woff2"); font-weight: 100 900; }
* { box-sizing: border-box; margin: 0; }
body { width: 1200px; height: 630px; overflow: hidden; background: #fff; color: #22348c; font-family: Commissioner, sans-serif; font-variation-settings: "FLAR" 0, "VOLM" 0; }
.mark { position: absolute; left: 56px; top: 44px; font-size: 25px; font-weight: 700; font-variant-caps: small-caps; letter-spacing: 0.02em; font-variation-settings: "FLAR" 100, "VOLM" 0; }
h1 { position: absolute; left: 54px; top: 104px; font-size: 59px; font-weight: 500; line-height: 1.02; letter-spacing: -0.035em; }
h1 span { display: block; }
.band { position: absolute; left: 0; bottom: 0; width: 1200px; height: 350px; object-fit: cover; }
</style></head><body>
<p class="mark">Castor Dental Associates</p>
<h1><span>Most dentistry looks like dentistry.</span><span>Ours is meant to go unnoticed.</span></h1>
<img class="band" src="${file('src/img/facade.avif')}" alt="">
</body></html>`;
const tmp = resolve('web/_og.html');
writeFileSync(tmp, html);
const b = await chromium.launch();
const p = await b.newPage({viewport: {width: 1200, height: 630}, deviceScaleFactor: 1});
await p.goto('file://' + tmp, {waitUntil: 'load'});
await p.evaluate(() => document.fonts.ready);
await p.screenshot({path: 'web/og.jpg', type: 'jpeg', quality: 88});
await b.close();
rmSync(tmp);
console.log('web/og.jpg : 1200 × 630');
