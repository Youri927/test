// Captures pour les planches : l'ouverture image par image, chaque section à la taille d'un écran d'ordinateur
// (1440 × 900), puis huit écrans de téléphone (390 × 844, en 2×). Le site est lu sur le serveur local.
//   python3 -m http.server 8765 --bind 127.0.0.1 --directory dist-web   puis   node tools/shots.mjs <dossier> [intro|sections|phone]
import {createRequire} from 'node:module';
import {mkdirSync} from 'node:fs';
const {chromium} = createRequire(import.meta.url)('/opt/node-tools/node_modules/playwright');
const out = process.argv[2] || 'shots';
const only = process.argv[3];
mkdirSync(out, {recursive: true});
const URL_ = 'http://127.0.0.1:8765/';
const b = await chromium.launch();

// amène un élément à un décalage donné sous le haut de l'écran, puis laisse les animations se terminer
const go = async (p, sel, off, wait = 1400) => {
  await p.evaluate(([s, o]) => {
    const e = document.querySelector(s);
    window.scrollTo({top: s === 'body' ? 0 : e.getBoundingClientRect().top + scrollY + o, behavior: 'instant'});
  }, [sel, off]);
  await p.waitForTimeout(wait);
};

/* ——— l'ouverture, image par image (ordinateur), et son dernier état ——— */
if (!only || only === 'intro') {
  for (const [w, h, dpr, tag] of [[1440, 900, 1, 'd'], [390, 844, 2, 'm']]) {
    const ctx = await b.newContext({viewport: {width: w, height: h}, deviceScaleFactor: dpr, isMobile: w < 700, hasTouch: w < 700});
    const p = await ctx.newPage();
    // l'horloge de l'ouverture part quand elle démarre vraiment (police et photo prêtes)
    await p.addInitScript(() => {
      const A = Element.prototype.animate;
      Element.prototype.animate = function (...a) {
        if (!window.__start) window.__start = performance.now();
        return A.apply(this, a);
      };
    });
    await p.goto(URL_, {waitUntil: 'load'});
    await p.waitForFunction(() => window.__start);
    for (const ms of [250, 800, 1150, 1500, 1900, 2300, 2900]) {
      await p.waitForFunction((t) => performance.now() - window.__start >= t, ms, {polling: 16});
      await p.screenshot({path: `${out}/o-${tag}-${String(ms).padStart(4, '0')}.png`});
    }
    await ctx.close();
  }
}

/* ——— sections, sur ordinateur ——— */
const SECTIONS = [
  ['hero', 'body', 0], ['straight', '#straight', -10], ['case', '.case', -150], ['others', '.straight__facts', -60],
  ['care', '#care', -10], ['care-open', '.group:nth-child(2)', -120], ['team', '#team', -10], ['bio', '.strip', -130],
  ['reviews', '#reviews', -10], ['more', '.more-says', -100], ['costs', '#costs', -10], ['visit', '#visit', -10],
  ['form', '.request', -96], ['foot', '.foot', -420],
];
if (!only || only === 'sections') {
  const p = await b.newPage({viewport: {width: 1440, height: 900}});
  await p.goto(URL_, {waitUntil: 'load'});
  await p.waitForTimeout(3200);
  for (const [name, sel, off] of SECTIONS) {
    if (name === 'care-open') {
      // un soin ouvert, et la définition d'un mot
      await go(p, sel, off, 300);
      await p.click('.group:nth-child(2) details.item:first-child summary');
      await p.waitForTimeout(700);
      await p.hover('.group:nth-child(2) .term[data-term="crown"]');
      await p.waitForTimeout(400);
    } else if (name === 'bio') {
      await go(p, sel, off, 300);
      await p.click('.face[data-person="cindy"]');
      await p.mouse.move(5, 5);
      await p.waitForTimeout(900);
    } else await go(p, sel, off);
    await p.screenshot({path: `${out}/s-${name}.jpg`, type: 'jpeg', quality: 88});
  }
  await p.close();
}

/* ——— téléphone ——— */
const PHONE = [
  ['accueil', 'body', 0], ['cas', '.case', -150], ['soins', '#care', -10], ['equipe', '.strip-wrap', -150],
  ['avis', '.pledges', -90], ['prix', '.costs__cols', -90], ['visite', '#visit', -10], ['formulaire', '.request', -80],
];
if (!only || only === 'phone') {
  for (const [name, sel, off] of PHONE) {
    const ctx = await b.newContext({viewport: {width: 390, height: 844}, deviceScaleFactor: 2, isMobile: true, hasTouch: true});
    const p = await ctx.newPage();
    await p.goto(URL_, {waitUntil: 'load'});
    await p.waitForTimeout(3200);
    if (sel !== 'body') await go(p, sel, off, 1600);
    if (name === 'soins') {
      await p.tap('details.item:first-child summary');
      await p.waitForTimeout(700);
    }
    await p.screenshot({path: `${out}/p-${name}.png`});
    await ctx.close();
  }
}
await b.close();
console.log(`captures dans ${out}/`);
