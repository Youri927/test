// Plans filmés du nouveau site de D's Pool Care (We Clean Pools) pour la vidéo de présentation 16:9 (image par image,
// temps simulé). Usage : node capture/shots.mjs [desktop|mobile|nom-du-plan …] [--probe]
//
// Contre les saccades : Chrome arrondit le défilement au pixel entier. Chaque plan défile donc par pas entiers qui ne
// changent que progressivement (1, 1, 2, 2, 3… puis constants), et la vidéo lit toujours les plans à vitesse 1 :
// aucune image sautée ni doublée.
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

/** Un clic : la souris appuie et relâche à l'image i */
const click = async (page) => {
  await page.mouse.down();
  await page.mouse.up();
  await page.evaluate(() => document.activeElement && document.activeElement.blur());
};

/** Doigt posé / levé (vrais événements tactiles, comme un pouce qui appuie et maintient) */
const touch = (site, type, p) => site.cdp.send('Input.dispatchTouchEvent', {type, touchPoints: type === 'touchEnd' ? [] : [{x: p.x, y: p.y}]});

const desktop = [
  {
    // 1. L'ouverture : l'eau verte et la question ; on fait défiler, l'eau devient laiteuse puis limpide, les lettres du
    // fond passent du flou au net et la lumière du soleil danse. La scène est épinglée : le défilement ne déplace rien,
    // il fait seulement avancer l'eau.
    name: 'd-open',
    seconds: 8.2,
    fresh: true,
    async setup(site) {
      await prime(site.page);
      await settle(site.page, 600);
      return {ys: glide({y0: 0, from: F(1.2), v: 5, ramp: 48, to: F(5.6), frames: F(8.2)})};
    },
    async step(site, ctx, i) {
      await scrollTo(site.page, ctx.ys[i]);
    },
    watch: (page) => page.evaluate(() => ({clear: document.querySelector('[data-pool]').classList.contains('is-clear')})),
  },
  {
    // 2. L'entretien : « What is your time worth? » reste en place (colonne collée) ; la liste défile, chaque coche se
    // trace quand on arrive à sa ligne, et le trait de la tournée se remplit
    name: 'd-weekly',
    seconds: 6.4,
    async setup(site) {
      const sec = await top(site.page, '#weekly');
      const y0 = Math.round(sec + 60);
      await park(site, y0, 700);
      return {ys: glide({y0, from: F(0.4), v: 2, ramp: 30, frames: F(6.4)})};
    },
    async step(site, ctx, i) {
      await scrollTo(site.page, ctx.ys[i]);
    },
  },
  {
    // 3. La liste des prix : la souris ouvre « Drain, clean and acid wash » (clic à 1,8 s), la ligne s'ouvre sur ce qui est
    // fait et sur la vraie paire avant/après ; la page descend doucement pour la montrer entière
    name: 'd-prices',
    seconds: 6.2,
    async setup(site) {
      const list = await rect(site.page, '.fixes__list');
      const y0 = Math.round(list.top - 300);
      await park(site, y0, 700);
      const row = await centerOf(site.page, '[aria-controls="fix-drain"] .fix__name');
      return {
        ys: glide({y0, from: F(2.6), v: 2, ramp: 30, frames: F(6.2)}),
        pos: path([[0, 1180, 820], [0.5, 1180, 820], [1.6, row.x + 60, row.y + 4], [2.4, row.x + 66, row.y + 8], [3.4, 1290, 860]]),
        down: F(1.8),
      };
    },
    async step(site, ctx, i, t) {
      const s = t / 1000;
      await scrollTo(site.page, ctx.ys[i]);
      const p = ctx.pos(s);
      await site.page.mouse.move(p.x, p.y);
      const on = i === ctx.down;
      if (on) await click(site.page);
      return {mouse: p, click: on};
    },
  },
  {
    // 4. Les rénovations : la souris choisit le chantier 8 (clic à 1,8 s), puis appuie sur la photo et la maintient
    // (3 s à 4,8 s) : l'avant apparaît, la piscine telle qu'ils l'ont trouvée ; elle lâche, l'après revient
    name: 'd-remodels',
    seconds: 7.4,
    async setup(site) {
      const stage = await rect(site.page, '[data-stage]');
      const y = Math.round(stage.top - 104);
      // la démonstration du site (l'avant montré une fois à l'arrivée) se joue pendant la mise en place
      await park(site, y, 2600);
      const pick = await centerOf(site.page, '.viewer__pick:nth-child(8)');
      const ph = await centerOf(site.page, '[data-stage]');
      return {
        y,
        pos: path([[0, 1300, 860], [0.5, 1300, 860], [1.6, pick.x, pick.y], [2.0, pick.x + 2, pick.y + 2], [2.85, ph.x + 40, ph.y + 30], [4.8, ph.x + 44, ph.y + 32], [5.9, ph.x + 300, ph.y + 250]]),
        click: F(1.8),
        down: F(3.0),
        up: F(4.8),
      };
    },
    async step(site, ctx, i, t) {
      const s = t / 1000;
      await scrollTo(site.page, ctx.y);
      const p = ctx.pos(s);
      await site.page.mouse.move(p.x, p.y);
      let on = false;
      if (i === ctx.click) { await click(site.page); on = true; }
      if (i === ctx.down) { await site.page.mouse.down(); on = true; }
      if (i === ctx.up) await site.page.mouse.up();
      return {mouse: p, click: on, mark: i === ctx.down ? 'hold' : i === ctx.up ? 'release' : undefined};
    },
    watch: (page) => page.evaluate(() => ({before: document.querySelector('[data-viewer]').classList.contains('is-before')})),
  },
  {
    // 5. Dallas, sur le grand bain : sa photo reste en place (colonne collée), sa lettre et ses titres défilent,
    // jusqu'à la licence qu'on vérifie sur le site de l'État
    name: 'd-dallas',
    seconds: 5.4,
    async setup(site) {
      const sec = await top(site.page, '#dallas');
      const y0 = Math.round(sec + 40);
      await park(site, y0, 700);
      return {ys: glide({y0, from: F(0.3), v: 2, ramp: 30, frames: F(5.4)})};
    },
    async step(site, ctx, i) {
      await scrollTo(site.page, ctx.ys[i]);
    },
  },
  {
    // 6. Le devis, sur une eau limpide : « Open now, until 5 PM Central Time » ; la souris choisit « A remodel »
    // (clic à 1,8 s), puis le champ du nom (clic à 3 s)
    name: 'd-estimate',
    seconds: 5.4,
    async setup(site) {
      const sec = await top(site.page, '#estimate');
      const y = Math.round(sec + 70);
      await park(site, y, 700);
      const chip = await centerOf(site.page, '.form__need input[value="A remodel"] + span');
      const name = await centerOf(site.page, '.form input[name="name"]');
      return {
        y,
        pos: path([[0, 1240, 860], [0.4, 1240, 860], [1.6, chip.x, chip.y], [2.0, chip.x + 2, chip.y + 1], [2.8, name.x - 60, name.y + 4], [3.2, name.x - 58, name.y + 5], [4.4, name.x + 120, name.y + 140]]),
        clicks: [F(1.8), F(3.0)],
      };
    },
    async step(site, ctx, i, t) {
      const s = t / 1000;
      await scrollTo(site.page, ctx.y);
      const p = ctx.pos(s);
      await site.page.mouse.move(p.x, p.y);
      const on = ctx.clicks.includes(i);
      if (on) {
        await site.page.mouse.down();
        await site.page.mouse.up();
      }
      return {mouse: p, click: on};
    },
  },
];

const mobile = [
  {
    // l'ouverture au téléphone : l'eau verte, la question ; le pouce fait défiler, l'eau s'éclaircit sur « WE / CLEAN / POOLS. »
    name: 'm-open',
    seconds: 6.4,
    fresh: true,
    async setup(site) {
      await prime(site.page);
      await settle(site.page, 600);
      return {ys: glide({y0: 0, from: F(0.9), v: 5, ramp: 40, to: F(4.5), frames: F(6.4)})};
    },
    async step(site, ctx, i) {
      await scrollTo(site.page, ctx.ys[i]);
    },
  },
  {
    // la liste des prix au téléphone : le pouce ouvre la vidange (toucher à 1,8 s), la page descend sur les photos
    name: 'm-prices',
    seconds: 6.4,
    async setup(site) {
      const list = await rect(site.page, '.fixes__list');
      const y0 = Math.round(list.top - 150);
      await park(site, y0, 700);
      const row = await centerOf(site.page, '[aria-controls="fix-drain"] .fix__name');
      return {ys: glide({y0, from: F(2.5), v: 2, ramp: 30, frames: F(6.4)}), row, tap: F(1.8)};
    },
    async step(site, ctx, i) {
      await scrollTo(site.page, ctx.ys[i]);
      if (i !== ctx.tap) return null;
      await site.page.touchscreen.tap(ctx.row.x, ctx.row.y);
      return {mouse: ctx.row, click: true};
    },
  },
  {
    // les rénovations au téléphone : le pouce choisit le chantier 8 (1,2 s), puis appuie sur la photo et la maintient
    // (2,4 s à 4,2 s) : l'avant apparaît
    name: 'm-viewer',
    seconds: 6.4,
    async setup(site) {
      const stage = await rect(site.page, '[data-stage]');
      const y = Math.round(stage.top - 76);
      await park(site, y, 2600);
      const pick = await centerOf(site.page, '.viewer__pick:nth-child(8)');
      const ph = await centerOf(site.page, '[data-stage]');
      return {y, pick, ph, tap: F(1.2), down: F(2.4), up: F(4.2)};
    },
    async step(site, ctx, i) {
      await scrollTo(site.page, ctx.y);
      if (i === ctx.tap) {
        await site.page.touchscreen.tap(ctx.pick.x, ctx.pick.y);
        return {mouse: ctx.pick, click: true};
      }
      if (i === ctx.down) {
        await touch(site, 'touchStart', ctx.ph);
        return {mouse: ctx.ph, mark: 'hold'};
      }
      if (i > ctx.down && i < ctx.up) return {mouse: ctx.ph};
      if (i === ctx.up) {
        await touch(site, 'touchEnd', ctx.ph);
        return {mouse: ctx.ph, mark: 'release'};
      }
      return null;
    },
    watch: (page) => page.evaluate(() => ({before: document.querySelector('[data-viewer]').classList.contains('is-before')})),
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
