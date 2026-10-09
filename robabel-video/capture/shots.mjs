// Plans filmés du nouveau site de Custom Pools by Rob Abel pour la vidéo de présentation 16:9.
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

/** Défilement (clés en secondes) et souris éventuelle, à partir de `from` secondes */
const scrollAndMove = (from = 0) => async (site, ctx, i, t) => {
  const s = t / 1000;
  await scrollTo(site.page, Math.round(ctx.y(s)));
  if (!ctx.move || s < from) return null;
  return ctx.move(site.page, i, s);
};

const desktop = [
  {
    // 1. L'arrivée : la photo lumières éteintes, la maison, les palmiers un à un, puis la piscine en violet ;
    // ensuite la souris choisit l'aqua, le bleu, le blanc, et revient au violet
    name: 'd-hero',
    seconds: 9.6,
    fresh: true,
    async setup() {
      return {
        y: () => 0,
        move: mover([
          {t: 5.2, sel: '[role=radio][aria-label="Aqua"]', click: true, dur: 1.1},
          {t: 6.3, sel: '[role=radio][aria-label="Blue"]', click: true, dur: 0.6},
          {t: 7.4, sel: '[role=radio][aria-label="White"]', click: true, dur: 0.6},
          {t: 8.6, sel: '[role=radio][aria-label="Violet"]', click: true, dur: 0.8},
          {t: 9.5, xy: [1300, 860], dur: 0.9},
        ], {x: 1330, y: 880}),
      };
    },
    step: scrollAndMove(4.1),
  },
  {
    // 2. On quitte l'accueil (la scène avance, le titre s'efface, la nuit tombe) ; Rob, puis les deux fontaines :
    // la boucle part de la largeur du texte et s'élargit jusqu'aux bords ; puis les photos de la piscine aux motos
    name: 'd-pools',
    seconds: 11.5,
    watch: (page) => page.evaluate(() => ({y: window.scrollY})),
    async setup(site) {
      const rob = await top(site.page, '#rob');
      const loop = await top(site.page, '.loop-bleed');
      await scrollTo(site.page, 0);
      await settle(site.page, 800);
      return {
        y: track([
          [0, 0],
          [2.0, rob - 70, easeInOut],
          [3.4, rob - 50, sine],
          [5.0, loop - 830, easeInOut],
          [8.6, loop - 190, sine],
          [11.5, loop + 420, sine],
        ]),
      };
    },
    step: scrolled,
  },
  {
    // 3. Au bord de l'eau : l'après-midi, le crépuscule et la nuit montent en décalé, les photos de nuit s'allument
    name: 'd-water',
    seconds: 7.5,
    async setup(site) {
      const w = await top(site.page, '#pools .wrap + .wrap');
      await park(site, w - 420, 900);
      return {y: track([[0, w - 420], [1.5, w - 110, easeInOut], [6.2, w + 300, sine], [7.5, w + 330, sine]])};
    },
    step: scrolled,
  },
  {
    // 4. Le local technique : le titre ; puis le circuit reste fixé pendant que l'eau le parcourt ;
    // trois clics sur la tuyauterie (schedule 40, schedule 80, PVC transparent) ; puis la pièce elle-même
    name: 'd-pump',
    seconds: 14,
    watch: (page) => page.evaluate(() => ({on: document.querySelectorAll('.station.is-on').length, flow: parseFloat(document.querySelector('.circuit').style.getPropertyValue('--flow')) || 0})),
    async setup(site) {
      const page = site.page;
      const pr = await top(page, '#pump-room');
      const tr = await top(page, '.circuit-track');
      await park(site, pr - 500, 900);
      const stick = await page.evaluate(() => parseFloat(document.querySelector('.circuit-track').style.getPropertyValue('--stick')) || 246);
      const s0 = tr - stick;
      return {
        y: track([
          [0, pr - 500],
          [1.6, pr - 60, easeInOut],
          [2.4, pr - 40, sine],
          [3.2, s0, easeInOut],
          [8.4, s0 + 780, sine],
          [11.3, s0 + 790, sine],
          [13.9, s0 + 1330, easeInOut],
        ]),
        move: mover([
          {t: 8.9, sel: '.pipe-opt', text: 'Schedule 40', click: true, dur: 1.0},
          {t: 9.8, sel: '.pipe-opt', text: 'Schedule 80', click: true, dur: 0.6},
          {t: 10.8, sel: '.pipe-opt', text: 'Clear PVC', click: true, dur: 0.6},
          {t: 11.9, xy: [1320, 860], dur: 1.1},
        ], {x: 1330, y: 860}),
      };
    },
    step: scrollAndMove(7.9),
  },
  {
    // 5. Autour de l'eau : la photo reste en place et change avec le sujet au milieu de l'écran
    name: 'd-backyard',
    seconds: 8.5,
    async setup(site) {
      const b = await top(site.page, '#backyard');
      await park(site, b - 500, 900);
      return {y: track([[0, b - 500], [1.5, b - 40, easeInOut], [2.1, b - 30, sine], [8.5, b + 1650, sine]])};
    },
    step: scrolled,
  },
  {
    // 6. Neuve ou existante : les étapes de la piscine neuve, reliées par un tuyau qui se remplit ;
    // on remonte aux onglets (le tuyau se vide), la souris choisit « The pool you have », et les étapes de la rénovation
    // se remplissent à leur tour. Le tuyau se remplit quand il passe la ligne des 62 % de l'écran (how.tsx).
    name: 'd-how',
    seconds: 9.0,
    watch: (page) => page.evaluate(() => ({lit: document.querySelectorAll('.how-panel:not([hidden]) .step.is-on').length})),
    async setup(site) {
      const h = await top(site.page, '#how');
      await park(site, h - 500, 900);
      return {
        // une étape s'allume tous les 120 px de défilement environ : h + 500 allume les cinq de la piscine neuve,
        // h + 390 les quatre de la rénovation
        y: track([[0, h - 500], [1.4, h - 40, easeInOut], [4.0, h + 500, sine], [4.3, h + 500], [5.3, h - 110, easeInOut], [6.0, h - 110], [8.3, h + 390, sine], [9.0, h + 396, sine]]),
        move: mover([
          {t: 5.7, sel: '.tab', text: 'The pool you have', dx: -40, click: true, dur: 1.0},
          {t: 8.8, xy: [1320, 860], dur: 1.6},
        ], {x: 1330, y: 860}),
      };
    },
    async step(site, ctx, i, t) {
      const r = await scrollAndMove(4.5)(site, ctx, i, t);
      // le clic donne le focus à l'onglet : son contour de focus clavier n'a pas sa place dans la vidéo
      if (r?.click) await site.page.evaluate(() => document.activeElement?.blur());
      return r;
    },
  },
  {
    // 7. Chlore ou sel : cinq choix, le fléau penche du côté du sel
    name: 'd-salt',
    seconds: 8,
    async setup(site) {
      const s = await top(site.page, '#salt');
      await park(site, s - 420, 900);
      return {
        y: track([[0, s - 420], [1.5, s - 30, easeInOut], [8, s - 20, sine]]),
        move: mover([
          {t: 2.6, sel: '.chip', text: 'Better water', click: true, dur: 1.0},
          {t: 3.5, sel: '.chip', text: 'Easy upkeep', click: true, dur: 0.6},
          {t: 4.4, sel: '.chip', text: 'Lower running cost', click: true, dur: 0.6},
          {t: 5.4, sel: '.chip', text: 'Easy repairs', click: true, dur: 0.6},
          {t: 6.4, sel: '.chip', text: 'No odor', click: true, dur: 0.6},
          {t: 7.9, xy: [1320, 860], dur: 1.2},
        ], {x: 1330, y: 860}),
      };
    },
    step: scrollAndMove(1.7),
  },
  {
    // 8. La carte (elle recule depuis le bureau, les villes, la route 30A), puis le rendez-vous : le nom, le téléphone,
    // la ville, le projet, l'envoi ; la page remonte au remerciement
    name: 'd-contact',
    seconds: 13.0,
    watch: (page) => page.evaluate(() => ({sent: !!document.querySelector('.form-done')})),
    async setup(site) {
      const page = site.page;
      const a = await top(page, '#area');
      const c = await top(page, '#contact');
      await park(site, a - 500, 900);
      return {
        y: track([[0, a - 500], [1.6, a - 40, easeInOut], [3.8, a + 70, sine], [5.2, c - 30, easeInOut], [5.6, c - 20, sine], [8.2, c - 20], [8.9, c + 300, easeInOut], [10.6, c + 300], [11.5, c - 20, easeInOut], [13.0, c - 20]]),
        move: mover([
          {t: 6.1, sel: '#f-name', dx: -120, click: true, dur: 0.8},
          {t: 7.0, sel: '#f-phone', dx: -60, click: true, dur: 0.5},
          // pas de clic sur la liste déroulante : il ouvrirait le menu natif, qui bloque la capture
          {t: 8.0, sel: '#f-town', dx: -40, dur: 0.5},
          {t: 9.4, sel: '.chip', text: 'Equipment or a pump room', click: true, dur: 0.8},
          {t: 10.3, sel: '#contact button[type="submit"]', dx: -30, click: true, dur: 0.7},
          {t: 12.6, xy: [1320, 860], dur: 1.4},
        ], {x: 1330, y: 860}),
        type: typer([
          ['#f-name', 'Jordan Ellis', 6.2, 6.8],
          ['#f-phone', '(850) 555-0147', 7.1, 7.8],
        ]),
        town: Math.round(8.1 * FPS),
      };
    },
    async step(site, ctx, i, t) {
      const s = t / 1000;
      const page = site.page;
      await scrollTo(page, Math.round(ctx.y(s)));
      // la liste déroulante native ne s'affiche pas dans une capture : la ville est choisie directement.
      // Pas de selectOption : il attend que l'élément soit « stable », ce que l'horloge simulée, arrêtée, ne permet jamais.
      if (i === ctx.town) {
        await page.evaluate(() => {
          const el = document.querySelector('#f-town');
          el.value = 'Destin';
          el.dispatchEvent(new Event('change', {bubbles: true}));
        });
      }
      if (s < 5.4) return null;
      await ctx.type(page, s);
      return ctx.move(page, i, s);
    },
  },
];

const mobile = [
  {
    // l'arrivée sur téléphone : les lumières s'allument
    name: 'm-hero',
    seconds: 6.5,
    fresh: true,
    async setup() {
      return {y: () => 0};
    },
    step: scrolled,
  },
  {
    // le circuit vertical : l'eau descend avec la lecture, les appareils s'allument
    name: 'm-pump',
    seconds: 7.5,
    async setup(site) {
      const tr = await top(site.page, '.circuit-track');
      await park(site, tr - 260, 900);
      return {y: track([[0, tr - 260], [7.5, tr + 1500, sine]])};
    },
    step: scrolled,
  },
  {
    // le menu : il s'ouvre, les rubriques, le numéro
    name: 'm-menu',
    seconds: 5.5,
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
