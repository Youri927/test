// Plans filmés du nouveau site de Frontline Pools pour la vidéo de présentation 16:9.
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

/** Position de défilement qui active un chapitre de la visite guidée (son haut à `frac` de l'écran) */
const chapY = (page, k, frac) => page.evaluate(([k, frac]) => {
  const c = document.querySelectorAll('.chap')[k];
  return Math.round(c.getBoundingClientRect().top + scrollY - innerHeight * frac);
}, [k, frac]);

const desktop = [
  {
    // 1. Le chargement : la photo se pose en mosaïque, le titre monte ; survol du bouton ; puis la photo dérive au défilement
    name: 'd-hero',
    seconds: 8.5,
    fresh: true,
    async setup() {
      return {
        y: track([[0, 0], [4.9, 0], [8.5, 380, easeInOut]]),
        move: mover([
          {t: 3.4, sel: '.hero__cta .btn--y', dx: -20, dur: 1.0},
          {t: 4.5, sel: '.hero__cta .btn--y', dx: -6, dur: 1.0},
          {t: 5.6, xy: [1500, 980], dur: 1.0},
        ], {x: 1500, y: 980}),
      };
    },
    async step(site, ctx, i, t) {
      const s = t / 1000;
      await scrollTo(site.page, Math.round(ctx.y(s)));
      if (s < 2.2) return null;
      return ctx.move(site.page, i, s);
    },
  },
  {
    // 2. La visite guidée : le titre, puis les six chapitres ; la caméra s'approche de chaque partie du bassin
    name: 'd-tour',
    seconds: 16,
    async setup(site) {
      const r = await top(site.page, '#rebuild');
      await park(site, r - 120, 900);
      const ys = [];
      for (let k = 0; k < 6; k++) ys.push(await chapY(site.page, k, 0.44));
      const keys = [[0, r - 120], [0.8, r - 120], [2.2, ys[0], easeInOut], [3.6, ys[0]]];
      let t = 3.6;
      for (let k = 1; k < 6; k++) { keys.push([t + 0.9, ys[k], easeInOut], [t + 2.4, ys[k]]); t += 2.4; }
      return {y: track(keys)};
    },
    step: scrolled,
  },
  {
    // 3. Les chantiers : les fiches s'empilent
    name: 'd-work',
    seconds: 10.5,
    async setup(site) {
      const w = await top(site.page, '#work');
      const j = [];
      for (const id of ['#job-davis', '#job-citrus', '#job-south', '#job-walden']) j.push((await top(site.page, id)) - 72);
      await park(site, w + 40, 900);
      return {y: track([[0, w + 40], [1.5, j[0], easeInOut], [2.5, j[0]], [4.0, j[1], easeInOut], [5.0, j[1]], [6.5, j[2], easeInOut], [7.5, j[2]], [9.0, j[3], easeInOut], [10.5, j[3]]])};
    },
    step: scrolled,
  },
  {
    // 4. Le local technique : l'« après » monte derrière la ligne d'eau, puis l'équipement et les marques
    name: 'd-equip',
    seconds: 10,
    async setup(site) {
      const e = await top(site.page, '#equipment');
      const ba = await top(site.page, '.ba-row');
      const br = await top(site.page, '.brands');
      await park(site, e + 40, 900);
      return {y: track([[0, e + 40], [0.8, e + 40], [4.8, ba - 210, sine], [5.8, ba - 210], [9.4, br - 520, easeInOut], [10, br - 500]])};
    },
    step: scrolled,
  },
  {
    // 5. Les avis : le compteur 19/33, les extraits, les avis avec les prénoms surlignés
    name: 'd-reviews',
    seconds: 10,
    async setup(site) {
      const r = await top(site.page, '#reviews');
      const p = await top(site.page, '.pulls');
      const v = await top(site.page, '.revs');
      await park(site, r - 260, 800);
      return {y: track([[0, r - 260], [1.3, r + 40, easeInOut], [3.8, r + 40], [6.0, p - 90, easeInOut], [7.0, p - 90], [9.6, v - 230, easeInOut], [10, v - 225]])};
    },
    step: scrolled,
  },
  {
    // 6. La licence (compteur, trait jaune), puis le financement (les chiffres comptent)
    name: 'd-license',
    seconds: 11,
    async setup(site) {
      const l = await top(site.page, '#licensed');
      const f = await top(site.page, '#financing');
      await park(site, l - 320, 800);
      return {y: track([[0, l - 320], [1.4, l + 40, easeInOut], [4.2, l + 40], [6.0, f + 60, easeInOut], [9.0, f + 60], [11, f + 420, easeInOut]])};
    },
    step: scrolled,
  },
  {
    // 7. La carte : les points se posent, puis on choisit trois secteurs et un point de la carte
    name: 'd-areas',
    seconds: 9.5,
    async setup(site) {
      const a = await top(site.page, '#areas');
      const g = await top(site.page, '.areas__grid');
      await park(site, a - 200, 800);
      return {
        y: track([[0, a - 200], [1.6, g - 110, easeInOut], [9.5, g - 110]]),
        move: mover([
          {t: 3.0, sel: '[data-alist] button[data-area="davis-islands"] span', dur: 1.0},
          {t: 4.5, sel: '[data-alist] button[data-area="plant-city"] span', dur: 0.9},
          {t: 6.0, sel: '[data-alist] button[data-area="carrollwood"] span', dur: 0.9},
          {t: 7.8, sel: '.m-area[data-area="hudson"] .m-dot', click: true, dur: 1.2},
          {t: 9.4, sel: '.m-area[data-area="hudson"] .m-dot', dx: 40, dy: 60, dur: 1.0},
        ], {x: 1300, y: 980}),
      };
    },
    async step(site, ctx, i, t) {
      const s = t / 1000;
      await scrollTo(site.page, Math.round(ctx.y(s)));
      if (s < 1.8) return null;
      return ctx.move(site.page, i, s);
    },
  },
  {
    // 8. Le devis : trois travaux cochés, le formulaire rempli, le remerciement
    name: 'd-estimate',
    seconds: 13,
    async setup(site) {
      const e = await top(site.page, '#estimate');
      await park(site, e + 40, 900);
      return {
        y: track([[0, e + 40], [7.6, e + 40], [9.0, e + 300, easeInOut], [13, e + 300]]),
        move: mover([
          {t: 1.0, sel: '.form__chips label:nth-of-type(1)', click: true, dur: 0.9},
          {t: 1.8, sel: '.form__chips label:nth-of-type(2)', click: true, dur: 0.6},
          {t: 2.6, sel: '.form__chips label:nth-of-type(5)', click: true, dur: 0.7},
          {t: 3.4, sel: 'input[name=name]', click: true, dur: 0.7},
          {t: 4.4, sel: 'input[name=phone]', click: true, dur: 0.7},
          {t: 5.8, sel: 'input[name=email]', click: true, dur: 0.7},
          {t: 7.2, sel: 'input[name=address]', click: true, dur: 0.7},
          {t: 9.4, sel: 'textarea[name=message]', click: true, dur: 0.8},
          {t: 11.4, sel: '.form button[type="submit"]', click: true, dur: 0.9},
          {t: 12.8, xy: [1100, 560], dur: 1.0},
        ], {x: 1300, y: 980}),
        type: typer([
          ['input[name=name]', 'Maria Lopez', 3.5, 4.1],
          ['input[name=phone]', '(813) 555-0148', 4.5, 5.4],
          ['input[name=email]', 'maria.lopez@example.com', 5.9, 6.9],
          ['input[name=address]', '1200 Example Ave, Tampa', 7.3, 8.2],
          ['textarea[name=message]', 'Our waterline tile is scaled and the pump is loud.', 9.5, 10.9],
        ]),
      };
    },
    async step(site, ctx, i, t) {
      const s = t / 1000;
      await scrollTo(site.page, Math.round(ctx.y(s)));
      await ctx.type(site.page, s);
      return ctx.move(site.page, i, s);
    },
  },
];

const mobile = [
  {
    // l'accueil sur téléphone : la mosaïque, puis on descend vers la photo
    name: 'm-hero',
    seconds: 7,
    fresh: true,
    async setup() {
      return {y: track([[0, 0], [3.6, 0], [6.2, 330, easeInOut], [7, 330]])};
    },
    step: scrolled,
  },
  {
    // la visite guidée sur téléphone : la photo reste en haut, les chapitres défilent dessous
    name: 'm-tour',
    seconds: 8,
    async setup(site) {
      const ys = [];
      for (let k = 0; k < 4; k++) ys.push(await chapY(site.page, k, 0.5));
      await park(site, ys[0], 1600);
      return {y: track([[0, ys[0]], [1.2, ys[0]], [2.0, ys[1], easeInOut], [3.6, ys[1]], [4.4, ys[2], easeInOut], [6.0, ys[2]], [6.8, ys[3], easeInOut], [8, ys[3]]])};
    },
    step: scrolled,
  },
  {
    // le menu, puis « Free estimate »
    name: 'm-menu',
    seconds: 6,
    async setup(site) {
      await park(site, 2600, 800);
      // on remonte un peu : l'en-tête, masqué en descendant, réapparaît
      await scrollTo(site.page, 2520);
      await settle(site.page, 900);
      return {
        move: mover([
          {t: 1.0, sel: '[data-menu]', click: true, dur: 0.8},
          {t: 3.4, sel: '#menu nav a[href="#estimate"]', click: true, dur: 0.9},
          {t: 6, sel: '#menu nav a[href="#estimate"]', dur: 1.0},
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
