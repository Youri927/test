// L'image de partage (web/og.jpg, 1200 × 630) : l'accueil du site en petit. La première phrase de l'avis de Scott D.,
// en pâle, avec « more than 5 stars. » à l'encre ; la cuisine aux tabourets bleus à droite ; le logo, le métier, le
// téléphone et la licence. Composée en HTML avec les polices, la photo et le logo du site.
//   node tools/og.mjs
import {createRequire} from 'node:module';
import {readFileSync, writeFileSync, rmSync} from 'node:fs';
import {resolve, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const {chromium} = createRequire(import.meta.url)('/opt/node-tools/node_modules/playwright');
const here = (p) => resolve(dirname(fileURLToPath(import.meta.url)), '..', p);
const logo = JSON.parse(readFileSync(here('data/logo.json'), 'utf8'));
const mark = `<svg class="mark" viewBox="0 0 ${logo.mark.w} ${logo.mark.h}"><path d="${logo.mark.navy}" fill="#2a5472" fill-rule="evenodd"/><path d="${logo.mark.olive}" fill="#909c42" fill-rule="evenodd"/></svg>`;
const word = `<svg class="word" viewBox="0 0 ${logo.word.w} ${logo.word.h}"><path d="${logo.word.d}" fill="#2a5472" fill-rule="evenodd"/></svg>`;
const font = (f) => `url("file://${here('vendor/fonts/' + f)}") format("woff2")`;
const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><style>
@font-face { font-family: "Imbue"; src: ${font('Imbue.woff2')}; font-weight: 150 500; }
@font-face { font-family: "Zalando Sans"; src: ${font('ZalandoSans.woff2')}; font-weight: 400 650; }
* { box-sizing: border-box; margin: 0; padding: 0; }
body { position: relative; width: 1200px; height: 630px; overflow: hidden; background: #fff; color: #2a5472; font-family: "Zalando Sans", sans-serif; }
.brand { position: absolute; left: 64px; top: 44px; display: flex; align-items: center; gap: 14px; }
.mark { width: 64px; height: auto; } .word { width: 196px; height: auto; }
.lead { position: absolute; left: 64px; top: 168px; width: 640px; }
.q { font: 290 82px/1.02 "Imbue"; font-optical-sizing: auto; color: #8494a4; }
.q .hang { margin-left: -.36em; }
.q mark { background: none; color: #2a5472; }
.by { margin-top: 22px; font: 550 19px/1.3 "Zalando Sans"; }
.k { position: absolute; left: 64px; bottom: 50px; font: 400 21px/1.35 "Zalando Sans"; }
.k b { display: block; font-weight: 600; font-size: 27px; margin-top: 6px; }
.ph { position: absolute; right: 0; top: 0; width: 420px; height: 630px; object-fit: cover; object-position: 50% 50%; }
</style></head><body>
<div class="brand">${mark}${word}</div>
<div class="lead"><p class="q"><span class="hang">“</span>Wish we could give Dominic <mark>more than 5 stars.</mark>”</p>
<p class="by">Scott D.</p></div>
<p class="k">General contractor in Naples, Florida. License CGC1531679.<b>Free estimates: 908-507-2088</b></p>
<img class="ph" src="file://${here('src/img/hero-800.avif')}" alt="">
</body></html>`;
const tmp = here('web/_og.html');
writeFileSync(tmp, html);
const b = await chromium.launch();
const p = await b.newPage({viewport: {width: 1200, height: 630}, deviceScaleFactor: 1});
await p.goto('file://' + tmp, {waitUntil: 'load'});
await p.evaluate(() => document.fonts.ready);
// rien ne sort de l'image ; le texte ne touche ni la photo, ni le logo, ni le bas
const fit = await p.evaluate(() => {
  const r = (s) => document.querySelector(s).getBoundingClientRect();
  const q = r('.q'), by = r('.by'), k = r('.k'), ph = r('.ph'), brand = r('.brand');
  const words = [...document.querySelectorAll('.q, .k')].map((e) => { const g = document.createRange(); g.selectNodeContents(e); return [...g.getClientRects()].reduce((m, x) => Math.max(m, x.right), 0); });
  return {inside: k.bottom <= 630 - 40 && q.top > brand.bottom + 30, apart: Math.max(...words) < ph.left - 32 && by.top >= q.bottom + 8 && k.top > by.bottom + 40};
});
await p.screenshot({path: here('web/og.jpg'), type: 'jpeg', quality: 88});
await b.close();
rmSync(tmp);
if (!fit.inside || !fit.apart) throw new Error(`image de partage : ${JSON.stringify(fit)}`);
console.log('web/og.jpg : tout dans l’image');
