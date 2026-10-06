// Plans filmés du nouveau site de Cameron Dental Studio pour la vidéo de présentation 16:9.
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
      if (done[sel] !== n) {
        done[sel] = n;
        await page.fill(sel, text.slice(0, n));
      }
    }
  };
};

const scrolled = async (site, ctx, i, t) => {
  await scrollTo(site.page, Math.round(ctx.y(t / 1000)));
};

/** Place la page à y en y descendant (les apparitions plus haut sont déjà jouées), puis laisse passer un peu de temps */
const park = async (site, y, ms = 1000) => {
  const page = site.page;
  for (let v = 0; v < y - 300; v += 500) { await scrollTo(page, v); await settle(page, 80); }
  await scrollTo(page, y - 200);
  await settle(page, 200);
  await scrollTo(page, y);
  await settle(page, ms);
};

const desktop = [
  {
    // 1. Le chargement : les douze visages arrivent « avant », puis basculent en vague sur « après » ; on survole un visage
    name: 'd-hero',
    seconds: 7.5,
    fresh: true,
    async setup() {
      return {
        move: mover([
          {t: 5.0, sel: '.face:nth-child(6) .face__btn', dx: 10, dur: 1.0},
          {t: 6.4, sel: '.face:nth-child(6) .face__btn', dx: 16, dur: 1.2},
          {t: 7.4, xy: [1500, 960], dur: 0.9},
        ], {x: 1500, y: 960}),
      };
    },
    async step(site, ctx, i, t) {
      const s = t / 1000;
      if (s < 3.8) return null;
      return ctx.move(site.page, i, s);
    },
  },
  {
    // 2. Le mur : l'interrupteur bascule tous les visages, puis on ouvre un cas et on passe au suivant
    name: 'd-wall',
    seconds: 9,
    async setup() {
      return {
        move: mover([
          {t: 1.3, sel: '[data-flip] i', click: true, dur: 1.0},
          {t: 3.6, sel: '[data-flip] i', click: true, dur: 0.4},
          {t: 5.0, sel: '.face:nth-child(7) .face__btn', click: true, dur: 1.0},
          {t: 7.0, sel: '[data-case-next]', click: true, dur: 1.0},
          {t: 8.8, sel: '[data-case-next]', dx: -60, dy: 90, dur: 1.0},
        ], {x: 1400, y: 980}),
      };
    },
    async step(site, ctx, i, t) {
      return ctx.move(site.page, i, t / 1000);
    },
  },
  {
    // 3. Le cas de Donald : la section se fige, le balayage révèle le nouveau sourire
    name: 'd-story',
    seconds: 9,
    async setup(site) {
      const a = await top(site.page, '#smiles');
      await park(site, a - 520, 800);
      return {y: track([[0, a - 520], [1.4, a, easeInOut], [7.4, a + 990, sine], [9, a + 1120, easeInOut]])};
    },
    step: scrolled,
  },
  {
    // 4. Le bandeau des soins, puis la Dr. Cameron
    name: 'd-doctor',
    seconds: 8,
    async setup(site) {
      const d = await top(site.page, '#doctor');
      await park(site, 560, 1200);
      return {y: track([[0, 560], [1.6, 600], [4.4, d - 40, easeInOut], [8, d + 60, sine]])};
    },
    step: scrolled,
  },
  {
    // 5. Les soins (on referme « Cosmetic », on ouvre « Implants & dentures »), puis le confort et le témoignage qui s'allume
    name: 'd-care',
    seconds: 12,
    async setup(site) {
      const tr = await top(site.page, '#treatments');
      await park(site, tr + 40, 1000);
      // la mise en page change quand l'accordéon s'ouvre : les positions suivantes sont lues au moment voulu
      return {
        tr,
        y: null,
        move: mover([
          {t: 1.1, sel: '#acc-cos-b i', click: true, dur: 0.9},
          {t: 2.4, sel: '#acc-imp-b i', click: true, dur: 0.9},
          {t: 3.6, xy: [1380, 760], dur: 0.9},
        ], {x: 1300, y: 980}),
      };
    },
    async step(site, ctx, i, t) {
      const s = t / 1000;
      if (s >= 4.6 && !ctx.y) {
        const c = await top(site.page, '#comfort');
        const q = await top(site.page, '.comfort__quote');
        ctx.y = track([[4.6, ctx.tr + 40], [6.8, c - 40, easeInOut], [8.2, c - 40], [12, q - 380, sine]]);
      }
      if (ctx.y) await scrollTo(site.page, Math.round(ctx.y(s)));
      if (s > 3.8) return null;
      return ctx.move(site.page, i, s);
    },
  },
  {
    // 6. L'équipe : la photo s'élargit jusqu'aux bords, les cinq dentistes, puis la page bleue des avis
    name: 'd-team',
    seconds: 10,
    async setup(site) {
      const d = await top(site.page, '#doctors');
      const r = await top(site.page, '#reviews');
      await park(site, d - 120, 900);
      return {y: track([[0, d - 120], [3.2, d + 360, sine], [4.4, d + 600, sine], [5.4, d + 600], [8.6, r - 120, easeInOut], [10, r + 20, sine]])};
    },
    step: scrolled,
  },
  {
    // 7. L'assurance, puis la prise de rendez-vous
    name: 'd-book',
    seconds: 15,
    async setup(site) {
      const ins = await top(site.page, '.ins');
      await park(site, ins - 130, 900);
      return {
        ins,
        y: null,
        move: mover([
          {t: 1.2, sel: '#ins-q', click: true, dur: 1.0},
          {t: 3.6, xy: [1180, 860], dur: 1.0},
          {t: 7.2, sel: '.form__chips label:nth-of-type(2) span', click: true, dur: 1.0},
          {t: 8.0, sel: '#f-first', click: true, dur: 0.7},
          {t: 8.9, sel: '#f-last', click: true, dur: 0.6},
          {t: 9.9, sel: '#f-email', click: true, dur: 0.7},
          {t: 11.3, sel: '#f-phone', click: true, dur: 0.7},
          {t: 12.9, sel: '.form button[type="submit"]', click: true, dur: 0.9},
          {t: 14.6, xy: [1180, 640], dur: 1.0},
        ], {x: 1300, y: 980}),
        type: typer([
          ['#ins-q', 'Delta', 1.5, 2.3],
          ['#f-first', 'Maria', 8.1, 8.6],
          ['#f-last', 'Lopez', 9.0, 9.5],
          ['#f-email', 'maria.lopez@example.com', 10.0, 11.0],
          ['#f-phone', '(239) 555-0148', 11.4, 12.4],
        ]),
      };
    },
    async step(site, ctx, i, t) {
      const s = t / 1000;
      if (s >= 4.0 && !ctx.y) {
        const v = await top(site.page, '#visit');
        ctx.y = track([[4.0, ctx.ins - 130], [6.2, v + 10, easeInOut], [15, v + 10]]);
      }
      if (ctx.y) await scrollTo(site.page, Math.round(ctx.y(s)));
      await ctx.type(site.page, s);
      return ctx.move(site.page, i, s);
    },
  },
];

const mobile = [
  {
    // l'accueil sur téléphone : les visages arrivent, basculent, puis on descend vers le mur
    name: 'm-hero',
    seconds: 7,
    fresh: true,
    async setup() {
      return {y: track([[0, 0], [2.6, 0], [5.0, 400, easeInOut], [7, 400]])};
    },
    step: scrolled,
  },
  {
    // le cas de Donald : le balayage suit le défilement
    name: 'm-story',
    seconds: 6,
    async setup(site) {
      const a = await top(site.page, '#smiles');
      await park(site, a - 260, 800);
      return {y: track([[0, a - 260], [5.4, a + 380, sine], [6, a + 380]])};
    },
    step: scrolled,
  },
  {
    // le menu, puis « Book a visit »
    name: 'm-menu',
    seconds: 6,
    async setup(site) {
      await park(site, 1400, 800);
      // on remonte un peu : l'en-tête, masqué en descendant, réapparaît
      await scrollTo(site.page, 1330);
      await settle(site.page, 900);
      return {
        move: mover([
          {t: 1.0, sel: '[data-menu]', click: true, dur: 0.8},
          {t: 3.6, sel: '.menu nav a[href="#visit"]', click: true, dur: 0.9},
          {t: 6, sel: '.menu nav a[href="#visit"]', dur: 1.0},
        ], {x: 300, y: 700}),
      };
    },
    async step(site, ctx, i, t) {
      return ctx.move(site.page, i, t / 1000);
    },
  },
];

const args = process.argv.slice(2);
const pick = (list, group) => list.filter((s) => !args.length || args.includes(s.name) || args.includes(group));

for (const [list, cfg, group] of [[desktop, DESK, 'desktop'], [mobile, MOBILE, 'mobile']]) {
  for (const shot of pick(list, group)) {
    const site = await openSite(cfg);
    site.page.on('pageerror', (e) => console.log(`  ${shot.name} : ${e.message}`));
    if (!shot.fresh) await settle(site.page, 5200);
    const ctx = await shot.setup(site);
    await record(site, {name: shot.name, fps: FPS, seconds: shot.seconds, step: (i, t) => shot.step(site, ctx, i, t)});
    await site.browser.close();
  }
}
