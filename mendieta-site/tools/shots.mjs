// Captures pour la relecture et les planches. Le site est lu sur le serveur local :
//   python3 -m http.server 8773 --bind 127.0.0.1 --directory dist-web   puis   node tools/shots.mjs <dossier> [intro|layers|sections|phone|full]
//  - intro : l'ouverture image par image (ordinateur et téléphone), l'horloge des animations arrêtée et calée ;
//  - layers : la coupe couche par couche à cinq moments du défilement (ordinateur) et à deux étapes (téléphone) ;
//  - sections : chaque partie à la taille d'un écran d'ordinateur (1440 × 900), et les états (filtre et visionneuse
//    des photos, « Check your city », erreurs et message prêt du formulaire) ;
//  - phone : des écrans de téléphone (390 × 844, en 2×) ;
//  - full : la page entière, à 1440 et à 390 de large (mouvement réduit : la coupe complète, sans épinglage).
import {createRequire} from 'node:module';
import {mkdirSync} from 'node:fs';
const {chromium} = createRequire(import.meta.url)('/opt/node-tools/node_modules/playwright');
const out = process.argv[2] || 'shots';
const only = process.argv[3];
mkdirSync(out, {recursive: true});
const URL_ = process.env.SITE || 'http://127.0.0.1:8773/';
const b = await chromium.launch();
const want = (k) => !only || only === k;
const PHONE = {viewport: {width: 390, height: 844}, deviceScaleFactor: 2, isMobile: true, hasTouch: true};

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
// la place dans la partie « couche par couche » (0 à 1), sur ordinateur
const layer = async (p, v) => {
  await p.evaluate((v) => {
    const l = document.querySelector('[data-layers]');
    window.scrollTo({top: l.getBoundingClientRect().top + scrollY + v * (l.offsetHeight - innerHeight), behavior: 'instant'});
  }, v);
  await p.waitForTimeout(900);
};
// au téléphone : l'étape k lue sous la coupe restée en haut (frac : avancement dans le texte de l'étape)
const mStep = async (p, k, frac) => {
  await p.evaluate(
    ([k, frac]) => {
      const li = document.querySelector(`.layers__steps [data-step="${k}"]`);
      const band = document.querySelector('.layers__stage').getBoundingClientRect().height + 62;
      const line = band + (innerHeight - band) * 0.42;
      const r = li.getBoundingClientRect();
      window.scrollTo({top: r.top + scrollY - line + r.height * 0.8 * frac, behavior: 'instant'});
    },
    [k, frac],
  );
  await p.waitForTimeout(1000);
};
// l'ouverture dure 1,9 s
const ready = async (p) => {
  await p.goto(URL_, {waitUntil: 'load'});
  await p.waitForTimeout(2400);
};

/* ——— l'ouverture, image par image ——— */
if (want('intro')) {
  for (const [opts, tag] of [
    [{viewport: {width: 1440, height: 900}}, 'd'],
    [PHONE, 'm'],
  ]) {
    const ctx = await b.newContext(opts);
    const p = await ctx.newPage();
    await p.goto(URL_, {waitUntil: 'load'});
    await p.evaluate(() => document.fonts.ready);
    await p.waitForFunction(() => document.getAnimations().length >= 5);
    for (const ms of [0, 200, 400, 600, 800, 1000, 1300, 1600, 1900]) {
      await p.evaluate((t) => document.getAnimations().forEach((a) => (a.pause(), (a.currentTime = t))), ms);
      await p.waitForTimeout(80);
      await p.screenshot({path: `${out}/o-${tag}-${String(ms).padStart(4, '0')}.png`});
    }
    await ctx.close();
  }
}

/* ——— couche par couche ——— */
if (want('layers')) {
  const p = await b.newPage({viewport: {width: 1440, height: 900}});
  await ready(p);
  for (const [k, v] of [[1, 0.03], [2, 0.16], [3, 0.36], [4, 0.6], [5, 0.95]]) {
    await layer(p, v);
    await p.screenshot({path: `${out}/1440-layers-${k}.png`});
  }
  await p.close();
  const ctx = await b.newContext(PHONE);
  const m = await ctx.newPage();
  await ready(m);
  for (const [k, frac] of [[1, 0.6], [2, 0.6], [3, 0.95], [4, 0.5]]) {
    await mStep(m, k, frac);
    await m.screenshot({path: `${out}/m-layers-${k}.png`});
  }
  await ctx.close();
}

/* ——— chaque partie, sur ordinateur ——— */
if (want('sections')) {
  const p = await b.newPage({viewport: {width: 1440, height: 900}});
  await ready(p);
  await p.screenshot({path: `${out}/1440-hero.png`});
  for (const [name, sel, off, wait] of [
    ['roofs', '#roofs', -72, 1200],
    ['work', '.roofs__bar', -100, 1600],
    ['reviews', '#reviews', -72, 1200],
    ['license', '#license', -72, 1200],
    ['area', '#area', -72, 2600],
    ['estimate', '#estimate', -72, 1200],
    ['foot', '.foot', -480, 900],
  ]) {
    await go(p, sel, off, wait);
    await p.screenshot({path: `${out}/1440-${name}.png`});
  }
  // les photos : un filtre, puis la visionneuse
  await go(p, '.roofs__bar', -100, 400);
  await p.click('[data-tabs] [data-k="tile"]');
  await p.waitForTimeout(1400);
  await p.screenshot({path: `${out}/1440-work-tile.png`});
  await p.click('[data-tabs] [data-k="all"]');
  await p.waitForTimeout(600);
  await p.click('[data-work] li:nth-child(3) .ph');
  await p.waitForTimeout(700);
  await p.screenshot({path: `${out}/1440-lightbox.png`});
  await p.keyboard.press('Escape');
  await p.waitForTimeout(400);
  // « Check your city »
  await go(p, '#area', -72, 600);
  await p.fill('#city', 'Boca Raton');
  await p.click('[data-check] button');
  await p.waitForTimeout(900);
  await p.screenshot({path: `${out}/1440-area-check.png`});
  // le formulaire : envoyé vide, puis rempli
  await go(p, '#estimate', -72, 300);
  await p.click('[data-form] button[type="submit"]');
  await p.waitForTimeout(500);
  await go(p, '#estimate', -72, 400);
  await p.screenshot({path: `${out}/1440-estimate-errors.png`});
  await p.click('.chips label:has(input[value="Tile"])');
  await p.click('.chips label:has(input[value="A leak fixed"])');
  await p.fill('#f-name', 'Dana');
  await p.fill('#f-phone', '(561) 555-0123');
  await p.fill('#f-city', 'Wellington');
  await p.fill('#f-msg', 'Water stain on the ceiling after the last storm.');
  await p.click('[data-form] button[type="submit"]');
  await p.waitForTimeout(600);
  await go(p, '[data-ready]', -420, 600);
  await p.screenshot({path: `${out}/1440-estimate-ready.png`});
  await p.close();
}

/* ——— téléphone ——— */
if (want('phone')) {
  const ctx = await b.newContext(PHONE);
  const p = await ctx.newPage();
  await ready(p);
  await p.screenshot({path: `${out}/m-hero.png`});
  for (const [name, sel, off, wait] of [
    ['roofs', '#roofs', -62, 1200],
    ['work', '.roofs__bar', -80, 1600],
    ['reviews', '#reviews', -62, 1200],
    ['license', '#license', -62, 1200],
    ['area', '.area__map', -120, 2600],
    ['estimate', '#estimate', -62, 1200],
    ['foot', '.foot', -60, 900],
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
    const p = await b.newPage({viewport: {width: w, height: 900}, reducedMotion: 'reduce'});
    await p.goto(URL_, {waitUntil: 'load'});
    await p.evaluate(() => document.querySelectorAll('img[loading="lazy"]').forEach((i) => (i.loading = 'eager')));
    await p.waitForTimeout(2500);
    await p.screenshot({path: `${out}/full-${w}.png`, fullPage: true});
    await p.close();
  }
}

await b.close();
