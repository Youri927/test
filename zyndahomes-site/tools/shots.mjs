// Captures pour la relecture et les planches. Le site est lu sur le serveur local :
//   python3 -m http.server 8796 --bind 127.0.0.1 --directory dist-web   puis   node tools/shots.mjs <dossier> [intro|sections|phone]
//  - intro : l'ouverture, à des instants donnés depuis le chargement (ordinateur et téléphone) ;
//  - sections : chaque partie à la taille d'un écran d'ordinateur (1440 × 900), et les états (le cadran aux quatre temps,
//    une prestation survolée, la visionneuse, la fenêtre d'absence, les erreurs du formulaire, la demande envoyée) ;
//  - phone : des écrans de téléphone (390 × 844, en 2×).
import {createRequire} from 'node:module';
import {mkdirSync} from 'node:fs';
const {chromium} = createRequire(import.meta.url)('/opt/node-tools/node_modules/playwright');
const out = process.argv[2] || 'shots';
const only = process.argv[3];
mkdirSync(out, {recursive: true});
const URL_ = process.env.SITE || 'http://127.0.0.1:8796/';
const b = await chromium.launch();
const want = (k) => !only || only === k;
const DESK = {viewport: {width: 1440, height: 900}};
const PHONE = {viewport: {width: 390, height: 844}, deviceScaleFactor: 2, isMobile: true, hasTouch: true};
const shot = (p, name) => p.screenshot({path: `${out}/${name}.png`});

// amène un élément à un décalage donné sous l'en-tête (ou à une fraction de sa hauteur au milieu de l'écran),
// puis laisse les photos et Lenis se poser
const go = async (p, sel, off = 0, wait = 1600) => {
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
const mid = async (p, sel, frac, wait = 900) => {
  await p.evaluate(
    ([s, f]) => {
      const r = document.querySelector(s).getBoundingClientRect();
      window.scrollTo({top: r.top + scrollY + r.height * f - innerHeight / 2, behavior: 'instant'});
    },
    [sel, frac],
  );
  await p.waitForTimeout(wait);
};
const ready = async (p) => {
  await p.goto(URL_, {waitUntil: 'load'});
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(2800);
};

/* ——— l'ouverture, à des instants donnés ——— */
if (want('intro')) {
  for (const [ctxOpt, tag, times] of [
    [DESK, 'd', [150, 500, 900, 1300, 1800, 2800]],
    [PHONE, 'm', [300, 1000, 1700, 2800]],
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
  await go(p, '#apart', -40);
  await shot(p, '1440-apart');
  await go(p, '#year', 0);
  await shot(p, '1440-year');
  for (const [i, f] of [[0, 0.45], [1, 0.5], [2, 0.5], [3, 0.55]]) {
    await mid(p, `[data-step="${i}"]`, f, 1400);
    await shot(p, `1440-dial-${i}`);
  }
  await go(p, '.condo', -120);
  await shot(p, '1440-condo');
  await go(p, '#work', 0, 1800);
  await shot(p, '1440-work');
  await go(p, '.w--kitchen', -60, 1800);
  await shot(p, '1440-work-2');
  await go(p, '.w--fire', -60, 1800);
  await shot(p, '1440-work-3');
  await go(p, '.w--shower', -60, 1800);
  await shot(p, '1440-work-4');
  await go(p, '#details', 0, 1600);
  await shot(p, '1440-details');
  await go(p, '.swatches', -120, 1200);
  await shot(p, '1440-swatches');
  await go(p, '#services', 0);
  await p.hover('.svc__item:nth-child(4) .svc__name');
  await p.waitForTimeout(900);
  await shot(p, '1440-services');
  await go(p, '#about', 0, 1800);
  await shot(p, '1440-family');
  await go(p, '#areas', 0);
  await shot(p, '1440-areas');
  await go(p, '#contact', 0);
  await shot(p, '1440-contact');
  await p.selectOption('[data-leave]', '4');
  await p.selectOption('[data-back]', '9');
  await go(p, '[data-away]', -260, 900);
  await shot(p, '1440-away');
  await p.click('.form button[type="submit"]');
  await p.waitForTimeout(300);
  await go(p, '.form', -40, 600);
  await shot(p, '1440-errors');
  await p.fill('#f-name', 'Pat');
  await p.fill('#f-email', 'pat@example.com');
  await p.fill('#f-where', 'Pelican Bay');
  await p.fill('#f-msg', 'Kitchen and two baths, while we are away for the summer.');
  await p.click('.form button[type="submit"]');
  await p.waitForTimeout(500);
  await go(p, '.form__send', -420, 600);
  await shot(p, '1440-sent');
  await go(p, '.foot', -200, 800);
  await shot(p, '1440-foot');
  await go(p, '#work', 0, 1200);
  await p.click('.w--living .ph');
  await p.waitForTimeout(700);
  await shot(p, '1440-viewer');
  await p.keyboard.press('Escape');
  await ctx.close();
}

/* ——— des écrans de téléphone ——— */
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
  for (const [name, sel, off, wait] of [
    ['m-apart', '#apart', -20, 1400],
    ['m-year', '.year__dial', -24, 1400],
    ['m-step', '[data-step="1"]', -20, 1600],
    ['m-work', '#work', 0, 1800],
    ['m-details', '#details', 0, 1600],
    ['m-services', '#services', 0, 1400],
    ['m-family', '#about', 0, 1800],
    ['m-areas', '#areas', 0, 1400],
    ['m-contact', '#contact', 0, 1400],
    ['m-away', '[data-away]', -120, 1000],
    ['m-foot', '.foot', 0, 1000],
  ]) {
    if (name === 'm-away') {
      await p.selectOption('[data-leave]', '5');
      await p.selectOption('[data-back]', '9');
    }
    await go(p, sel, off, wait);
    await shot(p, name);
  }
  await go(p, '.w--kitchen', -40, 1600);
  await p.tap('.w--kitchen .ph');
  await p.waitForTimeout(700);
  await shot(p, 'm-viewer');
  await ctx.close();
}
await b.close();
console.log('captures dans', out);
