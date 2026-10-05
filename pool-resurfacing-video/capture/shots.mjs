// Plans filmés du nouveau site Scottsdale Pool Resurfacing pour la vidéo de présentation 16:9.
// Usage : node capture/shots.mjs [desktop|mobile|nom-du-plan …]
import {openSite, record, scrollTo, settle, track, top, center, easeInOut, sine} from './lib.mjs';

const FPS = 60;
const DESK = {width: 1440, height: 900, dsf: 2};
const MOBILE = {width: 390, height: 844, dsf: 2, mobile: true};
const OFF = {x: 1520, y: 980}; // souris rangée hors du cadre

/**
 * Souris qui va d'une cible à l'autre. Chaque étape : {t, sel | xy | at, dx, dy, click, down, up, dur}.
 * La position d'une cible est lue en direct (la page peut avoir défilé entre-temps).
 */
const mover = (events, start) => {
  let idx = 0;
  let from = start;
  const target = async (page, ev) => {
    const p = ev.at ? await ev.at(page) : ev.sel ? await center(page, ev.sel) : {x: ev.xy[0], y: ev.xy[1]};
    return {x: p.x + (ev.dx || 0), y: p.y + (ev.dy || 0)};
  };
  return async (page, i, s) => {
    let click = false, down = false, up = false;
    while (idx < events.length && i >= Math.round(events[idx].t * FPS)) {
      from = await target(page, events[idx]);
      if (i === Math.round(events[idx].t * FPS)) {
        if (events[idx].click) click = true;
        if (events[idx].down) down = true;
        if (events[idx].up) up = true;
      }
      idx++;
    }
    let pos = from;
    const ev = events[idx];
    if (ev) {
      const dur = ev.dur || 0.8;
      if (s >= ev.t - dur) {
        const to = await target(page, ev);
        const u = sine(Math.min(1, (s - (ev.t - dur)) / dur));
        pos = {x: from.x + (to.x - from.x) * u, y: from.y + (to.y - from.y) * u};
      }
    }
    await page.mouse.move(pos.x, pos.y);
    if (click) { await page.mouse.down(); await page.mouse.up(); }
    if (down) await page.mouse.down();
    if (up) await page.mouse.up();
    return {mouse: pos, click: click || down};
  };
};

/** Saisie progressive dans un champ, entre t0 et t1 */
const typer = (fields) => {
  const done = {};
  return async (page, s) => {
    for (const [sel, text, t0, t1] of fields) {
      if (s < t0) continue;
      const n = Math.min(text.length, Math.floor(((s - t0) / (t1 - t0)) * text.length));
      if (done[sel] !== n) { done[sel] = n; await page.fill(sel, text.slice(0, n)); }
    }
  };
};

const scrolled = async (site, ctx, i, t) => {
  await scrollTo(site.page, Math.round(ctx.y(t / 1000)));
};

/** Place la page à y, puis laisse passer un peu de temps (apparitions déjà jouées plus haut, en-tête rangé) */
const park = async (site, y, ms = 1000) => {
  await scrollTo(site.page, y - 200);
  await settle(site.page, 200);
  await scrollTo(site.page, y);
  await settle(site.page, ms);
};

/** Un point de l'image avant / après de l'accueil, à p (0 à 1) de sa largeur */
const onCompare = (p) => async (page) => page.evaluate((p) => {
  const r = document.querySelector('[data-compare]').getBoundingClientRect();
  return {x: r.left + r.width * p, y: r.top + r.height * 0.5};
}, p);

const desktop = [
  {
    // 1. L'accueil : la passe de lisseuse, puis on fait glisser la comparaison
    name: 'd-hero',
    seconds: 11,
    fresh: true,
    async setup() {
      return {
        move: mover([
          {t: 4.0, at: onCompare(0.5), dur: 1.1},
          {t: 4.3, at: onCompare(0.5), down: true, dur: 0.2},
          {t: 5.6, at: onCompare(0.17), dur: 1.3},
          {t: 7.3, at: onCompare(0.85), dur: 1.7},
          {t: 8.5, at: onCompare(0.56), dur: 1.2},
          {t: 8.7, at: onCompare(0.56), up: true, dur: 0.2},
          {t: 10.2, sel: '.hero__ctas .btn--ink', dx: 40, dur: 1.2},
          {t: 11, sel: '.hero__ctas .btn--ink', dx: 46},
        ], {x: 1200, y: 880}),
      };
    },
    async step(site, ctx, i, t) {
      const s = t / 1000;
      if (s < 2.9) return null;
      return ctx.move(site.page, i, s);
    },
  },
  {
    // 2. Les signes : la coupe se trace, on coche trois signes, on survole un repère
    name: 'd-signs',
    seconds: 11.5,
    async setup(site) {
      const s0 = await top(site.page, '#signs');
      const list = await top(site.page, '.signs__list');
      await park(site, s0 - 420);
      return {
        y: track([[0, s0 - 420], [2.2, list - 250, easeInOut], [11.5, list - 250]]),
        move: mover([
          {t: 3.8, sel: '[data-sign="1"] .signs__t', dur: 1.0},
          {t: 4.2, sel: '[data-sign="1"] .signs__t', click: true, dur: 0.2},
          {t: 5.4, sel: '[data-sign="3"] .signs__t', click: true},
          {t: 6.7, sel: '[data-sign="6"] .signs__t', click: true},
          {t: 8.3, sel: '.section [data-pin="5"] .dot', dur: 1.2},
          {t: 8.9, sel: '.section [data-pin="5"] .dot', click: true, dur: 0.3},
          {t: 10.4, sel: '[data-sign="4"] .signs__t', dur: 1.2},
          {t: 11.5, sel: '[data-sign="4"] .signs__t', dx: 20},
        ], {x: 900, y: 880}),
      };
    },
    async step(site, ctx, i, t) {
      const s = t / 1000;
      await scrollTo(site.page, Math.round(ctx.y(s)));
      if (s < 2.8) return null;
      return ctx.move(site.page, i, s);
    },
  },
  {
    // 3. Les finitions : trois choix, chacune s'ouvre en cercle sous l'eau
    name: 'd-finishes',
    seconds: 12,
    async setup(site) {
      const f0 = await top(site.page, '#finishes');
      const st = await top(site.page, '.finishes__stage');
      await park(site, f0 - 300);
      return {
        y: track([[0, f0 - 300], [2.2, st - 96, easeInOut], [12, st - 96]]),
        move: mover([
          {t: 3.6, sel: '[data-fin="pebble-tec"] img', dur: 1.1},
          {t: 3.8, sel: '[data-fin="pebble-tec"] img', click: true, dur: 0.2},
          {t: 6.1, sel: '[data-fin="glass-tile"] img', click: true, dur: 1.0},
          {t: 8.4, sel: '[data-fin="pebble-sheen"] img', click: true, dur: 1.0},
          {t: 10.6, sel: '[data-spec-ask]', dx: 20, dur: 1.2},
          {t: 12, sel: '[data-spec-ask]', dx: 30},
        ], {x: 1300, y: 880}),
      };
    },
    async step(site, ctx, i, t) {
      const s = t / 1000;
      await scrollTo(site.page, Math.round(ctx.y(s)));
      if (s < 2.6) return null;
      return ctx.move(site.page, i, s);
    },
  },
  {
    // 4. Les services : les cartes s'empilent
    name: 'd-services',
    seconds: 10,
    async setup(site) {
      const s0 = await top(site.page, '.services');
      const end = await site.page.evaluate(() => { const c = document.querySelector('.cards'); return c.getBoundingClientRect().bottom + scrollY; });
      await park(site, s0 + 60);
      return {y: track([[0, s0 + 60], [0.8, s0 + 60], [9.6, end - 860, sine], [10, end - 860]])};
    },
    step: scrolled,
  },
  {
    // 5. Le déroulé : vidange, sablage, finition, remplissage
    name: 'd-process',
    seconds: 13,
    async setup(site) {
      const steps = await site.page.evaluate(() => [...document.querySelectorAll('[data-step]')].map((s) => ({t: s.getBoundingClientRect().top + scrollY, h: s.offsetHeight})));
      const line = 0.58 * 900;
      const a = steps[0].t - line + 20;
      const b = steps[6].t + steps[6].h - line - 20;
      await park(site, a - 120);
      return {y: track([[0, a - 120], [1.0, a, easeInOut], [12.4, b, sine], [13, b]])};
    },
    step: scrolled,
  },
  {
    // 6. Les avis : la note, la citation, puis le mur d'avis qui défile
    name: 'd-reviews',
    seconds: 9,
    async setup(site) {
      const r = await top(site.page, '#reviews');
      await park(site, r - 500);
      return {y: track([[0, r - 500], [1.8, r - 30, easeInOut], [4.6, r - 30], [7.6, r + 420, easeInOut], [9, r + 420]])};
    },
    step: scrolled,
  },
  {
    // 7. L'offre, puis une question de la FAQ qui s'ouvre
    name: 'd-faq',
    seconds: 10,
    async setup(site) {
      const o = await top(site.page, '.offer');
      const q = await top(site.page, '#faq');
      await park(site, o - 300);
      return {
        y: track([[0, o - 300], [1.6, o - 40, easeInOut], [4.4, o - 40], [6.0, q - 30, easeInOut], [10, q - 30]]),
        move: mover([
          {t: 7.3, sel: '.faq details:nth-of-type(4) summary', dx: 120, dur: 1.1},
          {t: 7.6, sel: '.faq details:nth-of-type(4) summary', dx: 120, click: true, dur: 0.2},
          {t: 10, sel: '.faq details:nth-of-type(4) summary', dx: 180, dy: 60},
        ], {x: 1200, y: 880}),
      };
    },
    async step(site, ctx, i, t) {
      const s = t / 1000;
      await scrollTo(site.page, Math.round(ctx.y(s)));
      if (s < 6.0) return null;
      return ctx.move(site.page, i, s);
    },
  },
  {
    // 8. Le contact : le formulaire rempli, les services cochés, puis le remerciement
    name: 'd-contact',
    seconds: 13.5,
    async setup(site) {
      const c = await top(site.page, '#contact');
      await park(site, c - 400);
      return {
        y: track([[0, c - 400], [1.8, c + 40, easeInOut], [13.5, c + 40]]),
        move: mover([
          {t: 2.8, sel: 'input[name="name"]', click: true, dur: 1.0},
          {t: 4.1, sel: 'input[name="phone"]', click: true},
          {t: 5.5, sel: 'input[name="location"]', click: true},
          {t: 7.0, sel: '.chips label:nth-child(1) span', click: true},
          {t: 7.7, sel: '.chips label:nth-child(3) span', click: true, dur: 0.6},
          {t: 8.5, sel: 'textarea[name="project"]', click: true},
          {t: 11.6, sel: '[data-form] button[type="submit"]', click: true, dur: 1.0},
          {t: 13.2, xy: [1180, 720]},
        ], {x: 1200, y: 880}),
        type: typer([
          ['input[name="name"]', 'Maria Lopez', 3.0, 3.8],
          ['input[name="phone"]', '(480) 555-0142', 4.3, 5.1],
          ['input[name="location"]', 'McCormick Ranch', 5.7, 6.5],
          ['textarea[name="project"]', 'The plaster is peeling near the steps. Thinking about Diamond Brite.', 8.7, 10.9],
        ]),
      };
    },
    async step(site, ctx, i, t) {
      const s = t / 1000;
      await scrollTo(site.page, Math.round(ctx.y(s)));
      await ctx.type(site.page, s);
      if (s < 2.0) return null;
      return ctx.move(site.page, i, s);
    },
  },
  {
    // 9. Le pied de page : le grand numéro
    name: 'd-footer',
    seconds: 6,
    async setup(site) {
      const f = await top(site.page, '.foot');
      const max = await site.page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
      await park(site, f - 900);
      return {y: track([[0, f - 900], [5.4, max, easeInOut], [6, max]])};
    },
    step: scrolled,
  },
];

/** Geste du doigt (CDP) : posé, glissé, levé */
const touch = async (site, type, x, y) => {
  await site.cdp.send('Input.dispatchTouchEvent', {type, touchPoints: type === 'touchEnd' ? [] : [{x, y}]});
};

const mobile = [
  {
    // l'accueil : la passe de lisseuse, puis le doigt fait glisser la comparaison
    name: 'm-hero',
    seconds: 9,
    fresh: true,
    async setup(site) {
      const r = await site.page.evaluate(() => { const b = document.querySelector('[data-compare]').getBoundingClientRect(); return {x: b.left, y: b.top, w: b.width, h: b.height}; });
      const gx = track([[3.6, 0.55], [4.6, 0.2, sine], [5.8, 0.82, sine], [6.6, 0.5, sine]]);
      return {r, gx, y: track([[0, 0], [7.0, 0], [8.6, 330, easeInOut], [9, 330]])};
    },
    async step(site, ctx, i, t) {
      const s = t / 1000;
      await scrollTo(site.page, Math.round(ctx.y(s)));
      const {r} = ctx;
      const x = r.x + r.w * ctx.gx(s);
      const y = r.y + r.h * 0.55;
      if (i === Math.round(3.5 * FPS)) { await touch(site, 'touchStart', x, y); return {mouse: {x, y}, click: true}; }
      if (s > 3.5 && s < 6.7) { await touch(site, 'touchMove', x, y); return {mouse: {x, y}}; }
      if (i === Math.round(6.7 * FPS)) { await touch(site, 'touchEnd', x, y); return {mouse: {x, y}}; }
      return null;
    },
  },
  {
    // les finitions : trois pastilles touchées
    name: 'm-finishes',
    seconds: 8,
    async setup(site) {
      const v = await top(site.page, '.finishes__view');
      await park(site, v - 76);
      await site.page.evaluate(() => { const r = document.querySelector('[data-fin-rail]'); r.style.scrollSnapType = 'none'; r.scrollLeft = 330; });
      await settle(site.page, 300);
      return {
        y: () => v - 76,
        taps: [[1.4, '[data-fin="pebble-tec"] img'], [3.8, '[data-fin="pebble-sheen"] img'], [6.0, '[data-fin="hydrazzo"] img']].map(([t, sel]) => ({i: Math.round(t * FPS), sel})),
      };
    },
    async step(site, ctx, i, t) {
      await scrollTo(site.page, Math.round(ctx.y(t / 1000)));
      const tap = ctx.taps.find((x) => x.i === i);
      if (!tap) return null;
      const c = await center(site.page, tap.sel);
      await site.page.touchscreen.tap(c.x, c.y);
      return {mouse: c, click: true};
    },
  },
  {
    // le déroulé au défilement, aperçu en haut de l'écran
    name: 'm-process',
    seconds: 8,
    async setup(site) {
      const steps = await site.page.evaluate(() => [...document.querySelectorAll('[data-step]')].map((s) => ({t: s.getBoundingClientRect().top + scrollY, h: s.offsetHeight})));
      const line = 0.8 * 844;
      const a = steps[0].t - line + 20;
      const b = steps[6].t + steps[6].h - line - 20;
      await park(site, a - 60);
      return {y: track([[0, a - 60], [0.6, a, easeInOut], [7.6, b, sine], [8, b]])};
    },
    step: scrolled,
  },
];

const args = process.argv.slice(2);
const pick = (list, group) => list.filter((s) => !args.length || args.includes(s.name) || args.includes(group));

for (const [list, cfg, group] of [[desktop, DESK, 'desktop'], [mobile, MOBILE, 'mobile']]) {
  for (const shot of pick(list, group)) {
    const site = await openSite(cfg);
    site.page.on('pageerror', (e) => console.log(`  ${shot.name} : ${e.message}`));
    if (!shot.fresh) await settle(site.page, 2800);
    const ctx = await shot.setup(site);
    await record(site, {name: shot.name, fps: FPS, seconds: shot.seconds, step: (i, t) => shot.step(site, ctx, i, t)});
    await site.browser.close();
  }
}
