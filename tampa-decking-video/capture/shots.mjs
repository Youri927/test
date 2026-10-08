// Plans filmés du nouveau site de Tampa Decking & Pools pour la vidéo de présentation 16:9.
// Usage : node capture/shots.mjs [desktop|mobile|nom-du-plan …]
import {openSite, record, scrollTo, settle, track, top, center, easeInOut, sine} from './lib.mjs';

const FPS = 60;
const DESK = {width: 1440, height: 900, dsf: 2};
const MOBILE = {width: 390, height: 844, dsf: 2, mobile: true};

/**
 * Souris (ou doigt) qui va d'une cible à l'autre. Chaque étape : {t, sel | xy | at, dx, dy, click, dur, key}.
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
    let key = null;
    while (idx < events.length && i >= Math.round(events[idx].t * FPS)) {
      from = await target(page, events[idx]);
      if (i === Math.round(events[idx].t * FPS)) {
        if (events[idx].click) click = true;
        if (events[idx].key) key = events[idx].key;
      }
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
    if (key) await page.keyboard.press(key);
    return {mouse: pos, click};
  };
};

/**
 * Saisie progressive. Chaque entrée : [sélecteur, texte, t0, t1, déjà tapé].
 * La dernière entrée commencée l'emporte : on peut taper « Bra », s'arrêter, puis finir « Brandon ».
 */
const typer = (fields) => {
  const shown = {};
  return async (page, s) => {
    const want = {};
    for (const [sel, text, t0, t1, from = 0] of fields) {
      if (s < t0) continue;
      const n = Math.min(text.length, from + Math.floor(((s - t0) / (t1 - t0)) * (text.length - from)));
      want[sel] = text.slice(0, n);
    }
    for (const [sel, v] of Object.entries(want)) {
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

/** Défilement de la coupe épinglée : position qui allume la couche k (0 = plage … 3 = enduit) */
const layerY = (pin, k) => Math.round(pin.start + ((k + 0.5) / 4) * (pin.end - pin.start));

const desktop = [
  {
    // 1. L'arrivée : « From the deck » monte sur le blanc, la photo monte comme l'eau, « to the deep end » passe dessus ;
    // survol du bouton de devis, puis la page descend un peu (parallaxe de la photo et de la seconde ligne)
    name: 'd-hero',
    seconds: 9,
    fresh: true,
    async setup() {
      return {
        y: track([[0, 0], [5.6, 0], [8.6, 470, easeInOut], [9, 470]]),
        move: mover([
          {t: 3.6, sel: '#top a.btn-sun', dx: -30, dur: 1.1},
          {t: 4.6, sel: '#top a.btn-sun', dx: -8, dur: 0.9},
          {t: 6.0, xy: [1330, 860], dur: 1.1},
        ], {x: 1330, y: 860}),
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
    // 2. La coupe : l'introduction apparaît, le dessin se construit, puis la scène reste en place
    // et chaque couche s'allume à son tour, le dessin se recadre dessus, le panneau change de photo
    name: 'd-layers',
    seconds: 16.5,
    async setup(site) {
      const stage = await top(site.page, '#layers .h-screen');
      const pin = {start: stage, end: stage + 900 * 3.4};
      await park(site, 520, 900);
      return {
        y: track([
          [0, 520], [1.6, 1000],
          [3.0, pin.start + 120, easeInOut],
          [3.2, layerY(pin, 0)],
          [5.6, layerY(pin, 0)], [6.3, layerY(pin, 1), easeInOut],
          [9.0, layerY(pin, 1)], [9.7, layerY(pin, 2), easeInOut],
          [12.4, layerY(pin, 2)], [13.1, layerY(pin, 3), easeInOut],
          [15.4, layerY(pin, 3)], [16.5, pin.end + 420, easeInOut],
        ]),
      };
    },
    step: scrolled,
  },
  {
    // 3. Le travail : le titre, les trois colonnes qui glissent à des vitesses différentes ;
    // on ouvre une photo dans la visionneuse, puis les deux suivantes
    name: 'd-work',
    seconds: 11.5,
    async setup(site) {
      const w = await top(site.page, '#work');
      await park(site, w - 700, 900);
      const end = w + 1420;
      return {
        y: track([[0, w - 700], [2.0, w + 40, easeInOut], [6.4, end, sine], [11.5, end]]),
        move: mover([
          {t: 7.2, at: (p) => pickTile(p), dur: 1.0},
          {t: 7.5, at: (p) => pickTile(p), click: true, dur: 0.3},
          {t: 8.7, sel: '[role="dialog"] button[aria-label="Next photo"]', dur: 1.0},
          {t: 8.9, sel: '[role="dialog"] button[aria-label="Next photo"]', click: true, dur: 0.2},
          {t: 10.1, sel: '[role="dialog"] button[aria-label="Next photo"]', click: true, dur: 0.3},
          {t: 11.4, sel: '[role="dialog"] button[aria-label="Next photo"]', dx: -60, dy: 70, dur: 1.0},
        ], {x: 1250, y: 820}),
      };
    },
    async step(site, ctx, i, t) {
      const s = t / 1000;
      await scrollTo(site.page, Math.round(ctx.y(s)));
      if (s < 6.0) return null;
      return ctx.move(site.page, i, s);
    },
  },
  {
    // 4. Les surfaces : on descend la liste, l'échantillon survolé s'ouvre dans le bandeau
    name: 'd-surfaces',
    seconds: 8.5,
    async setup(site) {
      const s = await top(site.page, '#surfaces');
      await park(site, s - 620, 800);
      const item = (k) => `#surfaces ul[aria-label="Surfaces"] li:nth-child(${k}) button`;
      return {
        y: track([[0, s - 620], [1.8, s + 40, easeInOut], [8.5, s + 40]]),
        move: mover([
          {t: 2.6, sel: item(2), dx: -40, dur: 1.0},
          {t: 3.6, sel: item(3), dx: -30, dur: 0.6},
          {t: 4.6, sel: item(4), dx: -20, dur: 0.6},
          {t: 5.6, sel: item(5), dx: -30, dur: 0.6},
          {t: 6.9, sel: item(8), dx: -40, dur: 0.9},
          {t: 8.4, sel: item(8), dx: 60, dy: 40, dur: 1.0},
        ], {x: 760, y: 860}),
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
    // 5. Les prix : les barres s'allongent et les montants comptent, puis on continue vers l'entretien
    // (la ligne du scellement se remplit au défilement)
    name: 'd-cost',
    seconds: 11,
    async setup(site) {
      const c = await top(site.page, '#cost');
      const care = await top(site.page, '#care');
      await park(site, c - 700, 800);
      return {y: track([[0, c - 700], [2.0, c + 40, easeInOut], [5.4, c + 40], [7.0, care + 60, easeInOut], [11, care + 760, sine]])};
    },
    step: scrolled,
  },
  {
    // 6. La famille : le titre se révèle mot à mot sur le bleu nuit, la photo de Mark et sa femme, puis les avis
    name: 'd-about',
    seconds: 10,
    async setup(site) {
      const a = await top(site.page, '#about');
      const rv = await top(site.page, '#about figure[data-up]');
      await park(site, a - 640, 800);
      return {y: track([[0, a - 640], [3.8, a - 20, sine], [5.4, a + 120, sine], [8.4, rv - 330, easeInOut], [10, rv - 320]])};
    },
    step: scrolled,
  },
  {
    // 7. Les villes : la liste apparaît ; on tape « Bra », le site propose Brandon, puis « Brandon » : oui
    name: 'd-areas',
    seconds: 8.5,
    async setup(site) {
      const a = await top(site.page, '#areas');
      await park(site, a - 520, 800);
      return {
        y: track([[0, a - 520], [1.8, a - 40, easeInOut], [8.5, a - 40]]),
        move: mover([
          {t: 2.6, sel: '#areas input', dx: -120, dur: 1.0},
          {t: 2.8, sel: '#areas input', dx: -120, click: true, dur: 0.2},
          {t: 6.4, sel: '#areas input', dx: -120, dur: 0.2},
          {t: 7.6, sel: '#areas input', dx: 40, dy: 90, dur: 1.0},
        ], {x: 1100, y: 860}),
        type: typer([
          ['#areas input', 'Bra', 3.0, 3.45],
          ['#areas input', 'Brandon', 4.3, 4.85, 3],
        ]),
      };
    },
    async step(site, ctx, i, t) {
      const s = t / 1000;
      await scrollTo(site.page, Math.round(ctx.y(s)));
      if (s < 1.8) return null;
      await ctx.type(site.page, s);
      return ctx.move(site.page, i, s);
    },
  },
  {
    // 8. Le devis : deux travaux, les coordonnées, le message, le moyen de contact, l'envoi, le remerciement
    name: 'd-estimate',
    seconds: 14,
    async setup(site) {
      const e = await top(site.page, '#estimate');
      await park(site, e - 560, 800);
      const y0 = e + 70;
      return {
        // on ne remonte pas après l'envoi : l'en-tête, qui revient quand on remonte, cacherait le titre
        y: track([[0, e - 560], [1.6, y0, easeInOut], [6.8, y0], [8.0, y0 + 230, easeInOut], [14, y0 + 230]]),
        move: mover([
          {t: 2.2, sel: '#estimate fieldset button:nth-of-type(1)', dur: 1.0},
          {t: 2.3, sel: '#estimate fieldset button:nth-of-type(1)', click: true, dur: 0.1},
          {t: 3.0, sel: '#estimate fieldset button:nth-of-type(2)', click: true, dur: 0.6},
          {t: 3.8, sel: 'input[name=name]', dx: -60, click: true, dur: 0.7},
          {t: 4.9, sel: 'input[name=phone]', dx: -50, click: true, dur: 0.6},
          {t: 6.2, sel: 'input[name=email]', dx: -80, click: true, dur: 0.7},
          {t: 8.4, sel: 'textarea[name=message]', dx: -120, click: true, dur: 0.8},
          {t: 10.5, sel: '#estimate [role="radio"][value="Text"]', click: true, dur: 0.8},
          {t: 11.4, sel: '#estimate button[type="submit"]', dx: -40, click: true, dur: 0.8},
          {t: 13.6, xy: [1180, 820], dur: 1.2},
        ], {x: 1300, y: 860}),
        type: typer([
          ['input[name=name]', 'Maria Lopez', 3.95, 4.5],
          ['input[name=phone]', '(813) 555-0148', 5.05, 5.9],
          ['input[name=email]', 'maria.lopez@example.com', 6.35, 7.2],
          ['textarea[name=message]', 'Our plaster is rough and stained, and the waterline tile is cracked.', 8.55, 10.0],
        ]),
      };
    },
    async step(site, ctx, i, t) {
      const s = t / 1000;
      await scrollTo(site.page, Math.round(ctx.y(s)));
      if (s < 1.6) return null;
      await ctx.type(site.page, s);
      return ctx.move(site.page, i, s);
    },
  },
];

/** La photo de la colonne du milieu la plus proche du centre de l'écran (la visionneuse s'ouvre dessus) */
const pickTile = (page) =>
  page.evaluate(() => {
    let best = null;
    for (const b of document.querySelectorAll('#work [data-col="1"] figure button')) {
      const r = b.getBoundingClientRect();
      const d = Math.abs(r.top + r.height / 2 - innerHeight * 0.5);
      if (!best || d < best.d) best = {d, x: r.left + r.width * 0.55, y: r.top + r.height * 0.5};
    }
    return {x: best.x, y: best.y};
  });

const mobile = [
  {
    // l'arrivée sur téléphone, puis la page descend vers les faits
    name: 'm-hero',
    seconds: 7.5,
    fresh: true,
    async setup() {
      return {y: track([[0, 0], [4.4, 0], [7.0, 360, easeInOut], [7.5, 360]])};
    },
    step: scrolled,
  },
  {
    // la coupe sur téléphone : on touche les onglets, la couche s'allume, la photo et le texte changent
    name: 'm-layers',
    seconds: 8,
    async setup(site) {
      const plate = await top(site.page, '#layers [role="tablist"]');
      const y = Math.round(plate - 330);
      await park(site, y, 1200);
      const tab = (id) => `#tab-${id}`;
      return {
        y,
        move: mover([
          {t: 1.2, sel: tab('coping'), click: true, dur: 0.6},
          {t: 3.3, sel: tab('tile'), click: true, dur: 0.6},
          {t: 5.4, sel: tab('finish'), click: true, dur: 0.6},
        ], {x: 200, y: 600}),
      };
    },
    async step(site, ctx, i, t) {
      await scrollTo(site.page, ctx.y);
      return ctx.move(site.page, i, t / 1000);
    },
  },
  {
    // le menu, puis « Get a free estimate » : le panneau se ferme et la page file jusqu'au formulaire
    name: 'm-menu',
    seconds: 7,
    async setup(site) {
      const w = await top(site.page, '#work');
      await park(site, w + 300, 800);
      // on remonte un peu : l'en-tête, masqué en descendant, réapparaît
      await scrollTo(site.page, w + 220);
      await settle(site.page, 900);
      return {
        move: mover([
          {t: 1.0, sel: 'header button[aria-label="Open the menu"]', click: true, dur: 0.7},
          {t: 3.3, sel: '[role="dialog"] nav a.btn-sun', click: true, dur: 0.9},
        ], {x: 260, y: 640}),
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
