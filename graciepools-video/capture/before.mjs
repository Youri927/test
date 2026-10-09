// Le site actuel (graciepools.com), capturé en 2× pour la scène « Today ».
// L'accueil tel qu'on y arrive (bandeau de cookies compris), puis, cookies acceptés, quatre pages entières :
// la fabrication (« Daily Specials »), les formes libres (fiche du Billabong Cove), la page « Fiberglass Installations »
// (une carte cadeau) et la page Barrier Reef (le lien vers la fiche 2025, en PDF).
// Écrit public/before/<page>.jpg et public/before/marks.json (positions des passages cités, px CSS du document).
// Usage : node capture/before.mjs
import {mkdirSync, writeFileSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';

const require = createRequire(import.meta.url);
const {chromium} = require(process.env.PLAYWRIGHT_MODULE || '/opt/node-tools/node_modules/playwright');
const out = resolve(dirname(fileURLToPath(import.meta.url)), '../public/before');
mkdirSync(out, {recursive: true});

const SITE = 'https://graciepools.com';
const PAGES = [
  ['manufacturing', '/barrierreef-manufacturing'],
  ['freeform', '/br-free-form-pools'],
  ['installations', '/fiberglass-installations'],
  ['barrier', '/barrier-reef-pools'],
];

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
      const t = await page.evaluate(() => document.body.innerText.slice(0, 80));
      if (!/upstream request failed|bad gateway/i.test(t)) return;
    } catch (e) {
      console.log('  nouvelle tentative', path, e.message.split('\n')[0]);
    }
    await page.waitForTimeout(3000 * (k + 1));
  }
  throw new Error('page inaccessible : ' + path);
};

// toutes les images visibles sont chargées (le mandataire réseau en laisse parfois tomber une)
const imagesReady = () =>
  page.evaluate(() => [...document.images].filter((i) => i.getBoundingClientRect().width > 4).every((i) => i.complete && i.naturalWidth > 0));

// on descend doucement : les images différées et les apparitions du thème se déclenchent ; on attend qu'elles soient toutes là
const wake = async () => {
  const h = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < h; y += 300) { await page.evaluate((y) => window.scrollTo(0, y), y); await page.waitForTimeout(220); }
  for (let k = 0; k < 50 && !(await imagesReady()); k++) await page.waitForTimeout(400);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(3000);
  return imagesReady();
};

// rectangle (px CSS du document) d'un passage de texte précis : le texte est cherché dans les nœuds texte,
// et mesuré avec un Range (le passage seul, pas tout le paragraphe)
const findText = (re, nth = 0) =>
  page.evaluate(([src, flags, nth]) => {
    const rx = new RegExp(src, flags);
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let k = 0;
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      const m = rx.exec(n.textContent || '');
      if (!m) continue;
      const el = n.parentElement;
      if (!el || !el.getClientRects().length) continue;
      if (k++ < nth) continue;
      const r = document.createRange();
      r.setStart(n, m.index);
      r.setEnd(n, m.index + m[0].length);
      const b = r.getBoundingClientRect();
      return {x: b.left, y: b.top + scrollY, w: b.width, h: b.height};
    }
    return null;
  }, [re.source, re.flags, nth]);
// rectangle de l'élément le plus petit qui contient le texte
const findBlock = (re, sel = '*') =>
  page.evaluate(([src, flags, sel]) => {
    const rx = new RegExp(src, flags);
    let best = null;
    for (const el of document.querySelectorAll(sel)) {
      if (!rx.test(el.textContent || '')) continue;
      const r = el.getBoundingClientRect();
      if (r.width < 4 || r.height < 4) continue;
      if (!best || r.width * r.height < best.w * best.h) best = {x: r.left, y: r.top + scrollY, w: r.width, h: r.height};
    }
    return best;
  }, [re.source, re.flags, sel]);

// 1. l'accueil, tel qu'on y arrive : le bandeau de cookies par-dessus
await open('/');
await wake();
await page.screenshot({path: resolve(out, 'home.jpg'), type: 'jpeg', quality: 88});
marks.home = {height: 900, cookie: await findBlock(/This website uses cookies/, 'div'), title: await findText(/GRACIE POOL CONSTRUCTION/i)};
console.log('✓ before/home.jpg', JSON.stringify(marks.home));
// le bandeau de cookies revient à chaque page : on l'accepte sur chacune des pages suivantes (lien « Accept » du bandeau GoDaddy)
const accept = async (name) => {
  await page.click('[data-aid="FOOTER_COOKIE_CLOSE_RENDERED"]', {timeout: 3000, force: true}).catch(() => {});
  await page.waitForTimeout(700);
  // une fois accepté sur la première page, le bandeau GoDaddy se réaffiche quand même sur les suivantes : on le retire,
  // comme il disparaît pour un visiteur qui a déjà accepté
  const removed = await page.evaluate(() => {
    const b = document.querySelector('[data-aid="FOOTER_COOKIE_BANNER_RENDERED"]');
    if (!b) return false;
    b.remove();
    return true;
  });
  if (removed) console.log('  bandeau de cookies retiré :', name);
};

for (const [name, path] of PAGES) {
  // jusqu'à trois chargements, tant qu'une image manque
  for (let k = 0; k < 3; k++) {
    await open(path);
    if (await wake()) break;
    console.log('  images manquantes, nouveau chargement :', name);
  }
  await accept(name);
  const m = {height: await page.evaluate(() => document.documentElement.scrollHeight)};
  if (name === 'manufacturing') {
    m.specials = await findBlock(/Daily Specials[\s\S]*half-price admission/i, 'div');
    m.specialsTitle = await findText(/Daily Specials/);
    m.admission = await findText(/half-price admission for kids under 12/i);
    m.slide = await findText(/water slide/i);
    m.pool = await findText(/Gracie Fiberglass Pools Swimming Pool/i);
  }
  if (name === 'freeform') {
    m.coveTitle = await findText(/^\s*Billabong Cove\s*$/);
    m.coveLength = await findText(/Length: ?40[^\n]*/);
    m.coveWidth = await findText(/Width: ?15[^\n]*/);
    m.splashLength = await findText(/Length: ?30[^\n]*/);
    m.oasis = await findText(/Your Oasis Awaits/);
    m.visit = await findBlock(/^\s*Visit Us\s*$/i, 'a, button');
  }
  if (name === 'installations') {
    m.gift = await findText(/GIVE THE GIFT OF GRACIE/i);
    m.giftButton = await findBlock(/^\s*Buy a Gift Card\s*$/i, 'a, button');
  }
  if (name === 'barrier') {
    m.pdf = await findBlock(/Model Sheet|\.pdf/i, 'a');
    m.pdfLinks = await page.evaluate(() => [...document.querySelectorAll('a[href*=".pdf"]')].map((a) => {
      const r = a.getBoundingClientRect();
      return {x: r.left, y: r.top + scrollY, w: r.width, h: r.height, text: a.textContent.trim().slice(0, 80)};
    }));
  }
  marks[name] = m;
  await page.screenshot({path: resolve(out, `${name}.jpg`), fullPage: true, type: 'jpeg', quality: 88});
  console.log(`✓ before/${name}.jpg`, JSON.stringify(m));
}
writeFileSync(resolve(out, 'marks.json'), JSON.stringify(marks, null, 1));
await browser.close();
