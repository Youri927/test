// L'image de partage (web/og.jpg, 1200 × 630) : le geste de l'accueil, arrêté à mi-course. L'esquisse de la salle de
// bain remplit la droite ; la salle de bain construite s'ouvre dans sa porte, dans un rectangle bordé de bleu, calée
// sur elle comme dans la scène (même axe de porte, même ligne du sol, même hauteur). À gauche, le logo, le titre, le
// métier, la ville, la licence et le téléphone. Composée en HTML avec les polices, les photos et le logo du site.
//   node tools/og.mjs
import {createRequire} from 'node:module';
import {readFileSync, writeFileSync, rmSync} from 'node:fs';
import {resolve, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {markSvg} from './mark.mjs';
const {chromium} = createRequire(import.meta.url)('/opt/node-tools/node_modules/playwright');
const here = (p) => resolve(dirname(fileURLToPath(import.meta.url)), '..', p);
const sizes = JSON.parse(readFileSync(here('data/photos.json'), 'utf8'));
// le cadre de la porte de chaque image, lu dans la page (data-door), en fractions de l'image
const src = readFileSync(here('src/index.html'), 'utf8');
const door = (name) => src.match(new RegExp(`data-img="${name}"[^>]*data-door="([^"]+)"`))[1].split(' ').map(Number);
const font = (f) => `url("file://${here('vendor/fonts/' + f)}") format("woff2")`;
const SKETCH = {file: 'st-1-1600', size: sizes['st-1-1600'], door: door('st-1')};
const BUILT = {file: 'st-3-1600', size: sizes['st-3-1600'], door: door('st-3')};
const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><style>
@font-face { font-family: "Mozilla Headline"; src: ${font('MozillaHeadline.woff2')}; font-weight: 400 700; font-stretch: 75% 100%; }
@font-face { font-family: "Mozilla Text"; src: ${font('MozillaText.woff2')}; font-weight: 400 600; }
* { box-sizing: border-box; margin: 0; padding: 0; }
body { position: relative; width: 1200px; height: 630px; overflow: hidden; background: #F4F6F7; color: #10233A; font-family: "Mozilla Text", sans-serif; }
.brand { position: absolute; left: 56px; top: 48px; display: flex; align-items: center; gap: 14px; }
.brand svg { width: 58px; height: auto; }
.brand span { font: 650 27px/1 "Mozilla Headline"; font-stretch: 84%; }
h1 { position: absolute; left: 56px; top: 178px; font: 640 86px/0.92 "Mozilla Headline"; font-stretch: 78%; letter-spacing: -0.012em; }
h1 span { display: block; }
.k { position: absolute; left: 56px; bottom: 52px; font: 400 21px/1.4 "Mozilla Text"; }
.k b { display: block; margin-top: 8px; font-weight: 600; font-size: 25px; }
.stage { position: absolute; right: 0; top: 0; width: 620px; height: 630px; overflow: hidden; }
.layer { position: absolute; inset: 0; overflow: hidden; }
.layer img { position: absolute; left: 0; top: 0; transform-origin: 0 0; max-width: none; }
.edge { position: absolute; z-index: 3; border: 3px solid #1BA2E6; }
</style></head><body>
<div class="brand">${markSvg()}<span>Boca Remodeling Group</span></div>
<h1><span>We draw it.</span><span>Then we build it.</span></h1>
<p class="k">Remodeling in Boca Raton, Florida.<br>Licensed general contractor CGC1539814.<b>Free quote: 561-247-2727</b></p>
<div class="stage">
  <div class="layer" id="s"><img src="file://${here(`src/img/${SKETCH.file}.avif`)}" alt=""></div>
  <div class="layer" id="p"><img src="file://${here(`src/img/${BUILT.file}.avif`)}" alt=""></div>
  <div class="edge"></div>
</div>
<script>
// les calculs de la scène de l'accueil (src/main.js), pour une image fixe
const W = 620, H = 630;
const mk = (o) => ({w: o.size[0], h: o.size[1], door: {x0: o.door[0] * o.size[0], y0: o.door[1] * o.size[1], x1: o.door[2] * o.size[0], y1: o.door[3] * o.size[1]}});
const S = mk(${JSON.stringify(SKETCH)}), P = mk(${JSON.stringify(BUILT)});
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const restOf = (L) => {
  const s = Math.max(W / L.w, H / L.h);
  return {s, tx: clamp(W / 2 - ((L.door.x0 + L.door.x1) / 2) * s, W - L.w * s, 0), ty: clamp(H * 0.46 - ((L.door.y0 + L.door.y1) / 2) * s, H - L.h * s, 0)};
};
const alignTo = (L, T, t) => {
  const s = (t.s * (T.door.y1 - T.door.y0)) / (L.door.y1 - L.door.y0);
  return {s, tx: t.tx + ((T.door.x0 + T.door.x1) / 2) * t.s - ((L.door.x0 + L.door.x1) / 2) * s, ty: t.ty + T.door.y1 * t.s - L.door.y1 * s};
};
const mix = (a, b, k) => ({s: lerp(a.s, b.s, k), tx: lerp(a.tx, b.tx, k), ty: lerp(a.ty, b.ty, k)});
const place = (id, t) => (document.querySelector('#' + id + ' img').style.transform = 'translate(' + t.tx + 'px,' + t.ty + 'px) scale(' + t.s + ')');
// l'esquisse au repos ; la photo, calée sur sa porte, a déjà un peu reculé ; son rectangle est à mi-course
const rS = restOf(S);
const K = ${0.5};
const pAt = mix(alignTo(P, S, rS), restOf(P), 0.35);
place('s', rS);
place('p', pAt);
const d = {x: pAt.tx + P.door.x0 * pAt.s, y: pAt.ty + P.door.y0 * pAt.s, w: (P.door.x1 - P.door.x0) * pAt.s, h: (P.door.y1 - P.door.y0) * pAt.s};
const r = {x: lerp(d.x, 0, K), y: lerp(d.y, 0, K), w: lerp(d.w, W, K), h: lerp(d.h, H, K)};
document.getElementById('p').style.clipPath = 'inset(' + r.y + 'px ' + (W - r.x - r.w) + 'px ' + (H - r.y - r.h) + 'px ' + r.x + 'px)';
Object.assign(document.querySelector('.edge').style, {left: r.x - 1.5 + 'px', top: r.y - 1.5 + 'px', width: r.w + 3 + 'px', height: r.h + 3 + 'px'});
</script>
</body></html>`;
const tmp = here('web/_og.html');
writeFileSync(tmp, html);
const b = await chromium.launch();
const p = await b.newPage({viewport: {width: 1200, height: 630}, deviceScaleFactor: 1});
await p.goto('file://' + tmp, {waitUntil: 'load'});
await p.evaluate(async () => {
  await document.fonts.ready;
  await Promise.all([...document.images].map((i) => i.decode()));
});
// rien ne sort de l'image ; le texte ne touche ni la scène, ni le logo, ni le bas
const fit = await p.evaluate(() => {
  const r = (s) => document.querySelector(s).getBoundingClientRect();
  const h1 = r('h1'), k = r('.k'), st = r('.stage'), brand = r('.brand');
  const right = [...document.querySelectorAll('h1 span, .k')].map((e) => {
    const g = document.createRange();
    g.selectNodeContents(e);
    return [...g.getClientRects()].reduce((m, x) => Math.max(m, x.right), 0);
  });
  return {inside: k.bottom <= 630 - 40 && h1.top > brand.bottom + 40, apart: Math.max(...right) < st.left - 28 && k.top > h1.bottom + 40, right: Math.round(Math.max(...right)), stage: Math.round(st.left)};
});
await p.screenshot({path: here('web/og.jpg'), type: 'jpeg', quality: 88});
await b.close();
rmSync(tmp);
if (!fit.inside || !fit.apart) throw new Error(`image de partage : ${JSON.stringify(fit)}`);
console.log('web/og.jpg : tout dans l’image', JSON.stringify(fit));
