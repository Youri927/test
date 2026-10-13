// Plans filmés du nouveau site de Hideout Boutique pour la vidéo de présentation 16:9 (image par image, temps simulé).
// Usage : node capture/shots.mjs [desktop|mobile|nom-du-plan …] [--probe]
//
// Contre les saccades : Chrome arrondit le défilement au pixel entier. Chaque plan défile donc par pas entiers qui ne
// changent que progressivement (1, 1, 2, 2, 3… puis constants), et la vidéo lit toujours les plans à vitesse 1 :
// aucune image sautée ni doublée.
// Les clics et les touchers tombent sur des temps de la musique (100 BPM : un temps = 0,6 s), voir EVENTS dans src/beats.ts.
import {openSite, record, scrollTo, settle, tick, top, until, sine, easeInOut} from './lib.mjs';
import {EVENTS, BEAT} from '../src/beats.ts';

const FPS = 60;
const DESK = {width: 1440, height: 900, dsf: 2};
// La hauteur du téléphone sans sa barre d'état (844 − 47 px) : la page entière, barre du bas comprise, reste à l'écran
const MOBILE = {width: 390, height: 797, dsf: 2, mobile: true};
const F = (s) => Math.round(s * FPS);
/** image d'un plan qui démarre avec sa scène, pour un temps de la musique */
const B = (beats) => Math.round(beats * BEAT);

/** Toutes les photos chargées et décodées tout de suite (le site les charge à l'approche) : aucune image vide à l'écran */
const prime = (page) =>
  page.evaluate(async () => {
    for (const img of document.images) img.loading = 'eager';
    await Promise.all([...document.images].map((i) => i.decode().catch(() => null)));
  });

/** Centre (px du viewport) du premier élément visible qui correspond ; `dx` : décalage depuis son bord gauche */
const centerOf = (page, sel, dx = null) =>
  page.evaluate(([sel, dx]) => {
    const all = [...document.querySelectorAll(sel)];
    const el = all.find((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; });
    if (!el) throw new Error('cible introuvable : ' + sel);
    const r = el.getBoundingClientRect();
    return {x: dx === null ? r.left + r.width / 2 : r.left + dx, y: r.top + r.height / 2};
  }, [sel, dx]);

/** Rectangle (px du viewport) d'un élément */
const boxOf = (page, sel) =>
  page.evaluate((sel) => {
    const r = document.querySelector(sel).getBoundingClientRect();
    return {left: r.left, top: r.top, width: r.width, height: r.height};
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
 * Défilement par pas entiers : position à chaque image du plan.
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

const blur = (page) => page.evaluate(() => document.activeElement && document.activeElement !== document.body && document.activeElement.blur());

/** Un clic : la souris appuie et relâche à l'image i ; le contour de focus de la souris n'apparaît pas */
const click = async (page) => {
  await page.mouse.down();
  await page.mouse.up();
  await blur(page);
};

/**
 * Plan avec une souris : défilement fixe ou glissé, trajet (à partir de `enter` secondes), clics aux images données,
 * et un glisser éventuel (bouton appuyé de `press` à `release`).
 */
const mouseStep = async (site, ctx, i, t) => {
  await scrollTo(site.page, ctx.ys ? ctx.ys[i] : ctx.y);
  if (t / 1000 < (ctx.enter ?? 0)) return null;
  const p = ctx.pos(t / 1000);
  await site.page.mouse.move(p.x, p.y);
  if (ctx.press === i) {
    await site.page.mouse.down();
    return {mouse: p, mark: 'hold'};
  }
  if (ctx.release === i) {
    await site.page.mouse.up();
    await blur(site.page);
    return {mouse: p, mark: 'release'};
  }
  const on = (ctx.clicks || []).includes(i);
  if (on) await click(site.page);
  return {mouse: p, click: on};
};

/** Plan au doigt : défilement de la page, et touchers [[image, point], …] */
const touchStep = async (site, ctx, i) => {
  await scrollTo(site.page, ctx.ys ? ctx.ys[i] : ctx.y);
  const tap = (ctx.taps || []).find(([at]) => at === i);
  if (!tap) return null;
  await site.page.touchscreen.tap(tap[1].x, tap[1].y);
  await blur(site.page);
  return {mouse: tap[1], click: true};
};

/**
 * L'ouverture du site démarre à la première image de la page (requestAnimationFrame) : l'horloge, figée, avance d'une
 * image à la fois jusqu'à ce que ses animations existent. Elles partent alors de 0 avec le plan.
 */
const introStarted = async (page) => {
  for (let k = 0; k < 30; k++) {
    // l'animation du logo (les animations de secours du CSS existent déjà, elles ne comptent pas)
    if (await page.evaluate(() => document.getAnimations().some((a) => a.effect?.target?.matches?.('[data-intro-logo]')))) return;
    await tick(page, 16);
  }
  throw new Error("l'ouverture n'a pas démarré");
};
/**
 * État de l'ouverture, image par image : son horloge (le temps de l'animation du logo, en ms) et l'opacité du logo.
 * Le montage et la musique en déduisent les repères : le nom s'efface de 600 à 820 ms, la photo est ouverte dans le cadre
 * à 1 000 ms, le cadre est posé à 2 000 ms (src/main.js du site).
 */
const introState = (page) =>
  page.evaluate(() => {
    const logo = document.querySelector('[data-intro-logo]');
    const a = logo && document.getAnimations().find((x) => x.effect?.target === logo);
    return {introT: a ? Number(a.currentTime) : -1, logo: logo ? Number(getComputedStyle(logo).opacity) : 0};
  });

const desktop = [
  {
    // 1. L'ouverture, depuis sa première image : le logo se pose au centre, son nom s'efface, la photo s'ouvre dans le
    // cadre, le cadre s'agrandit jusqu'à l'accueil pendant que le titre se découvre ; puis l'accueil, immobile
    name: 'd-open',
    seconds: 9.4,
    fresh: true,
    async setup(site) {
      await prime(site.page);
      await introStarted(site.page);
      return {y: 0};
    },
    async step(site, ctx) {
      await scrollTo(site.page, ctx.y);
    },
    watch: introState,
  },
  {
    // 2. Les soins : la page descend sur les familles ; la souris passe sur « Injectables », puis « Lashes » (leur nom
    // s'élargit, leur photo passe dans le cadre), puis ouvre « Skin and lasers » (ses soins et leurs faits)
    name: 'd-svc',
    seconds: 7.3,
    async setup(site) {
      const page = site.page;
      const y0 = 1000;
      const y1 = 1150;
      await park(site, y0, 900);
      // positions mesurées la page arrivée, puis retour
      await scrollTo(page, y1);
      await settle(page, 100);
      const inj = await centerOf(page, '[data-fam="injectables"] .fam__name', 120);
      const lash = await centerOf(page, '[data-fam="lashes"] .fam__name', 80);
      const skin = await centerOf(page, '[data-fam="skin"] .fam__name', 150);
      const list = await boxOf(page, '.svc__list');
      await scrollTo(page, y0);
      await settle(page, 400);
      const out = list.left + list.width + 70;
      return {
        ys: glideTo({y0, y1, from: 8, v: 3, ramp: 20, frames: F(7.3)}),
        enter: 0.5,
        pos: path([
          [0.5, 1150, inj.y - 12],
          // de la droite, à hauteur d'« Injectables » : aucune autre famille n'est survolée en chemin
          [1.25, inj.x, inj.y + 2], [1.6, inj.x + 4, inj.y + 4],
          [2.5, inj.x + 4, inj.y + 4], [3.0, lash.x, lash.y + 2], [3.3, lash.x + 4, lash.y + 4],
          // ressort par la droite, remonte au-dessus de la photo, revient sur « Skin and lasers »
          [4.2, lash.x + 4, lash.y + 4], [4.6, out, lash.y - 40], [5.0, out, skin.y - 6], [5.35, skin.x, skin.y + 2], [5.7, skin.x + 4, skin.y + 4],
        ]),
        clicks: [B(9)],
      };
    },
    step: mouseStep,
    // la photo dans le cadre : un repère quand chaque famille y passe ; l'ouverture de « Skin and lasers »
    watch: (page) =>
      page.evaluate(() => {
        const on = document.querySelector('[data-view] img.is-on')?.dataset.for;
        return {injectables: on === 'injectables', lashes: on === 'lashes', skin: on === 'skin', open: document.querySelector('[data-fam="skin"] .fam__btn').getAttribute('aria-expanded') === 'true'};
      }),
  },
  {
    // 3. Les résultats : la souris choisit « Permanent makeup » (sur un temps) ; les neuf avant/après montent ; la page
    // descend doucement sur la grille
    name: 'd-res',
    seconds: 6.1,
    async setup(site) {
      const page = site.page;
      const y0 = Math.round((await top(page, '#res-title')) - 116);
      await park(site, y0, 900);
      const chip = await centerOf(page, '.res__filters [data-k="pmu"]');
      return {
        ys: glide({y0, from: B(5), v: 3, ramp: 40, frames: F(6.1)}),
        enter: 0.4,
        pos: path([
          [0.4, 1060, 720], [1.05, chip.x + 6, chip.y + 3], [1.25, chip.x + 8, chip.y + 4],
          // puis la souris sort de la grille par la droite (aucune photo survolée pendant que la page descend)
          [2.1, chip.x + 8, chip.y + 4], [2.9, 1424, 380],
        ]),
        clicks: [B(EVENTS.res.pmu)],
      };
    },
    step: mouseStep,
    watch: (page) => page.evaluate(() => ({pmu: document.querySelector('.res__filters [data-k="pmu"]').getAttribute('aria-pressed') === 'true'})),
  },
  {
    // 4. L'équipe : la page descend lentement sur la section sombre ; le cadre se trace autour de la photo de groupe
    // quand elle arrive, puis viennent les trois responsables
    name: 'd-team',
    seconds: 6.1,
    async setup(site) {
      const page = site.page;
      // la photo de groupe aux trois quarts sous l'écran : son cadre se tracera pendant le plan, une fois la légende posée
      const y0 = Math.round((await top(page, '.team__group')) - 900 + 170);
      await park(site, y0, 900);
      if (await page.evaluate(() => document.querySelector('.team__group').classList.contains('is-drawn'))) throw new Error('le cadre est déjà tracé');
      // 4 px par image : la photo passe, et le plan finit sur les responsables, leur nom et leurs titres
      return {ys: glide({y0, from: 4, v: 4, ramp: 40, frames: F(6.1)})};
    },
    async step(site, ctx, i) {
      await scrollTo(site.page, ctx.ys[i]);
    },
    watch: (page) => page.evaluate(() => ({drawn: document.querySelector('.team__group').classList.contains('is-drawn')})),
  },
  {
    // 5. Le Beauty Bank : la souris prend le curseur (6 mois), le tire jusqu'à 12 mois : les mois se remplissent un à un,
    // le crédit monte de $594 à $1,188 ; elle le lâche
    name: 'd-bank',
    seconds: 6.1,
    async setup(site) {
      const page = site.page;
      const y = Math.round((await top(page, '#mem-title')) - 116);
      await park(site, y, 900);
      const r = await boxOf(page, '#bank-months');
      // centre de la pastille (26 px) pour une valeur : le rail va de 3 à 12 mois
      const at = (v) => r.left + 13 + ((v - 3) / 9) * (r.width - 26);
      const cy = r.top + r.height / 2;
      return {
        y,
        enter: 0.5,
        pos: path([
          [0.5, 1300, 820], [1.3, at(6) + 1, cy + 1], [1.45, at(6), cy],
          // le glisser : du temps 2,5 au temps 5,5
          [B(EVENTS.bank.press) / FPS, at(6), cy], [B(EVENTS.bank.release) / FPS - 0.15, at(12) + 4, cy], [B(EVENTS.bank.release) / FPS, at(12) + 4, cy],
          [4.4, 1180, 700],
        ]),
        press: B(EVENTS.bank.press),
        release: B(EVENTS.bank.release),
      };
    },
    step: mouseStep,
    // le nombre de mois, image par image (la musique pose une note à chaque mois rempli)
    watch: (page) => page.evaluate(() => ({months: Number(document.querySelector('#bank-months').value)})),
  },
  {
    // 6. La visite : la page descend sur la carte ; le cadre du logo se pose sur le bâtiment du cabinet
    name: 'd-visit',
    seconds: 4.9,
    async setup(site) {
      const page = site.page;
      const map = await top(page, '.map');
      // la carte encore aux deux tiers sous l'écran : le cadre se posera pendant le plan, quand le cabinet passera à l'écran
      const y0 = Math.round(map - 900 + 200);
      const y1 = Math.round((await top(page, '#visit-title')) - 116);
      await park(site, y0, 900);
      if (await page.evaluate(() => document.querySelector('.map').classList.contains('is-drawn'))) throw new Error('le cadre de la carte est déjà posé');
      return {ys: glideTo({y0, y1, from: 6, v: 4, ramp: 30, frames: F(4.9)})};
    },
    async step(site, ctx, i) {
      await scrollTo(site.page, ctx.ys[i]);
    },
    watch: (page) => page.evaluate(() => ({drawn: document.querySelector('.map').classList.contains('is-drawn')})),
  },
];

const mobile = [
  {
    // l'ouverture au téléphone : le même cadre, la photo en hauteur
    name: 'm-open',
    seconds: 6.8,
    fresh: true,
    async setup(site) {
      await prime(site.page);
      await introStarted(site.page);
      return {y: 0, taps: []};
    },
    step: touchStep,
    watch: introState,
  },
  {
    // les soins au téléphone : le doigt ouvre « Facials and body » ; sa photo apparaît dans le cadre, la page descend
    name: 'm-svc',
    seconds: 7.3,
    async setup(site) {
      const page = site.page;
      const y0 = Math.round((await top(page, '#svc-title')) - 70);
      await park(site, y0, 900);
      const fam = await centerOf(page, '[data-fam="facials"] .fam__name', 90);
      return {ys: glide({y0, from: B(EVENTS.mobile.facials) + 50, v: 3, ramp: 40, to: B(EVENTS.mobile.facials) + 50 + 150, frames: F(7.3)}), taps: [[B(EVENTS.mobile.facials), fam]]};
    },
    step: touchStep,
    watch: (page) => page.evaluate(() => ({open: document.querySelector('[data-fam="facials"] .fam__btn').getAttribute('aria-expanded') === 'true'})),
  },
  {
    // la barre du téléphone : la page descend de l'accueil vers les soins ; « Book now / Call » monte une fois l'accueil passé
    name: 'm-dock',
    seconds: 7.3,
    async setup(site) {
      const y0 = 260;
      await park(site, y0, 900);
      return {ys: glide({y0, from: 24, v: 4, ramp: 40, frames: F(7.3)}), taps: []};
    },
    step: touchStep,
    watch: (page) => page.evaluate(() => ({dock: document.querySelector('[data-dock]').classList.contains('is-on')})),
  },
];

// --probe : rejoue les plans sans filmer, pour relever les repères (voir record() dans lib.mjs)
const probe = process.argv.includes('--probe');
const args = process.argv.slice(2).filter((a) => a !== '--probe');
const pick = (list, group) => list.filter((s) => !args.length || args.includes(s.name) || args.includes(group));

for (const [list, cfg, group] of [[desktop, DESK, 'desktop'], [mobile, MOBILE, 'mobile']]) {
  for (const shot of pick(list, group)) {
    // hors ouverture, la page est ouverte sur #top : le site s'affiche directement dans son état final
    const site = await openSite({...cfg, query: shot.fresh ? '' : '#top'});
    site.page.on('pageerror', (e) => console.log(`  ${shot.name} : ${e.message}`));
    if (!shot.fresh) {
      await prime(site.page);
      await settle(site.page, 300);
    }
    const ctx = await shot.setup(site);
    await record(site, {name: shot.name, fps: FPS, seconds: shot.seconds, step: (i, t) => shot.step(site, ctx, i, t), watch: shot.watch, probe});
    await site.browser.close();
  }
}
