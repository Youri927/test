// Plans filmés du nouveau site de Petri Pools pour la vidéo de présentation 16:9 (image par image, temps simulé).
// Usage : node capture/shots.mjs [desktop|mobile|nom-du-plan …] [--probe]
import {openSite, record, scrollTo, settle, top, sine, easeInOut, track} from './lib.mjs';

const FPS = 60;
const DESK = {width: 1440, height: 900, dsf: 2};
const MOBILE = {width: 390, height: 844, dsf: 2, mobile: true};

/** Allure de croisière : accélère sur la part `a` du trajet, roule à vitesse constante, freine sur la part `b` */
const cruise = (a = 0.1, b = 0.12) => (t) => {
  const v = 1 / (1 - a / 2 - b / 2);
  if (t < a) return (v * t * t) / (2 * a);
  if (t > 1 - b) {
    const u = 1 - t;
    return 1 - (v * u * u) / (2 * b);
  }
  return v * (t - a / 2);
};

/** Toutes les photos chargées et décodées tout de suite (le site les charge au défilement) : aucune image vide à l'écran */
const prime = (page) =>
  page.evaluate(async () => {
    for (const img of document.images) img.loading = 'eager';
    await Promise.all([...document.images].map((i) => i.decode().catch(() => null)));
  });

/** Rectangle d'un élément, en px du document */
const rect = (page, sel) =>
  page.evaluate((sel) => {
    const r = document.querySelector(sel).getBoundingClientRect();
    return {left: r.left, top: r.top + scrollY, width: r.width, height: r.height};
  }, sel);

/** Centre (px du viewport) du premier élément visible qui correspond */
const centerOf = (page, sel) =>
  page.evaluate((sel) => {
    const all = [...document.querySelectorAll(sel)];
    const el = all.find((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; });
    if (!el) throw new Error('cible introuvable : ' + sel);
    const r = el.getBoundingClientRect();
    return {x: r.left + r.width / 2, y: r.top + r.height / 2};
  }, sel);

/** Place la page à y en y descendant (les apparitions plus haut sont déjà jouées), puis laisse passer un peu de temps */
const park = async (site, y, ms = 1000) => {
  const page = site.page;
  for (let v = 0; v < y - 300; v += 400) { await scrollTo(page, v); await settle(page, 60); }
  await scrollTo(page, y - 150);
  await settle(page, 200);
  await scrollTo(page, y);
  await settle(page, ms);
};

const scrolled = async (site, ctx, i, t) => {
  await scrollTo(site.page, Math.round(ctx.y(t / 1000)));
};

/** Trajet de souris par clés [[t, x, y, easing], …] (secondes, px du viewport) */
const path = (keys) => (s) => {
  if (s <= keys[0][0]) return {x: keys[0][1], y: keys[0][2]};
  for (let k = 1; k < keys.length; k++) {
    const [ta, xa, ya] = keys[k - 1];
    const [tb, xb, yb, e = sine] = keys[k];
    if (s <= tb) {
      const u = e((s - ta) / (tb - ta));
      return {x: xa + (xb - xa) * u, y: ya + (yb - ya) * u};
    }
  }
  const last = keys[keys.length - 1];
  return {x: last[1], y: last[2]};
};

/**
 * Défilement lisse qui passe par des clés [[t, y], …] (secondes, px du document) : courbe cubique monotone (Fritsch–Carlson),
 * sans arrêt aux clés. Sert à faire tomber un changement du site (une photo, une étiquette) sur un temps de la musique.
 */
const spline = (keys) => {
  const n = keys.length;
  const d = keys.slice(1).map(([t, y], k) => (y - keys[k][1]) / (t - keys[k][0]));
  const m = keys.map((_, k) => (k === 0 ? d[0] : k === n - 1 ? d[n - 2] : d[k - 1] * d[k] <= 0 ? 0 : (d[k - 1] + d[k]) / 2));
  for (let k = 0; k < n - 1; k++) {
    if (d[k] === 0) { m[k] = 0; m[k + 1] = 0; continue; }
    const a = m[k] / d[k];
    const b = m[k + 1] / d[k];
    const h = Math.hypot(a, b);
    if (h > 3) { m[k] = (3 * a * d[k]) / h; m[k + 1] = (3 * b * d[k]) / h; }
  }
  return (s) => {
    if (s <= keys[0][0]) return keys[0][1];
    if (s >= keys[n - 1][0]) return keys[n - 1][1];
    let k = 0;
    while (s > keys[k + 1][0]) k++;
    const [t0, y0] = keys[k];
    const [t1, y1] = keys[k + 1];
    const h = t1 - t0;
    const u = (s - t0) / h;
    const h00 = 2 * u ** 3 - 3 * u ** 2 + 1, h10 = u ** 3 - 2 * u ** 2 + u, h01 = -2 * u ** 3 + 3 * u ** 2, h11 = u ** 3 - u ** 2;
    return h00 * y0 + h10 * h * m[k] + h01 * y1 + h11 * h * m[k + 1];
  };
};

/** Un clic : la souris appuie et relâche à l'image i */
const click = async (page) => {
  await page.mouse.down();
  await page.mouse.up();
  await page.evaluate(() => document.activeElement && document.activeElement.blur());
};

const desktop = [
  {
    // 1. Le chargement : le titre monte, la frise de céramique beige se recarrelle en mosaïque de verre, le reflet passe,
    // puis l'accroche et le bouton arrivent dans l'eau
    name: 'd-open',
    seconds: 9,
    fresh: true,
    async setup(site) {
      await prime(site.page);
      return {y: () => 0};
    },
    step: scrolled,
    watch: (page) => page.evaluate(() => ({set: document.querySelector('[data-waterline]').classList.contains('is-set')})),
  },
  {
    // 2. L'avant/après : la page descend sur le spa et l'eau monte d'elle-même à mi-hauteur ; la souris prend la ligne d'eau,
    // la monte (le spa refait), la descend (la céramique beige d'avant), puis la laisse aux deux tiers.
    // Gestes calés sur la musique : la vidéo lit ce plan à vitesse 1 à partir de 1 s (prise à 3,4 s, lâché à 7 s)
    name: 'd-refill',
    seconds: 9,
    async setup(site) {
      const f = await rect(site.page, '.refill__frame');
      const sec = await top(site.page, '#remodel');
      const y0 = 300;
      // la page s'arrête dans le bleu de la rénovation (sans le bas clair de l'accueil en haut)
      const y1 = Math.max(Math.round(sec + 6), Math.round(f.top + f.height / 2 - 450 + 6));
      await park(site, y0, 900);
      // ligne d'eau (px du viewport, page arrêtée en y1) pour une valeur du curseur
      const Y = (v) => f.top - y1 + (1 - v / 100) * f.height;
      const X = f.left + f.width * 0.5;
      return {
        y: track([[0, y0], [1.6, y1, cruise(0.15, 0.3)], [9, y1]]),
        pos: path([[0, 1330, 880], [2.5, 1330, 880], [3.3, X, Y(58), easeInOut], [3.4, X, Y(58)], [4.3, X, Y(95), easeInOut], [4.6, X, Y(95)], [5.8, X, Y(10), easeInOut], [6.0, X, Y(10)], [6.7, X, Y(66), easeInOut], [7.0, X, Y(66)], [8.2, X + 150, Y(66) + 120, easeInOut]]),
        down: Math.round(3.4 * FPS),
        up: Math.round(7.0 * FPS),
      };
    },
    async step(site, ctx, i, t) {
      const s = t / 1000;
      await scrollTo(site.page, Math.round(ctx.y(s)));
      if (s < 2.5) return null;
      const p = ctx.pos(s);
      await site.page.mouse.move(p.x, p.y);
      let clicked = false;
      if (i === ctx.down) { await site.page.mouse.down(); clicked = true; }
      if (i === ctx.up) await site.page.mouse.up();
      return {mouse: p, click: clicked};
    },
    watch: (page) => page.evaluate(() => ({v: Number(getComputedStyle(document.querySelector('[data-refill]')).getPropertyValue('--v')) || 0})),
  },
  {
    // 3. Les quatre changements : la photo de gauche suit le nom qu'on lit (carrelage, margelle, revêtement, terrasse)
    // Les photos changent quand le haut d'un élément passe à 52 % de la hauteur de l'écran : la margelle à 1,7 s,
    // le revêtement à 2,9 s, la terrasse à 4,1 s (la vidéo lit le plan à partir de 0,5 s : un changement tous les deux temps)
    name: 'd-changes',
    seconds: 6,
    async setup(site) {
      const head = await top(site.page, '.changes__head');
      const at = {};
      for (const k of ['coping', 'finish', 'deck']) at[k] = await top(site.page, `[data-change="${k}"]`);
      const deck = await rect(site.page, '[data-change="deck"]');
      const y0 = Math.round(head - 130);
      const cross = (y) => Math.round(y - 900 * 0.52 + 6);
      const y1 = Math.round(deck.top + deck.height / 2 - 450);
      await park(site, y0, 900);
      return {y: spline([[0, y0], [0.5, y0 + 18], [1.7, cross(at.coping)], [2.9, cross(at.finish)], [4.1, cross(at.deck)], [5.3, y1], [6, y1 + 4]])};
    },
    step: scrolled,
    watch: (page) => page.evaluate(() => {
      const on = document.querySelector('[data-change].is-on');
      return on ? {[on.dataset.change]: true} : {};
    }),
  },
  {
    // 4. Le local technique : on arrive sur la photo (les étiquettes s'éclairent une fois), puis la souris choisit les pompes,
    // l'automatisme et le chauffage ; à chaque fois, le reste passe dans l'ombre et le détail s'affiche à droite
    // Clics à 2,6 s, 5 s et 7,4 s : la vidéo lit le plan à partir de 0,8 s, les clics tombent sur des temps de la musique
    name: 'd-pad',
    seconds: 9,
    async setup(site) {
      const head = await top(site.page, '#repair');
      const photo = await rect(site.page, '.pad__photo');
      const y0 = Math.round(head - 280);
      // la page s'arrête sous le titre (rien de coupé en haut)
      const y1 = Math.round(photo.top - 175);
      await park(site, y0, 900);
      return {y: track([[0, y0], [1.6, y1, cruise(0.15, 0.3)], [9, y1]]), at: {}};
    },
    async step(site, ctx, i, t) {
      const s = t / 1000;
      await scrollTo(site.page, Math.round(ctx.y(s)));
      if (s >= 1.65 && !ctx.at.pumps) for (const k of ['pumps', 'automation', 'heater']) ctx.at[k] = await centerOf(site.page, `[data-part="${k}"]`);
      if (s < 1.7) return null;
      const {pumps: a, automation: b, heater: c} = ctx.at;
      const p = path([[1.7, 1250, 860], [2.45, a.x, a.y, easeInOut], [3.9, a.x + 4, a.y + 2], [4.85, b.x, b.y, easeInOut], [6.3, b.x - 3, b.y + 3], [7.25, c.x, c.y, easeInOut], [9, c.x + 40, c.y + 70, easeInOut]])(s);
      await site.page.mouse.move(p.x, p.y);
      const k = [156, 300, 444].indexOf(i);
      if (k >= 0) await click(site.page);
      return {mouse: p, click: k >= 0};
    },
  },
  {
    // 5. Le déroulé d'un chantier : la ligne se remplit à mesure qu'on lit les mots des clients
    name: 'd-process',
    seconds: 7.4,
    async setup(site) {
      const head = await top(site.page, '#process');
      const y0 = Math.round(head - 40);
      const y1 = Math.round(head + 1750);
      await park(site, y0, 900);
      return {y: track([[0, y0], [0.4, y0], [7.4, y1, cruise(0.1, 0.12)]])};
    },
    step: scrolled,
  },
  {
    // 6. Les avis : « He saved us $500. », puis la carte des villes avec leurs lacs : la souris choisit Dallas, puis Carrollton
    name: 'd-reviews',
    seconds: 9.6,
    async setup(site) {
      const story = await top(site.page, '.story');
      const towns = await top(site.page, '.towns');
      const y0 = Math.round(story - 90);
      const y1 = Math.round(towns - 40);
      await park(site, y0, 900);
      return {y: track([[0, y0], [1.75, y0], [3.6, y1, cruise(0.2, 0.3)], [9.6, y1]]), at: {}};
    },
    // clics aux images 255 et 413 : la vidéo lit le plan à 1,25 à partir de 0,5 s, les clics tombent sur les temps 5 et 8,5
    async step(site, ctx, i, t) {
      const s = t / 1000;
      await scrollTo(site.page, Math.round(ctx.y(s)));
      if (s >= 3.62 && !ctx.at.a) {
        ctx.at.a = await centerOf(site.page, '.town__btn[data-town="Dallas"]');
        ctx.at.b = await centerOf(site.page, '.town__btn[data-town="Carrollton"]');
      }
      if (s < 3.65) return null;
      const {a, b} = ctx.at;
      const p = path([[3.65, 1260, 880], [4.15, a.x, a.y, easeInOut], [5.6, a.x + 3, a.y + 2], [6.75, b.x, b.y, easeInOut], [8.3, b.x + 2, b.y + 3], [9.6, b.x + 90, b.y + 110, easeInOut]])(s);
      await site.page.mouse.move(p.x, p.y);
      const k = [255, 413].indexOf(i);
      if (k >= 0) await click(site.page);
      return {mouse: p, click: k >= 0};
    },
  },
  {
    // 7. L'entreprise, la salle d'exposition (« Open now »), le devis ; puis le pied de page : « PETRI » se pose en mosaïque
    name: 'd-close',
    seconds: 10,
    async setup(site) {
      const about = await top(site.page, '#about');
      const show = await rect(site.page, '.showroom');
      const est = await top(site.page, '#estimate');
      const end = await site.page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
      const y0 = Math.round(about - 60);
      const y1 = Math.round(show.top + show.height - 820);
      const y2 = Math.round(est - 40);
      await park(site, y0, 900);
      return {y: track([[0, y0], [0.7, y0], [2.1, y1, cruise(0.2, 0.3)], [2.9, y1], [4.2, y2, cruise(0.2, 0.3)], [5.4, y2], [7.0, end, cruise(0.15, 0.3)], [10, end]])};
    },
    step: scrolled,
    // la pose de « PETRI » commence quand un carreau du P s'éclaire (relevé une fois la mosaïque construite)
    watch: (page) => page.evaluate(() => {
      const c = document.querySelector('[data-inlay]');
      if (!c.width) return {};
      const d = c.getContext('2d').getImageData(0, 0, Math.round(c.width * 0.4), c.height).data;
      let lit = 0;
      for (let k = 0; k < d.length; k += 4) if (d[k] + d[k + 1] + d[k + 2] > 420) lit++;
      return {inlay: lit > 50, laid: lit};
    }),
  },
];

const mobile = [
  {
    // le chargement sur téléphone : le titre, la frise recarrelée ; puis le pouce descend jusqu'à l'avant/après, qui se remplit
    name: 'm-open',
    seconds: 9,
    fresh: true,
    async setup(site) {
      await prime(site.page);
      const f = await rect(site.page, '.refill__frame');
      const y1 = Math.round(f.top + f.height / 2 - 400);
      return {y: track([[0, 0], [3.4, 0], [6.0, y1, cruise(0.12, 0.25)], [9, y1]])};
    },
    step: scrolled,
  },
  {
    // la carte sur téléphone : une rangée de boutons par ville sous la carte ; le pouce choisit Dallas, puis Plano
    name: 'm-towns',
    seconds: 6.4,
    async setup(site) {
      const map = await top(site.page, '[data-map]');
      const y = Math.round(map - 60);
      await park(site, y, 900);
      return {y, taps: [Math.round(1.6 * FPS), Math.round(4.0 * FPS)], names: ['Dallas', 'Plano']};
    },
    async step(site, ctx, i) {
      await scrollTo(site.page, ctx.y);
      const k = ctx.taps.indexOf(i);
      if (k < 0) return null;
      const p = await centerOf(site.page, `.towns__chips button[data-town="${ctx.names[k]}"]`);
      await site.page.touchscreen.tap(p.x, p.y);
      return {mouse: p, click: true};
    },
  },
  {
    // le menu : il s'ouvre en plein écran sur le bleu profond
    name: 'm-menu',
    seconds: 5,
    async setup(site) {
      await scrollTo(site.page, 0);
      await settle(site.page, 600);
      return {tap: Math.round(1.5 * FPS)};
    },
    async step(site, ctx, i) {
      await scrollTo(site.page, 0);
      if (i !== ctx.tap) return null;
      const p = await centerOf(site.page, '[data-menu-open]');
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
    if (!shot.fresh) {
      await prime(site.page);
      await settle(site.page, 3200);
    }
    const ctx = await shot.setup(site);
    await record(site, {name: shot.name, fps: FPS, seconds: shot.seconds, step: (i, t) => shot.step(site, ctx, i, t), watch: shot.watch, probe});
    await site.browser.close();
  }
}
