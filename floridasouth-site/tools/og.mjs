// L'image de partage (web/og.jpg, 1200 × 630) : l'accueil du site en petit. Le ciel de leur photo, la liste barrée,
// « Consider it done. », les débords blancs qui montent du bas ; l'emblème, le nom et le téléphone sur le ciel.
// Composée en HTML avec les polices, la photo et l'emblème du site.
//   node tools/og.mjs
import {createRequire} from 'node:module';
import {readFileSync, writeFileSync, rmSync} from 'node:fs';
import {resolve} from 'node:path';
const {chromium} = createRequire(import.meta.url)('/opt/node-tools/node_modules/playwright');
const logo = JSON.parse(readFileSync(resolve('data/logo.json'), 'utf8'));
const css = readFileSync(resolve('src/styles.css'), 'utf8');
const sky = css.match(/--sky-grad: (linear-gradient\([^;]+\));/)[1];
const emblem = `<svg class="emblem" viewBox="0 0 ${logo.w} ${logo.h}"><path d="${logo.ringBold}" fill="#fff" fill-rule="evenodd"/><path d="${logo.landBold}" fill="#fff" fill-rule="evenodd"/></svg>`;
const font = (f) => `url("file://${resolve('vendor/fonts/' + f)}") format("woff2")`;
const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><style>
@font-face { font-family: "Gloock"; src: ${font('Gloock.woff2')}; }
@font-face { font-family: "Albert Sans"; src: ${font('AlbertSans.woff2')}; font-weight: 400 700; }
* { box-sizing: border-box; margin: 0; padding: 0; }
body { position: relative; width: 1200px; height: 630px; overflow: hidden; background: #2e5ab2 ${sky}; color: #fff; font-family: "Albert Sans", sans-serif; }
.photo { position: absolute; left: 0; top: 318px; width: 1200px; height: 800px; object-fit: cover; object-position: 50% 0;
  -webkit-mask-image: linear-gradient(to bottom, transparent 0, #000 9%); }
.words { position: absolute; left: 64px; top: 46px; }
.ask { font: 600 19px/1.2 "Albert Sans"; color: rgba(255,255,255,.86); margin-bottom: 10px; }
ul { list-style: none; font-family: "Gloock"; line-height: 1.12; }
li span { --th: max(1.5px, .056em); color: rgba(255,255,255,.7);
  background: linear-gradient(#fff, #fff) no-repeat 0 calc(.721em - var(--th) / 2) / 100% var(--th); }
li:nth-child(1) { font-size: 21px; } li:nth-child(2) { font-size: 25px; } li:nth-child(3) { font-size: 30px; }
li:nth-child(4) { font-size: 36px; } li:nth-child(5) { font-size: 43px; }
.done { margin-top: 8px; font: 400 92px/0.98 "Gloock"; letter-spacing: -0.02em; }
.sign { position: absolute; right: 64px; bottom: 54px; display: flex; align-items: flex-end; gap: 20px; text-align: right; }
.emblem { width: 104px; height: auto; flex: none; }
.name { font: 400 33px/1.05 "Gloock"; }
.name small { display: block; margin-top: 4px; font: 500 15px/1 "Albert Sans"; letter-spacing: .04em; opacity: .86; }
.tel { margin-top: 14px; font: 600 25px/1 "Albert Sans"; }
.lic { margin-top: 8px; font: 400 16px/1.3 "Albert Sans"; color: rgba(255,255,255,.86); }
</style></head><body>
<img class="photo" src="file://${resolve('src/img/hero-1600.avif')}" alt="">
<div class="words">
  <p class="ask">Give us your list.</p>
  <ul><li><span>Patch the hole in the wall.</span></li><li><span>Replace the light fixtures.</span></li><li><span>Remodel the kitchen.</span></li><li><span>Add a sunroom.</span></li><li><span>Build the house.</span></li></ul>
  <p class="done">Consider it done.</p>
</div>
<div class="sign">
  <div><p class="name">Florida South<small>Construction</small></p><p class="tel">(239) 449-4477</p><p class="lic">Naples, Florida. License CGC1515532</p></div>
  ${emblem}
</div>
</body></html>`;
const tmp = resolve('web/_og.html');
writeFileSync(tmp, html);
const b = await chromium.launch();
const p = await b.newPage({viewport: {width: 1200, height: 630}, deviceScaleFactor: 1});
await p.goto('file://' + tmp, {waitUntil: 'load'});
await p.evaluate(() => document.fonts.ready);
// rien ne sort de l'image ; la phrase ne touche pas le bloc du nom
const fit = await p.evaluate(() => {
  const r = (s) => document.querySelector(s).getBoundingClientRect();
  const done = r('.done'), sign = r('.sign'), words = r('.words');
  return {inside: words.right <= 1200 && sign.left >= 0 && sign.bottom <= 630, apart: done.right < sign.left || done.bottom < sign.top};
});
await p.screenshot({path: resolve('web/og.jpg'), type: 'jpeg', quality: 88});
await b.close();
rmSync(tmp);
if (!fit.inside || !fit.apart) throw new Error(`image de partage : ${JSON.stringify(fit)}`);
console.log('web/og.jpg : tout dans l’image');
