// Plans filmés du nouveau site d'Heritage Pools Texas pour la vidéo de présentation 16:9 (image par image, temps simulé).
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
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
/** Le début et la fin de l'écran épinglé de l'ouverture (ScrollTrigger) */
const pinRange = (page) => page.evaluate(() => {
  const s = window.ScrollTrigger.getAll().find((t) => t.pin);
  return {start: s.start, end: s.end};
});
/** Un premier geste (une touche) : le site charge les photos du chantier et pose les animations du bas ; on lui laisse le temps réel de charger */
const kick = async (page) => {
  await page.evaluate(() => window.dispatchEvent(new KeyboardEvent('keydown', {key: 'Shift'})));
  await settle(page, 100);
  await wait(1500);
};
const centerOf = (page, sel, text) =>
  page.evaluate(([sel, text]) => {
    const all = [...document.querySelectorAll(sel)].filter((e) => !text || (e.textContent || '').includes(text));
    const el = all.find((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; }) || all[0];
    if (!el) throw new Error('cible introuvable : ' + sel + ' ' + (text || ''));
    const r = el.getBoundingClientRect();
    return {x: r.left + r.width / 2, y: r.top + r.height / 2};
  }, [sel, text || '']);

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

const desktop = [
  {
    // 1. L'ouverture en entier : le titre monte, puis le chantier se déroule au défilement, du gazon aux lumières
    name: 'd-open',
    seconds: 13.4,
    fresh: true,
    async setup(site) {
      await kick(site.page);
      const pin = await pinRange(site.page);
      return {y: track([[0, 0], [1.8, 0], [12.4, pin.end, cruise(0.06, 0.1)], [13.4, pin.end]])};
    },
    step: scrolled,
  },
  {
    // 2. La règle des jours : la souris prend le repère au jour 41 et le ramène au jour 9 (la page remonte le chantier),
    // puis clique sur le jour 30 : l'eau
    name: 'd-ruler',
    seconds: 6.6,
    async setup(site) {
      const pin = await pinRange(site.page);
      await park(site, pin.end, 1400);
      const tr = await site.page.evaluate(() => { const r = document.querySelector('[data-track]').getBoundingClientRect(); return {x: r.left, w: r.width, y: r.top + r.height / 2}; });
      const X = (d) => tr.x + (tr.w * d) / 41;
      return {
        pos: path([[0, 1180, 560], [0.5, 1180, 560], [1.3, X(41), tr.y, easeInOut], [1.45, X(41), tr.y], [3.7, X(9), tr.y, easeInOut], [3.9, X(9), tr.y], [4.7, X(30), tr.y, easeInOut], [6.6, X(30) + 4, tr.y - 2]]),
        down: Math.round(1.45 * FPS),
        up: Math.round(3.8 * FPS),
        click: Math.round(4.8 * FPS),
      };
    },
    async step(site, ctx, i, t) {
      const p = ctx.pos(t / 1000);
      await site.page.mouse.move(p.x, p.y);
      let click = false;
      if (i === ctx.down) { await site.page.mouse.down(); click = true; }
      if (i === ctx.up) await site.page.mouse.up();
      if (i === ctx.click) { await site.page.mouse.down(); await site.page.mouse.up(); click = true; }
      return {mouse: p, click};
    },
  },
  {
    // 3. Les services : la nuit de la fin de l'ouverture s'en va, les grands noms arrivent en glissant
    name: 'd-services',
    seconds: 6,
    async setup(site) {
      const s0 = await top(site.page, '#services');
      const last = await top(site.page, '.svc li:last-child');
      await park(site, s0 - 640, 900);
      return {y: track([[0, s0 - 640], [5.5, last - 330, cruise(0.12, 0.2)], [6, last - 320]])};
    },
    step: scrolled,
  },
  {
    // 4. La galerie : les photos se découvrent, l'année tourne de 2018 à 2019 puis 2020
    name: 'd-pools',
    seconds: 6.6,
    async setup(site) {
      const p0 = await top(site.page, '#pools');
      const y20 = await top(site.page, '.year[data-gy="2020"]');
      await park(site, p0 - 260, 900);
      return {y: track([[0, p0 - 260], [6.2, y20 - 210, cruise(0.12, 0.18)], [6.6, y20 - 200]])};
    },
    step: scrolled,
  },
  {
    // 5. La nuit : la grande photo s'allume à mesure qu'on arrive, puis la souris choisit le rouge
    name: 'd-night',
    seconds: 5.8,
    async setup(site) {
      const n0 = await top(site.page, '#night');
      const lt = await top(site.page, '.lights');
      await park(site, n0 - 520, 900);
      const end = lt - 150;
      const red = {x: 0, y: 0};
      return {y: track([[0, n0 - 520], [2.7, end, cruise(0.12, 0.3)], [5.8, end + 6]]), end, red};
    },
    async step(site, ctx, i, t) {
      const s = t / 1000;
      await scrollTo(site.page, Math.round(ctx.y(s)));
      // le bouton rouge, relevé une fois la page posée
      if (s >= 2.75 && !ctx.red.x) Object.assign(ctx.red, await centerOf(site.page, '[data-light="red"]'));
      if (s < 2.8) return null;
      const p = path([[2.8, 1300, 820], [3.9, ctx.red.x, ctx.red.y, easeInOut], [5.8, ctx.red.x + 120, ctx.red.y + 90]])(s);
      await site.page.mouse.move(p.x, p.y);
      const click = i === Math.round(4.0 * FPS);
      if (click) {
        await site.page.mouse.down();
        await site.page.mouse.up();
        await site.page.evaluate(() => document.activeElement && document.activeElement.blur());
      }
      return {mouse: p, click};
    },
  },
  {
    // 6. Le mot des fondateurs : « Trust, integrity and honesty… » s'allume mot à mot
    name: 'd-values',
    seconds: 4.8,
    async setup(site) {
      const t0 = await top(site.page, '#team');
      const v = await site.page.evaluate(() => { const r = document.querySelector('.team__values').getBoundingClientRect(); return r.bottom + scrollY; });
      await park(site, t0 - 120, 900);
      return {y: track([[0, t0 - 120], [4.4, v - 900 * 0.45 + 40, cruise(0.15, 0.25)], [4.8, v - 900 * 0.45 + 46]])};
    },
    step: scrolled,
  },
  {
    // 7. Le contact (« Open now », le numéro, le formulaire), puis le pied de page et son grand « Heritage »
    name: 'd-contact',
    seconds: 6.4,
    async setup(site) {
      const c0 = await top(site.page, '#contact');
      const end = await site.page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
      await park(site, c0 - 420, 900);
      return {y: track([[0, c0 - 420], [1.5, c0 - 16, cruise(0.15, 0.3)], [3.1, c0 - 8], [6.0, end, cruise(0.12, 0.25)], [6.4, end]])};
    },
    step: scrolled,
  },
];

const mobile = [
  {
    // l'ouverture sur téléphone : le titre, puis le chantier au défilement du pouce
    name: 'm-open',
    seconds: 8,
    fresh: true,
    async setup(site) {
      await kick(site.page);
      const pin = await pinRange(site.page);
      return {y: track([[0, 0], [1.4, 0], [7.4, pin.end, cruise(0.08, 0.12)], [8, pin.end]])};
    },
    step: scrolled,
  },
  {
    // les services, empilés, qui glissent
    name: 'm-services',
    seconds: 6,
    async setup(site) {
      const s0 = await top(site.page, '#services');
      const last = await top(site.page, '.svc li:last-child');
      await park(site, s0 - 120, 900);
      return {y: track([[0, s0 - 120], [5.6, last - 330, cruise(0.1, 0.2)], [6, last - 324]])};
    },
    step: scrolled,
  },
  {
    // le menu : il s'ouvre en plein écran sur le bleu roi
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
    if (!shot.fresh) {
      await kick(site.page);
      await settle(site.page, 3000);
    }
    const ctx = await shot.setup(site);
    await record(site, {name: shot.name, fps: FPS, seconds: shot.seconds, step: (i, t) => shot.step(site, ctx, i, t), watch: shot.watch, probe});
    await site.browser.close();
  }
}
