// Plans filmés du nouveau site d'Implant and Comprehensive Dentistry of Naples pour la vidéo de présentation 16:9.
// Usage : node capture/shots.mjs [desktop|mobile|nom-du-plan …]
import {openSite, record, scrollTo, settle, track, top, center, easeInOut, sine} from './lib.mjs';

const FPS = 60;
const DESK = {width: 1440, height: 900, dsf: 2};
const MOBILE = {width: 390, height: 844, dsf: 2, mobile: true};
const linear = (t) => t;
// fin du plan d'accueil : le plan des implants repart exactement de là (raccord invisible dans la vidéo)
const HERO_END = 1160;

/**
 * Souris (ou doigt) qui va d'une cible à l'autre. Chaque étape : {t, sel | xy | at, dx, dy, click, dur}.
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

const rect = (page, sel) =>
  page.evaluate((sel) => {
    const r = document.querySelector(sel).getBoundingClientRect();
    return {top: r.top + window.scrollY, height: r.height};
  }, sel);

const desktop = [
  {
    // 1. L'arrivée : les mots montent, la pastille du sourire s'ouvre ; survol du bouton d'appel ;
    // puis on défile : la pastille grandit jusqu'au portrait entier, son nom apparaît sur le mur
    name: 'd-hero',
    watch: (page) => page.evaluate(() => ({card: !!document.querySelector('.hero-card[data-on]')})),
    seconds: 11.5,
    fresh: true,
    async setup() {
      return {
        y: track([[0, 0], [3.9, 0], [8.3, 1100, easeInOut], [11.5, HERO_END, sine]]),
        move: mover([
          {t: 2.9, sel: '#top a.btn-teal', dx: -24, dur: 1.0},
          {t: 3.5, sel: '#top a.btn-teal', dx: -6, dur: 0.6},
          {t: 4.6, xy: [1380, 870], dur: 1.0},
        ], {x: 1180, y: 860}),
      };
    },
    async step(site, ctx, i, t) {
      const s = t / 1000;
      await scrollTo(site.page, Math.round(ctx.y(s)));
      if (s < 1.9 || s > 4.7) return null;
      return ctx.move(site.page, i, s);
    },
  },
  {
    // 2. Les implants : le logo se construit au défilement (la racine, la vis filet par filet, la couronne),
    // puis les trois parties se nomment
    name: 'd-implants',
    // la racine, chaque filet de la vis (du bas vers le haut), la couronne, puis les trois légendes
    watch: (page) =>
      page.evaluate(() => {
        const op = (el) => Number(getComputedStyle(el).opacity);
        const root = document.querySelector('#implants [data-part="root"]');
        const svg = root.ownerSVGElement;
        const k0 = svg.getBoundingClientRect().width / svg.viewBox.baseVal.width;
        // largeur affichée du filet / largeur dessinée : le filet s'étire de 0 à 1
        const sx = (el) => el.getBoundingClientRect().width / (el.getBBox().width * k0);
        const out = {root: op(root) > 0.5, crown: op(document.querySelector('#implants [data-part="crown"]')) > 0.6};
        [...document.querySelectorAll('#implants [data-part="thread"]')].forEach((el, k) => { out['thread' + k] = sx(el) > 0.6; });
        [...document.querySelectorAll('.dg-label')].forEach((el, k) => { out['label' + k] = op(el) > 0.5; });
        // haut du schéma dans la fenêtre (px CSS) : la caméra de la vidéo le suit
        out.dgTop = svg.getBoundingClientRect().top;
        return out;
      }),
    seconds: 8.8,
    async setup(site) {
      // relevé (balayage lent) : la racine apparaît entre y0−580 et y0−420, les filets entre y0−420 et y0−220,
      // la couronne entre y0−220 et y0−20, les légendes entre y0 et y0+180 ; la vis est en bas de l'écran pendant les filets
      const y0 = await top(site.page, '#implants');
      await park(site, HERO_END, 900);
      return {y: track([[0, HERO_END], [2.3, y0 - 480, easeInOut], [4.9, y0 - 200, linear], [6.5, y0 + 40, sine], [7.9, y0 + 200, sine], [8.8, y0 + 220, sine]])};
    },
    step: scrolled,
  },
  {
    // 3. La couronne en une séance : le cadre reste en place, les deux lignes font la course,
    // E4D finit à la première visite, la méthode habituelle à la seconde
    name: 'd-crowns',
    watch: (page) =>
      page.evaluate(() => {
        const el = document.querySelector('.race');
        return {e4d: el.hasAttribute('data-e4d'), usual: el.hasAttribute('data-usual'), p: Number(el.style.getPropertyValue('--p') || 0)};
      }),
    seconds: 10,
    async setup(site) {
      const y0 = await top(site.page, '#crowns');
      await park(site, y0 - 520, 900);
      return {y: track([[0, y0 - 520], [1.5, y0, easeInOut], [2.1, y0], [9.0, y0 + 1350, linear], [10, y0 + 1350]])};
    },
    step: scrolled,
  },
  {
    // 4. Tout le reste : les lignes des situations au survol, puis « A tooth is missing » ouvre sa fiche
    name: 'd-treatments',
    watch: (page) => page.evaluate(() => ({sheet: !!document.querySelector('[role="dialog"]')})),
    seconds: 10.5,
    async setup(site) {
      const y0 = await top(site.page, '#treatments');
      await park(site, y0 - 620, 900);
      const row = (k) => `#treatments li:nth-child(${k}) .sit`;
      return {
        y: track([[0, y0 - 620], [1.7, y0 + 70, easeInOut], [10.5, y0 + 70]]),
        move: mover([
          {t: 2.7, sel: row(1), dx: -380, dur: 0.9},
          {t: 3.4, sel: row(2), dx: -330, dur: 0.5},
          {t: 4.1, sel: row(3), dx: -300, dur: 0.5},
          {t: 4.8, sel: row(4), dx: -340, dur: 0.5},
          {t: 5.7, sel: row(1), dx: -360, dur: 0.7},
          {t: 5.9, sel: row(1), dx: -360, click: true, dur: 0.2},
          {t: 8.6, sel: '[role="dialog"] a.btn-teal', dx: -20, dur: 1.3},
          {t: 10.2, sel: '[role="dialog"] a.btn-teal', dx: 30, dy: -6, dur: 1.0},
        ], {x: 760, y: 870}),
      };
    },
    async step(site, ctx, i, t) {
      const s = t / 1000;
      await scrollTo(site.page, Math.round(ctx.y(s)));
      if (s < 1.6) return null;
      return ctx.move(site.page, i, s);
    },
  },
  {
    // 5. La sédation : la section reste en place ; du protoxyde d'azote à la sédation consciente,
    // puis intraveineuse, la lumière baisse
    name: 'd-sedation',
    watch: (page) =>
      page.evaluate(() => {
        const el = document.querySelector('.sed');
        const level = Number(el.dataset.level);
        return {level1: level >= 1, level2: level >= 2, sp: Number(el.style.getPropertyValue('--sp') || 0)};
      }),
    seconds: 10,
    async setup(site) {
      const y0 = await top(site.page, '#sedation');
      await park(site, y0 - 560, 900);
      const at = (p) => Math.round(y0 + p * 1890);
      return {y: track([[0, y0 - 560], [1.6, at(0.08), easeInOut], [3.2, at(0.16)], [4.8, at(0.5), easeInOut], [6.2, at(0.55)], [7.8, at(0.86), easeInOut], [10, at(0.9)]])};
    },
    step: scrolled,
  },
  {
    // 6. Le Dr. Fakhoury : son parcours se trace sur la carte, du Michigan à New York puis à Naples
    name: 'd-doctor',
    // les étapes du parcours qui apparaissent sur la carte, et le tracé de la route
    watch: (page) =>
      page.evaluate(() => {
        const op = (id) => Number(getComputedStyle(document.querySelector(`[data-stop="${id}"]`)).opacity);
        const route = document.querySelector('.map-route');
        return {mi: op('mi') > 0.5, ny: op('ny') > 0.5, fl: op('fl') > 0.5, route: 1 - Number(getComputedStyle(route).strokeDashoffset.replace('px', '') || 0)};
      }),
    seconds: 8.5,
    async setup(site) {
      const map = await rect(site.page, '[aria-label^="Map:"]');
      const doc = await top(site.page, '#doctor');
      await park(site, doc - 240, 900);
      return {y: track([[0, doc - 240], [1.6, doc + 60, easeInOut], [7.0, map.top + map.height - 560, sine], [8.5, map.top + map.height - 540]])};
    },
    step: scrolled,
  },
  {
    // 7. Le cabinet et la demande : l'adresse et les horaires (mardi signalé), puis le formulaire :
    // la situation, le nom, le téléphone, l'e-mail, le matin, l'envoi, le remerciement
    name: 'd-request',
    watch: (page) => page.evaluate(() => ({sent: !!document.querySelector('#request [role="status"]')})),
    seconds: 12.5,
    async setup(site) {
      const v = await top(site.page, '#visit');
      const r = await top(site.page, '#request');
      await park(site, v + 120, 900);
      const chip = (txt) => `#request [role="radio"][value="${txt}"]`;
      return {
        y: track([[0, v + 120], [1.7, v + 160, sine], [3.0, r - 10, easeInOut], [7.0, r - 10], [7.9, r + 190, easeInOut], [12.5, r + 190]]),
        move: mover([
          {t: 3.6, sel: chip('A tooth is cracked or broken'), dur: 0.9},
          {t: 3.75, sel: chip('A tooth is cracked or broken'), click: true, dur: 0.15},
          {t: 4.4, sel: '#request input[name=name]', dx: -150, click: true, dur: 0.6},
          {t: 5.5, sel: '#request input[name=phone]', dx: -60, click: true, dur: 0.6},
          {t: 6.6, sel: '#request input[name=email]', dx: -60, click: true, dur: 0.6},
          {t: 8.5, sel: chip('Morning'), click: true, dur: 0.6},
          {t: 9.5, sel: '#request button[type="submit"]', dx: -60, click: true, dur: 0.8},
          {t: 12.0, xy: [1280, 860], dur: 1.4},
        ], {x: 1300, y: 860}),
        type: typer([
          ['#request input[name=name]', 'Maria Lopez', 4.55, 5.1],
          ['#request input[name=phone]', '(239) 555-0148', 5.65, 6.4],
          ['#request input[name=email]', 'maria.lopez@example.com', 6.75, 7.6],
        ]),
      };
    },
    async step(site, ctx, i, t) {
      const s = t / 1000;
      await scrollTo(site.page, Math.round(ctx.y(s)));
      if (s < 2.8) return null;
      await ctx.type(site.page, s);
      return ctx.move(site.page, i, s);
    },
  },
];

const mobile = [
  {
    // l'arrivée sur téléphone, puis le portrait qui s'ouvre et le nom dessous
    name: 'm-hero',
    seconds: 8,
    fresh: true,
    async setup() {
      return {y: track([[0, 0], [3.0, 0], [6.4, 790, easeInOut], [8, 790]])};
    },
    step: scrolled,
  },
  {
    // la course des couronnes, verticale sur téléphone
    name: 'm-crowns',
    watch: (page) =>
      page.evaluate(() => {
        const el = document.querySelector('.race');
        return {e4d: el.hasAttribute('data-e4d'), usual: el.hasAttribute('data-usual'), p: Number(el.style.getPropertyValue('--p') || 0)};
      }),
    seconds: 8,
    async setup(site) {
      const race = await rect(site.page, '.race');
      const start = Math.round(race.top + race.height / 2 - 844 / 2);
      await park(site, start - 360, 900);
      return {y: track([[0, start - 360], [1.4, start, easeInOut], [6.8, start + 970, linear], [8, start + 970]])};
    },
    step: scrolled,
  },
  {
    // une situation touchée : sa fiche s'ouvre en plein écran
    name: 'm-sheet',
    watch: (page) => page.evaluate(() => ({sheet: !!document.querySelector('[role="dialog"]')})),
    seconds: 7,
    async setup(site) {
      const y0 = await top(site.page, '#treatments');
      await park(site, y0 + 330, 1000);
      return {y: y0 + 330, tap: Math.round(1.5 * FPS)};
    },
    // un vrai toucher (pas de souris : sur téléphone, rien ne doit s'allumer au survol avant le doigt)
    async step(site, ctx, i) {
      await scrollTo(site.page, ctx.y);
      if (i !== ctx.tap) return null;
      const p = await center(site.page, '#treatments li:nth-child(2) .sit');
      const pos = {x: p.x - 60, y: p.y};
      await site.page.touchscreen.tap(pos.x, pos.y);
      return {mouse: pos, click: true};
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
