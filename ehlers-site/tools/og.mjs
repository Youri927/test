// L'image de partage (web/og.jpg, 1200 × 630) : l'accueil du site en petit. Le séjour de Park Shore sur la baie, un
// repère comme sur l'accueil, le titre en Host Grotesk, le nom et la licence. Composée en HTML avec la police et la
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
.pin { position: absolute; width: 0; height: 0; }
.pin b { position: absolute; left: -15px; top: -15px; display: grid; place-items: center; width: 30px; height: 30px; border-radius: 50%; background: #12333a; color: #fff; font-weight: 600; font-size: 14px; box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.88); }
.pin span { position: absolute; right: 32px; top: 0; transform: translateY(-50%); padding: 7px 12px 8px; background: #fff; font-weight: 500; font-size: 17px; line-height: 1.2; white-space: nowrap; }
h1 { position: absolute; left: 46px; top: 404px; font-size: 56px; font-weight: 560; line-height: 1.02; letter-spacing: -0.035em; }
.foot { position: absolute; left: 48px; right: 48px; bottom: 34px; display: flex; align-items: baseline; justify-content: space-between; }
.foot .name { font-weight: 640; font-size: 30px; letter-spacing: -0.045em; color: #12333a; }
.foot .name small { margin-left: 10px; font-weight: 400; font-size: 16px; letter-spacing: 0; color: #4d6168; }
.foot p { font-size: 18px; color: #4d6168; }
</style></head><body>
<div class="shot"><img src="${file('src/img/hero.avif')}" alt=""><div class="pin" data-x="0.755" data-y="0.45"><b>1</b><span>Sliding glass doors to the bay</span></div></div>
<h1>Kitchens, baths and whole homes,<br>remodeled in Naples.</h1>
<div class="foot"><p class="name">Ehlers<small>Contracting Services, Inc.</small></p><p>Certified Building Contractor CBC1250125</p></div>
</body></html>`;
const tmp = resolve('web/_og.html');
writeFileSync(tmp, html);
const b = await chromium.launch();
const p = await b.newPage({viewport: {width: 1200, height: 630}, deviceScaleFactor: 1});
await p.goto('file://' + tmp, {waitUntil: 'load'});
await p.evaluate(() => document.fonts.ready);
// le repère posé sur la photo comme sur le site : même cadrage (object-position 50 % 40 %)
const pin = await p.evaluate(() => {
  const img = document.querySelector('.shot img');
  const box = document.querySelector('.shot');
  const pin = document.querySelector('.pin');
  const [iw, ih, W, H] = [img.naturalWidth, img.naturalHeight, box.clientWidth, box.clientHeight];
  const s = Math.max(W / iw, H / ih);
  const x = (W - iw * s) * 0.5 + iw * s * +pin.dataset.x;
  const y = (H - ih * s) * 0.4 + ih * s * +pin.dataset.y;
  pin.style.left = `${x}px`;
  pin.style.top = `${y}px`;
  const l = pin.querySelector('span').getBoundingClientRect();
  return {x: Math.round(x), y: Math.round(y), labelLeft: Math.round(l.left)};
});
// le titre et le pied tiennent dans les marges
const w = await p.$eval('h1', (h) => Math.round(h.getBoundingClientRect().right));
if (w > 1152 || pin.labelLeft < 60 || pin.y < 20 || pin.y > 310) throw new Error(`mise en page : titre ${w} px, repère ${JSON.stringify(pin)}`);
await p.screenshot({path: 'web/og.jpg', type: 'jpeg', quality: 88});
await b.close();
rmSync(tmp);
console.log(`web/og.jpg : 1200 × 630 (titre jusqu'à ${w} px, repère à ${pin.x}, ${pin.y})`);
