// Plans filmés du nouveau site Idoine pour la vidéo de présentation 16:9.
// Usage : node capture/shots.mjs [desktop|mobile|nom-du-plan …]
import {openSite, record, scrollTo, settle, track, top, center, easeInOut, sine} from './lib.mjs';

const FPS = 60;
const DESK = {width: 1440, height: 900, dsf: 2};
const MOBILE = {width: 390, height: 844, dsf: 2, mobile: true};

/** Trajectoire de souris : clés [[t, x, y], …] reliées par une spline de Catmull-Rom */
const path = (keys) => (t) => {
  if (t <= keys[0][0]) return {x: keys[0][1], y: keys[0][2]};
  const last = keys[keys.length - 1];
  if (t >= last[0]) return {x: last[1], y: last[2]};
  let i = 1;
  while (t > keys[i][0]) i++;
  const p0 = keys[Math.max(0, i - 2)];
  const p1 = keys[i - 1];
  const p2 = keys[i];
  const p3 = keys[Math.min(keys.length - 1, i + 1)];
  const u = sine((t - p1[0]) / (p2[0] - p1[0])) * 0.35 + ((t - p1[0]) / (p2[0] - p1[0])) * 0.65;
  const cr = (a, b, c, d) => 0.5 * (2 * b + (-a + c) * u + (2 * a - 5 * b + 4 * c - d) * u * u + (-a + 3 * b - 3 * c + d) * u * u * u);
  return {x: cr(p0[1], p1[1], p2[1], p3[1]), y: cr(p0[2], p1[2], p2[2], p3[2])};
};

const wlOf = (page) => page.evaluate(() => parseFloat(getComputedStyle(document.querySelector('[data-hero]')).getPropertyValue('--wl')));

/** Clics programmés : liste de [t, sélecteur] ; la souris va vers chaque cible puis clique */
const clickTour = async (site, targets, startXY) => {
  const pts = [];
  const clicks = [];
  let prev = startXY;
  for (const [t, sel] of targets) {
    const c = await center(site.page, sel);
    pts.push([t - 0.75, prev.x, prev.y]);
    pts.push([t, c.x, c.y]);
    clicks.push(Math.round(t * FPS));
    prev = c;
  }
  const keys = [];
  pts.forEach((p) => { if (!keys.length || p[0] > keys[keys.length - 1][0] + 0.01) keys.push(p); });
  return {mouse: path(keys), clicks};
};

const desktop = [
  {
    // 1. La ligne d'eau : le titre se pose, l'eau monte, la souris effleure la surface
    name: 'd-hero',
    seconds: 9,
    async setup(site) {
      return {};
    },
    async step(site, ctx, i, t) {
      const s = t / 1000;
      if (s < 3.4) return null;
      if (!ctx.mouse) {
        const wl = await wlOf(site.page);
        ctx.mouse = path([[3.4, 980, wl - 210], [4.2, 860, wl - 40], [5.4, 520, wl - 18], [6.4, 300, wl - 30], [7.4, 640, wl - 60], [9, 700, wl - 70]]);
        ctx.click = Math.round(7.6 * FPS);
      }
      const m = ctx.mouse(s);
      await site.page.mouse.move(m.x, m.y);
      const click = i === ctx.click;
      if (click) { await site.page.mouse.down(); await site.page.mouse.up(); }
      return {mouse: m, click};
    },
  },
  {
    // 2. Paris, en coupe : on descend d'arrêt en arrêt, en laissant le temps de lire
    name: 'd-coupe',
    seconds: 19,
    async setup(site) {
      const stops = await site.page.evaluate(() => [...document.querySelectorAll('[data-stop]')].map((el) => el.getBoundingClientRect().top + window.scrollY));
      const y0 = stops[0] - 40;
      await scrollTo(site.page, y0);
      await settle(site.page, 1500);
      // chaque arrêt : 1,1 s de défilement puis 2,4 s de lecture
      const keys = [[0, y0], [1.6, y0]];
      let t = 1.6;
      for (let k = 1; k < stops.length; k++) {
        t += 1.1;
        keys.push([t, stops[k] + 60, easeInOut]);
        t += k === stops.length - 1 ? 1.6 : 2.4;
        keys.push([t, stops[k] + 60]);
      }
      return {y: track(keys), end: t};
    },
    async step(site, ctx, i, t) {
      await scrollTo(site.page, Math.round(ctx.y(t / 1000)));
    },
  },
  {
    // 3. Le bord de l'eau, puis le fond mobile qui monte tout seul
    name: 'd-bassins',
    seconds: 13,
    async setup(site) {
      const b = await top(site.page, '#bassins');
      const f = await top(site.page, '[data-floor]');
      await scrollTo(site.page, b - 300);
      await settle(site.page, 800);
      return {y: track([[0, b - 300], [1.4, b - 30, easeInOut], [4.6, b + 20], [6.0, f - 260, easeInOut], [13, f - 250]])};
    },
    async step(site, ctx, i, t) {
      await scrollTo(site.page, Math.round(ctx.y(t / 1000)));
    },
  },
  {
    // 4. Les références : la souris passe sur quelques noms
    name: 'd-refs',
    seconds: 8,
    async setup(site) {
      const r = await top(site.page, '#references');
      await scrollTo(site.page, r - 40);
      await settle(site.page, 1000);
      const names = await site.page.evaluate(() => [...document.querySelectorAll('[data-refs] li')].map((li) => {
        const b = li.getBoundingClientRect();
        return {x: b.left + b.width / 2, y: b.top + b.height / 2};
      }));
      const pick = [0, 2, 4, 5, 1].map((k) => names[k]);
      return {mouse: path([[0.8, 1300, 780], [2.0, pick[0].x, pick[0].y], [3.2, pick[1].x, pick[1].y], [4.4, pick[2].x, pick[2].y], [5.6, pick[3].x, pick[3].y], [6.8, pick[4].x, pick[4].y], [8, pick[4].x + 20, pick[4].y + 4]])};
    },
    async step(site, ctx, i, t) {
      const s = t / 1000;
      if (s < 0.8) return null;
      const m = ctx.mouse(s);
      await site.page.mouse.move(m.x, m.y);
      return {mouse: m};
    },
  },
  {
    // 5. Le métier : bien-être, bureau d'étude, depuis 1966 (défilement lent)
    name: 'd-metier',
    seconds: 14,
    async setup(site) {
      const a = await top(site.page, '#bien-etre');
      const e = await top(site.page, '#etude');
      const s = await top(site.page, '.since');
      await scrollTo(site.page, a - 120);
      await settle(site.page, 800);
      return {y: track([[0, a - 120], [1.2, a, easeInOut], [3.6, a + 120], [5.4, e - 60, easeInOut], [8.6, e + 40], [10.4, s - 120, easeInOut], [14, s - 90]])};
    },
    async step(site, ctx, i, t) {
      await scrollTo(site.page, Math.round(ctx.y(t / 1000)));
    },
  },
  {
    // 6. Le projet : trois questions, l'e-mail se prépare
    name: 'd-contact',
    seconds: 9,
    async setup(site) {
      const c = await top(site.page, '#contact');
      await scrollTo(site.page, c - 10);
      await settle(site.page, 1000);
      return clickTour(site, [
        [1.6, 'input[value="sur un toit"] + span'],
        [3.0, 'input[value="une piscine"] + span'],
        [4.2, 'input[value="un spa"] + span'],
        [5.6, 'input[value="Paris"] + span'],
        [7.4, '.brief .btn'],
      ], {x: 1300, y: 820});
    },
    async step(site, ctx, i, t) {
      const s = t / 1000;
      if (s < 0.7) return null;
      const m = ctx.mouse(s);
      await site.page.mouse.move(m.x, m.y);
      // le dernier clic (« Préparer l'e-mail ») est seulement survolé : il ouvrirait la messagerie
      const click = ctx.clicks.slice(0, -1).includes(i);
      if (click) { await site.page.mouse.down(); await site.page.mouse.up(); }
      return {mouse: m, click};
    },
  },
];

const mobile = [
  {name: 'm-hero', seconds: 7, async setup() { return {}; }, async step() { return null; }},
  {
    name: 'm-coupe',
    seconds: 10,
    async setup(site) {
      const stops = await site.page.evaluate(() => [...document.querySelectorAll('[data-stop]')].map((el) => el.getBoundingClientRect().top + window.scrollY));
      await scrollTo(site.page, stops[0] - 30);
      await settle(site.page, 1200);
      const keys = [[0, stops[0] - 30], [0.8, stops[0] - 30]];
      let t = 0.8;
      for (let k = 1; k <= 4; k++) {
        t += 0.9;
        keys.push([t, stops[k] - 120, easeInOut]);
        t += 1.3;
        keys.push([t, stops[k] - 120]);
      }
      return {y: track(keys)};
    },
    async step(site, ctx, i, t) {
      await scrollTo(site.page, Math.round(ctx.y(t / 1000)));
    },
  },
  {
    name: 'm-contact',
    seconds: 7,
    async setup(site) {
      const q = await top(site.page, '.brief');
      await scrollTo(site.page, q - 90);
      await settle(site.page, 900);
      const taps = [];
      for (const [t, sel] of [[1.4, 'input[value="en sous-sol"] + span'], [2.8, 'input[value="une piscine"] + span'], [4.2, 'input[value="un hammam"] + span'], [5.6, 'input[value="Île-de-France"] + span']]) {
        taps.push({i: Math.round(t * FPS), ...(await center(site.page, sel))});
      }
      return {taps};
    },
    async step(site, ctx, i) {
      const tap = ctx.taps.find((x) => x.i === i);
      if (tap) await site.page.touchscreen.tap(tap.x, tap.y);
      return tap ? {mouse: {x: tap.x, y: tap.y}, click: true} : null;
    },
  },
];

const args = process.argv.slice(2);
const pick = (list, group) => list.filter((s) => !args.length || args.includes(s.name) || args.includes(group));

for (const [list, cfg, group] of [[desktop, DESK, 'desktop'], [mobile, MOBILE, 'mobile']]) {
  for (const shot of pick(list, group)) {
    const site = await openSite(cfg);
    site.page.on('pageerror', (e) => console.log(`  ${shot.name} : ${e.message}`));
    const ctx = await shot.setup(site);
    await record(site, {name: shot.name, fps: FPS, seconds: shot.seconds, step: (i, t) => shot.step(site, ctx, i, t)});
    await site.browser.close();
  }
}
