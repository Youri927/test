// Plans filmés du nouveau site WAVE Pool Remodeling pour la vidéo de présentation 16:9.
// Usage : node capture/shots.mjs [desktop|mobile|nom-du-plan …]
import {openSite, record, scrollTo, settle, track, top, center, easeInOut, sine} from './lib.mjs';

const FPS = 60;
const DESK = {width: 1440, height: 900, dsf: 2};
const MOBILE = {width: 390, height: 844, dsf: 2, mobile: true};

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
      if (i === Math.round(events[idx].t * FPS) && events[idx].click) click = true;
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

/** Place la page à y en y descendant (les apparitions plus haut sont déjà jouées), puis laisse passer un peu de temps */
const park = async (site, y, ms = 1000) => {
  const page = site.page;
  for (let v = 0; v < y - 300; v += 600) { await scrollTo(page, v); await settle(page, 60); }
  await scrollTo(page, y - 200);
  await settle(page, 200);
  await scrollTo(page, y);
  await settle(page, ms);
};

const desktop = [
  {
    // 1. L'accueil : l'arche monte au chargement, puis s'ouvre en plein écran au défilement
    name: 'd-hero',
    seconds: 11,
    fresh: true,
    async setup() {
      return {
        y: track([[0, 0], [3.8, 0], [8.4, 1110, easeInOut], [11, 1110]]),
        move: mover([
          {t: 2.6, sel: '.hero__ctas .btn--lime', dx: 30, dur: 1.0},
          {t: 3.5, sel: '.hero__ctas .btn--lime', dx: 36, dur: 0.6},
          {t: 4.4, xy: [1500, 960], dur: 0.8},
        ], {x: 1300, y: 960}),
      };
    },
    async step(site, ctx, i, t) {
      const s = t / 1000;
      await scrollTo(site.page, Math.round(ctx.y(s)));
      if (s < 1.6 || s > 4.4) return null;
      return ctx.move(site.page, i, s);
    },
  },
  {
    // 2. L'entreprise : le texte s'allume mot à mot, les chiffres montent
    name: 'd-intro',
    seconds: 8,
    async setup(site) {
      const a = await top(site.page, '.intro');
      await park(site, a - 500, 600);
      return {y: track([[0, a - 500], [7.4, a + 360, sine], [8, a + 360]])};
    },
    step: scrolled,
  },
  {
    // 3. Les trois métiers : l'index, puis Remodel (l'arche monte)
    name: 'd-paths',
    seconds: 10,
    async setup(site) {
      const s0 = await top(site.page, '#services');
      const r = await top(site.page, '#remodel');
      await park(site, s0 - 40);
      return {
        y: track([[0, s0 - 40], [3.4, s0 - 40], [5.6, r - 60, easeInOut], [10, r + 40, sine]]),
        move: mover([
          {t: 1.2, sel: '.paths__index li:nth-child(1) em', dur: 1.0},
          {t: 2.0, sel: '.paths__index li:nth-child(2) em', dur: 0.7},
          {t: 2.8, sel: '.paths__index li:nth-child(3) em', dur: 0.7},
          {t: 3.6, xy: [1500, 900], dur: 0.7},
        ], {x: 1300, y: 960}),
      };
    },
    async step(site, ctx, i, t) {
      const s = t / 1000;
      await scrollTo(site.page, Math.round(ctx.y(s)));
      if (s < 0.3 || s > 3.6) return null;
      return ctx.move(site.page, i, s);
    },
  },
  {
    // 4. Le coût : l'échelle se remplit, puis ce qui fait varier le prix
    name: 'd-cost',
    seconds: 10,
    async setup(site) {
      const c = await top(site.page, '#cost');
      await park(site, c - 300);
      return {y: track([[0, c - 300], [1.8, c + 150, easeInOut], [5.6, c + 150], [8.2, c + 820, easeInOut], [10, c + 820]])};
    },
    step: scrolled,
  },
  {
    // 5. Les chantiers : chaque photo monte comme une vague
    name: 'd-work',
    seconds: 10,
    async setup(site) {
      const w = await top(site.page, '#work');
      const end = await site.page.evaluate(() => { const st = window.ScrollTrigger.getAll().find((t) => t.pin && t.pin.matches('[data-work-pin]')); return st.end; });
      await park(site, w - 260);
      return {y: track([[0, w - 260], [1.0, w, easeInOut], [9.6, end - 40, sine], [10, end - 40]])};
    },
    step: scrolled,
  },
  {
    // 6. La saison : les températures montent, le mois en cours est repéré
    name: 'd-season',
    seconds: 8,
    async setup(site) {
      const s0 = await top(site.page, '#season');
      const ch = await top(site.page, '.temps');
      await park(site, s0 - 360);
      return {y: track([[0, s0 - 360], [1.6, s0 + 30, easeInOut], [4.2, s0 + 30], [6.4, ch - 300, easeInOut], [8, ch - 300]])};
    },
    step: scrolled,
  },
  {
    // 7. Les secteurs : la carte se trace, on survole trois villes
    name: 'd-areas',
    seconds: 10,
    async setup(site) {
      const a = await top(site.page, '#areas');
      await park(site, a - 420);
      return {
        y: track([[0, a - 420], [1.8, a + 120, easeInOut], [10, a + 120]]),
        move: mover([
          {t: 5.0, sel: '[data-areas] [data-area="fountain-hills"] b', dur: 1.1},
          {t: 6.6, sel: '[data-areas] [data-area="paradise-valley"] b', dur: 0.9},
          {t: 8.2, sel: '[data-areas] [data-area="rio-verde"] b', dur: 0.9},
          {t: 10, sel: '[data-areas] [data-area="rio-verde"] b', dx: 30},
        ], {x: 700, y: 960}),
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
    // 8. Le contact : « Open now », le type de projet, le formulaire, le remerciement
    name: 'd-contact',
    seconds: 13,
    async setup(site) {
      const c = await top(site.page, '#estimate');
      await park(site, c - 400);
      return {
        y: track([[0, c - 400], [1.8, c + 40, easeInOut], [13, c + 40]]),
        move: mover([
          {t: 2.8, sel: '.form__chips label:nth-of-type(1) span', click: true, dur: 1.0},
          {t: 3.8, sel: '#f-name', click: true, dur: 0.8},
          {t: 5.0, sel: '#f-phone', click: true},
          {t: 6.2, sel: '#f-email', click: true},
          {t: 7.5, sel: '#f-address', click: true},
          {t: 8.8, sel: '#f-msg', click: true},
          {t: 11.4, sel: '.form button[type="submit"]', click: true, dur: 1.0},
          {t: 12.8, xy: [1240, 760]},
        ], {x: 1300, y: 960}),
        type: typer([
          ['#f-name', 'Jordan Ellis', 4.0, 4.7],
          ['#f-phone', '(480) 555-0137', 5.2, 5.9],
          ['#f-email', 'jordan.ellis@example.com', 6.4, 7.2],
          ['#f-address', 'E Shea Blvd, Scottsdale', 7.7, 8.5],
          ['#f-msg', 'Our pool works, but we want a Baja shelf and new tile.', 9.0, 10.8],
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
];

const mobile = [
  {
    // l'accueil : l'arche monte, puis s'élargit au défilement
    name: 'm-hero',
    seconds: 8,
    fresh: true,
    async setup() {
      return {y: track([[0, 0], [3.4, 0], [7.4, 520, easeInOut], [8, 520]])};
    },
    step: scrolled,
  },
  {
    // le coût sur téléphone
    name: 'm-cost',
    seconds: 7,
    async setup(site) {
      const c = await top(site.page, '#cost');
      await park(site, c - 200);
      return {y: track([[0, c - 200], [1.4, c + 330, easeInOut], [3.6, c + 330], [6.4, c + 760, easeInOut], [7, c + 760]])};
    },
    step: scrolled,
  },
  {
    // les chantiers : on fait glisser les photos
    name: 'm-work',
    seconds: 7,
    async setup(site) {
      const w = await top(site.page, '#work');
      await park(site, w + 40);
      await site.page.evaluate(() => { document.querySelector('[data-work-stage]').style.scrollSnapType = 'none'; });
      const step = await site.page.evaluate(() => document.querySelector('[data-shot]').offsetWidth + 12);
      return {x: track([[0, 0], [1.0, 0], [2.4, step, easeInOut], [3.6, step], [5.0, step * 2, easeInOut], [7, step * 2]])};
    },
    async step(site, ctx, i, t) {
      await site.page.evaluate((x) => { const s = document.querySelector('[data-work-stage]'); s.scrollLeft = x; s.dispatchEvent(new Event('scroll')); }, Math.round(ctx.x(t / 1000)));
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
