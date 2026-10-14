// Captures pour la relecture et les planches. Le site est lu sur le serveur local :
//   python3 -m http.server 8790 --bind 127.0.0.1 --directory dist-web   puis   node tools/shots.mjs <dossier> [intro|name|story|sections|phone]
//  - intro : l'ouverture image par image (ordinateur et téléphone), l'horloge des transitions arrêtée et calée ;
//  - name : le nom épinglé et les chantiers qui passent devant, à six moments du défilement (ordinateur) et quatre
//    (téléphone) ;
//  - story : la maison restaurée épinglée, à trois moments du défilement (ordinateur), et ses étapes au téléphone ;
//  - sections : chaque partie à la taille d'un écran d'ordinateur (1440 × 900), et les états (visionneuse,
//    erreurs du formulaire, fourchettes de budget, message prêt) ;
//  - phone : des écrans de téléphone (390 × 844, en 2×).
import {createRequire} from 'node:module';
import {mkdirSync} from 'node:fs';
const {chromium} = createRequire(import.meta.url)('/opt/node-tools/node_modules/playwright');
const out = process.argv[2] || 'shots';
const only = process.argv[3];
mkdirSync(out, {recursive: true});
const URL_ = process.env.SITE || 'http://127.0.0.1:8790/';
const b = await chromium.launch();
const want = (k) => !only || only === k;
const DESK = {viewport: {width: 1440, height: 900}};
const PHONE = {viewport: {width: 390, height: 844}, deviceScaleFactor: 2, isMobile: true, hasTouch: true};

// amène un élément à un décalage donné sous le haut de l'écran, puis laisse les dévoilements se terminer
const go = async (p, sel, off = 0, wait = 1300) => {
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
const at = async (p, y, wait = 900) => {
  await p.evaluate((y) => window.scrollTo({top: y, behavior: 'instant'}), y);
  await p.waitForTimeout(wait);
};
// la place dans la maison restaurée (0 à 1), sur ordinateur : la même formule que main.js
const story = async (p, v) => {
  await p.evaluate((v) => {
    const s = document.querySelector('[data-story]');
    const top = document.querySelector('[data-top]').offsetHeight;
    const run = s.offsetHeight - (innerHeight - top);
    window.scrollTo({top: s.getBoundingClientRect().top + scrollY - top + v * run, behavior: 'instant'});
  }, v);
  await p.waitForTimeout(1100);
};
// l'ouverture se joue en 1,65 s une fois les polices là
const ready = async (p) => {
  await p.goto(URL_, {waitUntil: 'load'});
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(2200);
};
const shot = (p, name) => p.screenshot({path: `${out}/${name}.png`});

/* ——— l'ouverture, image par image ——— */
if (want('intro')) {
  for (const [opts, tag] of [
    [DESK, 'd'],
    [PHONE, 'm'],
  ]) {
    const ctx = await b.newContext(opts);
    const p = await ctx.newPage();
    await p.goto(URL_, {waitUntil: 'load'});
    await p.waitForFunction(() => document.getAnimations().length >= 6);
    await p.evaluate(() => document.getAnimations().forEach((a) => a.pause()));
    for (const ms of [0, 150, 300, 450, 600, 800, 1000, 1300, 1650]) {
      await p.evaluate((t) => document.getAnimations().forEach((a) => (a.currentTime = t)), ms);
      await p.waitForTimeout(80);
      await shot(p, `o-${tag}-${String(ms).padStart(4, '0')}`);
    }
    await ctx.close();
  }
}

/* ——— le nom épinglé, les chantiers devant ——— */
if (want('name')) {
  let ctx = await b.newContext(DESK);
  let p = await ctx.newPage();
  await ready(p);
  for (const y of [0, 420, 840, 1260, 1680, 2100]) (await at(p, y), await shot(p, `name-d-${y}`));
  await ctx.close();
  ctx = await b.newContext(PHONE);
  p = await ctx.newPage();
  await ready(p);
  for (const y of [0, 520, 1040, 1560]) (await at(p, y), await shot(p, `name-m-${y}`));
  await ctx.close();
}

/* ——— la maison restaurée ——— */
if (want('story')) {
  let ctx = await b.newContext(DESK);
  let p = await ctx.newPage();
  await ready(p);
  await go(p, '#restoration', 0);
  await shot(p, 'story-d-head');
  for (const v of [0.12, 0.5, 0.92]) (await story(p, v), await shot(p, `story-d-${Math.round(v * 100)}`));
  await ctx.close();
  ctx = await b.newContext(PHONE);
  p = await ctx.newPage();
  await ready(p);
  for (let i = 1; i <= 3; i++) (await go(p, `.story__step:nth-child(${i})`, -20), await shot(p, `story-m-${i}`));
  await ctx.close();
}

/* ——— les parties, et les états ——— */
if (want('sections')) {
  const ctx = await b.newContext(DESK);
  const p = await ctx.newPage();
  await ready(p);
  await shot(p, '1440-hero');
  await go(p, '#homes', 0);
  await go(p, '.steps', 120);
  await go(p, '#homes', 0);
  await shot(p, '1440-homes');
  await go(p, '.steps', -40);
  await shot(p, '1440-steps');
  await go(p, '#remodels', 0);
  await shot(p, '1440-remodels');
  await go(p, '.rooms', -20);
  await shot(p, '1440-rooms');
  await go(p, '#commercial', 0);
  await shot(p, '1440-commercial');
  await go(p, '.buildout', -40);
  await shot(p, '1440-buildout');
  await go(p, '#family', 0, 2200);
  await shot(p, '1440-family');
  await go(p, '#area', 0);
  await shot(p, '1440-area');
  await go(p, '#consultation', 0);
  await shot(p, '1440-consultation');
  await go(p, '.foot', -200);
  await shot(p, '1440-foot');

  // la visionneuse, sur la deuxième pièce
  await go(p, '.rooms', -20);
  await p.click('.rooms__grid li:nth-child(2) .ph');
  await p.waitForTimeout(900);
  await shot(p, '1440-viewer');
  await p.keyboard.press('Escape');
  await p.waitForTimeout(500);

  // le formulaire : les erreurs, puis une maison neuve et ses fourchettes, puis le message prêt
  await go(p, '#consultation', 0);
  await p.click('.form__go .btn');
  await p.waitForTimeout(500);
  await go(p, '#consultation', 0, 400);
  await shot(p, '1440-form-errors');
  await p.check('input[name="project"][value="New custom home"]', {force: true});
  await p.waitForTimeout(300);
  await p.check('input[name="budget"][value="$1 million to $5 million"]', {force: true});
  await p.fill('#f-where', 'Naples');
  await p.fill('#f-name', 'Jordan Avery');
  await p.fill('#f-phone', '239-555-0142');
  await p.fill('#f-msg', 'A four-bedroom home on a lot we own in Pelican Bay, with a pool. We would like to start next spring.');
  await p.waitForTimeout(300);
  await go(p, '#consultation', 0, 400);
  await shot(p, '1440-form-budget');
  // la page ouvre la messagerie par un lien mailto: ; le navigateur sans tête n'a pas d'application d'e-mail
  await p.click('.form__go .btn');
  await p.waitForTimeout(1500);
  await go(p, '[data-ready]', -60, 600);
  await shot(p, '1440-form-ready');
  await ctx.close();
}

/* ——— le téléphone ——— */
if (want('phone')) {
  const ctx = await b.newContext(PHONE);
  const p = await ctx.newPage();
  await ready(p);
  await shot(p, 'm-hero');
  await p.click('[data-menu]');
  await p.waitForTimeout(500);
  await shot(p, 'm-menu');
  await p.click('[data-menu]');
  await p.waitForTimeout(300);
  await go(p, '#homes', 0);
  await shot(p, 'm-homes');
  await go(p, '.steps', -10);
  await go(p, '.steps__i:nth-child(2)', -10);
  await shot(p, 'm-steps');
  await go(p, '.rooms', -10);
  await shot(p, 'm-rooms');
  await go(p, '#restoration', 0);
  await shot(p, 'm-storm');
  await go(p, '#commercial', 0);
  await shot(p, 'm-commercial');
  await go(p, '#family', 0, 2200);
  await shot(p, 'm-family');
  await go(p, '#area', 0);
  await shot(p, 'm-area');
  await go(p, '#consultation', 0);
  await shot(p, 'm-consultation');
  await go(p, '.form', -10);
  await shot(p, 'm-form');
  await go(p, '.foot', 0);
  await shot(p, 'm-foot');
  await ctx.close();
}
await b.close();
console.log('captures dans', out);
