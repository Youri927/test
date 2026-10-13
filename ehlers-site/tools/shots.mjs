// Captures pour la relecture et les planches. Le site est lu sur le serveur local :
//   python3 -m http.server 8772 --bind 127.0.0.1 --directory dist-web   puis   node tools/shots.mjs <dossier> [intro|sections|phone|full]
//  - intro : l'ouverture image par image (ordinateur et téléphone), l'horloge des animations arrêtée et calée ;
//  - sections : chaque partie à la taille d'un écran d'ordinateur (1440 × 900), et les états (cuisine détail par
//    détail, filtre du registre, « Show all 16 jobs », erreurs du formulaire) ;
//  - phone : des écrans de téléphone (390 × 844, en 2×) ;
//  - full : la page entière, à 1440 et à 390 de large.
import {createRequire} from 'node:module';
import {mkdirSync} from 'node:fs';
const {chromium} = createRequire(import.meta.url)('/opt/node-tools/node_modules/playwright');
const out = process.argv[2] || 'shots';
const only = process.argv[3];
mkdirSync(out, {recursive: true});
const URL_ = process.env.SITE || 'http://127.0.0.1:8772/';
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
// un détail de la cuisine sur la ligne de lecture : le milieu de l'écran, ou, au téléphone, juste sous la photo
const read = async (p, k, phone) => {
  await go(p, `[data-detail="${k}"]`, -400, 500);
  await p.evaluate(
    ([k, phone]) => {
      const e = document.querySelector(`[data-detail="${k}"]`);
      const r = e.getBoundingClientRect();
      const band = document.querySelector('.read__media').getBoundingClientRect().bottom;
      window.scrollTo({top: phone ? r.top + scrollY - band - 20 : r.top + scrollY + r.height / 2 - innerHeight / 2, behavior: 'instant'});
    },
    [k, phone],
  );
  await p.waitForTimeout(1200);
};
// l'ouverture dure 2,7 s
const ready = async (p) => {
  await p.goto(URL_, {waitUntil: 'load'});
  await p.waitForTimeout(3000);
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
    await p.waitForFunction(() => document.getAnimations().length > 6);
    for (const ms of [0, 300, 500, 700, 900, 1200, 1500, 1800, 2100, 2700]) {
      await p.evaluate((t) => document.getAnimations().forEach((a) => (a.pause(), (a.currentTime = t))), ms);
      await p.waitForTimeout(80);
      await p.screenshot({path: `${out}/o-${tag}-${String(ms).padStart(4, '0')}.png`});
    }
    await ctx.close();
  }
}

/* ——— chaque partie, sur ordinateur ——— */
if (want('sections')) {
  const p = await b.newPage({viewport: {width: 1440, height: 900}});
  await ready(p);
  await p.screenshot({path: `${out}/1440-hero.png`});
  for (const [name, sel, off, wait] of [
    ['rick', '#rick', -40, 1500],
    ['span', '.span', -420, 1800],
    ['work', '#work', -40, 1400],
  ]) {
    await go(p, sel, off, wait);
    await p.screenshot({path: `${out}/1440-${name}.png`});
  }
  for (const k of ['1', '2', '3', '4', '5']) {
    await read(p, k, false);
    await p.screenshot({path: `${out}/1440-read-${k}.png`});
  }
  for (const [name, sel, off, wait] of [
    ['services', '#services', -40, 1400],
    ['plan', '.sched__row--plan', -260, 2200],
    ['range', '.range', -420, 1600],
    ['record', '#record', -40, 1400],
    ['ledger', '.ledger-head', -100, 900],
  ]) {
    await go(p, sel, off, wait);
    await p.screenshot({path: `${out}/1440-${name}.png`});
  }
  await p.click('[data-k="commercial"]');
  await p.waitForTimeout(900);
  await p.screenshot({path: `${out}/1440-ledger-commercial.png`});
  await p.click('[data-k="all"]');
  await p.waitForTimeout(400);
  await p.click('[data-ledger-more]');
  await p.waitForTimeout(900);
  await go(p, '.ledger li:nth-child(5)', -100, 600);
  await p.screenshot({path: `${out}/1440-ledger-all.png`});
  await go(p, '#contact', -40, 1400);
  await p.screenshot({path: `${out}/1440-contact.png`});
  await go(p, '.foot', -560, 900);
  await p.screenshot({path: `${out}/1440-foot.png`});
  // le formulaire envoyé vide : les erreurs
  await go(p, '#contact', -40, 300);
  await p.click('.form .btn--solid');
  await p.waitForTimeout(500);
  await go(p, '#contact', -40, 300);
  await p.screenshot({path: `${out}/1440-contact-errors.png`});
  await p.close();
}

/* ——— téléphone ——— */
if (want('phone')) {
  const ctx = await b.newContext({viewport: {width: 390, height: 844}, deviceScaleFactor: 2, isMobile: true, hasTouch: true});
  const p = await ctx.newPage();
  await ready(p);
  await p.screenshot({path: `${out}/m-hero.png`});
  for (const [name, sel, off, wait] of [
    ['rick', '#rick', -60, 1400],
    ['span', '.span', -140, 1800],
    ['work', '#work', -60, 1400],
  ]) {
    await go(p, sel, off, wait);
    await p.screenshot({path: `${out}/m-${name}.png`});
  }
  await read(p, '3', true);
  await p.screenshot({path: `${out}/m-read-3.png`});
  for (const [name, sel, off, wait] of [
    ['services', '#services', -60, 1400],
    ['plan', '.sched__row--plan', -80, 2200],
    ['record', '#record', -60, 1400],
    ['ledger', '.ledger-head', -80, 900],
    ['contact', '#contact', -60, 1400],
    ['foot', '.foot', -140, 900],
  ]) {
    await go(p, sel, off, wait);
    await p.screenshot({path: `${out}/m-${name}.png`});
  }
  await p.evaluate(() => scrollTo({top: 0, behavior: 'instant'}));
  await p.waitForTimeout(400);
  await p.tap('[data-menu-open]');
  await p.waitForTimeout(300);
  await p.screenshot({path: `${out}/m-menu.png`});
  await ctx.close();
}

/* ——— la page entière ——— */
if (want('full')) {
  for (const w of [1440, 390]) {
    const p = await b.newPage({viewport: {width: w, height: 900}});
    await ready(p);
    // les tracés et les titres qui se découvrent au défilement : déjà en place pour la vue d'ensemble
    await p.evaluate(() => {
      document.querySelectorAll('[data-span], [data-range], [data-plan]').forEach((e) => e.classList.add('is-drawn'));
      document.querySelectorAll('.reveal').forEach((e) => e.classList.add('is-in'));
    });
    await p.waitForTimeout(2000);
    await p.screenshot({path: `${out}/full-${w}.png`, fullPage: true});
    await p.close();
  }
}

await b.close();
