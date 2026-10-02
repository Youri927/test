// Plans filmés du nouveau site Enhance pour la vidéo de présentation 16:9.
// Usage : node capture/shots.mjs [desktop|mobile|nom-du-plan …]
import {openSite, record, scrollTo, settle, track, top, center, easeInOut, sine} from './lib.mjs';

const FPS = 60;
const DESK = {width: 1440, height: 900, dsf: 2};
const MOBILE = {width: 390, height: 844, dsf: 2, mobile: true};

/**
 * Souris qui va d'une cible à l'autre. Chaque étape : {t, sel | xy, click, dur}.
 * La position d'un sélecteur est lue en direct (la page peut avoir défilé entre-temps).
 */
const mover = (events, start) => {
  let idx = 0;
  let from = start;
  const target = async (page, ev) => (ev.sel ? center(page, ev.sel) : {x: ev.xy[0], y: ev.xy[1]});
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

const scrolled = (keys) => async (site, ctx, i, t) => {
  await scrollTo(site.page, Math.round(ctx.y(t / 1000)));
};

const desktop = [
  {
    // 1. L'ouverture : le titre apparaît, le visage se dessine, la souris survole l'index des couches
    name: 'd-hero',
    seconds: 9,
    fresh: true,
    async setup() {
      return {
        move: mover([
          {t: 4.2, sel: '[data-peek="2"]', dur: 0.9},
          {t: 5.7, sel: '[data-peek="4"]'},
          {t: 7.2, sel: '[data-peek="1"]'},
          {t: 8.6, xy: [520, 860]},
        ], {x: 760, y: 820}),
      };
    },
    async step(site, ctx, i, t) {
      const s = t / 1000;
      if (s < 3.3) return null;
      return ctx.move(site.page, i, s);
    },
  },
  {
    // 2. Les couches : le visage s'éclate en cinq calques, on descend de la peau à l'os
    name: 'd-layers',
    seconds: 20,
    async setup(site) {
      await settle(site.page, 3000);
      const L = await site.page.evaluate(() => ['surface', 'volume', 'motion', 'support', 'structure'].map((id) => document.getElementById(id).getBoundingClientRect().top + scrollY));
      const keys = [[0, 0], [1.0, 0], [3.6, 740, easeInOut], [5.0, 740]];
      let t = 5.0;
      L.forEach((y, k) => {
        t += 1.2;
        keys.push([t, y - 110, easeInOut]);
        t += [1.8, 1.4, 2.2, 1.2, 2.4][k];
        keys.push([t, y - 110]);
      });
      return {
        y: track(keys),
        move: mover([
          {t: 13.0, sel: '.tx[data-tx="Jawline BOTOX"] .tx__add', click: true, dur: 1.0},
          {t: 14.2, xy: [860, 700]},
          {t: 19.0, sel: '.tx[data-tx="Rhinoplasty"] .tx__add', click: true, dur: 1.0},
          {t: 20, xy: [880, 600]},
        ], {x: 1000, y: 820}),
      };
    },
    async step(site, ctx, i, t) {
      const s = t / 1000;
      await scrollTo(site.page, Math.round(ctx.y(s)));
      if (s < 11.9) return null;
      return ctx.move(site.page, i, s);
    },
  },
  {
    // 3. Les spécialités : les dessins se tracent au fil du défilement
    name: 'd-signature',
    seconds: 14,
    async setup(site) {
      const sigs = await site.page.evaluate(() => [...document.querySelectorAll('.sig')].map((e) => e.getBoundingClientRect().top + scrollY));
      const s0 = await top(site.page, '#signature');
      await scrollTo(site.page, s0 - 130);
      await settle(site.page, 1200);
      return {y: track([[0, s0 - 130], [1.6, s0 - 130], [4.4, sigs[0] - 80, easeInOut], [6.0, sigs[0] - 80], [8.4, sigs[1] - 80, easeInOut], [9.8, sigs[1] - 80], [12.2, sigs[2] - 80, easeInOut], [14, sigs[2] - 80]])};
    },
    step: scrolled(),
  },
  {
    // 4. Le chirurgien : le nom, la carte des titres, le parcours qui se remplit
    name: 'd-surgeon',
    seconds: 12,
    async setup(site) {
      const s = await top(site.page, '#surgeon');
      const g = await top(site.page, '.surgeon__grid');
      await scrollTo(site.page, s - 40);
      await settle(site.page, 1000);
      return {y: track([[0, s - 40], [2.0, s - 40], [3.6, g - 120, easeInOut], [11.6, g + 690, (u) => u], [12, g + 690]])};
    },
    step: scrolled(),
  },
  {
    // 5. Les résultats : la souris passe sur les galeries, puis la note et les avis
    name: 'd-results',
    seconds: 11,
    async setup(site) {
      const r = await top(site.page, '#results');
      const g = await top(site.page, '.galleries');
      const v = await top(site.page, '.reviews');
      await scrollTo(site.page, r - 40);
      await settle(site.page, 1000);
      return {
        y: track([[0, r - 40], [1.4, r - 40], [2.6, g - 150, easeInOut], [7.0, g - 150], [8.4, v - 170, easeInOut], [11, v - 170]]),
        move: mover([
          {t: 3.6, sel: '.galleries li:nth-child(1) .gal', dur: 1.0},
          {t: 4.8, sel: '.galleries li:nth-child(2) .gal'},
          {t: 6.0, sel: '.galleries li:nth-child(3) .gal'},
          {t: 7.0, xy: [1250, 860]},
        ], {x: 1100, y: 840}),
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
    // 6. La consultation : deux soins déjà cochés plus haut, on complète et le message se rédige
    name: 'd-visit',
    seconds: 12,
    async setup(site) {
      await site.page.evaluate(() => {
        document.querySelector('.tx[data-tx="Rhinoplasty"]').click();
        document.querySelector('.tx[data-tx="Jawline BOTOX"]').click();
      });
      const v = await top(site.page, '#visit');
      const g = await top(site.page, '.visit__grid');
      const m = await top(site.page, '.brief__out');
      await scrollTo(site.page, v - 40);
      await settle(site.page, 3000);
      return {
        y: track([[0, v - 40], [1.2, v - 40], [2.4, g - 110, easeInOut], [8.6, g - 110], [9.8, m - 300, easeInOut], [12, m - 300]]),
        move: mover([
          {t: 3.3, sel: '.chip[data-area="Nose"]', click: true, dur: 0.9},
          {t: 4.1, sel: '.chip[data-area="Skin"]', click: true},
          {t: 4.9, sel: 'input[name="name"]', click: true},
          {t: 6.5, sel: 'input[name="phone"]', click: true},
          {t: 8.2, sel: '[data-pref="call"]', click: true},
          {t: 10.8, sel: '[data-brief-send]', dur: 1.0},
          {t: 12, sel: '[data-brief-send]'},
        ], {x: 1000, y: 820}),
        type: typer([['input[name="name"]', 'Jane Smith', 5.1, 6.0], ['input[name="phone"]', '(310) 555-0100', 6.7, 7.8]]),
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
];

const mobile = [
  {name: 'm-hero', seconds: 7, fresh: true, async setup() { return {}; }, async step() { return null; }},
  {
    name: 'm-layers',
    seconds: 11,
    async setup(site) {
      await settle(site.page, 2500);
      const L = await site.page.evaluate(() => ['surface', 'volume', 'motion'].map((id) => document.querySelector(`#${id} .layer__head`).getBoundingClientRect().top + scrollY));
      return {y: track([[0, 0], [0.8, 0], [3.0, 810, easeInOut], [4.0, 810], [5.0, L[0] - 410, easeInOut], [6.2, L[0] - 410], [7.2, L[1] - 410, easeInOut], [8.2, L[1] - 410], [9.2, L[2] - 410, easeInOut], [11, L[2] - 410]])};
    },
    step: scrolled(),
  },
  {
    name: 'm-visit',
    seconds: 7,
    async setup(site) {
      const g = await top(site.page, '.visit__grid');
      const m = await top(site.page, '.brief__out');
      await scrollTo(site.page, g - 90);
      await settle(site.page, 900);
      return {y: track([[0, g - 90], [4.6, g - 90], [6.0, m - 260, easeInOut], [7, m - 260]]), taps: [[1.4, '.chip[data-area="Nose"]'], [2.6, '.chip[data-area="Jawline"]'], [3.8, '[data-pref="call"]']].map(([t, sel]) => ({i: Math.round(t * FPS), sel}))};
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
];

const args = process.argv.slice(2);
const pick = (list, group) => list.filter((s) => !args.length || args.includes(s.name) || args.includes(group));

for (const [list, cfg, group] of [[desktop, DESK, 'desktop'], [mobile, MOBILE, 'mobile']]) {
  for (const shot of pick(list, group)) {
    const site = await openSite(cfg);
    site.page.on('pageerror', (e) => console.log(`  ${shot.name} : ${e.message}`));
    if (!shot.fresh) await settle(site.page, 2600);
    const ctx = await shot.setup(site);
    await record(site, {name: shot.name, fps: FPS, seconds: shot.seconds, step: (i, t) => shot.step(site, ctx, i, t)});
    await site.browser.close();
  }
}
