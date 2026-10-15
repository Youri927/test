// L'image de partage (web/og.jpg, 1200 × 630) : l'accueil du site en petit. « Roofing is in our blood » sur les deux
// pentes du toit, l'étoile du logo au faîte, le titre sous le toit ; le logo et le téléphone en bas.
// Composée en HTML avec la police et le logo du site.
//   node tools/og.mjs
import {createRequire} from 'node:module';
import {readFileSync, writeFileSync, rmSync} from 'node:fs';
import {resolve} from 'node:path';
const {chromium} = createRequire(import.meta.url)('/opt/node-tools/node_modules/playwright');
const logo = JSON.parse(readFileSync(resolve('data/logo.json'), 'utf8'));
const GOLD = '#C3A046';
const mark = (ink, bg) =>
  `<path d="${logo.mark.roof}" fill="${ink}" fill-rule="evenodd"/><path d="${logo.mark.bar}" fill="${GOLD}"/>` +
  `<path d="${logo.mark.right}" fill="${ink}" fill-rule="evenodd"/><path d="${logo.mark.left}" fill="${GOLD}" fill-rule="evenodd"/>` +
  `<path d="${logo.mark.five}" fill="${GOLD}" stroke="${bg}" stroke-width="2.2" paint-order="stroke" stroke-linejoin="round"/>`;
const w = logo.word;
const lockup =
  `<svg class="logo" viewBox="0 6 ${+(114 + w.w).toFixed(1)} 88">${mark('#1C1E21', '#F4F5F2')}` +
  `<g transform="translate(114 ${+(50 - w.h / 2).toFixed(2)})"><path d="${w.five}" fill="#1C1E21"/><path d="${w.points}" fill="${GOLD}"/><path d="${w.roofing}" fill="#1C1E21"/></g></svg>`;
const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><style>
@font-face { font-family: "Saira"; src: url("file://${resolve('vendor/fonts/Saira.woff2')}") format("woff2"); font-weight: 400 800; font-stretch: 62.5% 125%; }
* { box-sizing: border-box; margin: 0; }
body { position: relative; width: 1200px; height: 630px; overflow: hidden; background: #F4F5F2; color: #1C1E21; font-family: "Saira", sans-serif; }
.gable { position: absolute; left: 70px; top: 26px; width: 1060px; }
.gable svg { display: block; width: 100%; height: auto; overflow: visible; }
.line { fill: none; stroke: ${GOLD}; stroke-width: 9; }
.word { font-family: "Saira"; font-size: 119px; font-weight: 800; font-stretch: 62.5%; fill: #1C1E21; }
h1 { position: absolute; left: 50%; top: 318px; width: 700px; transform: translateX(-50%); text-align: center;
  font: 760 46px/1.02 "Saira"; font-stretch: 70%; letter-spacing: -0.004em; }
.logo { position: absolute; left: 60px; bottom: 44px; height: 58px; width: auto; }
.tel { position: absolute; right: 60px; bottom: 46px; text-align: right; }
.tel b { display: block; font: 800 50px/1 "Saira"; font-stretch: 62.5%; letter-spacing: 0.01em; }
.tel span { display: block; margin-top: 5px; font: 500 17px/1.2 "Saira"; color: #596068; }
</style></head><body>
<div class="gable"><svg viewBox="0 0 1200 440">
  <defs><path id="l" d="M58 395 L548 150"/><path id="r" d="M652 150 L1142 395"/></defs>
  <path class="line" d="M40 430 L600 150"/><path class="line" d="M1160 430 L600 150"/>
  <text class="word"><textPath href="#l" startOffset="50%" text-anchor="middle">ROOFING IS IN</textPath></text>
  <text class="word"><textPath href="#r" startOffset="50%" text-anchor="middle">OUR BLOOD.</textPath></text>
  <g transform="translate(538 14) scale(1.24)">${mark('#1C1E21', '#F4F5F2')}</g>
</svg></div>
<h1>Roofs for homes, mobile homes and businesses across Polk&nbsp;County.</h1>
${lockup}
<p class="tel"><b>863-660-5834</b><span>Lakeland, Florida</span><span>Florida license CCC1333259</span></p>
</body></html>`;
const tmp = resolve('web/_og.html');
writeFileSync(tmp, html);
const b = await chromium.launch();
const p = await b.newPage({viewport: {width: 1200, height: 630}, deviceScaleFactor: 1});
await p.goto('file://' + tmp, {waitUntil: 'load'});
await p.evaluate(() => document.fonts.ready);
// le titre sous le toit, sans toucher les rampants ; rien ne sort de l'image
const fit = await p.evaluate(() => {
  const svg = document.querySelector('.gable svg');
  const inv = svg.getScreenCTM().inverse();
  const r = document.createRange();
  r.selectNodeContents(document.querySelector('h1'));
  const rake = (x) => (x <= 600 ? 430 - (x - 40) * 0.5 : 430 - (1160 - x) * 0.5);
  const lines = [...r.getClientRects()].map((q) => [new DOMPoint(q.left, q.top).matrixTransform(inv), new DOMPoint(q.right, q.top).matrixTransform(inv)]);
  const words = [...document.querySelectorAll('.word')].map((t) => t.getBoundingClientRect());
  return {under: lines.every(([a, c]) => a.y > rake(a.x) + 4 && c.y > rake(c.x) + 4), inside: words.every((q) => q.left >= 0 && q.right <= 1200 && q.top >= 0)};
});
await p.screenshot({path: resolve('web/og.jpg'), type: 'jpeg', quality: 88});
await b.close();
rmSync(tmp);
if (!fit.under || !fit.inside) throw new Error(`image de partage : le titre touche le toit (${fit.under}) ou les mots sortent (${fit.inside})`);
console.log('web/og.jpg : titre sous le toit, mots dans l’image');
