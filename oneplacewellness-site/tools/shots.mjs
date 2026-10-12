// Captures pour la relecture et les planches. Le site est lu sur le serveur local :
//   python3 -m http.server 8770 --bind 127.0.0.1 --directory dist-web   puis   node tools/shots.mjs <dossier> [intro|sweep|sections|phone|full]
//  - intro : l'ouverture image par image (ordinateur et téléphone), l'horloge des animations CSS arrêtée et calée ;
//  - sweep : le balayage de la ligne du temps, en temps réel ;
//  - sections : chaque partie à la taille d'un écran d'ordinateur (1440 × 900) ;
//  - phone : des écrans de téléphone (390 × 844, en 2×) ;
//  - full : la page entière, à 1440 et à 390 de large.
import {createRequire} from 'node:module';
import {mkdirSync} from 'node:fs';
const {chromium} = createRequire(import.meta.url)('/opt/node-tools/node_modules/playwright');
const out = process.argv[2] || 'shots';
const only = process.argv[3];
mkdirSync(out, {recursive: true});
const URL_ = process.env.SITE || 'http://127.0.0.1:8770/';
const b = await chromium.launch();
const want = (k) => !only || only === k;

// amène un élément à un décalage donné sous le haut de l'écran, puis laisse les animations se terminer
const go = async (p, sel, off, wait = 900) => {
  await p.evaluate(
    ([s, o]) => {
      const e = document.querySelector(s);
      window.scrollTo({top: s === 'body' ? 0 : e.getBoundingClientRect().top + scrollY + o, behavior: 'instant'});
    },
    [sel, off],
  );
  await p.waitForTimeout(wait);
};

/* ——— l'ouverture, image par image ——— */
if (want('intro')) {
  for (const [w, h, dpr, tag] of [
    [1440, 900, 1, 'd'],
    [390, 844, 2, 'm'],
  ]) {
    const ctx = await b.newContext({viewport: {width: w, height: h}, deviceScaleFactor: dpr, isMobile: w < 700, hasTouch: w < 700});
    const p = await ctx.newPage();
    await p.goto(URL_, {waitUntil: 'load'});
    await p.evaluate(() => document.fonts.ready);
    for (const ms of [0, 500, 900, 1300, 1700, 2100, 2600, 3100]) {
      await p.evaluate((t) => document.getAnimations().forEach((a) => (a.pause(), (a.currentTime = t))), ms);
      await p.waitForTimeout(60);
      await p.screenshot({path: `${out}/o-${tag}-${String(ms).padStart(4, '0')}.png`});
    }
    await ctx.close();
  }
}

/* ——— le balayage de la ligne du temps ——— */
if (want('sweep')) {
  const p = await b.newPage({viewport: {width: 1440, height: 900}});
  await p.goto(URL_, {waitUntil: 'load'});
  await go(p, '.tm', -40, 50);
  const t0 = Date.now();
  for (const ms of [300, 900, 1500, 2100, 2700, 3600]) {
    await p.waitForTimeout(Math.max(0, ms - (Date.now() - t0)));
    await p.screenshot({path: `${out}/s-${String(ms).padStart(4, '0')}.png`});
  }
  await p.close();
}

/* ——— chaque partie, sur ordinateur ——— */
const SECTIONS = [
  ['hero', 'body', 0],
  ['shade', '#shadows', -60],
  ['treat', '#treatments', -60],
  ['tm', '.tm', -40],
  ['tm-open', '.tm', -40],
  ['cases', '#cases', -60],
  ['cases-botox', '#cases', -60],
  ['doc', '#dr-fox', 0],
  ['visit', '#visit', -60],
  ['map', '.map', -80],
  ['form', '.visit__grid', -100],
  ['foot', '.foot', -500],
];
if (want('sections')) {
  for (const W of [1440, 1180]) {
    const p = await b.newPage({viewport: {width: W, height: 900}});
    await p.goto(URL_, {waitUntil: 'load'});
    await p.waitForTimeout(3200);
    for (const [name, sel, off] of SECTIONS) {
      if (name === 'tm') {
        await go(p, sel, off, 3600);
      } else if (name === 'tm-open') {
        await p.click('[aria-controls="tm-thread"]');
        await go(p, '[aria-controls="tm-thread"]', -300, 700);
      } else if (name === 'cases-botox') {
        await p.click('[data-filter="botox"]');
        await go(p, sel, off, 700);
      } else await go(p, sel, off);
      await p.screenshot({path: `${out}/${W}-${name}.png`});
    }
    await p.close();
  }
}

/* ——— téléphone ——— */
if (want('phone')) {
  const ctx = await b.newContext({viewport: {width: 390, height: 844}, deviceScaleFactor: 2, isMobile: true, hasTouch: true});
  const p = await ctx.newPage();
  await p.goto(URL_, {waitUntil: 'load'});
  await p.waitForTimeout(3200);
  const PH = [
    ['hero', 'body', 0],
    ['shade', '#shadows', -70],
    ['case', '.caseshot', -90],
    ['treat', '#treatments', -70],
    ['tm', '.tm__rows', -80],
    ['tm-2', '.tm__row:nth-child(4)', -80],
    ['cases', '.filters', -90],
    ['ledger', '.ledger .case:nth-child(4)', -80],
    ['doc', '#dr-fox', 0],
    ['doc-2', '.doc__facts', -120],
    ['visit', '#visit', -70],
    ['where', '.where', -90],
    ['form', '.request', -80],
    ['form-2', '.fields', -80],
    ['foot', '.foot', -200],
  ];
  for (const [name, sel, off] of PH) {
    await go(p, sel, off, name === 'tm' ? 3600 : 900);
    await p.screenshot({path: `${out}/m-${name}.png`});
  }
  await p.evaluate(() => scrollTo({top: 0, behavior: 'instant'}));
  await p.waitForTimeout(400);
  await p.click('[data-menu-open]');
  await p.waitForTimeout(300);
  await p.screenshot({path: `${out}/m-menu.png`});
  await ctx.close();
}

/* ——— la page entière ——— */
if (want('full')) {
  for (const [w, dpr] of [
    [1440, 1],
    [390, 1],
  ]) {
    const p = await b.newPage({viewport: {width: w, height: 900}, deviceScaleFactor: dpr});
    await p.goto(URL_, {waitUntil: 'load'});
    // les animations jouées une fois finissent dans leur état ordinaire : on les termine tout de suite
    await p.evaluate(() => document.querySelector('[data-tm]')?.style.removeProperty('--p'));
    await p.waitForTimeout(3200);
    await p.screenshot({path: `${out}/full-${w}.png`, fullPage: true});
    await p.close();
  }
}

await b.close();
