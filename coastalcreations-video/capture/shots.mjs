// Plans filmés du nouveau site de Coastal Creations pour la vidéo de présentation 16:9 (image par image, temps simulé).
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
 * Souris qui va d'une cible à l'autre. Chaque étape : {t, sel, text | xy, dx, dy, click, dur}.
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
    if (click) {
      await page.mouse.down();
      await page.mouse.up();
      // le clic donne le focus au bouton : son contour de focus clavier n'a pas sa place dans la vidéo
      await page.evaluate(() => document.activeElement?.blur());
    }
    return {mouse: pos, click};
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

/** Défilement (clés en secondes) et souris éventuelle, à partir de `from` secondes */
const scrollAndMove = (from = 0) => async (site, ctx, i, t) => {
  const s = t / 1000;
  await scrollTo(site.page, Math.round(ctx.y(s)));
  if (!ctx.move || s < from) return null;
  return ctx.move(site.page, i, s);
};

const desktop = [
  {
    // 1. L'arrivée : la photo de Bradenton se pose, le titre monte, le devis et la pastille arrivent ;
    // puis on descend : l'en-tête devient plein, la photo glisse moins vite que la page, le titre s'efface
    name: 'd-hero',
    seconds: 6.2,
    fresh: true,
    async setup() {
      return {y: track([[0, 0], [3.9, 0], [6.2, 560, easeInOut]])};
    },
    step: scrolled,
  },
  {
    // 2. La phrase qui s'allume mot à mot, les chiffres qui comptent, puis les cartes qui s'empilent
    name: 'd-cards',
    seconds: 6.5,
    async setup(site) {
      const p = await top(site.page, '.intro__text');
      const c = await top(site.page, '.stack__cards');
      await park(site, p - 720, 900);
      return {y: track([[0, p - 720], [2.3, p - 120, easeInOut], [2.6, p - 112, sine], [6.5, c + 1430, easeInOut]])};
    },
    step: scrolled,
  },
  {
    // 3. La construction : l'écran tient, les sept étapes passent avec leurs photos, le compteur et la barre avancent
    name: 'd-build',
    seconds: 7.0,
    async setup(site) {
      const b = await top(site.page, '#build');
      await park(site, b - 420, 900);
      const pin = Math.round(900 * 0.7 * 6);
      return {y: track([[0, b - 420], [1.0, b, easeInOut], [6.6, b + pin - 120, sine], [7.0, b + pin - 100, sine]])};
    },
    step: scrolled,
  },
  {
    // 4. Avant / après : les deux mots glissent en sens contraire, l'après de Holmes Beach s'ouvre, l'avant dérive
    name: 'd-reno',
    seconds: 5.8,
    async setup(site) {
      const r = await top(site.page, '.reno__head');
      const j = await top(site.page, '.job');
      await park(site, r - 420, 900);
      return {y: track([[0, r - 420], [1.3, r - 90, easeInOut], [5.8, j + 240, sine]])};
    },
    step: scrolled,
  },
  {
    // 5. Le nuancier : il s'ouvre, puis la souris choisit trois enduits Stonescapes
    name: 'd-finish',
    seconds: 5.0,
    async setup(site) {
      const f = await top(site.page, '.finish__head');
      await park(site, f - 420, 900);
      return {
        y: track([[0, f - 420], [1.0, f - 70, easeInOut], [5.0, f - 60, sine]]),
        move: mover([
          {t: 2.0, sel: 'button.pill[data-finish]', text: 'Caribbean Blue Mini', click: true, dur: 0.9},
          {t: 2.9, sel: 'button.pill[data-finish]', text: 'French Gray', click: true, dur: 0.55},
          {t: 3.8, sel: 'button.pill[data-finish]', text: 'Tahoe Blue', click: true, dur: 0.55},
          {t: 4.9, xy: [1320, 860], dur: 0.9},
        ], {x: 1300, y: 880}),
      };
    },
    step: scrollAndMove(1.0),
  },
  {
    // 6. Les tarifs de détection de fuites : ils comptent jusqu'à leur valeur, puis le calcul (spa, deux jeux d'eau, une buse)
    name: 'd-leaks',
    seconds: 6.5,
    async setup(site) {
      const p = await top(site.page, '.prices');
      await park(site, p - 1000, 900);
      return {
        y: track([[0, p - 1000], [1.6, p - 96, easeInOut], [6.5, p - 90, sine]]),
        move: mover([
          {t: 2.7, sel: '[data-spa="1"]', click: true, dur: 0.9},
          {t: 3.5, sel: '[data-step="features"][data-by="1"]', click: true, dur: 0.6},
          {t: 4.0, sel: '[data-step="features"][data-by="1"]', click: true, dur: 0.2},
          {t: 4.7, sel: '[data-step="heads"][data-by="1"]', click: true, dur: 0.5},
          {t: 6.4, xy: [1320, 860], dur: 1.2},
        ], {x: 1300, y: 880}),
      };
    },
    step: scrollAndMove(1.6),
  },
  {
    // 7. Le contact : le titre monte, le numéro en très grand, les trois façons de les joindre
    name: 'd-contact',
    seconds: 4.6,
    async setup(site) {
      const c = await top(site.page, '#contact');
      await park(site, c - 520, 900);
      return {y: track([[0, c - 520], [1.4, c - 10, easeInOut], [4.6, c + 360, sine]])};
    },
    step: scrolled,
  },
];

const mobile = [
  {
    // l'arrivée sur téléphone : la photo recadrée sur l'eau, le titre, le devis
    name: 'm-hero',
    seconds: 6.2,
    fresh: true,
    async setup() {
      return {y: track([[0, 0], [4.4, 0], [6.2, 300, easeInOut]])};
    },
    step: scrolled,
  },
  {
    // les cartes qui s'empilent, au pouce
    name: 'm-cards',
    seconds: 6.2,
    async setup(site) {
      const c = await top(site.page, '.stack__cards');
      await park(site, c - 300, 900);
      return {y: track([[0, c - 300], [6.2, c + 1500, sine]])};
    },
    step: scrolled,
  },
  {
    // le menu : il s'ouvre en plein écran
    name: 'm-menu',
    seconds: 6.2,
    async setup(site) {
      await scrollTo(site.page, 0);
      await settle(site.page, 600);
      return {tap: Math.round(1.6 * FPS)};
    },
    async step(site, ctx, i) {
      await scrollTo(site.page, 0);
      if (i !== ctx.tap) return null;
      const p = await centerOf(site.page, '[data-menu]');
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
    if (!shot.fresh) await settle(site.page, 3000);
    const ctx = await shot.setup(site);
    await record(site, {name: shot.name, fps: FPS, seconds: shot.seconds, step: (i, t) => shot.step(site, ctx, i, t), watch: shot.watch, probe});
    await site.browser.close();
  }
}
