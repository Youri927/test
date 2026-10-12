// Plans filmés du nouveau site de Mad River Pool Construction pour la vidéo de présentation 16:9 (image par image,
// temps simulé). Usage : node capture/shots.mjs [desktop|mobile|nom-du-plan …] [--probe]
//
// Contre les saccades : Chrome arrondit le défilement au pixel entier. Chaque plan défile donc par pas entiers qui ne
// changent que progressivement (1, 1, 2, 2, 3… puis constants), et la vidéo lit toujours les plans à vitesse 1 :
// aucune image sautée ni doublée.
// Les clics et les touchers tombent sur des temps de la musique (100 BPM : un temps = 0,6 s), voir EVENTS dans src/beats.ts.
import {openSite, record, scrollTo, settle, top, sine, easeInOut} from './lib.mjs';

const FPS = 60;
const DESK = {width: 1440, height: 900, dsf: 2};
const MOBILE = {width: 390, height: 844, dsf: 2, mobile: true};
const F = (s) => Math.round(s * FPS);

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

/**
 * Défilement par pas entiers : position de la page à chaque image du plan.
 * Le défilement part à l'image `from`, accélère sur `ramp` images (1, 1, 2, 2, 3… px), roule à `v` px par image,
 * et freine de même sur ses `ramp` dernières images s'il a une fin (`to`, image d'arrêt).
 */
const glide = ({y0, from, v, ramp = 40, to = Infinity, frames}) => {
  const ys = new Array(frames).fill(y0);
  let y = y0;
  for (let i = 1; i < frames; i++) {
    let step = 0;
    if (i > from && i <= to) {
      const a = i - from;
      const b = to === Infinity ? Infinity : to - i + 1;
      const k = Math.min(1, a / ramp, b / ramp);
      step = Math.max(1, Math.round(v * sine(k)));
    }
    y += step;
    ys[i] = y;
  }
  return ys;
};

/** Même défilement, avec l'image d'arrêt choisie pour arriver au plus près de y1 */
const glideTo = ({y0, y1, from, v, ramp = 40, frames}) => {
  let best = null;
  for (let to = from + 2 * ramp; to < frames; to++) {
    const ys = glide({y0, from, v, ramp, to, frames});
    if (!best || Math.abs(ys[frames - 1] - y1) < Math.abs(best[frames - 1] - y1)) best = ys;
    if (ys[frames - 1] >= y1) break;
  }
  return best;
};

/** Trajet de souris par clés [[t, x, y, easing], …] (secondes, px du viewport) */
const path = (keys) => (s) => {
  if (s <= keys[0][0]) return {x: keys[0][1], y: keys[0][2]};
  for (let k = 1; k < keys.length; k++) {
    const [ta, xa, ya] = keys[k - 1];
    const [tb, xb, yb, e = easeInOut] = keys[k];
    if (s <= tb) {
      const u = e((s - ta) / (tb - ta));
      return {x: xa + (xb - xa) * u, y: ya + (yb - ya) * u};
    }
  }
  const last = keys[keys.length - 1];
  return {x: last[1], y: last[2]};
};

/** Un clic : la souris appuie et relâche à l'image i ; le contour de focus de la souris n'apparaît pas */
const click = async (page) => {
  await page.mouse.down();
  await page.mouse.up();
  await page.evaluate(() => document.activeElement && document.activeElement !== document.body && document.activeElement.blur());
};

/** Plan avec une souris : défilement fixe ou glissé, trajet, clics aux images données */
const mouseStep = async (site, ctx, i, t) => {
  await scrollTo(site.page, ctx.ys ? ctx.ys[i] : ctx.y);
  const p = ctx.pos(t / 1000);
  await site.page.mouse.move(p.x, p.y);
  const on = ctx.clicks.includes(i);
  if (on) await click(site.page);
  return {mouse: p, click: on};
};

const desktop = [
  {
    // 1. L'ouverture du site, depuis la première image : le slogan s'élargit, le trait dessine le bassin puis le spa,
    // l'eau monte (la photo se dévoile du fond), le spa arrive, le texte et les faits apparaissent
    name: 'd-open',
    seconds: 7.0,
    fresh: true,
    async setup(site) {
      await prime(site.page);
      return {};
    },
    async step(site) {
      await scrollTo(site.page, 0);
    },
    watch: (page) => page.evaluate(() => ({ready: document.documentElement.classList.contains('is-ready'), filled: document.querySelector('[data-plan]').classList.contains('is-filled')})),
  },
  {
    // 2. Trois façons de construire : les trois bassins et leurs faits défilent, jusqu'au graphique « From dig to deck »,
    // dont les barres se tracent en arrivant
    name: 'd-pools',
    seconds: 6.4,
    async setup(site) {
      const y0 = Math.round((await top(site.page, '#pools .head')) - 50);
      const dig = await rect(site.page, '[data-dig]');
      const y1 = Math.round(dig.top - (900 - dig.height) / 2 + 40);
      await park(site, y0, 700);
      return {ys: glideTo({y0, y1, from: F(0.5), v: 4, ramp: 40, frames: F(6.4)})};
    },
    async step(site, ctx, i) {
      await scrollTo(site.page, ctx.ys[i]);
    },
    watch: (page) => page.evaluate(() => ({dig: document.querySelector('[data-dig]').classList.contains('is-on')})),
  },
  {
    // 3. Les formes à l'échelle : la souris choisit le rectangle de 18 × 75 (1,2 s), le « modified Grecian » (3 s),
    // puis l'extrémité arrondie de 18 × 40 (4,8 s) ; le contour se remplit et la photo du bassin réel change
    name: 'd-shapes',
    seconds: 6.4,
    async setup(site) {
      const y = Math.round((await top(site.page, '#shapes .head')) - 56);
      await park(site, y, 1600);
      const c = async (n) => centerOf(site.page, `.shapes__list li:nth-child(${n}) .shape svg`);
      const a = await c(1);
      const b = await c(4);
      const d = await c(2);
      return {
        y,
        pos: path([[0, 1250, 860], [0.3, 1250, 860], [1.05, a.x + 30, a.y + 6], [1.35, a.x + 32, a.y + 8], [2.85, b.x + 10, b.y + 4], [3.15, b.x + 12, b.y + 6], [4.65, d.x + 8, d.y + 6], [4.95, d.x + 10, d.y + 8], [5.9, d.x + 160, d.y + 230]]),
        clicks: [F(1.2), F(3.0), F(4.8)],
      };
    },
    step: mouseStep,
  },
  {
    // 4. « One call covers the whole project » : la phrase arrive à l'écran et ses neuf éléments se surlignent un à un
    name: 'd-onecall',
    seconds: 5.2,
    async setup(site) {
      const box = await rect(site.page, '.onecall');
      const y1 = Math.round(box.top - (900 - box.height) / 2);
      const y0 = Math.round(box.top - 790);
      await park(site, y0, 700);
      return {ys: glideTo({y0, y1, from: F(0.2), v: 3, ramp: 40, frames: F(5.2)})};
    },
    async step(site, ctx, i) {
      await scrollTo(site.page, ctx.ys[i]);
    },
    watch: (page) => page.evaluate(() => ({on: document.querySelector('.onecall').classList.contains('is-on')})),
  },
  {
    // 5. La rénovation : la souris choisit « The concrete is cracking » (1,8 s) : l'après se dévoile à côté de l'avant ;
    // puis le projet 2 (3,6 s)
    name: 'd-reno',
    seconds: 6.4,
    async setup(site) {
      const y = Math.round((await top(site.page, '#renovation .head')) - 56);
      await park(site, y, 1800);
      const tab = await centerOf(site.page, '#tab-concrete');
      // les boutons des projets sont à la même place dans chaque onglet
      const pick = await centerOf(site.page, '#panel-liner .ba__pick button:nth-child(2)');
      return {
        y,
        pos: path([[0, 1280, 860], [0.5, 1280, 860], [1.65, tab.x + 20, tab.y + 4], [1.95, tab.x + 22, tab.y + 6], [3.45, pick.x + 2, pick.y + 2], [3.75, pick.x + 4, pick.y + 4], [4.9, pick.x + 260, pick.y + 180]]),
        clicks: [F(1.8), F(3.6)],
      };
    },
    step: mouseStep,
  },
  {
    // 6. La visite gratuite, à la nuit : « Open now » ; la souris choisit « New pool » (1,8 s), puis le prénom (3 s)
    name: 'd-visit',
    seconds: 5.2,
    async setup(site) {
      const y = Math.round((await top(site.page, '#visit')) + 80);
      await park(site, y, 900);
      const chip = await centerOf(site.page, '.form__chips input[value="New pool"] + span');
      const name = await centerOf(site.page, '#f-first');
      return {
        y,
        pos: path([[0, 1250, 860], [0.4, 1250, 860], [1.65, chip.x + 6, chip.y + 3], [1.95, chip.x + 8, chip.y + 4], [2.85, name.x - 40, name.y + 4], [3.15, name.x - 38, name.y + 5], [4.3, name.x + 140, name.y + 150]]),
        clicks: [F(1.8), F(3.0)],
      };
    },
    step: mouseStep,
  },
];

const mobile = [
  {
    // l'ouverture au téléphone : le slogan sur quatre lignes, le plan qui se trace et se remplit ; puis le pouce descend
    // jusqu'au bouton de la visite gratuite
    name: 'm-open',
    seconds: 6.4,
    fresh: true,
    async setup(site) {
      await prime(site.page);
      return {ys: glide({y0: 0, from: F(3.6), v: 3, ramp: 30, to: F(5.6), frames: F(6.4)})};
    },
    async step(site, ctx, i) {
      await scrollTo(site.page, ctx.ys[i]);
    },
  },
  {
    // les formes au téléphone : la photo choisie reste en haut ; le pouce choisit trois formes (1,2 s, 3 s, 4,8 s)
    name: 'm-shapes',
    seconds: 6.4,
    async setup(site) {
      const y = Math.round((await top(site.page, '.shapes__list li:nth-child(5)')) - 330);
      await park(site, y, 1600);
      const c = (n) => centerOf(site.page, `.shapes__list li:nth-child(${n}) .shape svg`);
      return {y, taps: [[F(1.2), await c(7)], [F(3.0), await c(8)], [F(4.8), await c(5)]]};
    },
    async step(site, ctx, i) {
      await scrollTo(site.page, ctx.y);
      const tap = ctx.taps.find(([at]) => at === i);
      if (!tap) return null;
      await site.page.touchscreen.tap(tap[1].x, tap[1].y);
      return {mouse: tap[1], click: true};
    },
  },
  {
    // la rénovation au téléphone : le pouce choisit « The concrete is cracking » (1,8 s) ; la page descend sur l'avant,
    // puis l'après en pleine largeur, qui se dévoile
    name: 'm-reno',
    seconds: 6.4,
    async setup(site) {
      const y0 = Math.round((await top(site.page, '#renovation .reno__tabs')) - 96);
      await park(site, y0, 1600);
      const tab = await centerOf(site.page, '#tab-concrete');
      return {ys: glide({y0, from: F(2.3), v: 4, ramp: 36, to: F(4.9), frames: F(6.4)}), tab, tap: F(1.8)};
    },
    async step(site, ctx, i) {
      await scrollTo(site.page, ctx.ys[i]);
      if (i !== ctx.tap) return null;
      await site.page.touchscreen.tap(ctx.tab.x, ctx.tab.y);
      return {mouse: ctx.tab, click: true};
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
      await settle(site.page, 1200);
    }
    const ctx = await shot.setup(site);
    await record(site, {name: shot.name, fps: FPS, seconds: shot.seconds, step: (i, t) => shot.step(site, ctx, i, t), watch: shot.watch, probe});
    await site.browser.close();
  }
}
