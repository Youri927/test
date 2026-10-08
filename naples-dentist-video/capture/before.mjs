// Le site actuel (naplescomprehensivedentist.com), capturé en entier, en 2×, pour la scène « Today ».
// Quatre pages : l'accueil, un soin vendu comme un produit, la page de rendez-vous vide, la page Contact.
// Écrit public/before/<page>.jpg et public/before/marks.json (positions des éléments cités par la vidéo, px CSS).
// Usage : node capture/before.mjs
import {mkdirSync, writeFileSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';

const require = createRequire(import.meta.url);
const {chromium} = require(process.env.PLAYWRIGHT_MODULE || '/opt/node-tools/node_modules/playwright');
const out = resolve(dirname(fileURLToPath(import.meta.url)), '../public/before');
mkdirSync(out, {recursive: true});

const SITE = 'https://naplescomprehensivedentist.com';
const PAGES = [
  ['home', '/'],
  ['product', '/products/dental-implants'],
  ['book', '/pages/book-an-appointment'],
  ['contact', '/pages/contact'],
];

const browser = await chromium.launch({args: ['--hide-scrollbars', '--force-color-profile=srgb']});
const page = await browser.newPage({viewport: {width: 1440, height: 900}, deviceScaleFactor: 2, locale: 'en-US'});
const marks = {date: new Date().toISOString().slice(0, 10), width: 1440};

for (const [name, path] of PAGES) {
  await page.goto(SITE + path, {waitUntil: 'load', timeout: 90000});
  // on descend doucement : les images différées et les apparitions du thème se déclenchent
  const h = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < h; y += 300) { await page.evaluate((y) => window.scrollTo(0, y), y); await page.waitForTimeout(150); }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(2500);
  // positions (px CSS du document) des textes cités : le plus grand bloc visible qui contient le texte
  marks[name] = await page.evaluate(() => {
    const find = (re, sel = '*') => {
      let best = null;
      for (const el of document.querySelectorAll(sel)) {
        if (!re.test(el.textContent || '') || el.children.length > 4) continue;
        const r = el.getBoundingClientRect();
        if (r.width < 4 || r.height < 4) continue;
        // l'élément le plus petit qui contient le texte (le plus précis)
        if (!best || r.width * r.height < best.w * best.h) best = {x: r.left, y: r.top + scrollY, w: r.width, h: r.height};
      }
      return best;
    };
    return {
      height: document.documentElement.scrollHeight,
      title: find(/Transform Your Smile/),
      buttonLabel: find(/^\s*Button label\s*$/, 'a, button, .button'),
      price: find(/\$0\.00 USD/, 'span, div'),
      cart: find(/^\s*Add to cart\s*$/, 'button, span'),
      paypal: find(/PayPal/, '[role="button"], button, div'),
      slide: find(/Tell your brand/, 'p, div, span'),
      slideTitle: find(/^\s*Image slide\s*$/, 'h2, h3, div'),
      phone: find(/\(239\) 241-2951/, 'li, p'),
      form: find(/\[Contact Form/, 'p, div'),
      social: find(/\[Facebook Icon\]/, 'li, p, div'),
    };
  });
  await page.screenshot({path: resolve(out, `${name}.jpg`), fullPage: true, type: 'jpeg', quality: 88});
  console.log(`✓ before/${name}.jpg`, JSON.stringify(marks[name]));
}
writeFileSync(resolve(out, 'marks.json'), JSON.stringify(marks, null, 1));
await browser.close();
