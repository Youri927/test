// Le site actuel (tampadeckingandpools.com), capturé en entier, en 2×, pour la scène « Today ».
// Écrit public/before/desktop.jpg et public/before/desktop.json (positions des éléments cités par la vidéo).
// Usage : node capture/before.mjs
import {mkdirSync, writeFileSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';

const require = createRequire(import.meta.url);
const {chromium} = require(process.env.PLAYWRIGHT_MODULE || '/opt/node-tools/node_modules/playwright');
const out = resolve(dirname(fileURLToPath(import.meta.url)), '../public/before');
mkdirSync(out, {recursive: true});

const browser = await chromium.launch({args: ['--hide-scrollbars', '--force-color-profile=srgb']});
const page = await browser.newPage({viewport: {width: 1440, height: 900}, deviceScaleFactor: 2, locale: 'en-US'});
await page.goto('https://tampadeckingandpools.com/', {waitUntil: 'load', timeout: 90000});
// on descend doucement : les images différées et les apparitions d'Elementor se déclenchent
const h = await page.evaluate(() => document.documentElement.scrollHeight);
for (let y = 0; y < h; y += 300) { await page.evaluate((y) => window.scrollTo(0, y), y); await page.waitForTimeout(160); }
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(4000);

// positions (px CSS du document) : le code brut du formulaire, le titre, la photo d'accueil
const marks = await page.evaluate(() => {
  const found = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    if (!n.textContent.includes('[wpforms')) continue;
    const r = document.createRange();
    r.selectNodeContents(n);
    const b = r.getBoundingClientRect();
    // les versions tablette et mobile d'Elementor sont masquées (taille nulle)
    if (b.width > 0) found.push({x: b.left, y: b.top + scrollY, w: b.width, h: b.height, text: n.textContent.trim()});
  }
  const h1 = [...document.querySelectorAll('h1, h2')].find((e) => /Premier Pool/.test(e.textContent));
  const t = h1 ? h1.getBoundingClientRect() : null;
  return {wpforms: found, title: t && {x: t.left, y: t.top + scrollY, w: t.width, h: t.height}, height: document.documentElement.scrollHeight};
});
await page.screenshot({path: resolve(out, 'desktop.jpg'), fullPage: true, type: 'jpeg', quality: 88});
writeFileSync(resolve(out, 'desktop.json'), JSON.stringify({width: 1440, date: new Date().toISOString().slice(0, 10), ...marks}, null, 1));
console.log('✓ before/desktop.jpg', JSON.stringify(marks));
await browser.close();
