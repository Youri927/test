// Plans filmés du nouveau site de Prestige Pools of Wilmington pour la vidéo de présentation 16:9 (image par image,
// temps simulé). Usage : node capture/shots.mjs [desktop|mobile|nom-du-plan …] [--probe]
//
// Contre les saccades : Chrome arrondit le défilement au pixel entier. Chaque plan défile donc par pas entiers qui ne
// changent que progressivement (1, 1, 2, 2, 3… puis constants), et la vidéo lit toujours les plans à vitesse 1 :
// aucune image sautée ni doublée.
// Les clics et les touchers tombent sur des temps de la musique (100 BPM : un temps = 0,6 s), voir EVENTS dans src/beats.ts.
import {openSite, record, scrollTo, settle, top, sine, easeInOut} from './lib.mjs';
import {OPEN_CLICK, EVENTS, BEAT} from '../src/beats.ts';

const FPS = 60;
const DESK = {width: 1440, height: 900, dsf: 2};
const MOBILE = {width: 390, height: 844, dsf: 2, mobile: true};
const F = (s) => Math.round(s * FPS);
/** image d'un plan qui démarre avec sa scène, pour un temps de la musique */
const B = (beats) => Math.round(beats * BEAT);

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

/** Plan avec une souris : défilement fixe ou glissé, trajet (à partir de `enter` secondes), clics aux images données */
const mouseStep = async (site, ctx, i, t) => {
  await scrollTo(site.page, ctx.ys ? ctx.ys[i] : ctx.y);
  if (t / 1000 < (ctx.enter ?? 0)) return null;
  const p = ctx.pos(t / 1000);
  await site.page.mouse.move(p.x, p.y);
  const on = ctx.clicks.includes(i);
  if (on) await click(site.page);
  return {mouse: p, click: on};
};

/** Plan au doigt : défilement, et touchers [[image, point], …] */
const touchStep = async (site, ctx, i) => {
  await scrollTo(site.page, ctx.ys ? ctx.ys[i] : ctx.y);
  const tap = ctx.taps.find(([at]) => at === i);
  if (!tap) return null;
  await site.page.touchscreen.tap(tap[1].x, tap[1].y);
  await site.page.evaluate(() => document.activeElement && document.activeElement !== document.body && document.activeElement.blur());
  return {mouse: tap[1], click: true};
};

const isNight = (page) => page.evaluate(() => document.documentElement.classList.contains('night'));

const desktop = [
  {
    // 1. L'ouverture, depuis la première image, de jour : le titre monte, l'interrupteur de la photo s'éclaire une fois ;
    // la souris arrive et allume la piscine (sur un temps) : le ciel passe par le crépuscule, la photo s'allume
    name: 'd-open',
    seconds: 10.8,
    fresh: true,
    async setup(site) {
      await prime(site.page);
      const sw = await centerOf(site.page, '.lights--big .lights__knob');
      return {
        y: 0,
        enter: 1.9,
        pos: path([[1.9, 1330, 880], [3.25, sw.x + 10, sw.y + 4], [3.5, sw.x + 12, sw.y + 6], [4.6, sw.x + 150, sw.y - 70], [5.4, sw.x + 170, sw.y - 80]]),
        clicks: [OPEN_CLICK],
      };
    },
    step: mouseStep,
    watch: async (page) => ({ready: await page.evaluate(() => document.documentElement.classList.contains('is-ready')), night: await isNight(page)}),
  },
  {
    // 2. La pose, de nuit : la page descend de la fin du comparatif jusqu'aux huit étapes, qui s'allument une à une
    name: 'd-build',
    seconds: 6.0,
    query: '?lights=on',
    async setup(site) {
      const b = await top(site.page, '#build');
      const y0 = Math.round(b - 520);
      await park(site, y0, 900);
      return {ys: glideTo({y0, y1: Math.round(b + 110), from: F(0.3), v: 3, ramp: 40, frames: F(6.0)})};
    },
    async step(site, ctx, i) {
      await scrollTo(site.page, ctx.ys[i]);
    },
    // le nombre d'étapes allumées : un repère par étape (la musique y pose une note)
    watch: (page) =>
      page.evaluate(() => {
        const n = document.querySelectorAll('.steps li.is-lit').length;
        return Object.fromEntries([1, 2, 3, 4, 5, 6, 7, 8].map((k) => [`lit${k}`, n >= k]));
      }),
  },
  {
    // 3. La galerie, de jour : la souris choisit « By the water » (sur un temps), les photos se replacent ;
    // puis elle ouvre une photo en grand
    name: 'd-work',
    seconds: 6.0,
    query: '?lights=off',
    async setup(site) {
      const page = site.page;
      const y = Math.round((await top(page, '#work')) + 70);
      await park(site, y, 900);
      const filter = await centerOf(page, '[data-filter="water"]');
      // la photo à ouvrir : la 2e du filtre, relevée après un essai, puis retour à « All »
      await page.click('[data-filter="water"]');
      await settle(page, 1400);
      const photo = await centerOf(page, '[data-grid] li:not([hidden]):nth-child(n) .tile');
      const second = await page.evaluate(() => {
        const ls = [...document.querySelectorAll('[data-grid] li')].filter((l) => !l.hidden);
        const r = ls[1].querySelector('.tile').getBoundingClientRect();
        return {x: r.left + r.width / 2, y: r.top + r.height / 2};
      });
      await page.click('[data-filter="all"]');
      await page.evaluate(() => document.activeElement && document.activeElement.blur());
      await settle(page, 1600);
      void photo;
      return {
        y,
        pos: path([[0, 1300, 860], [0.3, 1300, 860], [1.05, filter.x + 8, filter.y + 3], [1.3, filter.x + 10, filter.y + 4], [3.35, second.x + 40, second.y + 20], [3.6, second.x + 42, second.y + 22], [4.6, second.x + 200, second.y + 160]]),
        clicks: [B(EVENTS.work.filter), B(EVENTS.work.photo)],
      };
    },
    step: mouseStep,
    watch: (page) => page.evaluate(() => ({box: document.querySelector('[data-box]').open})),
  },
  {
    // 4. La nuit : la même piscine en blanc, puis en bleu et en rouge (sur des temps), la photo change sur place
    name: 'd-dark',
    seconds: 6.0,
    query: '?lights=off',
    async setup(site) {
      const page = site.page;
      const y = Math.round((await top(page, '.dark__in')) - 96);
      await park(site, y, 1600);
      const blue = await centerOf(page, '.hues label:nth-of-type(2) span');
      const red = await centerOf(page, '.hues label:nth-of-type(3) span');
      return {
        y,
        pos: path([[0, 1250, 860], [0.4, 1250, 860], [1.55, blue.x + 6, blue.y + 3], [1.8, blue.x + 8, blue.y + 4], [3.35, red.x + 6, red.y + 3], [3.6, red.x + 8, red.y + 4], [4.7, red.x + 180, red.y + 150]]),
        clicks: EVENTS.dark.map(B),
      };
    },
    step: mouseStep,
  },
  {
    // 5. Les avis, de jour : la grande citation et les premiers avis défilent doucement
    name: 'd-reviews',
    seconds: 4.8,
    query: '?lights=off',
    async setup(site) {
      const y0 = Math.round((await top(site.page, '#reviews')) + 40);
      await park(site, y0, 900);
      return {ys: glide({y0, from: F(0.2), v: 2, ramp: 40, frames: F(4.8)})};
    },
    async step(site, ctx, i) {
      await scrollTo(site.page, ctx.ys[i]);
    },
  },
  {
    // 6. Le formulaire, de nuit : « A spa or hot tub », puis « Service for my Prestige pool » (la note annonce l'adresse
    // du service) ; à côté, leurs piscines d'exposition allumées et « Open now »
    name: 'd-plan',
    seconds: 4.8,
    query: '?lights=on',
    async setup(site) {
      const page = site.page;
      const y = Math.round((await top(page, '#plan')) + 70);
      await park(site, y, 1200);
      const spa = await centerOf(page, '.chips label:nth-of-type(2) span');
      const service = await centerOf(page, '.chips label:nth-of-type(4) span');
      return {
        y,
        pos: path([[0, 1250, 860], [0.4, 1250, 860], [1.55, spa.x + 6, spa.y + 3], [1.8, spa.x + 8, spa.y + 4], [2.75, service.x - 20, service.y + 3], [3.0, service.x - 18, service.y + 4], [4.1, service.x + 150, service.y + 170]]),
        clicks: EVENTS.plan.map(B),
      };
    },
    step: mouseStep,
  },
];

const mobile = [
  {
    // l'allumage au téléphone : le titre monte, le pouce descend jusqu'à la photo et touche l'interrupteur (sur un temps,
    // une fois le téléphone monté à sa place) : la nuit tombe sur la page
    name: 'm-open',
    seconds: 6.0,
    fresh: true,
    async setup(site) {
      const page = site.page;
      await prime(page);
      const fig = await rect(page, '.hero__fig');
      const y1 = Math.round(fig.top - 64);
      const ys = glideTo({y0: 0, y1, from: F(1.0), v: 6, ramp: 30, frames: F(6.0)});
      // position de l'interrupteur une fois la page arrivée (mesurée en y allant, puis retour en haut)
      await scrollTo(page, ys[ys.length - 1]);
      await settle(page, 100);
      const sw = await centerOf(page, '.lights--big .lights__knob');
      await scrollTo(page, 0);
      await settle(page, 100);
      return {ys, taps: [[F(3.2), sw]]};
    },
    step: touchStep,
    watch: async (page) => ({night: await isNight(page)}),
  },
  {
    // la galerie au téléphone, de jour : les photos défilent sous le doigt
    name: 'm-work',
    seconds: 6.0,
    query: '?lights=off',
    async setup(site) {
      const y0 = Math.round((await top(site.page, '#work .filters')) - 150);
      await park(site, y0, 900);
      return {ys: glide({y0, from: F(0.5), v: 3, ramp: 36, frames: F(6.0)}), taps: []};
    },
    step: touchStep,
  },
  {
    // les projecteurs au téléphone : le doigt choisit le bleu, puis le rouge (sur des temps)
    name: 'm-hues',
    seconds: 6.0,
    query: '?lights=off',
    async setup(site) {
      const page = site.page;
      const y = Math.round((await top(page, '.hues')) - 330);
      await park(site, y, 1600);
      const blue = await centerOf(page, '.hues label:nth-of-type(2) span');
      const red = await centerOf(page, '.hues label:nth-of-type(3) span');
      return {y, taps: [[B(EVENTS.mobile.hues[0]), blue], [B(EVENTS.mobile.hues[1]), red]]};
    },
    step: touchStep,
  },
];

// --probe : rejoue les plans sans filmer, pour relever les repères (voir record() dans lib.mjs)
const probe = process.argv.includes('--probe');
const args = process.argv.slice(2).filter((a) => a !== '--probe');
const pick = (list, group) => list.filter((s) => !args.length || args.includes(s.name) || args.includes(group));

for (const [list, cfg, group] of [[desktop, DESK, 'desktop'], [mobile, MOBILE, 'mobile']]) {
  for (const shot of pick(list, group)) {
    const site = await openSite({...cfg, query: shot.query || ''});
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
