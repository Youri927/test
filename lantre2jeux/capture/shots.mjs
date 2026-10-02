// Plans filmés du site pour la vidéo de présentation 16:9.
// Usage : node capture/shots.mjs [desktop|mobile|nom-du-plan …]
import {openSite, record, scrollTo, settle, track, easeInOut, easeOut, sine} from './lib.mjs';

const FPS = 60;
const DESK = {width: 1440, height: 900, dsf: 2};
const MOBILE = {width: 390, height: 844, dsf: 2, mobile: true};

/** Spline de Catmull-Rom sur des clés [[t, x, y], …] : trajectoire de souris continue */
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
  let u = (t - p1[0]) / (p2[0] - p1[0]);
  if (i === 1) u = easeOut(u) * 0.5 + u * 0.5;
  if (i === keys.length - 1) u = 1 - (easeOut(1 - u) * 0.5 + (1 - u) * 0.5);
  const cr = (a, b, c, d) => 0.5 * (2 * b + (-a + c) * u + (2 * a - 5 * b + 4 * c - d) * u * u + (-a + 3 * b - 3 * c + d) * u * u * u);
  return {x: cr(p0[1], p1[1], p2[1], p3[1]), y: cr(p0[2], p1[2], p2[2], p3[2])};
};

const center = (page, sel) =>
  page.evaluate((sel) => {
    const r = document.querySelector(sel).getBoundingClientRect();
    return {x: r.left + r.width / 2, y: r.top + r.height / 2};
  }, sel);

const pinOf = (page, id) =>
  page.evaluate((id) => {
    const st = window.ScrollTrigger.getAll().find((s) => s.pin && s.trigger && s.trigger.id === id);
    return {start: st.start, end: st.end};
  }, id);

const top = (page, sel) => page.evaluate((sel) => document.querySelector(sel).getBoundingClientRect().top + window.scrollY, sel);

/** Plan « défilement » : position de départ, puis clés de défilement [[t, y, easing?], …] */
const scrollShot = (name, seconds, from, keys, extra = () => null) => ({
  name,
  seconds,
  async setup(site) {
    const k = await keys(site);
    const y0 = await from(site);
    await scrollTo(site.page, y0);
    await settle(site.page, 1200);
    return {y: track(k)};
  },
  async step(site, ctx, i, t) {
    await scrollTo(site.page, Math.round(ctx.y(t / 1000)));
    return extra(site, ctx, i, t);
  },
});

const desktop = [
  {
    // 1. La torche : allumage, balayage du titre, puis la souris éclaire les indices
    name: 'd-hero',
    seconds: 8.4,
    async setup() {
      return {
        mouse: path([
          [3.3, 1170, 250], [4.1, 1232, 182], [4.9, 1262, 392], [5.7, 950, 522],
          [6.5, 845, 628], [7.3, 1072, 700], [8.4, 1086, 706],
        ]),
      };
    },
    async step(site, ctx, i, t) {
      if (t < 3300) return null;
      const m = ctx.mouse(t / 1000);
      await site.page.mouse.move(m.x, m.y);
      return {mouse: m};
    },
  },
  // 2. L'affiche : les lignes se balaient de lumière, le cadran des époques tourne
  {
    ...scrollShot('d-teaser', 8.4, async () => 0, async () => [[0.4, 0], [3.4, 1010, easeInOut]]),
    async setup(site) {
      await settle(site.page, 3200);
      return {y: track([[0.4, 0], [3.4, 1010, easeInOut]])};
    },
  },
  // 3. Les trois portes
  ...[['d-r66', 'route-66'], ['d-corleone', 'corleone'], ['d-alerte', 'alerte-rouge']].map(([name, id]) => ({
    name,
    seconds: 4.4,
    async setup(site) {
      const {start, end} = await pinOf(site.page, id);
      const span = end - start;
      await scrollTo(site.page, start - 260);
      await settle(site.page, 1200);
      return {y: track([[0.3, start - 260], [2.5, start + 0.62 * span, easeInOut], [4.4, start + 0.8 * span, sine]])};
    },
    async step(site, ctx, i, t) {
      await scrollTo(site.page, Math.round(ctx.y(t / 1000)));
    },
  })),
  // 4. Le verdict : la note roule, les barres se remplissent
  scrollShot('d-verdict', 4.0, async () => 7300, async (site) => {
    const v = await top(site.page, '.verdict');
    return [[0.2, 7300], [2.4, v - 60, easeInOut]];
  }),
  // 5. Le cadenas : deux clics sur « + », le prix descend
  {
    name: 'd-pricing',
    seconds: 5.2,
    async setup(site) {
      const p = await top(site.page, '#tarifs');
      await scrollTo(site.page, p - 340);
      await settle(site.page, 800);
      await scrollTo(site.page, p - 40);
      const plus = await center(site.page, '[data-step="1"]');
      await scrollTo(site.page, p - 340);
      await settle(site.page, 400);
      return {
        y: track([[0, p - 340], [1.2, p - 40, easeOut]]),
        plus,
        mouse: path([[0.9, 1260, 660], [1.8, plus.x + 2, plus.y + 3], [3.2, plus.x, plus.y + 1], [4.4, plus.x + 150, plus.y + 70], [5.2, plus.x + 160, plus.y + 74]]),
      };
    },
    async step(site, ctx, i, t) {
      const s = t / 1000;
      await scrollTo(site.page, Math.round(ctx.y(s)));
      if (s < 0.9) return null;
      const m = ctx.mouse(s);
      await site.page.mouse.move(m.x, m.y);
      const click = (i === Math.round(2.0 * FPS) || i === Math.round(3.0 * FPS));
      if (click) {
        await site.page.mouse.down();
        await site.page.mouse.up();
      }
      return {mouse: m, click};
    },
  },
  // 6. La sortie : la dernière porte s'ouvre sur la lumière
  {
    name: 'd-exit',
    seconds: 4.6,
    async setup(site) {
      const {start, end} = await pinOf(site.page, 'reserver');
      await scrollTo(site.page, start - 300);
      await settle(site.page, 1200);
      return {y: track([[0.3, start - 300], [3.0, start + 0.78 * (end - start), easeInOut]])};
    },
    async step(site, ctx, i, t) {
      await scrollTo(site.page, Math.round(ctx.y(t / 1000)));
    },
  },
];

const mobile = [
  // La torche erre seule sur mobile
  {name: 'm-hero', seconds: 6.0, async setup() { return {}; }, async step() { return null; }},
  // Une porte s'ouvre au fil du doigt
  ...[['m-r66', '.art-r66'], ['m-alerte', '.art-alerte']].map(([name, sel]) =>
    scrollShot(name, 5.0, async (site) => (await top(site.page, sel)) - 945, async (site) => {
      const a = await top(site.page, sel);
      return [[0.3, a - 945], [3.6, a - 125, easeInOut]];
    })),
  // Les tarifs au doigt
  {
    name: 'm-pricing',
    seconds: 5.0,
    async setup(site) {
      const p = await top(site.page, '#tarifs');
      await scrollTo(site.page, p - 40);
      const plus = await center(site.page, '[data-step="1"]');
      await scrollTo(site.page, p - 240);
      await settle(site.page, 800);
      return {y: track([[0, p - 240], [1.0, p - 40, easeOut]]), plus};
    },
    async step(site, ctx, i, t) {
      await scrollTo(site.page, Math.round(ctx.y(t / 1000)));
      const tap = i === Math.round(1.7 * FPS) || i === Math.round(2.8 * FPS);
      if (tap) await site.page.touchscreen.tap(ctx.plus.x, ctx.plus.y);
      return tap ? {mouse: ctx.plus, click: true} : null;
    },
  },
  scrollShot('m-exit', 4.4, async (site) => (await top(site.page, '[data-exit-stage]')) - 760, async (site) => {
    const s = await top(site.page, '[data-exit-stage]');
    return [[0.3, s - 760], [3.2, s - 60, easeInOut]];
  }),
];

const args = process.argv.slice(2);
const pick = (list) => list.filter((s) => !args.length || args.includes(s.name) || args.includes(list === desktop ? 'desktop' : 'mobile'));

for (const [list, cfg] of [[desktop, DESK], [mobile, MOBILE]]) {
  for (const shot of pick(list)) {
    const site = await openSite(cfg);
    const ctx = await shot.setup(site);
    await record(site, {name: shot.name, fps: FPS, seconds: shot.seconds, step: (i, t) => shot.step(site, ctx, i, t)});
    await site.browser.close();
  }
}
