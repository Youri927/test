// Captures pour la relecture et les planches. Le site est lu sur le serveur local :
//   python3 -m http.server 8791 --bind 127.0.0.1 --directory dist-web   puis   node tools/shots.mjs <dossier> [intro|roofs|sections|phone]
//  - intro : l'ouverture image par image (ordinateur et téléphone), l'horloge des transitions arrêtée et calée ;
//  - roofs : le dessin des toits qui se trace (images calées), les trois toits, la ligne de toit à mi-chemin, un
//    repère survolé ;
//  - sections : chaque partie à la taille d'un écran d'ordinateur (1440 × 900), et les états (photo qui se découvre,
//    question ouverte, erreurs du formulaire, message prêt, toit du pied de page) ;
//  - phone : des écrans de téléphone (390 × 844, en 2×).
import {createRequire} from 'node:module';
import {mkdirSync} from 'node:fs';
const {chromium} = createRequire(import.meta.url)('/opt/node-tools/node_modules/playwright');
const out = process.argv[2] || 'shots';
const only = process.argv[3];
mkdirSync(out, {recursive: true});
const URL_ = process.env.SITE || 'http://127.0.0.1:8791/';
const b = await chromium.launch();
const want = (k) => !only || only === k;
const DESK = {viewport: {width: 1440, height: 900}};
const PHONE = {viewport: {width: 390, height: 844}, deviceScaleFactor: 2, isMobile: true, hasTouch: true};

// amène un élément à un décalage donné sous l'en-tête, puis laisse les dévoilements se terminer
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
// l'ouverture se joue en 1,8 s une fois la police là
const ready = async (p) => {
  await p.goto(URL_, {waitUntil: 'load'});
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(2300);
};
const shot = (p, name) => p.screenshot({path: `${out}/${name}.png`});
// arrête toutes les animations d'un élément (et de ses enfants) à un instant donné
const freeze = (p, sel, t) =>
  p.evaluate(
    ([s, t]) => {
      const el = document.querySelector(s);
      const all = [...el.getAnimations({subtree: true})];
      all.forEach((a) => (a.pause(), (a.currentTime = t)));
      return all.length;
    },
    [sel, t],
  );

/* ——— l'ouverture, image par image ——— */
if (want('intro')) {
  for (const [opts, tag, times] of [
    [DESK, 'd', [0, 250, 500, 750, 1000, 1300, 1900]],
    [PHONE, 'm', [0, 500, 1000, 1900]],
  ]) {
    const ctx = await b.newContext(opts);
    const p = await ctx.newPage();
    await p.goto(URL_, {waitUntil: 'load'});
    // les rampants (2), les mots (2 × 2) et l'étoile (2) : 8 transitions
    await p.waitForFunction(() => document.querySelector('.gable').getAnimations({subtree: true}).length >= 8);
    for (const ms of times) {
      await freeze(p, '.gable', ms);
      await p.waitForTimeout(80);
      await shot(p, `o-${tag}-${String(ms).padStart(4, '0')}`);
    }
    await ctx.close();
  }
}

/* ——— les trois toits ——— */
if (want('roofs')) {
  const ctx = await b.newContext(DESK);
  const p = await ctx.newPage();
  await ready(p);
  await go(p, '#roofs', 300, 0);
  await p.waitForFunction(() => document.querySelector('[data-roof]').getAnimations().length > 0);
  for (const ms of [0, 450, 900, 1300, 2000]) {
    await p.evaluate((t) => {
      const svg = document.querySelector('[data-profile]');
      svg.getAnimations({subtree: true}).forEach((a) => (a.pause(), (a.currentTime = t)));
    }, ms);
    await p.waitForTimeout(80);
    await p.locator('.roofs__stage').screenshot({path: `${out}/draw-${String(ms).padStart(4, '0')}.png`});
  }
  await p.evaluate(() => document.querySelector('[data-profile]').getAnimations({subtree: true}).forEach((a) => a.finish()));
  await p.waitForTimeout(300);
  // les onglets et le dessin, cadrés
  const stageShot = async (name) => {
    const clip = await p.evaluate(() => {
      const r = document.querySelector('.tabs').getBoundingClientRect();
      const s = document.querySelector('.roofs__stage').getBoundingClientRect();
      return {x: s.left - 20, y: r.top - 20, width: s.width + 40, height: s.bottom - r.top + 40};
    });
    await p.screenshot({path: `${out}/${name}.png`, clip});
  };
  await go(p, '[data-tabs]', -24, 600);
  await stageShot('roofs-home');
  await p.hover('#panel-home .spots li:nth-child(2)');
  await p.waitForTimeout(300);
  await p.locator('.roofs__stage').screenshot({path: `${out}/roofs-hover.png`});
  await p.mouse.move(5, 5);
  // à mi-chemin vers le mobile-home : l'horloge de la page est arrêtée (la ligne de toit suit performance.now et les
  // images de requestAnimationFrame), l'indicateur et les fondus sont calés à la même étape
  await p.evaluate(() => {
    const realNow = performance.now.bind(performance);
    window.__frozen = realNow();
    performance.now = () => (window.__frozen ?? realNow());
    const realRaf = window.requestAnimationFrame.bind(window);
    window.requestAnimationFrame = (cb) => realRaf(() => cb(performance.now()));
  });
  await p.click('#tab-mobile');
  await p.evaluate(() => {
    window.__frozen += 390;
    document.querySelector('[data-bar]').getAnimations().forEach((a) => (a.pause(), (a.currentTime = 300)));
    document.querySelector('[data-profile]').getAnimations({subtree: true}).forEach((a) => (a.pause(), (a.currentTime = 300)));
  });
  await p.waitForTimeout(250);
  const stage = await p.evaluate(() => {
    const r = document.querySelector('.tabs').getBoundingClientRect();
    const s = document.querySelector('.roofs__stage').getBoundingClientRect();
    return {x: s.left, y: r.top - 16, width: s.width, height: s.bottom - r.top + 16};
  });
  await p.screenshot({path: `${out}/roofs-morph.png`, clip: stage});
  await p.evaluate(() => {
    window.__frozen = null;
    document.querySelector('[data-bar]').getAnimations().forEach((a) => a.play());
    document.querySelector('[data-profile]').getAnimations({subtree: true}).forEach((a) => a.play());
  });
  await p.waitForTimeout(1500);
  await go(p, '[data-tabs]', -24, 400);
  await stageShot('roofs-mobile');
  await p.click('#tab-commercial');
  await p.waitForTimeout(1500);
  await go(p, '[data-tabs]', -24, 400);
  await stageShot('roofs-commercial');
  await ctx.close();
}

/* ——— les parties, et les états ——— */
if (want('sections')) {
  const ctx = await b.newContext(DESK);
  const p = await ctx.newPage();
  await ready(p);
  await shot(p, '1440-hero');
  await go(p, '#storm', 0);
  await shot(p, '1440-storm');
  await go(p, '.leak', -300);
  await shot(p, '1440-leak');
  await go(p, '#replace', 0);
  await shot(p, '1440-replace');
  await go(p, '.job', -120, 2200);
  await shot(p, '1440-job');
  await go(p, '#warranty', 0, 2200);
  await shot(p, '1440-warranty');
  await go(p, '#family', 0, 2400);
  await shot(p, '1440-family');
  await go(p, '#reviews', 0);
  await shot(p, '1440-reviews');
  await go(p, '#area', 0);
  await shot(p, '1440-area');
  await go(p, '#faq', 0, 600);
  await p.click('.faq details:nth-of-type(1) summary');
  await p.waitForTimeout(800);
  await shot(p, '1440-faq');
  await go(p, '#estimate', 0);
  await shot(p, '1440-estimate');
  await go(p, '.foot', 0, 2400);
  await shot(p, '1440-foot');

  // les photos qui se découvrent, arrêtées en cours de route (page neuve : elles n'ont pas encore été vues ; on les
  // charge d'abord, pour qu'elles partent ensemble, chacune avec son petit retard)
  await p.goto(URL_, {waitUntil: 'load'});
  await p.waitForTimeout(800);
  await p.evaluate(() => Promise.all([...document.querySelectorAll('.job img')].map((i) => ((i.loading = 'eager'), i.decode().catch(() => null)))));
  await go(p, '.job', -160, 0);
  await p.waitForFunction(() => [...document.querySelectorAll('.job img')].every((i) => i.getAnimations().length > 0), null, {timeout: 5000});
  await freeze(p, '.job', 560);
  await p.waitForTimeout(100);
  await p.locator('.job').screenshot({path: `${out}/wipe.png`});

  // le formulaire : les erreurs, puis le message prêt
  await p.goto(URL_, {waitUntil: 'load'});
  await p.waitForTimeout(800);
  await go(p, '#estimate', 0, 600);
  await p.click('.form__go .btn');
  await p.waitForTimeout(500);
  await go(p, '#estimate', 0, 500);
  await shot(p, '1440-form-errors');
  await p.check('input[name="kind"][value="Mobile home"]', {force: true});
  await p.check('input[name="need"][value="Roof repair"]', {force: true});
  await p.fill('#f-address', '1234 Example Rd, Lakeland, FL');
  await p.fill('#f-name', 'Jordan Avery');
  await p.fill('#f-phone', '863-555-0142');
  await p.fill('#f-msg', 'Water stain on the living room ceiling since the last storm, near the vent.');
  // la page ouvre la messagerie par un lien mailto: ; le navigateur sans tête n'a pas d'application d'e-mail
  await p.click('.form__go .btn');
  await p.waitForTimeout(1500);
  await go(p, '[data-ready]', -60, 700);
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
  await go(p, '[data-tabs]', -20, 2800);
  await shot(p, 'm-roofs');
  await go(p, '#storm', 0);
  await shot(p, 'm-storm');
  await go(p, '.job', -140, 2000);
  await shot(p, 'm-job');
  await go(p, '.ruler', -80, 2200);
  await shot(p, 'm-warranty');
  await go(p, '.license', -40, 1600);
  await shot(p, 'm-license');
  await go(p, '.form', -10);
  await shot(p, 'm-form');
  await go(p, '.foot', 0, 2400);
  await shot(p, 'm-foot');
  await ctx.close();
}
await b.close();
console.log('captures dans', out);
