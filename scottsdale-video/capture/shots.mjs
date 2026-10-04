// Plans filmés du nouveau site Scottsdale Pool Patio & Landscape pour la vidéo de présentation 16:9.
// Usage : node capture/shots.mjs [desktop|mobile|nom-du-plan …]
import {openSite, record, scrollTo, settle, track, top, center, easeInOut, sine} from './lib.mjs';

const FPS = 60;
const DESK = {width: 1440, height: 900, dsf: 2};
const MOBILE = {width: 390, height: 844, dsf: 2, mobile: true};
const OFF = {x: 1520, y: 980}; // souris rangée hors du cadre

/**
 * Souris qui va d'une cible à l'autre. Chaque étape : {t, sel | xy | at, dx, dy, click, dur}.
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
    let click = false;
    while (idx < events.length && i >= Math.round(events[idx].t * FPS)) {
      from = await target(page, events[idx]);
      if (events[idx].click && i === Math.round(events[idx].t * FPS)) click = true;
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
    return {mouse: pos, click};
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

const desktop = [
  {
    // 1. L'accroche : le soleil se lève, la souris passe sur le bouton, puis le cercle s'ouvre au défilement
    name: 'd-hero',
    seconds: 13,
    fresh: true,
    async setup(site) {
      const intro = await top(site.page, '.intro__text');
      return {
        y: track([[0, 0], [4.6, 0], [9.0, 1080, easeInOut], [10.0, 1080], [13, intro - 190, easeInOut]]),
        move: mover([
          {t: 3.5, sel: '.hero__cta .btn', dx: 30, dur: 1.0},
          {t: 4.6, xy: [OFF.x, OFF.y], dur: 0.9},
        ], {x: 1180, y: 860}),
      };
    },
    async step(site, ctx, i, t) {
      const s = t / 1000;
      await scrollTo(site.page, Math.round(ctx.y(s)));
      if (s < 2.4) return null;
      return ctx.move(site.page, i, s);
    },
  },
  {
    // 2. Trois métiers : les volets se découvrent, puis s'ouvrent l'un après l'autre au survol
    name: 'd-disc',
    seconds: 9.5,
    async setup(site) {
      const d = await top(site.page, '.disc');
      const p = await top(site.page, '[data-panels]');
      await park(site, d - 420);
      return {
        y: track([[0, d - 420], [2.4, p - 112, easeInOut], [9.5, p - 112]]),
        move: mover([
          {t: 4.2, sel: '[data-panel]:nth-child(2)', dy: 120, dur: 1.0},
          {t: 5.9, sel: '[data-panel]:nth-child(3)', dy: 120},
          {t: 7.7, sel: '[data-panel]:nth-child(1)', dy: 120},
          {t: 9.4, sel: '[data-panel]:nth-child(1)', dy: 60},
        ], {x: 1250, y: 860}),
      };
    },
    async step(site, ctx, i, t) {
      const s = t / 1000;
      await scrollTo(site.page, Math.round(ctx.y(s)));
      if (s < 3.0) return null;
      return ctx.move(site.page, i, s);
    },
  },
  {
    // 3. Les 25 prestations : l'index défile, la photo de chaque élément suit la souris
    name: 'd-elements',
    seconds: 10,
    async setup(site) {
      const e = await top(site.page, '.elements');
      const l = await top(site.page, '.el-list');
      await park(site, e - 300);
      return {
        y: track([[0, e - 300], [2.2, l - 160, easeInOut], [2.8, l - 160], [10, l + 380, sine]]),
        move: mover([
          {t: 3.4, sel: '.el[data-el="1"] .el__name', dx: 150, dur: 1.0},
          {t: 4.8, sel: '.el[data-el="2"] .el__name', dx: 160},
          {t: 6.2, sel: '.el[data-el="3"] .el__name', dx: 120},
          {t: 7.6, sel: '.el[data-el="4"] .el__name', dx: 150},
          {t: 9.0, sel: '.el[data-el="5"] .el__name', dx: 160},
          {t: 10, sel: '.el[data-el="5"] .el__name', dx: 180},
        ], {x: 1000, y: 860}),
      };
    },
    async step(site, ctx, i, t) {
      const s = t / 1000;
      await scrollTo(site.page, Math.round(ctx.y(s)));
      if (s < 2.4) return null;
      return ctx.move(site.page, i, s);
    },
  },
  {
    // 4. Les formes de bassin : le plan se trace, puis on en choisit trois autres
    name: 'd-pools',
    seconds: 13.5,
    async setup(site) {
      const p = await top(site.page, '.pools');
      const g = await top(site.page, '.pools__grid');
      await park(site, p - 350);
      return {
        y: track([[0, p - 350], [2.2, g - 110, easeInOut], [13.5, g - 110]]),
        move: mover([
          {t: 5.2, sel: '.type[data-type="lap"]', dx: -120, click: true, dur: 1.1},
          {t: 7.9, sel: '.type[data-type="custom"]', dx: -120, click: true},
          {t: 10.6, sel: '.type[data-type="plunge"]', dx: -120, click: true},
          {t: 13.4, sel: '.type[data-type="plunge"]', dx: 60, dy: 30},
        ], {x: 1180, y: 860}),
      };
    },
    async step(site, ctx, i, t) {
      const s = t / 1000;
      await scrollTo(site.page, Math.round(ctx.y(s)));
      if (s < 3.6) return null;
      return ctx.move(site.page, i, s);
    },
  },
  {
    // 5. Les réalisations : défilement horizontal, pastille « View », puis la visionneuse
    name: 'd-work',
    seconds: 12,
    async setup(site) {
      const w = await top(site.page, '.work');
      const dist = await site.page.evaluate(() => {
        const t = window.ScrollTrigger.getAll().find((x) => x.pin && x.trigger.matches('[data-work]'));
        return t.end - t.start;
      });
      await park(site, w - 500);
      // la photo la plus proche du centre de l'écran, lue au moment voulu
      const nearest = async (page) => page.evaluate(() => {
        let best = null;
        for (const b of document.querySelectorAll('.shot__btn')) {
          const r = b.getBoundingClientRect();
          const d = Math.abs(r.left + r.width / 2 - innerWidth / 2);
          if (!best || d < best.d) best = {d, x: r.left + r.width / 2, y: r.top + r.height / 2};
        }
        return best;
      });
      return {
        y: track([[0, w - 500], [1.8, w, easeInOut], [8.4, w + dist * 0.6, sine], [12, w + dist * 0.6]]),
        move: mover([
          {t: 4.0, xy: [900, 520], dur: 1.2},
          {t: 7.6, xy: [760, 500], dur: 2.0},
          {t: 9.4, at: nearest, dx: 40, dy: 20, dur: 1.0},
          {t: 9.9, at: nearest, dx: 40, dy: 20, click: true, dur: 0.3},
          {t: 11.3, sel: '[data-lb-next]', click: true, dur: 1.0},
          {t: 12, sel: '[data-lb-next]', dx: 10},
        ], {x: 1100, y: 840}),
      };
    },
    async step(site, ctx, i, t) {
      const s = t / 1000;
      await scrollTo(site.page, Math.round(ctx.y(s)));
      if (s < 2.6) return null;
      const r = await ctx.move(site.page, i, s);
      // sur la galerie, la pastille « View » du site suffit : la flèche ne revient qu'avec la visionneuse
      return s < 9.88 ? {} : r;
    },
  },
  {
    // 6. Le déroulé : les étapes s'allument, la photo suit, puis la frise des délais
    name: 'd-process',
    seconds: 11,
    async setup(site) {
      const p = await top(site.page, '.process');
      const tl = await top(site.page, '.timeline');
      await park(site, p - 80);
      return {y: track([[0, p - 80], [1.4, p - 80], [9.6, tl - 560, sine], [11, tl - 560]])};
    },
    step: scrolled,
  },
  {
    // 7. Les avis : la note et les étoiles, puis deux avis de plus
    name: 'd-proof',
    seconds: 9,
    async setup(site) {
      const p = await top(site.page, '.proof');
      await park(site, p - 650);
      return {
        y: track([[0, p - 650], [2.0, p - 30, easeInOut], [9, p - 30]]),
        move: mover([
          {t: 4.3, sel: '[data-q-next]', click: true, dur: 1.1},
          {t: 6.8, sel: '[data-q-next]', click: true, dur: 0.6},
          {t: 8.8, xy: [700, 760]},
        ], {x: 900, y: 860}),
      };
    },
    async step(site, ctx, i, t) {
      const s = t / 1000;
      await scrollTo(site.page, Math.round(ctx.y(s)));
      if (s < 3.0) return null;
      return ctx.move(site.page, i, s);
    },
  },
  {
    // 8. Le devis : le projet, le budget, les coordonnées, puis le remerciement
    name: 'd-quote',
    seconds: 14,
    async setup(site) {
      const q = await top(site.page, '.quote-sec');
      await park(site, q - 500);
      return {
        y: track([[0, q - 500], [2.0, q - 40, easeInOut], [14, q - 40]]),
        move: mover([
          {t: 3.0, sel: '.choice:has(input[value="New pool"]) span', click: true, dur: 1.0},
          {t: 3.8, sel: '.choice:has(input[value="Landscape"]) span', click: true},
          {t: 4.8, sel: '[data-form-next]', click: true},
          {t: 6.0, sel: '.choice:has(input[value="$250k–$500k"]) span', click: true, dur: 0.9},
          {t: 7.0, sel: '[data-form-next]', click: true},
          {t: 7.9, sel: 'input[name="name"]', click: true},
          {t: 9.2, sel: 'input[name="email"]', click: true},
          {t: 10.7, sel: 'input[name="phone"]', click: true},
          {t: 12.4, sel: '[data-form-next]', click: true, dur: 1.0},
          {t: 13.6, xy: [1150, 700]},
        ], {x: 1100, y: 860}),
        type: typer([
          ['input[name="name"]', 'Jane Miller', 8.1, 8.9],
          ['input[name="email"]', 'jane@example.com', 9.4, 10.4],
          ['input[name="phone"]', '(480) 555-0137', 10.9, 11.7],
        ]),
      };
    },
    async step(site, ctx, i, t) {
      const s = t / 1000;
      await scrollTo(site.page, Math.round(ctx.y(s)));
      await ctx.type(site.page, s);
      if (s < 2.4) return null;
      return ctx.move(site.page, i, s);
    },
  },
  {
    // 9. Le pied de page : le grand mot se remplit
    name: 'd-footer',
    seconds: 6,
    async setup(site) {
      const f = await top(site.page, '.ft');
      const max = await site.page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
      await park(site, f - 900);
      return {y: track([[0, f - 900], [5.4, max, easeInOut], [6, max]])};
    },
    step: scrolled,
  },
];

const mobile = [
  {
    name: 'm-hero',
    seconds: 8.5,
    fresh: true,
    async setup() {
      return {y: track([[0, 0], [3.4, 0], [7.4, 760, easeInOut], [8.5, 760]])};
    },
    step: scrolled,
  },
  {
    name: 'm-pools',
    seconds: 8,
    async setup(site) {
      const g = await top(site.page, '.pools__grid');
      await park(site, g - 76);
      return {
        y: track([[0, g - 76], [1.2, g - 76], [7.4, g + 110, sine], [8, g + 110]]),
        taps: [[2.0, '.type[data-type="lap"] .type__name'], [4.2, '.type[data-type="custom"] .type__name'], [6.3, '.type[data-type="plunge"] .type__name']].map(([t, sel]) => ({i: Math.round(t * FPS), sel})),
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
    name: 'm-work',
    seconds: 7,
    async setup(site) {
      const h = await top(site.page, '.work__head');
      await park(site, h - 90);
      const step = await site.page.evaluate(() => {
        const v = document.querySelector('.work__viewport');
        v.style.scrollSnapType = 'none';
        const s = [...document.querySelectorAll('.shot')];
        return s[1].offsetLeft - s[0].offsetLeft;
      });
      return {y: () => h - 90, x: track([[0, 0], [1.4, 0], [2.6, step, easeInOut], [3.6, step], [4.8, step * 2, easeInOut], [5.8, step * 2], [7, step * 3, easeInOut]])};
    },
    async step(site, ctx, i, t) {
      const s = t / 1000;
      await site.page.evaluate((x) => { document.querySelector('.work__viewport').scrollLeft = x; }, Math.round(ctx.x(s)));
      return null;
    },
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
