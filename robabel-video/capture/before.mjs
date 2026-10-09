// Le site actuel (custompoolsbyrobabel.com), capturé en 2× pour la scène « Today » : la galerie, page entière,
// cookies acceptés (bandeau retiré), comme pour un visiteur qui a déjà accepté.
// Écrit public/before/gallery.jpg et public/before/marks.json (positions des légendes, px CSS du document).
// Usage : node capture/before.mjs
import {mkdirSync, writeFileSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';

const require = createRequire(import.meta.url);
const {chromium} = require(process.env.PLAYWRIGHT_MODULE || '/opt/node-tools/node_modules/playwright');
const out = resolve(dirname(fileURLToPath(import.meta.url)), '../public/before');
mkdirSync(out, {recursive: true});

const SITE = 'https://custompoolsbyrobabel.com';

// le mandataire réseau du conteneur refuse parfois HTTP/2 : HTTP/1.1, et quelques nouvelles tentatives
const browser = await chromium.launch({args: ['--hide-scrollbars', '--force-color-profile=srgb', '--disable-http2']});
const context = await browser.newContext({viewport: {width: 1440, height: 900}, deviceScaleFactor: 2, locale: 'en-US'});
const page = await context.newPage();
const marks = {date: new Date().toISOString().slice(0, 10), width: 1440};

const open = async (path) => {
  for (let k = 0; k < 6; k++) {
    try {
      await page.goto(SITE + path, {waitUntil: 'load', timeout: 90000});
      await page.waitForTimeout(2500);
      return;
    } catch (e) {
      console.log('  nouvelle tentative', path, e.message.split('\n')[0]);
    }
    await page.waitForTimeout(3000 * (k + 1));
  }
  throw new Error('page inaccessible : ' + path);
};

const imagesReady = () =>
  page.evaluate(() => [...document.images].filter((i) => i.getBoundingClientRect().width > 4).every((i) => i.complete && i.naturalWidth > 0));

// on descend doucement : les images différées et les apparitions du thème se déclenchent ; on attend qu'elles soient toutes là
const wake = async () => {
  const h = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < h; y += 300) { await page.evaluate((y) => window.scrollTo(0, y), y); await page.waitForTimeout(220); }
  for (let k = 0; k < 50 && !(await imagesReady()); k++) await page.waitForTimeout(400);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(2500);
  return imagesReady();
};

await open('/gallery/');
// cookies acceptés : le bandeau disparaît
await page.evaluate(() => {
  const b = [...document.querySelectorAll('a, button')].find((x) => /^\s*ok\s*$/i.test(x.textContent || ''));
  if (b) b.click();
});
await page.waitForTimeout(800);
await page.evaluate(() => document.querySelectorAll('#cookie-notice, .cookie-notice-container, [id*="cookie"]').forEach((e) => e.remove()));
console.log('images prêtes :', await wake());
// les légendes de la galerie : leur nom de fichier, tel qu'affiché
marks.captions = await page.evaluate(() =>
  [...document.querySelectorAll('figcaption, .et_pb_gallery_title, .gallery-caption, h3, p')]
    .filter((e) => /utc/i.test(e.textContent || '') && e.children.length === 0)
    .map((e) => {
      const r = e.getBoundingClientRect();
      return {text: e.textContent.trim(), x: r.left, y: r.top + scrollY, w: r.width, h: r.height};
    }),
);
marks.height = await page.evaluate(() => document.documentElement.scrollHeight);
await page.screenshot({path: resolve(out, 'gallery.jpg'), fullPage: true, type: 'jpeg', quality: 90});
writeFileSync(resolve(out, 'marks.json'), JSON.stringify(marks, null, 1));
console.log('✓ gallery.jpg', JSON.stringify(marks.captions.map((c) => [c.text.slice(0, 30), Math.round(c.x), Math.round(c.y)])));
await browser.close();
