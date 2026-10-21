// Captures pour la relecture et les planches. Le site est lu sur le serveur local :
//   python3 -m http.server 8794 --bind 127.0.0.1 --directory dist-web   puis   node tools/shots.mjs <dossier> [intro|sections|phone]
//  - intro : l'ouverture, à des instants donnés depuis l'arrivée des polices (ordinateur et téléphone) ;
//  - sections : chaque partie à la taille d'un écran d'ordinateur (1440 × 900), et les états (la visite à quatre
//    moments, un reportage dans la visionneuse, les avis filtrés par sujet, les erreurs du formulaire, la demande écrite) ;
//  - phone : des écrans de téléphone (390 × 844, en 2×).
import {createRequire} from 'node:module';
import {mkdirSync} from 'node:fs';
const {chromium} = createRequire(import.meta.url)('/opt/node-tools/node_modules/playwright');
const out = process.argv[2] || 'shots';
const only = process.argv[3];
mkdirSync(out, {recursive: true});
const URL_ = process.env.SITE || 'http://127.0.0.1:8794/';
const b = await chromium.launch();
const want = (k) => !only || only === k;
const DESK = {viewport: {width: 1440, height: 900}};
const PHONE = {viewport: {width: 390, height: 844}, deviceScaleFactor: 2, isMobile: true, hasTouch: true};
const shot = (p, name) => p.screenshot({path: `${out}/${name}.png`});

// amène un élément à un décalage donné sous l'en-tête, puis laisse les photos et Lenis se poser
const go = async (p, sel, off = 0, wait = 1600) => {
  await p.evaluate(
    ([s, o]) => {
      const top = document.querySelector('[data-top]').offsetHeight;
      const e = document.querySelector(s);
      window.scrollTo({top: Math.max(0, e.getBoundingClientRect().top + scrollY - top + o), behavior: 'instant'});
    },
    [sel, off],
  );
  await p.waitForTimeout(350);
  // l'en-tête se range quand on descend : on ne laisse pas sa place vide en haut de la capture
  await p.evaluate(() => {
    const t = document.querySelector('[data-top]');
    if (t.classList.contains('is-hidden')) window.scrollBy({top: t.offsetHeight, behavior: 'instant'});
  });
  await p.waitForTimeout(wait);
};
// la visite figée : une fraction de son parcours
const walkAt = async (p, f, wait = 1500) => {
  await p.evaluate((fr) => {
    const w = document.querySelector('[data-walk]');
    const top = w.getBoundingClientRect().top + scrollY;
    window.scrollTo({top: top + (w.offsetHeight - innerHeight) * fr, behavior: 'instant'});
  }, f);
  await p.waitForTimeout(wait);
};
const ready = async (p) => {
  await p.goto(URL_, {waitUntil: 'load'});
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(3600);
};

/* ——— l'ouverture, à des instants donnés ——— */
if (want('intro')) {
  for (const [ctxOpt, tag, times] of [
    [DESK, 'd', [100, 700, 1400, 1800, 2200, 3400]],
    [PHONE, 'm', [200, 1500, 3400]],
  ]) {
    for (const t of times) {
      const ctx = await b.newContext(ctxOpt);
      const p = await ctx.newPage();
      await p.goto(URL_, {waitUntil: 'load'});
      // l'ouverture part quand les polices sont là : on compte depuis ce moment
      await p.evaluate(() => document.fonts.ready);
      await p.waitForTimeout(t);
      await shot(p, `o-${tag}-${String(t).padStart(4, '0')}`);
      await ctx.close();
    }
  }
}

/* ——— les parties de la page, sur ordinateur ——— */
if (want('sections')) {
  const ctx = await b.newContext(DESK);
  const p = await ctx.newPage();
  await ready(p);
  await shot(p, '1440-hero');
  for (const [i, f] of [[0, 0], [1, 0.36], [2, 0.7], [3, 1]]) {
    await walkAt(p, f);
    await shot(p, `1440-walk-${i}`);
  }
  await go(p, '#work', 0, 1800);
  await shot(p, '1440-work');
  await go(p, '.bw > li:nth-child(4)', -110, 1800);
  await shot(p, '1440-work-2');
  await go(p, '.else', -40, 1800);
  await shot(p, '1440-else');
  await go(p, '.place:nth-child(3)', -60, 1800);
  await shot(p, '1440-else-2');
  await p.click('.place:nth-child(3) .card__ph');
  await p.waitForTimeout(900);
  await shot(p, '1440-viewer');
  await p.keyboard.press('Escape');
  await p.waitForTimeout(500);
  await go(p, '#reviews', 0, 1400);
  await shot(p, '1440-reviews');
  await p.click('[data-topic="time"]');
  await go(p, '.topics', -24, 1200);
  await shot(p, '1440-reviews-time');
  await p.click('[data-topic="storm"]');
  await go(p, '.topics', -24, 900);
  await shot(p, '1440-reviews-storm');
  await p.click('[data-topic="all"]');
  await go(p, '#services', 0, 1400);
  await shot(p, '1440-services');
  await go(p, '#about', 0, 1600);
  await shot(p, '1440-about');
  await go(p, '#contact', 0, 1400);
  await shot(p, '1440-contact');
  await p.click('.form button[type="submit"]');
  await p.waitForTimeout(400);
  await go(p, '.form', -40, 700);
  await shot(p, '1440-errors');
  await p.fill('#f-name', 'Pat');
  await p.fill('#f-phone', '239-555-0142');
  await p.selectOption('#f-kind', 'Whole condo or home');
  await p.fill('#f-where', 'Pelican Bay');
  await p.fill('#f-msg', 'A kitchen and two baths in our condo.');
  await p.click('.form button[type="submit"]');
  await p.waitForTimeout(600);
  await go(p, '[data-done]', -520, 700);
  await shot(p, '1440-sent');
  await go(p, '.foot', -240, 900);
  await shot(p, '1440-foot');
  await ctx.close();
}

/* ——— des écrans de téléphone ——— */
if (want('phone')) {
  const ctx = await b.newContext(PHONE);
  const p = await ctx.newPage();
  await ready(p);
  await shot(p, 'm-hero');
  await p.tap('[data-menu-btn]');
  await p.waitForTimeout(500);
  await shot(p, 'm-menu');
  await p.tap('[data-menu-btn]');
  await p.waitForTimeout(400);
  for (const [name, sel, off, wait] of [
    ['m-walk', '#walk', 0, 1600],
    ['m-work', '#work', 0, 1800],
    ['m-else', '.place:nth-child(3)', -20, 1800],
    ['m-reviews', '#reviews', 0, 1400],
    ['m-services', '#services', 0, 1400],
    ['m-about', '#about', 0, 1600],
    ['m-contact', '#contact', 0, 1400],
    ['m-foot', '.foot', 0, 1000],
  ]) {
    await go(p, sel, off, wait);
    if (name === 'm-reviews') {
      await p.tap('[data-topic="care"]');
      await go(p, '.topics', -16, 1000);
    }
    await shot(p, name);
  }
  await go(p, '.bw', -60, 1600);
  await p.tap('.bw > li:nth-child(1) .card__ph');
  await p.waitForTimeout(900);
  await shot(p, 'm-viewer');
  await ctx.close();
}
await b.close();
console.log('captures dans', out);
