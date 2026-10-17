// Captures pour la relecture et les planches. Le site est lu sur le serveur local :
//   python3 -m http.server 8792 --bind 127.0.0.1 --directory dist-web   puis   node tools/shots.mjs <dossier> [intro|sections|phone]
//  - intro : l'ouverture, à des instants donnés depuis le chargement (ordinateur et téléphone) ;
//  - sections : chaque partie à la taille d'un écran d'ordinateur (1440 × 900), et les états (cadre de la maison à
//    mi-ouverture, avis à mi-lecture, visionneuse qui grandit puis ouverte, erreurs du formulaire, demande prête) ;
//  - phone : des écrans de téléphone (390 × 844, en 2×).
import {createRequire} from 'node:module';
import {mkdirSync} from 'node:fs';
const {chromium} = createRequire(import.meta.url)('/opt/node-tools/node_modules/playwright');
const out = process.argv[2] || 'shots';
const only = process.argv[3];
mkdirSync(out, {recursive: true});
const URL_ = process.env.SITE || 'http://127.0.0.1:8792/';
const b = await chromium.launch();
const want = (k) => !only || only === k;
const DESK = {viewport: {width: 1440, height: 900}};
const PHONE = {viewport: {width: 390, height: 844}, deviceScaleFactor: 2, isMobile: true, hasTouch: true};
const shot = (p, name) => p.screenshot({path: `${out}/${name}.png`});

// amène un élément à un décalage donné sous l'en-tête, puis laisse les cadres et Lenis se poser
const go = async (p, sel, off = 0, wait = 1400) => {
  await p.evaluate(
    ([s, o]) => {
      const top = document.querySelector('[data-top]').offsetHeight;
      const e = document.querySelector(s);
      window.scrollTo({top: Math.max(0, e.getBoundingClientRect().top + scrollY - top + o), behavior: 'instant'});
    },
    [sel, off],
  );
  await p.waitForTimeout(wait);
};
// l'ouverture dure 2,9 s une fois les polices là
const ready = async (p) => {
  await p.goto(URL_, {waitUntil: 'load'});
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(3300);
};

/* ——— l'ouverture, à des instants donnés ——— */
if (want('intro')) {
  for (const [opts, tag, times] of [
    [DESK, 'd', [300, 1000, 1300, 1700, 2000, 2400, 3200]],
    [PHONE, 'm', [300, 1300, 2400, 3200]],
  ]) {
    const ctx = await b.newContext(opts);
    const p = await ctx.newPage();
    await p.goto(URL_, {waitUntil: 'load'});
    const t0 = Date.now();
    for (const ms of times) {
      await p.waitForTimeout(Math.max(0, ms - (Date.now() - t0)));
      await shot(p, `o-${tag}-${String(ms).padStart(4, '0')}`);
    }
    await ctx.close();
  }
}

/* ——— les parties, à l'ordinateur ——— */
if (want('sections')) {
  const ctx = await b.newContext(DESK);
  const p = await ctx.newPage();
  await ready(p);
  await shot(p, '1440-hero');
  await go(p, '#work', -40);
  await shot(p, '1440-work');
  await go(p, '.scale--m', -60);
  await shot(p, '1440-remodel');
  // la maison : le cadre à mi-ouverture, puis ouvert
  await p.evaluate(() => {
    const f = document.querySelector('[data-bleed] .frame');
    window.scrollTo({top: f.getBoundingClientRect().top + scrollY - innerHeight * 0.5, behavior: 'instant'});
  });
  await p.waitForTimeout(1400);
  await shot(p, '1440-house-mid');
  await go(p, '[data-bleed]', -60);
  await shot(p, '1440-house-open');
  await go(p, '#houses', -40);
  await shot(p, '1440-houses');
  await go(p, '.m-palms', -120);
  await shot(p, '1440-raised');
  await go(p, '#house-block', -40);
  await shot(p, '1440-block');
  await go(p, '#judson', -40);
  await shot(p, '1440-judson');
  await go(p, '.judson__how', -60);
  await shot(p, '1440-promises');
  await go(p, '.license', -120);
  await shot(p, '1440-license');
  await go(p, '#reviews', -40);
  await shot(p, '1440-reviews-start');
  await go(p, '.quote--a', -160);
  await shot(p, '1440-reviews');
  await go(p, '#estimate', -40);
  await shot(p, '1440-estimate');
  await p.click('.form button[type="submit"]');
  await p.waitForTimeout(400);
  await go(p, '.form', -30, 600);
  await shot(p, '1440-form-errors');
  await p.fill('#f-name', 'Pat Example');
  await p.fill('#f-phone', '(239) 555-0100');
  await p.fill('#f-where', 'Golden Gate');
  await p.fill('#f-list', 'Fix the screen door.\nPaint the guest room.\nPrice a new kitchen.');
  await p.fill('#f-who', 'A neighbor');
  await p.click('.form button[type="submit"]');
  await p.waitForTimeout(1600);
  await shot(p, '1440-form-ready');
  await p.evaluate(() => window.scrollTo({top: document.documentElement.scrollHeight, behavior: 'instant'}));
  await p.waitForTimeout(1200);
  await shot(p, '1440-foot');
  // la visionneuse : en train de grandir depuis la vignette, puis ouverte
  await go(p, '.m-sign', -200, 1000);
  await p.click('.m-sign .ph');
  await p.waitForTimeout(150);
  await shot(p, '1440-viewer-grow');
  await p.waitForTimeout(700);
  await shot(p, '1440-viewer');
  await ctx.close();
}

/* ——— téléphone ——— */
if (want('phone')) {
  const ctx = await b.newContext(PHONE);
  const p = await ctx.newPage();
  await ready(p);
  await shot(p, 'm-hero');
  await p.tap('[data-menu]');
  await p.waitForTimeout(400);
  await shot(p, 'm-menu');
  await p.tap('[data-menu]');
  await p.waitForTimeout(300);
  await go(p, '#work', -20);
  await shot(p, 'm-work');
  await go(p, '.jobs', -160);
  await shot(p, 'm-jobs');
  await go(p, '[data-bleed]', -260);
  await shot(p, 'm-house');
  await go(p, '#house-raised', -20);
  await shot(p, 'm-raised');
  await go(p, '#judson', -20);
  await shot(p, 'm-judson');
  await go(p, '.license', -40);
  await shot(p, 'm-license');
  await go(p, '.quote--a', -60);
  await shot(p, 'm-reviews');
  await go(p, '#estimate', -20);
  await shot(p, 'm-estimate');
  await go(p, '.form', -20);
  await shot(p, 'm-form');
  await p.evaluate(() => window.scrollTo({top: document.documentElement.scrollHeight, behavior: 'instant'}));
  await p.waitForTimeout(1200);
  await shot(p, 'm-foot');
  await go(p, '.m-pines', -100, 900);
  await p.tap('.m-pines .ph');
  await p.waitForTimeout(900);
  await shot(p, 'm-viewer');
  await ctx.close();
}
await b.close();
