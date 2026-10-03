// Plans filmés du nouveau site Escape TV pour la vidéo de présentation 16:9.
// Usage : node capture/shots.mjs [desktop|mobile|nom-du-plan …]
import {openSite, record, scrollTo, settle, track, top, center, touch, easeInOut, sine} from './lib.mjs';

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

const scrolled = () => async (site, ctx, i, t) => {
  await scrollTo(site.page, Math.round(ctx.y(t / 1000)));
};

const desktop = [
  {
    // 1. L'ouverture : l'écran s'allume, le titre monte, la régie change de caméra ; la souris passe sur le bouton
    name: 'd-hero',
    seconds: 10.5,
    fresh: true,
    async setup() {
      return {
        move: mover([
          {t: 6.4, sel: '.hero__cta .btn', dur: 1.1},
          {t: 8.2, sel: '.hero__cta .btn'},
          {t: 9.6, xy: [980, 720], dur: 1.0},
        ], {x: 1180, y: 860}),
      };
    },
    async step(site, ctx, i, t) {
      const s = t / 1000;
      if (s < 5.2) return null;
      return ctx.move(site.page, i, s);
    },
  },
  {
    // 2. Le jeu : les mots du pitch s'allument au défilement, puis la fiche en générique
    name: 'd-pitch',
    seconds: 9.5,
    async setup(site) {
      const text = await top(site.page, '.pitch__text');
      const guide = await top(site.page, '.guide');
      return {y: track([[0, 0], [0.8, 0], [2.4, text - 520, easeInOut], [5.6, text - 100, sine], [6.4, text - 100], [7.9, guide - 130, easeInOut], [9.5, guide - 130]])};
    },
    step: scrolled(),
  },
  {
    // 3. Six genres : la page clair entre, les colonnes s'impriment, la souris passe d'une chaîne à l'autre
    name: 'd-grid',
    seconds: 10,
    async setup(site) {
      const guide = await top(site.page, '.guide');
      const head = await top(site.page, '.concept__head');
      await scrollTo(site.page, guide - 130);
      await settle(site.page, 800);
      const y0 = guide - 130;
      const y1 = head - 87;
      const col = (n) => `.prog:nth-child(${n})`;
      return {
        y: track([[0, y0], [0.6, y0], [2.8, y1, easeInOut], [10, y1]]),
        move: mover([
          {t: 4.4, sel: col(1), dur: 0.9},
          {t: 5.3, sel: col(2)},
          {t: 6.2, sel: col(3)},
          {t: 7.1, sel: col(4)},
          {t: 8.0, sel: col(5)},
          {t: 8.9, sel: col(6)},
          {t: 10, sel: col(6)},
        ], {x: 300, y: 880}),
      };
    },
    async step(site, ctx, i, t) {
      const s = t / 1000;
      await scrollTo(site.page, Math.round(ctx.y(s)));
      if (s < 3.5) return null;
      return ctx.move(site.page, i, s);
    },
  },
  {
    // 4. Le Minotaure : la souris se déplace, la chaleur la suit, puis la rattrape
    name: 'd-beast',
    seconds: 10.5,
    async setup(site) {
      const b = await top(site.page, '.beast');
      await scrollTo(site.page, b);
      await site.page.mouse.move(900, 520);
      await settle(site.page, 400);
      return {
        move: mover([
          {t: 2.6, xy: [760, 640], dur: 2.2},
          {t: 5.4, xy: [1000, 700], dur: 2.4},
          {t: 10.5, xy: [1000, 700]},
        ], {x: 900, y: 520}),
      };
    },
    async step(site, ctx, i, t) {
      return ctx.move(site.page, i, t / 1000);
    },
  },
  {
    // 5. Votre film : les deux lecteurs, pause puis lecture au clic
    name: 'd-film',
    seconds: 8.5,
    async setup(site) {
      const f = await top(site.page, '.film');
      const p = await top(site.page, '.players');
      await scrollTo(site.page, f - 80);
      await settle(site.page, 600);
      return {
        y: track([[0, f - 80], [1.2, f - 80], [2.8, p - 150, easeInOut], [8.5, p - 150]]),
        move: mover([
          {t: 4.6, sel: '.player--wide .player__frame', click: true, dur: 1.1},
          {t: 6.2, sel: '.player--wide .player__frame', click: true},
          {t: 7.6, sel: '.player--tall .player__frame', dur: 1.0},
        ], {x: 1100, y: 860}),
      };
    },
    async step(site, ctx, i, t) {
      const s = t / 1000;
      await scrollTo(site.page, Math.round(ctx.y(s)));
      if (s < 3.4) return null;
      return ctx.move(site.page, i, s);
    },
  },
  {
    // 6. L'audience, la FAQ, la réservation
    name: 'd-audience',
    seconds: 10.5,
    async setup(site) {
      const a = await top(site.page, '.audience');
      const faq = await top(site.page, '.faq');
      const fin = await top(site.page, '.final');
      await scrollTo(site.page, a - 520);
      await settle(site.page, 500);
      return {
        y: track([[0, a - 520], [0.5, a - 520], [2.2, a - 40, easeInOut], [4.8, a - 40], [6.3, faq - 130, easeInOut], [8.0, faq - 130], [9.2, fin - 300, easeInOut], [10.5, fin - 300]]),
        move: mover([
          {t: 7.0, sel: '.faq details:nth-child(1) summary', click: true, dur: 0.9},
          {t: 9.9, sel: '.final .btn', dur: 1.0},
          {t: 10.5, sel: '.final .btn'},
        ], {x: 1100, y: 860}),
      };
    },
    async step(site, ctx, i, t) {
      const s = t / 1000;
      await scrollTo(site.page, Math.round(ctx.y(s)));
      if (s < 6.0) return null;
      return ctx.move(site.page, i, s);
    },
  },
];

const mobile = [
  {name: 'm-hero', seconds: 7.5, fresh: true, async setup() { return {}; }, async step() { return null; }},
  {
    // la grille devient une liste : la ligne au centre de l'écran passe à l'antenne
    name: 'm-grid',
    seconds: 8,
    async setup(site) {
      const c = await top(site.page, '.concept');
      const e = await top(site.page, '.epg');
      await scrollTo(site.page, c - 160);
      await settle(site.page, 600);
      return {y: track([[0, c - 160], [0.6, c - 160], [2.0, e - 330, easeInOut], [7.6, e + 900, sine], [8, e + 900]])};
    },
    step: scrolled(),
  },
  {
    // la caméra thermique suit le doigt
    name: 'm-beast',
    seconds: 7.5,
    async setup(site) {
      const b = await top(site.page, '.beast');
      await scrollTo(site.page, b);
      await settle(site.page, 2200);
      const path = track([[0, 0], [1.0, 0], [5.4, 1, sine]]);
      return {path};
    },
    async step(site, ctx, i, t) {
      const s = t / 1000;
      if (s < 1.0 || s > 5.4) {
        if (Math.abs(s - 5.42) < 0.009) await touch(site.page, '[data-beast]', 'touchend', 200, 500);
        return null;
      }
      const u = ctx.path(s);
      const pos = {x: 120 + 170 * Math.sin(u * Math.PI * 1.2), y: 300 + 260 * u};
      await touch(site.page, '[data-beast]', s < 1.02 ? 'touchstart' : 'touchmove', pos.x, pos.y);
      return {drag: pos};
    },
  },
];

const args = process.argv.slice(2);
const pick = (list, group) => list.filter((s) => !args.length || args.includes(s.name) || args.includes(group));

for (const [list, cfg, group] of [[desktop, DESK, 'desktop'], [mobile, MOBILE, 'mobile']]) {
  for (const shot of pick(list, group)) {
    const site = await openSite(cfg);
    site.page.on('pageerror', (e) => console.log(`  ${shot.name} : ${e.message}`));
    if (!shot.fresh) await settle(site.page, 3000);
    const ctx = await shot.setup(site);
    await record(site, {name: shot.name, fps: FPS, seconds: shot.seconds, step: (i, t) => shot.step(site, ctx, i, t)});
    await site.browser.close();
  }
}
