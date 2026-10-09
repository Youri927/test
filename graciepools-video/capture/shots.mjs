// Plans filmés du nouveau site de Gracie Pools pour la vidéo de présentation 16:9.
// Usage : node capture/shots.mjs [desktop|mobile|nom-du-plan …] [--probe]
import {openSite, record, scrollTo, settle, track, top, easeInOut, sine} from './lib.mjs';

const FPS = 60;
const DESK = {width: 1440, height: 900, dsf: 2};
const MOBILE = {width: 390, height: 844, dsf: 2, mobile: true};

/** Centre (px de la fenêtre) du premier élément visible qui correspond au sélecteur (et au texte, s'il est donné) */
const centerOf = (page, sel, text) =>
  page.evaluate(([sel, text]) => {
    const all = [...document.querySelectorAll(sel)].filter((e) => !text || (e.textContent || '').includes(text));
    const el = all.find((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; }) || all[0];
    if (!el) throw new Error('cible introuvable : ' + sel + ' ' + (text || ''));
    const r = el.getBoundingClientRect();
    return {x: r.left + r.width / 2, y: r.top + r.height / 2};
  }, [sel, text || '']);

/**
 * Souris (ou doigt) qui va d'une cible à l'autre. Chaque étape : {t, sel, text | xy, dx, dy, click, dur}.
 * La position d'une cible est lue en direct (la page peut avoir défilé, ou la mise en page changé, entre-temps).
 */
const mover = (events, start) => {
  let idx = 0;
  let from = start;
  const target = async (page, ev) => {
    const p = ev.sel ? await centerOf(page, ev.sel, ev.text) : {x: ev.xy[0], y: ev.xy[1]};
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

/** Saisie progressive. Chaque entrée : [sélecteur, texte, t0, t1]. */
const typer = (fields) => {
  const shown = {};
  return async (page, s) => {
    for (const [sel, text, t0, t1] of fields) {
      if (s < t0) continue;
      const v = text.slice(0, Math.min(text.length, Math.floor(((s - t0) / (t1 - t0)) * text.length)));
      if (shown[sel] !== v) {
        shown[sel] = v;
        await page.fill(sel, v);
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
  for (let v = 0; v < y - 300; v += 400) { await scrollTo(page, v); await settle(page, 60); }
  await scrollTo(page, y - 150);
  await settle(page, 200);
  await scrollTo(page, y);
  await settle(page, ms);
};

/** Haut (px du document) du titre h3 qui contient ce texte */
const h3Top = (page, root, text) =>
  page.evaluate(([root, text]) => {
    const h = [...document.querySelectorAll(root + ' h3')].find((x) => x.textContent.includes(text));
    return h.getBoundingClientRect().top + window.scrollY;
  }, [root, text]);


const desktop = [
  {
    // 1. L'arrivée : les mots montent, le bassin se dévoile avec ses cotes ; survol de « Find your pool » ;
    // puis le Billabong Cove laisse la place au Laguna
    name: 'd-hero',
    seconds: 10.5,
    fresh: true,
    watch: (page) => page.evaluate(() => ({laguna: /Laguna/.test(document.querySelector('#top button.ul')?.textContent || '')})),
    async setup() {
      return {
        move: mover([
          {t: 2.9, sel: '#top .btn', text: 'Find your pool', dx: -34, dur: 1.1},
          {t: 3.6, sel: '#top .btn', text: 'Find your pool', dx: -8, dur: 0.6},
          {t: 5.2, xy: [1250, 880], dur: 1.3},
        ], {x: 1150, y: 890}),
      };
    },
    async step(site, ctx, i, t) {
      const s = t / 1000;
      await scrollTo(site.page, 0);
      if (s < 1.7 || s > 5.4) return null;
      return ctx.move(site.page, i, s);
    },
  },
  {
    // 2. La coque d'un seul tenant : le titre, la photo du Laguna et les quatre arguments ;
    // puis le chemin de l'usine au jardin, dessiné étape par étape
    name: 'd-onepiece',
    seconds: 10,
    watch: (page) =>
      page.evaluate(() => {
        const steps = [...document.querySelectorAll('#fiberglass li')].filter((li) => li.querySelector('svg'));
        const out = {};
        steps.forEach((li, k) => { out['step' + k] = li.hasAttribute('data-shown') || !!li.closest('[data-shown]'); });
        return out;
      }),
    async setup(site) {
      const fiber = await top(site.page, '#fiberglass');
      const journey = await h3Top(site.page, '#fiberglass', 'factory floor');
      return {y: track([[0, 0], [2.0, fiber + 30, easeInOut], [3.6, fiber + 150, sine], [5.8, journey - 170, easeInOut], [10, journey - 150, sine]])};
    },
    step: scrolled,
  },
  {
    // 3. Le comparateur : le panneau sombre s'ouvre ; Whitsunday Deep (le bassin s'étire jusqu'à 40′),
    // le filtre « Plunge », l'Escape (17′), épinglé ; puis Whitsunday Deep avec l'Escape en pointillés,
    // trois coloris, et le Billabong Cove, toujours avec l'Escape en pointillés
    name: 'd-planner',
    seconds: 16.5,
    watch: (page) => page.evaluate(() => ({ghost: !!document.querySelector('#models [aria-label="Stop comparing"]')})),
    async setup(site) {
      const m = await top(site.page, '#models');
      await park(site, m - 620, 900);
      return {
        y: track([[0, m - 620], [1.9, m + 360, easeInOut], [16.5, m + 360]]),
        move: mover([
          {t: 2.5, sel: '#models .lineup-item', text: 'Whitsunday Deep', click: true, dur: 1.0},
          {t: 4.3, sel: '#models .seg-btn', text: 'Plunge', click: true, dur: 0.9},
          {t: 5.2, sel: '#models .lineup-item', text: 'Escape Plunge', click: true, dur: 0.7},
          {t: 6.7, sel: '#models button', text: 'Pin this pool', dx: -40, click: true, dur: 1.0},
          {t: 7.7, sel: '#models .seg-btn', text: 'All', click: true, dur: 0.8},
          {t: 8.6, sel: '#models .lineup-item', text: 'Whitsunday Deep', click: true, dur: 0.7},
          {t: 10.3, sel: '#models button[aria-label="Ocean Shimmer"]', click: true, dur: 1.1},
          {t: 11.3, sel: '#models button[aria-label="Arctic Shimmer"]', click: true, dur: 0.6},
          {t: 12.3, sel: '#models button[aria-label="Sandstone Shimmer"]', click: true, dur: 0.6},
          {t: 13.5, sel: '#models .seg-btn', text: 'Free form', click: true, dur: 0.9},
          {t: 14.3, sel: '#models .lineup-item', text: 'Billabong Cove', click: true, dur: 0.7},
          {t: 16.3, xy: [1320, 880], dur: 1.5},
        ], {x: 1180, y: 880}),
      };
    },
    async step(site, ctx, i, t) {
      const s = t / 1000;
      await scrollTo(site.page, Math.round(ctx.y(s)));
      if (s < 1.4) return null;
      return ctx.move(site.page, i, s);
    },
  },
  {
    // 4. Les photos des modèles : on fait glisser la bande, puis le nom « Billabong Cove » ouvre le comparateur sur lui
    name: 'd-gallery',
    seconds: 9.5,
    watch: (page) => page.evaluate(() => ({cove: /Billabong Cove/.test(document.querySelector('#models aside h3')?.textContent || ''), y: window.scrollY})),
    async setup(site) {
      const g = await top(site.page, '#gallery');
      await park(site, g - 520, 900);
      const card = await site.page.evaluate(() => {
        const r = document.querySelector('#gallery .gallery-card').getBoundingClientRect();
        return {y: r.top + window.scrollY + r.height * 0.42};
      });
      return {
        y: track([[0, g - 520], [1.7, g + 40, easeInOut]]),
        // le glissé : le bouton de la souris descend à 2,5 s, la bande suit jusqu'à 3,9 s
        cardY: card.y - (g + 40),
        click: 5.6,
      };
    },
    async step(site, ctx, i, t) {
      const s = t / 1000;
      const page = site.page;
      // après le clic, c'est le site qui défile (Lenis) jusqu'au comparateur : on ne touche plus au défilement
      if (s < ctx.click) await scrollTo(page, Math.round(ctx.y(s)));
      if (s < 1.6) return null;
      const y = ctx.cardY;
      const path = track([[1.6, 1240], [2.4, 1140], [3.9, 330], [4.4, 330]]);
      if (s <= 4.4) {
        const pos = {x: path(s), y: s < 2.4 ? y + 60 * (1 - (s - 1.6) / 0.8) : y};
        await page.mouse.move(pos.x, pos.y);
        if (i === Math.round(2.45 * FPS)) await page.mouse.down();
        if (i === Math.round(3.95 * FPS)) await page.mouse.up();
        return {mouse: pos};
      }
      if (!ctx.cove) ctx.cove = mover([
        {t: 4.4, xy: [330, y]},
        {t: 5.5, sel: '#gallery figcaption button', text: 'Billabong Cove', dx: 20, dur: 1.0},
        {t: ctx.click, sel: '#gallery figcaption button', text: 'Billabong Cove', dx: 20, click: true, dur: 0.1},
        {t: 9.0, xy: [1250, 870], dur: 1.6},
      ], {x: 330, y});
      return ctx.cove(page, i, s);
    },
  },
  {
    // 5. Les piscines existantes : le panneau sombre monte, la carte « Text a photo » ;
    // puis « Resurfacing and tile » s'ouvre à la place des liners
    name: 'd-service',
    seconds: 9.5,
    watch: (page) => page.evaluate(() => ({tile: !!document.querySelector('#service img[alt*="tile" i], #service img[alt*="mosaic" i]')})),
    async setup(site) {
      const s0 = await top(site.page, '#service');
      await park(site, s0 - 660, 900);
      return {
        y: track([[0, s0 - 660], [1.9, s0 - 30, easeInOut], [9.5, s0 - 30]]),
        move: mover([
          {t: 3.0, sel: '#service .btn', text: 'Text a photo', dx: -26, dur: 1.1},
          {t: 3.7, sel: '#service .btn', text: 'Text a photo', dx: -6, dur: 0.6},
          {t: 5.4, sel: '#service button', text: 'Resurfacing and tile', dx: -220, click: true, dur: 1.2},
          {t: 9.2, xy: [1320, 880], dur: 1.6},
        ], {x: 1200, y: 880}),
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
    // 6. La demande : le Sydney Harbour choisi dans le comparateur, « Ask about this pool » ;
    // le site descend jusqu'au formulaire, qui l'a déjà joint ; le nom, le téléphone, la ville, l'envoi, le remerciement
    name: 'd-request',
    seconds: 13,
    watch: (page) => page.evaluate(() => ({sent: !!document.querySelector('#contact [role="status"]'), y: window.scrollY})),
    async setup(site) {
      const page = site.page;
      const m = await top(page, '#models');
      await park(site, m + 360, 700);
      const p = await centerOf(page, '#models .lineup-item', 'Sydney Harbour');
      await page.mouse.click(p.x, p.y);
      await page.mouse.move(1250, 880);
      await settle(page, 1400);
      return {
        move: mover([
          {t: 1.3, sel: '#models .btn', text: 'Ask about this pool', dx: -40, click: true, dur: 1.1},
          {t: 4.1, sel: '#name', dx: -110, click: true, dur: 0.9},
          {t: 5.0, sel: '#phone', dx: -90, click: true, dur: 0.6},
          {t: 6.3, sel: '#city', dx: -90, click: true, dur: 0.7},
          {t: 7.7, sel: '#contact button[type="submit"]', dx: -40, click: true, dur: 0.9},
          {t: 12.6, xy: [1300, 870], dur: 1.8},
        ], {x: 1250, y: 880}),
        type: typer([
          ['#name', 'Maria Lopez', 4.2, 4.8],
          ['#phone', '(407) 555-0142', 5.1, 5.9],
          ['#city', 'Winter Park', 6.4, 7.0],
        ]),
      };
    },
    async step(site, ctx, i, t) {
      const s = t / 1000;
      const page = site.page;
      // le site descend seul jusqu'au formulaire (Lenis, 1,4 s) ; une fois arrivé, on descend encore un peu
      // pour voir tout le formulaire, jusqu'au bouton d'envoi
      if (s >= 3.1) {
        if (ctx.land === undefined) ctx.land = await page.evaluate(() => window.scrollY);
        await scrollTo(page, Math.round(track([[3.1, ctx.land], [3.9, ctx.land + 250, easeInOut]])(s)));
      }
      if (s < 0.5) return null;
      await ctx.type(page, s);
      return ctx.move(page, i, s);
    },
  },
];

const mobile = [
  {
    // l'arrivée sur téléphone, puis on descend : la barre « Call · Text a photo » apparaît
    name: 'm-hero',
    seconds: 9,
    fresh: true,
    async setup() {
      return {y: track([[0, 0], [4.4, 0], [6.8, 690, easeInOut], [9, 700, sine]])};
    },
    step: scrolled,
  },
  {
    // le comparateur au doigt : Bondi (40′), puis Grande (29′)
    name: 'm-planner',
    seconds: 8,
    async setup(site) {
      const m = await top(site.page, '#models');
      await park(site, m + 300, 1000);
      return {y: m + 300, taps: [[Math.round(1.6 * FPS), 'Bondi'], [Math.round(4.6 * FPS), 'Grande']]};
    },
    // un vrai toucher (pas de souris : sur téléphone, rien ne doit s'allumer au survol avant le doigt)
    async step(site, ctx, i) {
      await scrollTo(site.page, ctx.y);
      const tap = ctx.taps.find(([at]) => at === i);
      if (!tap) return null;
      const p = await centerOf(site.page, '#models .lineup-item', tap[1]);
      const pos = {x: Math.min(p.x, 360), y: p.y - 14};
      await site.page.touchscreen.tap(pos.x, pos.y);
      return {mouse: pos, click: true};
    },
  },
  {
    // le menu : il s'ouvre, les rubriques montent, et les deux façons de joindre Gracie Pools
    name: 'm-menu',
    seconds: 6.5,
    async setup(site) {
      await scrollTo(site.page, 0);
      await settle(site.page, 600);
      return {tap: Math.round(1.4 * FPS)};
    },
    async step(site, ctx, i) {
      await scrollTo(site.page, 0);
      if (i !== ctx.tap) return null;
      const p = await centerOf(site.page, 'button[aria-label="Open the menu"]');
      await site.page.touchscreen.tap(p.x, p.y);
      return {mouse: p, click: true};
    },
  },
];

// --probe : rejoue les plans sans filmer, pour relever les repères (voir record() dans lib.mjs)
const probe = process.argv.includes('--probe');
const args = process.argv.slice(2).filter((a) => a !== '--probe');
const pick = (list, group) => list.filter((s) => !args.length || args.includes(s.name) || args.includes(group));

for (const [list, cfg, group] of [[desktop, DESK, 'desktop'], [mobile, MOBILE, 'mobile']]) {
  for (const shot of pick(list, group)) {
    const site = await openSite(cfg);
    site.page.on('pageerror', (e) => console.log(`  ${shot.name} : ${e.message}`));
    if (!shot.fresh) await settle(site.page, 5200);
    const ctx = await shot.setup(site);
    await record(site, {name: shot.name, fps: FPS, seconds: shot.seconds, step: (i, t) => shot.step(site, ctx, i, t), watch: shot.watch, probe});
    await site.browser.close();
  }
}
